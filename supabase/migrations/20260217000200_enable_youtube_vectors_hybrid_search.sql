-- =====================================================
-- Enable hybrid search for youtube_vectors
-- Extracted from 20250204000000_add_hybrid_search_support.sql.disabled
-- =====================================================

-- Add tsvector column for BM25 full-text search
ALTER TABLE youtube_vectors
ADD COLUMN IF NOT EXISTS content_tsvector tsvector
GENERATED ALWAYS AS (
  to_tsvector('simple', COALESCE(content, ''))
) STORED;

-- GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS youtube_vectors_content_tsvector_idx
ON youtube_vectors USING gin(content_tsvector);

-- Hybrid search RPC function (BM25 + vector + RRF)
CREATE OR REPLACE FUNCTION hybrid_search_youtube_vectors(
  query_text text,
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 10,
  bm25_weight float DEFAULT 0.4,
  vector_weight float DEFAULT 0.6
)
RETURNS TABLE (
  id bigint,
  content_id text,
  content_type text,
  video_title text,
  content text,
  metadata jsonb,
  created_at timestamp with time zone,
  bm25_score float,
  vector_score float,
  combined_score float
)
LANGUAGE plpgsql
AS $$
DECLARE
  rrf_k int := 60;
BEGIN
  RETURN QUERY
  WITH
  bm25_results AS (
    SELECT
      yv.id,
      yv.content_id,
      yv.content_type,
      yv.video_title,
      yv.content,
      yv.metadata,
      yv.created_at,
      ts_rank_cd(yv.content_tsvector, websearch_to_tsquery('simple', query_text)) as rank_score,
      ROW_NUMBER() OVER (ORDER BY ts_rank_cd(yv.content_tsvector, websearch_to_tsquery('simple', query_text)) DESC) as rank
    FROM youtube_vectors yv
    WHERE yv.content_tsvector @@ websearch_to_tsquery('simple', query_text)
    ORDER BY rank_score DESC
    LIMIT match_count * 2
  ),
  vector_results AS (
    SELECT
      yv.id,
      yv.content_id,
      yv.content_type,
      yv.video_title,
      yv.content,
      yv.metadata,
      yv.created_at,
      (1 - (yv.embedding <=> query_embedding)) as similarity,
      ROW_NUMBER() OVER (ORDER BY yv.embedding <=> query_embedding) as rank
    FROM youtube_vectors yv
    WHERE (1 - (yv.embedding <=> query_embedding)) > match_threshold
    ORDER BY yv.embedding <=> query_embedding
    LIMIT match_count * 2
  ),
  combined_results AS (
    SELECT
      COALESCE(b.id, v.id) as id,
      COALESCE(b.content_id, v.content_id) as content_id,
      COALESCE(b.content_type, v.content_type) as content_type,
      COALESCE(b.video_title, v.video_title) as video_title,
      COALESCE(b.content, v.content) as content,
      COALESCE(b.metadata, v.metadata) as metadata,
      COALESCE(b.created_at, v.created_at) as created_at,
      COALESCE(b.rank_score, 0)::float as bm25_score,
      COALESCE(v.similarity, 0)::float as vector_score,
      (bm25_weight * COALESCE(1.0 / (rrf_k + b.rank), 0.0) +
       vector_weight * COALESCE(1.0 / (rrf_k + v.rank), 0.0))::float as combined_score
    FROM bm25_results b
    FULL OUTER JOIN vector_results v ON b.id = v.id
  )
  SELECT
    cr.id,
    cr.content_id,
    cr.content_type,
    cr.video_title,
    cr.content,
    cr.metadata,
    cr.created_at,
    cr.bm25_score,
    cr.vector_score,
    cr.combined_score
  FROM combined_results cr
  ORDER BY cr.combined_score DESC
  LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION hybrid_search_youtube_vectors IS 'YouTube Vectors hybrid search (BM25 + vector + RRF)';
