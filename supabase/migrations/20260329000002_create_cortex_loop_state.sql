-- CORTEX Loop State: AI-to-AI永久会話ループの共有状態テーブル
-- AI-A (Cloudflare Worker) と AI-B (Claude Code) がターン制で会話するための状態管理

CREATE TABLE IF NOT EXISTS cortex_loop_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  turn_number integer NOT NULL DEFAULT 0,
  current_speaker text NOT NULL DEFAULT 'ai_a' CHECK (current_speaker IN ('ai_a', 'ai_b')),
  agenda_topic text NOT NULL DEFAULT 'performance',
  agenda_phase text NOT NULL DEFAULT 'analyze' CHECK (agenda_phase IN ('analyze', 'propose', 'execute', 'learn')),
  context_summary text,
  last_message_id text,
  turns_today integer NOT NULL DEFAULT 0,
  posts_today integer NOT NULL DEFAULT 0,
  last_turn_at timestamptz,
  daily_budget integer NOT NULL DEFAULT 24,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'sleeping')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert initial row
INSERT INTO cortex_loop_state (id, turn_number, current_speaker, agenda_topic, agenda_phase, status, daily_budget)
VALUES (gen_random_uuid(), 0, 'ai_a', 'performance', 'analyze', 'active', 4);
-- daily_budget=4 for initial testing, increase to 24 once stable
