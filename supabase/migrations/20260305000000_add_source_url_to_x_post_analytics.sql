-- Add source_url column to x_post_analytics for duplicate source tracking
ALTER TABLE x_post_analytics ADD COLUMN IF NOT EXISTS source_url TEXT;
CREATE INDEX IF NOT EXISTS idx_x_analytics_source_url
  ON x_post_analytics(source_url) WHERE source_url IS NOT NULL;
