import { NextResponse } from 'next/server'
import { computeCommandMetrics } from '@/lib/cortex/metrics/command-metrics'

// Command-center KPIs (本日の投稿数 / 閲覧 / 問い合わせ + 7日トレンド).
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const metrics = await computeCommandMetrics()
    return NextResponse.json(metrics, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'failed' },
      { status: 500 },
    )
  }
}
