-- Durable knowledge learned from command-center conversations (Phase 4).
-- Only things said in the 司令塔 feed this table; recalled into future agent runs.
create table if not exists public.command_knowledge (
  id bigint generated always as identity primary key,
  content text not null,
  tags text[] not null default '{}',
  source text not null default 'command-center',
  created_at timestamptz not null default now()
);
create index if not exists command_knowledge_created_idx on public.command_knowledge (created_at desc);
