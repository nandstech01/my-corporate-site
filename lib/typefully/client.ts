/**
 * Typefully API クライアント（配信層シーム）— API v2
 *
 * X / Threads / LinkedIn への投稿・スケジュールを Typefully クラウドに委譲するための
 * 差し込み口。投稿タイミングを Typefully に任せることで、self-hosted ランナーの
 * 詰まり（cron が queued で滞留する問題）を構造的に回避する狙い。
 *
 * 有効化（既定では無効＝既存の postTweet 挙動を一切壊さない）:
 *   TYPEFULLY_ENABLED=true
 *   TYPEFULLY_API_KEY=<key>                  # Typefully → Settings → API で発行
 *   TYPEFULLY_SOCIAL_SET_ID=<id>             # 任意。未指定なら最初の social set を自動使用
 *   TYPEFULLY_SCHEDULE_DATE=next-free-slot   # 任意。既定は最適枠に自動配置
 *   TYPEFULLY_PLATFORM=x                     # 任意。投稿先プラットフォーム（既定 x）
 *
 * ※ v1 (X-API-KEY) は廃止。v2 は Authorization: Bearer + social-set 単位の drafts。
 * ※ auto-retweet / auto-plug / threadify は v2 では本文パラメータではなく
 *    アカウント設定として自動適用される。
 *
 * v2 API: https://api.typefully.com
 *   GET  /v2/social-sets                       → { results: [{ id, username, name }], ... }
 *   POST /v2/social-sets/{social_set_id}/drafts
 *        body: { platforms: { x: { enabled, posts: [{ text }] } }, draft_title?, share?, publish_at? }
 *        publish_at: 省略=下書き / "now" / "next-free-slot" / ISO8601
 *
 * 参考: https://typefully.com/docs/api
 */

const TYPEFULLY_API_BASE =
  process.env.TYPEFULLY_API_BASE || 'https://api.typefully.com'

type TypefullyPlatform = 'x' | 'linkedin' | 'threads' | 'mastodon' | 'bluesky'

function authHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.TYPEFULLY_API_KEY}`,
  }
}

/**
 * Typefully 配信が有効か（キー設定 + 明示フラグの両方が必要）
 */
export function isTypefullyConfigured(): boolean {
  return (
    process.env.TYPEFULLY_ENABLED === 'true' && !!process.env.TYPEFULLY_API_KEY
  )
}

let cachedSocialSetId: string | null = null

/**
 * 投稿対象の social set ID を解決する。
 * TYPEFULLY_SOCIAL_SET_ID があればそれを、無ければ最初の social set を使う。
 */
export async function resolveSocialSetId(): Promise<string | null> {
  const fromEnv = process.env.TYPEFULLY_SOCIAL_SET_ID
  if (fromEnv) return fromEnv
  if (cachedSocialSetId) return cachedSocialSetId

  try {
    const res = await fetch(`${TYPEFULLY_API_BASE}/v2/social-sets`, {
      headers: authHeaders(),
    })
    if (!res.ok) {
      console.error(`Typefully social-sets取得失敗 ${res.status}: ${await res.text().catch(() => '')}`)
      return null
    }
    const data = (await res.json()) as { results?: Array<{ id: number | string }> }
    const first = data.results?.[0]?.id
    if (first == null) return null
    cachedSocialSetId = String(first)
    return cachedSocialSetId
  } catch (err) {
    console.error('Typefully social-sets例外:', err instanceof Error ? err.message : String(err))
    return null
  }
}

export interface TypefullyDraftOptions {
  /** "next-free-slot" / "now" / ISO8601。未指定なら下書き保存（投稿しない） */
  scheduleDate?: string
  /** share URL を発行する */
  share?: boolean
  /** 投稿先プラットフォーム（既定: TYPEFULLY_PLATFORM または 'x'） */
  platform?: TypefullyPlatform
  /** 下書きタイトル（管理用） */
  draftTitle?: string
  /** social set ID を明示指定（省略時は自動解決） */
  socialSetId?: string
  /** 添付メディアID（uploadTypefullyMedia で取得）。先頭ポストに付与 */
  mediaIds?: string[]
}

export interface TypefullyDraftResult {
  success: boolean
  draftId?: string
  shareUrl?: string
  error?: string
}

/**
 * content を Typefully のスレッド投稿配列に変換する。
 * 4連続改行で区切られていれば複数ポスト（スレッド）に分割。
 */
function toPosts(content: string): Array<{ text: string }> {
  const segments = content.split(/\n{4,}/).map((s) => s.trim()).filter(Boolean)
  return (segments.length > 0 ? segments : [content]).map((text) => ({ text }))
}

/**
 * Typefully にドラフトを作成（必要ならスケジュール投稿）する。
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

  const socialSetId = options?.socialSetId ?? (await resolveSocialSetId())
  if (!socialSetId) {
    return { success: false, error: 'social setが解決できません（TYPEFULLY_SOCIAL_SET_ID未設定 or 取得失敗）' }
  }

  const platform = options?.platform ?? (process.env.TYPEFULLY_PLATFORM as TypefullyPlatform) ?? 'x'

  const basePosts = toPosts(content)
  const posts = options?.mediaIds?.length
    ? basePosts.map((p, i) =>
        i === 0 ? { ...p, media_ids: options.mediaIds } : p,
      )
    : basePosts

  const body: Record<string, unknown> = {
    platforms: {
      [platform]: {
        enabled: true,
        posts,
      },
    },
  }
  if (options?.draftTitle) body.draft_title = options.draftTitle
  if (options?.share !== undefined) body.share = options.share
  // publish_at を省略すると下書き保存（投稿されない）。
  if (options?.scheduleDate) body.publish_at = options.scheduleDate

  try {
    // メディアアップロード直後は media が処理中(processing)になることがあるため、
    // 400 + processing の場合は数秒待って数回リトライする。
    let res: Response | undefined
    for (let attempt = 0; attempt < 4; attempt++) {
      res = await fetch(
        `${TYPEFULLY_API_BASE}/v2/social-sets/${socialSetId}/drafts`,
        {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(body),
        },
      )
      if (res.ok) break
      const text = await res.text().catch(() => '')
      if (res.status === 400 && /processing/i.test(text) && attempt < 3) {
        await new Promise((r) => setTimeout(r, 4000))
        continue
      }
      return { success: false, error: `Typefully API ${res.status}: ${text}` }
    }
    if (!res || !res.ok) {
      return { success: false, error: 'Typefully draft作成に失敗（リトライ上限）' }
    }

    const data = (await res.json()) as {
      id?: number | string
      share_url?: string
      url?: string
    }

    return {
      success: true,
      draftId: data.id != null ? String(data.id) : undefined,
      shareUrl: data.share_url ?? data.url,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Typefully draft作成エラー:', message)
    return { success: false, error: `Typefully draft作成で例外: ${message}` }
  }
}

/**
 * 画像/メディアを Typefully にアップロードし media_id を返す。
 * v2フロー: (1) /media/upload で media_id + 署名付きURL取得 (2) 署名URLにrawバイトをPUT。
 * 取得した media_id は createTypefullyDraft の options.mediaIds に渡す。
 * 例: Gemini生成図解のbufferをXポストに添付する用途。
 */
export async function uploadTypefullyMedia(
  fileBytes: Uint8Array,
  fileName: string,
  socialSetId?: string,
): Promise<{ mediaId?: string; error?: string }> {
  if (!isTypefullyConfigured()) {
    return { error: 'Typefully未設定' }
  }
  const ssId = socialSetId ?? (await resolveSocialSetId())
  if (!ssId) {
    return { error: 'social setが解決できません' }
  }

  try {
    // (1) アップロードURLを取得
    const initRes = await fetch(
      `${TYPEFULLY_API_BASE}/v2/social-sets/${ssId}/media/upload`,
      {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ file_name: fileName }),
      },
    )
    if (!initRes.ok) {
      const t = await initRes.text().catch(() => '')
      return { error: `Typefully media/upload ${initRes.status}: ${t}` }
    }
    const init = (await initRes.json()) as {
      media_id?: string
      upload_url?: string
    }
    if (!init.media_id || !init.upload_url) {
      return { error: 'media_id / upload_url が取得できません' }
    }

    // (2) 署名付きURLへrawバイトをPUT（余計なヘッダを付けない）
    const putRes = await fetch(init.upload_url, {
      method: 'PUT',
      body: fileBytes as unknown as BodyInit,
    })
    if (!putRes.ok) {
      return { error: `署名URLへのPUT失敗 ${putRes.status}` }
    }

    return { mediaId: init.media_id }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Typefully media upload例外:', message)
    return { error: `media upload例外: ${message}` }
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
): Promise<{
  success: boolean
  tweetId?: string
  tweetUrl?: string
  error?: string
}> {
  const result = await createTypefullyDraft(text, {
    share: true,
    scheduleDate: process.env.TYPEFULLY_SCHEDULE_DATE || 'next-free-slot',
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
