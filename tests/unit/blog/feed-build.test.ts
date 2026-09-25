import Parser from 'rss-parser'
import { describe, expect, it } from 'vitest'
import { FEED_URL, buildRssFeed, escapeXml, toRfc822, type FeedPost } from '@/app/feed.xml/build'
import { AUTHOR, postUrl } from '@/lib/structured-data/site-entities'

const post = (overrides: Partial<FeedPost> = {}): FeedPost => ({
  slug: 'self-healing-rag',
  title: '自己修復するRAG設計術',
  meta_description: 'RAG の誤答を検知して再検索する設計',
  published_at: '2026-07-24T00:15:17.658+00:00',
  created_at: '2026-07-24T00:15:17.666702+00:00',
  updated_at: '2026-07-24T00:15:17.666702+00:00',
  ...overrides,
})

/** <item> ブロックごとの文字列 */
const itemBlocks = (xml: string): string[] => xml.split('<item>').slice(1)

describe('escapeXml', () => {
  it('escapes the five XML special characters', () => {
    expect(escapeXml(`<a href="x">Tom & Jerry's</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&apos;s&lt;/a&gt;'
    )
  })

  it('drops control characters XML 1.0 forbids but keeps tab and newline', () => {
    expect(escapeXml('a\u0000b\u0008c\u000Bd\u001Fe￾f\tg\nh')).toBe('abcdef\tg\nh')
  })
})

describe('toRfc822', () => {
  it('formats a timestamp as RFC 822 in GMT', () => {
    expect(toRfc822('2026-07-24T00:15:17.658+00:00')).toBe('Fri, 24 Jul 2026 00:15:17 GMT')
    expect(toRfc822('2026-01-01T09:00:00+09:00')).toBe('Thu, 01 Jan 2026 00:00:00 GMT')
  })

  it('returns undefined for missing or unparseable values', () => {
    expect(toRfc822(null)).toBeUndefined()
    expect(toRfc822('')).toBeUndefined()
    expect(toRfc822('not a date')).toBeUndefined()
  })
})

describe('buildRssFeed', () => {
  it('produces RSS 2.0 that a real parser reads back with the expected fields', async () => {
    const xml = buildRssFeed([
      post(),
      post({
        slug: 'ragとは-生成aiの嘘を防ぐ仕組み',
        title: 'RAGとは <初心者向け> & "活用"',
        meta_description: null,
        published_at: null,
        created_at: '2025-06-01T03:00:00+00:00',
        updated_at: '2025-06-02T03:00:00+00:00',
      }),
    ])
    const feed = await new Parser().parseString(xml)

    expect(feed.title).toBe('株式会社エヌアンドエス 公式ブログ')
    expect(feed.link).toBe('https://nands.tech/posts')
    expect(feed.language).toBe('ja')
    expect(feed.items).toHaveLength(2)
    expect(feed.items[0]).toMatchObject({
      title: '自己修復するRAG設計術',
      link: 'https://nands.tech/posts/self-healing-rag',
      guid: 'https://nands.tech/posts/self-healing-rag',
      pubDate: 'Fri, 24 Jul 2026 00:15:17 GMT',
      creator: AUTHOR.name,
      content: 'RAG の誤答を検知して再検索する設計',
    })
    // 日本語 slug は canonical と同じくエンコード、pubDate は published_at が無ければ created_at
    expect(feed.items[1]).toMatchObject({
      title: 'RAGとは <初心者向け> & "活用"',
      link: postUrl('ragとは-生成aiの嘘を防ぐ仕組み'),
      pubDate: 'Sun, 01 Jun 2025 03:00:00 GMT',
      creator: '原田賢治',
    })
    expect(feed.items[1].link).toMatch(/^https:\/\/nands\.tech\/posts\/rag%E3%81%A8/)
  })

  it('declares the namespaces, a self link and permalink guids', () => {
    const xml = buildRssFeed([post()])
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"')).toBe(true)
    expect(xml).toContain('xmlns:dc="http://purl.org/dc/elements/1.1/"')
    expect(xml).toContain('xmlns:atom="http://www.w3.org/2005/Atom"')
    expect(xml).toContain(`<atom:link href="${FEED_URL}" rel="self" type="application/rss+xml"/>`)
    expect(xml).toContain('<guid isPermaLink="true">https://nands.tech/posts/self-healing-rag</guid>')
  })

  it('escapes markup in titles and descriptions so it cannot break out of the element', () => {
    const xml = buildRssFeed([post({ title: '</title><script>x</script>', meta_description: 'a]]>b & <c>' })])
    expect(xml).not.toContain('<script>')
    expect(xml).toContain('<title>&lt;/title&gt;&lt;script&gt;x&lt;/script&gt;</title>')
    expect(xml).toContain('<description>a]]&gt;b &amp; &lt;c&gt;</description>')
  })

  it('omits the description when meta_description is empty and collapses line breaks', () => {
    const [withBreaks, empty, blank] = itemBlocks(
      buildRssFeed([
        post({ slug: 'a', meta_description: ' 一行目\n\n二行目 ' }),
        post({ slug: 'b', meta_description: null }),
        post({ slug: 'c', meta_description: '  \n ' }),
      ])
    )
    expect(withBreaks).toContain('<description>一行目 二行目</description>')
    expect(empty).not.toContain('<description>')
    expect(blank).not.toContain('<description>')
  })

  it('keeps the given order and never prints "undefined"/"null" for bad dates', () => {
    const xml = buildRssFeed([
      post({ slug: 'first' }),
      post({ slug: 'second', published_at: null, created_at: 'garbage', updated_at: null }),
    ])
    const [first, second] = itemBlocks(xml)
    expect(first).toContain('/posts/first')
    expect(second).toContain('/posts/second')
    expect(second).not.toContain('<pubDate>')
    expect(xml).not.toMatch(/undefined|null|Invalid Date/)
  })

  it('sets lastBuildDate to the newest updated_at of the listed posts (not the current time)', () => {
    const xml = buildRssFeed([
      post({ slug: 'newer-published', updated_at: '2026-07-24T00:00:00Z' }),
      post({ slug: 'edited-later', published_at: '2026-01-01T00:00:00Z', updated_at: '2026-08-01T12:00:00Z' }),
    ])
    expect(xml).toContain('<lastBuildDate>Sat, 01 Aug 2026 12:00:00 GMT</lastBuildDate>')
    expect(buildRssFeed([])).not.toContain('<lastBuildDate>')
  })
})
