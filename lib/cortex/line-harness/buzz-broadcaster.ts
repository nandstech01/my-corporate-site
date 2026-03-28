/**
 * CORTEX Buzz Broadcaster
 *
 * When a viral buzz is detected (high replicability_score in cortex_viral_analysis),
 * uses an AI judge (Claude Haiku) to decide whether the topic should be broadcast
 * to LINE friends, then sends it via LINE Harness SDK.
 *
 * Designed to run as a cron job with built-in spam prevention.
 */

import { getLineHarnessClientSafe } from './client'
import { getSupabase } from '../discord/context-builder'
import Anthropic from '@anthropic-ai/sdk'

// ============================================================
// Constants
// ============================================================

const MIN_REPLICABILITY_SCORE = 0.7
const MIN_BROADCAST_INTERVAL_HOURS = 4
const LOOKBACK_HOURS = 24
const MAX_CANDIDATES = 5

// ============================================================
// Types
// ============================================================

interface BuzzBroadcastReport {
  readonly analyzed: number
  readonly broadcasted: number
  readonly skipped_reasons: readonly string[]
}

interface ViralCandidate {
  readonly id: string
  readonly platform: string
  readonly original_text: string
  readonly replicability_score: number
  readonly primary_buzz_factor: string | null
  readonly emotional_trigger: string | null
  readonly engagement_rate: number
  readonly likes: number
  readonly impressions: number
  readonly analyzed_at: string
}

interface AIJudgement {
  readonly should_broadcast: boolean
  readonly target_tag: string
  readonly message_text: string
  readonly reasoning: string
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
// Data Fetching (SELECT only)
// ============================================================

async function fetchViralCandidates(
  sinceISO: string,
): Promise<readonly ViralCandidate[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('cortex_viral_analysis')
    .select(
      'id, platform, original_text, replicability_score, primary_buzz_factor, emotional_trigger, engagement_rate, likes, impressions, analyzed_at',
    )
    .gte('replicability_score', MIN_REPLICABILITY_SCORE)
    .gte('analyzed_at', sinceISO)
    .order('replicability_score', { ascending: false })
    .limit(MAX_CANDIDATES)

  if (error) {
    throw new Error(`Failed to fetch viral candidates: ${error.message}`)
  }

  return (data ?? []) as readonly ViralCandidate[]
}

async function hasRecentBroadcast(sinceISO: string): Promise<boolean> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('cortex_conversation_log')
    .select('id')
    .eq('conversation_type', 'content_review')
    .gte('created_at', sinceISO)
    .limit(1)

  if (error) {
    console.log(`[buzz-broadcaster] Failed to check recent broadcasts: ${error.message}`)
    return false
  }

  return (data ?? []).length > 0
}

// ============================================================
// AI Judge
// ============================================================

async function judgeCandidate(candidate: ViralCandidate): Promise<AIJudgement> {
  const anthropic = getAnthropic()

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-20250414',
    max_tokens: 512,
    system:
      'You are a marketing AI. Decide if this trending topic should be broadcast to LINE friends as a notification. Be conservative - only approve truly valuable content. Respond ONLY with valid JSON, no markdown fences.',
    messages: [
      {
        role: 'user',
        content: `Evaluate this viral analysis and decide if it should be broadcast to our LINE audience.

Topic analysis:
- Platform: ${candidate.platform}
- Primary buzz factor: ${candidate.primary_buzz_factor ?? 'unknown'}
- Emotional trigger: ${candidate.emotional_trigger ?? 'unknown'}
- Replicability score: ${candidate.replicability_score}
- Engagement rate: ${(candidate.engagement_rate * 100).toFixed(2)}%
- Likes: ${candidate.likes}, Impressions: ${candidate.impressions}

Original post preview:
"""
${candidate.original_text.slice(0, 500)}
"""

Return a JSON object with these exact fields:
- should_broadcast: boolean (true only if this is genuinely valuable for our audience)
- target_tag: string (suggested tag name to target, e.g. "all", "tech-interested", "ai-enthusiasts")
- message_text: string (the LINE message to send, max 200 chars, professional and concise Japanese)
- reasoning: string (why you made this decision)`,
      },
    ],
  })

  const textBlock = response.content.find((block) => block.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from AI judge')
  }

  const parsed = JSON.parse(textBlock.text) as AIJudgement

  return {
    should_broadcast: parsed.should_broadcast === true,
    target_tag: parsed.target_tag ?? 'all',
    message_text: parsed.message_text ?? '',
    reasoning: parsed.reasoning ?? '',
  }
}

// ============================================================
// Broadcasting
// ============================================================

async function sendBroadcast(
  tagName: string,
  messageText: string,
): Promise<boolean> {
  const client = getLineHarnessClientSafe()
  if (!client) {
    console.log('[buzz-broadcaster] LINE Harness not configured, skipping broadcast')
    return false
  }

  try {
    if (tagName === 'all') {
      // Broadcast to all friends
      await client.broadcastText(messageText)
      console.log('[buzz-broadcaster] Broadcast sent to all friends')
    } else {
      // Find the target tag
      const tags = await client.tags.list()
      const tag = tags.find((t: { name: string }) => t.name === tagName)

      if (tag) {
        await client.broadcastToTag(tag.id, 'text', messageText)
        console.log(`[buzz-broadcaster] Broadcast sent to tag "${tagName}"`)
      } else {
        // Tag doesn't exist - fall back to broadcast all
        console.log(
          `[buzz-broadcaster] Tag "${tagName}" not found, broadcasting to all`,
        )
        await client.broadcastText(messageText)
      }
    }

    return true
  } catch (err) {
    console.log(`[buzz-broadcaster] Failed to send broadcast: ${err}`)
    return false
  }
}

async function logBroadcast(
  candidate: ViralCandidate,
  judgement: AIJudgement,
): Promise<void> {
  const supabase = getSupabase()

  const { error } = await supabase.from('cortex_conversation_log').insert({
    conversation_type: 'content_review',
    content: judgement.message_text,
    context: {
      source: 'buzz_broadcaster',
      viral_analysis_id: candidate.id,
      platform: candidate.platform,
      target_tag: judgement.target_tag,
      reasoning: judgement.reasoning,
      replicability_score: candidate.replicability_score,
      primary_buzz_factor: candidate.primary_buzz_factor,
    },
    created_at: new Date().toISOString(),
  })

  if (error) {
    console.log(`[buzz-broadcaster] Failed to log broadcast: ${error.message}`)
  }
}

// ============================================================
// Main Entry Point
// ============================================================

export async function runBuzzBroadcast(): Promise<BuzzBroadcastReport> {
  console.log('[buzz-broadcaster] Starting buzz broadcast run')

  const skippedReasons: string[] = []

  // 1. Check for recent broadcasts to avoid spam
  const spamCheckSince = new Date(
    Date.now() - MIN_BROADCAST_INTERVAL_HOURS * 60 * 60 * 1000,
  ).toISOString()

  const recentExists = await hasRecentBroadcast(spamCheckSince)
  if (recentExists) {
    console.log(
      `[buzz-broadcaster] Recent broadcast found within ${MIN_BROADCAST_INTERVAL_HOURS}h, skipping`,
    )
    return {
      analyzed: 0,
      broadcasted: 0,
      skipped_reasons: [`Recent broadcast within ${MIN_BROADCAST_INTERVAL_HOURS}h`],
    }
  }

  // 2. Fetch high-replicability viral analyses from the last 24h
  const candidateSince = new Date(
    Date.now() - LOOKBACK_HOURS * 60 * 60 * 1000,
  ).toISOString()

  const candidates = await fetchViralCandidates(candidateSince)
  console.log(`[buzz-broadcaster] Found ${candidates.length} viral candidates`)

  if (candidates.length === 0) {
    return {
      analyzed: 0,
      broadcasted: 0,
      skipped_reasons: ['No viral candidates above threshold'],
    }
  }

  // 3. Use AI judge on the top candidate (best replicability score)
  let broadcasted = 0

  for (const candidate of candidates) {
    try {
      console.log(
        `[buzz-broadcaster] Judging candidate ${candidate.id} (score: ${candidate.replicability_score})`,
      )

      const judgement = await judgeCandidate(candidate)

      if (!judgement.should_broadcast) {
        skippedReasons.push(
          `AI rejected: ${judgement.reasoning.slice(0, 100)}`,
        )
        console.log(`[buzz-broadcaster] AI rejected candidate ${candidate.id}: ${judgement.reasoning}`)
        continue
      }

      if (!judgement.message_text) {
        skippedReasons.push('AI approved but returned empty message')
        continue
      }

      // 4. Send the broadcast
      const sent = await sendBroadcast(judgement.target_tag, judgement.message_text)

      if (sent) {
        await logBroadcast(candidate, judgement)
        broadcasted += 1
        console.log(`[buzz-broadcaster] Successfully broadcasted candidate ${candidate.id}`)
        // Only broadcast one per run to avoid spamming
        break
      } else {
        skippedReasons.push('Broadcast send failed')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      skippedReasons.push(`Error: ${message}`)
      console.log(`[buzz-broadcaster] Error processing candidate ${candidate.id}: ${message}`)
    }
  }

  const report: BuzzBroadcastReport = {
    analyzed: candidates.length,
    broadcasted,
    skipped_reasons: skippedReasons,
  }

  console.log(
    `[buzz-broadcaster] Completed. analyzed=${report.analyzed}, broadcasted=${report.broadcasted}, skipped=${report.skipped_reasons.length}`,
  )

  return report
}
