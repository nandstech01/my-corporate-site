/**
 * クロスプラットフォームコンテンツ連携
 *
 * 同じトピックのブログ→LinkedIn→Instagram→X間でコンテンツを相互参照。
 * ブログURLやビジュアルインサイトを各プラットフォーム生成時に注入。
 */

import { createClient } from '@supabase/supabase-js'

// ============================================================
// 型定義
// ============================================================

export interface CrossPlatformContext {
  readonly blogUrl?: string
  readonly blogTitle?: string
  readonly linkedinPostUrl?: string
  readonly linkedinPostText?: string
  readonly instagramStoryCaption?: string
  readonly xPostUrl?: string
  readonly xPostText?: string
}

export interface EnrichmentResult {
  readonly context: CrossPlatformContext
  readonly suggestions: readonly string[]
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

/**
 * ブログslugから関連する全プラットフォームのコンテンツを取得
 */
export async function getRelatedContent(
  blogSlug: string,
): Promise<CrossPlatformContext> {
  const supabase = getSupabase()

  const [blogResult, linkedinResult, instagramResult, xResult] =
    await Promise.allSettled([
      supabase
        .from('posts')
        .select('title, slug')
        .eq('slug', blogSlug)
        .eq('status', 'published')
        .single(),
      supabase
        .from('linkedin_post_analytics')
        .select('post_url, post_text')
        .ilike('post_text', `%${blogSlug}%`)
        .order('posted_at', { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from('instagram_story_queue')
        .select('caption')
        .eq('blog_slug', blogSlug)
        .in('status', ['approved', 'ready_to_post', 'posted'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from('x_post_analytics')
        .select('tweet_url, post_text')
        .ilike('post_text', `%${blogSlug}%`)
        .order('posted_at', { ascending: false })
        .limit(1)
        .single(),
    ])

  const context: CrossPlatformContext = {
    blogUrl:
      blogResult.status === 'fulfilled' && blogResult.value.data
        ? `https://nands.tech/blog/${blogResult.value.data.slug}`
        : undefined,
    blogTitle:
      blogResult.status === 'fulfilled' && blogResult.value.data
        ? blogResult.value.data.title
        : undefined,
    linkedinPostUrl:
      linkedinResult.status === 'fulfilled' && linkedinResult.value.data
        ? linkedinResult.value.data.post_url ?? undefined
        : undefined,
    linkedinPostText:
      linkedinResult.status === 'fulfilled' && linkedinResult.value.data
        ? linkedinResult.value.data.post_text?.slice(0, 200) ?? undefined
        : undefined,
    instagramStoryCaption:
      instagramResult.status === 'fulfilled' && instagramResult.value.data
        ? instagramResult.value.data.caption?.slice(0, 200) ?? undefined
        : undefined,
    xPostUrl:
      xResult.status === 'fulfilled' && xResult.value.data
        ? xResult.value.data.tweet_url ?? undefined
        : undefined,
    xPostText:
      xResult.status === 'fulfilled' && xResult.value.data
        ? xResult.value.data.post_text?.slice(0, 200) ?? undefined
        : undefined,
  }

  return context
}

/**
 * コンテンツ生成時にクロスプラットフォーム参照を提供
 */
export async function enrichForPlatform(
  blogSlug: string,
  targetPlatform: 'linkedin' | 'instagram' | 'x',
): Promise<EnrichmentResult> {
  const context = await getRelatedContent(blogSlug)
  const suggestions: string[] = []

  if (targetPlatform === 'linkedin') {
    if (context.blogUrl) {
      suggestions.push(`ブログ記事を参照: ${context.blogUrl}`)
    }
    if (context.xPostText) {
      suggestions.push(`X投稿で反応が良かった切り口: "${context.xPostText.slice(0, 100)}"`)
    }
  }

  if (targetPlatform === 'instagram') {
    if (context.blogUrl) {
      suggestions.push(`「プロフィールのリンクから詳細を読めます」と誘導`)
    }
    if (context.linkedinPostText) {
      suggestions.push(`LinkedIn投稿の反応を参考に: "${context.linkedinPostText.slice(0, 100)}"`)
    }
  }

  if (targetPlatform === 'x') {
    if (context.blogUrl) {
      suggestions.push(`ブログ記事リンク: ${context.blogUrl}`)
    }
    if (context.instagramStoryCaption) {
      suggestions.push(`Instagramストーリーの切り口: "${context.instagramStoryCaption.slice(0, 100)}"`)
    }
  }

  return { context, suggestions }
}
