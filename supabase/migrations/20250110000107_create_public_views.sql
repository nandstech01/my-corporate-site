-- ============================================
-- Task 5.7: publicスキーマからasoスキーマのテーブルにアクセスするビュー
-- ============================================
-- 作成日: 2025-01-10
-- 目的: Supabase JSクライアントがasoスキーマのテーブルを参照できるようにする

-- tenants ビュー
CREATE OR REPLACE VIEW public.tenants AS
SELECT * FROM aso.tenants;

COMMENT ON VIEW public.tenants IS
'aso.tenants のpublicスキーマビュー（Supabase JSクライアント用）';

-- audit_log ビュー
CREATE OR REPLACE VIEW public.audit_log AS
SELECT * FROM aso.audit_log;

COMMENT ON VIEW public.audit_log IS
'aso.audit_log のpublicスキーマビュー（Supabase JSクライアント用）';

-- user_tenants ビュー
CREATE OR REPLACE VIEW public.user_tenants AS
SELECT * FROM aso.user_tenants;

COMMENT ON VIEW public.user_tenants IS
'aso.user_tenants のpublicスキーマビュー（Supabase JSクライアント用）';

-- 完了メッセージ
DO $$ BEGIN
  RAISE NOTICE '✅ publicスキーマビュー作成完了';
END $$;

