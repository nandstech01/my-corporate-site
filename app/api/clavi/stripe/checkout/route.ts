/**
 * CLAVI SaaS - Stripe Checkout API
 *
 * @description
 * Stripeチェックアウトセッションを作成し、決済ページへのURLを返す
 *
 * @author NANDS SaaS開発チーム
 * @created 2026-01-18
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// ランタイムで初期化（ビルド時エラー回避）
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

// Price ID マッピング
const PRICE_IDS: Record<string, string | undefined> = {
  starter: process.env.STRIPE_PRICE_STARTER,
  pro: process.env.STRIPE_PRICE_PRO,
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE,
};

interface CheckoutRequest {
  priceId?: string;
  tier?: 'starter' | 'pro' | 'enterprise';
}

/**
 * POST /api/clavi/stripe/checkout
 *
 * Stripeチェックアウトセッションを作成
 *
 * @body { priceId?: string, tier?: 'starter' | 'pro' | 'enterprise' }
 * @returns { url: string } チェックアウトページURL
 */
export async function POST(request: Request) {
  try {
    // 1. 認証確認
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. テナントコンテキスト取得
    const { data: context, error: contextError } = await supabase
      .rpc('get_current_tenant_context');

    let tenant_id: string | null = context?.tenant_id || null;

    if (!tenant_id) {
      // Fallback: user_id から取得
      const { data: membership } = await supabase
        .rpc('get_user_tenant_by_id', { p_user_id: user.id })
        .single<{ tenant_id: string; role: string }>();

      tenant_id = membership?.tenant_id || null;
    }

    if (!tenant_id) {
      return NextResponse.json(
        { error: 'No tenant context. Please onboard first.' },
        { status: 403 }
      );
    }

    // 3. テナント情報取得
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, name, stripe_customer_id, subscription_tier, subscription_status')
      .eq('id', tenant_id)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // 4. リクエストボディ取得
    const body: CheckoutRequest = await request.json();
    let priceId = body.priceId;

    // tierが指定された場合、Price IDに変換
    if (body.tier && !priceId) {
      priceId = PRICE_IDS[body.tier];
    }

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID or tier is required' },
        { status: 400 }
      );
    }

    // 5. Stripe Customer 取得または作成
    const stripe = getStripe();
    let customerId = tenant.stripe_customer_id;

    if (!customerId) {
      // 新規Customer作成
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          tenant_id: tenant_id,
          tenant_name: tenant.name,
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;

      // Supabaseに保存
      await supabase
        .from('tenants')
        .update({ stripe_customer_id: customerId })
        .eq('id', tenant_id);
    }

    // 6. Checkoutセッション作成
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/clavi/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/clavi/pricing`,
      metadata: {
        tenant_id: tenant_id,
        tenant_name: tenant.name,
      },
      subscription_data: {
        metadata: {
          tenant_id: tenant_id,
          tenant_name: tenant.name,
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
      // 税金の自動計算（オプション）
      // automatic_tax: { enabled: true },
    });

    return NextResponse.json({
      url: session.url,
      session_id: session.id,
    });

  } catch (error) {
    console.error('[Stripe Checkout] Error:', error);

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
