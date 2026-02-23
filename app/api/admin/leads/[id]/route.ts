import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

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

const updateSchema = z.object({
  status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']).optional(),
  assigned_to: z.string().optional(),
  notes: z.string().optional(),
  last_contacted_at: z.string().datetime().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!validateAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const supabase = createSupabaseAdmin()

  const [leadResult, activitiesResult, followUpsResult] = await Promise.all([
    supabase.from('system_dev_leads').select('*').eq('id', id).single(),
    supabase.from('lead_activities').select('*').eq('lead_id', id).order('created_at', { ascending: false }).limit(50),
    supabase.from('lead_follow_ups').select('*').eq('lead_id', id).order('due_at', { ascending: true }),
  ])

  if (leadResult.error) {
    return NextResponse.json({ error: leadResult.error.message }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    data: {
      ...leadResult.data,
      activities: activitiesResult.data ?? [],
      followUps: followUpsResult.data ?? [],
    },
  })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!validateAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const parsed = updateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }

  const supabase = createSupabaseAdmin()
  const updates = parsed.data

  const { data, error } = await supabase
    .from('system_dev_leads')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log activity
  if (updates.status) {
    await supabase.from('lead_activities').insert({
      lead_id: id,
      activity_type: 'status_change',
      description: `Status changed to ${updates.status}`,
      metadata: updates,
    })
  }

  return NextResponse.json({ success: true, data })
}
