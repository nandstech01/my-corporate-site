/**
 * Platform Rule Collector
 *
 * Automatically collects and updates platform algorithm rules,
 * content policies, and best practices from official sources.
 * Gives Claude Code real, up-to-date knowledge about how each platform works.
 *
 * Flow:
 *   1. Brave Search for platform-specific algorithm/policy articles
 *   2. Fetch article content (lightweight HTML text extraction)
 *   3. Claude analyzes and extracts structured rules
 *   4. UPSERT into cortex_platform_rules
 *   5. Slack notification on changes
 *   6. Log to cortex_conversation_log
 */

import Anthropic from '@anthropic-ai/sdk'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { braveWebSearch } from '../../web-search/brave'
import type {
  Platform,
  RuleCategory,
  SourceType,
} from '../types'

// ============================================================
// Constants
// ============================================================

const MAX_ARTICLES_PER_QUERY = 5
const LOG_PREFIX = '[platform-rule-collector]'

interface PlatformSearchConfig {
  readonly platform: Platform
  readonly queries: readonly string[]
}

const PLATFORM_SEARCHES: readonly PlatformSearchConfig[] = [
  {
    platform: 'x',
    queries: [
      'X Twitter algorithm ranking 2025 2026',
      'Twitter API rate limits developer',
      'X content policy update',
    ],
  },
  {
    platform: 'linkedin',
    queries: [
      'LinkedIn algorithm feed ranking',
      'LinkedIn API posting limits',
      'LinkedIn content best practices official',
    ],
  },
  {
    platform: 'threads',
    queries: [
      'Threads Meta algorithm ranking',
      'Threads API limitations',
      'Threads content policy',
    ],
  },
  {
    platform: 'instagram',
    queries: [
      'Instagram Reels algorithm 2025 2026',
      'Instagram API Graph limitations',
      'Instagram content guidelines',
    ],
  },
]

// ============================================================
// Types
// ============================================================

interface ExtractedRule {
  readonly rule_category: RuleCategory
  readonly rule_title: string
  readonly rule_description: string
  readonly source_type: SourceType
  readonly confidence: number
}

interface SearchArticle {
  readonly title: string
  readonly url: string
  readonly description: string
  readonly content: string
}

interface UpsertResult {
  readonly inserted: number
  readonly updated: number
}

// ============================================================
// Supabase Client
// ============================================================

let cachedSupabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (cachedSupabase) return cachedSupabase

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  }

  cachedSupabase = createClient(url, key)
  return cachedSupabase
}

// ============================================================
// Step 1: Search for articles per platform
// ============================================================

async function searchPlatformArticles(
  config: PlatformSearchConfig,
): Promise<readonly SearchArticle[]> {
  const articles: SearchArticle[] = []
  const seenUrls = new Set<string>()

  for (const query of config.queries) {
    try {
      const results = await braveWebSearch(query, { count: MAX_ARTICLES_PER_QUERY })

      for (const r of results) {
        if (seenUrls.has(r.url)) continue
        seenUrls.add(r.url)

        // Fetch article content (best-effort)
        const content = await fetchArticleContent(r.url)

        articles.push({
          title: r.title,
          url: r.url,
          description: r.description,
          content,
        })
      }
    } catch (e) {
      console.log(`${LOG_PREFIX} Search query failed: "${query}" — ${e}`)
    }

    // Rate limit buffer between queries
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  return articles
}

// ============================================================
// Step 2: Fetch article content (lightweight)
// ============================================================

async function fetchArticleContent(url: string): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CortexBot/1.0)',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: controller.signal,
      redirect: 'follow',
    })

    if (!response.ok) return ''

    const html = await response.text()

    // Lightweight text extraction: strip tags, collapse whitespace
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim()

    // Truncate to ~4000 chars to stay within token limits
    return text.slice(0, 4000)
  } catch {
    return ''
  } finally {
    clearTimeout(timeout)
  }
}

// ============================================================
// Step 3: Analyze articles with Claude
// ============================================================

async function analyzeArticles(
  platform: Platform,
  articles: readonly SearchArticle[],
): Promise<readonly ExtractedRule[]> {
  if (articles.length === 0) return []

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  const articleSummaries = articles
    .map((a, i) => {
      const contentPreview = a.content
        ? `\nContent: ${a.content.slice(0, 1500)}`
        : ''
      return `[${i}] Title: ${a.title}\nURL: ${a.url}\nDescription: ${a.description}${contentPreview}`
    })
    .join('\n\n---\n\n')

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `Analyze the following articles about ${platform} platform and extract actionable rules for content creators and API developers.

Articles:
${articleSummaries}

For each distinct rule you find, extract:
- rule_category: one of "algorithm", "content_policy", "best_practice", "rate_limit", "format", "monetization"
- rule_title: concise title (max 80 chars)
- rule_description: detailed explanation with specifics (numbers, thresholds, etc.)
- source_type: one of "official_doc", "official_blog", "api_changelog", "verified_experiment", "community_consensus"
  - Use "official_doc" or "official_blog" only for content directly from the platform company
  - Use "api_changelog" for API documentation changes
  - Use "verified_experiment" for data-backed findings from credible sources
  - Use "community_consensus" for widely-agreed best practices
- confidence: 0-1 float (1.0 for official docs, 0.8 for verified experiments, 0.5-0.7 for community consensus)

Return ONLY a JSON array of rules. No markdown, no explanation. Example:
[
  {
    "rule_category": "algorithm",
    "rule_title": "Reply engagement boosts visibility",
    "rule_description": "Posts that receive replies within the first 30 minutes get 2x visibility in the feed algorithm.",
    "source_type": "verified_experiment",
    "confidence": 0.8
  }
]

If no actionable rules found, return an empty array: []`,
      },
    ],
  })

  const text = response.content.find(
    (b): b is Anthropic.Messages.TextBlock => b.type === 'text',
  )

  try {
    const jsonMatch = (text?.text ?? '').match(/\[[\s\S]*\]/)
    const parsed = JSON.parse(jsonMatch?.[0] ?? '[]') as readonly ExtractedRule[]

    // Validate each rule has required fields
    return parsed.filter(
      (r) =>
        r.rule_category &&
        r.rule_title &&
        r.rule_description &&
        r.source_type &&
        typeof r.confidence === 'number',
    )
  } catch {
    console.log(`${LOG_PREFIX} Failed to parse Claude response for ${platform}`)
    return []
  }
}

// ============================================================
// Step 4: UPSERT rules into cortex_platform_rules
// ============================================================

async function upsertRules(
  platform: Platform,
  rules: readonly ExtractedRule[],
  sourceArticles: readonly SearchArticle[],
): Promise<UpsertResult> {
  if (rules.length === 0) return { inserted: 0, updated: 0 }

  const supabase = getSupabase()
  let inserted = 0
  let updated = 0

  for (const rule of rules) {
    // Find the best matching source URL
    const sourceUrl = sourceArticles[0]?.url ?? null

    // Check if rule already exists
    const { data: existing } = await supabase
      .from('cortex_platform_rules')
      .select('id, rule_description, confidence')
      .eq('platform', platform)
      .eq('rule_title', rule.rule_title)
      .limit(1)
      .single()

    if (existing) {
      // Update only if description changed or confidence improved
      const descriptionChanged = existing.rule_description !== rule.rule_description
      const confidenceImproved = rule.confidence > (existing.confidence ?? 0)

      if (descriptionChanged || confidenceImproved) {
        const { error } = await supabase
          .from('cortex_platform_rules')
          .update({
            rule_description: rule.rule_description,
            rule_category: rule.rule_category,
            source_type: rule.source_type,
            source_url: sourceUrl,
            confidence: Math.max(rule.confidence, existing.confidence ?? 0),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)

        if (!error) updated++
      }
    } else {
      // Insert new rule
      const { error } = await supabase.from('cortex_platform_rules').insert({
        platform,
        rule_category: rule.rule_category,
        rule_title: rule.rule_title,
        rule_description: rule.rule_description,
        source_url: sourceUrl,
        source_type: rule.source_type,
        confidence: rule.confidence,
        verified_by_data: false,
      })

      if (!error) inserted++
    }
  }

  return { inserted, updated }
}

// ============================================================
// Step 5: Slack notification on changes
// ============================================================

async function notifySlack(
  results: ReadonlyMap<Platform, UpsertResult>,
): Promise<void> {
  const slackToken = process.env.SLACK_BOT_TOKEN
  const channel = process.env.SLACK_DEFAULT_CHANNEL
  if (!slackToken || !channel) return

  const changedPlatforms = Array.from(results.entries()).filter(
    ([, r]) => r.inserted > 0 || r.updated > 0,
  )

  if (changedPlatforms.length === 0) return

  const lines = changedPlatforms.map(
    ([platform, r]) =>
      `• *${platform}*: ${r.inserted} new, ${r.updated} updated`,
  )

  const text = `📋 *Platform Rules Updated*\n\n${lines.join('\n')}`

  try {
    await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${slackToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel,
        text,
        blocks: [
          {
            type: 'section',
            text: { type: 'mrkdwn', text },
          },
        ],
      }),
    })
  } catch (e) {
    console.log(`${LOG_PREFIX} Slack notification failed: ${e}`)
  }
}

// ============================================================
// Step 6: Log to cortex_conversation_log
// ============================================================

async function logToConversationLog(
  results: ReadonlyMap<Platform, UpsertResult>,
): Promise<void> {
  const supabase = getSupabase()

  const totalInserted = Array.from(results.values()).reduce((sum, r) => sum + r.inserted, 0)
  const totalUpdated = Array.from(results.values()).reduce((sum, r) => sum + r.updated, 0)

  if (totalInserted === 0 && totalUpdated === 0) return

  const affectedPlatforms = Array.from(results.entries())
    .filter(([, r]) => r.inserted > 0 || r.updated > 0)
    .map(([platform]) => platform)

  const summary = `Platform rule collection: ${totalInserted} new rules, ${totalUpdated} updated rules across ${affectedPlatforms.join(', ')}`

  try {
    await supabase.from('cortex_conversation_log').insert({
      channel: 'slack',
      conversation_type: 'guideline_update',
      summary,
      affected_platforms: affectedPlatforms,
      priority: totalInserted > 5 ? 'high' : 'medium',
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
  } catch (e) {
    console.log(`${LOG_PREFIX} Failed to log conversation: ${e}`)
  }
}

// ============================================================
// Main Export
// ============================================================

export async function runPlatformRuleCollector(): Promise<void> {
  console.log(`${LOG_PREFIX} Starting platform rule collection...`)

  const results = new Map<Platform, UpsertResult>()

  for (const config of PLATFORM_SEARCHES) {
    console.log(`${LOG_PREFIX} Processing ${config.platform}...`)

    try {
      // Search for articles
      console.log(`${LOG_PREFIX} [${config.platform}] Searching articles...`)
      const articles = await searchPlatformArticles(config)
      console.log(`${LOG_PREFIX} [${config.platform}] Found ${articles.length} articles`)

      if (articles.length === 0) {
        results.set(config.platform, { inserted: 0, updated: 0 })
        continue
      }

      // Analyze with Claude
      console.log(`${LOG_PREFIX} [${config.platform}] Analyzing with Claude...`)
      const rules = await analyzeArticles(config.platform, articles)
      console.log(`${LOG_PREFIX} [${config.platform}] Extracted ${rules.length} rules`)

      // UPSERT into database
      console.log(`${LOG_PREFIX} [${config.platform}] Upserting rules...`)
      const result = await upsertRules(config.platform, rules, articles)
      results.set(config.platform, result)
      console.log(
        `${LOG_PREFIX} [${config.platform}] Done: ${result.inserted} inserted, ${result.updated} updated`,
      )
    } catch (e) {
      console.log(`${LOG_PREFIX} [${config.platform}] Failed: ${e}`)
      results.set(config.platform, { inserted: 0, updated: 0 })
    }

    // Rate limit buffer between platforms
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  // Notify Slack if any changes
  await notifySlack(results)

  // Log to conversation log
  await logToConversationLog(results)

  const totalInserted = Array.from(results.values()).reduce((sum, r) => sum + r.inserted, 0)
  const totalUpdated = Array.from(results.values()).reduce((sum, r) => sum + r.updated, 0)
  console.log(
    `${LOG_PREFIX} Complete. Total: ${totalInserted} new, ${totalUpdated} updated rules.`,
  )
}
