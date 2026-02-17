/**
 * Instagram Story 生成トリガー
 *
 * ブログ記事完了時 or 手動呼び出しで:
 * 1. story-graph.ts でキャプション生成
 * 2. image-generator.ts で画像生成
 * 3. instagram_story_queue に保存
 * 4. slack_pending_actions にエントリ作成
 * 5. Slackプレビュー + 承認ボタン送信
 */

import { createClient } from '@supabase/supabase-js'
import { generateInstagramStory } from './story-graph'
import { generateStoryImage } from './image-generator'
import {
  sendMessage,
  uploadFile,
  buildApprovalBlocks,
} from '../slack-bot/slack-client'

// ============================================================
// 型定義
// ============================================================

export interface TriggerOptions {
  readonly blogSlug: string
  readonly blogTitle: string
  readonly blogContent: string
  readonly blogExcerpt?: string
  readonly blogTags?: readonly string[]
  readonly slackChannelId: string
  readonly slackUserId: string
  readonly slackThreadTs?: string
}

export interface TriggerResult {
  readonly success: boolean
  readonly storyQueueId?: string
  readonly actionId?: string
  readonly error?: string
}

// ============================================================
// Supabase ヘルパー
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
// メイン
// ============================================================

export async function triggerInstagramStory(
  options: TriggerOptions,
): Promise<TriggerResult> {
  const supabase = getSupabase()

  try {
    // 1. ストーリーコンテンツ生成
    process.stdout.write(
      `Generating Instagram story for: ${options.blogSlug}\n`,
    )

    const story = await generateInstagramStory({
      blogTitle: options.blogTitle,
      blogSlug: options.blogSlug,
      blogContent: options.blogContent,
      blogExcerpt: options.blogExcerpt,
      blogTags: options.blogTags,
    })

    // 2. 画像生成
    const image = await generateStoryImage(
      story.imagePrompt,
      options.blogSlug,
    )

    // 3. instagram_story_queue に保存
    const { data: queueEntry, error: queueError } = await supabase
      .from('instagram_story_queue')
      .insert({
        blog_slug: options.blogSlug,
        blog_title: options.blogTitle,
        caption: story.caption,
        image_url: image.imageUrl,
        image_prompt: story.imagePrompt,
        hashtags: [...story.hashtags],
        cta_url: story.ctaUrl,
        status: 'pending_approval',
        score: story.scores.length > 0
          ? Math.max(...story.scores.map((s) => s.total))
          : 0,
        all_candidates: story.allCandidates,
        scores: story.scores,
      })
      .select()
      .single()

    if (queueError || !queueEntry) {
      return {
        success: false,
        error: `Failed to save to queue: ${queueError?.message ?? 'Unknown'}`,
      }
    }

    // 4. slack_pending_actions にエントリ作成
    const { data: pendingAction, error: actionError } = await supabase
      .from('slack_pending_actions')
      .insert({
        slack_channel_id: options.slackChannelId,
        slack_user_id: options.slackUserId,
        slack_thread_ts: options.slackThreadTs ?? null,
        action_type: 'post_instagram_story',
        payload: {
          storyQueueId: queueEntry.id,
          blogSlug: options.blogSlug,
          caption: story.caption,
          imageUrl: image.imageUrl,
          hashtags: story.hashtags,
          ctaUrl: story.ctaUrl,
        },
        preview_text: story.caption,
        status: 'pending',
      })
      .select()
      .single()

    if (actionError || !pendingAction) {
      return {
        success: false,
        storyQueueId: queueEntry.id,
        error: `Failed to create pending action: ${actionError?.message ?? 'Unknown'}`,
      }
    }

    // 5. Slackにプレビュー送信
    const previewCaption = story.caption.length > 800
      ? `${story.caption.slice(0, 800)}...`
      : story.caption

    // 画像をSlackに送信（Geminiで生成した場合はURLをメッセージで共有）
    if (image.source === 'gemini' || image.source === 'og_image') {
      await sendMessage({
        channel: options.slackChannelId,
        text: `:camera: Instagram Story 画像プレビュー\n${image.imageUrl}`,
        threadTs: options.slackThreadTs,
      })
    }

    const blocks = buildApprovalBlocks({
      title: ':camera: *Instagram Story Preview*',
      previewText: previewCaption,
      actionId: pendingAction.id,
      actionType: 'instagram_story',
    })

    await sendMessage({
      channel: options.slackChannelId,
      text: `Instagram Story Preview: ${story.caption.slice(0, 100)}...`,
      threadTs: options.slackThreadTs,
      blocks,
    })

    return {
      success: true,
      storyQueueId: queueEntry.id,
      actionId: pendingAction.id,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: message }
  }
}

// ============================================================
// 未ストーリー化ブログ検出
// ============================================================

export async function findUnstoriedBlogs(): Promise<
  readonly { slug: string; title: string }[]
> {
  const supabase = getSupabase()

  // 直近30日以内の公開ブログ記事で、まだストーリー化されていないもの
  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000,
  ).toISOString()

  const { data: posts } = await supabase
    .from('posts')
    .select('slug, title')
    .eq('status', 'published')
    .gte('created_at', thirtyDaysAgo)
    .order('created_at', { ascending: false })

  if (!posts || posts.length === 0) return []

  const slugs = posts.map((p) => p.slug)
  const { data: existingStories } = await supabase
    .from('instagram_story_queue')
    .select('blog_slug')
    .in('blog_slug', slugs)

  const storiedSlugs = new Set(
    (existingStories ?? []).map((s) => s.blog_slug),
  )

  return posts.filter((p) => !storiedSlugs.has(p.slug))
}
