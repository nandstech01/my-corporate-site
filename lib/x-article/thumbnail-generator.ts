/**
 * X Article Thumbnail Generator
 *
 * Generates eye-catching 1200x630 thumbnail images for X long-form articles.
 * Uses Gemini image generation with dark background + bold Japanese typography.
 *
 * Pattern: Same Gemini image generation flow as diagram-generator.ts
 * Storage: Supabase 'blog' bucket under images/x-article/
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'

// ============================================================
// Types
// ============================================================

export interface ArticleThumbnailInput {
  readonly title: string
  readonly keyPoints?: readonly string[]
  readonly colorStyle?: string
}

export interface ArticleThumbnailOutput {
  readonly imageUrl: string
  readonly imageBuffer: Buffer
}

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

function resolveColorStyle(styleName?: string): ThumbnailColorStyle {
  if (styleName && styleName in COLOR_STYLES) {
    return COLOR_STYLES[styleName]
  }
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
// Prompt
// ============================================================

function buildPrompt(
  input: ArticleThumbnailInput,
  style: ThumbnailColorStyle,
): string {
  const keyPointsSection =
    input.keyPoints && input.keyPoints.length > 0
      ? `\n【サブテキスト（小さく表示）】\n${input.keyPoints
          .slice(0, 3)
          .map((p) => `- ${p.substring(0, 30)}`)
          .join('\n')}`
      : ''

  return `サムネイル画像を1枚生成してください。

【メインタイトル（大きく太字で中央配置）】
${input.title}
${keyPointsSection}

【デザイン指示 - 厳守】
- 画像サイズ: 1200x630px（横長OGP比率）
- 背景: ダークグラデーション（${style.gradient}）
- メインタイトル: ${style.textColor}の太字、画像の中央に大きく配置
- アクセントカラー: ${style.accent}（下線やラインなど最小限の装飾に使用）
- フォント: ゴシック体風、太字、視認性最優先
- デザイン: クリーン＆ミニマル、テキスト主体
- 余白を十分に取り、読みやすさを最優先

【禁止事項】
- 写真やイラストを入れない（テキスト＋グラデーション＋ラインのみ）
- 英語テキストを入れない（日本語のみ）
- 複雑な装飾やアイコンを入れない
- 白や明るい背景にしない

プロフェッショナルなテックブログのOGP画像として使える、
タイトルが一目で読める美しいサムネイルを生成してください。`
}

// ============================================================
// Upload to Supabase Storage
// ============================================================

async function uploadToStorage(
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  const supabase = getSupabaseClient()
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const ext = mimeType.includes('png') ? 'png' : 'jpg'
  const filePath = `images/x-article/thumb-${timestamp}-${random}.${ext}`

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

export async function generateArticleThumbnail(
  input: ArticleThumbnailInput,
): Promise<ArticleThumbnailOutput | null> {
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      process.stdout.write('Thumbnail generation skipped: GOOGLE_AI_API_KEY not set\n')
      return null
    }

    const style = resolveColorStyle(input.colorStyle)
    const prompt = buildPrompt(input, style)

    process.stdout.write(`Generating X article thumbnail (style: ${style.name})\n`)

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-pro-image-preview',
    })

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        temperature: 0.7,
        candidateCount: 1,
        maxOutputTokens: 8192,
        // responseModalities not in stable types yet
      } as any,
    })

    const imageData = extractImageData(result.response)
    if (!imageData) {
      process.stdout.write('Gemini did not return an image for thumbnail\n')
      return null
    }

    const imageBuffer = Buffer.from(imageData.data, 'base64')
    const imageUrl = await uploadToStorage(imageBuffer, imageData.mimeType)

    process.stdout.write(`Thumbnail uploaded: ${imageUrl}\n`)

    return { imageUrl, imageBuffer }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(`Thumbnail generation failed: ${message}\n`)
    return null
  }
}
