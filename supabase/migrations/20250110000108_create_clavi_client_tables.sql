-- CLAVI SaaS専用テーブル: クライアントURL分析結果
-- 作成日: 2025-01-10
-- 目的: 企業（テナント）のURL分析結果を保存

-- pgvector拡張を有効化（ベクトル型使用のため）
CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================================================
-- 1. client_analyses テーブル（分析結果メイン）
-- =============================================================================

CREATE TABLE IF NOT EXISTS clavi.client_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES clavi.tenants(id) ON DELETE CASCADE,
  
  -- URL情報
  url text NOT NULL,
  company_name text,
  site_title text,
  site_description text,
  
  -- 分析データ（JSON形式）
  analysis_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- analysis_data構造:
  -- {
  --   "jsonLd": {...},              -- 生成されたJSON-LD
  --   "fragmentIds": [...],         -- Fragment ID一覧
  --   "entities": {...},            -- エンティティ情報
  --   "hasPartSchema": {...},       -- hasPart/isPart構造
  --   "vectorLinks": [...]          -- ベクトルリンク
  -- }
  
  -- AI構造化スコア
  ai_structure_score integer CHECK (ai_structure_score >= 0 AND ai_structure_score <= 100),
  score_breakdown jsonb, -- スコア内訳
  
  -- 検証結果
  validation_result jsonb,
  -- validation_result構造:
  -- {
  --   "isValid": true/false,
  --   "errors": [...],
  --   "warnings": [...],
  --   "suggestions": [...]
  -- }
  
  -- ステータス
  status text NOT NULL DEFAULT 'completed' 
    CHECK (status IN ('processing', 'completed', 'failed', 'expired')),
  error_message text,
  
  -- タイムスタンプ
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz -- ダウンロード期限（例: 30日後）
);

-- インデックス
CREATE INDEX idx_client_analyses_tenant_id ON clavi.client_analyses(tenant_id);
CREATE INDEX idx_client_analyses_url ON clavi.client_analyses(url);
CREATE INDEX idx_client_analyses_status ON clavi.client_analyses(status);
CREATE INDEX idx_client_analyses_created_at ON clavi.client_analyses(created_at DESC);

-- updated_at 自動更新トリガー
DROP TRIGGER IF EXISTS trg_client_analyses_set_updated_at ON clavi.client_analyses;
CREATE TRIGGER trg_client_analyses_set_updated_at
  BEFORE UPDATE ON clavi.client_analyses
  FOR EACH ROW
  EXECUTE FUNCTION clavi.set_updated_at();

-- RLS設定（テナント分離）
ALTER TABLE clavi.client_analyses ENABLE ROW LEVEL SECURITY;

-- テナント所属者のみ自身のデータにアクセス可能
CREATE POLICY client_analyses_tenant_isolation
  ON clavi.client_analyses
  FOR ALL
  USING (tenant_id = clavi.current_tenant_id())
  WITH CHECK (tenant_id = clavi.current_tenant_id());

-- service_role は全データにアクセス可能（管理者・ジョブ用）
CREATE POLICY client_analyses_service_role_access
  ON clavi.client_analyses
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

COMMENT ON TABLE clavi.client_analyses IS 
'クライアントURL分析結果。各テナント（企業）が分析したURLの結果を保存。';

-- =============================================================================
-- 2. fragment_vectors テーブル（Fragment ID ベクトル化データ）
-- =============================================================================

CREATE TABLE IF NOT EXISTS clavi.fragment_vectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid NOT NULL REFERENCES clavi.client_analyses(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES clavi.tenants(id) ON DELETE CASCADE,
  
  -- Fragment ID情報
  fragment_id text NOT NULL,
  complete_uri text NOT NULL, -- https://client-site.com/page#fragment-id
  page_path text NOT NULL,
  content_title text,
  content text NOT NULL,
  content_type text CHECK (content_type IN ('faq', 'service', 'section', 'heading', 'author', 'case-study')),
  
  -- ベクトル化データ
  embedding vector(1536) NOT NULL, -- OpenAI Embeddings
  
  -- 検索最適化
  category text,
  semantic_weight float DEFAULT 1.0,
  target_queries text[],
  related_entities text[],
  
  -- メタデータ
  metadata jsonb DEFAULT '{}'::jsonb,
  
  -- タイムスタンプ
  created_at timestamptz NOT NULL DEFAULT now()
);

-- インデックス
CREATE INDEX idx_fragment_vectors_analysis_id ON clavi.fragment_vectors(analysis_id);
CREATE INDEX idx_fragment_vectors_tenant_id ON clavi.fragment_vectors(tenant_id);
CREATE INDEX idx_fragment_vectors_fragment_id ON clavi.fragment_vectors(fragment_id);
CREATE INDEX idx_fragment_vectors_embedding ON clavi.fragment_vectors 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- RLS設定（テナント分離）
ALTER TABLE clavi.fragment_vectors ENABLE ROW LEVEL SECURITY;

-- テナント所属者のみ自身のデータにアクセス可能
CREATE POLICY fragment_vectors_tenant_isolation
  ON clavi.fragment_vectors
  FOR ALL
  USING (tenant_id = clavi.current_tenant_id())
  WITH CHECK (tenant_id = clavi.current_tenant_id());

-- service_role は全データにアクセス可能
CREATE POLICY fragment_vectors_service_role_access
  ON clavi.fragment_vectors
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

COMMENT ON TABLE clavi.fragment_vectors IS 
'Fragment ID ベクトル化データ。クライアントURL分析で生成されたFragment IDをベクトル検索可能にする。';

-- =============================================================================
-- 3. performance_metrics テーブル（パフォーマンス指標）
-- =============================================================================

CREATE TABLE IF NOT EXISTS clavi.performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid NOT NULL REFERENCES clavi.client_analyses(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES clavi.tenants(id) ON DELETE CASCADE,
  
  -- パフォーマンス指標
  processing_time_ms integer, -- 処理時間（ミリ秒）
  fragment_count integer,     -- 生成されたFragment ID数
  vector_count integer,       -- ベクトル化されたFragment数
  entity_count integer,       -- 抽出されたエンティティ数
  validation_errors integer,  -- 検証エラー数
  validation_warnings integer,-- 検証警告数
  
  -- コスト（将来的に課金基準に使用）
  openai_tokens_used integer,
  estimated_cost_usd numeric(10, 4),
  
  -- タイムスタンプ
  recorded_at timestamptz NOT NULL DEFAULT now()
);

-- インデックス
CREATE INDEX idx_performance_metrics_analysis_id ON clavi.performance_metrics(analysis_id);
CREATE INDEX idx_performance_metrics_tenant_id ON clavi.performance_metrics(tenant_id);
CREATE INDEX idx_performance_metrics_recorded_at ON clavi.performance_metrics(recorded_at DESC);

-- RLS設定（テナント分離）
ALTER TABLE clavi.performance_metrics ENABLE ROW LEVEL SECURITY;

-- テナント所属者のみ自身のデータにアクセス可能
CREATE POLICY performance_metrics_tenant_isolation
  ON clavi.performance_metrics
  FOR ALL
  USING (tenant_id = clavi.current_tenant_id())
  WITH CHECK (tenant_id = clavi.current_tenant_id());

-- service_role は全データにアクセス可能
CREATE POLICY performance_metrics_service_role_access
  ON clavi.performance_metrics
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

COMMENT ON TABLE clavi.performance_metrics IS 
'URL分析のパフォーマンス指標。処理時間、コスト等を記録。';

-- =============================================================================
-- 4. 便利なビュー（publicスキーマ）
-- =============================================================================

-- publicスキーマにビューを作成（Supabase JS Clientからアクセス可能にする）
CREATE OR REPLACE VIEW public.clavi_client_analyses AS
SELECT * FROM clavi.client_analyses;

CREATE OR REPLACE VIEW public.clavi_fragment_vectors AS
SELECT * FROM clavi.fragment_vectors;

CREATE OR REPLACE VIEW public.clavi_performance_metrics AS
SELECT * FROM clavi.performance_metrics;

COMMENT ON VIEW public.clavi_client_analyses IS 
'clavi.client_analyses のpublicスキーマビュー（Supabase JS Client用）';

COMMENT ON VIEW public.clavi_fragment_vectors IS 
'clavi.fragment_vectors のpublicスキーマビュー（Supabase JS Client用）';

COMMENT ON VIEW public.clavi_performance_metrics IS 
'clavi.performance_metrics のpublicスキーマビュー（Supabase JS Client用）';

-- =============================================================================
-- 5. ヘルパー関数
-- =============================================================================

-- Fragment Vector ハイブリッド検索（CLAVI専用）
CREATE OR REPLACE FUNCTION clavi.hybrid_search_client_fragments(
  p_tenant_id uuid,
  p_query_text text,
  p_query_embedding vector(1536),
  p_match_threshold float DEFAULT 0.3,
  p_match_count integer DEFAULT 10,
  p_bm25_weight float DEFAULT 0.4,
  p_vector_weight float DEFAULT 0.6
)
RETURNS TABLE (
  id uuid,
  fragment_id text,
  complete_uri text,
  content text,
  bm25_score float,
  vector_score float,
  combined_score float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = clavi, public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  WITH bm25_results AS (
    SELECT
      fv.id,
      fv.fragment_id,
      fv.complete_uri,
      fv.content,
      ts_rank_cd(to_tsvector('japanese', fv.content), plainto_tsquery('japanese', p_query_text)) AS bm25_score
    FROM clavi.fragment_vectors fv
    WHERE fv.tenant_id = p_tenant_id
      AND to_tsvector('japanese', fv.content) @@ plainto_tsquery('japanese', p_query_text)
  ),
  vector_results AS (
    SELECT
      fv.id,
      fv.fragment_id,
      fv.complete_uri,
      fv.content,
      1 - (fv.embedding <=> p_query_embedding) AS vector_score
    FROM clavi.fragment_vectors fv
    WHERE fv.tenant_id = p_tenant_id
      AND (1 - (fv.embedding <=> p_query_embedding)) > p_match_threshold
  )
  SELECT
    COALESCE(b.id, v.id) AS id,
    COALESCE(b.fragment_id, v.fragment_id) AS fragment_id,
    COALESCE(b.complete_uri, v.complete_uri) AS complete_uri,
    COALESCE(b.content, v.content) AS content,
    COALESCE(b.bm25_score, 0)::float AS bm25_score,
    COALESCE(v.vector_score, 0)::float AS vector_score,
    (COALESCE(b.bm25_score, 0) * p_bm25_weight + COALESCE(v.vector_score, 0) * p_vector_weight)::float AS combined_score
  FROM bm25_results b
  FULL OUTER JOIN vector_results v ON b.id = v.id
  ORDER BY combined_score DESC
  LIMIT p_match_count;
END;
$$;

REVOKE ALL ON FUNCTION clavi.hybrid_search_client_fragments FROM PUBLIC;
GRANT EXECUTE ON FUNCTION clavi.hybrid_search_client_fragments TO authenticated;
GRANT EXECUTE ON FUNCTION clavi.hybrid_search_client_fragments TO service_role;

COMMENT ON FUNCTION clavi.hybrid_search_client_fragments IS 
'CLAVI専用Fragment Vector ハイブリッド検索。テナント分離済み。';

-- =============================================================================
-- 完了メッセージ
-- =============================================================================

DO $$ BEGIN
  RAISE NOTICE '✅ CLAVI SaaS専用テーブル作成完了';
  RAISE NOTICE '  - clavi.client_analyses（分析結果）';
  RAISE NOTICE '  - clavi.fragment_vectors（ベクトル化データ）';
  RAISE NOTICE '  - clavi.performance_metrics（パフォーマンス指標）';
  RAISE NOTICE '  - publicスキーマビュー作成完了';
  RAISE NOTICE '  - RLS設定完了（テナント分離）';
  RAISE NOTICE '  - ハイブリッド検索関数作成完了';
END $$;

