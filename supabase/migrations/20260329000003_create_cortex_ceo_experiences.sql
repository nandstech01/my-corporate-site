-- CEO体験ログ: 一次情報を蓄積し、投稿生成時にCEO視点を注入する
CREATE TABLE IF NOT EXISTS cortex_ceo_experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT 'general', -- 'dev', 'business', 'ai', 'team', 'client', 'general'
  experience text NOT NULL, -- 体験の要約
  insight text, -- そこから得た洞察
  created_at timestamptz DEFAULT now()
);
