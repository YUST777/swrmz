import { ArrowRight, Check, Circle, Gauge } from 'lucide-react';
import { Eyebrow } from '../components/Eyebrow';

type Plan = {
  name: string;
  price: string;
  cadence: string;
  description: string;
  badge?: string;
  badgeClass?: string;
  cta: string;
  highlighted: boolean;
  groups: Array<{
    title: string;
    items: string[];
    muted?: boolean;
  }>;
};

const plans: Plan[] = [
  {
    name: 'Seed',
    price: '$0',
    cadence: '/month',
    description: 'For small teams locking down their first environments.',
    badge: 'Free forever',
    badgeClass: 'bg-[#b3434b] text-white',
    cta: 'Start free',
    highlighted: false,
    groups: [
      {
        title: 'Detection',
        items: ['Up to 5 assets', '1 environment', 'Daily vulnerability scans', 'Email and in-app alerts'],
      },
      {
        title: 'Remediation',
        items: ['Guided fix suggestions', '7-day finding history', 'Basic anomaly detection'],
        muted: true,
      },
      {
        title: 'Support',
        items: ['Community forum', 'Documentation access', 'Priority updates'],
        muted: true,
      },
    ],
  },
  {
    name: 'Scale',
    price: '$49',
    cadence: '/month',
    description: 'For teams that want continuous detection, auto-fixes, and audit-ready reports.',
    badge: 'Most popular',
    badgeClass: 'bg-[#77262d] text-white',
    cta: 'Get Early Access',
    highlighted: true,
    groups: [
      {
        title: 'Detection',
        items: ['Up to 500 assets', 'Unlimited environments', 'Continuous multi-agent scans', 'Dependency and IaC coverage'],
      },
      {
        title: 'Remediation',
        items: ['Automated patch requests', '30-day finding history', 'Advanced anomaly detection', 'Log guarding, always on'],
      },
      {
        title: 'Support',
        items: ['Priority email support', 'Slack and business hours', 'Dedicated onboarding'],
      },
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    cadence: '',
    description: 'For orgs that need SSO, custom policies, and SLA-backed defense.',
    cta: 'Talk to us',
    highlighted: false,
    groups: [
      {
        title: 'Detection',
        items: ['Unlimited assets', 'Unlimited environments', 'Cloud, edge and on-prem', 'Dedicated private agents'],
      },
      {
        title: 'Remediation',
        items: ['Custom remediation policies', '90-day+ retention', 'Real-time threat lockdown', 'Compliance report exports'],
      },
      {
        title: 'Support',
        items: ['Priority support and SLA', 'Live chat and success hub', 'Dedicated account manager'],
      },
    ],
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="px-6 py-14 max-[760px]:px-4 max-[760px]:py-12">
      <div className="mx-auto max-w-[1120px] rounded-[14px] border border-[#2b1f22] bg-[#140f11]/80 px-7 py-9 shadow-[0_28px_90px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] max-[760px]:px-4">
        <div className="mx-auto max-w-[520px] text-center">
          <Eyebrow Icon={Gauge}>Pricing</Eyebrow>
          <h2 className="mt-5 text-[2.1rem] font-[620] leading-[1.12] tracking-[0] text-[#f2eaeb] max-[640px]:text-[1.75rem]">
            Simple. Transparent.
            <br />
            <span className="font-[470] text-[#a89799]">No surprise invoices.</span>
          </h2>
          <div className="mt-6 inline-flex rounded-[7px] border border-[#3b292d] bg-[#1d1518] p-1 text-[0.68rem] font-[720] text-[#c06a71]">
            <span className="rounded-[5px] bg-[#15100f] px-4 py-2 shadow-sm">Monthly</span>
            <span className="px-4 py-2">Annual -10%</span>
          </div>
        </div>

        <div className="mt-9 grid grid-cols-3 gap-5 max-[980px]:grid-cols-1">
          {plans.map((plan) => (
            <article
              className={`relative flex min-h-[620px] flex-col rounded-[9px] border p-6 ${
                plan.highlighted
                  ? 'border-[#412c30] bg-[#1d1518] shadow-[0_22px_58px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]'
                  : 'border-[#2b1f22] bg-[#181114]/85 shadow-[0_18px_48px_rgba(22,57,53,0.05)]'
              }`}
              key={plan.name}
            >
              <div className="flex min-h-[24px] items-start justify-between gap-3">
                <h3 className="text-[0.86rem] font-[700] text-[#f2eaeb]">{plan.name}</h3>
                {plan.badge ? (
                  <span className={`rounded-[4px] px-2.5 py-1 font-mono text-[0.55rem] font-[760] uppercase ${plan.badgeClass}`}>
                    {plan.badge}
                  </span>
                ) : null}
              </div>
              <p className="mt-5 text-[1.38rem] font-[720] leading-none text-[#f2eaeb]">
                {plan.price}
                {plan.cadence ? (
                  <span className="text-[0.7rem] font-[560] text-[#a89799]">{plan.cadence}</span>
                ) : null}
              </p>
              <p className="mt-4 min-h-[56px] text-[0.76rem] leading-[1.55] text-[#a89799]">
                {plan.description}
              </p>

              <div className="mt-6 space-y-6">
                {plan.groups.map((group) => (
                  <div key={group.title}>
                    <p className="text-[0.66rem] font-[760] text-[#c2b2b4]">{group.title}</p>
                    <ul className="mt-3 space-y-2.5">
                      {group.items.map((item) => (
                        <li className="flex items-start gap-2 text-[0.72rem] leading-[1.45] text-[#8f7c7f]" key={item}>
                          {group.muted ? (
                            <Circle className="mt-0.5 size-3.5 shrink-0 text-[#9a8689]" strokeWidth={2} />
                          ) : (
                            <Check className="mt-0.5 size-3.5 shrink-0 text-[#d98a90]" strokeWidth={2.5} />
                          )}
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <a
                className={`mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-[7px] border px-4 text-[0.78rem] font-[720] transition-transform duration-300 hover:-translate-y-0.5 ${
                  plan.highlighted
                    ? 'border-[#6a212a] bg-[#77262d] text-[#ffffff] shadow-[0_16px_30px_rgba(119,38,45,0.18)]'
                    : 'border-[#5e3a3e] bg-[#15100f] text-[#d98a90]'
                }`}
                href="#early-access"
              >
                {plan.cta}
                <ArrowRight size={14} strokeWidth={2.4} aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>
        <p className="mt-7 text-center text-[0.75rem] text-[#a89799]">
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  );
}
