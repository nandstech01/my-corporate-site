import { TwitterApi } from 'twitter-api-v2';

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
    console.error('Twitter API Reply Error:', error);

    let errorMessage = 'リプライの投稿に失敗しました';

    if (error instanceof Error) {
      if (error.message.includes('duplicate')) {
        errorMessage = '同一内容のリプライが既に存在します';
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'レート制限に達しました。しばらく待ってから再試行してください';
      } else if (error.message.includes('401') || error.message.includes('authentication')) {
        errorMessage = '認証エラー: API認証情報を確認してください';
      } else if (error.message.includes('403')) {
        errorMessage = 'アクセス権限エラー: アプリの権限設定を確認してください';
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      error: errorMessage,
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
    console.error('Twitter API Error:', error);

    // エラーメッセージを解析
    let errorMessage = 'Xへの投稿に失敗しました';

    if (error instanceof Error) {
      if (error.message.includes('duplicate')) {
        errorMessage = '同一内容の投稿が既に存在します';
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'レート制限に達しました。しばらく待ってから再試行してください';
      } else if (error.message.includes('401') || error.message.includes('authentication')) {
        errorMessage = '認証エラー: API認証情報を確認してください';
      } else if (error.message.includes('403')) {
        errorMessage = 'アクセス権限エラー: アプリの権限設定を確認してください';
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}
