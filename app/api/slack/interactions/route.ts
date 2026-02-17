/**
 * Slack Interactions API ルート
 *
 * 承認/拒否ボタンの処理 (Human-in-the-Loop)
 */

import { NextRequest, NextResponse } from 'next/server'
import * as crypto from 'crypto'
import { postTweet, replyToTweet } from '@/lib/x-api/client'
import { postToLinkedIn } from '@/lib/linkedin-api/client'
import {
  resolvePendingAction,
  getPendingAction,
  savePostAnalytics,
  saveLinkedInPostAnalytics,
  markPendingActionForEdit,
} from '@/lib/slack-bot/memory'
import { predictEngagement } from '@/lib/linkedin-ml-bridge/ml-client'
import { sendMessage, updateMessage } from '@/lib/slack-bot/slack-client'
import type { SlackInteractionPayload } from '@/lib/slack-bot/types'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

// ============================================================
// 署名検証
// ============================================================

function verifySlackSignature(
  signingSecret: string,
  timestamp: string,
  body: string,
  signature: string,
): boolean {
  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5
  if (parseInt(timestamp, 10) < fiveMinutesAgo) {
    return false
  }

  const sigBasestring = `v0:${timestamp}:${body}`
  const hmac = crypto.createHmac('sha256', signingSecret)
  hmac.update(sigBasestring)
  const mySignature = `v0=${hmac.digest('hex')}`

  const myBuf = Buffer.from(mySignature)
  const sigBuf = Buffer.from(signature)
  if (myBuf.length !== sigBuf.length) {
    return false
  }
  return crypto.timingSafeEqual(myBuf, sigBuf)
}

// ============================================================
// アクション処理
// ============================================================

async function handleApprovePost(
  actionId: string,
  channel: string,
  threadTs?: string,
): Promise<void> {
  const action = await getPendingAction(actionId)
  if (!action || action.status !== 'pending') {
    await sendMessage({
      channel,
      text: ':warning: This action has already been processed.',
      threadTs,
    })
    return
  }

  const resolved = await resolvePendingAction(actionId, 'approved')
  const payload = resolved.payload as {
    text: string
    longForm?: boolean
    mediaIds?: string[]
    sourceUrl?: string
  }

  const result = await postTweet(payload.text, {
    longForm: payload.longForm,
    mediaIds: payload.mediaIds,
  })

  if (result.success) {
    // Save analytics
    await savePostAnalytics({
      tweetId: result.tweetId!,
      tweetUrl: result.tweetUrl,
      postText: payload.text,
      postMode: resolved.action_type === 'post_x_long' ? 'article' : 'research',
    })

    // ソースURLがあればリプライで自動投稿
    let replyInfo = ''
    if (payload.sourceUrl && result.tweetId) {
      try {
        const replyResult = await replyToTweet(payload.sourceUrl, result.tweetId)
        if (replyResult.success) {
          replyInfo = `\n:link: Source URL reply: ${replyResult.tweetUrl}`
        } else {
          replyInfo = `\n:warning: Source URL reply failed: ${replyResult.error}`
        }
      } catch (replyError) {
        const replyMessage = replyError instanceof Error ? replyError.message : 'Unknown error'
        replyInfo = `\n:warning: Source URL reply failed: ${replyMessage}`
      }
    }

    await sendMessage({
      channel,
      text: `:white_check_mark: Posted to X!\n${result.tweetUrl}${replyInfo}`,
      threadTs,
    })
  } else {
    await sendMessage({
      channel,
      text: `:x: Failed to post: ${result.error}`,
      threadTs,
    })
  }
}

async function handleRejectPost(
  actionId: string,
  channel: string,
  threadTs?: string,
): Promise<void> {
  const action = await getPendingAction(actionId)
  if (!action || action.status !== 'pending') {
    await sendMessage({
      channel,
      text: ':warning: This action has already been processed.',
      threadTs,
    })
    return
  }

  await resolvePendingAction(actionId, 'rejected')

  await sendMessage({
    channel,
    text: ':no_entry_sign: Post cancelled.',
    threadTs,
  })
}

async function handleApproveBlog(
  actionId: string,
  channel: string,
  threadTs?: string,
): Promise<void> {
  const action = await getPendingAction(actionId)
  if (!action || action.status !== 'pending') {
    await sendMessage({
      channel,
      text: ':warning: This action has already been processed.',
      threadTs,
    })
    return
  }

  await resolvePendingAction(actionId, 'approved')

  const payload = action.payload as { title: string; outline: string }

  // Trigger GitHub Actions workflow
  const githubToken = process.env.GITHUB_TOKEN
  if (githubToken) {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${process.env.GITHUB_REPO ?? 'nands/my-corporate-site'}/actions/workflows/generate-blog.yml/dispatches`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ref: 'main',
            inputs: {
              title: payload.title,
              outline: payload.outline,
            },
          }),
        },
      )

      if (response.ok) {
        await sendMessage({
          channel,
          text: `:white_check_mark: Blog generation triggered!\nTitle: ${payload.title}`,
          threadTs,
        })
      } else {
        await sendMessage({
          channel,
          text: `:warning: GitHub Actions trigger failed (${response.status})`,
          threadTs,
        })
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error'
      await sendMessage({
        channel,
        text: `:x: Failed to trigger blog generation: ${message}`,
        threadTs,
      })
    }
  } else {
    await sendMessage({
      channel,
      text: ':white_check_mark: Blog approved (GitHub Actions not configured)',
      threadTs,
    })
  }
}

// ============================================================
// Blog Topic Queue アクション処理
// ============================================================

async function handleApproveBlogTopic(
  topicId: string,
  channel: string,
  threadTs?: string,
): Promise<void> {
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // Get topic from queue
  const { data: topic, error } = await supabase
    .from('blog_topic_queue')
    .select('*')
    .eq('id', topicId)
    .single()

  if (error || !topic || topic.status === 'approved') {
    await sendMessage({
      channel,
      text: ':warning: This topic has already been processed.',
      threadTs,
    })
    return
  }

  // Update topic status
  await supabase
    .from('blog_topic_queue')
    .update({ status: 'approved' })
    .eq('id', topicId)

  // Create blog job (category from buzz_breakdown if manual, otherwise default)
  const breakdown = topic.buzz_breakdown as Record<string, unknown> | null
  const categorySlug = (breakdown?.category as string) || 'ai-technology'

  const { data: job, error: jobError } = await supabase
    .from('blog_jobs')
    .insert({
      topic_queue_id: topicId,
      topic: topic.suggested_topic || topic.source_title,
      target_keyword: topic.suggested_keyword || topic.source_title,
      category_slug: categorySlug,
      business_category: categorySlug,
      status: 'queued',
    })
    .select()
    .single()

  if (jobError || !job) {
    await sendMessage({
      channel,
      text: `:x: Failed to create blog job: ${jobError?.message || 'Unknown error'}`,
      threadTs,
    })
    return
  }

  // Trigger the pipeline
  try {
    const triggerResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://nands.tech'}/api/blog-trigger`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.BLOG_WORKER_API_SECRET || ''}`,
        },
        body: JSON.stringify({ jobId: job.id }),
      },
    )

    if (triggerResponse.ok) {
      await sendMessage({
        channel,
        text: `:white_check_mark: Blog generation triggered!\nTopic: ${topic.suggested_topic || topic.source_title}\nJob ID: ${job.id.substring(0, 8)}`,
        threadTs,
      })
    } else {
      await sendMessage({
        channel,
        text: `:warning: Blog job created but trigger failed (${triggerResponse.status}). Job ID: ${job.id.substring(0, 8)}`,
        threadTs,
      })
    }
  } catch (triggerError) {
    const message = triggerError instanceof Error ? triggerError.message : 'Unknown error'
    await sendMessage({
      channel,
      text: `:warning: Blog job created but trigger failed: ${message}. Job ID: ${job.id.substring(0, 8)}`,
      threadTs,
    })
  }
}

async function handleDismissBlogTopic(
  topicId: string,
  channel: string,
  threadTs?: string,
): Promise<void> {
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  await supabase
    .from('blog_topic_queue')
    .update({ status: 'dismissed' })
    .eq('id', topicId)

  await sendMessage({
    channel,
    text: ':no_entry_sign: Blog topic dismissed.',
    threadTs,
  })
}

// ============================================================
// LinkedIn アクション処理
// ============================================================

async function handleApproveLinkedIn(
  actionId: string,
  channel: string,
  threadTs?: string,
): Promise<void> {
  const action = await getPendingAction(actionId)
  if (!action || action.status !== 'pending') {
    await sendMessage({
      channel,
      text: ':warning: This action has already been processed.',
      threadTs,
    })
    return
  }

  const resolved = await resolvePendingAction(actionId, 'approved')
  const payload = resolved.payload as {
    text: string
    sourceType?: string
    sourceUrl?: string
    patternUsed?: string
    tags?: string[]
  }

  const result = await postToLinkedIn({ text: payload.text })

  if (result.success) {
    // ML prediction for feature storage (best-effort)
    let mlFeatures: Record<string, number> | undefined
    let mlPrediction: number | undefined
    let mlConfidence: number | undefined
    let mlModelVersion: string | undefined

    try {
      const now = new Date()
      const prediction = await predictEngagement(payload.text, {
        dayOfWeek: now.getUTCDay(),
        hour: (now.getUTCHours() + 9) % 24,
      })
      if (prediction) {
        mlFeatures = prediction.features
        mlPrediction = prediction.predictedEngagement
        mlConfidence = prediction.confidence
        mlModelVersion = prediction.modelVersion
      }
    } catch {
      // ML prediction failure should not block posting
    }

    await saveLinkedInPostAnalytics({
      linkedinPostId: result.postId ?? `li_${Date.now()}`,
      postUrl: result.postUrl,
      postText: payload.text,
      sourceType: payload.sourceType,
      sourceUrl: payload.sourceUrl,
      patternUsed: payload.patternUsed,
      tags: payload.tags,
      mlFeatures,
      mlPrediction,
      mlConfidence,
      mlModelVersion,
    })

    await sendMessage({
      channel,
      text: `:white_check_mark: Posted to LinkedIn!\n${result.postUrl ?? 'Post published successfully'}`,
      threadTs,
    })
  } else {
    await sendMessage({
      channel,
      text: `:x: Failed to post to LinkedIn: ${result.error}`,
      threadTs,
    })
  }
}

// ============================================================
// Instagram Story アクション処理
// ============================================================

async function handleApproveInstagramStory(
  actionId: string,
  channel: string,
  threadTs?: string,
): Promise<void> {
  const action = await getPendingAction(actionId)
  if (!action || action.status !== 'pending') {
    await sendMessage({
      channel,
      text: ':warning: This action has already been processed.',
      threadTs,
    })
    return
  }

  const resolved = await resolvePendingAction(actionId, 'approved')
  const payload = resolved.payload as {
    storyQueueId: string
    blogSlug: string
    caption: string
    imageUrl: string
    hashtags: string[]
    ctaUrl: string
  }

  // Update instagram_story_queue status
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  await supabase
    .from('instagram_story_queue')
    .update({
      status: 'ready_to_post',
      approved_at: new Date().toISOString(),
    })
    .eq('id', payload.storyQueueId)

  // Try posting if enabled
  const { isInstagramPostingEnabled, postInstagramStory } = await import(
    '@/lib/instagram-api/client'
  )

  if (isInstagramPostingEnabled()) {
    const result = await postInstagramStory({
      imageUrl: payload.imageUrl,
      caption: payload.caption,
    })

    if (result.success && result.status === 'posted') {
      await supabase
        .from('instagram_story_queue')
        .update({ status: 'posted', posted_at: new Date().toISOString() })
        .eq('id', payload.storyQueueId)

      await sendMessage({
        channel,
        text: `:white_check_mark: Instagram Story posted!\nBlog: ${payload.blogSlug}`,
        threadTs,
      })
    } else {
      await sendMessage({
        channel,
        text: `:warning: Story approved but posting failed: ${result.error}`,
        threadTs,
      })
    }
  } else {
    await sendMessage({
      channel,
      text: `:white_check_mark: Instagram Story approved! (ready_to_post)\nPosting is disabled — content will be posted when Akool integration is configured.\nBlog: ${payload.blogSlug}`,
      threadTs,
    })
  }
}

// ============================================================
// Route Handler
// ============================================================

export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  // Slack sends interactions as application/x-www-form-urlencoded
  const params = new URLSearchParams(rawBody)
  const payloadStr = params.get('payload')

  if (!payloadStr) {
    return NextResponse.json({ error: 'Missing payload' }, { status: 400 })
  }

  // 署名検証
  const signingSecret = process.env.SLACK_SIGNING_SECRET
  if (!signingSecret) {
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 },
    )
  }

  const timestamp = request.headers.get('x-slack-request-timestamp') ?? ''
  const signature = request.headers.get('x-slack-signature') ?? ''

  if (!verifySlackSignature(signingSecret, timestamp, rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: SlackInteractionPayload

  try {
    payload = JSON.parse(payloadStr) as SlackInteractionPayload
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  if (payload.type !== 'block_actions' || !payload.actions?.length) {
    return new Response('OK', { status: 200 })
  }

  const action = payload.actions[0]
  const channel = payload.channel.id
  const threadTs = payload.message?.thread_ts ?? payload.message?.ts

  // Process action
  try {
    switch (action.action_id) {
      case 'approve_post':
        await handleApprovePost(action.value, channel, threadTs)
        break
      case 'reject_post':
        await handleRejectPost(action.value, channel, threadTs)
        break
      case 'approve_blog':
        await handleApproveBlog(action.value, channel, threadTs)
        break
      case 'reject_blog':
        await handleRejectPost(action.value, channel, threadTs)
        break
      case 'approve_linkedin':
        await handleApproveLinkedIn(action.value, channel, threadTs)
        break
      case 'reject_linkedin':
        await handleRejectPost(action.value, channel, threadTs)
        break
      case 'edit_action': {
        const editResult = await markPendingActionForEdit(action.value)
        if (editResult) {
          await sendMessage({
            channel,
            text: ':pencil: 編集指示をこのスレッドに送ってね！例:「URLを削除して」「もっと短くして」',
            threadTs,
          })
        } else {
          await sendMessage({
            channel,
            text: ':warning: このアクションはもう処理済みだよ',
            threadTs,
          })
        }
        break
      }
      case 'approve_blog_topic':
        await handleApproveBlogTopic(action.value, channel, threadTs)
        break
      case 'dismiss_blog_topic':
        await handleDismissBlogTopic(action.value, channel, threadTs)
        break
      case 'approve_instagram_story':
        await handleApproveInstagramStory(action.value, channel, threadTs)
        break
      case 'reject_instagram_story':
        await handleRejectPost(action.value, channel, threadTs)
        break
      default:
        break
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error'
    await sendMessage({
      channel,
      text: `:warning: Error processing action: ${message}`,
      threadTs,
    })
  }

  return new Response('OK', { status: 200 })
}
