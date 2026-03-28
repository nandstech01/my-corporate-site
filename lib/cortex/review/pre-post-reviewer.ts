/**
 * CORTEX Pre-Post Reviewer
 *
 * Evaluates candidate posts for duplicates, staleness, and optimal timing
 * before publishing. Returns scored & annotated ReviewedPost objects.
 */

import { getSupabase } from '../discord/context-builder'

// ============================================================
// Types
// ============================================================

interface CandidatePost {
  text: string
  sourceUrl?: string
  sourceTitle?: string
  platform: string
}

interface ReviewedPost extends CandidatePost {
  cortex_score: number
  duplicate_of?: string
  is_stale: boolean
  recommended_pattern?: string
  recommended_time?: string
  review_notes: string[]
}

// ============================================================
// Helpers
// ============================================================

function bigramOverlap(a: string, b: string): number {
  const bg = (s: string) => {
    const grams = new Set<string>()
    const lower = s.replace(/\s+/g, ' ').trim().toLowerCase()
    for (let i = 0; i < lower.length - 1; i++) grams.add(lower.slice(i, i + 2))
    return grams
  }
  const setA = bg(a), setB = bg(b)
  let intersection = 0
  for (const g of Array.from(setA)) if (setB.has(g)) intersection++
  const union = new Set([...Array.from(setA), ...Array.from(setB)]).size
  return union === 0 ? 0 : intersection / union
}

function extractUrls(text: string): string[] {
  const matches = text.match(/https?:\/\/[^\s)>\]]+/g)
  return matches ?? []
}

function checkStaleness(sourceUrl?: string, sourceTitle?: string): boolean {
  const datePattern = /(\d{4})[-/](\d{1,2})[-/](\d{1,2})/
  const candidates = [sourceUrl, sourceTitle].filter(Boolean).join(' ')
  const match = candidates.match(datePattern)
  if (!match) return false

  const articleDate = new Date(
    parseInt(match[1]),
    parseInt(match[2]) - 1,
    parseInt(match[3])
  )
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  return articleDate < sevenDaysAgo
}

// ============================================================
// Main
// ============================================================

// ============================================================
// Auto-Post Gate
// ============================================================

interface AutoPostGate {
  cortex_score: number
  is_duplicate: boolean
  is_stale: boolean
  timing_score: number
  posts_today: number
  max_posts_per_day: number
}

export function canAutoPost(gate: AutoPostGate): { allowed: boolean; reason: string } {
  if (gate.is_duplicate) return { allowed: false, reason: '重複検出' }
  if (gate.is_stale) return { allowed: false, reason: '記事が古い (7日以上前)' }
  if (gate.cortex_score < 0.6) return { allowed: false, reason: `cortexスコア不足: ${gate.cortex_score.toFixed(2)} < 0.6` }
  // タイミングは参考情報。内容が良ければ投稿する。極端に悪い時間帯(深夜2-5時)のみブロック
  if (gate.timing_score <= 0.1) return { allowed: false, reason: `深夜帯のため投稿見送り: timing=${gate.timing_score.toFixed(2)}` }
  if (gate.posts_today >= gate.max_posts_per_day) return { allowed: false, reason: `1日の投稿上限: ${gate.posts_today}/${gate.max_posts_per_day}` }
  return { allowed: true, reason: 'ゲート通過: 自動投稿OK' }
}

export async function cortexReview(candidates: CandidatePost[]): Promise<ReviewedPost[]> {
  const supabase = getSupabase()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const since = thirtyDaysAgo.toISOString()

  console.log(`[cortex-review] Reviewing ${candidates.length} candidates`)

  // Fetch recent posts for duplicate checking
  const { data: recentPosts } = await supabase
    .from('x_post_analytics')
    .select('post_text, tweet_id, source_url')
    .gte('created_at', since)

  const existingPosts = recentPosts ?? []

  const results: ReviewedPost[] = []
  let approvedCount = 0
  let duplicateCount = 0
  let staleCount = 0
  let topPattern: string | undefined
  let topTime: string | undefined

  for (const candidate of candidates) {
    const notes: string[] = []
    let duplicateOf: string | undefined
    const isStale = checkStaleness(candidate.sourceUrl, candidate.sourceTitle)

    // --- Text duplicate check ---
    for (const existing of existingPosts) {
      if (!existing.post_text) continue
      const overlap = bigramOverlap(candidate.text, existing.post_text)
      if (overlap >= 0.35) {
        duplicateOf = existing.tweet_id
        notes.push(`テキスト重複: overlap=${(overlap * 100).toFixed(0)}% (tweet_id=${existing.tweet_id})`)
        break
      }
    }

    // --- URL duplicate check ---
    if (!duplicateOf) {
      const urls = extractUrls(candidate.text)
      for (const url of urls) {
        const match = existingPosts.find((p) => p.source_url === url)
        if (match) {
          duplicateOf = match.tweet_id
          notes.push(`URL重複: ${url} (tweet_id=${match.tweet_id})`)
          break
        }
      }
    }

    if (isStale) notes.push('記事が7日以上前のため古い判定')

    // --- Temporal recommendation ---
    const { data: temporalRows } = await supabase
      .from('cortex_temporal_patterns')
      .select('day_of_week, hour, recommendation_score')
      .eq('platform', candidate.platform)
      .order('recommendation_score', { ascending: false })
      .limit(1)

    let recommendedTime: string | undefined
    let temporalScore = 0.5
    if (temporalRows && temporalRows.length > 0) {
      const t = temporalRows[0]
      recommendedTime = `${t.day_of_week} ${t.hour}時`
      temporalScore = Math.min(1, Math.max(0, (t.recommendation_score ?? 50) / 100))
      notes.push(`推奨時間: ${recommendedTime}`)
    }

    // --- Pattern recommendation ---
    const { data: patternRows } = await supabase
      .from('pattern_performance')
      .select('pattern_name, avg_engagement, success_rate')
      .eq('platform', candidate.platform)
      .order('avg_engagement', { ascending: false })
      .limit(3)

    let recommendedPattern: string | undefined
    if (patternRows && patternRows.length > 0) {
      recommendedPattern = patternRows[0].pattern_name
      notes.push(`推奨パターン: ${recommendedPattern} (成功率${((patternRows[0].success_rate ?? 0) * 100).toFixed(0)}%)`)
    }

    // --- Score calculation ---
    let cortexScore: number
    if (duplicateOf) {
      cortexScore = 0
    } else if (isStale) {
      cortexScore = 0.2
    } else {
      cortexScore = temporalScore
    }

    if (cortexScore > 0) approvedCount++
    if (duplicateOf) duplicateCount++
    if (isStale && !duplicateOf) staleCount++

    if (!topPattern && recommendedPattern) topPattern = recommendedPattern
    if (!topTime && recommendedTime) topTime = recommendedTime

    results.push({
      ...candidate,
      cortex_score: cortexScore,
      duplicate_of: duplicateOf,
      is_stale: isStale,
      recommended_pattern: recommendedPattern,
      recommended_time: recommendedTime,
      review_notes: notes,
    })
  }

  // --- Discord notification ---
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (webhookUrl) {
    const patternLine = topPattern ? `推奨パターン: ${topPattern}` : ''
    const timeLine = topTime ? `推奨時間: ${topTime}` : ''
    const summary = [
      '🧠 CORTEX Pre-Post Review',
      '━━━━━━━━━━━━━━━━',
      `📝 候補: ${candidates.length}件`,
      `✅ 承認: ${approvedCount}件`,
      `❌ 重複除外: ${duplicateCount}件`,
      `⏰ 古い記事除外: ${staleCount}件`,
      patternLine,
      timeLine,
    ].filter(Boolean).join('\n')

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: summary }),
      })
    } catch (err) {
      console.error('[cortex-review] Discord notification failed:', err)
    }
  }

  console.log(`[cortex-review] Done: ${approvedCount} approved, ${duplicateCount} duplicates, ${staleCount} stale`)
  return results
}
