-- Audit log for command-center local Claude Code runs (Phase 3).
-- Every voice/text-triggered agent run is recorded here (local kiosk only).
create table if not exists public.command_agent_runs (
  id bigint generated always as identity primary key,
  run_id text unique not null,
  prompt text,
  output text,
  status text not null default 'running',
  started_at timestamptz not null default now(),
  ended_at timestamptz
);
