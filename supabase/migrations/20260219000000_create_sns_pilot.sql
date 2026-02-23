-- ============================================
-- SNS Pilot SaaS - Core Schema
-- ============================================
-- 作成日: 2026-02-19
-- 目的:
-- - SNS Pilot SaaS用のテナント管理・使用量追跡・API認証基盤
-- - CLAVIの実績あるパターンを踏襲しつつ、独立スキーマで運用

-- SNS Pilot専用スキーマ
CREATE SCHEMA IF NOT EXISTS sns_pilot;

-- updated_at 自動更新関数
CREATE OR REPLACE FUNCTION sns_pilot.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================================================
-- 1. テナントテーブル
-- =========================================================

CREATE TABLE IF NOT EXISTS sns_pilot.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  stripe_price_id text,
  subscription_tier text NOT NULL DEFAULT 'free',
  subscription_status text NOT NULL DEFAULT 'active',
  subscription_current_period_end timestamptz,
  subscription_cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT sp_tenants_tier_check
    CHECK (subscription_tier IN ('free','starter','pro','enterprise')),
  CONSTRAINT sp_tenants_status_check
    CHECK (subscription_status IN ('active','trialing','past_due','canceled','unpaid'))
);

CREATE INDEX IF NOT EXISTS idx_sp_tenants_stripe_customer
ON sns_pilot.tenants (stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sp_tenants_stripe_sub
ON sns_pilot.tenants (stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sp_tenants_email
ON sns_pilot.tenants (email);

DROP TRIGGER IF EXISTS trg_sp_tenants_updated ON sns_pilot.tenants;
CREATE TRIGGER trg_sp_tenants_updated
BEFORE UPDATE ON sns_pilot.tenants
FOR EACH ROW EXECUTE FUNCTION sns_pilot.set_updated_at();

-- =========================================================
-- 2. API キーテーブル
-- =========================================================

CREATE TABLE IF NOT EXISTS sns_pilot.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES sns_pilot.tenants(id) ON DELETE CASCADE,
  key_hash text NOT NULL,
  key_prefix text NOT NULL,
  name text NOT NULL DEFAULT 'Default',
  is_active boolean NOT NULL DEFAULT true,
  last_used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sp_api_keys_hash
ON sns_pilot.api_keys (key_hash) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_sp_api_keys_tenant
ON sns_pilot.api_keys (tenant_id);

DROP TRIGGER IF EXISTS trg_sp_api_keys_updated ON sns_pilot.api_keys;
CREATE TRIGGER trg_sp_api_keys_updated
BEFORE UPDATE ON sns_pilot.api_keys
FOR EACH ROW EXECUTE FUNCTION sns_pilot.set_updated_at();

-- =========================================================
-- 3. 使用量追跡テーブル
-- =========================================================

CREATE TABLE IF NOT EXISTS sns_pilot.usage_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES sns_pilot.tenants(id) ON DELETE CASCADE,
  year_month text NOT NULL,
  x_post_count integer NOT NULL DEFAULT 0,
  linkedin_post_count integer NOT NULL DEFAULT 0,
  instagram_story_count integer NOT NULL DEFAULT 0,
  total_prompt_tokens bigint NOT NULL DEFAULT 0,
  total_completion_tokens bigint NOT NULL DEFAULT 0,
  total_image_generations integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT sp_usage_unique UNIQUE (tenant_id, year_month),
  CONSTRAINT sp_usage_month_fmt CHECK (year_month ~ '^\d{4}-\d{2}$')
);

DROP TRIGGER IF EXISTS trg_sp_usage_updated ON sns_pilot.usage_records;
CREATE TRIGGER trg_sp_usage_updated
BEFORE UPDATE ON sns_pilot.usage_records
FOR EACH ROW EXECUTE FUNCTION sns_pilot.set_updated_at();

-- =========================================================
-- 4. 投稿履歴テーブル
-- =========================================================

CREATE TABLE IF NOT EXISTS sns_pilot.post_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES sns_pilot.tenants(id) ON DELETE CASCADE,
  platform text NOT NULL,
  post_content text NOT NULL,
  pattern_used text,
  tags text[] DEFAULT '{}',
  scores jsonb,
  all_candidates jsonb,
  prompt_tokens integer NOT NULL DEFAULT 0,
  completion_tokens integer NOT NULL DEFAULT 0,
  input_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT sp_post_platform_check
    CHECK (platform IN ('x','linkedin','instagram'))
);

CREATE INDEX IF NOT EXISTS idx_sp_post_history_tenant
ON sns_pilot.post_history (tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sp_post_history_platform
ON sns_pilot.post_history (tenant_id, platform);

-- =========================================================
-- 5. 使用量インクリメント関数
-- =========================================================

CREATE OR REPLACE FUNCTION sns_pilot.increment_usage(
  p_tenant_id uuid,
  p_platform text,
  p_prompt_tokens integer DEFAULT 0,
  p_completion_tokens integer DEFAULT 0,
  p_image_generations integer DEFAULT 0,
  p_year_month text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = sns_pilot, public, pg_temp
AS $$
DECLARE
  v_year_month text;
  v_total integer;
BEGIN
  v_year_month := COALESCE(p_year_month, to_char(now(), 'YYYY-MM'));

  INSERT INTO sns_pilot.usage_records (tenant_id, year_month)
  VALUES (p_tenant_id, v_year_month)
  ON CONFLICT (tenant_id, year_month) DO NOTHING;

  UPDATE sns_pilot.usage_records
  SET
    x_post_count = x_post_count + CASE WHEN p_platform = 'x' THEN 1 ELSE 0 END,
    linkedin_post_count = linkedin_post_count + CASE WHEN p_platform = 'linkedin' THEN 1 ELSE 0 END,
    instagram_story_count = instagram_story_count + CASE WHEN p_platform = 'instagram' THEN 1 ELSE 0 END,
    total_prompt_tokens = total_prompt_tokens + p_prompt_tokens,
    total_completion_tokens = total_completion_tokens + p_completion_tokens,
    total_image_generations = total_image_generations + p_image_generations,
    updated_at = now()
  WHERE tenant_id = p_tenant_id AND year_month = v_year_month
  RETURNING (x_post_count + linkedin_post_count + instagram_story_count) INTO v_total;

  RETURN v_total;
END;
$$;

-- =========================================================
-- 6. 使用量チェック関数
-- =========================================================

CREATE OR REPLACE FUNCTION sns_pilot.check_usage_limit(
  p_tenant_id uuid,
  p_year_month text DEFAULT NULL
)
RETURNS TABLE (
  current_usage integer,
  usage_limit integer,
  tier text,
  is_allowed boolean,
  remaining integer
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = sns_pilot, public, pg_temp
AS $$
DECLARE
  v_year_month text;
  v_current integer;
  v_limit integer;
  v_tier text;
BEGIN
  v_year_month := COALESCE(p_year_month, to_char(now(), 'YYYY-MM'));

  SELECT subscription_tier INTO v_tier
  FROM sns_pilot.tenants WHERE id = p_tenant_id;

  IF v_tier IS NULL THEN
    RAISE EXCEPTION 'Tenant not found: %', p_tenant_id;
  END IF;

  CASE v_tier
    WHEN 'free' THEN v_limit := 10;
    WHEN 'starter' THEN v_limit := 60;
    WHEN 'pro' THEN v_limit := 200;
    WHEN 'enterprise' THEN v_limit := -1;
    ELSE v_limit := 10;
  END CASE;

  SELECT COALESCE(
    (SELECT (ur.x_post_count + ur.linkedin_post_count + ur.instagram_story_count)
     FROM sns_pilot.usage_records ur
     WHERE ur.tenant_id = p_tenant_id AND ur.year_month = v_year_month),
    0
  ) INTO v_current;

  RETURN QUERY SELECT
    v_current,
    v_limit,
    v_tier,
    CASE WHEN v_limit = -1 THEN true WHEN v_current < v_limit THEN true ELSE false END,
    CASE WHEN v_limit = -1 THEN -1 ELSE GREATEST(v_limit - v_current, 0) END;
END;
$$;

-- =========================================================
-- 7. 使用量リセット関数
-- =========================================================

CREATE OR REPLACE FUNCTION sns_pilot.reset_usage(
  p_tenant_id uuid,
  p_year_month text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = sns_pilot, public, pg_temp
AS $$
DECLARE
  v_year_month text;
BEGIN
  v_year_month := COALESCE(p_year_month, to_char(now(), 'YYYY-MM'));
  UPDATE sns_pilot.usage_records
  SET x_post_count = 0, linkedin_post_count = 0, instagram_story_count = 0,
      total_prompt_tokens = 0, total_completion_tokens = 0,
      total_image_generations = 0, updated_at = now()
  WHERE tenant_id = p_tenant_id AND year_month = v_year_month;
END;
$$;

-- =========================================================
-- 8. Stripe関連関数
-- =========================================================

CREATE OR REPLACE FUNCTION sns_pilot.get_tenant_by_stripe_customer(
  p_stripe_customer_id text
)
RETURNS TABLE (
  id uuid,
  name text,
  subscription_tier text,
  subscription_status text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = sns_pilot, public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT t.id, t.name, t.subscription_tier, t.subscription_status
  FROM sns_pilot.tenants t
  WHERE t.stripe_customer_id = p_stripe_customer_id;
END;
$$;

CREATE OR REPLACE FUNCTION sns_pilot.update_stripe_subscription(
  p_stripe_customer_id text,
  p_stripe_subscription_id text DEFAULT NULL,
  p_stripe_price_id text DEFAULT NULL,
  p_subscription_tier text DEFAULT NULL,
  p_subscription_status text DEFAULT NULL,
  p_current_period_end timestamptz DEFAULT NULL,
  p_cancel_at_period_end boolean DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = sns_pilot, public, pg_temp
AS $$
DECLARE
  v_tenant_id uuid;
BEGIN
  SELECT id INTO v_tenant_id
  FROM sns_pilot.tenants
  WHERE stripe_customer_id = p_stripe_customer_id;

  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Tenant not found for Stripe customer: %', p_stripe_customer_id;
  END IF;

  UPDATE sns_pilot.tenants
  SET
    stripe_subscription_id = COALESCE(p_stripe_subscription_id, stripe_subscription_id),
    stripe_price_id = COALESCE(p_stripe_price_id, stripe_price_id),
    subscription_tier = COALESCE(p_subscription_tier, subscription_tier),
    subscription_status = COALESCE(p_subscription_status, subscription_status),
    subscription_current_period_end = COALESCE(p_current_period_end, subscription_current_period_end),
    subscription_cancel_at_period_end = COALESCE(p_cancel_at_period_end, subscription_cancel_at_period_end),
    updated_at = now()
  WHERE id = v_tenant_id;

  RETURN v_tenant_id;
END;
$$;

-- =========================================================
-- 9. APIキー認証関数
-- =========================================================

CREATE OR REPLACE FUNCTION sns_pilot.validate_api_key(
  p_key_hash text
)
RETURNS TABLE (
  tenant_id uuid,
  tenant_name text,
  subscription_tier text,
  subscription_status text,
  api_key_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = sns_pilot, public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id AS tenant_id,
    t.name AS tenant_name,
    t.subscription_tier,
    t.subscription_status,
    ak.id AS api_key_id
  FROM sns_pilot.api_keys ak
  JOIN sns_pilot.tenants t ON t.id = ak.tenant_id
  WHERE ak.key_hash = p_key_hash
    AND ak.is_active = true
    AND (ak.expires_at IS NULL OR ak.expires_at > now())
    AND t.subscription_status IN ('active', 'trialing');

  -- last_used_at を更新
  UPDATE sns_pilot.api_keys
  SET last_used_at = now()
  WHERE key_hash = p_key_hash;
END;
$$;

DO $$ BEGIN
  RAISE NOTICE '✅ Migration 20260219000000_create_sns_pilot.sql completed successfully';
END $$;
