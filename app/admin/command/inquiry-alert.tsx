'use client'

/**
 * Inquiry alert overlay for the 司令塔: full-screen pulsing ring + toast +
 * WebAudio beep when a new inquiry arrives. Kiosk autoplay policy → one-time
 * "サウンド有効化" button (operator clicks once) to unlock audio.
 */

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Latest = { id: string; name: string | null; source: string } | null

export default function InquiryAlert({ latest }: { latest: Latest }) {
  const prevId = useRef<string | null>(null)
  const seenFirst = useRef(false)
  const [active, setActive] = useState<{ name: string; source: string } | null>(null)
  const [soundOn, setSoundOn] = useState(false)
  const ctxRef = useRef<AudioContext | null>(null)

  const beep = () => {
    const ctx = ctxRef.current
    if (!ctx) return
    const now = ctx.currentTime
    // two-tone alert
    ;[880, 1320].forEach((f, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = f
      osc.connect(gain); gain.connect(ctx.destination)
      const t = now + i * 0.18
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.32)
      osc.start(t); osc.stop(t + 0.34)
    })
  }

  useEffect(() => {
    if (!latest) return
    if (!seenFirst.current) { seenFirst.current = true; prevId.current = latest.id; return } // ignore baseline
    if (latest.id !== prevId.current) {
      prevId.current = latest.id
      setActive({ name: latest.name || '匿名', source: latest.source })
      beep()
      const t = setTimeout(() => setActive(null), 8000)
      return () => clearTimeout(t)
    }
  }, [latest])

  const enableSound = () => {
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      ctxRef.current = new Ctx()
      ctxRef.current.resume()
      setSoundOn(true)
      // tiny confirmation blip
      setTimeout(beep, 60)
    } catch { /* ignore */ }
  }

  return (
    <>
      {/* one-time sound enable (kiosk) */}
      {!soundOn && (
        <button onClick={enableSound}
          className="fixed bottom-5 right-5 z-50 px-4 py-2 rounded-full text-sm border border-[#3DDC91]/50 text-[#3DDC91] bg-[#070b16]/80 backdrop-blur hover:bg-[#0b1424]">
          🔊 サウンド有効化
        </button>
      )}

      <AnimatePresence>
        {active && (
          <motion.div key={prevId.current} className="fixed inset-0 z-40 pointer-events-none flex items-start justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* expanding rings */}
            {[0, 1, 2].map((i) => (
              <motion.div key={i} className="absolute top-1/2 left-1/2 rounded-full border"
                style={{ borderColor: '#3DDC91', translateX: '-50%', translateY: '-50%' }}
                initial={{ width: 80, height: 80, opacity: 0.7 }}
                animate={{ width: 1400, height: 1400, opacity: 0 }}
                transition={{ duration: 2.4, delay: i * 0.5, repeat: 1, ease: 'easeOut' }} />
            ))}
            {/* edge glow */}
            <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.4, 1, 0] }}
              transition={{ duration: 3, times: [0, 0.1, 0.5, 0.7, 1] }}
              style={{ boxShadow: 'inset 0 0 200px rgba(61,220,145,0.45)' }} />
            {/* toast */}
            <motion.div className="mt-16 px-8 py-5 rounded-xl border border-[#3DDC91]/60 bg-[#070b16]/90 backdrop-blur-md text-center"
              initial={{ y: -40, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -40, opacity: 0 }}
              style={{ boxShadow: '0 0 50px rgba(61,220,145,0.4)' }}>
              <div className="text-[#3DDC91] text-sm tracking-[0.3em]">🟢 NEW INQUIRY ・ 問い合わせ着信</div>
              <div className="text-white text-2xl font-bold mt-1">{active.name}</div>
              <div className="text-slate-400 text-sm mt-1">source: {active.source}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
