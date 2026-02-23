/**
 * Conversation Depth Builder
 *
 * 自投稿への返信に対して会話を深め、スレッドアルゴリズム重み付けを活用する。
 * - 自投稿へのリプライに返信（genuine human repliesのみ）
 * - 高パフォーマンス投稿への self-reply thread 追加
 *
 * ルール:
 * - 1スレッドあたり最大3返信
 * - 投稿後48h以上は返信しない
 * - unsolicited replies は禁止（自投稿のリプライのみ対象）
 */

import { createClient } from '@supabase/supabase-js'
import { ChatOpenAI } from '@langchain/openai'
import {
  getMyProfile,
  getUserTimeline,
  searchConversation,
  replyToTweet,
} from '../x-api/client'
import { scrapeProfile, scrapeUserTimeline } from '../x-playwright/scrapers/profile-scraper'
import { closePlaywright, notifyApiFallback } from '../x-playwright'
import { autoResolvePost } from '../ai-judge/auto-resolver'
import { isAiJudgeEnabled } from '../ai-judge/config'
import { addSelfReply } from './thread-composer'

// ============================================================
// Constants
// ============================================================

const MAX_REPLIES_PER_THREAD = 3
const MAX_POST_AGE_HOURS = 48
const HIGH_PERFORMANCE_LIKES_THRESHOLD = 5
const HIGH_PERFORMANCE_CHECK_HOURS = 4

// ============================================================
// Supabase
// ============================================================

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  }
  return createClient(url, key)
}

function createModel() {
  return new ChatOpenAI({
    modelName: 'gpt-5.2',
    apiKey: process.env.OPENAI_API_KEY,
  })
}

// ============================================================
// Reply Generation
// ============================================================

async function generateReply(
  originalPostText: string,
  userReplyText: string,
): Promise<string> {
  const model = createModel()

  const response = await model.invoke([
    {
      role: 'system' as const,
      content: `あなたは@nands_tech。自分の投稿に対するリプライに返信する。

## ルール
- 日本語120文字以内（CJK=2カウント、280カウント上限）
- 会話を深める内容（追加情報、質問への回答、議論の発展）
- フレンドリーだが実務家らしく
- URLは入れない
- 感謝の言葉で始めてもよいが、空虚な返しはNG
- 「ありがとうございます」だけの返信NG

返信文のみ出力。説明不要。`,
    },
    {
      role: 'user' as const,
      content: `自分の元投稿:\n"${originalPostText}"\n\nリプライ:\n"${userReplyText}"`,
    },
  ])

  return typeof response.content === 'string'
    ? response.content
    : String(response.content)
}

// ============================================================
// Self-Thread Follow-up Generation
// ============================================================

async function generateFollowUp(
  originalPostText: string,
): Promise<string> {
  const model = createModel()

  const response = await model.invoke([
    {
      role: 'system' as const,
      content: `あなたは@nands_tech。高パフォーマンスだった自分の投稿にフォローアップを追加する。

## ルール
- 日本語120文字以内（CJK=2カウント、280カウント上限）
- 元投稿を深掘りする追加情報・考察・実体験
- 「続き:」や「追記:」で始めてもOK
- 新しい問いかけを含めると議論が活性化する
- URLは入れない

返信文のみ出力。`,
    },
    {
      role: 'user' as const,
      content: `高パフォーマンスだった自分の投稿:\n"${originalPostText}"`,
    },
  ])

  return typeof response.content === 'string'
    ? response.content
    : String(response.content)
}

// ============================================================
// Track conversation depth in DB
// ============================================================

async function recordConversationReply(params: {
  readonly rootTweetId: string
  readonly rootTweetText: string
  readonly rootPostedAt: string
  readonly replyTweetId: string
  readonly replyText: string
  readonly replyType: 'self_thread' | 'reply_to_user' | 'follow_up'
  readonly targetUserReplyId?: string
  readonly targetUserText?: string
  readonly depthLevel: number
}): Promise<void> {
  const supabase = getSupabase()

  await supabase.from('x_conversation_threads').insert({
    root_tweet_id: params.rootTweetId,
    root_tweet_text: params.rootTweetText,
    root_posted_at: params.rootPostedAt,
    reply_tweet_id: params.replyTweetId,
    reply_text: params.replyText,
    reply_type: params.replyType,
    target_user_reply_id: params.targetUserReplyId ?? null,
    target_user_text: params.targetUserText ?? null,
    depth_level: params.depthLevel,
    posted_at: new Date().toISOString(),
  })
}

// ============================================================
// Check existing replies count
// ============================================================

async function getReplyCount(rootTweetId: string): Promise<number> {
  const supabase = getSupabase()

  const { count, error } = await supabase
    .from('x_conversation_threads')
    .select('id', { count: 'exact', head: true })
    .eq('root_tweet_id', rootTweetId)

  if (error) return 0
  return count ?? 0
}

// ============================================================
// Pre-filter: check if tweet has known replies (API call guard)
// ============================================================

/**
 * x_post_analytics の replies カウントを確認。
 * replies == 0 のツイートは searchConversation をスキップして
 * API呼び出し回数を60-80%削減する。
 */
async function hasKnownReplies(tweetId: string): Promise<boolean> {
  const supabase = getSupabase()

  try {
    const { data } = await supabase
      .from('x_post_analytics')
      .select('replies')
      .eq('tweet_id', tweetId)
      .single()

    if (!data) return true // Unknown tweet → assume it might have replies
    return ((data.replies as number) ?? 0) > 0
  } catch {
    return true // Error → assume replies exist (conservative)
  }
}

// ============================================================
// Main entry point
// ============================================================

export async function runConversationBuilder(): Promise<void> {
  process.stdout.write('Conversation Builder: Starting\n')

  // 1. Get own profile (Playwright first, API fallback)
  const myUsername = process.env.X_USERNAME ?? 'nands_tech'
  let myUserId: string | undefined

  // Try Playwright for profile
  const scrapedProfile = await scrapeProfile(myUsername)
  if (!scrapedProfile.error) {
    // Still need user ID - try API for that since Playwright can't reliably get it
    const profile = await getMyProfile()
    myUserId = profile.id
  } else {
    const profile = await getMyProfile()
    if (!profile.id || profile.error) {
      process.stdout.write(
        `Conversation Builder: Failed to get profile: ${profile.error}\n`,
      )
      await closePlaywright()
      return
    }
    myUserId = profile.id
  }

  if (!myUserId) {
    // Fallback: just get from API
    const profile = await getMyProfile()
    if (!profile.id || profile.error) {
      process.stdout.write(
        `Conversation Builder: Failed to get profile: ${profile.error}\n`,
      )
      await closePlaywright()
      return
    }
    myUserId = profile.id
  }

  // 2. Get recent own tweets (Playwright first, API fallback)
  const scrapedTimeline = await scrapeUserTimeline(myUsername, { maxResults: 20 })

  type TweetItem = {
    readonly id: string
    readonly text: string
    readonly createdAt?: string
    readonly publicMetrics?: {
      readonly likeCount: number
      readonly retweetCount: number
      readonly replyCount: number
      readonly impressionCount: number
    }
  }

  let tweets: readonly TweetItem[]

  if (!scrapedTimeline.error && scrapedTimeline.tweets.length > 0) {
    process.stdout.write('Conversation Builder: Timeline fetched via Playwright\n')
    tweets = scrapedTimeline.tweets.map((t) => ({
      id: t.id,
      text: t.text,
      createdAt: t.createdAt,
      publicMetrics: {
        likeCount: t.metrics.likes,
        retweetCount: t.metrics.retweets,
        replyCount: t.metrics.replies,
        impressionCount: 0,
      },
    }))
  } else {
    // API fallback — notify
    notifyApiFallback({
      consumer: 'conversation-builder',
      reason: scrapedTimeline.error ?? 'No tweets from Playwright',
    }).catch(() => {})

    const timeline = await getUserTimeline(myUserId, { maxResults: 20 })
    if (timeline.error || timeline.tweets.length === 0) {
      process.stdout.write(
        `Conversation Builder: No recent tweets or error: ${timeline.error}\n`,
      )
      await closePlaywright()
      return
    }
    tweets = timeline.tweets
  }

  let repliesPosted = 0
  let selfThreadsPosted = 0

  for (const tweet of tweets) {
    const tweetAge = tweet.createdAt
      ? (Date.now() - new Date(tweet.createdAt).getTime()) / (60 * 60 * 1000)
      : MAX_POST_AGE_HOURS + 1

    // Skip if older than 48h
    if (tweetAge > MAX_POST_AGE_HOURS) continue

    // Check reply count limit
    const existingReplies = await getReplyCount(tweet.id)
    if (existingReplies >= MAX_REPLIES_PER_THREAD) continue

    // 3. Pre-filter: skip searchConversation if no known replies (saves API calls)
    const mightHaveReplies = await hasKnownReplies(tweet.id)
    if (mightHaveReplies) {
      // Search for replies to this tweet (API only - conversation_id: requires API)
      const conversation = await searchConversation(tweet.id)

      if (!conversation.error) {
        // Filter genuine human replies (not from self, not bots)
        const humanReplies = conversation.tweets.filter(
          (reply) => reply.authorId && reply.authorId !== myUserId,
        )

        // Reply to unreplied human replies
        for (const userReply of humanReplies) {
          // Check if we already replied to this
          const supabase = getSupabase()
          const { count: alreadyReplied } = await supabase
            .from('x_conversation_threads')
            .select('id', { count: 'exact', head: true })
            .eq('target_user_reply_id', userReply.id)

          if ((alreadyReplied ?? 0) > 0) continue

          // Check thread reply limit again
          if (existingReplies + repliesPosted >= MAX_REPLIES_PER_THREAD) break

          try {
            const replyText = await generateReply(tweet.text, userReply.text)

            // Route through AI Judge if enabled
            if (isAiJudgeEnabled()) {
              const result = await autoResolvePost({
                platform: 'x',
                text: replyText,
              })

              if (!result.success) {
                process.stdout.write(
                  `Conversation Builder: Reply rejected by AI Judge: ${result.verdict.reasoning}\n`,
                )
                continue
              }
            }

            const replyResult = await replyToTweet(replyText, userReply.id)

            if (replyResult.success && replyResult.tweetId) {
              await recordConversationReply({
                rootTweetId: tweet.id,
                rootTweetText: tweet.text,
                rootPostedAt: tweet.createdAt ?? new Date().toISOString(),
                replyTweetId: replyResult.tweetId,
                replyText,
                replyType: 'reply_to_user',
                targetUserReplyId: userReply.id,
                targetUserText: userReply.text,
                depthLevel: existingReplies + repliesPosted + 1,
              })
              repliesPosted++
              process.stdout.write(
                `Conversation Builder: Replied to user in thread ${tweet.id}\n`,
              )
            }
          } catch (error) {
            const msg = error instanceof Error ? error.message : 'Unknown error'
            process.stdout.write(`Conversation Builder: Reply failed: ${msg}\n`)
          }
        }
      }
    } else {
      process.stdout.write(
        `Conversation Builder: Skipping searchConversation for ${tweet.id} (no known replies)\n`,
      )
    }

    // 4. Self-reply thread for high-performance posts
    const metrics = tweet.publicMetrics
    if (
      metrics &&
      metrics.likeCount >= HIGH_PERFORMANCE_LIKES_THRESHOLD &&
      tweetAge >= HIGH_PERFORMANCE_CHECK_HOURS &&
      tweetAge <= 24 &&
      existingReplies === 0
    ) {
      try {
        const followUpText = await generateFollowUp(tweet.text)

        if (isAiJudgeEnabled()) {
          const result = await autoResolvePost({
            platform: 'x',
            text: followUpText,
          })
          if (!result.success) continue
        }

        const selfReplyResult = await addSelfReply(tweet.id, followUpText)

        if (selfReplyResult.tweetId) {
          await recordConversationReply({
            rootTweetId: tweet.id,
            rootTweetText: tweet.text,
            rootPostedAt: tweet.createdAt ?? new Date().toISOString(),
            replyTweetId: selfReplyResult.tweetId,
            replyText: followUpText,
            replyType: 'self_thread',
            depthLevel: 1,
          })
          selfThreadsPosted++
          process.stdout.write(
            `Conversation Builder: Added self-thread to high-performing post ${tweet.id}\n`,
          )
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error'
        process.stdout.write(`Conversation Builder: Self-thread failed: ${msg}\n`)
      }
    }
  }

  // Close Playwright browser (saves updated cookies to Supabase)
  await closePlaywright()

  process.stdout.write(
    `Conversation Builder: Complete. ${repliesPosted} replies, ${selfThreadsPosted} self-threads\n`,
  )
}
