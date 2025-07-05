-- 既存のテーブル構造に合わせた検索関数の修正

-- Company Vectors用のベクトル検索関数（既存の構造に合わせて修正）
CREATE OR REPLACE FUNCTION match_company_vectors(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id integer,
  page_slug character varying,
  content_type character varying,
  section_title character varying,
  content_chunk text,
  metadata jsonb,
  fragment_id character varying,
  service_id character varying,
  relevance_score double precision,
  created_at timestamp with time zone,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cv.id,
    cv.page_slug,
    cv.content_type,
    cv.section_title,
    cv.content_chunk,
    cv.metadata,
    cv.fragment_id,
    cv.service_id,
    cv.relevance_score,
    cv.created_at,
    (1 - (cv.embedding <=> query_embedding)) as similarity
  FROM company_vectors cv
  WHERE 1 - (cv.embedding <=> query_embedding) > match_threshold
  ORDER BY cv.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Trend Vectors用のベクトル検索関数（既存の構造を確認して修正）
CREATE OR REPLACE FUNCTION match_trend_vectors(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id integer,
  trend_topic character varying,
  content text,
  source character varying,
  source_url text,
  relevance_score double precision,
  trend_date date,
  popularity_score double precision,
  keywords text[],
  metadata jsonb,
  created_at timestamp with time zone,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    tv.id,
    tv.trend_topic,
    tv.content,
    tv.source,
    tv.source_url,
    tv.relevance_score,
    tv.trend_date,
    tv.popularity_score,
    tv.keywords,
    tv.metadata,
    tv.created_at,
    (1 - (tv.embedding <=> query_embedding)) as similarity
  FROM trend_vectors tv
  WHERE 1 - (tv.embedding <=> query_embedding) > match_threshold
  ORDER BY tv.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- YouTube Vectors用のベクトル検索関数（既存の構造に合わせて修正）
CREATE OR REPLACE FUNCTION match_youtube_vectors(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id bigint,
  content_id text,
  content_type text,
  video_title text,
  channel_name text,
  video_url text,
  content text,
  source text,
  source_url text,
  relevance_score double precision,
  educational_score double precision,
  complexity_level integer,
  implementation_score double precision,
  video_duration_seconds integer,
  view_count bigint,
  like_count bigint,
  published_at timestamp with time zone,
  transcript_language text,
  keywords text[],
  metadata jsonb,
  created_at timestamp with time zone,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    yv.id,
    yv.content_id,
    yv.content_type,
    yv.video_title,
    yv.channel_name,
    yv.video_url,
    yv.content,
    yv.source,
    yv.source_url,
    yv.relevance_score,
    yv.educational_score,
    yv.complexity_level,
    yv.implementation_score,
    yv.video_duration_seconds,
    yv.view_count,
    yv.like_count,
    yv.published_at,
    yv.transcript_language,
    yv.keywords,
    yv.metadata,
    yv.created_at,
    (1 - (yv.embedding <=> query_embedding)) as similarity
  FROM youtube_vectors yv
  WHERE 1 - (yv.embedding <=> query_embedding) > match_threshold
  ORDER BY yv.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 関数修正完了ログ
DO $$
BEGIN
  RAISE NOTICE 'Vector search functions updated successfully for existing table structures';
END $$; 