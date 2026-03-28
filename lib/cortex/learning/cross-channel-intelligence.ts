/**
 * CORTEX Cross-Channel Intelligence
 *
 * Extracts actionable intelligence from LINE/Discord/Slack conversation logs
 * and cross-references with actual performance changes.
 */

import { getSupabase } from '../discord/context-builder'
import { sendMessage } from '@/lib/slack-bot/slack-client'

// ============================================================
// Constants
// ============================================================

const LOG_PREFIX = '[CORTEX Cross-Channel Intelligence]'
const LOOKBACK_DAYS = 30
const STALE_THRESHOLD_DAYS = 3

// ============================================================
// Types
// ============================================================

export interface CrossChannelReport {
  readonly period_days: number
  readonly channel_stats: readonly {
    readonly channel: string
    readonly total_conversations: number
    readonly completed: number
    readonly decisions_made: number
    readonly decisions_that_improved: number
    readonly effectiveness_rate: number
  }[]
  readonly conversation_type_stats: readonly {
    readonly type: string
    readonly count: number
    readonly avg_improvement: number
  }[]
  readonly stale_items: readonly {
    readonly id: string
    readonly summary: string
    readonly priority: string
    readonly days_pending: number
  }[]
  readonly recommendations: readonly string[]
}

interface ConversationRow {
  readonly id: string
  readonly channel: string
  readonly conversation_type: string
  readonly summary: string
  readonly key_decisions: string[] | null
  readonly affected_platforms: string[] | null
  readonly priority: string
  readonly status: string
  readonly created_at: string
  readonly completed_at: string | null
}

// ============================================================
// Step 1: Fetch All Conversation Logs
// ============================================================

async function fetchConversationLogs(): Promise<readonly ConversationRow[]> {
  const supabase = getSupabase()
  const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('cortex_conversation_log')
    .select('id, channel, conversation_type, summary, key_decisions, affected_platforms, priority, status, created_at, completed_at')
    .gte('created_at', since)
    .order('created_at', { ascending: false })

  if (error) {
    process.stdout.write(`${LOG_PREFIX} Failed to fetch conversation logs: ${error.message}\n`)
    return []
  }

  return (data ?? []) as readonly ConversationRow[]
}

// ============================================================
// Step 2: Track Decision Outcomes
// ============================================================

async function trackDecisionOutcome(
  completedAt: string,
  affectedPlatforms: readonly string[],
): Promise<number> {
  const supabase = getSupabase()

  // Compare engagement rate before vs after the decision date
  const decisionDate = new Date(completedAt)
  const beforeStart = new Date(decisionDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const afterEnd = new Date(decisionDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const tableMap: Record<string, { table: string; dateCol: string }> = {
    x: { table: 'x_post_analytics', dateCol: 'posted_at' },
    linkedin: { table: 'linkedin_post_analytics', dateCol: 'posted_at' },
    threads: { table: 'threads_post_analytics', dateCol: 'posted_at' },
  }

  const scores: number[] = []

  for (const platform of affectedPlatforms) {
    const config = tableMap[platform]
    if (!config) continue

    try {
      const { data: beforeData } = await supabase
        .from(config.table)
        .select('engagement_rate')
        .gte(config.dateCol, beforeStart)
        .lt(config.dateCol, completedAt)

      const { data: afterData } = await supabase
        .from(config.table)
        .select('engagement_rate')
        .gte(config.dateCol, completedAt)
        .lt(config.dateCol, afterEnd)

      if (!beforeData || beforeData.length === 0 || !afterData || afterData.length === 0) {
        continue
      }

      const beforeAvg =
        beforeData.reduce((sum, r) => sum + ((r.engagement_rate as number) ?? 0), 0) /
        beforeData.length
      const afterAvg =
        afterData.reduce((sum, r) => sum + ((r.engagement_rate as number) ?? 0), 0) /
        afterData.length

      if (afterAvg > beforeAvg * 1.05) {
        scores.push(1)
      } else if (afterAvg < beforeAvg * 0.95) {
        scores.push(-1)
      } else {
        scores.push(0)
      }
    } catch {
      // Best-effort per platform
    }
  }

  if (scores.length === 0) return 0
  return scores.reduce((sum, s) => sum + s, 0) / scores.length
}

// ============================================================
// Step 3: Calculate Channel Effectiveness
// ============================================================

async function calculateChannelStats(
  conversations: readonly ConversationRow[],
): Promise<CrossChannelReport['channel_stats']> {
  const channelGroups = new Map<
    string,
    {
      total: number
      completed: number
      decisionCount: number
      improvedCount: number
      completedConversations: ConversationRow[]
    }
  >()

  // Group by channel
  for (const conv of conversations) {
    const existing = channelGroups.get(conv.channel) ?? {
      total: 0,
      completed: 0,
      decisionCount: 0,
      improvedCount: 0,
      completedConversations: [],
    }

    const decisionCount =
      conv.key_decisions && conv.key_decisions.length > 0 ? conv.key_decisions.length : 0

    channelGroups.set(conv.channel, {
      total: existing.total + 1,
      completed: existing.completed + (conv.status === 'completed' ? 1 : 0),
      decisionCount: existing.decisionCount + decisionCount,
      improvedCount: existing.improvedCount,
      completedConversations:
        conv.status === 'completed' && decisionCount > 0
          ? [...existing.completedConversations, conv]
          : existing.completedConversations,
    })
  }

  const results: CrossChannelReport['channel_stats'][number][] = []

  for (const [channel, stats] of Array.from(channelGroups)) {
    let improvedCount = 0

    // Track outcomes for completed conversations with decisions
    for (const conv of stats.completedConversations) {
      if (conv.completed_at && conv.affected_platforms && conv.affected_platforms.length > 0) {
        const score = await trackDecisionOutcome(conv.completed_at, conv.affected_platforms)
        if (score > 0) improvedCount++
      }
    }

    results.push({
      channel,
      total_conversations: stats.total,
      completed: stats.completed,
      decisions_made: stats.decisionCount,
      decisions_that_improved: improvedCount,
      effectiveness_rate:
        stats.decisionCount > 0 ? improvedCount / stats.decisionCount : 0,
    })
  }

  return results
}

// ============================================================
// Step 4: Calculate Conversation Type Stats
// ============================================================

async function calculateConversationTypeStats(
  conversations: readonly ConversationRow[],
): Promise<CrossChannelReport['conversation_type_stats']> {
  const typeGroups = new Map<
    string,
    { count: number; completedWithPlatforms: ConversationRow[] }
  >()

  for (const conv of conversations) {
    const existing = typeGroups.get(conv.conversation_type) ?? {
      count: 0,
      completedWithPlatforms: [],
    }
    typeGroups.set(conv.conversation_type, {
      count: existing.count + 1,
      completedWithPlatforms:
        conv.status === 'completed' &&
        conv.affected_platforms &&
        conv.affected_platforms.length > 0
          ? [...existing.completedWithPlatforms, conv]
          : existing.completedWithPlatforms,
    })
  }

  const results: CrossChannelReport['conversation_type_stats'][number][] = []

  for (const [type, stats] of Array.from(typeGroups)) {
    let totalImprovement = 0
    let measuredCount = 0

    for (const conv of stats.completedWithPlatforms) {
      if (conv.completed_at && conv.affected_platforms) {
        const score = await trackDecisionOutcome(conv.completed_at, conv.affected_platforms)
        totalImprovement += score
        measuredCount++
      }
    }

    results.push({
      type,
      count: stats.count,
      avg_improvement: measuredCount > 0 ? totalImprovement / measuredCount : 0,
    })
  }

  return results
}

// ============================================================
// Step 5: Identify Stale Items
// ============================================================

function identifyStaleItems(
  conversations: readonly ConversationRow[],
): CrossChannelReport['stale_items'] {
  const now = Date.now()

  return conversations
    .filter((conv) => {
      if (conv.status !== 'pending') return false
      if (conv.priority !== 'high' && conv.priority !== 'critical') return false

      const createdAt = new Date(conv.created_at).getTime()
      const daysPending = (now - createdAt) / (24 * 60 * 60 * 1000)
      return daysPending > STALE_THRESHOLD_DAYS
    })
    .map((conv) => ({
      id: conv.id,
      summary: conv.summary,
      priority: conv.priority,
      days_pending: Math.floor(
        (now - new Date(conv.created_at).getTime()) / (24 * 60 * 60 * 1000),
      ),
    }))
    .sort((a, b) => b.days_pending - a.days_pending)
}

// ============================================================
// Step 6: Generate Recommendations
// ============================================================

function generateRecommendations(
  channelStats: CrossChannelReport['channel_stats'],
  typeStats: CrossChannelReport['conversation_type_stats'],
  staleItems: CrossChannelReport['stale_items'],
): readonly string[] {
  const recommendations: string[] = []

  // Find most effective channel
  const sortedChannels = [...channelStats].sort(
    (a, b) => b.effectiveness_rate - a.effectiveness_rate,
  )
  if (sortedChannels.length > 0 && sortedChannels[0].effectiveness_rate > 0) {
    recommendations.push(
      `Most effective channel: ${sortedChannels[0].channel} (${(sortedChannels[0].effectiveness_rate * 100).toFixed(0)}% of decisions led to improvement)`,
    )
  }

  // Find most effective conversation type
  const sortedTypes = [...typeStats].sort((a, b) => b.avg_improvement - a.avg_improvement)
  if (sortedTypes.length > 0 && sortedTypes[0].avg_improvement > 0) {
    recommendations.push(
      `Most impactful conversation type: ${sortedTypes[0].type} (avg improvement score: ${sortedTypes[0].avg_improvement.toFixed(2)})`,
    )
  }

  // Stale items warning
  if (staleItems.length > 0) {
    recommendations.push(
      `${staleItems.length} high-priority item(s) pending for >3 days - review needed`,
    )
  }

  // Underused channels
  const underusedChannels = channelStats.filter((c) => c.total_conversations < 3)
  for (const ch of underusedChannels) {
    recommendations.push(
      `Channel "${ch.channel}" had only ${ch.total_conversations} conversations in ${LOOKBACK_DAYS} days - consider using more`,
    )
  }

  // Types with negative improvement
  const negativeTypes = typeStats.filter((t) => t.avg_improvement < 0)
  for (const t of negativeTypes) {
    recommendations.push(
      `"${t.type}" conversations tend to correlate with declining performance - review approach`,
    )
  }

  return recommendations
}

// ============================================================
// Step 7: Save Results
// ============================================================

async function saveResults(report: CrossChannelReport): Promise<void> {
  const supabase = getSupabase()

  try {
    await supabase.from('cortex_conversation_log').insert({
      channel: 'slack',
      conversation_type: 'performance_review',
      summary: `Cross-Channel Intelligence Report: ${report.channel_stats.length} channels analyzed, ${report.stale_items.length} stale items found`,
      key_decisions: report.recommendations.slice(0, 5),
      affected_platforms: Array.from(new Set(report.channel_stats.map((c) => c.channel))),
      priority: report.stale_items.length > 0 ? 'high' : 'medium',
      status: 'completed',
    })
  } catch (err) {
    process.stdout.write(
      `${LOG_PREFIX} Failed to save to cortex_conversation_log: ${err instanceof Error ? err.message : String(err)}\n`,
    )
  }

  process.stdout.write(`${LOG_PREFIX} Saved report to cortex_conversation_log\n`)
}

// ============================================================
// Step 8: Send Slack Notification for Stale Items
// ============================================================

async function sendStaleItemsNotification(
  staleItems: CrossChannelReport['stale_items'],
): Promise<void> {
  if (staleItems.length === 0) return

  const channel = process.env.SLACK_GENERAL_CHANNEL_ID || process.env.SLACK_DEFAULT_CHANNEL

  if (!channel) {
    process.stdout.write(`${LOG_PREFIX} No Slack channel configured, skipping notification\n`)
    return
  }

  const itemLines = staleItems.map(
    (item) =>
      `  - [${item.priority.toUpperCase()}] ${item.summary} (${item.days_pending} days pending)`,
  )

  const text = [
    `:warning: *CORTEX: Stale High-Priority Items*`,
    ``,
    `${staleItems.length} item(s) have been pending for more than ${STALE_THRESHOLD_DAYS} days:`,
    ...itemLines,
    ``,
    `Please review and action these items.`,
  ].join('\n')

  try {
    await sendMessage({ channel, text })
  } catch (err) {
    process.stdout.write(
      `${LOG_PREFIX} Failed to send Slack notification: ${err instanceof Error ? err.message : String(err)}\n`,
    )
  }
}

// ============================================================
// Main: Run Cross-Channel Intelligence
// ============================================================

export async function runCrossChannelIntelligence(): Promise<CrossChannelReport> {
  process.stdout.write(`${LOG_PREFIX} Starting cross-channel intelligence analysis...\n`)

  // Step 1: Fetch conversation logs
  const conversations = await fetchConversationLogs()
  process.stdout.write(`${LOG_PREFIX} Fetched ${conversations.length} conversations (last ${LOOKBACK_DAYS} days)\n`)

  if (conversations.length === 0) {
    const emptyReport: CrossChannelReport = {
      period_days: LOOKBACK_DAYS,
      channel_stats: [],
      conversation_type_stats: [],
      stale_items: [],
      recommendations: ['No conversation data available for analysis.'],
    }
    return emptyReport
  }

  // Step 2-3: Calculate channel effectiveness (includes decision outcome tracking)
  const channelStats = await calculateChannelStats(conversations)
  process.stdout.write(`${LOG_PREFIX} Analyzed ${channelStats.length} channels\n`)

  // Step 4: Calculate conversation type stats
  const typeStats = await calculateConversationTypeStats(conversations)
  process.stdout.write(`${LOG_PREFIX} Analyzed ${typeStats.length} conversation types\n`)

  // Step 5: Identify stale items
  const staleItems = identifyStaleItems(conversations)
  process.stdout.write(`${LOG_PREFIX} Found ${staleItems.length} stale high-priority items\n`)

  // Step 6: Generate recommendations
  const recommendations = generateRecommendations(channelStats, typeStats, staleItems)

  const report: CrossChannelReport = {
    period_days: LOOKBACK_DAYS,
    channel_stats: channelStats,
    conversation_type_stats: typeStats,
    stale_items: staleItems,
    recommendations,
  }

  // Step 7: Save results
  await saveResults(report)

  // Step 8: Notify if stale items exist
  await sendStaleItemsNotification(staleItems)

  process.stdout.write(`${LOG_PREFIX} Cross-channel intelligence analysis complete\n`)

  return report
}
