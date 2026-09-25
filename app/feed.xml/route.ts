/**
 * /feed.xml — ブログの RSS 2.0 フィード (posts + chatgpt_posts の公開記事、新しい順に 50 件)。
 * cookie を使わない anon クライアントで取得し、1 時間ごとに再生成する (ISR)。
 * DB エラーは throw する: 再生成に失敗しても直前の正常なフィードが出続ける。
 */
import { listPublishedPosts } from '@/app/posts/_lib/public-client'
import { FEED_ITEM_LIMIT, buildRssFeed } from './build'

export const revalidate = 3600

export async function GET(): Promise<Response> {
  const posts = await listPublishedPosts({ limit: FEED_ITEM_LIMIT })
  return new Response(buildRssFeed(posts), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
