/**
 * Daily post-limit checker — enforces the CORTEX rule of max 3 posts per
 * platform per JST day. Used as the last gate before publishing.
 *
 * Counts posts in `cortex_pending_posts` where `status='posted'` and
 * `posted_at` falls within the current JST day window (05:00 JST → 04:59 JST).
 * The 05:00 cutoff matches the existing "深夜2-5時はブロック" CORTEX rule.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export type Platform = 'x' | 'linkedin' | 'threads' | 'instagram'

export interface DailyLimitResult {
  readonly canPost: boolean
  readonly postsToday: number
  readonly limit: number
  readonly windowStart: string
  readonly windowEnd: string
  readonly reason?: string
}

const DEFAULT_DAILY_LIMIT = 3
const JST_OFFSET_HOURS = 9
const DAILY_RESET_HOUR_JST = 5

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

/**
 * Compute the current JST "post day" window: starts at 05:00 JST today
 * (or 05:00 JST yesterday if we're currently before 05:00 JST).
 */
export function getJstDayWindow(now: Date = new Date()): { start: Date; end: Date } {
  // Convert "now" into JST clock fields
  const jstMs = now.getTime() + JST_OFFSET_HOURS * 3600_000
  const jstDate = new Date(jstMs)
  const jstHour = jstDate.getUTCHours()

  // Start = today 05:00 JST, unless we're before 05:00 JST → shift back 1 day
  const startJstDate = new Date(Date.UTC(
    jstDate.getUTCFullYear(),
    jstDate.getUTCMonth(),
    jstDate.getUTCDate(),
    DAILY_RESET_HOUR_JST,
    0,
    0,
    0,
  ))
  if (jstHour < DAILY_RESET_HOUR_JST) {
    startJstDate.setUTCDate(startJstDate.getUTCDate() - 1)
  }

  // Convert back to UTC instants
  const start = new Date(startJstDate.getTime() - JST_OFFSET_HOURS * 3600_000)
  const end = new Date(start.getTime() + 24 * 3600_000)
  return { start, end }
}

/**
 * Check whether another post can be made today on a given platform.
 */
export async function checkDailyPostLimit(
  platform: Platform,
  options: { readonly limit?: number; readonly now?: Date } = {},
): Promise<DailyLimitResult> {
  const limit = options.limit ?? DEFAULT_DAILY_LIMIT
  const { start, end } = getJstDayWindow(options.now)

  const supabase = getSupabase()
  if (!supabase) {
    return {
      canPost: true,
      postsToday: 0,
      limit,
      windowStart: start.toISOString(),
      windowEnd: end.toISOString(),
      reason: 'Supabase unavailable — fail-open (assume safe)',
    }
  }

  const { count, error } = await supabase
    .from('cortex_pending_posts')
    .select('id', { count: 'exact', head: true })
    .eq('platform', platform)
    .eq('status', 'posted')
    .gte('posted_at', start.toISOString())
    .lt('posted_at', end.toISOString())

  if (error) {
    return {
      canPost: true,
      postsToday: 0,
      limit,
      windowStart: start.toISOString(),
      windowEnd: end.toISOString(),
      reason: `Supabase query error: ${error.message} — fail-open`,
    }
  }

  const postsToday = count ?? 0
  const canPost = postsToday < limit
  return {
    canPost,
    postsToday,
    limit,
    windowStart: start.toISOString(),
    windowEnd: end.toISOString(),
    reason: canPost ? undefined : `Daily limit reached (${postsToday}/${limit})`,
  }
}
