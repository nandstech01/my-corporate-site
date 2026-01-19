-- ============================================
-- Task 6.1: 招待作成RPC
-- ============================================
-- 作成日: 2026-01-20
-- 目的: 招待トークンを生成し、招待レコードを作成する

-- 招待作成RPC（aso スキーマ）
CREATE OR REPLACE FUNCTION aso.create_invitation(
  p_target_email text,
  p_target_role text DEFAULT 'member'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = aso, public, pg_temp
AS $$
DECLARE
  _tenant_id uuid;
  _tenant_role text;
  _user_id uuid;
  _token text;
  _invitation_id uuid;
  _expires_at timestamptz;
BEGIN
  -- Step 1: JWT claimからtenant_id/roleを取得
  _tenant_id := aso.current_tenant_id();
  _tenant_role := aso.current_tenant_role();
  _user_id := auth.uid();

  -- Step 2: テナントコンテキスト確認
  IF _tenant_id IS NULL THEN
    RAISE EXCEPTION 'No tenant context. Please switch to a tenant first.';
  END IF;

  -- Step 3: 権限チェック（owner/adminのみ）
  IF _tenant_role NOT IN ('owner', 'admin') THEN
    RAISE EXCEPTION 'Permission denied. Only owner/admin can create invitations.';
  END IF;

  -- Step 4: admin招待はownerのみ可能
  IF p_target_role = 'admin' AND _tenant_role != 'owner' THEN
    RAISE EXCEPTION 'Permission denied. Only owner can invite admin users.';
  END IF;

  -- Step 5: target_role検証
  IF p_target_role NOT IN ('admin', 'member') THEN
    RAISE EXCEPTION 'Invalid target_role. Must be "admin" or "member".';
  END IF;

  -- Step 6: メールアドレス検証（基本的な形式チェック）
  IF p_target_email IS NULL OR p_target_email !~ '^[^@]+@[^@]+\.[^@]+$' THEN
    RAISE EXCEPTION 'Invalid email format.';
  END IF;

  -- Step 7: 既存の有効な招待を確認（同じメール+テナント+pending）
  IF EXISTS (
    SELECT 1 FROM aso.invitations
    WHERE tenant_id = _tenant_id
      AND target_email = lower(trim(p_target_email))
      AND status = 'pending'
      AND expires_at > now()
  ) THEN
    RAISE EXCEPTION 'An active invitation already exists for this email.';
  END IF;

  -- Step 8: 既にメンバーか確認
  IF EXISTS (
    SELECT 1 FROM aso.user_tenants ut
    JOIN auth.users u ON u.id = ut.user_id
    WHERE ut.tenant_id = _tenant_id
      AND lower(u.email) = lower(trim(p_target_email))
  ) THEN
    RAISE EXCEPTION 'This user is already a member of this tenant.';
  END IF;

  -- Step 9: トークン生成（32バイト、URLセーフBase64）
  _token := encode(gen_random_bytes(32), 'base64');
  -- URLセーフに変換
  _token := replace(replace(_token, '+', '-'), '/', '_');
  -- パディング削除
  _token := rtrim(_token, '=');

  -- Step 10: 有効期限設定（7日後）
  _expires_at := now() + interval '7 days';

  -- Step 11: 招待レコード作成
  INSERT INTO aso.invitations (
    tenant_id,
    token,
    target_email,
    target_role,
    invited_by,
    status,
    expires_at
  ) VALUES (
    _tenant_id,
    _token,
    lower(trim(p_target_email)),
    p_target_role,
    _user_id,
    'pending',
    _expires_at
  )
  RETURNING id INTO _invitation_id;

  -- Step 12: 監査ログ記録
  PERFORM aso.log_audit(
    _tenant_id,
    _user_id,
    'invitation_created',
    'invitation',
    _invitation_id::text,
    jsonb_build_object(
      'target_email', lower(trim(p_target_email)),
      'target_role', p_target_role,
      'expires_at', _expires_at
    )
  );

  -- Step 13: 成功レスポンス
  RETURN jsonb_build_object(
    'success', true,
    'invitation_id', _invitation_id,
    'token', _token,
    'target_email', lower(trim(p_target_email)),
    'target_role', p_target_role,
    'expires_at', _expires_at,
    'message', 'Invitation created successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;

-- 権限設定
REVOKE ALL ON FUNCTION aso.create_invitation(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION aso.create_invitation(text, text) TO authenticated;

-- コメント
COMMENT ON FUNCTION aso.create_invitation IS
'招待トークンを生成し、招待レコードを作成（owner/admin専用、admin招待はowner限定）';

-- publicスキーマラッパー
CREATE OR REPLACE FUNCTION public.create_invitation(
  p_target_email text,
  p_target_role text DEFAULT 'member'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = aso, public, pg_temp
AS $$
BEGIN
  RETURN aso.create_invitation(p_target_email, p_target_role);
END;
$$;

REVOKE ALL ON FUNCTION public.create_invitation(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_invitation(text, text) TO authenticated;

COMMENT ON FUNCTION public.create_invitation IS
'aso.create_invitation のpublicスキーマラッパー（Supabase JSクライアント用）';

-- 招待取消RPC
CREATE OR REPLACE FUNCTION aso.revoke_invitation(p_invitation_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = aso, public, pg_temp
AS $$
DECLARE
  _tenant_id uuid;
  _tenant_role text;
  _user_id uuid;
  _invitation aso.invitations%ROWTYPE;
BEGIN
  -- Step 1: JWT claimからtenant_id/roleを取得
  _tenant_id := aso.current_tenant_id();
  _tenant_role := aso.current_tenant_role();
  _user_id := auth.uid();

  -- Step 2: テナントコンテキスト確認
  IF _tenant_id IS NULL THEN
    RAISE EXCEPTION 'No tenant context. Please switch to a tenant first.';
  END IF;

  -- Step 3: 権限チェック（owner/adminのみ）
  IF _tenant_role NOT IN ('owner', 'admin') THEN
    RAISE EXCEPTION 'Permission denied. Only owner/admin can revoke invitations.';
  END IF;

  -- Step 4: 招待取得
  SELECT * INTO _invitation
  FROM aso.invitations
  WHERE id = p_invitation_id AND tenant_id = _tenant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation not found.';
  END IF;

  -- Step 5: ステータスチェック
  IF _invitation.status != 'pending' THEN
    RAISE EXCEPTION 'Cannot revoke invitation with status: %', _invitation.status;
  END IF;

  -- Step 6: ステータス更新
  UPDATE aso.invitations
  SET status = 'revoked', updated_at = now()
  WHERE id = p_invitation_id;

  -- Step 7: 監査ログ記録
  PERFORM aso.log_audit(
    _tenant_id,
    _user_id,
    'invitation_revoked',
    'invitation',
    p_invitation_id::text,
    jsonb_build_object(
      'target_email', _invitation.target_email,
      'target_role', _invitation.target_role
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'invitation_id', p_invitation_id,
    'message', 'Invitation revoked successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;

REVOKE ALL ON FUNCTION aso.revoke_invitation(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION aso.revoke_invitation(uuid) TO authenticated;

COMMENT ON FUNCTION aso.revoke_invitation IS
'招待を取消（owner/admin専用）';

-- publicスキーマラッパー
CREATE OR REPLACE FUNCTION public.revoke_invitation(p_invitation_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = aso, public, pg_temp
AS $$
BEGIN
  RETURN aso.revoke_invitation(p_invitation_id);
END;
$$;

REVOKE ALL ON FUNCTION public.revoke_invitation(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.revoke_invitation(uuid) TO authenticated;

COMMENT ON FUNCTION public.revoke_invitation IS
'aso.revoke_invitation のpublicスキーマラッパー（Supabase JSクライアント用）';

-- 完了メッセージ
DO $$ BEGIN
  RAISE NOTICE '✅ Migration 20260120000001_create_invitation_rpc.sql completed successfully';
END $$;
