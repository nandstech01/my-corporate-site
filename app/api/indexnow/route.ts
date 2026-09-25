import { NextRequest, NextResponse } from 'next/server';
import {
  INDEXNOW_SECRET_HEADER,
  checkSubmitSecret,
  submitToIndexNow,
} from '@/lib/indexnow/submit';

// IndexNow API - Bingへの即時インデックス通知
// https://www.indexnow.org/documentation
// キーファイル (public/<key>.txt) はそのまま。ここは通知の送信だけを行う。

export const runtime = 'edge'; // Edge Runtimeで高速化
export const dynamic = 'force-dynamic';

/**
 * 送信は x-indexnow-secret ヘッダ = env INDEXNOW_SUBMIT_SECRET のときだけ許可する。
 * env 未設定なら 503 (fail closed)、ヘッダ不一致なら 401。
 */
function rejectUnauthorized(request: NextRequest): NextResponse | null {
  const auth = checkSubmitSecret(request.headers.get(INDEXNOW_SECRET_HEADER));
  if (auth.ok) return null;
  return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
}

/**
 * IndexNow APIエンドポイント
 * POST /api/indexnow
 * Header: x-indexnow-secret
 * Body: { urls: string[] } - インデックス通知するURLの配列
 */
export async function POST(request: NextRequest) {
  const rejected = rejectUnauthorized(request);
  if (rejected) return rejected;

  try {
    const { urls } = await request.json();

    if (
      !urls ||
      !Array.isArray(urls) ||
      urls.length === 0 ||
      !urls.every((url) => typeof url === 'string')
    ) {
      return NextResponse.json(
        { success: false, error: 'URLs配列が必要です' },
        { status: 400 }
      );
    }

    console.log(`📢 IndexNow: ${urls.length}個のURLをBingに通知中...`);

    // IndexNow APIレスポンスコード
    // 200: OK - 成功
    // 202: Accepted - 受付済み
    // 400: Bad Request - リクエストエラー
    // 403: Forbidden - 認証エラー
    // 422: Unprocessable Entity - URL形式エラー
    // 429: Too Many Requests - レート制限
    const result = await submitToIndexNow(urls);

    if (result.ok) {
      console.log(`✅ IndexNow成功: ${urls.length}個のURLを通知完了`);
      return NextResponse.json({
        success: true,
        status: result.status,
        message: `${urls.length}個のURLをBingに通知しました`,
        urls,
      });
    }

    console.error(`❌ IndexNowエラー [${result.status}]:`, result.error);
    return NextResponse.json(
      {
        success: false,
        status: result.status,
        error: result.error,
      },
      // status 0 = IndexNow に届かなかった (通信エラー)
      { status: result.status || 500 }
    );
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
 * Header: x-indexnow-secret
 */
export async function GET(request: NextRequest) {
  const rejected = rejectUnauthorized(request);
  if (rejected) return rejected;

  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { success: false, error: 'URLパラメータが必要です' },
      { status: 400 }
    );
  }

  console.log(`📢 IndexNow (単一): ${url} をBingに通知中...`);

  const result = await submitToIndexNow([url]);

  if (result.ok) {
    console.log(`✅ IndexNow成功: ${url}`);
    return NextResponse.json({
      success: true,
      status: result.status,
      message: 'Bingに通知しました',
      url,
    });
  }

  console.error(`❌ IndexNowエラー [${result.status}]:`, result.error);
  return NextResponse.json(
    { success: false, status: result.status, error: result.error },
    { status: result.status || 500 }
  );
}
