-- AI Search Optimizer SaaS: 失敗分類システム
-- 作成日: 2025-01-10
-- 目的: エラーを retryable/terminal/needs_review に分類し、運用を安定化

-- ========================================
-- failure_type 列追加
-- ========================================

ALTER TABLE aso.job_runs 
ADD COLUMN IF NOT EXISTS failure_type text 
  CHECK (failure_type IN ('retryable', 'terminal', 'needs_review'));

COMMENT ON COLUMN aso.job_runs.failure_type IS 'エラー分類: retryable（リトライ可）, terminal（完全失敗）, needs_review（人間判断必要）';

-- ========================================
-- エラー分類ロジック関数
-- ========================================

-- HTTPステータスコードから failure_type を判定
CREATE OR REPLACE FUNCTION aso.classify_http_error(
  p_status_code integer
) RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  CASE 
    -- リトライ可能エラー
    WHEN p_status_code IN (429, 503, 504) THEN
      RETURN 'retryable';
    
    -- 完全失敗（リトライしても無駄）
    WHEN p_status_code IN (400, 401, 403, 404, 410) THEN
      RETURN 'terminal';
    
    -- サーバーエラー（人間判断）
    WHEN p_status_code BETWEEN 500 AND 599 THEN
      RETURN 'needs_review';
    
    -- その他
    ELSE
      RETURN 'needs_review';
  END CASE;
END;
$$;

COMMENT ON FUNCTION aso.classify_http_error IS 'HTTPステータスコードから failure_type を判定';

-- エラーメッセージから failure_type を判定
CREATE OR REPLACE FUNCTION aso.classify_error_message(
  p_error_message text
) RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- タイムアウト系
  IF p_error_message ~* '(timeout|timed out|time out)' THEN
    RETURN 'retryable';
  END IF;
  
  -- 接続エラー
  IF p_error_message ~* '(connection|ECONNREFUSED|ENOTFOUND)' THEN
    RETURN 'retryable';
  END IF;
  
  -- レート制限
  IF p_error_message ~* '(rate limit|too many requests)' THEN
    RETURN 'retryable';
  END IF;
  
  -- 認証エラー
  IF p_error_message ~* '(unauthorized|forbidden|authentication)' THEN
    RETURN 'terminal';
  END IF;
  
  -- 404エラー
  IF p_error_message ~* '(not found|404)' THEN
    RETURN 'terminal';
  END IF;
  
  -- JSON-LD検証エラー
  IF p_error_message ~* '(validation|schema|invalid json)' THEN
    RETURN 'needs_review';
  END IF;
  
  -- その他
  RETURN 'needs_review';
END;
$$;

COMMENT ON FUNCTION aso.classify_error_message IS 'エラーメッセージから failure_type を判定';

-- ========================================
-- エラー記録関数（分類付き）
-- ========================================

CREATE OR REPLACE FUNCTION aso.add_job_error_classified(
  p_job_run_id uuid,
  p_step_name text,
  p_error_message text,
  p_http_status_code integer DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = aso, public, pg_temp
AS $$
DECLARE
  v_error_entry jsonb;
  v_failure_type text;
BEGIN
  -- エラー分類
  IF p_http_status_code IS NOT NULL THEN
    v_failure_type := aso.classify_http_error(p_http_status_code);
  ELSE
    v_failure_type := aso.classify_error_message(p_error_message);
  END IF;
  
  -- エラーエントリ作成
  v_error_entry := jsonb_build_object(
    'step', p_step_name,
    'error', p_error_message,
    'http_status', p_http_status_code,
    'failure_type', v_failure_type,
    'timestamp', to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  );
  
  -- エラーログ追加 + failure_type更新
  UPDATE aso.job_runs
  SET 
    error_log = COALESCE(error_log, '[]'::jsonb) || v_error_entry,
    last_error = p_error_message,
    failure_type = v_failure_type
  WHERE id = p_job_run_id;
END;
$$;

COMMENT ON FUNCTION aso.add_job_error_classified IS 'エラーログに追加（自動分類付き）';

-- ========================================
-- リトライ判定関数（改善版）
-- ========================================

-- リトライ可能かどうかを判定（failure_typeを考慮）
CREATE OR REPLACE FUNCTION aso.can_retry_job(
  p_job_run_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = aso, public, pg_temp
AS $$
DECLARE
  v_retry_count integer;
  v_max_retries integer;
  v_failure_type text;
  v_can_retry boolean;
BEGIN
  -- ジョブ情報取得
  SELECT retry_count, max_retries, failure_type
  INTO v_retry_count, v_max_retries, v_failure_type
  FROM aso.job_runs
  WHERE id = p_job_run_id;
  
  -- 基本条件: リトライ回数が上限未満
  v_can_retry := v_retry_count < v_max_retries;
  
  -- failure_type による判定
  IF v_failure_type = 'terminal' THEN
    -- 完全失敗はリトライ不可
    v_can_retry := false;
  ELSIF v_failure_type = 'needs_review' THEN
    -- 人間判断必要はリトライしない（人間の承認待ち）
    v_can_retry := false;
  ELSIF v_failure_type = 'retryable' THEN
    -- リトライ可能（回数制限のみ）
    v_can_retry := v_can_retry;
  END IF;
  
  RETURN v_can_retry;
END;
$$;

COMMENT ON FUNCTION aso.can_retry_job IS 'リトライ可能かどうかを判定（failure_typeを考慮）';

-- ========================================
-- 失敗統計ビュー
-- ========================================

-- 失敗タイプ別の統計
CREATE OR REPLACE VIEW aso.v_job_failure_stats AS
SELECT 
  failure_type,
  count(*) as failure_count,
  round(avg(retry_count), 2) as avg_retries,
  round(count(*) * 100.0 / (SELECT count(*) FROM aso.job_runs WHERE status IN ('failed', 'retrying')), 2) as percentage
FROM aso.job_runs
WHERE status IN ('failed', 'retrying')
  AND failure_type IS NOT NULL
GROUP BY failure_type
ORDER BY failure_count DESC;

COMMENT ON VIEW aso.v_job_failure_stats IS '失敗タイプ別の統計（運営管理用）';

-- 最近の失敗ジョブ一覧（failure_type付き）
CREATE OR REPLACE VIEW aso.v_recent_failures AS
SELECT 
  jr.id AS job_run_id,
  jr.tenant_id,
  t.name AS tenant_name,
  jr.analysis_id,
  ca.url,
  jr.job_type,
  jr.status,
  jr.failure_type,
  jr.retry_count,
  jr.max_retries,
  jr.last_error,
  jr.started_at,
  jr.completed_at,
  jr.created_at
FROM aso.job_runs jr
JOIN aso.tenants t ON jr.tenant_id = t.id
JOIN aso.client_analyses ca ON jr.analysis_id = ca.id
WHERE jr.status IN ('failed', 'retrying')
ORDER BY jr.created_at DESC
LIMIT 100;

COMMENT ON VIEW aso.v_recent_failures IS '最近の失敗ジョブ一覧（failure_type付き）';

-- ========================================
-- 人間介入が必要なジョブ一覧
-- ========================================

CREATE OR REPLACE VIEW aso.v_needs_review_jobs AS
SELECT 
  jr.id AS job_run_id,
  jr.tenant_id,
  t.name AS tenant_name,
  jr.analysis_id,
  ca.url,
  jr.job_type,
  jr.failure_type,
  jr.retry_count,
  jr.last_error,
  jr.error_log,
  jr.created_at,
  jr.updated_at
FROM aso.job_runs jr
JOIN aso.tenants t ON jr.tenant_id = t.id
JOIN aso.client_analyses ca ON jr.analysis_id = ca.id
WHERE 
  jr.failure_type = 'needs_review'
  AND jr.status IN ('failed', 'retrying')
ORDER BY jr.created_at DESC;

COMMENT ON VIEW aso.v_needs_review_jobs IS '人間介入が必要なジョブ一覧';

-- ========================================
-- 統計関数（改善版）
-- ========================================

-- ジョブ統計（failure_type別）
CREATE OR REPLACE FUNCTION aso.get_job_statistics_detailed(
  p_tenant_id uuid DEFAULT NULL,
  p_days integer DEFAULT 7
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = aso, public, pg_temp
AS $$
DECLARE
  v_stats jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_jobs', count(*),
    'completed_jobs', count(*) FILTER (WHERE status = 'completed'),
    'failed_jobs', count(*) FILTER (WHERE status = 'failed'),
    'retrying_jobs', count(*) FILTER (WHERE status = 'retrying'),
    'success_rate', 
      CASE 
        WHEN count(*) > 0 
        THEN round((count(*) FILTER (WHERE status = 'completed')::numeric / count(*) * 100), 2)
        ELSE 0
      END,
    'avg_processing_time_seconds',
      round(avg(EXTRACT(EPOCH FROM (completed_at - started_at)))::numeric, 2) FILTER (WHERE completed_at IS NOT NULL),
    'total_retries', sum(retry_count),
    'failure_breakdown', jsonb_build_object(
      'retryable', count(*) FILTER (WHERE failure_type = 'retryable'),
      'terminal', count(*) FILTER (WHERE failure_type = 'terminal'),
      'needs_review', count(*) FILTER (WHERE failure_type = 'needs_review')
    )
  )
  INTO v_stats
  FROM aso.job_runs
  WHERE 
    created_at >= now() - (p_days || ' days')::interval
    AND (p_tenant_id IS NULL OR tenant_id = p_tenant_id);
  
  RETURN v_stats;
END;
$$;

COMMENT ON FUNCTION aso.get_job_statistics_detailed IS 'ジョブ統計（failure_type別詳細版）';

-- ========================================
-- テスト用サンプルクエリ
-- ========================================

-- ※ 本番環境では不要。開発環境でのみ実行する場合はコメントアウトを外す
/*
DO $$
DECLARE
  v_tenant_id uuid;
  v_analysis_id uuid;
  v_job_run_id uuid;
BEGIN
  -- テナント・分析取得
  SELECT id INTO v_tenant_id FROM aso.tenants LIMIT 1;
  SELECT id INTO v_analysis_id FROM aso.client_analyses WHERE tenant_id = v_tenant_id LIMIT 1;
  
  IF v_analysis_id IS NULL THEN
    INSERT INTO aso.client_analyses (tenant_id, url, company_name)
    VALUES (v_tenant_id, 'https://test-failure.com', 'Test Corp')
    RETURNING id INTO v_analysis_id;
  END IF;
  
  -- ジョブ開始
  v_job_run_id := aso.start_job_run(
    v_tenant_id,
    v_analysis_id,
    'url_analyzer',
    'exec-test-failure'
  );
  
  -- 各種エラーのテスト
  
  -- Test 1: リトライ可能エラー（429）
  PERFORM aso.add_job_error_classified(
    v_job_run_id,
    'crawl',
    'Too Many Requests',
    429
  );
  
  -- Test 2: 完全失敗エラー（404）
  PERFORM aso.add_job_error_classified(
    v_job_run_id,
    'crawl',
    'Page Not Found',
    404
  );
  
  -- Test 3: 人間判断必要エラー（validation）
  PERFORM aso.add_job_error_classified(
    v_job_run_id,
    'validate',
    'JSON-LD validation error: missing required field "name"',
    NULL
  );
  
  -- リトライ可能性チェック
  IF aso.can_retry_job(v_job_run_id) THEN
    RAISE NOTICE '✅ リトライ可能と判定された';
  ELSE
    RAISE NOTICE '❌ リトライ不可と判定された';
  END IF;
  
  -- 統計表示
  RAISE NOTICE '📊 ジョブ統計: %', aso.get_job_statistics_detailed();
END $$;
*/

-- ========================================
-- マイグレーション完了ログ
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration 20250110000400_add_failure_classification.sql completed successfully';
  RAISE NOTICE '🔀 失敗分類: retryable / terminal / needs_review';
  RAISE NOTICE '🔧 Functions created: classify_http_error, classify_error_message, add_job_error_classified, can_retry_job, get_job_statistics_detailed';
  RAISE NOTICE '📊 Views created: v_job_failure_stats, v_recent_failures, v_needs_review_jobs';
END $$;

