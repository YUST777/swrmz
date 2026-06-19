import { motion } from 'motion/react';
import { FolderGit2, PanelLeftClose, PanelLeftOpen, ShieldCheck } from 'lucide-react';

export function WelcomeScreen({
  onStart,
  hasBridge,
  panelOpen,
  onTogglePanel,
}: {
  onStart: () => void;
  hasBridge: boolean;
  panelOpen: boolean;
  onTogglePanel: () => void;
}) {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-ink">
      <button
        onClick={onTogglePanel}
        aria-label={panelOpen ? 'Collapse chats' : 'Show chats'}
        className="no-drag absolute left-3 top-3 z-20 grid size-7 place-items-center rounded-md text-text-dim transition-colors hover:bg-surface hover:text-text"
      >
        {panelOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
      </button>
      <div className="relative z-10 w-full max-w-[560px] px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <div className="mx-auto mb-5 grid size-12 place-items-center rounded-2xl border border-maroon/40 bg-maroon/15">
            <SwarmGlyph />
          </div>
          <h1 className="text-[28px] font-semibold tracking-tight text-text md:text-[34px]">
            What should the swarm hunt?
          </h1>
          <p className="mx-auto mt-2 max-w-[440px] text-[13.5px] leading-relaxed text-text-dim">
            Point SWRMZ at a local repository. The agents map the surface, scan the real source for
            secrets and vulnerabilities, and coordinate the review through Band.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut', delay: 0.08 }}
          className="mt-7 flex flex-col items-center gap-3"
        >
          <button
            onClick={onStart}
            disabled={!hasBridge}
            className="no-drag inline-flex items-center gap-2 rounded-xl border border-maroon/50 bg-maroon px-5 py-2.5 text-[13.5px] font-semibold text-text transition-colors duration-150 hover:bg-maroon-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FolderGit2 size={16} /> Pick a repository to scan
          </button>
          <div className="inline-flex items-center gap-1.5 text-[11.5px] text-text-faint">
            <ShieldCheck size={13} className="text-[#5fb87a]" />
            Read-only scan · nothing is changed without your approval
          </div>
          {!hasBridge && (
            <div className="mt-2 rounded-lg border border-[#e0813c]/40 bg-[#e0813c]/10 px-3 py-2 text-[11.5px] text-[#e0813c]">
              Desktop bridge unavailable — run the app with <span className="font-mono">npm run dev</span>.
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function SwarmGlyph() {
  return (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="16" r="3.4" fill="#c0444c" />
      <circle cx="8" cy="9" r="2" fill="#f2eaeb" />
      <circle cx="24" cy="9" r="2" fill="#f2eaeb" />
      <circle cx="8" cy="23" r="2" fill="#f2eaeb" />
      <circle cx="24" cy="23" r="2" fill="#f2eaeb" />
      <g stroke="#77262d" strokeWidth="1">
        <line x1="16" y1="16" x2="8" y2="9" />
        <line x1="16" y1="16" x2="24" y2="9" />
        <line x1="16" y1="16" x2="8" y2="23" />
        <line x1="16" y1="16" x2="24" y2="23" />
      </g>
    </svg>
  );
}
