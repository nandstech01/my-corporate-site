-- Add media_url column to track image URLs for dedup (prevent same image being posted repeatedly)
ALTER TABLE x_post_analytics ADD COLUMN IF NOT EXISTS media_url TEXT;
CREATE INDEX IF NOT EXISTS idx_analytics_media_url ON x_post_analytics(media_url) WHERE media_url IS NOT NULL;
