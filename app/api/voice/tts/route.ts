import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * ElevenLabs TTS proxy (Phase 2). Keeps the API key server-side.
 * POST { text } → audio/mpeg stream. If no key / quota error, returns
 * { fallback: true } (200) so the client falls back to browser SpeechSynthesis.
 * Cost guard: text is clipped per call; rely on the ElevenLabs plan quota.
 */
const DEFAULT_VOICE = '21m00Tcm4TlvDq8ikWAM' // override with ELEVENLABS_VOICE_ID
const MODEL = 'eleven_flash_v2_5' // low latency, multilingual (ja)
const MAX_CHARS = 600

export async function POST(req: Request) {
  let text = ''
  try {
    const body = (await req.json()) as { text?: string }
    text = (body.text ?? '').trim()
  } catch {
    return NextResponse.json({ error: 'bad request' }, { status: 400 })
  }
  if (!text) return NextResponse.json({ error: 'empty text' }, { status: 400 })

  const key = process.env.ELEVENLABS_API_KEY
  if (!key) return NextResponse.json({ fallback: true, reason: 'no-key' })

  const voice = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE
  const clipped = text.slice(0, MAX_CHARS)

  try {
    const r = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: clipped,
          model_id: MODEL,
          voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.0, use_speaker_boost: true },
        }),
      },
    )
    if (!r.ok || !r.body) {
      return NextResponse.json({ fallback: true, reason: `elevenlabs ${r.status}` })
    }
    return new Response(r.body, {
      headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' },
    })
  } catch (e) {
    return NextResponse.json({ fallback: true, reason: e instanceof Error ? e.message : 'tts error' })
  }
}
