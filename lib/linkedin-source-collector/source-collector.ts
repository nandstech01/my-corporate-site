/**
 * LinkedIn ソース収集オーケストレーター
 *
 * Reddit + GitHub Releases + HN/Dev.to + RSS フィード を並列取得し、
 * LLM で選別して slack_bot_memory に保存する。
 *
 * GitHub Actions cron (毎日 13:00 UTC = JST 22:00) で実行。
 */

import { createClient } from '@supabase/supabase-js'
import { fetchRedditPractitionerPosts } from './reddit-client'
import { fetchRecentGitHubReleases } from './github-releases-client'
import { fetchTrendingStories } from '../x-trending-collector/trending-client'
import { fetchRSSFeeds } from './rss-feed-client'
import {
  analyzeSourcesForLinkedIn,
  type CollectedSource,
  type LinkedInTopicCandidate,
} from './source-analyzer'
import { HybridSearchSystem } from '../vector/hybrid-search'

const GITHUB_RELEASE_PRIORITY_SCORE = 100
const OFFICIAL_BLOG_PRIORITY_SCORE = 150

// ============================================================
// Supabase ヘルパー
// ============================================================

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  }
  return createClient(url, key)
}

// ============================================================
// 重複チェック
// ============================================================

async function filterNewSources(
  sources: readonly CollectedSource[],
): Promise<readonly CollectedSource[]> {
  if (sources.length === 0) return []

  const supabase = getSupabase()
  const ids = sources.map((s) => s.id)

  const { data: existing } = await supabase
    .from('linkedin_source_cache')
    .select('source_id')
    .in('source_id', ids)

  const existingIds = new Set((existing ?? []).map((e) => e.source_id))
  return sources.filter((s) => !existingIds.has(s.id))
}

// ============================================================
// ソースキャッシュに保存
// ============================================================

async function cacheNewSources(
  sources: readonly CollectedSource[],
): Promise<void> {
  if (sources.length === 0) return

  const supabase = getSupabase()

  // Deduplicate by source_id within the batch to avoid
  // "ON CONFLICT DO UPDATE command cannot affect row a second time"
  const seen = new Set<string>()
  const rows: Array<{
    source_id: string
    source_type: string
    title: string
    url: string
    score: number
  }> = []
  for (const s of sources) {
    if (!seen.has(s.id)) {
      seen.add(s.id)
      rows.push({
        source_id: s.id,
        source_type: s.sourceType,
        title: s.title,
        url: s.url,
        score: s.score,
      })
    }
  }

  const { error } = await supabase
    .from('linkedin_source_cache')
    .upsert(rows, { onConflict: 'source_id' })

  if (error) {
    throw new Error(`Failed to cache sources: ${error.message}`)
  }
}

// ============================================================
// メモリに保存
// ============================================================

async function saveSummaryToMemory(
  summaryText: string,
  candidates: readonly LinkedInTopicCandidate[],
): Promise<void> {
  const supabase = getSupabase()
  const userId = process.env.SLACK_ALLOWED_USER_IDS?.split(',')[0]
  if (!userId || !summaryText) return

  const { error } = await supabase.from('slack_bot_memory').insert({
    slack_user_id: userId,
    memory_type: 'fact',
    content: summaryText,
    context: { source: 'linkedin_sources', candidates },
    importance: 0.7,
  })

  if (error) {
    throw new Error(`Failed to save LinkedIn summary to memory: ${error.message}`)
  }
}

// ============================================================
// メインオーケストレーター
// ============================================================

export async function runLinkedInSourceCollector(): Promise<void> {
  process.stdout.write('Collecting LinkedIn sources...\n')

  // 1. 全ソースを並列取得
  const [redditResult, githubResult, trendingResult, rssResult] = await Promise.allSettled([
    fetchRedditPractitionerPosts(),
    fetchRecentGitHubReleases(),
    fetchTrendingStories(),
    fetchRSSFeeds(),
  ])

  // 2. CollectedSource に正規化
  const allSources: CollectedSource[] = []

  if (redditResult.status === 'fulfilled') {
    for (const post of redditResult.value) {
      allSources.push({
        id: `reddit_${post.id}`,
        sourceType: 'reddit',
        title: post.title,
        body: post.selftext,
        url: post.permalink,
        score: post.score,
      })
    }
    process.stdout.write(`Reddit: ${redditResult.value.length} posts\n`)
  } else {
    process.stdout.write(`Reddit: failed (${redditResult.reason})\n`)
  }

  if (githubResult.status === 'fulfilled') {
    for (const release of githubResult.value) {
      allSources.push({
        id: `gh_${release.repo}_${release.tagName}`,
        sourceType: 'github_release',
        title: `${release.repo} ${release.name}`,
        body: release.body,
        url: release.htmlUrl,
        score: GITHUB_RELEASE_PRIORITY_SCORE,
      })
    }
    process.stdout.write(`GitHub Releases: ${githubResult.value.length} releases\n`)
  } else {
    process.stdout.write(`GitHub Releases: failed (${githubResult.reason})\n`)
  }

  if (trendingResult.status === 'fulfilled') {
    for (const story of trendingResult.value.slice(0, 10)) {
      allSources.push({
        id: story.id,
        sourceType: story.source === 'hackernews' ? 'hackernews' : 'devto',
        title: story.title,
        body: `${story.title} (${story.points} points, ${story.comments} comments)`,
        url: story.url ?? '',
        score: story.points,
      })
    }
    process.stdout.write(`HN/Dev.to: ${trendingResult.value.length} stories\n`)
  } else {
    process.stdout.write(`HN/Dev.to: failed (${trendingResult.reason})\n`)
  }

  if (rssResult.status === 'fulfilled') {
    for (const article of rssResult.value) {
      allSources.push({
        id: article.id,
        sourceType: 'official_blog',
        title: `[${article.feedName}] ${article.title}`,
        body: article.description,
        url: article.url,
        score: OFFICIAL_BLOG_PRIORITY_SCORE,
      })
    }
    process.stdout.write(`RSS Feeds: ${rssResult.value.length} articles\n`)
  } else {
    process.stdout.write(`RSS Feeds: failed (${rssResult.reason})\n`)
  }

  // 1b. 内部ハイブリッド検索で関連トレンドデータも取得
  try {
    const hybridSearch = new HybridSearchSystem()
    const trendTopics = ['AI', 'LLM', 'DevOps', 'Cloud Native', 'TypeScript']

    for (const topic of trendTopics) {
      const results = await hybridSearch.search({
        query: topic,
        source: 'trend',
        limit: 3,
        threshold: 0.7,
      })

      for (const result of results) {
        const trendId = `trend_${typeof result.id === 'number' ? result.id : String(result.id)}`
        const isDuplicate = allSources.some((s) => s.id === trendId)
        if (!isDuplicate) {
          allSources.push({
            id: trendId,
            sourceType: 'internal_trend',
            title: result.content.slice(0, 100),
            body: result.content,
            url: '',
            score: Math.round(result.combinedScore * 100),
          })
        }
      }
    }
    process.stdout.write(
      `Hybrid search: added internal trend sources\n`,
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(`Hybrid search: skipped (${message})\n`)
  }

  if (allSources.length === 0) {
    process.stdout.write('No sources collected. Exiting.\n')
    return
  }

  // 3. 重複チェック
  const newSources = await filterNewSources(allSources)
  process.stdout.write(`New sources after dedup: ${newSources.length}\n`)

  if (newSources.length === 0) {
    process.stdout.write('All sources already cached. Exiting.\n')
    return
  }

  // 4. LLM で LinkedIn 投稿候補に選別
  process.stdout.write('Analyzing sources for LinkedIn...\n')
  const { candidates, summaryForMemory } =
    await analyzeSourcesForLinkedIn(newSources)
  process.stdout.write(`Selected ${candidates.length} LinkedIn topic candidates\n`)

  // 5. slack_bot_memory に保存（候補データも含む）
  await saveSummaryToMemory(summaryForMemory, candidates)
  process.stdout.write('Saved LinkedIn summary to memory\n')

  // 6. ソースキャッシュに保存
  await cacheNewSources(newSources)
  process.stdout.write(`Cached ${newSources.length} sources\n`)
}
