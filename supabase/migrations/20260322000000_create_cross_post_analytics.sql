-- Cross-post analytics table for tracking Zenn/Qiita/note distribution
CREATE TABLE IF NOT EXISTS cross_post_analytics (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id),
  platform TEXT NOT NULL CHECK (platform IN ('zenn', 'qiita', 'note')),
  external_url TEXT,
  external_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'posted', 'failed')),
  posted_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookups by post and platform
CREATE INDEX IF NOT EXISTS idx_cross_post_analytics_post_platform
  ON cross_post_analytics (post_id, platform);

-- Index for status-based queries
CREATE INDEX IF NOT EXISTS idx_cross_post_analytics_status
  ON cross_post_analytics (status);
