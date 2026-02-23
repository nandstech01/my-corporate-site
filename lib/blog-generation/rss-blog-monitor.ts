/**
 * Blog RSS Monitor
 *
 * RSS feeds from AI companies (OpenAI, Google, Meta, HF, LangChain, Microsoft)
 * Scores topics for buzz potential and notifies via Slack.
 *
 * Called from scripts/slack-bot-cron.ts every 6 hours.
 */

import { createClient } from '@supabase/supabase-js'
import { sendMessage } from '../slack-bot/slack-client'
import { scoreBlogTopic } from './blog-topic-scorer'
import { triggerXPostFromSource } from '../slack-bot/proactive/x-auto-post'

interface RSSFeedConfig {
  name: string
  feedUrl: string
  authority: number // 0-20
}

const RSS_FEEDS: RSSFeedConfig[] = [
  { name: 'openai_blog', feedUrl: 'https://openai.com/news/rss.xml', authority: 20 },
  // Anthropic has no public RSS feed (all /feed, /rss paths return 404)
  { name: 'google_ai_blog', feedUrl: 'https://blog.google/technology/ai/rss/', authority: 20 },
  { name: 'meta_engineering', feedUrl: 'https://engineering.fb.com/feed/', authority: 12 },
  { name: 'huggingface_blog', feedUrl: 'https://huggingface.co/blog/feed.xml', authority: 10 },
  { name: 'langchain_blog', feedUrl: 'https://blog.langchain.com/rss/', authority: 10 },
  { name: 'microsoft_ai_blog', feedUrl: 'https://blogs.microsoft.com/ai/feed/', authority: 15 },
]

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  }
  return createClient(url, key)
}

interface FeedItem {
  title: string
  link: string
  pubDate: string
  description?: string
}

function parseRSSItems(xml: string): FeedItem[] {
  const items: FeedItem[] = []
  const itemMatches = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g))
  for (const match of itemMatches) {
    const itemXml = match[1]
    const titleMatch = itemXml.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/)
    const linkMatch = itemXml.match(/<link>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/)
    const dateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)
    const descMatch = itemXml.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/)

    if (titleMatch && linkMatch) {
      items.push({
        title: titleMatch[1].trim(),
        link: linkMatch[1].trim(),
        pubDate: dateMatch ? dateMatch[1].trim() : new Date().toISOString(),
        description: descMatch ? descMatch[1].trim().substring(0, 500) : undefined,
      })
    }
  }
  return items
}

function parseAtomEntries(xml: string): FeedItem[] {
  const items: FeedItem[] = []
  const entryMatches = Array.from(xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g))
  for (const match of entryMatches) {
    const entryXml = match[1]
    const titleMatch = entryXml.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/)
    // Prefer rel="alternate" link, fall back to first href
    const linkMatch =
      entryXml.match(/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']*?)["']/) ||
      entryXml.match(/<link[^>]*href=["']([^"']*?)["'][^>]*rel=["']alternate["']/) ||
      entryXml.match(/<link[^>]*href=["']([^"']*?)["']/)
    // Prefer <published> over <updated> for accurate freshness scoring
    const dateMatch =
      entryXml.match(/<published>(.*?)<\/published>/) ||
      entryXml.match(/<updated>(.*?)<\/updated>/)
    const descMatch = entryXml.match(/<(?:summary|content)[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/(?:summary|content)>/)

    if (titleMatch && linkMatch) {
      items.push({
        title: titleMatch[1].trim(),
        link: linkMatch[1].trim(),
        pubDate: dateMatch ? dateMatch[1].trim() : new Date().toISOString(),
        description: descMatch ? descMatch[1].trim().replace(/<[^>]*>/g, '').substring(0, 500) : undefined,
      })
    }
  }
  return items
}

async function fetchFeedItems(feed: RSSFeedConfig): Promise<FeedItem[]> {
  try {
    const response = await fetch(feed.feedUrl, {
      headers: { 'User-Agent': 'NANDS-BlogMonitor/1.0' },
      signal: AbortSignal.timeout(10000),
    })
    if (!response.ok) {
      process.stdout.write(`  [${feed.name}] HTTP ${response.status}\n`)
      return []
    }

    const xml = await response.text()

    // Try RSS format first, then Atom
    let items = parseRSSItems(xml)
    if (items.length === 0) {
      items = parseAtomEntries(xml)
    }

    process.stdout.write(`  [${feed.name}] ${items.length} items fetched\n`)
    return items.slice(0, 5)
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'unknown'
    process.stdout.write(`  [${feed.name}] fetch error: ${msg}\n`)
    return []
  }
}

export async function runBlogRSSMonitor(): Promise<void> {
  const supabase = getSupabase()
  process.stdout.write('Blog RSS Monitor: Starting...\n')

  let totalNew = 0

  // Fetch all feeds in parallel
  const feedResults = await Promise.allSettled(
    RSS_FEEDS.map((feed) => fetchFeedItems(feed).then((items) => ({ feed, items })))
  )

  // Collect all new items with their source URLs for batch existence check
  const candidateItems: Array<{ feed: RSSFeedConfig; item: FeedItem }> = []
  for (const result of feedResults) {
    if (result.status === 'rejected') continue
    const { feed, items } = result.value
    for (const item of items) {
      const pubDate = new Date(item.pubDate)
      const hoursAgo = (Date.now() - pubDate.getTime()) / (1000 * 60 * 60)
      if (hoursAgo <= 48) {
        candidateItems.push({ feed, item })
      }
    }
  }

  // Batch check existing URLs (only skip active statuses; dismissed can be re-proposed)
  const allUrls = candidateItems.map((c) => c.item.link)
  const existingSet = new Set<string>()
  if (allUrls.length > 0) {
    const { data: existingRows } = await supabase
      .from('blog_topic_queue')
      .select('source_url')
      .in('source_url', allUrls)
      .in('status', ['new', 'notified', 'approved', 'published'])
    for (const row of existingRows ?? []) {
      existingSet.add(row.source_url)
    }
  }

  // Score and insert new topics
  for (const { feed, item } of candidateItems) {
    if (existingSet.has(item.link)) continue

    const pubDate = new Date(item.pubDate)
    const score = await scoreBlogTopic({
      title: item.title,
      sourceAuthority: feed.authority,
      publishedAt: pubDate,
      description: item.description,
    })

    const { error: insertError } = await supabase
      .from('blog_topic_queue')
      .insert({
        source_feed: feed.name,
        source_url: item.link,
        source_title: item.title,
        source_published_at: pubDate.toISOString(),
        suggested_topic: score.suggestedTopic,
        suggested_keyword: score.suggestedKeyword,
        buzz_score: score.totalScore,
        buzz_breakdown: score.breakdown,
        status: 'new',
      })

    if (insertError) {
      process.stdout.write(`  Insert error for "${item.title}": ${insertError.message}\n`)
    } else {
      totalNew++
    }
  }

  process.stdout.write(`Blog RSS Monitor: ${totalNew} new topics found\n`)

  // Notify Slack for high-score topics (always check, not just when new topics inserted)
  const channel = process.env.SLACK_DEFAULT_CHANNEL
  if (!channel) {
    process.stdout.write('Blog RSS Monitor: SLACK_DEFAULT_CHANNEL not set, skipping notifications\n')
  } else {
    const { data: topTopics } = await supabase
      .from('blog_topic_queue')
      .select('*')
      .eq('status', 'new')
      .order('buzz_score', { ascending: false })
      .limit(5)

    const notifiable = (topTopics ?? []).filter((t) => t.buzz_score >= 30)
    process.stdout.write(`Blog RSS Monitor: ${topTopics?.length ?? 0} queued, ${notifiable.length} above threshold (>=30)\n`)

    for (const topic of notifiable) {
      try {
        const message = `:newspaper: *Blog Topic Detected* (Score: ${topic.buzz_score}/100)\n\n` +
          `*${topic.source_title}*\n` +
          `Source: ${topic.source_feed} | ${topic.source_url}\n` +
          `Suggested: ${topic.suggested_topic || 'N/A'}\n` +
          `Keyword: ${topic.suggested_keyword || 'N/A'}`

        const result = await sendMessage({
          channel,
          text: message,
          blocks: [
            {
              type: 'section',
              text: { type: 'mrkdwn', text: message },
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: { type: 'plain_text', text: ':white_check_mark: Approve' },
                  style: 'primary',
                  action_id: 'approve_blog_topic',
                  value: topic.id,
                },
                {
                  type: 'button',
                  text: { type: 'plain_text', text: ':no_entry_sign: Dismiss' },
                  style: 'danger',
                  action_id: 'dismiss_blog_topic',
                  value: topic.id,
                },
              ],
            },
          ],
        })

        if (result) {
          await supabase
            .from('blog_topic_queue')
            .update({ status: 'notified', slack_message_ts: result })
            .eq('id', topic.id)
          process.stdout.write(`Blog RSS Monitor: Notified "${topic.source_title}" (score: ${topic.buzz_score})\n`)
        } else {
          process.stdout.write(`Blog RSS Monitor: sendMessage returned falsy for "${topic.source_title}"\n`)
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'unknown'
        process.stdout.write(`Blog RSS Monitor: Slack notification error: ${msg}\n`)
      }
    }
  }

  // X auto-post trigger: 高スコアの公式記事にはX投稿ドラフトも自動生成
  {
    const { data: xCandidates } = await supabase
      .from('blog_topic_queue')
      .select('*')
      .eq('status', 'notified')
      .gte('buzz_score', 40)
      .order('buzz_score', { ascending: false })
      .limit(1)

    for (const topic of xCandidates ?? []) {
      try {
        const triggered = await triggerXPostFromSource({
          title: topic.source_title,
          sourceUrl: topic.source_url,
          description: topic.suggested_topic,
          sourceFeed: topic.source_feed,
          buzzScore: topic.buzz_score,
        })
        if (triggered) {
          process.stdout.write(
            `Blog RSS Monitor: X post triggered for "${topic.source_title}"\n`,
          )
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'unknown'
        process.stdout.write(`Blog RSS Monitor: X post trigger failed: ${msg}\n`)
      }
    }
  }

  // Blog auto-generation: evaluate high-buzz topics with AI Judge
  try {
    const { data: judgeCandidates } = await supabase
      .from('blog_topic_queue')
      .select('*')
      .gte('buzz_score', 45)
      .is('judge_action', null)
      .in('status', ['new', 'notified'])
      .order('buzz_score', { ascending: false })
      .limit(3)

    if (judgeCandidates && judgeCandidates.length > 0) {
      process.stdout.write(`Blog RSS Monitor: ${judgeCandidates.length} topic(s) for AI Judge evaluation\n`)

      const { evaluateAndAutoApproveBlog } = await import('../ai-judge/blog-judge')

      for (const topic of judgeCandidates) {
        try {
          const approved = await evaluateAndAutoApproveBlog(topic)
          process.stdout.write(
            `Blog RSS Monitor: AI Judge ${approved ? 'approved' : 'declined'} "${topic.source_title}" (buzz: ${topic.buzz_score})\n`,
          )
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'unknown'
          process.stdout.write(`Blog RSS Monitor: AI Judge error for "${topic.source_title}": ${msg}\n`)
        }
      }
    }
  } catch {
    // Best-effort: blog auto-generation failure should not break RSS monitor
  }

  process.stdout.write('Blog RSS Monitor: Complete\n')
}
