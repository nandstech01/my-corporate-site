/**
 * IndexNow への URL 通知 (Bing など)。https://www.indexnow.org/documentation
 *
 * - /api/indexnow・/api/indexnow/submit-all (edge) と、記事公開のジョブ (Mac の tsx) の両方から使う。
 *   そのため next/* にも Node 専用 API にも依存しない (fetch だけ)。
 * - キーは env INDEXNOW_KEY。未設定なら公開済みのキーファイル public/<key>.txt と同じ値を使う
 *   (IndexNow のキーは公開ファイルで所有確認する仕組みで、秘密情報ではない)。
 * - 送信 API の呼び出し元の認証は INDEXNOW_SUBMIT_SECRET (x-indexnow-secret ヘッダ) で行う。こちらは秘密。
 */
import { SITE_URL } from '@/lib/structured-data/site-entities'

export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'
export const INDEXNOW_HOST = new URL(SITE_URL).host
/** 送信 API を呼ぶときに付けるヘッダ。値は env INDEXNOW_SUBMIT_SECRET と一致させる */
export const INDEXNOW_SECRET_HEADER = 'x-indexnow-secret'

/** public/b247e7b751dc4d84164c134151ee0814.txt (本番で 200) と同じ値 */
const PUBLISHED_KEY = 'b247e7b751dc4d84164c134151ee0814'

export interface IndexNowResult {
  /** IndexNow が 200 (OK) か 202 (Accepted) を返したら true */
  ok: boolean
  /** IndexNow の HTTP ステータス。送信しなかった・通信に失敗したときは 0 */
  status: number
  /** 失敗時の理由 (IndexNow のレスポンス本文、または通信エラー) */
  error?: string
}

export function getIndexNowKey(): string {
  return process.env.INDEXNOW_KEY || PUBLISHED_KEY
}

/**
 * URL をまとめて IndexNow に通知する (重複は除く)。例外は投げず、結果を返す。
 * IndexNow のステータス: 200 OK / 202 Accepted / 400 Bad Request / 403 キー不一致 /
 * 422 host と URL の不一致 / 429 レート制限。1 リクエスト最大 10,000 URL。
 */
export async function submitToIndexNow(urls: readonly string[]): Promise<IndexNowResult> {
  const urlList = Array.from(new Set(urls))
  if (urlList.length === 0) {
    return { ok: false, status: 0, error: '通知する URL がありません' }
  }

  const key = getIndexNowKey()
  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: INDEXNOW_HOST,
        key,
        keyLocation: `${SITE_URL}/${key}.txt`,
        urlList,
      }),
    })

    if (response.status === 200 || response.status === 202) {
      return { ok: true, status: response.status }
    }
    const errorText = await response.text().catch(() => '')
    return { ok: false, status: response.status, error: errorText || response.statusText }
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export type SubmitSecretCheck = { ok: true } | { ok: false; status: 401 | 503; error: string }

/**
 * 送信 API の認証。env INDEXNOW_SUBMIT_SECRET が未設定なら 503 (誰にも送信させない)、
 * ヘッダが無いか一致しなければ 401。
 */
export function checkSubmitSecret(
  provided: string | null | undefined,
  expected: string | undefined = process.env.INDEXNOW_SUBMIT_SECRET
): SubmitSecretCheck {
  if (!expected) {
    return { ok: false, status: 503, error: 'INDEXNOW_SUBMIT_SECRET が未設定のため送信できません' }
  }
  if (!provided || !constantTimeEqual(provided, expected)) {
    return { ok: false, status: 401, error: `${INDEXNOW_SECRET_HEADER} ヘッダが不正です` }
  }
  return { ok: true }
}

/** 文字列比較の所要時間から一致した長さを推測されないようにする (edge では node:crypto が使えないため自前) */
function constantTimeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length
  for (let i = 0; i < b.length; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ b.charCodeAt(i)
  }
  return diff === 0
}
