import { TwitterApi, ApiResponseError } from 'twitter-api-v2';

/**
 * X (Twitter) API Client
 *
 * このモジュールは既存機能から独立しており、
 * X API v2を使った投稿機能を提供します。
 */

/**
 * 環境変数が設定されているかチェック
 */
export function isTwitterConfigured(): boolean {
  return !!(
    process.env.TWITTER_API_KEY &&
    process.env.TWITTER_API_SECRET &&
    process.env.TWITTER_ACCESS_TOKEN &&
    process.env.TWITTER_ACCESS_TOKEN_SECRET
  );
}

/**
 * Twitter APIクライアントを取得
 * @throws 環境変数が設定されていない場合
 */
export function getTwitterClient(): TwitterApi {
  if (!isTwitterConfigured()) {
    throw new Error('Twitter API credentials are not configured');
  }

  return new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
  });
}

/**
 * Twitter API エラーから詳細メッセージを抽出
 */
export function extractTwitterErrorDetail(error: unknown): string {
  if (error instanceof ApiResponseError) {
    const code = error.code
    const apiData = error.data

    // v2 error detail (e.g. "You are not permitted to perform this action")
    const detail = apiData?.detail ?? apiData?.error ?? ''
    const title = apiData?.title ?? ''

    // v1/v2 error array
    const errorMessages = apiData?.errors
      ?.map((e) => {
        if ('message' in e) return (e as { message: string }).message
        if ('detail' in e) return (e as { detail: string }).detail
        return ''
      })
      .filter(Boolean)
      .join('; ')

    const parts = [`HTTP ${code}`]
    if (title) parts.push(title)
    if (detail) parts.push(detail)
    if (errorMessages) parts.push(`[${errorMessages}]`)

    if (code === 401) {
      parts.push(
        '→ 認証エラー: TWITTER_API_KEY / TWITTER_API_SECRET / TWITTER_ACCESS_TOKEN / TWITTER_ACCESS_TOKEN_SECRET を確認してください',
      )
    } else if (code === 403) {
      parts.push(
        '→ 権限エラー対処法: (1) X Developer Portalでアプリの権限を "Read and Write" に変更 ' +
          '(2) 権限変更後、Access Token と Secret を再生成 ' +
          '(3) Free tierの場合、POST /2/tweets は月1,500件まで',
      )
    } else if (code === 429) {
      const resetAt = error.rateLimit?.reset
        ? new Date(error.rateLimit.reset * 1000).toISOString()
        : 'unknown'
      parts.push(`→ レート制限: リセット時刻 ${resetAt}`)
    }

    return parts.join(' | ')
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Unknown error'
}

/**
 * 投稿結果の型定義
 */
export interface PostTweetResult {
  success: boolean;
  tweetId?: string;
  tweetUrl?: string;
  error?: string;
}

/**
 * 投稿オプション
 */
export interface PostTweetOptions {
  longForm?: boolean; // Premium長文投稿（280文字制限スキップ）
  mediaIds?: string[]; // メディアID (画像/動画)
}

/**
 * Xに投稿する
 * @param text 投稿テキスト
 * @param options 投稿オプション（省略時は280文字制限）
 */
/**
 * ツイートにリプライする
 * @param text リプライテキスト
 * @param inReplyToTweetId リプライ先のツイートID
 */
export async function replyToTweet(
  text: string,
  inReplyToTweetId: string,
): Promise<PostTweetResult> {
  if (!text || text.trim().length === 0) {
    return {
      success: false,
      error: 'リプライテキストが空です',
    };
  }

  try {
    const client = getTwitterClient();
    const result = await client.v2.reply(text, inReplyToTweetId);

    return {
      success: true,
      tweetId: result.data.id,
      tweetUrl: `https://twitter.com/i/web/status/${result.data.id}`,
    };
  } catch (error) {
    const detail = extractTwitterErrorDetail(error)
    console.error('Twitter API Reply Error:', detail, error)

    return {
      success: false,
      error: `リプライの投稿に失敗しました: ${detail}`,
    };
  }
}

/**
 * Xに投稿する
 * @param text 投稿テキスト
 * @param options 投稿オプション（省略時は280文字制限）
 */
export async function postTweet(text: string, options?: PostTweetOptions): Promise<PostTweetResult> {
  // テキストの検証
  if (!text || text.trim().length === 0) {
    return {
      success: false,
      error: '投稿テキストが空です',
    };
  }

  // 文字数制限チェック（Premium長文: 25,000文字、通常: 280文字）
  const TWEET_MAX_LENGTH = 280;
  const LONG_FORM_MAX_LENGTH = 25000;
  const maxLength = options?.longForm ? LONG_FORM_MAX_LENGTH : TWEET_MAX_LENGTH;
  if (text.length > maxLength) {
    return {
      success: false,
      error: `投稿テキストが${maxLength}文字を超えています（現在: ${text.length}文字）`,
    };
  }

  try {
    const client = getTwitterClient();
    const tweetParams: Record<string, unknown> = { text };
    if (options?.mediaIds?.length) {
      tweetParams.media = { media_ids: options.mediaIds };
    }
    const result = await client.v2.tweet(tweetParams);

    return {
      success: true,
      tweetId: result.data.id,
      tweetUrl: `https://twitter.com/i/web/status/${result.data.id}`,
    };
  } catch (error) {
    const detail = extractTwitterErrorDetail(error)
    console.error('Twitter API Error:', detail, error)

    return {
      success: false,
      error: `Xへの投稿に失敗しました: ${detail}`,
    };
  }
}
