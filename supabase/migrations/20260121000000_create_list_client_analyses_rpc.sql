-- ============================================
-- ASO SaaS - list_client_analyses RPC function
-- ============================================
-- 作成日: 2026-01-21
-- 目的: ユーザーのテナントに属する分析一覧を取得
--       SECURITY DEFINER でRLSをバイパスし、ユーザーメンバーシップに基づいてフィルタ

-- =============================================================================
-- list_client_analyses RPC関数
-- =============================================================================

CREATE OR REPLACE FUNCTION aso.list_client_analyses(
  p_tenant_id uuid,
  p_limit integer DEFAULT 100,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  url text,
  company_name text,
  site_title text,
  site_description text,
  ai_structure_score integer,
  status text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = aso, public, pg_temp
AS $$
DECLARE
  v_user_id uuid;
  v_is_member boolean;
  v_is_service_role boolean;
BEGIN
  -- Check if service_role (bypass auth check)
  v_is_service_role := (current_setting('request.jwt.claims', true)::jsonb)->>'role' = 'service_role';

  IF NOT v_is_service_role THEN
    -- 現在のユーザーIDを取得
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
      RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- ユーザーがこのテナントのメンバーかどうか確認
    SELECT EXISTS (
      SELECT 1 FROM aso.user_tenants ut
      WHERE ut.tenant_id = p_tenant_id
        AND ut.user_id = v_user_id
    ) INTO v_is_member;

    IF NOT v_is_member THEN
      RAISE EXCEPTION 'User is not a member of this tenant';
    END IF;
  END IF;

  -- テナントの分析一覧を返す
  RETURN QUERY
  SELECT
    ca.id,
    ca.url,
    ca.company_name,
    ca.site_title,
    ca.site_description,
    ca.ai_structure_score,
    ca.status,
    ca.created_at,
    ca.updated_at
  FROM aso.client_analyses ca
  WHERE ca.tenant_id = p_tenant_id
  ORDER BY ca.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- 権限設定
REVOKE ALL ON FUNCTION aso.list_client_analyses FROM PUBLIC;
GRANT EXECUTE ON FUNCTION aso.list_client_analyses TO authenticated;
GRANT EXECUTE ON FUNCTION aso.list_client_analyses TO service_role;

COMMENT ON FUNCTION aso.list_client_analyses IS
'テナントの分析一覧を取得。ユーザーメンバーシップを検証してからデータを返す。';

-- =============================================================================
-- publicスキーマにラッパー関数を作成（Supabase JS Clientからアクセス用）
-- =============================================================================

CREATE OR REPLACE FUNCTION public.list_client_analyses(
  p_tenant_id uuid,
  p_limit integer DEFAULT 100,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  url text,
  company_name text,
  site_title text,
  site_description text,
  ai_structure_score integer,
  status text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = aso, public, pg_temp
AS $$
  SELECT * FROM aso.list_client_analyses(p_tenant_id, p_limit, p_offset);
$$;

-- 権限設定
REVOKE ALL ON FUNCTION public.list_client_analyses FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_client_analyses TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_client_analyses TO service_role;

COMMENT ON FUNCTION public.list_client_analyses IS
'aso.list_client_analyses のpublicスキーマラッパー（Supabase JS Client用）';

-- =============================================================================
-- 完了メッセージ
-- =============================================================================

DO $$ BEGIN
  RAISE NOTICE '✅ Migration 20260121000000_create_list_client_analyses_rpc.sql completed';
  RAISE NOTICE '  - aso.list_client_analyses RPC関数作成完了';
  RAISE NOTICE '  - public.list_client_analyses ラッパー関数作成完了';
END $$;
