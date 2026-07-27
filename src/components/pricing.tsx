import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight, Check } from 'lucide-react'

import { cn } from '@/lib/utils'

type Plan = {
  name: string
  price: string
  priceLabel?: string
  description: string
  includedLabel: string
  features: string[]
  cta: string
  featured?: boolean
}

const PLANS: Plan[] = [
  {
    name: 'Founder',
    price: '0',
    priceLabel: 'during beta',
    description: 'A clear security baseline for the product you are still shaping.',
    includedLabel: 'Founder access includes',
    features: [
      'One production workspace',
      'On-demand repository review',
      'Exploit evidence with every finding',
      'Guided remediation notes',
      'Email incident summaries',
    ],
    cta: 'Join founder beta',
  },
  {
    name: 'Swarm',
    price: '99',
    description: 'Continuous coverage for teams shipping changes every week.',
    includedLabel: 'Everything in Founder, plus',
    features: [
      'Continuous Defense Mode',
      'Shared agent objective across repos',
      'Approval gates for risky actions',
      'Telegram and email escalation',
      'Patch plans ready for review',
    ],
    cta: 'Start with Swarm',
    featured: true,
  },
  {
    name: 'Command',
    price: 'Custom',
    description: 'Controls, auditability, and deployment boundaries that match your team.',
    includedLabel: 'Everything in Swarm, plus',
    features: [
      'Scoped policies and role-based approval',
      'SSO and complete audit trails',
      'Private region or self-hosted option',
      'Custom response playbooks',
      'Dedicated security partner',
    ],
    cta: 'Talk to us',
  },
]

function Price({ plan }: { plan: Plan }) {
  return (
    <div className="mt-5 flex min-h-[58px] items-end gap-1">
      <span className="pb-1 text-[22px] leading-none font-light text-white/75">$</span>
      <span
        aria-hidden
        className="pointer-events-none select-none text-[3.1rem] leading-none font-light tracking-[-0.06em] text-white/90 blur-[8px]"
      >
        {plan.price === 'Custom' ? '00' : plan.price}
      </span>
      <span className="sr-only">Price not announced yet</span>
      <span className="pb-1 font-mono text-[10px] tracking-[0.04em] text-white/50">/ month</span>
    </div>
  )
}

function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.article
      initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      // amount was 0.25, and on the mobile rail that was a bug: the two
      // neighbouring cards only peek by ~50px of their 265px width — 19%,
      // under the threshold — so they never crossed it and stayed at opacity
      // 0. The rail looked empty on both sides until you scrolled a card in
      // far enough to trigger its own reveal. Any sliver on screen now counts.
      viewport={{ once: true, amount: 0.02 }}
      transition={{ delay: reduceMotion ? 0 : index * 0.08, duration: reduceMotion ? 0.01 : 0.55 }}
      className={cn(
        'relative flex h-full min-h-[470px] w-full flex-col overflow-hidden rounded-[18px] border px-5 pt-5 pb-5 sm:min-h-[510px] sm:px-7 sm:pt-7',
        plan.featured
          ? 'border-blood-100/65 bg-[linear-gradient(180deg,#2d0c0f_0%,#551015_46%,#8f171d_100%)] shadow-[0_22px_70px_-25px_rgba(225,20,20,0.72),inset_0_1px_0_rgba(255,255,255,0.18)]'
          : 'border-white/[0.1] bg-[linear-gradient(145deg,rgba(31,31,35,0.93),rgba(10,10,11,0.97)_58%)] shadow-[0_24px_55px_-35px_rgba(0,0,0,0.95)]',
      )}
    >
      {plan.featured && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(rgba(255,255,255,0.55)_0.75px,transparent_0.75px)] [background-size:5px_5px] [mask-image:linear-gradient(to_bottom,#000,transparent_52%)]"
          />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-[radial-gradient(ellipse_at_center_bottom,rgba(255,72,72,0.5),transparent_68%)]" />
        </>
      )}

      <div className="relative">
        <div className="flex items-center gap-4">
          <h3 className="text-[15px] font-medium tracking-[-0.02em] text-white">{plan.name}</h3>
        </div>

        <Price plan={plan} />
        {plan.priceLabel && <p className="mt-1 h-4 text-[10px] text-white/45">{plan.priceLabel}</p>}
        <p className="mt-4 max-w-[30ch] text-[11.5px] leading-[1.6] text-white/65">{plan.description}</p>

        <a
          href="mailto:hello@swarms.tech"
          className={cn(
            'mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-md border text-[11px] font-medium transition-colors',
            plan.featured
              ? 'border-white/80 bg-white text-[#260709] shadow-[0_8px_25px_rgba(53,4,6,0.45)] hover:bg-white/90'
              : 'border-white/[0.14] bg-white/[0.055] text-white hover:border-white/30 hover:bg-white/[0.1]',
          )}
        >
          {plan.cta}
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.8} />
        </a>
      </div>

      <div className="relative mt-7 h-px bg-white/[0.1]" />

      <div className="relative mt-6 flex-1">
        <p className="font-mono text-[9px] font-medium tracking-[0.08em] text-white/55 uppercase">{plan.includedLabel}</p>
        <ul className="mt-4 space-y-3">
          {plan.features.map((feature) => (
            <li key={feature} className="flex gap-2.5 text-[11px] leading-[1.35] text-white/70">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/75" strokeWidth={1.8} />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  )
}

export function Pricing() {
  const reduceMotion = useReducedMotion()
  const railRef = useRef<HTMLDivElement>(null)
  const featuredRef = useRef<HTMLDivElement>(null)

  // Open the rail on the featured plan rather than on the first card.
  //
  // Set with scrollLeft, not scrollIntoView — the latter walks up the tree and
  // would drag the whole page down to the pricing section on load. Guarded on
  // scrollWidth so it is a no-op at lg:, where the rail is a plain grid with
  // nothing to scroll.
  useEffect(() => {
    const rail = railRef.current
    const card = featuredRef.current
    if (!rail || !card) return
    if (rail.scrollWidth <= rail.clientWidth) return
    rail.scrollLeft = card.offsetLeft - (rail.clientWidth - card.clientWidth) / 2
  }, [])

  return (
    // No overflow-hidden and no decor of its own. The clip used to guillotine
    // this section's light flush with its own top and bottom edges, so the
    // field switched on and off exactly on the two section lines. The page
    // mesh lights this stretch now.
    <section id="pricing" className="relative isolate px-6 pt-20 pb-20 sm:pt-36 sm:pb-40">
      <div className="relative mx-auto max-w-[1120px]">
        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.55 }}
          className="mx-auto max-w-[580px] text-center"
        >
          {/* Same treatment as every other section heading — the top-lit
              gradient ramp, font-light, -0.02em. This was font-medium at
              -0.065em in flat white, which read as a different site. */}
          <h2 className="mx-auto max-w-[18ch] bg-[linear-gradient(100deg,#5f5f5f_0%,#ffffff_52%,#c9c9c9_100%)] bg-clip-text text-[clamp(1.9rem,4vw,3.1rem)] leading-[1.1] pb-[0.14em] font-light tracking-[-0.02em] text-transparent">
            Pick how far it goes
          </h2>
          <p className="mx-auto mt-5 max-w-[52ch] text-[14px] leading-[1.65] text-neutral-500">
            Every plan runs the same swarm and stops at the same barrier. What changes is how much
            of your stack it watches, and how long it stays awake.
          </p>
        </motion.div>

        {/* On phones this is a swipeable rail, not a stack: three 510px cards
            stacked vertically is 1500px of scrolling before you have seen the
            options, and you cannot compare two plans you never see together.
            Snap points park one card at a time, and the cards are narrow
            enough that both neighbours peek in at rest, so the rail is
            obviously scrollable without a hint. The negative margin lets it
            bleed to the screen edges while the padding keeps the outer cards
            inset. From lg: it goes back to a plain three-column grid. */}
        <div
          ref={railRef}
          className="no-scrollbar -mx-6 mt-12 flex snap-x snap-mandatory gap-3 overflow-x-auto px-[16vw] pb-2 lg:mx-0 lg:grid lg:snap-none lg:grid-cols-3 lg:items-stretch lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0"
        >
          {PLANS.map((plan, index) => (
            <div
              key={plan.name}
              ref={plan.featured ? featuredRef : undefined}
              // 68vw, not 80: the card has to be narrow enough that both
              // neighbours are visibly there at rest. At 80vw the gap ate the
              // overhang and each side showed ~20px, which reads as a clipped
              // card rather than "there is more here". This leaves ~45px of
              // each one showing, so the rail announces itself without being
              // scrolled.
              className="w-[68vw] max-w-[290px] shrink-0 snap-center lg:w-auto lg:max-w-none lg:shrink"
            >
              <PlanCard plan={plan} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
