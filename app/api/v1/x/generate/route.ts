/**
 * SNS Pilot - X Post Generation API
 *
 * POST /api/v1/x/generate
 *
 * Wraps the LangGraph-based generateXPost() pipeline,
 * protected by API key authentication and usage limits.
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { generateXPost } from '@/lib/x-post-generation/post-graph'
import {
  authenticateRequest,
  checkUsageAndPlatform,
  recordUsage,
  recordPostHistory,
} from '@/lib/sns-pilot/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const RequestBodySchema = z.object({
  mode: z.enum(['article', 'research']),
  content: z
    .string()
    .min(1, 'content must not be empty')
    .max(50000, 'content must not exceed 50000 characters'),
  title: z.string().optional(),
  topic: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export async function POST(request: Request) {
  try {
    // --- Authentication ---
    const authResult = await authenticateRequest(request)

    if ('error' in authResult) {
      return authResult.error
    }

    const { context } = authResult

    // --- Platform & Usage Check ---
    const usageResult = await checkUsageAndPlatform(
      context.tenantId,
      context.tier,
      'x',
    )

    if (!usageResult.allowed) {
      return usageResult.error
    }

    const { usage } = usageResult

    // --- Parse & Validate Request Body ---
    const rawBody: unknown = await request.json().catch(() => null)

    if (!rawBody) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body' },
        { status: 400 },
      )
    }

    const parseResult = RequestBodySchema.safeParse(rawBody)

    if (!parseResult.success) {
      const message = parseResult.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('; ')

      return NextResponse.json(
        { success: false, error: `Validation error: ${message}` },
        { status: 400 },
      )
    }

    const body = parseResult.data

    // --- Generate Post ---
    const result = await generateXPost({
      mode: body.mode,
      content: body.content,
      title: body.title,
      topic: body.topic,
      tags: body.tags,
    })

    // --- Record Usage & Post History (in parallel) ---
    const postsUsed = usage.current_usage + 1
    const postsRemaining = Math.max(0, usage.usage_limit - postsUsed)

    await Promise.all([
      recordUsage(
        context.tenantId,
        'x',
        result.promptTokens,
        result.completionTokens,
      ),
      recordPostHistory(
        context.tenantId,
        'x',
        result.finalPost,
        result.patternUsed,
        result.tags,
        result.scores,
        result.allCandidates,
        result.promptTokens,
        result.completionTokens,
        {
          mode: body.mode,
          content: body.content,
          title: body.title ?? null,
          topic: body.topic ?? null,
          tags: body.tags ?? null,
        },
      ),
    ])

    // --- Success Response ---
    return NextResponse.json({
      success: true,
      data: {
        post: result.finalPost,
        pattern_used: result.patternUsed,
        tags: result.tags,
        scores: result.scores,
        all_candidates: result.allCandidates,
        usage: {
          prompt_tokens: result.promptTokens,
          completion_tokens: result.completionTokens,
          posts_used: postsUsed,
          posts_remaining: postsRemaining,
        },
      },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Internal server error'

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    )
  }
}
