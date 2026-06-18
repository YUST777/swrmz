import { AppShowcase } from '../components/AppShowcase';

export function PlatformSection() {
  return (
    <section
      id="platform"
      className="relative isolate overflow-hidden px-6 pb-8 pt-20 max-[760px]:px-4 max-[760px]:pt-14"
    >
      {/* ambient glow so the section isn't flat black */}
      <div
        className="pointer-events-none absolute left-1/2 top-[58%] -z-10 h-[680px] w-[980px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(150,47,55,0.28),rgba(119,38,45,0.12)_45%,transparent_72%)] blur-[60px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-[8%] top-[20%] -z-10 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(192,68,76,0.18),transparent_70%)] blur-[50px]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-[1120px]">
        <div className="max-w-[560px]">
          <h2 className="text-[2rem] font-[630] leading-[1.08] tracking-[0] text-[#f2eaeb] max-[760px]:text-[1.8rem]">
            One swarm.{' '}
            <span className="font-[480] text-[#a89799]">Zero blind spots.</span>
          </h2>
          <p className="mt-4 max-w-[440px] text-[0.9rem] leading-[1.75] text-[#a89799]">
            Watch the swarm work: recon, analysis, exploitation, and reporting,
            with every agent, finding, and fix in one live view.
          </p>
        </div>

        <div className="mt-9 rounded-2xl shadow-[0_0_120px_rgba(119,38,45,0.35)]">
          <AppShowcase />
        </div>
      </div>
    </section>
  );
}
