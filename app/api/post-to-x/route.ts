import { NextRequest, NextResponse } from 'next/server';
import { postTweet, isTwitterConfigured } from '@/lib/x-api/client';

/**
 * X (Twitter) 自動投稿 API エンドポイント
 *
 * このエンドポイントは既存のAPIから完全に独立しています。
 * POST /api/post-to-x
 */

export async function POST(request: NextRequest) {
  try {
    // 環境変数の設定チェック
    if (!isTwitterConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Twitter API credentials are not configured. Please set TWITTER_* environment variables.',
        },
        { status: 500 }
      );
    }

    // リクエストボディを解析
    const body = await request.json();
    const { text } = body;
    const longForm = body.longForm === true;

    // テキストの検証
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: '投稿テキストが必要です',
        },
        { status: 400 }
      );
    }

    // Xに投稿
    const result = await postTweet(text, longForm ? { longForm: true } : undefined);

    if (result.success) {
      return NextResponse.json({
        success: true,
        tweetId: result.tweetId,
        tweetUrl: result.tweetUrl,
        message: 'Xへの投稿が完了しました',
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Post to X API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET: API設定状態の確認
 */
export async function GET() {
  return NextResponse.json({
    configured: isTwitterConfigured(),
    message: isTwitterConfigured()
      ? 'Twitter API is configured'
      : 'Twitter API credentials are not set. Please configure TWITTER_* environment variables.',
  });
}
