import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { generateProposalFromAnswers } from '@/app/(sdlp)/system-dev-lp/lib/ai/proposal-graph'
import type { GenerateProposalResponse } from '@/app/(sdlp)/system-dev-lp/lib/ai/types'
import { checkRateLimit } from '../rate-limit'

const serviceTypeEnum = z.enum(['homepage', 'efficiency', 'custom-dev', 'ai-integration'])

const requestSchema = z.object({
  answers: z.record(z.unknown()),
  serviceType: serviceTypeEnum.default('custom-dev'),
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

    const { answers, serviceType, formulaEstimate } = parsed.data

    if (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI service not configured',
        } satisfies GenerateProposalResponse,
        { status: 503 },
      )
    }

    const proposal = await generateProposalFromAnswers({
      answers,
      serviceType,
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
        service_type: serviceType,
        lead_score: proposal.leadScoring?.score ?? null,
        lead_tier: proposal.leadScoring?.tier ?? null,
        urgency_flag: proposal.leadScoring?.tier === 'hot',
        follow_up_strategy: proposal.followUpStrategy ?? {},
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
