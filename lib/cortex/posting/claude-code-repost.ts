/**
 * Autonomous Claude Code Quote-RT
 *
 * Reach lever for a small account: engage the Claude Code community by
 * quote-tweeting the best fresh Claude Code post with a Japanese take.
 * This is what actually surfaces us to other people's audiences.
 *
 * Claude Code focused (candidates come from claude-code-watcher), runs through
 * the existing gates (daily post limit + cortexReview dedup/freshness), and
 * auto-posts via the X API quote endpoint. Self-contained so it does NOT
 * disturb the Slack-approval viral-repost flow.
 */

import { createAnthropicCompatible } from '@/lib/llm/claude-cli'
import { createClient } from '@supabase/supabase-js'
import { fetchCommunityBuzz, type ClaudeCodeUpdate } from '../knowledge/claude-code-watcher'
import { quoteTweet } from '../../x-api/client'
import { checkDailyPostLimit } from './daily-limit-checker'
import { savePostAnalytics } from '../../slack-bot/memory'

const RANK_MODEL = 'claude-haiku-4-5-20251001'
const OWN_HANDLES = new Set(['nands_tech'])

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

/** Tweet IDs / source URLs we already quoted recently — never quote twice. */
async function getRecentRepostUrls(days = 30): Promise<ReadonlySet<string>> {
  const supabase = getSupabase()
  if (!supabase) return new Set()
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
  const { data } = await supabase
    .from('x_post_analytics')
    .select('source_url')
    .gte('posted_at', since)
    .not('source_url', 'is', null)
  return new Set((data ?? []).map((r) => r.source_url as string).filter(Boolean))
}

function tweetIdFromUrl(url: string): string | null {
  const match = url.match(/\/status\/(\d+)/)
  return match ? match[1] : null
}

interface QuotePick {
  readonly index: number
  readonly quoteText: string
}

/** Let Claude pick the single most worth-quoting post and write the JP take. */
async function pickAndWrite(
  candidates: readonly ClaudeCodeUpdate[],
): Promise<QuotePick | null> {
  const list = candidates
    .map((c, i) => `[${i}] @${c.authorHandle}: ${c.title}\n${c.summary.slice(0, 200)}`)
    .join('\n\n')

  const anthropic = createAnthropicCompatible()
  const response = await anthropic.messages.create({
    model: RANK_MODEL,
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: `あなたは @nands_tech（Claude Codeを使い倒す実務家エンジニア）。
以下はClaude Code関連の最近の投稿候補。日本のエンジニアに刺さる1つを選び、引用RT用の日本語コメントを書け。

選定基準: 新しい/具体的/実務で効く。単なる宣伝や既知の話は除外。
コメント要件: 「だ・である」調。140字以内。自分の見解や使いどころを一言添える。煽りだけは禁止、具体で裏付ける。元投稿の丸写し禁止。

候補:
${list}

出力（JSONのみ）: {"index": 候補番号, "quoteText": "引用コメント"}`,
    }],
  })

  const block = response.content.find((b: { type: string }) => b.type === 'text') as
    | { text?: string }
    | undefined
  const match = (block?.text ?? '').match(/\{[\s\S]*\}/)
  if (!match) return null
  try {
    const parsed = JSON.parse(match[0]) as { index?: number; quoteText?: string }
    if (typeof parsed.index !== 'number' || !parsed.quoteText) return null
    return { index: parsed.index, quoteText: String(parsed.quoteText).trim() }
  } catch {
    return null
  }
}

export async function runClaudeCodeRepost(): Promise<void> {
  process.stdout.write('\n=== Claude Code Quote-RT ===\n')

  // Gate 1: daily post limit (shared 2-5/day CORTEX cap)
  const limit = await checkDailyPostLimit('x')
  if (!limit.canPost) {
    process.stdout.write(`[gate] Daily limit: ${limit.reason}. Skipping.\n`)
    return
  }

  // Collect fresh Claude Code community posts, drop already-quoted ones.
  const recentUrls = await getRecentRepostUrls(30)
  const buzz = (await fetchCommunityBuzz(8)).filter((c) => {
    const id = c.sourceUrl ? tweetIdFromUrl(c.sourceUrl) : null
    const handle = c.authorHandle?.toLowerCase() ?? ''
    return Boolean(id) && !recentUrls.has(c.sourceUrl) && handle && !OWN_HANDLES.has(handle)
  })

  if (buzz.length === 0) {
    process.stdout.write('[done] No fresh Claude Code posts to quote. Skipping.\n')
    return
  }

  const pick = await pickAndWrite(buzz)
  if (!pick || !buzz[pick.index]) {
    process.stdout.write('[done] No quotable candidate selected. Skipping.\n')
    return
  }

  const target = buzz[pick.index]
  const tweetId = tweetIdFromUrl(target.sourceUrl)
  if (!tweetId) {
    process.stdout.write('[done] Selected candidate has no tweet id. Skipping.\n')
    return
  }

  // Gate 2: CORTEX review (dedup + freshness + knowledge quality)
  try {
    const { cortexReview } = await import('../review/pre-post-reviewer')
    const reviewed = await cortexReview([{ text: pick.quoteText, platform: 'x' }])
    const blocked = reviewed.find((r) => r.duplicate_of || r.is_stale)
    if (blocked) {
      process.stdout.write('[gate] CORTEX rejected (duplicate/stale). Skipping.\n')
      return
    }
  } catch (e) {
    process.stdout.write(`[gate] CORTEX review skipped: ${e instanceof Error ? e.message : e}\n`)
  }

  // Post the quote tweet
  const result = await quoteTweet(pick.quoteText, tweetId)
  if (!result.success || !result.tweetId) {
    process.stdout.write(`[done] Quote-RT failed: ${result.error}\n`)
    return
  }
  process.stdout.write(`[done] Quote-RT posted: ${result.tweetUrl}\n`)

  // Record for analytics + future dedup (source_url)
  try {
    await savePostAnalytics({
      tweetId: result.tweetId,
      tweetUrl: result.tweetUrl,
      postText: pick.quoteText,
      postMode: 'pattern',
      postType: 'quote',
      quotedTweetId: tweetId,
      sourceUrl: target.sourceUrl,
      tags: ['claude-code-repost', `@${target.authorHandle}`],
    })
  } catch (e) {
    process.stdout.write(`[analytics] Failed to save: ${e instanceof Error ? e.message : e}\n`)
  }
}
