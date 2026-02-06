import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { generateProposalFromAnswers } from '@/app/(sdlp)/system-dev-lp/lib/ai/proposal-graph'
import type { GenerateProposalResponse } from '@/app/(sdlp)/system-dev-lp/lib/ai/types'
import { checkRateLimit } from '../rate-limit'

const requestSchema = z.object({
  answers: z.object({
    systemOverview: z.string().max(500),
    industry: z.string().max(50),
    employeeCount: z.string().max(20),
    systemDestination: z.string().max(50),
    systemType: z.string().max(50),
    features: z.array(z.string().max(50)).max(20),
    specialRequirements: z.string().max(500),
    timeline: z.string().max(50),
    devices: z.array(z.string().max(50)).max(10),
    budget: z.string().max(50),
    email: z.string().max(254).default(''),
  }),
  formulaEstimate: z.object({
    minPrice: z.number(),
    maxPrice: z.number(),
    estimatedDuration: z.string(),
    breakdown: z.array(
      z.object({
        label: z.string(),
        amount: z.number(),
      }),
    ),
  }),
})

function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    return null
  }

  return createClient(url, serviceKey)
}

export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
    const { allowed } = checkRateLimit(ip, 'generate')
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' } satisfies GenerateProposalResponse,
        { status: 429 },
      )
    }

    const body = await request.json()
    const parsed = requestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? 'バリデーションエラー',
        } satisfies GenerateProposalResponse,
        { status: 400 },
      )
    }

    const { answers, formulaEstimate } = parsed.data

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI service not configured',
        } satisfies GenerateProposalResponse,
        { status: 503 },
      )
    }

    const proposal = await generateProposalFromAnswers({
      answers: answers as Parameters<typeof generateProposalFromAnswers>[0]['answers'],
      formulaEstimate,
    })

    const generationTimeMs = Date.now() - startTime

    const supabase = createSupabaseAdmin()
    if (supabase) {
      await supabase.from('system_dev_proposals').insert({
        questionnaire_answers: answers,
        formula_estimate: formulaEstimate,
        ai_proposal_markdown: proposal.fullMarkdown,
        ai_teaser: proposal.teaser,
        complexity_tier: proposal.complexityTier,
        chat_context: proposal.chatContext,
        prompt_tokens: proposal.promptTokens,
        completion_tokens: proposal.completionTokens,
        generation_time_ms: generationTimeMs,
      })
    }

    return NextResponse.json({
      success: true,
      proposal,
      generationTimeMs,
    } satisfies GenerateProposalResponse)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'AI proposal generation failed'
    return NextResponse.json(
      {
        success: false,
        error: message,
      } satisfies GenerateProposalResponse,
      { status: 500 },
    )
  }
}
