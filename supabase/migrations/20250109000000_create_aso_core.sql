-- ============================================
-- ASO SaaS core (schema + tenants + RLS primitives)
-- ============================================
-- 作成日: 2025-01-09
-- 目的:
-- - 2025-01-10 の ASO/Carve-out 系マイグレーションが依存する基盤をリポジトリに含める
-- - 新規環境（ローカル/売却後環境）でも再現可能にする
--
-- 原則:
-- - 既存システム（public.*）には影響を与えない（aso.* のみ）
-- - 可能な限り IF NOT EXISTS / CREATE OR REPLACE で冪等化

-- UUID生成
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ASO専用スキーマ
CREATE SCHEMA IF NOT EXISTS aso;

-- updated_at 自動更新関数（aso.* で使用）
CREATE OR REPLACE FUNCTION aso.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- tenants
CREATE TABLE IF NOT EXISTS aso.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  stripe_customer_id text UNIQUE,
  subscription_tier text NOT NULL DEFAULT 'starter',
  subscription_status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT tenants_subscription_tier_check
    CHECK (subscription_tier IN ('starter','pro','enterprise')),
  CONSTRAINT tenants_subscription_status_check
    CHECK (subscription_status IN ('active','trialing','past_due','canceled','unpaid'))
);

DROP TRIGGER IF EXISTS trg_tenants_set_updated_at ON aso.tenants;
CREATE TRIGGER trg_tenants_set_updated_at
BEFORE UPDATE ON aso.tenants
FOR EACH ROW EXECUTE FUNCTION aso.set_updated_at();

-- user_tenants（auth.users.id を論理参照）
CREATE TABLE IF NOT EXISTS aso.user_tenants (
  tenant_id uuid NOT NULL REFERENCES aso.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT user_tenants_pk PRIMARY KEY (tenant_id, user_id),
  CONSTRAINT user_tenants_role_check CHECK (role IN ('owner','admin','member'))
);

-- owner は tenantごとに最大1人
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_tenants_one_owner_per_tenant
ON aso.user_tenants (tenant_id)
WHERE role = 'owner';

DROP TRIGGER IF EXISTS trg_user_tenants_set_updated_at ON aso.user_tenants;
CREATE TRIGGER trg_user_tenants_set_updated_at
BEFORE UPDATE ON aso.user_tenants
FOR EACH ROW EXECUTE FUNCTION aso.set_updated_at();

-- =========================================================
-- JWT claim helpers（RLSで使用）
-- =========================================================
CREATE OR REPLACE FUNCTION aso.current_tenant_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SET search_path = aso, public, pg_temp
AS $$
DECLARE
  claims_text text;
  claims jsonb;
  tid_text text;
BEGIN
  claims_text := current_setting('request.jwt.claims', true);
  IF claims_text IS NULL OR claims_text = '' THEN
    RETURN NULL;
  END IF;

  BEGIN
    claims := claims_text::jsonb;
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;

  tid_text := claims #>> '{https://nands.tech/tenant_id}';
  IF tid_text IS NULL OR tid_text = '' THEN
    RETURN NULL;
  END IF;

  BEGIN
    RETURN tid_text::uuid;
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;
END;
$$;

CREATE OR REPLACE FUNCTION aso.current_tenant_role()
RETURNS text
LANGUAGE plpgsql
STABLE
SET search_path = aso, public, pg_temp
AS $$
DECLARE
  claims_text text;
  claims jsonb;
  role_text text;
BEGIN
  claims_text := current_setting('request.jwt.claims', true);
  IF claims_text IS NULL OR claims_text = '' THEN
    RETURN NULL;
  END IF;

  BEGIN
    claims := claims_text::jsonb;
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;

  role_text := claims #>> '{https://nands.tech/tenant_role}';
  IF role_text IS NULL OR role_text = '' THEN
    RETURN NULL;
  END IF;

  IF role_text NOT IN ('owner','admin','member') THEN
    RETURN NULL;
  END IF;

  RETURN role_text;
END;
$$;

-- =========================================================
-- RLS（テナント分離 + 所属確認）
-- =========================================================
ALTER TABLE aso.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE aso.user_tenants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenants_select ON aso.tenants;
CREATE POLICY tenants_select
ON aso.tenants FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM aso.user_tenants ut
    WHERE ut.tenant_id = aso.tenants.id AND ut.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS tenants_update ON aso.tenants;
CREATE POLICY tenants_update
ON aso.tenants FOR UPDATE TO authenticated
USING (id = aso.current_tenant_id() AND aso.current_tenant_role() IN ('owner','admin'))
WITH CHECK (id = aso.current_tenant_id() AND aso.current_tenant_role() IN ('owner','admin'));

DROP POLICY IF EXISTS user_tenants_select ON aso.user_tenants;
CREATE POLICY user_tenants_select
ON aso.user_tenants FOR SELECT TO authenticated
USING (
  tenant_id = aso.current_tenant_id()
  AND EXISTS (
    SELECT 1 FROM aso.user_tenants me
    WHERE me.tenant_id = aso.current_tenant_id() AND me.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS user_tenants_insert ON aso.user_tenants;
CREATE POLICY user_tenants_insert
ON aso.user_tenants FOR INSERT TO authenticated
WITH CHECK (tenant_id = aso.current_tenant_id() AND aso.current_tenant_role() IN ('owner','admin'));

DROP POLICY IF EXISTS user_tenants_update ON aso.user_tenants;
CREATE POLICY user_tenants_update
ON aso.user_tenants FOR UPDATE TO authenticated
USING (tenant_id = aso.current_tenant_id() AND aso.current_tenant_role() IN ('owner'))
WITH CHECK (tenant_id = aso.current_tenant_id() AND aso.current_tenant_role() IN ('owner'));

DROP POLICY IF EXISTS user_tenants_delete ON aso.user_tenants;
CREATE POLICY user_tenants_delete
ON aso.user_tenants FOR DELETE TO authenticated
USING (tenant_id = aso.current_tenant_id() AND aso.current_tenant_role() IN ('owner'));

-- onboard専用（未所属ユーザーが自分をownerとして登録）
DROP POLICY IF EXISTS user_tenants_insert_onboard ON aso.user_tenants;
CREATE POLICY user_tenants_insert_onboard
ON aso.user_tenants
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND role = 'owner'
  AND NOT EXISTS (
    SELECT 1 FROM aso.user_tenants ut
    WHERE ut.user_id = auth.uid()
  )
);

DO $$ BEGIN
  RAISE NOTICE '✅ Migration 20250109000000_create_aso_core.sql completed successfully';
END $$;


