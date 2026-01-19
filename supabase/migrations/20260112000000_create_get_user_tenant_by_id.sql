-- ============================================
-- Task: get_user_tenant_by_id RPC関数作成
-- ============================================
-- 作成日: 2026-01-12
-- 目的: ユーザーIDからテナントID・ロールを取得するRPC関数
-- 　　　fallback認証パスで使用（JWT claimが取得できない場合）

-- public.user_tenants から取得する関数
CREATE OR REPLACE FUNCTION public.get_user_tenant_by_id(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- user_tenants から最初のテナントを取得
  SELECT jsonb_build_object(
    'tenant_id', tenant_id,
    'role', role
  )
  INTO v_result
  FROM public.user_tenants
  WHERE user_id = p_user_id
  ORDER BY created_at ASC
  LIMIT 1;

  -- 見つからない場合はnullを返す
  IF v_result IS NULL THEN
    RETURN jsonb_build_object(
      'tenant_id', null,
      'role', null
    );
  END IF;

  RETURN v_result;
END;
$$;

-- 権限設定
REVOKE ALL ON FUNCTION public.get_user_tenant_by_id(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_tenant_by_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_tenant_by_id(uuid) TO anon;

COMMENT ON FUNCTION public.get_user_tenant_by_id IS
'ユーザーIDからテナントID・ロールを取得（fallback認証パス用）';

-- 完了メッセージ
DO $$ BEGIN
  RAISE NOTICE '✅ get_user_tenant_by_id RPC関数作成完了';
END $$;

