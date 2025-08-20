-- 類似度履歴テーブル作成 - Phase 2
-- 作成日: 2025年1月25日
-- 目的: 類似度の推移追跡と改善分析システム

-- 類似度履歴テーブル
CREATE TABLE IF NOT EXISTS similarity_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fragment_id VARCHAR(255) NOT NULL,
  complete_uri TEXT NOT NULL,
  similarity_score FLOAT NOT NULL,
  data_source VARCHAR(100) NOT NULL, -- company_rag, external_api, hybrid
  measurement_type VARCHAR(50) DEFAULT 'automatic', -- automatic, manual, scheduled
  
  -- RAGソース別貢献度
  company_rag_contribution FLOAT DEFAULT 0.0,
  trend_rag_contribution FLOAT DEFAULT 0.0,
  dynamic_rag_contribution FLOAT DEFAULT 0.0,
  
  -- メタデータ
  measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成（検索性能向上）
CREATE INDEX IF NOT EXISTS idx_similarity_fragment_id ON similarity_history(fragment_id);
CREATE INDEX IF NOT EXISTS idx_similarity_score ON similarity_history(similarity_score DESC);
CREATE INDEX IF NOT EXISTS idx_similarity_measured_at ON similarity_history(measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_similarity_data_source ON similarity_history(data_source);

-- サンプルデータ挿入（過去1週間の推移データ）
INSERT INTO similarity_history (fragment_id, complete_uri, similarity_score, data_source, measurement_type, company_rag_contribution, trend_rag_contribution, dynamic_rag_contribution, measured_at) VALUES
-- main-title の推移（向上傾向）
('main-title', 'https://nands.tech/ai-site#main-title', 0.85, 'company_rag', 'automatic', 0.85, 0.0, 0.0, NOW() - INTERVAL '7 days'),
('main-title', 'https://nands.tech/ai-site#main-title', 0.88, 'company_rag', 'automatic', 0.78, 0.10, 0.0, NOW() - INTERVAL '5 days'),
('main-title', 'https://nands.tech/ai-site#main-title', 0.90, 'hybrid', 'automatic', 0.75, 0.12, 0.03, NOW() - INTERVAL '3 days'),
('main-title', 'https://nands.tech/ai-site#main-title', 0.92, 'hybrid', 'automatic', 0.73, 0.14, 0.05, NOW() - INTERVAL '1 day'),

-- service (ai-agents) の推移（安定）
('service', 'https://nands.tech/ai-agents#service', 0.82, 'company_rag', 'automatic', 0.82, 0.0, 0.0, NOW() - INTERVAL '7 days'),
('service', 'https://nands.tech/ai-agents#service', 0.84, 'company_rag', 'automatic', 0.79, 0.05, 0.0, NOW() - INTERVAL '5 days'),
('service', 'https://nands.tech/ai-agents#service', 0.85, 'hybrid', 'automatic', 0.76, 0.07, 0.02, NOW() - INTERVAL '3 days'),
('service', 'https://nands.tech/ai-agents#service', 0.85, 'hybrid', 'automatic', 0.75, 0.08, 0.02, NOW() - INTERVAL '1 day'),

-- service (vector-rag) の推移（大幅向上）
('service', 'https://nands.tech/vector-rag#service', 0.75, 'company_rag', 'automatic', 0.75, 0.0, 0.0, NOW() - INTERVAL '7 days'),
('service', 'https://nands.tech/vector-rag#service', 0.79, 'company_rag', 'automatic', 0.72, 0.07, 0.0, NOW() - INTERVAL '5 days'),
('service', 'https://nands.tech/vector-rag#service', 0.83, 'hybrid', 'automatic', 0.69, 0.11, 0.03, NOW() - INTERVAL '3 days'),
('service', 'https://nands.tech/vector-rag#service', 0.87, 'hybrid', 'automatic', 0.66, 0.15, 0.06, NOW() - INTERVAL '1 day'),

-- faq-1 の推移（改善が必要）
('faq-1', 'https://nands.tech/ai-agents#faq-1', 0.72, 'company_rag', 'automatic', 0.72, 0.0, 0.0, NOW() - INTERVAL '7 days'),
('faq-1', 'https://nands.tech/ai-agents#faq-1', 0.74, 'company_rag', 'automatic', 0.70, 0.04, 0.0, NOW() - INTERVAL '5 days'),
('faq-1', 'https://nands.tech/ai-agents#faq-1', 0.76, 'hybrid', 'automatic', 0.68, 0.06, 0.02, NOW() - INTERVAL '3 days'),
('faq-1', 'https://nands.tech/ai-agents#faq-1', 0.78, 'hybrid', 'automatic', 0.66, 0.09, 0.03, NOW() - INTERVAL '1 day'),

-- features-title の推移（緩やかな向上）
('features-title', 'https://nands.tech/ai-site#features-title', 0.79, 'company_rag', 'automatic', 0.79, 0.0, 0.0, NOW() - INTERVAL '7 days'),
('features-title', 'https://nands.tech/ai-site#features-title', 0.80, 'company_rag', 'automatic', 0.76, 0.04, 0.0, NOW() - INTERVAL '5 days'),
('features-title', 'https://nands.tech/ai-site#features-title', 0.82, 'hybrid', 'automatic', 0.74, 0.06, 0.02, NOW() - INTERVAL '3 days'),
('features-title', 'https://nands.tech/ai-site#features-title', 0.83, 'hybrid', 'automatic', 0.72, 0.08, 0.03, NOW() - INTERVAL '1 day');

-- テーブル作成確認
SELECT 'similarity_history テーブルが正常に作成されました' as status;

-- データ確認
SELECT COUNT(*) as inserted_records FROM similarity_history;

-- 推移データ確認
SELECT fragment_id, COUNT(*) as measurement_count, 
       MIN(similarity_score) as min_score, 
       MAX(similarity_score) as max_score,
       ROUND((MAX(similarity_score) - MIN(similarity_score))::numeric, 3) as improvement
FROM similarity_history 
GROUP BY fragment_id 
ORDER BY improvement DESC; 