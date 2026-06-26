/**
 * Types for GSC/GA4 data-driven SEO & demand-prediction insights.
 */

export interface GscQueryRow {
  readonly query: string
  readonly clicks: number
  readonly impressions: number
  readonly ctr: number
  readonly position: number
}

export interface GscPageMetric {
  readonly page_path: string
  readonly date: string
  readonly clicks: number
  readonly impressions: number
  readonly ctr: number
  readonly position: number
  readonly queries: GscQueryRow[]
}

export interface Ga4PageMetric {
  readonly page_path: string
  readonly date: string
  readonly sessions: number
  readonly engaged_sessions: number
  readonly engagement_rate: number
  readonly avg_engagement_time: number
  readonly conversions: number
}

/** A concrete SEO/demand opportunity surfaced from accumulated data. */
export interface SeoOpportunity {
  readonly kind: 'strike_distance' | 'low_ctr' | 'rising_demand' | 'winning_format'
  /** Search query or topic angle this opportunity is about. */
  readonly query: string
  /** Existing page this relates to (improvement), or null for a new-article demand signal. */
  readonly pagePath: string | null
  readonly impressions: number
  readonly position: number
  readonly ctr: number
  /** 0-1 priority — higher = act on this first. */
  readonly score: number
  readonly reason: string
}

export interface SeoInsights {
  readonly opportunities: readonly SeoOpportunity[]
  /** Distinct high-demand queries (for topic planning), best first. */
  readonly demandQueries: readonly string[]
  readonly generatedAt: string
}
