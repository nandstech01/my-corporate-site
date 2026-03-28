-- CORTEX: Viral Structure Analysis
-- Deep analysis of WHY posts go viral, not just metrics
-- Extends buzz_posts with structural understanding

CREATE TABLE IF NOT EXISTS cortex_viral_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buzz_post_id UUID,
  platform TEXT NOT NULL,
  original_text TEXT NOT NULL,
  author_handle TEXT,

  -- Structural analysis (pattern-extractor.ts output persisted)
  hook_type TEXT,
  structure_type TEXT,
  closing_type TEXT,
  emoji_count INT DEFAULT 0,
  hashtag_count INT DEFAULT 0,
  char_length INT,

  -- Deep LLM analysis
  emotional_trigger TEXT,
  information_density FLOAT,
  novelty_score FLOAT,
  authority_signal TEXT,
  controversy_level FLOAT,
  actionability FLOAT,

  -- Metrics snapshot at analysis time
  likes INT DEFAULT 0,
  reposts INT DEFAULT 0,
  replies INT DEFAULT 0,
  impressions INT DEFAULT 0,
  engagement_rate FLOAT DEFAULT 0,

  -- Conclusion
  primary_buzz_factor TEXT,
  secondary_factors TEXT[],
  anti_patterns TEXT[],
  replicability_score FLOAT,

  analyzed_at TIMESTAMPTZ DEFAULT now(),
  analyzed_by TEXT DEFAULT 'claude-code'
);

CREATE INDEX IF NOT EXISTS idx_cortex_viral_analysis_platform ON cortex_viral_analysis(platform, analyzed_at DESC);
CREATE INDEX IF NOT EXISTS idx_cortex_viral_analysis_factor ON cortex_viral_analysis(primary_buzz_factor);
CREATE INDEX IF NOT EXISTS idx_cortex_viral_analysis_replicability ON cortex_viral_analysis(replicability_score DESC);

ALTER TABLE cortex_viral_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cortex_viral_analysis_service_role" ON cortex_viral_analysis
  FOR ALL TO service_role USING (true) WITH CHECK (true);
