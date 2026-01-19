-- ============================================
-- Task 5.3: ジョブ専用ユーザー取得/作成RPC
-- ============================================
-- 作成日: 2025-01-10
-- 目的: テナントごとにジョブ専用ユーザーを取得/作成（冪等性あり）

CREATE OR REPLACE FUNCTION aso.get_or_create_job_user(p_tenant_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- auth.users操作のため必要
SET search_path = aso, public, auth, pg_temp
AS $$
DECLARE
  _existing_job_user aso.job_users%ROWTYPE;
  _job_email text;
  _job_password text;
  _new_auth_user_id uuid;
  _ban_until timestamptz;
BEGIN
  -- Step 1: 既存のジョブユーザーを確認（O(1)正引き）
  SELECT * INTO _existing_job_user
  FROM aso.job_users
  WHERE tenant_id = p_tenant_id;

  -- 既に存在すれば返す（冪等性）
  IF FOUND THEN
    RETURN jsonb_build_object(
      'tenant_id', _existing_job_user.tenant_id,
      'auth_user_id', _existing_job_user.auth_user_id,
      'email', _existing_job_user.email,
      'is_banned', _existing_job_user.is_banned,
      'created', false,
      'message', 'Existing job user returned'
    );
  END IF;

  -- Step 2: 新規作成
  _job_email := 'job-' || p_tenant_id::text || '@example.invalid';
  _job_password := md5(random()::text || clock_timestamp()::text); -- ランダムパスワード（使用されない）
  _ban_until := now() + interval '100 years'; -- 100年BAN

  -- Step 3: Supabase Auth ユーザー作成（SECURITY DEFINERで実行）
  -- 注: この関数は auth.users テーブルに直接INSERTします
  -- 本番環境ではSupabase Admin API（supabase.auth.admin.createUser）を使用推奨
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token,
    banned_until
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    _job_email,
    _job_password, -- パスワードはハッシュ化済み（md5、実際には使用されない）
    now(),
    jsonb_build_object('login_disabled', true), -- ログイン不能フラグ
    '{}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    '',
    _ban_until -- 100年BAN
  )
  RETURNING id INTO _new_auth_user_id;

  -- Step 4: aso.job_users に登録
  INSERT INTO aso.job_users (
    tenant_id,
    auth_user_id,
    email,
    is_banned
  ) VALUES (
    p_tenant_id,
    _new_auth_user_id,
    _job_email,
    true
  );

  -- Step 5: aso.user_tenants に member として登録
  INSERT INTO aso.user_tenants (
    tenant_id,
    user_id,
    role
  ) VALUES (
    p_tenant_id,
    _new_auth_user_id,
    'member'
  );

  -- Step 6: 成功レスポンス
  RETURN jsonb_build_object(
    'tenant_id', p_tenant_id,
    'auth_user_id', _new_auth_user_id,
    'email', _job_email,
    'is_banned', true,
    'created', true,
    'message', 'New job user created successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    -- エラーハンドリング
    RAISE EXCEPTION 'Failed to get or create job user: %', SQLERRM;
END;
$$;

-- 権限設定
REVOKE ALL ON FUNCTION aso.get_or_create_job_user(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION aso.get_or_create_job_user(uuid) TO authenticated;

-- コメント
COMMENT ON FUNCTION aso.get_or_create_job_user IS
'テナントごとにジョブ専用ユーザーを取得/作成（冪等性あり、ログイン不能保証）';

-- 完了メッセージ
DO $$ BEGIN
  RAISE NOTICE '✅ aso.get_or_create_job_user() RPC作成完了';
END $$;

