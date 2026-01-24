-- CLAVI SaaS: スキーマ名変更 aso → clavi
-- 全テーブル、関数、ビュー、ポリシーは自動的に新スキーマに属する
--
-- 実行前チェック:
--   SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'aso';
--
-- ロールバック:
--   ALTER SCHEMA clavi RENAME TO aso;

-- 1. スキーマ名変更
ALTER SCHEMA aso RENAME TO clavi;

-- 2. search_path を使用している関数のsearch_pathを更新
-- find_similar_fragments_clavi（既に新しい名前で定義されているが、search_pathがasoを参照している可能性）
DO $$
BEGIN
  -- public.find_similar_fragments_clavi の search_path を更新
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'find_similar_fragments_clavi'
  ) THEN
    EXECUTE 'ALTER FUNCTION public.find_similar_fragments_clavi(uuid, vector, float, int) SET search_path = public, clavi, pg_temp';
  END IF;
END $$;

-- 3. publicスキーマのビューを再作成（claviスキーマを参照するように）
-- 注: ビューは元のスキーマ名でオブジェクトを参照しているため、
-- スキーマ名変更後も自動的に追従する（PostgreSQLのOID参照のため）
-- ただし、念のためsearch_pathベースの関数は明示的に更新

-- 4. RLSポリシー内のスキーマ参照確認
-- RLSポリシーはOID参照なのでスキーマ名変更に自動追従する

-- 5. JWT Custom Claims Hook のsearch_path確認
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'custom_access_token_hook'
  ) THEN
    EXECUTE 'ALTER FUNCTION public.custom_access_token_hook(jsonb) SET search_path = public, clavi, pg_temp';
  END IF;
END $$;

-- 確認用クエリ
-- SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'clavi';
-- SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema = 'clavi';

RAISE NOTICE '✅ スキーマ名変更完了: aso → clavi';
