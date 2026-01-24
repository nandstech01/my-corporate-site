/**
 * CLAVI SaaS - Stripe Webhook Handler
 *
 * @description
 * Stripeからのイベントを受信し、サブスクリプション状態を同期
 *
 * 対応イベント:
 * - checkout.session.completed: 新規契約完了
 * - customer.subscription.updated: プラン変更・更新
 * - customer.subscription.deleted: 解約
 * - invoice.paid: 支払い成功（使用量リセット）
 * - invoice.payment_failed: 支払い失敗
 *
 * @author NANDS SaaS開発チーム
 * @created 2026-01-18
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// ランタイムで初期化（ビルド時エラー回避）
let stripeInstance: Stripe | null = null;
let supabaseAdminInstance: SupabaseClient | null = null;

const getStripe = (): Stripe => {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeInstance;
};

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
      }
    );
  }
  return supabaseAdminInstance;
};

// Price ID から Tier へのマッピング
function priceIdToTier(priceId: string): string {
  const mapping: Record<string, string> = {
    [process.env.STRIPE_PRICE_STARTER!]: 'starter',
    [process.env.STRIPE_PRICE_PRO!]: 'pro',
    [process.env.STRIPE_PRICE_ENTERPRISE!]: 'enterprise',
  };
  return mapping[priceId] || 'starter';
}

// Stripe status から内部status へのマッピング
function mapSubscriptionStatus(stripeStatus: string): string {
  const mapping: Record<string, string> = {
    active: 'active',
    trialing: 'trialing',
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'unpaid',
    incomplete: 'past_due',
    incomplete_expired: 'canceled',
    paused: 'past_due',
  };
  return mapping[stripeStatus] || 'active';
}

/**
 * POST /api/clavi/stripe/webhook
 *
 * Stripe Webhookエンドポイント
 */
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('[Stripe Webhook] Missing signature');
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Stripe Webhook] Signature verification failed:', message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  console.log(`[Stripe Webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('[Stripe Webhook] Handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * checkout.session.completed ハンドラ
 *
 * 新規サブスクリプション契約完了時の処理
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('[Stripe Webhook] Checkout completed:', session.id);

  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!customerId || !subscriptionId) {
    console.error('[Stripe Webhook] Missing customer or subscription ID');
    return;
  }

  // サブスクリプション詳細を取得
  const stripe = getStripe();
  const subscriptionResponse = await stripe.subscriptions.retrieve(subscriptionId);
  // Stripe SDK v20+ の型定義に対応
  const subscriptionObj = subscriptionResponse as unknown as Record<string, unknown>;
  const items = subscriptionObj.items as { data?: Array<{ price?: { id?: string } }> } | undefined;
  const priceId = items?.data?.[0]?.price?.id || '';
  const tier = priceIdToTier(priceId);
  const rawPeriodEnd = subscriptionObj.current_period_end;
  const periodEnd = typeof rawPeriodEnd === 'number' ? rawPeriodEnd : Date.now() / 1000;
  const cancelAtPeriodEnd = Boolean(subscriptionObj.cancel_at_period_end);
  const subscriptionStatus = String(subscriptionObj.status || 'active');

  // テナント更新
  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin.rpc('update_stripe_subscription', {
    p_stripe_customer_id: customerId,
    p_stripe_subscription_id: subscriptionId,
    p_stripe_price_id: priceId,
    p_subscription_tier: tier,
    p_subscription_status: mapSubscriptionStatus(subscriptionStatus),
    p_current_period_end: new Date(periodEnd * 1000).toISOString(),
    p_cancel_at_period_end: cancelAtPeriodEnd,
  });

  if (error) {
    console.error('[Stripe Webhook] Failed to update tenant:', error);
    throw error;
  }

  console.log(`[Stripe Webhook] Tenant updated: tier=${tier}, status=${subscriptionStatus}`);
}

/**
 * customer.subscription.updated ハンドラ
 *
 * プラン変更・更新・キャンセル予定時の処理
 */
async function handleSubscriptionUpdated(subscriptionData: Stripe.Subscription) {
  const subscriptionObj = subscriptionData as unknown as Record<string, unknown>;
  const subscriptionId = String(subscriptionObj.id || '');
  console.log('[Stripe Webhook] Subscription updated:', subscriptionId);

  const customerId = String(subscriptionObj.customer || '');
  const items = subscriptionObj.items as { data?: Array<{ price?: { id?: string } }> } | undefined;
  const priceId = items?.data?.[0]?.price?.id || '';
  const tier = priceIdToTier(priceId);
  const rawPeriodEnd = subscriptionObj.current_period_end;
  const periodEnd = typeof rawPeriodEnd === 'number' ? rawPeriodEnd : Date.now() / 1000;
  const cancelAtPeriodEnd = Boolean(subscriptionObj.cancel_at_period_end);
  const subscriptionStatus = String(subscriptionObj.status || 'active');

  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin.rpc('update_stripe_subscription', {
    p_stripe_customer_id: customerId,
    p_stripe_subscription_id: subscriptionId,
    p_stripe_price_id: priceId,
    p_subscription_tier: tier,
    p_subscription_status: mapSubscriptionStatus(subscriptionStatus),
    p_current_period_end: new Date(periodEnd * 1000).toISOString(),
    p_cancel_at_period_end: cancelAtPeriodEnd,
  });

  if (error) {
    console.error('[Stripe Webhook] Failed to update subscription:', error);
    throw error;
  }

  console.log(`[Stripe Webhook] Subscription updated: tier=${tier}, cancel_at_period_end=${cancelAtPeriodEnd}`);
}

/**
 * customer.subscription.deleted ハンドラ
 *
 * サブスクリプション完全キャンセル時の処理
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('[Stripe Webhook] Subscription deleted:', subscription.id);

  const customerId = subscription.customer as string;

  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin.rpc('update_stripe_subscription', {
    p_stripe_customer_id: customerId,
    p_subscription_status: 'canceled',
    p_cancel_at_period_end: false,
  });

  if (error) {
    console.error('[Stripe Webhook] Failed to cancel subscription:', error);
    throw error;
  }

  console.log('[Stripe Webhook] Subscription canceled');
}

/**
 * invoice.paid ハンドラ
 *
 * 支払い成功時の処理（使用量リセット含む）
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log('[Stripe Webhook] Invoice paid:', invoice.id);

  // サブスクリプション請求書のみ処理
  const invoiceObj = invoice as unknown as Record<string, unknown>;
  const subscriptionId = invoiceObj.subscription as string | null;
  if (!subscriptionId) {
    return;
  }

  const customerId = String(invoiceObj.customer || '');
  const stripe = getStripe();
  const subscriptionResponse = await stripe.subscriptions.retrieve(subscriptionId);
  const subscriptionObj = subscriptionResponse as unknown as Record<string, unknown>;
  const rawPeriodEnd = subscriptionObj.current_period_end;
  const periodEnd = typeof rawPeriodEnd === 'number' ? rawPeriodEnd : Date.now() / 1000;

  // period_end を更新
  const supabaseAdmin = getSupabaseAdmin();
  const { data: tenant, error: tenantError } = await supabaseAdmin
    .rpc('get_tenant_by_stripe_customer', { p_stripe_customer_id: customerId });

  if (tenantError || !tenant || tenant.length === 0) {
    console.error('[Stripe Webhook] Tenant not found for customer:', customerId);
    return;
  }

  const tenantId = tenant[0].id;

  // サブスクリプション情報更新
  await supabaseAdmin.rpc('update_stripe_subscription', {
    p_stripe_customer_id: customerId,
    p_current_period_end: new Date(periodEnd * 1000).toISOString(),
    p_subscription_status: 'active',
  });

  // 使用量リセット（新しい請求期間開始）
  const yearMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  await supabaseAdmin.rpc('reset_usage', {
    p_tenant_id: tenantId,
    p_year_month: yearMonth,
  });

  console.log(`[Stripe Webhook] Invoice paid, usage reset for tenant: ${tenantId}`);
}

/**
 * invoice.payment_failed ハンドラ
 *
 * 支払い失敗時の処理
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('[Stripe Webhook] Invoice payment failed:', invoice.id);

  const invoiceObj = invoice as unknown as Record<string, unknown>;
  const subscriptionId = invoiceObj.subscription as string | null;
  if (!subscriptionId) {
    return;
  }

  const customerId = String(invoiceObj.customer || '');

  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin.rpc('update_stripe_subscription', {
    p_stripe_customer_id: customerId,
    p_subscription_status: 'past_due',
  });

  if (error) {
    console.error('[Stripe Webhook] Failed to update status to past_due:', error);
    throw error;
  }

  console.log('[Stripe Webhook] Subscription marked as past_due');
}

// Next.js App Router: Body parsingを無効化（Stripe署名検証のため）
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
