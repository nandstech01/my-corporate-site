/**
 * CEO朝ブリーフィング (Daily Briefing)
 *
 * GitHub Actions cron (毎日 00:00 UTC = JST 9:00) で実行
 *
 * 1. 昨日の全プラットフォーム投稿実績
 * 2. AI Judge判定サマリ
 * 3. パターンバンディット勝者パターン
 * 4. フォロワー変動
 * 5. バズ検知ハイライト
 * 6. Claudeによる今日のアクション提案
 */

import { createClient } from '@supabase/supabase-js'
import { sendMessage } from '../slack-client'
import type { Block, KnownBlock } from '@slack/types'

type SlackBlock = Block | KnownBlock

// ============================================================
// Supabase
// ============================================================

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase credentials required')
  return createClient(url, key)
}

// ============================================================
// Data Types
// ============================================================

interface BriefingData {
  readonly xPosts: { count: number; likes: number; retweets: number; impressions: number }
  readonly linkedinPosts: number
  readonly threadsPosts: number
  readonly judgeApproved: number
  readonly judgeRejected: number
  readonly topRejectReasons: readonly string[]
  readonly topPatterns: readonly { name: string; avgEngagement: number }[]
  readonly followerCount: number | null
  readonly followerChange: number | null
  readonly topBuzz: { text: string; author: string; score: number } | null
}

// ============================================================
// Data Collection
// ============================================================

async function collectBriefingData(): Promise<BriefingData> {
  const supabase = getSupabase()

  // 昨日の範囲（JST基準: 昨日0:00〜今日0:00）
  const now = new Date()
  const todayJST = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  todayJST.setUTCHours(0, 0, 0, 0)
  const yesterdayStart = new Date(todayJST.getTime() - 24 * 60 * 60 * 1000 - 9 * 60 * 60 * 1000).toISOString()
  const yesterdayEnd = new Date(todayJST.getTime() - 9 * 60 * 60 * 1000).toISOString()

  // 並列でデータ取得
  const [xResult, liResult, thResult, judgeResult, patternResult, growthResult, buzzResult] = await Promise.all([
    // X投稿実績
    supabase
      .from('x_post_analytics')
      .select('likes, retweets, impressions')
      .gte('posted_at', yesterdayStart)
      .lt('posted_at', yesterdayEnd)
      .then(({ data }) => {
        const posts = data ?? []
        return {
          count: posts.length,
          likes: posts.reduce((s, p) => s + ((p.likes as number) ?? 0), 0),
          retweets: posts.reduce((s, p) => s + ((p.retweets as number) ?? 0), 0),
          impressions: posts.reduce((s, p) => s + ((p.impressions as number) ?? 0), 0),
        }
      })
      .catch(() => ({ count: 0, likes: 0, retweets: 0, impressions: 0 })),

    // LinkedIn投稿数
    supabase
      .from('linkedin_post_analytics')
      .select('id', { count: 'exact', head: true })
      .gte('posted_at', yesterdayStart)
      .lt('posted_at', yesterdayEnd)
      .then(({ count }) => count ?? 0)
      .catch(() => 0),

    // Threads投稿数
    supabase
      .from('threads_post_analytics')
      .select('id', { count: 'exact', head: true })
      .gte('posted_at', yesterdayStart)
      .lt('posted_at', yesterdayEnd)
      .then(({ count }) => count ?? 0)
      .catch(() => 0),

    // AI Judge サマリ
    supabase
      .from('ai_judge_decisions')
      .select('decision, reasoning')
      .gte('created_at', yesterdayStart)
      .lt('created_at', yesterdayEnd)
      .then(({ data }) => {
        const decisions = data ?? []
        const approved = decisions.filter((d) => d.decision === 'approve').length
        const rejected = decisions.filter((d) => d.decision === 'reject').length

        // 却下理由のトップ3
        const reasons: Record<string, number> = {}
        for (const d of decisions.filter((d) => d.decision === 'reject')) {
          const reason = (d.reasoning as string)?.slice(0, 40) ?? 'unknown'
          reasons[reason] = (reasons[reason] ?? 0) + 1
        }
        const topReasons = Object.entries(reasons)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([r]) => r)

        return { approved, rejected, topReasons }
      })
      .catch(() => ({ approved: 0, rejected: 0, topReasons: [] as string[] })),

    // パターンバンディット勝者
    supabase
      .from('pattern_performance')
      .select('pattern_id, avg_engagement, total_uses')
      .gt('total_uses', 1)
      .order('avg_engagement', { ascending: false })
      .limit(3)
      .then(({ data }) =>
        (data ?? []).map((p) => ({
          name: p.pattern_id as string,
          avgEngagement: p.avg_engagement as number,
        })),
      )
      .catch(() => [] as { name: string; avgEngagement: number }[]),

    // フォロワー変動
    supabase
      .from('x_growth_daily')
      .select('followers_count, daily_change')
      .order('date', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        const latest = data?.[0]
        return {
          count: (latest?.followers_count as number) ?? null,
          change: (latest?.daily_change as number) ?? null,
        }
      })
      .catch(() => ({ count: null, change: null })),

    // バズ検知ハイライト
    supabase
      .from('buzz_posts')
      .select('post_text, author_handle, buzz_score')
      .gte('created_at', yesterdayStart)
      .order('buzz_score', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        const top = data?.[0]
        if (!top) return null
        return {
          text: (top.post_text as string)?.slice(0, 80) ?? '',
          author: (top.author_handle as string) ?? '',
          score: (top.buzz_score as number) ?? 0,
        }
      })
      .catch(() => null),
  ])

  return {
    xPosts: xResult,
    linkedinPosts: liResult,
    threadsPosts: thResult,
    judgeApproved: judgeResult.approved,
    judgeRejected: judgeResult.rejected,
    topRejectReasons: judgeResult.topReasons,
    topPatterns: patternResult,
    followerCount: growthResult.count,
    followerChange: growthResult.change,
    topBuzz: buzzResult,
  }
}

// ============================================================
// Action Suggestion (Claude)
// ============================================================

async function generateActionSuggestion(data: BriefingData): Promise<string> {
  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const anthropic = new Anthropic()

    const context = [
      `昨日のX投稿: ${data.xPosts.count}件、いいね${data.xPosts.likes}、インプレッション${data.xPosts.impressions}`,
      `AI Judge: 承認${data.judgeApproved}件、却下${data.judgeRejected}件`,
      data.topPatterns.length > 0 ? `勝者パターン: ${data.topPatterns[0].name}（avg ${data.topPatterns[0].avgEngagement.toFixed(2)}）` : '',
      data.followerChange !== null ? `フォロワー変動: ${data.followerChange >= 0 ? '+' : ''}${data.followerChange}` : '',
      data.topBuzz ? `注目バズ: @${data.topBuzz.author}（score: ${data.topBuzz.score}）` : '',
    ].filter(Boolean).join('\n')

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `以下はSNS自動運用基盤の昨日の実績です。CEOへの今日のアクション提案を1〜2文で簡潔に書いてください。具体的で実行可能な提案にしてください。\n\n${context}`,
      }],
    })

    const text = response.content.find(
      (b): b is { type: 'text'; text: string } => b.type === 'text',
    )
    return text?.text?.trim() ?? '特になし'
  } catch {
    return 'アクション提案の生成に失敗しました'
  }
}

// ============================================================
// Slack Blocks
// ============================================================

function buildBriefingBlocks(data: BriefingData, action: string): readonly SlackBlock[] {
  const today = new Date()
  const jstDate = new Date(today.getTime() + 9 * 60 * 60 * 1000)
  const dateLabel = `${jstDate.getUTCMonth() + 1}/${jstDate.getUTCDate()}`

  const totalPosts = data.xPosts.count + data.linkedinPosts + data.threadsPosts
  const judgeTotal = data.judgeApproved + data.judgeRejected
  const rejectRate = judgeTotal > 0 ? Math.round((data.judgeRejected / judgeTotal) * 100) : 0

  const blocks: SlackBlock[] = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `:chart_with_upwards_trend: *CEO朝ブリーフィング（${dateLabel}）*`,
      },
    },
    { type: 'divider' },
    // 昨日の実績
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: [
          '*【昨日の実績】*',
          `▪️ X: ${data.xPosts.count}投稿 / :thumbsup: ${data.xPosts.likes} / :repeat: ${data.xPosts.retweets} / :eyes: ${data.xPosts.impressions.toLocaleString()}`,
          `▪️ LinkedIn: ${data.linkedinPosts}投稿`,
          `▪️ Threads: ${data.threadsPosts}投稿`,
          `▪️ 合計: *${totalPosts}投稿*`,
        ].join('\n'),
      },
    },
  ]

  // AI Judge
  if (judgeTotal > 0) {
    const judgeLines = [
      '*【AI Judge】*',
      `▪️ 承認: ${data.judgeApproved}件 / 却下: ${data.judgeRejected}件（却下率${rejectRate}%）`,
    ]
    if (data.topRejectReasons.length > 0) {
      judgeLines.push(`▪️ 主な却下理由: ${data.topRejectReasons[0]}`)
    }
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: judgeLines.join('\n') },
    })
  }

  // パターン勝者
  if (data.topPatterns.length > 0) {
    const patternLines = ['*【勝者パターン】*']
    for (const p of data.topPatterns) {
      patternLines.push(`▪️ ${p.name}（avg ${p.avgEngagement.toFixed(2)}）`)
    }
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: patternLines.join('\n') },
    })
  }

  // フォロワー
  if (data.followerCount !== null) {
    const changeStr = data.followerChange !== null
      ? ` (${data.followerChange >= 0 ? '+' : ''}${data.followerChange})`
      : ''
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*【フォロワー】*\n▪️ X: ${data.followerCount}人${changeStr}`,
      },
    })
  }

  // バズハイライト
  if (data.topBuzz) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*【注目バズ】*\n:fire: @${data.topBuzz.author}（score: ${data.topBuzz.score}）\n_${data.topBuzz.text}_`,
      },
    })
  }

  // アクション提案
  blocks.push(
    { type: 'divider' },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*【今日のアクション】*\n:arrow_right: ${action}`,
      },
    },
  )

  return blocks
}

// ============================================================
// べき等性チェック
// ============================================================

async function hasAlreadyPostedToday(): Promise<boolean> {
  try {
    const supabase = getSupabase()
    const todayStart = new Date()
    todayStart.setUTCHours(0, 0, 0, 0)

    const { data } = await supabase
      .from('slack_pending_actions')
      .select('id')
      .eq('action_type', 'daily_suggestion')
      .gte('created_at', todayStart.toISOString())
      .limit(1)

    return (data ?? []).length > 0
  } catch {
    return false
  }
}

async function markBriefingSent(channel: string, userId: string): Promise<void> {
  try {
    const supabase = getSupabase()
    await supabase.from('slack_pending_actions').insert({
      slack_channel_id: channel,
      slack_user_id: userId,
      slack_thread_ts: null,
      action_type: 'daily_suggestion',
      payload: { type: 'ceo_briefing', sentAt: new Date().toISOString() },
      status: 'approved',
      resolved_at: new Date().toISOString(),
    })
  } catch { /* best-effort */ }
}

// ============================================================
// メイン
// ============================================================

export async function runDailySuggestion(): Promise<void> {
  const channel = process.env.SLACK_DEFAULT_CHANNEL
  const userId = process.env.SLACK_ALLOWED_USER_IDS?.split(',')[0]

  if (!channel || !userId) {
    throw new Error('SLACK_DEFAULT_CHANNEL and SLACK_ALLOWED_USER_IDS are required')
  }

  // べき等性チェック
  const alreadyPosted = await hasAlreadyPostedToday()
  if (alreadyPosted) {
    process.stdout.write('CEO briefing already sent today. Skipping.\n')
    return
  }

  process.stdout.write('Collecting briefing data...\n')

  // データ収集
  const data = await collectBriefingData()

  // アクション提案生成
  process.stdout.write('Generating action suggestion...\n')
  const action = await generateActionSuggestion(data)

  // Slackに送信
  const blocks = buildBriefingBlocks(data, action)

  await sendMessage({
    channel,
    text: `CEO朝ブリーフィング`,
    blocks,
  })

  // べき等性マーカー
  await markBriefingSent(channel, userId)

  process.stdout.write('CEO briefing sent successfully.\n')
}
