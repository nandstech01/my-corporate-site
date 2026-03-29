/**
 * Instagram Carousel Slide Composer
 *
 * Renders variable-count Instagram carousel slides (1080x1350 4:5 portrait).
 * Slides: Cover -> Conclusion -> Content x N -> Summary -> CTA
 */

import { ImageResponse } from 'next/og'
import type { CarouselContent, ContentSlide, SummaryData } from './types'
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

function slideNumberLabel(num: number, total: number, light: boolean) {
  return {
    type: 'div',
    props: {
      style: {
        position: 'absolute' as const, top: 40, right: 50, fontSize: 24,
        color: light ? 'rgba(255,255,255,0.6)' : BRAND.textMuted,
      },
      children: `${num}/${total}`,
    },
  }
}

function saveCTABadge() {
  return {
    type: 'div',
    props: {
      style: {
        position: 'absolute' as const, bottom: 50, right: 50,
        display: 'flex', flexDirection: 'row' as const, alignItems: 'center' as const,
        backgroundColor: BRAND.yellow, borderRadius: 24, padding: '10px 18px',
      },
      children: [
        { type: 'div', props: { style: { fontSize: 22, marginRight: 8 }, children: '🔖' } },
        { type: 'div', props: { style: { color: BRAND.textDark, fontSize: 16, fontWeight: 700 }, children: '忘れる前に今すぐ保存！' } },
      ],
    },
  }
}

// ============================================================
// COVER SLIDE (FIXED - DO NOT CHANGE)
// 1行目: 130px白 8文字固定 / 2行目: 可変シアン / 3行目: 140px白
// ============================================================

function renderCoverSlide(hookLine1: string, hookLine2: string, hookLine3: string, slideNum: number, total: number, coverBgDataUri: string | null) {
  const TEXT_SHADOW = '0 6px 20px rgba(0,0,0,0.95), 0 3px 6px rgba(0,0,0,0.7)'
  const line2Len = hookLine2.length
  const line2FontSize = line2Len <= 5 ? 140 : line2Len <= 8 ? 120 : 110

  return {
    type: 'div',
    props: {
      style: { display: 'flex', flexDirection: 'column', width: CAROUSEL_WIDTH, height: CAROUSEL_HEIGHT, fontFamily: 'NotoSansJP', position: 'relative' as const, background: darkGradientBg(), alignItems: 'center' as const, justifyContent: 'center' as const },
      children: [
        ...(coverBgDataUri ? [{ type: 'img', props: { src: coverBgDataUri, style: { position: 'absolute' as const, top: 0, left: 0, width: CAROUSEL_WIDTH, height: CAROUSEL_HEIGHT, objectFit: 'cover' as const } } }] : []),
        slideNumberLabel(slideNum, total, true),
        {
          type: 'div', props: { style: { display: 'flex', flexDirection: 'column', alignItems: 'center' as const, justifyContent: 'center' as const }, children: [
            { type: 'div', props: { style: { color: BRAND.textLight, fontSize: 130, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' as const, textShadow: TEXT_SHADOW }, children: hookLine1 } },
            { type: 'div', props: { style: { color: BRAND.cyan, fontSize: line2FontSize, fontWeight: 700, lineHeight: 1.3, marginTop: 16, textAlign: 'center' as const, textShadow: TEXT_SHADOW }, children: hookLine2 } },
            { type: 'div', props: { style: { color: BRAND.textLight, fontSize: 140, fontWeight: 700, lineHeight: 1.3, marginTop: 16, textAlign: 'center' as const, textShadow: TEXT_SHADOW }, children: hookLine3 } },
          ] },
        },
      ],
    },
  }
}

// ============================================================
// CONCLUSION SLIDE (2枚目)
// ============================================================

function renderConclusionSlide(conclusionText: string, slideNum: number, total: number) {
  return {
    type: 'div',
    props: {
      style: { display: 'flex', flexDirection: 'column', width: CAROUSEL_WIDTH, height: CAROUSEL_HEIGHT, background: '#FFFFFF', fontFamily: 'NotoSansJP', position: 'relative' as const, padding: '100px 70px 80px 70px' },
      children: [
        slideNumberLabel(slideNum, total, false),
        { type: 'div', props: { style: { color: BRAND.textDark, fontSize: 44, fontWeight: 700, textAlign: 'center' as const, marginBottom: 60 }, children: '今日の結論' } },
        {
          type: 'div', props: { style: { flex: 1, display: 'flex', alignItems: 'center' as const, justifyContent: 'center' as const }, children: {
            type: 'div', props: { style: { backgroundColor: BRAND.yellow, color: BRAND.textDark, padding: '40px 50px', borderRadius: 16, fontSize: 48, fontWeight: 700, textAlign: 'center' as const, lineHeight: 1.6, maxWidth: 850 }, children: conclusionText },
          } },
        },
        saveCTABadge(),
      ],
    },
  }
}

// ============================================================
// CONTENT SLIDE (3〜N枚目、Gemini背景+テキスト)
// ============================================================

function renderContentSlide(slide: ContentSlide, slideNum: number, total: number, bgDataUri: string | null) {
  return {
    type: 'div',
    props: {
      style: { display: 'flex', flexDirection: 'column', width: CAROUSEL_WIDTH, height: CAROUSEL_HEIGHT, fontFamily: 'NotoSansJP', position: 'relative' as const, background: darkGradientBg() },
      children: [
        ...(bgDataUri ? [{ type: 'img', props: { src: bgDataUri, style: { position: 'absolute' as const, top: 0, left: 0, width: CAROUSEL_WIDTH, height: CAROUSEL_HEIGHT, objectFit: 'cover' as const } } }] : []),
        // Dark overlay
        { type: 'div', props: { style: { position: 'absolute' as const, top: 0, left: 0, width: CAROUSEL_WIDTH, height: CAROUSEL_HEIGHT, background: 'rgba(0,0,0,0.6)' } } },
        slideNumberLabel(slideNum, total, true),
        // Content
        {
          type: 'div', props: { style: { display: 'flex', flexDirection: 'column', padding: '120px 70px 120px 70px', flex: 1 }, children: [
            // Title with cyan left border
            {
              type: 'div', props: { style: { display: 'flex', flexDirection: 'row', alignItems: 'center' as const, marginBottom: 40 }, children: [
                { type: 'div', props: { style: { width: 6, height: 60, backgroundColor: BRAND.cyan, marginRight: 24, borderRadius: 3, flexShrink: 0 } } },
                { type: 'div', props: { style: { color: BRAND.textLight, fontSize: 48, fontWeight: 700, lineHeight: 1.3, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }, children: slide.title } },
              ] },
            },
            // Description
            { type: 'div', props: { style: { color: 'rgba(255,255,255,0.9)', fontSize: 28, lineHeight: 1.8, marginBottom: 40, textShadow: '0 1px 4px rgba(0,0,0,0.3)' }, children: slide.description } },
            // Key points
            ...slide.keyPoints.map((point) => ({
              type: 'div', props: { style: { display: 'flex', flexDirection: 'row', alignItems: 'flex-start' as const, marginBottom: 20 }, children: [
                { type: 'div', props: { style: { color: BRAND.cyan, fontSize: 24, marginRight: 16, flexShrink: 0, marginTop: 4 }, children: '→' } },
                { type: 'div', props: { style: { color: BRAND.textLight, fontSize: 24, lineHeight: 1.6, textShadow: '0 1px 4px rgba(0,0,0,0.3)' }, children: point } },
              ] },
            })),
          ] },
        },
        saveCTABadge(),
      ],
    },
  }
}

// ============================================================
// SUMMARY SLIDE (まとめ、5パターン)
// ============================================================

function renderSummarySlide(summary: SummaryData, slideNum: number, total: number) {
  const rows = buildSummaryContent(summary)

  return {
    type: 'div',
    props: {
      style: { display: 'flex', flexDirection: 'column', width: CAROUSEL_WIDTH, height: CAROUSEL_HEIGHT, background: BRAND.lightBg, fontFamily: 'NotoSansJP', position: 'relative' as const, padding: '100px 60px 80px 60px' },
      children: [
        slideNumberLabel(slideNum, total, false),
        { type: 'div', props: { style: { color: BRAND.navy, fontSize: 40, fontWeight: 700, textAlign: 'center' as const, marginBottom: 50 }, children: summary.title } },
        { type: 'div', props: { style: { display: 'flex', flexDirection: 'column', flex: 1 }, children: rows } },
        saveCTABadge(),
      ],
    },
  }
}

function buildSummaryContent(summary: SummaryData): unknown[] {
  switch (summary.type) {
    case 'checklist':
      return summary.items.map((item) => ({
        type: 'div', props: { style: { display: 'flex', flexDirection: 'row', alignItems: 'center' as const, marginBottom: 24, paddingLeft: 20 }, children: [
          { type: 'div', props: { style: { fontSize: 28, marginRight: 16, flexShrink: 0, color: BRAND.cyan }, children: '✅' } },
          { type: 'div', props: { style: { color: BRAND.textDark, fontSize: 24, lineHeight: 1.5 }, children: item } },
        ] },
      }))

    case 'pros_cons':
      return [{
        type: 'div', props: { style: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between' as const }, children: [
          // Pros column
          {
            type: 'div', props: { style: { display: 'flex', flexDirection: 'column', width: 440 }, children: [
              { type: 'div', props: { style: { color: BRAND.cyan, fontSize: 28, fontWeight: 700, marginBottom: 20 }, children: '✅ メリット' } },
              ...(summary.pros ?? summary.items).map((item) => ({
                type: 'div', props: { style: { display: 'flex', flexDirection: 'row', marginBottom: 16 }, children: [
                  { type: 'div', props: { style: { color: BRAND.cyan, fontSize: 20, marginRight: 8, flexShrink: 0 }, children: '•' } },
                  { type: 'div', props: { style: { color: BRAND.textDark, fontSize: 20, lineHeight: 1.4 }, children: item } },
                ] },
              })),
            ] },
          },
          // Cons column
          {
            type: 'div', props: { style: { display: 'flex', flexDirection: 'column', width: 440 }, children: [
              { type: 'div', props: { style: { color: '#EF4444', fontSize: 28, fontWeight: 700, marginBottom: 20 }, children: '❌ デメリット' } },
              ...(summary.cons ?? []).map((item) => ({
                type: 'div', props: { style: { display: 'flex', flexDirection: 'row', marginBottom: 16 }, children: [
                  { type: 'div', props: { style: { color: '#EF4444', fontSize: 20, marginRight: 8, flexShrink: 0 }, children: '•' } },
                  { type: 'div', props: { style: { color: BRAND.textDark, fontSize: 20, lineHeight: 1.4 }, children: item } },
                ] },
              })),
            ] },
          },
        ] },
      }]

    case 'comparison':
      return summary.items.map((item, idx) => ({
        type: 'div', props: { style: { display: 'flex', flexDirection: 'row', alignItems: 'center' as const, paddingTop: 18, paddingBottom: 18, paddingLeft: 20, paddingRight: 20, backgroundColor: idx % 2 === 0 ? '#FFFFFF' : BRAND.lightBg, borderRadius: 8, marginBottom: 4 }, children: [
          { type: 'div', props: { style: { flex: 1, color: BRAND.textDark, fontSize: 22, lineHeight: 1.4 }, children: item } },
        ] },
      }))

    case 'numbers':
    case 'before_after':
    default:
      return summary.items.map((item, idx) => ({
        type: 'div', props: { style: { display: 'flex', flexDirection: 'row', alignItems: 'center' as const, marginBottom: 20, paddingLeft: 20 }, children: [
          { type: 'div', props: { style: { fontSize: 28, marginRight: 16, flexShrink: 0, color: BRAND.cyan }, children: `${idx + 1}.` } },
          { type: 'div', props: { style: { color: BRAND.textDark, fontSize: 24, lineHeight: 1.5 }, children: item } },
        ] },
      }))
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
  // Fallback if CTA image not found
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
// Main Export
// ============================================================

export async function renderAllSlides(
  content: CarouselContent,
  bgBuffers: (Buffer | null)[],
): Promise<Buffer[]> {
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

  // Load CTA image
  const ctaDataUri = await loadCtaImage()

  // Total slides = cover + conclusion + contentSlides + summary + cta
  const totalSlides = 2 + content.contentSlides.length + 1 + 1

  // Convert bg buffers to data URIs
  const bgDataUris = bgBuffers.map(buf =>
    buf ? `data:image/jpeg;base64,${buf.toString('base64')}` : null
  )

  // Build all slide elements
  const slideElements: unknown[] = [
    renderCoverSlide(content.hookLine1, content.hookLine2, content.hookLine3, 1, totalSlides, coverBgDataUri),
    renderConclusionSlide(content.conclusionText, 2, totalSlides),
    ...content.contentSlides.map((slide, i) =>
      renderContentSlide(slide, 3 + i, totalSlides, bgDataUris[i] || null)
    ),
    renderSummarySlide(content.summary, totalSlides - 1, totalSlides),
    renderCtaSlide(totalSlides, ctaDataUri),
  ]

  // Render sequentially
  const buffers: Buffer[] = []
  for (const element of slideElements) {
    const response = new ImageResponse(element, imageOptions)
    const arrayBuffer = await response.arrayBuffer()
    buffers.push(Buffer.from(arrayBuffer))
  }

  process.stdout.write(`  Rendered ${buffers.length} slides (${totalSlides} total)\n`)
  return buffers
}
