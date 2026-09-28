/**
 * SVG の中の文字の折り返し (サーバーで行う。SVG の <text> は自動で折り返さない)。
 * 幅は文字数からの見積もり: 全角 = 1、半角 = 0.55 (フォントサイズ 1 に対して)。
 * 日本語は Intl.Segmenter の単語単位で折り返し、語の途中で切らない。
 * 行頭に来てはいけない約物 (、。」 など) は前の語に付ける。
 */

const HALF_WIDTH_UNITS = 0.55

/** 文字列の幅 (フォントサイズ 1 あたり) の見積もり */
export function textUnits(text: string): number {
  let units = 0
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0
    units += code <= 0x7e || (code >= 0xff61 && code <= 0xff9f) ? HALF_WIDTH_UNITS : 1
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
