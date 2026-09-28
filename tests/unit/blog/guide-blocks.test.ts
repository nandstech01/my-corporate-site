import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import {
  MAX_CHART_ROWS,
  extractGuideBlocks,
  isSafeUrl,
  latestChangelogDate,
  parseGuideBlock,
  splitGuideHero,
} from '@/app/posts/_lib/guide-blocks'

const FIXTURE = readFileSync(path.join(__dirname, '../site/fixtures/guide-sample.md'), 'utf8')

const json = (value: unknown) => JSON.stringify(value)

function expectError(lang: string, raw: string, pattern?: RegExp) {
  const result = parseGuideBlock(lang, raw)
  expect(result.ok).toBe(false)
  if (!result.ok && pattern) expect(result.error).toMatch(pattern)
}

describe('parseGuideBlock: 正しいブロック', () => {
  it('見本のガイドのブロックはすべて検査に通る', () => {
    const blocks = extractGuideBlocks(FIXTURE)
    expect(blocks.map((block) => block.lang)).toEqual([
      'nands-hero',
      'nands-stats',
      'nands-chart',
      'nands-callout',
      'nands-diagram',
      'nands-decide',
      'nands-diagram',
      'nands-changelog',
      'nands-sources',
      'nands-cta',
    ])
    for (const block of blocks) {
      expect(block.result, `${block.lang} (${block.line} 行目)`).toMatchObject({ ok: true })
    }
  })

  it('型と中身を返す (前後の空白は無視)', () => {
    const result = parseGuideBlock('nands-callout', `  ${json({ tone: 'tip', body: '本文' })}\n`)
    expect(result).toEqual({ ok: true, block: { type: 'nands-callout', data: { tone: 'tip', body: '本文' } } })
  })

  it('diagram の edges は省略でき、空配列になる', () => {
    const result = parseGuideBlock('nands-diagram', json({ kind: 'cards', title: 't', nodes: [{ id: 'a', label: 'A' }] }))
    expect(result.ok && result.block.type === 'nands-diagram' && result.block.data.edges).toEqual([])
  })
})

describe('parseGuideBlock: 壊れた JSON・形の誤り', () => {
  it('JSON として読めない', () => {
    expectError('nands-stats', '{"items":[', /JSON として読めません/)
    expectError('nands-stats', '', /空/)
  })

  it('複数行の JSON は受け付けない (1 行で書く約束)', () => {
    expectError('nands-callout', '{"tone":"tip",\n"body":"x"}', /1 行/)
  })

  it('オブジェクト以外は受け付けない', () => {
    expectError('nands-stats', '[1,2]', /オブジェクト/)
    expectError('nands-stats', '"text"', /オブジェクト/)
  })

  it('未知のブロックと未知のキー', () => {
    expectError('nands-video', json({}), /未知のブロック/)
    expectError('nands-callout', json({ tone: 'tip', body: 'x', html: '<b>x</b>' }), /Unrecognized key/)
  })

  it('長すぎる JSON', () => {
    expectError('nands-callout', json({ tone: 'tip', body: 'x'.repeat(21_000) }), /長すぎます/)
  })
})

describe("parseGuideBlock: 文字列に '<' を入れない", () => {
  it.each([
    ['nands-stats', { items: [{ label: '<script>', value: 1 }] }],
    ['nands-chart', { title: 'a<b', rows: [{ label: 'x', value: 1 }] }],
    ['nands-callout', { tone: 'note', body: '<img src=x onerror=alert(1)>' }],
    ['nands-hero', { answer: ['ok', '<b>'] }],
    ['nands-changelog', { entries: [{ date: '2026-09-01', change: '</script>' }] }],
    [
      'nands-decide',
      { root: { question: 'q', options: [{ label: 'a', result: { title: 'x<y' } }, { label: 'b', result: { title: 'z' } }] } },
    ],
  ])('%s', (lang, value) => {
    expectError(lang, json(value), /'<'/)
  })
})

describe('parseGuideBlock: URL は https かサイト内パスだけ', () => {
  it.each([
    'javascript:alert(1)',
    'JAVASCRIPT:alert(1)',
    ' javascript:alert(1)',
    'data:text/html,hi',
    'http://example.com',
    '//evil.example.com/x',
    '/\\evil.example.com',
    'vbscript:x',
    'https://exa mple.com',
  ])('拒否: %s', (url) => {
    expect(isSafeUrl(url.trim())).toBe(false)
    expectError('nands-sources', json({ items: [{ title: 't', url }] }))
    expectError('nands-cta', json({ title: 't', button: { label: 'b', href: url } }))
  })

  it.each(['https://example.com/a?b=1#c', '/posts/claude-code', '/#contact-form'])('許可: %s', (url) => {
    expect(isSafeUrl(url)).toBe(true)
    expect(parseGuideBlock('nands-sources', json({ items: [{ title: 't', url }] })).ok).toBe(true)
  })

  it('hero の画像と選び方のリンクも同じ規則', () => {
    expectError('nands-hero', json({ answer: ['a'], image: { src: 'javascript:x', alt: 'a', width: 1, height: 1 } }))
    expectError(
      'nands-decide',
      json({ root: { question: 'q', options: [{ label: 'a', result: { title: 'x', href: 'javascript:x' } }, { label: 'b', result: { title: 'y' } }] } })
    )
  })
})

describe('parseGuideBlock: 件数の上限と数値', () => {
  const rows = (n: number) => Array.from({ length: n }, (_, i) => ({ label: `行${i}`, value: i }))

  it(`chart は ${MAX_CHART_ROWS} 行まで`, () => {
    expect(parseGuideBlock('nands-chart', json({ title: 't', rows: rows(MAX_CHART_ROWS) })).ok).toBe(true)
    expectError('nands-chart', json({ title: 't', rows: rows(MAX_CHART_ROWS + 1) }), /rows/)
  })

  it('chart の値は 0 以上の有限の数', () => {
    expectError('nands-chart', json({ title: 't', rows: [{ label: 'a', value: -1 }] }))
    expectError('nands-chart', json({ title: 't', rows: [{ label: 'a', value: '10' }] }))
    expectError('nands-chart', '{"title":"t","rows":[{"label":"a","value":1e999}]}')
  })

  it('stats は 6 件まで、diagram は 8 ノードまで', () => {
    const items = Array.from({ length: 7 }, (_, i) => ({ label: `l${i}`, value: i }))
    expectError('nands-stats', json({ items }))
    const nodes = Array.from({ length: 9 }, (_, i) => ({ id: `n${i}`, label: `ノード${i}` }))
    expectError('nands-diagram', json({ kind: 'cards', title: 't', nodes }))
  })

  it('changelog の日付は実在する YYYY-MM-DD', () => {
    expectError('nands-changelog', json({ entries: [{ date: '2026-02-30', change: 'x' }] }), /存在しない/)
    expectError('nands-changelog', json({ entries: [{ date: '2026/09/01', change: 'x' }] }), /YYYY-MM-DD/)
  })
})

describe('parseGuideBlock: 図と選び方の整合', () => {
  const node = (id: string) => ({ id, label: id.toUpperCase() })

  it('diagram: id の重複・存在しない矢印・自己ループ・循環・cards の矢印', () => {
    expectError('nands-diagram', json({ kind: 'flow', title: 't', nodes: [node('a'), node('a')] }), /重複/)
    expectError('nands-diagram', json({ kind: 'flow', title: 't', nodes: [node('a')], edges: [{ from: 'a', to: 'z' }] }), /存在しない/)
    expectError('nands-diagram', json({ kind: 'flow', title: 't', nodes: [node('a'), node('b')], edges: [{ from: 'a', to: 'a' }] }), /自分自身/)
    expectError(
      'nands-diagram',
      json({ kind: 'flow', title: 't', nodes: [node('a'), node('b')], edges: [{ from: 'a', to: 'b' }, { from: 'b', to: 'a' }] }),
      /循環/
    )
    expectError('nands-diagram', json({ kind: 'cards', title: 't', nodes: [node('a'), node('b')], edges: [{ from: 'a', to: 'b' }] }), /edges/)
    expectError(
      'nands-diagram',
      json({ kind: 'flow', title: 't', nodes: [node('a'), node('b')], edges: [{ from: 'a', to: 'b' }, { from: 'a', to: 'b', label: 'x' }] }),
      /2 回/
    )
    expectError(
      'nands-diagram',
      json({ kind: 'flow', title: 't', nodes: [node('a'), node('b')], edges: [{ from: 'a', to: 'b', label: 'とても長い矢印のラベルです' }] })
    )
  })

  it('diagram: flow の 1 段は 3 つまで (スマホの幅で 1 段に並べて読める数)', () => {
    const nodes = ['root', 'a', 'b', 'c', 'd'].map(node)
    const edges = ['a', 'b', 'c', 'd'].map((to) => ({ from: 'root', to }))
    expectError('nands-diagram', json({ kind: 'flow', title: 't', nodes, edges }), /3 つまで/)
    expect(parseGuideBlock('nands-diagram', json({ kind: 'flow', title: 't', nodes: nodes.slice(0, 4), edges: edges.slice(0, 3) })).ok).toBe(true)
  })

  it('diagram: flow の箱の文字は label 24 字・sub 40 字まで (timeline・cards は 40 / 60 字まで)。emphasis は 2 つまで', () => {
    const long = (n: number) => 'あ'.repeat(n)
    expectError('nands-diagram', json({ kind: 'flow', title: 't', nodes: [{ id: 'a', label: long(25) }] }), /24 字/)
    expectError('nands-diagram', json({ kind: 'flow', title: 't', nodes: [{ id: 'a', label: 'a', sub: long(41) }] }), /40 字/)
    expect(parseGuideBlock('nands-diagram', json({ kind: 'timeline', title: 't', nodes: [{ id: 'a', label: long(40), sub: long(60) }] })).ok).toBe(true)
    const emphasised = ['a', 'b', 'c'].map((id) => ({ id, label: id, emphasis: true }))
    expectError('nands-diagram', json({ kind: 'cards', title: 't', nodes: emphasised }), /emphasis/)
    expect(parseGuideBlock('nands-diagram', json({ kind: 'cards', title: 't', nodes: emphasised.slice(0, 2) })).ok).toBe(true)
  })

  it('hero.heading: 表紙の h1 (30 字まで・< は不可)。chart.legend: 強調した行の凡例 (30 字まで)', () => {
    const hero = (heading: string) => json({ heading, answer: ['答え'] })
    expect(parseGuideBlock('nands-hero', hero('Claude Opus 5.5 完全ガイド')).ok).toBe(true)
    expectError('nands-hero', hero('あ'.repeat(31)))
    expectError('nands-hero', hero('<b>見出し</b>'), /'<'/)
    const chart = (legend: string) => json({ title: 't', legend, rows: [{ label: 'a', value: 1, highlight: true }] })
    expect(parseGuideBlock('nands-chart', chart('既定の設定')).ok).toBe(true)
    expectError('nands-chart', chart('あ'.repeat(31)))
  })

  it('decide: 選択肢は result か next のどちらか 1 つ、深さは 3 段まで', () => {
    const leaf = (title: string) => ({ label: title, result: { title } })
    expectError(
      'nands-decide',
      json({ root: { question: 'q', options: [{ label: 'a', result: { title: 'x' }, next: { question: 'q2', options: [leaf('1'), leaf('2')] } }, leaf('b')] } }),
      /どちらか/
    )
    const nest = (depth: number): unknown =>
      depth === 1 ? { question: 'q', options: [leaf('x'), leaf('y')] } : { question: 'q', options: [{ label: 'n', next: nest(depth - 1) }, leaf('y')] }
    expect(parseGuideBlock('nands-decide', json({ root: nest(3) })).ok).toBe(true)
    expectError('nands-decide', json({ root: nest(4) }), /3 段/)
  })

  it('cta: 主の操作は button か form のどちらか 1 つ。副の操作 (secondary) も URL の規則を守る', () => {
    expectError('nands-cta', json({ title: '相談' }), /button か form/)
    expect(parseGuideBlock('nands-cta', json({ title: '相談', form: true })).ok).toBe(true)
    expectError('nands-cta', json({ title: '相談', form: true, button: { label: 'b', href: '/contact' } }), /1 つだけ/)
    expect(parseGuideBlock('nands-cta', json({ title: '相談', form: true, secondary: { label: '記事', href: '/posts/x' } })).ok).toBe(true)
    expectError('nands-cta', json({ title: '相談', form: true, secondary: { label: '記事', href: 'javascript:x' } }))
  })
})

describe('hero: 一文の説明・検証の環境・実際のコマンドの出力 (terminal)', () => {
  const lines = [
    { kind: 'cmd', text: 'claude --version' },
    { kind: 'out', text: '2.1.283 (Claude Code)' },
  ]

  it('terminal は cmd / out の行。字下げは残す', () => {
    const result = parseGuideBlock(
      'nands-hero',
      json({ lead: '説明', answer: ['a'], env: 'macOS 15.1', terminal: { lines: [...lines, { kind: 'out', text: '  - indented' }], caption: '実行した出力' } })
    )
    expect(result.ok).toBe(true)
    if (result.ok && result.block.type === 'nands-hero') {
      expect(result.block.data.terminal?.lines[2].text).toBe('  - indented')
      expect(result.block.data.env).toBe('macOS 15.1')
    }
  })

  it('terminal の上限と禁止: 16 行・1 行 200 字まで、最初はコマンド、< と制御文字と空白だけの行は不可、知らない種類は不可', () => {
    const many = Array.from({ length: 17 }, (_, i) => ({ kind: i === 0 ? 'cmd' : 'out', text: `line ${i}` }))
    expectError('nands-hero', json({ answer: ['a'], terminal: { lines: many } }), /lines/)
    expectError('nands-hero', json({ answer: ['a'], terminal: { lines: [{ kind: 'cmd', text: 'x'.repeat(201) }] } }))
    expectError('nands-hero', json({ answer: ['a'], terminal: { lines: [{ kind: 'out', text: 'ok' }] } }), /コマンド/)
    expectError('nands-hero', json({ answer: ['a'], terminal: { lines: [{ kind: 'cmd', text: 'echo <b>' }] } }), /'<'/)
    expectError('nands-hero', json({ answer: ['a'], terminal: { lines: [{ kind: 'cmd', text: 'a\u001b[31m' }] } }), /制御文字/)
    expectError('nands-hero', json({ answer: ['a'], terminal: { lines: [{ kind: 'cmd', text: '   ' }] } }), /空白/)
    expectError('nands-hero', json({ answer: ['a'], terminal: { lines: [{ kind: 'prompt', text: 'x' }] } }))
    expectError('nands-hero', json({ answer: ['a'], terminal: { lines, theme: 'mac' } }), /Unrecognized key/)
    expectError('nands-hero', json({ answer: ['a'], terminal: { lines: [] } }))
  })

  it('chart の行の highlight は真偽値だけ', () => {
    expect(parseGuideBlock('nands-chart', json({ title: 't', rows: [{ label: 'a', value: 1, highlight: true }] })).ok).toBe(true)
    expectError('nands-chart', json({ title: 't', rows: [{ label: 'a', value: 1, highlight: 'yes' }] }))
  })
})

describe('extractGuideBlocks / latestChangelogDate / splitGuideHero', () => {
  it('nands- で始まらないフェンスは対象外。未知の nands-* は検査で落ちる', () => {
    const blocks = extractGuideBlocks(['```ts', 'const a = 1', '```', '```nands-foo', '{}', '```'].join('\n'))
    expect(blocks).toHaveLength(1)
    expect(blocks[0]).toMatchObject({ lang: 'nands-foo', line: 4, result: { ok: false } })
  })

  it('更新履歴の最新の日付 (未来の日付と壊れたブロックは無視)', () => {
    const now = new Date('2026-09-28T03:00:00Z')
    expect(latestChangelogDate(FIXTURE, now)).toBe('2026-09-27')
    const withFuture = `${FIXTURE}\n\n\`\`\`nands-changelog\n${json({ entries: [{ date: '2026-12-01', change: 'typo' }] })}\n\`\`\`\n`
    expect(latestChangelogDate(withFuture, now)).toBe('2026-09-27')
    expect(latestChangelogDate('```nands-changelog\n{broken\n```', now)).toBeNull()
    expect(latestChangelogDate('# 本文だけ', now)).toBeNull()
  })

  it('日本時間の今日の日付は未来扱いしない', () => {
    // 2026-09-27T16:00Z = 日本時間 9/28 1:00
    const md = `\`\`\`nands-changelog\n${json({ entries: [{ date: '2026-09-28', change: 'x' }] })}\n\`\`\``
    expect(latestChangelogDate(md, new Date('2026-09-27T16:00:00Z'))).toBe('2026-09-28')
  })

  it('最初の hero を取り出し、本文からそのフェンスだけを除く', () => {
    const { hero, body, error } = splitGuideHero(FIXTURE)
    expect(error).toBeUndefined()
    expect(hero?.answer).toHaveLength(4)
    expect(hero?.terminal?.lines[0]).toEqual({ kind: 'cmd', text: 'claude --version' })
    expect(body).not.toContain('nands-hero')
    expect(body).toContain('## この記事でわかること {#summary}')
    expect(extractGuideBlocks(body)).toHaveLength(9)
  })

  it('hero が無い・壊れているとき', () => {
    expect(splitGuideHero('## 見出し')).toEqual({ hero: null, body: '## 見出し' })
    const broken = splitGuideHero('```nands-hero\n{"answer":[]}\n```\n本文')
    expect(broken.hero).toBeNull()
    expect(broken.body).toBe('本文')
    expect(broken.error).toMatch(/answer/)
  })
})
