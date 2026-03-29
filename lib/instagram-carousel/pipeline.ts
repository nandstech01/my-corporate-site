/**
 * Instagram Carousel パイプライン
 *
 * オーケストレーション:
 * 1. コンテンツ生成 (Anthropic)
 * 2. 図解生成 (Gemini)
 * 3. 8枚スライドレンダリング
 * 4. Supabase Storageアップロード
 * 5. Instagram Graph API投稿
 * 6. アナリティクス保存
 * 7. ストレージクリーンアップ
 *
 * CLI: npx tsx lib/instagram-carousel/pipeline.ts --topic="トピック" [--dry-run]
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import { generateCarouselContent } from './content-generator'
import { renderAllSlides } from './slide-composer'
import { generateDiagram } from './diagram-generator'
import { postInstagramCarousel } from './carousel-poster'
import type { CarouselContent } from './types'

// ============================================================
// 型定義
// ============================================================

interface PipelineResult {
  readonly success: boolean
  readonly mediaId?: string
  readonly imageUrls?: string[]
  readonly error?: string
}

// ============================================================
// Supabase Client
// ============================================================

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required',
    )
  }
  return createClient(url, key)
}

// ============================================================
// ストレージアップロード
// ============================================================

function generateSlug(topic: string): string {
  const slug = topic
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 30)
  return slug || 'carousel'
}

async function uploadSlidesToStorage(
  slides: readonly Buffer[],
  slug: string,
): Promise<string[]> {
  const supabase = getSupabaseClient()
  const timestamp = Date.now()
  const urls: string[] = []

  for (let i = 0; i < slides.length; i++) {
    const path = `images/instagram/carousel-${slug}-${timestamp}-${i}.png`

    const { error } = await supabase.storage
      .from('blog')
      .upload(path, slides[i], {
        contentType: 'image/png',
        upsert: false,
      })

    if (error) {
      throw new Error(`Storage upload failed for slide ${i}: ${error.message}`)
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('blog').getPublicUrl(path)

    urls.push(publicUrl)
    process.stdout.write(`  Uploaded slide ${i + 1}/${slides.length}\n`)
  }

  return urls
}

// ============================================================
// ストレージクリーンアップ
// ============================================================

async function cleanupStorage(imageUrls: string[]): Promise<void> {
  const supabase = getSupabaseClient()

  const paths = imageUrls
    .map((url) => {
      const match = url.match(/\/blog\/(.+)$/)
      return match ? match[1] : null
    })
    .filter((p): p is string => p !== null)

  if (paths.length === 0) return

  const { error } = await supabase.storage.from('blog').remove(paths)

  if (error) {
    process.stdout.write(
      `Storage cleanup warning: ${error.message}\n`,
    )
  } else {
    process.stdout.write(`Cleaned up ${paths.length} images from storage\n`)
  }
}

// ============================================================
// アナリティクス保存
// ============================================================

async function saveAnalytics(
  content: CarouselContent,
  mediaId: string,
  topic: string,
): Promise<void> {
  const supabase = getSupabaseClient()

  const { error } = await supabase.from('x_post_analytics').insert({
    post_text: content.caption,
    pattern_used: 'instagram_carousel',
    platform: 'instagram',
    post_id: mediaId,
    post_url: `https://www.instagram.com/p/${mediaId}`,
    posted_at: new Date().toISOString(),
    metadata: {
      topic,
      hook: `${content.hookLine1} ${content.hookLine2} ${content.hookLine3}`,
      hashtags: content.hashtags,
      slide_count: 8,
    },
  })

  if (error) {
    process.stdout.write(
      `Analytics save warning: ${error.message}\n`,
    )
  } else {
    process.stdout.write('Analytics saved to x_post_analytics\n')
  }
}

// ============================================================
// メインパイプライン
// ============================================================

export async function runCarouselPipeline(
  topic: string,
  dryRun = false,
): Promise<PipelineResult> {
  const slug = generateSlug(topic)

  try {
    // Step 1: Generate content
    process.stdout.write(`[1/7] Generating content for: ${topic}\n`)
    const content = await generateCarouselContent(topic)
    process.stdout.write(`  Hook: ${content.hookLine1} / ${content.hookLine2} / ${content.hookLine3}\n`)

    // Step 2: Generate diagram for solution slide
    process.stdout.write('[2/7] Generating diagram...\n')
    const diagramBuffer = await generateDiagram(topic, [...content.solutionPoints])
    process.stdout.write(
      diagramBuffer
        ? `  Diagram: ${diagramBuffer.length} bytes\n`
        : '  Diagram: skipped (null)\n',
    )

    // Step 3: Render 8 slides
    process.stdout.write('[3/7] Rendering 8 slides...\n')
    const slides = await renderAllSlides(content, diagramBuffer)
    process.stdout.write(`  Rendered ${slides.length} slides\n`)

    // Step 4: Upload to Supabase Storage
    process.stdout.write('[4/7] Uploading to Supabase Storage...\n')
    const imageUrls = await uploadSlidesToStorage(
      slides.map((s) => s.buffer),
      slug,
    )

    if (dryRun) {
      process.stdout.write('[DRY RUN] Skipping Instagram post and cleanup\n')
      process.stdout.write(`  Image URLs:\n`)
      for (const url of imageUrls) {
        process.stdout.write(`    ${url}\n`)
      }
      return { success: true, imageUrls }
    }

    // Step 5: Post carousel to Instagram
    process.stdout.write('[5/7] Posting carousel to Instagram...\n')
    const fullCaption =
      content.caption + '\n\n' + content.hashtags.join(' ')
    const postResult = await postInstagramCarousel(imageUrls, fullCaption)

    if (!postResult.success) {
      throw new Error(`Instagram post failed: ${postResult.error}`)
    }

    // Step 6: Save analytics
    process.stdout.write('[6/7] Saving analytics...\n')
    await saveAnalytics(content, postResult.mediaId!, topic)

    // Step 7: Cleanup storage
    process.stdout.write('[7/7] Cleaning up storage...\n')
    await cleanupStorage(imageUrls)

    return {
      success: true,
      mediaId: postResult.mediaId,
      imageUrls,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(`Pipeline failed: ${message}\n`)
    return { success: false, error: message }
  }
}

// ============================================================
// CLI エントリポイント
// ============================================================

if (require.main === module || process.argv[1]?.includes('pipeline')) {
  const topic =
    process.argv
      .find((a) => a.startsWith('--topic='))
      ?.split('=')
      .slice(1)
      .join('=') || 'Claude Code 2026年最新機能'
  const dryRun = process.argv.includes('--dry-run')

  runCarouselPipeline(topic, dryRun)
    .then((r) => console.log(JSON.stringify(r, null, 2)))
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
}
