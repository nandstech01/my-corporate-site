-- complete_uri を NULL 許可に変更（YouTube URL登録前は NULL）
ALTER TABLE public.company_youtube_shorts
ALTER COLUMN complete_uri DROP NOT NULL;

COMMENT ON COLUMN public.company_youtube_shorts.complete_uri IS 'Complete URI（YouTube URL登録後に生成・Draft状態ではNULL）';

DO $$ BEGIN
  RAISE NOTICE '✅ company_youtube_shorts.complete_uri を NULL 許可に変更しました';
  RAISE NOTICE '📋 理由: YouTube URL登録前はComplete URIが存在しないため';
  RAISE NOTICE '🎯 効果: Draft状態での台本保存が可能になる';
END $$;

