import { ArrowRight, Play } from 'lucide-react';

const footerLinks = [
  { label: 'Platform', href: '#platform' },
  { label: 'Solutions', href: '#workflow' },
  { label: 'Docs', href: '#docs' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#platform' },
  { label: 'Careers', href: '#early-access' },
  { label: 'Blog', href: '#workflow' },
  { label: 'Status', href: '#early-access' },
  { label: 'Privacy', href: '#early-access' },
  { label: 'Terms', href: '#early-access' },
  { label: 'Security', href: '#platform' },
];

export function FinalCta() {
  return (
    <section id="early-access" className="px-6 pb-10 pt-8 max-[760px]:px-4">
      <div className="mx-auto max-w-[1120px] overflow-hidden rounded-t-[10px] border border-[#3b292d] bg-[#15100f]">
        <div className="relative isolate min-h-[310px] overflow-hidden px-6 py-16 text-center">
          <div
            className="absolute inset-0 -z-20 bg-[url('/background.webp')] bg-center bg-no-repeat [background-size:165%]"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(12,8,9,0.68),rgba(12,8,9,0.9)),radial-gradient(120%_140%_at_50%_0%,rgba(119,38,45,0.3),transparent_60%)]"
            aria-hidden="true"
          />
          <h2 className="mx-auto max-w-[560px] text-[2rem] font-[620] leading-[1.13] tracking-[0] text-[#f2eaeb] max-[640px]:text-[1.7rem]">
            Stop chasing alerts.
            <br />
            Let the swarm defend.
          </h2>
          <p className="mx-auto mt-5 max-w-[480px] text-[0.92rem] leading-[1.65] text-[#9a8689]">
            Join the first security teams running on SWRMZ. Let the agents
            find, fix, report, and guard while you sleep. Early access is
            limited.
          </p>
          <div className="mt-7 flex justify-center gap-3 max-[560px]:flex-col">
            <a
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[7px] bg-[#77262d] px-5 text-[0.78rem] font-[720] text-[#ffffff] shadow-[0_16px_30px_rgba(119,38,45,0.18)] transition-transform duration-300 hover:-translate-y-0.5"
              href="mailto:hello@swrmz.ai"
            >
              Request Beta Access
              <ArrowRight size={14} strokeWidth={2.4} />
            </a>
            <a
              id="docs"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[7px] border border-[#5e3a3e] bg-[#181114]/85 px-5 text-[0.78rem] font-[720] text-[#d98a90] transition-transform duration-300 hover:-translate-y-0.5"
              href="/"
            >
              <Play size={14} fill="currentColor" strokeWidth={2.2} />
              Read the Docs
            </a>
          </div>
        </div>

        <footer className="relative overflow-hidden bg-[#15100f] px-8 pb-16 pt-8 max-[760px]:px-5 max-[760px]:pb-12 max-[760px]:pt-6">
          <div className="relative z-10 grid grid-cols-[1fr_auto] gap-6 max-[760px]:grid-cols-1 max-[760px]:gap-3">
            <div className="grid grid-cols-4 gap-x-6 gap-y-3 text-[0.72rem] text-[#a89799] max-[640px]:grid-cols-3 max-[640px]:gap-x-3 max-[640px]:gap-y-2 max-[640px]:text-[0.68rem]">
              {footerLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="w-fit cursor-pointer transition-colors duration-200 hover:text-[#f2eaeb] focus-visible:text-[#f2eaeb]"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <p className="text-[0.72rem] text-[#a89799] max-[760px]:text-[0.66rem]">© 2026 SWRMZ. All rights reserved.</p>
          </div>
          <img
            src="/fotter.webp"
            alt=""
            aria-hidden="true"
            className="pointer-events-none -mx-8 -mb-16 mt-7 block w-[calc(100%+64px)] max-w-none select-none max-[760px]:-mx-5 max-[760px]:-mb-12 max-[760px]:mt-5 max-[760px]:w-[calc(100%+40px)]"
          />
        </footer>
      </div>
    </section>
  );
}
