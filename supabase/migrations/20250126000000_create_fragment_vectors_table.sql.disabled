-- Fragment ID専用ベクトルテーブル作成
-- 作成日: 2025年1月26日
-- 目的: Fragment IDが指すコンテンツのベクトル化とComplete URIリンクシステム
-- 既存テーブル（company_vectors, trend_vectors, youtube_vectors, deeplink_analytics）への影響: なし

-- Fragment ID専用ベクトルテーブル
CREATE TABLE IF NOT EXISTS fragment_vectors (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  
  -- Fragment ID関連（必須）
  fragment_id VARCHAR(255) NOT NULL,           -- faq-tech-1, service-ai-agents等
  complete_uri TEXT NOT NULL,                  -- https://nands.tech/faq#faq-tech-1
  page_path VARCHAR(500) NOT NULL,             -- /faq, /ai-site, / 等
  
  -- コンテンツ情報
  content_title TEXT NOT NULL,                 -- Fragment IDが指すコンテンツのタイトル
  content TEXT NOT NULL,                       -- Fragment IDが指すコンテンツ（ベクトル化対象）
  content_type VARCHAR(100) NOT NULL,          -- faq, service, section, heading等
  
  -- ベクトルデータ
  embedding vector(1536) NOT NULL,             -- 1536次元ベクトル
  
  -- メタデータ
  category VARCHAR(100),                       -- tech, pricing, ai-site等のカテゴリ
  semantic_weight FLOAT DEFAULT 0.85,          -- セマンティック重み（0.0-1.0）
  target_queries TEXT[],                       -- ターゲットクエリ配列
  related_entities TEXT[],                     -- 関連エンティティ配列
  metadata JSONB DEFAULT '{}',                 -- 追加メタデータ
  
  -- 管理情報
  source_system VARCHAR(50) DEFAULT 'fragment_id_system', -- データソース
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- ユニーク制約（Fragment ID + Page Pathで一意）
  UNIQUE(fragment_id, page_path)
);

-- インデックス作成（検索性能最適化）
CREATE INDEX IF NOT EXISTS idx_fragment_vectors_fragment_id ON fragment_vectors(fragment_id);
CREATE INDEX IF NOT EXISTS idx_fragment_vectors_page_path ON fragment_vectors(page_path);
CREATE INDEX IF NOT EXISTS idx_fragment_vectors_content_type ON fragment_vectors(content_type);
CREATE INDEX IF NOT EXISTS idx_fragment_vectors_category ON fragment_vectors(category);
CREATE INDEX IF NOT EXISTS idx_fragment_vectors_semantic_weight ON fragment_vectors(semantic_weight DESC);
CREATE INDEX IF NOT EXISTS idx_fragment_vectors_created_at ON fragment_vectors(created_at DESC);

-- ベクトル検索用HNSWインデックス（最重要）
CREATE INDEX IF NOT EXISTS idx_fragment_vectors_embedding 
ON fragment_vectors USING hnsw (embedding vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);

-- GINインデックス（配列検索用）
CREATE INDEX IF NOT EXISTS idx_fragment_vectors_target_queries ON fragment_vectors USING gin(target_queries);
CREATE INDEX IF NOT EXISTS idx_fragment_vectors_related_entities ON fragment_vectors USING gin(related_entities);
CREATE INDEX IF NOT EXISTS idx_fragment_vectors_metadata ON fragment_vectors USING gin(metadata);

-- 自動更新トリガー関数
CREATE OR REPLACE FUNCTION update_fragment_vectors_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガー作成
CREATE TRIGGER trigger_update_fragment_vectors_timestamp
  BEFORE UPDATE ON fragment_vectors
  FOR EACH ROW
  EXECUTE FUNCTION update_fragment_vectors_timestamp();

-- Fragment Vector専用検索関数
CREATE OR REPLACE FUNCTION match_fragment_vectors(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10,
  filter_page_path text DEFAULT NULL,
  filter_content_type text DEFAULT NULL
)
RETURNS TABLE (
  id bigint,
  fragment_id varchar(255),
  complete_uri text,
  page_path varchar(500),
  content_title text,
  content text,
  content_type varchar(100),
  category varchar(100),
  semantic_weight float,
  target_queries text[],
  related_entities text[],
  metadata jsonb,
  created_at timestamp with time zone,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    fv.id,
    fv.fragment_id,
    fv.complete_uri,
    fv.page_path,
    fv.content_title,
    fv.content,
    fv.content_type,
    fv.category,
    fv.semantic_weight,
    fv.target_queries,
    fv.related_entities,
    fv.metadata,
    fv.created_at,
    (1 - (fv.embedding <=> query_embedding)) as similarity
  FROM fragment_vectors fv
  WHERE 
    (1 - (fv.embedding <=> query_embedding)) > match_threshold
    AND (filter_page_path IS NULL OR fv.page_path = filter_page_path)
    AND (filter_content_type IS NULL OR fv.content_type = filter_content_type)
  ORDER BY fv.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- テーブル作成確認とサンプルデータ挿入
INSERT INTO fragment_vectors (
  fragment_id, complete_uri, page_path, content_title, content, content_type, category, semantic_weight
) VALUES
-- メインページサービス（サンプル）
('service-ai-agents', 'https://nands.tech/#service-ai-agents', '/', 'AIエージェント開発サービス', 'カスタムAIエージェントの設計・開発・運用を一貫して支援します。業務プロセスに特化したAIエージェントにより、24時間365日の自動化を実現。', 'service', 'main-page', 0.95),
('service-vector-rag', 'https://nands.tech/#service-vector-rag', '/', 'ベクトルRAGシステム', '高精度な情報検索と生成を実現するベクトルRAGシステムの構築。企業の知識ベースを活用した正確なAI回答システム。', 'service', 'main-page', 0.93),

-- FAQページ（サンプル）
('faq-tech-1', 'https://nands.tech/faq#faq-tech-1', '/faq', 'どのようなAI技術を使っていますか？', '最新のAI技術を幅広く活用しています。OpenAI GPT-4、Claude、Gemini等の大規模言語モデル（LLM）を中心に、RAGシステム、自然言語処理、画像認識、音声処理技術を組み合わせ、お客様のニーズに最適なソリューションを提供します。', 'faq', 'tech', 0.88),
('faq-pricing-1', 'https://nands.tech/faq#faq-pricing-1', '/faq', '料金体系を教えてください', 'プロジェクトの規模と要件に応じた柔軟な料金体系を採用しています。初期開発費、月額運用費、成果報酬型など、お客様のビジネスモデルに最適なプランをご提案いたします。', 'faq', 'pricing', 0.90)

ON CONFLICT (fragment_id, page_path) DO NOTHING;

-- RLS (Row Level Security) 設定
ALTER TABLE fragment_vectors ENABLE ROW LEVEL SECURITY;

-- 認証されたユーザーのみアクセス可能
CREATE POLICY "Enable read access for authenticated users" ON fragment_vectors
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON fragment_vectors
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON fragment_vectors
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users" ON fragment_vectors
  FOR DELETE USING (auth.role() = 'authenticated');

-- テーブル作成完了確認
SELECT 'fragment_vectors テーブルが正常に作成されました' as status,
       COUNT(*) as sample_data_count 
FROM fragment_vectors; 