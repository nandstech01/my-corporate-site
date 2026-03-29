/**
 * Instagram Carousel Pipeline
 *
 * 全体オーケストレーション: コンテンツ生成 → 背景画像生成 → スライドレンダリング → アップロード → 投稿
 * 可変枚数対応: [カバー] + [結論] + [コンテンツ×N] + [まとめ] + [CTA]
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import { generateCarouselContent } from './content-generator'
import { renderAllSlides } from './slide-composer'
import { generateMultipleBackgrounds } from './diagram-generator'
import { postInstagramCarousel } from './carousel-poster'

// ============================================================
// Supabase
// ============================================================

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

// ============================================================
// Helpers
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

// ============================================================
// Storage
// ============================================================

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
        cacheControl: '31536000',
        upsert: true,
      })

    if (error) {
      throw new Error(`Storage upload failed for slide ${i}: ${error.message}`)
    }

    const { data: urlData } = supabase.storage.from('blog').getPublicUrl(path)
    urls.push(urlData.publicUrl)
    process.stdout.write(`    ${urlData.publicUrl}\n`)
  }

  return urls
}

async function cleanupStorage(urls: string[]): Promise<void> {
  const supabase = getSupabaseClient()
  const paths = urls.map((url) => {
    const match = url.match(/\/blog\/(.+)$/)
    return match?.[1] || ''
  }).filter(Boolean)

  if (paths.length > 0) {
    await supabase.storage.from('blog').remove(paths)
    process.stdout.write(`Cleaned up ${paths.length} images from storage\n`)
  }
}

// ============================================================
// Analytics
// ============================================================

async function saveAnalytics(
  topic: string,
  caption: string,
  mediaId: string,
): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('x_post_analytics').insert({
    post_text: caption.slice(0, 500),
    tweet_id: mediaId,
    tweet_url: `https://www.instagram.com/p/${mediaId}`,
    pattern_used: 'instagram_carousel',
    posted_at: new Date().toISOString(),
    likes: 0, retweets: 0, replies: 0, impressions: 0, engagement_rate: 0,
  })
  if (error) {
    process.stdout.write(`Analytics save warning: ${error.message}\n`)
  }
}

// ============================================================
// Pipeline
// ============================================================

interface PipelineResult {
  readonly success: boolean
  readonly mediaId?: string
  readonly imageUrls?: readonly string[]
  readonly slideCount?: number
  readonly error?: string
}

export async function runCarouselPipeline(
  topic: string,
  dryRun = false,
): Promise<PipelineResult> {
  const slug = generateSlug(topic)

  try {
    // Step 1: Generate content
    process.stdout.write(`[1/7] Generating content for: ${topic}\n`)
    const content = await generateCarouselContent(topic)
    const totalSlides = 2 + content.contentSlides.length + 1 + 1
    process.stdout.write(`  Hook: ${content.hookLine1} / ${content.hookLine2} / ${content.hookLine3}\n`)
    process.stdout.write(`  Content slides: ${content.contentSlides.length}, Summary: ${content.summary.type}\n`)
    process.stdout.write(`  Total slides: ${totalSlides}\n`)

    // Step 2: Generate background images (parallel)
    process.stdout.write(`[2/7] Generating ${content.contentSlides.length} background images...\n`)
    const bgBuffers = await generateMultipleBackgrounds(content.contentSlides.length)
    const bgCount = bgBuffers.filter(Boolean).length
    process.stdout.write(`  Backgrounds: ${bgCount}/${content.contentSlides.length} generated\n`)

    // Step 3: Render all slides
    process.stdout.write(`[3/7] Rendering ${totalSlides} slides...\n`)
    const slideBuffers = await renderAllSlides(content, bgBuffers)

    // Step 4: Upload to Supabase Storage
    process.stdout.write(`[4/7] Uploading to Supabase Storage...\n`)
    const imageUrls = await uploadSlidesToStorage(slideBuffers, slug)

    if (dryRun) {
      process.stdout.write(`[DRY RUN] Skipping Instagram post and cleanup\n`)
      return { success: true, imageUrls, slideCount: totalSlides }
    }

    // Step 5: Post to Instagram
    process.stdout.write(`[5/7] Posting carousel to Instagram...\n`)
    const fullCaption = `${content.caption}\n\n${content.hashtags.join(' ')}`
    const result = await postInstagramCarousel(imageUrls, fullCaption)

    if (!result.success || !result.mediaId) {
      throw new Error(result.error || 'Instagram posting failed')
    }

    process.stdout.write(`  Published: ${result.mediaId}\n`)

    // Step 6: Save analytics
    process.stdout.write(`[6/7] Saving analytics...\n`)
    await saveAnalytics(topic, fullCaption, result.mediaId)

    // Step 7: Cleanup storage
    process.stdout.write(`[7/7] Cleaning up storage...\n`)
    await cleanupStorage(imageUrls)

    return { success: true, mediaId: result.mediaId, imageUrls, slideCount: totalSlides }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    process.stdout.write(`Pipeline failed: ${errorMsg}\n`)
    return { success: false, error: errorMsg }
  }
}

// ============================================================
// CLI
// ============================================================

if (require.main === module || process.argv[1]?.includes('pipeline')) {
  const topic = process.argv.find((a) => a.startsWith('--topic='))?.split('=').slice(1).join('=') || 'Claude Code 2026年の革新的な使い方'
  const dryRun = process.argv.includes('--dry-run')

  runCarouselPipeline(topic, dryRun)
    .then((r) => console.log(JSON.stringify(r, null, 2)))
    .catch((e) => { console.error(e); process.exit(1) })
}
