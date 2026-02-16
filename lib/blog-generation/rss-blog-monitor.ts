/**
 * Blog RSS Monitor
 *
 * RSS feeds from AI companies (OpenAI, Anthropic, Google, Meta, HF, LangChain, Microsoft)
 * Scores topics for buzz potential and notifies via Slack.
 *
 * Called from scripts/slack-bot-cron.ts every 6 hours.
 */

import { createClient } from '@supabase/supabase-js'
import { sendMessage } from '../slack-bot/slack-client'
import { scoreBlogTopic } from './blog-topic-scorer'

interface RSSFeedConfig {
  name: string
  feedUrl: string
  authority: number // 0-20
}

const RSS_FEEDS: RSSFeedConfig[] = [
  { name: 'openai_blog', feedUrl: 'https://openai.com/blog/rss.xml', authority: 20 },
  { name: 'anthropic_blog', feedUrl: 'https://www.anthropic.com/feed', authority: 20 },
  { name: 'google_ai_blog', feedUrl: 'https://blog.google/technology/ai/rss/', authority: 20 },
  { name: 'meta_ai_blog', feedUrl: 'https://ai.meta.com/blog/rss/', authority: 15 },
  { name: 'huggingface_blog', feedUrl: 'https://huggingface.co/blog/feed.xml', authority: 10 },
  { name: 'langchain_blog', feedUrl: 'https://blog.langchain.dev/rss/', authority: 10 },
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

async function fetchFeedItems(feed: RSSFeedConfig): Promise<FeedItem[]> {
  try {
    const response = await fetch(feed.feedUrl, {
      headers: { 'User-Agent': 'NANDS-BlogMonitor/1.0' },
      signal: AbortSignal.timeout(10000),
    })
    if (!response.ok) return []

    const xml = await response.text()
    const items: FeedItem[] = []

    // Simple XML parsing for RSS items
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

    return items.slice(0, 5) // Latest 5 per feed
  } catch {
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

  // Batch check existing URLs
  const allUrls = candidateItems.map((c) => c.item.link)
  const existingSet = new Set<string>()
  if (allUrls.length > 0) {
    const { data: existingRows } = await supabase
      .from('blog_topic_queue')
      .select('source_url')
      .in('source_url', allUrls)
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

    if (!insertError) totalNew++
  }

  process.stdout.write(`Blog RSS Monitor: ${totalNew} new topics found\n`)

  // Notify Slack for high-score topics
  if (totalNew > 0) {
    const { data: topTopics } = await supabase
      .from('blog_topic_queue')
      .select('*')
      .eq('status', 'new')
      .order('buzz_score', { ascending: false })
      .limit(5)

    if (topTopics && topTopics.length > 0) {
      for (const topic of topTopics) {
        if (topic.buzz_score < 30) continue

        const message = `:newspaper: *Blog Topic Detected* (Score: ${topic.buzz_score}/100)\n\n` +
          `*${topic.source_title}*\n` +
          `Source: ${topic.source_feed} | ${topic.source_url}\n` +
          `Suggested: ${topic.suggested_topic || 'N/A'}\n` +
          `Keyword: ${topic.suggested_keyword || 'N/A'}`

        const result = await sendMessage({
          channel: process.env.SLACK_DEFAULT_CHANNEL || '',
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

        // Save Slack message timestamp
        if (result) {
          await supabase
            .from('blog_topic_queue')
            .update({ status: 'notified', slack_message_ts: result })
            .eq('id', topic.id)
        }
      }
    }
  }

  process.stdout.write('Blog RSS Monitor: Complete\n')
}
