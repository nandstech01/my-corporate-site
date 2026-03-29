export type SlideType = 'cover' | 'problem' | 'solution' | 'deep_dive' | 'summary' | 'cta'

export interface DeepDiveContent {
  readonly title: string
  readonly bullets: readonly string[]
}

export interface CarouselContent {
  readonly hook: string
  readonly problemBullets: readonly string[]
  readonly solutionTitle: string
  readonly solutionPoints: readonly string[]
  readonly deepDives: readonly [DeepDiveContent, DeepDiveContent, DeepDiveContent]
  readonly takeaways: readonly string[]
  readonly caption: string
  readonly hashtags: readonly string[]
}

export interface CarouselSlide {
  readonly type: SlideType
  readonly slideNumber: number
  readonly totalSlides: number
  readonly buffer: Buffer
}

export const BRAND = {
  navy: '#0F172A',
  navyLight: '#1E293B',
  cyan: '#06B6D4',
  blue: '#2563EB',
  lightBg: '#F8FAFE',
  lightBorder: '#E2E8F0',
  textDark: '#1E293B',
  textLight: '#FFFFFF',
  textMuted: '#94A3B8',
  textAccent: '#06B6D4',
} as const

export const CAROUSEL_WIDTH = 1080
export const CAROUSEL_HEIGHT = 1350
export const TOTAL_SLIDES = 8
