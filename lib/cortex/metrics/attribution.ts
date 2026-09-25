/**
 * 問い合わせの流入元 (first-touch) 解析。
 * ブラウザ側 (components/analytics/FirstTouchCapture) が初回訪問時に cookie `nands_ft` を 1 度だけ書き、
 * 問い合わせ API がそれを読んで inquiries に記録する。フォームごとの改修が不要なのが利点。
 */
import { classifyChannel, detectAiEngine, type TrafficChannel } from './traffic-channel'

export const FIRST_TOUCH_COOKIE = 'nands_ft'

export interface Attribution {
  readonly landing_path: string | null
  readonly referrer: string | null
  readonly utm_source: string | null
  readonly utm_medium: string | null
  readonly utm_campaign: string | null
  readonly channel: TrafficChannel
  readonly ai_engine: string | null
}

const EMPTY: Attribution = {
  landing_path: null, referrer: null, utm_source: null, utm_medium: null, utm_campaign: null,
  channel: 'direct', ai_engine: null,
}

function readCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null
  for (const part of cookieHeader.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return v.join('=')
  }
  return null
}

function str(v: unknown, max = 500): string | null {
  return typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null
}

/** cookie ヘッダ文字列から first-touch を取り出す。壊れていても例外にせず direct 扱い */
export function parseAttribution(cookieHeader: string | null): Attribution {
  const raw = readCookie(cookieHeader, FIRST_TOUCH_COOKIE)
  if (!raw) return EMPTY
  try {
    const obj = JSON.parse(decodeURIComponent(raw)) as Record<string, unknown>
    const referrer = str(obj.r)
    const utm_source = str(obj.us, 100)
    const origin = utm_source ?? referrer
    return {
      landing_path: str(obj.p),
      referrer,
      utm_source,
      utm_medium: str(obj.um, 100),
      utm_campaign: str(obj.uc, 200),
      channel: classifyChannel(origin),
      ai_engine: detectAiEngine(origin),
    }
  } catch {
    return EMPTY
  }
}

/** GA4 の `_ga` cookie (GA1.1.123456789.1700000000) から client_id を取り出す */
export function readGaClientId(cookieHeader: string | null): string | null {
  const ga = readCookie(cookieHeader, '_ga')
  const m = ga?.match(/^GA\d\.\d\.(\d+\.\d+)$/)
  return m ? m[1] : null
}

/**
 * 問い合わせ成立を GA4 に `generate_lead` として送る (Measurement Protocol)。
 * 要: GA4 管理画面で作る API シークレット (GA4_MP_API_SECRET)。未設定なら何もしない。best-effort。
 */
export async function sendGa4LeadEvent(cookieHeader: string | null, source: string): Promise<void> {
  const measurementId = process.env.NEXT_PUBLIC_GA_ID
  const apiSecret = process.env.GA4_MP_API_SECRET
  if (!measurementId || !apiSecret) return
  const clientId = readGaClientId(cookieHeader) ?? `${Date.now()}.${Math.floor(Math.random() * 1e9)}`
  try {
    await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(measurementId)}&api_secret=${encodeURIComponent(apiSecret)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId, events: [{ name: 'generate_lead', params: { lead_source: source } }] }),
      },
    )
  } catch (e) {
    console.error('sendGa4LeadEvent failed (non-blocking):', e instanceof Error ? e.message : e)
  }
}
