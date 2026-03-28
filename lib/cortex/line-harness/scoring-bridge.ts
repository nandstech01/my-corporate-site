/**
 * CORTEX Scoring Bridge
 *
 * Aggregates SNS engagement data into a unified lead score per LINE friend,
 * pushes score updates to Supabase, and triggers tier changes (rich menu
 * switches, Slack notifications) when a friend crosses a threshold.
 *
 * Designed to run as a cron job, processing friends in batches.
 */

import { getLineHarnessClientSafe } from './client'
import { getSupabase } from '../discord/context-builder'
import { SCORE_TIERS, SNS_ENGAGEMENT_SCORES } from './types'
import type { LineFirendMirror, ScoringEvent, ScoreTier } from './types'
import {
  sendMessage,
  SLACK_GENERAL_CHANNEL_ID,
} from '@/lib/slack-bot/slack-client'

// ============================================================
// Constants
// ============================================================

const BATCH_SIZE = 100
const LOOKBACK_HOURS = 24

// ============================================================
// Types
// ============================================================

interface ScoringBridgeReport {
  readonly processed: number
  readonly score_updates: number
  readonly tier_changes: readonly TierChange[]
  readonly errors: number
}

interface TierChange {
  readonly line_user_id: string
  readonly from: string
  readonly to: string
}

interface PlatformEngagement {
  readonly platform: string
  readonly total_likes: number
  readonly total_reposts: number
  readonly total_replies: number
  readonly total_impressions: number
}

// ============================================================
// Score Calculation
// ============================================================

function computeScoreDelta(engagements: readonly PlatformEngagement[]): number {
  let delta = 0

  for (const eng of engagements) {
    const weights = SNS_ENGAGEMENT_SCORES[eng.platform]
    if (!weights) continue

    // Map analytics columns to scoring weight keys
    delta += eng.total_likes * (weights.like ?? 0)
    delta += eng.total_reposts * (weights.retweet ?? weights.repost ?? weights.share ?? 0)
    delta += eng.total_replies * (weights.reply ?? weights.comment ?? 0)
  }

  return delta
}

function determineTier(score: number): ScoreTier {
  // SCORE_TIERS is sorted descending by min_score (hot=100, warm=30, cold=0)
  for (const tier of SCORE_TIERS) {
    if (score >= tier.min_score) return tier
  }
  return SCORE_TIERS[SCORE_TIERS.length - 1]
}

// ============================================================
// Data Fetching (SELECT only on existing analytics tables)
// ============================================================

async function fetchRecentXEngagement(
  sinceISO: string,
): Promise<PlatformEngagement | null> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('x_post_analytics')
    .select('likes, reposts, replies, impressions')
    .gte('posted_at', sinceISO)

  if (error) {
    console.log(`[scoring-bridge] Failed to fetch X analytics: ${error.message}`)
    return null
  }

  if (!data || data.length === 0) return null

  const totals = data.reduce(
    (acc, row) => ({
      total_likes: acc.total_likes + ((row.likes as number) ?? 0),
      total_reposts: acc.total_reposts + ((row.reposts as number) ?? 0),
      total_replies: acc.total_replies + ((row.replies as number) ?? 0),
      total_impressions: acc.total_impressions + ((row.impressions as number) ?? 0),
    }),
    { total_likes: 0, total_reposts: 0, total_replies: 0, total_impressions: 0 },
  )

  return { platform: 'x', ...totals }
}

async function fetchRecentLinkedInEngagement(
  sinceISO: string,
): Promise<PlatformEngagement | null> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('linkedin_post_analytics')
    .select('likes, comments, shares, impressions')
    .gte('posted_at', sinceISO)

  if (error) {
    console.log(`[scoring-bridge] Failed to fetch LinkedIn analytics: ${error.message}`)
    return null
  }

  if (!data || data.length === 0) return null

  const totals = data.reduce(
    (acc, row) => ({
      total_likes: acc.total_likes + ((row.likes as number) ?? 0),
      total_reposts: acc.total_reposts + ((row.shares as number) ?? 0),
      total_replies: acc.total_replies + ((row.comments as number) ?? 0),
      total_impressions: acc.total_impressions + ((row.impressions as number) ?? 0),
    }),
    { total_likes: 0, total_reposts: 0, total_replies: 0, total_impressions: 0 },
  )

  return { platform: 'linkedin', ...totals }
}

async function fetchAllFriends(): Promise<readonly LineFirendMirror[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('cortex_line_friends')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(BATCH_SIZE)

  if (error) {
    throw new Error(`Failed to fetch LINE friends: ${error.message}`)
  }

  return (data ?? []) as readonly LineFirendMirror[]
}

// ============================================================
// Score Persistence (INSERT/UPDATE on cortex_ tables only)
// ============================================================

async function insertScoringLog(event: ScoringEvent): Promise<void> {
  const supabase = getSupabase()

  const { error } = await supabase.from('cortex_line_scoring_log').insert({
    line_user_id: event.line_user_id,
    event_type: event.event_type,
    score_delta: event.score_delta,
    source_platform: event.source_platform,
    source_detail: event.source_detail,
    created_at: new Date().toISOString(),
  })

  if (error) {
    throw new Error(`Failed to insert scoring log: ${error.message}`)
  }
}

async function updateFriendScore(
  lineUserId: string,
  newScore: number,
  newTier: string,
): Promise<void> {
  const supabase = getSupabase()

  const { error } = await supabase
    .from('cortex_line_friends')
    .update({
      current_score: newScore,
      score_tier: newTier,
      synced_at: new Date().toISOString(),
    })
    .eq('line_user_id', lineUserId)

  if (error) {
    throw new Error(`Failed to update friend score: ${error.message}`)
  }
}

// ============================================================
// Tier Change Handlers
// ============================================================

async function handleTierUpgrade(
  friend: LineFirendMirror,
  newTier: ScoreTier,
): Promise<void> {
  // Switch rich menu via LINE Harness SDK if configured
  if (newTier.rich_menu_id && friend.harness_friend_id) {
    const client = getLineHarnessClientSafe()
    if (client) {
      try {
        await client.friends.setRichMenu(
          friend.harness_friend_id,
          newTier.rich_menu_id,
        )
        console.log(
          `[scoring-bridge] Switched rich menu for ${friend.line_user_id} to tier ${newTier.name}`,
        )
      } catch (err) {
        console.log(
          `[scoring-bridge] Failed to switch rich menu for ${friend.line_user_id}: ${err}`,
        )
      }
    }
  }

  // Send Slack notification for hot leads
  if (newTier.name === 'hot') {
    await notifySlackHotLead(friend, newTier)
  }
}

async function notifySlackHotLead(
  friend: LineFirendMirror,
  tier: ScoreTier,
): Promise<void> {
  if (!SLACK_GENERAL_CHANNEL_ID) {
    console.log('[scoring-bridge] No Slack channel configured, skipping hot lead notification')
    return
  }

  const displayName = friend.display_name ?? friend.line_user_id
  const source = friend.source_platform ?? 'unknown'

  const text = [
    `*CORTEX Hot Lead Alert*`,
    `Friend: ${displayName}`,
    `Source: ${source}`,
    `Score: ${friend.current_score} -> ${tier.min_score}+ (hot)`,
    `Tags: ${friend.tags.length > 0 ? friend.tags.join(', ') : 'none'}`,
  ].join('\n')

  try {
    await sendMessage({
      channel: SLACK_GENERAL_CHANNEL_ID,
      text,
    })
  } catch (err) {
    console.log(`[scoring-bridge] Failed to send Slack notification: ${err}`)
  }
}

// ============================================================
// Main Entry Point
// ============================================================

export async function runScoringBridge(): Promise<ScoringBridgeReport> {
  console.log('[scoring-bridge] Starting scoring bridge run')

  const sinceISO = new Date(
    Date.now() - LOOKBACK_HOURS * 60 * 60 * 1000,
  ).toISOString()

  // 1. Fetch aggregate SNS engagement from the lookback window
  const [xEngagement, linkedInEngagement] = await Promise.all([
    fetchRecentXEngagement(sinceISO),
    fetchRecentLinkedInEngagement(sinceISO),
  ])

  const platformEngagements: PlatformEngagement[] = [
    ...(xEngagement ? [xEngagement] : []),
    ...(linkedInEngagement ? [linkedInEngagement] : []),
  ]

  // Compute a global score delta from aggregate SNS activity
  const globalDelta = computeScoreDelta(platformEngagements)

  if (globalDelta === 0) {
    console.log('[scoring-bridge] No new engagement detected, skipping')
    return { processed: 0, score_updates: 0, tier_changes: [], errors: 0 }
  }

  console.log(`[scoring-bridge] Global engagement delta: ${globalDelta}`)

  // 2. Fetch all friends and distribute score proportionally
  const friends = await fetchAllFriends()
  console.log(`[scoring-bridge] Processing ${friends.length} friends`)

  let scoreUpdates = 0
  let errorCount = 0
  const tierChanges: TierChange[] = []

  for (const friend of friends) {
    try {
      // Determine per-friend delta based on source platform affinity
      const friendDelta = computeFriendDelta(friend, platformEngagements, globalDelta)

      if (friendDelta === 0) continue

      const newScore = friend.current_score + friendDelta
      const newTier = determineTier(newScore)
      const oldTier = friend.score_tier

      // Log the scoring event
      await insertScoringLog({
        line_user_id: friend.line_user_id,
        event_type: 'sns_engagement',
        score_delta: friendDelta,
        source_platform: friend.source_platform,
        source_detail: {
          platforms: platformEngagements.map((e) => e.platform),
          global_delta: globalDelta,
          friend_delta: friendDelta,
        },
      })

      // Update the friend record
      await updateFriendScore(friend.line_user_id, newScore, newTier.name)
      scoreUpdates += 1

      // Handle tier transitions
      if (newTier.name !== oldTier) {
        tierChanges.push({
          line_user_id: friend.line_user_id,
          from: oldTier,
          to: newTier.name,
        })

        console.log(
          `[scoring-bridge] Tier change: ${friend.line_user_id} ${oldTier} -> ${newTier.name}`,
        )

        // Only handle upgrades (cold->warm, warm->hot, cold->hot)
        const oldTierObj = determineTier(friend.current_score)
        if (newTier.min_score > oldTierObj.min_score) {
          await handleTierUpgrade(friend, newTier)
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.log(`[scoring-bridge] Error processing ${friend.line_user_id}: ${message}`)
      errorCount += 1
    }
  }

  const report: ScoringBridgeReport = {
    processed: friends.length,
    score_updates: scoreUpdates,
    tier_changes: tierChanges,
    errors: errorCount,
  }

  console.log(
    `[scoring-bridge] Completed. processed=${report.processed}, updates=${report.score_updates}, tier_changes=${report.tier_changes.length}, errors=${report.errors}`,
  )

  return report
}

// ============================================================
// Helpers
// ============================================================

/**
 * Compute per-friend score delta.
 * Friends originating from a specific SNS platform get the full delta
 * for that platform. Friends with no source get a weighted average.
 */
function computeFriendDelta(
  friend: LineFirendMirror,
  engagements: readonly PlatformEngagement[],
  globalDelta: number,
): number {
  const sourcePlatform = friend.source_platform?.toLowerCase()

  if (sourcePlatform) {
    // Friend came from a specific platform - give them that platform's delta
    const matching = engagements.filter((e) => e.platform === sourcePlatform)
    if (matching.length > 0) {
      return computeScoreDelta(matching)
    }
  }

  // No source platform or no matching engagement - distribute evenly
  if (engagements.length === 0) return 0
  return Math.floor(globalDelta / Math.max(engagements.length, 1))
}
