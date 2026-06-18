import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
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

const fieldClass =
  'min-h-[52px] w-full rounded-[10px] border border-[#2f2226] bg-[#181114] px-4 text-[0.9rem] text-[#f2eaeb] outline-none transition-colors placeholder:text-[#6e5658] focus:border-[#8a2c34]';
const oauthBtn =
  'flex min-h-[52px] cursor-pointer items-center justify-center gap-2.5 rounded-[10px] border border-[#2f2226] bg-[#181114] text-[0.86rem] font-[600] text-[#f2eaeb] transition-colors hover:border-[#5e3a3e] hover:bg-[#1d1518] disabled:cursor-not-allowed disabled:opacity-60';

export function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState<'form' | 'google' | 'github' | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading('form');
    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(null);
      if (error) return setError(error.message);
      window.location.href = '/';
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      setLoading(null);
      if (error) return setError(error.message);
      setNotice('Check your email to confirm your account, then sign in.');
      setMode('signin');
    }
  };

  const forgot = async () => {
    setError('');
    setNotice('');
    if (!email) return setError('Enter your email first, then tap "Forgot password?".');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) return setError(error.message);
    setNotice(`Password reset link sent to ${email}.`);
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
      {/* left — background image, full bleed */}
      <div className="relative overflow-hidden border-r border-[#2b1f22] max-[820px]:hidden">
        <div className="absolute inset-0 bg-[url('/background.webp')] bg-cover bg-center" aria-hidden="true" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(94,29,35,0.45)_0%,rgba(12,8,9,0.35)_50%,rgba(12,8,9,0.85)_100%)] mix-blend-multiply" aria-hidden="true" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_30%_10%,rgba(192,68,76,0.3),transparent_60%)]" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 right-0 p-12 max-[1100px]:p-8">
          <p className="max-w-[340px] text-[1.4rem] font-[620] leading-[1.25] text-white">
            The swarm finds, fixes, and reports, while you sleep.
          </p>
        </div>
      </div>

      {/* right — form */}
      <div className="flex flex-col justify-center px-[8%] py-12 max-[1100px]:px-[6%] max-[820px]:px-6 max-[820px]:py-10">
        <div className="mx-auto flex w-full max-w-[440px] flex-col gap-7">
        <div className="flex flex-col items-center gap-3 text-center">
          <BrandMark />
          <h1 className="text-[2.6rem] font-[760] leading-[1.05] tracking-[-0.01em] text-[#f2eaeb] max-[640px]:text-[2.1rem]">
            {mode === 'signin' ? 'Welcome Back' : 'Create account'}
          </h1>
          <p className="text-[0.9rem] text-[#a89799]">
            {mode === 'signin'
              ? 'Welcome back to SWRMZ \u2014 continue your journey'
              : 'Join SWRMZ \u2014 deploy the swarm in minutes'}
          </p>
        </div>

        {error ? (
          <p className="rounded-[8px] border border-[#8a2c34]/50 bg-[#2a1216] px-3 py-2 text-[0.78rem] text-[#f0b9bd]">
            {error}
          </p>
        ) : null}
        {notice && !error ? (
          <p className="rounded-[8px] border border-[#3b292d] bg-[#181114] px-3 py-2 text-[0.78rem] text-[#a89799]">
            {notice}
          </p>
        ) : null}

        <form className="flex flex-col gap-5" onSubmit={submit}>
          <label className="flex flex-col gap-2">
            <span className="text-[0.86rem] font-[620] text-[#f2eaeb]">Your email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className={fieldClass}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[0.86rem] font-[620] text-[#f2eaeb]">Password</span>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={`${fieldClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a89799] transition-colors hover:text-[#f2eaeb]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-[0.84rem] text-[#a89799]">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="size-4 cursor-pointer accent-[#77262d]"
              />
              Remember me
            </label>
            <button
              type="button"
              onClick={forgot}
              className="text-[0.84rem] font-[600] text-[#d98a90] transition-colors hover:text-[#f0b9bd]"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading === 'form'}
            className="flex min-h-[52px] cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-[#77262d] text-[0.92rem] font-[700] text-white transition-colors hover:bg-[#8a2c34] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading === 'form' ? <Loader2 size={18} className="animate-spin" /> : null}
            {mode === 'signin' ? 'Sign In' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-[0.86rem] text-[#a89799]">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError('');
              setNotice('');
            }}
            className="font-[700] text-[#f2eaeb] transition-colors hover:text-[#d98a90]"
          >
            {mode === 'signin' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>

        <div className="flex items-center gap-3 text-[0.68rem] uppercase tracking-wider text-[#6e5658]">
          <span className="h-px flex-1 bg-[#2b1f22]" />
          or continue with
          <span className="h-px flex-1 bg-[#2b1f22]" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button type="button" disabled={loading === 'google'} onClick={() => oauth('google')} className={oauthBtn}>
            {loading === 'google' ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
            Google
          </button>
          <button type="button" disabled={loading === 'github'} onClick={() => oauth('github')} className={oauthBtn}>
            {loading === 'github' ? <Loader2 size={16} className="animate-spin" /> : <GitHubIcon />}
            GitHub
          </button>
        </div>
        </div>
      </div>
    </main>
  );
}
