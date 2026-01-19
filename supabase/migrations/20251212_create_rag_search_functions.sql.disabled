-- ========================================
-- RAG検索関数
-- ========================================
-- AIアーキテクト・ショート台本V2用の
-- ディープリサーチRAGとスクレイピングRAG検索関数
-- 
-- @created 2025-12-12
-- @version 1.0.0
-- ========================================

-- ========================================
-- 1. ディープリサーチRAG検索関数
-- ========================================
CREATE OR REPLACE FUNCTION match_deep_research(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  research_topic text,
  content text,
  summary text,
  key_findings text[],
  source_urls text[],
  authority_score float,
  metadata jsonb,
  created_at timestamptz,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    hdr.id,
    hdr.research_topic,
    hdr.content,
    hdr.summary,
    hdr.key_findings,
    hdr.source_urls,
    hdr.authority_score,
    hdr.metadata,
    hdr.created_at,
    1 - (hdr.embedding <=> query_embedding) AS similarity
  FROM hybrid_deep_research hdr
  WHERE 1 - (hdr.embedding <=> query_embedding) > match_threshold
  ORDER BY hdr.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION match_deep_research IS 'ディープリサーチRAGをベクトル検索する関数（AIアーキテクト・ショート台本V2用）';

-- ========================================
-- 2. スクレイピングRAG検索関数
-- ========================================
CREATE OR REPLACE FUNCTION match_scraped_keywords(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 3
)
RETURNS TABLE (
  id uuid,
  keyword text,
  url text,
  title text,
  content text,
  meta_description text,
  scraped_at timestamptz,
  metadata jsonb,
  created_at timestamptz,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    hsk.id,
    hsk.keyword,
    hsk.url,
    hsk.title,
    hsk.content,
    hsk.meta_description,
    hsk.scraped_at,
    hsk.metadata,
    hsk.created_at,
    1 - (hsk.embedding <=> query_embedding) AS similarity
  FROM hybrid_scraped_keywords hsk
  WHERE 1 - (hsk.embedding <=> query_embedding) > match_threshold
  ORDER BY hsk.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION match_scraped_keywords IS 'スクレイピングRAGをベクトル検索する関数（AIアーキテクト・ショート台本V2用）';

-- ========================================
-- 確認
-- ========================================
DO $$
BEGIN
  RAISE NOTICE '✅ RAG検索関数作成完了';
  RAISE NOTICE '   - match_deep_research';
  RAISE NOTICE '   - match_scraped_keywords';
END $$;

