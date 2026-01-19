-- ============================================
-- Task 6.4: メンバー管理CRUD RPC
-- ============================================
-- 作成日: 2026-01-20
-- 目的: メンバー一覧取得・ロール変更・削除のためのRPC

-- メンバー一覧取得RPC（aso スキーマ）
CREATE OR REPLACE FUNCTION aso.list_members()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SET search_path = aso, public, pg_temp
AS $$
DECLARE
  _tenant_id uuid;
  _tenant_role text;
  _members jsonb;
BEGIN
  -- Step 1: JWT claimからtenant_id/roleを取得
  _tenant_id := aso.current_tenant_id();
  _tenant_role := aso.current_tenant_role();

  -- Step 2: テナントコンテキスト確認
  IF _tenant_id IS NULL THEN
    RAISE EXCEPTION 'No tenant context. Please switch to a tenant first.';
  END IF;

  -- Step 3: メンバー一覧取得（auth.usersと結合）
  SELECT jsonb_agg(
    jsonb_build_object(
      'user_id', ut.user_id,
      'email', u.email,
      'role', ut.role,
      'created_at', ut.created_at,
      'updated_at', ut.updated_at
    ) ORDER BY ut.role, ut.created_at
  ) INTO _members
  FROM aso.user_tenants ut
  JOIN auth.users u ON u.id = ut.user_id
  WHERE ut.tenant_id = _tenant_id;

  -- Step 4: 成功レスポンス
  RETURN jsonb_build_object(
    'success', true,
    'tenant_id', _tenant_id,
    'members', COALESCE(_members, '[]'::jsonb),
    'current_user_role', _tenant_role
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;

-- 権限設定
REVOKE ALL ON FUNCTION aso.list_members() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION aso.list_members() TO authenticated;

-- コメント
COMMENT ON FUNCTION aso.list_members IS
'テナントメンバー一覧を取得（全ロール参照可能）';

-- publicスキーマラッパー
CREATE OR REPLACE FUNCTION public.list_members()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SET search_path = aso, public, pg_temp
AS $$
BEGIN
  RETURN aso.list_members();
END;
$$;

REVOKE ALL ON FUNCTION public.list_members() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_members() TO authenticated;

COMMENT ON FUNCTION public.list_members IS
'aso.list_members のpublicスキーマラッパー（Supabase JSクライアント用）';

-- メンバーロール変更RPC（aso スキーマ）
CREATE OR REPLACE FUNCTION aso.update_member_role(
  p_user_id uuid,
  p_new_role text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = aso, public, pg_temp
AS $$
DECLARE
  _tenant_id uuid;
  _tenant_role text;
  _current_user_id uuid;
  _target_membership aso.user_tenants%ROWTYPE;
  _old_role text;
BEGIN
  -- Step 1: JWT claimからtenant_id/roleを取得
  _tenant_id := aso.current_tenant_id();
  _tenant_role := aso.current_tenant_role();
  _current_user_id := auth.uid();

  -- Step 2: テナントコンテキスト確認
  IF _tenant_id IS NULL THEN
    RAISE EXCEPTION 'No tenant context. Please switch to a tenant first.';
  END IF;

  -- Step 3: 権限チェック（ownerのみ）
  IF _tenant_role != 'owner' THEN
    RAISE EXCEPTION 'Permission denied. Only owner can change member roles.';
  END IF;

  -- Step 4: 自分自身のロール変更は不可
  IF p_user_id = _current_user_id THEN
    RAISE EXCEPTION 'Cannot change your own role.';
  END IF;

  -- Step 5: ロール検証
  IF p_new_role NOT IN ('admin', 'member') THEN
    RAISE EXCEPTION 'Invalid role. Must be "admin" or "member".';
  END IF;

  -- Step 6: 対象メンバー取得
  SELECT * INTO _target_membership
  FROM aso.user_tenants
  WHERE tenant_id = _tenant_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Member not found in this tenant.';
  END IF;

  -- Step 7: ownerロールへの変更は不可（ownerは1人のみ）
  IF _target_membership.role = 'owner' THEN
    RAISE EXCEPTION 'Cannot change owner role. Transfer ownership first.';
  END IF;

  _old_role := _target_membership.role;

  -- Step 8: ロール変更なしの場合
  IF _old_role = p_new_role THEN
    RETURN jsonb_build_object(
      'success', true,
      'user_id', p_user_id,
      'role', p_new_role,
      'message', 'No change needed'
    );
  END IF;

  -- Step 9: ロール更新
  UPDATE aso.user_tenants
  SET role = p_new_role, updated_at = now()
  WHERE tenant_id = _tenant_id AND user_id = p_user_id;

  -- Step 10: 監査ログ記録
  PERFORM aso.log_audit(
    _tenant_id,
    _current_user_id,
    'member_role_changed',
    'user_tenant',
    p_user_id::text,
    jsonb_build_object(
      'old_role', _old_role,
      'new_role', p_new_role
    )
  );

  -- Step 11: 成功レスポンス
  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'old_role', _old_role,
    'new_role', p_new_role,
    'message', 'Member role updated successfully. The user should re-login to apply changes.'
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;

-- 権限設定
REVOKE ALL ON FUNCTION aso.update_member_role(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION aso.update_member_role(uuid, text) TO authenticated;

-- コメント
COMMENT ON FUNCTION aso.update_member_role IS
'メンバーのロールを変更（owner専用）';

-- publicスキーマラッパー
CREATE OR REPLACE FUNCTION public.update_member_role(
  p_user_id uuid,
  p_new_role text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = aso, public, pg_temp
AS $$
BEGIN
  RETURN aso.update_member_role(p_user_id, p_new_role);
END;
$$;

REVOKE ALL ON FUNCTION public.update_member_role(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_member_role(uuid, text) TO authenticated;

COMMENT ON FUNCTION public.update_member_role IS
'aso.update_member_role のpublicスキーマラッパー（Supabase JSクライアント用）';

-- メンバー削除RPC（aso スキーマ）
CREATE OR REPLACE FUNCTION aso.remove_member(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = aso, public, pg_temp
AS $$
DECLARE
  _tenant_id uuid;
  _tenant_role text;
  _current_user_id uuid;
  _target_membership aso.user_tenants%ROWTYPE;
  _target_email text;
BEGIN
  -- Step 1: JWT claimからtenant_id/roleを取得
  _tenant_id := aso.current_tenant_id();
  _tenant_role := aso.current_tenant_role();
  _current_user_id := auth.uid();

  -- Step 2: テナントコンテキスト確認
  IF _tenant_id IS NULL THEN
    RAISE EXCEPTION 'No tenant context. Please switch to a tenant first.';
  END IF;

  -- Step 3: 権限チェック（owner/adminのみ）
  IF _tenant_role NOT IN ('owner', 'admin') THEN
    RAISE EXCEPTION 'Permission denied. Only owner/admin can remove members.';
  END IF;

  -- Step 4: 自分自身の削除は不可
  IF p_user_id = _current_user_id THEN
    RAISE EXCEPTION 'Cannot remove yourself. Use leave_tenant or delete_tenant instead.';
  END IF;

  -- Step 5: 対象メンバー取得
  SELECT * INTO _target_membership
  FROM aso.user_tenants
  WHERE tenant_id = _tenant_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Member not found in this tenant.';
  END IF;

  -- Step 6: ownerは削除不可
  IF _target_membership.role = 'owner' THEN
    RAISE EXCEPTION 'Cannot remove owner. Delete the tenant instead.';
  END IF;

  -- Step 7: admin削除はownerのみ可能
  IF _target_membership.role = 'admin' AND _tenant_role != 'owner' THEN
    RAISE EXCEPTION 'Permission denied. Only owner can remove admin members.';
  END IF;

  -- Step 8: メールアドレス取得（ログ用）
  SELECT email INTO _target_email
  FROM auth.users
  WHERE id = p_user_id;

  -- Step 9: メンバーシップ削除
  DELETE FROM aso.user_tenants
  WHERE tenant_id = _tenant_id AND user_id = p_user_id;

  -- Step 10: 監査ログ記録
  PERFORM aso.log_audit(
    _tenant_id,
    _current_user_id,
    'member_removed',
    'user_tenant',
    p_user_id::text,
    jsonb_build_object(
      'email', _target_email,
      'role', _target_membership.role
    )
  );

  -- Step 11: 成功レスポンス
  RETURN jsonb_build_object(
    'success', true,
    'removed_user_id', p_user_id,
    'removed_email', _target_email,
    'removed_role', _target_membership.role,
    'message', 'Member removed successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;

-- 権限設定
REVOKE ALL ON FUNCTION aso.remove_member(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION aso.remove_member(uuid) TO authenticated;

-- コメント
COMMENT ON FUNCTION aso.remove_member IS
'メンバーを削除（owner: 全員、admin: memberのみ）';

-- publicスキーマラッパー
CREATE OR REPLACE FUNCTION public.remove_member(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = aso, public, pg_temp
AS $$
BEGIN
  RETURN aso.remove_member(p_user_id);
END;
$$;

REVOKE ALL ON FUNCTION public.remove_member(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.remove_member(uuid) TO authenticated;

COMMENT ON FUNCTION public.remove_member IS
'aso.remove_member のpublicスキーマラッパー（Supabase JSクライアント用）';

-- 完了メッセージ
DO $$ BEGIN
  RAISE NOTICE '✅ Migration 20260120000004_member_crud_rpc.sql completed successfully';
END $$;
