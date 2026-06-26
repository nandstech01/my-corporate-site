'use client'

/**
 * 司令塔ライブフィード「いま起きたこと」.
 * Mixed real-time activity stream (X / Threads / blog / cross-post / inquiry),
 * newest first, with relative timestamps and a left-slide entrance per item.
 * Pure additive overlay (left rail, kiosk/wide only) — data from /command-metrics.
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Ev = {
  id: string
  type: 'x' | 'threads' | 'blog' | 'crosspost' | 'inquiry'
  label: string
  sub: string
  ts: string
  url?: string
}

const META: Record<Ev['type'], { icon: string; color: string; tag: string }> = {
  x: { icon: 'X', color: '#38E1D8', tag: 'X' },
  threads: { icon: '@', color: '#b98cff', tag: 'THREADS' },
  blog: { icon: '✎', color: '#E8845C', tag: 'BLOG' },
  crosspost: { icon: '↗', color: '#3DDC91', tag: 'CROSS' },
  inquiry: { icon: '✉', color: '#3DDC91', tag: 'INQUIRY' },
}

function rel(ts: string, now: number): string {
  const d = Math.max(0, now - new Date(ts).getTime())
  const m = Math.floor(d / 60000)
  if (m < 1) return 'たった今'
  if (m < 60) return `${m}分前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}時間前`
  return `${Math.floor(h / 24)}日前`
}

export default function EventFeed({ events }: { events: Ev[] }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 20000)
    return () => clearInterval(t)
  }, [])

  if (!events?.length) return null

  return (
    <div
      className="hidden xl:block"
      style={{ position: 'fixed', left: 24, top: '33vh', width: 340, zIndex: 20, pointerEvents: 'none' }}
    >
      <div
        className="px-4 py-3"
        style={{
          borderRadius: 14,
          border: '1px solid rgba(255,255,255,0.10)',
          background: 'rgba(7,11,22,0.55)',
          backdropFilter: 'blur(10px)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 0 30px rgba(56,225,216,0.10)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#3DDC91', boxShadow: '0 0 10px #3DDC91' }} />
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, letterSpacing: '0.28em', color: '#9fb3c8' }}>
            LIVE ・ いま起きたこと
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {events.slice(0, 7).map((e) => {
              const meta = META[e.type]
              return (
                <motion.div
                  key={e.id}
                  layout
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="flex items-center gap-2.5"
                >
                  <span
                    style={{
                      width: 24, height: 24, borderRadius: 7, flex: '0 0 auto',
                      background: `${meta.color}22`, color: meta.color, fontSize: 12, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {meta.icon}
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 12.5, color: '#dce6f2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {e.label}
                    </div>
                    <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#6b7c98' }}>
                      <span style={{ color: meta.color }}>{meta.tag}</span> · {e.sub} · {rel(e.ts, now)}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
