import {
  AtSign,
  ChevronDown,
  FolderGit2,
  Infinity as InfinityIcon,
  Paperclip,
  Search,
  SendHorizontal,
  Server,
} from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * A pared-back rendering of the Swrmz desktop app for the hero.
 *
 * This is a still, not a working console: it keeps the shapes a real user would
 * recognise — target rail, band room header, agent transcript, composer — and
 * drops everything else. Target count, log verbosity and toolbar affordances are
 * all trimmed so the type stays readable at hero scale.
 *
 * Sizing note: an app shot in a hero has to survive being looked at for about a
 * second from across a bright page. Everything here is deliberately a size or two
 * larger than the real app's density would suggest — a faithful 1:1 capture reads
 * as an unreadable grey rectangle at this scale.
 */

const TARGETS = [
  { name: 'My store', meta: 'shop.example.com', icon: FolderGit2, active: true },
  { name: 'Live watch', meta: 'on since 9:04', icon: Server },
  { name: 'Landing page', meta: 'swrmz.tech', icon: FolderGit2 },
  { name: 'Admin panel', meta: 'admin.example.com', icon: FolderGit2 },
]

const SCAN_LOG = [
  { ok: true, text: 'read every page and file' },
  { ok: false, text: 'checking what you installed' },
  { ok: true, text: 'found 6 things worth a look' },
]

function Pill({ children, dot }: { children: React.ReactNode; dot?: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/[0.08] bg-[#131011] px-2.5 py-1 text-[11px] text-neutral-400 sm:px-3 sm:py-1.5 sm:text-[12px]">
      {dot && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dot }} />}
      {children}
    </span>
  )
}

export function AppPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[1300px] px-1 text-left sm:px-4">
      {/* the light bar riding the top edge of the card */}
      <div className="pointer-events-none absolute inset-x-0 -top-2 flex justify-center">
        <div className="h-[70px] w-[54%] rounded-[100%] bg-blood-200/35 blur-[55px]" />
        <div className="absolute h-[16px] w-[72%] rounded-full bg-blood-100/60 blur-[20px]" />
        {/* crisp core sits last so the blooms never wash it out */}
        <div className="absolute h-[2px] w-[86%] rounded-full bg-[linear-gradient(90deg,transparent,#ff3b3b_14%,#fff5f5_50%,#ff3b3b_86%,transparent)]" />
      </div>

      {/* the crimson hairline round the card is what ties it to the frame */}
      <div className="relative overflow-hidden rounded-[22px] border border-blood-300/35 bg-[#0a0809] shadow-[0_-1px_70px_-10px_rgba(255,59,59,0.45),0_0_0_1px_rgba(255,59,59,0.06),0_40px_120px_-30px_rgba(0,0,0,0.9)]">
        {/* ── title bar ───────────────────────────────────────────── */}
        <div className="flex h-9 items-center justify-between border-b border-white/[0.06] px-3 sm:h-11 sm:px-4">
          <span className="text-[9px] font-semibold tracking-[0.2em] text-neutral-500 sm:text-[10.5px] sm:tracking-[0.24em]">
            SWRMZ
          </span>

          <span className="flex items-center gap-2">
            {['#2a2626', '#2a2626', '#3a2022'].map((c, i) => (
              <span key={i} className="h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5" style={{ backgroundColor: c }} />
            ))}
          </span>
        </div>

        <div className="flex">
          {/* ── target rail ───────────────────────────────────────── */}
          <aside className="hidden w-[228px] shrink-0 flex-col border-r border-white/[0.06] p-3.5 md:flex">
            <div className="flex h-[36px] items-center gap-2.5 rounded-lg border border-white/[0.07] bg-[#131011] px-3">
              <Search className="h-3.5 w-3.5 text-neutral-600" strokeWidth={1.8} />
              <span className="text-[12.5px] text-neutral-600">Search targets…</span>
            </div>

            <p className="mt-5 mb-2 px-1 text-[10px] font-semibold tracking-[0.2em] text-neutral-600">
              TARGETS
            </p>

            <ul className="space-y-1">
              {TARGETS.map(({ name, meta, icon: Icon, active }) => (
                <li
                  key={name + meta}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-2 py-2',
                    active && 'bg-white/[0.05]',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border',
                      active
                        ? 'border-blood-100/25 bg-blood-400/25 text-blood-50'
                        : 'border-white/[0.07] bg-white/[0.03] text-neutral-500',
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.7} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        'block truncate text-[13px]',
                        active ? 'text-white' : 'text-neutral-300',
                      )}
                    >
                      {name}
                    </span>
                    <span className="block truncate font-mono text-[11px] text-neutral-600">
                      {meta}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </aside>

          {/* ── band room ─────────────────────────────────────────────
              The min-height is what sets the card's overall height: the
              transcript below is flex-1, so the slack lands there and the
              composer stays pinned to the bottom edge. */}
          <div className="flex min-w-0 flex-1 flex-col md:min-h-[565px]">
            {/* room header — just the label now, kept deliberately quiet */}
            <div className="border-b border-white/[0.06] px-3.5 py-2 sm:px-5 sm:py-2.5">
              <h3 className="truncate text-[10.5px] font-medium text-neutral-400 sm:text-[11.5px]">
                Checking — My store
              </h3>
            </div>

            {/* transcript */}
            <div className="min-w-0 flex-1 space-y-4 px-3.5 py-4 sm:space-y-5 sm:px-5 sm:py-5">
              {/* operator turn */}
              <div className="flex gap-2.5 sm:gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/[0.06] text-[9px] font-semibold text-neutral-300 sm:h-7 sm:w-7 sm:text-[9.5px]">
                  YO
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-[12px] sm:gap-2.5 sm:text-[13px]">
                    <span className="font-semibold text-white">You</span>
                    <span className="rounded-md border border-white/[0.08] px-1.5 py-0.5 text-[10px] text-neutral-400 sm:px-2 sm:text-[11px]">
                      → Analysis
                    </span>
                  </p>
                  <p className="mt-1.5 truncate font-mono text-[11.5px] text-neutral-400 sm:text-[12.5px]">
                    check my store for holes
                  </p>
                </div>
              </div>

              {/* analyst turn */}
              <div className="flex gap-2.5 sm:gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#7c4a12] text-[9px] font-semibold text-white/90 sm:h-7 sm:w-7 sm:text-[9.5px]">
                  AN
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-[12px] sm:gap-2.5 sm:text-[13px]">
                    <span className="font-semibold text-white">Analysis</span>
                    <span className="hidden text-[12px] text-neutral-500 sm:inline">
                      Looking for holes
                    </span>
                    <span className="rounded-md border border-white/[0.08] px-1.5 py-0.5 text-[10px] text-neutral-400 sm:px-2 sm:text-[11px]">
                      → Fix it
                    </span>
                  </p>

                  {/* tool call */}
                  <div className="mt-2.5 overflow-hidden rounded-lg border border-white/[0.07] bg-[#0d0b0c]">
                    <div className="flex items-center gap-2 border-b border-white/[0.05] px-2.5 py-1.5 sm:gap-2.5 sm:px-3 sm:py-2">
                      <span className="font-mono text-[12px] text-blood-50">{'>_'}</span>
                      <span className="truncate font-mono text-[11.5px] text-neutral-300 sm:text-[12.5px]">
                        pages · code · logins
                      </span>
                      <span className="ml-auto shrink-0 font-mono text-[11px] text-emerald-400 sm:text-[12px]">
                        ✓ done
                      </span>
                    </div>
                    <ul className="space-y-1 px-2.5 py-2 sm:space-y-1.5 sm:px-3 sm:py-2.5">
                      {SCAN_LOG.map(({ ok, text }) => (
                        <li key={text} className="flex items-start gap-1.5 font-mono text-[11px] sm:gap-2 sm:text-[12px]">
                          <span className={ok ? 'text-emerald-400' : 'text-neutral-600'}>
                            {ok ? '✓' : '·'}
                          </span>
                          <span className="truncate text-neutral-500">{text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* composer */}
            <div className="px-3.5 pb-4 sm:px-5 sm:pb-5">
              <div className="rounded-xl border border-blood-400/30 bg-[#100c0d] p-2.5 sm:p-3">
                <p className="truncate px-1 pt-1 pb-3 text-[12px] text-neutral-600 sm:pb-4 sm:text-[13.5px]">
                  Ask the swarm anything…
                </p>
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <Pill>
                    <InfinityIcon className="h-3.5 w-3.5" strokeWidth={1.8} />
                    Swarm
                    <ChevronDown className="h-3 w-3" strokeWidth={2} />
                  </Pill>
                  <span className="hidden sm:inline">
                    <Pill dot="#ff3b3b">
                      Swrmz
                      <ChevronDown className="h-3 w-3" strokeWidth={2} />
                    </Pill>
                  </span>

                  <span className="ml-auto flex items-center gap-3 text-neutral-600">
                    <AtSign className="hidden h-4 w-4 sm:block" strokeWidth={1.8} />
                    <Paperclip className="hidden h-4 w-4 sm:block" strokeWidth={1.8} />
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[linear-gradient(180deg,#8f1116,#5c0b0f)] text-white shadow-[0_0_16px_rgba(255,43,43,0.35)] sm:h-9 sm:w-9">
                      <SendHorizontal className="h-4 w-4" strokeWidth={1.9} />
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── the dissolve ──────────────────────────────────────────────────
          The card's bottom edge used to stop dead — a lit rounded rectangle
          against the page, with a visible border running along the bottom.
          This fades the lower fifth into the page ink so the shot reads as
          something the page is looking into rather than a screenshot pasted
          on top of it.

          It sits OUTSIDE the card, over the whole wrapper: inside, the card's
          own overflow-hidden would clip it and its rounded corners would show
          through the fade. `from-60%` keeps the entire UI legible and only
          takes the last stretch. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,rgba(3,3,3,0.72)_82%,#030303_100%)]"
      />
    </div>
  )
}
