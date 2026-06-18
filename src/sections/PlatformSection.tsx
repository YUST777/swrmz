import { FileText, ScanSearch, ShieldCheck, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ConsolePreview } from '../components/ConsolePreview';

const pillars: Array<{ label: string; copy: string; Icon: LucideIcon }> = [
  { label: 'Detect', copy: 'Continuous vulnerability scanning across code, deps, and infra.', Icon: ScanSearch },
  { label: 'Remediate', copy: 'Safe, reviewable auto-fixes pushed straight to your stack.', Icon: Wrench },
  { label: 'Report', copy: 'Audit-ready reports generated from every finding and fix.', Icon: FileText },
  { label: 'Guard', copy: 'Real-time log watching that locks down threats on sight.', Icon: ShieldCheck },
];

export function PlatformSection() {
  return (
    <section id="platform" className="px-6 pb-8 pt-20 max-[760px]:px-4 max-[760px]:pt-14">
      <div className="mx-auto grid max-w-[1120px] grid-cols-[0.78fr_1.22fr] items-center gap-12 max-[920px]:grid-cols-1 max-[920px]:gap-10">
        <div>
          <h2 className="max-w-[410px] text-[2rem] font-[630] leading-[1.08] tracking-[0] text-[#f2eaeb] max-[760px]:text-[1.8rem]">
            One swarm.
            <br />
            <span className="font-[480] text-[#a89799]">Zero blind spots.</span>
          </h2>
          <p className="mt-5 max-w-[380px] text-[0.9rem] leading-[1.75] text-[#a89799]">
            A coordinated swarm of AI agents that find, fix, document, and
            defend, so nothing slips through.
          </p>

          <ul className="mt-7 flex flex-col gap-4">
            {pillars.map(({ label, copy, Icon }) => (
              <li className="flex gap-3" key={label}>
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg border border-[#2f2226] bg-[#1d1518] text-[#c0444c]">
                  <Icon size={16} strokeWidth={2} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[0.82rem] font-[680] text-[#f2eaeb]">{label}</p>
                  <p className="mt-0.5 text-[0.74rem] leading-[1.5] text-[#a89799]">{copy}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <ConsolePreview />
      </div>
    </section>
  );
}
