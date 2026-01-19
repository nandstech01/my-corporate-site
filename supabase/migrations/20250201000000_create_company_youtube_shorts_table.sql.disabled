-- =====================================================
-- 自社YouTubeショート動画専用テーブル
-- Fragment ID統合・ベクトルリンク完全対応
-- Mike King理論準拠：レリバンスエンジニアリング実装
-- =====================================================
-- 
-- 設計理念:
-- 1. 既存のFragment Vectorsシステムに完全統合
-- 2. content_type: 'youtube-short' として Fragment ID体系に追加
-- 3. /admin/fragment-vectors で可視化可能
-- 4. Complete URI: https://nands.tech/shorts#youtube-short-{id}
-- 5. ブログ記事との1対1連携
-- 
-- ベクトルリンク構造:
-- - 公開層（Complete URI）: https://nands.tech/shorts#youtube-short-{id}
-- - 非公開層（Embedding）: 1536次元ベクトル
-- - Fragment ID: youtube-short-{id}
-- =====================================================

CREATE TABLE IF NOT EXISTS company_youtube_shorts (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  
  -- ===== Fragment ID統合（既存設計準拠） =====
  fragment_id VARCHAR(255) NOT NULL UNIQUE,           -- youtube-short-1, youtube-short-2...
  complete_uri TEXT NOT NULL UNIQUE,                  -- https://nands.tech/shorts#youtube-short-1
  page_path VARCHAR(500) NOT NULL DEFAULT '/shorts',  -- 専用ページパス
  
  -- ===== ブログ記事連携 =====
  related_blog_post_id INT,                           -- posts.id（NULL許可：台本のみ先行作成可能）
  blog_slug VARCHAR(255),                             -- posts.slug
  
  -- ===== YouTube動画情報（既存動画を取得する場合） =====
  video_id VARCHAR(20) UNIQUE,                        -- YouTube動画ID（既存動画）
  video_url TEXT,                                     -- YouTube動画URL（フル）
  embed_url TEXT,                                     -- YouTube埋め込みURL
  title TEXT,                                         -- YouTube動画タイトル
  description TEXT,                                   -- YouTube動画説明
  thumbnail_url TEXT,                                 -- サムネイルURL
  duration_seconds INT,                               -- 動画の長さ（秒）
  
  -- ===== コンテンツ情報 =====
  content_title TEXT NOT NULL,                        -- 動画タイトル（=Fragment IDのタイトル）
  content TEXT NOT NULL,                              -- 完全台本（=Fragment IDのコンテンツ）
  content_type VARCHAR(100) NOT NULL DEFAULT 'youtube-short',  -- Fragment ID content_type
  
  -- ===== 4フェーズ台本構造（台本生成時に使用） =====
  script_title TEXT,                                  -- フック重視タイトル（20文字以内）
  script_hook TEXT,                                   -- フェーズ1: フック（0-2秒）
  script_empathy TEXT,                                -- フェーズ2: 共感（3-5秒）
  script_body TEXT,                                   -- フェーズ3: 本題（5-20秒）
  script_cta TEXT,                                    -- フェーズ4: CTA（ラスト5秒）
  script_duration_seconds INT DEFAULT 30,             -- 総尺（30秒が標準）
  
  -- ===== ビジュアル指示 =====
  visual_instructions JSONB,                          -- ビジュアル指示書（シーン別）
  text_overlays TEXT[],                               -- テキストオーバーレイ配列
  background_music_suggestion TEXT,                   -- BGM提案
  
  -- ===== バズ要素 =====
  viral_elements TEXT[],                              -- バズる要素配列（驚き、共感、実用性）
  virality_score FLOAT DEFAULT 0.5,                   -- バズ度スコア（0.0-1.0）
  target_emotion VARCHAR(50),                         -- 狙う感情（驚き、共感、面白さ、実用性）
  hook_type VARCHAR(50),                              -- フックタイプ（質問、衝撃事実、問題提起、挑発、共感）
  
  -- ===== ベクトル埋め込み（既存設計準拠） =====
  content_for_embedding TEXT,                         -- ベクトル化用コンテンツ
  embedding vector(1536),                             -- OpenAI text-embedding-3-large
  
  -- ===== Fragment ID メタデータ（既存設計準拠） =====
  category VARCHAR(100) NOT NULL DEFAULT 'youtube',   -- カテゴリ
  semantic_weight FLOAT DEFAULT 0.85,                 -- セマンティック重み（0.0-1.0）
  target_queries TEXT[],                              -- ターゲットクエリ配列
  related_entities TEXT[],                            -- 関連エンティティ配列
  entity_definition JSONB,                            -- エンティティ定義
  schema_data JSONB,                                  -- Schema.org構造化データ
  ai_optimization_score INT DEFAULT 0,                -- AI最適化スコア（0-100）
  
  -- ===== YouTube投稿情報（実際に投稿したら更新） =====
  youtube_video_id VARCHAR(20),                       -- YouTube動画ID（投稿後）
  youtube_url TEXT,                                   -- YouTube URL（投稿後）
  published_at TIMESTAMP WITH TIME ZONE,              -- YouTube投稿日時
  
  -- ===== バズ指標（投稿後に更新） =====
  view_count BIGINT DEFAULT 0,
  like_count BIGINT DEFAULT 0,
  comment_count BIGINT DEFAULT 0,
  engagement_rate FLOAT DEFAULT 0,                    -- (like+comment)/view
  
  -- ===== その他メタデータ =====
  tags TEXT[],                                        -- ハッシュタグ配列
  metadata JSONB DEFAULT '{}',                        -- 追加メタデータ
  
  -- ===== 管理情報 =====
  status VARCHAR(20) DEFAULT 'draft',                 -- draft, published, viral
  source_system VARCHAR(50) DEFAULT 'fragment_id_youtube_short',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== インデックス作成 =====

-- Fragment ID検索（最重要）
CREATE INDEX company_youtube_shorts_fragment_id_idx ON company_youtube_shorts(fragment_id);

-- Complete URI検索
CREATE INDEX company_youtube_shorts_complete_uri_idx ON company_youtube_shorts(complete_uri);

-- Page Path検索（Fragment Vectors互換）
CREATE INDEX company_youtube_shorts_page_path_idx ON company_youtube_shorts(page_path);

-- Content Type検索（Fragment Vectors互換）
CREATE INDEX company_youtube_shorts_content_type_idx ON company_youtube_shorts(content_type);

-- ブログ記事連携検索
CREATE INDEX company_youtube_shorts_blog_id_idx ON company_youtube_shorts(related_blog_post_id);

-- ステータス検索
CREATE INDEX company_youtube_shorts_status_idx ON company_youtube_shorts(status);

-- バズ指標検索（エンゲージメント順）
CREATE INDEX company_youtube_shorts_engagement_idx ON company_youtube_shorts(engagement_rate DESC);

-- ベクトル検索（HNSW: Hierarchical Navigable Small World）
CREATE INDEX company_youtube_shorts_embedding_idx ON company_youtube_shorts 
  USING hnsw (embedding vector_cosine_ops);

-- カテゴリ検索（Fragment Vectors互換）
CREATE INDEX company_youtube_shorts_category_idx ON company_youtube_shorts(category);

-- YouTube投稿日時検索
CREATE INDEX company_youtube_shorts_published_idx ON company_youtube_shorts(published_at DESC);

-- ===== RLS (Row Level Security) 設定 =====
ALTER TABLE company_youtube_shorts ENABLE ROW LEVEL SECURITY;

-- 認証ユーザーは全データ読み取り可能
CREATE POLICY "Enable read access for authenticated users" ON company_youtube_shorts
  FOR SELECT USING (auth.role() = 'authenticated');

-- 認証ユーザーは挿入可能
CREATE POLICY "Enable insert access for authenticated users" ON company_youtube_shorts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 認証ユーザーは更新可能
CREATE POLICY "Enable update access for authenticated users" ON company_youtube_shorts
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 認証ユーザーは削除可能
CREATE POLICY "Enable delete access for authenticated users" ON company_youtube_shorts
  FOR DELETE USING (auth.role() = 'authenticated');

-- ===== 自動更新トリガー =====
CREATE OR REPLACE FUNCTION update_company_youtube_shorts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_company_youtube_shorts_updated_at_trigger
  BEFORE UPDATE ON company_youtube_shorts
  FOR EACH ROW
  EXECUTE FUNCTION update_company_youtube_shorts_updated_at();

-- ===== ベクトル検索関数（Fragment Vectors互換） =====
CREATE OR REPLACE FUNCTION match_company_youtube_shorts(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.3,
  match_count INT DEFAULT 5,
  filter_status TEXT DEFAULT NULL
)
RETURNS TABLE (
  id BIGINT,
  fragment_id VARCHAR,
  complete_uri TEXT,
  page_path VARCHAR,
  content_title TEXT,
  content TEXT,
  content_type VARCHAR,
  script_title TEXT,
  category VARCHAR,
  semantic_weight FLOAT,
  target_queries TEXT[],
  related_entities TEXT[],
  similarity FLOAT,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cys.id,
    cys.fragment_id,
    cys.complete_uri,
    cys.page_path,
    cys.content_title,
    cys.content,
    cys.content_type,
    cys.script_title,
    cys.category,
    cys.semantic_weight,
    cys.target_queries,
    cys.related_entities,
    1 - (cys.embedding <=> query_embedding) AS similarity,
    cys.metadata
  FROM company_youtube_shorts cys
  WHERE 
    (1 - (cys.embedding <=> query_embedding)) > match_threshold
    AND (filter_status IS NULL OR cys.status = filter_status)
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- ===== 完了通知 =====
DO $$
BEGIN
  RAISE NOTICE '✅ company_youtube_shorts テーブル作成完了';
  RAISE NOTICE '📊 Fragment ID統合: youtube-short-{id}';
  RAISE NOTICE '🔗 Complete URI: https://nands.tech/shorts#youtube-short-{id}';
  RAISE NOTICE '🎯 content_type: youtube-short';
  RAISE NOTICE '📱 /admin/fragment-vectors で可視化可能';
  RAISE NOTICE '🎬 4フェーズ台本構造完全対応';
  RAISE NOTICE '🔍 ベクトル検索関数: match_company_youtube_shorts()';
END $$;

