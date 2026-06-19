# SWRMZ Band Agents

Three security agents that **coordinate through Band** — the hackathon-compliant
core. Analyst → Fixer → Reviewer hand off to each other with `@mentions` inside a
Band chat room, each powered by Featherless. Band is the actual coordination layer.

```
Human ──"@Analyst scan /path/to/repo"──▶ Band room
   Analyst   scans (semgrep + secrets), triages, ──@Fixer──▶
   Fixer     reads code, writes + applies a patch, ──@Reviewer──▶
   Reviewer  verifies the fix, escalates to the human for sign-off
```

## One-time setup

1. **Create a Band account** at https://app.band.ai (use promo `BANDHACK26` for 1 month Pro).
2. **Create 3 Remote Agents** (Agents → New Agent → *Remote Agent*):
   `SWRMZ Analyst`, `SWRMZ Fixer`, `SWRMZ Reviewer`.
   For each, copy the **API key** (shown once) and the **Agent UUID** (settings page).
3. **Config files:**
   ```bash
   cp .env.example .env                      # add your FEATHERLESS_API_KEY
   cp agent_config.example.yaml agent_config.yaml   # add the 3 agent ids + keys
   ```
4. **Install** (Python 3.11+):
   ```bash
   uv venv && source .venv/bin/activate
   uv pip install -r requirements.txt
   ```
   (or `python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`)

## Run

```bash
python run.py
```
You should see all three agents connect. Then in Band:

1. **Chats → +** to create a room.
2. Add the three agents as participants.
3. Send: `@Analyst scan /home/you/path/to/repo`
4. Watch the handoffs happen **in the Band room** — that transcript is the audit trail.

## Notes
- `tools.py` holds the real security tools (semgrep + secret/SAST scan + backed-up patching).
- If your `band-sdk` version names the system-prompt arg differently on `LangGraphAdapter`,
  rename `system_prompt=` in `agents.py`.
- Featherless model tool-calling varies; if an agent ignores tools, set a tool-calling-capable
  `FEATHERLESS_MODEL` in `.env`.
