import { NextRequest, NextResponse } from 'next/server';
import { listPublishedPosts } from '@/app/posts/_lib/public-client';
import {
  INDEXNOW_SECRET_HEADER,
  checkSubmitSecret,
  submitToIndexNow,
} from '@/lib/indexnow/submit';
import { AUTHOR, SITE_URL, postUrl } from '@/lib/structured-data/site-entities';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * サイトマップの全URLをBingに一括送信
 * GET /api/indexnow/submit-all
 * Header: x-indexnow-secret (= env INDEXNOW_SUBMIT_SECRET。未設定なら 503、不一致なら 401)
 */
export async function GET(request: NextRequest) {
  const auth = checkSubmitSecret(request.headers.get(INDEXNOW_SECRET_HEADER));
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const baseUrl = SITE_URL;

    // サイトマップと同じロジックで全URL収集
    const urls: string[] = [];

    // 1. 静的ページ
    const staticPages = [
      baseUrl,
      `${baseUrl}/about`,
      `${baseUrl}/lp`,
      `${baseUrl}/blog`,
      `${baseUrl}/sustainability`,
      `${baseUrl}/categories`,
      `${baseUrl}/reviews`,
      `${baseUrl}/posts`,
      AUTHOR.url,
    ];
    urls.push(...staticPages);

    // 2. 最重要サービスページ
    const servicePages = [
      `${baseUrl}/corporate`,
      `${baseUrl}/system-development`,
      `${baseUrl}/aio-seo`,
      `${baseUrl}/ai-agents`,
      `${baseUrl}/vector-rag`,
      `${baseUrl}/ai-site`,
      `${baseUrl}/chatbot-development`,
      `${baseUrl}/hr-solutions`,
      `${baseUrl}/mcp-servers`,
      `${baseUrl}/sns-automation`,
      `${baseUrl}/video-generation`,
      `${baseUrl}/reskilling`,
      `${baseUrl}/fukugyo`,
    ];
    urls.push(...servicePages);

    // 3. その他重要ページ (/special と /chatgpt-special は 404 のため除外)
    const additionalPages = [
      `${baseUrl}/legal`,
      `${baseUrl}/privacy`,
      `${baseUrl}/terms`,
      `${baseUrl}/faq`,
      `${baseUrl}/search`,
    ];
    urls.push(...additionalPages);

    // 4. ブログ記事（posts + chatgpt_posts の公開済み。slug 重複は除外済み）
    // 日本語 slug は canonical と同じくエンコードする
    const posts = await listPublishedPosts();
    urls.push(...posts.map((post) => postUrl(post.slug)));

    // 重複URL削除
    const uniqueUrls = Array.from(new Set(urls));

    console.log(`📢 IndexNow一括送信: ${uniqueUrls.length}個のURLをBingに通知開始...`);

    // Bingに一括送信（最大10,000 URL）
    const result = await submitToIndexNow(uniqueUrls);

    if (result.ok) {
      console.log(`✅ IndexNow一括送信成功: ${uniqueUrls.length}個のURL通知完了`);
      return NextResponse.json({
        success: true,
        status: result.status,
        message: `${uniqueUrls.length}個のURLをBingに通知しました`,
        totalUrls: uniqueUrls.length,
        urls: uniqueUrls.slice(0, 10), // 最初の10件のみ返す
      });
    }

    console.error(`❌ IndexNow一括送信エラー [${result.status}]:`, result.error);
    return NextResponse.json(
      {
        success: false,
        status: result.status,
        error: result.error,
        totalUrls: uniqueUrls.length,
      },
      // status 0 = IndexNow に届かなかった (通信エラー)
      { status: result.status || 500 }
    );
  } catch (error) {
    console.error('❌ IndexNow一括送信エラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '不明なエラー',
      },
      { status: 500 }
    );
  }
}
