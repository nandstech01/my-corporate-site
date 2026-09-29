/**
 * 記事本文 (Markdown) から、表示用の数字・目次・日付を取り出す純関数。
 * ガイドのブロック (```nands-*) の JSON は本文として数えない。
 */
import { stripFencesWhere } from '@/lib/structured-data/markdown-fences'
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
// 見出しの ID (本文の描画 components/blog/MarkdownContent が使い、ガイドの目次も同じ描画結果から作る)
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

export interface GuideTocItem {
  readonly id: string
  readonly text: string
  readonly level: 2 | 3
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
 * 本文に更新履歴 (```nands-changelog) があれば、その最新の日付 (日本時間 0:00。公開時刻より前なら公開時刻)。
 * 言い回しの修正などで updated_at が動いても、更新履歴に載らない変更では日付を変えない。
 */
export function postModifiedAt(post: DatedPost, now: Date = new Date()): string {
  const published = post.published_at ?? post.created_at
  const changelog = latestChangelogDate(post.content, now)
  if (!changelog) return post.updated_at ?? published
  // 公開日と同じ日付の更新履歴 (初版) で dateModified が公開時刻より前にならないようにする
  const modified = `${changelog}T00:00:00+09:00`
  return Date.parse(modified) < Date.parse(published) ? published : modified
}

/** 日本時間の日付表示 (例: 2026/9/28)。サーバーの時刻帯 (Vercel は UTC) に左右されない */
export function formatJstDate(iso: string, options: Intl.DateTimeFormatOptions = {}): string {
  return new Date(iso).toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo', ...options })
}
