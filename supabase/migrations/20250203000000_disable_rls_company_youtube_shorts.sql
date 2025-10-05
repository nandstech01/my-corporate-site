-- =====================================================
-- company_youtube_shortsテーブルのRLSを無効化
-- fragment_vectorsと一貫性を保つため
-- =====================================================

-- RLSを無効化
ALTER TABLE company_youtube_shorts DISABLE ROW LEVEL SECURITY;

-- 既存のRLSポリシーを削除
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON company_youtube_shorts;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON company_youtube_shorts;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON company_youtube_shorts;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON company_youtube_shorts;

-- ログ
DO $$
BEGIN
  RAISE NOTICE '✅ company_youtube_shortsテーブルのRLS無効化完了';
  RAISE NOTICE '📋 理由: fragment_vectorsとの一貫性保持';
  RAISE NOTICE '🎯 効果: 管理画面での直接アクセス可能';
END $$;

