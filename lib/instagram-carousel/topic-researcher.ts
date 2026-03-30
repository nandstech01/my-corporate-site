/**
 * Instagram Carousel Topic Researcher
 *
 * 選定トピックについてWeb検索で具体データを収集し、
 * Claude Haikuで構造化要約を生成する。
 *
 * データフロー:
 * TopicCandidate → Brave検索3クエリ → ページ内容取得 → Claude要約 → ResearchContext
 */

import Anthropic from '@anthropic-ai/sdk'
import { multiSearch } from '../web-search/brave'
import type { TopicCandidate } from './topic-selector'

// ============================================================
// Types
// ============================================================

export interface ResearchContext {
  readonly topic: string
  readonly keyFacts: readonly string[]
  readonly statistics: readonly string[]
  readonly examples: readonly string[]
  readonly sourceUrls: readonly string[]
}

// ============================================================
// Web Research
// ============================================================

function buildSearchQueries(topic: string): string[] {
  const base = topic.replace(/[「」『』（）\(\)]/g, '').trim()
  return [
    `${base} 最新 具体例 数値 2026`,
    `${base} 使い方 事例 活用`,
    `${base} 比較 メリット デメリット`,
  ]
}

async function fetchPageContent(url: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NANDS-Bot/1.0)' },
    })
    clearTimeout(timeout)

    if (!response.ok) return null

    const html = await response.text()
    // Strip HTML tags, scripts, styles
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    return text.slice(0, 3000) // limit to ~3000 chars per page
  } catch {
    return null
  }
}

// ============================================================
// Claude Haiku Summarization
// ============================================================

async function summarizeResearch(
  topic: string,
  searchResults: { title: string; description: string; pageContent: string | null }[],
  additionalContext: string,
): Promise<{ keyFacts: string[]; statistics: string[]; examples: string[] }> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    // Fallback: extract from search descriptions
    return {
      keyFacts: searchResults.slice(0, 5).map((r) => r.description.slice(0, 100)),
      statistics: [],
      examples: [],
    }
  }

  const client = new Anthropic({ apiKey })

  const searchContext = searchResults
    .slice(0, 5)
    .map((r) => {
      const content = r.pageContent ? `\n内容: ${r.pageContent.slice(0, 800)}` : ''
      return `■ ${r.title}\n概要: ${r.description}${content}`
    })
    .join('\n\n')

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `以下の検索結果から「${topic}」に関する情報を構造化して抽出してください。

${additionalContext ? `【追加コンテキスト】\n${additionalContext}\n\n` : ''}【検索結果】
${searchContext}

以下のJSON形式で出力してください:
{
  "keyFacts": ["具体的な事実1（出典示唆付き）", "具体的な事実2", ...],
  "statistics": ["数値データ1（例: 〜社の調査で85%が導入）", ...],
  "examples": ["具体事例1（企業名・ツール名付き）", ...]
}

ルール:
- keyFactsは5-8個、具体的で引用可能な事実のみ
- statisticsは数値を含むデータのみ（なければ空配列）
- examplesは実在の企業名・ツール名・サービス名を含む事例
- 推測や一般論は含めない
- JSON以外出力しない`,
      },
    ],
  })

  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    return { keyFacts: [], statistics: [], examples: [] }
  }

  try {
    const match = textBlock.text.match(/\{[\s\S]*\}/)
    if (!match) return { keyFacts: [], statistics: [], examples: [] }
    const parsed = JSON.parse(match[0])
    return {
      keyFacts: Array.isArray(parsed.keyFacts) ? parsed.keyFacts : [],
      statistics: Array.isArray(parsed.statistics) ? parsed.statistics : [],
      examples: Array.isArray(parsed.examples) ? parsed.examples : [],
    }
  } catch {
    return { keyFacts: [], statistics: [], examples: [] }
  }
}

// ============================================================
// Main Export
// ============================================================

export async function researchCarouselTopic(
  candidate: TopicCandidate,
): Promise<ResearchContext> {
  const topic = candidate.topic

  // Step 1: Build additional context from metadata
  let additionalContext = ''
  if (candidate.source === 'blog' && candidate.metadata.blogContent) {
    additionalContext = `【自社ブログ記事の内容】\n${candidate.metadata.blogContent.slice(0, 2000)}`
  }
  if (candidate.source === 'cortex') {
    const angles = candidate.metadata.unexploredAngles || []
    const points = candidate.metadata.keyDataPoints || []
    if (angles.length > 0 || points.length > 0) {
      additionalContext = [
        angles.length > 0 ? `【未探索の角度】\n${angles.join('\n')}` : '',
        points.length > 0 ? `【キーデータ】\n${points.join('\n')}` : '',
      ].filter(Boolean).join('\n\n')
    }
  }

  // Step 2: Web search
  const queries = buildSearchQueries(topic)
  process.stdout.write(`  Searching: ${queries.length} queries\n`)

  let searchResults: { title: string; url: string; description: string }[] = []
  try {
    const results = await multiSearch(queries, { count: 5, freshness: 'pm' }) // past month
    searchResults = [...results]
  } catch (e) {
    process.stdout.write(`  Search failed: ${e}\n`)
  }

  if (searchResults.length === 0 && !additionalContext) {
    // No research data at all
    return { topic, keyFacts: [], statistics: [], examples: [], sourceUrls: [] }
  }

  // Step 3: Fetch page content for top results
  process.stdout.write(`  Fetching ${Math.min(3, searchResults.length)} page contents...\n`)
  const enriched = await Promise.all(
    searchResults.slice(0, 3).map(async (r) => ({
      ...r,
      pageContent: await fetchPageContent(r.url),
    })),
  )
  // Add remaining without page content
  const allResults = [
    ...enriched,
    ...searchResults.slice(3).map((r) => ({ ...r, pageContent: null })),
  ]

  // Step 4: Summarize with Claude Haiku
  process.stdout.write('  Summarizing with Claude Haiku...\n')
  const summary = await summarizeResearch(topic, allResults, additionalContext)

  const sourceUrls = searchResults.slice(0, 5).map((r) => r.url)

  process.stdout.write(`  Research complete: ${summary.keyFacts.length} facts, ${summary.statistics.length} stats, ${summary.examples.length} examples\n`)

  return {
    topic,
    keyFacts: summary.keyFacts,
    statistics: summary.statistics,
    examples: summary.examples,
    sourceUrls,
  }
}
