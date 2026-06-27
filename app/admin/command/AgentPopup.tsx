'use client'

/**
 * 司令塔 Claude Code ポップアップ (Phase 3): semi-transparent panel that shows
 * the real Claude Code run streaming live ("キャラ＝Claude Code" の演出＋実体)。
 * STOP kills the run; ✕ closes the panel.
 */

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Ev = { kind: 'text' | 'tool' | 'system' | 'result' | 'raw'; text: string }
const CYAN = '#38E1D8'

const COLOR: Record<Ev['kind'], string> = {
  text: '#dce6f2', tool: CYAN, system: '#6b7c98', result: '#3DDC91', raw: '#52617a',
}

export default function AgentPopup({
  open, running, events, onStop, onClose,
}: { open: boolean; running: boolean; events: Ev[]; onStop: () => void; onClose: () => void }) {
  const logRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [events])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            position: 'fixed', right: 24, bottom: 24, width: 560, maxWidth: '46vw', height: 420, zIndex: 45,
            borderRadius: 14, border: `1px solid ${CYAN}44`, background: 'rgba(6,10,18,0.82)',
            backdropFilter: 'blur(14px)', boxShadow: `0 0 50px ${CYAN}22, inset 0 1px 0 rgba(255,255,255,0.05)`,
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className={running ? 'animate-pulse' : ''} style={{ width: 8, height: 8, borderRadius: '50%', background: running ? CYAN : '#3DDC91', boxShadow: `0 0 10px ${running ? CYAN : '#3DDC91'}` }} />
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, letterSpacing: '0.18em', color: '#cfe0ee' }}>
                CLAUDE CODE ・ {running ? '実行中…' : '完了'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {running && (
                <button onClick={onStop} style={{ fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', color: '#ff8585', border: '1px solid #ff858566', borderRadius: 7, padding: '3px 10px', background: 'transparent', cursor: 'pointer' }}>■ STOP</button>
              )}
              <button onClick={onClose} aria-label="閉じる" style={{ fontSize: 13, color: '#6b7c98', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 7, padding: '3px 9px', background: 'transparent', cursor: 'pointer' }}>✕</button>
            </div>
          </div>
          <div ref={logRef} style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', fontFamily: 'IBM Plex Mono, monospace', fontSize: 12.5, lineHeight: 1.6 }}>
            {events.map((e, i) => (
              <div key={i} style={{ color: COLOR[e.kind], whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginBottom: 2 }}>
                {e.text}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
