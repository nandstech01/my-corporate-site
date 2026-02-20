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
        '→ 403原因: (1) CJK文字数超過（日本語は2文字換算、280加重文字制限） ' +
          '(2) アプリ権限が "Read and Write" でない場合はX Developer Portalで変更→トークン再生成 ' +
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
 * Twitter加重文字数カウント
 * CJK文字（日本語・中国語・韓国語）は2文字、その他は1文字としてカウント
 * X APIはこの加重カウントで280文字制限を判定する
 */
export function getTwitterWeightedLength(text: string): number {
  let weighted = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0;
    if (
      (cp >= 0x1100 && cp <= 0x115f) ||  // Hangul Jamo
      (cp >= 0x2e80 && cp <= 0x9fff) ||  // CJK Unified
      (cp >= 0xac00 && cp <= 0xd7ff) ||  // Hangul Syllables
      (cp >= 0xf900 && cp <= 0xfaff) ||  // CJK Compatibility
      (cp >= 0xfe30 && cp <= 0xfe6f) ||  // CJK Forms
      (cp >= 0xff01 && cp <= 0xff60) ||  // Fullwidth Forms
      (cp >= 0xffe0 && cp <= 0xffe6) ||  // Fullwidth Signs
      (cp >= 0x20000 && cp <= 0x2fa1f) || // CJK Extension B+
      (cp >= 0x3000 && cp <= 0x303f) ||  // CJK Symbols
      (cp >= 0x3040 && cp <= 0x309f) ||  // Hiragana
      (cp >= 0x30a0 && cp <= 0x30ff) ||  // Katakana
      (cp >= 0x31f0 && cp <= 0x31ff)     // Katakana Extension
    ) {
      weighted += 2;
    } else {
      weighted += 1;
    }
  }
  return weighted;
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

  // 文字数制限チェック（Twitter加重カウント: CJK=2文字）
  const TWEET_MAX_LENGTH = 280;
  const LONG_FORM_MAX_LENGTH = 25000;
  const maxLength = options?.longForm ? LONG_FORM_MAX_LENGTH : TWEET_MAX_LENGTH;
  const weightedLength = getTwitterWeightedLength(text);
  if (weightedLength > maxLength) {
    return {
      success: false,
      error: `投稿テキストが${maxLength}文字を超えています（加重カウント: ${weightedLength}文字、JS文字数: ${text.length}文字）`,
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
