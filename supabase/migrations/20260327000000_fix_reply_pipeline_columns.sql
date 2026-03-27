-- Fix: ensure reply pipeline columns exist on x_conversation_threads
-- Migration 20260225100000 may have run before table creation (20260226000000),
-- so these columns may be missing.
ALTER TABLE x_conversation_threads
  ADD COLUMN IF NOT EXISTS strategy_used TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS pipeline_scores JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS critique_score INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS root_author_username TEXT DEFAULT NULL;
