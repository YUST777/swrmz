import { motion, useReducedMotion } from 'motion/react'

import {
  AccessVisual,
  GateVisual,
  ProofVisual,
  RadarVisual,
  ReviewVisual,
  SwarmVisual,
} from '@/components/bento-visuals'
import { cn } from '@/lib/utils'

/**
 * The feature grid under the hero.
 *
 * Six cards, each one a claim about what the swarm actually does, with a
 * looping illustration doing the explaining. The spans are deliberately
 * uneven (7/5, 5/7, 6/6) — an even 2×2 reads as a spec sheet, and the
 * wider card in each row is the one carrying the heavier idea.
 *
 * Titles are kept to two lines at the narrowest card width, and the type
 * block reserves a fixed height, so every visual in a row starts on the
 * same baseline instead of drifting with the copy.
 */

const CARDS = [
  {
    span: 'md:col-span-7',
    title: 'One swarm, one objective',
    body: 'Dozens of agents working toward one goal instead of a pile of separate tools that never talk to each other.',
    visual: <SwarmVisual />,
  },
  {
    span: 'md:col-span-5',
    title: 'Defense Mode never sleeps',
    body: 'When something moves at 3am it does not page you — it spins up an agent and defends the site.',
    visual: <RadarVisual />,
  },
  {
    span: 'md:col-span-5',
    title: 'Your call on anything harmful',
    body: 'Safe actions run autonomously. Destructive ones stop at the barrier until you clear them.',
    visual: <GateVisual />,
  },
  {
    span: 'md:col-span-7',
    title: 'Proof, not another alarm',
    body: 'Everyone else hands you a list of maybes. Swrmz breaks in for real, shows you what it reached, and tells you exactly how it got there.',
    visual: <ProofVisual />,
  },
  {
    span: 'md:col-span-6',
    title: 'Your whole team, one reviewer',
    body: 'Point it at everything your team is shipping and it reads every file, looking for the holes someone could get in through.',
    visual: <ReviewVisual />,
  },
  {
    span: 'md:col-span-6',
    title: 'No install, no API keys',
    body: 'Open swarms.tech and it is running. Nothing to download, nothing to set up, no keys to hand over.',
    visual: <AccessVisual />,
  },
]

function BentoCard({
  index,
  span,
  title,
  body,
  children,
}: {
  index: number
  span: string
  title: string
  body: string
  children: React.ReactNode
}) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.article
      initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: reduceMotion ? 0.01 : 0.65,
        delay: reduceMotion ? 0 : (index % 2) * 0.09,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-[22px] border border-white/[0.07] bg-[linear-gradient(180deg,#100c0d,#080607)] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] transition-colors duration-500 hover:border-blood-300/35',
        span,
      )}
    >
      {/* the ember under the artwork — same lit-from-below logic as the hero */}
      <div className="pointer-events-none absolute -bottom-28 left-1/2 h-72 w-[78%] -translate-x-1/2 rounded-[100%] bg-blood-300/22 blur-[70px]" />
      <div className="pointer-events-none absolute -bottom-16 left-1/2 h-40 w-[46%] -translate-x-1/2 rounded-[100%] bg-blood-200/18 blur-[50px]" />

      {/* faint plotting grid, faded out before it reaches the type */}
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.028)_1px,transparent_1px)] [background-size:30px_30px] [mask-image:radial-gradient(120%_90%_at_50%_100%,#000_10%,transparent_72%)]" />

      {/* No reserved height here. A min-height on the h3 pushed the copy a
          whole line away from any title that ran to one line, and moving it
          to the block just relocated the hole underneath. The type is its
          natural size; the visual below absorbs whatever the row stretches
          to, and lays itself out from the height it ends up with. */}
      <div className="relative z-10 px-6 pt-6 sm:px-7 sm:pt-7">
        {/* the same top-lit ramp the section heading uses, cooled slightly so
            the titles read as lit glass rather than flat white */}
        <h3 className="max-w-[24ch] bg-[linear-gradient(160deg,#ffffff_0%,#e6ebf3_42%,#98a1b2_100%)] bg-clip-text text-[clamp(1.12rem,1.35vw,1.32rem)] leading-[1.3] font-light tracking-[-0.01em] text-transparent">
          {title}
        </h3>
        <p className="mt-2 max-w-[46ch] text-[12.5px] leading-[1.6] text-neutral-500">{body}</p>
      </div>

      {/* The artwork's box. It measures itself and draws at 1:1, so this
          height is the only thing setting the visual's scale — the floor
          steps up with the breakpoint and flex-1 absorbs any row stretch. */}
      <div className="relative z-10 mt-4 min-h-[178px] flex-1 overflow-hidden sm:min-h-[196px] lg:min-h-[224px]">
        {children}
      </div>
    </motion.article>
  )
}

export function FeatureBento() {
  const reduceMotion = useReducedMotion()

  return (
    // Transparent by design. The hero's decor is unclipped and its low bloom
    // carries down past the boundary; painting bg-ink here would cut that light
    // off at a hard line and put the seam straight back.
    // asymmetric padding: the top is tight because the hero's app shot already
    // sits above it, the bottom keeps the full breathing room for what follows
    <section id="features" className="relative isolate scroll-mt-20 pt-10 pb-24 sm:pt-14 sm:pb-32">
      {/* No section-level bloom any more. The one that lived here was anchored
          at top-[380px] and was spent long before the section's bottom edge,
          which left the run-up to the next section flat black. The page mesh
          lights this stretch continuously instead. */}
      <div className="relative mx-auto max-w-[1180px] px-6">
        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <h2 className="mx-auto max-w-[16ch] bg-[linear-gradient(100deg,#5f5f5f_0%,#ffffff_52%,#c9c9c9_100%)] bg-clip-text text-[clamp(1.9rem,4vw,3.1rem)] leading-[1.1] pb-[0.14em] font-light tracking-[-0.02em] text-transparent">
            Relentless &amp; Accountable
          </h2>

          <p className="mx-auto mt-5 max-w-[560px] text-[14px] leading-[1.65] text-neutral-500">
            Swrmz runs a coordinated swarm of security agents across your stack — hunting real
            exploits, defending unprompted, and stopping at your approval every time it matters.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-12">
          {CARDS.map((card, i) => (
            <BentoCard
              key={card.title}
              index={i}
              span={card.span}
              title={card.title}
              body={card.body}
            >
              {card.visual}
            </BentoCard>
          ))}
        </div>
      </div>
    </section>
  )
}
