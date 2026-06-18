import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowUpRight,
  Bug,
  Check,
  Database,
  FileText,
  Info,
  LayoutDashboard,
  Plus,
  Search,
  ShieldCheck,
  Wrench,
} from 'lucide-react';

type TabId = 'dashboard' | 'threats' | 'fixes' | 'reports';

type TabConfig = {
  id: TabId;
  label: string;
  Icon: LucideIcon;
  badge?: string;
  header: string;
  description: string;
};

const TABS: TabConfig[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    Icon: LayoutDashboard,
    header: 'Security Posture',
    description: 'Live overview of your swarm activity.',
  },
  {
    id: 'threats',
    label: 'Threats',
    Icon: Bug,
    badge: '14',
    header: 'Open Findings',
    description: 'Vulnerabilities detected across your stack.',
  },
  {
    id: 'fixes',
    label: 'Remediation',
    Icon: Wrench,
    badge: '8',
    header: 'Pending Fixes',
    description: 'Patches the swarm is ready to ship.',
  },
  {
    id: 'reports',
    label: 'Reports',
    Icon: FileText,
    header: 'Audit Archive',
    description: 'Reports and guarded log exports.',
  },
];

export function ConsolePreview() {
  const [active, setActive] = useState<TabConfig>(TABS[0]);

  return (
    <div className="flex w-full items-center justify-center antialiased">
      <div className="group relative m-0 w-full max-w-xl overflow-hidden rounded-3xl border border-[#2f2226] bg-[#15100f] shadow-[0_40px_120px_rgba(0,0,0,0.6)] transition-all duration-500 hover:-translate-y-1 sm:rounded-[2rem]">
        <div className="relative z-10 space-y-1.5 p-4 sm:p-6">
          <h2 className="font-mono text-xs uppercase tracking-wide text-[#a89799]">SWRMZ Console</h2>
          <p className="max-w-[480px] text-lg font-medium leading-snug text-[#f2eaeb] sm:text-2xl">
            The swarm finds, fixes, and reports, all in one place.
          </p>
        </div>

        <div className="relative h-[260px] w-full overflow-hidden rounded-2xl sm:h-[300px] sm:rounded-[2rem]">
          <div className="absolute left-16 top-16 h-full w-full rounded-3xl border border-[#2f2226]/60 bg-[#1d1518] opacity-80" />
          <div className="absolute left-24 top-8 flex h-full w-full flex-col overflow-hidden rounded-tl-3xl bg-[#120c0e] shadow-xl ring-6 ring-[#2f2226]">
            <div className="relative flex items-center rounded-tl-3xl border-b border-[#2f2226]/80 px-5 py-4 backdrop-blur-sm">
              <div className="flex gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[#4f3c3e]" />
                <div className="h-2 w-2 rounded-full bg-[#4f3c3e]" />
                <div className="h-2 w-2 rounded-full bg-[#4f3c3e]" />
              </div>
              <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
                <span className="font-mono text-xs uppercase text-[#a89799]/60">swrmz // console</span>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              <div className="flex w-36 flex-col gap-1 border-r border-[#2f2226]/60 bg-[#0e0a0b]/40 p-2 pt-6">
                {TABS.map((tab) => {
                  const isActive = active.id === tab.id;
                  const Icon = tab.Icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActive(tab)}
                      className={`relative flex cursor-pointer items-center gap-1.5 rounded-xl p-2 text-xs transition-colors ${
                        isActive
                          ? 'border border-[#412c30] bg-[#221a1c] text-[#f2eaeb]'
                          : 'border border-transparent text-[#a89799] hover:text-[#f2eaeb]'
                      }`}
                      type="button"
                    >
                      {isActive ? (
                        <span className="absolute left-0 h-4 w-[2px] rounded-full bg-[#c0444c]" />
                      ) : null}
                      <Icon size={14} className="relative z-20 shrink-0" strokeWidth={2} />
                      <span className="relative z-20 truncate font-medium">{tab.label}</span>
                      {tab.badge ? (
                        <span
                          className={`relative z-20 ml-auto rounded-md px-1 py-0.5 text-[8px] leading-none tabular-nums ${
                            isActive
                              ? 'border border-[#c0444c]/30 bg-[#c0444c]/15 text-[#d98a90]'
                              : 'border border-transparent bg-[#221a1c] text-[#a89799]'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <div className="relative flex flex-1 flex-col gap-4 overflow-hidden bg-[#120c0e] p-5 pt-6">
                <header className="flex flex-col gap-0.5">
                  <h3 className="line-clamp-1 text-xs font-semibold uppercase tracking-tight text-[#f2eaeb] opacity-60">
                    {active.header}
                  </h3>
                  <p className="line-clamp-1 text-[10px] font-normal leading-tight text-[#a89799]">
                    {active.description}
                  </p>
                </header>

                <div
                  key={active.id}
                  className="flex-1"
                  style={{ animation: 'console-in 0.3s cubic-bezier(0.23,1,0.32,1)' }}
                >
                  {active.id === 'dashboard' ? <DashboardPane /> : null}
                  {active.id === 'threats' ? <ThreatsPane /> : null}
                  {active.id === 'fixes' ? <FixesPane /> : null}
                  {active.id === 'reports' ? <ReportsPane /> : null}
                </div>

                <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-10 bg-gradient-to-t from-[#120c0e] to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardPane() {
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="relative overflow-hidden rounded-xl border border-[#2f2226] bg-gradient-to-br from-[#15100f] to-[#221a1c]/40 p-3.5">
        <div className="relative z-10 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-medium text-[#a89799]">Security score</span>
            <ArrowUpRight size={12} className="text-[#c0444c]" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xl font-medium tracking-tight text-[#f2eaeb]">96.4%</span>
            <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-[#221a1c]">
              <div className="h-full rounded-full bg-[#c0444c]" style={{ width: '96.4%' }} />
            </div>
          </div>
          <span className="text-[9px] text-[#a89799]">Across 512 monitored assets</span>
        </div>
        <div className="absolute -bottom-2 -right-2 rotate-12 scale-150 opacity-5">
          <ShieldCheck size={64} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center justify-between rounded-xl border border-[#2f2226] bg-[#120c0e]/50 p-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-[#f2eaeb]">1,204</span>
            <span className="text-[8px] font-medium uppercase text-[#a89799]">Vulns found</span>
          </div>
          <Search size={14} className="opacity-20" />
        </div>
        <div className="flex items-center justify-between rounded-xl border border-[#2f2226] bg-[#120c0e]/50 p-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-[#f2eaeb]">98%</span>
            <span className="text-[8px] font-medium uppercase text-[#a89799]">Auto-fixed</span>
          </div>
          <Info size={14} className="opacity-20" />
        </div>
      </div>
    </div>
  );
}

const findings = [
  { id: 'CVE-2026-3145', sev: 'Critical', tag: 'patch ready', color: 'bg-[#e0484f]' },
  { id: 'CVE-2026-2980', sev: 'High', tag: 'patch ready', color: 'bg-amber-400' },
  { id: 'CVE-2026-2771', sev: 'Medium', tag: 'reviewing', color: 'bg-[#d98a90]' },
];

function ThreatsPane() {
  return (
    <div className="flex h-full flex-col not-prose">
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-[#2f2226] bg-[#120c0e]/50">
        <div className="flex items-center justify-between border-b border-[#2f2226] bg-[#221a1c]/30 px-3 py-2">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-[#a89799]">Open findings</span>
          <div className="flex items-center gap-1.5 rounded-md border border-[#2f2226] bg-[#120c0e] px-1.5 py-0.5">
            <Search size={10} className="text-[#a89799]/50" />
            <span className="text-[8px] font-medium text-[#a89799]">Search</span>
          </div>
        </div>
        <div className="flex flex-col gap-0.5 p-1">
          {findings.map((f) => (
            <div key={f.id} className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-[#221a1c]/40">
              <div className="relative flex h-6 w-6 items-center justify-center rounded-md border border-[#2f2226] bg-[#221a1c]">
                <Bug size={11} className="text-[#a89799]" />
                <div className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-[#120c0e] ${f.color}`} />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-mono text-[10px] font-medium text-[#f2eaeb]">{f.id}</span>
                <span className="truncate text-[8px] text-[#a89799]">
                  {f.sev} severity • {f.tag}
                </span>
              </div>
              <ArrowUpRight size={12} className="text-[#a89799] opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FixesPane() {
  const cards = [
    { title: 'Apply patch', desc: 'Bump lodash to 4.17.21.', Icon: Wrench },
    { title: 'Open fix PR', desc: 'Sanitize log injection.', Icon: Check },
  ];
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <div
            key={c.title}
            className="group relative flex flex-col gap-3 overflow-hidden rounded-xl border border-[#2f2226] bg-[#120c0e]/50 p-3.5"
          >
            <div className="z-10 flex flex-col gap-1">
              <span className="text-[12px] font-medium leading-tight text-[#f2eaeb]">{c.title}</span>
              <span className="text-[9px] leading-tight text-[#a89799]">{c.desc}</span>
            </div>
            <button
              type="button"
              className="z-10 flex w-fit items-center gap-1.5 rounded-md bg-[#77262d] px-2 py-1 text-[8px] font-semibold text-white transition-transform active:scale-95 group-hover:bg-[#8a2c34]"
            >
              <Wrench size={8} strokeWidth={3} />
              Ship fix
            </button>
          </div>
        ))}
      </div>
      <div className="mt-auto flex items-center justify-between rounded-xl border border-[#2f2226] bg-[#221a1c]/20 p-3">
        <div className="flex items-center gap-2">
          <div className="rounded-md border border-[#2f2226] bg-[#120c0e] px-1.5 py-1">
            <ShieldCheck size={10} className="text-[#c0444c]" />
          </div>
          <span className="text-[9px] font-medium text-[#a89799]">Auto-remediation is on</span>
        </div>
        <Plus size={12} className="text-[#a89799]/50" />
      </div>
    </div>
  );
}

const archive = [
  { file: 'soc2_report_q2.pdf', size: '2.4 MB', type: 'PDF', Icon: FileText },
  { file: 'pentest_summary.pdf', size: '1.1 MB', type: 'PDF', Icon: FileText },
  { file: 'guarded_logs.json', size: '48 MB', type: 'JSON', Icon: Database },
  { file: 'fix_history.csv', size: '4 KB', type: 'CSV', Icon: FileText },
];

function ReportsPane() {
  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden">
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-[#2f2226] bg-[#120c0e]/50">
        <div className="flex items-center justify-between border-b border-[#2f2226] bg-[#221a1c]/30 px-3 py-2">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-[#a89799]">Reports & guarded logs</span>
          <Database size={12} className="text-[#a89799]/30" />
        </div>
        <div className="flex-1 overflow-y-auto p-1">
          {archive.map((item) => (
            <div
              key={item.file}
              className="group flex cursor-pointer items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-[#221a1c]/40"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-md border border-[#2f2226] bg-[#221a1c]/50 text-[#a89799] transition-colors group-hover:bg-[#c0444c]/10 group-hover:text-[#c0444c]">
                <item.Icon size={12} />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[10px] font-medium text-[#f2eaeb]">{item.file}</span>
                <span className="text-[8px] uppercase tabular-nums text-[#a89799]">
                  {item.size} • {item.type}
                </span>
              </div>
              <ArrowUpRight size={10} className="text-[#a89799] opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
