/**
 * SNS Pilot SaaS - API Key Authentication
 *
 * Bearer token認証でテナントを特定し、使用量制限をチェック
 */

import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'
import { NextResponse } from 'next/server'
import { isPlatformAllowed, type SnsPilotPlatform, type SnsPilotTier } from './config'

export interface TenantContext {
  tenantId: string
  tenantName: string
  tier: SnsPilotTier
  status: string
  apiKeyId: string
}

interface UsageCheck {
  current_usage: number
  usage_limit: number
  tier: string
  is_allowed: boolean
  remaining: number
}

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

export function hashApiKey(rawKey: string): string {
  return createHash('sha256').update(rawKey).digest('hex')
}

export function generateApiKey(): { raw: string; hash: string; prefix: string } {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  const raw = `snsp_${Buffer.from(bytes).toString('base64url')}`
  const hash = hashApiKey(raw)
  const prefix = raw.slice(0, 12)
  return { raw, hash, prefix }
}

export async function authenticateRequest(
  request: Request,
): Promise<{ context: TenantContext } | { error: NextResponse }> {
  const authHeader = request.headers.get('authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return {
      error: NextResponse.json(
        { error: 'Missing or invalid Authorization header. Use: Bearer <api_key>' },
        { status: 401 },
      ),
    }
  }

  const rawKey = authHeader.slice(7)
  if (!rawKey.startsWith('snsp_')) {
    return {
      error: NextResponse.json(
        { error: 'Invalid API key format' },
        { status: 401 },
      ),
    }
  }

  const keyHash = hashApiKey(rawKey)
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase.rpc('validate_api_key', {
    p_key_hash: keyHash,
  })

  if (error || !data || data.length === 0) {
    return {
      error: NextResponse.json(
        { error: 'Invalid or expired API key' },
        { status: 401 },
      ),
    }
  }

  const row = data[0]
  return {
    context: {
      tenantId: row.tenant_id,
      tenantName: row.tenant_name,
      tier: row.subscription_tier as SnsPilotTier,
      status: row.subscription_status,
      apiKeyId: row.api_key_id,
    },
  }
}

export async function checkUsageAndPlatform(
  tenantId: string,
  tier: SnsPilotTier,
  platform: SnsPilotPlatform,
): Promise<{ allowed: true; usage: UsageCheck } | { allowed: false; error: NextResponse }> {
  if (!isPlatformAllowed(tier, platform)) {
    return {
      allowed: false,
      error: NextResponse.json(
        {
          error: `Platform "${platform}" is not available on the ${tier} plan`,
          upgrade_url: '/sns-pilot/pricing',
        },
        { status: 403 },
      ),
    }
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.rpc('check_usage_limit', {
    p_tenant_id: tenantId,
  })

  if (error || !data || data.length === 0) {
    return {
      allowed: false,
      error: NextResponse.json(
        { error: 'Failed to check usage limits' },
        { status: 500 },
      ),
    }
  }

  const usage = data[0] as UsageCheck

  if (!usage.is_allowed) {
    return {
      allowed: false,
      error: NextResponse.json(
        {
          error: 'Monthly post limit reached',
          current_usage: usage.current_usage,
          usage_limit: usage.usage_limit,
          tier: usage.tier,
          upgrade_url: '/sns-pilot/pricing',
        },
        { status: 429 },
      ),
    }
  }

  return { allowed: true, usage }
}

export async function recordUsage(
  tenantId: string,
  platform: SnsPilotPlatform,
  promptTokens: number,
  completionTokens: number,
  imageGenerations: number = 0,
): Promise<number> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.rpc('increment_usage', {
    p_tenant_id: tenantId,
    p_platform: platform,
    p_prompt_tokens: promptTokens,
    p_completion_tokens: completionTokens,
    p_image_generations: imageGenerations,
  })

  if (error) {
    throw new Error(`Failed to record usage: ${error.message}`)
  }

  return data as number
}

export async function recordPostHistory(
  tenantId: string,
  platform: SnsPilotPlatform,
  postContent: string,
  patternUsed: string,
  tags: string[],
  scores: unknown,
  allCandidates: string[],
  promptTokens: number,
  completionTokens: number,
  inputData: unknown,
): Promise<string> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('post_history')
    .insert({
      tenant_id: tenantId,
      platform,
      post_content: postContent,
      pattern_used: patternUsed,
      tags,
      scores,
      all_candidates: allCandidates,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      input_data: inputData,
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(`Failed to record post history: ${error.message}`)
  }

  return data.id
}
