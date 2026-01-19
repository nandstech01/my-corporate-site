-- ============================================
-- Task 5.4: 古い監査ログ削除関数
-- ============================================
-- 作成日: 2025-01-10
-- 目的: 保持期間を過ぎた監査ログを自動削除（デフォルト90日）

CREATE OR REPLACE FUNCTION aso.cleanup_old_audit_logs(
  p_retention_days integer DEFAULT 90
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER -- RLSをバイパスして削除
SET search_path = aso, public, pg_temp
AS $$
DECLARE
  _deleted_count integer;
  _cutoff_date timestamptz;
BEGIN
  -- 保持期間の検証（最小7日、最大365日）
  IF p_retention_days < 7 THEN
    RAISE EXCEPTION 'Retention period must be at least 7 days';
  END IF;
  
  IF p_retention_days > 365 THEN
    RAISE EXCEPTION 'Retention period must not exceed 365 days';
  END IF;

  -- 削除対象の日付を計算
  _cutoff_date := now() - (p_retention_days || ' days')::interval;

  -- 古い監査ログを削除
  DELETE FROM aso.audit_log
  WHERE created_at < _cutoff_date;

  GET DIAGNOSTICS _deleted_count = ROW_COUNT;

  -- ログ出力
  RAISE NOTICE 'Deleted % audit log entries older than % days (cutoff: %)', 
    _deleted_count, p_retention_days, _cutoff_date;

  RETURN _deleted_count;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to cleanup audit logs: %', SQLERRM;
END;
$$;

-- 権限設定（管理者のみ実行可能にする場合は制限可能）
-- 現状は authenticated ユーザー全員が実行可能（Cloud Run Jobsから実行想定）
REVOKE ALL ON FUNCTION aso.cleanup_old_audit_logs(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION aso.cleanup_old_audit_logs(integer) TO authenticated;

-- コメント
COMMENT ON FUNCTION aso.cleanup_old_audit_logs IS
'保持期間を過ぎた監査ログを削除（デフォルト90日、最小7日、最大365日）';

-- 完了メッセージ
DO $$ BEGIN
  RAISE NOTICE '✅ aso.cleanup_old_audit_logs() 関数作成完了';
END $$;

