import { useState } from 'react';
import { Apple, ArrowRight, Building2, Chrome, Github, KeyRound } from 'lucide-react';
import { BrandMark } from './components/BrandMark';

const socials = [
  { label: 'Apple', Icon: Apple },
  { label: 'Google', Icon: Chrome },
  { label: 'GitHub', Icon: Github },
];

export function LoginPage() {
  const [email, setEmail] = useState('');

  return (
    <main className="grid min-h-[100svh] place-items-center bg-[#0b0809] p-4 font-['Inter',system-ui,sans-serif] text-[#f2eaeb] sm:p-8">
      <div className="grid w-full max-w-[940px] grid-cols-2 overflow-hidden rounded-[22px] border border-[#2b1f22] bg-[#100b0c] shadow-[0_40px_120px_rgba(0,0,0,0.6)] max-[820px]:grid-cols-1">
        {/* left — brand image */}
        <div className="relative min-h-[560px] overflow-hidden border-r border-[#2b1f22] max-[820px]:hidden">
          <div
            className="absolute inset-0 bg-[url('/background.webp')] bg-cover bg-center"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(94,29,35,0.45)_0%,rgba(12,8,9,0.35)_50%,rgba(12,8,9,0.85)_100%)] mix-blend-multiply"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_30%_10%,rgba(192,68,76,0.3),transparent_60%)]" aria-hidden="true" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <p className="max-w-[300px] text-[1.25rem] font-[620] leading-[1.25] text-white">
              The swarm finds, fixes, and reports, while you sleep.
            </p>
          </div>
        </div>

        {/* right — form */}
        <div className="flex flex-col gap-6 p-9 max-[820px]:p-7">
          <BrandMark />

          <div className="flex flex-col gap-2">
            <h1 className="text-[2.4rem] font-[680] leading-[1.05] tracking-[-0.01em] text-[#f2eaeb] max-[640px]:text-[2rem]">
              Get started
            </h1>
            <p className="max-w-[320px] text-[0.84rem] leading-[1.55] text-[#a89799]">
              Sign in via email, SSO, or a passkey to reach your SWRMZ console.
            </p>
          </div>

          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => e.preventDefault()}
          >
            <label className="flex flex-col gap-2">
              <span className="text-[0.7rem] font-[640] text-[#a89799]">Email</span>
              <div className="flex items-center gap-2 rounded-[10px] border border-[#2f2226] bg-[#181114] px-3.5 transition-colors focus-within:border-[#8a2c34]">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="min-h-12 flex-1 bg-transparent text-[0.84rem] text-[#f2eaeb] outline-none placeholder:text-[#6e5658]"
                />
                <button
                  type="submit"
                  aria-label="Continue with email"
                  className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full bg-[#77262d] text-white transition-colors hover:bg-[#8a2c34]"
                >
                  <ArrowRight size={15} strokeWidth={2.4} />
                </button>
              </div>
            </label>

            <div className="grid grid-cols-3 gap-3">
              {socials.map(({ label, Icon }) => (
                <button
                  key={label}
                  type="button"
                  aria-label={`Sign in with ${label}`}
                  className="grid min-h-12 cursor-pointer place-items-center rounded-[10px] border border-[#2f2226] bg-[#181114] text-[#f2eaeb] transition-colors hover:border-[#5e3a3e] hover:bg-[#1d1518]"
                >
                  <Icon size={18} strokeWidth={2} />
                </button>
              ))}
            </div>

            <button
              type="button"
              className="mx-auto flex items-center gap-2 text-[0.74rem] font-[600] text-[#a89799] transition-colors hover:text-[#f2eaeb]"
            >
              <KeyRound size={13} strokeWidth={2.2} />
              Sign in with a passkey
            </button>
          </form>

          <div className="flex items-center gap-3 text-[0.66rem] uppercase tracking-wider text-[#6e5658]">
            <span className="h-px flex-1 bg-[#2b1f22]" />
            or
            <span className="h-px flex-1 bg-[#2b1f22]" />
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              className="flex min-h-12 cursor-pointer items-center gap-3 rounded-[10px] border border-[#2f2226] bg-[#181114] px-4 text-left text-[0.82rem] font-[600] text-[#f2eaeb] transition-colors hover:border-[#5e3a3e] hover:bg-[#1d1518]"
            >
              <span className="grid size-7 place-items-center rounded-md bg-[#221a1c] text-[#d98a90]">
                <Building2 size={15} strokeWidth={2.2} />
              </span>
              Continue with SSO
              <ArrowRight size={15} strokeWidth={2.2} className="ml-auto text-[#6e5658]" />
            </button>
            <button
              type="button"
              className="flex min-h-12 cursor-pointer items-center gap-3 rounded-[10px] border border-[#2f2226] bg-[#181114] px-4 text-left text-[0.82rem] font-[600] text-[#f2eaeb] transition-colors hover:border-[#5e3a3e] hover:bg-[#1d1518]"
            >
              <span className="grid size-7 place-items-center rounded-md bg-[#221a1c] text-[#d98a90]">
                <Github size={15} strokeWidth={2.2} />
              </span>
              Continue with GitHub Enterprise
              <ArrowRight size={15} strokeWidth={2.2} className="ml-auto text-[#6e5658]" />
            </button>
          </div>

          <p className="mt-auto text-[0.7rem] leading-[1.5] text-[#6e5658]">
            By continuing you agree to the SWRMZ Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </main>
  );
}
