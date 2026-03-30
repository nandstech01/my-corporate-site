export type SlideType = 'cover' | 'bridge' | 'content' | 'summary' | 'cta'
export type SummaryType = 'table' | 'takeaway'

// コンテンツスライド: ブログ1セクション分の濃い情報
export interface ContentSlide {
  readonly title: string
  readonly points: readonly string[]  // 各ポイント（詳細な説明付き、省略なし）
  readonly callout: string            // 補足コメント（フッターに表示）
}

// まとめスライド: 比較表またはTakeawayリスト
export interface SummaryTable {
  readonly type: 'table'
  readonly title: string
  readonly headers: readonly string[]
  readonly rows: readonly { readonly label: string; readonly values: readonly string[] }[]
}

export interface SummaryTakeaway {
  readonly type: 'takeaway'
  readonly title: string
  readonly items: readonly { readonly text: string; readonly detail: string }[]
}

export type SummaryData = SummaryTable | SummaryTakeaway

export interface CarouselContent {
  readonly hookLine1: string
  readonly hookLine2: string
  readonly hookLine3: string
  readonly bridgeText: string
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

// ============================================================
// Hybrid Carousel (映像入り) Types
// ============================================================

export type CarouselItemMediaType = 'IMAGE' | 'VIDEO'

export interface CarouselItem {
  readonly mediaType: CarouselItemMediaType
  readonly publicUrl: string
  readonly slideLabel: string
}

export interface ViralVideoSource {
  readonly tweetId: string
  readonly tweetText: string
  readonly username: string
  readonly videoUrl: string
  readonly previewImageUrl?: string
  readonly likeCount: number
  readonly impressionCount: number
  readonly topicHint: string
}

export interface HybridCarouselContent {
  readonly hookLine1: string
  readonly hookLine2: string
  readonly hookLine3: string
  readonly videoSource: ViralVideoSource
  readonly diagramPromptContext: string
  readonly caption: string
  readonly hashtags: readonly string[]
}

export interface HybridPipelineResult {
  readonly success: boolean
  readonly mediaId?: string
  readonly carouselItems?: readonly CarouselItem[]
  readonly videoSource?: ViralVideoSource
  readonly error?: string
}
