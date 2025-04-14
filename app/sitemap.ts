import { MetadataRoute } from 'next';
import { createClient } from '@/utils/supabase/server';

// サイトマップのエントリーを表す型
interface SitemapEntry {
  url: string;
  lastModified: string | Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

// 分割サイトマップの種類を列挙
enum SitemapType {
  MAIN = 'main',  // メインページ
  BLOG = 'blog',  // ブログ記事
  CATEGORY = 'category',  // カテゴリページ
  INDEX = 'index',  // インデックス
}

// サイトマップのキャッシュ処理用の設定
export const revalidate = 3600; // 1時間ごとに再検証

// サイトマップインデックスを作成する関数
export async function generateSitemapIndex(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://nands.tech';
  
  // 各サブサイトマップの最終更新日を取得
  const supabase = createClient();
  
  // ブログ記事の最終更新日を取得
  const { data: latestPost } = await supabase
    .from('chatgpt_posts')
    .select('updated_at, created_at')
    .eq('status', 'published')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();
    
  const blogLastModified = latestPost 
    ? new Date(latestPost.updated_at || latestPost.created_at)
    : new Date();
    
  // カテゴリーの最終更新日を取得
  const { data: latestCategory } = await supabase
    .from('categories')
    .select('updated_at, created_at')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();
    
  const categoryLastModified = latestCategory 
    ? new Date(latestCategory.updated_at || latestCategory.created_at)
    : new Date();
  
  // サイトマップインデックスのエントリー
  return [
    {
      url: `${baseUrl}/sitemap-main.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap-blog.xml`,
      lastModified: blogLastModified,
    },
    {
      url: `${baseUrl}/sitemap-category.xml`,
      lastModified: categoryLastModified,
    }
  ];
}

// メインサイトマップを生成
export async function generateMainSitemap(): Promise<SitemapEntry[]> {
  const baseUrl = 'https://nands.tech';
  
  // 静的ページのエントリー - メインセクション（高優先度）
  const mainPages: SitemapEntry[] = [
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
      url: `${baseUrl}/posts`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  // 主要サービスページ（高優先度）
  const servicePages: SitemapEntry[] = [
    {
      url: `${baseUrl}/reskilling`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/corporate`,
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
      url: `${baseUrl}/sustainability`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/seo-support`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  // 特集ページ（中優先度）
  const specialPages: SitemapEntry[] = [
    {
      url: `${baseUrl}/chatgpt-special`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/special`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // サポートページ（中優先度）
  const supportPages: SitemapEntry[] = [
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(), 
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // 法的ページ（低優先度）
  const legalPages: SitemapEntry[] = [
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // メインページと静的ページを結合
  return [
    ...mainPages, 
    ...servicePages, 
    ...specialPages, 
    ...supportPages, 
    ...legalPages
  ];
}

// ブログ記事のサイトマップを生成
export async function generateBlogSitemap(): Promise<SitemapEntry[]> {
  const baseUrl = 'https://nands.tech';
  const supabase = createClient();
  
  // 公開中の全記事を取得
  const { data: posts } = await supabase
    .from('chatgpt_posts')
    .select('slug, updated_at, created_at')
    .eq('status', 'published');
  
  // 記事ごとのサイトマップエントリーを作成
  return (posts || []).map((post) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: post.updated_at || post.created_at,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));
}

// カテゴリページのサイトマップを生成
export async function generateCategorySitemap(): Promise<SitemapEntry[]> {
  const baseUrl = 'https://nands.tech';
  const supabase = createClient();
  
  // すべてのカテゴリを取得
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, updated_at, created_at');
  
  // カテゴリごとのサイトマップエントリーを作成
  return (categories || []).map((category) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: category.updated_at || category.created_at,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));
}

// Next.jsのサイトマップAPI用の関数
export default async function sitemap(
  { params }: { params?: { type?: string[] } }
): Promise<MetadataRoute.Sitemap> {
  // URLパラメーターからサイトマップの種類を取得
  const type = params?.type?.[0] || SitemapType.INDEX;
  
  switch (type) {
    case SitemapType.MAIN:
      return await generateMainSitemap();
    case SitemapType.BLOG:
      return await generateBlogSitemap();
    case SitemapType.CATEGORY:
      return await generateCategorySitemap();
    case SitemapType.INDEX:
    default:
      return await generateSitemapIndex();
  }
} 