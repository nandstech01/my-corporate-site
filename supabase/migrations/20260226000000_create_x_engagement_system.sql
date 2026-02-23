-- X Engagement System: Account Monitoring, Quote Opportunities, Conversations, Growth
-- Phase 4: Quality & Engagement for 100K followers growth

-- 1. x_monitored_accounts
CREATE TABLE IF NOT EXISTS x_monitored_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  x_user_id TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  display_name TEXT,
  category TEXT NOT NULL DEFAULT 'ai_company',
  monitor_priority INT DEFAULT 1,
  last_checked_tweet_id TEXT,
  last_checked_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. x_quote_opportunities
CREATE TABLE IF NOT EXISTS x_quote_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_tweet_id TEXT NOT NULL UNIQUE,
  original_author_id TEXT NOT NULL,
  original_author_username TEXT NOT NULL,
  original_text TEXT NOT NULL,
  original_likes INT DEFAULT 0,
  original_retweets INT DEFAULT 0,
  original_replies INT DEFAULT 0,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  opportunity_score FLOAT DEFAULT 0,
  freshness_score FLOAT DEFAULT 1.0,
  relevance_score FLOAT DEFAULT 0,
  engagement_velocity FLOAT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','generating','ready','posted','expired','skipped')),
  generated_quote_text TEXT,
  quote_tweet_id TEXT,
  posted_at TIMESTAMPTZ,
  skip_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. x_conversation_threads
CREATE TABLE IF NOT EXISTS x_conversation_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  root_tweet_id TEXT NOT NULL,
  root_tweet_text TEXT NOT NULL,
  root_posted_at TIMESTAMPTZ NOT NULL,
  reply_tweet_id TEXT,
  reply_text TEXT,
  reply_type TEXT NOT NULL
    CHECK (reply_type IN ('self_thread','reply_to_user','follow_up')),
  target_user_reply_id TEXT,
  target_user_text TEXT,
  depth_level INT DEFAULT 1,
  posted_at TIMESTAMPTZ,
  engagement_before JSONB,
  engagement_after JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. x_growth_metrics
CREATE TABLE IF NOT EXISTS x_growth_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  followers_count INT NOT NULL,
  following_count INT NOT NULL,
  tweet_count INT NOT NULL,
  daily_follower_change INT DEFAULT 0,
  daily_posts_count INT DEFAULT 0,
  daily_quotes_count INT DEFAULT 0,
  daily_replies_count INT DEFAULT 0,
  daily_threads_count INT DEFAULT 0,
  avg_engagement_rate FLOAT DEFAULT 0,
  top_post_tweet_id TEXT,
  top_post_engagement INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. x_post_analytics extensions
ALTER TABLE x_post_analytics
  ADD COLUMN IF NOT EXISTS post_type TEXT DEFAULT 'original'
    CHECK (post_type IN ('original','quote','thread','reply')),
  ADD COLUMN IF NOT EXISTS quoted_tweet_id TEXT,
  ADD COLUMN IF NOT EXISTS thread_position INT,
  ADD COLUMN IF NOT EXISTS thread_root_id TEXT,
  ADD COLUMN IF NOT EXISTS conversation_depth INT DEFAULT 0;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_monitored_accounts_active
  ON x_monitored_accounts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_quote_opportunities_status
  ON x_quote_opportunities(status, opportunity_score DESC);
CREATE INDEX IF NOT EXISTS idx_quote_opportunities_detected
  ON x_quote_opportunities(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_conv_threads_root
  ON x_conversation_threads(root_tweet_id);
CREATE INDEX IF NOT EXISTS idx_growth_metrics_date
  ON x_growth_metrics(date DESC);
CREATE INDEX IF NOT EXISTS idx_post_analytics_type
  ON x_post_analytics(post_type);

-- Seed monitored accounts
-- NOTE: x_user_id will be resolved at first monitor run via v2.userByUsername()
INSERT INTO x_monitored_accounts (x_user_id, username, display_name, category, monitor_priority)
VALUES
  ('', 'OpenAI', 'OpenAI', 'ai_company', 1),
  ('', 'AnthropicAI', 'Anthropic', 'ai_company', 1),
  ('', 'OpenClaw_', 'OpenClaw', 'ai_company', 2)
ON CONFLICT DO NOTHING;
