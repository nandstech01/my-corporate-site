/**
 * Cross-Post Thumbnail Generator
 *
 * Generates platform-specific thumbnails for cross-posted articles using Gemini.
 * Each platform (Zenn, Qiita, note) gets a tailored design.
 *
 * Pattern: Same Gemini image generation flow as x-article/thumbnail-generator.ts
 * Storage: Supabase 'blog' bucket under images/cross-post/{platform}/
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'
import type { CrossPostPlatform, CrossPostThumbnail, ThumbnailSpec } from './types'
import { THUMBNAIL_SPECS } from './types'

// ============================================================
// Color Styles
// ============================================================

interface ThumbnailColorStyle {
  readonly name: string
  readonly gradient: string
  readonly textColor: string
  readonly accent: string
}

const COLOR_STYLES: Readonly<Record<string, ThumbnailColorStyle>> = {
  'navy-gold': {
    name: 'navy-gold',
    gradient: '#1a1a2e to #16213e',
    textColor: '#FFFFFF',
    accent: '#e2b857',
  },
  'dark-cyan': {
    name: 'dark-cyan',
    gradient: '#0f0c29 to #302b63',
    textColor: '#FFFFFF',
    accent: '#26C6DA',
  },
  'midnight-coral': {
    name: 'midnight-coral',
    gradient: '#1a1a2e to #0f3460',
    textColor: '#FFFFFF',
    accent: '#FF6B6B',
  },
  'deep-purple': {
    name: 'deep-purple',
    gradient: '#1a0533 to #2d1b69',
    textColor: '#FFFFFF',
    accent: '#B388FF',
  },
  'dark-emerald': {
    name: 'dark-emerald',
    gradient: '#0d1b2a to #1b2838',
    textColor: '#FFFFFF',
    accent: '#69F0AE',
  },
}

function resolveColorStyle(): ThumbnailColorStyle {
  const keys = Object.keys(COLOR_STYLES)
  const randomKey = keys[Math.floor(Math.random() * keys.length)]
  return COLOR_STYLES[randomKey]
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
// Gemini Image Extraction
// ============================================================

function extractImageData(
  response: {
    candidates?: ReadonlyArray<{
      content?: { parts?: ReadonlyArray<unknown> }
    }>
  },
): { readonly data: string; readonly mimeType: string } | null {
  const parts = response.candidates?.[0]?.content?.parts ?? []
  for (const part of parts) {
    const p = part as { inlineData?: { mimeType: string; data: string } }
    if (p.inlineData?.mimeType?.startsWith('image/')) {
      return { data: p.inlineData.data, mimeType: p.inlineData.mimeType }
    }
  }
  return null
}

// ============================================================
// Platform-Specific Prompts
// ============================================================

function buildPrompt(
  platform: CrossPostPlatform,
  title: string,
  tags: readonly string[],
  style: ThumbnailColorStyle,
  spec: ThumbnailSpec,
): string {
  const tagsLine = tags.length > 0
    ? `\n【タグ】${tags.slice(0, 5).join(', ')}`
    : ''

  const platformInstructions = buildPlatformInstructions(platform, style, spec)

  return `サムネイル画像を1枚生成してください。

【タイトル】
${title}
${tagsLine}

${platformInstructions}

【禁止事項】
- 英語テキストを入れない（日本語のみ）
- 白や明るい背景にしない
- 複雑すぎる装飾を入れない

プロフェッショナルなテックブログのサムネイルとして使える、
タイトルが一目で読める美しい画像を生成してください。`
}

function buildPlatformInstructions(
  platform: CrossPostPlatform,
  style: ThumbnailColorStyle,
  spec: ThumbnailSpec,
): string {
  switch (platform) {
    case 'zenn':
      return `【デザイン指示 - Zenn向けカード画像】
- 画像サイズ: ${spec.width}x${spec.height}px（正方形に近いカード）
- 絵文字をメインビジュアルとして大きく中央上部に配置
- タイトルを絵文字の下に太字で表示
- テックブログらしいクリーンなカードデザイン
- 背景: ダークグラデーション（${style.gradient}）
- テキスト色: ${style.textColor}
- アクセントカラー: ${style.accent}（装飾ラインやボーダーに使用）
- フォント: ゴシック体風、太字、視認性最優先`

    case 'qiita':
      return `【デザイン指示 - Qiita向けOGP画像】
- 画像サイズ: ${spec.width}x${spec.height}px（横長OGP比率）
- ダーク背景にコード風の装飾要素（モノスペースフォント風テキスト、波括弧など）
- タイトルを中央に大きく太字で配置
- 技術記事らしい洗練されたデザイン
- 背景: ダークグラデーション（${style.gradient}）
- テキスト色: ${style.textColor}
- アクセントカラー: ${style.accent}（コード要素やハイライトに使用）
- フォント: ゴシック体風、太字、視認性最優先
- コードエディタ風の雰囲気を出す`

    case 'note':
      return `【デザイン指示 - note向けバナー画像】
- 画像サイズ: ${spec.width}x${spec.height}px（横長バナー）
- カジュアルで読みやすいデザイン
- やや暖かみのあるカラーパレット（ベースは暗め）
- タイトルを大きく読みやすく中央配置
- 親しみやすく、クリックしたくなるデザイン
- 背景: ダークグラデーション（${style.gradient}）、やや暖色寄りに調整
- テキスト色: ${style.textColor}
- アクセントカラー: ${style.accent}（装飾に柔らかく使用）
- フォント: 丸ゴシック風、太字、親しみやすさ重視`
  }
}

// ============================================================
// Upload to Supabase Storage
// ============================================================

async function uploadToStorage(
  platform: CrossPostPlatform,
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  const supabase = getSupabaseClient()
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const ext = mimeType.includes('png') ? 'png' : 'jpg'
  const filePath = `images/cross-post/${platform}/thumb-${timestamp}-${random}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('blog')
    .upload(filePath, buffer, {
      contentType: mimeType,
      cacheControl: '31536000',
      upsert: false,
    })

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`)
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('blog').getPublicUrl(filePath)

  return publicUrl
}

// ============================================================
// Main Export
// ============================================================

export async function generateCrossPostThumbnail(
  platform: CrossPostPlatform,
  title: string,
  tags: readonly string[],
): Promise<CrossPostThumbnail | null> {
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      process.stdout.write('Cross-post thumbnail generation skipped: GOOGLE_AI_API_KEY not set\n')
      return null
    }

    const style = resolveColorStyle()
    const spec = THUMBNAIL_SPECS[platform]
    const prompt = buildPrompt(platform, title, tags, style, spec)

    process.stdout.write(
      `Generating ${platform} thumbnail (style: ${style.name}, ${spec.width}x${spec.height})\n`,
    )

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-image-preview',
    })

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        temperature: 0.7,
        candidateCount: 1,
        maxOutputTokens: 8192,
      } as any,
    })

    const imageData = extractImageData(result.response)
    if (!imageData) {
      process.stdout.write(`Gemini did not return an image for ${platform} thumbnail\n`)
      return null
    }

    const imageBuffer = Buffer.from(imageData.data, 'base64')
    const imageUrl = await uploadToStorage(platform, imageBuffer, imageData.mimeType)

    process.stdout.write(`${platform} thumbnail uploaded: ${imageUrl}\n`)

    return { platform, imageUrl, imageBuffer }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(`${platform} thumbnail generation failed: ${message}\n`)
    return null
  }
}
