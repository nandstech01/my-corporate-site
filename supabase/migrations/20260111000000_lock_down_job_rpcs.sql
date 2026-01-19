-- ============================================
-- Security hardening: lock down public RPC wrappers used by jobs
-- ============================================
-- 作成日: 2026-01-11
-- 目的:
-- - publicスキーマのRPCラッパーが「全authenticatedユーザーに強権限操作を許す」状態を防ぐ
-- - Cloud Run Jobs / 内部job-token発行API が発行するJWTの custom claim を強制する
--
-- 前提:
-- - /api/aso/job-token が `https://nands.tech/source=cloud_run_job` を付与したJWTを発行する
-- - job-token発行API内部で、`https://nands.tech/source=job_token_issuer` の短命JWTを使い
--   public.get_or_create_job_user を呼び出す

-- ------------------------------------------------------------
-- Helper: 期待するsource claimを満たすか検証（例外時はUnauthorized）
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.require_jwt_source(p_expected text)
RETURNS void
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  claims_text text;
  claims jsonb;
  src text;
BEGIN
  claims_text := current_setting('request.jwt.claims', true);
  IF claims_text IS NULL OR claims_text = '' THEN
    RAISE EXCEPTION 'Unauthorized (missing jwt claims)';
  END IF;

  BEGIN
    claims := claims_text::jsonb;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Unauthorized (invalid jwt claims)';
  END;

  src := claims #>> '{https://nands.tech/source}';
  IF src IS DISTINCT FROM p_expected THEN
    RAISE EXCEPTION 'Unauthorized (invalid source)';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.require_jwt_source(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.require_jwt_source(text) TO authenticated;

COMMENT ON FUNCTION public.require_jwt_source IS
'JWT custom claim https://nands.tech/source を検証するガード関数（job用RPCの前提）';

-- ------------------------------------------------------------
-- public.get_or_create_job_user: 内部issuerだけ許可
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_or_create_job_user(p_tenant_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = aso, public, pg_temp
AS $$
BEGIN
  PERFORM public.require_jwt_source('job_token_issuer');
  RETURN aso.get_or_create_job_user(p_tenant_id);
END;
$$;

REVOKE ALL ON FUNCTION public.get_or_create_job_user(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_or_create_job_user(uuid) TO authenticated;

COMMENT ON FUNCTION public.get_or_create_job_user IS
'aso.get_or_create_job_user のpublicスキーマラッパー（内部job-token発行API専用）';

-- ------------------------------------------------------------
-- public.cleanup_old_audit_logs: Cloud Run Jobs tokenだけ許可
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs(p_retention_days integer DEFAULT 90)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = aso, public, pg_temp
AS $$
BEGIN
  PERFORM public.require_jwt_source('cloud_run_job');
  RETURN aso.cleanup_old_audit_logs(p_retention_days);
END;
$$;

REVOKE ALL ON FUNCTION public.cleanup_old_audit_logs(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cleanup_old_audit_logs(integer) TO authenticated;

COMMENT ON FUNCTION public.cleanup_old_audit_logs IS
'aso.cleanup_old_audit_logs のpublicスキーマラッパー（Cloud Run Jobs専用）';

DO $$ BEGIN
  RAISE NOTICE '✅ Migration 20260111000000_lock_down_job_rpcs.sql completed successfully';
END $$;


