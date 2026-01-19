-- ===================================
-- VIDEO Jobs テーブル作成
-- 作成日: 2025-12-10
-- 用途: ショート動画制作ジョブ管理
-- ===================================

-- uuid-ossp拡張有効化（まだの場合）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- video_jobsテーブル作成
CREATE TABLE IF NOT EXISTS video_jobs (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status                VARCHAR(50) NOT NULL DEFAULT 'draft',
  title_internal        TEXT NOT NULL,
  youtube_title         TEXT NOT NULL,
  youtube_description   TEXT,
  youtube_tags          TEXT[],
  script_raw            TEXT NOT NULL,
  script_struct         JSONB,
  voice                 JSONB,
  avatar                JSONB,
  background            JSONB,
  caption               JSONB,
  music                 JSONB,
  timeline              JSONB,
  akool_job_id          TEXT,
  akool_video_url       TEXT,
  final_video_url       TEXT,
  youtube_video_id      TEXT,
  youtube_url           TEXT,
  youtube_published_at  TIMESTAMP WITH TIME ZONE,
  metrics               JSONB,
  related_blog_post_id  INTEGER, -- ⚠️ 一時的に外部キー制約を削除（posts テーブル未作成のため）
  article_slug          TEXT,
  created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ===================================
-- インデックス作成
-- ===================================

CREATE INDEX IF NOT EXISTS idx_video_jobs_user_id ON video_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_video_jobs_status ON video_jobs(status);
CREATE INDEX IF NOT EXISTS idx_video_jobs_user_status ON video_jobs(user_id, status);
CREATE INDEX IF NOT EXISTS idx_video_jobs_created_at ON video_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_video_jobs_user_created ON video_jobs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_video_jobs_akool_job_id ON video_jobs(akool_job_id) WHERE akool_job_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_video_jobs_youtube_id ON video_jobs(youtube_video_id) WHERE youtube_video_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_video_jobs_blog_post ON video_jobs(related_blog_post_id) WHERE related_blog_post_id IS NOT NULL;

-- ===================================
-- 制約追加（冪等化）
-- ===================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_video_jobs_status'
  ) THEN
    ALTER TABLE video_jobs
    ADD CONSTRAINT check_video_jobs_status
    CHECK (status IN ('draft', 'akool_processing', 'akool_done', 'final_uploaded', 'youtube_uploaded', 'error'));
  END IF;
END $$;

-- ===================================
-- トリガー作成（updated_at自動更新）
-- ===================================

CREATE OR REPLACE FUNCTION update_video_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_video_jobs_updated_at ON video_jobs;
CREATE TRIGGER trigger_video_jobs_updated_at
BEFORE UPDATE ON video_jobs
FOR EACH ROW
EXECUTE FUNCTION update_video_jobs_updated_at();

-- ===================================
-- Row Level Security (RLS)
-- ===================================

ALTER TABLE video_jobs ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のレコードのみ閲覧可能
DROP POLICY IF EXISTS "Users can view own video jobs" ON video_jobs;
CREATE POLICY "Users can view own video jobs"
ON video_jobs FOR SELECT
USING (auth.uid() = user_id);

-- ユーザーは自分のレコードのみ作成可能
DROP POLICY IF EXISTS "Users can create own video jobs" ON video_jobs;
CREATE POLICY "Users can create own video jobs"
ON video_jobs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のレコードのみ更新可能
DROP POLICY IF EXISTS "Users can update own video jobs" ON video_jobs;
CREATE POLICY "Users can update own video jobs"
ON video_jobs FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のレコードのみ削除可能
DROP POLICY IF EXISTS "Users can delete own video jobs" ON video_jobs;
CREATE POLICY "Users can delete own video jobs"
ON video_jobs FOR DELETE
USING (auth.uid() = user_id);

-- ===================================
-- コメント
-- ===================================

COMMENT ON TABLE video_jobs IS 'VIDEO Job管理テーブル（ショート動画制作ジョブ）';
COMMENT ON COLUMN video_jobs.user_id IS 'ユーザーID（auth.users.id）';
COMMENT ON COLUMN video_jobs.status IS 'ジョブステータス（draft, akool_processing, akool_done, final_uploaded, youtube_uploaded, error）';
COMMENT ON COLUMN video_jobs.title_internal IS '内部管理用タイトル';
COMMENT ON COLUMN video_jobs.youtube_title IS 'YouTubeタイトル';
COMMENT ON COLUMN video_jobs.script_raw IS '生のテキスト台本';
COMMENT ON COLUMN video_jobs.voice IS '音声設定（JSON）';
COMMENT ON COLUMN video_jobs.avatar IS 'アバター設定（JSON）';
COMMENT ON COLUMN video_jobs.akool_job_id IS 'Akool APIジョブID';
COMMENT ON COLUMN video_jobs.final_video_url IS '最終動画URL（Supabase Storage）';
COMMENT ON COLUMN video_jobs.youtube_video_id IS 'YouTubeビデオID';

