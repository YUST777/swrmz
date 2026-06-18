import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { BrandMark } from './components/BrandMark';
import { supabase } from './lib/supabase';

export function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const submitted = useRef(false);

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

  return (
    <main className="relative grid min-h-[100svh] place-items-center overflow-hidden bg-[#0b0809] px-6 text-[#f2eaeb]">
      {/* grid + maroon glow background */}
      <div className="absolute inset-0 -z-20 bg-[#0b0809] bg-[linear-gradient(to_right,#1a1012_1px,transparent_1px),linear-gradient(to_bottom,#1a1012_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_180px,rgba(119,38,45,0.4),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_50%_120%,rgba(192,68,76,0.18),transparent)]" />
      </div>
      {/* film grain */}
      <div className="grain pointer-events-none absolute inset-0 -z-10 opacity-[0.05]" aria-hidden="true" />

      {/* logo, top-left */}
      <div className="absolute left-6 top-6">
        <BrandMark />
      </div>

      <div className="flex w-full max-w-[480px] flex-col items-center gap-7 text-center">
        <div className="flex flex-col gap-3">
          <h1 className="text-[3rem] font-[760] leading-[1.02] tracking-[-0.02em] text-[#f2eaeb] max-[560px]:text-[2.2rem]">
            Get early access
          </h1>
          <p className="mx-auto max-w-[400px] text-[0.92rem] leading-[1.6] text-[#a89799]">
            Be among the first to deploy the swarm. Join the waitlist and we'll
            notify you the moment SWRMZ goes live.
          </p>
        </div>

        {done ? (
          <div className="flex w-full max-w-[440px] items-center justify-center gap-2 rounded-[12px] border border-[#8a2c34]/50 bg-[#1d1518]/70 px-4 py-3.5 text-[0.88rem] font-[600] text-[#f2eaeb] backdrop-blur-[4px]">
            <Check size={16} className="text-[#d98a90]" />
            You're on the list. We'll be in touch.
          </div>
        ) : (
          <form onSubmit={join} className="flex w-full max-w-[440px] flex-col gap-2">
            <div className="flex items-center gap-2 rounded-[12px] border border-[#2f2226] bg-[#181114]/70 p-1.5 pl-4 backdrop-blur-[4px] transition-colors focus-within:border-[#8a2c34] max-[480px]:flex-col max-[480px]:p-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="min-h-10 flex-1 bg-transparent text-[0.9rem] text-[#f2eaeb] outline-none placeholder:text-[#6e5658] max-[480px]:w-full max-[480px]:px-2"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[9px] bg-[#77262d] px-5 text-[0.86rem] font-[700] text-white transition-colors hover:bg-[#8a2c34] disabled:opacity-60 max-[480px]:w-full"
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
                className="grid size-6 place-items-center rounded-full border border-[#0b0809] bg-[#3b292d] text-[0.5rem] font-[700] text-[#f0b9bd]"
              >
                {i}
              </span>
            ))}
          </div>
          <span className="text-[0.78rem] text-[#a89799]">Join 1,200+ others on the waitlist</span>
        </div>
      </div>
    </main>
  );
}
