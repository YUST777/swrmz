"""Security tools the SWRMZ Band agents call. Real static analysis, no mock data.

These are exposed to the agents as LangChain tools so the LLM agents decide when
to use them — semgrep/secret-scan are *helpers*, the agents do the reasoning.
"""
from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
from pathlib import Path

from langchain_core.tools import tool

IGNORE_DIRS = {
    "node_modules", ".git", "dist", "build", "out", ".next", ".cache",
    "coverage", "vendor", ".venv", "venv", "__pycache__", ".swrmz",
}
TEXT_EXT = {
    ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".py", ".rb", ".go", ".php",
    ".java", ".cs", ".rs", ".c", ".cpp", ".h", ".json", ".yml", ".yaml",
    ".env", ".sh", ".sql", ".html", ".vue", ".svelte", ".tf",
}

SECRET_RULES = [
    ("AWS access key", re.compile(r"AKIA[0-9A-Z]{16}"), "critical"),
    ("Stripe live key", re.compile(r"sk_live_[0-9a-zA-Z]{20,}"), "critical"),
    ("Private key", re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----"), "critical"),
    ("GitHub token", re.compile(r"ghp_[0-9a-zA-Z]{36}"), "high"),
    ("Google API key", re.compile(r"AIza[0-9A-Za-z_\-]{35}"), "high"),
    ("Hard-coded secret", re.compile(r"(?:api[_-]?key|secret|password|token)\s*[:=]\s*['\"][^'\"\s]{12,}['\"]", re.I), "medium"),
]
SAST_RULES = [
    ("SQL injection (string concat)", re.compile(r"(SELECT|INSERT|UPDATE|DELETE)\b[^;\n]*[\"'`]\s*\+\s*\w", re.I), "critical"),
    ("eval() on dynamic input", re.compile(r"\beval\s*\("), "high"),
    ("Shell command from variable", re.compile(r"exec(?:Sync)?\s*\(\s*[`'\"][^`'\"]*\$\{?"), "high"),
    ("dangerouslySetInnerHTML", re.compile(r"dangerouslySetInnerHTML"), "medium"),
    ("Insecure deserialization (pickle)", re.compile(r"pickle\.loads?\s*\("), "high"),
    ("Unsafe yaml.load", re.compile(r"yaml\.load\s*\((?![^)]*Loader)"), "medium"),
]


def _mask(s: str) -> str:
    s = s.strip()
    return "••••" if len(s) <= 8 else f"{s[:4]}…{s[-3:]}"


def _walk(root: Path):
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in IGNORE_DIRS and not d.startswith(".") or d.startswith(".env")]
        for name in filenames:
            ext = Path(name).suffix.lower()
            if ext in TEXT_EXT or name.startswith(".env"):
                yield Path(dirpath) / name


def _semgrep(root: str) -> list[dict]:
    if not shutil.which("semgrep"):
        return []
    try:
        proc = subprocess.run(
            ["semgrep", "scan", "--config", "p/default", "--config", "p/secrets",
             "--no-git-ignore", "--metrics=off", "--json", "--quiet", "--jobs", "4",
             "--timeout", "8", "--exclude", "node_modules", "--exclude", "dist", root],
            capture_output=True, text=True, timeout=40,
        )
        data = json.loads(proc.stdout or "{}")
        out = []
        for r in data.get("results", []):
            sev = {"ERROR": "high", "WARNING": "medium"}.get(r.get("extra", {}).get("severity"), "low")
            cid = r.get("check_id", "semgrep")
            out.append({
                "title": cid.split(".")[-1].replace("-", " "),
                "severity": sev,
                "file": os.path.relpath(r.get("path", ""), root),
                "line": r.get("start", {}).get("line", 0),
                "source": "semgrep",
            })
        return out
    except Exception:
        return []


@tool
def scan_repo(repo_path: str) -> str:
    """Run a real static security scan (semgrep + secret/SAST regex) on a local repo.
    Returns a JSON list of findings: title, severity, file, line, kind. Secrets are masked."""
    root = Path(repo_path).expanduser().resolve()
    if not root.is_dir():
        return json.dumps({"error": f"not a directory: {repo_path}"})
    findings: list[dict] = []
    for f in _walk(root):
        try:
            if f.stat().st_size > 1_500_000:
                continue
            lines = f.read_text("utf-8", errors="ignore").splitlines()
        except Exception:
            continue
        rel = os.path.relpath(f, root)
        for i, line in enumerate(lines, 1):
            if len(line) > 600:
                continue
            for title, rx, sev in SECRET_RULES:
                m = rx.search(line)
                if m:
                    findings.append({"title": title, "severity": sev, "file": rel, "line": i,
                                     "kind": "secret", "detail": f"matched {_mask(m.group(0))}"})
            for title, rx, sev in SAST_RULES:
                if rx.search(line):
                    findings.append({"title": title, "severity": sev, "file": rel, "line": i,
                                     "kind": "sast", "detail": line.strip()[:160]})
    for sg in _semgrep(str(root)):
        sg["kind"] = "secret" if "secret" in sg["title"].lower() or "token" in sg["title"].lower() else "sast"
        sg["detail"] = "semgrep rule match"
        findings.append(sg)
    rank = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    findings.sort(key=lambda x: rank.get(x["severity"], 9))
    return json.dumps(findings[:25])


@tool
def read_code(repo_path: str, file: str, line: int) -> str:
    """Read a window of lines around `line` in `file` (relative to repo_path) to plan a fix."""
    try:
        p = (Path(repo_path).expanduser().resolve() / file)
        lines = p.read_text("utf-8", errors="ignore").splitlines()
        a, b = max(0, line - 8), min(len(lines), line + 8)
        return "\n".join(f"{a+i+1}: {l}" for i, l in enumerate(lines[a:b]))
    except Exception as e:
        return f"error: {e}"


@tool
def apply_patch(repo_path: str, file: str, search: str, replace: str) -> str:
    """Apply a fix: replace the exact `search` text with `replace` in `file`.
    Backs up the original to .swrmz/backups first. Refuses to edit .env/secret files."""
    if re.search(r"\.env(\.|$)", file):
        return "refused: secrets must be rotated, not edited in place"
    root = Path(repo_path).expanduser().resolve()
    p = root / file
    try:
        original = p.read_text("utf-8")
    except Exception as e:
        return f"error reading file: {e}"
    if search not in original:
        return "error: search text not found exactly — re-read the code and retry"
    backups = root / ".swrmz" / "backups"
    backups.mkdir(parents=True, exist_ok=True)
    import time
    (backups / f"{file.replace('/', '__')}.{int(time.time())}.bak").write_text(original, "utf-8")
    p.write_text(original.replace(search, replace, 1), "utf-8")
    return f"applied: patched {file} (original backed up to .swrmz/backups)"
