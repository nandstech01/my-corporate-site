-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 偉人RAG（Catalyst RAG）テーブル拡張
-- 作成日: 2025年10月15日
-- 目的: 新しいフィールドを追加して、より豊富なメタデータを保存
-- 影響: 中尺動画のみ、既存データは維持
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 新しいカラムを追加
ALTER TABLE catalyst_rag
ADD COLUMN IF NOT EXISTS subthemes TEXT[],                  -- サブテーマ（配列）
ADD COLUMN IF NOT EXISTS emotion TEXT,                       -- 感情名（日本語）
ADD COLUMN IF NOT EXISTS insertion_style TEXT DEFAULT 'allusion', -- 挿入スタイル
ADD COLUMN IF NOT EXISTS source_url TEXT,                    -- 出典URL
ADD COLUMN IF NOT EXISTS lang TEXT DEFAULT 'ja';             -- 言語（en/ja）

-- 制約を追加
ALTER TABLE catalyst_rag
ADD CONSTRAINT insertion_style_check CHECK (
  insertion_style IN ('direct_quote', 'allusion', 'paraphrase')
);

ALTER TABLE catalyst_rag
ADD CONSTRAINT lang_check CHECK (
  lang IN ('en', 'ja')
);

-- コメント追加
COMMENT ON COLUMN catalyst_rag.subthemes IS 'サブテーマ（配列、例: ["思考の限界突破", "本質的な価値"]）';
COMMENT ON COLUMN catalyst_rag.emotion IS '感情名（日本語、例: 知的好奇心）';
COMMENT ON COLUMN catalyst_rag.insertion_style IS '挿入スタイル（direct_quote: 直接引用、allusion: ほのめかし、paraphrase: 言い換え）';
COMMENT ON COLUMN catalyst_rag.source_url IS '出典URL（例: Stanford_Commencement_Speech_2005）';
COMMENT ON COLUMN catalyst_rag.lang IS '言語（en: 英語、ja: 日本語）';

-- インデックス追加（検索最適化）
CREATE INDEX IF NOT EXISTS idx_catalyst_rag_emotion_code ON catalyst_rag(emotion_code);
CREATE INDEX IF NOT EXISTS idx_catalyst_rag_insertion_style ON catalyst_rag(insertion_style);
CREATE INDEX IF NOT EXISTS idx_catalyst_rag_lang ON catalyst_rag(lang);

