/**
 * Instagram Carousel Slide Composer
 *
 * Renders Instagram carousel slides (1080x1350 4:5 portrait).
 * Satori renders: Cover (1枚目) + Bridge (2枚目) + CTA (最終枚)
 * Gemini generates: Content slides (3〜N枚目) + Summary (まとめ)
 */

import { ImageResponse } from 'next/og'
import type { CarouselContent } from './types'
import { BRAND, CAROUSEL_WIDTH, CAROUSEL_HEIGHT } from './types'

// ============================================================
// Font Loading (local file with remote fallback)
// ============================================================

const loadFont = (() => {
  let cached: Promise<ArrayBuffer> | null = null
  return (): Promise<ArrayBuffer> => {
    if (!cached) {
      cached = fetchFont().catch((err) => { cached = null; throw err })
    }
    return cached
  }
})()

async function fetchFont(): Promise<ArrayBuffer> {
  const fs = await import('fs/promises')
  const path = await import('path')
  const localPath = path.join(process.cwd(), 'public', 'fonts', 'NotoSansJP-Bold.ttf')
  try {
    const buffer = await fs.readFile(localPath)
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
  } catch { /* fallback */ }
  const resp = await fetch('https://github.com/googlefonts/noto-cjk/raw/main/Sans/OTF/Japanese/NotoSansCJKjp-Bold.otf', { signal: AbortSignal.timeout(60000) })
  if (!resp.ok) throw new Error(`Failed to fetch font: ${resp.status}`)
  return resp.arrayBuffer()
}

// ============================================================
// Helpers
// ============================================================

function darkGradientBg() {
  return `linear-gradient(180deg, ${BRAND.navy} 0%, ${BRAND.navyLight} 50%, ${BRAND.navy} 100%)`
}

function slideNumberLabel(num: number, total: number, lightMode = false) {
  return {
    type: 'div',
    props: {
      style: {
        position: 'absolute' as const, top: 50, right: 40,
        fontSize: 24, color: lightMode ? 'rgba(255,255,255,0.6)' : BRAND.textMuted,
      },
      children: `${num}/${total}`,
    },
  }
}

// ============================================================
// COVER SLIDE (FIXED - DO NOT CHANGE)
// 1行目: 118px白 8文字固定 / 2行目: 可変シアン / 3行目: 可変白
// ============================================================

function renderCoverSlide(hookLine1: string, hookLine2: string, hookLine3: string, slideNum: number, total: number, coverBgDataUri: string | null) {
  const TEXT_SHADOW = '0 6px 20px rgba(0,0,0,0.95), 0 3px 6px rgba(0,0,0,0.7)'
  const line2Len = hookLine2.length
  const line2FontSize = line2Len <= 5 ? 140 : line2Len <= 8 ? 120 : 110
  const line3Len = hookLine3.length
  const line3FontSize = line3Len <= 6 ? 140 : line3Len <= 8 ? 110 : 90

  return {
    type: 'div',
    props: {
      style: { display: 'flex', flexDirection: 'column', width: CAROUSEL_WIDTH, height: CAROUSEL_HEIGHT, fontFamily: 'NotoSansJP', position: 'relative' as const, background: darkGradientBg(), alignItems: 'center' as const, justifyContent: 'center' as const },
      children: [
        ...(coverBgDataUri ? [{ type: 'img', props: { src: coverBgDataUri, style: { position: 'absolute' as const, top: 0, left: 0, width: CAROUSEL_WIDTH, height: CAROUSEL_HEIGHT, objectFit: 'cover' as const } } }] : []),
        slideNumberLabel(slideNum, total, true),
        {
          type: 'div', props: { style: { display: 'flex', flexDirection: 'column', alignItems: 'center' as const, justifyContent: 'center' as const }, children: [
            { type: 'div', props: { style: { color: BRAND.textLight, fontSize: 118, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' as const, textShadow: TEXT_SHADOW }, children: hookLine1 } },
            { type: 'div', props: { style: { color: BRAND.cyan, fontSize: line2FontSize, fontWeight: 700, lineHeight: 1.3, marginTop: 16, textAlign: 'center' as const, textShadow: TEXT_SHADOW }, children: hookLine2 } },
            { type: 'div', props: { style: { color: BRAND.textLight, fontSize: line3FontSize, fontWeight: 700, lineHeight: 1.3, marginTop: 16, textAlign: 'center' as const, textShadow: TEXT_SHADOW }, children: hookLine3 } },
          ] },
        },
      ],
    },
  }
}

// ============================================================
// BRIDGE SLIDE (2枚目 - CONFIRMED)
// ダークネイビー背景 + 答えはこれ + 64px白テキスト + スワイプ誘導
// ============================================================

function renderBridgeSlide(bridgeText: string, slideNum: number, total: number) {
  const TEXT_SHADOW = '0 6px 20px rgba(0,0,0,0.95), 0 3px 6px rgba(0,0,0,0.7)'
  const lines = bridgeText.split('\n')

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex', flexDirection: 'column', width: CAROUSEL_WIDTH, height: CAROUSEL_HEIGHT,
        fontFamily: 'NotoSansJP',
        background: `radial-gradient(ellipse at center, ${BRAND.navyLight} 0%, ${BRAND.navy} 70%)`,
        alignItems: 'center' as const, justifyContent: 'center' as const,
        position: 'relative' as const,
      },
      children: [
        slideNumberLabel(slideNum, total, true),
        // Section label
        {
          type: 'div', props: {
            style: { fontSize: 42, color: BRAND.cyan, fontWeight: 700, letterSpacing: 6, marginBottom: 24 },
            children: '答えはこれ',
          },
        },
        // Cyan decorative line
        {
          type: 'div', props: {
            style: { width: 120, height: 2, background: BRAND.cyan, marginBottom: 60 },
            children: '',
          },
        },
        // Main text
        ...lines.map((line: string) => ({
          type: 'div', props: {
            style: {
              color: BRAND.textLight, fontSize: 64, fontWeight: 700, lineHeight: 1.4,
              textAlign: 'center' as const, textShadow: TEXT_SHADOW,
              maxWidth: 900, paddingLeft: 60, paddingRight: 60,
            },
            children: line,
          },
        })),
        // Cyan accent line
        {
          type: 'div', props: {
            style: { width: 200, height: 4, background: BRAND.cyan, borderRadius: 2, marginTop: 48 },
            children: '',
          },
        },
        // Swipe prompt
        {
          type: 'div', props: {
            style: {
              position: 'absolute' as const, bottom: 80,
              fontSize: 24, color: 'rgba(255,255,255,0.4)', letterSpacing: 2,
            },
            children: 'スワイプで詳しく →',
          },
        },
      ],
    },
  }
}

// ============================================================
// CTA SLIDE (最終枚、固定画像)
// ============================================================

async function loadCtaImage(): Promise<string | null> {
  try {
    const fs = await import('fs/promises')
    const path = await import('path')
    const ctaPath = path.join(process.cwd(), 'public', 'images', 'instagram', 'carousel-cta-fixed.png')
    const buffer = await fs.readFile(ctaPath)
    return `data:image/png;base64,${buffer.toString('base64')}`
  } catch {
    return null
  }
}

function renderCtaSlide(total: number, ctaDataUri: string | null) {
  if (ctaDataUri) {
    return {
      type: 'div',
      props: {
        style: { display: 'flex', width: CAROUSEL_WIDTH, height: CAROUSEL_HEIGHT, position: 'relative' as const },
        children: [{ type: 'img', props: { src: ctaDataUri, style: { width: CAROUSEL_WIDTH, height: CAROUSEL_HEIGHT, objectFit: 'cover' as const } } }],
      },
    }
  }
  return {
    type: 'div',
    props: {
      style: { display: 'flex', flexDirection: 'column', width: CAROUSEL_WIDTH, height: CAROUSEL_HEIGHT, background: darkGradientBg(), fontFamily: 'NotoSansJP', alignItems: 'center' as const, justifyContent: 'center' as const },
      children: [
        { type: 'div', props: { style: { color: BRAND.textLight, fontSize: 40, fontWeight: 700, marginBottom: 40, textAlign: 'center' as const }, children: 'フォローで最新AI情報をGET' } },
        { type: 'div', props: { style: { color: BRAND.cyan, fontSize: 32, fontWeight: 700 }, children: '@nands_official' } },
      ],
    },
  }
}

// ============================================================
// Satori Slides Export (Cover + Bridge + CTA only)
// ============================================================

export async function renderSatoriSlides(
  content: CarouselContent,
  totalSlides: number,
): Promise<{ cover: Buffer; bridge: Buffer; cta: Buffer }> {
  const font = await loadFont()
  const fontConfig = [{ name: 'NotoSansJP', data: font, weight: 700 as const, style: 'normal' as const }]
  const imageOptions = { width: CAROUSEL_WIDTH, height: CAROUSEL_HEIGHT, fonts: fontConfig }

  // Load cover background
  let coverBgDataUri: string | null = null
  try {
    const fs = await import('fs/promises')
    const path = await import('path')
    const coverPath = path.join(process.cwd(), 'public', 'images', 'instagram', 'carousel-cover-bg.png')
    const coverBuffer = await fs.readFile(coverPath)
    coverBgDataUri = `data:image/png;base64,${coverBuffer.toString('base64')}`
  } catch { process.stdout.write('Cover background not found\n') }

  const ctaDataUri = await loadCtaImage()

  // Render Cover
  const coverElement = renderCoverSlide(content.hookLine1, content.hookLine2, content.hookLine3, 1, totalSlides, coverBgDataUri)
  const coverResponse = new ImageResponse(coverElement as any, imageOptions)
  const cover = Buffer.from(await coverResponse.arrayBuffer())

  // Render Bridge
  const bridgeElement = renderBridgeSlide(content.bridgeText, 2, totalSlides)
  const bridgeResponse = new ImageResponse(bridgeElement as any, imageOptions)
  const bridge = Buffer.from(await bridgeResponse.arrayBuffer())

  // Render CTA
  const ctaElement = renderCtaSlide(totalSlides, ctaDataUri)
  const ctaResponse = new ImageResponse(ctaElement as any, imageOptions)
  const cta = Buffer.from(await ctaResponse.arrayBuffer())

  process.stdout.write(`  Rendered 3 Satori slides (cover, bridge, cta)\n`)
  return { cover, bridge, cta }
}

// ============================================================
// Hybrid Carousel Hook Slide (single render for video carousel)
// ============================================================

export async function renderHybridHookSlide(
  hookLine1: string,
  hookLine2: string,
  hookLine3: string,
): Promise<Buffer> {
  const font = await loadFont()
  const fontConfig = [{ name: 'NotoSansJP', data: font, weight: 700 as const, style: 'normal' as const }]
  const imageOptions = { width: CAROUSEL_WIDTH, height: CAROUSEL_HEIGHT, fonts: fontConfig }

  let coverBgDataUri: string | null = null
  try {
    const fs = await import('fs/promises')
    const path = await import('path')
    const coverPath = path.join(process.cwd(), 'public', 'images', 'instagram', 'carousel-cover-bg.png')
    const coverBuffer = await fs.readFile(coverPath)
    coverBgDataUri = `data:image/png;base64,${coverBuffer.toString('base64')}`
  } catch { /* no bg */ }

  const element = renderCoverSlide(hookLine1, hookLine2, hookLine3, 1, 4, coverBgDataUri)
  const response = new ImageResponse(element as any, imageOptions)
  return Buffer.from(await response.arrayBuffer())
}
