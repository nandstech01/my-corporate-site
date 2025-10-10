import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * サイトマップの全URLをBingに一括送信
 * GET /api/indexnow/submit-all
 */
export async function GET(request: NextRequest) {
  try {
    const baseUrl = 'https://nands.tech';
    const supabase = createClient();

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

    // 3. その他重要ページ
    const additionalPages = [
      `${baseUrl}/legal`,
      `${baseUrl}/privacy`,
      `${baseUrl}/terms`,
      `${baseUrl}/faq`,
      `${baseUrl}/search`,
      `${baseUrl}/special`,
      `${baseUrl}/chatgpt-special`,
    ];
    urls.push(...additionalPages);

    // 4. ブログ記事（postsテーブル）
    const { data: posts } = await supabase
      .from('posts')
      .select('slug')
      .eq('status', 'published');

    if (posts) {
      posts.forEach((post) => {
        urls.push(`${baseUrl}/posts/${post.slug}`);
      });
    }

    // 5. ChatGPT記事（chatgpt_postsテーブル）
    const { data: chatgptPosts } = await supabase
      .from('chatgpt_posts')
      .select('slug')
      .eq('status', 'published');

    if (chatgptPosts) {
      chatgptPosts.forEach((post) => {
        urls.push(`${baseUrl}/posts/${post.slug}`);
      });
    }

    // 重複URL削除
    const uniqueUrls = Array.from(new Set(urls));

    console.log(`📢 IndexNow一括送信: ${uniqueUrls.length}個のURLをBingに通知開始...`);

    // IndexNow API設定
    const indexNowKey = process.env.INDEXNOW_KEY || 'b247e7b751dc4d84164c134151ee0814';
    const host = 'nands.tech';
    const keyLocation = `https://${host}/${indexNowKey}.txt`;

    // Bingに一括送信（最大10,000 URL）
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        host,
        key: indexNowKey,
        keyLocation,
        urlList: uniqueUrls,
      }),
    });

    const status = response.status;

    if (status === 200 || status === 202) {
      console.log(`✅ IndexNow一括送信成功: ${uniqueUrls.length}個のURL通知完了`);
      return NextResponse.json({
        success: true,
        status,
        message: `${uniqueUrls.length}個のURLをBingに通知しました`,
        totalUrls: uniqueUrls.length,
        urls: uniqueUrls.slice(0, 10), // 最初の10件のみ返す
      });
    } else {
      const errorText = await response.text();
      console.error(`❌ IndexNow一括送信エラー [${status}]:`, errorText);
      return NextResponse.json(
        {
          success: false,
          status,
          error: errorText,
          totalUrls: uniqueUrls.length,
        },
        { status }
      );
    }
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

