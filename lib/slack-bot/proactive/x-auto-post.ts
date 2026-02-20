/**
 * X 自動投稿生成ジョブ
 *
 * GitHub Actions cron (UTC 2,6,12 = JST 11,15,21) で実行。
 * スパム検出回避のため、実行時に 0~20 分のランダム遅延を挟む。
 *
 * 1. ランダム遅延 (0~20分)
 * 2. slack_bot_memory から直近の linkedin_sources を recall (共有ソース)
 * 3. フォールバック: trending_topics メモリ recall
 * 4. 重複排除 (直近7日のX投稿テキスト + pending actions sourceUrl)
 * 5. トップ1件の候補を選定
 * 6. generateXPost({ mode:'research' }) で投稿生成
 * 7. fetchMediaForPost() でメディア取得 (best-effort)
 * 8. createPendingAction + buildApprovalBlocks で Slack 承認フロー
 */

import { createClient } from '@supabase/supabase-js'
import { createPendingAction, getRecentXPostTexts } from '../memory'
import { sendMessage, buildApprovalBlocks } from '../slack-client'
import { generateXPost } from '../../x-post-generation/post-graph'
import { fetchMediaForPost } from '../../x-api/media'
import type { LinkedInTopicCandidate } from '../../linkedin-source-collector/source-analyzer'

// ============================================================
// ランダム遅延（スパム検出回避）
// ============================================================

const MAX_DELAY_MINUTES = 20

async function randomDelay(): Promise<void> {
  const delayMs = Math.floor(Math.random() * MAX_DELAY_MINUTES * 60 * 1000)
  const delayMin = Math.round(delayMs / 60_000)
  process.stdout.write(`X auto-post: Random delay ${delayMin} min before execution\n`)
  await new Promise((resolve) => setTimeout(resolve, delayMs))
}

// ============================================================
// ソースメモリの取得
// ============================================================

interface MemoryRow {
  readonly content: string
  readonly context: Record<string, unknown> | null
}

interface MemoryContext {
  readonly source?: string
  readonly candidates?: readonly LinkedInTopicCandidate[]
}

async function recallSourceMemories(
  slackUserId: string,
  sourceType: string,
  limit: number,
): Promise<readonly MemoryRow[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  }

  const supabase = createClient(url, key)

  const { data, error } = await supabase
    .from('slack_bot_memory')
    .select('*')
    .eq('slack_user_id', slackUserId)
    .eq('context->>source', sourceType)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to recall ${sourceType} memories: ${error.message}`)
  }

  return (data ?? []) as readonly MemoryRow[]
}

// ============================================================
// 候補抽出
// ============================================================

function extractCandidatesFromMemories(
  memories: readonly MemoryRow[],
): readonly LinkedInTopicCandidate[] {
  const allCandidates: LinkedInTopicCandidate[] = []

  for (const memory of memories) {
    const ctx = memory.context as MemoryContext | null
    if (ctx?.candidates && Array.isArray(ctx.candidates)) {
      allCandidates.push(...ctx.candidates)
    }
  }

  return allCandidates
}

// ============================================================
// 重複排除
// ============================================================

async function getRecentPendingSourceUrls(): Promise<ReadonlySet<string>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return new Set()

  const supabase = createClient(url, key)
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data } = await supabase
    .from('slack_pending_actions')
    .select('payload')
    .in('action_type', ['post_x', 'post_x_long'])
    .gte('created_at', since)

  if (!data) return new Set()

  const urls = new Set<string>()
  for (const row of data) {
    const payload = row.payload as Record<string, unknown> | null
    if (payload?.sourceUrl && typeof payload.sourceUrl === 'string') {
      urls.add(payload.sourceUrl)
    }
  }
  return urls
}

function deduplicateCandidates(
  candidates: readonly LinkedInTopicCandidate[],
  recentPostTexts: readonly string[],
  recentPendingUrls: ReadonlySet<string>,
): readonly LinkedInTopicCandidate[] {
  return candidates.filter((candidate) => {
    // Skip if sourceUrl is already in pending actions
    if (recentPendingUrls.has(candidate.sourceUrl)) return false

    // Skip if title appears in recent post texts (fuzzy: substring match)
    const titleLower = candidate.title.toLowerCase()
    for (const text of recentPostTexts) {
      if (text.toLowerCase().includes(titleLower)) return false
    }

    return true
  })
}

// ============================================================
// メイン
// ============================================================

const PREVIEW_CHAR_LIMIT = 500

export async function runXAutoPost(): Promise<void> {
  const channel = process.env.SLACK_DEFAULT_CHANNEL
  const userId = process.env.SLACK_ALLOWED_USER_IDS?.split(',')[0]

  if (!channel || !userId) {
    throw new Error(
      'SLACK_DEFAULT_CHANNEL and SLACK_ALLOWED_USER_IDS are required',
    )
  }

  // 1. ランダム遅延（スパム検出回避）
  await randomDelay()

  // 2. linkedin_sources メモリを取得 (LinkedIn collector が収集済みのソースを共有)
  let memories = await recallSourceMemories(userId, 'linkedin_sources', 5)

  // フォールバック: trending_topics
  if (memories.length === 0) {
    process.stdout.write('X auto-post: No linkedin_sources, falling back to trending_topics\n')
    memories = await recallSourceMemories(userId, 'trending_topics', 3)
  }

  if (memories.length === 0) {
    await sendMessage({
      channel,
      text: ':bird: X auto-post: No source data available. Run source collector or trending collector first.',
    })
    return
  }

  // 2. メモリから候補を抽出
  const allCandidates = extractCandidatesFromMemories(memories)

  // trending_topics にはcandidates配列がない場合、content から簡易候補を生成
  if (allCandidates.length === 0 && memories.length > 0) {
    const trendingContent = memories[0].content
    if (trendingContent) {
      process.stdout.write('X auto-post: Using trending content directly as topic\n')

      try {
        const postResult = await generateXPost({
          mode: 'research',
          content: trendingContent,
          topic: 'tech trends',
        })

        const action = await createPendingAction({
          slackChannelId: channel,
          slackUserId: userId,
          slackThreadTs: null,
          actionType: 'post_x',
          payload: {
            text: postResult.finalPost,
            patternUsed: postResult.patternUsed,
            tags: postResult.tags,
          },
          previewText: postResult.finalPost,
        })

        const approvalBlocks = buildApprovalBlocks({
          title: ':bird: *X Post Preview (from trending)*',
          previewText: postResult.finalPost.slice(0, PREVIEW_CHAR_LIMIT),
          actionId: action.id,
          actionType: 'post',
        })

        await sendMessage({
          channel,
          text: 'X auto-post preview (trending)',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: ':mega: *X投稿を自動生成しました！確認お願いします*',
              },
            },
            { type: 'divider' },
            ...approvalBlocks,
          ],
        })

        process.stdout.write('X auto-post: Sent trending-based approval request\n')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        process.stdout.write(`X auto-post: Trending post generation failed: ${message}\n`)
        await sendMessage({
          channel,
          text: `:bird: X auto-post: Post generation failed - ${message}`,
        })
      }
      return
    }

    await sendMessage({
      channel,
      text: ':bird: X auto-post: Source data found but no structured candidates.',
    })
    return
  }

  // 3. 重複排除
  let candidates: readonly LinkedInTopicCandidate[] = allCandidates
  try {
    const [recentTexts, recentPendingUrls] = await Promise.all([
      getRecentXPostTexts(7),
      getRecentPendingSourceUrls(),
    ])

    const deduped = deduplicateCandidates(
      allCandidates,
      recentTexts,
      recentPendingUrls,
    )

    if (deduped.length < allCandidates.length) {
      process.stdout.write(
        `X auto-post dedup: ${allCandidates.length - deduped.length} duplicate(s) removed\n`,
      )
    }
    candidates = deduped.length > 0 ? deduped : allCandidates
  } catch {
    // Dedup failure should not block the pipeline
  }

  // 4. トップ1件を選定
  const topCandidate = candidates[0]
  process.stdout.write(`X auto-post: Generating post for "${topCandidate.title}"\n`)

  // 5. generateXPost で投稿生成
  let postResult
  try {
    postResult = await generateXPost({
      mode: 'research',
      content: topCandidate.sourceBody,
      topic: topCandidate.title,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(`X auto-post: Post generation failed: ${message}\n`)
    await sendMessage({
      channel,
      text: `:bird: X auto-post: Post generation failed for "${topCandidate.title}" - ${message}`,
    })
    return
  }

  // 6. メディア取得 (best-effort)
  let mediaIds: string[] | undefined
  try {
    const media = await fetchMediaForPost({
      sourceUrl: topCandidate.sourceUrl,
      topic: topCandidate.title,
    })
    if (media?.mediaId) {
      mediaIds = [media.mediaId]
      process.stdout.write('X auto-post: Media attached\n')
    }
  } catch {
    // メディア取得失敗はテキストのみ投稿で続行
    process.stdout.write('X auto-post: Media fetch failed, proceeding with text only\n')
  }

  // 7. createPendingAction + Slack 承認フロー
  try {
    const action = await createPendingAction({
      slackChannelId: channel,
      slackUserId: userId,
      slackThreadTs: null,
      actionType: 'post_x',
      payload: {
        text: postResult.finalPost,
        sourceUrl: topCandidate.sourceUrl,
        patternUsed: postResult.patternUsed,
        tags: postResult.tags,
        ...(mediaIds ? { mediaIds } : {}),
      },
      previewText: postResult.finalPost,
    })

    const approvalBlocks = buildApprovalBlocks({
      title: ':bird: *X Post Preview*',
      previewText: postResult.finalPost.slice(0, PREVIEW_CHAR_LIMIT),
      actionId: action.id,
      actionType: 'post',
    })

    const scoreTotal = postResult.scores.length > 0
      ? Math.round(
          postResult.scores.reduce((sum, s) => sum + s.total, 0) /
            postResult.scores.length,
        )
      : 0

    const infoLines = [
      `:newspaper: *ソース:* ${topCandidate.title}`,
      `:link: *URL:* ${topCandidate.sourceUrl}`,
      `:bar_chart: *スコア:* ${scoreTotal}/50`,
      `:memo: *パターン:* ${postResult.patternUsed}`,
      ...(mediaIds ? [':camera: *メディア:* 添付済み'] : []),
    ]

    await sendMessage({
      channel,
      text: `X auto-post preview: ${topCandidate.title}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: ':mega: *X投稿を自動生成しました！確認お願いします*',
          },
        },
        { type: 'divider' },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: infoLines.join('\n'),
          },
        },
        ...approvalBlocks,
      ],
    })

    process.stdout.write(
      `X auto-post: Sent approval request for "${topCandidate.title}"\n`,
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(`X auto-post: Failed to send approval: ${message}\n`)
    await sendMessage({
      channel,
      text: `:bird: X auto-post: Failed to send approval - ${message}`,
    })
  }
}

// ============================================================
// イベント駆動トリガー（RSS検出時に即座にX投稿ドラフト生成）
// ============================================================

export interface SourceTriggerParams {
  readonly title: string
  readonly sourceUrl: string
  readonly description?: string
  readonly sourceFeed: string
  readonly buzzScore: number
}

/**
 * 公式ソース（OpenAI, Anthropic等）の新記事検出時に即座にX投稿を生成し、
 * Slack #general に承認ボタン付きで送信する。
 * blog-rss-monitor から呼ばれる。
 */
export async function triggerXPostFromSource(
  params: SourceTriggerParams,
): Promise<boolean> {
  const channel = process.env.SLACK_DEFAULT_CHANNEL
  const userId = process.env.SLACK_ALLOWED_USER_IDS?.split(',')[0]

  if (!channel || !userId) return false

  // 重複チェック: 同じsourceUrlのpending actionが既にあるか
  try {
    const pendingUrls = await getRecentPendingSourceUrls()
    if (pendingUrls.has(params.sourceUrl)) {
      process.stdout.write(
        `X auto-post trigger: Skipping "${params.title}" (already pending)\n`,
      )
      return false
    }
  } catch {
    // 重複チェック失敗は続行
  }

  // X投稿生成
  const content = params.description
    ? `${params.title}\n\n${params.description}`
    : params.title

  const postResult = await generateXPost({
    mode: 'research',
    content,
    topic: params.title,
  })

  // メディア取得 (best-effort)
  let mediaIds: string[] | undefined
  try {
    const media = await fetchMediaForPost({
      sourceUrl: params.sourceUrl,
      topic: params.title,
    })
    if (media?.mediaId) {
      mediaIds = [media.mediaId]
    }
  } catch {
    // テキストのみで続行
  }

  // pending action 作成
  const action = await createPendingAction({
    slackChannelId: channel,
    slackUserId: userId,
    slackThreadTs: null,
    actionType: 'post_x',
    payload: {
      text: postResult.finalPost,
      sourceUrl: params.sourceUrl,
      patternUsed: postResult.patternUsed,
      tags: postResult.tags,
      triggeredBy: 'rss-monitor',
      sourceFeed: params.sourceFeed,
      ...(mediaIds ? { mediaIds } : {}),
    },
    previewText: postResult.finalPost,
  })

  const approvalBlocks = buildApprovalBlocks({
    title: ':bird: *X Post Preview*',
    previewText: postResult.finalPost.slice(0, PREVIEW_CHAR_LIMIT),
    actionId: action.id,
    actionType: 'post',
  })

  await sendMessage({
    channel,
    text: `X auto-post (breaking): ${params.title}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:zap: *公式ソースから速報X投稿を自動生成しました！*`,
        },
      },
      { type: 'divider' },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: [
            `:newspaper: *ソース:* ${params.title}`,
            `:link: *URL:* ${params.sourceUrl}`,
            `:satellite: *フィード:* ${params.sourceFeed}`,
            `:fire: *バズスコア:* ${params.buzzScore}/100`,
            ...(mediaIds ? [':camera: *メディア:* 添付済み'] : []),
          ].join('\n'),
        },
      },
      ...approvalBlocks,
    ],
  })

  process.stdout.write(
    `X auto-post trigger: Sent approval for "${params.title}" (${params.sourceFeed})\n`,
  )
  return true
}
