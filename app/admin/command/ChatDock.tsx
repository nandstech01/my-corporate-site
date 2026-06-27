'use client'

/**
 * 司令塔チャット (魅せ場): 話しかけるとキャラが画面右の中央で大きくなって喋り、
 * 画面中央に左右でLINE風の会話が浮かぶ（私=左 / キャラ=右）。箱のポップアップでは
 * なく吹き出しが浮遊＝「キャラと喋っている感」。司令塔の画面はそのまま維持。
 */

import { useState } from 'react'
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
  const submit = () => { const t = draft.trim(); if (!t) return; setDraft(''); onSend(t) }
  const recent = messages.slice(-8) // keep the floating conversation light

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* close */}
          <motion.button
            key="close"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} aria-label="閉じる"
            style={{ position: 'fixed', top: 18, right: 26, zIndex: 49, fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, letterSpacing: '0.1em', color: '#9fb3c8', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 9, padding: '5px 12px', background: 'rgba(7,11,22,0.7)', backdropFilter: 'blur(8px)', cursor: 'pointer' }}
          >
            ✕ 会話を閉じる
          </motion.button>

          {/* character — big, right side, vertically centered */}
          <motion.div
            key="bigc"
            initial={{ opacity: 0, x: 60, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.92 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            style={{ position: 'fixed', right: '3vw', top: '50%', transform: 'translateY(-50%)', zIndex: 46, pointerEvents: 'none' }}
          >
            <BigCharacter speaking={speaking} size={400} />
          </motion.div>

          {/* floating LINE-style conversation across the center (私=左 / キャラ=右) */}
          <div
            key="convo"
            style={{ position: 'fixed', left: 0, right: '22vw', top: '14vh', bottom: '44vh', zIndex: 47, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 12, padding: '0 4vw', pointerEvents: 'none', overflow: 'hidden' }}
          >
            <AnimatePresence initial={false}>
              {recent.map((msg, i) => {
                const me = msg.role === 'user'
                return (
                  <motion.div
                    key={`${messages.length - recent.length + i}`}
                    initial={{ opacity: 0, y: 12, x: me ? -16 : 16 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    style={{ alignSelf: me ? 'flex-start' : 'flex-end', maxWidth: '52%' }}
                  >
                    <div style={{ fontSize: 10, letterSpacing: '0.14em', color: me ? '#7e8ea3' : `${CYAN}cc`, margin: me ? '0 0 3px 4px' : '0 4px 3px 0', textAlign: me ? 'left' : 'right', fontFamily: 'IBM Plex Mono, monospace' }}>
                      {me ? 'YOU' : 'CORTEX'}
                    </div>
                    <div style={{
                      fontSize: 15, lineHeight: 1.65, padding: '11px 16px', borderRadius: 16, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                      backdropFilter: 'blur(10px)', boxShadow: '0 6px 26px rgba(0,0,0,0.34)',
                      ...(me
                        ? { background: 'rgba(20,28,42,0.78)', color: '#e7eef7', border: '1px solid rgba(255,255,255,0.12)', borderBottomLeftRadius: 5 }
                        : { background: 'rgba(56,225,216,0.16)', color: '#eafffb', border: `1px solid ${CYAN}66`, borderBottomRightRadius: 5 }),
                    }}>
                      {msg.content}
                    </div>
                  </motion.div>
                )
              })}
              {busy && (
                <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ alignSelf: 'flex-end', maxWidth: '52%' }}>
                  <div style={{ fontSize: 13, color: '#7e8ea3', fontFamily: 'IBM Plex Mono, monospace', padding: '8px 14px', textAlign: 'right' }}>
                    CORTEX が考えています…
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {recent.length === 0 && !busy && (
              <div style={{ alignSelf: 'center', color: '#7e8ea3', fontSize: 14 }}>
                「今日の調子は？」「最新の公式情報は？」と話しかけてください 🎙
              </div>
            )}
          </div>

          {/* slim input — bottom center, above the mic */}
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 14 }}
            style={{ position: 'fixed', left: '50%', bottom: '37vh', transform: 'translateX(-50%)', width: 'min(620px, 60vw)', zIndex: 48, display: 'flex', gap: 8, pointerEvents: 'auto' }}
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
              placeholder="メッセージ、または 🎙 で話しかける"
              style={{ flex: 1, background: 'rgba(7,11,22,0.78)', border: `1px solid ${CYAN}44`, borderRadius: 24, padding: '11px 18px', color: '#eaf2fb', fontSize: 14, outline: 'none', backdropFilter: 'blur(10px)' }}
            />
            <button onClick={submit} disabled={busy || !draft.trim()}
              style={{ color: CYAN, border: `1px solid ${CYAN}66`, borderRadius: 24, padding: '0 18px', background: 'rgba(56,225,216,0.12)', cursor: busy ? 'not-allowed' : 'pointer', fontSize: 14, backdropFilter: 'blur(10px)' }}>
              送信
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
