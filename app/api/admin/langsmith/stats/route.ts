import { NextResponse } from 'next/server'
import { Client } from 'langsmith'

export const dynamic = 'force-dynamic'

const PROJECT_NAME = process.env.LANGCHAIN_PROJECT ?? 'nands-sns-pipeline'
const PROJECT_ID = process.env.LANGCHAIN_PROJECT_ID

interface ToolUsageStat {
  readonly name: string
  readonly count: number
  readonly successRate: number
}

interface DailyTokenUsage {
  readonly date: string
  readonly promptTokens: number
  readonly completionTokens: number
  readonly totalTokens: number
  readonly estimatedCost: number
}

interface PlatformLatency {
  readonly platform: string
  readonly avgMs: number
  readonly p95Ms: number
  readonly maxMs: number
  readonly count: number
}

interface StatsResponse {
  readonly toolUsage: readonly ToolUsageStat[]
  readonly dailyTokens: readonly DailyTokenUsage[]
  readonly platformLatency: readonly PlatformLatency[]
  readonly successRate: number
  readonly totalRuns: number
  readonly totalErrors: number
}

// GPT-5.2 pricing estimates (per 1K tokens)
const PRICING = {
  prompt: 0.003,
  completion: 0.015,
} as const

function detectPlatform(tags: readonly string[], name: string): string {
  const combined = [...tags, name].join(' ').toLowerCase()
  if (combined.includes('instagram') || combined.includes('story-generation')) return 'instagram'
  if (combined.includes('linkedin') || combined.includes('linkedin-post')) return 'linkedin'
  if (combined.includes('blog') || combined.includes('rss') || combined.includes('blog-rss')) return 'blog'
  if (combined.includes('x-post') || combined.includes('tweet') || combined.includes('daily-suggestion') || combined.includes('trending')) return 'x'
  if (combined.includes('cron')) return 'cron'
  if (combined.includes('slack-bot') || combined.includes('slack-agent')) return 'agent'
  return 'agent'
}

export async function GET(request: Request) {
  console.log('[langsmith/stats] Handler called')

  const apiKey = process.env.LANGCHAIN_API_KEY
  if (!apiKey) {
    console.error('[langsmith/stats] LANGCHAIN_API_KEY not configured')
    return NextResponse.json(
      { success: false, error: 'LANGCHAIN_API_KEY not configured' },
      { status: 500 },
    )
  }

  const { searchParams } = new URL(request.url)
  const days = Math.min(Number(searchParams.get('days') ?? '7'), 30)

  const startTime = new Date()
  startTime.setDate(startTime.getDate() - days)

  try {
    const client = new Client({ apiKey })

    const toolCounts = new Map<string, { total: number; success: number }>()
    const dailyTokens = new Map<string, { prompt: number; completion: number; total: number }>()
    const platformLatencies = new Map<string, number[]>()
    let totalRuns = 0
    let totalErrors = 0

    for await (const run of client.listRuns({
      ...(PROJECT_ID ? { projectId: PROJECT_ID } : { projectName: PROJECT_NAME }),
      filter: `gte(start_time, "${startTime.toISOString()}")`,
      limit: 100,
    })) {
      totalRuns++
      if (run.error) totalErrors++

      // Tool usage tracking from child runs
      if (run.child_runs) {
        for (const child of run.child_runs) {
          if (child.run_type === 'tool') {
            const existing = toolCounts.get(child.name) ?? { total: 0, success: 0 }
            toolCounts.set(child.name, {
              total: existing.total + 1,
              success: existing.success + (child.error ? 0 : 1),
            })
          }
        }
      }

      // Daily token aggregation
      const day = run.start_time
        ? new Date(run.start_time).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10)
      const existing = dailyTokens.get(day) ?? { prompt: 0, completion: 0, total: 0 }
      dailyTokens.set(day, {
        prompt: existing.prompt + ((run.prompt_tokens ?? 0) as number),
        completion: existing.completion + ((run.completion_tokens ?? 0) as number),
        total: existing.total + ((run.total_tokens ?? 0) as number),
      })

      // Platform latency tracking
      const platform = detectPlatform((run.tags ?? []) as string[], run.name)
      if (run.end_time && run.start_time) {
        const latency = new Date(run.end_time).getTime() - new Date(run.start_time).getTime()
        const latencies = platformLatencies.get(platform) ?? []
        latencies.push(latency)
        platformLatencies.set(platform, latencies)
      }
    }

    // Build tool usage stats
    const toolUsage: ToolUsageStat[] = Array.from(toolCounts.entries())
      .map(([name, stats]) => ({
        name,
        count: stats.total,
        successRate: stats.total > 0 ? (stats.success / stats.total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)

    // Build daily token usage
    const dailyTokensArr: DailyTokenUsage[] = Array.from(dailyTokens.entries())
      .map(([date, tokens]) => ({
        date,
        promptTokens: tokens.prompt,
        completionTokens: tokens.completion,
        totalTokens: tokens.total,
        estimatedCost:
          (tokens.prompt / 1000) * PRICING.prompt +
          (tokens.completion / 1000) * PRICING.completion,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Build platform latency stats
    const platformLatencyArr: PlatformLatency[] = Array.from(
      platformLatencies.entries(),
    ).map(([platform, latencies]) => {
      const sorted = [...latencies].sort((a, b) => a - b)
      const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length
      const p95Index = Math.floor(sorted.length * 0.95)
      return {
        platform,
        avgMs: Math.round(avg),
        p95Ms: sorted[p95Index] ?? sorted[sorted.length - 1] ?? 0,
        maxMs: sorted[sorted.length - 1] ?? 0,
        count: sorted.length,
      }
    })

    const successRate = totalRuns > 0 ? ((totalRuns - totalErrors) / totalRuns) * 100 : 0

    const stats: StatsResponse = {
      toolUsage,
      dailyTokens: dailyTokensArr,
      platformLatency: platformLatencyArr,
      successRate,
      totalRuns,
      totalErrors,
    }

    return NextResponse.json(
      { success: true, data: stats },
      {
        headers: { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' },
      },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch stats'
    if (message.includes('not found')) {
      console.warn('[langsmith/stats] Project not found, returning empty data')
      return NextResponse.json({
        success: true,
        data: {
          toolUsage: [],
          dailyTokens: [],
          platformLatency: [],
          successRate: 0,
          totalRuns: 0,
          totalErrors: 0,
        },
      })
    }
    const stack = error instanceof Error ? error.stack : String(error)
    console.error('[langsmith/stats] ERROR:', message)
    console.error('[langsmith/stats] STACK:', stack)
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    )
  }
}
