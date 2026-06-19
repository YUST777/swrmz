import { useCallback, useEffect, useRef, useState } from 'react';
import { TitleBar } from './components/TitleBar';
import { TargetSidebar } from './components/TargetSidebar';
import { SessionList } from './components/SessionList';
import { RoomView } from './components/RoomView';
import { PromptBar } from './components/PromptBar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { api, hasBridge, type BandRoomEvent, type ScanDone, type ScanEvent, type Status, type ThinkEntry } from './lib/api';
import type { RoomMessage, Session, Target } from './data/types';

export function App() {
  const [targets, setTargets] = useState<Target[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeTargetId, setActiveTargetId] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [phase, setPhase] = useState<'welcome' | 'running'>('welcome');
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [status, setStatus] = useState<Session['status']>('done');
  const [approved, setApproved] = useState(false);
  const [integrations, setIntegrations] = useState<Status | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [asking, setAsking] = useState(false);
  const [thinking, setThinking] = useState<ThinkEntry[]>([]);
  const [activeBandChatId, setActiveBandChatId] = useState<string | null>(null);
  const [activeBandParticipants, setActiveBandParticipants] = useState<string[]>([]);
  const scanningId = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    if (!hasBridge()) return;
    setTargets(await api().listTargets());
    setSessions(await api().listSessions());
  }, []);

  useEffect(() => {
    refresh();
    if (hasBridge()) api().getStatus().then(setIntegrations).catch(() => {});
  }, [refresh]);

  // Subscribe to the real scan stream.
  useEffect(() => {
    if (!hasBridge()) return;
    const offEvent = api().onScanEvent(({ sessionId, message }: ScanEvent) => {
      if (sessionId !== scanningId.current) return;
      setMessages((prev) => [...prev, message]);
    });
    const offBandRoom = api().onBandRoom(({ sessionId, chatId, participants }: BandRoomEvent) => {
      if (sessionId !== scanningId.current) return;
      setActiveBandChatId(chatId);
      setActiveBandParticipants(
        (participants ?? [])
          .map((p) => p.name || p.handle)
          .filter((name): name is string => Boolean(name)),
      );
    });
    const offThink = api().onScanThinking((e: ThinkEntry) => {
      if (e.sessionId !== scanningId.current) return;
      setThinking((prev) => [...prev, e]);
    });
    const offDone = api().onScanDone(({ sessionId, status: st, result }: ScanDone) => {
      if (sessionId !== scanningId.current) return;
      setStatus(st);
      if (result?.bandChatId) setActiveBandChatId(result.bandChatId);
      refresh();
    });
    return () => {
      offEvent();
      offBandRoom();
      offThink();
      offDone();
    };
  }, [refresh]);

  const startScanOn = useCallback(
    async (repoPath: string, targetId?: string) => {
      setPhase('running');
      setMessages([]);
      setApproved(false);
      setStatus('live');
      setThinking([]);
      setActiveBandChatId(null);
      setActiveBandParticipants([]);
      const res = await api().startScan(repoPath);
      scanningId.current = res.sessionId;
      setActiveSessionId(res.sessionId);
      setActiveTargetId(targetId ?? res.targetId);
      refresh();
    },
    [refresh],
  );

  const pickAndScan = useCallback(async () => {
    if (!hasBridge()) return;
    const target = await api().pickRepo();
    if (!target) return;
    await startScanOn(target.path, target.id);
  }, [startScanOn]);

  const handleTarget = (id: string) => {
    setActiveTargetId(id);
  };

  const handleSession = async (id: string) => {
    if (id === scanningId.current) {
      setActiveSessionId(id);
      setPhase('running');
      return;
    }
    const s = await api().getSession(id);
    if (!s) return;
    scanningId.current = null;
    setActiveSessionId(id);
    setActiveTargetId(s.targetId);
    setMessages(s.messages ?? []);
    setStatus(s.status);
    setApproved(!!s.report);
    setActiveBandChatId(s.bandChatId ?? s.result?.bandChatId ?? null);
    setActiveBandParticipants(s.bandParticipants ?? []);
    setPhase('running');
  };

  // New chat (scan session) on the currently selected project.
  const newChatOnTarget = useCallback(async () => {
    const t = targets.find((x) => x.id === activeTargetId);
    if (t) await startScanOn(t.path, t.id);
    else setPhase('welcome');
  }, [targets, activeTargetId, startScanOn]);

  const togglePanel = useCallback(() => setPanelOpen((o) => !o), []);

  const handleDelete = useCallback(
    async (id: string) => {
      const updated = await api().deleteSession(id);
      setSessions(updated);
      if (id === activeSessionId) {
        setActiveSessionId(null);
        setPhase('welcome');
      }
    },
    [activeSessionId],
  );

  // Real chat turn: send the operator's question to Featherless, grounded in findings.
  const handleAsk = useCallback(
    async (text: string) => {
      if (!activeSessionId || !text.trim()) return;
      const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, agent: 'human', at: now(), blocks: [{ kind: 'text', text }] },
      ]);
      setAsking(true);
      const answer = await api().ask(activeSessionId, text);
      setAsking(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          agent: 'analysis',
          at: now(),
          blocks: [
            {
              kind: 'text',
              text: answer ?? 'No response from the model — check the Featherless key in .env.local.',
            },
          ],
        },
      ]);
    },
    [activeSessionId],
  );

  const handleApprove = useCallback(async () => {
    if (!activeSessionId) return;
    const out = await api().approve(activeSessionId);
    setApproved(true);
    const at = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const applied = out.applied ?? [];
    const okFixes = applied.filter((a) => !a.error);
    const failed = applied.filter((a) => a.error);

    const s = await api().getSession(activeSessionId);
    const total = s?.result?.findings?.length ?? 0;
    const remaining = Math.max(0, total - okFixes.length);

    const appliedText = okFixes.length
      ? `Applied ${okFixes.length} fix${okFixes.length === 1 ? '' : 'es'}:\n${okFixes.map((a) => `• ${a.file} (backup: ${a.backup})`).join('\n')}${failed.length ? `\n${failed.length} failed — apply those manually from the diffs.` : ''}`
      : 'No automatic code changes were applied.';

    const completeText =
      `✅ Assessment complete. ${okFixes.length} code issue${okFixes.length === 1 ? '' : 's'} auto-fixed and verified · ${remaining} finding${remaining === 1 ? '' : 's'} still need manual action ` +
      `(rotate exposed secrets, review remaining items). Re-scan to confirm the fixes dropped off, or chat with me below to tackle the rest.`;

    setMessages((prev) => [
      ...prev,
      { id: `applied-${Date.now()}`, agent: 'overseer', at, blocks: [{ kind: 'text', text: appliedText }] },
      { id: `complete-${Date.now()}`, agent: 'reporter', at, blocks: [{ kind: 'text', text: completeText }] },
    ]);
    setStatus('done');
    refresh();
  }, [activeSessionId, refresh]);

  const activeTarget = targets.find((t) => t.id === activeTargetId) || null;
  const title = activeTarget ? `Scan — ${activeTarget.name}` : 'Scan';
  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const reportPath = activeSession?.report?.path;
  const bandChatId = activeBandChatId ?? activeSession?.bandChatId ?? activeSession?.result?.bandChatId ?? null;
  const bandParticipants = activeBandParticipants.length ? activeBandParticipants : activeSession?.bandParticipants ?? [];

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TitleBar target={activeTarget?.name} live={status === 'live'} />
      <div className="flex min-h-0 flex-1">
        <TargetSidebar
          targets={targets}
          activeId={activeTargetId}
          onSelect={handleTarget}
          onNewScan={() => setPhase('welcome')}
          integrations={integrations}
        />
        {activeTargetId && (
          <SessionList
            sessions={sessions.filter((s) => s.targetId === activeTargetId)}
            activeId={activeSessionId}
            open={panelOpen}
            onSelect={handleSession}
            onNewChat={newChatOnTarget}
            onToggle={togglePanel}
            onDelete={handleDelete}
          />
        )}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {phase === 'welcome' ? (
            <WelcomeScreen onStart={pickAndScan} hasBridge={hasBridge()} panelOpen={panelOpen} onTogglePanel={togglePanel} />
          ) : (
            <>
              <RoomView
                title={title}
                messages={messages}
                streaming={status === 'live' || asking}
                approved={approved}
                onApprove={handleApprove}
                reportPath={reportPath}
                integrations={integrations}
                bandChatId={bandChatId}
                bandParticipants={bandParticipants}
                panelOpen={panelOpen}
                onTogglePanel={togglePanel}
                thinking={thinking}
              />
              <PromptBar onSend={handleAsk} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
