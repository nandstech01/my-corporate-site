/**
 * Instagram Story 画像生成
 *
 * 戦略:
 * 1. 主: Gemini (gemini-3-pro-image-preview) — 既存のブログ図解生成と同じAPI
 * 2. フォールバック: ブログOG画像
 *
 * プラガブル設計: ImageGenerator インターフェースで将来的にプロバイダー交換可能
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'

// ============================================================
// インターフェース
// ============================================================

export interface ImageGeneratorResult {
  readonly imageUrl: string
  readonly source: 'gemini' | 'og_image' | 'placeholder'
}

export interface ImageGenerator {
  generate(prompt: string, blogSlug: string): Promise<ImageGeneratorResult>
}

// ============================================================
// Supabase Client
// ============================================================

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

// ============================================================
// Gemini Image Generator (gemini-3-pro-image-preview)
// ============================================================

class GeminiImageGenerator implements ImageGenerator {
  private readonly apiKey: string

  constructor() {
    this.apiKey = process.env.GOOGLE_AI_API_KEY ?? ''
  }

  isConfigured(): boolean {
    return !!this.apiKey
  }

  async generate(
    prompt: string,
    blogSlug: string,
  ): Promise<ImageGeneratorResult> {
    if (!this.isConfigured()) {
      throw new Error('GOOGLE_AI_API_KEY not configured')
    }

    const genAI = new GoogleGenerativeAI(this.apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-pro-image-preview',
    })

    const storyPrompt = [
      'Instagram Story用の画像を1枚生成してください。',
      '',
      `テーマ: ${prompt}`,
      '',
      'デザイン要件:',
      '- 縦長 9:16 のInstagram Story フォーマット',
      '- モダンなテック系デザイン',
      '- メインカラー: ネイビー (#1a1a2e) とゴールド (#e2b857)',
      '- 背景はグラデーション、テキストは最小限',
      '- プロフェッショナルで洗練された印象',
      '- 日本語テキストは含めない（キャプションで補足するため）',
      '- アイコンや図形でコンセプトを視覚的に表現',
    ].join('\n')

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: storyPrompt }],
        },
      ],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        temperature: 0.8,
        candidateCount: 1,
        maxOutputTokens: 8192,
      } as never,
    })

    const response = result.response
    let imageData: string | null = null
    let mimeType = 'image/png'

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        const partAny = part as { inlineData?: { mimeType: string; data: string } }
        if (partAny.inlineData?.mimeType?.startsWith('image/')) {
          imageData = partAny.inlineData.data
          mimeType = partAny.inlineData.mimeType
          break
        }
      }
    }

    if (!imageData) {
      throw new Error('Gemini did not return an image')
    }

    // Supabase Storageにアップロード
    const supabase = getSupabaseClient()
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const ext = mimeType.includes('png') ? 'png' : 'jpg'
    const fileName = `ig-story-${blogSlug}-${timestamp}-${randomStr}.${ext}`
    const filePath = `images/instagram/${fileName}`

    const imageBuffer = Buffer.from(imageData, 'base64')

    const { error: uploadError } = await supabase.storage
      .from('blog')
      .upload(filePath, imageBuffer, {
        contentType: mimeType,
        cacheControl: '31536000',
        upsert: false,
      })

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('blog').getPublicUrl(filePath)

    return { imageUrl: publicUrl, source: 'gemini' }
  }
}

// ============================================================
// OG画像フォールバック
// ============================================================

class OgImageFallback implements ImageGenerator {
  async generate(
    _prompt: string,
    blogSlug: string,
  ): Promise<ImageGeneratorResult> {
    const ogUrl = `https://nands.tech/blog/${blogSlug}/opengraph-image`
    return { imageUrl: ogUrl, source: 'og_image' }
  }
}

// ============================================================
// ファクトリー
// ============================================================

export function createImageGenerator(): ImageGenerator {
  const geminiGenerator = new GeminiImageGenerator()
  if (geminiGenerator.isConfigured()) {
    return geminiGenerator
  }

  process.stdout.write(
    'Image generation: Gemini not configured, using OG image fallback\n',
  )
  return new OgImageFallback()
}

// ============================================================
// 便利関数
// ============================================================

export async function generateStoryImage(
  prompt: string,
  blogSlug: string,
): Promise<ImageGeneratorResult> {
  const generator = createImageGenerator()

  try {
    return await generator.generate(prompt, blogSlug)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(
      `Image generation failed: ${message}, using OG fallback\n`,
    )

    const ogUrl = `https://nands.tech/blog/${blogSlug}/opengraph-image`
    return { imageUrl: ogUrl, source: 'og_image' }
  }
}
