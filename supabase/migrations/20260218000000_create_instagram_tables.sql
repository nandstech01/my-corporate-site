-- Instagram Story Queue & Analytics
-- Instagram ストーリー自動配信システム用テーブル

-- Instagram ストーリーキュー
CREATE TABLE instagram_story_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_slug TEXT NOT NULL,
  blog_title TEXT,
  caption TEXT NOT NULL,
  image_url TEXT,
  image_prompt TEXT,
  hashtags TEXT[],
  cta_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending_approval', 'approved', 'ready_to_post', 'posted', 'rejected')),
  score NUMERIC(5,2) DEFAULT 0,
  all_candidates JSONB,
  scores JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ,
  posted_at TIMESTAMPTZ
);
CREATE INDEX idx_instagram_story_queue_status ON instagram_story_queue(status, created_at DESC);
CREATE INDEX idx_instagram_story_queue_slug ON instagram_story_queue(blog_slug);

-- Instagram 投稿アナリティクス
CREATE TABLE instagram_post_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instagram_media_id TEXT UNIQUE NOT NULL,
  media_type TEXT DEFAULT 'STORIES',
  post_url TEXT,
  caption TEXT NOT NULL,
  blog_slug TEXT,
  posted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Story固有メトリクス
  reach INT DEFAULT 0,
  impressions INT DEFAULT 0,
  taps_forward INT DEFAULT 0,
  taps_back INT DEFAULT 0,
  exits INT DEFAULT 0,
  replies INT DEFAULT 0,
  -- 一般メトリクス
  likes INT DEFAULT 0,
  comments INT DEFAULT 0,
  saves INT DEFAULT 0,
  shares INT DEFAULT 0,
  engagement_rate NUMERIC(8,4) DEFAULT 0,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  hashtags TEXT[],
  utm_campaign TEXT
);
CREATE INDEX idx_instagram_analytics_posted ON instagram_post_analytics(posted_at DESC);
CREATE INDEX idx_instagram_analytics_slug ON instagram_post_analytics(blog_slug);

-- pending_actions に 'post_instagram_story' を追加
ALTER TABLE slack_pending_actions
  DROP CONSTRAINT IF EXISTS slack_pending_actions_action_type_check;
ALTER TABLE slack_pending_actions
  ADD CONSTRAINT slack_pending_actions_action_type_check
  CHECK (action_type IN ('post_x', 'post_x_long', 'trigger_blog', 'post_linkedin', 'post_instagram_story'));

-- RLS
ALTER TABLE instagram_story_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_post_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY service_all_instagram_story_queue ON instagram_story_queue FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY service_all_instagram_post_analytics ON instagram_post_analytics FOR ALL USING (true) WITH CHECK (true);
