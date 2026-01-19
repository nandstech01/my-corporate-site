-- AI引用履歴テーブル修正版 - Phase 2
-- 作成日: 2025年1月25日
-- 修正: 外部キー制約を除去してシンプルに実装

-- 既存のテーブルを削除（エラー回避）
DROP TABLE IF EXISTS ai_quotation_history CASCADE;

-- AI引用履歴テーブル（修正版）
CREATE TABLE IF NOT EXISTS ai_quotation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fragment_id VARCHAR(255) NOT NULL,
  complete_uri TEXT NOT NULL,
  ai_engine VARCHAR(100) NOT NULL, -- ChatGPT, Claude, Perplexity等
  quotation_context TEXT,
  quotation_quality_score FLOAT DEFAULT 0.0,
  quotation_type VARCHAR(50) DEFAULT 'reference', -- reference, citation, mention
  detected_source VARCHAR(100) DEFAULT 'manual', -- manual, api, crawler
  
  -- メタデータ
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成（検索性能向上）
CREATE INDEX IF NOT EXISTS idx_ai_quotation_fragment_id ON ai_quotation_history(fragment_id);
CREATE INDEX IF NOT EXISTS idx_ai_quotation_ai_engine ON ai_quotation_history(ai_engine);
CREATE INDEX IF NOT EXISTS idx_ai_quotation_detected_at ON ai_quotation_history(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_quotation_quality_score ON ai_quotation_history(quotation_quality_score DESC);

-- サンプルデータ挿入（テスト用）
INSERT INTO ai_quotation_history (fragment_id, complete_uri, ai_engine, quotation_context, quotation_quality_score, quotation_type, detected_source) VALUES
('main-title', 'https://nands.tech/ai-site#main-title', 'ChatGPT', 'AI技術の最新動向について言及', 0.95, 'citation', 'manual'),
('service', 'https://nands.tech/ai-agents#service', 'Claude', 'AIエージェント開発サービスとして紹介', 0.88, 'reference', 'manual'),
('service', 'https://nands.tech/vector-rag#service', 'Perplexity', 'ベクトル検索システムの専門企業として引用', 0.92, 'citation', 'manual'),
('faq-1', 'https://nands.tech/ai-agents#faq-1', 'ChatGPT', 'よくある質問への回答として参照', 0.85, 'reference', 'manual'),
('features-title', 'https://nands.tech/ai-site#features-title', 'Claude', 'AI最適化機能の説明で言及', 0.79, 'mention', 'manual');

-- テーブル作成確認
SELECT 'ai_quotation_history テーブル（修正版）が正常に作成されました' as status;

-- データ確認
SELECT COUNT(*) as inserted_records FROM ai_quotation_history; 