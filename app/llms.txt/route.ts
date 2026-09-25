/**
 * /llms.txt — 会社情報・主要サービス・公開中の全記事 (posts + chatgpt_posts) の一覧 (https://llmstxt.org/)。
 * 旧 public/llms.txt は削除済み (public に同名ファイルがあるとこのルートが隠れる)。
 * cookie を使わない anon クライアントで取得し、1 時間ごとに再生成する (ISR)。
 * DB エラーは throw する: 再生成に失敗しても直前の正常な内容が出続ける。
 */
import { listPublishedPosts } from '@/app/posts/_lib/public-client'
import { buildLlmsTxt } from './build'

export const revalidate = 3600

export async function GET(): Promise<Response> {
  const posts = await listPublishedPosts()
  return new Response(buildLlmsTxt(posts), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
