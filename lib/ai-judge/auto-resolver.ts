/**
 * AI Judge 自動解決
 *
 * PostCandidate を受け取り、AI Judge の判定に基づいて
 * 自動投稿 or 却下を実行する。Phase 1 では edit = reject 扱い。
 */

import { createClient } from '@supabase/supabase-js'
import { getCalibratedThreshold } from './calibrated-threshold'
import { isKillSwitchActive } from './emergency'
import { judgePost } from './judge'
import { notifyPostPublished, notifyPostRejected } from './slack-notifier'
import type { AutoResolveResult, JudgeVerdict, Platform, PostCandidate } from './types'
import { postTweet, replyToTweet, quoteTweet, postThread } from '../x-api/client'
import { QUOTE_TWEET_CONFIDENCE_THRESHOLD, getDailyPostLimit } from './config'
import { postToLinkedIn } from '../linkedin-api/client'
import { postToThreads } from '../threads-api/client'
import { predictEngagement } from '../linkedin-ml-bridge/ml-client'
import { savePostAnalytics, saveLinkedInPostAnalytics, saveThreadsPostAnalytics } from '../slack-bot/memory'
import { revisePost } from '../content-critique/critique-engine'

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
// Default Reject Verdict
// ============================================================

const DEFAULT_REJECT_VERDICT: JudgeVerdict = {
  decision: 'reject',
  confidence: 0,
  reasoning: 'Kill switch is active',
  safetyFlags: ['kill_switch_active'],
  topicRelevance: 0,
}

// ============================================================
// Today's Post Count
// ============================================================

async function getTodayPostCount(platform: Platform): Promise<number> {
  const supabase = getSupabase()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { count, error } = await supabase
    .from('ai_judge_decisions')
    .select('id', { count: 'exact', head: true })
    .eq('platform', platform)
    .eq('was_posted', true)
    .gte('created_at', todayStart.toISOString())

  if (error) {
    throw new Error(`Failed to get today's post count: ${error.message}`)
  }

  return count ?? 0
}

// ============================================================
// Update Decision Record
// ============================================================

async function markDecisionAsPosted(params: {
  readonly pendingActionId: string
  readonly postId: string
  readonly postedAt: string
}): Promise<void> {
  const supabase = getSupabase()

  const { error } = await supabase
    .from('ai_judge_decisions')
    .update({
      was_posted: true,
      post_id: params.postId,
      posted_at: params.postedAt,
      auto_resolved: true,
    })
    .eq('pending_action_id', params.pendingActionId)

  if (error) {
    throw new Error(`Failed to mark decision as posted: ${error.message}`)
  }
}

// ============================================================
// Markdown Stripping (X投稿からMarkdown記号を除去)
// ============================================================

function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '')           // heading markers
    .replace(/\*\*(.+?)\*\*/g, '$1')        // bold **text**
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '$1') // italic *text*
    .replace(/^-{3,}$/gm, '')               // horizontal rules ---
    .replace(/\n{3,}/g, '\n\n')             // collapse blank lines
    .trim()
}

// ============================================================
// Platform-Specific Posting
// ============================================================

async function postToX(post: PostCandidate): Promise<{
  readonly postId?: string
  readonly postUrl?: string
  readonly error?: string
}> {
  // Strip Markdown from all text before posting to X
  const cleanText = stripMarkdown(post.text)
  const cleanSegments = post.threadSegments
    ? post.threadSegments.map(stripMarkdown)
    : undefined

  let result

  // Branch: Quote Tweet
  if (post.quoteTweetId) {
    result = await quoteTweet(cleanText, post.quoteTweetId)
  }
  // Branch: Thread
  else if (cleanSegments && cleanSegments.length > 0) {
    result = await postThread(cleanSegments)
  }
  // Default: Regular tweet (or long-form article)
  else {
    result = await postTweet(cleanText, {
      longForm: post.longForm,
      mediaIds: post.mediaIds ? [...post.mediaIds] : undefined,
    })
  }

  if (!result.success) {
    return { error: result.error }
  }

  // Reply with source URL if available (not for quote tweets which already reference source)
  if (post.sourceUrl && result.tweetId && !post.quoteTweetId) {
    try {
      await replyToTweet(post.sourceUrl, result.tweetId)
    } catch {
      // Best-effort: reply failure should not block the main post
    }
  }

  // Determine post type for analytics
  const postType: 'original' | 'quote' | 'thread' | 'reply' | 'repost' | 'article' = post.quoteTweetId
    ? 'quote'
    : post.threadSegments
      ? 'thread'
      : post.longForm
        ? 'article'
        : 'original'

  // Save analytics
  try {
    await savePostAnalytics({
      tweetId: result.tweetId ?? '',
      tweetUrl: result.tweetUrl,
      postText: post.text,
      patternUsed: post.patternUsed,
      tags: post.tags ? [...post.tags] : undefined,
      postType,
      quotedTweetId: post.quoteTweetId,
    })
  } catch {
    // Best-effort: analytics failure should not block
  }

  return { postId: result.tweetId, postUrl: result.tweetUrl }
}

async function postToLinkedInPlatform(post: PostCandidate): Promise<{
  readonly postId?: string
  readonly postUrl?: string
  readonly error?: string
}> {
  const result = await postToLinkedIn({ text: post.text })

  if (!result.success) {
    return { error: result.error }
  }

  // ML prediction (best-effort)
  let mlPrediction: number | undefined
  let mlConfidence: number | undefined
  let mlFeatures: Record<string, number> | undefined
  let mlModelVersion: string | undefined

  try {
    const now = new Date()
    const prediction = await predictEngagement(post.text, {
      dayOfWeek: now.getDay(),
      hour: now.getHours(),
    })
    if (prediction) {
      mlPrediction = prediction.predictedEngagement
      mlConfidence = prediction.confidence
      mlFeatures = prediction.features
      mlModelVersion = prediction.modelVersion
    }
  } catch {
    // Best-effort: ML prediction failure should not block
  }

  // Save analytics
  try {
    await saveLinkedInPostAnalytics({
      linkedinPostId: result.postId ?? '',
      postUrl: result.postUrl,
      postText: post.text,
      sourceUrl: post.sourceUrl,
      patternUsed: post.patternUsed,
      tags: post.tags ? [...post.tags] : undefined,
      mlPrediction,
      mlConfidence,
      mlFeatures,
      mlModelVersion,
    })
  } catch {
    // Best-effort: analytics failure should not block
  }

  return { postId: result.postId, postUrl: result.postUrl }
}

async function postToThreadsPlatform(post: PostCandidate): Promise<{
  readonly postId?: string
  readonly postUrl?: string
  readonly error?: string
}> {
  const result = await postToThreads({ text: post.text })

  if (!result.success) {
    return { error: result.error }
  }

  // Save analytics (best-effort)
  try {
    await saveThreadsPostAnalytics({
      threadsMediaId: result.mediaId ?? '',
      postUrl: result.permalinkUrl,
      postText: post.text,
      sourceUrl: post.sourceUrl,
      patternUsed: post.patternUsed,
      tags: post.tags ? [...post.tags] : undefined,
    })
  } catch {
    // Best-effort: analytics failure should not block
  }

  return { postId: result.mediaId, postUrl: result.permalinkUrl }
}

// ============================================================
// Main: Auto-Resolve Post
// ============================================================

export async function autoResolvePost(post: PostCandidate): Promise<AutoResolveResult> {
  // 1. Check kill switch
  try {
    const killSwitchActive = await isKillSwitchActive()
    if (killSwitchActive) {
      return {
        success: false,
        error: 'Kill switch active',
        verdict: DEFAULT_REJECT_VERDICT,
        platform: post.platform,
      }
    }
  } catch (error) {
    return {
      success: false,
      error: `Kill switch check failed: ${error instanceof Error ? error.message : String(error)}`,
      verdict: DEFAULT_REJECT_VERDICT,
      platform: post.platform,
    }
  }

  // 2. L1: Pre-generation safety check (best-effort)
  try {
    const { isPreGenerationSafe } = await import('../safety/pre-generation-guard')
    const safetyResult = await isPreGenerationSafe()
    if (!safetyResult.safe) {
      return {
        success: false,
        error: `L1 safety block: ${safetyResult.pauseReason}`,
        verdict: {
          ...DEFAULT_REJECT_VERDICT,
          reasoning: safetyResult.pauseReason ?? 'Safety event detected',
          safetyFlags: ['l1_pre_generation_block'],
        },
        platform: post.platform,
      }
    }
  } catch {
    // Best-effort: L1 failure should not block posting
  }

  // 3. L2: Content validation (best-effort)
  try {
    const { validateContent } = await import('../safety/content-validator')
    const validation = await validateContent(post)
    if (!validation.passed) {
      return {
        success: false,
        error: `L2 content validation failed: ${validation.flags.join(', ')}`,
        verdict: {
          ...DEFAULT_REJECT_VERDICT,
          reasoning: `コンテンツ検証失敗: brand voice=${validation.brandVoiceScore.toFixed(2)}, fact check=${validation.factCheckPassed}`,
          safetyFlags: ['l2_content_validation_failed', ...validation.flags],
        },
        platform: post.platform,
      }
    }
  } catch {
    // Best-effort: L2 failure should not block posting
  }

  // 4. Get AI Judge verdict
  let verdict: JudgeVerdict
  try {
    verdict = await judgePost(post)
  } catch (error) {
    return {
      success: false,
      error: `Judge evaluation failed: ${error instanceof Error ? error.message : String(error)}`,
      verdict: DEFAULT_REJECT_VERDICT,
      platform: post.platform,
    }
  }

  // 5. Get calibrated threshold (quote tweets use stricter threshold)
  let dynamicThreshold: number
  try {
    const todayPostCount = await getTodayPostCount(post.platform)

    // Check daily post limit
    const dailyLimit = getDailyPostLimit(post.platform)
    if (todayPostCount >= dailyLimit) {
      return {
        success: false,
        error: `Daily post limit reached (${todayPostCount}/${dailyLimit})`,
        verdict: {
          ...DEFAULT_REJECT_VERDICT,
          reasoning: `日次投稿上限到達 (${todayPostCount}/${dailyLimit})`,
          safetyFlags: ['daily_limit_reached'],
        },
        platform: post.platform,
      }
    }

    dynamicThreshold = await getCalibratedThreshold(post.platform, todayPostCount)

    // Quote tweets require higher confidence (0.80 minimum)
    // Exception: long-form articles with quote tweets provide substantial original content
    if (post.quoteTweetId && !post.longForm) {
      dynamicThreshold = Math.max(dynamicThreshold, QUOTE_TWEET_CONFIDENCE_THRESHOLD)
    }
  } catch (error) {
    return {
      success: false,
      error: `Threshold calculation failed: ${error instanceof Error ? error.message : String(error)}`,
      verdict,
      platform: post.platform,
    }
  }

  // 6. Decision logic

  // 6a. Reject or below threshold
  if (verdict.decision === 'reject' || verdict.confidence < dynamicThreshold) {
    try {
      await notifyPostRejected({
        platform: post.platform,
        postText: post.text,
        verdict,
      })
    } catch {
      // Best-effort: notification failure should not change the result
    }

    return {
      success: false,
      error: 'Rejected by AI Judge',
      verdict,
      platform: post.platform,
    }
  }

  // 6b. Edit -> attempt revision via critique engine, then re-Judge
  if (verdict.decision === 'edit') {
    try {
      const editWeaknesses = verdict.editSuggestion
        ? [verdict.editSuggestion]
        : [verdict.reasoning]

      const revised = await revisePost({
        originalText: post.text,
        critique: {
          passed: false,
          overallScore: 0,
          dimensions: {
            hookStrength: 5,
            voiceAuthenticity: 5,
            engagementTrigger: 5,
            platformFit: 5,
            factualGrounding: 5,
          },
          strengths: [],
          weaknesses: editWeaknesses,
        },
        platform: post.platform,
        mode: 'short',
      })

      process.stdout.write(
        `[AI Judge] Edit decision: attempting revision (${revised.length} chars)\n`,
      )

      // 改訂版を再Judge
      const revisedPost: PostCandidate = { ...post, text: revised }
      const revisedVerdict = await judgePost(revisedPost)

      if (
        revisedVerdict.decision === 'approve' &&
        revisedVerdict.confidence >= dynamicThreshold
      ) {
        // 改訂版が承認された → 改訂版で投稿を続行
        process.stdout.write(
          `[AI Judge] Revised post approved (confidence=${revisedVerdict.confidence.toFixed(2)})\n`,
        )
        // Fall through to posting logic below with updated post and verdict
        // Recursion-free: directly call the posting section
        return autoResolveApprovedPost(revisedPost, revisedVerdict)
      }

      // 改訂版も不承認
      try {
        await notifyPostRejected({
          platform: post.platform,
          postText: revised,
          verdict: revisedVerdict,
        })
      } catch {
        // Best-effort
      }

      return {
        success: false,
        error: 'Revised post also rejected by AI Judge',
        verdict: revisedVerdict,
        platform: post.platform,
      }
    } catch (reviseError) {
      // revisePost failure → fall back to reject
      const editReasoning = verdict.editSuggestion
        ? `${verdict.reasoning} | 編集提案: ${verdict.editSuggestion}`
        : verdict.reasoning

      process.stderr.write(
        `[AI Judge] Edit revision failed: ${reviseError instanceof Error ? reviseError.message : String(reviseError)}\n`,
      )

      try {
        await notifyPostRejected({
          platform: post.platform,
          postText: post.text,
          verdict: { ...verdict, reasoning: editReasoning },
        })
      } catch {
        // Best-effort
      }

      return {
        success: false,
        error: 'Edit revision failed, treated as reject',
        verdict,
        platform: post.platform,
      }
    }
  }

  // 6c. Approve and above threshold -> post
  return autoResolveApprovedPost(post, verdict)
}

// ============================================================
// Approved Post Execution (shared by approve and edit→revise paths)
// ============================================================

async function autoResolveApprovedPost(
  post: PostCandidate,
  verdict: JudgeVerdict,
): Promise<AutoResolveResult> {
  try {
    let postResult: { readonly postId?: string; readonly postUrl?: string; readonly error?: string }

    if (post.platform === 'x') {
      postResult = await postToX(post)
    } else if (post.platform === 'linkedin') {
      postResult = await postToLinkedInPlatform(post)
    } else if (post.platform === 'threads') {
      postResult = await postToThreadsPlatform(post)
    } else {
      return {
        success: false,
        error: `Unsupported platform: ${post.platform}`,
        verdict,
        platform: post.platform,
      }
    }

    if (postResult.error) {
      return {
        success: false,
        error: postResult.error,
        verdict,
        platform: post.platform,
      }
    }

    // Update decision record
    if (post.pendingActionId && postResult.postId) {
      try {
        await markDecisionAsPosted({
          pendingActionId: post.pendingActionId,
          postId: postResult.postId,
          postedAt: new Date().toISOString(),
        })
      } catch {
        // Best-effort: DB update failure should not invalidate successful post
      }
    }

    // Notify success
    try {
      await notifyPostPublished({
        platform: post.platform,
        postText: post.text,
        postUrl: postResult.postUrl,
        verdict,
        sourceUrl: post.sourceUrl,
      })
    } catch {
      // Best-effort
    }

    return {
      success: true,
      postId: postResult.postId,
      postUrl: postResult.postUrl,
      verdict,
      platform: post.platform,
    }
  } catch (error) {
    return {
      success: false,
      error: `Posting failed: ${error instanceof Error ? error.message : String(error)}`,
      verdict,
      platform: post.platform,
    }
  }
}
