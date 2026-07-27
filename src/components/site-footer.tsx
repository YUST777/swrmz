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
          Point it at what your team is building. Swrmz finds the way in, proves it, and waits for
          your word before it touches anything.
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

/** X, LinkedIn and GitHub, drawn inline — three glyphs is not worth a dep. */
const SOCIALS = [
  {
    label: 'X',
    href: 'https://x.com',
    path: 'M13.6 10.6 20.9 2h-1.7l-6.3 7.4L7.8 2H2l7.7 11.2L2 22h1.7l6.7-7.8L15.8 22h5.8l-8-11.4Zm-2.4 2.8-.8-1.1L4.4 3.3h2.7l5 7.1.8 1.1 6.5 9.2h-2.7l-5.3-7.6Z',
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com',
    path: 'M6.9 21.4H2.9V8.7h4Zm-2-14.5C3.6 6.9 2.5 5.8 2.5 4.4A2.4 2.4 0 0 1 4.9 2c1.3 0 2.4 1.1 2.4 2.4S6.2 6.9 4.9 6.9ZM21.5 21.4h-4v-6.2c0-1.5 0-3.4-2.1-3.4s-2.4 1.6-2.4 3.3v6.3h-4V8.7h3.8v1.7h.1a4.2 4.2 0 0 1 3.8-2.1c4 0 4.8 2.7 4.8 6.1Z',
  },
  {
    label: 'GitHub',
    href: 'https://github.com',
    path: 'M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.4-3.4-1.4-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.7.4-1.1.6-1.4-2.2-.2-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7 0-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.8-4.6 5 .4.3.7 1 .7 2v2.9c0 .3.2.6.7.5A10 10 0 0 0 12 2Z',
  },
]

const LINK_COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'How it works', href: '#attack-run' },
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#about' },
      { label: 'Contact', href: 'mailto:hello@swarms.tech' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Get in touch', href: 'mailto:hello@swarms.tech' },
      { label: 'Terms of Service', href: '#terms' },
      { label: 'Privacy Policy', href: '#privacy' },
    ],
  },
]

export function SiteFooter() {
  return (
    // Transparent, and it has to be. This used to be `overflow-hidden
    // bg-[#050505]`: the opaque fill was a lighter tone than the page's
    // #030303 ink, so it drew a full-width tonal step across the top of the
    // footer, and the clip stopped any light crossing in either direction.
    // The page mesh supplies the light here now.
    <footer className="relative px-6 pt-8 pb-8 sm:pt-12">
      <div className="mx-auto max-w-[1280px]">
        <FooterCta />

        {/* ── the colophon ─────────────────────────────────────────────
            Brand and blurb on the left, three link columns on the right.
            The columns collapse to a 2-up grid on phones rather than
            stacking into one long list. */}
        <div className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.6fr)] lg:gap-16">
          <div>
            <TextLogo className="h-[22px] w-auto" />

            <p className="mt-5 max-w-[42ch] text-[13px] leading-[1.7] text-neutral-500">
              A swarm of AI agents that hunts the ways into your product, proves what it finds, and
              waits for your word before it touches anything.
            </p>

            <div className="mt-6 flex items-center gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.09] text-neutral-500 transition-colors duration-300 hover:border-blood-100/40 hover:text-blood-50"
                >
                  <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="currentColor" aria-hidden>
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {LINK_COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h3 className="text-[13px] font-medium text-white">{col.title}</h3>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-[13px] text-neutral-500 transition-colors duration-300 hover:text-white"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* A hairline that dissolves at both ends rather than a border rule.
            `border-t` drew an edge-to-edge line with hard stops, which is the
            one thing a continuous field cannot have. */}
        <div className="relative mt-12 pt-6">
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.09)_22%,rgba(255,255,255,0.09)_78%,transparent)]"
          />
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <span className="text-[12px] text-neutral-600">
              © {new Date().getFullYear()} Swrmz. All rights reserved.
            </span>
            <span className="font-mono text-[11px] tracking-[0.04em] text-neutral-600">
              swarms.tech
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
