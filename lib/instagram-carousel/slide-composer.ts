/**
 * Instagram Carousel Slide Composer
 *
 * Renders 8 Instagram carousel slides (1080x1350 4:5 portrait) using Satori/ImageResponse.
 * Each slide is rendered sequentially to avoid memory pressure.
 *
 * Slides: Cover -> Problem -> Solution -> DeepDive x3 -> Summary -> CTA
 */

import { ImageResponse } from 'next/og'
import {
  CarouselContent,
  BRAND,
  CAROUSEL_WIDTH,
  CAROUSEL_HEIGHT,
  TOTAL_SLIDES,
} from './types'

// ============================================================
// Font Loading (module-level singleton cache)
// ============================================================

const loadFont = (() => {
  let cached: Promise<ArrayBuffer> | null = null
  return (): Promise<ArrayBuffer> => {
    if (!cached) {
      cached = fetchFont().catch((err) => {
        cached = null
        throw err
      })
    }
    return cached
  }
})()

async function fetchFont(): Promise<ArrayBuffer> {
  // Try local file first, fallback to remote fetch
  const fs = await import('fs/promises')
  const path = await import('path')
  const localPath = path.join(process.cwd(), 'public', 'fonts', 'NotoSansJP-Bold.ttf')
  try {
    const buffer = await fs.readFile(localPath)
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
  } catch {
    // Fallback: fetch from GitHub
  }
  const fontResponse = await fetch(
    'https://github.com/googlefonts/noto-cjk/raw/main/Sans/OTF/Japanese/NotoSansCJKjp-Bold.otf',
    { signal: AbortSignal.timeout(60000) },
  )

  if (!fontResponse.ok) {
    throw new Error(`Failed to fetch font file: ${fontResponse.status}`)
  }

  return await fontResponse.arrayBuffer()
}

// ============================================================
// Shared Styles
// ============================================================

function slideNumberLabel(slideNum: number, dark: boolean) {
  return {
    type: 'div',
    props: {
      style: {
        position: 'absolute' as const,
        top: 40,
        right: 50,
        fontSize: 24,
        color: dark ? BRAND.textMuted : BRAND.textMuted,
      },
      children: `${slideNum}/${TOTAL_SLIDES}`,
    },
  }
}

function darkGradientBg() {
  return `linear-gradient(180deg, ${BRAND.navy} 0%, ${BRAND.navyLight} 100%)`
}

// ============================================================
// Slide 1: Cover
// ============================================================

function renderCoverSlide(
  hookLine1: string, hookLine2: string, hookLine3: string,
  slideNum: number, coverBgDataUri: string | null,
) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: CAROUSEL_WIDTH,
        height: CAROUSEL_HEIGHT,
        fontFamily: 'NotoSansJP',
        position: 'relative' as const,
        background: darkGradientBg(),
      },
      children: [
        // Background image (Canva cover with person)
        ...(coverBgDataUri ? [{
          type: 'img',
          props: {
            src: coverBgDataUri,
            style: {
              position: 'absolute' as const,
              top: 0,
              left: 0,
              width: CAROUSEL_WIDTH,
              height: CAROUSEL_HEIGHT,
              objectFit: 'cover' as const,
            },
          },
        }] : []),
        // Slide number top-right
        slideNumberLabel(slideNum, true),
        // Text block - centered vertically, matching reference layout exactly
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              position: 'absolute' as const,
              top: Math.round(CAROUSEL_HEIGHT * 0.35),
              left: 50,
              right: 50,
            },
            children: [
              // Line 1: White, large (カテゴリ)
              {
                type: 'div',
                props: {
                  style: {
                    color: BRAND.textLight,
                    fontSize: 64,
                    fontWeight: 700,
                    lineHeight: 1.3,
                    textShadow: '0 4px 16px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.5)',
                  },
                  children: hookLine1,
                },
              },
              // Line 2: Cyan, large (メインキーワード)
              {
                type: 'div',
                props: {
                  style: {
                    color: BRAND.cyan,
                    fontSize: 68,
                    fontWeight: 700,
                    lineHeight: 1.3,
                    marginTop: 12,
                    textShadow: '0 4px 16px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.5)',
                  },
                  children: hookLine2,
                },
              },
              // Line 3: White, large (コンテンツ種類)
              {
                type: 'div',
                props: {
                  style: {
                    color: BRAND.textLight,
                    fontSize: 72,
                    fontWeight: 700,
                    lineHeight: 1.3,
                    marginTop: 12,
                    textShadow: '0 4px 16px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.5)',
                  },
                  children: hookLine3,
                },
              },
            ],
          },
        },
      ],
    },
  }
}

// ============================================================
// Slide 2: Problem
// ============================================================

function renderProblemSlide(bullets: readonly string[], slideNum: number) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: CAROUSEL_WIDTH,
        height: CAROUSEL_HEIGHT,
        background: darkGradientBg(),
        fontFamily: 'NotoSansJP',
        position: 'relative' as const,
        padding: '100px 70px 60px 70px',
      },
      children: [
        slideNumberLabel(slideNum, true),
        // Title
        {
          type: 'div',
          props: {
            style: {
              color: BRAND.cyan,
              fontSize: 36,
              fontWeight: 700,
              marginBottom: 60,
            },
            children: '\u3053\u3093\u306A\u60A9\u307F\u3042\u308A\u307E\u305B\u3093\u304B\uFF1F',
          },
        },
        // Bullets
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
            },
            children: bullets.map((bullet) => ({
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  marginBottom: 36,
                },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: 28,
                        marginRight: 16,
                        flexShrink: 0,
                      },
                      children: '\u26A0\uFE0F',
                    },
                  },
                  {
                    type: 'div',
                    props: {
                      style: {
                        color: BRAND.textLight,
                        fontSize: 28,
                        lineHeight: 1.6,
                      },
                      children: bullet,
                    },
                  },
                ],
              },
            })),
          },
        },
      ],
    },
  }
}

// ============================================================
// Slide 3: Solution
// ============================================================

function renderSolutionSlide(
  title: string,
  points: readonly string[],
  diagramBuffer: Buffer | null,
  slideNum: number,
) {
  const diagramElement = diagramBuffer
    ? {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 30,
          },
          children: {
            type: 'img',
            props: {
              src: `data:image/png;base64,${diagramBuffer.toString('base64')}`,
              style: {
                maxWidth: 700,
                maxHeight: 500,
                objectFit: 'contain' as const,
                borderRadius: 12,
              },
            },
          },
        },
      }
    : null

  const pointElements = points.map((point) => ({
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 24,
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              fontSize: 24,
              marginRight: 14,
              flexShrink: 0,
            },
            children: '\u2705',
          },
        },
        {
          type: 'div',
          props: {
            style: {
              color: BRAND.textDark,
              fontSize: 24,
              lineHeight: 1.5,
            },
            children: point,
          },
        },
      ],
    },
  }))

  const bodyChildren = diagramElement
    ? [diagramElement, ...pointElements]
    : pointElements

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: CAROUSEL_WIDTH,
        height: CAROUSEL_HEIGHT,
        background: BRAND.lightBg,
        fontFamily: 'NotoSansJP',
        position: 'relative' as const,
        padding: '100px 70px 60px 70px',
      },
      children: [
        slideNumberLabel(slideNum, false),
        // Title
        {
          type: 'div',
          props: {
            style: {
              color: BRAND.blue,
              fontSize: 40,
              fontWeight: 700,
              marginBottom: 40,
              lineHeight: 1.4,
            },
            children: title,
          },
        },
        // Body (diagram + points or just points)
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
            },
            children: bodyChildren,
          },
        },
      ],
    },
  }
}

// ============================================================
// Slides 4-6: Deep Dive
// ============================================================

const DEEP_DIVE_ACCENTS = [BRAND.cyan, BRAND.blue, BRAND.navy] as const

function renderDeepDiveSlide(
  index: number,
  title: string,
  bullets: readonly string[],
  slideNum: number,
) {
  const accent = DEEP_DIVE_ACCENTS[index % DEEP_DIVE_ACCENTS.length]
  const numberStr = String(index + 1).padStart(2, '0')

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: CAROUSEL_WIDTH,
        height: CAROUSEL_HEIGHT,
        background: BRAND.lightBg,
        fontFamily: 'NotoSansJP',
        position: 'relative' as const,
        padding: '100px 70px 60px 70px',
      },
      children: [
        slideNumberLabel(slideNum, false),
        // Large semi-transparent number
        {
          type: 'div',
          props: {
            style: {
              fontSize: 72,
              fontWeight: 700,
              color: accent,
              opacity: 0.3,
              marginBottom: 16,
            },
            children: numberStr,
          },
        },
        // Title with left accent bar
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 50,
            },
            children: [
              // Left accent bar
              {
                type: 'div',
                props: {
                  style: {
                    width: 4,
                    height: 44,
                    background: accent,
                    borderRadius: 2,
                    marginRight: 20,
                    flexShrink: 0,
                  },
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    color: BRAND.textDark,
                    fontSize: 36,
                    fontWeight: 700,
                    lineHeight: 1.4,
                  },
                  children: title,
                },
              },
            ],
          },
        },
        // Bullets
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
            },
            children: bullets.map((bullet) => ({
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  marginBottom: 28,
                  paddingLeft: 24,
                },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: 24,
                        color: accent,
                        marginRight: 14,
                        flexShrink: 0,
                      },
                      children: '\u2192',
                    },
                  },
                  {
                    type: 'div',
                    props: {
                      style: {
                        color: BRAND.textDark,
                        fontSize: 24,
                        lineHeight: 1.6,
                      },
                      children: bullet,
                    },
                  },
                ],
              },
            })),
          },
        },
      ],
    },
  }
}

// ============================================================
// Slide 7: Summary
// ============================================================

function renderSummarySlide(takeaways: readonly string[], slideNum: number) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: CAROUSEL_WIDTH,
        height: CAROUSEL_HEIGHT,
        background: darkGradientBg(),
        fontFamily: 'NotoSansJP',
        position: 'relative' as const,
        padding: '100px 70px 60px 70px',
      },
      children: [
        slideNumberLabel(slideNum, true),
        // Title
        {
          type: 'div',
          props: {
            style: {
              color: BRAND.cyan,
              fontSize: 40,
              fontWeight: 700,
              marginBottom: 50,
            },
            children: '\u307E\u3068\u3081',
          },
        },
        // Takeaways
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
            },
            children: takeaways.map((item) => ({
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  marginBottom: 32,
                },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: 28,
                        color: BRAND.cyan,
                        marginRight: 16,
                        flexShrink: 0,
                      },
                      children: '\u2726',
                    },
                  },
                  {
                    type: 'div',
                    props: {
                      style: {
                        color: BRAND.textLight,
                        fontSize: 28,
                        lineHeight: 1.6,
                      },
                      children: item,
                    },
                  },
                ],
              },
            })),
          },
        },
        // Bottom save prompt
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'center',
              paddingBottom: 20,
            },
            children: {
              type: 'div',
              props: {
                style: {
                  color: BRAND.textMuted,
                  fontSize: 24,
                },
                children: '\u4FDD\u5B58\u3057\u3066\u5F8C\u3067\u898B\u8FD4\u3057\u3066\u306D \uD83D\uDD16',
              },
            },
          },
        },
      ],
    },
  }
}

// ============================================================
// Slide 8: CTA
// ============================================================

function renderCtaSlide(slideNum: number) {
  const ctaRows = [
    '\uD83D\uDCF1 \u30D5\u30A9\u30ED\u30FC\u3067\u6700\u65B0AI\u60C5\u5831\u3092GET',
    '\uD83D\uDD16 \u4FDD\u5B58\u3057\u3066\u5F8C\u3067\u898B\u8FD4\u3059',
    '\uD83D\uDCAC \u30B3\u30E1\u30F3\u30C8\u3067\u611F\u60F3\u3092\u6559\u3048\u3066',
  ]

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: CAROUSEL_WIDTH,
        height: CAROUSEL_HEIGHT,
        background: `linear-gradient(180deg, ${BRAND.navy} 0%, ${BRAND.navyLight} 70%, ${BRAND.cyan}22 100%)`,
        fontFamily: 'NotoSansJP',
        position: 'relative' as const,
        padding: '100px 70px 60px 70px',
      },
      children: [
        slideNumberLabel(slideNum, true),
        // CTA rows centered vertically
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            },
            children: ctaRows.map((row) => ({
              type: 'div',
              props: {
                style: {
                  color: BRAND.textLight,
                  fontSize: 32,
                  fontWeight: 700,
                  textAlign: 'center' as const,
                  marginBottom: 48,
                  lineHeight: 1.5,
                },
                children: row,
              },
            })),
          },
        },
        // Handle at bottom
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'center',
              paddingBottom: 30,
            },
            children: {
              type: 'div',
              props: {
                style: {
                  color: BRAND.cyan,
                  fontSize: 28,
                  fontWeight: 700,
                },
                children: '@nands_official',
              },
            },
          },
        },
      ],
    },
  }
}

// ============================================================
// Main Export
// ============================================================

export async function renderAllSlides(
  content: CarouselContent,
  diagramBuffer: Buffer | null,
): Promise<Buffer[]> {
  const font = await loadFont()

  const fontConfig = [
    {
      name: 'NotoSansJP',
      data: font,
      weight: 700 as const,
      style: 'normal' as const,
    },
  ]

  const imageOptions = {
    width: CAROUSEL_WIDTH,
    height: CAROUSEL_HEIGHT,
    fonts: fontConfig,
  }

  // Load cover background image
  let coverBgDataUri: string | null = null
  try {
    const fs = await import('fs/promises')
    const path = await import('path')
    const coverPath = path.join(process.cwd(), 'public', 'images', 'instagram', 'carousel-cover-bg.png')
    const coverBuffer = await fs.readFile(coverPath)
    coverBgDataUri = `data:image/png;base64,${coverBuffer.toString('base64')}`
  } catch {
    process.stdout.write('Cover background not found, using gradient fallback\n')
  }

  // Build all 8 slide elements
  const slideElements = [
    renderCoverSlide(content.hookLine1, content.hookLine2, content.hookLine3, 1, coverBgDataUri),
    renderProblemSlide(content.problemBullets, 2),
    renderSolutionSlide(content.solutionTitle, content.solutionPoints, diagramBuffer, 3),
    renderDeepDiveSlide(0, content.deepDives[0].title, content.deepDives[0].bullets, 4),
    renderDeepDiveSlide(1, content.deepDives[1].title, content.deepDives[1].bullets, 5),
    renderDeepDiveSlide(2, content.deepDives[2].title, content.deepDives[2].bullets, 6),
    renderSummarySlide(content.takeaways, 7),
    renderCtaSlide(8),
  ]

  // Render sequentially to avoid memory pressure
  const buffers: Buffer[] = []
  for (const element of slideElements) {
    const response = new ImageResponse(element, imageOptions)
    const arrayBuffer = await response.arrayBuffer()
    buffers.push(Buffer.from(arrayBuffer))
  }

  return buffers
}
