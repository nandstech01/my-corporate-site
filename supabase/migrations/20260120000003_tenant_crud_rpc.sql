-- ============================================
-- Task 6.3: テナント管理CRUD RPC
-- ============================================
-- 作成日: 2026-01-20
-- 目的: テナント情報更新・削除のためのRPC

-- テナント更新RPC（clavi スキーマ）
CREATE OR REPLACE FUNCTION clavi.update_tenant(
  p_name text DEFAULT NULL,
  p_subscription_tier text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = clavi, public, pg_temp
AS $$
DECLARE
  _tenant_id uuid;
  _tenant_role text;
  _user_id uuid;
  _tenant clavi.tenants%ROWTYPE;
  _changes jsonb := '{}'::jsonb;
BEGIN
  -- Step 1: JWT claimからtenant_id/roleを取得
  _tenant_id := clavi.current_tenant_id();
  _tenant_role := clavi.current_tenant_role();
  _user_id := auth.uid();

  -- Step 2: テナントコンテキスト確認
  IF _tenant_id IS NULL THEN
    RAISE EXCEPTION 'No tenant context. Please switch to a tenant first.';
  END IF;

  -- Step 3: 権限チェック（owner/adminのみ）
  IF _tenant_role NOT IN ('owner', 'admin') THEN
    RAISE EXCEPTION 'Permission denied. Only owner/admin can update tenant.';
  END IF;

  -- Step 4: 現在のテナント情報取得
  SELECT * INTO _tenant
  FROM clavi.tenants
  WHERE id = _tenant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tenant not found.';
  END IF;

  -- Step 5: 更新内容を構築
  IF p_name IS NOT NULL AND p_name != '' THEN
    _changes := _changes || jsonb_build_object('name', jsonb_build_object('old', _tenant.name, 'new', p_name));
    UPDATE clavi.tenants SET name = p_name, updated_at = now() WHERE id = _tenant_id;
  END IF;

  IF p_subscription_tier IS NOT NULL THEN
    -- subscription_tier検証
    IF p_subscription_tier NOT IN ('starter', 'pro', 'enterprise') THEN
      RAISE EXCEPTION 'Invalid subscription_tier. Must be "starter", "pro", or "enterprise".';
    END IF;

    _changes := _changes || jsonb_build_object('subscription_tier', jsonb_build_object('old', _tenant.subscription_tier, 'new', p_subscription_tier));
    UPDATE clavi.tenants SET subscription_tier = p_subscription_tier, updated_at = now() WHERE id = _tenant_id;
  END IF;

  -- Step 6: 変更がない場合
  IF _changes = '{}'::jsonb THEN
    RETURN jsonb_build_object(
      'success', true,
      'tenant_id', _tenant_id,
      'message', 'No changes made'
    );
  END IF;

  -- Step 7: 監査ログ記録
  PERFORM clavi.log_audit(
    _tenant_id,
    _user_id,
    'tenant_updated',
    'tenant',
    _tenant_id::text,
    _changes
  );

  -- Step 8: 更新後のテナント情報取得
  SELECT * INTO _tenant
  FROM clavi.tenants
  WHERE id = _tenant_id;

  -- Step 9: 成功レスポンス
  RETURN jsonb_build_object(
    'success', true,
    'tenant_id', _tenant_id,
    'tenant', jsonb_build_object(
      'id', _tenant.id,
      'name', _tenant.name,
      'subscription_tier', _tenant.subscription_tier,
      'subscription_status', _tenant.subscription_status,
      'updated_at', _tenant.updated_at
    ),
    'changes', _changes,
    'message', 'Tenant updated successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;

-- 権限設定
REVOKE ALL ON FUNCTION clavi.update_tenant(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION clavi.update_tenant(text, text) TO authenticated;

-- コメント
COMMENT ON FUNCTION clavi.update_tenant IS
'テナント情報を更新（owner/admin専用）';

-- publicスキーマラッパー
CREATE OR REPLACE FUNCTION public.update_tenant(
  p_name text DEFAULT NULL,
  p_subscription_tier text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = clavi, public, pg_temp
AS $$
BEGIN
  RETURN clavi.update_tenant(p_name, p_subscription_tier);
END;
$$;

REVOKE ALL ON FUNCTION public.update_tenant(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_tenant(text, text) TO authenticated;

COMMENT ON FUNCTION public.update_tenant IS
'clavi.update_tenant のpublicスキーマラッパー（Supabase JSクライアント用）';

-- テナント削除RPC（clavi スキーマ）
CREATE OR REPLACE FUNCTION clavi.delete_tenant()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = clavi, public, pg_temp
AS $$
DECLARE
  _tenant_id uuid;
  _tenant_role text;
  _user_id uuid;
  _tenant clavi.tenants%ROWTYPE;
  _member_count integer;
BEGIN
  -- Step 1: JWT claimからtenant_id/roleを取得
  _tenant_id := clavi.current_tenant_id();
  _tenant_role := clavi.current_tenant_role();
  _user_id := auth.uid();

  -- Step 2: テナントコンテキスト確認
  IF _tenant_id IS NULL THEN
    RAISE EXCEPTION 'No tenant context. Please switch to a tenant first.';
  END IF;

  -- Step 3: 権限チェック（ownerのみ）
  IF _tenant_role != 'owner' THEN
    RAISE EXCEPTION 'Permission denied. Only owner can delete tenant.';
  END IF;

  -- Step 4: 現在のテナント情報取得
  SELECT * INTO _tenant
  FROM clavi.tenants
  WHERE id = _tenant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tenant not found.';
  END IF;

  -- Step 5: メンバー数カウント（警告用）
  SELECT COUNT(*) INTO _member_count
  FROM clavi.user_tenants
  WHERE tenant_id = _tenant_id;

  -- Step 6: 監査ログ記録（削除前に記録、CASCADE前なので）
  -- 注: tenant削除後は監査ログも削除されるため、外部ログサービスへの送信も検討
  PERFORM clavi.log_audit(
    _tenant_id,
    _user_id,
    'tenant_deleted',
    'tenant',
    _tenant_id::text,
    jsonb_build_object(
      'name', _tenant.name,
      'member_count', _member_count,
      'subscription_tier', _tenant.subscription_tier
    )
  );

  -- Step 7: テナント削除（CASCADE: user_tenants, invitations, audit_log等も削除）
  DELETE FROM clavi.tenants WHERE id = _tenant_id;

  -- Step 8: 成功レスポンス
  RETURN jsonb_build_object(
    'success', true,
    'deleted_tenant_id', _tenant_id,
    'deleted_tenant_name', _tenant.name,
    'deleted_member_count', _member_count,
    'message', 'Tenant and all associated data deleted successfully. Please sign out.'
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;

-- 権限設定
REVOKE ALL ON FUNCTION clavi.delete_tenant() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION clavi.delete_tenant() TO authenticated;

-- コメント
COMMENT ON FUNCTION clavi.delete_tenant IS
'テナントを削除（owner専用、CASCADE削除）';

-- publicスキーマラッパー
CREATE OR REPLACE FUNCTION public.delete_tenant()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = clavi, public, pg_temp
AS $$
BEGIN
  RETURN clavi.delete_tenant();
END;
$$;

REVOKE ALL ON FUNCTION public.delete_tenant() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_tenant() TO authenticated;

COMMENT ON FUNCTION public.delete_tenant IS
'clavi.delete_tenant のpublicスキーマラッパー（Supabase JSクライアント用）';

-- 完了メッセージ
DO $$ BEGIN
  RAISE NOTICE '✅ Migration 20260120000003_tenant_crud_rpc.sql completed successfully';
END $$;
