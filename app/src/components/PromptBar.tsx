import { useEffect, useRef, useState } from 'react';
import { AtSign, ChevronDown, Infinity as InfinityIcon, Paperclip, SendHorizontal, Slash } from 'lucide-react';
import { MODELS } from '../data/types';

export function PromptBar({
  variant = 'bar',
  autoFocus = false,
  onSend,
}: {
  variant?: 'bar' | 'center';
  autoFocus?: boolean;
  onSend?: (text: string) => void;
}) {
  const [value, setValue] = useState('');
  const [model, setModel] = useState(MODELS[0]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  // 1Code auto-focuses the editor ~150ms after mount.
  useEffect(() => {
    if (!autoFocus) return;
    const id = setTimeout(() => ref.current?.focus(), 150);
    return () => clearTimeout(id);
  }, [autoFocus]);

  const send = () => {
    const v = value.trim() || 'Scan github.com/acme/api for exploitable vulnerabilities and propose fixes.';
    onSend?.(v);
    setValue('');
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const card = (
    <div
      className={`rounded-2xl border bg-panel-2 transition-colors duration-150 ${
        focused ? 'border-maroon/70' : 'border-maroon/40'
      }`}
    >
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKey}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        rows={variant === 'center' ? 3 : 2}
        placeholder="Scan a target, ask the swarm, / for commands…"
        className="no-drag w-full resize-none bg-transparent px-4 pt-3.5 text-[13.5px] leading-relaxed text-text outline-none placeholder:text-text-faint"
      />
      <div className="flex items-center gap-2 px-3 pb-3 pt-1">
        <button className="no-drag inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel px-2.5 py-1.5 text-[12px] font-medium text-text-dim transition-colors duration-150 hover:text-text">
          <InfinityIcon size={14} /> Swarm
          <ChevronDown size={13} className="opacity-60" />
        </button>

        <div className="no-drag relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel px-2.5 py-1.5 text-[12px] font-medium text-text-dim transition-colors duration-150 hover:text-text"
          >
            <span className="size-1.5 rounded-full bg-maroon-bright" />
            {model}
            <ChevronDown size={13} className="opacity-60" />
          </button>
          {open && (
            <div className="absolute bottom-full left-0 mb-2 w-60 overflow-hidden rounded-xl border border-line bg-surface p-1">
              {MODELS.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setModel(m);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12.5px] transition-colors hover:bg-panel-2 ${
                    m === model ? 'text-maroon-bright' : 'text-text-dim'
                  }`}
                >
                  <span className="size-1.5 rounded-full bg-current opacity-70" />
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <IconBtn>
            <AtSign size={15} />
          </IconBtn>
          <IconBtn>
            <Slash size={15} />
          </IconBtn>
          <IconBtn>
            <Paperclip size={15} />
          </IconBtn>
          <button
            onClick={send}
            className="no-drag ml-1 grid size-9 place-items-center rounded-xl bg-maroon text-text transition-colors duration-150 hover:bg-maroon-deep"
          >
            <SendHorizontal size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  if (variant === 'center') {
    return <div className="w-full">{card}</div>;
  }

  return (
    <div className="shrink-0 px-6 pb-5 pt-1">
      <div className="mx-auto max-w-[760px]">
        {card}
        <div className="mt-2 text-center text-[10.5px] text-text-faint">
          Real scan · Featherless model · agents coordinate via Band
        </div>
      </div>
    </div>
  );
}

function IconBtn({ children }: { children: React.ReactNode }) {
  return (
    <button className="no-drag grid size-9 place-items-center rounded-xl text-text-faint transition-colors duration-150 hover:bg-panel hover:text-text">
      {children}
    </button>
  );
}
