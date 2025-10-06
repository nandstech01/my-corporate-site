-- postsテーブルにYouTubeショート台本関連のカラムを追加
-- YouTubeショート動画のワークフロー管理用

-- YouTubeショート台本ID（company_youtube_shortsへの参照）
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS youtube_script_id INTEGER REFERENCES company_youtube_shorts(id) ON DELETE SET NULL;

-- YouTubeショート台本のステータス
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS youtube_script_status VARCHAR(50);

-- ステータス値の定義:
-- NULL: 台本未生成
-- 'script_generated': 台本生成済み（レビュー待ち）
-- 'script_approved': 台本承認済み（動画編集開始可能）
-- 'video_editing': 動画編集中
-- 'video_uploaded': YouTube投稿完了
-- 'embedded': 記事に埋め込み完了
-- 'no_video': 動画なし（記事のみ公開）

-- インデックス作成（検索高速化）
CREATE INDEX IF NOT EXISTS idx_posts_youtube_script_id 
  ON posts(youtube_script_id);

CREATE INDEX IF NOT EXISTS idx_posts_youtube_script_status 
  ON posts(youtube_script_status);

-- ユニーク制約（1つの記事に1つの台本のみ）
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_post_script 
  ON posts(youtube_script_id) 
  WHERE youtube_script_id IS NOT NULL;

-- company_youtube_shortsテーブルにもワークフローステータス追加
ALTER TABLE company_youtube_shorts
ADD COLUMN IF NOT EXISTS workflow_status VARCHAR(50) DEFAULT 'draft';

ALTER TABLE company_youtube_shorts
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;

ALTER TABLE company_youtube_shorts
ADD COLUMN IF NOT EXISTS approved_by VARCHAR(255);

ALTER TABLE company_youtube_shorts
ADD COLUMN IF NOT EXISTS video_editing_started_at TIMESTAMP;

ALTER TABLE company_youtube_shorts
ADD COLUMN IF NOT EXISTS youtube_uploaded_at TIMESTAMP;

ALTER TABLE company_youtube_shorts
ADD COLUMN IF NOT EXISTS embedded_at TIMESTAMP;

ALTER TABLE company_youtube_shorts
ADD COLUMN IF NOT EXISTS notes TEXT;

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_youtube_shorts_workflow_status 
  ON company_youtube_shorts(workflow_status);

CREATE INDEX IF NOT EXISTS idx_youtube_shorts_related_post 
  ON company_youtube_shorts(related_blog_post_id);

-- 外部キー制約（company_youtube_shorts → posts）
ALTER TABLE company_youtube_shorts
ADD CONSTRAINT fk_blog_post
FOREIGN KEY (related_blog_post_id)
REFERENCES posts(id)
ON DELETE CASCADE;

-- 確認メッセージ
DO $$ BEGIN
  RAISE NOTICE '✅ YouTubeショート台本ワークフローカラム追加完了';
  RAISE NOTICE '📊 posts.youtube_script_id: company_youtube_shortsへの参照';
  RAISE NOTICE '📊 posts.youtube_script_status: ワークフローステータス';
  RAISE NOTICE '📊 company_youtube_shorts.workflow_status: 台本側のステータス';
END $$;

