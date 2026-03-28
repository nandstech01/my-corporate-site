-- CORTEX: Temporal Pattern Intelligence
-- Cross-analysis of day × hour × topic × content_type → engagement
-- Statistical confidence intervals included

CREATE TABLE IF NOT EXISTS cortex_temporal_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  hour_jst INT NOT NULL CHECK (hour_jst >= 0 AND hour_jst <= 23),
  topic_category TEXT,
  content_type TEXT,

  -- Aggregate metrics
  sample_count INT DEFAULT 0,
  avg_engagement_rate FLOAT DEFAULT 0,
  avg_likes FLOAT DEFAULT 0,
  avg_impressions FLOAT DEFAULT 0,
  max_engagement_rate FLOAT DEFAULT 0,

  -- Statistical confidence
  std_dev FLOAT DEFAULT 0,
  confidence_interval_lower FLOAT DEFAULT 0,
  confidence_interval_upper FLOAT DEFAULT 0,

  -- Recommendation
  recommendation_score FLOAT DEFAULT 0,

  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  calculated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cortex_temporal_platform ON cortex_temporal_patterns(platform, day_of_week, hour_jst);
CREATE INDEX IF NOT EXISTS idx_cortex_temporal_recommendation ON cortex_temporal_patterns(platform, recommendation_score DESC);

ALTER TABLE cortex_temporal_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cortex_temporal_patterns_service_role" ON cortex_temporal_patterns
  FOR ALL TO service_role USING (true) WITH CHECK (true);
