/**
 * Instagram Story 画像合成
 *
 * headlineLines（キャッチコピー）+ Gemini図解画像 → 1080x1920 PNG
 *
 * 技術: ImageResponse (next/og) + satori でJSXレイアウト → PNG変換
 * フォント: Noto Sans JP Bold (Google Fonts CDN からランタイムfetch、モジュールキャッシュ)
 */

import { z } from 'zod'
import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

// ============================================================
// 定数
// ============================================================

const STORY_WIDTH = 1080
const STORY_HEIGHT = 1920
const UPPER_HEIGHT = 580 // ~30% ヘッドライン
const MIDDLE_HEIGHT = 1100 // ~57% 図解
const LOWER_HEIGHT = 240 // ~13% URL + CTA

// ============================================================
// フォント読み込み（モジュールレベルキャッシュ）
// ============================================================

// Promise-based singleton でフォントの重複fetchを防止（失敗時はキャッシュクリアしてリトライ可能）
const loadNotoSansJpBold = (() => {
  let cached: Promise<ArrayBuffer> | null = null
  return (): Promise<ArrayBuffer> => {
    if (!cached) {
      cached = fetchNotoSansJpBold().catch((err) => {
        cached = null
        throw err
      })
    }
    return cached
  }
})()

async function fetchNotoSansJpBold(): Promise<ArrayBuffer> {
  // Google Fonts CSS から truetype font URL を取得
  // User-Agent に古いブラウザを指定して truetype (.ttf) 形式を返させる（satori 要件: woff2非対応）
  const cssResponse = await fetch(
    'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&display=swap',
    {
      headers: {
        'User-Agent':
          'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0)',
      },
      signal: AbortSignal.timeout(10000),
    },
  )

  if (!cssResponse.ok) {
    throw new Error(`Failed to fetch font CSS: ${cssResponse.status}`)
  }

  const css = await cssResponse.text()

  // CSS から truetype URL を抽出（satori は ttf/otf のみ対応）
  const urlMatch = css.match(/url\(([^)]+\.(?:ttf|otf))\)/)
  if (!urlMatch?.[1]) {
    throw new Error('Could not extract TrueType font URL from Google Fonts CSS')
  }

  // SSRF防止: フォントURLのホスト名をGoogle Fontsドメインに制限
  const fontUrl = new URL(urlMatch[1])
  const allowedFontHosts = new Set(['fonts.gstatic.com', 'fonts.googleapis.com'])
  if (!allowedFontHosts.has(fontUrl.hostname)) {
    throw new Error(`Unexpected font host: ${fontUrl.hostname}`)
  }

  const fontResponse = await fetch(urlMatch[1], {
    signal: AbortSignal.timeout(30000),
  })

  if (!fontResponse.ok) {
    throw new Error(`Failed to fetch font file: ${fontResponse.status}`)
  }

  return await fontResponse.arrayBuffer()
}

// ============================================================
// Supabase ヘルパー
// ============================================================

const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid blog slug format')

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
// 合成メイン
// ============================================================

export interface ComposeOptions {
  readonly headlineLines: readonly string[]
  readonly diagramBuffer: Buffer
  readonly diagramMimeType: string
  readonly blogSlug: string
  readonly ctaUrl: string
}

export interface ComposeResult {
  readonly imageUrl: string
  readonly source: 'composed' | 'fallback'
}

export async function composeStoryImage(
  options: ComposeOptions,
): Promise<ComposeResult> {
  const validatedSlug = slugSchema.parse(options.blogSlug)
  const validatedOptions = { ...options, blogSlug: validatedSlug }

  try {
    return await composeWithSatori(validatedOptions)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(
      `Story composition failed: ${message}, uploading diagram only\n`,
    )

    // フォールバック: 図解画像のみアップロード
    return await uploadDiagramOnly(validatedOptions)
  }
}

async function composeWithSatori(
  options: ComposeOptions,
): Promise<ComposeResult> {
  const font = await loadNotoSansJpBold()

  // 図解画像を base64 data URI に変換
  const diagramBase64 = options.diagramBuffer.toString('base64')
  const diagramDataUri = `data:${options.diagramMimeType};base64,${diagramBase64}`

  const element = buildLayoutElement(options.headlineLines, diagramDataUri, options.ctaUrl)

  const imageResponse = new ImageResponse(element, {
    width: STORY_WIDTH,
    height: STORY_HEIGHT,
    fonts: [
      {
        name: 'NotoSansJP',
        data: font,
        weight: 700,
        style: 'normal',
      },
    ],
  })

  const arrayBuffer = await imageResponse.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Supabase Storage にアップロード
  const imageUrl = await uploadToStorage(buffer, options.blogSlug)

  return { imageUrl, source: 'composed' }
}

function buildLayoutElement(
  headlineLines: readonly string[],
  diagramDataUri: string,
  ctaUrl: string,
) {
  // headlineLines が空の場合のフォールバック
  const lines =
    headlineLines.length > 0 ? headlineLines : ['Check it out']

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: STORY_WIDTH,
        height: STORY_HEIGHT,
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
        fontFamily: 'NotoSansJP',
      },
      children: [
        // 上部: ヘッドラインテキスト
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: UPPER_HEIGHT,
              padding: '40px 50px 20px 50px',
            },
            children: [
              ...lines.map((line: string) => ({
                type: 'div',
                props: {
                  style: {
                    color: '#ffffff',
                    fontSize: 48,
                    fontWeight: 700,
                    textAlign: 'center' as const,
                    lineHeight: 1.4,
                    letterSpacing: '0.02em',
                    textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                  },
                  children: line,
                },
              })),
              // ゴールドアクセント線
              {
                type: 'div',
                props: {
                  style: {
                    width: 200,
                    height: 3,
                    background: 'linear-gradient(90deg, transparent, #e2b857, transparent)',
                    marginTop: 24,
                  },
                },
              },
            ],
          },
        },
        // 中央: 図解画像エリア
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: MIDDLE_HEIGHT,
              padding: '10px 40px 10px 40px',
            },
            children: [
              {
                type: 'img',
                props: {
                  src: diagramDataUri,
                  style: {
                    maxWidth: 1000,
                    maxHeight: 1060,
                    objectFit: 'contain',
                    borderRadius: 16,
                  },
                },
              },
            ],
          },
        },
        // 下部: ブログURL + CTAエリア
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: LOWER_HEIGHT,
              padding: '10px 50px 40px 50px',
            },
            children: [
              // 「詳しくはこちら」テキスト
              {
                type: 'div',
                props: {
                  style: {
                    color: '#e2b857',
                    fontSize: 28,
                    fontWeight: 700,
                    textAlign: 'center' as const,
                    marginBottom: 12,
                  },
                  children: '\u25B6 詳しくはプロフィールのリンクから',
                },
              },
              // URL表示
              {
                type: 'div',
                props: {
                  style: {
                    color: '#8899aa',
                    fontSize: 22,
                    textAlign: 'center' as const,
                    letterSpacing: '0.01em',
                  },
                  children: ctaUrl.replace('https://', '').split('?')[0],
                },
              },
            ],
          },
        },
      ],
    },
  }
}

async function uploadToStorage(
  buffer: Buffer,
  blogSlug: string,
): Promise<string> {
  const supabase = getSupabaseClient()
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)
  const fileName = `ig-story-composed-${blogSlug}-${timestamp}-${randomStr}.png`
  const filePath = `images/instagram/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('blog')
    .upload(filePath, buffer, {
      contentType: 'image/png',
      cacheControl: '31536000',
      upsert: false,
    })

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`)
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('blog').getPublicUrl(filePath)

  return publicUrl
}

async function uploadDiagramOnly(
  options: ComposeOptions,
): Promise<ComposeResult> {
  const imageUrl = await uploadToStorage(options.diagramBuffer, options.blogSlug)
  return { imageUrl, source: 'fallback' }
}
