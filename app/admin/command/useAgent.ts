'use client'

/**
 * 司令塔 行動エンジン client (Phase 3A/3B)。本物のローカルClaude Codeを起動し
 * (SSE)、近未来コンソールにストリーム表示。動き出したら自動で最小化(裏チップ)へ。
 * 完了で onResult に最終結果を渡す(キャラが要約音声＋会話に表示)。
 */

import { useCallback, useRef, useState } from 'react'

export interface AgentEvent { kind: 'text' | 'tool' | 'system' | 'result' | 'raw'; text: string }
export type AgentStatus = 'idle' | 'running' | 'done' | 'error'

function parseLine(line: string): AgentEvent[] {
  try {
    const j = JSON.parse(line) as { type?: string; subtype?: string; result?: unknown; message?: { content?: Array<{ type?: string; text?: string; name?: string }> } }
    if (j.type === 'assistant' && j.message?.content) {
      const out: AgentEvent[] = []
      for (const c of j.message.content) {
        if (c.type === 'text' && c.text) out.push({ kind: 'text', text: c.text })
        else if (c.type === 'tool_use') out.push({ kind: 'tool', text: c.name || 'tool' })
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
  const [status, setStatus] = useState<AgentStatus>('idle')
  const [events, setEvents] = useState<AgentEvent[]>([])
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const runIdRef = useRef<string | null>(null)
  const cbRef = useRef(opts)
  cbRef.current = opts
  const running = status === 'running'

  const stop = useCallback(async () => {
    const id = runIdRef.current
    if (id) {
      try { await fetch('/api/admin/agent/stop', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ runId: id }) }) } catch { /* ignore */ }
    }
    setStatus('done')
  }, [])

  const run = useCallback(async (task: string, perm: string) => {
    if (!task.trim() || running) return
    setEvents([{ kind: 'system', text: `▶ ${task}` }])
    setOpen(true); setMinimized(false); setStatus('running')
    let result = ''
    let minimized = false
    const autoMin = setTimeout(() => { if (!minimized) { minimized = true; setMinimized(true) } }, 6500)
    try {
      const res = await fetch('/api/admin/agent/run', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: task, perm }),
      })
      if (res.status === 404) {
        setEvents((e) => [...e, { kind: 'system', text: '（この実行はローカル司令塔でのみ可能です）' }])
        setStatus('error'); clearTimeout(autoMin); return
      }
      if (!res.body) { setStatus('error'); clearTimeout(autoMin); return }
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
          const mm = part.match(/^data: (.*)$/s)
          if (!mm) continue
          let evt: { type?: string; runId?: string; line?: string; message?: string }
          try { evt = JSON.parse(mm[1]) } catch { continue }
          if (evt.type === 'run') runIdRef.current = evt.runId ?? null
          else if (evt.type === 'line' && evt.line) {
            const evs = parseLine(evt.line)
            if (evs.length) setEvents((e) => [...e, ...evs])
            // first tool use → minimize to background chip
            if (!minimized && evs.some((x) => x.kind === 'tool')) { minimized = true; setMinimized(true) }
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
      clearTimeout(autoMin)
      setStatus((s) => (s === 'error' ? 'error' : 'done'))
      if (result) cbRef.current?.onResult?.(result)
    }
  }, [running])

  return { run, stop, status, running, events, open, setOpen, minimized, setMinimized }
}
