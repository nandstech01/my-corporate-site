/**
 * Types for the fully-automated Claude Code blog pipeline.
 */

export type ContentKind = 'claude-code-howto' | 'claude-code-news' | 'company-ai'

export interface TopicPlan {
  readonly kind: ContentKind
  /** Human-facing topic line, e.g. "Claude Code スマホ活用術 7選". */
  readonly topic: string
  /** Primary SEO keyword. */
  readonly targetKeyword: string
  /** Category slug used to resolve category_id/business_id (e.g. 'programming'). */
  readonly categorySlug: string
  /** Verified facts from the official changelog (only allowed source of version-specific claims). */
  readonly changelogFacts: readonly string[]
  /** Optional fresh-angle hints from community buzz. */
  readonly angleHints: readonly string[]
  /** Real search queries with demand (from GSC) to weave in for SEO. */
  readonly seoQueries?: readonly string[]
}

export interface ArticleSection {
  readonly h2: string
  readonly fragmentId: string
  readonly markdown: string
}

export interface GeneratedArticle {
  readonly title: string
  /** ascii kebab base for the slug (Japanese titles can't form a slug). */
  readonly slugBase: string
  readonly metaDescription: string
  readonly metaKeywords: readonly string[]
  readonly categoryTags: readonly string[]
  /** Full assembled Markdown body (hook + sections + まとめ), with {#fragment} anchors. */
  readonly markdown: string
  readonly kind: ContentKind
}

export interface QualityResult {
  readonly passed: boolean
  readonly score: number
  readonly reasons: readonly string[]
}

export interface PublishResult {
  readonly slug: string
  readonly status: 'published' | 'draft'
  readonly url: string
  readonly thumbnailUrl: string | null
}

export interface BlogRunResult {
  readonly ok: boolean
  readonly skipped?: string
  readonly publish?: PublishResult
  readonly crossPost?: ReadonlyArray<{ platform: string; success: boolean; url?: string; error?: string }>
  readonly quality?: QualityResult
  readonly error?: string
}
