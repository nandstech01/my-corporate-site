/**
 * Viral Video Source Selector for Hybrid Carousel
 *
 * 15アカウントからバズ動画を自動選定。
 * - 同一アカウント7日間クールダウン（偏り防止）
 * - 動画のみフィルタ（hasVideo=true, MIN_LIKES=500）
 * - x_post_analyticsで重複排除
 * - Supabase video-jobsバケットに一時保存
 */

import { createClient } from '@supabase/supabase-js'
import { getTwitterClient, resolveUserId } from '../x-api/client'
import type { ViralVideoSource } from './types'

// ============================================================
// Config
// ============================================================

const INFLUENCERS = [
  'figure_robot', 'BostonDynamics', 'TheHumanoidHub', 'RunwayML', 'adcock_brett',
  'AnthropicAI', 'cursor_ai', 'OpenAI', 'DrJimFan',
  'rowancheung', 'deedydas', 'AlphaSignalAI', 'GoogleDeepMind', 'rohanpaul_ai', 'alexalbert__',
] as const

const VISUAL_ACCOUNTS = new Set(['figure_robot', 'BostonDynamics', 'TheHumanoidHub', 'RunwayML', 'adcock_brett'])

const MIN_LIKES = 500
const COOLDOWN_DAYS = 7

const TOPIC_KEYWORDS: Record<string, string> = {
  'figure': 'ヒューマノイドロボット',
  'boston': 'ロボティクス',
  'humanoid': 'ヒューマノイド',
  'runway': 'AI動画生成',
  'sora': 'AI動画生成',
  'openai': 'OpenAI最新動向',
  'anthropic': 'Claude最新動向',
  'claude': 'Claude活用',
  'cursor': 'AIコーディング',
  'deepmind': 'Google AI研究',
  'gemini': 'Gemini最新動向',
  'copilot': 'AI開発ツール',
  'gpt': 'GPT活用術',
  'agent': 'AIエージェント',
  'robot': 'ロボティクス',
}

// ============================================================
// X API helpers (twitter-api-v2)
// ============================================================

// Cached user IDs — must match viral-ai-repost.ts (IDs are permanent)
const USER_ID_CACHE: Record<string, string> = {
  figure_robot: '1602443956888817665',
  BostonDynamics: '517473207',
  TheHumanoidHub: '1682127524963426304',
  RunwayML: '1001114465692200960',
  adcock_brett: '3222018178',
  AnthropicAI: '1353836358901501952',
  cursor_ai: '1695890961094909952',
  OpenAI: '4398626122',
  DrJimFan: '1007413134',
  rowancheung: '1314686042',
  deedydas: '361044311',
  AlphaSignalAI: '114783808',
  GoogleDeepMind: '4783690002',
  rohanpaul_ai: '2588345408',
  alexalbert__: '1526190834768785408',
}

interface TweetCandidate {
  tweetId: string
  text: string
  username: string
  likes: number
  impressions: number
  videoUrl: string
  previewImageUrl?: string
  score: number
}

async function fetchWithRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  try {
    return await fn()
  } catch (err: unknown) {
    const msg = String(err)
    if (msg.includes('429') || msg.includes('Too Many')) {
      process.stderr.write(`[429] ${label} — waiting 60s\n`)
      await new Promise(r => setTimeout(r, 60_000))
      return fn()
    }
    throw err
  }
}

async function fetchVideoTweets(username: string): Promise<TweetCandidate[]> {
  let userId = USER_ID_CACHE[username]
  if (!userId) {
    const resolved = await resolveUserId(username)
    if (!resolved) {
      process.stderr.write(`  [fetchVideoTweets] @${username}: could not resolve user ID\n`)
      return []
    }
    userId = resolved.id
  }

  try {
    const client = getTwitterClient()
    const timeline = await fetchWithRetry(
      () => client.v2.userTimeline(userId, {
        max_results: 10,
        'tweet.fields': ['public_metrics', 'attachments'],
        'media.fields': ['type', 'variants', 'preview_image_url'],
        expansions: ['attachments.media_keys'],
      }),
      `getUserTimeline(@${username})`,
    )

    const tweets = timeline.data?.data || []
    const mediaMap = new Map<string, any>()
    for (const media of timeline.includes?.media || []) {
      mediaMap.set(media.media_key, media)
    }

    const candidates: TweetCandidate[] = []
    for (const tweet of tweets) {
      const metrics = tweet.public_metrics || {}
      const likes = (metrics as any).like_count || 0
      if (likes < MIN_LIKES) continue

      const mediaKeys = tweet.attachments?.media_keys || []
      let videoUrl: string | null = null
      let previewImageUrl: string | undefined

      for (const key of mediaKeys) {
        const media = mediaMap.get(key) as any
        if (media && (media.type === 'video' || media.type === 'animated_gif')) {
          previewImageUrl = media.preview_image_url
          const variants = media.variants || []
          let bestBitrate = 0
          for (const v of variants) {
            if (v.content_type === 'video/mp4' && (v.bit_rate || 0) > bestBitrate) {
              bestBitrate = v.bit_rate || 0
              videoUrl = v.url
            }
          }
          break
        }
      }

      if (!videoUrl) continue

      const isVisual = VISUAL_ACCOUNTS.has(username)
      const score = likes * 2 * (isVisual ? 1.5 : 1)

      candidates.push({
        tweetId: tweet.id,
        text: tweet.text || '',
        username,
        likes,
        impressions: (metrics as any).impression_count || 0,
        videoUrl,
        previewImageUrl,
        score,
      })
    }

    return candidates
  } catch (e: any) {
    process.stderr.write(`  [fetchVideoTweets] @${username} (userId=${userId}): ${e?.code || ''} ${e?.message || e}\n`)
    return []
  }
}

// ============================================================
// Topic detection
// ============================================================

function detectTopic(text: string, username: string): string {
  const combined = `${text} ${username}`.toLowerCase()
  for (const [keyword, topic] of Object.entries(TOPIC_KEYWORDS)) {
    if (combined.includes(keyword)) return topic
  }
  return 'AI最新技術'
}

// ============================================================
// Dedup & cooldown
// ============================================================

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

async function getRecentlyUsedTweetIds(): Promise<Set<string>> {
  const supabase = getSupabase()
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  const { data } = await supabase
    .from('x_post_analytics')
    .select('post_text')
    .eq('pattern_used', 'instagram_hybrid_carousel')
    .gte('posted_at', since)
  const ids = new Set<string>()
  for (const row of data || []) {
    const match = (row.post_text as string).match(/\[original:(\d+)\]/)
    if (match) ids.add(match[1])
  }
  return ids
}

async function getRecentlyUsedAccounts(): Promise<Set<string>> {
  const supabase = getSupabase()
  const since = new Date(Date.now() - COOLDOWN_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const { data } = await supabase
    .from('x_post_analytics')
    .select('post_text')
    .eq('pattern_used', 'instagram_hybrid_carousel')
    .gte('posted_at', since)
  const accounts = new Set<string>()
  for (const row of data || []) {
    const match = (row.post_text as string).match(/\[source:@(\w+)\]/)
    if (match) accounts.add(match[1])
  }
  return accounts
}

// ============================================================
// Main Export
// ============================================================

export async function selectViralVideo(): Promise<ViralVideoSource | null> {
  try {
    getTwitterClient() // verify credentials exist
  } catch {
    process.stdout.write('  Twitter API not configured\n')
    return null
  }

  const [usedTweetIds, usedAccounts] = await Promise.all([
    getRecentlyUsedTweetIds(),
    getRecentlyUsedAccounts(),
  ])

  process.stdout.write(`  Cooldown accounts (${COOLDOWN_DAYS}d): ${usedAccounts.size}, Used tweets: ${usedTweetIds.size}\n`)

  // Fetch from all accounts, skip cooled-down ones first but still try if no alternatives
  const priorityAccounts = INFLUENCERS.filter((a) => !usedAccounts.has(a))
  const fallbackAccounts = INFLUENCERS.filter((a) => usedAccounts.has(a))
  const orderedAccounts = [...priorityAccounts, ...fallbackAccounts]

  const allCandidates: TweetCandidate[] = []

  for (const username of orderedAccounts) {
    try {
      const tweets = await fetchVideoTweets(username)
      const fresh = tweets.filter((t) => !usedTweetIds.has(t.tweetId))
      allCandidates.push(...fresh)
      process.stdout.write(`  @${username}: ${tweets.length} total, ${fresh.length} video tweets\n`)
    } catch (e: any) {
      process.stdout.write(`  @${username}: failed — ${e?.message || e}\n`)
    }
    // Rate limit buffer
    await new Promise((r) => setTimeout(r, 200))
  }

  if (allCandidates.length === 0) {
    process.stdout.write('  No viral videos found\n')
    return null
  }

  // Sort by score, prefer non-cooldown accounts
  allCandidates.sort((a, b) => {
    const aCooldown = usedAccounts.has(a.username) ? 1 : 0
    const bCooldown = usedAccounts.has(b.username) ? 1 : 0
    if (aCooldown !== bCooldown) return aCooldown - bCooldown
    return b.score - a.score
  })

  const best = allCandidates[0]
  return {
    tweetId: best.tweetId,
    tweetText: best.text,
    username: best.username,
    videoUrl: best.videoUrl,
    previewImageUrl: best.previewImageUrl,
    likeCount: best.likes,
    impressionCount: best.impressions,
    topicHint: detectTopic(best.text, best.username),
  }
}

// ============================================================
// Video proxy (X CDN → Supabase)
// ============================================================

const IG_CAROUSEL_VIDEO_MAX_SECONDS = 59

async function trimVideoIfNeeded(inputBuffer: Buffer): Promise<Buffer> {
  const { execSync } = await import('child_process')
  const { writeFileSync, readFileSync, unlinkSync } = await import('fs')
  const { join } = await import('path')
  const { tmpdir } = await import('os')

  const tmpIn = join(tmpdir(), `ig-trim-in-${Date.now()}.mp4`)
  const tmpOut = join(tmpdir(), `ig-trim-out-${Date.now()}.mp4`)

  writeFileSync(tmpIn, inputBuffer)

  try {
    // Check duration
    const probe = execSync(`ffprobe -v quiet -print_format json -show_format "${tmpIn}"`, { encoding: 'utf-8' })
    const duration = parseFloat(JSON.parse(probe).format?.duration || '0')

    if (duration <= IG_CAROUSEL_VIDEO_MAX_SECONDS) {
      process.stdout.write(`  Video duration: ${duration.toFixed(1)}s (within limit)\n`)
      return inputBuffer
    }

    process.stdout.write(`  Video duration: ${duration.toFixed(1)}s → trimming to ${IG_CAROUSEL_VIDEO_MAX_SECONDS}s\n`)
    execSync(
      `ffmpeg -y -i "${tmpIn}" -t ${IG_CAROUSEL_VIDEO_MAX_SECONDS} -c:v libx264 -c:a aac -movflags +faststart "${tmpOut}"`,
      { stdio: 'pipe' },
    )
    return readFileSync(tmpOut)
  } finally {
    try { unlinkSync(tmpIn) } catch {}
    try { unlinkSync(tmpOut) } catch {}
  }
}

export async function proxyVideoToSupabase(
  videoUrl: string,
): Promise<{ publicUrl: string; storagePath: string }> {
  const resp = await fetch(videoUrl)
  if (!resp.ok) throw new Error(`Video download failed: ${resp.status}`)

  const rawBuffer = Buffer.from(await resp.arrayBuffer())
  const buffer = await trimVideoIfNeeded(rawBuffer)
  const fileName = `temp/hybrid-carousel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.mp4`

  const supabase = getSupabase()
  const { error } = await supabase.storage
    .from('video-jobs')
    .upload(fileName, buffer, { contentType: 'video/mp4', upsert: true })

  if (error) throw new Error(`Video upload failed: ${error.message}`)

  const { data } = supabase.storage.from('video-jobs').getPublicUrl(fileName)
  return { publicUrl: data.publicUrl, storagePath: fileName }
}

export async function cleanupVideoFromStorage(storagePath: string): Promise<void> {
  const supabase = getSupabase()
  await supabase.storage.from('video-jobs').remove([storagePath])
}
