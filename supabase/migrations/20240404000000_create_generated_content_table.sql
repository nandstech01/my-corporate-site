-- Generated Content テーブルの作成
CREATE TABLE IF NOT EXISTS generated_content (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_generated_content_type ON generated_content(type);
CREATE INDEX IF NOT EXISTS idx_generated_content_created_at ON generated_content(created_at);
CREATE INDEX IF NOT EXISTS idx_generated_content_metadata ON generated_content USING GIN(metadata);

-- 更新日時の自動更新
CREATE OR REPLACE FUNCTION update_generated_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_update_generated_content_updated_at
  BEFORE UPDATE ON generated_content
  FOR EACH ROW
  EXECUTE FUNCTION update_generated_content_updated_at();

-- コメントの追加
COMMENT ON TABLE generated_content IS 'トリプルRAGシステムで生成されたコンテンツを保存するテーブル';
COMMENT ON COLUMN generated_content.type IS 'コンテンツタイプ（trend-article, x-post等）';
COMMENT ON COLUMN generated_content.title IS 'コンテンツタイトル';
COMMENT ON COLUMN generated_content.content IS 'コンテンツ本文';
COMMENT ON COLUMN generated_content.metadata IS 'メタデータ（ニュースソース、RAG検索結果等）'; 