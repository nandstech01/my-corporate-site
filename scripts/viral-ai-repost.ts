/**
 * viral-ai-repost.ts
 *
 * 海外AIインフルエンサーのバズツイートを見つけて、
 * カジュアルな日本語コメント付きでリポストするスクリプト。
 *
 * Usage:
 *   npx tsx scripts/viral-ai-repost.ts
 *   npx tsx scripts/viral-ai-repost.ts --dry-run
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import {
  resolveUserId,
  getUserTimeline,
  postTweet,
  getTwitterWeightedLength,
} from '../lib/x-api/client'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const INFLUENCERS = [
  'rowancheung',
  'deedydas',
  'AlphaSignalAI',
  'TheHumanoidHub',
  'JeffreyTowson',
  'rohanpaul_ai',
  'alex_prompter',
  'adcock_brett',
] as const

const MIN_IMPRESSIONS = 50_000
const MIN_LIKES = 500

// ---------------------------------------------------------------------------
// Comment templates & topic detection
// ---------------------------------------------------------------------------

const TOPIC_KEYWORDS: readonly { readonly pattern: RegExp; readonly hint: string }[] = [
  { pattern: /robot(ic)?s?|humanoid/i, hint: 'ヒューマノイドロボット' },
  { pattern: /Seedance|Sora|Veo|video\s*(gen|model|diffusion)/i, hint: '動画生成AI' },
  { pattern: /Midjourney|Flux|image\s*(gen|model)|Stable\s*Diffusion/i, hint: '画像生成AI' },
  { pattern: /open\s*source|Apache|MIT\s*license/i, hint: 'オープンソースAI' },
  { pattern: /Claude\s*Code|Codex|Cursor|coding\s*agent/i, hint: 'AIコーディング' },
  { pattern: /Claude/i, hint: 'Claude' },
  { pattern: /GPT-?[45]/i, hint: 'GPT' },
  { pattern: /Gemini/i, hint: 'Gemini' },
  { pattern: /agent|agentic|MCP/i, hint: 'AIエージェント' },
  { pattern: /chip|GPU|NVIDIA|AMD|semiconductor|H100|B200/i, hint: 'GPU・半導体' },
  { pattern: /China|Chinese|Baidu|ByteDance|DeepSeek|Qwen/i, hint: '中国AI' },
  { pattern: /self[- ]?driv|autonom.*vehicle|Tesla\s*FSD|Waymo/i, hint: '自動運転' },
  { pattern: /funding|valuation|IPO|billion|million|\$\d/i, hint: 'AI投資' },
  { pattern: /reasoning|o[1-9]|thinking/i, hint: '推論AI' },
  { pattern: /LLM|language\s*model/i, hint: 'LLM' },
  { pattern: /Apple|Google|Microsoft|Meta|Amazon|OpenAI/i, hint: 'ビッグテックAI' },
]

const COMMENT_TEMPLATES = [
  'えっ、{topic_hint}ここまできてる…？',
  'おおー、{topic_hint}やばい',
  'これ見た？{topic_hint}',
  '海外でバズってるこれ。{topic_hint}',
  '{topic_hint}、ついにこのレベルか…',
  'まだ日本で話題になってないけど、{topic_hint}すごいことになってる',
  '{topic_hint}、これは追っといた方がいい',
] as const

function detectTopicHint(text: string): string {
  for (const { pattern, hint } of TOPIC_KEYWORDS) {
    if (pattern.test(text)) return hint
  }
  return 'AI'
}

function pickComment(tweetText: string, tweetId: string): string {
  const hint = detectTopicHint(tweetText)
  // Use current hour + tweet ID for better rotation (avoids same template for same author)
  const hourSeed = new Date().getHours()
  const idSeed = tweetId.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  const index = (hourSeed + idSeed) % COMMENT_TEMPLATES.length
  const template = COMMENT_TEMPLATES[index]
  return template.replace('{topic_hint}', hint)
}

// ---------------------------------------------------------------------------
// Supabase helpers
// ---------------------------------------------------------------------------

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function isAlreadyPosted(tweetUrl: string): Promise<boolean> {
  const { count } = await supabase
    .from('x_post_analytics')
    .select('id', { count: 'exact', head: true })
    .ilike('post_text', `%${tweetUrl}%`)

  return (count ?? 0) > 0
}

async function savePost(postText: string, tweetId: string, tweetUrl: string): Promise<void> {
  await supabase.from('x_post_analytics').insert({
    post_text: postText,
    post_id: tweetId,
    post_url: tweetUrl,
    pattern_used: 'viral_repost',
    posted_at: new Date().toISOString(),
  })
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

interface ViralTweet {
  readonly id: string
  readonly text: string
  readonly username: string
  readonly likeCount: number
  readonly impressionCount: number
  readonly url: string
}

async function findViralTweets(): Promise<ViralTweet[]> {
  const candidates: ViralTweet[] = []

  for (const username of INFLUENCERS) {
    const resolved = await resolveUserId(username)
    if (resolved.error || !resolved.id) {
      console.error(`Skip @${username}: ${resolved.error}`)
      continue
    }

    const { tweets, error } = await getUserTimeline(resolved.id, { maxResults: 10 })
    if (error) {
      console.error(`Timeline error @${username}: ${error}`)
      continue
    }

    for (const tweet of tweets) {
      const metrics = tweet.publicMetrics
      if (!metrics) continue

      const isViral =
        metrics.impressionCount >= MIN_IMPRESSIONS || metrics.likeCount >= MIN_LIKES
      if (!isViral) continue

      // Skip retweets (they start with "RT @")
      if (tweet.text.startsWith('RT @')) continue

      const tweetUrl = `https://x.com/${username}/status/${tweet.id}`
      const alreadyPosted = await isAlreadyPosted(tweetUrl)
      if (alreadyPosted) continue

      candidates.push({
        id: tweet.id,
        text: tweet.text,
        username,
        likeCount: metrics.likeCount,
        impressionCount: metrics.impressionCount,
        url: tweetUrl,
      })
    }
  }

  // Sort by likes descending
  return [...candidates].sort((a, b) => b.likeCount - a.likeCount)
}

export async function runViralAiRepost(dryRun = false): Promise<{ success: boolean; tweetUrl?: string; originalTweetUrl?: string; comment?: string; error?: string }> {

  const viralTweets = await findViralTweets()

  if (viralTweets.length === 0) {
    return { success: false, error: 'バズツイートが見つかりませんでした' }
  }

  const best = viralTweets[0]
  const comment = pickComment(best.text, best.id)

  const textWithoutUrl = comment + '\n\n'
  const urlWeight = 23
  const textWeight = getTwitterWeightedLength(textWithoutUrl)

  if (textWeight + urlWeight > 280) {
    return { success: false, error: `コメントが長すぎます (weighted: ${textWeight + urlWeight}/280)` }
  }

  const fullText = textWithoutUrl + best.url

  if (dryRun) {
    console.log(JSON.stringify({
      success: true, dryRun: true, comment,
      originalTweetUrl: best.url, originalAuthor: `@${best.username}`,
      likes: best.likeCount, impressions: best.impressionCount,
      fullText, weightedLength: textWeight + urlWeight, candidateCount: viralTweets.length,
    }))
    return { success: true, comment, originalTweetUrl: best.url }
  }

  const result = await postTweet(fullText)

  if (result.success && result.tweetId && result.tweetUrl) {
    await savePost(fullText, result.tweetId, result.tweetUrl)
    return { success: true, tweetUrl: result.tweetUrl, originalTweetUrl: best.url, comment }
  }
  return { success: false, error: result.error ?? '投稿に失敗しました', originalTweetUrl: best.url, comment }
}

// CLI entry point
if (require.main === module || process.argv[1]?.includes('viral-ai-repost')) {
  const dryRun = process.argv.includes('--dry-run')
  runViralAiRepost(dryRun)
    .then((r) => console.log(JSON.stringify(r)))
    .catch((err) => {
      console.log(JSON.stringify({ success: false, error: String(err) }))
      process.exit(1)
    })
}
