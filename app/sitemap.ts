import { MetadataRoute } from 'next';
import { getPublicSupabase, isBuildPhase, listPublishedPosts } from '@/app/posts/_lib/public-client';
import { latestDate, parseDate, postLastModified } from '@/app/posts/_lib/syndication';
import { AUTHOR, SITE_URL, postUrl } from '@/lib/structured-data/site-entities';

// 1時間ごとに再生成（ISR）。記事とカテゴリは cookie を使わない anon クライアントで取得する。
// DB エラーは throw する: 固定ページだけの sitemap を 1 時間キャッシュするより、直前の正常な sitemap を出し続ける
export const revalidate = 3600;

interface CategoryRow {
  slug: string | null;
  updated_at: string | null;
}

// カテゴリページ。app/categories/[slug] は slug を .single() で引くので、同じ slug の行が 2 つ以上あるとページが 404 になる
// (2026-09-26 時点で data-analysis が id 3 と 34 の 2 行 → 本番で 404)。重複した slug は URL ごと載せない
async function fetchCategoryPages(baseUrl: string): Promise<MetadataRoute.Sitemap> {
  const { data, error } = await getPublicSupabase()
    .from('categories')
    .select('slug, updated_at')
    .order('id', { ascending: true });

  if (error) {
    if (isBuildPhase()) {
      console.warn(`[sitemap] ビルド時の categories 取得に失敗したため省略します: ${error.message}`);
      return [];
    }
    throw new Error(`categories の取得に失敗しました: ${error.message}`);
  }

  const categories = (data ?? []) as CategoryRow[];
  const slugCounts = new Map<string, number>();
  for (const { slug } of categories) {
    if (slug) slugCounts.set(slug, (slugCounts.get(slug) ?? 0) + 1);
  }

  return categories
    .filter((category): category is CategoryRow & { slug: string } =>
      category.slug !== null && slugCounts.get(category.slug) === 1
    )
    .map((category) => ({
      url: `${baseUrl}/categories/${encodeURIComponent(category.slug)}`,
      lastModified: parseDate(category.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
}

// Next.jsのサイトマップAPI用の関数
// 固定ページには lastModified を付けない。実際の更新日が分からないのに new Date() を入れると毎回「今」になり、
// 記事の lastmod まで含めて sitemap 全体の lastmod が信用されなくなる
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  // 基本的な静的ページ
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/lp`,
      changeFrequency: 'weekly',
      priority: 0.9, // 公開可。robots.txtもAllowにて整合
    },
    {
      url: `${baseUrl}/blog`,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sustainability`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/categories`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/reviews`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // 最重要サービスページ（今回LLMO/AIO/AIモード最強レベル最適化実施）
  const priorityServicePages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/corporate`,
      changeFrequency: 'weekly',
      priority: 0.98, // 法人向け最重要
    },
    {
      url: `${baseUrl}/system-development`,
      changeFrequency: 'weekly',
      priority: 0.98, // システム開発最重要
    },
    {
      url: `${baseUrl}/aio-seo`,
      changeFrequency: 'weekly',
      priority: 0.95, // AIO/SEO対策
    },
    {
      url: `${baseUrl}/ai-agents`,
      changeFrequency: 'weekly',
      priority: 0.95, // AIエージェント
    },
    {
      url: `${baseUrl}/vector-rag`,
      changeFrequency: 'weekly',
      priority: 0.95, // ベクトルRAG
    },
    {
      url: `${baseUrl}/ai-site`,
      changeFrequency: 'weekly',
      priority: 0.97, // AIサイト開発サービス（Fragment ID統合済み）
    },
    {
      url: `${baseUrl}/chatbot-development`,
      changeFrequency: 'weekly',
      priority: 0.95, // チャットボット
    },
  ];

  // その他AIサービスページ
  const aiServicePages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/hr-solutions`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/mcp-servers`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sns-automation`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/video-generation`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/reskilling`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/fukugyo`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // 追加の重要ページ（/special と /chatgpt-special は本番で 404 のため載せない）
  const additionalPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/legal`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/faq`,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/search`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // 記事（posts + chatgpt_posts の公開記事。slug で重複排除済みで、重複時は posts 側を採用）とカテゴリ
  const [posts, categoryPages] = await Promise.all([
    listPublishedPosts(),
    fetchCategoryPages(baseUrl),
  ]);

  // 記事の lastmod は本文の最終更新日（updated_at ?? published_at ?? created_at）。
  // URL は canonical と同じく slug をパーセントエンコードする（日本語 slug を生の UTF-8 で出さない）
  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: postUrl(post.slug),
    lastModified: parseDate(postLastModified(post)),
    changeFrequency: 'monthly' as const,
    priority: post.source === 'posts' ? 0.7 : 0.6, // 新しい posts テーブルの記事を優先
  }));

  // ブログ一覧と著者ページ。一覧の lastmod は全記事の最終更新日の最大値
  const blogPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/posts`,
      lastModified: latestDate(posts.map(postLastModified)),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: AUTHOR.url,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ];

  // 全てのページを結合（優先度順）
  return [
    ...staticPages,
    ...blogPages,
    ...priorityServicePages, // 最重要サービスページを上位に
    ...aiServicePages,
    ...additionalPages,
    ...postPages,
    ...categoryPages,
  ];
}
