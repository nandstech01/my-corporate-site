/**
 * Cross-Post Pipeline Orchestrator
 *
 * Main entry point for cross-posting nands.tech articles to Zenn, Qiita, and note.
 * Coordinates: article fetch -> rewrite -> thumbnail -> publish -> analytics.
 */

import { createClient } from '@supabase/supabase-js'
import { fetchArticle } from '../x-post-generation/data-fetchers'
import { rewriteForPlatform } from './rewriter'
import { generateCrossPostThumbnail } from './thumbnail-generator'
import { publishToZenn } from './zenn-publisher'
import { publishToQiita } from './qiita-publisher'
import { publishToNote } from './note-publisher'
import type {
  CrossPostPlatform,
  CrossPostRequest,
  CrossPostResult,
  CrossPostAnalyticsRow,
  RewrittenArticle,
} from './types'

// ============================================================
// Supabase Client
// ============================================================

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  }
  return createClient(url, key)
}

// ============================================================
// Platform Publisher Map
// ============================================================

const PUBLISHERS: Readonly<Record<CrossPostPlatform, (article: RewrittenArticle) => Promise<CrossPostResult>>> = {
  zenn: publishToZenn,
  qiita: publishToQiita,
  note: publishToNote,
}

// ============================================================
// Analytics
// ============================================================

async function getPostId(slug: string): Promise<number | null> {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('posts')
    .select('id')
    .eq('slug', slug)
    .single()

  return data?.id ?? null
}

async function recordAnalytics(
  postId: number | null,
  result: CrossPostResult,
): Promise<void> {
  if (!postId) return

  const supabase = getSupabase()
  const row: CrossPostAnalyticsRow = {
    post_id: postId,
    platform: result.platform,
    external_url: result.url ?? null,
    external_id: null,
    status: result.success ? 'posted' : 'failed',
    posted_at: result.success ? new Date().toISOString() : null,
    error_message: result.error ?? null,
  }

  const { error } = await supabase
    .from('cross_post_analytics')
    .insert(row)

  if (error) {
    process.stdout.write(`Analytics insert failed: ${error.message}\n`)
  }
}

// ============================================================
// Single Platform Handler
// ============================================================

async function processPlatform(
  platform: CrossPostPlatform,
  article: { readonly title: string; readonly content: string; readonly slug: string; readonly tags: string[] },
  dryRun: boolean,
): Promise<CrossPostResult> {
  try {
    // Step 1: Rewrite for platform
    const rewritten = await rewriteForPlatform(platform, article)

    // Step 2: Generate thumbnail (non-blocking failure)
    const thumbnail = await generateCrossPostThumbnail(
      platform,
      rewritten.title,
      [...rewritten.tags],
    )

    if (thumbnail) {
      process.stdout.write(`[${platform}] Thumbnail ready: ${thumbnail.imageUrl}\n`)
    }

    // Step 3: Dry run check
    if (dryRun) {
      process.stdout.write(`[${platform}] === DRY RUN ===\n`)
      process.stdout.write(`[${platform}] Title: ${rewritten.title}\n`)
      process.stdout.write(`[${platform}] Tags: ${rewritten.tags.join(', ')}\n`)
      process.stdout.write(`[${platform}] Body length: ${rewritten.body.length} chars\n`)
      process.stdout.write(`[${platform}] Body preview:\n${rewritten.body.slice(0, 500)}\n...\n`)
      process.stdout.write(`[${platform}] === END DRY RUN ===\n`)

      return {
        platform,
        success: true,
        url: `(dry-run) ${rewritten.title}`,
      }
    }

    // Step 4: Publish
    const publisher = PUBLISHERS[platform]
    return await publisher(rewritten)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(`[${platform}] Pipeline error: ${message}\n`)

    return {
      platform,
      success: false,
      error: message,
    }
  }
}

// ============================================================
// Main Export
// ============================================================

export async function crossPostArticle(
  request: CrossPostRequest,
): Promise<readonly CrossPostResult[]> {
  const { slug, platforms, dryRun = false } = request

  process.stdout.write(`Cross-post pipeline: slug="${slug}", platforms=[${platforms.join(',')}], dryRun=${dryRun}\n`)

  // Fetch original article
  const article = await fetchArticle(slug)
  process.stdout.write(`Article found: "${article.title}" (${article.content.length} chars)\n`)

  const tags = article.category_tags ?? []

  // Get post ID for analytics
  const postId = await getPostId(slug)

  // Process all platforms sequentially to avoid API rate limits
  const results: CrossPostResult[] = []

  for (const platform of platforms) {
    const result = await processPlatform(
      platform,
      { title: article.title, content: article.content, slug: article.slug, tags },
      dryRun,
    )

    results.push(result)

    // Record analytics (fire-and-forget in non-dry-run mode)
    if (!dryRun) {
      await recordAnalytics(postId, result)
    }
  }

  // Summary
  const succeeded = results.filter((r) => r.success)
  const failed = results.filter((r) => !r.success)

  process.stdout.write(`\nCross-post complete: ${succeeded.length} succeeded, ${failed.length} failed\n`)

  for (const r of succeeded) {
    process.stdout.write(`  [OK] ${r.platform}: ${r.url}\n`)
  }
  for (const r of failed) {
    process.stdout.write(`  [FAIL] ${r.platform}: ${r.error}\n`)
  }

  return results
}
