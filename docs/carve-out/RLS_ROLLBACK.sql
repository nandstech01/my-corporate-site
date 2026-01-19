-- RLS緊急ロールバックSQL
-- 既存システムに影響が出た場合、このSQLを即実行してください

-- 方法1: RLS無効化（最速）
ALTER TABLE aso.tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE aso.user_tenants DISABLE ROW LEVEL SECURITY;

-- 方法2: ポリシー削除（RLSは有効のまま）
DROP POLICY IF EXISTS tenants_select ON aso.tenants;
DROP POLICY IF EXISTS tenants_update ON aso.tenants;
DROP POLICY IF EXISTS user_tenants_select ON aso.user_tenants;
DROP POLICY IF EXISTS user_tenants_insert ON aso.user_tenants;
DROP POLICY IF EXISTS user_tenants_insert_onboard ON aso.user_tenants;
DROP POLICY IF EXISTS user_tenants_update ON aso.user_tenants;
DROP POLICY IF EXISTS user_tenants_delete ON aso.user_tenants;

-- 確認
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'aso'
ORDER BY tablename;

SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'aso'
ORDER BY tablename, policyname;

