-- ============================================
-- Task 5.7: publicスキーマからasoスキーマのRPCを呼び出すラッパー関数
-- ============================================
-- 作成日: 2025-01-10
-- 目的: Supabase JSクライアントがasoスキーマのRPCを呼び出せるようにする

-- get_or_create_job_user のラッパー
CREATE OR REPLACE FUNCTION public.get_or_create_job_user(p_tenant_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = aso, public, pg_temp
AS $$
BEGIN
  RETURN aso.get_or_create_job_user(p_tenant_id);
END;
$$;

REVOKE ALL ON FUNCTION public.get_or_create_job_user(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_or_create_job_user(uuid) TO authenticated;

COMMENT ON FUNCTION public.get_or_create_job_user IS
'aso.get_or_create_job_user のpublicスキーマラッパー（Supabase JSクライアント用）';

-- cleanup_old_audit_logs のラッパー
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs(p_retention_days integer DEFAULT 90)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = aso, public, pg_temp
AS $$
BEGIN
  RETURN aso.cleanup_old_audit_logs(p_retention_days);
END;
$$;

REVOKE ALL ON FUNCTION public.cleanup_old_audit_logs(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cleanup_old_audit_logs(integer) TO authenticated;

COMMENT ON FUNCTION public.cleanup_old_audit_logs IS
'aso.cleanup_old_audit_logs のpublicスキーマラッパー（Supabase JSクライアント用）';

-- 完了メッセージ
DO $$ BEGIN
  RAISE NOTICE '✅ publicスキーマRPCラッパー作成完了';
END $$;

