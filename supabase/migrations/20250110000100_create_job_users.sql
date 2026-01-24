-- ============================================
-- Task 5.3: ジョブ専用ユーザー管理テーブル
-- ============================================
-- 作成日: 2025-01-10
-- 目的: tenant_id → auth_user_id の正引き（O(1)）

-- clavi.job_users テーブル作成
CREATE TABLE IF NOT EXISTS clavi.job_users (
  tenant_id uuid PRIMARY KEY REFERENCES clavi.tenants(id) ON DELETE CASCADE,
  auth_user_id uuid NOT NULL UNIQUE, -- auth.users.id（論理参照）
  email text NOT NULL UNIQUE, -- job-{tenant_id}@example.invalid
  is_banned boolean NOT NULL DEFAULT true, -- 常にtrue（ログイン不能）
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- コメント
COMMENT ON TABLE clavi.job_users IS 'ジョブ専用ユーザー管理（tenant_id → auth_user_id 正引き）';
COMMENT ON COLUMN clavi.job_users.tenant_id IS 'テナントID（主キー、UNIQUE制約でスケール耐性）';
COMMENT ON COLUMN clavi.job_users.auth_user_id IS 'Supabase Auth ユーザーID';
COMMENT ON COLUMN clavi.job_users.email IS 'ジョブユーザーメール（@example.invalid、ログイン不能）';
COMMENT ON COLUMN clavi.job_users.is_banned IS 'BAN状態（常にtrue、ログイン不能保証）';

-- updated_at トリガー（既存の clavi.set_updated_at() を使用）
DROP TRIGGER IF EXISTS trg_job_users_set_updated_at ON clavi.job_users;
CREATE TRIGGER trg_job_users_set_updated_at
  BEFORE UPDATE ON clavi.job_users
  FOR EACH ROW
  EXECUTE FUNCTION clavi.set_updated_at();

-- RLS有効化
ALTER TABLE clavi.job_users ENABLE ROW LEVEL SECURITY;

-- RLS ポリシー: 自テナントのジョブユーザーのみ参照可能
DROP POLICY IF EXISTS job_users_select ON clavi.job_users;
CREATE POLICY job_users_select ON clavi.job_users
  FOR SELECT
  TO authenticated
  USING (
    tenant_id = clavi.current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM clavi.user_tenants ut
      WHERE ut.tenant_id = clavi.job_users.tenant_id
        AND ut.user_id = auth.uid()
    )
  );

-- インデックス（auth_user_id検索用）
CREATE INDEX IF NOT EXISTS idx_job_users_auth_user_id ON clavi.job_users(auth_user_id);

-- 完了メッセージ
DO $$ BEGIN
  RAISE NOTICE '✅ clavi.job_users テーブル作成完了';
END $$;

