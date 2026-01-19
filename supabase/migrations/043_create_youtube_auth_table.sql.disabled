-- YouTube認証トークン管理テーブル
CREATE TABLE IF NOT EXISTS youtube_auth (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  scope TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- インデックス
CREATE INDEX idx_youtube_auth_user_id ON youtube_auth(user_id);
CREATE INDEX idx_youtube_auth_expires_at ON youtube_auth(expires_at);

-- RLS有効化
ALTER TABLE youtube_auth ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分のトークンのみ管理可能
DROP POLICY IF EXISTS "Users can manage own youtube auth" ON youtube_auth;
CREATE POLICY "Users can manage own youtube auth"
ON youtube_auth
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- updated_atトリガー
CREATE OR REPLACE FUNCTION update_youtube_auth_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS youtube_auth_updated_at ON youtube_auth;
CREATE TRIGGER youtube_auth_updated_at
  BEFORE UPDATE ON youtube_auth
  FOR EACH ROW
  EXECUTE FUNCTION update_youtube_auth_updated_at();

COMMENT ON TABLE youtube_auth IS 'YouTube API OAuth 2.0認証トークンを保存';
COMMENT ON COLUMN youtube_auth.access_token IS 'YouTube APIアクセストークン';
COMMENT ON COLUMN youtube_auth.refresh_token IS 'リフレッシュトークン（トークン更新用）';
COMMENT ON COLUMN youtube_auth.expires_at IS 'アクセストークンの有効期限';
COMMENT ON COLUMN youtube_auth.scope IS 'OAuth スコープ（youtube.upload など）';

