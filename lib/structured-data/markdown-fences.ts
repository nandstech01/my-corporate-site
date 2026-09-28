/**
 * Markdown のコードフェンス (``` / ~~~) を行単位で見分ける小さな走査器。
 *
 * 目次・読了時間・ガイドのブロック抽出が、コードの中の `# コメント` やブロックの JSON を
 * 本文として数えないために使う。CommonMark のフェンス規則のうち、ここで必要な分だけを実装する:
 * - 開きは行頭 0〜3 スペース + 同じ文字 (` か ~) を 3 つ以上。` のフェンスの info に ` は入らない
 * - 閉じは同じ文字で開きと同じ長さ以上、後ろは空白だけ
 * - 閉じが無ければ文書の終わりまでがフェンス
 */

export interface TextSegment {
  readonly kind: 'text'
  readonly text: string
}

export interface FenceSegment {
  readonly kind: 'fence'
  /** info 文字列の最初の語 (例: "ts", "nands-stats")。無ければ '' */
  readonly lang: string
  /** 開きと閉じの行を除いた中身 */
  readonly body: string
  /** 開きの行番号 (1 始まり) */
  readonly line: number
  /** 開きと閉じの行を含む元の文字列 */
  readonly raw: string
}

export type MarkdownSegment = TextSegment | FenceSegment

const FENCE_OPEN = /^ {0,3}(`{3,}|~{3,})(.*)$/

function isClosingFence(line: string, marker: string): boolean {
  const match = line.match(/^ {0,3}(`{3,}|~{3,})\s*$/)
  return match !== null && match[1][0] === marker[0] && match[1].length >= marker.length
}

/** 文書をテキストとフェンスの区間に分ける (純関数) */
export function scanMarkdownFences(markdown: string): MarkdownSegment[] {
  const lines = markdown.split('\n')
  const segments: MarkdownSegment[] = []
  let text: string[] = []
  let i = 0

  const flushText = () => {
    if (text.length > 0) segments.push({ kind: 'text', text: text.join('\n') })
    text = []
  }

  while (i < lines.length) {
    const open = lines[i].match(FENCE_OPEN)
    const info = open ? open[2].trim() : ''
    if (!open || (open[1][0] === '`' && info.includes('`'))) {
      text.push(lines[i])
      i += 1
      continue
    }

    flushText()
    const marker = open[1]
    const start = i
    const body: string[] = []
    i += 1
    while (i < lines.length && !isClosingFence(lines[i], marker)) {
      body.push(lines[i])
      i += 1
    }
    const end = Math.min(i, lines.length - 1) // 閉じの行 (無ければ最終行)
    segments.push({
      kind: 'fence',
      lang: info.split(/\s+/)[0] ?? '',
      body: body.join('\n'),
      line: start + 1,
      raw: lines.slice(start, end + 1).join('\n'),
    })
    i += 1
  }
  flushText()
  return segments
}

/** フェンスを取り除いた本文 (見出しの抽出用)。フェンスの位置には空行を残す */
export function stripFencedCode(markdown: string): string {
  return scanMarkdownFences(markdown)
    .map((segment) => (segment.kind === 'text' ? segment.text : ''))
    .join('\n')
}

/** 指定した言語のフェンスだけを取り除いた本文 (例: ガイドのブロックを読了時間から除く) */
export function stripFencesWhere(markdown: string, drop: (lang: string) => boolean): string {
  return scanMarkdownFences(markdown)
    .flatMap((segment) => {
      if (segment.kind === 'text') return [segment.text]
      return drop(segment.lang) ? [] : [segment.raw]
    })
    .join('\n')
}
