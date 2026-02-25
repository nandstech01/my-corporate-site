-- Threads Pipeline v2: Add scoring, hook, source tracking columns
-- Part of Threads pipeline upgrade from MVP to 5-stage LangGraph

ALTER TABLE threads_post_analytics
  ADD COLUMN IF NOT EXISTS scores JSONB,
  ADD COLUMN IF NOT EXISTS hook_used TEXT,
  ADD COLUMN IF NOT EXISTS source_type TEXT,
  ADD COLUMN IF NOT EXISTS candidate_count INT DEFAULT 0;
