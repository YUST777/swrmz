"""SWRMZ security swarm — three agents that coordinate THROUGH Band.

Analyst → Fixer → Reviewer, each a registered Band Remote Agent powered by
Featherless. They hand off to each other with @mentions inside a Band room, so
Band is the actual coordination layer (not a wrapper).
"""
from __future__ import annotations

import os

from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import InMemorySaver

from band import Agent
from band.adapters import LangGraphAdapter
from band.config import load_agent_config

from tools import apply_patch, read_code, scan_repo


def _llm():
    # Backend model via an OpenAI-compatible endpoint (works cleanly with the
    # Band LangGraph adapter — streams and posts). Configurable via env.
    return ChatOpenAI(
        model=os.getenv("AGENT_MODEL", "claude-sonnet-4-6"),
        base_url=os.getenv("AGENT_BASE_URL", "https://api.freemodel.dev/v1"),
        api_key=os.getenv("AGENT_API_KEY"),
        temperature=0.2,
        max_tokens=1024,
    )


ROLES = {
    "analyst": {
        "config": "analyst",
        "tools": [scan_repo, read_code],
        "prompt": (
            "You are Analyst in a Band room. RULES: act ONLY when a human @mentions you with a scan request "
            "containing a repository PATH. Do NOT send progress/status messages. Think privately, call scan_repo "
            "ONCE on that exact path, triage the findings, then send EXACTLY ONE final message that @mentions "
            "@SWRMZ Fixer. That message MUST include: (1) the FULL absolute "
            "repository path you scanned, and (2) the single most urgent fixable CODE issue as repo-relative file:line "
            "plus a one-line description. Then STOP. If there are only secrets (no fixable code), post one message "
            "telling the human to rotate them and do NOT mention another agent. Never echo secret values."
        ),
    },
    "fixer": {
        "config": "fixer",
        "tools": [read_code, apply_patch],
        "prompt": (
            "You are Fixer in a Band room. RULES: act ONLY when @SWRMZ Fixer is mentioned. The message contains the "
            "absolute repository path and a file:line. Do NOT send progress/status messages. Think privately. ALWAYS "
            "pass that exact repository path as repo_path to read_code and apply_patch (do not guess paths). Inspect "
            "with read_code, write a minimal correct patch (correct APIs, e.g. execFile not exec), call apply_patch "
            "ONCE, then send EXACTLY ONE final message @mentioning @SWRMZ Reviewer "
            "with the repo path and a short description of the change. Then STOP. Never edit .env/secret files."
        ),
    },
    "reviewer": {
        "config": "reviewer",
        "tools": [read_code],
        "prompt": (
            "You are Reviewer in a Band room — the FINAL step. RULES: act ONLY when @SWRMZ Reviewer is mentioned. "
            "Do NOT send progress/status messages. Think privately. Use read_code (with the repo path from the message) "
            "to verify the patch is correct and safe. Then send EXACTLY ONE concluding message summarizing the verdict "
            "for the human operator. "
            "CRITICAL: do NOT @mention SWRMZ Analyst or SWRMZ Fixer or any agent — your message ends the chain."
        ),
    },
}


def build_agent(role_key: str) -> Agent:
    role = ROLES[role_key]
    agent_id, api_key = load_agent_config(role["config"])
    adapter = LangGraphAdapter(
        llm=_llm(),
        checkpointer=InMemorySaver(),
        additional_tools=role["tools"],
        custom_section=role["prompt"],
        inject_system_prompt=True,
    )
    return Agent.create(
        adapter=adapter,
        agent_id=agent_id,
        api_key=api_key,
        ws_url=os.getenv("BAND_WS_URL", "wss://app.band.ai/api/v1/socket/websocket"),
        rest_url=os.getenv("BAND_REST_URL", "https://app.band.ai/"),
    )
