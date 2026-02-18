import { NextResponse } from 'next/server'
import { Client } from 'langsmith'

export const dynamic = 'force-dynamic'

const PROJECT_NAME = process.env.LANGCHAIN_PROJECT ?? 'nands-sns-pipeline'

interface TraceRecord {
  readonly id: string
  readonly name: string
  readonly status: string
  readonly latencyMs: number
  readonly totalTokens: number
  readonly promptTokens: number
  readonly completionTokens: number
  readonly toolCalls: readonly string[]
  readonly tags: readonly string[]
  readonly startTime: string
  readonly endTime: string | null
  readonly error: string | null
}

export async function GET(request: Request) {
  const apiKey = process.env.LANGCHAIN_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'LANGCHAIN_API_KEY not configured' },
      { status: 500 },
    )
  }

  const { searchParams } = new URL(request.url)
  const limit = Math.min(Number(searchParams.get('limit') ?? '50'), 200)
  const days = Math.min(Number(searchParams.get('days') ?? '7'), 30)

  const startTime = new Date()
  startTime.setDate(startTime.getDate() - days)

  try {
    const client = new Client({ apiKey })
    const traces: TraceRecord[] = []

    for await (const run of client.listRuns({
      projectName: PROJECT_NAME,
      filter: `gte(start_time, "${startTime.toISOString()}")`,
      limit,
    })) {
      const latencyMs =
        run.end_time && run.start_time
          ? new Date(run.end_time).getTime() - new Date(run.start_time).getTime()
          : 0

      const toolCalls: string[] = []
      if (run.child_runs) {
        for (const child of run.child_runs) {
          if (child.run_type === 'tool') {
            toolCalls.push(child.name)
          }
        }
      }

      traces.push({
        id: run.id,
        name: run.name,
        status: run.status ?? (run.error ? 'error' : 'success'),
        latencyMs,
        totalTokens: (run.total_tokens ?? 0) as number,
        promptTokens: (run.prompt_tokens ?? 0) as number,
        completionTokens: (run.completion_tokens ?? 0) as number,
        toolCalls,
        tags: (run.tags ?? []) as string[],
        startTime: run.start_time
          ? new Date(run.start_time).toISOString()
          : new Date().toISOString(),
        endTime: run.end_time
          ? new Date(run.end_time).toISOString()
          : null,
        error: run.error ?? null,
      })
    }

    // Sort by start time descending (newest first)
    const sortedTraces = traces.sort((a, b) =>
      b.startTime.localeCompare(a.startTime),
    )

    return NextResponse.json({
      success: true,
      data: sortedTraces,
      meta: { total: sortedTraces.length, limit, days },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch traces'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    )
  }
}
