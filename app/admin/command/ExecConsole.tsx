'use client'

/**
 * 司令塔「Claude Code 実行コンソール」(近未来UI)。
 * 半透明・大きめ・Claude Codeと一目で分かるHUD。本物のClaude Codeの作業を
 * ストリーム表示。動き出したら自動で裏チップへ最小化(うざくない)、再展開も可。
 */

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Ev = { kind: 'text' | 'tool' | 'system' | 'result' | 'raw'; text: string }
type Status = 'idle' | 'running' | 'done' | 'error'
const CYAN = '#38E1D8'
const GREEN = '#3DDC91'

const STATUS_LABEL: Record<Status, string> = { idle: '待機', running: '実行中', done: '完了', error: 'エラー' }

function Corner({ pos }: { pos: string }) {
  const base: React.CSSProperties = { position: 'absolute', width: 16, height: 16, borderColor: `${CYAN}99` }
  const m: Record<string, React.CSSProperties> = {
    tl: { top: 0, left: 0, borderTop: '1px solid', borderLeft: '1px solid' },
    tr: { top: 0, right: 0, borderTop: '1px solid', borderRight: '1px solid' },
    bl: { bottom: 0, left: 0, borderBottom: '1px solid', borderLeft: '1px solid' },
    br: { bottom: 0, right: 0, borderBottom: '1px solid', borderRight: '1px solid' },
  }
  return <span aria-hidden style={{ ...base, ...m[pos] }} />
}

export default function ExecConsole({
  open, status, events, minimized, onMinimize, onExpand, onStop, onClose,
}: {
  open: boolean
  status: Status
  events: Ev[]
  minimized: boolean
  onMinimize: () => void
  onExpand: () => void
  onStop: () => void
  onClose: () => void
}) {
  const logRef = useRef<HTMLDivElement | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef<number>(0)

  useEffect(() => { if (open && status === 'running' && !startRef.current) startRef.current = performance.now() }, [open, status])
  useEffect(() => {
    if (status !== 'running') return
    const t = setInterval(() => setElapsed(Math.floor((performance.now() - (startRef.current || performance.now())) / 1000)), 1000)
    return () => clearInterval(t)
  }, [status])
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight }, [events])

  const running = status === 'running'

  return (
    <AnimatePresence>
      {open && minimized && (
        <motion.button
          key="chip"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
          onClick={onExpand}
          style={{ position: 'fixed', right: 26, bottom: 26, zIndex: 48, display: 'flex', alignItems: 'center', gap: 9, padding: '9px 14px', borderRadius: 24, border: `1px solid ${CYAN}55`, background: 'rgba(6,10,18,0.85)', backdropFilter: 'blur(10px)', color: '#cfe0ee', fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, cursor: 'pointer', boxShadow: `0 0 26px ${CYAN}33` }}
        >
          <span className={running ? 'animate-pulse' : ''} style={{ width: 8, height: 8, borderRadius: '50%', background: running ? CYAN : GREEN, boxShadow: `0 0 10px ${running ? CYAN : GREEN}` }} />
          CLAUDE CODE {running ? `実行中… ${elapsed}s` : '完了 ▸ 結果を見る'}
        </motion.button>
      )}

      {open && !minimized && (
        <motion.div
          key="console"
          initial={{ opacity: 0, scale: 0.97, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 16 }}
          transition={{ duration: 0.32, ease: 'easeOut' }}
          style={{ position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 'min(840px, 74vw)', height: 'min(560px, 72vh)', zIndex: 48, display: 'flex', flexDirection: 'column', borderRadius: 16, border: `1px solid ${CYAN}55`, background: 'rgba(5,9,16,0.80)', backdropFilter: 'blur(18px)', boxShadow: `0 0 80px ${CYAN}26, inset 0 1px 0 rgba(255,255,255,0.06)`, overflow: 'hidden' }}
        >
          <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />
          {/* header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: `1px solid ${CYAN}22` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className={running ? 'animate-pulse' : ''} style={{ width: 9, height: 9, borderRadius: '50%', background: running ? CYAN : status === 'error' ? '#ff6b6b' : GREEN, boxShadow: `0 0 12px ${running ? CYAN : GREEN}` }} />
              <span style={{ fontFamily: 'Orbitron, IBM Plex Mono, monospace', fontWeight: 700, letterSpacing: '0.22em', color: '#eaf2fb', fontSize: 14 }}>CLAUDE&nbsp;CODE</span>
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, letterSpacing: '0.16em', color: running ? CYAN : GREEN, border: `1px solid ${(running ? CYAN : GREEN)}55`, borderRadius: 6, padding: '2px 8px' }}>{STATUS_LABEL[status]}{running ? ` ・ ${elapsed}s` : ''}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {running && <button onClick={onStop} style={btn('#ff8585')}>■ STOP</button>}
              <button onClick={onMinimize} style={btn('#9fb3c8')} aria-label="最小化">—</button>
              <button onClick={onClose} style={btn('#9fb3c8')} aria-label="閉じる">✕</button>
            </div>
          </div>
          {/* stream */}
          <div ref={logRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', fontFamily: 'IBM Plex Mono, monospace', fontSize: 13, lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {events.map((e, i) => {
              if (e.kind === 'tool') return (
                <div key={i} style={{ alignSelf: 'flex-start', color: CYAN, border: `1px solid ${CYAN}44`, background: `${CYAN}12`, borderRadius: 8, padding: '4px 10px', fontSize: 12 }}>🔧 {e.text}</div>
              )
              const color = e.kind === 'result' ? GREEN : e.kind === 'system' ? '#6b7c98' : e.kind === 'raw' ? '#52617a' : '#dce6f2'
              return <div key={i} style={{ color, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{e.text}</div>
            })}
            {running && <div style={{ color: '#6b7c98' }}>▌</div>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function btn(color: string): React.CSSProperties {
  return { fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color, border: '1px solid rgba(255,255,255,0.14)', borderRadius: 7, padding: '3px 10px', background: 'transparent', cursor: 'pointer' }
}
