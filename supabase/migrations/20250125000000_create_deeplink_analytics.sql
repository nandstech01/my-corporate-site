-- ディープリンク統合計測システム - Phase 1
-- 作成日: 2025年1月25日
-- 目的: Fragment IDディープリンクの包括的計測システム

-- 1. ディープリンク計測メインテーブル
CREATE TABLE IF NOT EXISTS deeplink_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fragment_id VARCHAR(255) NOT NULL,
  complete_uri TEXT NOT NULL,
  page_path VARCHAR(500) NOT NULL,
  
  -- 基本計測データ
  click_count INTEGER DEFAULT 0,
  ai_quotation_count INTEGER DEFAULT 0,
  similarity_score FLOAT DEFAULT 0.0,
  
  -- SNS関連メトリクス
  social_shares INTEGER DEFAULT 0,
  video_embeddings INTEGER DEFAULT 0,
  line_shares INTEGER DEFAULT 0,
  
  -- 成果計測
  conversion_count INTEGER DEFAULT 0,
  form_submissions INTEGER DEFAULT 0,
  
  -- メタデータ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- ユニーク制約
  UNIQUE(fragment_id, page_path)
);

-- インデックス作成（検索性能向上）
CREATE INDEX IF NOT EXISTS idx_deeplink_fragment_id ON deeplink_analytics(fragment_id);
CREATE INDEX IF NOT EXISTS idx_deeplink_page_path ON deeplink_analytics(page_path);
CREATE INDEX IF NOT EXISTS idx_deeplink_similarity ON deeplink_analytics(similarity_score DESC);
CREATE INDEX IF NOT EXISTS idx_deeplink_updated ON deeplink_analytics(last_updated DESC);

-- 自動更新トリガー関数
CREATE OR REPLACE FUNCTION update_deeplink_analytics_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガー作成
CREATE TRIGGER trigger_update_deeplink_analytics_timestamp
  BEFORE UPDATE ON deeplink_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_deeplink_analytics_timestamp();

-- サンプルデータ挿入（テスト用）
INSERT INTO deeplink_analytics (fragment_id, complete_uri, page_path, similarity_score) VALUES
('service', 'https://nands.tech/ai-agents#service', '/ai-agents', 0.85),
('faq-1', 'https://nands.tech/ai-agents#faq-1', '/ai-agents', 0.78),
('main-title', 'https://nands.tech/ai-site#main-title', '/ai-site', 0.92),
('features-title', 'https://nands.tech/ai-site#features-title', '/ai-site', 0.83),
('service', 'https://nands.tech/vector-rag#service', '/vector-rag', 0.87)
ON CONFLICT (fragment_id, page_path) DO NOTHING;

-- テーブル作成確認
SELECT 'deeplink_analytics テーブルが正常に作成されました' as status; 