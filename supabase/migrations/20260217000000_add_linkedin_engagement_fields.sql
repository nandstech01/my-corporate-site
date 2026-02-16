-- LinkedIn engagement tracking fields
ALTER TABLE linkedin_post_analytics
  ADD COLUMN IF NOT EXISTS engagement_rate FLOAT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fetched_at TIMESTAMPTZ DEFAULT now();
