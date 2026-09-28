/**
 * 記事本文 (Markdown) から、表示用の数字・目次・日付を取り出す純関数。
 * ガイドのブロック (```nands-*) の JSON は本文として数えない。
 */
import { stripFencedCode, stripFencesWhere } from '@/lib/structured-data/markdown-fences'
import { isGuideFenceLang, latestChangelogDate } from './guide-blocks'

/** ガイドのブロックを除いた本文 (読了時間・文字数・FAQ 抽出用) */
export function withoutGuideBlocks(markdown: string): string {
  return stripFencesWhere(markdown, isGuideFenceLang)
}

export interface ReadingStats {
  /** 空白を除いた文字数 */
  readonly chars: number
  /** 1 分 400 字で切り上げ */
  readonly minutes: number
}

export function readingStats(markdown: string): ReadingStats {
  const chars = withoutGuideBlocks(markdown).replace(/\s+/g, '').length
  return { chars, minutes: Math.ceil(chars / 400) }
}

// ---------------------------------------------------------------------------
// 見出しの ID (本文の描画 components/blog/MarkdownContent と目次で同じ関数を使う)
// ---------------------------------------------------------------------------

const FRAGMENT_ID = /^(.*?)\s*\{#([^}]+)\}$/

export interface HeadingText {
  /** 表示する文字 ({#id} を除いたもの) */
  readonly text: string
  /** 要素の id。明示 ({#id}) が無ければ英数字だけから作る (日本語だけの見出しは '') */
  readonly id: string
  readonly explicit: boolean
}

/** 見出しの文字から表示文字と id を得る。明示の無い id の作り方は従来の記事と同じ (既存のリンクを壊さない) */
export function parseHeadingText(raw: string): HeadingText {
  const match = raw.match(FRAGMENT_ID)
  if (match) return { text: match[1].trim(), id: match[2], explicit: true }
  return {
    text: raw,
    id: raw.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
    explicit: false,
  }
}

/** 見出し行の簡単なインライン記法を落とし、描画後の文字に近づける */
function stripInlineMarkdown(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/`/g, '')
    .replace(/\*\*|__/g, '')
    .replace(/\*/g, '')
    .trim()
}

export interface GuideTocItem {
  readonly id: string
  readonly text: string
  readonly level: 2 | 3
}

/**
 * ガイドの目次 (h2・h3)。コードフェンスの中の # は数えない。
 * id が空・重複の見出しはリンク先が定まらないので載せない。
 */
export function extractGuideToc(markdown: string): GuideTocItem[] {
  const seen = new Set<string>()
  const items: GuideTocItem[] = []
  for (const line of stripFencedCode(markdown).split('\n')) {
    const match = line.match(/^(#{2,3})\s+(.+?)(?:\s+#+)?\s*$/)
    if (!match) continue
    const heading = parseHeadingText(stripInlineMarkdown(match[2]))
    if (!heading.id || seen.has(heading.id)) continue
    seen.add(heading.id)
    items.push({ id: heading.id, text: heading.text, level: match[1].length as 2 | 3 })
  }
  return items
}

// ---------------------------------------------------------------------------
// 日付
// ---------------------------------------------------------------------------

export interface DatedPost {
  readonly content: string
  readonly published_at: string | null
  readonly created_at: string
  readonly updated_at: string | null
}

/**
 * dateModified (= ページに出す「最終更新」)。
 * 本文に更新履歴 (```nands-changelog) があれば、その最新の日付 (日本時間 0:00)。
 * 言い回しの修正などで updated_at が動いても、更新履歴に載らない変更では日付を変えない。
 */
export function postModifiedAt(post: DatedPost, now: Date = new Date()): string {
  const changelog = latestChangelogDate(post.content, now)
  if (changelog) return `${changelog}T00:00:00+09:00`
  return post.updated_at ?? post.published_at ?? post.created_at
}

/** 日本時間の日付表示 (例: 2026/9/28)。サーバーの時刻帯 (Vercel は UTC) に左右されない */
export function formatJstDate(iso: string, options: Intl.DateTimeFormatOptions = {}): string {
  return new Date(iso).toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo', ...options })
}
