// Types + static config only. No mock data — all content comes from the
// real scan engine in the Electron main process.

export type AgentId =
  | 'recon'
  | 'analysis'
  | 'remediation'
  | 'guardian'
  | 'reporter'
  | 'overseer'
  | 'human';

export interface Agent {
  id: AgentId;
  name: string;
  role: string;
  color: string;
  initials: string;
}

export const AGENTS: Record<AgentId, Agent> = {
  recon: { id: 'recon', name: 'Recon', role: 'Attack-surface mapping', color: '#c0444c', initials: 'RC' },
  analysis: { id: 'analysis', name: 'Analysis', role: 'Vulnerability scanning', color: '#e0813c', initials: 'AN' },
  remediation: { id: 'remediation', name: 'Remediation', role: 'Fix generation', color: '#4ca3c0', initials: 'RM' },
  guardian: { id: 'guardian', name: 'Guardian', role: 'Per-fix review', color: '#8a6cf0', initials: 'GD' },
  overseer: { id: 'overseer', name: 'Overseer', role: 'Oversees every change', color: '#d8b54a', initials: 'OV' },
  reporter: { id: 'reporter', name: 'Reporter', role: 'Audit & reporting', color: '#5fb87a', initials: 'RP' },
  human: { id: 'human', name: 'You', role: 'Operator', color: '#a89799', initials: 'You' },
};

export type Severity = 'critical' | 'high' | 'medium' | 'low';

export interface Finding {
  id: string;
  kind: 'secret' | 'sast' | 'dependency';
  title: string;
  severity: Severity;
  file: string;
  line: number;
  detail: string;
  fix: string;
}

export type Block =
  | { kind: 'text'; text: string }
  | { kind: 'tool'; tool: string; args: string; lines: string[] }
  | { kind: 'findings'; items: Finding[] }
  | { kind: 'suggestion'; title: string; fix: string; file: string; line: number }
  | { kind: 'patch'; file: string; added: string[]; removed: string[] }
  | { kind: 'gate'; label: string; risk: string }
  | { kind: 'report'; rows: { label: string; value: string }[]; hash: string };

export interface RoomMessage {
  id: string;
  agent: AgentId;
  at: string;
  to?: AgentId;
  blocks: Block[];
}

export interface Target {
  id: string;
  name: string;
  kind: 'repo' | 'cloud' | 'logs';
  meta: string;
  path: string;
  pinned?: boolean;
}

export interface Session {
  id: string;
  targetId: string;
  repoPath: string;
  title: string;
  status: 'live' | 'awaiting' | 'done' | 'queued' | 'error';
  agents?: number;
  updated: string;
  createdAt: number;
  messages?: RoomMessage[];
  bandChatId?: string;
  bandParticipants?: string[];
  result?: ScanResult;
  report?: { path: string; hash: string };
}

export interface ScanResult {
  repoPath: string;
  repoName: string;
  bandChatId?: string;
  findings: Finding[];
  counts: Partial<Record<Severity, number>>;
  fileCount: number;
  auditRan: boolean;
  proposedFix?: {
    file: string;
    fullPath: string;
    startLine: number;
    endLine: number;
    newContent: string;
    added: string[];
    removed: string[];
  };
  proposedFixes?: Array<{
    file: string;
    fullPath: string;
    startLine: number;
    endLine: number;
    newContent: string;
    added: string[];
    removed: string[];
    title: string;
    approved: boolean;
  }>;
}

// Display label only; the backend is configured in app/.env.local.
export const MODELS = ['Claude Sonnet · Band swarm'];
