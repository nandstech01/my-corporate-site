-- YouTube RAG用のベクトルテーブル作成
CREATE TABLE IF NOT EXISTS youtube_vectors (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  content_id text NOT NULL,
  content_type text NOT NULL DEFAULT 'youtube_video',
  video_title text NOT NULL,
  channel_name text NOT NULL,
  video_url text NOT NULL,
  content text NOT NULL,
  embedding vector(1536) NOT NULL,
  source text NOT NULL DEFAULT 'youtube',
  source_url text NOT NULL,
  relevance_score float8 DEFAULT 0,
  educational_score float8 DEFAULT 0,
  complexity_level int DEFAULT 1,
  implementation_score float8 DEFAULT 0,
  video_duration_seconds int DEFAULT 0,
  view_count bigint DEFAULT 0,
  like_count bigint DEFAULT 0,
  published_at timestamp with time zone NOT NULL,
  transcript_language text DEFAULT 'en',
  keywords text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS youtube_vectors_embedding_idx ON youtube_vectors USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS youtube_vectors_content_type_idx ON youtube_vectors(content_type);
CREATE INDEX IF NOT EXISTS youtube_vectors_video_title_idx ON youtube_vectors(video_title);
CREATE INDEX IF NOT EXISTS youtube_vectors_channel_name_idx ON youtube_vectors(channel_name);
CREATE INDEX IF NOT EXISTS youtube_vectors_published_at_idx ON youtube_vectors(published_at);
CREATE INDEX IF NOT EXISTS youtube_vectors_educational_score_idx ON youtube_vectors(educational_score);
CREATE INDEX IF NOT EXISTS youtube_vectors_complexity_level_idx ON youtube_vectors(complexity_level);
CREATE INDEX IF NOT EXISTS youtube_vectors_keywords_idx ON youtube_vectors USING gin(keywords);
CREATE INDEX IF NOT EXISTS youtube_vectors_metadata_idx ON youtube_vectors USING gin(metadata);

-- RLS (Row Level Security) 設定
ALTER TABLE youtube_vectors ENABLE ROW LEVEL SECURITY;

-- 認証されたユーザーのみアクセス可能
CREATE POLICY "Enable read access for authenticated users" ON youtube_vectors
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON youtube_vectors
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON youtube_vectors
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users" ON youtube_vectors
  FOR DELETE USING (auth.role() = 'authenticated');

-- 更新トリガーを追加
CREATE OR REPLACE FUNCTION update_youtube_vectors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_youtube_vectors_updated_at_trigger
  BEFORE UPDATE ON youtube_vectors
  FOR EACH ROW
  EXECUTE FUNCTION update_youtube_vectors_updated_at();

-- テーブル作成完了ログ
DO $$
BEGIN
  RAISE NOTICE 'YouTube RAG vectors table created successfully with indexes and RLS policies';
END $$; 