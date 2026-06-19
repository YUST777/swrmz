import { motion } from 'motion/react';
import { Clock, PanelLeftClose, Plus, Trash2 } from 'lucide-react';
import type { Session } from '../data/types';

const statusStyle: Record<Session['status'], { dot: string; label: string; text: string }> = {
  live: { dot: 'bg-maroon-bright', label: 'Live', text: 'text-maroon-bright' },
  awaiting: { dot: 'bg-[#e0813c]', label: 'Awaiting you', text: 'text-[#e0813c]' },
  done: { dot: 'bg-[#5fb87a]', label: 'Done', text: 'text-[#5fb87a]' },
  queued: { dot: 'bg-text-faint', label: 'Queued', text: 'text-text-faint' },
  error: { dot: 'bg-maroon-bright', label: 'Error', text: 'text-maroon-bright' },
};

function ago(createdAt: number) {
  const s = Math.floor((Date.now() - createdAt) / 1000);
  if (s < 60) return 'now';
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export function SessionList({
  sessions,
  activeId,
  open,
  onSelect,
  onNewChat,
  onToggle,
  onDelete,
}: {
  sessions: Session[];
  activeId: string | null;
  open: boolean;
  onSelect: (id: string) => void;
  onNewChat?: () => void;
  onToggle: () => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <motion.div
      initial={false}
      animate={{ width: open ? 268 : 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 38 }}
      className="shrink-0 overflow-hidden border-r border-line-soft bg-panel-2"
    >
      <motion.div
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: 0.15 }}
        className="flex h-full w-[268px] flex-col"
      >
        <div className="drag flex h-12 items-center justify-between border-b border-line-soft px-3">
          <span className="text-[12.5px] font-semibold text-text">Chats</span>
          <div className="no-drag flex items-center gap-1">
            <button
              onClick={onNewChat}
              title="New chat for this project"
              className="grid size-7 place-items-center rounded-md border border-line bg-panel text-text-dim transition-colors hover:border-maroon/60 hover:text-maroon-bright"
            >
              <Plus size={15} />
            </button>
            <button
              onClick={onToggle}
              title="Collapse panel"
              className="grid size-7 place-items-center rounded-md border border-line bg-panel text-text-dim transition-colors hover:text-text"
            >
              <PanelLeftClose size={15} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {sessions.length === 0 ? (
            <div className="px-3 py-8 text-center text-[12px] text-text-faint">No chats yet for this project.</div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {sessions.map((s) => {
                const st = statusStyle[s.status];
                const active = s.id === activeId;
                return (
                  <div
                    key={s.id}
                    onClick={() => onSelect(s.id)}
                    className={`group relative cursor-pointer rounded-xl border p-3 text-left transition-all ${
                      active
                        ? 'border-maroon/50 bg-surface'
                        : 'border-transparent bg-panel hover:border-line hover:bg-surface/60'
                    }`}
                  >
                    <span className="line-clamp-2 block pr-6 text-[12.5px] font-medium leading-snug text-text">
                      {s.title}
                    </span>
                    {onDelete && (
                      <button
                        title="Delete chat"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(s.id);
                        }}
                        className="absolute right-2 top-2.5 grid size-6 place-items-center rounded-md text-text-faint opacity-0 transition-all hover:bg-maroon/20 hover:text-maroon-bright group-hover:opacity-100"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                    <div className="mt-2 flex items-center gap-2 text-[11px]">
                      <span className={`inline-flex items-center gap-1.5 ${st.text}`}>
                        <span className={`size-1.5 rounded-full ${st.dot}`} />
                        {st.label}
                      </span>
                      {s.agents ? (
                        <>
                          <span className="text-text-faint">·</span>
                          <span className="text-text-faint">{s.agents} agents</span>
                        </>
                      ) : null}
                      <span className="ml-auto inline-flex items-center gap-1 text-text-faint">
                        <Clock size={11} />
                        {ago(s.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
