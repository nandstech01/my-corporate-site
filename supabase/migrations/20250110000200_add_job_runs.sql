-- AI Search Optimizer SaaS: ジョブ実行状態管理テーブル
-- 作成日: 2025-01-10
-- 目的: Cloud Run Jobsの実行状態、リトライ、エラーログを管理

-- ========================================
-- ジョブ実行状態管理テーブル
-- ========================================

CREATE TABLE IF NOT EXISTS clavi.job_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES clavi.tenants(id) ON DELETE CASCADE,
  analysis_id uuid NOT NULL REFERENCES clavi.client_analyses(id) ON DELETE CASCADE,
  
  -- ジョブ情報
  job_type text NOT NULL, -- 'url_analyzer', 'entity_extractor', 'schema_generator', etc.
  cloud_run_execution_id text, -- Cloud Run Jobs実行ID
  
  -- ステータス
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  progress jsonb DEFAULT '{"step": 0, "total_steps": 5, "current_step_name": "initializing"}',
  
  -- リトライ管理
  retry_count integer NOT NULL DEFAULT 0,
  max_retries integer NOT NULL DEFAULT 3,
  
  -- エラー管理
  error_log jsonb DEFAULT '[]', -- [{"step": "crawl", "error": "...", "timestamp": "..."}]
  last_error text,
  
  -- タイムスタンプ
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT job_runs_status_check CHECK (status IN ('pending', 'running', 'completed', 'failed', 'retrying')),
  CONSTRAINT job_runs_retry_count_check CHECK (retry_count >= 0 AND retry_count <= max_retries)
);

-- インデックス
CREATE INDEX idx_job_runs_tenant_id ON clavi.job_runs (tenant_id);
CREATE INDEX idx_job_runs_analysis_id ON clavi.job_runs (analysis_id);
CREATE INDEX idx_job_runs_status ON clavi.job_runs (status);
CREATE INDEX idx_job_runs_created_at ON clavi.job_runs (created_at DESC);
CREATE INDEX idx_job_runs_cloud_run_execution_id ON clavi.job_runs (cloud_run_execution_id) WHERE cloud_run_execution_id IS NOT NULL;

-- コメント
COMMENT ON TABLE clavi.job_runs IS 'Cloud Run Jobsの実行状態、リトライ、エラーログを管理';
COMMENT ON COLUMN clavi.job_runs.job_type IS 'ジョブの種類（url_analyzer, entity_extractor等）';
COMMENT ON COLUMN clavi.job_runs.progress IS 'ジョブの進捗状況（ステップ番号、現在のステップ名）';
COMMENT ON COLUMN clavi.job_runs.error_log IS 'エラーログの配列（ステップごとのエラー情報）';

-- ========================================
-- RLS（Row Level Security）
-- ========================================

ALTER TABLE clavi.job_runs ENABLE ROW LEVEL SECURITY;

-- テナント分離ポリシー
DROP POLICY IF EXISTS job_runs_tenant_isolation ON clavi.job_runs;
CREATE POLICY job_runs_tenant_isolation
  ON clavi.job_runs
  FOR ALL
  USING (tenant_id = clavi.current_tenant_id());

-- ========================================
-- updated_atトリガー（既存関数を利用）
-- ========================================

DROP TRIGGER IF EXISTS trg_job_runs_set_updated_at ON clavi.job_runs;
CREATE TRIGGER trg_job_runs_set_updated_at
  BEFORE UPDATE ON clavi.job_runs
  FOR EACH ROW
  EXECUTE FUNCTION clavi.set_updated_at();

-- ========================================
-- ジョブ状態管理関数
-- ========================================

-- ジョブ開始
CREATE OR REPLACE FUNCTION clavi.start_job_run(
  p_tenant_id uuid,
  p_analysis_id uuid,
  p_job_type text,
  p_cloud_run_execution_id text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = clavi, public, pg_temp
AS $$
DECLARE
  v_job_run_id uuid;
BEGIN
  INSERT INTO clavi.job_runs (
    tenant_id,
    analysis_id,
    job_type,
    cloud_run_execution_id,
    status,
    started_at
  ) VALUES (
    p_tenant_id,
    p_analysis_id,
    p_job_type,
    p_cloud_run_execution_id,
    'running',
    now()
  )
  RETURNING id INTO v_job_run_id;
  
  RETURN v_job_run_id;
END;
$$;

COMMENT ON FUNCTION clavi.start_job_run IS 'ジョブ実行を開始し、job_run_idを返す';

-- ジョブ進捗更新
CREATE OR REPLACE FUNCTION clavi.update_job_progress(
  p_job_run_id uuid,
  p_step integer,
  p_total_steps integer,
  p_current_step_name text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = clavi, public, pg_temp
AS $$
BEGIN
  UPDATE clavi.job_runs
  SET progress = jsonb_build_object(
    'step', p_step,
    'total_steps', p_total_steps,
    'current_step_name', p_current_step_name
  )
  WHERE id = p_job_run_id;
END;
$$;

COMMENT ON FUNCTION clavi.update_job_progress IS 'ジョブの進捗状況を更新';

-- エラーログ追加
CREATE OR REPLACE FUNCTION clavi.add_job_error(
  p_job_run_id uuid,
  p_step_name text,
  p_error_message text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = clavi, public, pg_temp
AS $$
DECLARE
  v_error_entry jsonb;
BEGIN
  v_error_entry := jsonb_build_object(
    'step', p_step_name,
    'error', p_error_message,
    'timestamp', to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  );
  
  UPDATE clavi.job_runs
  SET 
    error_log = COALESCE(error_log, '[]'::jsonb) || v_error_entry,
    last_error = p_error_message
  WHERE id = p_job_run_id;
END;
$$;

COMMENT ON FUNCTION clavi.add_job_error IS 'ジョブのエラーログに新しいエラーを追加';

-- ジョブ完了
CREATE OR REPLACE FUNCTION clavi.complete_job_run(
  p_job_run_id uuid,
  p_success boolean DEFAULT true
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = clavi, public, pg_temp
AS $$
BEGIN
  UPDATE clavi.job_runs
  SET 
    status = CASE WHEN p_success THEN 'completed' ELSE 'failed' END,
    completed_at = now()
  WHERE id = p_job_run_id;
END;
$$;

COMMENT ON FUNCTION clavi.complete_job_run IS 'ジョブ実行を完了（成功 or 失敗）';

-- ジョブリトライ
CREATE OR REPLACE FUNCTION clavi.retry_job_run(
  p_job_run_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = clavi, public, pg_temp
AS $$
DECLARE
  v_retry_count integer;
  v_max_retries integer;
  v_can_retry boolean;
BEGIN
  -- 現在のリトライ回数と上限を取得
  SELECT retry_count, max_retries
  INTO v_retry_count, v_max_retries
  FROM clavi.job_runs
  WHERE id = p_job_run_id;
  
  -- リトライ可能かチェック
  v_can_retry := v_retry_count < v_max_retries;
  
  IF v_can_retry THEN
    -- リトライカウントを増やし、ステータスを更新
    UPDATE clavi.job_runs
    SET 
      retry_count = retry_count + 1,
      status = 'retrying',
      started_at = now()
    WHERE id = p_job_run_id;
  END IF;
  
  RETURN v_can_retry;
END;
$$;

COMMENT ON FUNCTION clavi.retry_job_run IS 'ジョブをリトライ（上限チェック付き）';

-- ========================================
-- ビュー: 失敗ジョブ一覧（運営管理用）
-- ========================================

CREATE OR REPLACE VIEW clavi.v_failed_jobs AS
SELECT 
  jr.id AS job_run_id,
  jr.tenant_id,
  t.name AS tenant_name,
  jr.analysis_id,
  ca.url,
  jr.job_type,
  jr.status,
  jr.retry_count,
  jr.max_retries,
  jr.last_error,
  jr.error_log,
  jr.started_at,
  jr.completed_at,
  jr.created_at
FROM clavi.job_runs jr
JOIN clavi.tenants t ON jr.tenant_id = t.id
JOIN clavi.client_analyses ca ON jr.analysis_id = ca.id
WHERE jr.status = 'failed'
ORDER BY jr.created_at DESC;

COMMENT ON VIEW clavi.v_failed_jobs IS '失敗したジョブの一覧（運営管理用）';

-- ========================================
-- クリーンアップ関数（古いジョブログ削除）
-- ========================================

CREATE OR REPLACE FUNCTION clavi.cleanup_old_job_runs(
  p_retention_days integer DEFAULT 90
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = clavi, public, pg_temp
AS $$
DECLARE
  v_deleted_count integer;
BEGIN
  -- 完了したジョブのうち、保持期間を超えたものを削除
  WITH deleted AS (
    DELETE FROM clavi.job_runs
    WHERE 
      status IN ('completed', 'failed')
      AND completed_at < now() - (p_retention_days || ' days')::interval
    RETURNING id
  )
  SELECT count(*) INTO v_deleted_count FROM deleted;
  
  RETURN v_deleted_count;
END;
$$;

COMMENT ON FUNCTION clavi.cleanup_old_job_runs IS '古いジョブ実行ログを削除（デフォルト90日）';

-- ========================================
-- 統計関数（運営管理用）
-- ========================================

CREATE OR REPLACE FUNCTION clavi.get_job_statistics(
  p_tenant_id uuid DEFAULT NULL,
  p_days integer DEFAULT 7
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = clavi, public, pg_temp
AS $$
DECLARE
  v_stats jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_jobs', count(*),
    'completed_jobs', count(*) FILTER (WHERE status = 'completed'),
    'failed_jobs', count(*) FILTER (WHERE status = 'failed'),
    'success_rate', 
      CASE 
        WHEN count(*) > 0 
        THEN round((count(*) FILTER (WHERE status = 'completed')::numeric / count(*) * 100), 2)
        ELSE 0
      END,
    'avg_processing_time_seconds',
      round(avg(EXTRACT(EPOCH FROM (completed_at - started_at)))::numeric, 2) FILTER (WHERE completed_at IS NOT NULL),
    'total_retries', sum(retry_count)
  )
  INTO v_stats
  FROM clavi.job_runs
  WHERE 
    created_at >= now() - (p_days || ' days')::interval
    AND (p_tenant_id IS NULL OR tenant_id = p_tenant_id);
  
  RETURN v_stats;
END;
$$;

COMMENT ON FUNCTION clavi.get_job_statistics IS 'ジョブ実行の統計情報を取得（過去N日間）';

-- ========================================
-- サンプルデータ（開発用）
-- ========================================

-- ※ 本番環境では不要。開発環境でのみ実行する場合はコメントアウトを外す
/*
DO $$
DECLARE
  v_tenant_id uuid;
  v_analysis_id uuid;
  v_job_run_id uuid;
BEGIN
  -- テナント取得（最初のテナント）
  SELECT id INTO v_tenant_id FROM clavi.tenants LIMIT 1;
  
  -- 分析レコード作成（サンプル）
  INSERT INTO clavi.client_analyses (tenant_id, url, company_name)
  VALUES (v_tenant_id, 'https://example.com', 'Example Corp')
  RETURNING id INTO v_analysis_id;
  
  -- ジョブ実行レコード作成（成功例）
  v_job_run_id := clavi.start_job_run(
    v_tenant_id,
    v_analysis_id,
    'url_analyzer',
    'exec-123456'
  );
  
  PERFORM clavi.update_job_progress(v_job_run_id, 3, 5, 'schema_generation');
  PERFORM clavi.complete_job_run(v_job_run_id, true);
  
  -- ジョブ実行レコード作成（失敗例）
  v_job_run_id := clavi.start_job_run(
    v_tenant_id,
    v_analysis_id,
    'url_analyzer',
    'exec-789012'
  );
  
  PERFORM clavi.add_job_error(v_job_run_id, 'crawl', 'Connection timeout');
  PERFORM clavi.retry_job_run(v_job_run_id);
  PERFORM clavi.add_job_error(v_job_run_id, 'crawl', 'Connection timeout (retry 1)');
  PERFORM clavi.complete_job_run(v_job_run_id, false);
END $$;
*/

-- ========================================
-- マイグレーション完了ログ
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration 20250110000200_add_job_runs.sql completed successfully';
  RAISE NOTICE '📊 Tables created: clavi.job_runs';
  RAISE NOTICE '🔧 Functions created: start_job_run, update_job_progress, add_job_error, complete_job_run, retry_job_run, cleanup_old_job_runs, get_job_statistics';
  RAISE NOTICE '📈 Views created: v_failed_jobs';
END $$;

