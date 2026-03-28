/**
 * Threads 自動投稿生成ジョブ v2
 *
 * GitHub Actions cron (JST 8:30, 13:00, 19:00) で実行。
 *
 * 1. ランダム遅延 (0~10分, スパム回避)
 * 2. collectThreadsSources() でトレンド/バズ/RSS/LinkedIn横断ソース収集
 * 3. rankThreadsSources() で会話ポテンシャル重視のランキング
 * 4. 配信ロール抽選 (70% テキスト / 15% 画像付き / 10% トレンドコメンタリー / 5% データ)
 * 5. generateThreadsPost() で5段階LangGraphパイプライン投稿生成
 * 6. autoResolvePost() で AI Judge 自動投稿
 * 7. Slack通知 (スコア、パターン、フック情報含むリッチメタデータ)
 */

import { getRecentlyPostedSourceUrls } from '../memory'
import { sendMessage } from '../slack-client'
import { generateThreadsPost } from '../../threads-post-generation/threads-graph'
import type { ThreadsGraphOutput } from '../../threads-post-generation/threads-graph'
import { isAiJudgeEnabled } from '../../ai-judge/config'
import { autoResolvePost } from '../../ai-judge/auto-resolver'
import { collectThreadsSources } from '../../threads-post-generation/threads-source-collector'
import type { ThreadsSourceCandidate } from '../../threads-post-generation/threads-source-collector'
import { rankThreadsSources } from '../../threads-post-generation/threads-source-ranker'
import { cortexReview } from '../../cortex/review/pre-post-reviewer'

// ============================================================
// 配信ロール (Delivery Role)
// ============================================================

type DeliveryRole = 'text' | 'image' | 'trend_commentary' | 'data_story'

const DELIVERY_WEIGHTS: readonly { readonly role: DeliveryRole; readonly weight: number }[] = [
  { role: 'text', weight: 0.70 },
  { role: 'image', weight: 0.15 },
  { role: 'trend_commentary', weight: 0.10 },
  { role: 'data_story', weight: 0.05 },
] as const

function selectDeliveryRole(): DeliveryRole {
  const rand = Math.random()
  let cumulative = 0

  for (const { role, weight } of DELIVERY_WEIGHTS) {
    cumulative += weight
    if (rand < cumulative) {
      return role
    }
  }

  return 'text'
}

// ============================================================
// トレンドコンテキスト構築
// ============================================================

function buildTrendingContext(
  sources: readonly ThreadsSourceCandidate[],
): string {
  const trendingSources = sources.filter(
    (s) => s.sourceType === 'trending' || s.sourceType === 'buzz',
  )

  if (trendingSources.length === 0) return ''

  return trendingSources
    .slice(0, 3)
    .map((s) => `- ${s.title}`)
    .join('\n')
}

// ============================================================
// メイン
// ============================================================

export async function runThreadsAutoPost(): Promise<void> {
  try {
    await runThreadsAutoPostInner()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(`Threads auto-post critical failure: ${message}\n`)
    try {
      const channel = process.env.SLACK_DEFAULT_CHANNEL
      if (channel) {
        await sendMessage({
          channel,
          text: `:rotating_light: Threads自動投稿でクリティカルエラー: ${message}`,
        })
      }
    } catch { /* Slack通知自体の失敗は無視 */ }
  }
}

async function runThreadsAutoPostInner(): Promise<void> {
  const channel = process.env.SLACK_DEFAULT_CHANNEL
  const userId = process.env.SLACK_ALLOWED_USER_IDS?.split(',')[0]

  if (!channel || !userId) {
    throw new Error(
      'SLACK_DEFAULT_CHANNEL and SLACK_ALLOWED_USER_IDS are required',
    )
  }

  // 1. ランダム遅延
  const delayMs =
    process.env.SKIP_DELAY === 'true'
      ? 0
      : Math.floor(Math.random() * 10 * 60 * 1000)
  process.stdout.write(
    `Threads auto-post v2: waiting ${Math.round(delayMs / 1000)}s random delay...\n`,
  )
  await new Promise((resolve) => setTimeout(resolve, delayMs))

  // 2. ソース収集 (トレンド/バズ/RSS/LinkedIn横断)
  const allSources = await collectThreadsSources()

  if (allSources.length === 0) {
    await sendMessage({
      channel,
      text: ':thread: Threads v2: No source data available across all collectors.',
    })
    return
  }

  // 3. ランキング (重複排除 + 会話ポテンシャル重視)
  let recentUrlSet: ReadonlySet<string> = new Set()
  try {
    const recentUrls = await getRecentlyPostedSourceUrls(7)
    recentUrlSet = new Set(recentUrls)
  } catch {
    // Dedup failure should not block
  }

  const rankedSources = rankThreadsSources(allSources, recentUrlSet)

  if (rankedSources.length === 0) {
    await sendMessage({
      channel,
      text: ':thread: Threads v2: All sources filtered (duplicates or low relevance).',
    })
    return
  }

  // 4. 配信ロール抽選
  const deliveryRole = selectDeliveryRole()
  process.stdout.write(`Threads delivery role: ${deliveryRole}\n`)

  // Select source based on delivery role preference
  const topSource = selectSourceForRole(rankedSources, deliveryRole)
  process.stdout.write(
    `Threads: generating post for "${topSource.title}" (source: ${topSource.sourceType})\n`,
  )

  // 5. トレンドコンテキスト構築
  const trendingContext = buildTrendingContext(allSources)

  // 6. 投稿生成 + AI Judge 自動投稿
  await generateAndPost(channel, topSource, trendingContext, deliveryRole)
}

// ============================================================
// ソース選択 (配信ロールに応じた選好)
// ============================================================

function selectSourceForRole(
  sources: readonly ThreadsSourceCandidate[],
  role: DeliveryRole,
): ThreadsSourceCandidate {
  if (sources.length === 0) {
    throw new Error('No sources available for selection')
  }

  // trend_commentary prefers trending/buzz sources
  if (role === 'trend_commentary') {
    const trending = sources.find(
      (s) => s.sourceType === 'trending' || s.sourceType === 'buzz',
    )
    if (trending) return trending
  }

  // data_story prefers buzz sources (often contain data)
  if (role === 'data_story') {
    const buzz = sources.find((s) => s.sourceType === 'buzz')
    if (buzz) return buzz
  }

  // Default: top ranked source
  return sources[0]
}

// ============================================================
// 投稿生成 + 投稿
// ============================================================

async function generateAndPost(
  channel: string,
  source: ThreadsSourceCandidate,
  trendingContext: string,
  deliveryRole: DeliveryRole,
): Promise<void> {
  try {
    const post = await generateThreadsPost({
      content: source.body,
      topic: source.title,
      sourceUrl: source.url ?? undefined,
      trendingContext: trendingContext || undefined,
    })

    // CORTEX品質ゲート: 重複・陳腐化チェック
    try {
      const [reviewed] = await cortexReview([{
        text: post.finalPost,
        sourceUrl: source.url ?? undefined,
        platform: 'threads',
      }])
      if (reviewed.cortex_score === 0) {
        process.stdout.write(
          `Threads auto-post: skipped (duplicate: ${reviewed.duplicate_of})\n`,
        )
        return
      }
      if (reviewed.is_stale) {
        process.stdout.write(`Threads auto-post: skipped (stale source)\n`)
        return
      }
    } catch (e) {
      process.stdout.write(`Threads auto-post: cortexReview failed, proceeding: ${e}\n`)
    }

    if (isAiJudgeEnabled()) {
      const aiResult = await autoResolvePost({
        platform: 'threads',
        text: post.finalPost,
        sourceUrl: source.url ?? undefined,
        sourceTitle: source.title,
        patternUsed: post.patternUsed,
        tags: [...post.tags],
      })

      // Rich metadata logging
      const metadataLog = formatRichMetadata(post, source, deliveryRole)
      process.stdout.write(metadataLog)

      // Rich Slack notification
      const slackNotification = formatSlackNotification(
        post,
        source,
        deliveryRole,
        aiResult.success,
        aiResult.verdict?.decision,
        aiResult.verdict?.confidence,
        aiResult.error,
      )
      await sendMessage({ channel, text: slackNotification })
    } else {
      // AI Judge disabled: preview only
      await sendMessage({
        channel,
        text: formatPreviewNotification(post, source, deliveryRole),
      })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(`Threads post generation failed: ${message}\n`)
    await sendMessage({
      channel,
      text: `:thread: Threads v2: Post generation failed — ${message}`,
    })
  }
}

// ============================================================
// リッチメタデータフォーマット
// ============================================================

function formatRichMetadata(
  post: ThreadsGraphOutput,
  source: ThreadsSourceCandidate,
  deliveryRole: DeliveryRole,
): string {
  const scoresSummary = post.scores
    ? post.scores
        .map(
          (s) =>
            `  候補${s.index + 1}: narrative=${s.narrativeDepth} accuracy=${s.accuracy} conv=${s.conversationPotential} length=${s.lengthFit} hook=${s.hookStrength} total=${s.total}`,
        )
        .join('\n')
    : '  (no scores)'

  return [
    `Threads v2 pipeline complete:`,
    `  pattern: ${post.patternUsed}`,
    `  hook: ${post.hookUsed ?? 'none'}`,
    `  source: ${source.sourceType} (${source.title.slice(0, 50)})`,
    `  delivery: ${deliveryRole}`,
    `  length: ${post.finalPost.length} chars`,
    `  tags: ${post.tags.join(', ') || 'none'}`,
    `  scores:`,
    scoresSummary,
    '',
  ].join('\n')
}

function formatSlackNotification(
  post: ThreadsGraphOutput,
  source: ThreadsSourceCandidate,
  deliveryRole: DeliveryRole,
  posted: boolean,
  decision?: string,
  confidence?: number,
  error?: string,
): string {
  const statusIcon = posted ? ':white_check_mark:' : ':x:'
  const preview =
    post.finalPost.length > 300
      ? post.finalPost.slice(0, 300) + '...'
      : post.finalPost

  const lines = [
    `:thread: *Threads v2 Auto-Post*`,
    `${statusIcon} ${posted ? 'Posted' : 'Rejected'}${error ? ` (${error})` : ''}`,
    `> ${preview}`,
    '',
    `*Pattern:* ${post.patternUsed}${post.hookUsed ? ` | *Hook:* ${post.hookUsed}` : ''}`,
    `*Source:* ${source.sourceType} | *Role:* ${deliveryRole}`,
    `*Length:* ${post.finalPost.length} chars | *Tags:* ${post.tags.join(', ') || 'none'}`,
  ]

  if (decision && confidence !== undefined) {
    lines.push(
      `*AI Judge:* ${decision} (confidence: ${(confidence * 100).toFixed(0)}%)`,
    )
  }

  if (post.scores && post.scores.length > 0) {
    const bestScore = [...post.scores].sort((a, b) => b.total - a.total)[0]
    lines.push(
      `*Best Score:* ${bestScore.total}/50 (narrative=${bestScore.narrativeDepth} conv=${bestScore.conversationPotential} hook=${bestScore.hookStrength})`,
    )
  }

  return lines.join('\n')
}

function formatPreviewNotification(
  post: ThreadsGraphOutput,
  source: ThreadsSourceCandidate,
  deliveryRole: DeliveryRole,
): string {
  const preview =
    post.finalPost.length > 300
      ? post.finalPost.slice(0, 300) + '...'
      : post.finalPost

  return [
    ':thread: *Threads v2 投稿プレビュー*',
    `> ${preview}`,
    '',
    `*Pattern:* ${post.patternUsed}${post.hookUsed ? ` | *Hook:* ${post.hookUsed}` : ''}`,
    `*Source:* ${source.sourceType} (${source.title.slice(0, 60)}) | *Role:* ${deliveryRole}`,
    `*Length:* ${post.finalPost.length} chars`,
    'AI Judge無効のため手動投稿が必要です。',
  ].join('\n')
}
