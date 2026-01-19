-- ============================================
-- Phase 6.0: 招待テーブル作成
-- ============================================
-- 作成日: 2026-01-20
-- 目的: マルチテナント招待機能のための招待テーブル作成

-- aso.invitations テーブル作成
CREATE TABLE IF NOT EXISTS aso.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES aso.tenants(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,  -- 32バイトランダム値（URLセーフBase64）
  target_email text NOT NULL,  -- 招待先メールアドレス
  target_role text NOT NULL DEFAULT 'member',  -- 付与するロール
  invited_by uuid NOT NULL,  -- 招待したユーザーID（auth.users.id、論理参照）
  status text NOT NULL DEFAULT 'pending',  -- pending, accepted, expired, revoked
  expires_at timestamptz NOT NULL,  -- 有効期限（デフォルト7日後）
  accepted_at timestamptz,  -- 受諾日時
  accepted_by uuid,  -- 受諾したユーザーID（target_emailと異なる場合もある）
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT invitations_target_role_check CHECK (target_role IN ('admin', 'member')),
  CONSTRAINT invitations_status_check CHECK (status IN ('pending', 'accepted', 'expired', 'revoked'))
);

-- コメント
COMMENT ON TABLE aso.invitations IS 'テナント招待（7日間有効、owner/adminが発行可能）';
COMMENT ON COLUMN aso.invitations.token IS '招待トークン（URLセーフBase64、32バイト）';
COMMENT ON COLUMN aso.invitations.target_email IS '招待先メールアドレス（受諾時に検証）';
COMMENT ON COLUMN aso.invitations.target_role IS '付与するロール（admin/member、owner招待は不可）';
COMMENT ON COLUMN aso.invitations.invited_by IS '招待したユーザーID';
COMMENT ON COLUMN aso.invitations.status IS '招待ステータス（pending/accepted/expired/revoked）';
COMMENT ON COLUMN aso.invitations.expires_at IS '有効期限（7日後）';
COMMENT ON COLUMN aso.invitations.accepted_at IS '受諾日時';
COMMENT ON COLUMN aso.invitations.accepted_by IS '実際に受諾したユーザーID';

-- updated_at 自動更新トリガー
DROP TRIGGER IF EXISTS trg_invitations_set_updated_at ON aso.invitations;
CREATE TRIGGER trg_invitations_set_updated_at
BEFORE UPDATE ON aso.invitations
FOR EACH ROW EXECUTE FUNCTION aso.set_updated_at();

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_invitations_token ON aso.invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_tenant_id ON aso.invitations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invitations_target_email ON aso.invitations(target_email);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON aso.invitations(status);
CREATE INDEX IF NOT EXISTS idx_invitations_expires_at ON aso.invitations(expires_at);

-- 有効期限切れ + pending の招待を高速検索
CREATE INDEX IF NOT EXISTS idx_invitations_pending_expires
ON aso.invitations(expires_at)
WHERE status = 'pending';

-- RLS有効化
ALTER TABLE aso.invitations ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: SELECT（owner/adminのみ自テナントの招待を閲覧可能）
DROP POLICY IF EXISTS invitations_select ON aso.invitations;
CREATE POLICY invitations_select ON aso.invitations
  FOR SELECT
  TO authenticated
  USING (
    tenant_id = aso.current_tenant_id()
    AND aso.current_tenant_role() IN ('owner', 'admin')
  );

-- RLSポリシー: INSERT（owner/adminのみ自テナントに招待作成可能）
DROP POLICY IF EXISTS invitations_insert ON aso.invitations;
CREATE POLICY invitations_insert ON aso.invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id = aso.current_tenant_id()
    AND aso.current_tenant_role() IN ('owner', 'admin')
  );

-- RLSポリシー: UPDATE（owner/adminのみ自テナントの招待を更新可能）
DROP POLICY IF EXISTS invitations_update ON aso.invitations;
CREATE POLICY invitations_update ON aso.invitations
  FOR UPDATE
  TO authenticated
  USING (
    tenant_id = aso.current_tenant_id()
    AND aso.current_tenant_role() IN ('owner', 'admin')
  )
  WITH CHECK (
    tenant_id = aso.current_tenant_id()
    AND aso.current_tenant_role() IN ('owner', 'admin')
  );

-- RLSポリシー: DELETE（owner/adminのみ自テナントの招待を削除可能）
DROP POLICY IF EXISTS invitations_delete ON aso.invitations;
CREATE POLICY invitations_delete ON aso.invitations
  FOR DELETE
  TO authenticated
  USING (
    tenant_id = aso.current_tenant_id()
    AND aso.current_tenant_role() IN ('owner', 'admin')
  );

-- publicスキーマビュー作成（Supabase JSクライアント用）
CREATE OR REPLACE VIEW public.invitations AS
SELECT * FROM aso.invitations;

COMMENT ON VIEW public.invitations IS
'aso.invitations のpublicスキーマビュー（Supabase JSクライアント用）';

-- 完了メッセージ
DO $$ BEGIN
  RAISE NOTICE '✅ Migration 20260120000000_create_invitations_table.sql completed successfully';
END $$;
