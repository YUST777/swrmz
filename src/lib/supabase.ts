import { createClient } from '@supabase/supabase-js';

// Captured BEFORE createClient consumes the URL hash, so we can detect an
// OAuth/email redirect that landed on the wrong path and forward to /soon.
export const cameFromAuth =
  typeof window !== 'undefined' &&
  (window.location.hash.includes('access_token') ||
    window.location.hash.includes('error_description') ||
    new URLSearchParams(window.location.search).has('code'));

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  // Surfaced in dev so a missing .env.local is obvious.
  console.warn(
    'Supabase env missing: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local',
  );
}

export const supabase = createClient(url ?? '', anonKey ?? '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
