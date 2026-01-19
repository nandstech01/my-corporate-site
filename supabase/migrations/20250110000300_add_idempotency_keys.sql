-- AI Search Optimizer SaaS: 重複実行防止（idempotency_key）
-- 作成日: 2025-01-10
-- 目的: 同一URLの重複分析防止、GitHub Actions再実行時の安全性確保

-- ========================================
-- client_analyses にidempotency_key追加
-- ========================================

-- url_hash列追加（URL→ハッシュ変換、自動生成）
ALTER TABLE aso.client_analyses 
ADD COLUMN IF NOT EXISTS url_hash text GENERATED ALWAYS AS (md5(url)) STORED;

-- pipeline_version列追加（将来のパイプライン変更に備えて）
ALTER TABLE aso.client_analyses 
ADD COLUMN IF NOT EXISTS pipeline_version text NOT NULL DEFAULT 'v1';

-- UNIQUE制約追加（重複防止）
-- 同一テナント、同一URL、同一パイプラインバージョンの組み合わせは1つだけ
CREATE UNIQUE INDEX IF NOT EXISTS uq_client_analyses_idempotency
  ON aso.client_analyses (tenant_id, url_hash, pipeline_version);

-- コメント追加（安全に実行、エラーは無視）
DO $$
BEGIN
  -- 列コメント
  BEGIN
    EXECUTE 'COMMENT ON COLUMN aso.client_analyses.url_hash IS ''URLのMD5ハッシュ（重複チェック用）''';
  EXCEPTION WHEN OTHERS THEN
    -- エラーは無視
  END;
  
  BEGIN
    EXECUTE 'COMMENT ON COLUMN aso.client_analyses.pipeline_version IS ''パイプラインバージョン（v1, v2等）''';
  EXCEPTION WHEN OTHERS THEN
    -- エラーは無視
  END;
  
  -- インデックスコメント
  BEGIN
    EXECUTE 'COMMENT ON INDEX uq_client_analyses_idempotency IS ''重複分析防止（テナント×URL×バージョン）''';
  EXCEPTION WHEN OTHERS THEN
    -- エラーは無視
  END;
END $$;

-- ========================================
-- job_runs にUNIQUE制約追加
-- ========================================

-- 同一分析に対して、完了していないジョブは1つだけ
-- failed/cancelled は除外（再実行を許可）
CREATE UNIQUE INDEX IF NOT EXISTS uq_job_runs_analysis
  ON aso.job_runs (tenant_id, analysis_id)
  WHERE status NOT IN ('failed', 'cancelled');

-- インデックスコメント（安全に実行、エラーは無視）
DO $$
BEGIN
  BEGIN
    EXECUTE 'COMMENT ON INDEX uq_job_runs_analysis IS ''同一分析に対する実行中ジョブは1つだけ（失敗は再実行可）''';
  EXCEPTION WHEN OTHERS THEN
    -- エラーは無視
  END;
END $$;

-- ========================================
-- 冪等性チェック関数
-- ========================================

-- URLが既に分析済みかチェック
CREATE OR REPLACE FUNCTION aso.check_analysis_exists(
  p_tenant_id uuid,
  p_url text,
  p_pipeline_version text DEFAULT 'v1'
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = aso, public, pg_temp
AS $$
DECLARE
  v_analysis_id uuid;
BEGIN
  -- 既存の分析を検索
  SELECT id INTO v_analysis_id
  FROM aso.client_analyses
  WHERE 
    tenant_id = p_tenant_id
    AND url_hash = md5(p_url)
    AND pipeline_version = p_pipeline_version
  LIMIT 1;
  
  RETURN v_analysis_id;
END;
$$;

COMMENT ON FUNCTION aso.check_analysis_exists IS 'URLが既に分析済みかチェック（冪等性保証）';

-- 分析を取得または作成（upsert的な動作）
CREATE OR REPLACE FUNCTION aso.get_or_create_analysis(
  p_tenant_id uuid,
  p_url text,
  p_company_name text DEFAULT NULL,
  p_pipeline_version text DEFAULT 'v1'
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = aso, public, pg_temp
AS $$
DECLARE
  v_analysis_id uuid;
BEGIN
  -- 既存の分析をチェック
  v_analysis_id := aso.check_analysis_exists(p_tenant_id, p_url, p_pipeline_version);
  
  -- 存在しない場合は新規作成
  IF v_analysis_id IS NULL THEN
    INSERT INTO aso.client_analyses (
      tenant_id,
      url,
      company_name,
      pipeline_version
    ) VALUES (
      p_tenant_id,
      p_url,
      p_company_name,
      p_pipeline_version
    )
    RETURNING id INTO v_analysis_id;
  END IF;
  
  RETURN v_analysis_id;
END;
$$;

COMMENT ON FUNCTION aso.get_or_create_analysis IS '分析を取得または作成（冪等性保証）';

-- ========================================
-- テスト用サンプルクエリ
-- ========================================

-- ※ 本番環境では不要。開発環境でのみ実行する場合はコメントアウトを外す
/*
DO $$
DECLARE
  v_tenant_id uuid;
  v_analysis_id_1 uuid;
  v_analysis_id_2 uuid;
BEGIN
  -- テナント取得
  SELECT id INTO v_tenant_id FROM aso.tenants LIMIT 1;
  
  -- 1回目の呼び出し（新規作成）
  v_analysis_id_1 := aso.get_or_create_analysis(
    v_tenant_id,
    'https://example.com',
    'Example Corp',
    'v1'
  );
  
  -- 2回目の呼び出し（既存を返す）
  v_analysis_id_2 := aso.get_or_create_analysis(
    v_tenant_id,
    'https://example.com',
    'Example Corp',
    'v1'
  );
  
  -- 同じIDが返されることを確認
  IF v_analysis_id_1 = v_analysis_id_2 THEN
    RAISE NOTICE '✅ idempotency_key 成功: 同じIDが返された';
  ELSE
    RAISE EXCEPTION '❌ idempotency_key 失敗: 異なるIDが返された';
  END IF;
END $$;
*/

-- ========================================
-- マイグレーション完了ログ
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration 20250110000300_add_idempotency_keys.sql completed successfully';
  RAISE NOTICE '🔒 重複実行防止: url_hash + pipeline_version';
  RAISE NOTICE '🔧 Functions created: check_analysis_exists, get_or_create_analysis';
END $$;

