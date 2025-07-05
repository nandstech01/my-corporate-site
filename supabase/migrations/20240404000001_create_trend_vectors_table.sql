-- Trend Vectors テーブルの作成（トレンドRAG用）
CREATE TABLE IF NOT EXISTS trend_vectors (
  id SERIAL PRIMARY KEY,
  content_id VARCHAR(255) NOT NULL UNIQUE,
  content_type VARCHAR(50) NOT NULL DEFAULT 'news',
  content TEXT NOT NULL,
  embedding vector(1536) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_trend_vectors_content_type ON trend_vectors(content_type);
CREATE INDEX IF NOT EXISTS idx_trend_vectors_created_at ON trend_vectors(created_at);
CREATE INDEX IF NOT EXISTS idx_trend_vectors_metadata ON trend_vectors USING GIN(metadata);

-- ベクトル検索用のHNSWインデックス
CREATE INDEX IF NOT EXISTS idx_trend_vectors_embedding ON trend_vectors 
USING hnsw (embedding vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);

-- 更新日時の自動更新
CREATE OR REPLACE FUNCTION update_trend_vectors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_update_trend_vectors_updated_at
  BEFORE UPDATE ON trend_vectors
  FOR EACH ROW
  EXECUTE FUNCTION update_trend_vectors_updated_at();

-- コメントの追加
COMMENT ON TABLE trend_vectors IS 'トレンドRAGシステム用のベクトルデータを保存するテーブル';
COMMENT ON COLUMN trend_vectors.content_id IS 'コンテンツの一意識別子';
COMMENT ON COLUMN trend_vectors.content_type IS 'コンテンツタイプ（news、article等）';
COMMENT ON COLUMN trend_vectors.content IS 'ベクトル化対象のテキストコンテンツ';
COMMENT ON COLUMN trend_vectors.embedding IS '1536次元のベクトルデータ';
COMMENT ON COLUMN trend_vectors.metadata IS 'ニュースのメタデータ（タイトル、URL、ソース等）'; 