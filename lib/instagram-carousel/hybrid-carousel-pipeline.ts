/**
 * Hybrid Carousel Pipeline (映像入りカルーセル)
 *
 * 構成: [フック画像(Satori)] + [インパクト動画] + [図解(Gemini)] + [CTA(固定)]
 * 火木土の週3回自動投稿用
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import type { HybridCarouselContent, HybridPipelineResult, CarouselItem, ViralVideoSource } from './types'
import { selectViralVideo, proxyVideoToSupabase, cleanupVideoFromStorage } from './video-source-selector'
import { renderHybridHookSlide } from './slide-composer'
import { generateImageFromPrompt, brandGuide } from './carousel-diagram-generator'
import { postMixedCarousel } from './carousel-poster'

// ============================================================
// Supabase
// ============================================================

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

// ============================================================
// Step 2: Generate hook text + caption via Claude
// ============================================================

async function generateHybridContent(
  videoSource: ViralVideoSource,
): Promise<HybridCarouselContent> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set')

  const client = new Anthropic({ apiKey })

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `以下のバズツイートをInstagramカルーセルの映像投稿として再構成してください。

【元ツイート】
@${videoSource.username}: ${videoSource.tweetText}

【トピック】${videoSource.topicHint}
【いいね数】${videoSource.likeCount.toLocaleString()}

以下のJSON形式で出力してください:
{
  "hookLine1": "カテゴリ（必ず8文字ぴったり。例: 衝撃のAI映像！）",
  "hookLine2": "メインキーワード（短いほど良い。例: Figure AI）",
  "hookLine3": "コンテンツ種類（7文字以内。例: 最新デモ、衝撃映像）",
  "diagramPromptContext": "図解スライドで説明すべき内容（なぜこの映像が重要か、技術的な背景、業界への影響を200文字程度で）",
  "caption": "Instagram投稿キャプション（300-500文字、日本語、教育的な解説 + 元ツイートへの言及 + 一次情報）",
  "hashtags": ["#ハッシュタグ1", "#ハッシュタグ2", "#ハッシュタグ3", "#ハッシュタグ4", "#ハッシュタグ5"]
}

ルール:
- hookLine1は必ず8文字ぴったり
- hookLine3は7文字以内
- captionは「この映像がなぜ重要か」を日本語で解説。一般論禁止、具体的に
- diagramPromptContextは図解生成AIへの指示。技術的背景と影響を含める
- JSON以外出力しない`,
    }],
  })

  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') throw new Error('No text in response')

  const match = textBlock.text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No JSON in response')

  const parsed = JSON.parse(match[0])

  return {
    hookLine1: parsed.hookLine1 || '衝撃のAI映像！',
    hookLine2: parsed.hookLine2 || videoSource.topicHint,
    hookLine3: parsed.hookLine3 || '最新デモ',
    videoSource,
    diagramPromptContext: parsed.diagramPromptContext || '',
    caption: parsed.caption || '',
    hashtags: parsed.hashtags || ['#AI', '#テック', '#最新技術', '#ロボット', '#自動化'],
  }
}

// ============================================================
// Step 5: Generate explainer diagram via Gemini
// ============================================================

async function generateExplainerDiagram(
  context: string,
  topicHint: string,
): Promise<Buffer> {
  const prompt = `Instagramカルーセル投稿の解説図解スライドを1枚生成してください。

${brandGuide(3, 4)}

【このスライドの目的】
前のスライドで見たインパクト映像（${topicHint}）がなぜ重要かを図解で説明する。

【図解で伝える内容】
${context}

【デザイン指示】
- タイトル「なぜこれが重要か」をヘッダーに
- 3-4個のキーポイントをカード形式で構造化
- 矢印やアイコンで因果関係を視覚化
- 技術用語は日本語で
- 右下に「🔖 保存して見返そう！」バッジ

教育系Instagramの図解として、保存したくなるクオリティで生成してください。`

  return generateImageFromPrompt(prompt)
}

// ============================================================
// Storage helpers
// ============================================================

async function uploadImageToStorage(buffer: Buffer, label: string): Promise<string> {
  const supabase = getSupabase()
  const ts = Date.now()
  const rand = Math.random().toString(36).slice(2, 8)
  const path = `images/instagram/hybrid-${label}-${ts}-${rand}.png`

  const { error } = await supabase.storage
    .from('blog')
    .upload(path, buffer, { contentType: 'image/png', cacheControl: '31536000', upsert: true })

  if (error) throw new Error(`Upload failed (${label}): ${error.message}`)

  const { data } = supabase.storage.from('blog').getPublicUrl(path)
  return data.publicUrl
}

async function uploadCtaImage(): Promise<string> {
  const fs = await import('fs/promises')
  const path = await import('path')
  const ctaPath = path.join(process.cwd(), 'public', 'images', 'instagram', 'carousel-cta-fixed.png')
  const buffer = await fs.readFile(ctaPath)
  return uploadImageToStorage(buffer, 'cta')
}

async function cleanupImages(urls: string[]): Promise<void> {
  const supabase = getSupabase()
  const paths = urls.map((url) => {
    const match = url.match(/\/blog\/(.+)$/)
    return match?.[1] || ''
  }).filter(Boolean)
  if (paths.length > 0) {
    await supabase.storage.from('blog').remove(paths)
  }
}

// ============================================================
// Analytics
// ============================================================

async function saveAnalytics(
  content: HybridCarouselContent,
  mediaId: string,
): Promise<void> {
  const supabase = getSupabase()
  const { error } = await supabase.from('x_post_analytics').insert({
    post_text: `${content.caption.slice(0, 300)} [original:${content.videoSource.tweetId}] [source:@${content.videoSource.username}]`,
    tweet_id: mediaId,
    tweet_url: `https://www.instagram.com/p/${mediaId}`,
    pattern_used: 'instagram_hybrid_carousel',
    posted_at: new Date().toISOString(),
    likes: 0, retweets: 0, replies: 0, impressions: 0, engagement_rate: 0,
  })
  if (error) process.stdout.write(`Analytics save warning: ${error.message}\n`)
}

// ============================================================
// Main Pipeline
// ============================================================

export async function runHybridCarouselPipeline(
  dryRun = false,
): Promise<HybridPipelineResult> {
  try {
    // Step 1: Select viral video
    process.stdout.write('[1/8] Selecting viral video...\n')
    const videoSource = await selectViralVideo()
    if (!videoSource) {
      return { success: false, error: 'No viral video found from monitored accounts' }
    }
    process.stdout.write(`  Selected: @${videoSource.username} — ${videoSource.tweetText.slice(0, 60)}... (${videoSource.likeCount} likes)\n`)

    // Step 2: Generate hook text + caption
    process.stdout.write('[2/8] Generating hook text + caption...\n')
    const content = await generateHybridContent(videoSource)
    process.stdout.write(`  Hook: ${content.hookLine1} / ${content.hookLine2} / ${content.hookLine3}\n`)

    // Step 3: Render hook slide (Satori)
    process.stdout.write('[3/8] Rendering hook slide...\n')
    const hookBuffer = await renderHybridHookSlide(content.hookLine1, content.hookLine2, content.hookLine3)

    // Step 4: Download video → Supabase
    process.stdout.write('[4/8] Downloading video to Supabase...\n')
    let videoPublicUrl: string
    let videoStoragePath: string
    let videoFallbackToImage = false

    try {
      const proxy = await proxyVideoToSupabase(videoSource.videoUrl)
      videoPublicUrl = proxy.publicUrl
      videoStoragePath = proxy.storagePath
    } catch (e) {
      process.stdout.write(`  Video download failed, falling back to preview image: ${e}\n`)
      if (!videoSource.previewImageUrl) {
        return { success: false, error: 'Video download failed and no preview image available' }
      }
      videoPublicUrl = videoSource.previewImageUrl
      videoStoragePath = ''
      videoFallbackToImage = true
    }

    // Step 5: Generate explainer diagram (Gemini)
    process.stdout.write('[5/8] Generating explainer diagram...\n')
    const diagramBuffer = await generateExplainerDiagram(
      content.diagramPromptContext,
      videoSource.topicHint,
    )

    // Step 6: Upload all items to storage
    process.stdout.write('[6/8] Uploading to storage...\n')
    const hookUrl = await uploadImageToStorage(hookBuffer, 'hook')
    const diagramUrl = await uploadImageToStorage(diagramBuffer, 'diagram')
    const ctaUrl = await uploadCtaImage()
    const imageUrls = [hookUrl, diagramUrl, ctaUrl]

    // Assemble carousel items
    const items: CarouselItem[] = [
      { mediaType: 'IMAGE', publicUrl: hookUrl, slideLabel: 'hook' },
      { mediaType: videoFallbackToImage ? 'IMAGE' : 'VIDEO', publicUrl: videoPublicUrl, slideLabel: 'video' },
      { mediaType: 'IMAGE', publicUrl: diagramUrl, slideLabel: 'diagram' },
      { mediaType: 'IMAGE', publicUrl: ctaUrl, slideLabel: 'cta' },
    ]

    process.stdout.write(`  Assembled ${items.length} items (${items.filter(i => i.mediaType === 'VIDEO').length} video)\n`)

    if (dryRun) {
      process.stdout.write('[DRY RUN] Skipping Instagram post\n')
      items.forEach((item, i) => process.stdout.write(`  Slide ${i + 1}: [${item.mediaType}] ${item.slideLabel} — ${item.publicUrl}\n`))
      return { success: true, carouselItems: items, videoSource }
    }

    // Step 7: Post to Instagram
    process.stdout.write('[7/8] Posting to Instagram...\n')
    const fullCaption = `${content.caption}\n\n${content.hashtags.join(' ')}`
    const result = await postMixedCarousel(items, fullCaption)

    if (!result.success || !result.mediaId) {
      throw new Error(result.error || 'Instagram posting failed')
    }
    process.stdout.write(`  Published: ${result.mediaId}\n`)

    // Step 8: Analytics + cleanup
    process.stdout.write('[8/8] Saving analytics & cleaning up...\n')
    await saveAnalytics(content, result.mediaId)
    if (videoStoragePath) await cleanupVideoFromStorage(videoStoragePath)
    await cleanupImages(imageUrls)

    return { success: true, mediaId: result.mediaId, carouselItems: items, videoSource }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    process.stdout.write(`Hybrid pipeline failed: ${errorMsg}\n`)
    return { success: false, error: errorMsg }
  }
}

// ============================================================
// CLI
// ============================================================

if (require.main === module || process.argv[1]?.includes('hybrid-carousel')) {
  const dryRun = process.argv.includes('--dry-run')

  runHybridCarouselPipeline(dryRun)
    .then((r) => console.log(JSON.stringify(r, null, 2)))
    .catch((e) => { console.error(e); process.exit(1) })
}
