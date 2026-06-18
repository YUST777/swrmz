import { useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { BrandMark } from './components/BrandMark';
import { supabase } from './lib/supabase';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="size-[18px]" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-[18px]" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.5 11.5 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

const inputShell =
  'flex items-center gap-2 rounded-[10px] border border-[#2f2226] bg-[#181114] px-3.5 transition-colors focus-within:border-[#8a2c34]';
const oauthBtn =
  'flex min-h-12 cursor-pointer items-center justify-center gap-2.5 rounded-[10px] border border-[#2f2226] bg-[#181114] px-4 text-[0.84rem] font-[600] text-[#f2eaeb] transition-colors hover:border-[#5e3a3e] hover:bg-[#1d1518] disabled:cursor-not-allowed disabled:opacity-60';

export function LoginPage() {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState<'email' | 'otp' | 'google' | 'github' | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError('');
    setNotice('');
    setLoading('email');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setLoading(null);
    if (error) {
      setError(error.message);
      return;
    }
    setStep('otp');
    setNotice(`We sent a 6-digit code to ${email}.`);
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (token.length < 6) return;
    setError('');
    setLoading('otp');
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
    setLoading(null);
    if (error) {
      setError(error.message);
      return;
    }
    window.location.href = '/';
  };

  const oauth = async (provider: 'google' | 'github') => {
    setError('');
    setLoading(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      setLoading(null);
      setError(error.message);
    }
  };

  return (
    <main className="grid min-h-[100svh] grid-cols-2 bg-[#100b0c] font-['Inter',system-ui,sans-serif] text-[#f2eaeb] max-[820px]:grid-cols-1">
      {/* left — brand image, full bleed */}
      <div className="relative overflow-hidden border-r border-[#2b1f22] max-[820px]:hidden">
        <div className="absolute inset-0 bg-[url('/background.webp')] bg-cover bg-center" aria-hidden="true" />
        <div
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(94,29,35,0.45)_0%,rgba(12,8,9,0.35)_50%,rgba(12,8,9,0.85)_100%)] mix-blend-multiply"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(120%_90%_at_30%_10%,rgba(192,68,76,0.3),transparent_60%)]"
          aria-hidden="true"
        />
        <div className="absolute bottom-0 left-0 right-0 p-12 max-[1100px]:p-8">
          <p className="max-w-[340px] text-[1.4rem] font-[620] leading-[1.25] text-white">
            The swarm finds, fixes, and reports, while you sleep.
          </p>
        </div>
      </div>

      {/* right — form */}
      <div className="flex flex-col justify-center px-[8%] py-12 max-[1100px]:px-[6%] max-[820px]:px-6 max-[820px]:py-10">
        <div className="mx-auto flex w-full max-w-[400px] flex-col gap-7">
          <BrandMark />

          <div className="flex flex-col gap-2">
            <h1 className="text-[2.6rem] font-[680] leading-[1.05] tracking-[-0.01em] text-[#f2eaeb] max-[640px]:text-[2.1rem]">
              {step === 'email' ? 'Get started' : 'Check your email'}
            </h1>
            <p className="max-w-[320px] text-[0.84rem] leading-[1.55] text-[#a89799]">
              {step === 'email'
                ? 'Sign in with your email, Google, or GitHub to reach your SWRMZ console.'
                : `Enter the 6-digit code we sent to ${email}.`}
            </p>
          </div>

          {error ? (
            <p className="rounded-[8px] border border-[#8a2c34]/50 bg-[#2a1216] px-3 py-2 text-[0.76rem] text-[#f0b9bd]">
              {error}
            </p>
          ) : null}
          {notice && !error ? (
            <p className="rounded-[8px] border border-[#3b292d] bg-[#181114] px-3 py-2 text-[0.76rem] text-[#a89799]">
              {notice}
            </p>
          ) : null}

          {step === 'email' ? (
            <form className="flex flex-col gap-4" onSubmit={sendOtp}>
              <label className="flex flex-col gap-2">
                <span className="text-[0.7rem] font-[640] text-[#a89799]">Email</span>
                <div className={inputShell}>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="min-h-12 flex-1 bg-transparent text-[0.84rem] text-[#f2eaeb] outline-none placeholder:text-[#6e5658]"
                  />
                  <button
                    type="submit"
                    disabled={loading === 'email'}
                    aria-label="Continue with email"
                    className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full bg-[#77262d] text-white transition-colors hover:bg-[#8a2c34] disabled:opacity-60"
                  >
                    {loading === 'email' ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <ArrowRight size={15} strokeWidth={2.4} />
                    )}
                  </button>
                </div>
              </label>

              <button type="button" disabled={loading === 'google'} onClick={() => oauth('google')} className={oauthBtn}>
                {loading === 'google' ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
                Continue with Google
              </button>

              <button type="button" disabled={loading === 'github'} onClick={() => oauth('github')} className={oauthBtn}>
                {loading === 'github' ? <Loader2 size={16} className="animate-spin" /> : <GitHubIcon />}
                Continue with GitHub
              </button>
            </form>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={verifyOtp}>
              <label className="flex flex-col gap-2">
                <span className="text-[0.7rem] font-[640] text-[#a89799]">Verification code</span>
                <div className={inputShell}>
                  <input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    autoFocus
                    value={token}
                    onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="min-h-12 flex-1 bg-transparent text-[1rem] tracking-[0.4em] text-[#f2eaeb] outline-none placeholder:tracking-[0.4em] placeholder:text-[#6e5658]"
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={loading === 'otp' || token.length < 6}
                className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-[#77262d] px-4 text-[0.84rem] font-[680] text-white transition-colors hover:bg-[#8a2c34] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading === 'otp' ? <Loader2 size={16} className="animate-spin" /> : null}
                Verify and continue
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setToken('');
                  setError('');
                  setNotice('');
                }}
                className="mx-auto flex items-center gap-1.5 text-[0.74rem] font-[600] text-[#a89799] transition-colors hover:text-[#f2eaeb]"
              >
                <ArrowLeft size={13} strokeWidth={2.2} />
                Use a different email
              </button>
            </form>
          )}

          <p className="text-[0.7rem] leading-[1.5] text-[#6e5658]">
            By continuing you agree to the SWRMZ Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </main>
  );
}
