/**
 * SNS Pilot SaaS - Stripe Checkout API
 *
 * @description
 * Stripeチェックアウトセッションを作成し、決済ページへのURLを返す
 * SNS Pilotは公開サインアップエンドポイントのため、cookie認証不要
 * APIキー認証前の新規登録フローで使用
 *
 * @author NANDS SaaS開発チーム
 * @created 2026-02-19
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ランタイムで初期化（ビルド時エラー回避）
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

let supabaseAdminInstance: SupabaseClient | null = null;

const getSupabaseAdmin = (): SupabaseClient => {
  if (!supabaseAdminInstance) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase environment variables are not configured');
    }
    supabaseAdminInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        db: { schema: 'sns_pilot' },
      }
    );
  }
  return supabaseAdminInstance;
};

// リクエストバリデーションスキーマ
const checkoutRequestSchema = z.object({
  email: z.string().email('Valid email is required'),
  tier: z.enum(['starter', 'pro', 'enterprise']),
  billing_period: z.enum(['monthly', 'annual']).optional().default('monthly'),
});

// Price ID マッピング（月額）
const MONTHLY_PRICE_IDS: Record<string, string | undefined> = {
  starter: process.env.SNS_PILOT_STRIPE_PRICE_STARTER,
  pro: process.env.SNS_PILOT_STRIPE_PRICE_PRO,
  enterprise: process.env.SNS_PILOT_STRIPE_PRICE_ENTERPRISE,
};

// Price ID マッピング（年額）
const ANNUAL_PRICE_IDS: Record<string, string | undefined> = {
  starter: process.env.SNS_PILOT_STRIPE_PRICE_STARTER_ANNUAL,
  pro: process.env.SNS_PILOT_STRIPE_PRICE_PRO_ANNUAL,
  enterprise: process.env.SNS_PILOT_STRIPE_PRICE_ENTERPRISE_ANNUAL,
};

/**
 * POST /api/sns-pilot/stripe/checkout
 *
 * Stripeチェックアウトセッションを作成（新規サインアップ用）
 *
 * @body { email: string, tier: 'starter' | 'pro' | 'enterprise', billing_period?: 'monthly' | 'annual' }
 * @returns { url: string, session_id: string } チェックアウトページURL
 */
export async function POST(request: Request) {
  try {
    // 1. リクエストバリデーション
    const rawBody = await request.json();
    const parseResult = checkoutRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, tier, billing_period } = parseResult.data;

    // 2. Price ID の解決
    const priceIds = billing_period === 'annual' ? ANNUAL_PRICE_IDS : MONTHLY_PRICE_IDS;
    const priceId = priceIds[tier];

    if (!priceId) {
      return NextResponse.json(
        { error: `Price not configured for tier: ${tier} (${billing_period})` },
        { status: 400 }
      );
    }

    // 3. 既存テナント確認 & Stripe Customer 取得または作成
    const stripe = getStripe();
    const supabaseAdmin = getSupabaseAdmin();

    // メールアドレスで既存テナントを検索
    const { data: existingTenants } = await supabaseAdmin
      .from('tenants')
      .select('id, name, stripe_customer_id, subscription_status')
      .eq('email', email)
      .limit(1);

    let customerId: string | null = null;
    let tenantId: string | null = null;

    if (existingTenants && existingTenants.length > 0) {
      const existing = existingTenants[0];
      customerId = existing.stripe_customer_id;
      tenantId = existing.id;
    }

    if (!customerId) {
      // 新規 Stripe Customer 作成
      const customer = await stripe.customers.create({
        email,
        metadata: {
          ...(tenantId ? { tenant_id: tenantId } : {}),
          product: 'sns_pilot',
        },
      });
      customerId = customer.id;

      // 既存テナントがあれば stripe_customer_id を更新
      if (tenantId) {
        await supabaseAdmin
          .from('tenants')
          .update({ stripe_customer_id: customerId })
          .eq('id', tenantId);
      }
    }

    // 4. Checkoutセッション作成
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/sns-pilot/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/sns-pilot/pricing`,
      metadata: {
        product: 'sns_pilot',
        email,
        tier,
        billing_period,
        ...(tenantId ? { tenant_id: tenantId } : {}),
      },
      subscription_data: {
        metadata: {
          product: 'sns_pilot',
          email,
          tier,
          ...(tenantId ? { tenant_id: tenantId } : {}),
        },
      },
      // 日本円設定
      currency: 'jpy',
      // カスタマーのメール確認を許可
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
      billing_address_collection: 'required',
    };

    // Starter プランには14日間のトライアル期間を付与
    if (tier === 'starter') {
      sessionParams.subscription_data = {
        ...sessionParams.subscription_data,
        trial_period_days: 14,
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({
      url: session.url,
      session_id: session.id,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
