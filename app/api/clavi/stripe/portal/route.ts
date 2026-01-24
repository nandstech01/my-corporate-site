/**
 * CLAVI SaaS - Stripe Customer Portal API
 *
 * @description
 * StripeカスタマーポータルセッションURLを返す
 * 顧客が自身の支払い方法・サブスクリプションを管理
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

/**
 * POST /api/clavi/stripe/portal
 *
 * Stripeカスタマーポータルセッションを作成
 *
 * @returns { url: string } ポータルページURL
 */
export async function POST() {
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
    const { data: context } = await supabase
      .rpc('get_current_tenant_context');

    let tenant_id: string | null = context?.tenant_id || null;

    if (!tenant_id) {
      const { data: membership } = await supabase
        .rpc('get_user_tenant_by_id', { p_user_id: user.id })
        .single<{ tenant_id: string; role: string }>();

      tenant_id = membership?.tenant_id || null;
    }

    if (!tenant_id) {
      return NextResponse.json(
        { error: 'No tenant context' },
        { status: 403 }
      );
    }

    // 3. テナント情報取得
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('stripe_customer_id')
      .eq('id', tenant_id)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    if (!tenant.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No Stripe customer found. Please subscribe first.' },
        { status: 400 }
      );
    }

    // 4. Portalセッション作成
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const stripe = getStripe();

    const session = await stripe.billingPortal.sessions.create({
      customer: tenant.stripe_customer_id,
      return_url: `${baseUrl}/clavi/subscription`,
    });

    return NextResponse.json({
      url: session.url,
    });

  } catch (error) {
    console.error('[Stripe Portal] Error:', error);

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
