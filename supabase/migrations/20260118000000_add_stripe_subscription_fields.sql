-- ============================================
-- Phase 7: Stripe課金統合
-- ============================================
-- 作成日: 2026-01-18
-- 目的:
-- - Stripeサブスクリプション管理に必要なカラムを追加
-- - 使用量追跡テーブルと関数を作成
--
-- 依存: 20250109000000_create_clavi_core.sql

-- =========================================================
-- 1. clavi.tenants に Stripe関連カラムを追加
-- =========================================================

-- stripe_subscription_id: StripeサブスクリプションID
ALTER TABLE clavi.tenants
ADD COLUMN IF NOT EXISTS stripe_subscription_id text UNIQUE;

-- stripe_price_id: 現在の価格ID
ALTER TABLE clavi.tenants
ADD COLUMN IF NOT EXISTS stripe_price_id text;

-- subscription_current_period_end: 請求期間終了日
ALTER TABLE clavi.tenants
ADD COLUMN IF NOT EXISTS subscription_current_period_end timestamptz;

-- subscription_cancel_at_period_end: 期間終了時キャンセル予定フラグ
ALTER TABLE clavi.tenants
ADD COLUMN IF NOT EXISTS subscription_cancel_at_period_end boolean NOT NULL DEFAULT false;

-- インデックス追加（Webhook検索用）
CREATE INDEX IF NOT EXISTS idx_tenants_stripe_subscription_id
ON clavi.tenants (stripe_subscription_id)
WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tenants_stripe_customer_id
ON clavi.tenants (stripe_customer_id)
WHERE stripe_customer_id IS NOT NULL;

-- =========================================================
-- 2. 使用量追跡テーブル: clavi.usage_records
-- =========================================================

CREATE TABLE IF NOT EXISTS clavi.usage_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES clavi.tenants(id) ON DELETE CASCADE,
  year_month text NOT NULL,  -- YYYY-MM形式
  url_analysis_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT usage_records_unique_tenant_month UNIQUE (tenant_id, year_month),
  CONSTRAINT usage_records_year_month_format CHECK (year_month ~ '^\d{4}-\d{2}$')
);

-- updated_at自動更新トリガー
DROP TRIGGER IF EXISTS trg_usage_records_set_updated_at ON clavi.usage_records;
CREATE TRIGGER trg_usage_records_set_updated_at
BEFORE UPDATE ON clavi.usage_records
FOR EACH ROW EXECUTE FUNCTION clavi.set_updated_at();

-- RLS設定
ALTER TABLE clavi.usage_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS usage_records_select ON clavi.usage_records;
CREATE POLICY usage_records_select
ON clavi.usage_records FOR SELECT TO authenticated
USING (tenant_id = clavi.current_tenant_id());

-- =========================================================
-- 3. 使用量インクリメント関数
-- =========================================================

CREATE OR REPLACE FUNCTION clavi.increment_usage(
  p_tenant_id uuid,
  p_year_month text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = clavi, public, pg_temp
AS $$
DECLARE
  v_year_month text;
  v_new_count integer;
BEGIN
  -- デフォルトは現在の年月
  v_year_month := COALESCE(p_year_month, to_char(now(), 'YYYY-MM'));

  -- UPSERT: 存在しなければINSERT、存在すればUPDATE
  INSERT INTO clavi.usage_records (tenant_id, year_month, url_analysis_count)
  VALUES (p_tenant_id, v_year_month, 1)
  ON CONFLICT (tenant_id, year_month)
  DO UPDATE SET
    url_analysis_count = clavi.usage_records.url_analysis_count + 1,
    updated_at = now()
  RETURNING url_analysis_count INTO v_new_count;

  RETURN v_new_count;
END;
$$;

-- =========================================================
-- 4. 使用量制限チェック関数
-- =========================================================

CREATE OR REPLACE FUNCTION clavi.check_usage_limit(
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
SET search_path = clavi, public, pg_temp
AS $$
DECLARE
  v_year_month text;
  v_current_usage integer;
  v_usage_limit integer;
  v_tier text;
BEGIN
  -- デフォルトは現在の年月
  v_year_month := COALESCE(p_year_month, to_char(now(), 'YYYY-MM'));

  -- テナントのtierを取得
  SELECT subscription_tier INTO v_tier
  FROM clavi.tenants
  WHERE id = p_tenant_id;

  -- tier未取得の場合
  IF v_tier IS NULL THEN
    RAISE EXCEPTION 'Tenant not found: %', p_tenant_id;
  END IF;

  -- tierに基づく制限値を設定
  CASE v_tier
    WHEN 'starter' THEN v_usage_limit := 50;
    WHEN 'pro' THEN v_usage_limit := 500;
    WHEN 'enterprise' THEN v_usage_limit := -1;  -- 無制限
    ELSE v_usage_limit := 50;  -- デフォルト
  END CASE;

  -- 現在の使用量を取得
  SELECT COALESCE(ur.url_analysis_count, 0) INTO v_current_usage
  FROM clavi.usage_records ur
  WHERE ur.tenant_id = p_tenant_id AND ur.year_month = v_year_month;

  -- レコードが存在しない場合は0
  v_current_usage := COALESCE(v_current_usage, 0);

  -- 結果を返す
  RETURN QUERY SELECT
    v_current_usage AS current_usage,
    v_usage_limit AS usage_limit,
    v_tier AS tier,
    CASE
      WHEN v_usage_limit = -1 THEN true  -- 無制限
      WHEN v_current_usage < v_usage_limit THEN true
      ELSE false
    END AS is_allowed,
    CASE
      WHEN v_usage_limit = -1 THEN -1  -- 無制限
      ELSE GREATEST(v_usage_limit - v_current_usage, 0)
    END AS remaining;
END;
$$;

-- =========================================================
-- 5. 月次使用量リセット関数（Webhook invoice.paid で使用）
-- =========================================================

CREATE OR REPLACE FUNCTION clavi.reset_usage(
  p_tenant_id uuid,
  p_year_month text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = clavi, public, pg_temp
AS $$
DECLARE
  v_year_month text;
BEGIN
  -- デフォルトは現在の年月
  v_year_month := COALESCE(p_year_month, to_char(now(), 'YYYY-MM'));

  -- 使用量を0にリセット（レコードがあれば更新、なければ何もしない）
  UPDATE clavi.usage_records
  SET url_analysis_count = 0, updated_at = now()
  WHERE tenant_id = p_tenant_id AND year_month = v_year_month;
END;
$$;

-- =========================================================
-- 6. Stripe顧客ID検索用関数（Webhook用）
-- =========================================================

CREATE OR REPLACE FUNCTION clavi.get_tenant_by_stripe_customer(
  p_stripe_customer_id text
)
RETURNS TABLE (
  id uuid,
  name text,
  subscription_tier text,
  subscription_status text,
  stripe_subscription_id text,
  stripe_price_id text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = clavi, public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.name,
    t.subscription_tier,
    t.subscription_status,
    t.stripe_subscription_id,
    t.stripe_price_id
  FROM clavi.tenants t
  WHERE t.stripe_customer_id = p_stripe_customer_id;
END;
$$;

-- =========================================================
-- 7. Stripeサブスクリプション更新関数（Webhook用）
-- =========================================================

CREATE OR REPLACE FUNCTION clavi.update_stripe_subscription(
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
SET search_path = clavi, public, pg_temp
AS $$
DECLARE
  v_tenant_id uuid;
BEGIN
  -- テナントIDを取得
  SELECT id INTO v_tenant_id
  FROM clavi.tenants
  WHERE stripe_customer_id = p_stripe_customer_id;

  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Tenant not found for Stripe customer: %', p_stripe_customer_id;
  END IF;

  -- 更新（NULLでない値のみ更新）
  UPDATE clavi.tenants
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
-- 8. Price IDからTier名へのマッピング関数
-- =========================================================

CREATE OR REPLACE FUNCTION clavi.price_id_to_tier(
  p_price_id text
)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- 環境変数を参照できないため、プレフィックスでマッチング
  -- 実際のPrice IDは実行時に設定される
  CASE
    -- Starterプラン
    WHEN p_price_id LIKE '%starter%' OR p_price_id LIKE '%29800%' THEN
      RETURN 'starter';
    -- Proプラン
    WHEN p_price_id LIKE '%pro%' OR p_price_id LIKE '%98000%' THEN
      RETURN 'pro';
    -- Enterpriseプラン
    WHEN p_price_id LIKE '%enterprise%' OR p_price_id LIKE '%298000%' THEN
      RETURN 'enterprise';
    ELSE
      -- デフォルトはstarter
      RETURN 'starter';
  END CASE;
END;
$$;

-- =========================================================
-- 9. 公開RPC（認証ユーザー用）
-- =========================================================

-- 使用量取得（自分のテナント用）
CREATE OR REPLACE FUNCTION public.get_my_usage()
RETURNS TABLE (
  current_usage integer,
  usage_limit integer,
  tier text,
  is_allowed boolean,
  remaining integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = clavi, public, pg_temp
AS $$
DECLARE
  v_tenant_id uuid;
BEGIN
  -- JWT claimからテナントID取得
  v_tenant_id := clavi.current_tenant_id();

  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'No tenant context';
  END IF;

  RETURN QUERY SELECT * FROM clavi.check_usage_limit(v_tenant_id);
END;
$$;

-- サブスクリプション情報取得（自分のテナント用）
CREATE OR REPLACE FUNCTION public.get_my_subscription()
RETURNS TABLE (
  tenant_id uuid,
  tenant_name text,
  subscription_tier text,
  subscription_status text,
  stripe_subscription_id text,
  stripe_price_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean,
  current_usage integer,
  usage_limit integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = clavi, public, pg_temp
AS $$
DECLARE
  v_tenant_id uuid;
  v_year_month text;
BEGIN
  -- JWT claimからテナントID取得
  v_tenant_id := clavi.current_tenant_id();

  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'No tenant context';
  END IF;

  v_year_month := to_char(now(), 'YYYY-MM');

  RETURN QUERY
  SELECT
    t.id AS tenant_id,
    t.name AS tenant_name,
    t.subscription_tier,
    t.subscription_status,
    t.stripe_subscription_id,
    t.stripe_price_id,
    t.subscription_current_period_end AS current_period_end,
    t.subscription_cancel_at_period_end AS cancel_at_period_end,
    COALESCE(ur.url_analysis_count, 0) AS current_usage,
    CASE t.subscription_tier
      WHEN 'starter' THEN 50
      WHEN 'pro' THEN 500
      WHEN 'enterprise' THEN -1
      ELSE 50
    END AS usage_limit
  FROM clavi.tenants t
  LEFT JOIN clavi.usage_records ur ON ur.tenant_id = t.id AND ur.year_month = v_year_month
  WHERE t.id = v_tenant_id;
END;
$$;

DO $$ BEGIN
  RAISE NOTICE '✅ Migration 20260118000000_add_stripe_subscription_fields.sql completed successfully';
END $$;
