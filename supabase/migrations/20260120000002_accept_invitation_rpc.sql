-- ============================================
-- Task 6.2: 招待受諾RPC
-- ============================================
-- 作成日: 2026-01-20
-- 目的: 招待トークンを検証し、ユーザーをテナントに追加する

-- 招待受諾RPC（aso スキーマ）
CREATE OR REPLACE FUNCTION aso.accept_invitation(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = aso, public, pg_temp
AS $$
DECLARE
  _user_id uuid;
  _user_email text;
  _invitation aso.invitations%ROWTYPE;
  _existing_membership aso.user_tenants%ROWTYPE;
BEGIN
  -- Step 1: 認証ユーザー確認
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized. Please sign in first.';
  END IF;

  -- Step 2: ユーザーメールアドレス取得
  SELECT email INTO _user_email
  FROM auth.users
  WHERE id = _user_id;

  IF _user_email IS NULL THEN
    RAISE EXCEPTION 'User email not found.';
  END IF;

  -- Step 3: 招待トークン検証
  SELECT * INTO _invitation
  FROM aso.invitations
  WHERE token = p_token;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid invitation token.';
  END IF;

  -- Step 4: ステータスチェック
  IF _invitation.status = 'accepted' THEN
    -- 冪等性: 既に受諾済みの場合は成功として返す
    RETURN jsonb_build_object(
      'success', true,
      'tenant_id', _invitation.tenant_id,
      'role', _invitation.target_role,
      'message', 'Invitation already accepted',
      'already_accepted', true
    );
  END IF;

  IF _invitation.status = 'revoked' THEN
    RAISE EXCEPTION 'This invitation has been revoked.';
  END IF;

  IF _invitation.status = 'expired' THEN
    RAISE EXCEPTION 'This invitation has expired.';
  END IF;

  -- Step 5: 有効期限チェック
  IF _invitation.expires_at < now() THEN
    -- ステータスを更新
    UPDATE aso.invitations
    SET status = 'expired', updated_at = now()
    WHERE id = _invitation.id;

    RAISE EXCEPTION 'This invitation has expired.';
  END IF;

  -- Step 6: メールアドレス一致チェック
  IF lower(_user_email) != lower(_invitation.target_email) THEN
    RAISE EXCEPTION 'Email mismatch. This invitation was sent to a different email address.';
  END IF;

  -- Step 7: 既存メンバーシップ確認（冪等性）
  SELECT * INTO _existing_membership
  FROM aso.user_tenants
  WHERE tenant_id = _invitation.tenant_id
    AND user_id = _user_id;

  IF FOUND THEN
    -- 既にメンバーの場合、招待をacceptedにして成功返却
    UPDATE aso.invitations
    SET status = 'accepted',
        accepted_at = now(),
        accepted_by = _user_id,
        updated_at = now()
    WHERE id = _invitation.id;

    RETURN jsonb_build_object(
      'success', true,
      'tenant_id', _invitation.tenant_id,
      'role', _existing_membership.role,
      'message', 'Already a member of this tenant',
      'already_member', true
    );
  END IF;

  -- Step 8: user_tenantsにメンバーシップ追加
  INSERT INTO aso.user_tenants (
    tenant_id,
    user_id,
    role
  ) VALUES (
    _invitation.tenant_id,
    _user_id,
    _invitation.target_role
  );

  -- Step 9: 招待ステータス更新
  UPDATE aso.invitations
  SET status = 'accepted',
      accepted_at = now(),
      accepted_by = _user_id,
      updated_at = now()
  WHERE id = _invitation.id;

  -- Step 10: 監査ログ記録
  PERFORM aso.log_audit(
    _invitation.tenant_id,
    _user_id,
    'invitation_accepted',
    'invitation',
    _invitation.id::text,
    jsonb_build_object(
      'target_email', _invitation.target_email,
      'target_role', _invitation.target_role,
      'invited_by', _invitation.invited_by
    )
  );

  -- Step 11: 成功レスポンス
  RETURN jsonb_build_object(
    'success', true,
    'tenant_id', _invitation.tenant_id,
    'role', _invitation.target_role,
    'message', 'Invitation accepted successfully. Please re-login to activate tenant context.'
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;

-- 権限設定
REVOKE ALL ON FUNCTION aso.accept_invitation(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION aso.accept_invitation(text) TO authenticated;

-- コメント
COMMENT ON FUNCTION aso.accept_invitation IS
'招待トークンを検証し、ユーザーをテナントに追加（メール一致必須、冪等性あり）';

-- publicスキーマラッパー
CREATE OR REPLACE FUNCTION public.accept_invitation(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = aso, public, pg_temp
AS $$
BEGIN
  RETURN aso.accept_invitation(p_token);
END;
$$;

REVOKE ALL ON FUNCTION public.accept_invitation(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_invitation(text) TO authenticated;

COMMENT ON FUNCTION public.accept_invitation IS
'aso.accept_invitation のpublicスキーマラッパー（Supabase JSクライアント用）';

-- 完了メッセージ
DO $$ BEGIN
  RAISE NOTICE '✅ Migration 20260120000002_accept_invitation_rpc.sql completed successfully';
END $$;
