-- ============================================
-- Phase 8: テナント設定 RPC関数
-- ============================================
-- 作成日: 2026-01-20
-- 目的: sameAs, Author設定の取得・更新RPC
--
-- 背景:
-- - Supabase REST APIはasoスキーマを公開していない
-- - RPC経由でasoスキーマにアクセスする必要がある
-- - SECURITY DEFINERでRLS bypassしつつ権限チェック

-- ============================================
-- 1. テナント設定取得 RPC
-- ============================================

CREATE OR REPLACE FUNCTION aso.get_tenant_settings()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = aso, public, pg_temp
AS $$
DECLARE
  _tenant_id uuid;
  _user_id uuid;
  _settings jsonb;
BEGIN
  -- Step 1: JWT claimからtenant_idを取得
  _tenant_id := aso.current_tenant_id();
  _user_id := auth.uid();

  -- Step 2: テナントコンテキスト確認
  IF _tenant_id IS NULL THEN
    -- Fallback: user_tenantsから取得
    SELECT ut.tenant_id INTO _tenant_id
    FROM aso.user_tenants ut
    WHERE ut.user_id = _user_id
    LIMIT 1;

    IF _tenant_id IS NULL THEN
      RAISE EXCEPTION 'No tenant context. Please select or join a tenant.';
    END IF;
  END IF;

  -- Step 3: テナント設定取得
  SELECT t.settings INTO _settings
  FROM aso.tenants t
  WHERE t.id = _tenant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tenant not found.';
  END IF;

  -- Step 4: NULL の場合はデフォルト値を返す
  IF _settings IS NULL THEN
    _settings := '{}'::jsonb;
  END IF;

  -- Step 5: 成功レスポンス
  RETURN jsonb_build_object(
    'success', true,
    'tenant_id', _tenant_id,
    'settings', _settings
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;

-- 権限設定
REVOKE ALL ON FUNCTION aso.get_tenant_settings() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION aso.get_tenant_settings() TO authenticated;

-- コメント
COMMENT ON FUNCTION aso.get_tenant_settings IS
'テナント設定を取得（sameAs, Author等）';

-- publicスキーマラッパー
CREATE OR REPLACE FUNCTION public.get_tenant_settings()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = aso, public, pg_temp
AS $$
BEGIN
  RETURN aso.get_tenant_settings();
END;
$$;

REVOKE ALL ON FUNCTION public.get_tenant_settings() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_tenant_settings() TO authenticated;

COMMENT ON FUNCTION public.get_tenant_settings IS
'aso.get_tenant_settings のpublicスキーマラッパー（Supabase JSクライアント用）';

-- ============================================
-- 2. テナント設定更新 RPC
-- ============================================

CREATE OR REPLACE FUNCTION aso.update_tenant_settings(
  p_same_as jsonb DEFAULT NULL,
  p_author jsonb DEFAULT NULL
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
  _current_settings jsonb;
  _new_settings jsonb;
  _changes jsonb := '{}'::jsonb;
BEGIN
  -- Step 1: JWT claimからtenant_id/roleを取得
  _tenant_id := aso.current_tenant_id();
  _tenant_role := aso.current_tenant_role();
  _user_id := auth.uid();

  -- Step 2: テナントコンテキスト確認（Fallback付き）
  IF _tenant_id IS NULL THEN
    -- Fallback: user_tenantsから取得
    SELECT ut.tenant_id, ut.role INTO _tenant_id, _tenant_role
    FROM aso.user_tenants ut
    WHERE ut.user_id = _user_id
    LIMIT 1;

    IF _tenant_id IS NULL THEN
      RAISE EXCEPTION 'No tenant context. Please select or join a tenant.';
    END IF;
  END IF;

  -- Step 3: 権限チェック（owner/adminのみ）
  IF _tenant_role NOT IN ('owner', 'admin') THEN
    RAISE EXCEPTION 'Permission denied. Only owner or admin can update settings.';
  END IF;

  -- Step 4: 現在の設定を取得
  SELECT t.settings INTO _current_settings
  FROM aso.tenants t
  WHERE t.id = _tenant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tenant not found.';
  END IF;

  -- NULLの場合は空オブジェクト
  IF _current_settings IS NULL THEN
    _current_settings := '{}'::jsonb;
  END IF;

  -- Step 5: 新しい設定をマージ
  _new_settings := _current_settings;

  IF p_same_as IS NOT NULL THEN
    _new_settings := jsonb_set(_new_settings, '{sameAs}', p_same_as);
    _changes := _changes || jsonb_build_object('sameAs', jsonb_build_object('old', _current_settings->'sameAs', 'new', p_same_as));
  END IF;

  IF p_author IS NOT NULL THEN
    _new_settings := jsonb_set(_new_settings, '{author}', p_author);
    _changes := _changes || jsonb_build_object('author', jsonb_build_object('old', _current_settings->'author', 'new', p_author));
  END IF;

  -- updatedAt を追加
  _new_settings := jsonb_set(_new_settings, '{updatedAt}', to_jsonb(now()::text));

  -- Step 6: 変更がない場合
  IF _changes = '{}'::jsonb THEN
    RETURN jsonb_build_object(
      'success', true,
      'tenant_id', _tenant_id,
      'settings', _current_settings,
      'message', 'No changes made'
    );
  END IF;

  -- Step 7: 設定を更新
  UPDATE aso.tenants
  SET settings = _new_settings, updated_at = now()
  WHERE id = _tenant_id;

  -- Step 8: 監査ログ記録
  PERFORM aso.log_audit(
    _tenant_id,
    _user_id,
    'settings_updated',
    'tenant',
    _tenant_id::text,
    _changes
  );

  -- Step 9: 成功レスポンス
  RETURN jsonb_build_object(
    'success', true,
    'tenant_id', _tenant_id,
    'settings', _new_settings,
    'changes', _changes,
    'message', 'Settings updated successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;

-- 権限設定
REVOKE ALL ON FUNCTION aso.update_tenant_settings(jsonb, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION aso.update_tenant_settings(jsonb, jsonb) TO authenticated;

-- コメント
COMMENT ON FUNCTION aso.update_tenant_settings IS
'テナント設定を更新（sameAs, Author - owner/admin専用）';

-- publicスキーマラッパー
CREATE OR REPLACE FUNCTION public.update_tenant_settings(
  p_same_as jsonb DEFAULT NULL,
  p_author jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = aso, public, pg_temp
AS $$
BEGIN
  RETURN aso.update_tenant_settings(p_same_as, p_author);
END;
$$;

REVOKE ALL ON FUNCTION public.update_tenant_settings(jsonb, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_tenant_settings(jsonb, jsonb) TO authenticated;

COMMENT ON FUNCTION public.update_tenant_settings IS
'aso.update_tenant_settings のpublicスキーマラッパー（Supabase JSクライアント用）';

-- 完了メッセージ
DO $$ BEGIN
  RAISE NOTICE '✅ Migration 20260120000010_tenant_settings_rpc.sql completed successfully';
END $$;
