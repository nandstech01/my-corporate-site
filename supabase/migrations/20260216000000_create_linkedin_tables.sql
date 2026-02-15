-- LinkedIn Post Analytics & Source Cache
-- LinkedIn バズ投稿自動化システム用テーブル

-- LinkedIn 投稿アナリティクス
CREATE TABLE linkedin_post_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  linkedin_post_id TEXT UNIQUE NOT NULL,
  post_url TEXT,
  post_text TEXT NOT NULL,
  source_type TEXT,
  source_url TEXT,
  pattern_used TEXT,
  posted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  likes INT DEFAULT 0,
  comments INT DEFAULT 0,
  reposts INT DEFAULT 0,
  impressions INT DEFAULT 0,
  tags TEXT[]
);
CREATE INDEX idx_linkedin_analytics_posted ON linkedin_post_analytics(posted_at DESC);

-- ソースキャッシュ（重複排除）
CREATE TABLE linkedin_source_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id TEXT UNIQUE NOT NULL,
  source_type TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT,
  score INT DEFAULT 0,
  used_for_post BOOLEAN DEFAULT false,
  collected_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days')
);
CREATE INDEX idx_linkedin_source_cache_type ON linkedin_source_cache(source_type, collected_at DESC);

-- pending_actions に 'post_linkedin' を追加
ALTER TABLE slack_pending_actions
  DROP CONSTRAINT IF EXISTS slack_pending_actions_action_type_check;
ALTER TABLE slack_pending_actions
  ADD CONSTRAINT slack_pending_actions_action_type_check
  CHECK (action_type IN ('post_x', 'post_x_long', 'trigger_blog', 'post_linkedin'));

-- RLS
ALTER TABLE linkedin_post_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_source_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY service_all_linkedin_post_analytics ON linkedin_post_analytics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY service_all_linkedin_source_cache ON linkedin_source_cache FOR ALL USING (true) WITH CHECK (true);
