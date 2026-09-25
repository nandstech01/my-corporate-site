/**
 * sitemap (app/sitemap.ts)・RSS (app/feed.xml)・llms.txt (app/llms.txt) が共通で使う、
 * 記事の「公開日」「最終更新日」と 1 行テキストの決め方。3 か所で定義がずれないようにここだけで決める。
 */
import type { PublishedPostSummary } from './public-client'

export type DatedPost = Pick<PublishedPostSummary, 'published_at' | 'created_at' | 'updated_at'>

/** 公開日。published_at が NULL の記事 (posts 110 本中 80 本) は created_at を使う */
export function postPublishedAt(post: DatedPost): string {
  return post.published_at ?? post.created_at
}

/**
 * 最終更新日 (sitemap の lastmod、llms.txt の並び順)。
 * updated_at は管理画面での本文編集でだけ更新される (DB トリガーなし) ので、本文の更新日として使える。
 */
export function postLastModified(post: DatedPost): string {
  return post.updated_at ?? post.published_at ?? post.created_at
}

/** 日時文字列を Date にする。解釈できない値は undefined (Invalid Date を出力に混ぜない) */
export function parseDate(value: string | null | undefined): Date | undefined {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

/** 解釈できる日時のうち最も新しいもの。1 つも無ければ undefined */
export function latestDate(values: readonly (string | null | undefined)[]): Date | undefined {
  let latest: Date | undefined
  for (const value of values) {
    const date = parseDate(value)
    if (date && (!latest || date.getTime() > latest.getTime())) latest = date
  }
  return latest
}

/** 改行や連続する空白を 1 つの空白にまとめる (1 行で出す title / description 用) */
export function toOneLine(text: string | null | undefined): string {
  return (text ?? '').replace(/\s+/g, ' ').trim()
}
