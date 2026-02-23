-- X Playwright Session Persistence
-- Playwright cookieをcron実行間で共有するためのテーブル。
-- service_role専用（RLS）。

CREATE TABLE IF NOT EXISTS x_playwright_sessions (
  id TEXT PRIMARY KEY DEFAULT 'default',
  cookies_json TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE x_playwright_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_only" ON x_playwright_sessions
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
