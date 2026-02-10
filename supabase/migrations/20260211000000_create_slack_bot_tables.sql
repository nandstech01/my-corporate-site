-- Slack Bot Tables
-- 会話履歴、承認待ちアクション、学習メモリ、X投稿パフォーマンス追跡

-- 会話履歴
CREATE TABLE slack_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slack_channel_id TEXT NOT NULL,
  slack_user_id TEXT NOT NULL,
  slack_thread_ts TEXT,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content TEXT NOT NULL,
  tool_calls JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_slack_conv_channel ON slack_conversations(slack_channel_id, created_at DESC);
CREATE INDEX idx_slack_conv_thread ON slack_conversations(slack_thread_ts, created_at);

-- 承認待ちアクション (Human-in-the-Loop)
CREATE TABLE slack_pending_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slack_channel_id TEXT NOT NULL,
  slack_user_id TEXT NOT NULL,
  slack_thread_ts TEXT,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'post_x', 'post_x_long', 'trigger_blog'
  )),
  payload JSONB NOT NULL,
  preview_text TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'approved', 'rejected', 'expired'
  )),
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- 学習メモリ (Mem0 inspired)
CREATE TABLE slack_bot_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slack_user_id TEXT NOT NULL,
  memory_type TEXT NOT NULL CHECK (memory_type IN (
    'preference', 'feedback', 'fact', 'style', 'timing'
  )),
  content TEXT NOT NULL,
  context JSONB,
  importance FLOAT DEFAULT 0.5 CHECK (importance >= 0 AND importance <= 1),
  access_count INT DEFAULT 0,
  last_accessed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_memory_user ON slack_bot_memory(slack_user_id, importance DESC);

-- X投稿パフォーマンス追跡
CREATE TABLE x_post_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tweet_id TEXT NOT NULL UNIQUE,
  tweet_url TEXT,
  post_text TEXT NOT NULL,
  post_mode TEXT CHECK (post_mode IN ('article', 'research', 'pattern')),
  pattern_used TEXT,
  posted_at TIMESTAMPTZ NOT NULL,
  likes INT DEFAULT 0,
  retweets INT DEFAULT 0,
  replies INT DEFAULT 0,
  impressions INT DEFAULT 0,
  engagement_rate FLOAT DEFAULT 0,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  tags TEXT[]
);
CREATE INDEX idx_analytics_posted ON x_post_analytics(posted_at DESC);

-- RLS
ALTER TABLE slack_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE slack_pending_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE slack_bot_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE x_post_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY service_all_slack_conversations ON slack_conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY service_all_slack_pending_actions ON slack_pending_actions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY service_all_slack_bot_memory ON slack_bot_memory FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY service_all_x_post_analytics ON x_post_analytics FOR ALL USING (true) WITH CHECK (true);
