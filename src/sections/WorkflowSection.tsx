import { Download, Flag, Radar, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Eyebrow } from '../components/Eyebrow';
import { AsciiDrones } from '../components/AsciiDrones';

const steps: Array<{
  step: string;
  title: string;
  copy: string;
  Icon: LucideIcon;
}> = [
  {
    step: 'Step 01',
    title: 'Deploy the swarm.',
    copy: 'Point SWRMZ at your repos, cloud, and log streams. The agents map your attack surface in minutes, across any environment.',
    Icon: Download,
  },
  {
    step: 'Step 02',
    title: 'Set your guardrails.',
    copy: 'Tell the swarm what matters. It learns your baselines and your fix-approval policy, then watches for anything off.',
    Icon: Flag,
  },
  {
    step: 'Step 03',
    title: 'Let the swarm work.',
    copy: 'Agents detect, remediate, report, and guard around the clock, while you stay in control from a single dashboard.',
    Icon: Radar,
  },
];

export function WorkflowSection() {
  return (
    <section id="workflow" className="px-6 py-16 max-[760px]:px-4 max-[760px]:py-12">
      <div className="mx-auto grid max-w-[1120px] grid-cols-[0.96fr_1.04fr] gap-8 max-[960px]:grid-cols-1">
        <article className="relative min-h-[620px] overflow-hidden rounded-[26px] border border-[#8a2c34] bg-[radial-gradient(120%_100%_at_30%_0%,#8a2c34,#77262d_55%,#5e1d23)] shadow-[0_28px_90px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] max-[960px]:min-h-[540px] max-[640px]:min-h-[500px]">
          <AsciiDrones count={5} color="#f3c9cd" />
          <div
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(94,29,35,0.1)_0%,transparent_42%,rgba(36,12,14,0.5)_100%)]"
            aria-hidden="true"
          />
          <div className="relative z-10 flex min-h-[620px] flex-col p-9 max-[960px]:min-h-[540px] max-[640px]:min-h-[500px] max-[640px]:p-6">
            <Eyebrow Icon={Sparkles}>How it works</Eyebrow>
            <h2 className="mt-8 max-w-[410px] text-[2.45rem] font-[630] leading-[1.12] tracking-[0] text-white max-[640px]:text-[2rem]">
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

        <div className="relative flex flex-col justify-between gap-7 py-7 max-[960px]:py-0">
          <div className="absolute left-[74px] top-[32px] h-[calc(100%-64px)] border-l border-dashed border-[#8a4248] max-[640px]:left-9" aria-hidden="true" />
          {steps.map(({ step, title, copy, Icon }) => (
            <article
              className="relative z-10 grid min-h-[184px] grid-cols-[88px_1fr] gap-8 rounded-[20px] border border-[#36262a] bg-[#100b0c]/88 p-9 shadow-[0_20px_56px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-[8px] max-[640px]:grid-cols-1 max-[640px]:gap-5 max-[640px]:p-6"
              key={step}
            >
              <div className="grid size-20 place-items-center rounded-[14px] border border-[#36262a] bg-[#241a1d] text-[#c06a71] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] max-[640px]:size-16">
                <Icon size={39} strokeWidth={1.8} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="font-mono text-[0.88rem] font-[760] text-[#d98a90]">{step}</p>
                <h3 className="mt-4 text-[1.35rem] font-[680] leading-[1.18] tracking-[0] text-[#f2eaeb] max-[640px]:text-[1.2rem]">
                  {title}
                </h3>
                <p className="mt-4 max-w-[460px] text-[0.95rem] leading-[1.62] text-[#9a8689]">
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
