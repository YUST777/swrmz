import { motion, useReducedMotion } from 'motion/react'
import { ArrowRight, ChevronRight, Play } from 'lucide-react'

import { AppPreview } from '@/components/app-preview'
import { BackgroundDecor } from '@/components/background-decor'
import { SiteHeader } from '@/components/site-header'

/**
 * The release flag. A solid capsule does the shouting, the rest of the pill
 * stays quiet — so the eye reads "new", then the version, then moves on to
 * the headline instead of stopping here.
 */
function WhatsNewBadge() {
  return (
    <a
      href="#changelog"
      className="group inline-flex max-w-full items-center rounded-full border border-white/[0.09] bg-[#0c0a0b]/90 py-1 pr-2 pl-1 backdrop-blur-sm transition-colors hover:border-blood-100/35"
    >
      <span className="shrink-0 rounded-full bg-[linear-gradient(180deg,#ff5c5c,#d81318)] px-3 py-1.5 text-[11.5px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] sm:px-3.5 sm:text-[12.5px]">
        Whats New
      </span>

      <span className="flex min-w-0 items-center gap-1 pr-1 pl-2.5 text-[12px] text-neutral-300 sm:pl-3 sm:text-[13px]">
        <span className="truncate">Ease Update v0.1</span>
        <ChevronRight
          className="h-3.5 w-3.5 text-neutral-500 transition-transform duration-300 group-hover:translate-x-0.5"
          strokeWidth={2}
        />
      </span>
    </a>
  )
}

/**
 * The action pair. Only the first one carries the bloom — two lit buttons
 * side by side would cancel each other out and neither would read as the
 * thing to press.
 */
function HeroActions() {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
      <div className="relative inline-flex w-full sm:w-auto">
        {/* The bloom hugs the button. It used to run to -inset-x-8/-inset-y-5
            with a 32px blur, which made the primary read as a visibly bigger
            control than its neighbour even though both boxes are 152×47 — the
            glow was doing the sizing, not the geometry. */}
        <div className="pointer-events-none absolute -inset-x-1 -inset-y-1 rounded-full bg-blood-200/20 blur-[12px]" />
        <div className="pointer-events-none absolute -inset-x-2 -inset-y-1.5 rounded-[100%] bg-blood-300/10 blur-[20px]" />

        <a
          href="#read-more"
          className="group relative inline-flex w-full min-w-[152px] items-center justify-center gap-2 rounded-full border border-blood-100/45 sm:w-auto bg-[linear-gradient(180deg,#211012,#0c0708)] px-6 py-3 text-[14px] font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_0_14px_rgba(255,43,43,0.28)] transition-all duration-300 hover:border-blood-100/70 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_0_22px_rgba(255,43,43,0.45)]"
        >
          Read more
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            strokeWidth={1.8}
          />
        </a>
      </div>

      {/* Same geometry as the primary — min-w, px, py and gap all match, so the
          pair reads as one control with two states rather than two buttons at
          different weights. Only the surface differs. */}
      <a
        href="#trailer"
        className="group inline-flex w-full min-w-[152px] items-center justify-center gap-2 rounded-full border border-white/[0.14] sm:w-auto bg-[linear-gradient(180deg,#26232a,#16141a)] px-6 py-3 text-[14px] font-medium text-neutral-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] transition-colors duration-300 hover:border-white/25 hover:bg-[linear-gradient(180deg,#302c36,#1e1b23)] hover:text-white"
      >
        <Play className="h-3 w-3 fill-current" strokeWidth={0} />
        See Trailer
      </a>
    </div>
  )
}

export function Hero() {
  const reduceMotion = useReducedMotion()

  // Readers who ask for less motion still get the fade, just no travel or stagger.
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: reduceMotion ? 0 : 14 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reduceMotion ? 0.01 : 0.7,
      delay: reduceMotion ? 0 : delay,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  })

  // No overflow-hidden and no background of its own: the decor has to be able
  // to cross into the section below, and <main> owns both the clip and the ink.
  return (
    <section className="relative isolate">
      <BackgroundDecor />

      <div className="relative z-20">
        <SiteHeader />

        <div className="mx-auto max-w-[1400px] px-5 pt-10 text-center sm:px-6 sm:pt-[88px]">
          <motion.div {...rise(0)}>
            <WhatsNewBadge />
          </motion.div>

          <motion.h1
            {...rise(0.08)}
            className="mt-5 text-[clamp(1.6rem,7vw,2.85rem)] leading-[1.14] font-semibold tracking-[-0.015em]"
          >
            <span className="block text-[#8d8d8d]">Stay in control</span>
            <span className="block text-white">Your security on autopilot</span>
          </motion.h1>

          <motion.p
            {...rise(0.16)}
            className="mx-auto mt-5 max-w-[620px] text-[13.5px] leading-[1.6] text-neutral-400 sm:text-[14px] sm:leading-[1.65]"
          >
            A swarm of AI agents that scan your code, hunt real vulnerabilities, and defend your
            stack while your team sleeps — with every risky action cleared by you first.
          </motion.p>

          <motion.div {...rise(0.24)} className="mt-10">
            <HeroActions />
          </motion.div>

          <motion.div {...rise(0.34)} className="mt-12 pb-8 sm:mt-24 sm:pb-14">
            <AppPreview />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
