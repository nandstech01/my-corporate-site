/**
 * Playwright Session Management
 *
 * X (Twitter) のログインセッション（cookie）をSupabaseに永続化し、
 * GitHub Actions実行間でセッションを共有する。
 *
 * Bootstrap: X_PLAYWRIGHT_SESSION env var (JSON cookie array)
 * Persistence: x_playwright_sessions テーブル (Supabase)
 * Refresh: 毎cron実行後にcookieをSupabaseに書き戻し
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Cookie } from 'playwright'
import type { SessionData } from './types'

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

/**
 * セッションcookieを取得する。
 * 1. Supabaseから最新を取得
 * 2. Supabaseが使えない場合はenv varから取得
 */
export async function loadSessionCookies(): Promise<readonly Cookie[] | null> {
  // 1. Try Supabase first
  const supabase = getSupabase()
  if (supabase) {
    try {
      const { data } = await supabase
        .from('x_playwright_sessions')
        .select('cookies_json, updated_at')
        .eq('id', 'default')
        .single()

      if (data?.cookies_json) {
        const session = data as SessionData
        const cookies = JSON.parse(session.cookies_json) as Cookie[]
        if (cookies.length > 0) {
          process.stdout.write(
            `Playwright session: loaded from Supabase (updated ${session.updated_at})\n`,
          )
          return cookies
        }
      }
    } catch {
      // Fall through to env var
    }
  }

  // 2. Fallback to env var
  const envSession = process.env.X_PLAYWRIGHT_SESSION
  if (envSession) {
    try {
      const cookies = JSON.parse(envSession) as Cookie[]
      if (cookies.length > 0) {
        process.stdout.write('Playwright session: loaded from env var\n')
        return cookies
      }
    } catch {
      process.stdout.write('Playwright session: failed to parse X_PLAYWRIGHT_SESSION\n')
    }
  }

  return null
}

/**
 * セッションcookieをSupabaseに保存する（自動リフレッシュ）。
 */
export async function saveSessionCookies(
  cookies: readonly Cookie[],
): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) return

  try {
    await supabase.from('x_playwright_sessions').upsert(
      {
        id: 'default',
        cookies_json: JSON.stringify(cookies),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(`Playwright session: failed to save to Supabase: ${msg}\n`)
  }
}

/**
 * セッションが有効かどうかを判定する。
 * login wall検知用。ページタイトルやURLパターンで判定。
 */
export function isLoginWall(pageUrl: string, pageTitle: string): boolean {
  const loginPatterns = [
    '/i/flow/login',
    '/login',
    'Log in to X',
    'Log in to Twitter',
  ]
  return loginPatterns.some(
    (p) => pageUrl.includes(p) || pageTitle.includes(p),
  )
}

/**
 * エラーページかどうかを判定する。
 * rate limit, サスペンド, アクセス制限, サーバーエラーなどを検知。
 */
export function isErrorPage(pageUrl: string, pageTitle: string): string | null {
  const patterns: readonly { readonly match: string; readonly type: string }[] = [
    { match: '/account/access', type: 'account_restricted' },
    { match: 'account/access', type: 'account_restricted' },
    { match: 'Something went wrong', type: 'something_went_wrong' },
    { match: 'This account has been suspended', type: 'account_suspended' },
    { match: 'Hmm...this page doesn', type: 'page_not_found' },
    { match: 'Rate limit', type: 'rate_limited' },
    { match: 'Try again later', type: 'rate_limited' },
    { match: 'このページは存在しません', type: 'page_not_found' },
    { match: 'アカウントは凍結されています', type: 'account_suspended' },
  ]

  for (const p of patterns) {
    if (pageUrl.includes(p.match) || pageTitle.includes(p.match)) {
      return p.type
    }
  }

  return null
}
