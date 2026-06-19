import { ArrowRight, ChevronDown, Play } from 'lucide-react';
import { BrandMark } from '../components/BrandMark';

const navLinks = [
  { label: 'Platform', href: '#platform' },
  { label: 'Solutions', href: '#workflow', hasMenu: true },
  { label: 'Docs', href: '#docs' },
  { label: 'Pricing', href: '#pricing' },
];

export function HeroSection() {
  return (
    <section
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-[#050505] text-[#f5f1f1]"
      aria-labelledby="hero-title"
    >
      <HeroBackdrop />

      <header className="relative z-30 grid h-[72px] shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-white/[0.08] px-8 min-[1440px]:px-10 max-[820px]:h-16 max-[820px]:grid-cols-[1fr_auto] max-[820px]:px-5">
        <BrandMark />

        <nav
          className="flex items-center justify-center gap-[42px] text-[14px] font-[520] leading-none text-white/58 max-[900px]:hidden"
          aria-label="Primary navigation"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              className="inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-white"
              href={link.href}
            >
              {link.label}
              {link.hasMenu && <ChevronDown size={13} strokeWidth={2.1} />}
            </a>
          ))}
        </nav>

        <a
          className="inline-flex min-h-10 items-center justify-center gap-2 justify-self-end rounded-[6px] bg-[#a01927] px-5 text-[13.5px] font-[720] leading-none text-white transition-colors duration-200 hover:bg-[#b42331] max-[820px]:min-h-9 max-[820px]:px-3.5 max-[820px]:text-[12.5px]"
          href="/login"
        >
          <span>Login now</span>
          <ArrowRight size={16} strokeWidth={2.4} />
        </a>
      </header>

      <div className="relative z-20 mx-auto flex w-full max-w-[1140px] flex-1 flex-col items-center justify-center px-5 pb-[10vh] pt-[5vh] text-center min-[1440px]:max-w-[1240px] max-[820px]:justify-start max-[820px]:pb-14 max-[820px]:pt-16">
        <h1
          id="hero-title"
          className="max-w-[780px] text-[clamp(2.35rem,5.25vw,4.45rem)] font-[560] leading-[0.94] tracking-[0] text-white max-[820px]:max-w-[620px] max-[820px]:text-[clamp(2.15rem,10.5vw,3.75rem)] max-[520px]:text-[2.28rem]"
        >
          <span className="block bg-[linear-gradient(180deg,#ffffff_8%,#cfcaca_48%,#777071_100%)] bg-clip-text pb-2 text-transparent">
            SWRMZ finds
          </span>
          <span className="block bg-[linear-gradient(180deg,#d6d0d1_0%,#979090_45%,#4c4748_100%)] bg-clip-text pb-2 text-transparent">
            fixes, and guards
          </span>
          <span className="block bg-[linear-gradient(180deg,#e6e1e1_0%,#9b9495_90%)] bg-clip-text pb-2 text-transparent">
            <span className="text-white">your stack</span>
          </span>
        </h1>

        <p className="mt-4 max-w-[560px] text-[15px] font-[470] leading-[1.48] text-[#aaa3a4] max-[820px]:mt-4 max-[820px]:max-w-[520px] max-[820px]:text-[14px]">
          SWRMZ is a swarm of AI security agents, built on Band.ai, that hunt
          vulnerabilities across your stack, remediate them automatically,
          generate audit-ready reports, and stand guard over your logs around the clock.
        </p>

        <div className="mt-8 flex items-center justify-center gap-6 max-[640px]:mt-7 max-[640px]:w-full max-[640px]:flex-col max-[640px]:gap-3">
          <a
            className="inline-flex min-h-[50px] min-w-[222px] items-center justify-center gap-8 rounded-[8px] border border-[#ff3144]/45 bg-[linear-gradient(180deg,#ad1e2b_0%,#851722_100%)] px-7 text-[14.5px] font-[740] text-white shadow-[0_0_30px_rgba(151,16,27,0.32),inset_0_1px_0_rgba(255,255,255,0.18)] transition-colors duration-200 hover:bg-[linear-gradient(180deg,#bb2332_0%,#941b27_100%)] max-[640px]:min-h-12 max-[640px]:w-full max-[640px]:min-w-0 max-[640px]:gap-5 max-[640px]:text-[14px]"
            href="/login"
          >
            <span>Download the app</span>
            <ArrowRight size={17} strokeWidth={2.3} />
          </a>
          <a
            className="inline-flex min-h-[50px] min-w-[210px] items-center justify-center gap-3.5 rounded-[8px] border border-[#8f1e29] bg-[#120708]/78 px-7 text-[14.5px] font-[730] text-white transition-colors duration-200 hover:border-[#c7313f] hover:bg-[#1a0a0d] max-[640px]:min-h-12 max-[640px]:w-full max-[640px]:min-w-0 max-[640px]:text-[14px]"
            href="#demo"
          >
            <Play size={16} fill="currentColor" strokeWidth={2.2} />
            <span>Watch the Demo</span>
          </a>
        </div>
      </div>
    </section>
  );
}

function HeroBackdrop() {
  return (
    <>
      <div
        className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_50%_104%,rgba(186,18,31,0.64)_0%,rgba(118,16,25,0.3)_13%,rgba(20,3,5,0.78)_35%,rgba(0,0,0,0.98)_68%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.28)_28%,rgba(0,0,0,0.24)_72%,rgba(0,0,0,0.9)_100%),radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.075)_0%,rgba(255,255,255,0.015)_31%,transparent_57%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 top-[72px] -z-10 h-px bg-white/[0.035] max-[820px]:top-16"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-0 top-[248px] -z-10 h-[386px] w-[282px] opacity-[0.56] max-[900px]:opacity-25"
        aria-hidden="true"
      >
        <HudGrid />
      </div>
      <div
        className="pointer-events-none absolute right-[18px] top-[91px] -z-10 h-[158px] w-[305px] opacity-[0.5] max-[900px]:right-[-128px] max-[900px]:opacity-25"
        aria-hidden="true"
      >
        <TargetHud />
      </div>
      <div
        className="pointer-events-none absolute bottom-[-76px] left-1/2 -z-10 h-[190px] w-[760px] -translate-x-1/2 rounded-[100%] bg-[#a91522]/38 blur-[44px]"
        aria-hidden="true"
      />
      <div className="grain pointer-events-none absolute inset-0 -z-10 opacity-[0.045]" aria-hidden="true" />
    </>
  );
}

function HudGrid() {
  return (
    <svg viewBox="0 0 282 386" className="h-full w-full" fill="none" aria-hidden="true">
      <defs>
        <pattern id="hero-dot-grid" width="12" height="12" patternUnits="userSpaceOnUse">
          <path d="M1 1h1v1H1z" fill="#bd1324" opacity="0.78" />
        </pattern>
      </defs>
      <rect width="155" height="310" fill="url(#hero-dot-grid)" opacity="0.74" />
      <rect x="71" y="238" width="82" height="7" fill="#8d111d" opacity="0.42" />
      <rect x="187" y="61" width="43" height="2" fill="#8d111d" opacity="0.55" />
      <rect x="185" y="170" width="78" height="3" fill="#8d111d" opacity="0.45" />
      <rect x="95" y="323" width="31" height="2" fill="#8d111d" opacity="0.65" />
      <path d="M97 116h67m-39 6h63m-25 87h50m-112 149h75" stroke="#8d111d" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

function TargetHud() {
  return (
    <svg viewBox="0 0 305 158" className="h-full w-full" fill="none" aria-hidden="true">
      <defs>
        <pattern id="hero-right-grid" width="11" height="11" patternUnits="userSpaceOnUse">
          <path d="M1 1h1v1H1z" fill="#9d101d" opacity="0.62" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="176" height="130" fill="url(#hero-right-grid)" opacity="0.55" />
      <path d="M208 78h86M251 35v86" stroke="#a51320" strokeWidth="1" opacity="0.62" />
      <circle cx="251" cy="78" r="29" stroke="#b51625" strokeWidth="1" opacity="0.78" />
      <circle cx="251" cy="78" r="8" stroke="#b51625" strokeWidth="1" opacity="0.68" />
      <path d="M235 78h32M251 62v32" stroke="#d92435" strokeWidth="1" opacity="0.74" />
      <path d="M59 48h69m-44 8h74M28 91h46m30 12h84m-61 10h48" stroke="#9d101d" strokeWidth="1.5" opacity="0.48" />
      <path d="M284 105h8v-8m-41-55h-8v8" stroke="#b51625" strokeWidth="1.2" opacity="0.76" />
    </svg>
  );
}
