-- パートナーシステム用テーブル作成（修正版）
-- 2段階アフィリエイトシステム（直接50%、間接15%+35%）

-- 管理者プロファイルテーブル（既存のadmin_usersと区別）
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- テスト用サンプルデータ追加
INSERT INTO partners (
  referral_code, 
  partner_type, 
  company_name, 
  representative_name, 
  email, 
  phone,
  business_description,
  experience,
  expected_monthly_deals,
  motivation,
  status,
  is_active
) VALUES 
-- KOLパートナー
(
  generate_referral_code(),
  'kol',
  '@keita_influencer',
  'Keita',
  'keita@example.com',
  '090-1234-5678',
  'Instagram10万、TikTok54.6K、総フォロワー20万のインフルエンサー。ビジネス系コンテンツが専門',
  'SNSマーケティング5年、フォロワー獲得・エンゲージメント向上の実績多数',
  2,
  'NANDSの先端技術とインフルエンサーとしての発信力を組み合わせ、新しい価値創造を目指したい',
  'approved',
  true
),
-- 法人パートナー
(
  generate_referral_code(),
  'corporate',
  '株式会社テックソリューション',
  '田中太郎',
  'tanaka@techsolution.co.jp',
  '03-1234-5678',
  'IT企業向けのコンサルティング・システム開発を主力事業とする',
  '法人営業10年、IT関連の導入支援実績100社以上',
  3,
  'AI技術の導入支援で既存顧客に新たな価値を提供したい',
  'approved',
  true
);

-- サンプル売上データ追加
WITH sample_partners AS (
  SELECT id, referral_code FROM partners LIMIT 2
),
keita_partner AS (
  SELECT id FROM sample_partners WHERE referral_code LIKE '%' LIMIT 1
),
corporate_partner AS (
  SELECT id FROM sample_partners WHERE referral_code LIKE '%' OFFSET 1 LIMIT 1
)
INSERT INTO partner_sales (
  partner_id,
  referrer_id,
  client_company,
  course_type,
  course_name,
  participants,
  unit_price,
  total_amount,
  partner_commission_rate,
  partner_commission,
  referrer_commission_rate,
  referrer_commission,
  status,
  sale_date
) VALUES 
-- Keitaの直接売上
(
  (SELECT id FROM keita_partner),
  NULL,
  '株式会社マーケティングファースト',
  'sns_consulting',
  'SNSコンサル講座',
  8,
  300000,
  2400000,
  50.00,
  1200000,
  NULL,
  NULL,
  'confirmed',
  '2024-12-15'
),
-- 法人パートナーの直接売上
(
  (SELECT id FROM corporate_partner),
  NULL,
  'ABC商事株式会社',
  'ai_development',
  'AI駆動開発講座',
  5,
  300000,
  1500000,
  50.00,
  750000,
  NULL,
  NULL,
  'confirmed',
  '2024-12-20'
),
-- 間接売上（法人→Keitaが紹介）
(
  (SELECT id FROM keita_partner),
  (SELECT id FROM corporate_partner),
  'デジタル変革株式会社',
  'aio_re_implementation',
  'AIO・RE実装講座',
  6,
  300000,
  1800000,
  35.00,
  630000,
  15.00,
  270000,
  'confirmed',
  '2024-12-25'
);

-- リファーラルリンク作成
INSERT INTO referral_links (partner_id, referral_url) 
SELECT 
  id,
  'https://nands.tech/partners?ref=' || referral_code
FROM partners;

-- 管理者プロファイル用のトリガー
CREATE OR REPLACE FUNCTION update_admin_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_admin_profiles_updated_at
  BEFORE UPDATE ON admin_profiles
  FOR EACH ROW EXECUTE FUNCTION update_admin_profiles_updated_at();

-- 初期管理者プロファイル（テスト用）
-- INSERT INTO admin_profiles (email, name) VALUES 
-- ('admin@nands.tech', 'システム管理者');

-- Row Level Security for admin_profiles
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin profiles are viewable by authenticated users" ON admin_profiles
  FOR SELECT USING (true);

CREATE POLICY "Admin profiles are editable by admin users" ON admin_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- パートナー用ビュー（ダッシュボード用）
CREATE OR REPLACE VIEW partner_dashboard_view AS
SELECT 
  p.id,
  p.referral_code,
  p.partner_type,
  p.company_name,
  p.representative_name,
  p.email,
  p.status,
  p.is_active,
  p.total_revenue,
  p.direct_revenue,
  p.referral_revenue,
  p.total_referrals,
  
  -- 今月の売上統計
  COALESCE(monthly.confirmed_revenue, 0) as this_month_confirmed,
  COALESCE(monthly.pending_revenue, 0) as this_month_pending,
  COALESCE(monthly.total_sales, 0) as this_month_total,
  
  -- 紹介者数
  COALESCE(ref_count.referral_count, 0) as my_referrals,
  
  -- 最新売上日
  latest_sale.latest_sale_date,
  
  p.created_at,
  p.updated_at
FROM partners p
LEFT JOIN (
  -- 今月の売上統計
  SELECT 
    partner_id,
    SUM(CASE WHEN status = 'confirmed' THEN partner_commission ELSE 0 END) as confirmed_revenue,
    SUM(CASE WHEN status = 'pending' THEN partner_commission ELSE 0 END) as pending_revenue,
    SUM(partner_commission) as total_sales
  FROM partner_sales 
  WHERE DATE_TRUNC('month', sale_date) = DATE_TRUNC('month', CURRENT_DATE)
  GROUP BY partner_id
) monthly ON p.id = monthly.partner_id
LEFT JOIN (
  -- 紹介者数
  SELECT 
    parent_partner_id as partner_id,
    COUNT(*) as referral_count
  FROM partners 
  WHERE parent_partner_id IS NOT NULL
  GROUP BY parent_partner_id
) ref_count ON p.id = ref_count.partner_id
LEFT JOIN (
  -- 最新売上日
  SELECT 
    partner_id,
    MAX(sale_date) as latest_sale_date
  FROM partner_sales
  GROUP BY partner_id
) latest_sale ON p.id = latest_sale.partner_id;

-- インデックス追加
CREATE INDEX IF NOT EXISTS idx_admin_profiles_user_id ON admin_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_email ON admin_profiles(email);

-- コメント追加
COMMENT ON TABLE admin_profiles IS '管理者プロファイルテーブル';
COMMENT ON VIEW partner_dashboard_view IS 'パートナーダッシュボード用ビュー（統計情報含む）';

-- 確認用クエリ（コメントアウト）
-- SELECT 'パートナー数: ' || COUNT(*) FROM partners;
-- SELECT '売上データ数: ' || COUNT(*) FROM partner_sales;
-- SELECT 'リファーラルリンク数: ' || COUNT(*) FROM referral_links; 