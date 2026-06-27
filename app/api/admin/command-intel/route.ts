import { NextResponse } from 'next/server'
import { computeCommandIntel, type CommandIntel } from '@/lib/cortex/metrics/command-intel'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Server-side cache: the changelog fetch + SEO aggregation are heavier than the
// 30s dashboard poll, so we recompute at most every ~15 min.
let cache: { data: CommandIntel; ts: number } | null = null
const TTL_MS = 15 * 60_000

export async function GET() {
  try {
    if (cache && Date.now() - cache.ts < TTL_MS) {
      return NextResponse.json(cache.data, { headers: { 'Cache-Control': 'no-store' } })
    }
    const data = await computeCommandIntel()
    cache = { data, ts: Date.now() }
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'intel failed' },
      { status: 500 },
    )
  }
}
