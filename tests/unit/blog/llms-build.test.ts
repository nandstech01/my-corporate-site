import { describe, expect, it } from 'vitest'
import {
  OPTIONAL_LINKS,
  SERVICE_LINKS,
  buildLlmsTxt,
  formatFoundingDate,
  markdownLink,
  type LlmsPost,
} from '@/app/llms.txt/build'
import { AUTHOR, ORGANIZATION, postUrl } from '@/lib/structured-data/site-entities'

const post = (overrides: Partial<LlmsPost> = {}): LlmsPost => ({
  slug: 'self-healing-rag',
  title: '自己修復するRAG設計術',
  meta_description: 'RAG の誤答を検知して再検索する設計',
  published_at: '2026-07-24T00:15:17.658+00:00',
  created_at: '2026-07-24T00:15:17.666702+00:00',
  updated_at: '2026-07-24T00:15:17.666702+00:00',
  ...overrides,
})

/** "## 見出し" から次の見出しまでの本文行 (空行を除く) */
function section(text: string, heading: string): string[] {
  const lines = text.split('\n')
  const start = lines.indexOf(`## ${heading}`)
  if (start === -1) return []
  const rest = lines.slice(start + 1)
  const end = rest.findIndex((line) => line.startsWith('## '))
  return (end === -1 ? rest : rest.slice(0, end)).filter((line) => line.trim() !== '')
}

describe('buildLlmsTxt layout', () => {
  const text = buildLlmsTxt([post()])
  const lines = text.split('\n')

  it('starts with the company name as H1 followed by a blockquote summary', () => {
    expect(lines[0]).toBe(`# ${ORGANIZATION.name}`)
    expect(lines[1]).toBe('')
    expect(lines[2].startsWith('> ')).toBe(true)
    expect(lines.filter((line) => line.startsWith('# '))).toHaveLength(1)
  })

  it('has exactly the サービス, 記事 and Optional sections, in that order', () => {
    expect(lines.filter((line) => line.startsWith('## '))).toEqual(['## サービス', '## 記事', '## Optional'])
  })

  it('states the company facts from site-entities and none of the stale ones', () => {
    expect(text).toContain(ORGANIZATION.addressText)
    expect(text).toContain(ORGANIZATION.telephone)
    expect(text).toContain('設立: 2008年4月')
    expect(text).toContain(ORGANIZATION.corporateNumber)
    expect(text).toContain('contact@nands.tech')
    expect(text).toContain(AUTHOR.name)
    for (const stale of ['松原町', '077-526-6501', '2009', '520-0831']) {
      expect(text).not.toContain(stale)
    }
  })

  it('lists the services and optional pages as absolute nands.tech links, never the removed 404 pages', () => {
    expect(section(text, 'サービス')).toEqual(
      SERVICE_LINKS.map((link) => markdownLink(link.title, link.url, link.description))
    )
    expect(section(text, 'Optional')).toEqual(
      OPTIONAL_LINKS.map((link) => markdownLink(link.title, link.url, link.description))
    )
    const urls = Array.from(text.matchAll(/\]\(([^)]+)\)/g), (match) => match[1])
    expect(urls.length).toBeGreaterThan(SERVICE_LINKS.length)
    for (const url of urls) expect(url).toMatch(/^https:\/\/nands\.tech\//)
    for (const dead of ['/categories/ai-machine-learning', '/categories/system-development', '/special', '/chatgpt-special']) {
      expect(urls.some((url) => url.endsWith(dead))).toBe(false)
    }
    expect(urls).toContain(AUTHOR.url)
    expect(urls).toContain('https://nands.tech/feed.xml')
  })

  it('ends with a single trailing newline and has no custom robots-style directives', () => {
    expect(text.endsWith('\n')).toBe(true)
    expect(text.endsWith('\n\n')).toBe(false)
    expect(text).not.toMatch(/^(User-agent|Allow|Disallow|Priority):/m)
  })
})

describe('buildLlmsTxt articles', () => {
  it('lists every post, newest updated first, as "- [title](url): description"', () => {
    const text = buildLlmsTxt([
      post({ slug: 'published-newest', title: '公開が新しい', updated_at: '2026-07-24T00:00:00Z' }),
      post({ slug: 'ragとは-仕組み', title: '編集が新しい', updated_at: '2026-08-01T00:00:00Z', published_at: null }),
      post({ slug: 'no-updated-at', title: '更新日なし', updated_at: null, published_at: null, created_at: '2025-01-01T00:00:00Z' }),
    ])
    expect(section(text, '記事')).toEqual([
      `- [編集が新しい](${postUrl('ragとは-仕組み')}): RAG の誤答を検知して再検索する設計`,
      '- [公開が新しい](https://nands.tech/posts/published-newest): RAG の誤答を検知して再検索する設計',
      '- [更新日なし](https://nands.tech/posts/no-updated-at): RAG の誤答を検知して再検索する設計',
    ])
    expect(section(text, '記事')[0]).toContain('https://nands.tech/posts/rag%E3%81%A8')
  })

  it('does not mutate the input array', () => {
    const posts = [post({ slug: 'old', updated_at: '2025-01-01T00:00:00Z' }), post({ slug: 'new', updated_at: '2026-01-01T00:00:00Z' })]
    buildLlmsTxt(posts)
    expect(posts.map((p) => p.slug)).toEqual(['old', 'new'])
  })

  it('omits ": description" when meta_description is empty and keeps each entry on one line', () => {
    const text = buildLlmsTxt([
      post({ slug: 'a', title: '改行\nのある\tタイトル', meta_description: '一行目\n\n二行目', updated_at: '2026-02-01T00:00:00Z' }),
      post({ slug: 'b', title: '説明なし', meta_description: '', updated_at: '2026-01-01T00:00:00Z' }),
      post({ slug: 'c', title: '説明null', meta_description: null, updated_at: '2025-12-01T00:00:00Z' }),
    ])
    expect(section(text, '記事')).toEqual([
      '- [改行 のある タイトル](https://nands.tech/posts/a): 一行目 二行目',
      '- [説明なし](https://nands.tech/posts/b)',
      '- [説明null](https://nands.tech/posts/c)',
    ])
  })

  it('keeps the section when there are no posts', () => {
    const text = buildLlmsTxt([])
    expect(text).toContain('## 記事')
    expect(section(text, '記事')).toEqual([])
  })
})

describe('markdownLink', () => {
  it('escapes brackets and backslashes in the link text', () => {
    expect(markdownLink('[速報] a\\b', 'https://nands.tech/posts/x')).toBe(
      '- [\\[速報\\] a\\\\b](https://nands.tech/posts/x)'
    )
  })

  it('percent-encodes parentheses in the URL so they cannot end the link early', () => {
    expect(markdownLink('MCP (Model Context Protocol)', postUrl('mcp-(guide)'), '説明')).toBe(
      '- [MCP (Model Context Protocol)](https://nands.tech/posts/mcp-%28guide%29): 説明'
    )
  })
})

describe('formatFoundingDate', () => {
  it('formats year-month and year-month-day in Japanese', () => {
    expect(formatFoundingDate('2008-04')).toBe('2008年4月')
    expect(formatFoundingDate('2008-04-01')).toBe('2008年4月1日')
    expect(formatFoundingDate('2008')).toBe('2008')
  })
})
