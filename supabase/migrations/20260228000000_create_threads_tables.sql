-- Threads Post Analytics
-- Threads 自動投稿パイプライン用テーブル

CREATE TABLE IF NOT EXISTS threads_post_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  threads_media_id TEXT NOT NULL UNIQUE,
  post_url TEXT,
  post_text TEXT NOT NULL,
  source_url TEXT,
  pattern_used TEXT,
  posted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  likes INT DEFAULT 0,
  replies INT DEFAULT 0,
  reposts INT DEFAULT 0,
  quotes INT DEFAULT 0,
  views INT DEFAULT 0,
  engagement_rate FLOAT DEFAULT 0,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  tags TEXT[]
);

CREATE INDEX IF NOT EXISTS idx_threads_analytics_posted
  ON threads_post_analytics(posted_at DESC);

-- RLS
ALTER TABLE threads_post_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_all_threads_post_analytics
  ON threads_post_analytics FOR ALL USING (true) WITH CHECK (true);

-- slack_pending_actions に 'post_threads' を追加
ALTER TABLE slack_pending_actions
  DROP CONSTRAINT IF EXISTS slack_pending_actions_action_type_check;
ALTER TABLE slack_pending_actions
  ADD CONSTRAINT slack_pending_actions_action_type_check
  CHECK (action_type IN ('post_x', 'post_x_long', 'trigger_blog', 'post_linkedin', 'post_instagram_story', 'post_threads'));
