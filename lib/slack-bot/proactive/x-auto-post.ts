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
import { generateQuoteTweet } from '../../x-quote-generation/quote-graph'
import { fetchMediaForPost } from '../../x-api/media'
import { retweetPost } from '../../x-api/client'
import { savePostAnalytics } from '../memory'
import { isAiJudgeEnabled } from '../../ai-judge/config'
import { autoResolvePost } from '../../ai-judge/auto-resolver'
import { uploadMediaToX } from '../../x-api/media'
import { generateArticleThumbnail } from '../../x-article/thumbnail-generator'
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
// Quote RT Opportunity
// ============================================================

async function tryQuoteRTOpportunity(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return false

  const supabase = createClient(url, key)

  // Find top pending opportunity
  const { data: opportunity } = await supabase
    .from('x_quote_opportunities')
    .select('*')
    .eq('status', 'pending')
    .order('opportunity_score', { ascending: false })
    .limit(1)
    .single()

  if (!opportunity) return false

  // Mark as generating
  await supabase
    .from('x_quote_opportunities')
    .update({ status: 'generating' })
    .eq('id', opportunity.id)

  try {
    // Generate quote tweet
    const quoteResult = await generateQuoteTweet({
      originalTweetId: opportunity.original_tweet_id,
      originalText: opportunity.original_text,
      originalAuthor: opportunity.original_author_username,
    })

    // Post via AI Judge
    const result = await autoResolvePost({
      platform: 'x',
      text: quoteResult.quoteText,
      quoteTweetId: opportunity.original_tweet_id,
      patternUsed: `quote_${quoteResult.opinionTemplateUsed}`,
    })

    if (result.success) {
      await supabase
        .from('x_quote_opportunities')
        .update({
          status: 'posted',
          generated_quote_text: quoteResult.quoteText,
          quote_tweet_id: result.postId,
          posted_at: new Date().toISOString(),
        })
        .eq('id', opportunity.id)
      return true
    }

    await supabase
      .from('x_quote_opportunities')
      .update({
        status: 'skipped',
        generated_quote_text: quoteResult.quoteText,
        skip_reason: result.error ?? 'AI Judge rejected',
      })
      .eq('id', opportunity.id)
    return false
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    await supabase
      .from('x_quote_opportunities')
      .update({ status: 'skipped', skip_reason: msg })
      .eq('id', opportunity.id)
    return false
  }
}

// ============================================================
// Repost (Retweet) Opportunity
// ============================================================

const REPOST_SCORE_THRESHOLD = 0.7

async function tryRepostOpportunity(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return false

  const supabase = createClient(url, key)

  // Find high-scoring pending opportunity for repost
  const { data: opportunity } = await supabase
    .from('x_quote_opportunities')
    .select('*')
    .eq('status', 'pending')
    .gte('opportunity_score', REPOST_SCORE_THRESHOLD)
    .order('opportunity_score', { ascending: false })
    .limit(1)
    .single()

  if (!opportunity) return false

  try {
    const result = await retweetPost(opportunity.original_tweet_id)

    if (result.success) {
      await supabase
        .from('x_quote_opportunities')
        .update({
          status: 'retweeted',
          posted_at: new Date().toISOString(),
        })
        .eq('id', opportunity.id)

      // Save analytics
      try {
        await savePostAnalytics({
          tweetId: opportunity.original_tweet_id,
          tweetUrl: result.tweetUrl,
          postText: `[RT] ${opportunity.original_text.slice(0, 200)}`,
          postType: 'repost',
        })
      } catch {
        // Best-effort
      }

      process.stdout.write(
        `X auto-post: Retweeted @${opportunity.original_author_username} (score: ${opportunity.opportunity_score.toFixed(2)})\n`,
      )
      return true
    }

    return false
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(`X auto-post: Repost failed: ${msg}\n`)
    return false
  }
}

// ============================================================
// Viral Quote Article (海外バズ投稿を引用RT + 長文記事)
// ============================================================

async function tryViralQuoteArticle(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return false

  const supabase = createClient(url, key)

  // Find high-engagement English tweets about AI coding tools (last 3 days)
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()

  const { data: viralPosts } = await supabase
    .from('buzz_posts')
    .select('*')
    .eq('platform', 'x')
    .eq('language', 'en')
    .gte('buzz_score', 100)
    .gte('post_date', threeDaysAgo)
    .order('buzz_score', { ascending: false })
    .limit(5)

  if (!viralPosts || viralPosts.length === 0) return false

  // Dedup: skip tweets we've already quoted
  const recentTexts = await getRecentXPostTexts(7)

  const candidate = viralPosts.find((post) => {
    const tweetId = post.external_post_id as string | null
    if (!tweetId) return false
    return !recentTexts.some((text) => text.includes(tweetId))
  })

  if (!candidate || !candidate.external_post_id) return false

  process.stdout.write(
    `X auto-post: Generating viral quote article for @${candidate.author_handle}: "${(candidate.post_text as string).slice(0, 80)}..."\n`,
  )

  // Generate long-form article about this viral post
  const postResult = await generateXPost({
    mode: 'article',
    content: candidate.post_text as string,
    topic: `Viral AI coding post by @${candidate.author_handle}`,
  })

  // Post as quote tweet + long-form article
  const result = await autoResolvePost({
    platform: 'x',
    text: postResult.finalPost,
    quoteTweetId: candidate.external_post_id as string,
    longForm: true,
    sourceTitle: (candidate.post_text as string).slice(0, 100),
    patternUsed: postResult.patternUsed,
    tags: [...postResult.tags, 'viral_quote_article'],
  })

  process.stdout.write(
    `X auto-post (viral quote article): @${candidate.author_handle} → ${result.success ? 'posted' : 'rejected'}\n`,
  )

  return result.success
}

// ============================================================
// メイン
// ============================================================

const PREVIEW_CHAR_LIMIT = 500

export async function runXAutoPost(): Promise<void> {
  try {
    await runXAutoPostInner()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(`X auto-post critical failure: ${message}\n`)
    try {
      const channel = process.env.SLACK_DEFAULT_CHANNEL
      if (channel) {
        await sendMessage({
          channel,
          text: `:rotating_light: X自動投稿でクリティカルエラー: ${message}`,
        })
      }
    } catch { /* Slack通知自体の失敗は無視 */ }
  }
}

async function runXAutoPostInner(): Promise<void> {
  const channel = process.env.SLACK_DEFAULT_CHANNEL
  const userId = process.env.SLACK_ALLOWED_USER_IDS?.split(',')[0]

  if (!channel || !userId) {
    throw new Error(
      'SLACK_DEFAULT_CHANNEL and SLACK_ALLOWED_USER_IDS are required',
    )
  }

  // 1. ランダム遅延（スパム検出回避）
  await randomDelay()

  // 1.5. Check for repost/quote RT opportunities
  // Distribution: 10% repost, 20% quote RT, 10% viral quote article, 10% thread, 10% article, 40% original
  const roll = Math.random()

  if (roll < 0.10) {
    // Try repost (retweet) for very high engagement posts
    try {
      const reposted = await tryRepostOpportunity()
      if (reposted) {
        process.stdout.write('X auto-post: Repost completed successfully\n')
        return
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      process.stdout.write(`X auto-post: Repost attempt failed: ${msg}\n`)
    }
  } else if (roll < 0.30 && isAiJudgeEnabled()) {
    // Try quote RT (20%)
    try {
      const quoted = await tryQuoteRTOpportunity()
      if (quoted) {
        process.stdout.write('X auto-post: Quote RT posted successfully\n')
        return
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      process.stdout.write(`X auto-post: Quote RT attempt failed: ${msg}\n`)
    }
  } else if (roll < 0.40 && isAiJudgeEnabled()) {
    // Try viral quote article — 海外バズ投稿を引用RT + 長文記事 (10%)
    try {
      const viralQuoted = await tryViralQuoteArticle()
      if (viralQuoted) {
        process.stdout.write('X auto-post: Viral quote article posted successfully\n')
        return
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      process.stdout.write(`X auto-post: Viral quote article attempt failed: ${msg}\n`)
    }
    // Falls through to original post if no viral candidates
  } else if (roll < 0.50 && isAiJudgeEnabled()) {
    // Try thread generation (10%)
    try {
      const threadMemories = await recallSourceMemories(userId, 'linkedin_sources', 3)
      if (threadMemories.length > 0) {
        const threadCandidates = extractCandidatesFromMemories(threadMemories)
        if (threadCandidates.length > 0) {
          const topCandidate = threadCandidates[0]
          const postResult = await generateXPost({
            mode: 'thread',
            content: topCandidate.sourceBody,
            topic: topCandidate.title,
          })
          const segments = postResult.finalPost
            .split('\n===\n')
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
          if (segments.length >= 2) {
            const result = await autoResolvePost({
              platform: 'x',
              text: segments[0],
              threadSegments: segments,
              sourceUrl: topCandidate.sourceUrl,
              sourceTitle: topCandidate.title,
              patternUsed: postResult.patternUsed,
              tags: postResult.tags,
            })
            process.stdout.write(
              `X auto-post (thread): "${topCandidate.title}" → ${result.success ? 'posted' : 'rejected'}\n`,
            )
            return
          }
          process.stdout.write(`X auto-post: Thread had only ${segments.length} segment(s), falling through to original\n`)
        }
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      process.stdout.write(`X auto-post: Thread attempt failed: ${msg}\n`)
    }
    // Falls through to original post if thread generation fails
  } else if (roll < 0.60 && isAiJudgeEnabled()) {
    // Try article (long-form) generation (10%)
    try {
      const articleMemories = await recallSourceMemories(userId, 'linkedin_sources', 3)
      if (articleMemories.length > 0) {
        const articleCandidates = extractCandidatesFromMemories(articleMemories)
        if (articleCandidates.length > 0) {
          const topCandidate = articleCandidates[0]
          const postResult = await generateXPost({
            mode: 'article',
            content: topCandidate.sourceBody,
            topic: topCandidate.title,
          })

          // Generate thumbnail (best-effort)
          let thumbnailMediaId: string | undefined
          try {
            const thumbnail = await generateArticleThumbnail({
              title: postResult.articleTitle ?? topCandidate.title,
              keyPoints: postResult.articleKeyPoints,
            })
            if (thumbnail) {
              const mediaId = await uploadMediaToX(thumbnail.imageBuffer, 'image/png')
              if (mediaId) {
                thumbnailMediaId = mediaId
                process.stdout.write(`X auto-post (article): thumbnail uploaded (${thumbnail.imageUrl})\n`)
              }
            }
          } catch {
            // Best-effort: thumbnail failure should not block posting
          }

          const result = await autoResolvePost({
            platform: 'x',
            text: postResult.finalPost,
            longForm: true,
            mediaIds: thumbnailMediaId ? [thumbnailMediaId] : undefined,
            sourceUrl: topCandidate.sourceUrl,
            sourceTitle: topCandidate.title,
            patternUsed: postResult.patternUsed,
            tags: postResult.tags,
          })
          process.stdout.write(
            `X auto-post (article): "${topCandidate.title}" → ${result.success ? 'posted' : 'rejected'}${thumbnailMediaId ? ' (with thumbnail)' : ''}\n`,
          )
          return
        }
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      process.stdout.write(`X auto-post: Article attempt failed: ${msg}\n`)
    }
    // Falls through to original post if article generation fails
  }

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

        // AI Judge 自動投稿モード
        if (isAiJudgeEnabled()) {
          const result = await autoResolvePost({
            platform: 'x',
            text: postResult.finalPost,
            patternUsed: postResult.patternUsed,
            tags: postResult.tags,
          })
          process.stdout.write(
            `X auto-post (trending, AI Judge): ${result.success ? 'posted' : 'rejected'} - ${result.verdict.reasoning}\n`,
          )
          return
        }

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

  // 7. AI Judge 自動投稿 or Slack 承認フロー
  try {
    // AI Judge 自動投稿モード
    if (isAiJudgeEnabled()) {
      const result = await autoResolvePost({
        platform: 'x',
        text: postResult.finalPost,
        sourceUrl: topCandidate.sourceUrl,
        sourceTitle: topCandidate.title,
        patternUsed: postResult.patternUsed,
        tags: postResult.tags,
        mediaIds,
      })
      process.stdout.write(
        `X auto-post (AI Judge): "${topCandidate.title}" → ${result.success ? 'posted' : 'rejected'}\n`,
      )
      return
    }

    // レガシー: Slack 承認フロー
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

  // AI Judge 自動投稿モード
  if (isAiJudgeEnabled()) {
    const result = await autoResolvePost({
      platform: 'x',
      text: postResult.finalPost,
      sourceUrl: params.sourceUrl,
      sourceTitle: params.title,
      patternUsed: postResult.patternUsed,
      tags: postResult.tags,
      mediaIds,
    })
    process.stdout.write(
      `X auto-post trigger (AI Judge): "${params.title}" → ${result.success ? 'posted' : 'rejected'}\n`,
    )
    return result.success
  }

  // レガシー: Slack 承認フロー
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
