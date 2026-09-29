/**
 * 図の箱の中の文字の折り返し (サーバーで行う)。箱の大きさはこの結果から決まり、
 * HTML では 1 行ずつ white-space: nowrap で描くので、ブラウザが別の位置で折り返すことはない。
 *
 * 幅は文字数からの見積もり: 全角 = 1、半角 = 0.55 (大文字・数字は 0.68) (フォントサイズ 1 に対して)。
 * 実際の IBM Plex Sans JP より少し広めなので、見積もりに収まれば実際にも収まる。
 * 折り返す位置は文節 (phrases: BudouX の区切りのうち単語の区切りでもある所) と空白。
 * 1 つの文節が 1 行に入らないときだけ単語 → 1 文字の順に細かくする。
 */
import { bindSpaces, phrases } from './phrases'

/** 半角の幅 (フォントサイズ 1 あたり)。大文字・数字は小文字より広い */
const HALF_WIDTH_UNITS = 0.55
const WIDE_HALF_WIDTH_UNITS = 0.68

/** 文字列の幅 (フォントサイズ 1 あたり) の見積もり (少し広めに見積もる) */
export function textUnits(text: string): number {
  let units = 0
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0
    if (/[A-Z0-9MW@%&#]/.test(char)) units += WIDE_HALF_WIDTH_UNITS
    else if (code <= 0x7e || code === 0xa0 || (code >= 0xff61 && code <= 0xff9f)) units += HALF_WIDTH_UNITS
    else units += 1
  }
  return units
}

let segmenter: Intl.Segmenter | undefined

function words(text: string): string[] {
  segmenter ??= new Intl.Segmenter('ja', { granularity: 'word' })
  return Array.from(segmenter.segment(text), (part) => part.segment)
}

/** 折り返してよい単位: 文節を、さらに普通の空白の後ろで分ける (改行しない空白では分けない) */
function units(text: string): string[] {
  return phrases(bindSpaces(text)).flatMap((phrase) => phrase.split(/(?<= )/))
}

function hardSplit(word: string, maxUnits: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const char of Array.from(word)) {
    if (line && textUnits(line + char) > maxUnits) {
      lines.push(line)
      line = ''
    }
    line += char
  }
  return line ? [...lines, line] : lines
}

/** 1 行に入らない単位を単語 → 1 文字の順に分ける */
function splitUnit(unit: string, maxUnits: number): string[] {
  if (textUnits(unit.trim()) <= maxUnits) return [unit]
  return words(unit).flatMap((word) => (textUnits(word.trim()) <= maxUnits ? [word] : hardSplit(word, maxUnits)))
}

/** maxUnits (フォントサイズ 1 あたりの幅) に収まるように行に分ける */
export function wrapText(text: string, maxUnits: number): string[] {
  const limit = Math.max(1, maxUnits)
  const lines: string[] = []
  let line = ''
  for (const unit of units(text.trim()).flatMap((u) => splitUnit(u, limit))) {
    if (textUnits((line + unit).trim()) <= limit) {
      line += unit
      continue
    }
    if (line.trim()) lines.push(line.trim())
    line = unit.trimStart()
  }
  if (line.trim()) lines.push(line.trim())
  return lines.length > 0 ? lines : ['']
}
