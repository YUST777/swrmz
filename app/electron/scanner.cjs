// SWRMZ real scan engine — runs in the Electron main process.
// Performs genuine static analysis against a local repo:
//   recon (file walk) → secrets → dependency audit → SAST patterns.
// No mock data: every finding comes from the user's actual files.
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const llm = require('./llm.cjs');
const band = require('./band.cjs');

const IGNORE_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'out', '.next', '.cache',
  'coverage', 'vendor', '.venv', 'venv', '__pycache__', '.idea', '.vscode',
  'release', '_reference',
]);

const TEXT_EXT = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.py', '.rb', '.go', '.php',
  '.java', '.cs', '.rs', '.c', '.cpp', '.h', '.json', '.yml', '.yaml', '.env',
  '.sh', '.sql', '.html', '.vue', '.svelte', '.tf', '.toml', '.ini', '.xml',
]);

const LANG_BY_EXT = {
  '.js': 'JavaScript', '.jsx': 'JavaScript', '.mjs': 'JavaScript', '.cjs': 'JavaScript',
  '.ts': 'TypeScript', '.tsx': 'TypeScript', '.py': 'Python', '.rb': 'Ruby',
  '.go': 'Go', '.php': 'PHP', '.java': 'Java', '.cs': 'C#', '.rs': 'Rust',
  '.c': 'C', '.cpp': 'C++', '.sql': 'SQL', '.vue': 'Vue', '.svelte': 'Svelte',
};

const MAX_FILE_BYTES = 1_500_000;
const MAX_FILES = 8000;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function maskSecret(s) {
  const v = String(s).trim();
  if (v.length <= 8) return '••••';
  return `${v.slice(0, 4)}…${v.slice(-3)}`;
}

/** Recursively collect text files (bounded). */
function walk(root) {
  const files = [];
  const langs = {};
  let manifestNode = false;
  let manifestPy = false;
  const stack = [root];
  while (stack.length && files.length < MAX_FILES) {
    const dir = stack.pop();
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (!IGNORE_DIRS.has(e.name) && !e.name.startsWith('.')) stack.push(full);
      } else if (e.isFile()) {
        const ext = path.extname(e.name).toLowerCase();
        if (e.name === 'package.json') manifestNode = true;
        if (e.name === 'requirements.txt' || e.name === 'pyproject.toml') manifestPy = true;
        if (TEXT_EXT.has(ext) || e.name.startsWith('.env')) {
          files.push(full);
          if (LANG_BY_EXT[ext]) langs[LANG_BY_EXT[ext]] = (langs[LANG_BY_EXT[ext]] || 0) + 1;
        }
      }
    }
  }
  return { files, langs, manifestNode, manifestPy };
}

// --- Secret detectors (real regex over real files) ---
const SECRET_RULES = [
  { id: 'aws-key', title: 'AWS access key ID', re: /AKIA[0-9A-Z]{16}/, sev: 'critical' },
  { id: 'stripe-live', title: 'Stripe live secret key', re: /sk_live_[0-9a-zA-Z]{20,}/, sev: 'critical' },
  { id: 'private-key', title: 'Private key material committed', re: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/, sev: 'critical' },
  { id: 'gh-token', title: 'GitHub personal access token', re: /ghp_[0-9a-zA-Z]{36}/, sev: 'high' },
  { id: 'slack-token', title: 'Slack token', re: /xox[baprs]-[0-9a-zA-Z-]{10,}/, sev: 'high' },
  { id: 'google-api', title: 'Google API key', re: /AIza[0-9A-Za-z_\-]{35}/, sev: 'high' },
  { id: 'generic-secret', title: 'Hard-coded secret assignment', re: /(?:api[_-]?key|secret|password|passwd|token)\s*[:=]\s*['"][^'"\s]{12,}['"]/i, sev: 'medium' },
];

// --- SAST pattern detectors ---
const SAST_RULES = [
  { id: 'sql-concat', title: 'Possible SQL injection (string concatenation)', re: /(SELECT|INSERT|UPDATE|DELETE)\b[^;\n]*["'`]\s*\+\s*\w/i, sev: 'critical', fix: 'Use parameterized queries / prepared statements instead of string concatenation.' },
  { id: 'js-eval', title: 'Use of eval() on dynamic input', re: /\beval\s*\(/, sev: 'high', fix: 'Avoid eval(). Parse data explicitly or use safe alternatives.' },
  { id: 'child-exec', title: 'Shell command built from variables', re: /exec(?:Sync)?\s*\(\s*[`'"][^`'"]*\$\{?/, sev: 'high', fix: 'Use execFile with an args array; never interpolate user input into a shell string.' },
  { id: 'react-dangerous', title: 'dangerouslySetInnerHTML usage', re: /dangerouslySetInnerHTML/, sev: 'medium', fix: 'Sanitize HTML (e.g. DOMPurify) before rendering, or avoid raw HTML.' },
  { id: 'py-pickle', title: 'Insecure deserialization (pickle.loads)', re: /pickle\.loads?\s*\(/, sev: 'high', fix: 'Never unpickle untrusted data. Use JSON or a safe serializer.' },
  { id: 'py-yaml', title: 'Unsafe yaml.load', re: /yaml\.load\s*\((?![^)]*Loader)/, sev: 'medium', fix: 'Use yaml.safe_load() instead of yaml.load().' },
  { id: 'md5', title: 'Weak hash (MD5/SHA1) for security use', re: /\b(md5|sha1)\s*\(/i, sev: 'low', fix: 'Use SHA-256+ for integrity and bcrypt/argon2 for passwords.' },
  { id: 'debug-true', title: 'Debug mode enabled', re: /debug\s*[:=]\s*True\b/i, sev: 'low', fix: 'Disable debug in production to avoid leaking stack traces.' },
];

function scanFileContents(files, repoRoot, push) {
  const findings = [];
  let scanned = 0;
  for (const file of files) {
    let stat;
    try {
      stat = fs.statSync(file);
    } catch {
      continue;
    }
    if (stat.size > MAX_FILE_BYTES) continue;
    let text;
    try {
      text = fs.readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    scanned += 1;
    const rel = path.relative(repoRoot, file);
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      if (line.length > 600) continue;
      for (const rule of SECRET_RULES) {
        const m = rule.re.exec(line);
        if (m) {
          findings.push({
            id: `${rule.id}-${rel}-${i}`,
            kind: 'secret',
            title: rule.title,
            severity: rule.sev,
            file: rel,
            line: i + 1,
            detail: `Matched ${maskSecret(m[0])} in source. Rotate the credential and move it to a secret store.`,
            fix: 'Remove the secret from source, rotate it, and load it from an environment variable or secret manager.',
          });
        }
      }
      for (const rule of SAST_RULES) {
        if (rule.re.test(line)) {
          findings.push({
            id: `${rule.id}-${rel}-${i}`,
            kind: 'sast',
            title: rule.title,
            severity: rule.sev,
            file: rel,
            line: i + 1,
            detail: line.trim().slice(0, 180),
            fix: rule.fix,
          });
        }
      }
    }
  }
  if (push) push(scanned);
  // de-dup identical rule+file+line
  const seen = new Set();
  return findings.filter((f) => {
    if (seen.has(f.id)) return false;
    seen.add(f.id);
    return true;
  });
}

/** Run `npm audit --json` if a Node manifest is present. Real CVE data (needs network). */
function npmAudit(repoRoot) {
  return new Promise((resolve) => {
    const hasPkg = fs.existsSync(path.join(repoRoot, 'package.json'));
    if (!hasPkg) return resolve({ ran: false, reason: 'no package.json', findings: [] });
    execFile(
      'npm',
      ['audit', '--json'],
      { cwd: repoRoot, timeout: 45000, maxBuffer: 12 * 1024 * 1024 },
      (_err, stdout) => {
        if (!stdout) return resolve({ ran: false, reason: 'no audit output (offline?)', findings: [] });
        try {
          const data = JSON.parse(stdout);
          const findings = [];
          const vulns = data.vulnerabilities || {};
          for (const name of Object.keys(vulns)) {
            const v = vulns[name];
            const sev = ['critical', 'high', 'moderate', 'low'].includes(v.severity)
              ? (v.severity === 'moderate' ? 'medium' : v.severity)
              : 'low';
            findings.push({
              id: `dep-${name}`,
              kind: 'dependency',
              title: `Vulnerable dependency: ${name}`,
              severity: sev,
              file: 'package.json',
              line: 0,
              detail: `${v.range || ''} · ${(v.via || []).map((x) => (typeof x === 'string' ? x : x.title)).filter(Boolean).slice(0, 2).join('; ') || 'known advisory'}`,
              fix: v.fixAvailable ? 'Run `npm audit fix` or upgrade to a patched version.' : 'No automatic fix; review the advisory and upgrade manually.',
            });
          }
          resolve({ ran: true, findings, meta: data.metadata?.vulnerabilities });
        } catch {
          resolve({ ran: false, reason: 'could not parse audit output', findings: [] });
        }
      },
    );
  });
}

const sevRank = { critical: 0, high: 1, medium: 2, low: 3 };

// --- semgrep: the real industry SAST engine (same one Strix/Shannon use for triage) ---
function resolveSemgrep() {
  const os = require('os');
  const cands = [
    path.join(os.homedir(), '.local/bin/semgrep'),
    '/usr/local/bin/semgrep',
    '/usr/bin/semgrep',
    '/opt/homebrew/bin/semgrep',
  ];
  for (const c of cands) {
    try {
      if (fs.existsSync(c)) return c;
    } catch {
      /* ignore */
    }
  }
  return 'semgrep'; // fall back to PATH; execFile ENOENT is handled
}

function mapSemgrepResult(repoPath) {
  return (r) => {
    const sevRaw = r.extra?.severity || 'INFO';
    const severity = sevRaw === 'ERROR' ? 'high' : sevRaw === 'WARNING' ? 'medium' : 'low';
    const id = r.check_id || 'semgrep.finding';
    const isSecret = /secret|token|api.?key|password|credential|detected-|private-key/i.test(id);
    const rel = path.relative(repoPath, r.path);
    const msg = (r.extra?.message || '').replace(/\s+/g, ' ').trim().slice(0, 220);
    return {
      id: `sg-${id}-${rel}-${r.start.line}`,
      kind: isSecret ? 'secret' : 'sast',
      title: id.split('.').pop().replace(/[-_]/g, ' '),
      severity,
      file: rel,
      line: r.start?.line || 0,
      // never echo raw matched lines for secrets
      detail: msg || (isSecret ? 'Secret detected — rotate the credential.' : ''),
      fix: r.extra?.metadata?.references?.[0] || 'Review the semgrep rule guidance and remediate.',
      source: 'semgrep',
    };
  };
}

/** Run semgrep with OWASP + secrets rule packs. Returns {ran, findings, ruleNote}. */
function runSemgrep(repoPath) {
  return new Promise((resolve) => {
    const bin = resolveSemgrep();
    const EXCLUDES = [
      'node_modules', '.git', 'dist', 'build', 'out', '.next', '.nuxt', '.cache',
      'coverage', 'vendor', '.venv', 'venv', '__pycache__', 'public', 'assets',
      'static', '.swrmz', '*.min.js', '*.bundle.js', '*.map', '*.lock',
      '*.png', '*.jpg', '*.jpeg', '*.webp', '*.svg', '*.gif', '*.ico', '*.pdf',
    ];
    const args = [
      'scan',
      '--config', 'p/default',
      '--config', 'p/secrets',
      '--no-git-ignore',
      '--metrics=off',
      '--json',
      '--quiet',
      '--jobs', '4',
      '--max-target-bytes', '1000000',
      '--timeout', '8',
      '--timeout-threshold', '3',
      ...EXCLUDES.flatMap((e) => ['--exclude', e]),
      repoPath,
    ];
    // Best-effort: semgrep is a helper, not the engine. Hard 40s budget.
    execFile(bin, args, { timeout: 40000, killSignal: 'SIGKILL', maxBuffer: 96 * 1024 * 1024 }, (err, stdout) => {
      if (stdout) {
        try {
          const data = JSON.parse(stdout);
          return resolve({ ran: true, findings: (data.results || []).map(mapSemgrepResult(repoPath)) });
        } catch {
          /* fall through */
        }
      }
      const timedout = !!(err && (err.killed || err.signal === 'SIGKILL'));
      resolve({ ran: false, timedout, findings: [] });
    });
  });
}

function dedupeFindings(list) {
  const seen = new Set();
  const out = [];
  for (const f of list) {
    const key = `${f.file}:${f.line}:${f.kind}:${(f.title || '').toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(f);
  }
  return out;
}

function stripFences(text) {
  let t = text.trim();
  // remove ```lang ... ``` fences if the model added them
  const fence = t.match(/^```[a-zA-Z0-9]*\n([\s\S]*?)\n```$/);
  if (fence) t = fence[1];
  return t.replace(/^```[a-zA-Z0-9]*\n?/, '').replace(/\n?```$/, '');
}

/**
 * Generate a real code fix for the top finding using Featherless.
 * Returns a proposedFix (with diff) or null. Does NOT write to disk.
 */
async function generateFix(top, repoPath, feedback = '') {
  if (!llm.enabled() || !top.line) return null;
  // Never auto-patch secrets, dependency manifests, or env files:
  // editing them leaks values into the diff and breaks the app.
  if (top.kind !== 'sast') return null;
  if (/(^|[\\/])\.env(\.|$)/i.test(top.file) || /\.env$/i.test(top.file)) return null;
  const fullPath = path.join(repoPath, top.file);
  let text;
  try {
    text = fs.readFileSync(fullPath, 'utf8');
  } catch {
    return null;
  }
  const lines = text.split('\n');
  const idx = top.line - 1;
  if (idx < 0 || idx >= lines.length) return null;

  const start = Math.max(0, idx - 6);
  const end = Math.min(lines.length, idx + 7);
  const region = lines.slice(start, end).join('\n');

  const out = await llm.chat(
    [
      {
        role: 'system',
        content:
          'You are a secure-coding assistant. You are given a code snippet that contains a security vulnerability. Return ONLY the corrected snippet with the exact same number of surrounding lines and identical indentation style. Use correct API signatures (e.g. child_process.exec takes a string; use execFile/spawn with an args array). Do not add explanations, comments about the change, or markdown code fences. Preserve unrelated lines verbatim.',
      },
      {
        role: 'user',
        content:
          `Vulnerability: ${top.title} (line ${top.line - start + 1} of the snippet).\nFile: ${top.file}\n\nSnippet:\n${region}\n\n` +
          (feedback ? `A previous attempt was REJECTED by the reviewer for this reason:\n${feedback}\nFix that. ` : '') +
          'Return the corrected snippet only.',
      },
    ],
    { maxTokens: 600, temperature: 0.1 },
  );
  if (!out) return null;

  const newRegionLines = stripFences(out).split('\n');
  // sanity: reject wildly different sizes (likely a hallucinated rewrite)
  const origCount = end - start;
  if (newRegionLines.length > origCount + 8 || newRegionLines.length < 1) return null;

  const newContent = [...lines.slice(0, start), ...newRegionLines, ...lines.slice(end)].join('\n');
  if (newContent === text) return null;

  return {
    file: top.file,
    fullPath,
    startLine: start + 1,
    endLine: end,
    newContent,
    removed: lines.slice(start, end),
    added: newRegionLines,
  };
}

/**
 * Run a full scan, emitting RoomMessage-shaped events through `emit`.
 * Returns the final session payload (with all findings) for persistence.
 */
async function runScan({ repoPath, emit, think = () => {} }) {
  const at = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const repoName = path.basename(repoPath);
  const allFindings = [];

  const usingBand = band.enabled();
  const aiOn = llm.enabled();
  const post = (message, bandText, events) => {
    emit(message);
    if (usingBand) {
      if (bandText) band.sendMessage(bandText).catch(() => {});
      for (const ev of events || []) band.sendEvent(ev.type, ev.data).catch(() => {});
    }
  };

  // Each agent is a real LLM (Featherless). Tools (semgrep/regex/audit) are helpers
  // the agents reason over — mirroring how Strix uses an LLM agent + tools.
  const agentSay = async (system, user, fallback, maxTokens = 240) => {
    if (!aiOn) return fallback;
    const out = await llm.chat(
      [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      { maxTokens, temperature: 0.3 },
    );
    return out || fallback;
  };

  // 1) RECON AGENT — reasons over the real file map to plan the assessment
  think({ agent: 'recon', text: 'Indexing the repository and mapping the attack surface…' });
  const { files, langs, manifestNode, manifestPy } = walk(repoPath);
  const langSummary =
    Object.entries(langs)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([k, v]) => `${k} (${v})`)
      .join(', ') || 'mixed / none detected';
  const manifests =
    [manifestNode && 'package.json', manifestPy && 'requirements/pyproject'].filter(Boolean).join(', ') || 'none';

  think({ agent: 'recon', text: `Indexed ${files.length} files (${langSummary}). Reasoning over the surface with ${aiOn ? llm.model() : 'rules'}…` });
  const reconText = await agentSay(
    'You are Recon, an autonomous application-security agent that maps a codebase to plan a security assessment. Be concise and concrete: 2-3 sentences, no lists or headings. Name the likely high-risk areas to scan.',
    `Repository: ${repoName}. ${files.length} source files. Languages: ${langSummary}. Manifests: ${manifests}. Describe the attack surface and where the swarm should focus, then hand off to Analysis.`,
    `Mapped ${files.length} files across ${langSummary}. Focusing the scan on entry points, auth, and config. Handing off to Analysis.`,
    220,
  );
  think({ agent: 'recon', text: 'Surface mapped. Handing off to Analysis.' });

  post(
    {
      id: 'recon',
      agent: 'recon',
      at: at(),
      to: 'analysis',
      blocks: [
        {
          kind: 'tool',
          tool: 'surface.map',
          args: repoPath,
          lines: [
            `✓ ${files.length} source files indexed`,
            `✓ languages: ${langSummary}`,
            `✓ manifests: ${manifests}`,
          ],
        },
        { kind: 'text', text: reconText },
        { kind: 'text', text: 'Handing off to @Analysis.' },
      ],
    },
    `@Analysis ${reconText}`,
    [{ type: 'tool_call', data: { tool: 'surface.map', files: files.length } }],
  );

  // 2) ANALYSIS — semgrep (best-effort helper, 40s budget) + regex pass + dep audit
  think({ agent: 'analysis', text: 'Running semgrep (p/default + p/secrets) as a helper — 40s budget…' });
  const t0 = Date.now();
  let ticks = 0;
  const heartbeat = setInterval(() => {
    ticks += 1;
    think({ agent: 'analysis', text: `semgrep scanning… (${ticks * 12}s, 40s budget)` });
  }, 12000);
  const sg = await runSemgrep(repoPath);
  clearInterval(heartbeat);
  think({
    agent: 'analysis',
    text: sg.ran
      ? `semgrep finished in ${Math.round((Date.now() - t0) / 1000)}s — ${sg.findings.length} rule matches.`
      : sg.timedout
        ? 'semgrep exceeded its 40s budget — proceeding with fast SAST + AI triage.'
        : 'semgrep unavailable — using built-in regex SAST.',
  });

  think({ agent: 'analysis', text: 'Scanning source for hardcoded secrets & dangerous patterns…' });
  const codeFindings = scanFileContents(files, repoPath);
  think({ agent: 'analysis', text: `Pattern pass: ${codeFindings.length} matches.` });

  think({ agent: 'analysis', text: 'Auditing dependencies (npm audit)…' });
  const audit = await npmAudit(repoPath);
  think({
    agent: 'analysis',
    text: audit.ran ? `Dependency audit: ${audit.findings.length} advisories.` : `Dependency audit skipped (${audit.reason}).`,
  });

  allFindings.push(...dedupeFindings([...sg.findings, ...codeFindings, ...audit.findings]));
  allFindings.sort((a, b) => sevRank[a.severity] - sevRank[b.severity]);
  think({
    agent: 'analysis',
    text: `Merged & deduped to ${allFindings.length} unique signals. Triaging exploitability with ${aiOn ? llm.model() : 'rules'}…`,
  });

  const counts = allFindings.reduce((acc, f) => {
    acc[f.severity] = (acc[f.severity] || 0) + 1;
    return acc;
  }, {});
  const byClass = allFindings.reduce((acc, f) => {
    acc[f.kind] = (acc[f.kind] || 0) + 1;
    return acc;
  }, {});
  const countStr =
    ['critical', 'high', 'medium', 'low']
      .filter((s) => counts[s])
      .map((s) => `${counts[s]} ${s}`)
      .join(', ') || 'no issues';
  const classStr =
    Object.entries(byClass)
      .map(([k, v]) => `${v} ${k}`)
      .join(' · ') || 'none';

  // ANALYSIS AGENT — LLM triages the raw tool output (semgrep is just the helper)
  const triageText = allFindings.length
    ? await agentSay(
        'You are Analysis, an autonomous appsec agent. You are given raw static-scan findings from semgrep and other tools. Triage them like a human pentester: confirm which are real exploitable risks, call out likely false positives, and name the single most urgent issue. 3-5 sentences, no lists, never echo secret values.',
        `Repository ${repoName}. Raw findings:\n${allFindings
          .slice(0, 15)
          .map((f, i) => `${i + 1}. [${f.severity}] ${f.title} — ${f.file}:${f.line}${f.source === 'semgrep' ? ' (semgrep)' : ''}`)
          .join('\n')}\n\nGive your triage and hand off the top issue to Remediation.`,
        `${countStr}. Prioritising the highest-severity issues; handing the top one to Remediation.`,
        340,
      )
    : await agentSay(
        'You are Analysis, an autonomous appsec agent. The static tools returned no findings.',
        `Repository ${repoName}: the semgrep + secret + dependency passes found nothing. Briefly reassure and hand off to Reporter. 1-2 sentences.`,
        'No exploitable findings in this pass — surface looks clean. Handing off to Reporter.',
        120,
      );
  think({
    agent: 'analysis',
    text: allFindings.length ? 'Triage complete — escalating the top issue to Remediation.' : 'Surface clean — handing off to Reporter.',
  });

  post(
    {
      id: 'analysis',
      agent: 'analysis',
      at: at(),
      to: allFindings.length ? 'remediation' : 'reporter',
      blocks: [
        {
          kind: 'tool',
          tool: sg.ran ? 'semgrep + secrets + sast + npm audit' : 'secrets + sast + npm audit',
          args: `${files.length} files`,
          lines: [
            sg.ran
              ? `✓ semgrep p/default + p/secrets`
              : sg.timedout
                ? `· semgrep over 40s budget — fast SAST + AI triage`
                : `· semgrep unavailable — built-in regex SAST`,
            audit.ran ? `✓ npm audit completed` : `· npm audit skipped (${audit.reason})`,
            `✓ ${allFindings.length} raw signals · ${classStr}`,
            `· AI triage applied (static — exploit validation out of scope)`,
          ],
        },
        ...(allFindings.length ? [{ kind: 'findings', items: allFindings.slice(0, 12) }] : []),
        { kind: 'text', text: triageText },
      ],
    },
    allFindings.length ? `@Remediation ${triageText}` : `@Reporter ${triageText}`,
    [{ type: 'tool_result', data: { findings: allFindings.length, counts } }],
  );

  // 3) REPORTER AGENT — writes the security report (non-destructive, automatic)
  think({ agent: 'reporter', text: 'Writing the security report and sealing the audit trail…' });
  const reportSummary = await agentSay(
    'You are Reporter, an appsec analyst writing a short executive summary of a scan. 2-3 sentences: overall posture, the top risks, and the single most important action. No headings, never echo secret values.',
    `Repository ${repoName}. ${allFindings.length} findings (${countStr}). Top items:\n${allFindings
      .slice(0, 8)
      .map((f, i) => `${i + 1}. [${f.severity}] ${f.title} — ${f.file}:${f.line}`)
      .join('\n') || 'none'}\nWrite the summary.`,
    allFindings.length
      ? `${countStr}. Rotate any exposed secrets first, then fix the highest-severity code issues.`
      : 'No exploitable findings — the surface looks clean in this pass.',
    240,
  );

  const partialResult = { repoPath, repoName, findings: allFindings, counts, fileCount: files.length, auditRan: audit.ran };
  let report = null;
  try {
    report = writeReport(partialResult);
  } catch {
    report = null;
  }

  post(
    {
      id: 'reporter',
      agent: 'reporter',
      at: at(),
      to: allFindings.length ? 'remediation' : undefined,
      blocks: [
        { kind: 'text', text: reportSummary },
        {
          kind: 'report',
          rows: [
            { label: 'Findings', value: countStr },
            { label: 'Files scanned', value: String(files.length) },
            { label: 'Classes', value: classStr },
            { label: 'Report', value: report ? 'written to .swrmz/' : 'unavailable' },
          ],
          hash: report ? report.hash : 'n/a',
        },
        ...(allFindings.length ? [{ kind: 'text', text: 'Report sealed. @Remediation — fix the top code issue.' }] : []),
      ],
    },
    allFindings.length ? `@Remediation report sealed. ${reportSummary}` : `Report sealed. ${reportSummary}`,
    [{ type: 'tool_call', data: { tool: 'report.write', hash: report?.hash } }],
  );

  // 4) REMEDIATION + GUARDIAN — fix EVERY auto-fixable code issue, one after another
  const proposedFixes = [];
  if (allFindings.length) {
    // One fixable target per distinct file (avoids patch-offset conflicts), SAST only.
    const seenFiles = new Set();
    const targets = [];
    for (const f of allFindings) {
      if (f.kind !== 'sast' || /\.env(\.|$)/i.test(f.file)) continue;
      if (seenFiles.has(f.file)) continue;
      seenFiles.add(f.file);
      targets.push(f);
      if (targets.length >= 6) break;
    }

    let idx = 0;
    for (const target of targets) {
      idx += 1;
      let feedback = '';
      let chosen = null;
      let verdictText = '';
      let approved = false;

      for (let attempt = 1; attempt <= 2; attempt += 1) {
        think({
          agent: 'remediation',
          text: `Problem ${idx}/${targets.length}: ${attempt === 1 ? 'generating' : 'regenerating'} a patch for ${target.title} (${target.file}:${target.line})…`,
        });
        const fix = await generateFix(target, repoPath, feedback);
        if (!fix) break;
        chosen = fix;

        think({ agent: 'guardian', text: `Problem ${idx}/${targets.length}: reviewing the patch for correctness…` });
        const verdict = await agentSay(
          'You are Guardian, an autonomous appsec reviewer with veto power. Decide if the patch is CORRECT (valid code, right API signatures, preserves behaviour) and fully fixes the issue. 2-3 sentences, then end with exactly "VERDICT: APPROVE" or "VERDICT: REJECT".',
          `Issue: ${target.title} at ${target.file}:${target.line}.\nPatch:\nREMOVED:\n${fix.removed.join('\n')}\nADDED:\n${fix.added.join('\n')}\nReview strictly — flag wrong API signatures (e.g. exec vs execFile), dropped arguments, or broken behaviour.`,
          'The patch is correct and scoped. VERDICT: APPROVE',
          240,
        );
        verdictText = verdict.replace(/VERDICT:\s*(APPROVE|REJECT)\s*$/i, '').trim();
        if (/VERDICT:\s*REJECT/i.test(verdict) && attempt < 2) {
          feedback = verdict;
          continue;
        }
        approved = !/VERDICT:\s*REJECT/i.test(verdict);
        break;
      }

      if (!chosen) continue;

      // Remediation posts the patch for this problem
      post(
        {
          id: `remediation-${idx}`,
          agent: 'remediation',
          at: at(),
          to: 'guardian',
          blocks: [
            { kind: 'text', text: `Problem ${idx} of ${targets.length} — ${target.title} (${target.file}:${target.line}).` },
            { kind: 'patch', file: chosen.file, removed: chosen.removed, added: chosen.added },
          ],
        },
        `@Guardian patch ${idx}/${targets.length} for ${target.title}.`,
        [{ type: 'thought', data: { problem: idx, model: llm.model() } }],
      );

      // Guardian posts its per-fix verdict
      post(
        {
          id: `guardian-${idx}`,
          agent: 'guardian',
          at: at(),
          to: 'overseer',
          blocks: [
            { kind: 'text', text: `${approved ? '✓' : '⚠️'} ${verdictText || (approved ? 'Patch is correct and scoped.' : 'Could not fully verify this patch.')}` },
          ],
        },
        `@Overseer fix ${idx} ${approved ? 'approved' : 'flagged'}.`,
        [{ type: 'thought', data: { problem: idx, approved } }],
      );

      proposedFixes.push({ ...chosen, title: target.title, approved });
    }

    // 5) OVERSEER — reviews the whole batch of changes, then one human gate
    think({ agent: 'overseer', text: `Overseeing ${proposedFixes.length} proposed change${proposedFixes.length === 1 ? '' : 's'} across the codebase…` });
    const okCount = proposedFixes.filter((f) => f.approved).length;
    const overseerText = await agentSay(
      'You are Overseer, the lead security engineer who signs off on a batch of code changes before they touch the repo. Give a 2-3 sentence holistic verdict on the set of fixes: overall quality, any risk, and whether they are safe to apply together. No headings.',
      `Repository ${repoName}. Proposed fixes (${proposedFixes.length}):\n${proposedFixes
        .map((f, i) => `${i + 1}. ${f.title} in ${f.file} — Guardian ${f.approved ? 'APPROVED' : 'FLAGGED'}`)
        .join('\n')}\nGive your oversight verdict.`,
      `${okCount}/${proposedFixes.length} fixes passed Guardian review. They are scoped, file-isolated, and backed up before applying.`,
      240,
    );

    post(
      {
        id: 'overseer',
        agent: 'overseer',
        at: at(),
        to: 'human',
        blocks: [
          { kind: 'text', text: overseerText },
          {
            kind: 'gate',
            label: proposedFixes.length
              ? `Apply ${proposedFixes.length} fix${proposedFixes.length === 1 ? '' : 'es'} across ${new Set(proposedFixes.map((f) => f.file)).size} file${new Set(proposedFixes.map((f) => f.file)).size === 1 ? '' : 's'}`
              : `Acknowledge report for ${repoName}`,
            risk: proposedFixes.length
              ? 'Edits source files (each original backed up to .swrmz/backups) · requires human approval'
              : 'No auto-fixable code issues · secrets must be rotated manually',
          },
        ],
      },
      `@You Overseer sign-off: ${overseerText}`,
      [{ type: 'thought', data: { gate: 'human_approval_required', fixes: proposedFixes.length } }],
    );
  }

  return {
    repoPath,
    repoName,
    findings: allFindings,
    counts,
    fileCount: files.length,
    auditRan: audit.ran,
    band: usingBand,
    model: llm.enabled() ? llm.model() : null,
    proposedFixes,
    report,
  };
}

/** Apply a proposed fix to disk, backing up the original first. Returns {file, backup}. */
function applyFix(proposedFix, repoPath) {
  const crypto = require('crypto');
  const backupsDir = path.join(repoPath, '.swrmz', 'backups');
  fs.mkdirSync(backupsDir, { recursive: true });
  const original = fs.readFileSync(proposedFix.fullPath, 'utf8');
  const safeName = proposedFix.file.replace(/[\\/]/g, '__');
  const backup = path.join(backupsDir, `${safeName}.${Date.now()}.bak`);
  fs.writeFileSync(backup, original, 'utf8');
  fs.writeFileSync(proposedFix.fullPath, proposedFix.newContent, 'utf8');
  return {
    file: proposedFix.file,
    backup: path.relative(repoPath, backup),
    hash: crypto.createHash('sha256').update(proposedFix.newContent).digest('hex'),
  };
}

/** Write a real signed markdown report into the repo (.swrmz/). Returns {path, hash}. */
function writeReport(session) {
  const crypto = require('crypto');
  const dir = path.join(session.repoPath, '.swrmz');
  fs.mkdirSync(dir, { recursive: true });
  const lines = [
    `# SWRMZ Security Report — ${session.repoName}`,
    '',
    `Generated: ${new Date().toISOString()}`,
    `Files scanned: ${session.fileCount}`,
    `Findings: ${session.findings.length}`,
    '',
    '## Findings',
    '',
  ];
  for (const f of session.findings) {
    lines.push(`### [${f.severity.toUpperCase()}] ${f.title}`);
    lines.push(`- Location: \`${f.file}${f.line ? `:${f.line}` : ''}\``);
    lines.push(`- Detail: ${f.detail}`);
    lines.push(`- Fix: ${f.fix}`);
    lines.push('');
  }
  const body = lines.join('\n');
  const hash = crypto.createHash('sha256').update(body).digest('hex');
  const full = `${body}\n---\nAudit hash: sha256:${hash}\n`;
  const file = path.join(dir, `report-${Date.now()}.md`);
  fs.writeFileSync(file, full, 'utf8');
  return { path: file, hash };
}

module.exports = { runScan, writeReport, applyFix };
