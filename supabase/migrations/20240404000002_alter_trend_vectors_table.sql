-- 既存のtrend_vectorsテーブルに必要なカラムを追加

-- content_idカラムを追加（既存のtrend_topicから派生）
ALTER TABLE trend_vectors 
ADD COLUMN IF NOT EXISTS content_id VARCHAR(255) UNIQUE;

-- content_typeカラムを追加（デフォルト値を'news'に設定）
ALTER TABLE trend_vectors 
ADD COLUMN IF NOT EXISTS content_type VARCHAR(50) NOT NULL DEFAULT 'news';

-- metadataカラムを追加（JSONB形式）
ALTER TABLE trend_vectors 
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- content_idに既存のtrend_topicベースのIDを生成
UPDATE trend_vectors 
SET content_id = 'trend_' || id::text || '_' || extract(epoch from created_at)::text
WHERE content_id IS NULL;

-- content_idをNOT NULLに設定
ALTER TABLE trend_vectors 
ALTER COLUMN content_id SET NOT NULL;

-- metadataに既存のデータを移行
UPDATE trend_vectors 
SET metadata = jsonb_build_object(
  'title', trend_topic,
  'url', source_url,
  'source', source,
  'relevance', relevance_score,
  'trend_date', trend_date,
  'popularity_score', popularity_score,
  'keywords', keywords,
  'retrieved_at', created_at
)
WHERE metadata IS NULL;

-- 新しいインデックスを作成
CREATE INDEX IF NOT EXISTS idx_trend_vectors_content_id ON trend_vectors(content_id);
CREATE INDEX IF NOT EXISTS idx_trend_vectors_content_type ON trend_vectors(content_type);
CREATE INDEX IF NOT EXISTS idx_trend_vectors_metadata ON trend_vectors USING GIN(metadata);

-- コメントを追加
COMMENT ON COLUMN trend_vectors.content_id IS 'コンテンツの一意識別子';
COMMENT ON COLUMN trend_vectors.content_type IS 'コンテンツタイプ（news、article等）';
COMMENT ON COLUMN trend_vectors.metadata IS 'ニュースのメタデータ（タイトル、URL、ソース等）';

-- 正常性チェック
SELECT 
  COUNT(*) as total_records,
  COUNT(DISTINCT content_id) as unique_content_ids,
  COUNT(CASE WHEN metadata IS NOT NULL THEN 1 END) as records_with_metadata
FROM trend_vectors; 