import { NextResponse } from 'next/server'
import { isLocalCommandCenter } from '@/lib/command-center/local-guard'
import { sendToRun } from '@/lib/command-center/agent-runtime'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** LOCAL-ONLY. Inject a follow-up instruction into a running Claude Code session (割り込み). */
export async function POST(req: Request) {
  if (!isLocalCommandCenter(req)) return new Response('not found', { status: 404 })
  let runId = ''
  let text = ''
  try {
    const body = (await req.json()) as { runId?: string; text?: string }
    runId = body.runId ?? ''
    text = (body.text ?? '').trim()
  } catch {
    return NextResponse.json({ error: 'bad request' }, { status: 400 })
  }
  if (!runId || !text) return NextResponse.json({ error: 'missing runId/text' }, { status: 400 })
  const ok = sendToRun(runId, text)
  return NextResponse.json({ ok })
}
