import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Phrases, bindSpaces, phrases } from '@/components/guide/phrases'

const NBSP = '\u00a0'
const wordStarts = (text: string) =>
  new Set(Array.from(new Intl.Segmenter('ja', { granularity: 'word' }).segment(text), (part) => part.index))

/** 区切りの位置 (文字の位置) */
const boundaries = (parts: string[]) => parts.slice(0, -1).reduce<number[]>((acc, part) => [...acc, (acc[acc.length - 1] ?? 0) + part.length], [])

const SAMPLES = [
  'どのモデルを選べばいい？同じ課題で測りました',
  'Claude Code は外部のツールとどうつながる？',
  '当社の実測 (小さな 6 課題 × 3 回) では 4 つの設定がすべて 18/18 回成功。Opus 5.5 は Opus 5 の約半分の時間、約 4 割安い費用でした。',
  'Mike King理論に基づくレリバンスエンジニアリング専門家。生成AI検索最適化、ChatGPT・Perplexity対応のGEO実装。',
  '数値はすべて 2026 年 9 月 27 日の実測です。',
]

describe('文節の区切り (BudouX ∩ 単語の区切り)', () => {
  it.each(SAMPLES)('区切りはすべて単語の区切り、つなげると元に戻る: %s', (text) => {
    const bound = bindSpaces(text)
    const parts = phrases(bound)
    expect(parts.join('')).toBe(bound)
    const starts = wordStarts(bound)
    for (const at of boundaries(parts)) {
      expect(starts.has(at), `${bound.slice(0, at)}|${bound.slice(at)}`).toBe(true)
      // 改行しない空白の隣では区切らない。行頭に約物・ひらがなの助詞を置かない (空白の後を除く)
      expect(bound[at - 1] === NBSP || bound[at] === NBSP).toBe(false)
      expect(/[、。，．？！）」』]/.test(bound[at])).toBe(false)
    }
  })

  it('見出しの区切りの例', () => {
    expect(phrases(bindSpaces('どのモデルを選べばいい？同じ課題で測りました'))).toEqual(['どの', 'モデルを', '選べばいい？', '同じ', '課題で', '測りました'])
    // 12 字を超える文節は文字の種類が変わる所 (カタカナ → 漢字) でも区切る
    expect(phrases('レリバンスエンジニアリング専門家。')).toEqual(['レリバンスエンジニアリング', '専門家。'])
    // 普通の空白で区切られた短い語は分けない
    expect(phrases(bindSpaces('Claude Code 完全ガイド'))).toEqual([`Claude${NBSP}Code 完全ガイド`])
    expect(phrases(bindSpaces('Claude Opus 5.5 完全ガイド')).join('|')).not.toContain('完全|ガイド')
  })

  it('長い文節は約物の後ろで分け、複合語 (完全ガイド・エージェント型作業) は割らない', () => {
    // 2026-09-29 のレビュー: 「完全 / ガイド」「エージェント / 型作業」で折れていた (漢字とカタカナの境目で割っていた)
    const title = phrases(bindSpaces('Claude Opus 5.5 完全ガイド｜使い方・料金・性能を実測で比較'))
    expect(title.join('|')).not.toMatch(/完全\|ガイド/)
    expect(title).toContain('｜使い方・')
    expect(phrases(bindSpaces('長時間のエージェント型作業についての、公式の案内です。')).join('|')).not.toMatch(/エージェント\|型/)
    // 決して割らない語は BudouX が区切っても戻す
    expect(phrases('この完全ガイドでは').join('|')).not.toMatch(/完全\|ガイド/)
  })

  it('｜ の直後では区切らない (区切りは ｜ の前へ)。画面では ｜ の後ろに単語結合子を入れ、行末に ｜ を残さない', () => {
    const parts = phrases(bindSpaces('Opus 5.5 の使い方と性能を徹底比較｜Opus 5・ Fable 5.1 と料金・速さを実測'))
    for (const part of parts.slice(0, -1)) expect(part.endsWith('｜')).toBe(false)
    const html = renderToStaticMarkup(React.createElement(Phrases, { text: '徹底比較｜使い方' }))
    expect(html).toContain('｜\u2060')
  })

  it('日本語を含まない文字列はそのまま (空白で普通に折り返す)', () => {
    expect(phrases('Connect Claude Code to tools via MCP')).toEqual(['Connect Claude Code to tools via MCP'])
  })
})

describe('改行しない空白 (製品名・数字 + 単位・助詞の前)', () => {
  it.each([
    ['Claude Code', `Claude${NBSP}Code`],
    ['Opus 5.5 は', `Opus${NBSP}5.5${NBSP}は`],
    // 製品名の版の後ろの語とはつながない (Claude Opus 5.5 / 完全ガイド で折れる)
    ['Claude Opus 5.5 完全ガイド', `Claude${NBSP}Opus${NBSP}5.5 完全ガイド`],
    ['Claude Code 2.1.283 で', `Claude${NBSP}Code${NBSP}2.1.283${NBSP}で`],
    ['6 課題 × 3 回', `6${NBSP}課題 × 3${NBSP}回`],
    ['約 4 割', `約${NBSP}4${NBSP}割`],
    ['2026 年 9 月 27 日', `2026${NBSP}年${NBSP}9${NBSP}月${NBSP}27${NBSP}日`],
    ['MCP で', `MCP${NBSP}で`],
    // 長すぎる英字の並びはつながない (折り返せるように)
    ['Model Context Protocol', 'Model Context Protocol'],
    // 小文字のコマンドはつながない
    ['claude mcp add', 'claude mcp add'],
    // 製品名 + 版は並びが長くてもつなぐ
    ['Introducing Claude Opus 5.5 (Anthropic)', `Introducing Claude Opus${NBSP}5.5 (Anthropic)`],
    // 空白で囲んだダッシュは後ろの語につなぐ (行末に - を残さない)
    ['Claude Opus 5.5 - Claude Platform Docs', `Claude${NBSP}Opus${NBSP}5.5 -${NBSP}Claude${NBSP}Platform${NBSP}Docs`],
    // 数字 / 英字の単位
    ['入力 $4 / MTok', `入力 $4${NBSP}/${NBSP}MTok`],
  ])('%s', (input, expected) => {
    expect(bindSpaces(input)).toBe(expected)
  })
})

describe('Phrases (サーバー部品)', () => {
  it('文節の区切りに <wbr> を入れる', () => {
    expect(renderToStaticMarkup(React.createElement(Phrases, { text: '同じ課題で測りました' }))).toBe('同じ<wbr/>課題で<wbr/>測りました')
  })
})
