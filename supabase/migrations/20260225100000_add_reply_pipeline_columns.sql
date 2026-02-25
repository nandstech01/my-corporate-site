-- Add reply pipeline tracking columns to x_conversation_threads
ALTER TABLE x_conversation_threads
  ADD COLUMN IF NOT EXISTS strategy_used TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS pipeline_scores JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS critique_score INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS root_author_username TEXT DEFAULT NULL;

-- Update reply_type CHECK constraint to include proactive_discussion
-- Drop old constraint and recreate with new value
ALTER TABLE x_conversation_threads
  DROP CONSTRAINT IF EXISTS x_conversation_threads_reply_type_check;

ALTER TABLE x_conversation_threads
  ADD CONSTRAINT x_conversation_threads_reply_type_check
  CHECK (reply_type IN ('self_thread', 'reply_to_user', 'follow_up', 'proactive_discussion'));

-- Index for tracking proactive discussions
CREATE INDEX IF NOT EXISTS idx_conv_threads_reply_type
  ON x_conversation_threads(reply_type)
  WHERE reply_type = 'proactive_discussion';

-- Index for engagement tracking (recent replies)
CREATE INDEX IF NOT EXISTS idx_conv_threads_posted_at
  ON x_conversation_threads(posted_at DESC)
  WHERE reply_tweet_id IS NOT NULL;
