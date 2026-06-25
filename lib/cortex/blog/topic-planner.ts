/**
 * Topic planner: ~80% Claude Code (60% how-to + 20% news) / 20% company AI.
 * News topics are grounded in the official changelog. Dedups vs recent posts.
 */

import { createClient } from '@supabase/supabase-js'
import { collectClaudeCodeDigest } from '../knowledge/claude-code-watcher'
import {
  CLAUDE_CODE_HOWTO,
  CLAUDE_CODE_NEWS,
  COMPANY_AI,
  CLAUDE_CODE_CATEGORY,
  COMPANY_CATEGORY,
  pickAngle,
  type Angle,
} from './topic-bank'
import type { TopicPlan } from './types'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

function bigrams(s: string): Set<string> {
  const t = s.toLowerCase().replace(/\s+/g, '')
  const g = new Set<string>()
  for (let i = 0; i < t.length - 1; i++) g.add(t.slice(i, i + 2))
  return g
}

function overlap(a: string, b: string): number {
  const ga = bigrams(a)
  const gb = bigrams(b)
  if (ga.size === 0 || gb.size === 0) return 0
  let inter = 0
  for (const g of ga) if (gb.has(g)) inter++
  return inter / new Set([...ga, ...gb]).size
}

async function recentTitles(days = 30): Promise<readonly string[]> {
  const sb = getSupabase()
  if (!sb) return []
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
  const { data } = await sb.from('posts').select('title').gte('created_at', since)
  return (data ?? []).map((r) => r.title as string).filter(Boolean)
}

/** Weighted pick of content kind → over many runs converges to ~80% Claude Code. */
function pickPool(): readonly Angle[] {
  const r = Math.random()
  if (r < 0.6) return CLAUDE_CODE_HOWTO
  if (r < 0.8) return CLAUDE_CODE_NEWS
  return COMPANY_AI
}

export async function planTopic(): Promise<TopicPlan | null> {
  const titles = await recentTitles(30)

  // Fetch changelog once (used for news grounding + light context).
  const digest = await collectClaudeCodeDigest({ changelogLimit: 3, communityLimit: 4 }).catch(() => null)
  const version = digest?.changelog[0]?.version ?? '最新版'
  const changelogFacts = (digest?.changelog ?? []).map((u) => `${u.title}: ${u.summary.slice(0, 180)}`)
  const angleHints = (digest?.community ?? []).slice(0, 3).map((c) => c.title).filter(Boolean)

  // Try up to 8 picks to find a non-duplicate, valid topic.
  for (let attempt = 0; attempt < 8; attempt++) {
    const pool = pickPool()
    const angle = pickAngle(pool, Math.floor(Math.random() * 1000))

    if (angle.requiresChangelog && changelogFacts.length === 0) continue // need facts for news

    const topic = angle.topic.replace('{v}', version)
    const dup = titles.some((t) => overlap(topic, t) >= 0.35)
    if (dup) continue

    const categorySlug = angle.kind === 'company-ai' ? COMPANY_CATEGORY : CLAUDE_CODE_CATEGORY
    return {
      kind: angle.kind,
      topic,
      targetKeyword: angle.targetKeyword,
      categorySlug,
      // Only news topics get version-specific facts; how-to stays evergreen-safe.
      changelogFacts: angle.requiresChangelog ? changelogFacts : changelogFacts.slice(0, 1),
      angleHints,
    }
  }

  return null
}
