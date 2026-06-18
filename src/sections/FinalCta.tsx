import { ArrowRight, Cloud, Play } from 'lucide-react';
import { BrandMark } from '../components/BrandMark';
import { Eyebrow } from '../components/Eyebrow';
import { AsciiDrones } from '../components/AsciiDrones';

export function FinalCta() {
  return (
    <section id="early-access" className="px-6 pb-10 pt-8 max-[760px]:px-4">
      <div className="mx-auto max-w-[1120px] overflow-hidden rounded-t-[10px] border border-[#3b292d] bg-[#15100f]">
        <div className="relative isolate min-h-[310px] px-6 py-16 text-center">
          <AsciiDrones className="-z-20" count={5} />
          <div
            className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(21,16,15,0.6),rgba(21,16,15,0.85)),radial-gradient(120%_140%_at_50%_0%,rgba(119,38,45,0.22),transparent_60%)]"
            aria-hidden="true"
          />
          <Eyebrow Icon={Cloud}>Ready to defend</Eyebrow>
          <h2 className="mx-auto mt-5 max-w-[560px] text-[2rem] font-[620] leading-[1.13] tracking-[0] text-[#f2eaeb] max-[640px]:text-[1.7rem]">
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

        <footer className="relative overflow-hidden bg-[#15100f] px-8 pb-16 pt-8 max-[760px]:px-5">
          <div className="relative z-10 grid grid-cols-[1fr_auto] gap-10 max-[760px]:grid-cols-1">
            <div className="grid grid-cols-4 gap-9 text-[0.72rem] text-[#a89799] max-[640px]:grid-cols-2">
              <a href="#platform">Platform</a>
              <a href="#workflow">Solutions</a>
              <a href="#docs">Docs</a>
              <a href="#pricing">Pricing</a>
              <a href="/">About</a>
              <a href="/">Careers</a>
              <a href="/">Blog</a>
              <a href="/">Status</a>
              <a href="/">Privacy</a>
              <a href="/">Terms</a>
              <a href="/">Security</a>
            </div>
            <p className="text-[0.72rem] text-[#a89799]">© 2026 SWRMZ. All rights reserved.</p>
          </div>
          <div className="pointer-events-none mt-9 flex items-center gap-7 text-[#77262d]/45" aria-hidden="true">
            <BrandMark dark />
            <span className="select-none text-[8rem] font-[620] leading-none tracking-[0] max-[760px]:text-[4.8rem]">
              SWRMZ
            </span>
          </div>
        </footer>
      </div>
    </section>
  );
}
