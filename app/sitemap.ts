import { MetadataRoute } from 'next';
import { createClient } from '@/utils/supabase/server';

// サイトマップのキャッシュ処理用の設定
export const revalidate = 3600; // 1時間ごとに再検証

// Next.jsのサイトマップAPI用の関数
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://nands.tech';
  const supabase = createClient();
  
  // 静的ページのエントリー（重要度順）
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/corporate`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/lp`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.95,
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
  ];

  // AIサービスページ（統一システム適用済み）
  const aiServicePages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/ai-agents`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/aio-seo`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/chatbot-development`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
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
      url: `${baseUrl}/system-development`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/vector-rag`,
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
  ];

  // 業界別カテゴリページ（今回作成した専門コンテンツページ）
  const categoryPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/categories/finance`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categories/manufacturing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categories/healthcare`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categories/retail`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categories/education`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categories/government`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categories/marketing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categories/logistics`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categories/construction`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categories/it-software`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categories/hr-service`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

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
    // 公開済み記事の取得
    const { data: posts, error: postsError } = await supabase
      .from('chatgpt_posts')
      .select('slug, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false });

    if (postsError) {
      console.error('Error fetching posts for sitemap:', postsError);
    }

    // 記事ページのサイトマップエントリー
    const postPages: MetadataRoute.Sitemap = (posts || []).map((post) => ({
      url: `${baseUrl}/posts/${post.slug}`,
      lastModified: new Date(post.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

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

    // 全てのページを結合
    return [
      ...staticPages, 
      ...aiServicePages,
      ...categoryPages, 
      ...additionalPages,
      ...postPages,
      ...dynamicCategoryPages
    ];

  } catch (error) {
    console.error('Error generating sitemap:', error);
    // エラーが発生した場合は静的ページのみ返す
    return [...staticPages, ...aiServicePages, ...categoryPages, ...additionalPages];
  }
} 