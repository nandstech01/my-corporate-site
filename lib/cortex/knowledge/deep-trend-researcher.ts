/**
 * Deep Trend Researcher
 *
 * Goes beyond surface-level trend detection. Analyzes WHY a topic is trending,
 * what angles are unexplored, and what unique perspective nands.tech can offer.
 * This prevents being "just another tech commentary account".
 *
 * Flow:
 *   1. Collect trending data from buzz_posts + slack_bot_memory
 *   2. Extract and rank unique topics/themes
 *   3. Deep research via Brave Search (3 queries per topic)
 *   4. Claude analysis for strategic insight per topic
 *   5. Save results to cortex_viral_analysis + slack_bot_memory
 *   6. Slack notification with top 3 actionable topics
 */

import Anthropic from '@anthropic-ai/sdk'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { braveWebSearch } from '../../web-search/brave'

// ============================================================
// Types
// ============================================================

interface TopicAnalysis {
  readonly topic: string
  readonly maturity: 'emerging' | 'growing' | 'saturated'
  readonly what_everyone_says: readonly string[]
  readonly unexplored_angles: readonly string[]
  readonly japan_specific_angle: string
  readonly freshness_hours: number
  readonly recommended_content_types: readonly string[]
  readonly recommended_platforms: readonly string[]
  readonly key_data_points: readonly string[]
  readonly contrarian_take: string
}

interface RankedTopic {
  readonly keyword: string
  readonly aggregateBuzzScore: number
  readonly postCount: number
  readonly latestDate: string
  readonly sampleTexts: readonly string[]
}

interface BuzzPostRow {
  readonly post_text: string
  readonly buzz_score: number
  readonly post_date: string | null
  readonly created_at: string
}

interface ResearchResult {
  readonly title: string
  readonly url: string
  readonly description: string
  readonly pageContent: string | null
}

// ============================================================
// Constants
// ============================================================

const MAX_TOPICS = 5
const DELAY_BETWEEN_LLM_CALLS_MS = 2000
const LOG_PREFIX = '[deep-trend-researcher]'

const TOPIC_EXTRACTION_KEYWORDS: readonly string[] = [
  'claude', 'gpt', 'gemini', 'llm', 'ai agent', 'rag',
  'openai', 'anthropic', 'google', 'copilot', 'cursor',
  'fine-tuning', 'prompt', 'mcp', 'a2a', 'windsurf',
  'devin', 'sora', 'midjourney', 'stable diffusion',
  'claude code', 'chatgpt', 'perplexity',
]

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
// Step 1: Collect trending data from multiple sources
// ============================================================

async function fetchRecentBuzzPosts(): Promise<readonly BuzzPostRow[]> {
  const supabase = getSupabase()
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('buzz_posts')
    .select('post_text, buzz_score, post_date, created_at')
    .gte('created_at', since)
    .gt('buzz_score', 80)
    .order('buzz_score', { ascending: false })
    .limit(100)

  if (error) {
    process.stdout.write(
      `${LOG_PREFIX} Failed to fetch buzz_posts: ${error.message}\n`,
    )
    return []
  }

  return (data ?? []) as readonly BuzzPostRow[]
}

async function fetchLatestTrendingTopics(): Promise<string | null> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('slack_bot_memory')
    .select('content, context')
    .filter('context', 'cs', '{"trending_topics":true}')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    process.stdout.write(
      `${LOG_PREFIX} Failed to fetch trending topics from memory: ${error.message}\n`,
    )
    return null
  }

  return (data?.content as string) ?? null
}

// ============================================================
// Step 2: Extract and rank unique topics/themes
// ============================================================

function extractAndRankTopics(
  buzzPosts: readonly BuzzPostRow[],
  trendingContent: string | null,
): readonly RankedTopic[] {
  const topicMap = new Map<
    string,
    { buzzScoreSum: number; count: number; latestDate: string; texts: string[] }
  >()

  const allTexts = [
    ...buzzPosts.map((p) => ({
      text: p.post_text,
      score: p.buzz_score,
      date: p.post_date ?? p.created_at,
    })),
    ...(trendingContent
      ? [{ text: trendingContent, score: 50, date: new Date().toISOString() }]
      : []),
  ]

  for (const item of allTexts) {
    const lower = item.text.toLowerCase()

    for (const keyword of TOPIC_EXTRACTION_KEYWORDS) {
      if (lower.includes(keyword)) {
        const existing = topicMap.get(keyword)
        if (existing) {
          topicMap.set(keyword, {
            buzzScoreSum: existing.buzzScoreSum + item.score,
            count: existing.count + 1,
            latestDate:
              item.date > existing.latestDate ? item.date : existing.latestDate,
            texts:
              existing.texts.length < 3
                ? [...existing.texts, item.text.slice(0, 200)]
                : existing.texts,
          })
        } else {
          topicMap.set(keyword, {
            buzzScoreSum: item.score,
            count: 1,
            latestDate: item.date,
            texts: [item.text.slice(0, 200)],
          })
        }
      }
    }
  }

  const ranked: RankedTopic[] = []
  for (const [keyword, data] of Array.from(topicMap.entries())) {
    // Recency bonus: posts from last 6 hours get 2x weight
    const hoursAgo =
      (Date.now() - new Date(data.latestDate).getTime()) / (1000 * 60 * 60)
    const recencyMultiplier = hoursAgo < 6 ? 2.0 : hoursAgo < 12 ? 1.5 : 1.0

    ranked.push({
      keyword,
      aggregateBuzzScore: data.buzzScoreSum * recencyMultiplier,
      postCount: data.count,
      latestDate: data.latestDate,
      sampleTexts: data.texts,
    })
  }

  return ranked
    .sort((a, b) => b.aggregateBuzzScore - a.aggregateBuzzScore)
    .slice(0, MAX_TOPICS)
}

// ============================================================
// Step 3: Deep research via Brave Search
// ============================================================

async function fetchPageContent(url: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NandsTechBot/1.0)',
      },
    })

    clearTimeout(timeout)

    if (!response.ok) return null

    const html = await response.text()
    // Strip HTML tags, extract text, limit to 2000 chars
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 2000)

    return text.length > 50 ? text : null
  } catch {
    return null
  }
}

async function deepResearchTopic(
  topic: string,
): Promise<readonly ResearchResult[]> {
  const queries = [
    `${topic} 最新`,
    `${topic} analysis`,
    `${topic} Japan impact`,
  ]

  const results: ResearchResult[] = []

  for (const query of queries) {
    try {
      const searchResults = await braveWebSearch(query, {
        count: 5,
        freshness: 'pw',
      })

      for (const r of searchResults) {
        const pageContent = await fetchPageContent(r.url)
        results.push({
          title: r.title,
          url: r.url,
          description: r.description,
          pageContent,
        })
      }
    } catch (err) {
      process.stdout.write(
        `${LOG_PREFIX} Brave search failed for "${query}": ${err instanceof Error ? err.message : String(err)}\n`,
      )
    }

    // Rate limit buffer between search queries
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  return results
}

// ============================================================
// Step 4: Claude analysis for strategic insight
// ============================================================

async function analyzeTopicWithClaude(
  topic: RankedTopic,
  researchData: readonly ResearchResult[],
): Promise<TopicAnalysis | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    process.stdout.write(`${LOG_PREFIX} ANTHROPIC_API_KEY not configured\n`)
    return null
  }

  const anthropic = new Anthropic({ apiKey })

  const researchSummary = researchData
    .map(
      (r) =>
        `Title: ${r.title}\nURL: ${r.url}\nDescription: ${r.description}\n${r.pageContent ? `Content: ${r.pageContent.slice(0, 500)}` : ''}`,
    )
    .join('\n---\n')

  const samplePostsText = topic.sampleTexts.join('\n---\n')

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    system:
      'You are a trend analyst for a Japanese AI/tech company (nands.tech). Analyze this trending topic and provide strategic insight for content creation. The company specializes in AI integration, Claude Code, and digital transformation.',
    messages: [
      {
        role: 'user',
        content: `Analyze the following trending topic deeply and return strategic insight.

Topic: "${topic.keyword}"
Buzz Score (aggregate): ${topic.aggregateBuzzScore}
Post Count (24h): ${topic.postCount}
Latest Activity: ${topic.latestDate}

Sample buzz posts mentioning this topic:
${samplePostsText}

Research data (Brave Search results + page content):
${researchSummary}

Return a JSON object with exactly these fields:
{
  "topic": "clean topic name (string)",
  "maturity": "emerging" | "growing" | "saturated",
  "what_everyone_says": ["common take 1", "common take 2", "common take 3"],
  "unexplored_angles": ["angle 1", "angle 2", "angle 3"],
  "japan_specific_angle": "unique angle for Japanese market",
  "freshness_hours": number (how many hours until this becomes stale),
  "recommended_content_types": ["thread", "article", etc.],
  "recommended_platforms": ["x", "linkedin", etc.],
  "key_data_points": ["specific number/fact 1", "specific number/fact 2"],
  "contrarian_take": "a bold/controversial but defensible take"
}

Return ONLY the JSON object, no markdown fences or extra text.`,
      },
    ],
  })

  const text = response.content.find(
    (b): b is Anthropic.Messages.TextBlock => b.type === 'text',
  )

  if (!text?.text) return null

  try {
    const jsonMatch = text.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>

    return {
      topic: String(parsed.topic ?? topic.keyword),
      maturity: (['emerging', 'growing', 'saturated'].includes(
        parsed.maturity as string,
      )
        ? parsed.maturity
        : 'growing') as TopicAnalysis['maturity'],
      what_everyone_says: Array.isArray(parsed.what_everyone_says)
        ? (parsed.what_everyone_says as string[]).slice(0, 3)
        : [],
      unexplored_angles: Array.isArray(parsed.unexplored_angles)
        ? (parsed.unexplored_angles as string[]).slice(0, 3)
        : [],
      japan_specific_angle: String(parsed.japan_specific_angle ?? ''),
      freshness_hours: Number(parsed.freshness_hours) || 24,
      recommended_content_types: Array.isArray(parsed.recommended_content_types)
        ? (parsed.recommended_content_types as string[])
        : [],
      recommended_platforms: Array.isArray(parsed.recommended_platforms)
        ? (parsed.recommended_platforms as string[])
        : [],
      key_data_points: Array.isArray(parsed.key_data_points)
        ? (parsed.key_data_points as string[])
        : [],
      contrarian_take: String(parsed.contrarian_take ?? ''),
    }
  } catch (err) {
    process.stdout.write(
      `${LOG_PREFIX} Failed to parse Claude response for "${topic.keyword}": ${err instanceof Error ? err.message : String(err)}\n`,
    )
    return null
  }
}

// ============================================================
// Step 5: Save analysis results
// ============================================================

async function saveAnalysisToDb(analysis: TopicAnalysis): Promise<void> {
  const supabase = getSupabase()

  // Insert into cortex_viral_analysis
  const primaryPlatform = analysis.recommended_platforms[0] ?? 'x'

  const { error: insertError } = await supabase
    .from('cortex_viral_analysis')
    .insert({
      platform: primaryPlatform,
      original_text: JSON.stringify({
        topic: analysis.topic,
        maturity: analysis.maturity,
        what_everyone_says: analysis.what_everyone_says,
        unexplored_angles: analysis.unexplored_angles,
        japan_specific_angle: analysis.japan_specific_angle,
        key_data_points: analysis.key_data_points,
        contrarian_take: analysis.contrarian_take,
      }),
      hook_type: 'trend_analysis',
      structure_type: analysis.maturity,
      emotional_trigger: analysis.contrarian_take.slice(0, 100),
      novelty_score:
        analysis.maturity === 'emerging'
          ? 0.9
          : analysis.maturity === 'growing'
            ? 0.6
            : 0.3,
      information_density: 0.8,
      likes: 0,
      reposts: 0,
      replies: 0,
      impressions: 0,
      engagement_rate: 0,
      primary_buzz_factor: `trend_${analysis.maturity}`,
      secondary_factors: [...analysis.recommended_content_types],
      analyzed_by: 'cortex-trend-researcher',
    })

  if (insertError) {
    process.stdout.write(
      `${LOG_PREFIX} Failed to save to cortex_viral_analysis: ${insertError.message}\n`,
    )
  }
}

async function saveAnalysisSummaryToMemory(
  analyses: readonly TopicAnalysis[],
): Promise<void> {
  const supabase = getSupabase()

  const summaryLines = analyses.map(
    (a) =>
      `[${a.maturity.toUpperCase()}] ${a.topic}: ${a.unexplored_angles[0] ?? 'N/A'} (${a.freshness_hours}h freshness)`,
  )

  const { error } = await supabase.from('slack_bot_memory').insert({
    memory_type: 'fact',
    importance: 0.9,
    content: `Deep Trend Analysis:\n${summaryLines.join('\n')}`,
    context: {
      source: 'cortex_deep_trend',
      topics_analyzed: analyses.length,
      timestamp: new Date().toISOString(),
    },
  })

  if (error) {
    process.stdout.write(
      `${LOG_PREFIX} Failed to save to slack_bot_memory: ${error.message}\n`,
    )
  }
}

// ============================================================
// Step 6: Slack notification
// ============================================================

async function sendSlackNotification(
  analyses: readonly TopicAnalysis[],
): Promise<void> {
  const slackToken = process.env.SLACK_BOT_TOKEN
  const channel = process.env.SLACK_DEFAULT_CHANNEL

  if (!slackToken || !channel) {
    process.stdout.write(
      `${LOG_PREFIX} Slack not configured, skipping notification\n`,
    )
    return
  }

  const top3 = analyses.slice(0, 3)

  const topicBlocks = top3.map((a) => {
    const maturityEmoji =
      a.maturity === 'emerging'
        ? '🟢'
        : a.maturity === 'growing'
          ? '🟡'
          : '🔴'
    const urgency =
      a.freshness_hours <= 6
        ? '⚡ URGENT'
        : a.freshness_hours <= 12
          ? '🕐 Soon'
          : '📅 Flexible'

    return [
      `${maturityEmoji} *${a.topic}* (${a.maturity})`,
      `  Freshness: ${a.freshness_hours}h ${urgency}`,
      `  Unexplored: ${a.unexplored_angles[0] ?? 'N/A'}`,
      `  Japan angle: ${a.japan_specific_angle}`,
      `  Action: ${a.recommended_content_types.join(', ')} on ${a.recommended_platforms.join(', ')}`,
      `  Contrarian: ${a.contrarian_take}`,
    ].join('\n')
  })

  const text = [
    '🔬 *Deep Trend Research Complete*',
    `Analyzed ${analyses.length} topics\n`,
    ...topicBlocks,
  ].join('\n\n')

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
        mrkdwn: true,
      }),
    })
  } catch (err) {
    process.stdout.write(
      `${LOG_PREFIX} Slack notification failed: ${err instanceof Error ? err.message : String(err)}\n`,
    )
  }
}

// ============================================================
// Utility
// ============================================================

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ============================================================
// Main Export
// ============================================================

export async function runDeepTrendResearcher(): Promise<void> {
  process.stdout.write(`${LOG_PREFIX} Starting deep trend research...\n`)

  // Step 1: Collect data from multiple sources
  process.stdout.write(`${LOG_PREFIX} Collecting trending data...\n`)
  const [buzzPosts, trendingContent] = await Promise.all([
    fetchRecentBuzzPosts(),
    fetchLatestTrendingTopics(),
  ])

  process.stdout.write(
    `${LOG_PREFIX} Collected ${buzzPosts.length} buzz posts, trending content: ${trendingContent ? 'found' : 'none'}\n`,
  )

  if (buzzPosts.length === 0 && !trendingContent) {
    process.stdout.write(
      `${LOG_PREFIX} No trending data found, aborting\n`,
    )
    return
  }

  // Step 2: Extract and rank topics
  const rankedTopics = extractAndRankTopics(buzzPosts, trendingContent)
  process.stdout.write(
    `${LOG_PREFIX} Extracted ${rankedTopics.length} topics: ${rankedTopics.map((t) => t.keyword).join(', ')}\n`,
  )

  if (rankedTopics.length === 0) {
    process.stdout.write(`${LOG_PREFIX} No topics extracted, aborting\n`)
    return
  }

  // Steps 3-5: Process each topic sequentially
  const completedAnalyses: TopicAnalysis[] = []

  for (const topic of rankedTopics) {
    process.stdout.write(
      `${LOG_PREFIX} Researching "${topic.keyword}" (buzz: ${topic.aggregateBuzzScore})...\n`,
    )

    try {
      // Step 3: Deep research via Brave Search
      const researchData = await deepResearchTopic(topic.keyword)
      process.stdout.write(
        `${LOG_PREFIX} Found ${researchData.length} research results for "${topic.keyword}"\n`,
      )

      // Step 4: Claude analysis
      await delay(DELAY_BETWEEN_LLM_CALLS_MS)
      const analysis = await analyzeTopicWithClaude(topic, researchData)

      if (analysis) {
        completedAnalyses.push(analysis)

        // Step 5a: Save to cortex_viral_analysis
        await saveAnalysisToDb(analysis)
        process.stdout.write(
          `${LOG_PREFIX} Saved analysis for "${analysis.topic}" (${analysis.maturity})\n`,
        )
      } else {
        process.stdout.write(
          `${LOG_PREFIX} Analysis failed for "${topic.keyword}", continuing...\n`,
        )
      }
    } catch (err) {
      process.stdout.write(
        `${LOG_PREFIX} Error processing "${topic.keyword}": ${err instanceof Error ? err.message : String(err)}\n`,
      )
      // Continue with remaining topics
    }
  }

  if (completedAnalyses.length === 0) {
    process.stdout.write(
      `${LOG_PREFIX} No analyses completed successfully\n`,
    )
    return
  }

  // Step 5b: Save summary to slack_bot_memory
  await saveAnalysisSummaryToMemory(completedAnalyses)

  // Step 6: Slack notification
  await sendSlackNotification(completedAnalyses)

  process.stdout.write(
    `${LOG_PREFIX} Done! Analyzed ${completedAnalyses.length}/${rankedTopics.length} topics successfully\n`,
  )
}
