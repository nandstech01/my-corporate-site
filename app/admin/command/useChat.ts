'use client'

/**
 * 司令塔チャット (LINE風) ＋ 知能ルーター。発話を /api/admin/command-chat に送り、
 * mode=chat なら会話返答、mode=act なら本物のClaude Codeを起動(onAct)。
 * 返答はテキスト表示＋音声(speak)。pushAssistant でエージェント結果も会話に流す。
 */

import { useCallback, useRef, useState } from 'react'

export interface ChatMsg { role: 'user' | 'assistant'; content: string }

export function useChat(opts: { speak: (t: string) => void; onAct: (task: string, perm: string) => void }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [busy, setBusy] = useState(false)
  const messagesRef = useRef<ChatMsg[]>([])
  const cbRef = useRef(opts)
  cbRef.current = opts

  const apply = (next: ChatMsg[]) => { messagesRef.current = next; setMessages(next) }
  const pushAssistant = useCallback((content: string) => {
    if (content?.trim()) apply([...messagesRef.current, { role: 'assistant', content }])
  }, [])

  const send = useCallback(async (text: string) => {
    const content = text.trim()
    if (!content || busy) return
    apply([...messagesRef.current, { role: 'user', content }])
    setBusy(true)
    try {
      const r = await fetch('/api/admin/command-chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messagesRef.current }),
      })
      const data = (await r.json()) as { mode?: string; reply?: string; say?: string; task?: string; perm?: string }
      if (data.mode === 'act' && data.task) {
        const say = data.say || '了解、やります。'
        apply([...messagesRef.current, { role: 'assistant', content: say }])
        cbRef.current.speak(say)
        cbRef.current.onAct(data.task, data.perm || 'plan')
      } else {
        const reply = data.reply || '（応答を取得できませんでした）'
        apply([...messagesRef.current, { role: 'assistant', content: reply }])
        if (data.reply) cbRef.current.speak(reply)
      }
    } catch {
      apply([...messagesRef.current, { role: 'assistant', content: '通信エラーが起きました。' }])
    } finally {
      setBusy(false)
    }
  }, [busy])

  return { open, setOpen, messages, busy, send, pushAssistant }
}
