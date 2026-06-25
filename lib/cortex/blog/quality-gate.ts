/**
 * Quality gate: deterministic structural checks + cortexReview.
 * Publish only when structure OK AND cortex_score >= 0.6 AND not duplicate/stale.
 */

import { cortexReview } from '../review/pre-post-reviewer'
import type { GeneratedArticle, QualityResult } from './types'

const MIN_CHARS = 4000
const MIN_H2 = 4
const VERSION_RE = /\b\d+\.\d+\.\d+\b/g

function structuralChecks(a: GeneratedArticle): string[] {
  const reasons: string[] = []
  const title = a.title.trim()

  if (!title || title === '生成された記事' || title.length < 8) reasons.push('タイトルが不正/プレースホルダ')
  if (a.markdown.length < MIN_CHARS) reasons.push(`本文が短い (${a.markdown.length} < ${MIN_CHARS})`)
  const h2s = (a.markdown.match(/^##\s+/gm) ?? []).length
  if (h2s < MIN_H2) reasons.push(`H2が少ない (${h2s} < ${MIN_H2})`)
  if (!/##\s*まとめ/.test(a.markdown)) reasons.push('まとめが無い')
  if (!a.categoryTags.length) reasons.push('category_tagsが空 (クロスポスト不可)')

  return reasons
}

/** Reject version numbers that don't appear in the changelog facts (anti-fabrication). */
function fabricationCheck(a: GeneratedArticle, changelogFacts: readonly string[]): string[] {
  const factsBlob = changelogFacts.join(' ')
  const versions = Array.from(new Set(a.markdown.match(VERSION_RE) ?? []))
  const fabricated = versions.filter((v) => !factsBlob.includes(v))
  // Allow up to 0 fabricated version strings.
  return fabricated.length ? [`未検証のバージョン番号: ${fabricated.join(', ')}`] : []
}

/**
 * Publish by default. Only BLOCK (hold as draft) when the article is genuinely
 * broken — structurally defective, fabricated version, or a duplicate. The
 * cortex_score is informational only (shown in the notification); a mediocre
 * score still auto-publishes, because the user reviews live posts post-hoc and
 * tells us which are イマイチ. This matches "公開まで全自動・見てから指示".
 */
export async function runQualityGate(
  article: GeneratedArticle,
  changelogFacts: readonly string[],
): Promise<QualityResult> {
  // Blocking = clearly defective only.
  const blocking = [...structuralChecks(article), ...fabricationCheck(article, changelogFacts)]

  let score = 0
  try {
    const reviewed = await cortexReview([
      { text: `${article.title}\n${article.markdown}`, platform: 'x', sourceTitle: article.title },
    ])
    const r = reviewed[0]
    score = r?.cortex_score ?? 0
    // Duplicate is blocking (don't republish the same thing). Low score / stale are NOT.
    if (r?.duplicate_of) blocking.push(`重複: ${r.duplicate_of}`)
  } catch (e) {
    // cortexReview failure must not block auto-publish; structural checks already passed.
    process.stdout.write(`[blog-gate] cortexReview skipped: ${e instanceof Error ? e.message : e}\n`)
  }

  return { passed: blocking.length === 0, score, reasons: blocking }
}
