import { describe, expect, it } from 'vitest'
import { AutoTOCSystem, type TOCItem } from '@/lib/structured-data/auto-toc-system'
import { scanMarkdownFences, stripFencedCode, stripFencesWhere } from '@/lib/structured-data/markdown-fences'
import {
  formatJstDate,
  parseHeadingText,
  postModifiedAt,
  readingStats,
  withoutGuideBlocks,
} from '@/app/posts/_lib/post-text'

const flatten = (items: readonly TOCItem[]): TOCItem[] => items.flatMap((item) => [item, ...flatten(item.children ?? [])])

const CONTENT = [
  '# 記事タイトル',
  '',
  '## はじめに {#intro}',
  '',
  '```bash',
  '# コードの中のコメント',
  '## これも見出しではない',
  'echo "<h2>not a heading</h2>"',
  '```',
  '',
  '~~~',
  '### チルダのフェンスの中',
  '~~~',
  '',
  '## Setup Guide',
  '',
  '```nands-stats',
  '{"items":[{"label":"# 見出しではない","value":1}]}',
  '```',
  '',
  '### 詳細 {#detail}',
].join('\n')

describe('目次: コードフェンスの中の # を数えない (全記事)', () => {
  it('AutoTOCSystem (記事ページの目次と JSON-LD の hasPart)', () => {
    const toc = new AutoTOCSystem({ minLevel: 1, maxLevel: 3 }).generateTOCFromHTML(CONTENT).toc
    expect(flatten(toc).map((item) => item.title)).toEqual(['記事タイトル', 'はじめに', 'Setup Guide', '詳細'])
  })

  it('フェンスの中の <h2> で HTML 扱いに切り替わらない', () => {
    const toc = new AutoTOCSystem().generateTOCFromHTML(CONTENT).toc
    expect(flatten(toc).map((item) => item.id)).toContain('intro')
  })

  it('見出しの id の作り方は従来どおり ({#id} 優先、無ければ英数字から)', () => {
    expect(parseHeadingText('料金 {#pricing}')).toEqual({ text: '料金', id: 'pricing', explicit: true })
    expect(parseHeadingText('Claude Code の使い方')).toEqual({ text: 'Claude Code の使い方', id: 'claude-code-', explicit: false })
  })
})

describe('フェンスの走査', () => {
  it('何も除かなければ元の文字列に戻る', () => {
    expect(stripFencesWhere(CONTENT, () => false)).toBe(CONTENT)
    expect(stripFencesWhere(`${CONTENT}\n`, () => false)).toBe(`${CONTENT}\n`)
  })

  it('言語名・行番号・閉じの無いフェンス', () => {
    const segments = scanMarkdownFences('a\n````md title\n```\ninner\n```\n````\nb\n```py\nunclosed')
    const fences = segments.filter((segment) => segment.kind === 'fence')
    expect(fences.map((f) => f.kind === 'fence' && [f.lang, f.line, f.body])).toEqual([
      ['md', 2, '```\ninner\n```'],
      ['py', 8, 'unclosed'],
    ])
    expect(stripFencedCode('x\n```\n# y\n```\nz')).toBe('x\n\nz')
  })

  it('CRLF の本文でもフェンスを見分ける', () => {
    const crlf = CONTENT.replace(/\n/g, '\r\n')
    expect(stripFencedCode(crlf)).toBe(stripFencedCode(CONTENT))
    const toc = new AutoTOCSystem({ minLevel: 1, maxLevel: 3 }).generateTOCFromHTML(crlf).toc
    expect(flatten(toc).map((item) => item.title)).toEqual(['記事タイトル', 'はじめに', 'Setup Guide', '詳細'])
  })
})

describe('読了時間・文字数: ガイドのブロックの JSON を数えない', () => {
  it('nands-* は除き、普通のコードは数える', () => {
    const body = '本文です。\n\n```ts\nconst a = 1\n```'
    const block = '\n\n```nands-stats\n{"items":[{"label":"とても長いラベル","value":1}]}\n```'
    expect(readingStats(body + block)).toEqual(readingStats(body))
    expect(withoutGuideBlocks(body + block).trimEnd()).toBe(body)
    expect(readingStats(body).chars).toBe(body.replace(/\s+/g, '').length)
    expect(readingStats('あ'.repeat(801)).minutes).toBe(3)
  })
})

describe('dateModified (= ページの最終更新)', () => {
  const post = {
    content: '本文',
    published_at: '2026-09-01T00:00:00Z',
    created_at: '2026-08-31T00:00:00Z',
    updated_at: '2026-09-25T12:00:00Z',
  }

  it('更新履歴があれば、その最新の日付 (日本時間 0:00)', () => {
    const content = '```nands-changelog\n{"entries":[{"date":"2026-09-20","change":"a"},{"date":"2026-09-10","change":"b"}]}\n```'
    expect(postModifiedAt({ ...post, content }, new Date('2026-09-28T00:00:00Z'))).toBe('2026-09-20T00:00:00+09:00')
  })

  it('更新履歴の日付が公開日と同じ日 (初版) なら、公開時刻より前にしない', () => {
    const content = '```nands-changelog\n{"entries":[{"date":"2026-09-01","change":"初版"}]}\n```'
    const published = { ...post, content, published_at: '2026-09-01T01:00:00Z' } // 日本時間 10:00
    expect(postModifiedAt(published, new Date('2026-09-28T00:00:00Z'))).toBe('2026-09-01T01:00:00Z')
  })

  it('無ければ updated_at → published_at → created_at', () => {
    expect(postModifiedAt(post)).toBe('2026-09-25T12:00:00Z')
    expect(postModifiedAt({ ...post, updated_at: null })).toBe('2026-09-01T00:00:00Z')
    expect(postModifiedAt({ ...post, updated_at: null, published_at: null })).toBe('2026-08-31T00:00:00Z')
  })

  it('表示は日本時間 (サーバーが UTC でも日付がずれない)', () => {
    expect(formatJstDate('2026-09-20T00:00:00+09:00')).toBe('2026/9/20')
    expect(formatJstDate('2026-09-27T16:00:00Z')).toBe('2026/9/28')
    expect(formatJstDate('2026-09-20T00:00:00+09:00', { month: 'numeric', day: 'numeric' })).toBe('9/20')
  })
})
