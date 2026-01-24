/**
 * CLAVI SaaS - Subscription Status API
 *
 * @description
 * 現在のサブスクリプション状態と使用量を取得
 *
 * @author NANDS SaaS開発チーム
 * @created 2026-01-18
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore setAll errors from Server Components
          }
        },
      },
    }
  );
}

// RPC戻り値の型定義
interface SubscriptionRPCResult {
  tenant_id: string;
  tenant_name: string;
  subscription_tier: string;
  subscription_status: string;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  current_usage: number;
  usage_limit: number;
}

/**
 * GET /api/clavi/stripe/subscription
 *
 * 現在のサブスクリプション情報を取得
 */
export async function GET() {
  try {
    // 1. 認証確認
    const supabase = await createSupabaseServerClient();
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

    // 3. サブスクリプション情報取得（RPC使用）
    const { data: subscription, error: subError } = await supabase
      .rpc('get_my_subscription')
      .single<SubscriptionRPCResult>();

    if (subError) {
      console.error('[Subscription] RPC error:', subError);

      // Fallback: 直接テナント情報を取得
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select(`
          id,
          name,
          subscription_tier,
          subscription_status,
          stripe_subscription_id,
          stripe_price_id,
          subscription_current_period_end,
          subscription_cancel_at_period_end
        `)
        .eq('id', tenant_id)
        .single();

      if (tenantError || !tenant) {
        return NextResponse.json(
          { error: 'Tenant not found' },
          { status: 404 }
        );
      }

      // 使用量取得
      const yearMonth = new Date().toISOString().slice(0, 7);
      const { data: usage } = await supabase
        .from('usage_records')
        .select('url_analysis_count')
        .eq('tenant_id', tenant_id)
        .eq('year_month', yearMonth)
        .single();

      const usageLimit = tenant.subscription_tier === 'starter' ? 50
        : tenant.subscription_tier === 'pro' ? 500
        : -1; // enterprise = unlimited

      return NextResponse.json({
        subscription: {
          tenant_id: tenant.id,
          tenant_name: tenant.name,
          tier: tenant.subscription_tier,
          status: tenant.subscription_status,
          stripe_subscription_id: tenant.stripe_subscription_id,
          stripe_price_id: tenant.stripe_price_id,
          current_period_end: tenant.subscription_current_period_end,
          cancel_at_period_end: tenant.subscription_cancel_at_period_end,
        },
        usage: {
          current: usage?.url_analysis_count || 0,
          limit: usageLimit,
          remaining: usageLimit === -1 ? -1 : Math.max(usageLimit - (usage?.url_analysis_count || 0), 0),
        },
      });
    }

    // RPCからのデータを整形
    return NextResponse.json({
      subscription: {
        tenant_id: subscription.tenant_id,
        tenant_name: subscription.tenant_name,
        tier: subscription.subscription_tier,
        status: subscription.subscription_status,
        stripe_subscription_id: subscription.stripe_subscription_id,
        stripe_price_id: subscription.stripe_price_id,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
      },
      usage: {
        current: subscription.current_usage,
        limit: subscription.usage_limit,
        remaining: subscription.usage_limit === -1
          ? -1
          : Math.max(subscription.usage_limit - subscription.current_usage, 0),
      },
    });

  } catch (error) {
    console.error('[Subscription] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
