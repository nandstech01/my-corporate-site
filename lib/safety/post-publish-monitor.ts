/**
 * L4: 投稿後監視 (Post-Publish Monitor)
 *
 * エンゲージメント異常検知。engagement learnerから呼び出し。
 * critical異常2件以上 → キルスイッチ自動発動。
 */

import { createClient } from '@supabase/supabase-js'
import { activateKillSwitch } from '../ai-judge/emergency'
import { notifySafetyEvent } from '../ai-judge/slack-notifier'
import type { Platform } from '../ai-judge/types'
import type { EngagementAnomaly, PostPublishCheckResult } from './types'

// ============================================================
// Constants
// ============================================================

const NEGATIVE_SPIKE_REPLY_MULTIPLIER = 3
const NEGATIVE_SPIKE_LIKE_THRESHOLD = 0.5
const ENGAGEMENT_CLIFF_HOURS = 24
const KILL_SWITCH_CRITICAL_THRESHOLD = 2
const KILL_SWITCH_WINDOW_HOURS = 24
const HISTORICAL_AVERAGE_DAYS = 30
const MONITOR_LOOKBACK_HOURS = 48

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
// Historical Averages
// ============================================================

interface HistoricalAverages {
  readonly avgLikes: number
  readonly avgReplies: number
  readonly avgTotalEngagement: number
}

async function getHistoricalAverages(
  platform: Platform,
): Promise<HistoricalAverages> {
  const supabase = getSupabase()
  const since = new Date(Date.now() - HISTORICAL_AVERAGE_DAYS * 24 * 60 * 60 * 1000).toISOString()

  const table = platform === 'linkedin' ? 'linkedin_post_analytics' : 'x_post_analytics'
  const likesCol = platform === 'linkedin' ? 'reactions' : 'likes'
  const repliesCol = platform === 'linkedin' ? 'comments' : 'replies'

  const { data, error } = await supabase
    .from(table)
    .select(`${likesCol}, ${repliesCol}, impressions`)
    .gte('posted_at', since)

  if (error || !data || data.length === 0) {
    return { avgLikes: 0, avgReplies: 0, avgTotalEngagement: 0 }
  }

  let totalLikes = 0
  let totalReplies = 0
  let totalEngagement = 0

  for (const row of data) {
    const likes = (row as Record<string, number>)[likesCol] ?? 0
    const replies = (row as Record<string, number>)[repliesCol] ?? 0
    totalLikes += likes
    totalReplies += replies
    totalEngagement += likes + replies
  }

  return {
    avgLikes: totalLikes / data.length,
    avgReplies: totalReplies / data.length,
    avgTotalEngagement: totalEngagement / data.length,
  }
}

// ============================================================
// Anomaly Detection
// ============================================================

interface PostMetrics {
  readonly postId: string
  readonly likes: number
  readonly replies: number
  readonly totalEngagement: number
  readonly hoursOld: number
}

function detectNegativeSpike(
  metrics: PostMetrics,
  averages: HistoricalAverages,
): EngagementAnomaly | null {
  if (averages.avgReplies === 0 || averages.avgLikes === 0) return null

  const replySpike = metrics.replies > averages.avgReplies * NEGATIVE_SPIKE_REPLY_MULTIPLIER
  const likeDrop = metrics.likes < averages.avgLikes * NEGATIVE_SPIKE_LIKE_THRESHOLD

  if (replySpike && likeDrop) {
    return {
      postId: metrics.postId,
      platform: '',  // Set by caller
      anomalyType: 'negative_spike',
      severity: metrics.replies > averages.avgReplies * 5 ? 'critical' : 'high',
      details: {
        replies: metrics.replies,
        avgReplies: averages.avgReplies,
        likes: metrics.likes,
        avgLikes: averages.avgLikes,
      },
    }
  }

  return null
}

function detectEngagementCliff(
  metrics: PostMetrics,
): EngagementAnomaly | null {
  if (metrics.hoursOld < ENGAGEMENT_CLIFF_HOURS) return null

  if (metrics.totalEngagement === 0) {
    return {
      postId: metrics.postId,
      platform: '',  // Set by caller
      anomalyType: 'engagement_cliff',
      severity: 'medium',
      details: {
        totalEngagement: 0,
        hoursOld: metrics.hoursOld,
      },
    }
  }

  return null
}

// ============================================================
// Record Anomaly
// ============================================================

async function recordAnomaly(
  anomaly: EngagementAnomaly,
): Promise<void> {
  const supabase = getSupabase()

  try {
    await supabase.from('safety_events').insert({
      event_type: anomaly.anomalyType === 'negative_spike' ? 'controversy' : 'platform_outage',
      description: `[L4] ${anomaly.anomalyType}: post ${anomaly.postId}`,
      severity: anomaly.severity,
      platforms_affected: [anomaly.platform],
      keywords: [anomaly.anomalyType],
      active: true,
      created_by: 'auto',
      auto_detected: true,
      detection_source: 'post_publish_monitor',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
  } catch {
    // Best-effort recording
  }
}

// ============================================================
// Check Kill Switch Trigger
// ============================================================

async function shouldTriggerKillSwitch(): Promise<boolean> {
  const supabase = getSupabase()
  const since = new Date(Date.now() - KILL_SWITCH_WINDOW_HOURS * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('safety_events')
    .select('id')
    .eq('auto_detected', true)
    .eq('detection_source', 'post_publish_monitor')
    .in('severity', ['critical'])
    .gte('created_at', since)

  if (error || !data) return false

  return data.length >= KILL_SWITCH_CRITICAL_THRESHOLD
}

// ============================================================
// Main: Run Post-Publish Monitor
// ============================================================

export async function runPostPublishMonitor(
  platform: Platform,
): Promise<PostPublishCheckResult> {
  const supabase = getSupabase()
  const since = new Date(Date.now() - MONITOR_LOOKBACK_HOURS * 60 * 60 * 1000).toISOString()

  const table = platform === 'linkedin' ? 'linkedin_post_analytics' : 'x_post_analytics'
  const idCol = platform === 'linkedin' ? 'linkedin_post_id' : 'tweet_id'
  const likesCol = platform === 'linkedin' ? 'reactions' : 'likes'
  const repliesCol = platform === 'linkedin' ? 'comments' : 'replies'

  const { data: recentPosts, error } = await supabase
    .from(table)
    .select(`${idCol}, ${likesCol}, ${repliesCol}, impressions, posted_at`)
    .gte('posted_at', since)

  if (error || !recentPosts || recentPosts.length === 0) {
    return { anomalyDetected: false, anomalies: [], shouldActivateKillSwitch: false }
  }

  const averages = await getHistoricalAverages(platform)
  const anomalies: EngagementAnomaly[] = []
  const now = Date.now()

  for (const post of recentPosts) {
    const postId = String((post as Record<string, unknown>)[idCol] ?? '')
    const likes = (post as Record<string, number>)[likesCol] ?? 0
    const replies = (post as Record<string, number>)[repliesCol] ?? 0
    const postedAt = (post as Record<string, string>).posted_at
    const hoursOld = postedAt ? (now - new Date(postedAt).getTime()) / (1000 * 60 * 60) : 0

    const metrics: PostMetrics = {
      postId,
      likes,
      replies,
      totalEngagement: likes + replies,
      hoursOld,
    }

    const negativeSpike = detectNegativeSpike(metrics, averages)
    if (negativeSpike) {
      const withPlatform: EngagementAnomaly = { ...negativeSpike, platform }
      anomalies.push(withPlatform)
      await recordAnomaly(withPlatform)
    }

    const cliff = detectEngagementCliff(metrics)
    if (cliff) {
      const withPlatform: EngagementAnomaly = { ...cliff, platform }
      anomalies.push(withPlatform)
      await recordAnomaly(withPlatform)
    }
  }

  // Check kill switch trigger
  let killSwitchTriggered = false
  if (anomalies.some((a) => a.severity === 'critical')) {
    killSwitchTriggered = await shouldTriggerKillSwitch()

    if (killSwitchTriggered) {
      try {
        await activateKillSwitch(
          `L4自動検知: ${KILL_SWITCH_CRITICAL_THRESHOLD}件以上のcritical異常 (${platform})`,
          'auto',
        )
      } catch {
        // Best-effort
      }
    }
  }

  // Notify if anomalies found
  if (anomalies.length > 0) {
    try {
      await notifySafetyEvent({
        eventType: 'anomaly',
        severity: anomalies.some((a) => a.severity === 'critical') ? 'critical' : 'high',
        summary: `L4: ${platform}で${anomalies.length}件の異常検出${killSwitchTriggered ? ' → キルスイッチ発動' : ''}`,
      })
    } catch {
      // Best-effort
    }
  }

  return {
    anomalyDetected: anomalies.length > 0,
    anomalies,
    shouldActivateKillSwitch: killSwitchTriggered,
  }
}
