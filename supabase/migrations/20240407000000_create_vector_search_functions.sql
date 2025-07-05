-- Company Vectors テーブルの作成（既存のcompany_vectorsテーブルが存在しない場合）
CREATE TABLE IF NOT EXISTS company_vectors (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  content_id text NOT NULL,
  content_type text NOT NULL DEFAULT 'business_info',
  content text NOT NULL,
  embedding vector(1536) NOT NULL,
  source text NOT NULL DEFAULT 'company_data',
  source_url text,
  relevance_score float8 DEFAULT 0,
  business_type text,
  industry text,
  region text,
  keywords text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Company Vectors用のインデックス作成
CREATE INDEX IF NOT EXISTS company_vectors_embedding_idx ON company_vectors USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS company_vectors_content_type_idx ON company_vectors(content_type);
CREATE INDEX IF NOT EXISTS company_vectors_business_type_idx ON company_vectors(business_type);
CREATE INDEX IF NOT EXISTS company_vectors_industry_idx ON company_vectors(industry);
CREATE INDEX IF NOT EXISTS company_vectors_keywords_idx ON company_vectors USING gin(keywords);
CREATE INDEX IF NOT EXISTS company_vectors_metadata_idx ON company_vectors USING gin(metadata);

-- Company Vectors用のベクトル検索関数
CREATE OR REPLACE FUNCTION match_company_vectors(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id bigint,
  content_id text,
  content_type text,
  content text,
  source text,
  source_url text,
  relevance_score float8,
  business_type text,
  industry text,
  region text,
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
    cv.id,
    cv.content_id,
    cv.content_type,
    cv.content,
    cv.source,
    cv.source_url,
    cv.relevance_score,
    cv.business_type,
    cv.industry,
    cv.region,
    cv.keywords,
    cv.metadata,
    cv.created_at,
    (1 - (cv.embedding <=> query_embedding)) as similarity
  FROM company_vectors cv
  WHERE 1 - (cv.embedding <=> query_embedding) > match_threshold
  ORDER BY cv.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Trend Vectors用のベクトル検索関数
CREATE OR REPLACE FUNCTION match_trend_vectors(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id int,
  content_id varchar(255),
  content_type varchar(50),
  content text,
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
    tv.content_id,
    tv.content_type,
    tv.content,
    tv.metadata,
    tv.created_at,
    (1 - (tv.embedding <=> query_embedding)) as similarity
  FROM trend_vectors tv
  WHERE 1 - (tv.embedding <=> query_embedding) > match_threshold
  ORDER BY tv.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- YouTube Vectors用のベクトル検索関数
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
  relevance_score float8,
  educational_score float8,
  complexity_level int,
  implementation_score float8,
  video_duration_seconds int,
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

-- 関数作成完了ログ
DO $$
BEGIN
  RAISE NOTICE 'Vector search functions created successfully: match_company_vectors, match_trend_vectors, match_youtube_vectors';
END $$; 