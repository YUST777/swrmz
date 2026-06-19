import { Cloud, FolderGit2, Plus, ScrollText, Search } from 'lucide-react';
import type { Target } from '../data/types';
import type { Status } from '../lib/api';

const kindIcon = {
  repo: FolderGit2,
  cloud: Cloud,
  logs: ScrollText,
};

export function TargetSidebar({
  targets,
  activeId,
  onSelect,
  onNewScan,
  integrations,
}: {
  targets: Target[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewScan?: () => void;
  integrations?: Status | null;
}) {
  return (
    <aside className="flex w-[232px] shrink-0 flex-col border-r border-line-soft bg-panel">
      <div className="p-3">
        <div className="no-drag mb-3 flex items-center gap-2 rounded-lg border border-line bg-panel-2 px-2.5 py-2 text-text-faint focus-within:border-maroon/60">
          <Search size={14} />
          <input
            placeholder="Search targets…"
            className="w-full bg-transparent text-[12.5px] text-text outline-none placeholder:text-text-faint"
          />
        </div>
        <button
          onClick={onNewScan}
          className="no-drag flex w-full items-center justify-center gap-1.5 rounded-lg border border-maroon/50 bg-maroon py-2 text-[12.5px] font-semibold text-text transition-colors duration-150 hover:bg-maroon-deep"
        >
          <Plus size={14} /> New scan
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        <div className="px-2 pb-1.5 pt-2 text-[10.5px] font-semibold uppercase tracking-wider text-text-faint">
          Targets
        </div>
        {targets.length === 0 ? (
          <div className="px-2 py-6 text-[11.5px] leading-relaxed text-text-faint">
            No targets yet. Hit <span className="text-text-dim">New scan</span> to pick a repo to analyze.
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {targets.map((t) => (
              <TargetRow key={t.id} t={t} active={t.id === activeId} onSelect={onSelect} />
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-line-soft p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-1 py-1">
          <div className="grid size-8 place-items-center rounded-full bg-maroon text-[11px] font-bold uppercase text-text">
            {(integrations?.user ?? '·').slice(0, 2)}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[12.5px] font-medium text-text">{integrations?.user ?? 'operator'}</div>
            <div className="truncate text-[11px] text-text-faint">
              {integrations?.modelReady ? 'Model ready' : 'no model'}
              {' · '}
              {integrations?.bandReady ? `Band: ${integrations.bandIdentity ?? 'connected'}` : 'local'}
            </div>
          </div>
          <span
            className={`ml-auto size-2 rounded-full ${integrations?.modelReady ? 'bg-[#5fb87a]' : 'bg-text-faint'}`}
          />
        </div>
      </div>
    </aside>
  );
}

function TargetRow({
  t,
  active,
  onSelect,
}: {
  t: Target;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  const Icon = kindIcon[t.kind];
  return (
    <button
      onClick={() => onSelect(t.id)}
      className={`no-drag group flex items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors ${
        active ? 'bg-surface' : 'hover:bg-panel-2'
      }`}
    >
      <span
        className={`grid size-7 shrink-0 place-items-center rounded-md border ${
          active ? 'border-maroon/60 bg-maroon/20 text-maroon-bright' : 'border-line bg-panel-2 text-text-dim'
        }`}
      >
        <Icon size={14} />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[12.5px] font-medium text-text">{t.name}</span>
        <span className="block truncate text-[11px] text-text-faint">{t.meta}</span>
      </span>
    </button>
  );
}
