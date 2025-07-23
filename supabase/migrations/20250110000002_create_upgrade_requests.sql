-- 昇格申請テーブル作成
CREATE TABLE IF NOT EXISTS partner_upgrade_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  partner_name TEXT NOT NULL,
  partner_email TEXT NOT NULL,
  current_tier INTEGER NOT NULL DEFAULT 2,
  requested_tier INTEGER NOT NULL DEFAULT 1,
  request_type TEXT NOT NULL DEFAULT 'tier_upgrade',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_comment TEXT,
  processed_by TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_partner_upgrade_requests_partner_id ON partner_upgrade_requests(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_upgrade_requests_status ON partner_upgrade_requests(status);
CREATE INDEX IF NOT EXISTS idx_partner_upgrade_requests_created_at ON partner_upgrade_requests(created_at);

-- RLS (Row Level Security) 設定
ALTER TABLE partner_upgrade_requests ENABLE ROW LEVEL SECURITY;

-- 管理者のみ全アクセス可能
CREATE POLICY "Admin full access to upgrade requests" ON partner_upgrade_requests
  FOR ALL USING (true);

-- コメント追加
COMMENT ON TABLE partner_upgrade_requests IS 'パートナー昇格申請管理テーブル';
COMMENT ON COLUMN partner_upgrade_requests.partner_id IS '申請者のパートナーID';
COMMENT ON COLUMN partner_upgrade_requests.current_tier IS '現在のティア（2段目=2, 1段目=1）';
COMMENT ON COLUMN partner_upgrade_requests.requested_tier IS '希望するティア（通常は1）';
COMMENT ON COLUMN partner_upgrade_requests.request_type IS '申請種別（tier_upgrade等）';
COMMENT ON COLUMN partner_upgrade_requests.status IS '処理状況（pending/approved/rejected）';
COMMENT ON COLUMN partner_upgrade_requests.admin_comment IS '管理者コメント';
COMMENT ON COLUMN partner_upgrade_requests.processed_by IS '処理した管理者';
COMMENT ON COLUMN partner_upgrade_requests.processed_at IS '処理日時'; 