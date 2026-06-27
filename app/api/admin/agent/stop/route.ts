import { NextResponse } from 'next/server'
import { isLocalCommandCenter } from '@/lib/command-center/local-guard'
import { killRun } from '@/lib/command-center/agent-runtime'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** LOCAL-ONLY. Kills a running Claude Code agent by runId (the STOP button). */
export async function POST(req: Request) {
  if (!isLocalCommandCenter(req)) return new Response('not found', { status: 404 })
  let runId = ''
  try {
    const body = (await req.json()) as { runId?: string }
    runId = body.runId ?? ''
  } catch {
    return NextResponse.json({ error: 'bad request' }, { status: 400 })
  }
  const killed = killRun(runId)
  return NextResponse.json({ killed })
}
