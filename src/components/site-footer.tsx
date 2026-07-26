import { motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'

import { DroneGlyph, TextLogo } from '@/components/brand-logo'

function SignalField() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(rgba(255,95,95,0.44)_0.8px,transparent_0.8px)] [background-size:11px_11px] [mask-image:radial-gradient(ellipse_at_80%_58%,#000,transparent_60%)]"
      />
      <div aria-hidden className="pointer-events-none absolute -top-32 right-[-7%] h-[420px] w-[650px] rounded-full bg-blood-300/30 blur-[105px]" />
      <div aria-hidden className="pointer-events-none absolute top-[44%] right-[12%] h-[220px] w-[320px] rounded-full bg-blood-100/16 blur-[80px]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-36 -left-24 h-[360px] w-[540px] rounded-full bg-blood-300/30 blur-[110px]" />
      <svg aria-hidden viewBox="0 0 1200 460" className="pointer-events-none absolute inset-0 h-full w-full opacity-50">
        <path d="M0 71H110L150 111V230L190 270V460" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
        <path d="M1200 42H1090L1045 87V182L1004 223V460" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
        <path d="M817 0V86L862 131H1200" fill="none" stroke="rgba(255,59,59,0.23)" strokeWidth="1" />
      </svg>
    </>
  )
}

function FooterCta() {
  const reduceMotion = useReducedMotion()

  return (
    <motion.section
      initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: reduceMotion ? 0.01 : 0.6 }}
      className="relative overflow-hidden rounded-[22px] border border-white/[0.1] bg-[linear-gradient(145deg,#100909,#070606_55%,#120708)] px-6 py-16 shadow-[0_28px_90px_-50px_rgba(0,0,0,0.95)] sm:px-10 sm:py-20"
    >
      <SignalField />
      <div className="relative mx-auto flex max-w-[660px] flex-col items-center text-center">
        <div className="relative mb-7 h-12 w-[130px]">
          <svg viewBox="0 0 180 65" className="h-full w-full">
            <DroneGlyph x={43} y={34} size={30} fill="#e11414" opacity={0.45} />
            <DroneGlyph x={89} y={26} size={45} fill="#ff6b6b" />
            <DroneGlyph x={138} y={34} size={30} fill="#e11414" opacity={0.45} />
          </svg>
          <span aria-hidden className="absolute inset-x-8 top-4 -z-10 h-7 rounded-full bg-blood-100/30 blur-[18px]" />
        </div>
        <p className="font-mono text-[10px] tracking-[0.14em] text-blood-50 uppercase">Your perimeter, under watch</p>
        <h2 className="mt-4 max-w-[13ch] text-balance text-[clamp(2.4rem,5vw,4.5rem)] leading-[0.95] font-light tracking-[-0.065em] text-white">
          Let the swarm take first watch.
        </h2>
        <p className="mt-5 max-w-[48ch] text-[14px] leading-[1.65] text-neutral-400">
          Put a dedicated security objective around the product your team is building. Swrmz gathers proof, protects the boundary, and asks before it acts.
        </p>
        <a
          href="mailto:hello@swarms.tech?subject=Swrmz%20early%20access"
          className="group mt-8 inline-flex items-center gap-2 rounded-full border border-blood-100/50 bg-[linear-gradient(180deg,#501215,#21090a)] px-6 py-3 text-[13px] font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_0_22px_rgba(255,43,43,0.28)] transition-all duration-300 hover:border-blood-100/75 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_0_32px_rgba(255,43,43,0.45)]"
        >
          Request early access
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.8} />
        </a>
      </div>
    </motion.section>
  )
}

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#050505] px-6 pt-8 pb-7 sm:pt-12">
      <div className="mx-auto max-w-[1280px]">
        <FooterCta />

        <div className="relative mt-10 flex items-center justify-between border-t border-white/[0.08] pt-6 sm:mt-12">
          <TextLogo className="h-[21px] w-auto" />
          <span className="font-mono text-[9px] tracking-[0.06em] text-neutral-600">© {new Date().getFullYear()} SWRMZ</span>
        </div>
      </div>
    </footer>
  )
}
