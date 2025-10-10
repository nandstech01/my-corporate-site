import { NextRequest, NextResponse } from 'next/server';

// IndexNow API - Bingへの即時インデックス通知
// https://www.indexnow.org/documentation

export const runtime = 'edge'; // Edge Runtimeで高速化
export const dynamic = 'force-dynamic';

/**
 * IndexNow APIエンドポイント
 * POST /api/indexnow
 * Body: { urls: string[] } - インデックス通知するURLの配列
 */
export async function POST(request: NextRequest) {
  try {
    const { urls } = await request.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { success: false, error: 'URLs配列が必要です' },
        { status: 400 }
      );
    }

    const indexNowKey = process.env.INDEXNOW_KEY || 'b247e7b751dc4d84164c134151ee0814';
    const host = 'nands.tech';
    const keyLocation = `https://${host}/${indexNowKey}.txt`;

    console.log(`📢 IndexNow: ${urls.length}個のURLをBingに通知中...`);

    // IndexNow API仕様に従ってリクエスト
    const indexNowResponse = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        host,
        key: indexNowKey,
        keyLocation,
        urlList: urls,
      }),
    });

    const responseStatus = indexNowResponse.status;
    
    // IndexNow APIレスポンスコード
    // 200: OK - 成功
    // 202: Accepted - 受付済み
    // 400: Bad Request - リクエストエラー
    // 403: Forbidden - 認証エラー
    // 422: Unprocessable Entity - URL形式エラー
    // 429: Too Many Requests - レート制限

    if (responseStatus === 200 || responseStatus === 202) {
      console.log(`✅ IndexNow成功: ${urls.length}個のURLを通知完了`);
      return NextResponse.json({
        success: true,
        status: responseStatus,
        message: `${urls.length}個のURLをBingに通知しました`,
        urls,
      });
    } else {
      const errorText = await indexNowResponse.text();
      console.error(`❌ IndexNowエラー [${responseStatus}]:`, errorText);
      return NextResponse.json(
        {
          success: false,
          status: responseStatus,
          error: errorText,
        },
        { status: responseStatus }
      );
    }
  } catch (error) {
    console.error('❌ IndexNow送信エラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '不明なエラー',
      },
      { status: 500 }
    );
  }
}

/**
 * 単一URLを即座にBingに通知（簡易版）
 * GET /api/indexnow?url=https://nands.tech/posts/example
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { success: false, error: 'URLパラメータが必要です' },
      { status: 400 }
    );
  }

  try {
    const indexNowKey = process.env.INDEXNOW_KEY || 'b247e7b751dc4d84164c134151ee0814';
    const host = 'nands.tech';

    // 単一URL用の簡易リクエスト（GETパラメータ形式）
    const indexNowUrl = `https://api.indexnow.org/indexnow?url=${encodeURIComponent(url)}&key=${indexNowKey}`;

    console.log(`📢 IndexNow (単一): ${url} をBingに通知中...`);

    const response = await fetch(indexNowUrl);
    const status = response.status;

    if (status === 200 || status === 202) {
      console.log(`✅ IndexNow成功: ${url}`);
      return NextResponse.json({
        success: true,
        status,
        message: 'Bingに通知しました',
        url,
      });
    } else {
      const errorText = await response.text();
      console.error(`❌ IndexNowエラー [${status}]:`, errorText);
      return NextResponse.json(
        { success: false, status, error: errorText },
        { status }
      );
    }
  } catch (error) {
    console.error('❌ IndexNow送信エラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '不明なエラー',
      },
      { status: 500 }
    );
  }
}

