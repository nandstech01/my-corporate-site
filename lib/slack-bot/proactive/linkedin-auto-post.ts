/**
 * LinkedIn 自動投稿生成ジョブ
 *
 * GitHub Actions cron (火-日 01:00 UTC = JST 10:00) で実行。
 *
 * 1. slack_bot_memory から直近の linkedin_sources を recall
 * 2. メモリからトップ2件の候補を抽出
 * 3. 各候補に対して generateLinkedInPost() を並列実行
 * 4. 生成成功した投稿ごとに承認ブロック付きで Slack 送信
 */

import { createClient } from '@supabase/supabase-js'
import { createPendingAction, getRecentlyPostedSourceUrls } from '../memory'
import { sendMessage, buildApprovalBlocks } from '../slack-client'
import { generateLinkedInPost } from '../../linkedin-post-generation/linkedin-graph'
import { linkedInTemplates } from '../../linkedin-post-generation/linkedin-templates'
import { isAiJudgeEnabled } from '../../ai-judge/config'
import { autoResolvePost } from '../../ai-judge/auto-resolver'
import type { LinkedInTopicCandidate } from '../../linkedin-source-collector/source-analyzer'
import { getLinkedInLearnings } from './linkedin-learnings'

// ============================================================
// LinkedIn ソースメモリの取得
// ============================================================

/**
 * source-collector は context JSON に { source: 'linkedin_sources', candidates: [...] }
 * として保存する。content フィールドは LLM が生成した自然言語サマリーなので
 * 'linkedin_sources' という文字列を含む保証がない。
 * context->>'source' = 'linkedin_sources' で直接検索する。
 */
async function recallLinkedInSourceMemories(
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
    throw new Error(`Failed to recall LinkedIn source memories: ${error.message}`)
  }

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
// パターンマッチによる候補ランキング
// ============================================================

function rankCandidatesByPatternMatch(
  candidates: readonly LinkedInTopicCandidate[],
  topPatterns: readonly string[],
): readonly LinkedInTopicCandidate[] {
  if (topPatterns.length === 0) return candidates

  // Build a set of preferred source types from high-performing template IDs
  const preferredSourceTypes = new Set<string>()
  for (const patternId of topPatterns) {
    const template = linkedInTemplates.find((t) => t.id === patternId)
    if (template) {
      for (const st of template.sourceTypes) {
        preferredSourceTypes.add(st)
      }
    }
  }

  const scored = candidates.map((candidate) => {
    const score = preferredSourceTypes.has(candidate.sourceType) ? 1 : 0
    return { candidate, score }
  })

  return [...scored]
    .sort((a, b) => b.score - a.score)
    .map((s) => s.candidate)
}

// ============================================================
// メイン
// ============================================================

const MAX_POSTS = 2
const PREVIEW_CHAR_LIMIT = 800

export async function runLinkedInAutoPost(): Promise<void> {
  const channel = process.env.SLACK_DEFAULT_CHANNEL
  const userId = process.env.SLACK_ALLOWED_USER_IDS?.split(',')[0]

  if (!channel || !userId) {
    throw new Error(
      'SLACK_DEFAULT_CHANNEL and SLACK_ALLOWED_USER_IDS are required',
    )
  }

  // 1. 直近の linkedin_sources メモリを取得
  //    source-collector は context.source = 'linkedin_sources' で保存するので
  //    content の ilike 検索ではなく context ベースで検索する
  const memories = await recallLinkedInSourceMemories(userId, 5)

  if (memories.length === 0) {
    await sendMessage({
      channel,
      text: ':briefcase: LinkedIn: No fresh source data today. Run the source collector first.',
    })
    return
  }

  // 2. メモリから候補を抽出
  const allCandidates = extractCandidatesFromMemories(memories)

  if (allCandidates.length === 0) {
    await sendMessage({
      channel,
      text: ':briefcase: LinkedIn: Source data found but no structured candidates. Run the source collector again.',
    })
    return
  }

  // 2.5. Source dedup: 直近7日以内に投稿済みのソースURLを除外
  let candidates: readonly LinkedInTopicCandidate[] = allCandidates
  try {
    const recentUrls = await getRecentlyPostedSourceUrls(7)
    const recentUrlSet = new Set(recentUrls)
    const deduped = allCandidates.filter(
      (c) => !recentUrlSet.has(c.sourceUrl),
    )
    if (deduped.length < allCandidates.length) {
      process.stdout.write(
        `Source dedup: ${allCandidates.length - deduped.length} duplicate(s) removed\n`,
      )
    }
    candidates = deduped.length > 0 ? deduped : allCandidates
  } catch {
    // Dedup failure should not block the pipeline
  }

  // 学習データがあれば高パフォーマンスパターンに合致する候補を優先
  let rankedCandidates: readonly LinkedInTopicCandidate[] = candidates
  try {
    const learnings = await getLinkedInLearnings(userId)
    if (learnings && learnings.topPatterns.length > 0) {
      rankedCandidates = rankCandidatesByPatternMatch(
        candidates,
        learnings.topPatterns,
      )
      process.stdout.write(
        `Ranked candidates by learned patterns: ${learnings.topPatterns.join(', ')}\n`,
      )
    }
  } catch {
    // 学習データ取得失敗時はデフォルト順序で続行
  }

  const topCandidates = rankedCandidates.slice(0, MAX_POSTS)
  process.stdout.write(
    `Generating ${topCandidates.length} LinkedIn posts...\n`,
  )

  // 3. 各候補に対して generateLinkedInPost() を並列実行
  const postResults = await Promise.allSettled(
    topCandidates.map((candidate) =>
      generateLinkedInPost({
        sourceData: candidate.sourceBody,
        sourceType: candidate.sourceType,
        sourceUrl: candidate.sourceUrl,
        japanAngle: candidate.japanAngle,
      }),
    ),
  )

  // 4. 生成成功した投稿ごとに AI Judge 自動投稿 or 承認ブロック付きで Slack 送信
  let sentCount = 0

  for (let i = 0; i < postResults.length; i++) {
    const result = postResults[i]
    if (result.status !== 'fulfilled') {
      process.stdout.write(
        `Post generation failed for candidate ${i + 1}: ${result.reason}\n`,
      )
      continue
    }

    const candidate = topCandidates[i]
    const post = result.value

    try {
      // AI Judge 自動投稿モード
      if (isAiJudgeEnabled()) {
        const aiResult = await autoResolvePost({
          platform: 'linkedin',
          text: post.finalPost,
          sourceUrl: candidate.sourceUrl,
          sourceTitle: candidate.title,
          patternUsed: post.patternUsed,
          tags: [...post.tags],
        })
        if (aiResult.success) {
          sentCount++
        }
        process.stdout.write(
          `LinkedIn auto-post (AI Judge): candidate ${i + 1} "${candidate.title}" → ${aiResult.success ? 'posted' : 'rejected'}\n`,
        )
        continue
      }

      // レガシー: pending action + Slack 承認フロー
      const action = await createPendingAction({
        slackChannelId: channel,
        slackUserId: userId,
        slackThreadTs: null,
        actionType: 'post_linkedin',
        payload: {
          text: post.finalPost,
          sourceType: candidate.sourceType,
          sourceUrl: candidate.sourceUrl,
          patternUsed: post.patternUsed,
          tags: post.tags,
        },
        previewText: post.finalPost,
      })

      // 承認ブロックを構築
      const approvalBlocks = buildApprovalBlocks({
        title: `:briefcase: *LinkedIn Post Preview*`,
        previewText: post.finalPost.slice(0, PREVIEW_CHAR_LIMIT),
        actionId: action.id,
        actionType: 'linkedin',
      })

      // Slack 送信
      const scoreTotal = post.scores.length > 0
        ? Math.round(
            post.scores.reduce((sum, s) => sum + s.total, 0) /
              post.scores.length,
          )
        : 0

      // ML insight for best candidate
      const bestScore = [...post.scores].sort((a, b) => b.total - a.total)[0]
      let mlInsightText = ''
      if (bestScore && bestScore.mlEngagementPrediction > 0) {
        const topFeaturesSummary = bestScore.mlTopFeatures
          .slice(0, 3)
          .map((f) => `${f.name} ${(f.importance * 100).toFixed(0)}%`)
          .join(', ')
        mlInsightText = `:robot_face: *ML予測:* ${bestScore.mlEngagementPrediction.toFixed(1)} (${topFeaturesSummary})`
      }

      const infoLines = [
        `:newspaper: *ソース:* ${candidate.title}`,
        `:bar_chart: *スコア:* ${scoreTotal}/50`,
        `:memo: *パターン:* ${post.patternUsed}`,
      ]
      if (mlInsightText) {
        infoLines.push(mlInsightText)
      }

      await sendMessage({
        channel,
        text: `LinkedIn auto-post preview: ${candidate.title}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: sentCount === 0
                ? ':mega: *LinkedIn投稿を自動生成しました！確認お願いします*'
                : ':mega: *次の候補*',
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

      sentCount++
      process.stdout.write(
        `Sent approval request for candidate ${i + 1}: ${candidate.title}\n`,
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      process.stdout.write(
        `Failed to send approval for candidate ${i + 1}: ${message}\n`,
      )
    }
  }

  if (sentCount === 0) {
    await sendMessage({
      channel,
      text: ':briefcase: LinkedIn: Post generation failed for all candidates today. Check logs for details.',
    })
  } else {
    process.stdout.write(
      `LinkedIn auto-post: ${sentCount} ${isAiJudgeEnabled() ? 'auto-posts' : 'approval requests'} sent\n`,
    )
  }
}
