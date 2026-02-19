/**
 * 毎朝の投稿提案 (Daily Suggestion)
 *
 * GitHub Actions cron (毎日 00:00 UTC = JST 9:00) で実行
 *
 * 1. Brave Search で最新AIトレンドを収集
 * 2. 過去の投稿パフォーマンスから好みのパターンを分析
 * 3. 学習メモリからユーザーの好みを参照
 * 4. 3つの候補を Slack DM で送信
 */

import { createClient } from '@supabase/supabase-js'
import { searchBrave } from '@/lib/x-post-generation/data-fetchers'
import { recallMemories, getPostAnalytics } from '../memory'
import { sendMessage, buildSuggestionBlocks } from '../slack-client'

interface SuggestionCandidate {
  readonly title: string
  readonly description: string
  readonly topic: string
}

async function gatherTrends(): Promise<readonly SuggestionCandidate[]> {
  const queries = [
    'AI 最新ニュース 今日',
    'LLM エージェント 新機能',
    'テック スタートアップ 注目',
  ]

  const allResults: SuggestionCandidate[] = []

  for (const query of queries) {
    try {
      const results = await searchBrave(query)
      if (results.length > 0) {
        allResults.push({
          title: results[0].title,
          description: results[0].description,
          topic: query,
        })
      }
    } catch {
      // Skip failed searches
    }
  }

  return allResults.slice(0, 3)
}

async function getPerformanceInsights(userId: string): Promise<string> {
  try {
    const analytics = await getPostAnalytics({ days: 30, limit: 20 })
    if (analytics.length === 0) return ''

    const bestPosts = [...analytics]
      .sort((a, b) => b.engagement_rate - a.engagement_rate)
      .slice(0, 3)

    const patterns = bestPosts
      .filter((p) => p.pattern_used)
      .map((p) => p.pattern_used)

    const topPattern =
      patterns.length > 0
        ? patterns.reduce(
            (acc, p) => {
              const key = p ?? 'unknown'
              return { ...acc, [key]: (acc[key] ?? 0) + 1 }
            },
            {} as Record<string, number>,
          )
        : {}

    const bestPatternEntry = Object.entries(topPattern).sort(
      (a, b) => b[1] - a[1],
    )[0]

    return bestPatternEntry
      ? `Top performing pattern: ${bestPatternEntry[0]}`
      : ''
  } catch {
    return ''
  }
}

// ============================================================
// 重複投稿防止 (べき等性チェック)
// ============================================================

async function hasAlreadyPostedToday(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return false

  const supabase = createClient(url, key)

  // 今日のUTC 0:00 (JST 9:00) 以降のメッセージをチェック
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)

  const { data } = await supabase
    .from('slack_pending_actions')
    .select('id')
    .eq('action_type', 'daily_suggestion')
    .gte('created_at', todayStart.toISOString())
    .limit(1)

  return (data ?? []).length > 0
}

async function markDailySuggestionSent(
  channel: string,
  userId: string,
): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return

  const supabase = createClient(url, key)

  await supabase.from('slack_pending_actions').insert({
    slack_channel_id: channel,
    slack_user_id: userId,
    slack_thread_ts: null,
    action_type: 'daily_suggestion',
    payload: { sentAt: new Date().toISOString() },
    status: 'approved',
    resolved_at: new Date().toISOString(),
  })
}

// ============================================================
// メイン
// ============================================================

export async function runDailySuggestion(): Promise<void> {
  const channel = process.env.SLACK_DEFAULT_CHANNEL
  const userId = process.env.SLACK_ALLOWED_USER_IDS?.split(',')[0]

  if (!channel || !userId) {
    throw new Error(
      'SLACK_DEFAULT_CHANNEL and SLACK_ALLOWED_USER_IDS are required',
    )
  }

  // べき等性チェック: 今日既に投稿済みならスキップ
  const alreadyPosted = await hasAlreadyPostedToday()
  if (alreadyPosted) {
    process.stdout.write('Daily suggestion already posted today. Skipping.\n')
    return
  }

  // Gather data in parallel
  const [trends, performanceInsight, memories] = await Promise.all([
    gatherTrends(),
    getPerformanceInsights(userId),
    recallMemories({
      slackUserId: userId,
      memoryType: 'preference',
      limit: 5,
    }),
  ])

  if (trends.length === 0) {
    await sendMessage({
      channel,
      text: ':robot_face: Morning! No notable trends found today. Let me know if you have a topic in mind.',
    })
    return
  }

  const memoryHints = memories
    .map((m) => m.content)
    .join(', ')

  const suggestions = trends.map((t, i) => ({
    title: t.title,
    description: [
      t.description.slice(0, 120),
      performanceInsight ? `\n_${performanceInsight}_` : '',
      memoryHints ? `\n_Preferences: ${memoryHints.slice(0, 80)}_` : '',
    ].join(''),
    actionId: `suggestion_${Date.now()}_${i}`,
  }))

  const blocks = buildSuggestionBlocks({ suggestions })

  await sendMessage({
    channel,
    text: 'Daily post suggestions',
    blocks,
  })

  // べき等性マーカーを記録
  await markDailySuggestionSent(channel, userId)
}
