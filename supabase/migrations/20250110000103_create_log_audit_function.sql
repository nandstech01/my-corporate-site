-- ============================================
-- Task 5.4: 監査ログ記録用ヘルパー関数
-- ============================================
-- 作成日: 2025-01-10
-- 目的: 監査ログを簡単に記録できるヘルパー関数

CREATE OR REPLACE FUNCTION aso.log_audit(
  p_tenant_id uuid,
  p_user_id uuid,
  p_action text,
  p_resource_type text,
  p_resource_id text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER -- RLSをバイパスして監査ログに書き込み
SET search_path = aso, public, pg_temp
AS $$
DECLARE
  _log_id uuid;
BEGIN
  -- 監査ログに記録
  INSERT INTO aso.audit_log (
    tenant_id,
    user_id,
    action,
    resource_type,
    resource_id,
    metadata,
    created_at
  ) VALUES (
    p_tenant_id,
    p_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_metadata,
    now()
  )
  RETURNING id INTO _log_id;

  RETURN _log_id;

EXCEPTION
  WHEN OTHERS THEN
    -- 監査ログ記録失敗はエラーを投げない（主処理を妨げない）
    -- ただしログには出力
    RAISE WARNING 'Failed to log audit: %, action: %, resource: %', SQLERRM, p_action, p_resource_type;
    RETURN NULL;
END;
$$;

-- 権限設定（全ユーザーが呼び出せるが、SECURITY DEFINERで安全に実行）
REVOKE ALL ON FUNCTION aso.log_audit(uuid, uuid, text, text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION aso.log_audit(uuid, uuid, text, text, text, jsonb) TO authenticated;

-- コメント
COMMENT ON FUNCTION aso.log_audit IS
'監査ログを記録するヘルパー関数（SECURITY DEFINER、例外時は警告のみ）';

-- 完了メッセージ
DO $$ BEGIN
  RAISE NOTICE '✅ aso.log_audit() 関数作成完了';
END $$;

