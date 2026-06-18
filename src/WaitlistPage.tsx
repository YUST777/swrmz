import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { BrandMark } from './components/BrandMark';
import { supabase } from './lib/supabase';

// Full public launch target — drives the countdown.
const LAUNCH = new Date('2026-12-01T00:00:00Z').getTime();

function useCountdown(target: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return { days, hours, minutes, seconds };
}

export function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const submitted = useRef(false);
  const { days, hours, minutes, seconds } = useCountdown(LAUNCH);

  // Prefill with the signed-in user's email if they arrived from login.
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
    });
  }, []);

  const join = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || submitted.current) return;
    setError('');
    setLoading(true);
    const { error } = await supabase.from('waitlist').insert({ email });
    setLoading(false);
    if (error) {
      if (error.code === '23505') {
        submitted.current = true;
        setDone(true);
        return;
      }
      setError(error.message);
      return;
    }
    submitted.current = true;
    setDone(true);
  };

  const units = [
    { label: 'Days', value: days },
    { label: 'Hours', value: hours },
    { label: 'Minutes', value: minutes },
    { label: 'Seconds', value: seconds },
  ];

  return (
    <main className="relative grid min-h-[100svh] place-items-center overflow-hidden bg-[#0b0809] px-4 py-10 font-['Inter',system-ui,sans-serif] text-[#f2eaeb]">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-[-20%] -z-10 h-[60%] bg-[radial-gradient(60%_100%_at_50%_100%,rgba(150,47,55,0.4),rgba(119,38,45,0.12)_45%,transparent_75%)] blur-[40px]"
        aria-hidden="true"
      />

      <div className="flex w-full max-w-[600px] flex-col items-center gap-7 rounded-[24px] border border-[#2b1f22] bg-[#100b0c]/80 px-8 py-12 text-center shadow-[0_40px_120px_rgba(0,0,0,0.6)] backdrop-blur-[10px] max-[560px]:px-5 max-[560px]:py-9">
        <BrandMark />

        <span className="inline-flex items-center gap-2 rounded-full border border-[#3b292d] bg-[#181114] px-3 py-1.5 font-mono text-[0.62rem] font-[700] uppercase tracking-wider text-[#a89799]">
          <span className="size-1.5 animate-pulse rounded-full bg-[#c0444c]" />
          Available in early access
        </span>

        <div className="flex flex-col gap-3">
          <h1 className="text-[2.8rem] font-[720] leading-[1.02] tracking-[-0.02em] text-[#f2eaeb] max-[560px]:text-[2.1rem]">
            Get early access
          </h1>
          <p className="mx-auto max-w-[380px] text-[0.9rem] leading-[1.55] text-[#a89799]">
            Be among the first to deploy the swarm. Join the waitlist and we'll
            notify you the moment SWRMZ goes live.
          </p>
        </div>

        {done ? (
          <div className="flex w-full max-w-[440px] items-center justify-center gap-2 rounded-[10px] border border-[#8a2c34]/50 bg-[#1d1518] px-4 py-3.5 text-[0.86rem] font-[600] text-[#f2eaeb]">
            <Check size={16} className="text-[#d98a90]" />
            You're on the list. We'll be in touch.
          </div>
        ) : (
          <form onSubmit={join} className="flex w-full max-w-[440px] flex-col gap-2">
            <div className="flex items-center gap-2 rounded-[12px] border border-[#2f2226] bg-[#181114] p-1.5 pl-4 transition-colors focus-within:border-[#8a2c34] max-[480px]:flex-col max-[480px]:p-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="min-h-10 flex-1 bg-transparent text-[0.88rem] text-[#f2eaeb] outline-none placeholder:text-[#6e5658] max-[480px]:w-full max-[480px]:px-2"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[9px] bg-[#77262d] px-5 text-[0.84rem] font-[700] text-white transition-colors hover:bg-[#8a2c34] disabled:opacity-60 max-[480px]:w-full"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : null}
                Join waitlist
                {!loading ? <ArrowRight size={14} strokeWidth={2.4} /> : null}
              </button>
            </div>
            {error ? <p className="text-left text-[0.74rem] text-[#f0b9bd]">{error}</p> : null}
          </form>
        )}

        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {['JR', 'MP', 'NC', 'AK'].map((i) => (
              <span
                key={i}
                className="grid size-6 place-items-center rounded-full border border-[#100b0c] bg-[#3b292d] text-[0.5rem] font-[700] text-[#f0b9bd]"
              >
                {i}
              </span>
            ))}
          </div>
          <span className="text-[0.78rem] text-[#a89799]">Join 1,200+ others on the waitlist</span>
        </div>

        <div className="flex flex-col items-center gap-3 pt-1">
          <div className="flex items-center gap-3 max-[480px]:gap-2">
            {units.map((u, i) => (
              <div key={u.label} className="flex items-center gap-3 max-[480px]:gap-2">
                <div className="flex w-12 flex-col items-center">
                  <span className="text-[1.4rem] font-[720] leading-none tabular-nums text-[#f2eaeb] max-[480px]:text-[1.2rem]">
                    {String(u.value).padStart(2, '0')}
                  </span>
                  <span className="mt-1 font-mono text-[0.56rem] uppercase tracking-wider text-[#6e5658]">
                    {u.label}
                  </span>
                </div>
                {i < units.length - 1 ? <span className="-mt-3 text-[#3b292d]">:</span> : null}
              </div>
            ))}
          </div>
          <p className="font-mono text-[0.6rem] uppercase tracking-wider text-[#6e5658]">
            Left until full release
          </p>
        </div>
      </div>
    </main>
  );
}
