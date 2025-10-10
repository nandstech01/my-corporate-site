import { MetadataRoute } from 'next';
import { createClient } from '@/utils/supabase/server';

// サイトマップのキャッシュ処理用の設定
export const revalidate = 0; // キャッシュを完全に無効化（デバッグ用）
export const dynamic = 'force-dynamic';

// Next.jsのサイトマップAPI用の関数
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://nands.tech';
  
  console.log('🗺️ サイトマップ生成開始...');
  
  // Supabaseクライアントの初期化
  const supabase = createClient();
  
  // 基本的な静的ページ
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/lp`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9, // 公開可。robots.txtもAllowにて整合
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sustainability`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/reviews`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // 最重要サービスページ（今回LLMO/AIO/AIモード最強レベル最適化実施）
  const priorityServicePages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/corporate`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.98, // 法人向け最重要
    },
    {
      url: `${baseUrl}/system-development`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.98, // システム開発最重要
    },
    {
      url: `${baseUrl}/aio-seo`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.95, // AIO/SEO対策
    },
    {
      url: `${baseUrl}/ai-agents`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.95, // AIエージェント
    },
    {
      url: `${baseUrl}/vector-rag`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.95, // ベクトルRAG
    },
    {
      url: `${baseUrl}/ai-site`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.97, // AIサイト開発サービス（Fragment ID統合済み）
    },
    {
      url: `${baseUrl}/chatbot-development`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.95, // チャットボット
    },
  ];

  // その他AIサービスページ
  const aiServicePages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/hr-solutions`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/mcp-servers`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sns-automation`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/video-generation`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/reskilling`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/fukugyo`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // 業界別カテゴリページ（動的に生成 - 重複を避けるためコメントアウト）
  const categoryPages: MetadataRoute.Sitemap = [];

  // 追加の重要ページ
  const additionalPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/legal`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/special`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/chatgpt-special`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  // 動的コンテンツ（記事ページ）の取得
  try {
    // 【修正】両方のテーブルから公開済み記事を取得
    const allPostPages: MetadataRoute.Sitemap = [];

    // 1. 新しいpostsテーブルから記事を取得（ベクトルRAG記事等）
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('slug, updated_at, published_at, created_at')
      .eq('status', 'published') // publishedフィールドではなくstatusフィールドを使用
      .order('updated_at', { ascending: false });

    if (postsError) {
      console.error('Error fetching posts for sitemap:', postsError);
    } else if (posts) {
      const newPostPages = posts.map((post) => ({
        url: `${baseUrl}/posts/${post.slug}`,
        lastModified: new Date(post.updated_at || post.published_at || post.created_at),
        changeFrequency: 'monthly' as const,
        priority: 0.7, // 新しい記事は高優先度
      }));
      allPostPages.push(...newPostPages);
    }

    // 2. 従来のchatgpt_postsテーブルから記事を取得
    const { data: chatgptPosts, error: chatgptPostsError } = await supabase
      .from('chatgpt_posts')
      .select('slug, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false });

    if (chatgptPostsError) {
      console.error('Error fetching chatgpt_posts for sitemap:', chatgptPostsError);
    } else if (chatgptPosts) {
      const chatgptPostPages = chatgptPosts.map((post) => ({
      url: `${baseUrl}/posts/${post.slug}`,
      lastModified: new Date(post.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
      allPostPages.push(...chatgptPostPages);
    }

    // 重複URLを除去（新しいpostsテーブルを優先）
    const uniquePostPages = allPostPages.reduce((acc, current) => {
      const existingIndex = acc.findIndex(item => item.url === current.url);
      if (existingIndex === -1) {
        acc.push(current);
      } else if (current.priority && acc[existingIndex].priority && current.priority > acc[existingIndex].priority) {
        acc[existingIndex] = current; // より高い優先度で上書き
      }
      return acc;
    }, [] as MetadataRoute.Sitemap);

    // カテゴリの取得
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('slug, updated_at');

    if (categoriesError) {
      console.error('Error fetching categories for sitemap:', categoriesError);
    }

    // 追加のカテゴリページ（データベースから）
    const dynamicCategoryPages: MetadataRoute.Sitemap = (categories || [])
      .filter(cat => !categoryPages.some(page => page.url.endsWith(`/categories/${cat.slug}`)))
      .map((category) => ({
        url: `${baseUrl}/categories/${category.slug}`,
        lastModified: new Date(category.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));

    console.log(`📊 サイトマップ生成完了:
    - 静的ページ: ${staticPages.length}個
    - 最重要サービス: ${priorityServicePages.length}個
    - AIサービス: ${aiServicePages.length}個
    - カテゴリ: ${categoryPages.length + dynamicCategoryPages.length}個
    - ブログ記事: ${uniquePostPages.length}個
    - 合計: ${staticPages.length + priorityServicePages.length + aiServicePages.length + categoryPages.length + additionalPages.length + uniquePostPages.length + dynamicCategoryPages.length}個`);

    // 全てのページを結合（優先度順）
    return [
      ...staticPages, 
      ...priorityServicePages, // 最重要サービスページを上位に
      ...aiServicePages,
      ...categoryPages, 
      ...additionalPages,
      ...uniquePostPages, // 重複排除済みの記事ページ
      ...dynamicCategoryPages
    ];

  } catch (error) {
    console.error('Error generating sitemap:', error);
    // エラーが発生した場合は静的ページのみ返す
    return [...staticPages, ...priorityServicePages, ...aiServicePages, ...categoryPages, ...additionalPages];
  }
} 