import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) throw new Error('Supabase configuration missing')
  return createClient(url, serviceKey)
}

function validateAdminAuth(request: Request): boolean {
  const authHeader = request.headers.get('authorization')
  const adminSecret = process.env.ADMIN_API_SECRET
  if (!adminSecret) return false
  return authHeader === `Bearer ${adminSecret}`
}

export async function GET(request: Request) {
  if (!validateAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const tier = searchParams.get('tier')
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100)
  const offset = (page - 1) * limit

  const supabase = createSupabaseAdmin()

  let query = supabase
    .from('system_dev_leads')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) query = query.eq('status', status)
  if (tier) query = query.eq('lead_tier', tier)

  const { data, count, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    data,
    meta: { total: count ?? 0, page, limit },
  })
}
