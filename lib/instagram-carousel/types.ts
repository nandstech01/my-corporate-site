export type SlideType = 'cover' | 'conclusion' | 'content' | 'summary' | 'cta'
export type SummaryType = 'comparison' | 'checklist' | 'pros_cons' | 'numbers' | 'before_after'

export interface ContentSlide {
  readonly title: string
  readonly description: string
  readonly keyPoints: readonly string[]
}

export interface ComparisonItem {
  readonly label: string
  readonly values: readonly (boolean | string)[]
}

export interface SummaryData {
  readonly type: SummaryType
  readonly title: string
  readonly items: readonly string[]
  readonly columns?: readonly string[]
  readonly pros?: readonly string[]
  readonly cons?: readonly string[]
}

export interface CarouselContent {
  readonly hookLine1: string
  readonly hookLine2: string
  readonly hookLine3: string
  readonly conclusionText: string
  readonly contentSlides: readonly ContentSlide[]
  readonly summary: SummaryData
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
  yellow: '#FDE047',
} as const

export const CAROUSEL_WIDTH = 1080
export const CAROUSEL_HEIGHT = 1350
