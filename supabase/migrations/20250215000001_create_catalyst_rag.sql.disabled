-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 偉人RAG（Catalyst RAG）テーブル作成
-- 作成日: 2025年10月15日
-- 目的: 偉人の名言・哲学を「触媒」として感情的深みを提供
-- 影響: 中尺動画のみ、ショート動画・その他機能に影響なし
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- テーブル作成
CREATE TABLE IF NOT EXISTS catalyst_rag (
  id SERIAL PRIMARY KEY,
  person TEXT NOT NULL,                 -- 偉人名
  quote TEXT NOT NULL,                  -- 原典引用
  theme TEXT NOT NULL,                  -- テーマ
  emotion_code TEXT NOT NULL,           -- 感情コード（決意、挑戦、孤独等）
  your_voice_paraphrase TEXT NOT NULL,  -- Kenjiさんの言葉に変換
  core_message TEXT NOT NULL,           -- 核心メッセージ
  use_cases TEXT[],                     -- intro/twist/cta等
  counterpoint TEXT,                    -- 反対視点（思想のバランス）
  verify_status TEXT DEFAULT 'unverified', -- verified/credible/unverified
  embedding_text TEXT NOT NULL,         -- ベクトル生成用
  embedding VECTOR(3072),               -- 3072次元ベクトル（インデックスなし）
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- 制約
  CONSTRAINT verify_status_check CHECK (verify_status IN ('verified', 'credible', 'unverified'))
);

-- コメント追加
COMMENT ON TABLE catalyst_rag IS '偉人RAG（Catalyst RAG）- 感情的触媒（中尺動画専用）';
COMMENT ON COLUMN catalyst_rag.person IS '偉人名（ニーチェ、ジョブズ等）';
COMMENT ON COLUMN catalyst_rag.quote IS '原典引用';
COMMENT ON COLUMN catalyst_rag.theme IS 'テーマ（価値の再創造、探求心等）';
COMMENT ON COLUMN catalyst_rag.emotion_code IS '感情コード（決意、挑戦、孤独等）';
COMMENT ON COLUMN catalyst_rag.your_voice_paraphrase IS 'Kenjiさんの言葉に変換したバージョン';
COMMENT ON COLUMN catalyst_rag.core_message IS '核心メッセージ';
COMMENT ON COLUMN catalyst_rag.use_cases IS '使用箇所（intro/twist/cta等）';
COMMENT ON COLUMN catalyst_rag.counterpoint IS '反対視点（思想のバランスを保つため）';
COMMENT ON COLUMN catalyst_rag.verify_status IS '検証ステータス（verified: +0.1, credible: +0.05, unverified: +0）';
COMMENT ON COLUMN catalyst_rag.embedding_text IS 'ベクトル生成用テキスト';
COMMENT ON COLUMN catalyst_rag.embedding IS '3072次元ベクトル（text-embedding-3-large）';

-- RPC関数作成
CREATE OR REPLACE FUNCTION match_catalyst_thoughts(
  query_embedding VECTOR(3072),
  match_threshold FLOAT DEFAULT 0.25,
  match_count INT DEFAULT 3
)
RETURNS TABLE (
  id INT,
  person TEXT,
  quote TEXT,
  theme TEXT,
  emotion_code TEXT,
  your_voice_paraphrase TEXT,
  core_message TEXT,
  use_cases TEXT[],
  counterpoint TEXT,
  verify_status TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.person,
    c.quote,
    c.theme,
    c.emotion_code,
    c.your_voice_paraphrase,
    c.core_message,
    c.use_cases,
    c.counterpoint,
    c.verify_status,
    -- verify_statusでスコア調整
    CASE 
      WHEN c.verify_status = 'verified' THEN (1 - (c.embedding <=> query_embedding)) + 0.1
      WHEN c.verify_status = 'credible' THEN (1 - (c.embedding <=> query_embedding)) + 0.05
      ELSE 1 - (c.embedding <=> query_embedding)
    END AS similarity
  FROM catalyst_rag c
  WHERE c.embedding IS NOT NULL
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY 
    CASE 
      WHEN c.verify_status = 'verified' THEN (1 - (c.embedding <=> query_embedding)) + 0.1
      WHEN c.verify_status = 'credible' THEN (1 - (c.embedding <=> query_embedding)) + 0.05
      ELSE 1 - (c.embedding <=> query_embedding)
    END DESC
  LIMIT match_count;
END;
$$;

-- コメント追加
COMMENT ON FUNCTION match_catalyst_thoughts IS '偉人RAGのベクトル検索（3072次元、verify_statusスコア調整あり、中尺動画専用）';

