'use client'

/**
 * 司令塔チャット (LINE風)。ユーザー発話/入力を /api/admin/command-chat に送り、
 * キャラの返信を取得 → テキスト表示＋音声(speak)。近況報告・相談に対応。
 */

import { useCallback, useRef, useState } from 'react'

export interface ChatMsg { role: 'user' | 'assistant'; content: string }

export function useChat(opts: { speak: (t: string) => void }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [busy, setBusy] = useState(false)
  const messagesRef = useRef<ChatMsg[]>([])
  const speakRef = useRef(opts.speak)
  speakRef.current = opts.speak

  const apply = (next: ChatMsg[]) => { messagesRef.current = next; setMessages(next) }

  const send = useCallback(async (text: string) => {
    const content = text.trim()
    if (!content || busy) return
    apply([...messagesRef.current, { role: 'user', content }])
    setBusy(true)
    try {
      const r = await fetch('/api/admin/command-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messagesRef.current }),
      })
      const data = (await r.json()) as { reply?: string; error?: string }
      const reply = data.reply || '（応答を取得できませんでした）'
      apply([...messagesRef.current, { role: 'assistant', content: reply }])
      if (data.reply) speakRef.current(reply)
    } catch {
      apply([...messagesRef.current, { role: 'assistant', content: '通信エラーが起きました。' }])
    } finally {
      setBusy(false)
    }
  }, [busy])

  return { open, setOpen, messages, busy, send }
}
