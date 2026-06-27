'use client'

/**
 * 司令塔マイク (Phase 3): a small stylish mic button at the globe's lower edge.
 * Tap → browser SpeechRecognition (ja-JP) → onTranscript. While listening, a
 * Siri-like ring pulses with live mic amplitude (Web Audio AnalyserNode).
 */

import { useEffect, useRef, useState } from 'react'

const CYAN = '#38E1D8'

export default function MicButton({ onTranscript, busy }: { onTranscript: (t: string) => void; busy?: boolean }) {
  const [supported, setSupported] = useState(true)
  const [listening, setListening] = useState(false)
  const recRef = useRef<unknown>(null)
  const ringRef = useRef<HTMLDivElement | null>(null)
  const audioRef = useRef<{ ctx: AudioContext; stream: MediaStream; raf: number } | null>(null)

  useEffect(() => {
    const SR = (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
    if (!SR.SpeechRecognition && !SR.webkitSpeechRecognition) setSupported(false)
    return () => stopAmp()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stopAmp = () => {
    const a = audioRef.current
    if (!a) return
    cancelAnimationFrame(a.raf)
    a.stream.getTracks().forEach((t) => t.stop())
    void a.ctx.close().catch(() => {})
    audioRef.current = null
    if (ringRef.current) ringRef.current.style.setProperty('--amp', '0')
  }

  const startAmp = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const src = ctx.createMediaStreamSource(stream)
      const an = ctx.createAnalyser()
      an.fftSize = 256
      src.connect(an)
      const data = new Uint8Array(an.frequencyBinCount)
      const tick = () => {
        an.getByteFrequencyData(data)
        let sum = 0
        for (let i = 0; i < data.length; i++) sum += data[i]
        const amp = Math.min(1, sum / data.length / 90)
        if (ringRef.current) ringRef.current.style.setProperty('--amp', amp.toFixed(3))
        const raf = requestAnimationFrame(tick)
        if (audioRef.current) audioRef.current.raf = raf
      }
      audioRef.current = { ctx, stream, raf: requestAnimationFrame(tick) }
    } catch { /* mic denied → ring stays idle */ }
  }

  const start = () => {
    if (!supported || busy || listening) return
    const W = window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown }
    const Ctor = W.SpeechRecognition || W.webkitSpeechRecognition
    if (!Ctor) { setSupported(false); return }
    const rec = new Ctor() as {
      lang: string; interimResults: boolean; continuous: boolean
      onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void
      onend: () => void; onerror: () => void; start: () => void; stop: () => void
    }
    rec.lang = 'ja-JP'
    rec.interimResults = false
    rec.continuous = false
    rec.onresult = (e) => {
      const last = e.results[e.results.length - 1]
      const text = last?.[0]?.transcript?.trim()
      if (text) onTranscript(text)
    }
    rec.onend = () => { setListening(false); stopAmp() }
    rec.onerror = () => { setListening(false); stopAmp() }
    recRef.current = rec
    setListening(true)
    void startAmp()
    try { rec.start() } catch { setListening(false); stopAmp() }
  }

  const stop = () => {
    const rec = recRef.current as { stop: () => void } | null
    try { rec?.stop() } catch { /* ignore */ }
    setListening(false)
    stopAmp()
  }

  if (!supported) return null

  return (
    <div style={{ position: 'fixed', left: '50%', bottom: 70, transform: 'translateX(-50%)', zIndex: 40 }}>
      {/* Siri-like listening rings (amplitude-driven) */}
      {listening && (
        <div ref={ringRef} aria-hidden style={{ ['--amp' as string]: '0', position: 'absolute', left: '50%', top: '50%', width: 0, height: 0 }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{
              position: 'absolute', left: '50%', top: '50%', borderRadius: '50%',
              border: `1.5px solid ${CYAN}`, transform: 'translate(-50%,-50%)',
              width: `calc((54px + ${i * 26}px) * (1 + var(--amp) * 0.9))`,
              height: `calc((54px + ${i * 26}px) * (1 + var(--amp) * 0.9))`,
              opacity: 0.5 - i * 0.13, transition: 'width .08s linear, height .08s linear',
              boxShadow: `0 0 22px ${CYAN}55`,
            }} />
          ))}
        </div>
      )}
      <button
        onClick={listening ? stop : start}
        disabled={busy}
        aria-label={listening ? '停止' : '司令塔に話しかける'}
        style={{
          position: 'relative', width: 52, height: 52, borderRadius: '50%',
          border: `1.5px solid ${listening ? CYAN : 'rgba(56,225,216,0.5)'}`,
          background: listening ? 'rgba(56,225,216,0.18)' : 'rgba(7,11,22,0.85)',
          color: CYAN, fontSize: 22, cursor: busy ? 'not-allowed' : 'pointer',
          backdropFilter: 'blur(8px)', boxShadow: `0 0 24px ${CYAN}${listening ? '88' : '33'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: busy ? 0.5 : 1, transition: 'all .2s',
        }}
      >
        {listening ? '■' : '🎙'}
      </button>
    </div>
  )
}
