import { useState } from 'react';
import { BrandMark } from './components/BrandMark';
import { supabase } from './lib/supabase';

export function SoonPage() {
  const [signingOut, setSigningOut] = useState(false);

  const signOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <main className="relative grid min-h-[100svh] place-items-center overflow-hidden bg-[#0b0809] px-6 font-['Inter',system-ui,sans-serif] text-[#f2eaeb]">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(150,47,55,0.28),rgba(119,38,45,0.08)_50%,transparent_72%)] blur-[70px]"
        aria-hidden="true"
      />
      <div className="flex max-w-[440px] flex-col items-center gap-6 text-center">
        <BrandMark />
        <h1 className="text-[3.2rem] font-[780] leading-[1] tracking-[-0.02em] text-[#f2eaeb] max-[640px]:text-[2.4rem]">
          Soon<span className="text-[#c0444c]">...</span>
        </h1>
        <p className="max-w-[360px] text-[0.92rem] leading-[1.6] text-[#a89799]">
          You're on the inside. The SWRMZ console is almost ready, we'll email
          you the moment the swarm goes live for your account.
        </p>
        <button
          type="button"
          onClick={signOut}
          disabled={signingOut}
          className="mt-2 cursor-pointer rounded-[8px] border border-[#3b292d] bg-[#181114] px-5 py-2.5 text-[0.8rem] font-[600] text-[#a89799] transition-colors hover:border-[#5e3a3e] hover:text-[#f2eaeb] disabled:opacity-60"
        >
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </main>
  );
}
