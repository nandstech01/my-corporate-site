/**
 * SNS Pilot SaaS - API Key Management
 *
 * GET: キー一覧（prefix + metadata のみ返す）
 * POST: 新規キー発行
 * DELETE: キー無効化
 */

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateRequest, generateApiKey } from '@/lib/sns-pilot/auth'

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

/**
 * GET /api/sns-pilot/keys
 * テナントのAPIキー一覧を返す
 */
export async function GET(request: Request) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return auth.error

  const supabase = getSupabaseAdmin()
  const { data: keys, error } = await supabase
    .from('api_keys')
    .select('id, key_prefix, name, is_active, last_used_at, expires_at, created_at')
    .eq('tenant_id', auth.context.tenantId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch API keys' },
      { status: 500 },
    )
  }

  return NextResponse.json({
    success: true,
    data: keys,
  })
}

const CreateKeySchema = z.object({
  name: z.string().min(1).max(100).default('API Key'),
  expires_in_days: z.number().int().min(1).max(365).optional(),
})

/**
 * POST /api/sns-pilot/keys
 * 新しいAPIキーを発行
 */
export async function POST(request: Request) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return auth.error

  try {
    const body = await request.json()
    const parsed = CreateKeySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { name, expires_in_days } = parsed.data
    const { raw, hash, prefix } = generateApiKey()

    const expiresAt = expires_in_days
      ? new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000).toISOString()
      : null

    const supabase = getSupabaseAdmin()
    const { data: key, error } = await supabase
      .from('api_keys')
      .insert({
        tenant_id: auth.context.tenantId,
        key_hash: hash,
        key_prefix: prefix,
        name,
        expires_at: expiresAt,
      })
      .select('id, key_prefix, name, expires_at, created_at')
      .single()

    if (error || !key) {
      return NextResponse.json(
        { success: false, error: 'Failed to create API key' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...key,
        api_key: raw,
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

const DeleteKeySchema = z.object({
  key_id: z.string().uuid(),
})

/**
 * DELETE /api/sns-pilot/keys
 * APIキーを無効化
 */
export async function DELETE(request: Request) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return auth.error

  try {
    const body = await request.json()
    const parsed = DeleteKeySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'key_id is required' },
        { status: 400 },
      )
    }

    const supabase = getSupabaseAdmin()
    const { error } = await supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('id', parsed.data.key_id)
      .eq('tenant_id', auth.context.tenantId)

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to revoke API key' },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true })
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
