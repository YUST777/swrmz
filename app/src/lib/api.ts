import type { RoomMessage, ScanResult, Session, Target } from '../data/types';

export interface ScanEvent {
  sessionId: string;
  message: RoomMessage;
}
export interface ScanDone {
  sessionId: string;
  status: Session['status'];
  result?: ScanResult;
  error?: string;
}
export interface BandRoomEvent {
  sessionId: string;
  chatId: string;
  participants?: Array<{ id?: string; name?: string; handle?: string }>;
}
export interface ThinkEntry {
  sessionId: string;
  agent: string;
  text: string;
  at: string;
}

export interface Status {
  model: string | null;
  modelReady: boolean;
  bandReady: boolean;
  bandIdentity: string | null;
  user: string;
}

interface SwrmzBridge {
  minimize(): void;
  maximize(): void;
  close(): void;
  getVersion(): Promise<string>;
  getStatus(): Promise<Status>;
  platform: string;
  listTargets(): Promise<Target[]>;
  listSessions(): Promise<Session[]>;
  getSession(id: string): Promise<Session | null>;
  deleteSession(id: string): Promise<Session[]>;
  pickRepo(): Promise<Target | null>;
  startScan(repoPath: string): Promise<{ sessionId: string; targetId: string }>;
  approve(sessionId: string): Promise<{ path: string; hash: string; applied?: Array<{ file: string; backup?: string; title?: string; error?: string }> }>;
  ask(sessionId: string, text: string): Promise<string | null>;
  revealReport(filePath: string): Promise<void>;
  bandAvailable(): Promise<boolean>;
  bandScan(repoPath: string): Promise<{ chatId: string }>;
  bandTranscript(chatId: string): Promise<Array<{ id: string; sender: string; senderId: string; content: string; type: string; at: string }>>;
  onScanEvent(cb: (e: ScanEvent) => void): () => void;
  onBandRoom(cb: (e: BandRoomEvent) => void): () => void;
  onScanThinking(cb: (e: ThinkEntry) => void): () => void;
  onScanDone(cb: (e: ScanDone) => void): () => void;
}

declare global {
  interface Window {
    swrmz?: SwrmzBridge;
  }
}

/** Throws if not running inside Electron (renderer-only dev in a browser). */
export const api = (): SwrmzBridge => {
  if (!window.swrmz) {
    throw new Error('SWRMZ bridge unavailable — run inside the Electron app (npm run dev).');
  }
  return window.swrmz;
};

export const hasBridge = () => typeof window !== 'undefined' && !!window.swrmz;
