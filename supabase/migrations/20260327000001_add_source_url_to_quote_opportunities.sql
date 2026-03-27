-- Add source_url column for primary source documentation links
-- extracted from monitored tweets (blog posts, docs, announcements)
ALTER TABLE x_quote_opportunities
  ADD COLUMN IF NOT EXISTS source_url TEXT DEFAULT NULL;
