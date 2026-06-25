/**
 * Autonomous Claude Code Quote-RT (credible + fresh + image)
 *
 * Reach lever for a low-credibility account: borrow authority by quote-tweeting
 * RECENT posts from a curated list of CREDIBLE Claude Code accounts, with our
 * own Japanese take and an OpenAI-generated infographic.
 *
 * Guardrails:
 *   - Source ONLY from CREDIBLE_CC_ACCOUNTS (never random search hits).
 *   - Freshness: Brave `freshness: 'pw'` (past week) → no stale info.
 *   - Existing gates: daily post limit + cortexReview (dedup/freshness/quality).
 *   - Self-contained; does not touch the Slack-approval viral-repost flow.
 */

import { createAnthropicCompatible } from '@/lib/llm/claude-cli'
import { createClient } from '@supabase/supabase-js'
import { braveWebSearch } from '../../web-search/brave'
import {
  CREDIBLE_CC_ACCOUNTS,
  REPOST_EXCLUDE_HANDLES,
  credibleAccountQuery,
} from '../knowledge/credible-accounts'
import { postTweet } from '../../x-api/client'
import { checkDailyPostLimit } from './daily-limit-checker'
import { savePostAnalytics } from '../../slack-bot/memory'

const RANK_MODEL = 'claude-haiku-4-5-20251001'
// How many credible accounts to query per run (Brave rate-limit friendly).
const ACCOUNTS_PER_RUN = 5

interface RepostCandidate {
  readonly authorHandle: string
  readonly sourceUrl: string
  readonly title: string
  readonly summary: string
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

/** Source URLs we already quoted recently — never quote twice. */
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

function handleFromUrl(url: string): string | null {
  const match = url.match(/(?:x\.com|twitter\.com)\/([^/]+)\/status/)
  return match ? match[1].toLowerCase() : null
}

/** Brave search with 429 backoff (free tier is ~1 req/sec and easily throttled). */
async function braveWithRetry(query: string) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await braveWebSearch(query, { count: 6, freshness: 'pw' })
    } catch (e) {
      if (String(e).includes('429') && attempt < 2) {
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)))
        continue
      }
      throw e
    }
  }
  return []
}

/**
 * Collect RECENT posts (past week) from a rotating subset of CREDIBLE accounts.
 * Credible by construction (whitelist) + fresh by Brave freshness filter.
 */
async function collectCredibleFresh(
  recentUrls: ReadonlySet<string>,
): Promise<readonly RepostCandidate[]> {
  // Rotate which credible accounts we query each run (rate-limit friendly).
  const rotated = [...CREDIBLE_CC_ACCOUNTS].sort(() => Math.random() - 0.5).slice(0, ACCOUNTS_PER_RUN)
  const seen = new Set<string>()
  const candidates: RepostCandidate[] = []

  for (const handle of rotated) {
    try {
      const results = await braveWithRetry(credibleAccountQuery(handle))
      for (const r of results) {
        const isStatus = r.url.includes('/status/')
        if (!isStatus || seen.has(r.url) || recentUrls.has(r.url)) continue
        const urlHandle = handleFromUrl(r.url)
        if (!urlHandle || REPOST_EXCLUDE_HANDLES.has(urlHandle)) continue
        // Only keep posts actually authored by a credible account.
        if (!CREDIBLE_CC_ACCOUNTS.includes(urlHandle)) continue
        seen.add(r.url)
        candidates.push({
          authorHandle: urlHandle,
          sourceUrl: r.url,
          title: r.title,
          summary: r.description,
        })
      }
    } catch (e) {
      process.stdout.write(
        `[claude-code-repost] query failed @${handle}: ${e instanceof Error ? e.message : String(e)}\n`,
      )
    }
    await new Promise((resolve) => setTimeout(resolve, 1300)) // Brave ~1 req/sec
  }

  return candidates
}

interface QuotePick {
  readonly index: number
  readonly quoteText: string
  readonly imageTitle: string
  readonly imagePoints: readonly string[]
}

/** Let Claude pick the single most worth-quoting post and write the JP take + image brief. */
async function pickAndWrite(
  candidates: readonly RepostCandidate[],
): Promise<QuotePick | null> {
  const list = candidates
    .map((c, i) => `[${i}] @${c.authorHandle}: ${c.title}\n${c.summary.slice(0, 200)}`)
    .join('\n\n')

  const anthropic = createAnthropicCompatible()
  const response = await anthropic.messages.create({
    model: RANK_MODEL,
    max_tokens: 700,
    messages: [{
      role: 'user',
      content: `あなたは @nands_tech（Claude Codeを使い倒す実務家エンジニア）。
以下は信用できるClaude Code関連アカウントの「最近の投稿」候補。日本のエンジニアに最も刺さる1つを選び、引用RT用の日本語コメントを書け。

選定基準: 新しい/具体的/実務で効く。古い話・単なる宣伝は除外。
コメント要件: 「だ・である」調。140字以内。自分の見解や使いどころを一言添える。煽りだけは禁止、具体で裏付ける。元投稿の丸写し禁止。
画像: 添付インフォグラフィック用に短いタイトルと要点3つも返す。

候補:
${list}

出力（JSONのみ）: {"index": 番号, "quoteText": "引用コメント", "imageTitle": "15文字以内", "imagePoints": ["20文字以内", "...", "最大3個"]}`,
    }],
  })

  const block = response.content.find((b: { type: string }) => b.type === 'text') as
    | { text?: string }
    | undefined
  const match = (block?.text ?? '').match(/\{[\s\S]*\}/)
  if (!match) return null
  try {
    const parsed = JSON.parse(match[0]) as {
      index?: number
      quoteText?: string
      imageTitle?: string
      imagePoints?: unknown[]
    }
    if (typeof parsed.index !== 'number' || !parsed.quoteText) return null
    return {
      index: parsed.index,
      quoteText: String(parsed.quoteText).trim(),
      imageTitle: String(parsed.imageTitle ?? 'Claude Code 最新'),
      imagePoints: Array.isArray(parsed.imagePoints)
        ? parsed.imagePoints.map((p) => String(p)).slice(0, 3)
        : [],
    }
  } catch {
    return null
  }
}

export async function runClaudeCodeRepost(): Promise<void> {
  process.stdout.write('\n=== Claude Code Quote-RT (credible + fresh) ===\n')

  // Gate 1: daily post limit (shared 2-5/day CORTEX cap)
  const limit = await checkDailyPostLimit('x')
  if (!limit.canPost) {
    process.stdout.write(`[gate] Daily limit: ${limit.reason}. Skipping.\n`)
    return
  }

  const recentUrls = await getRecentRepostUrls(30)
  const candidates = await collectCredibleFresh(recentUrls)
  if (candidates.length === 0) {
    process.stdout.write('[done] No fresh credible Claude Code posts. Skipping.\n')
    return
  }
  process.stdout.write(`[collect] ${candidates.length} credible fresh candidate(s)\n`)

  const pick = await pickAndWrite(candidates)
  if (!pick || !candidates[pick.index]) {
    process.stdout.write('[done] No quotable candidate selected. Skipping.\n')
    return
  }

  const target = candidates[pick.index]
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

  // 稼働中のテキスト経路(postTweet→Typefully/Playwright)で投稿する。
  // 引用元URLを本文末尾に置くと引用カードとしてレンダリングされる。
  // ネイティブ引用RT/画像はX API有料枠が必要(現状402 CreditsDepleted)のため使わない。
  const result = await postTweet(`${pick.quoteText}\n\n${target.sourceUrl}`)
  if (!result.success || !result.tweetId) {
    process.stdout.write(`[done] Quote-RT failed: ${result.error}\n`)
    return
  }
  process.stdout.write(`[done] Quote-RT posted: ${result.tweetUrl} (@${target.authorHandle})\n`)

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
