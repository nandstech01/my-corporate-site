-- ========================================
-- Viral Hook Patterns RAG Table
-- ========================================
-- バイラルフックパターンを保存するテーブル
-- MrBeast、TikTok、YouTubeショートなどで実証済みの
-- 高効果フックパターンを格納
-- 
-- @created 2025-12-12
-- @version 1.0.0
-- ========================================

CREATE TABLE IF NOT EXISTS public.viral_hook_patterns (
  -- 基本情報
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_id TEXT NOT NULL UNIQUE, -- フックパターンのユニークID（例: shock-mrbeast-challenge）
  name TEXT NOT NULL,              -- パターン名（例: MrBeast Challenge型）
  type TEXT NOT NULL,              -- パターンタイプ（shock/transformation/pov/curiosity/contradiction/question/numbers/secret）
  
  -- パターン定義
  template TEXT NOT NULL,          -- テンプレート（例: {subject}に{amount}{unit}使ったら{unexpected_result}になった）
  variables TEXT[] NOT NULL,       -- 変数リスト（例: ['subject', 'amount', 'unit', 'unexpected_result']）
  
  -- メタデータ
  effectiveness_score FLOAT NOT NULL DEFAULT 0.5, -- 効果スコア（0.0-1.0）
  target_audience TEXT NOT NULL,   -- ターゲット層（general/developer/architect/all）
  description TEXT,                -- パターンの説明
  example TEXT,                    -- 例文
  source TEXT,                     -- 出典（例: MrBeast, TikTok）
  use_cases TEXT[],               -- 使用例（例: ['ビジネス投資', 'ツール導入']）
  
  -- タイムスタンプ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- インデックス
-- ========================================
CREATE INDEX IF NOT EXISTS idx_viral_hook_patterns_type 
  ON public.viral_hook_patterns(type);

CREATE INDEX IF NOT EXISTS idx_viral_hook_patterns_target_audience 
  ON public.viral_hook_patterns(target_audience);

CREATE INDEX IF NOT EXISTS idx_viral_hook_patterns_effectiveness_score 
  ON public.viral_hook_patterns(effectiveness_score DESC);

CREATE INDEX IF NOT EXISTS idx_viral_hook_patterns_pattern_id 
  ON public.viral_hook_patterns(pattern_id);

-- ========================================
-- RLS (Row Level Security) - 読み取り専用
-- ========================================
ALTER TABLE public.viral_hook_patterns ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが読み取り可能
CREATE POLICY "Allow public read access"
  ON public.viral_hook_patterns
  FOR SELECT
  USING (true);

-- 認証済みユーザーのみ書き込み可能
CREATE POLICY "Allow authenticated insert"
  ON public.viral_hook_patterns
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update"
  ON public.viral_hook_patterns
  FOR UPDATE
  TO authenticated
  USING (true);

-- ========================================
-- トリガー: updated_at 自動更新
-- ========================================
CREATE OR REPLACE FUNCTION update_viral_hook_patterns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_viral_hook_patterns_updated_at
  BEFORE UPDATE ON public.viral_hook_patterns
  FOR EACH ROW
  EXECUTE FUNCTION update_viral_hook_patterns_updated_at();

-- ========================================
-- コメント
-- ========================================
COMMENT ON TABLE public.viral_hook_patterns IS 'バイラルフックパターンRAG - YouTubeショート用の高効果フックパターンを保存';
COMMENT ON COLUMN public.viral_hook_patterns.pattern_id IS 'フックパターンのユニークID';
COMMENT ON COLUMN public.viral_hook_patterns.type IS 'パターンタイプ（shock/transformation/pov/curiosity/contradiction/question/numbers/secret）';
COMMENT ON COLUMN public.viral_hook_patterns.effectiveness_score IS '効果スコア（0.0-1.0、MrBeast/TikTokなどの実証データに基づく）';
COMMENT ON COLUMN public.viral_hook_patterns.target_audience IS 'ターゲット層（general/developer/architect/all）';

