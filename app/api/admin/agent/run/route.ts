import { isLocalCommandCenter } from '@/lib/command-center/local-guard'
import { startAgent, finishAudit, unregister, touchRun } from '@/lib/command-center/agent-runtime'
import { recallKnowledge, distillAndSave } from '@/lib/command-center/knowledge'

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
  let perm: 'default' | 'plan' | 'acceptEdits' | 'bypassPermissions' = 'default'
  try {
    const body = (await req.json()) as { prompt?: string; perm?: string }
    prompt = (body.prompt ?? '').trim()
    if (body.perm === 'acceptEdits' || body.perm === 'bypassPermissions' || body.perm === 'plan' || body.perm === 'default') perm = body.perm
  } catch {
    return new Response('bad request', { status: 400 })
  }
  if (!prompt) return new Response('empty prompt', { status: 400 })

  // recall learned preferences → inject as context so the assistant "knows me"
  const ctx = await recallKnowledge().catch(() => '')
  const augmented = ctx
    ? `[これまでに学習したオーナー(私)の方針・嗜好]\n${ctx}\n\n[依頼]\n${prompt}`
    : prompt

  const { runId, child } = startAgent(augmented, perm)
  const enc = new TextEncoder()
  let full = ''
  let resultText = ''

  const stream = new ReadableStream({
    start(controller) {
      const send = (obj: unknown) => {
        try { controller.enqueue(enc.encode(`data: ${JSON.stringify(obj)}\n\n`)) } catch { /* closed */ }
      }
      send({ type: 'run', runId })

      let buf = ''
      child.stdout.on('data', (d: Buffer) => {
        touchRun(runId) //活動中はアイドル終了させない(長時間タスクのkill/割り込み切れ防止)
        buf += d.toString()
        const lines = buf.split('\n')
        buf = lines.pop() || ''
        for (const line of lines) {
          if (!line.trim()) continue
          full += line + '\n'
          try {
            const j = JSON.parse(line) as { type?: string; result?: unknown }
            if (j.type === 'result' && typeof j.result === 'string') {
              resultText = j.result
              send({ type: 'turn', result: j.result }) // a turn finished; session stays alive for 割り込み
            }
          } catch { /* not json */ }
          send({ type: 'line', line })
        }
      })
      child.stderr.on('data', (d: Buffer) => send({ type: 'stderr', line: d.toString() }))
      child.on('close', (code) => {
        if (buf.trim()) { full += buf; send({ type: 'line', line: buf }) }
        send({ type: 'done', code })
        finishAudit(runId, full, code)
        void distillAndSave(prompt, resultText) // learn from this exchange (best-effort)
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
