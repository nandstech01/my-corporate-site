'use client'

/**
 * 司令塔チャットドック (魅せ場): 話しかけると開く。左に大きくなったキャラ、
 * 右にLINE風の会話(あなた=右/キャラ=左)。音声＋テキストで近況報告を聞ける。
 * 司令塔本体のデザインは触らず、これは on-demand のオーバーレイ。
 */

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BigCharacter from './BigCharacter'

type Msg = { role: 'user' | 'assistant'; content: string }
const CYAN = '#38E1D8'

export default function ChatDock({
  open, messages, busy, speaking, onSend, onClose,
}: {
  open: boolean
  messages: Msg[]
  busy: boolean
  speaking: boolean
  onSend: (t: string) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState('')
  const logRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight }, [messages, busy])

  const submit = () => { const t = draft.trim(); if (!t) return; setDraft(''); onSend(t) }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* enlarged character, bottom-left */}
          <motion.div
            key="bigc"
            initial={{ opacity: 0, x: -40, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -40, scale: 0.9 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            style={{ position: 'fixed', left: '3vw', bottom: 0, zIndex: 46, pointerEvents: 'none' }}
          >
            <BigCharacter speaking={speaking} size={Math.min(360, 0.34 * 900)} />
          </motion.div>

          {/* LINE-style chat column, right */}
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              position: 'fixed', right: 24, top: '11vh', width: 440, maxWidth: '42vw', height: '76vh', zIndex: 47,
              display: 'flex', flexDirection: 'column', borderRadius: 16,
              border: `1px solid ${CYAN}44`, background: 'rgba(6,10,18,0.82)', backdropFilter: 'blur(16px)',
              boxShadow: `0 0 60px ${CYAN}22, inset 0 1px 0 rgba(255,255,255,0.05)`,
            }}
          >
            {/* header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={speaking ? 'animate-pulse' : ''} style={{ width: 9, height: 9, borderRadius: '50%', background: CYAN, boxShadow: `0 0 10px ${CYAN}` }} />
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 13, letterSpacing: '0.18em', color: '#dce6f2' }}>CORTEX ・ 近況報告</span>
              </div>
              <button onClick={onClose} aria-label="閉じる" style={{ fontSize: 14, color: '#6b7c98', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '3px 10px', background: 'transparent', cursor: 'pointer' }}>✕</button>
            </div>

            {/* messages */}
            <div ref={logRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.length === 0 && (
                <div style={{ color: '#6b7c98', fontSize: 13, textAlign: 'center', marginTop: 20 }}>
                  「今日の調子は？」「最新の公式情報は？」などと話しかけてください🎙
                </div>
              )}
              {messages.map((msg, i) => {
                const me = msg.role === 'user'
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
                    style={{ alignSelf: me ? 'flex-end' : 'flex-start', maxWidth: '82%' }}
                  >
                    <div style={{
                      fontSize: 13.5, lineHeight: 1.6, padding: '9px 13px', borderRadius: 14, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                      ...(me
                        ? { background: 'rgba(56,225,216,0.16)', color: '#eafffb', border: `1px solid ${CYAN}55`, borderBottomRightRadius: 4 }
                        : { background: 'rgba(255,255,255,0.06)', color: '#dce6f2', border: '1px solid rgba(255,255,255,0.10)', borderBottomLeftRadius: 4 }),
                    }}>
                      {msg.content}
                    </div>
                  </motion.div>
                )
              })}
              {busy && (
                <div style={{ alignSelf: 'flex-start', color: '#6b7c98', fontSize: 13, fontFamily: 'IBM Plex Mono, monospace' }}>CORTEX が考えています…</div>
              )}
            </div>

            {/* input */}
            <div style={{ display: 'flex', gap: 8, padding: 12, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
                placeholder="メッセージ、または🎙で話しかける"
                style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '9px 12px', color: '#eaf2fb', fontSize: 13, outline: 'none' }}
              />
              <button onClick={submit} disabled={busy || !draft.trim()} style={{ color: CYAN, border: `1px solid ${CYAN}66`, borderRadius: 10, padding: '0 14px', background: 'rgba(56,225,216,0.10)', cursor: busy ? 'not-allowed' : 'pointer', fontSize: 13 }}>送信</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
