/**
 * SVG の中の文字の折り返し (サーバーで行う。SVG の <text> は自動で折り返さない)。
 * 幅は文字数からの見積もり: 全角 = 1、半角 = 0.55 (大文字・数字は 0.68) (フォントサイズ 1 に対して)。
 * 日本語は Intl.Segmenter の単語単位で折り返し、語の途中で切らない。
 * 行頭に来てはいけない約物 (、。」 など) は前の語に付ける。
 */

/** 半角の幅 (フォントサイズ 1 あたり)。大文字・数字は小文字より広い */
const HALF_WIDTH_UNITS = 0.55
const WIDE_HALF_WIDTH_UNITS = 0.68

/** 文字列の幅 (フォントサイズ 1 あたり) の見積もり (少し広めに見積もる) */
export function textUnits(text: string): number {
  let units = 0
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0
    if (/[A-Z0-9MW@%&#]/.test(char)) units += WIDE_HALF_WIDTH_UNITS
    else if (code <= 0x7e || (code >= 0xff61 && code <= 0xff9f)) units += HALF_WIDTH_UNITS
    else units += 1
  }
  return units
}

const NO_LINE_START = /^[、。，．,.・：:；;？?！!）)\]」』】〕〉》”’ゝゞぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶ々ー…%％]+$/

let segmenter: Intl.Segmenter | null | undefined

function words(text: string): string[] {
  if (segmenter === undefined) {
    segmenter = typeof Intl !== 'undefined' && 'Segmenter' in Intl ? new Intl.Segmenter('ja', { granularity: 'word' }) : null
  }
  const raw = segmenter ? Array.from(segmenter.segment(text), (part) => part.segment) : Array.from(text)
  return raw.reduce<string[]>((merged, word) => {
    if (merged.length > 0 && NO_LINE_START.test(word)) {
      return [...merged.slice(0, -1), merged[merged.length - 1] + word]
    }
    return [...merged, word]
  }, [])
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

/** maxUnits (フォントサイズ 1 あたりの幅) に収まるように行に分ける */
export function wrapText(text: string, maxUnits: number): string[] {
  const limit = Math.max(1, maxUnits)
  const lines: string[] = []
  let line = ''
  for (const word of words(text.trim())) {
    if (textUnits(line + word) <= limit) {
      line += word
      continue
    }
    if (line.trim()) lines.push(line.trimEnd())
    const pieces = textUnits(word) > limit ? hardSplit(word.trim(), limit) : [word.trimStart()]
    lines.push(...pieces.slice(0, -1))
    line = pieces[pieces.length - 1] ?? ''
  }
  if (line.trim()) lines.push(line.trimEnd())
  return lines.length > 0 ? lines : ['']
}
