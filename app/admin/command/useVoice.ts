'use client'

/**
 * 司令塔 voice (Phase 2): speak(text) via ElevenLabs proxy, with graceful
 * fallback to browser SpeechSynthesis. Exposes `speaking` (drives the mascot's
 * talking visor) + a persisted mute toggle + a one-time audio unlock for kiosk
 * autoplay policy.
 */

import { useCallback, useEffect, useRef, useState } from 'react'

export function useVoice() {
  const [muted, setMutedState] = useState(true)
  const [speaking, setSpeaking] = useState(false)
  const [caption, setCaption] = useState<string | null>(null)
  const unlocked = useRef(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const mutedRef = useRef(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('cmdVoiceMuted')
      const m = stored === null ? true : stored === '1' // default OFF until enabled (audio-unlock gesture)
      setMutedState(m); mutedRef.current = m
    } catch { setMutedState(true); mutedRef.current = true }
  }, [])

  const setMuted = useCallback((m: boolean) => {
    setMutedState(m); mutedRef.current = m
    try { localStorage.setItem('cmdVoiceMuted', m ? '1' : '0') } catch { /* ignore */ }
    if (m) {
      try { window.speechSynthesis?.cancel() } catch { /* ignore */ }
      audioRef.current?.pause()
      setSpeaking(false); setCaption(null)
    }
  }, [])

  const unlock = useCallback(() => {
    unlocked.current = true
    // Prime SpeechSynthesis with a silent utterance (satisfies the gesture req).
    try {
      const u = new SpeechSynthesisUtterance(' ')
      u.volume = 0
      window.speechSynthesis?.speak(u)
    } catch { /* ignore */ }
  }, [])

  const browserTTS = useCallback((text: string) => {
    try {
      if (!window.speechSynthesis) return
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'ja-JP'
      u.rate = 1.05
      u.onstart = () => setSpeaking(true)
      u.onend = () => { setSpeaking(false); setCaption(null) }
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(u)
    } catch { setSpeaking(false) }
  }, [])

  const speak = useCallback(async (text: string) => {
    if (!text || mutedRef.current || !unlocked.current) return
    setCaption(text)
    try {
      const r = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const ct = r.headers.get('content-type') || ''
      if (r.ok && ct.includes('audio')) {
        const blob = await r.blob()
        const url = URL.createObjectURL(blob)
        const a = new Audio(url)
        audioRef.current = a
        a.onended = () => { setSpeaking(false); setCaption(null); URL.revokeObjectURL(url) }
        a.onerror = () => { setSpeaking(false); setCaption(null); URL.revokeObjectURL(url) }
        setSpeaking(true)
        await a.play().catch(() => browserTTS(text))
        return
      }
      browserTTS(text) // { fallback: true } or non-audio
    } catch {
      browserTTS(text)
    }
  }, [browserTTS])

  return { speak, speaking, caption, muted, setMuted, unlock }
}
