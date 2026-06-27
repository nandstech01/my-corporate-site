-- Tiny key/value store for the command center (e.g. last-seen Claude Code version
-- so we can flag NEW official releases across server invocations). Read/written
-- by lib/cortex/metrics/command-intel.ts via the service role.
create table if not exists public.cortex_kv (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
