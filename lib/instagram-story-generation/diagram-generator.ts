/**
 * Instagram Story 図解画像生成
 *
 * H2図解自動生成の実績あるプロンプト構造をベースに、
 * Instagram Story のダーク背景に最適化した図解を生成
 *
 * 戦略:
 * 1. 主: Gemini (gemini-3-pro-image-preview) — 日本語構造化プロンプト
 * 2. フォールバック1: Supabase DB の thumbnail_url
 * 3. フォールバック2: OG画像を直接fetch
 */

import { z } from 'zod'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'

// ============================================================
// 型定義
// ============================================================

export interface DiagramResult {
  readonly buffer: Buffer
  readonly mimeType: string
  readonly source: 'gemini' | 'og_image'
}

export interface DiagramGenerationInput {
  readonly imagePrompt: string
  readonly blogTitle: string
  readonly keyPoints: readonly string[]
  readonly blogSlug: string
}

// ============================================================
// バリデーション
// ============================================================

const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid blog slug format')

function validateSlug(slug: string): string {
  return slugSchema.parse(slug)
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
// ダーク背景用スタイル設定（H2図解実績ベース）
// ============================================================

interface StoryDiagramStyle {
  readonly name: string
  readonly primary: string
  readonly secondary: string
  readonly accent: string
  readonly layout: string
}

/**
 * ダーク背景に映える10スタイル
 * H2図解生成器の実績あるスタイルローテーションをベースに、
 * ダークネイビー背景 (#1a1a2e → #0f3460) 上での視認性を最適化
 */
const STORY_DIAGRAM_STYLES: readonly StoryDiagramStyle[] = [
  {
    name: 'gold-navy',
    primary: '#e2b857',
    secondary: '#f0d78c',
    accent: '#26C6DA',
    layout: 'フローチャート風',
  },
  {
    name: 'cyan-glow',
    primary: '#26C6DA',
    secondary: '#4DD0E1',
    accent: '#FFB300',
    layout: 'カード型レイアウト',
  },
  {
    name: 'white-clean',
    primary: '#FFFFFF',
    secondary: '#B0BEC5',
    accent: '#e2b857',
    layout: 'アイコン重視型',
  },
  {
    name: 'coral-warm',
    primary: '#FF8A65',
    secondary: '#FFAB91',
    accent: '#80DEEA',
    layout: 'ステップ図解',
  },
  {
    name: 'green-neon',
    primary: '#69F0AE',
    secondary: '#B9F6CA',
    accent: '#FF80AB',
    layout: 'マインドマップ風',
  },
  {
    name: 'purple-electric',
    primary: '#B388FF',
    secondary: '#D1C4E9',
    accent: '#FFD54F',
    layout: 'タイムライン型',
  },
  {
    name: 'blue-bright',
    primary: '#42A5F5',
    secondary: '#90CAF9',
    accent: '#FFE082',
    layout: 'データビジュアル型',
  },
  {
    name: 'pink-vivid',
    primary: '#FF80AB',
    secondary: '#F48FB1',
    accent: '#80CBC4',
    layout: 'グリッドレイアウト',
  },
  {
    name: 'amber-rich',
    primary: '#FFD54F',
    secondary: '#FFE082',
    accent: '#80DEEA',
    layout: 'クラシック図解',
  },
  {
    name: 'teal-modern',
    primary: '#4DB6AC',
    secondary: '#80CBC4',
    accent: '#FF8A65',
    layout: 'モダンインフォグラフィック',
  },
]

function selectDiagramStyle(): StoryDiagramStyle {
  const index = Math.floor(Math.random() * STORY_DIAGRAM_STYLES.length)
  return STORY_DIAGRAM_STYLES[index]
}

// ============================================================
// Gemini レスポンスから画像データ抽出
// ============================================================

interface ExtractedImageData {
  readonly data: string
  readonly mimeType: string
}

function extractGeminiImageData(
  response: { candidates?: ReadonlyArray<{ content?: { parts?: ReadonlyArray<unknown> } }> },
): ExtractedImageData | null {
  const parts = response.candidates?.[0]?.content?.parts ?? []
  for (const part of parts) {
    const partAny = part as {
      inlineData?: { mimeType: string; data: string }
    }
    if (partAny.inlineData?.mimeType?.startsWith('image/')) {
      return {
        data: partAny.inlineData.data,
        mimeType: partAny.inlineData.mimeType,
      }
    }
  }
  return null
}

// ============================================================
// プロンプト構築（H2図解生成の実績あるパターンを活用）
// ============================================================

function buildStoryDiagramPrompt(
  input: DiagramGenerationInput,
  style: StoryDiagramStyle,
): string {
  const keyPointsText =
    input.keyPoints.length > 0
      ? input.keyPoints
          .slice(0, 5)
          .map((p, i) => `${i + 1}. ${p.substring(0, 40)}`)
          .join('\n')
      : '（ブログ記事の主要ポイントを図解化）'

  return `Instagram Story用の図解画像を生成してください。

【タイトル】
${input.blogTitle}

【要点（これを図解化）】
${keyPointsText}

【追加コンテキスト】
${input.imagePrompt}

【デザイン指示 - 最重要】
■ シンプルさ優先
- 要素は3〜5個のみに絞る
- アイコン・矢印・図形を中心に構成
- 余白を十分に取る
- 細かい説明テキストは入れない

■ レイアウト: ${style.layout}
- カラースキーム: ${style.primary}（メイン）、${style.secondary}（サブ）、${style.accent}（アクセント）
- 背景: ダークネイビー（#1a1a2e → #0f3460 のグラデーション）
- テキストや図形は明るい色で高コントラスト

■ 禁止事項
- 日本語テキストは含めない（テキストは別レイヤーで合成するため）
- 英語テキストも最小限（ラベル程度のみ可）
- 細かすぎる情報を入れない
- 長い文章を入れない
- 白や明るい背景にしない

【技術仕様】
- アスペクト比: 縦長（1080x1920の下半分に配置、約1000x960px領域に収まるサイズ）
- 高品質・高解像度
- ダーク背景に映える鮮やかな配色

一目で理解できる、シンプルで美しいダーク背景の図解を生成してください。`
}

// ============================================================
// 図解生成ストラテジー
// ============================================================

async function generateGeminiDiagram(
  input: DiagramGenerationInput,
): Promise<DiagramResult> {
  const apiKey = process.env.GOOGLE_AI_API_KEY
  if (!apiKey) {
    throw new Error('GOOGLE_AI_API_KEY not configured')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: 'gemini-3-pro-image-preview',
  })

  const style = selectDiagramStyle()
  const diagramPrompt = buildStoryDiagramPrompt(input, style)

  process.stdout.write(`Diagram style: ${style.name} (${style.layout})\n`)

  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [{ text: diagramPrompt }],
      },
    ],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
      temperature: 0.7,
      candidateCount: 1,
      maxOutputTokens: 8192,
    } as Parameters<typeof model.generateContent>[0]['generationConfig'] & {
      responseModalities: string[]
    },
  })

  const imageData = extractGeminiImageData(result.response)
  if (!imageData) {
    throw new Error('Gemini did not return a diagram image')
  }

  return {
    buffer: Buffer.from(imageData.data, 'base64'),
    mimeType: imageData.mimeType,
    source: 'gemini',
  }
}

async function fetchOgImageBuffer(blogSlug: string): Promise<DiagramResult> {
  const supabase = getSupabaseClient()

  const { data: post } = await supabase
    .from('posts')
    .select('thumbnail_url')
    .eq('slug', blogSlug)
    .single()

  const imageUrl =
    post?.thumbnail_url && !post.thumbnail_url.includes('/opengraph-image')
      ? post.thumbnail_url
      : `https://nands.tech/blog/${blogSlug}/opengraph-image`

  const response = await fetch(imageUrl, {
    signal: AbortSignal.timeout(15000),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch OG image: ${response.status}`)
  }

  const contentType = response.headers.get('content-type') ?? 'image/png'
  const arrayBuffer = await response.arrayBuffer()

  return {
    buffer: Buffer.from(arrayBuffer),
    mimeType: contentType,
    source: 'og_image',
  }
}

async function fetchRawOgImage(blogSlug: string): Promise<DiagramResult> {
  const response = await fetch(
    `https://nands.tech/blog/${blogSlug}/opengraph-image`,
    { signal: AbortSignal.timeout(15000) },
  )

  if (!response.ok) {
    throw new Error(`Final OG fallback failed: ${response.status}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  return {
    buffer: Buffer.from(arrayBuffer),
    mimeType: response.headers.get('content-type') ?? 'image/png',
    source: 'og_image',
  }
}

// ============================================================
// エクスポート
// ============================================================

export async function generateDiagramImage(
  input: DiagramGenerationInput,
): Promise<DiagramResult> {
  const validatedSlug = validateSlug(input.blogSlug)
  const validatedInput = { ...input, blogSlug: validatedSlug }

  const strategies: readonly (() => Promise<DiagramResult>)[] = [
    () => generateGeminiDiagram(validatedInput),
    () => fetchOgImageBuffer(validatedSlug),
    () => fetchRawOgImage(validatedSlug),
  ]

  for (const strategy of strategies) {
    try {
      return await strategy()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      process.stdout.write(`Diagram strategy failed: ${message}\n`)
    }
  }

  throw new Error('All diagram generation strategies failed')
}
