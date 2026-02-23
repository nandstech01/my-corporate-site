/**
 * SNS Pilot SaaS - Tenant Registration
 *
 * 新規テナント登録 + APIキー発行
 * Free tierでの登録（Stripe不要）
 */

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { generateApiKey } from '@/lib/sns-pilot/auth'

const RegisterSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
})

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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = RegisterSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { name, email } = parsed.data
    const supabase = getSupabaseAdmin()

    // メール重複チェック
    const { data: existing } = await supabase
      .from('tenants')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 },
      )
    }

    // テナント作成（Free tier）
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name,
        email,
        subscription_tier: 'free',
        subscription_status: 'active',
      })
      .select('id, name, email, subscription_tier')
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json(
        { success: false, error: 'Failed to create tenant' },
        { status: 500 },
      )
    }

    // APIキー発行
    const { raw, hash, prefix } = generateApiKey()

    const { error: keyError } = await supabase
      .from('api_keys')
      .insert({
        tenant_id: tenant.id,
        key_hash: hash,
        key_prefix: prefix,
        name: 'Default API Key',
      })

    if (keyError) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate API key' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        tenant_id: tenant.id,
        name: tenant.name,
        email: tenant.email,
        tier: tenant.subscription_tier,
        api_key: raw,
        api_key_prefix: prefix,
        note: 'Store your API key securely. It will not be shown again.',
      },
    }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    )
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
