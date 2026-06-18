import { Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type EyebrowProps = {
  children: string;
  Icon?: LucideIcon;
};

export function Eyebrow({ children, Icon = Sparkles }: EyebrowProps) {
  return (
    <span className="inline-flex min-h-7 items-center gap-2 rounded-[6px] border border-[#412c30]/70 bg-[#1d1518]/80 px-3 font-mono text-[0.66rem] font-[760] uppercase leading-none text-[#d98a90] shadow-[0_10px_26px_rgba(4,70,58,0.06)]">
      <Icon size={13} strokeWidth={2.4} aria-hidden="true" />
      {children}
    </span>
  );
}
