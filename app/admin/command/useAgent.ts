'use client'

/**
 * 司令塔 agent client (Phase 3). Streams a local Claude Code run (SSE) and
 * exposes parsed events for the popup + a stop() for the STOP button.
 * onResult fires with the final result text (for the character to read aloud).
 */

import { useCallback, useRef, useState } from 'react'

export interface AgentEvent {
  kind: 'text' | 'tool' | 'system' | 'result' | 'raw'
  text: string
}

function parseLine(line: string): AgentEvent[] {
  try {
    const j = JSON.parse(line) as { type?: string; subtype?: string; result?: unknown; message?: { content?: Array<{ type?: string; text?: string; name?: string }> } }
    if (j.type === 'assistant' && j.message?.content) {
      const out: AgentEvent[] = []
      for (const c of j.message.content) {
        if (c.type === 'text' && c.text) out.push({ kind: 'text', text: c.text })
        else if (c.type === 'tool_use') out.push({ kind: 'tool', text: `🔧 ${c.name || 'tool'}` })
      }
      return out
    }
    if (j.type === 'result') return [{ kind: 'result', text: typeof j.result === 'string' ? j.result : '' }]
    if (j.type === 'system') return [{ kind: 'system', text: `· ${j.subtype || 'system'}` }]
    return []
  } catch {
    return [{ kind: 'raw', text: line }]
  }
}

export function useAgent(opts?: { onResult?: (text: string) => void }) {
  const [running, setRunning] = useState(false)
  const [events, setEvents] = useState<AgentEvent[]>([])
  const [open, setOpen] = useState(false)
  const runIdRef = useRef<string | null>(null)

  const stop = useCallback(async () => {
    const id = runIdRef.current
    if (id) {
      try { await fetch('/api/admin/agent/stop', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ runId: id }) }) } catch { /* ignore */ }
    }
    setRunning(false)
  }, [])

  const run = useCallback(async (prompt: string) => {
    if (!prompt.trim() || running) return
    setEvents([{ kind: 'system', text: `▶ ${prompt}` }])
    setOpen(true)
    setRunning(true)
    let result = ''
    try {
      const res = await fetch('/api/admin/agent/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) })
      if (res.status === 404) {
        setEvents((e) => [...e, { kind: 'system', text: '（この実行はローカル司令塔でのみ可能です）' }])
        setRunning(false)
        return
      }
      if (!res.body) { setRunning(false); return }
      const reader = res.body.getReader()
      const dec = new TextDecoder()
      let buf = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buf += dec.decode(value, { stream: true })
        const parts = buf.split('\n\n')
        buf = parts.pop() || ''
        for (const part of parts) {
          const m = part.match(/^data: (.*)$/s)
          if (!m) continue
          let evt: { type?: string; runId?: string; line?: string; message?: string }
          try { evt = JSON.parse(m[1]) } catch { continue }
          if (evt.type === 'run') runIdRef.current = evt.runId ?? null
          else if (evt.type === 'line' && evt.line) {
            const evs = parseLine(evt.line)
            if (evs.length) setEvents((e) => [...e, ...evs])
            const r = evs.find((x) => x.kind === 'result')
            if (r) result = r.text
          } else if (evt.type === 'error') {
            setEvents((e) => [...e, { kind: 'system', text: `エラー: ${evt.message ?? ''}` }])
          }
        }
      }
    } catch {
      setEvents((e) => [...e, { kind: 'system', text: '通信エラー' }])
    } finally {
      setRunning(false)
      if (result) opts?.onResult?.(result)
    }
  }, [running, opts])

  return { run, stop, running, events, open, setOpen }
}
