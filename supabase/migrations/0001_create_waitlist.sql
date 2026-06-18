-- Waitlist table for SWRMZ early-access signups
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.waitlist enable row level security;

-- Anyone (anonymous or authenticated) may add their email.
create policy "anyone can join waitlist"
  on public.waitlist
  for insert
  to anon, authenticated
  with check (true);

-- Note: no SELECT policy on purpose, so the email list stays private.
