import { isLocalCommandCenter } from '@/lib/command-center/local-guard'
import { startAgent, finishAudit, unregister } from '@/lib/command-center/agent-runtime'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * LOCAL-ONLY. Spawns the real Claude Code CLI (full-auto) for a spoken/typed
 * instruction and streams its stream-json output back via SSE. Gated by
 * isLocalCommandCenter — returns 404 anywhere it isn't the local kiosk.
 */
export async function POST(req: Request) {
  if (!isLocalCommandCenter(req)) {
    return new Response('not found', { status: 404 })
  }

  let prompt = ''
  try {
    const body = (await req.json()) as { prompt?: string }
    prompt = (body.prompt ?? '').trim()
  } catch {
    return new Response('bad request', { status: 400 })
  }
  if (!prompt) return new Response('empty prompt', { status: 400 })

  const { runId, child } = startAgent(prompt)
  const enc = new TextEncoder()
  let full = ''

  const stream = new ReadableStream({
    start(controller) {
      const send = (obj: unknown) => {
        try { controller.enqueue(enc.encode(`data: ${JSON.stringify(obj)}\n\n`)) } catch { /* closed */ }
      }
      send({ type: 'run', runId })

      let buf = ''
      child.stdout.on('data', (d: Buffer) => {
        buf += d.toString()
        const lines = buf.split('\n')
        buf = lines.pop() || ''
        for (const line of lines) {
          if (!line.trim()) continue
          full += line + '\n'
          send({ type: 'line', line })
        }
      })
      child.stderr.on('data', (d: Buffer) => send({ type: 'stderr', line: d.toString() }))
      child.on('close', (code) => {
        if (buf.trim()) { full += buf; send({ type: 'line', line: buf }) }
        send({ type: 'done', code })
        finishAudit(runId, full, code)
        unregister(runId)
        try { controller.close() } catch { /* ignore */ }
      })
      child.on('error', (e) => {
        send({ type: 'error', message: e instanceof Error ? e.message : String(e) })
        unregister(runId)
        try { controller.close() } catch { /* ignore */ }
      })
    },
    cancel() {
      try { child.kill('SIGTERM') } catch { /* ignore */ }
      unregister(runId)
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', 'X-Run-Id': runId },
  })
}
