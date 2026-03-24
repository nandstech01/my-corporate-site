-- Tweet Reactions table for tracking which tweets have been reacted to
-- Supports multiple source accounts (AnthropicAI, OpenAI, Google, etc.)

CREATE TABLE IF NOT EXISTS tweet_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_account TEXT NOT NULL,
  source_tweet_id TEXT NOT NULL UNIQUE,
  source_text TEXT,
  reaction_tweet_id TEXT,
  reaction_tweet_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tweet_reactions_source
  ON tweet_reactions(source_account, source_tweet_id);
