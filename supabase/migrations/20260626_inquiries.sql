-- Unified inquiry capture (司令塔の「問い合わせ件数」用). Contact forms ALSO insert here
-- in addition to existing email / Google Sheets, so inquiries are countable in Supabase.

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'general-contact',
  name text,
  email text,
  company text,
  phone text,
  message text,
  status text not null default 'new' check (status in ('new','contacted','qualified','closed','spam')),
  meta jsonb,
  created_at timestamptz not null default now()
);

create index if not exists inquiries_created_idx on public.inquiries (created_at);
create index if not exists inquiries_status_idx on public.inquiries (status);
