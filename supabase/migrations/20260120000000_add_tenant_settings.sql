-- ============================================
-- ASO SaaS Phase 8: テナント設定カラム追加
-- ============================================
-- 作成日: 2026-01-20
-- 目的:
-- - aso.tenants テーブルに settings JSONB カラムを追加
-- - sameAs, Author 設定を保存
-- - 既存データには影響なし（NULL許容）
--
-- 構造:
-- settings = {
--   sameAs: {
--     organization: { twitter, linkedin, facebook, youtube, github, custom[] },
--     author: { twitter, linkedin, github, youtube }
--   },
--   author: {
--     name, jobTitle, description, expertise[], image, sameAs
--   },
--   updatedAt
-- }

-- 1. settings カラム追加
ALTER TABLE aso.tenants
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- 2. settings カラムにコメント追加
COMMENT ON COLUMN aso.tenants.settings IS 'テナント設定（sameAs, Author等）- Phase 8追加';

-- 3. インデックス追加（GIN: JSONB検索最適化）
CREATE INDEX IF NOT EXISTS idx_tenants_settings
ON aso.tenants USING GIN (settings);

-- 4. RLSポリシー更新は不要（既存のtenants_selectとtenants_updateが適用される）

DO $$ BEGIN
  RAISE NOTICE '✅ Migration 20260120000000_add_tenant_settings.sql completed successfully';
END $$;
