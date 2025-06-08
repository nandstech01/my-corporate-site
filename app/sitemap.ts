import { MetadataRoute } from 'next';
import { createClient } from '@/utils/supabase/server';

// サイトマップのキャッシュ処理用の設定
export const revalidate = 3600; // 1時間ごとに再検証

// Next.jsのサイトマップAPI用の関数
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://nands.tech';
  const supabase = createClient();
  
  // 静的ページのエントリー
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
      priority: 0.8,
    },
  ];

  // ブログ記事を取得
  const { data: posts } = await supabase
    .from('chatgpt_posts')
    .select('slug, updated_at, created_at')
    .eq('status', 'published');

  const blogPages: MetadataRoute.Sitemap = (posts || []).map((post) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: new Date(post.updated_at || post.created_at),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // カテゴリを取得
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, updated_at, created_at');

  const categoryPages: MetadataRoute.Sitemap = (categories || []).map((category) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: new Date(category.updated_at || category.created_at),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages, ...categoryPages];
} 