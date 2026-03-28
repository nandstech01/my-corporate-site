-- CORTEX: Conversation Log
-- Structured log of Discord/LINE/Slack conversations
-- Tracks decisions, action items, and affected files for auto-improvement

CREATE TABLE IF NOT EXISTS cortex_conversation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel TEXT NOT NULL CHECK (channel IN ('discord', 'line', 'slack')),
  conversation_type TEXT NOT NULL CHECK (conversation_type IN (
    'content_review',
    'timing_discussion',
    'trend_analysis',
    'strategy_update',
    'learning_report',
    'guideline_update',
    'performance_review'
  )),
  summary TEXT NOT NULL,
  key_decisions TEXT[],
  action_items JSONB,
  affected_files TEXT[],
  affected_platforms TEXT[],
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_cortex_conversation_status ON cortex_conversation_log(status, priority);
CREATE INDEX IF NOT EXISTS idx_cortex_conversation_channel ON cortex_conversation_log(channel, created_at DESC);

ALTER TABLE cortex_conversation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cortex_conversation_log_service_role" ON cortex_conversation_log
  FOR ALL TO service_role USING (true) WITH CHECK (true);
