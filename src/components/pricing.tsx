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
      viewport={{ once: true, amount: 0.25 }}
      transition={{ delay: reduceMotion ? 0 : index * 0.08, duration: reduceMotion ? 0.01 : 0.55 }}
      className={cn(
        'relative flex min-h-[510px] flex-col overflow-hidden rounded-[18px] border px-6 pt-6 pb-5 sm:px-7 sm:pt-7',
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

  return (
    // No overflow-hidden and no decor of its own. The clip used to guillotine
    // this section's light flush with its own top and bottom edges, so the
    // field switched on and off exactly on the two section lines. The page
    // mesh lights this stretch now.
    <section id="pricing" className="relative isolate px-6 pt-28 pb-32 sm:pt-36 sm:pb-40">
      <div className="relative mx-auto max-w-[1120px]">
        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.55 }}
          className="mx-auto max-w-[580px] text-center"
        >
          <h2 className="text-balance text-[clamp(2.2rem,5vw,3.7rem)] leading-[0.98] font-medium tracking-[-0.065em] text-white">
            Security that grows with your team.
          </h2>
          <p className="mx-auto mt-4 max-w-[48ch] text-[13px] leading-[1.55] text-neutral-400">
            Start with proof on one workspace. Turn on continuous defense when the cost of missing a signal gets real.
          </p>
        </motion.div>

        <div className="mt-12 grid items-stretch gap-4 lg:grid-cols-3 lg:gap-5">
          {PLANS.map((plan, index) => (
            <PlanCard key={plan.name} plan={plan} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
