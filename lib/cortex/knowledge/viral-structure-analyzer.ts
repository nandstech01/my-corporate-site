/**
 * Viral Structure Analyzer
 *
 * Analyzes WHY posts go viral by combining deterministic pattern extraction
 * (from pattern-extractor) with deep LLM analysis (Anthropic Claude).
 *
 * This is what separates CORTEX from "just tracking metrics".
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { analyzeSinglePost } from '@/lib/buzz-db/pattern-extractor'
import type { CortexViralAnalysis } from '../types'
import {
  sendMessage,
  SLACK_GENERAL_CHANNEL_ID,
} from '@/lib/slack-bot/slack-client'

// ============================================================
// Constants
// ============================================================

const BUZZ_SCORE_THRESHOLD = 100
const MAX_POSTS_PER_RUN = 20
const LOOKBACK_DAYS = 7
const LLM_DELAY_MS = 1000
const MEMORY_IMPORTANCE = 0.85

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
// Anthropic Client
// ============================================================

let cachedAnthropic: Anthropic | null = null

function getAnthropic(): Anthropic {
  if (cachedAnthropic) return cachedAnthropic

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is required')
  }

  cachedAnthropic = new Anthropic({ apiKey })
  return cachedAnthropic
}

// ============================================================
// Types
// ============================================================

interface BuzzPostRow {
  readonly id: string
  readonly platform: string
  readonly post_text: string
  readonly author_handle: string | null
  readonly likes: number
  readonly reposts: number
  readonly replies: number
  readonly impressions: number
  readonly buzz_score: number
}

interface LLMAnalysisResult {
  readonly emotional_trigger: string
  readonly information_density: number
  readonly novelty_score: number
  readonly authority_signal: string
  readonly controversy_level: number
  readonly actionability: number
  readonly primary_buzz_factor: string
  readonly secondary_factors: string[]
  readonly anti_patterns: string[]
  readonly replicability_score: number
}

// ============================================================
// Data Fetching
// ============================================================

async function fetchHighScoreBuzzPosts(): Promise<readonly BuzzPostRow[]> {
  const supabase = getSupabase()
  const since = new Date(
    Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString()

  const { data, error } = await supabase
    .from('buzz_posts')
    .select(
      'id, platform, post_text, author_handle, likes, reposts, replies, impressions, buzz_score',
    )
    .gt('buzz_score', BUZZ_SCORE_THRESHOLD)
    .gte('collected_at', since)
    .order('buzz_score', { ascending: false })
    .limit(30)

  if (error) {
    throw new Error(`Failed to fetch buzz posts: ${error.message}`)
  }

  return (data ?? []) as readonly BuzzPostRow[]
}

async function isAlreadyAnalyzed(originalText: string): Promise<boolean> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('cortex_viral_analysis')
    .select('id')
    .eq('original_text', originalText)
    .limit(1)

  if (error) {
    process.stdout.write(
      `viral-structure-analyzer: check existing analysis failed: ${error.message}\n`,
    )
    return false
  }

  return (data ?? []).length > 0
}

// ============================================================
// LLM Deep Analysis
// ============================================================

async function runLLMAnalysis(postText: string): Promise<LLMAnalysisResult> {
  const anthropic = getAnthropic()

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system:
      'You are a viral content analyst. Analyze this social media post that achieved high engagement and explain WHY it went viral. Be specific and data-driven. Respond ONLY with valid JSON, no markdown fences.',
    messages: [
      {
        role: 'user',
        content: `Analyze this viral post and return a JSON object with these exact fields:

- emotional_trigger: The primary emotion triggered (one of: surprise, anger, empathy, fear, hope, curiosity, pride)
- information_density: Score 0-1 (how much new information per character)
- novelty_score: Score 0-1 (how new/unexpected is this perspective)
- authority_signal: What gives this post credibility (numbers, credentials, experience, data)
- controversy_level: Score 0-1 (how much it challenges conventional wisdom)
- actionability: Score 0-1 (can the reader immediately do something with this)
- primary_buzz_factor: One sentence explaining the main reason it went viral
- secondary_factors: Array of 2-3 contributing factors
- anti_patterns: Array of things about this post that should NOT be copied
- replicability_score: Score 0-1 (how easily can someone recreate this success pattern)

Post text:
"""
${postText}
"""`,
      },
    ],
  })

  const textBlock = response.content.find((block) => block.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from LLM')
  }

  const parsed = JSON.parse(textBlock.text) as LLMAnalysisResult

  return {
    emotional_trigger: parsed.emotional_trigger ?? 'curiosity',
    information_density: clampScore(parsed.information_density),
    novelty_score: clampScore(parsed.novelty_score),
    authority_signal: parsed.authority_signal ?? 'unknown',
    controversy_level: clampScore(parsed.controversy_level),
    actionability: clampScore(parsed.actionability),
    primary_buzz_factor: parsed.primary_buzz_factor ?? 'unknown',
    secondary_factors: Array.isArray(parsed.secondary_factors)
      ? parsed.secondary_factors.slice(0, 3)
      : [],
    anti_patterns: Array.isArray(parsed.anti_patterns)
      ? parsed.anti_patterns
      : [],
    replicability_score: clampScore(parsed.replicability_score),
  }
}

function clampScore(value: unknown): number {
  const num = typeof value === 'number' ? value : 0
  return Math.max(0, Math.min(1, num))
}

// ============================================================
// Analysis Pipeline
// ============================================================

interface AnalysisRunResult {
  readonly analyzedCount: number
  readonly skippedCount: number
  readonly topPatterns: readonly string[]
  readonly errors: readonly string[]
}

async function analyzePost(
  post: BuzzPostRow,
): Promise<Omit<CortexViralAnalysis, 'id' | 'analyzed_at'> | null> {
  const alreadyDone = await isAlreadyAnalyzed(post.post_text)
  if (alreadyDone) return null

  // Deterministic analysis from pattern-extractor
  const pattern = analyzeSinglePost(post.post_text)
  const hookType = pattern.hookType
  const structureType = pattern.structureType
  const closingType = pattern.closingType
  const emojiCount = pattern.emojiCount
  const hashtagCount = pattern.hashtagCount
  const charLength = pattern.length

  // Deep LLM analysis
  const llmResult = await runLLMAnalysis(post.post_text)

  const engagementRate =
    post.impressions > 0
      ? (post.likes + post.reposts + post.replies) / post.impressions
      : 0

  return {
    buzz_post_id: post.id,
    platform: post.platform,
    original_text: post.post_text,
    author_handle: post.author_handle,
    hook_type: hookType,
    structure_type: structureType,
    closing_type: closingType,
    emoji_count: emojiCount,
    hashtag_count: hashtagCount,
    char_length: charLength,
    emotional_trigger: llmResult.emotional_trigger,
    information_density: llmResult.information_density,
    novelty_score: llmResult.novelty_score,
    authority_signal: llmResult.authority_signal,
    controversy_level: llmResult.controversy_level,
    actionability: llmResult.actionability,
    likes: post.likes,
    reposts: post.reposts,
    replies: post.replies,
    impressions: post.impressions,
    engagement_rate: engagementRate,
    primary_buzz_factor: llmResult.primary_buzz_factor,
    secondary_factors: llmResult.secondary_factors,
    anti_patterns: llmResult.anti_patterns,
    replicability_score: llmResult.replicability_score,
    analyzed_by: 'cortex_viral_analyzer',
  }
}

async function insertAnalysis(
  analysis: Omit<CortexViralAnalysis, 'id' | 'analyzed_at'>,
): Promise<void> {
  const supabase = getSupabase()

  const { error } = await supabase
    .from('cortex_viral_analysis')
    .insert(analysis)

  if (error) {
    throw new Error(
      `Failed to insert viral analysis: ${error.message}`,
    )
  }
}

async function saveSummaryToMemory(
  result: AnalysisRunResult,
): Promise<void> {
  const supabase = getSupabase()

  const content = [
    `Viral structure analysis completed: ${result.analyzedCount} posts analyzed.`,
    result.topPatterns.length > 0
      ? `Top patterns: ${result.topPatterns.join(', ')}.`
      : '',
    result.skippedCount > 0
      ? `${result.skippedCount} posts already analyzed (skipped).`
      : '',
  ]
    .filter(Boolean)
    .join(' ')

  const { error } = await supabase.from('slack_bot_memory').insert({
    memory_type: 'fact',
    importance: MEMORY_IMPORTANCE,
    content,
    context: {
      source: 'cortex_viral_analyzer',
      analyzed_count: result.analyzedCount,
      top_patterns: result.topPatterns,
    },
  })

  if (error) {
    process.stdout.write(
      `viral-structure-analyzer: failed to save memory: ${error.message}\n`,
    )
  }
}

async function sendSlackSummary(
  result: AnalysisRunResult,
): Promise<void> {
  if (!SLACK_GENERAL_CHANNEL_ID) {
    process.stdout.write(
      'viral-structure-analyzer: no Slack channel configured, skipping notification\n',
    )
    return
  }

  const lines = [
    `*CORTEX Viral Analysis Complete*`,
    `Posts analyzed: ${result.analyzedCount}`,
    `Posts skipped (already analyzed): ${result.skippedCount}`,
  ]

  if (result.topPatterns.length > 0) {
    lines.push(`Top patterns found: ${result.topPatterns.join(', ')}`)
  }

  if (result.errors.length > 0) {
    lines.push(`Errors: ${result.errors.length}`)
  }

  try {
    await sendMessage({
      channel: SLACK_GENERAL_CHANNEL_ID,
      text: lines.join('\n'),
    })
  } catch (err) {
    process.stdout.write(
      `viral-structure-analyzer: failed to send Slack notification: ${err}\n`,
    )
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ============================================================
// Main Entry Point
// ============================================================

export async function runViralStructureAnalyzer(): Promise<AnalysisRunResult> {
  process.stdout.write('viral-structure-analyzer: starting analysis run\n')

  const posts = await fetchHighScoreBuzzPosts()
  process.stdout.write(
    `viral-structure-analyzer: found ${posts.length} high-score posts\n`,
  )

  let analyzedCount = 0
  let skippedCount = 0
  const errors: string[] = []
  const emotionalTriggers: string[] = []
  const hookTypes: string[] = []

  const postsToProcess = posts.slice(0, MAX_POSTS_PER_RUN)

  for (const post of postsToProcess) {
    try {
      const analysis = await analyzePost(post)

      if (!analysis) {
        skippedCount += 1
        continue
      }

      await insertAnalysis(analysis)
      analyzedCount += 1

      if (analysis.emotional_trigger) {
        emotionalTriggers.push(analysis.emotional_trigger)
      }
      if (analysis.hook_type) {
        hookTypes.push(analysis.hook_type)
      }

      process.stdout.write(
        `viral-structure-analyzer: analyzed post ${analyzedCount}/${postsToProcess.length} (buzz_score: ${post.buzz_score})\n`,
      )

      // Rate limit LLM calls
      if (analyzedCount < postsToProcess.length) {
        await sleep(LLM_DELAY_MS)
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : String(err)
      errors.push(`Post ${post.id}: ${message}`)
      process.stdout.write(
        `viral-structure-analyzer: error analyzing post ${post.id}: ${message}\n`,
      )
    }
  }

  // Build top patterns from frequency counts
  const topPatterns = buildTopPatterns(emotionalTriggers, hookTypes)

  const result: AnalysisRunResult = {
    analyzedCount,
    skippedCount,
    topPatterns,
    errors,
  }

  // Save summary to memory and notify Slack
  if (analyzedCount > 0) {
    await saveSummaryToMemory(result)
  }

  await sendSlackSummary(result)

  process.stdout.write(
    `viral-structure-analyzer: completed. analyzed=${analyzedCount}, skipped=${skippedCount}, errors=${errors.length}\n`,
  )

  return result
}

// ============================================================
// Helpers
// ============================================================

function buildTopPatterns(
  emotionalTriggers: readonly string[],
  hookTypes: readonly string[],
): readonly string[] {
  const triggerCounts = countFrequency(emotionalTriggers)
  const hookCounts = countFrequency(hookTypes)

  const patterns: string[] = []

  const topTrigger = triggerCounts[0]
  if (topTrigger) {
    patterns.push(`emotion:${topTrigger.value}(${topTrigger.count})`)
  }

  const topHook = hookCounts[0]
  if (topHook) {
    patterns.push(`hook:${topHook.value}(${topHook.count})`)
  }

  // Add second-most-common if present
  const secondTrigger = triggerCounts[1]
  if (secondTrigger) {
    patterns.push(`emotion:${secondTrigger.value}(${secondTrigger.count})`)
  }

  const secondHook = hookCounts[1]
  if (secondHook) {
    patterns.push(`hook:${secondHook.value}(${secondHook.count})`)
  }

  return patterns
}

function countFrequency(
  items: readonly string[],
): readonly { readonly value: string; readonly count: number }[] {
  const counts = new Map<string, number>()

  for (const item of items) {
    counts.set(item, (counts.get(item) ?? 0) + 1)
  }

  const result: { readonly value: string; readonly count: number }[] = []
  counts.forEach((count, value) => {
    result.push({ value, count })
  })

  return result.sort((a, b) => b.count - a.count)
}
