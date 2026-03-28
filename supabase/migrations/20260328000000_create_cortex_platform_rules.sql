-- CORTEX: Platform Algorithm Knowledge Base
-- Stores structured knowledge about each platform's algorithms, policies, and best practices
-- Source: official docs, API changelogs, verified experiments

CREATE TABLE IF NOT EXISTS cortex_platform_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('x', 'linkedin', 'threads', 'instagram', 'youtube', 'zenn', 'qiita')),
  rule_category TEXT NOT NULL CHECK (rule_category IN (
    'algorithm',
    'content_policy',
    'best_practice',
    'rate_limit',
    'format',
    'monetization'
  )),
  rule_title TEXT NOT NULL,
  rule_description TEXT NOT NULL,
  source_url TEXT,
  source_type TEXT CHECK (source_type IN ('official_doc', 'official_blog', 'api_changelog', 'verified_experiment', 'community_consensus')),
  confidence FLOAT DEFAULT 0.8 CHECK (confidence >= 0 AND confidence <= 1),
  effective_from DATE,
  deprecated_at DATE,
  verified_by_data BOOLEAN DEFAULT false,
  verification_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cortex_platform_rules_platform ON cortex_platform_rules(platform, rule_category);
CREATE INDEX IF NOT EXISTS idx_cortex_platform_rules_active ON cortex_platform_rules(platform) WHERE deprecated_at IS NULL;

ALTER TABLE cortex_platform_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cortex_platform_rules_service_role" ON cortex_platform_rules
  FOR ALL TO service_role USING (true) WITH CHECK (true);
