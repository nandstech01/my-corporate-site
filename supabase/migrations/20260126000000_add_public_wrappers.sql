-- ============================================
-- Phase 8.1: Public Schema Wrapper Functions
-- ============================================
-- 作成日: 2026-01-26
-- 目的:
-- - clavi スキーマの関数を public から呼び出せるようにする
-- - Supabase RPC は public スキーマを優先検索するため
--
-- 依存:
-- - 20250109000000_create_clavi_core.sql
-- - 20260118000000_add_stripe_subscription_fields.sql

-- =========================================================
-- 1. check_usage_limit wrapper
-- =========================================================
CREATE OR REPLACE FUNCTION public.check_usage_limit(
  p_tenant_id uuid,
  p_year_month text DEFAULT NULL
)
RETURNS TABLE (
  current_usage integer,
  usage_limit integer,
  tier text,
  is_allowed boolean,
  remaining integer
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT * FROM clavi.check_usage_limit(p_tenant_id, p_year_month);
END;
$$;

-- =========================================================
-- 2. increment_usage wrapper
-- =========================================================
CREATE OR REPLACE FUNCTION public.increment_usage(
  p_tenant_id uuid,
  p_year_month text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN clavi.increment_usage(p_tenant_id, p_year_month);
END;
$$;

-- =========================================================
-- 3. check_existing_analysis (新規作成)
-- =========================================================
CREATE OR REPLACE FUNCTION public.check_existing_analysis(
  p_tenant_id uuid,
  p_url_hash text,
  p_pipeline_version text
)
RETURNS TABLE (
  id uuid,
  url text,
  status text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ca.id,
    ca.url,
    ca.status::text
  FROM clavi.client_analyses ca
  WHERE ca.tenant_id = p_tenant_id
    AND ca.url_hash = p_url_hash
    AND ca.pipeline_version = p_pipeline_version
  LIMIT 1;
END;
$$;

-- =========================================================
-- 4. insert_client_analysis (UPSERT対応)
-- =========================================================
CREATE OR REPLACE FUNCTION public.insert_client_analysis(
  p_tenant_id uuid,
  p_url text,
  p_pipeline_version text,
  p_company_name text DEFAULT NULL,
  p_analysis_data jsonb DEFAULT '{}'::jsonb,
  p_ai_structure_score integer DEFAULT 0,
  p_status text DEFAULT 'completed'
)
RETURNS TABLE (id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_url_hash text;
  v_result_id uuid;
BEGIN
  -- URL hash を計算
  v_url_hash := encode(digest(p_url, 'md5'), 'hex');

  -- UPSERT: 既存があれば更新、なければ挿入
  INSERT INTO clavi.client_analyses (
    tenant_id,
    url,
    url_hash,
    pipeline_version,
    company_name,
    analysis_data,
    ai_structure_score,
    status,
    created_at,
    updated_at
  )
  VALUES (
    p_tenant_id,
    p_url,
    v_url_hash,
    p_pipeline_version,
    p_company_name,
    p_analysis_data,
    p_ai_structure_score,
    p_status,
    now(),
    now()
  )
  ON CONFLICT (tenant_id, url_hash, pipeline_version)
  DO UPDATE SET
    company_name = EXCLUDED.company_name,
    analysis_data = EXCLUDED.analysis_data,
    ai_structure_score = EXCLUDED.ai_structure_score,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING clavi.client_analyses.id INTO v_result_id;

  RETURN QUERY SELECT v_result_id;
END;
$$;

-- =========================================================
-- 5. get_current_tenant_context wrapper (既存確認・補完)
-- =========================================================
CREATE OR REPLACE FUNCTION public.get_current_tenant_context()
RETURNS TABLE (
  tenant_id uuid,
  tenant_role text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_tenant_id uuid;
  v_tenant_role text;
BEGIN
  -- JWT claims から取得を試みる
  v_tenant_id := (current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id')::uuid;
  v_tenant_role := current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_role';

  -- JWT claims がない場合、user_tenants から取得
  IF v_tenant_id IS NULL THEN
    SELECT ut.tenant_id, ut.role
    INTO v_tenant_id, v_tenant_role
    FROM clavi.user_tenants ut
    WHERE ut.user_id = auth.uid()
    ORDER BY ut.created_at ASC
    LIMIT 1;
  END IF;

  RETURN QUERY SELECT v_tenant_id, v_tenant_role;
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT NULL::uuid, NULL::text;
END;
$$;

-- =========================================================
-- 6. 権限付与
-- =========================================================
GRANT EXECUTE ON FUNCTION public.check_usage_limit(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_usage(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_existing_analysis(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_client_analysis(uuid, text, text, text, jsonb, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_tenant_context() TO authenticated;
