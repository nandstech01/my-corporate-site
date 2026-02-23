/**
 * L1: 事前生成ガード (Pre-Generation Guard)
 *
 * 6時間毎にBrave Searchで災害・炎上・障害をスキャン。
 * auto-resolverからはDB照会のみ（高速）。
 */

import { createClient } from '@supabase/supabase-js'
import { notifySafetyEvent } from '../ai-judge/slack-notifier'
import type { DetectedSafetyEvent, PreGenerationCheckResult } from './types'

// ============================================================
// Constants
// ============================================================

const SAFETY_EVENT_TTL_HOURS = 6

const SAFETY_QUERIES = [
  'AI tech company disaster accident outage today',
  'テック企業 事故 障害 炎上 today',
  'social media platform outage shutdown today',
]

const DANGER_KEYWORDS_JA = ['事故', '障害', '停止', '炎上', '不正', '漏洩', '災害', '地震', '津波']
const DANGER_KEYWORDS_EN = ['outage', 'breach', 'scandal', 'shutdown', 'disaster', 'earthquake', 'tsunami', 'controversy']
const ALL_DANGER_KEYWORDS = [...DANGER_KEYWORDS_JA, ...DANGER_KEYWORDS_EN]

// ============================================================
// Supabase Client
// ============================================================

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  }
  return createClient(url, key)
}

// ============================================================
// Brave Search
// ============================================================

interface BraveSearchResult {
  readonly title: string
  readonly url: string
  readonly description: string
}

async function searchBrave(query: string): Promise<readonly BraveSearchResult[]> {
  const apiKey = process.env.BRAVE_API_KEY
  if (!apiKey) return []

  try {
    const params = new URLSearchParams({
      q: query,
      count: '5',
      freshness: 'pd', // past day
    })

    const response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?${params}`,
      {
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip',
          'X-Subscription-Token': apiKey,
        },
        signal: AbortSignal.timeout(10000),
      },
    )

    if (!response.ok) return []

    const data = await response.json() as {
      web?: { results?: readonly { title: string; url: string; description: string }[] }
    }

    return (data.web?.results ?? []).map((r) => ({
      title: r.title,
      url: r.url,
      description: r.description ?? '',
    }))
  } catch {
    return []
  }
}

// ============================================================
// Keyword Scoring
// ============================================================

function scoreResult(result: BraveSearchResult): {
  readonly matchedKeywords: readonly string[]
  readonly severity: 'critical' | 'high' | 'medium'
  readonly eventType: DetectedSafetyEvent['eventType']
} {
  const text = `${result.title} ${result.description}`.toLowerCase()
  const matchedKeywords = ALL_DANGER_KEYWORDS.filter((kw) =>
    text.includes(kw.toLowerCase()),
  )

  const severity = matchedKeywords.length >= 3
    ? 'critical'
    : matchedKeywords.length >= 2
      ? 'high'
      : 'medium'

  const eventType: DetectedSafetyEvent['eventType'] =
    text.includes('outage') || text.includes('障害') || text.includes('停止')
      ? 'platform_outage'
      : text.includes('scandal') || text.includes('炎上') || text.includes('controversy')
        ? 'controversy'
        : 'disaster'

  return { matchedKeywords, severity, eventType }
}

// ============================================================
// Scanner (Cron entry point)
// ============================================================

export async function runSafetyEventScanner(): Promise<void> {
  process.stdout.write('Safety Event Scanner: Starting...\n')

  // Run all queries in parallel
  const allResults = await Promise.all(
    SAFETY_QUERIES.map((q) => searchBrave(q)),
  )

  const flatResults = allResults.flat()
  const detectedEvents: DetectedSafetyEvent[] = []

  for (const result of flatResults) {
    const { matchedKeywords, severity, eventType } = scoreResult(result)

    // Only flag if at least 2 keywords matched
    if (matchedKeywords.length >= 2) {
      detectedEvents.push({
        eventType,
        title: result.title,
        url: result.url,
        severity,
        keywords: matchedKeywords,
      })
    }
  }

  // Deduplicate by URL
  const seen = new Set<string>()
  const uniqueEvents = detectedEvents.filter((e) => {
    if (seen.has(e.url)) return false
    seen.add(e.url)
    return true
  })

  if (uniqueEvents.length === 0) {
    process.stdout.write('Safety Event Scanner: No safety events detected\n')
    return
  }

  // Insert detected events into DB
  const supabase = getSupabase()
  const expiresAt = new Date(Date.now() + SAFETY_EVENT_TTL_HOURS * 60 * 60 * 1000).toISOString()

  for (const event of uniqueEvents) {
    try {
      const { error } = await supabase.from('safety_events').insert({
        event_type: event.eventType,
        description: `[Auto] ${event.title}`,
        severity: event.severity,
        platforms_affected: ['x', 'linkedin'],
        keywords: [...event.keywords],
        active: true,
        created_by: 'auto',
        expires_at: expiresAt,
        auto_detected: true,
        detection_source: 'brave_search',
      })

      if (error) {
        process.stdout.write(`Safety Event Scanner: Insert error: ${error.message}\n`)
        continue
      }

      await notifySafetyEvent({
        eventType: 'disaster_pause',
        severity: event.severity,
        summary: `自動検出: ${event.title}\nキーワード: ${event.keywords.join(', ')}\nURL: ${event.url}`,
      })

      process.stdout.write(`Safety Event Scanner: Detected "${event.title}" (${event.severity})\n`)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'unknown'
      process.stdout.write(`Safety Event Scanner: Error processing event: ${msg}\n`)
    }
  }

  process.stdout.write(`Safety Event Scanner: ${uniqueEvents.length} event(s) recorded\n`)
}

// ============================================================
// Pre-Generation Check (fast DB query)
// ============================================================

export async function isPreGenerationSafe(): Promise<PreGenerationCheckResult> {
  const supabase = getSupabase()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('safety_events')
    .select('event_type, description, severity, keywords')
    .eq('active', true)
    .in('event_type', ['disaster', 'controversy', 'platform_outage'])
    .or(`expires_at.is.null,expires_at.gt.${now}`)

  if (error) {
    throw new Error(`Pre-generation safety check failed: ${error.message}`)
  }

  if (!data || data.length === 0) {
    return { safe: true, detectedEvents: [] }
  }

  const detectedEvents: DetectedSafetyEvent[] = data.map((row) => ({
    eventType: row.event_type as DetectedSafetyEvent['eventType'],
    title: row.description,
    url: '',
    severity: row.severity as DetectedSafetyEvent['severity'],
    keywords: (row.keywords ?? []) as string[],
  }))

  const mostSevere = detectedEvents.find((e) => e.severity === 'critical')
    ?? detectedEvents[0]

  return {
    safe: false,
    pauseReason: `安全イベント検出: ${mostSevere.title}`,
    detectedEvents,
  }
}
