/**
 * RSS 2.0 フィード (/feed.xml) の組み立て (純関数)。記事の取得は route.ts、ここは文字列にするだけ。
 * guid = 記事の canonical URL (isPermaLink)、pubDate = published_at ?? created_at、
 * dc:creator = 著者 Person の name、description = meta_description (空なら出さない)。
 */
import type { PublishedPostSummary } from '@/app/posts/_lib/public-client'
import {
  latestDate,
  parseDate,
  postLastModified,
  postPublishedAt,
  toOneLine,
} from '@/app/posts/_lib/syndication'
import { AUTHOR, ORGANIZATION, SITE_URL, postUrl } from '@/lib/structured-data/site-entities'

/** フィードに載せる件数 (公開日の新しい順) */
export const FEED_ITEM_LIMIT = 50

export const FEED_URL = `${SITE_URL}/feed.xml`

const CHANNEL = {
  title: `${ORGANIZATION.name} 公式ブログ`,
  link: `${SITE_URL}/posts`,
  description: `${ORGANIZATION.name}の公式ブログ。生成AI・AI開発・リスキリングに関する記事を公開しています。`,
  language: 'ja',
} as const

export type FeedPost = Pick<
  PublishedPostSummary,
  'slug' | 'title' | 'meta_description' | 'published_at' | 'created_at' | 'updated_at'
>

// XML 1.0 で使えない制御文字 (タブ・改行・復帰以外の C0 と U+FFFE/U+FFFF)。1 文字でも混ざるとフィード全体が読めなくなる
const INVALID_XML_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g

/** 要素の中身と属性値の両方に使える XML エスケープ */
export function escapeXml(text: string): string {
  return text
    .replace(INVALID_XML_CHARS, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** RFC 822 形式 (RFC 1123 の 4 桁年)。例: "Fri, 24 Jul 2026 00:15:17 GMT"。解釈できない値は undefined */
export function toRfc822(value: string | null | undefined): string | undefined {
  return parseDate(value)?.toUTCString()
}

function renderItem(post: FeedPost): string {
  const url = escapeXml(postUrl(post.slug))
  const pubDate = toRfc822(postPublishedAt(post))
  const description = toOneLine(post.meta_description)
  const lines = [
    '    <item>',
    `      <title>${escapeXml(toOneLine(post.title))}</title>`,
    `      <link>${url}</link>`,
    `      <guid isPermaLink="true">${url}</guid>`,
    pubDate ? `      <pubDate>${pubDate}</pubDate>` : null,
    `      <dc:creator>${escapeXml(AUTHOR.name)}</dc:creator>`,
    description ? `      <description>${escapeXml(description)}</description>` : null,
    '    </item>',
  ]
  return lines.filter((line): line is string => line !== null).join('\n')
}

/**
 * posts を渡された順 (listPublishedPosts の公開日の新しい順) のまま item にする。件数は呼び出し側で絞る。
 * lastBuildDate は載せた記事の最終更新日の最大値 (new Date() は再生成のたびに変わってしまうので使わない)。
 */
export function buildRssFeed(posts: readonly FeedPost[]): string {
  const lastBuildDate = latestDate(posts.map(postLastModified))
  const channelLines = [
    `    <title>${escapeXml(CHANNEL.title)}</title>`,
    `    <link>${escapeXml(CHANNEL.link)}</link>`,
    `    <description>${escapeXml(CHANNEL.description)}</description>`,
    `    <language>${CHANNEL.language}</language>`,
    `    <atom:link href="${escapeXml(FEED_URL)}" rel="self" type="application/rss+xml"/>`,
    lastBuildDate ? `    <lastBuildDate>${lastBuildDate.toUTCString()}</lastBuildDate>` : null,
  ].filter((line): line is string => line !== null)

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    '  <channel>',
    ...channelLines,
    ...posts.map(renderItem),
    '  </channel>',
    '</rss>',
    '',
  ].join('\n')
}
