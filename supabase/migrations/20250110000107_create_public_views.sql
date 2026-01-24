-- ============================================
-- Task 5.7: publicスキーマからclaviスキーマのテーブルにアクセスするビュー
-- ============================================
-- 作成日: 2025-01-10
-- 目的: Supabase JSクライアントがclaviスキーマのテーブルを参照できるようにする

-- tenants ビュー
CREATE OR REPLACE VIEW public.tenants AS
SELECT * FROM clavi.tenants;

COMMENT ON VIEW public.tenants IS
'clavi.tenants のpublicスキーマビュー（Supabase JSクライアント用）';

-- audit_log ビュー
CREATE OR REPLACE VIEW public.audit_log AS
SELECT * FROM clavi.audit_log;

COMMENT ON VIEW public.audit_log IS
'clavi.audit_log のpublicスキーマビュー（Supabase JSクライアント用）';

-- user_tenants ビュー
CREATE OR REPLACE VIEW public.user_tenants AS
SELECT * FROM clavi.user_tenants;

COMMENT ON VIEW public.user_tenants IS
'clavi.user_tenants のpublicスキーマビュー（Supabase JSクライアント用）';

-- 完了メッセージ
DO $$ BEGIN
  RAISE NOTICE '✅ publicスキーマビュー作成完了';
END $$;

