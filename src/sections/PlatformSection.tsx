import { AppShowcase } from '../components/AppShowcase';

export function PlatformSection() {
  return (
    <section
      id="platform"
      className="relative isolate overflow-hidden px-6 pb-8 pt-20 max-[760px]:px-4 max-[760px]:pt-14"
    >
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

        <div className="mt-9 rounded-2xl">
          <AppShowcase />
        </div>
      </div>
    </section>
  );
}
