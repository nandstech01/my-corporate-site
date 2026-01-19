-- =====================================================
-- 記事削除時にFragment Vectorsも自動削除するトリガー
-- ベクトルリンクの整合性を保証
-- =====================================================

-- トリガー関数: 記事削除時にfragment_vectorsを削除
CREATE OR REPLACE FUNCTION delete_fragment_vectors_on_post_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- 削除される記事のslugを使ってfragment_vectorsを削除
  DELETE FROM fragment_vectors 
  WHERE page_path = '/posts/' || OLD.slug;
  
  -- ログ出力
  RAISE NOTICE '🗑️ 記事削除に伴いFragment Vectorsを削除: /posts/%', OLD.slug;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- トリガー設定
DROP TRIGGER IF EXISTS trigger_delete_fragment_vectors_on_post_delete ON posts;

CREATE TRIGGER trigger_delete_fragment_vectors_on_post_delete
  BEFORE DELETE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION delete_fragment_vectors_on_post_delete();

-- コメント
COMMENT ON FUNCTION delete_fragment_vectors_on_post_delete() IS '記事削除時にfragment_vectorsも自動削除してベクトルリンクの整合性を保証';

-- テスト用のログ
DO $$
BEGIN
  RAISE NOTICE '✅ 記事削除トリガー作成完了';
  RAISE NOTICE '📋 動作: posts削除時にfragment_vectorsも自動削除';
  RAISE NOTICE '🎯 目的: ベクトルリンクの整合性保証';
END $$;

