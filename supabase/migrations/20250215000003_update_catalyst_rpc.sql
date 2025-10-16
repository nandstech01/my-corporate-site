-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 偉人RAG（Catalyst RAG）RPC関数更新
-- 作成日: 2025年10月15日
-- 目的: 新しいフィールドをRETURNSに追加
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DROP FUNCTION IF EXISTS match_catalyst_thoughts(VECTOR(3072), FLOAT, INT);

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
  subthemes TEXT[],                -- NEW
  emotion TEXT,                    -- NEW
  emotion_code TEXT,
  your_voice_paraphrase TEXT,
  core_message TEXT,
  use_cases TEXT[],
  insertion_style TEXT,            -- NEW
  counterpoint TEXT,
  source_url TEXT,                 -- NEW
  verify_status TEXT,
  lang TEXT,                       -- NEW
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
    c.subthemes,                   -- NEW
    c.emotion,                     -- NEW
    c.emotion_code,
    c.your_voice_paraphrase,
    c.core_message,
    c.use_cases,
    c.insertion_style,             -- NEW
    c.counterpoint,
    c.source_url,                  -- NEW
    c.verify_status,
    c.lang,                        -- NEW
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

COMMENT ON FUNCTION match_catalyst_thoughts IS '偉人RAG（Catalyst RAG）のベクトル検索関数（verify_statusによるスコア調整付き、新フィールド対応）';

