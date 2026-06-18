import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Plus } from 'lucide-react';

const faqs = [
  {
    q: 'How does SWRMZ actually find vulnerabilities?',
    a: 'A swarm of specialized agents runs in parallel across your code, dependencies, infrastructure, and log streams, recon, analysis, then validated exploitation, so you only see findings that are real.',
  },
  {
    q: 'Does it fix the issues, or just flag them?',
    a: 'Both. Confirmed findings come with a generated patch. You can review and approve each fix, or let the swarm open and ship safe pull requests automatically based on your policy.',
  },
  {
    q: 'What environments does it support?',
    a: 'Point SWRMZ at GitHub/GitLab repos, AWS, GCP, Azure, bare metal, and your log streams. Agents map your attack surface across any environment in minutes.',
  },
  {
    q: 'Can I control what gets auto-remediated?',
    a: 'Yes. Guardrails let you set baselines and a fix-approval policy, so the swarm only auto-applies the changes you trust and pauses for review on everything else.',
  },
  {
    q: 'What do the reports look like?',
    a: 'Every finding, exploit proof, and fix is documented into audit-ready reports, SARIF output, an executive summary, and a remediation plan you can hand straight to auditors.',
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="px-6 py-20 max-[760px]:px-4 max-[760px]:py-14">
      <div className="mx-auto grid max-w-[1120px] grid-cols-2 gap-12 max-[920px]:grid-cols-1 max-[920px]:gap-8">
        <div className="flex flex-col gap-7">
          <div className="flex flex-col gap-4">
            <h2 className="max-w-[420px] text-[2.4rem] font-[630] leading-[1.1] tracking-[0] text-[#f2eaeb] max-[640px]:text-[1.9rem]">
              Questions,{' '}
              <span className="font-[470] text-[#a89799]">answered.</span>
            </h2>
            <p className="max-w-[440px] text-[0.95rem] leading-[1.7] text-[#a89799]">
              Everything you need to know about deploying the swarm. Can't find
              what you're looking for? Reach out and our team will help.
            </p>
          </div>
        </div>

        <div className="flex flex-col">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="border-b border-[#2b1f22]">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-[0.98rem] font-[640] text-[#f2eaeb]">{item.q}</span>
                  <Plus
                    size={18}
                    strokeWidth={2.4}
                    aria-hidden="true"
                    className={`shrink-0 text-[#d98a90] transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-[480px] pb-5 text-[0.88rem] leading-[1.65] text-[#a89799]">
                        {item.a}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
