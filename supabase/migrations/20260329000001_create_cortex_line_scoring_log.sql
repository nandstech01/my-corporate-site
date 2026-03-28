-- CORTEX: LINE Scoring Audit Log
-- Tracks all score changes for analytics and debugging

CREATE TABLE IF NOT EXISTS cortex_line_scoring_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  line_user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  score_delta INTEGER NOT NULL,
  score_before INTEGER,
  score_after INTEGER,
  source_platform TEXT,
  source_detail JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cortex_scoring_log_user ON cortex_line_scoring_log(line_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cortex_scoring_log_type ON cortex_line_scoring_log(event_type);

ALTER TABLE cortex_line_scoring_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cortex_line_scoring_log_service_role" ON cortex_line_scoring_log
  FOR ALL TO service_role USING (true) WITH CHECK (true);
