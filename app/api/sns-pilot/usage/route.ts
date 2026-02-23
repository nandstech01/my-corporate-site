/**
 * SNS Pilot SaaS - Usage & Subscription Info
 *
 * GET: 現在の使用量とサブスクリプション情報を返す
 */

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/sns-pilot/auth'
import { SNS_PILOT_TIERS, type SnsPilotTier } from '@/lib/sns-pilot/config'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Supabase environment variables not configured')
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: 'sns_pilot' },
  })
}

export async function GET(request: Request) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return auth.error

  const supabase = getSupabaseAdmin()
  const yearMonth = new Date().toISOString().slice(0, 7)

  const [tenantResult, usageResult] = await Promise.all([
    supabase
      .from('tenants')
      .select('id, name, email, subscription_tier, subscription_status, subscription_current_period_end, subscription_cancel_at_period_end')
      .eq('id', auth.context.tenantId)
      .single(),
    supabase
      .from('usage_records')
      .select('x_post_count, linkedin_post_count, instagram_story_count, total_prompt_tokens, total_completion_tokens, total_image_generations')
      .eq('tenant_id', auth.context.tenantId)
      .eq('year_month', yearMonth)
      .maybeSingle(),
  ])

  if (tenantResult.error || !tenantResult.data) {
    return NextResponse.json(
      { success: false, error: 'Tenant not found' },
      { status: 404 },
    )
  }

  const tenant = tenantResult.data
  const tier = tenant.subscription_tier as SnsPilotTier
  const tierConfig = SNS_PILOT_TIERS[tier] ?? SNS_PILOT_TIERS.free

  const usage = usageResult.data ?? {
    x_post_count: 0,
    linkedin_post_count: 0,
    instagram_story_count: 0,
    total_prompt_tokens: 0,
    total_completion_tokens: 0,
    total_image_generations: 0,
  }

  const totalPosts = usage.x_post_count + usage.linkedin_post_count + usage.instagram_story_count

  return NextResponse.json({
    success: true,
    data: {
      subscription: {
        tier: tenant.subscription_tier,
        status: tenant.subscription_status,
        current_period_end: tenant.subscription_current_period_end,
        cancel_at_period_end: tenant.subscription_cancel_at_period_end,
        platforms: tierConfig.platforms,
        ai_model: tierConfig.aiModel,
      },
      usage: {
        period: yearMonth,
        posts: {
          x: usage.x_post_count,
          linkedin: usage.linkedin_post_count,
          instagram: usage.instagram_story_count,
          total: totalPosts,
          limit: tierConfig.monthlyPostLimit,
          remaining: tierConfig.monthlyPostLimit === -1
            ? -1
            : Math.max(tierConfig.monthlyPostLimit - totalPosts, 0),
        },
        tokens: {
          prompt: usage.total_prompt_tokens,
          completion: usage.total_completion_tokens,
        },
        image_generations: usage.total_image_generations,
      },
    },
  })
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
