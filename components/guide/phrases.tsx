/**
 * 日本語の改行位置をサーバーで決める (ガイドのページ専用)。
 *
 * - BudouX (npm budoux) の文節の区切りのうち、Intl.Segmenter の単語の区切りとも一致する所だけに <wbr> を入れる。
 *   CSS 側は word-break: keep-all なので、ブラウザはこの <wbr> と空白でしか改行しない (語の途中で折れない)
 * - 製品名 (Claude Code・Opus 5.5 など) と「数字 + 単位」(6 課題・31 秒) は改行しない空白 (U+00A0) でつなぐ。
 *   英数字の直後の空白 + ひらがな (Claude Code は) もつなぎ、行頭に助詞が来ないようにする
 * - 英数字だけの文字列には何もしない (空白で普通に改行する)
 *
 * budoux は linkedom を読み込むので、クライアント部品からは import しない (サーバー部品と純関数だけ)。
 */
import { Fragment, type ReactNode, Children, createElement, isValidElement } from 'react'
import { loadDefaultJapaneseParser } from 'budoux'

type Parser = ReturnType<typeof loadDefaultJapaneseParser>

let parser: Parser | undefined
let wordSegmenter: Intl.Segmenter | undefined

const NBSP = '\u00a0'
const JAPANESE = /[\u3040-\u30ff\u3400-\u9fff\uf900-\ufaff\uff01-\uff60]/
/** 1 つにつなぐ英字の並び (製品名) の最大の長さ。これより長い並び (Model Context Protocol) は空白で折り返してよい */
const MAX_BOUND_LATIN = 20

/**
 * 改行しない空白でつなぐ:
 * 1. 数字の後の空白 (6 課題 / 2026-09-28 実測 / 18/18 回)。英字の語の後の数字 (Opus 5.5) は除く
 * 2. 英数字や閉じ括弧の後の空白 + ひらがな (Claude Code は / MCP で)
 * 3. 大文字で始まる語 + (大文字で始まる語 | 数字) の並び (Claude Code / Opus 5.5 / Claude Code 2.1.283)。長すぎる並びはつながない
 */
export function bindSpaces(text: string): string {
  // 製品名の版 (Opus 5.5 完全ガイド) の後ろはつながない (長い 1 つの並びにしない)。その後ろの助詞は 2. でつながる
  let out = text.replace(/(?<![A-Za-z][A-Za-z0-9.+#-]*[ \u00a0])(?<![\d.,:/])(\d[\d,.:/%-]*) (?=\S)/g, `$1${NBSP}`)
  // 数字の前の「約・各・第」など、日付の「年・月」の後の空白 (約 4 割 / 2026 年 9 月 27 日)
  out = out.replace(/(約|各|全|第|計|毎|最大|最小|平均|合計|直近|年|月) (?=\d)/g, `$1${NBSP}`)
  out = out.replace(/([A-Za-z0-9)\]）」』%]) (?=[\u3041-\u3096])/g, `$1${NBSP}`)
  out = out.replace(/[A-Z][A-Za-z0-9.+#-]*(?:[ \u00a0][A-Z0-9][A-Za-z0-9.+#-]*)+/g, (run) =>
    run.length <= MAX_BOUND_LATIN ? run.replace(/ /g, NBSP) : run
  )
  return out
}

function segmentWords(text: string): Set<number> {
  wordSegmenter ??= new Intl.Segmenter('ja', { granularity: 'word' })
  return new Set(Array.from(wordSegmenter.segment(text), (part) => part.index))
}

/** これより長い文節は、文字の種類が変わる単語の区切りでも折れるようにする (狭い列で入り切らないとき語の途中で折れないように) */
const LONG_PHRASE = 12
const HIRAGANA = /[\u3041-\u3096]/
const NO_LINE_START = /[、。，．,.・：:；;？?！!）)\]」』】〕〉》”’ー…%％ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶ々]/

type Script = 'kana' | 'kanji' | 'latin' | 'other'
function scriptOf(char: string): Script {
  if (/[\u30a0-\u30ff]/.test(char)) return 'kana'
  if (/[\u3400-\u9fff\uf900-\ufaff]/.test(char)) return 'kanji'
  if (/[A-Za-z0-9]/.test(char)) return 'latin'
  return 'other'
}

/**
 * 長い文節 (レリバンスエンジニアリング専門家。) を、単語の区切りのうち文字の種類が変わる所 (カタカナ → 漢字、英字 → 漢字) で分ける。
 * ひらがな・約物の前、改行しない空白の隣では分けない (行頭に助詞や句点を置かない)。
 * 普通の空白はそれ自体が改行の機会なので、長さは空白で区切った 1 つずつで判断し、空白の所には <wbr> を足さない
 */
function splitLong(phrase: string): string[] {
  return phrase.split(/(?<= )/).reduce<string[]>((parts, piece) => {
    const [first, ...rest] = splitPiece(piece)
    const joined = parts.length > 0 ? [...parts.slice(0, -1), parts[parts.length - 1] + first] : [first]
    return [...joined, ...rest]
  }, [])
}

function splitPiece(piece: string): string[] {
  if (Array.from(piece).length <= LONG_PHRASE) return [piece]
  wordSegmenter ??= new Intl.Segmenter('ja', { granularity: 'word' })
  return Array.from(wordSegmenter.segment(piece), (part) => part.segment).reduce<string[]>((parts, segment) => {
    const previous = parts[parts.length - 1]
    if (previous === undefined) return [segment]
    const last = previous.slice(-1)
    const first = segment[0]
    const splittable =
      !HIRAGANA.test(first) &&
      !NO_LINE_START.test(first) &&
      last !== NBSP &&
      first !== NBSP &&
      !/\s/.test(first) &&
      scriptOf(last) !== 'other' &&
      scriptOf(first) !== 'other' &&
      scriptOf(last) !== scriptOf(first) &&
      (JAPANESE.test(last) || JAPANESE.test(first))
    return splittable ? [...parts, segment] : [...parts.slice(0, -1), previous + segment]
  }, [])
}

/**
 * 文節に分ける (つなげて元の文字列に戻る)。BudouX の区切りのうち、単語の区切りでもあり、
 * 改行しない空白の隣でもない所だけを区切りとして使う。日本語を含まない文字列は 1 つのまま
 */
export function phrases(text: string): string[] {
  if (!JAPANESE.test(text)) return [text]
  parser ??= loadDefaultJapaneseParser()
  const wordStarts = segmentWords(text)
  const out: string[] = []
  let current = ''
  let position = 0
  for (const chunk of parser.parse(text)) {
    const nearNbsp = text[position - 1] === NBSP || text[position] === NBSP
    if (current && wordStarts.has(position) && !nearNbsp) {
      out.push(current)
      current = chunk
    } else {
      current += chunk
    }
    position += chunk.length
  }
  if (current) out.push(current)
  return out.length > 0 ? out.flatMap(splitLong) : [text]
}

/** 文字列を「改行しない空白でつなぎ、文節の区切りに <wbr>」の React の要素にする */
export function phraseNodes(text: string): ReactNode {
  const parts = phrases(bindSpaces(text))
  if (parts.length === 1) return parts[0]
  return createElement(
    Fragment,
    null,
    ...parts.flatMap((part, index) => (index === 0 ? [part] : [createElement('wbr', { key: `w${index}` }), part]))
  )
}

/** 子の中の文字列だけを phraseNodes にする (要素はそのまま: 要素の中身はその部品が自分で処理する) */
export function withPhrases(children: ReactNode): ReactNode {
  const list = Children.toArray(children)
  const mapped = list.map((child, index) =>
    typeof child === 'string' ? createElement(Fragment, { key: `p${index}` }, phraseNodes(child)) : isValidElement(child) ? child : child
  )
  return mapped.length === 1 ? mapped[0] : mapped
}

/** 文字列を文節の区切り付きで描く (サーバー部品) */
export function Phrases({ text }: { text: string }) {
  return createElement(Fragment, null, phraseNodes(text))
}
