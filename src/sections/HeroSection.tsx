import { ArrowRight, Play } from 'lucide-react';
import { BrandMark } from '../components/BrandMark';

const stats = [
  { label: 'Coverage', value: '99.98%', note: 'Code & infra scanned' },
  { label: 'Swarm', value: '40+', note: 'Specialized AI agents' },
  { label: 'Auto-fix', value: '4m', note: 'Median time to remediate' },
  { label: 'Protected', value: '500+', note: 'Environments under guard' },
];

const navLinks = [
  { label: 'Platform', href: '#platform' },
  { label: 'Solutions', href: '#workflow' },
  { label: 'Docs', href: '#docs' },
  { label: 'Pricing', href: '#pricing' },
];

export function HeroSection() {
  return (
    <section
      className="relative isolate flex h-[100svh] min-h-[500px] flex-col overflow-hidden bg-[#2c1013] max-[820px]:h-auto max-[820px]:min-h-0 max-[820px]:overflow-visible"
      aria-labelledby="hero-title"
    >
      <div
        className="absolute inset-0 -z-30 bg-[url('/background.webp')] bg-cover bg-center bg-no-repeat max-[820px]:bg-[53%_top]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(14,10,11,0.92)_0%,rgba(14,10,11,0.7)_34%,rgba(14,10,11,0.32)_66%,rgba(14,10,11,0.5)_100%),linear-gradient(180deg,rgba(14,10,11,0.55)_0%,transparent_38%,rgba(14,10,11,0.85)_100%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(119,38,45,0.12)_0,transparent_22%,transparent_74%,rgba(8,5,6,0.6)_100%)]"
        aria-hidden="true"
      />

      <header className="relative z-50 grid h-16 w-full shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-white/10 bg-[#0e0a0b]/95 px-8 text-[#f4eef0] backdrop-blur-[8px] min-[1500px]:px-12 max-[1180px]:grid-cols-[auto_1fr_auto] max-[820px]:h-14 max-[820px]:grid-cols-[minmax(0,1fr)_auto] max-[820px]:px-4">
        <BrandMark />

        <nav
          className="relative z-10 flex items-center justify-center gap-9 text-[0.72rem] font-[560] leading-none text-white/55 min-[1500px]:gap-12 min-[1500px]:text-[0.76rem] max-[1180px]:gap-6 max-[820px]:hidden"
          aria-label="Primary navigation"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              className="transition-colors duration-200 hover:text-white focus-visible:text-white"
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          className="relative z-10 inline-flex min-h-[38px] items-center justify-center gap-1.5 justify-self-end rounded-md bg-[#77262d] px-5 text-[0.72rem] font-[680] text-white shadow-[0_8px_20px_rgba(119,38,45,0.35)] transition-colors duration-200 hover:bg-[#8a2c34] focus-visible:bg-[#8a2c34] max-[820px]:min-h-9 max-[820px]:px-3.5"
          href="#early-access"
        >
          <span>Get Access</span>
          <ArrowRight className="shrink-0" size={14} strokeWidth={2.4} />
        </a>
      </header>

      <div className="relative z-10 mx-auto flex w-[min(94vw,1180px)] flex-1 min-[1500px]:w-[min(90vw,1320px)] max-[1180px]:w-[calc(100%-48px)] max-[820px]:w-full max-[820px]:flex-none max-[820px]:px-[18px] max-[820px]:pb-5 max-[820px]:pt-6">
        <div className="grid h-full w-full grid-cols-[minmax(0,1fr)_auto] grid-rows-1 gap-10 max-[1180px]:h-auto max-[1180px]:grid-cols-1 max-[1180px]:[grid-template-rows:auto] max-[1180px]:gap-7 max-[820px]:block">
          <div className="w-full max-w-[640px] self-end pb-4 min-[1500px]:max-w-[720px] max-[1180px]:max-w-[700px] max-[1180px]:self-auto max-[1180px]:pb-0">
            <div className="mb-5 flex flex-wrap gap-2 max-[820px]:mb-5" aria-label="Launch status">
              <span className="inline-flex min-h-5 items-center rounded-[3px] bg-[linear-gradient(180deg,#f0c9cc,#e0a0a5)] px-2.5 font-mono text-[0.52rem] font-[760] uppercase leading-none text-[#77262d] shadow-[0_10px_22px_rgba(13,32,31,0.05)] min-[1500px]:min-h-[22px] min-[1500px]:px-3 min-[1500px]:text-[0.56rem] max-[820px]:min-h-6 max-[820px]:rounded-[5px] max-[820px]:text-[0.58rem]">
                Agentic Security
              </span>
              <span className="inline-flex min-h-5 items-center rounded-[3px] bg-[#20171a]/90 px-2.5 font-mono text-[0.52rem] font-[760] uppercase leading-none text-[#c2b2b4] shadow-[0_10px_22px_rgba(13,32,31,0.05)] min-[1500px]:min-h-[22px] min-[1500px]:px-3 min-[1500px]:text-[0.56rem] max-[820px]:min-h-6 max-[820px]:rounded-[5px] max-[820px]:text-[0.58rem]">
                Now in Beta
              </span>
            </div>

            <h1
              className="max-w-[590px] text-[clamp(1.9rem,4.2vw,2.5rem)] font-[640] leading-[1.12] tracking-[0] text-[#f2eaeb] min-[1500px]:max-w-[660px] max-[820px]:max-w-full max-[820px]:text-[2.1rem] max-[820px]:leading-[1.1] max-[430px]:text-[1.92rem]"
              id="hero-title"
            >
              Find every weakness.
              <br />
              Fix it automatically.
              <br />
              Guard what matters.
            </h1>

            <p className="mt-4 max-w-[420px] text-[0.78rem] font-[480] leading-[1.62] text-[#9a8689] min-[1500px]:max-w-[470px] min-[1500px]:text-[0.82rem] max-[820px]:mt-5 max-[820px]:max-w-full max-[820px]:text-[0.88rem] max-[820px]:leading-[1.62] max-[430px]:text-[0.84rem]">
              SWRMZ is a swarm of AI security agents, built on Band.ai, that
              hunt vulnerabilities across your stack, remediate them
              automatically, generate audit-ready reports, and stand guard over
              your logs around the clock.
            </p>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-4 self-end pb-4 max-[1180px]:justify-start max-[1180px]:self-auto max-[1180px]:pb-0 max-[820px]:mt-6 max-[820px]:max-w-full max-[820px]:flex-col max-[820px]:items-stretch max-[820px]:gap-3" aria-label="Hero actions">
            <a
              className="inline-flex min-h-[40px] min-w-36 items-center justify-center gap-2.5 whitespace-nowrap rounded-md bg-[linear-gradient(180deg,#8a2c34,#6a212a)] px-[18px] text-[0.74rem] font-[720] leading-none text-[#ffffff] shadow-[0_14px_30px_rgba(119,38,45,0.2),inset_0_1px_0_rgba(255,255,255,0.68)] transition-transform duration-300 hover:-translate-y-0.5 focus-visible:-translate-y-0.5 min-[1500px]:min-h-[44px] min-[1500px]:min-w-[156px] min-[1500px]:text-[0.78rem] max-[820px]:min-h-11 max-[820px]:w-full max-[820px]:min-w-0 max-[820px]:rounded-[7px] max-[820px]:text-[0.88rem]"
              href="#early-access"
            >
              <span>Get Early Access</span>
              <ArrowRight className="shrink-0" size={15} strokeWidth={2.4} />
            </a>
            <a
              className="inline-flex min-h-[40px] min-w-[156px] items-center justify-center gap-2.5 whitespace-nowrap rounded-md border border-[#36262a]/50 bg-[#5e1d23]/85 px-[18px] text-[0.74rem] font-[720] leading-none text-[#f4eef0] shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-[14px] transition duration-300 hover:-translate-y-0.5 hover:border-[#241a1d]/85 hover:bg-[#6a212a]/90 focus-visible:-translate-y-0.5 min-[1500px]:min-h-[44px] min-[1500px]:min-w-[174px] min-[1500px]:text-[0.78rem] max-[820px]:min-h-11 max-[820px]:w-full max-[820px]:min-w-0 max-[820px]:rounded-[7px] max-[820px]:text-[0.88rem]"
              href="#demo"
            >
              <Play className="shrink-0" size={14} fill="currentColor" strokeWidth={2.2} />
              <span>Watch the Demo</span>
            </a>
          </div>
        </div>
      </div>

      <div
        className="relative z-20 mx-auto mb-5 grid w-[min(94vw,1180px)] shrink-0 grid-cols-[minmax(110px,140px)_1fr] items-center gap-[22px] rounded-lg border border-white/10 bg-[#15100f]/90 px-7 py-4 shadow-[0_20px_54px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-[22px] backdrop-saturate-125 min-[1500px]:mb-6 min-[1500px]:w-[min(90vw,1320px)] min-[1500px]:px-8 min-[1500px]:py-5 max-[1180px]:w-[calc(100%-48px)] max-[820px]:mx-3.5 max-[820px]:mb-4 max-[820px]:w-auto max-[820px]:grid-cols-1 max-[820px]:gap-3 max-[820px]:p-4"
        aria-label="SWRMZ performance metrics"
      >
        <h2 className="text-[0.96rem] font-[680] leading-[1.16] tracking-[0] text-[#f2eaeb] min-[1500px]:text-[1.06rem] max-[820px]:text-[0.9rem] max-[820px]:leading-[1.1]">
          Our
          <br />
          performance
        </h2>

        <dl className="grid grid-cols-4 items-stretch max-[1180px]:grid-cols-2 max-[820px]:grid-cols-2 max-[820px]:gap-x-5 max-[820px]:gap-y-3">
          {stats.map((stat) => (
            <div
              className="border-l border-[#c9b9bb]/15 px-5 first:border-l-0 max-[1180px]:px-4 max-[1180px]:odd:border-l-0 max-[820px]:border-l-0 max-[820px]:px-0"
              key={stat.label}
            >
              <dt className="text-[0.56rem] font-[630] leading-tight text-[#9a8689] max-[820px]:text-[0.66rem]">
                {stat.label}
              </dt>
              <dd className="mt-1.5 text-[0.96rem] font-[720] leading-none tracking-[0] text-[#d98a90] min-[1500px]:text-[1.06rem] max-[820px]:text-[1.05rem]">
                {stat.value}
              </dd>
              <span className="mt-1 block text-[0.56rem] font-medium leading-[1.3] text-[#c2b2b4] max-[820px]:text-[0.64rem]">
                {stat.note}
              </span>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
