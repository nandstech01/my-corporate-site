-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 個人ストーリーRAGテーブル作成
-- 作成日: 2025年10月15日
-- 目的: Kenji Harada「静かなる構築者」の個人ストーリーを格納
-- 影響: 中尺動画のみ、ショート動画・その他機能に影響なし
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- テーブル作成
CREATE TABLE IF NOT EXISTS personal_story_rag (
  id SERIAL PRIMARY KEY,
  story_arc TEXT NOT NULL,              -- 起/承/転/結
  section_title TEXT NOT NULL,          -- 「序章」「覚醒」「孤独」「覚悟」
  content TEXT NOT NULL,                -- 原文
  core_theme TEXT NOT NULL,             -- 核心テーマ
  emotion TEXT NOT NULL,                -- 感情トーン
  voice_direction TEXT,                 -- 「低く、抑えた熱」等
  rhythm_note TEXT,                     -- 「1文ごとに間を取る」等
  use_cases TEXT[],                     -- intro/body/twist/cta
  keywords TEXT[],                      -- 「構造」「孤独」「静かな」等
  embedding_text TEXT NOT NULL,         -- ベクトル生成用
  embedding VECTOR(3072),               -- 3072次元ベクトル（インデックスなし）
  created_at TIMESTAMP DEFAULT NOW()
);

-- コメント追加
COMMENT ON TABLE personal_story_rag IS 'Kenji Harada「静かなる構築者」個人ストーリーRAG（中尺動画専用）';
COMMENT ON COLUMN personal_story_rag.story_arc IS '物語の段階: 起/承/転/結';
COMMENT ON COLUMN personal_story_rag.section_title IS 'セクション名: 序章/覚醒/孤独/覚悟';
COMMENT ON COLUMN personal_story_rag.content IS 'ストーリー原文';
COMMENT ON COLUMN personal_story_rag.core_theme IS '核心テーマ';
COMMENT ON COLUMN personal_story_rag.emotion IS '感情トーン（静かな決意、静かな達成感等）';
COMMENT ON COLUMN personal_story_rag.voice_direction IS '声の指示（低く、抑えた熱等）';
COMMENT ON COLUMN personal_story_rag.rhythm_note IS 'リズムの指示（1文ごとに間を取る等）';
COMMENT ON COLUMN personal_story_rag.use_cases IS '使用箇所（intro/body/twist/cta等）';
COMMENT ON COLUMN personal_story_rag.keywords IS 'キーワードリスト';
COMMENT ON COLUMN personal_story_rag.embedding_text IS 'ベクトル生成用テキスト';
COMMENT ON COLUMN personal_story_rag.embedding IS '3072次元ベクトル（text-embedding-3-large）';

-- RPC関数作成
CREATE OR REPLACE FUNCTION match_personal_story_thoughts(
  query_embedding VECTOR(3072),
  match_threshold FLOAT DEFAULT 0.3,
  match_count INT DEFAULT 2
)
RETURNS TABLE (
  id INT,
  story_arc TEXT,
  section_title TEXT,
  content TEXT,
  core_theme TEXT,
  emotion TEXT,
  voice_direction TEXT,
  rhythm_note TEXT,
  use_cases TEXT[],
  keywords TEXT[],
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.story_arc,
    p.section_title,
    p.content,
    p.core_theme,
    p.emotion,
    p.voice_direction,
    p.rhythm_note,
    p.use_cases,
    p.keywords,
    1 - (p.embedding <=> query_embedding) AS similarity
  FROM personal_story_rag p
  WHERE p.embedding IS NOT NULL
    AND 1 - (p.embedding <=> query_embedding) > match_threshold
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- コメント追加
COMMENT ON FUNCTION match_personal_story_thoughts IS '個人ストーリーRAGのベクトル検索（3072次元、中尺動画専用）';

