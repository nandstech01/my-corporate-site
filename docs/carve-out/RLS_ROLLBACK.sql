-- RLS緊急ロールバックSQL
-- 既存システムに影響が出た場合、このSQLを即実行してください

-- 方法1: RLS無効化（最速）
ALTER TABLE clavi.tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE clavi.user_tenants DISABLE ROW LEVEL SECURITY;

-- 方法2: ポリシー削除（RLSは有効のまま）
DROP POLICY IF EXISTS tenants_select ON clavi.tenants;
DROP POLICY IF EXISTS tenants_update ON clavi.tenants;
DROP POLICY IF EXISTS user_tenants_select ON clavi.user_tenants;
DROP POLICY IF EXISTS user_tenants_insert ON clavi.user_tenants;
DROP POLICY IF EXISTS user_tenants_insert_onboard ON clavi.user_tenants;
DROP POLICY IF EXISTS user_tenants_update ON clavi.user_tenants;
DROP POLICY IF EXISTS user_tenants_delete ON clavi.user_tenants;

-- 確認
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'clavi'
ORDER BY tablename;

SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'clavi'
ORDER BY tablename, policyname;

