import { StepArt } from '../components/StepArt';

const steps: Array<{
  step: string;
  title: string;
  tail: string;
  copy: string;
  variant: 'deploy' | 'guard' | 'radar';
}> = [
  {
    step: 'Step 01',
    title: 'Deploy the',
    tail: 'swarm.',
    copy: 'Point SWRMZ at your repos, cloud, and log streams. The agents map your attack surface in minutes, across any environment.',
    variant: 'deploy',
  },
  {
    step: 'Step 02',
    title: 'Set your',
    tail: 'guardrails.',
    copy: 'Tell the swarm what matters. It learns your baselines and your fix-approval policy, then watches for anything off.',
    variant: 'guard',
  },
  {
    step: 'Step 03',
    title: 'Let the swarm',
    tail: 'work.',
    copy: 'Agents detect, remediate, report, and guard around the clock, while you stay in control from a single dashboard.',
    variant: 'radar',
  },
];

export function WorkflowSection() {
  return (
    <section id="workflow" className="px-6 py-16 max-[760px]:px-4 max-[760px]:py-12">
      <div className="mx-auto grid max-w-[1120px] grid-cols-[0.96fr_1.04fr] gap-8 max-[960px]:grid-cols-1">
        <article className="relative min-h-[620px] overflow-hidden rounded-[26px] border border-[#8a2c34] shadow-[0_28px_90px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] max-[960px]:min-h-[540px] max-[640px]:min-h-[500px]">
          <div
            className="absolute inset-0 bg-[url('/background.webp')] bg-cover bg-center"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(94,29,35,0.55)_0%,rgba(46,12,14,0.45)_45%,rgba(12,8,8,0.78)_100%)]"
            aria-hidden="true"
          />
          <div className="relative z-10 flex min-h-[620px] flex-col p-9 max-[960px]:min-h-[540px] max-[640px]:min-h-[500px] max-[640px]:p-6">
            <h2 className="max-w-[410px] text-[2.45rem] font-[630] leading-[1.12] tracking-[0] text-white max-[640px]:text-[2rem]">
              Up and running
              <br />
              in three steps.
            </h2>
            <p className="mt-6 max-w-[440px] text-[1rem] leading-[1.7] text-[#f1d6d8] max-[640px]:text-[0.92rem]">
              From first scan to autonomous defense, the swarm gets to work
              fast, no agents to babysit.
            </p>
          </div>
        </article>

        <div className="relative flex flex-col justify-between gap-6 max-[960px]:gap-5">
          <div className="absolute left-1/2 top-6 h-[calc(100%-48px)] -translate-x-1/2 border-l border-dashed border-[#8a4248]/50 max-[640px]:hidden" aria-hidden="true" />
          {steps.map(({ step, title, tail, copy, variant }) => (
            <article
              className="relative z-10 min-h-[184px] overflow-hidden rounded-[20px] border border-[#36262a] bg-[#100b0c]/92 p-9 shadow-[0_20px_56px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-[8px] max-[640px]:p-6"
              key={step}
            >
              <div
                className="pointer-events-none absolute right-3 top-1/2 size-[150px] -translate-y-1/2 opacity-55 [mask-image:radial-gradient(circle_at_72%_50%,#000_30%,transparent_74%)] max-[960px]:hidden"
                aria-hidden="true"
              >
                <StepArt variant={variant} />
              </div>
              <div className="relative z-10 max-w-[60%] max-[960px]:max-w-full">
                <p className="font-mono text-[0.88rem] font-[760] text-[#d98a90]">{step}</p>
                <h3 className="mt-4 text-[1.35rem] font-[680] leading-[1.18] tracking-[0] text-[#f2eaeb] max-[640px]:text-[1.2rem]">
                  {title} <span className="font-[480] text-[#a89799]">{tail}</span>
                </h3>
                <p className="mt-4 text-[0.95rem] leading-[1.62] text-[#9a8689]">
                  {copy}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
