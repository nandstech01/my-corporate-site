-- CORTEX: LINE Friends Mirror (analytics copy of LINE Harness friend data)
-- Source of truth: LINE Harness D1. This is a read-optimized mirror for Supabase analytics.

CREATE TABLE IF NOT EXISTS cortex_line_friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  line_user_id TEXT NOT NULL UNIQUE,
  harness_friend_id TEXT,
  display_name TEXT,
  source_platform TEXT,
  source_campaign TEXT,
  tags TEXT[] DEFAULT '{}',
  current_score INTEGER DEFAULT 0,
  score_tier TEXT DEFAULT 'cold' CHECK (score_tier IN ('cold', 'warm', 'hot')),
  current_scenario TEXT,
  rich_menu_id TEXT,
  last_message_at TIMESTAMPTZ,
  friend_added_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cortex_line_friends_user ON cortex_line_friends(line_user_id);
CREATE INDEX IF NOT EXISTS idx_cortex_line_friends_tier ON cortex_line_friends(score_tier);
CREATE INDEX IF NOT EXISTS idx_cortex_line_friends_source ON cortex_line_friends(source_platform);

ALTER TABLE cortex_line_friends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cortex_line_friends_service_role" ON cortex_line_friends
  FOR ALL TO service_role USING (true) WITH CHECK (true);
