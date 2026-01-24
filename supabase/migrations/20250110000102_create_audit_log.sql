-- ============================================
-- Task 5.4: 監査ログテーブル
-- ============================================
-- 作成日: 2025-01-10
-- 目的: セキュリティとコンプライアンスのための監査ログ記録

-- clavi.audit_log テーブル作成
CREATE TABLE IF NOT EXISTS clavi.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES clavi.tenants(id) ON DELETE CASCADE,
  user_id uuid,  -- auth.users.id（論理参照、ジョブの場合はジョブユーザーID）
  action text NOT NULL,  -- onboard, job_token_issued, job_user_created, tenant_updated, member_added, etc.
  resource_type text NOT NULL,  -- tenant, user_tenant, job_user, job_token, etc.
  resource_id text,  -- リソースのID（UUID等）
  metadata jsonb,  -- 追加情報（IPアドレス、User Agent、変更内容等）
  created_at timestamptz NOT NULL DEFAULT now()
);

-- コメント
COMMENT ON TABLE clavi.audit_log IS '監査ログ（重要なアクションを記録、保持期間30-90日）';
COMMENT ON COLUMN clavi.audit_log.tenant_id IS 'テナントID';
COMMENT ON COLUMN clavi.audit_log.user_id IS '実行ユーザーID（auth.users.id、論理参照）';
COMMENT ON COLUMN clavi.audit_log.action IS 'アクション名（onboard, job_token_issued等）';
COMMENT ON COLUMN clavi.audit_log.resource_type IS 'リソース種別（tenant, user_tenant, job_user等）';
COMMENT ON COLUMN clavi.audit_log.resource_id IS 'リソースID';
COMMENT ON COLUMN clavi.audit_log.metadata IS '追加情報（JSON形式）';
COMMENT ON COLUMN clavi.audit_log.created_at IS '記録日時';

-- インデックス（検索性能向上）
CREATE INDEX IF NOT EXISTS idx_audit_log_tenant_id ON clavi.audit_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON clavi.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON clavi.audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON clavi.audit_log(user_id);

-- RLS有効化
ALTER TABLE clavi.audit_log ENABLE ROW LEVEL SECURITY;

-- RLS ポリシー: 自テナントの監査ログのみ参照可能
DROP POLICY IF EXISTS audit_log_select ON clavi.audit_log;
CREATE POLICY audit_log_select ON clavi.audit_log
  FOR SELECT
  TO authenticated
  USING (
    tenant_id = clavi.current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM clavi.user_tenants ut
      WHERE ut.tenant_id = clavi.audit_log.tenant_id
        AND ut.user_id = auth.uid()
        AND ut.role IN ('owner', 'admin')  -- owner/adminのみ監査ログ参照可能
    )
  );

-- 監査ログへのINSERTはヘルパー関数経由のみ（直接INSERTは禁止）
-- DELETEは自動削除関数のみ（手動削除禁止）

-- 完了メッセージ
DO $$ BEGIN
  RAISE NOTICE '✅ clavi.audit_log テーブル作成完了';
END $$;

