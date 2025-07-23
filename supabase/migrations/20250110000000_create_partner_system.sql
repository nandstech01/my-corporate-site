-- パートナーシステム用テーブル作成
-- 2段階アフィリエイトシステム（直接50%、間接15%+35%）

-- 1. パートナーテーブル
CREATE TYPE partner_type_enum AS ENUM ('kol', 'corporate');
CREATE TYPE partner_status_enum AS ENUM ('pending', 'approved', 'rejected', 'suspended');

CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code VARCHAR(20) UNIQUE NOT NULL,
  partner_type partner_type_enum NOT NULL,
  parent_partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  
  -- 基本情報
  company_name VARCHAR(255) NOT NULL,
  representative_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  website VARCHAR(255),
  social_media VARCHAR(255),
  
  -- 申請内容
  business_description TEXT,
  experience TEXT,
  expected_monthly_deals INTEGER,
  motivation TEXT,
  
  -- システム情報
  password_hash VARCHAR(255),
  temp_password VARCHAR(100),
  status partner_status_enum DEFAULT 'pending',
  is_active BOOLEAN DEFAULT false,
  monthly_fee_paid BOOLEAN DEFAULT false,
  
  -- 統計情報
  total_revenue DECIMAL(15,2) DEFAULT 0,
  direct_revenue DECIMAL(15,2) DEFAULT 0,
  referral_revenue DECIMAL(15,2) DEFAULT 0,
  total_referrals INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. パートナー売上テーブル
CREATE TYPE sale_status_enum AS ENUM ('pending', 'confirmed', 'paid');
CREATE TYPE course_type_enum AS ENUM ('ai_development', 'aio_re_implementation', 'sns_consulting');

CREATE TABLE partner_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partners(id) NOT NULL,
  referrer_id UUID REFERENCES partners(id),
  
  -- 売上詳細
  client_company VARCHAR(255) NOT NULL,
  course_type course_type_enum NOT NULL,
  course_name VARCHAR(255) NOT NULL,
  participants INTEGER NOT NULL CHECK (participants >= 3),
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 300000,
  total_amount DECIMAL(15,2) NOT NULL,
  
  -- 報酬計算
  partner_commission_rate DECIMAL(5,2) NOT NULL,
  partner_commission DECIMAL(15,2) NOT NULL,
  referrer_commission_rate DECIMAL(5,2),
  referrer_commission DECIMAL(15,2),
  
  -- ステータス・日時
  status sale_status_enum DEFAULT 'pending',
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_date DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. リファーラルリンクテーブル
CREATE TABLE referral_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partners(id) NOT NULL,
  referral_url VARCHAR(500) UNIQUE NOT NULL,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- 4. 管理者テーブル
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- インデックス作成
CREATE INDEX idx_partners_referral_code ON partners(referral_code);
CREATE INDEX idx_partners_parent_id ON partners(parent_partner_id);
CREATE INDEX idx_partners_email ON partners(email);
CREATE INDEX idx_partner_sales_partner_id ON partner_sales(partner_id);
CREATE INDEX idx_partner_sales_referrer_id ON partner_sales(referrer_id);
CREATE INDEX idx_partner_sales_sale_date ON partner_sales(sale_date);
CREATE INDEX idx_referral_links_partner_id ON referral_links(partner_id);

-- 関数：リファーラルコード生成
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 関数：報酬自動計算
CREATE OR REPLACE FUNCTION calculate_commission(
  total_amount DECIMAL,
  has_referrer BOOLEAN
) RETURNS TABLE(
  partner_rate DECIMAL,
  partner_commission DECIMAL,
  referrer_rate DECIMAL,
  referrer_commission DECIMAL
) AS $$
BEGIN
  IF has_referrer THEN
    -- 間接紹介：パートナー15% + 紹介者35%
    RETURN QUERY SELECT 
      15.00::DECIMAL as partner_rate,
      (total_amount * 0.15)::DECIMAL as partner_commission,
      35.00::DECIMAL as referrer_rate,
      (total_amount * 0.35)::DECIMAL as referrer_commission;
  ELSE
    -- 直接紹介：パートナー50%
    RETURN QUERY SELECT 
      50.00::DECIMAL as partner_rate,
      (total_amount * 0.50)::DECIMAL as partner_commission,
      0.00::DECIMAL as referrer_rate,
      0.00::DECIMAL as referrer_commission;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- トリガー：パートナー統計更新
CREATE OR REPLACE FUNCTION update_partner_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- 直接売上の統計更新
  UPDATE partners 
  SET 
    total_revenue = (
      SELECT COALESCE(SUM(partner_commission), 0) 
      FROM partner_sales 
      WHERE partner_id = NEW.partner_id AND status = 'confirmed'
    ),
    direct_revenue = (
      SELECT COALESCE(SUM(partner_commission), 0)
      FROM partner_sales 
      WHERE partner_id = NEW.partner_id AND referrer_id IS NULL AND status = 'confirmed'
    ),
    referral_revenue = (
      SELECT COALESCE(SUM(partner_commission), 0)
      FROM partner_sales 
      WHERE partner_id = NEW.partner_id AND referrer_id IS NOT NULL AND status = 'confirmed'
    ),
    updated_at = NOW()
  WHERE id = NEW.partner_id;
  
  -- 紹介者の統計更新（存在する場合）
  IF NEW.referrer_id IS NOT NULL THEN
    UPDATE partners
    SET
      total_revenue = (
        SELECT COALESCE(SUM(referrer_commission), 0)
        FROM partner_sales 
        WHERE referrer_id = NEW.referrer_id AND status = 'confirmed'
      ),
      total_referrals = (
        SELECT COUNT(DISTINCT partner_id)
        FROM partner_sales
        WHERE referrer_id = NEW.referrer_id
      ),
      updated_at = NOW()
    WHERE id = NEW.referrer_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガー設定
CREATE TRIGGER trigger_update_partner_stats
  AFTER INSERT OR UPDATE ON partner_sales
  FOR EACH ROW EXECUTE FUNCTION update_partner_stats();

-- トリガー：updated_at自動更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_partners_updated_at
  BEFORE UPDATE ON partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_partner_sales_updated_at
  BEFORE UPDATE ON partner_sales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 初期管理者アカウント作成（パスワード: admin123）
INSERT INTO admin_users (email, password_hash, name) VALUES 
('admin@nands.tech', '$2b$10$rEgz.QoJ8mYqLpzRKt1IReQgV8gYJNhQjNfv5Nh8jLqkZoMzKjHjW', 'システム管理者');

-- Row Level Security (RLS) 設定
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- パートナーは自分のデータのみ閲覧可能
CREATE POLICY "Partners can view own data" ON partners
  FOR ALL USING (auth.uid()::text = id::text);

CREATE POLICY "Partners can view own sales" ON partner_sales
  FOR ALL USING (auth.uid()::text = partner_id::text OR auth.uid()::text = referrer_id::text);

CREATE POLICY "Partners can view own referral links" ON referral_links
  FOR ALL USING (auth.uid()::text = partner_id::text);

-- 管理者は全データ閲覧可能
CREATE POLICY "Admins can view all data" ON partners
  FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE id::text = auth.uid()::text));

CREATE POLICY "Admins can view all sales" ON partner_sales
  FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE id::text = auth.uid()::text));

-- コメント追加
COMMENT ON TABLE partners IS 'パートナー情報テーブル（KOL・企業）';
COMMENT ON TABLE partner_sales IS 'パートナー売上・報酬テーブル';
COMMENT ON TABLE referral_links IS 'リファーラルリンク管理テーブル';
COMMENT ON TABLE admin_users IS '管理者アカウントテーブル'; 