-- Trend RAG用のハイブリッド検索関数

CREATE OR REPLACE FUNCTION hybrid_search_trend_vectors(
  query_text TEXT,
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.4,
  match_count INT DEFAULT 10,
  bm25_weight FLOAT DEFAULT 0.4,
  vector_weight FLOAT DEFAULT 0.6,
  recency_weight FLOAT DEFAULT 0.2
)
RETURNS TABLE(
  id BIGINT,
  trend_title TEXT,
  trend_content TEXT,
  trend_url TEXT,
  trend_category TEXT,
  trend_date DATE,
  bm25_score FLOAT,
  vector_score FLOAT,
  recency_score FLOAT,
  combined_score FLOAT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  WITH bm25_results AS (
    SELECT
      t.id,
      t.trend_title,
      t.trend_content,
      t.trend_url,
      t.trend_category,
      t.trend_date,
      -- BM25スコア（タイトル + 内容で全文検索）
      ts_rank_cd(
        setweight(to_tsvector('simple', COALESCE(t.trend_title, '')), 'A') ||
        setweight(to_tsvector('simple', COALESCE(t.trend_content, '')), 'B'),
        plainto_tsquery('simple', query_text)
      )::double precision AS bm25_score
    FROM trend_rag t
    WHERE t.is_active = TRUE
      AND t.embedding IS NOT NULL
  ),
  vector_results AS (
    SELECT
      t.id,
      t.trend_title,
      t.trend_content,
      t.trend_url,
      t.trend_category,
      t.trend_date,
      -- ベクトル類似度スコア
      (1 - (t.embedding <=> query_embedding))::double precision AS vector_score
    FROM trend_rag t
    WHERE t.is_active = TRUE
      AND t.embedding IS NOT NULL
  ),
  recency_results AS (
    SELECT
      t.id,
      t.trend_title,
      t.trend_content,
      t.trend_url,
      t.trend_category,
      t.trend_date,
      -- 新しさスコア（今日を1.0、7日前を0.0として線形補間）
      GREATEST(0::double precision, 1.0 - (CURRENT_DATE - t.trend_date)::double precision / 7.0)::double precision AS recency_score
    FROM trend_rag t
    WHERE t.is_active = TRUE
      AND t.embedding IS NOT NULL
  )
  SELECT
    COALESCE(b.id, v.id, r.id) AS id,
    COALESCE(b.trend_title, v.trend_title, r.trend_title) AS trend_title,
    COALESCE(b.trend_content, v.trend_content, r.trend_content) AS trend_content,
    COALESCE(b.trend_url, v.trend_url, r.trend_url) AS trend_url,
    COALESCE(b.trend_category, v.trend_category, r.trend_category) AS trend_category,
    COALESCE(b.trend_date, v.trend_date, r.trend_date) AS trend_date,
    COALESCE(b.bm25_score, 0::double precision) AS bm25_score,
    COALESCE(v.vector_score, 0::double precision) AS vector_score,
    COALESCE(r.recency_score, 0::double precision) AS recency_score,
    -- 統合スコア（BM25 + Vector + Recency）
    (COALESCE(b.bm25_score, 0::double precision) * bm25_weight +
     COALESCE(v.vector_score, 0::double precision) * vector_weight +
     COALESCE(r.recency_score, 0::double precision) * recency_weight)::double precision AS combined_score,
    COALESCE(v.vector_score, 0::double precision) AS similarity
  FROM bm25_results b
  FULL OUTER JOIN vector_results v ON b.id = v.id
  FULL OUTER JOIN recency_results r ON COALESCE(b.id, v.id) = r.id
  ORDER BY combined_score DESC
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- コメント追加
COMMENT ON FUNCTION hybrid_search_trend_vectors IS 'Trend RAG用のハイブリッド検索（BM25 + Vector + Recency）';

