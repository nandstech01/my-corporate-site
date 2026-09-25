/**
 * 流入元 → チャネル分類。GA4 の sessionSource と、問い合わせ時の referrer / utm_source の両方で使う。
 * AI 検索からの流入を他と分けて数えるのが目的 (KGI = コンテンツ経由の問い合わせ)。
 */

export type TrafficChannel = 'ai' | 'search' | 'x' | 'linkedin' | 'crosspost' | 'direct' | 'other'

export type AiEngine = 'chatgpt' | 'perplexity' | 'claude' | 'gemini' | 'copilot' | 'felo' | 'you' | 'phind'

const AI_ENGINES: ReadonlyArray<readonly [AiEngine, RegExp]> = [
  ['chatgpt', /(^|\.)(chatgpt\.com|chat\.openai\.com|openai\.com)$|^chatgpt/],
  ['perplexity', /(^|\.)perplexity\.ai$|^perplexity/],
  ['claude', /(^|\.)claude\.ai$|^claude/],
  ['gemini', /(^|\.)(gemini\.google\.com|bard\.google\.com)$|^gemini/],
  ['copilot', /(^|\.)copilot\.microsoft\.com$|^copilot/],
  ['felo', /(^|\.)felo\.ai$/],
  ['you', /(^|\.)you\.com$/],
  ['phind', /(^|\.)phind\.com$/],
]

const RULES: ReadonlyArray<readonly [TrafficChannel, RegExp]> = [
  ['search', /(^|\.)(google|bing|yahoo|duckduckgo|baidu|yandex|ecosia|brave)(\.[a-z.]+)?$|^(google|bing|yahoo|duckduckgo|brave)$/],
  ['x', /(^|\.)(t\.co|x\.com|twitter\.com)$|^(x|twitter|t\.co)$/],
  ['linkedin', /(^|\.)(linkedin\.com|lnkd\.in)$|^linkedin$/],
  ['crosspost', /(^|\.)(zenn\.dev|qiita\.com|note\.com)$|^(zenn|qiita|note)$/],
]

/** URL・ホスト名・GA4 の sessionSource("google" / "chatgpt.com" / "(direct)") のどれでも受け付ける */
export function normalizeSource(raw: string | null | undefined): string {
  const s = (raw ?? '').trim().toLowerCase()
  if (!s || s === '(direct)' || s === '(none)' || s === '(not set)') return ''
  try {
    if (/^https?:\/\//.test(s)) return new URL(s).hostname.replace(/^www\./, '')
  } catch {
    /* fall through */
  }
  return s.replace(/^www\./, '').split('/')[0]
}

export function detectAiEngine(raw: string | null | undefined): AiEngine | null {
  const host = normalizeSource(raw)
  if (!host) return null
  const hit = AI_ENGINES.find(([, re]) => re.test(host))
  return hit ? hit[0] : null
}

export function classifyChannel(raw: string | null | undefined): TrafficChannel {
  const host = normalizeSource(raw)
  if (!host) return 'direct'
  if (detectAiEngine(host)) return 'ai'
  const hit = RULES.find(([, re]) => re.test(host))
  return hit ? hit[0] : 'other'
}
