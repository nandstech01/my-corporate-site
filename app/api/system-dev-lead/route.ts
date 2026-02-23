import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { notifyNewLead } from '@/lib/lead-pipeline/notify'

const leadSchema = z.object({
  answers: z.record(z.unknown()).optional(),
  serviceType: z.enum(['homepage', 'efficiency', 'custom-dev', 'ai-integration']).default('custom-dev'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  estimatedPrice: z.number().optional(),
  estimatedDuration: z.string().optional(),
  leadScore: z.number().optional(),
  leadTier: z.string().optional(),
  // UTM tracking
  utm_source: z.string().default(''),
  utm_medium: z.string().default(''),
  utm_campaign: z.string().default(''),
  // Proposal & idempotency
  proposalId: z.string().optional(),
  requestId: z.string().optional(),
  // Legacy fields for backward compatibility
  systemOverview: z.string().max(500).default(''),
  industry: z.string().default(''),
  employeeCount: z.string().default(''),
  systemDestination: z.string().default(''),
  systemType: z.string().default(''),
  features: z.array(z.string()).default([]),
  specialRequirements: z.string().max(500).default(''),
  timeline: z.string().default(''),
  devices: z.array(z.string()).default([]),
  budget: z.string().default(''),
})

function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Supabase configuration missing')
  }

  return createClient(url, serviceKey)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = leadSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'バリデーションエラー' },
        { status: 400 },
      )
    }

    const data = parsed.data

    const supabase = createSupabaseAdmin()

    const row = {
      system_overview: data.systemOverview || (data.answers as Record<string, string>)?.projectOverview || '',
      industry: data.industry || (data.answers as Record<string, string>)?.industry || '',
      employee_count: data.employeeCount || (data.answers as Record<string, string>)?.employeeCount || '',
      system_destination: data.systemDestination,
      system_type: data.systemType || (data.answers as Record<string, string>)?.systemType || '',
      features: data.features.length > 0 ? data.features : ((data.answers as Record<string, string[]>)?.features ?? []),
      special_requirements: data.specialRequirements,
      timeline: data.timeline || (data.answers as Record<string, string>)?.timeline || '',
      devices: data.devices,
      budget: data.budget || (data.answers as Record<string, string>)?.budget || '',
      email: data.email,
      estimated_price: data.estimatedPrice ?? null,
      estimated_duration: data.estimatedDuration ?? null,
      service_type: data.serviceType,
      lead_score: data.leadScore ?? null,
      lead_tier: data.leadTier ?? null,
      utm_source: data.utm_source || null,
      utm_medium: data.utm_medium || null,
      utm_campaign: data.utm_campaign || null,
      proposal_id: data.proposalId ?? null,
      ...(data.requestId ? { request_id: data.requestId } : {}),
    }

    const query = data.requestId
      ? supabase.from('system_dev_leads').upsert(row, { onConflict: 'request_id' })
      : supabase.from('system_dev_leads').insert(row)

    const { error: dbError } = await query

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`)
    }

    try {
      await notifyNewLead({
        email: data.email,
        serviceType: data.serviceType,
        budget: data.budget,
        leadScore: data.leadScore,
        leadTier: data.leadTier,
        estimatedPrice: data.estimatedPrice,
      })
    } catch {
      // Notification failure should not break user flow
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
