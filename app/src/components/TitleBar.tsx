import { Minus, Square, X } from 'lucide-react';

const w = (globalThis as unknown as { swrmz?: { minimize(): void; maximize(): void; close(): void; platform: string } }).swrmz;
const isMac = w?.platform === 'darwin';

export function TitleBar({ target, live }: { target?: string | null; live?: boolean }) {
  return (
    <div className="drag relative z-30 flex h-11 shrink-0 items-center justify-between border-b border-line-soft bg-ink px-3">
      {/* leave room for mac traffic lights */}
      <div className="flex items-center gap-2" style={{ paddingLeft: isMac ? 64 : 0 }}>
        <img src="/text_logo.svg" alt="SWRMZ" className="h-5 w-auto select-none" draggable={false} />
      </div>

      <div className="drag pointer-events-none absolute left-1/2 top-0 flex h-full -translate-x-1/2 items-center gap-2 text-[12px] text-text-faint">
        {target ? (
          <>
            <span className={`inline-block size-1.5 rounded-full bg-maroon-bright ${live ? '' : 'opacity-50'}`} />
            {target} · {live ? 'scanning' : 'idle'}
          </>
        ) : (
          <span className="opacity-70">no target selected</span>
        )}
      </div>

      {!isMac && (
        <div className="no-drag flex items-center">
          <button
            onClick={() => w?.minimize()}
            className="grid size-8 place-items-center rounded-md text-text-dim transition-colors hover:bg-surface hover:text-text"
          >
            <Minus size={15} />
          </button>
          <button
            onClick={() => w?.maximize()}
            className="grid size-8 place-items-center rounded-md text-text-dim transition-colors hover:bg-surface hover:text-text"
          >
            <Square size={12} />
          </button>
          <button
            onClick={() => w?.close()}
            className="grid size-8 place-items-center rounded-md text-text-dim transition-colors hover:bg-maroon hover:text-white"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
