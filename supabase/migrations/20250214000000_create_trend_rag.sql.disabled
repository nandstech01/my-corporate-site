-- トレンドRAGテーブル作成
CREATE TABLE IF NOT EXISTS trend_rag (
  id BIGSERIAL PRIMARY KEY,
  trend_date DATE NOT NULL DEFAULT CURRENT_DATE,
  trend_title TEXT NOT NULL,
  trend_content TEXT NOT NULL,
  trend_url TEXT,
  trend_category TEXT DEFAULT 'general', -- general, animal, sports, entertainment, unique
  trend_source TEXT DEFAULT 'brave', -- brave, x, manual
  embedding VECTOR(1536), -- text-embedding-3-largeの1536次元
  relevance_score FLOAT, -- 記事との関連度スコア
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_trend_rag_date ON trend_rag(trend_date DESC);
CREATE INDEX IF NOT EXISTS idx_trend_rag_active ON trend_rag(is_active);
CREATE INDEX IF NOT EXISTS idx_trend_rag_category ON trend_rag(trend_category);

-- 7日以上古いトレンドを自動削除する関数（オプション）
CREATE OR REPLACE FUNCTION cleanup_old_trends()
RETURNS void AS $$
BEGIN
  UPDATE trend_rag
  SET is_active = FALSE
  WHERE trend_date < CURRENT_DATE - INTERVAL '7 days'
    AND is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- コメント追加
COMMENT ON TABLE trend_rag IS '台本生成用のトレンドニュースRAG';
COMMENT ON COLUMN trend_rag.trend_title IS 'トレンドニュースのタイトル';
COMMENT ON COLUMN trend_rag.trend_content IS 'トレンドニュースの本文（要約）';
COMMENT ON COLUMN trend_rag.trend_url IS 'ニュースソースのURL';
COMMENT ON COLUMN trend_rag.trend_category IS 'カテゴリ（tech, AI, product, general）';
COMMENT ON COLUMN trend_rag.embedding IS 'ベクトル埋め込み（1536次元）';
COMMENT ON COLUMN trend_rag.relevance_score IS '記事との関連度スコア';

