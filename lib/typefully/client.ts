/**
 * Typefully API クライアント（配信層シーム）
 *
 * X / Threads / LinkedIn への投稿・スケジュールを Typefully クラウドに委譲するための
 * 差し込み口。投稿タイミングを Typefully に任せることで、self-hosted ランナーの
 * 詰まり（cron が queued で滞留する問題）を構造的に回避する狙い。
 *
 * 【現状】API キー未取得のため既定では無効。
 *   isTypefullyConfigured() === false の間は何もせず、既存の postTweet 挙動を一切壊さない。
 *   キー取得後に下記を .env.local / GitHub Secrets に設定するだけで有効化される（ドロップイン）:
 *     TYPEFULLY_ENABLED=true
 *     TYPEFULLY_API_KEY=<your key>            # Typefully → Settings → API で発行
 *     TYPEFULLY_AUTO_RETWEET=true             # 任意: 自動セルフRT（伸ばしレバー）
 *     TYPEFULLY_AUTO_PLUG=true                # 任意: 伸びた投稿に自動リプ追加
 *     TYPEFULLY_SCHEDULE_DATE=next-free-slot  # 任意: 既定は最適枠に自動配置
 *
 * v1 API: https://api.typefully.com/v1
 *   POST /drafts/                      ヘッダ  X-API-KEY: Bearer <key>
 *     body: { content, threadify, share, "schedule-date", auto_retweet_enabled, auto_plug_enabled }
 *   GET  /drafts/recently-published/
 *   GET  /drafts/recently-scheduled/
 *   GET  /notifications/
 *
 * 参考: https://support.typefully.com/en/articles/8718287-typefully-api
 */

const TYPEFULLY_API_BASE =
  process.env.TYPEFULLY_API_BASE || 'https://api.typefully.com/v1'

/**
 * Typefully 配信が有効か（キー設定 + 明示フラグの両方が必要）
 */
export function isTypefullyConfigured(): boolean {
  return (
    process.env.TYPEFULLY_ENABLED === 'true' && !!process.env.TYPEFULLY_API_KEY
  )
}

export interface TypefullyDraftOptions {
  /** content を Typefully 側で自動スレッド分割する */
  threadify?: boolean
  /** share URL を発行する */
  share?: boolean
  /** "next-free-slot" または ISO8601。未指定なら下書きのまま（投稿しない） */
  scheduleDate?: string
  /** 投稿後に自動セルフRT */
  autoRetweetEnabled?: boolean
  /** 伸びた投稿へ自動でリプを追加（auto-plug） */
  autoPlugEnabled?: boolean
}

export interface TypefullyDraftResult {
  success: boolean
  draftId?: string
  shareUrl?: string
  scheduledDate?: string
  error?: string
}

/**
 * Typefully にドラフトを作成（必要ならスケジュール投稿）する。
 * 複数ツイートを1スレッドにする場合は content を 4連続改行で区切るか threadify=true。
 */
export async function createTypefullyDraft(
  content: string,
  options?: TypefullyDraftOptions,
): Promise<TypefullyDraftResult> {
  if (!isTypefullyConfigured()) {
    return {
      success: false,
      error:
        'Typefully未設定（TYPEFULLY_ENABLED / TYPEFULLY_API_KEY）。差し込み口のみ実装済み。',
    }
  }

  if (!content || content.trim().length === 0) {
    return { success: false, error: 'contentが空です' }
  }

  try {
    const body: Record<string, unknown> = { content }
    if (options?.threadify !== undefined) body.threadify = options.threadify
    if (options?.share !== undefined) body.share = options.share
    if (options?.scheduleDate) body['schedule-date'] = options.scheduleDate
    if (options?.autoRetweetEnabled !== undefined)
      body.auto_retweet_enabled = options.autoRetweetEnabled
    if (options?.autoPlugEnabled !== undefined)
      body.auto_plug_enabled = options.autoPlugEnabled

    const res = await fetch(`${TYPEFULLY_API_BASE}/drafts/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': `Bearer ${process.env.TYPEFULLY_API_KEY}`,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return { success: false, error: `Typefully API ${res.status}: ${text}` }
    }

    const data = (await res.json()) as {
      id?: number | string
      share_url?: string
      scheduled_date?: string
    }

    return {
      success: true,
      draftId: data.id != null ? String(data.id) : undefined,
      shareUrl: data.share_url,
      scheduledDate: data.scheduled_date,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Typefully draft作成エラー:', message)
    return { success: false, error: `Typefully draft作成で例外: ${message}` }
  }
}

/**
 * postTweet 互換ラッパー。
 * PostTweetResult と同じ形（success / tweetId / tweetUrl / error）で返すので、
 * x-api/client.ts の postTweet / postThread からそのまま委譲できる。
 *
 * Typefully はスケジュール投稿のため即時 tweetId は得られない。
 * draftId / shareUrl を tweetId / tweetUrl 相当として返す。
 */
export async function publishViaTypefully(
  text: string,
  options?: { threadify?: boolean },
): Promise<{
  success: boolean
  tweetId?: string
  tweetUrl?: string
  error?: string
}> {
  const result = await createTypefullyDraft(text, {
    threadify: options?.threadify ?? false,
    share: true,
    scheduleDate: process.env.TYPEFULLY_SCHEDULE_DATE || 'next-free-slot',
    autoRetweetEnabled: process.env.TYPEFULLY_AUTO_RETWEET === 'true',
    autoPlugEnabled: process.env.TYPEFULLY_AUTO_PLUG === 'true',
  })

  if (!result.success) {
    return { success: false, error: result.error }
  }

  return {
    success: true,
    tweetId: result.draftId,
    tweetUrl: result.shareUrl,
  }
}

export interface TypefullyPublishedItem {
  id: string
  text?: string
  twitterUrl?: string
  publishedOn?: string
  numTweets?: number
}

/**
 * 最近公開された投稿を取得（学習バックフィル用の入口）。
 * impressions=0 問題の緩和に向けて、将来 x_post_analytics への取り込みに使う。
 */
export async function getRecentlyPublished(): Promise<{
  items: TypefullyPublishedItem[]
  error?: string
}> {
  if (!isTypefullyConfigured()) {
    return { items: [], error: 'Typefully未設定' }
  }

  try {
    const res = await fetch(`${TYPEFULLY_API_BASE}/drafts/recently-published/`, {
      headers: {
        'X-API-KEY': `Bearer ${process.env.TYPEFULLY_API_KEY}`,
      },
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return { items: [], error: `Typefully API ${res.status}: ${text}` }
    }

    const data = (await res.json()) as Array<{
      id?: number | string
      text?: string
      twitter_url?: string
      published_on?: string
      num_tweets?: number
    }>

    const items = (Array.isArray(data) ? data : []).map((d) => ({
      id: d.id != null ? String(d.id) : '',
      text: d.text,
      twitterUrl: d.twitter_url,
      publishedOn: d.published_on,
      numTweets: d.num_tweets,
    }))

    return { items }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { items: [], error: `Typefully recently-published取得で例外: ${message}` }
  }
}
