import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const leadSchema = z.object({
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
  email: z.string().email('有効なメールアドレスを入力してください'),
  estimatedPrice: z.number().optional(),
  estimatedDuration: z.string().optional(),
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

    const { error: dbError } = await supabase
      .from('system_dev_leads')
      .insert({
        system_overview: data.systemOverview,
        industry: data.industry,
        employee_count: data.employeeCount,
        system_destination: data.systemDestination,
        system_type: data.systemType,
        features: data.features,
        special_requirements: data.specialRequirements,
        timeline: data.timeline,
        devices: data.devices,
        budget: data.budget,
        email: data.email,
        estimated_price: data.estimatedPrice ?? null,
        estimated_duration: data.estimatedDuration ?? null,
      })

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
