-- Kenji Harada AIアーキテクト思想ベクトルテーブル作成
-- 作成日: 2025年2月12日
-- 目的: Kenji Haradaの思想・哲学をベクトル化し、台本生成時にRAG参照
-- 既存テーブルへの影響: なし

-- Kenji Harada思想専用テーブル
CREATE TABLE IF NOT EXISTS kenji_harada_architect_knowledge (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  
  -- 思想ドキュメント識別情報
  thought_id VARCHAR(255) NOT NULL UNIQUE,     -- vector-link-essence, relevance-engineering等
  thought_title TEXT NOT NULL,                 -- ベクトルリンクの本質、Relevance Engineeringとは
  thought_category VARCHAR(100) NOT NULL,      -- core-concept, implementation, philosophy等
  
  -- 思想コンテンツ
  thought_content TEXT NOT NULL,               -- 思想の詳細説明（ベクトル化対象）
  key_terms TEXT[],                            -- 重要用語配列（ベクトルリンク、Relevance Engineering等）
  
  -- ベクトルデータ
  embedding vector(3072),                      -- 3072次元ベクトル（text-embedding-3-large）
  
  -- メタデータ
  usage_context VARCHAR(100),                  -- short-video, medium-video, blog等
  tone VARCHAR(50) DEFAULT 'intellectual',     -- intellectual, practical, philosophical
  priority INTEGER DEFAULT 50,                 -- 優先度（1-100、高いほど重要）
  related_thoughts TEXT[],                     -- 関連する思想ID配列
  metadata JSONB DEFAULT '{}',                 -- 追加メタデータ
  
  -- ベクトル化ステータス
  vectorization_status VARCHAR(50) DEFAULT 'pending', -- pending, vectorized, error
  vectorization_date TIMESTAMP WITH TIME ZONE,
  vector_dimensions INTEGER DEFAULT 1536,
  
  -- 管理情報
  source_document TEXT,                        -- 元ドキュメント（KENJI_HARADA_ARCHITECT_THOUGHT.md等）
  created_by VARCHAR(100) DEFAULT 'system',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE               -- アクティブ状態（検索対象か）
);

-- インデックス作成（検索性能最適化）
CREATE INDEX IF NOT EXISTS idx_kenji_thought_thought_id ON kenji_harada_architect_knowledge(thought_id);
CREATE INDEX IF NOT EXISTS idx_kenji_thought_category ON kenji_harada_architect_knowledge(thought_category);
CREATE INDEX IF NOT EXISTS idx_kenji_thought_usage_context ON kenji_harada_architect_knowledge(usage_context);
CREATE INDEX IF NOT EXISTS idx_kenji_thought_priority ON kenji_harada_architect_knowledge(priority DESC);
CREATE INDEX IF NOT EXISTS idx_kenji_thought_is_active ON kenji_harada_architect_knowledge(is_active);
CREATE INDEX IF NOT EXISTS idx_kenji_thought_vectorization_status ON kenji_harada_architect_knowledge(vectorization_status);
CREATE INDEX IF NOT EXISTS idx_kenji_thought_created_at ON kenji_harada_architect_knowledge(created_at DESC);

-- ベクトル検索用HNSWインデックス（最重要）
CREATE INDEX IF NOT EXISTS idx_kenji_thought_embedding 
ON kenji_harada_architect_knowledge USING hnsw (embedding vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);

-- GINインデックス（配列検索用）
CREATE INDEX IF NOT EXISTS idx_kenji_thought_key_terms ON kenji_harada_architect_knowledge USING gin(key_terms);
CREATE INDEX IF NOT EXISTS idx_kenji_thought_related_thoughts ON kenji_harada_architect_knowledge USING gin(related_thoughts);
CREATE INDEX IF NOT EXISTS idx_kenji_thought_metadata ON kenji_harada_architect_knowledge USING gin(metadata);

-- 自動更新トリガー関数
CREATE OR REPLACE FUNCTION update_kenji_thought_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガー作成
CREATE TRIGGER trigger_update_kenji_thought_timestamp
  BEFORE UPDATE ON kenji_harada_architect_knowledge
  FOR EACH ROW
  EXECUTE FUNCTION update_kenji_thought_timestamp();

-- Kenji思想専用検索関数
CREATE OR REPLACE FUNCTION match_kenji_thoughts(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 3,
  filter_category text DEFAULT NULL,
  filter_usage_context text DEFAULT NULL,
  only_active boolean DEFAULT TRUE
)
RETURNS TABLE (
  id bigint,
  thought_id varchar(255),
  thought_title text,
  thought_category varchar(100),
  thought_content text,
  key_terms text[],
  usage_context varchar(100),
  tone varchar(50),
  priority integer,
  related_thoughts text[],
  metadata jsonb,
  vectorization_status varchar(50),
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kh.id,
    kh.thought_id,
    kh.thought_title,
    kh.thought_category,
    kh.thought_content,
    kh.key_terms,
    kh.usage_context,
    kh.tone,
    kh.priority,
    kh.related_thoughts,
    kh.metadata,
    kh.vectorization_status,
    (1 - (kh.embedding <=> query_embedding)) as similarity
  FROM kenji_harada_architect_knowledge kh
  WHERE 
    (1 - (kh.embedding <=> query_embedding)) > match_threshold
    AND (filter_category IS NULL OR kh.thought_category = filter_category)
    AND (filter_usage_context IS NULL OR kh.usage_context = filter_usage_context)
    AND (only_active = FALSE OR kh.is_active = TRUE)
    AND kh.vectorization_status = 'vectorized'
  ORDER BY 
    kh.priority DESC,
    kh.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 初期思想データ挿入（サンプル - 後でベクトル化）
INSERT INTO kenji_harada_architect_knowledge (
  thought_id,
  thought_title,
  thought_category,
  thought_content,
  key_terms,
  usage_context,
  priority,
  vectorization_status
) VALUES
-- 1. ベクトルリンクの本質
('vector-link-essence', 'ベクトルリンクの本質', 'core-concept', 
'ベクトルリンクとは、情報を意味単位（Fragment）に分割し、AIが引用・再構成できるようにする仕組みです。各Fragmentには一意のFragment IDが割り当てられ、Complete URIによってアクセス可能になります。これにより、AIは正確な情報源を特定しながら、コンテンツを理解・引用できます。構造化（Structure）→ 接続（Link）→ 再文脈化（Recontextualize）の3ステップで実現されます。',
ARRAY['ベクトルリンク', 'Fragment', 'Fragment ID', 'Complete URI', '構造化', '接続', '再文脈化'],
'short-video,medium-video',
95,
'pending'),

-- 2. Relevance Engineeringとは
('relevance-engineering', 'Relevance Engineeringとは', 'core-concept',
'Relevance Engineering（関連性の設計）とは、AIが正確に文脈をつなげるための基礎構造を定義する考え方です。情報の関連性を明示的に設計することで、AIが誤解なく理解できる環境を作ります。Schema.orgなどの構造化データ、セマンティックHTML、メタデータの最適化により実現されます。これは「AIを使う」のではなく「AIが理解できる構造を設計する」という視点の転換です。',
ARRAY['Relevance Engineering', '関連性', '構造化データ', 'Schema.org', 'セマンティック', 'メタデータ'],
'medium-video,blog',
90,
'pending'),

-- 3. Triple RAGの設計思想
('triple-rag', 'Triple RAGの設計思想', 'implementation',
'Triple RAG（3層検索構造）とは、自社知識・トレンド情報・教育的文脈を結合し、AIの理解を多層的に補強する設計です。Internal（社内知識）、Context（トレンド情報）、Knowledge（教育的文脈）の3層で情報を検索し、統合することで、AIはより正確で文脈に沿った回答を生成できます。単一の知識ベースに依存せず、多層的な情報源から最適な情報を引き出す仕組みです。',
ARRAY['Triple RAG', '3層検索', 'Internal', 'Context', 'Knowledge', '多層的補強'],
'medium-video',
85,
'pending'),

-- 4. AIアーキテクトの役割
('ai-architect-role', 'AIアーキテクトの役割', 'philosophy',
'AIアーキテクトとは、「AIが理解できる構造を設計する職能」です。AIは人類の"意味"を再構築する鏡であり、その鏡に正確に映るための構造を設計するのがAIアーキテクトの役割です。技術実装だけでなく、情報の意味構造、関連性、文脈を設計し、AIと人間の間に立つ翻訳者として機能します。「理解とは、再文脈化の技術である」という哲学に基づいています。',
ARRAY['AIアーキテクト', '構造設計', '再文脈化', '意味構造', '翻訳者'],
'medium-video,blog',
80,
'pending'),

-- 5. 構造化の哲学
('structure-philosophy', '構造化の哲学', 'philosophy',
'構造は言葉を超える。言葉はAIに、構造は未来に届く。これが構造化の哲学です。情報を単なるテキストの羅列ではなく、意味を持つ構造として設計することで、AIは長期的に理解し、進化しても活用できる資産になります。抽象的でありながら、常に実装に繋がる。知的で静かな情熱を持ち、未来志向で設計する。これがKenjiスタイルの核心です。',
ARRAY['構造', '哲学', '意味設計', '長期的価値', '未来志向'],
'blog',
75,
'pending')

ON CONFLICT (thought_id) DO NOTHING;

-- RLS (Row Level Security) 設定を無効化（内部システム用）
ALTER TABLE kenji_harada_architect_knowledge DISABLE ROW LEVEL SECURITY;

-- テーブル作成完了確認
SELECT 'kenji_harada_architect_knowledge テーブルが正常に作成されました' as status,
       COUNT(*) as initial_thought_count,
       COUNT(*) FILTER (WHERE vectorization_status = 'pending') as pending_vectorization
FROM kenji_harada_architect_knowledge;

