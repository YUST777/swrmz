import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  Check,
  ChevronRight,
  ExternalLink,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Wrench,
} from 'lucide-react';
import type { Block, Finding, RoomMessage, Severity } from '../data/types';
import { AGENTS } from '../data/types';
import { Typewriter } from './Typewriter';
import { api, type Status, type ThinkEntry } from '../lib/api';

const sevStyle: Record<Severity, { ring: string; text: string; bg: string; label: string }> = {
  critical: { ring: 'border-maroon-bright/60', text: 'text-maroon-bright', bg: 'bg-maroon-bright/12', label: 'Critical' },
  high: { ring: 'border-[#e0813c]/50', text: 'text-[#e0813c]', bg: 'bg-[#e0813c]/12', label: 'High' },
  medium: { ring: 'border-[#d8b54a]/50', text: 'text-[#d8b54a]', bg: 'bg-[#d8b54a]/12', label: 'Medium' },
  low: { ring: 'border-text-faint/40', text: 'text-text-dim', bg: 'bg-text-faint/10', label: 'Low' },
};

export function RoomView({
  title,
  messages,
  streaming,
  approved,
  onApprove,
  reportPath,
  integrations,
  panelOpen,
  onTogglePanel,
  thinking = [],
}: {
  title: string;
  messages: RoomMessage[];
  streaming: boolean;
  approved: boolean;
  onApprove: () => void;
  reportPath?: string;
  integrations?: Status | null;
  panelOpen: boolean;
  onTogglePanel: () => void;
  thinking?: ThinkEntry[];
}) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-ink">
      <RoomHeader title={title} integrations={integrations} panelOpen={panelOpen} onTogglePanel={onTogglePanel} />
      <div className="relative flex-1 overflow-y-auto">
        <div className="relative mx-auto flex max-w-[760px] flex-col gap-5 px-6 py-7">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <Message
                key={m.id + i}
                m={m}
                typing={streaming && i === messages.length - 1}
                onApprove={onApprove}
                approved={approved}
                reportPath={reportPath}
              />
            ))}
          </AnimatePresence>

          {streaming && <WorkingIndicator thinking={thinking} />}
          {!streaming && messages.length === 0 && (
            <div className="py-16 text-center text-[13px] text-text-faint">No activity yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function RoomHeader({
  title,
  integrations,
  panelOpen,
  onTogglePanel,
}: {
  title: string;
  integrations?: Status | null;
  panelOpen: boolean;
  onTogglePanel: () => void;
}) {
  const modelLabel = integrations?.model ? integrations.model.split('/').pop() : 'no model';
  return (
    <div className="drag flex h-12 shrink-0 items-center gap-2 border-b border-line-soft bg-panel-2 px-3">
      <button
        onClick={onTogglePanel}
        title={panelOpen ? 'Collapse chats' : 'Show chats'}
        className="no-drag grid size-7 shrink-0 place-items-center rounded-md text-text-dim transition-colors hover:bg-surface hover:text-text"
      >
        {panelOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
      </button>
      <div className="min-w-0">
        <div className="truncate text-[13px] font-semibold text-text">{title}</div>
      </div>
      <div className="no-drag ml-auto flex items-center gap-1.5">
        {(['recon', 'analysis', 'remediation', 'guardian', 'reporter'] as const).map((id, i) => {
          const a = AGENTS[id];
          return (
            <div
              key={id}
              title={`${a.name} · ${a.role}`}
              className="grid size-7 place-items-center rounded-full border border-line text-[10px] font-bold"
              style={{ color: a.color, background: `${a.color}1a`, marginLeft: i ? -6 : 0 }}
            >
              {a.initials}
            </div>
          );
        })}
        <span
          title="Model provider"
          className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-line bg-panel px-2.5 py-1 text-[11px] text-text-dim"
        >
          <span className={`size-1.5 rounded-full ${integrations?.modelReady ? 'bg-[#5fb87a]' : 'bg-text-faint'}`} />
          {modelLabel}
        </span>
        <span
          title={integrations?.bandReady ? `Band: ${integrations.bandIdentity ?? 'connected'}` : 'Band not configured — running locally'}
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-panel px-2.5 py-1 text-[11px] text-text-dim"
        >
          <span className={`size-1.5 rounded-full ${integrations?.bandReady ? 'bg-maroon-bright' : 'bg-text-faint'}`} />
          {integrations?.bandReady ? 'Band' : 'local'}
        </span>
      </div>
    </div>
  );
}

function WorkingIndicator({ thinking }: { thinking: ThinkEntry[] }) {
  const [open, setOpen] = useState(true); // expanded while working (1Code pattern)
  const latest = thinking[thinking.length - 1];
  const hasSteps = thinking.length > 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
      <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg border border-line bg-maroon/15 text-maroon-bright">
        <Loader2 size={15} className="animate-spin" />
      </div>
      <div className="min-w-0 flex-1">
        <button
          onClick={() => hasSteps && setOpen((o) => !o)}
          className={`flex items-center gap-1.5 ${hasSteps ? 'cursor-pointer' : 'cursor-default'}`}
        >
          {hasSteps && (
            <ChevronRight
              size={14}
              className={`text-text-faint transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
            />
          )}
          <span className="text-[13px] font-medium text-text-dim">Swarm is working…</span>
          {!open && latest && (
            <span className="truncate text-[11.5px] text-text-faint">· {latest.text}</span>
          )}
        </button>

        <AnimatePresence initial={false}>
          {open && hasSteps && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="mt-2 space-y-1.5 border-l border-line-soft pl-3">
                {thinking.map((t, i) => {
                  const a = AGENTS[t.agent as keyof typeof AGENTS] ?? AGENTS.analysis;
                  const isLast = i === thinking.length - 1;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-2 text-[12px] leading-relaxed"
                    >
                      <span
                        className="mt-1.5 size-1.5 shrink-0 rounded-full"
                        style={{ background: a.color, opacity: isLast ? 1 : 0.5 }}
                      />
                      <span className="font-medium" style={{ color: a.color }}>
                        {a.name}
                      </span>
                      <span className={isLast ? 'text-text/90' : 'text-text-faint'}>{t.text}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function Message({
  m,
  onApprove,
  approved,
  typing = false,
  reportPath,
}: {
  m: RoomMessage;
  onApprove: () => void;
  approved: boolean;
  typing?: boolean;
  reportPath?: string;
}) {
  const a = AGENTS[m.agent];
  const isHuman = m.agent === 'human';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
      className="flex gap-3"
    >
      <div
        className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg border border-line text-[10px] font-bold"
        style={{ color: a.color, background: `${a.color}1a` }}
      >
        {a.initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="text-[12.5px] font-semibold text-text">{a.name}</span>
          {!isHuman && <span className="text-[11px] text-text-faint">{a.role}</span>}
          {m.to && (
            <span className="inline-flex items-center gap-1 rounded-full border border-line bg-panel-2 px-2 py-[2px] text-[10.5px] text-text-dim">
              <ArrowRight size={11} /> {AGENTS[m.to].name}
            </span>
          )}
          <span className="ml-auto text-[11px] text-text-faint">{m.at}</span>
        </div>
        <div className="flex flex-col gap-2.5">
          {m.blocks.map((b, i) => (
            <BlockView key={i} b={b} onApprove={onApprove} approved={approved} typing={typing} reportPath={reportPath} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function BlockView({
  b,
  onApprove,
  approved,
  typing = false,
  reportPath,
}: {
  b: Block;
  onApprove: () => void;
  approved: boolean;
  typing?: boolean;
  reportPath?: string;
}) {
  switch (b.kind) {
    case 'text':
      return (
        <p className="text-[13.5px] leading-relaxed text-text/90">
          <Typewriter text={b.text} play={typing} speed={12} />
        </p>
      );

    case 'tool':
      return (
        <div className="overflow-hidden rounded-xl border border-line bg-panel">
          <div className="flex items-center gap-2 border-b border-line-soft bg-panel-2 px-3 py-2">
            <Terminal size={13} className="text-maroon-bright" />
            <span className="font-mono text-[11.5px] text-text">{b.tool}</span>
            <span className="truncate font-mono text-[11px] text-text-faint">{b.args}</span>
            <span className="ml-auto inline-flex items-center gap-1 text-[10.5px] text-[#5fb87a]">
              <Check size={11} /> done
            </span>
          </div>
          <div className="space-y-1 px-3 py-2.5 font-mono text-[11.5px] leading-relaxed text-text-dim">
            {b.lines.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
        </div>
      );

    case 'findings':
      return (
        <div className="flex flex-col gap-2">
          {b.items.map((f) => (
            <FindingCard key={f.id} f={f} />
          ))}
        </div>
      );

    case 'suggestion':
      return (
        <div className="overflow-hidden rounded-xl border border-[#4ca3c0]/40 bg-[#4ca3c0]/8">
          <div className="flex items-center gap-2 border-b border-line-soft bg-panel-2 px-3 py-2">
            <Wrench size={13} className="text-[#4ca3c0]" />
            <span className="text-[12px] font-semibold text-text">Suggested fix</span>
            <span className="ml-auto font-mono text-[11px] text-text-faint">
              {b.file}{b.line ? `:${b.line}` : ''}
            </span>
          </div>
          <p className="px-3 py-2.5 text-[12.5px] leading-relaxed text-text/90">{b.fix}</p>
        </div>
      );

    case 'patch':
      return (
        <div className="overflow-hidden rounded-xl border border-[#4ca3c0]/40 bg-panel">
          <div className="flex items-center gap-2 border-b border-line-soft bg-panel-2 px-3 py-2">
            <Wrench size={13} className="text-[#4ca3c0]" />
            <span className="text-[12px] font-semibold text-text">Proposed patch</span>
            <span className="ml-auto font-mono text-[11px] text-text-faint">
              {b.file} · +{b.added.length} −{b.removed.length}
            </span>
          </div>
          <div className="overflow-x-auto font-mono text-[11.5px] leading-relaxed">
            {b.removed.map((l, i) => (
              <div key={`r${i}`} className="whitespace-pre bg-maroon-bright/10 px-3 text-maroon-bright">
                <span className="mr-2 select-none opacity-60">-</span>
                {l || ' '}
              </div>
            ))}
            {b.added.map((l, i) => (
              <div key={`a${i}`} className="whitespace-pre bg-[#5fb87a]/10 px-3 text-[#7ed79a]">
                <span className="mr-2 select-none opacity-60">+</span>
                {l || ' '}
              </div>
            ))}
          </div>
        </div>
      );

    case 'gate':
      return (
        <div className="rounded-xl border border-[#e0813c]/40 bg-[#e0813c]/8 p-3.5">
          <div className="mb-2 flex items-center gap-2">
            <ShieldAlert size={15} className="text-[#e0813c]" />
            <span className="text-[12.5px] font-semibold text-text">Human approval required</span>
          </div>
          <p className="mb-1 text-[13px] text-text">{b.label}</p>
          <p className="mb-3 text-[11.5px] text-text-faint">{b.risk}</p>
          {approved ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#5fb87a]/40 bg-[#5fb87a]/12 px-3 py-1.5 text-[12px] font-medium text-[#7ed79a]">
              <ShieldCheck size={14} /> Approved by you
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onApprove}
                className="no-drag inline-flex items-center gap-1.5 rounded-lg border border-maroon/50 bg-maroon px-3.5 py-1.5 text-[12px] font-semibold text-text transition-colors duration-150 hover:bg-maroon-deep"
              >
                <Check size={14} /> Approve &amp; write report
              </button>
              <button className="no-drag rounded-lg border border-line bg-panel px-3.5 py-1.5 text-[12px] font-medium text-text-dim transition-colors hover:text-text">
                Reject
              </button>
            </div>
          )}
        </div>
      );

    case 'report':
      return (
        <div className="overflow-hidden rounded-xl border border-line bg-panel">
          <div className="grid grid-cols-2 gap-px bg-line-soft">
            {b.rows.map((r) => (
              <div key={r.label} className="bg-panel px-3.5 py-2.5">
                <div className="text-[10.5px] uppercase tracking-wide text-text-faint">{r.label}</div>
                <div className="mt-0.5 text-[13px] font-medium text-text">{r.value}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 border-t border-line-soft bg-panel-2 px-3.5 py-2">
            <ShieldCheck size={13} className="text-[#5fb87a]" />
            <span className="truncate font-mono text-[11px] text-[#7ed79a]">
              sha256:{b.hash.slice(0, 12)}… · audit trail sealed
            </span>
            {reportPath && (
              <button
                onClick={() => api().revealReport(reportPath)}
                className="no-drag ml-auto inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-[10.5px] text-text-dim transition-colors hover:text-text"
              >
                <ExternalLink size={11} /> Reveal report
              </button>
            )}
          </div>
        </div>
      );
  }
}

function FindingCard({ f }: { f: Finding }) {
  const s = sevStyle[f.severity];
  return (
    <div className={`rounded-xl border ${s.ring} bg-panel p-3`}>
      <div className="flex items-center gap-2">
        <span className={`rounded-md ${s.bg} px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${s.text}`}>
          {s.label}
        </span>
        <span className="rounded-md border border-line bg-panel-2 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-text-faint">
          {f.kind}
        </span>
        <span className="ml-auto truncate font-mono text-[10.5px] text-text-faint">
          {f.file}{f.line ? `:${f.line}` : ''}
        </span>
      </div>
      <div className="mt-2 text-[13px] font-medium text-text">{f.title}</div>
      <div className="mt-1 break-words text-[12px] leading-relaxed text-text-dim">{f.detail}</div>
      <div className="mt-1.5 text-[11.5px] leading-relaxed text-[#4ca3c0]">Fix · {f.fix}</div>
    </div>
  );
}
