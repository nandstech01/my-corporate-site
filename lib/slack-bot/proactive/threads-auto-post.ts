/**
 * Threads 自動投稿生成ジョブ
 *
 * GitHub Actions cron (JST 8:30, 16:30) で実行。
 *
 * 1. ランダム遅延 (0~10分, スパム回避)
 * 2. slack_bot_memory から linkedin_sources メモリを recall (共有ソース)
 * 3. フォールバック: trending_topics メモリ
 * 4. 候補抽出 + 重複排除 (直近7日)
 * 5. トップ1件を選定
 * 6. generateThreadsPost() で会話型投稿生成
 * 7. autoResolvePost({ platform: 'threads', ... }) で AI Judge 自動投稿
 * 8. Slack通知 (結果)
 */

import { createClient } from '@supabase/supabase-js'
import { getRecentlyPostedSourceUrls } from '../memory'
import { sendMessage } from '../slack-client'
import { generateThreadsPost } from '../../threads-post-generation/threads-graph'
import { isAiJudgeEnabled } from '../../ai-judge/config'
import { autoResolvePost } from '../../ai-judge/auto-resolver'
import type { LinkedInTopicCandidate } from '../../linkedin-source-collector/source-analyzer'

// ============================================================
// ソースメモリ取得 (LinkedIn/Trending と共有)
// ============================================================

async function recallSourceMemories(
  slackUserId: string,
  limit: number,
): Promise<readonly { readonly content: string; readonly context: Record<string, unknown> | null }[]> {
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
    .eq('context->>source', 'linkedin_sources')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to recall source memories: ${error.message}`)
  }

  return (data ?? []) as readonly { readonly content: string; readonly context: Record<string, unknown> | null }[]
}

async function recallTrendingTopics(
  slackUserId: string,
): Promise<readonly { readonly content: string; readonly context: Record<string, unknown> | null }[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return []

  const supabase = createClient(url, key)
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()

  const { data } = await supabase
    .from('slack_bot_memory')
    .select('*')
    .eq('slack_user_id', slackUserId)
    .eq('memory_type', 'fact')
    .contains('context', { source: 'trending_topics' })
    .gte('created_at', twoDaysAgo)
    .order('created_at', { ascending: false })
    .limit(3)

  return (data ?? []) as readonly { readonly content: string; readonly context: Record<string, unknown> | null }[]
}

// ============================================================
// 候補抽出
// ============================================================

interface MemoryContext {
  readonly source?: string
  readonly candidates?: readonly LinkedInTopicCandidate[]
}

function extractCandidatesFromMemories(
  memories: readonly { readonly content: string; readonly context: Record<string, unknown> | null }[],
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
// メイン
// ============================================================

export async function runThreadsAutoPost(): Promise<void> {
  const channel = process.env.SLACK_DEFAULT_CHANNEL
  const userId = process.env.SLACK_ALLOWED_USER_IDS?.split(',')[0]

  if (!channel || !userId) {
    throw new Error(
      'SLACK_DEFAULT_CHANNEL and SLACK_ALLOWED_USER_IDS are required',
    )
  }

  // 1. ランダム遅延 (0~10分, スパム回避; SKIP_DELAY=true で省略)
  const delayMs = process.env.SKIP_DELAY === 'true' ? 0 : Math.floor(Math.random() * 10 * 60 * 1000)
  process.stdout.write(`Threads auto-post: waiting ${Math.round(delayMs / 1000)}s random delay...\n`)
  await new Promise((resolve) => setTimeout(resolve, delayMs))

  // 2. linkedin_sources メモリから候補取得
  let memories = await recallSourceMemories(userId, 5)

  // 3. フォールバック: trending_topics
  if (memories.length === 0) {
    const trendingMemories = await recallTrendingTopics(userId)
    if (trendingMemories.length === 0) {
      await sendMessage({
        channel,
        text: ':thread: Threads: No source data available. Run the source collector first.',
      })
      return
    }

    // trending_topics はフリーテキストなので直接投稿生成へ
    const trendingContent = trendingMemories.map((m) => m.content).join('\n\n')
    await generateAndPostFromContent(channel, trendingContent, 'AI/テックトレンド')
    return
  }

  // 4. 候補抽出 + 重複排除
  const allCandidates = extractCandidatesFromMemories(memories)

  if (allCandidates.length === 0) {
    await sendMessage({
      channel,
      text: ':thread: Threads: Source data found but no structured candidates.',
    })
    return
  }

  let candidates: readonly LinkedInTopicCandidate[] = allCandidates
  try {
    const recentUrls = await getRecentlyPostedSourceUrls(7)
    const recentUrlSet = new Set(recentUrls)
    const deduped = allCandidates.filter(
      (c) => !recentUrlSet.has(c.sourceUrl),
    )
    if (deduped.length < allCandidates.length) {
      process.stdout.write(
        `Threads source dedup: ${allCandidates.length - deduped.length} duplicate(s) removed\n`,
      )
    }
    candidates = deduped.length > 0 ? deduped : allCandidates
  } catch {
    // Dedup failure should not block the pipeline
  }

  // 5. トップ1件を選定
  const topCandidate = candidates[0]
  process.stdout.write(`Threads: generating post for "${topCandidate.title}"\n`)

  // 6. 投稿生成 + AI Judge 自動投稿
  await generateAndPostFromContent(
    channel,
    topCandidate.sourceBody,
    topCandidate.title,
    topCandidate.sourceUrl,
  )
}

async function generateAndPostFromContent(
  channel: string,
  content: string,
  topic: string,
  sourceUrl?: string,
): Promise<void> {
  try {
    const post = await generateThreadsPost({
      content,
      topic,
      sourceUrl,
    })

    if (isAiJudgeEnabled()) {
      const aiResult = await autoResolvePost({
        platform: 'threads',
        text: post.finalPost,
        sourceUrl,
        sourceTitle: topic,
        patternUsed: post.patternUsed,
        tags: [...post.tags],
      })

      process.stdout.write(
        `Threads auto-post (AI Judge): "${topic}" → ${aiResult.success ? 'posted' : 'rejected'}` +
          `${aiResult.error ? ` (${aiResult.error})` : ''}` +
          `${aiResult.verdict ? ` [decision=${aiResult.verdict.decision}, confidence=${aiResult.verdict.confidence}]` : ''}\n`,
      )
    } else {
      // AI Judge 無効時: プレビューのみ Slack 送信
      await sendMessage({
        channel,
        text: [
          ':thread: *Threads投稿プレビュー*',
          `> ${post.finalPost.slice(0, 300)}${post.finalPost.length > 300 ? '...' : ''}`,
          `トピック: ${topic}`,
          'AI Judge無効のため手動投稿が必要です。',
        ].join('\n'),
      })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(`Threads post generation failed: ${message}\n`)
    await sendMessage({
      channel,
      text: `:thread: Threads: Post generation failed — ${message}`,
    })
  }
}
