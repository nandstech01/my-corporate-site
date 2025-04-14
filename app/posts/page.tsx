import { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import PostImage from '@/components/common/PostImage'
import Script from 'next/script'
import Breadcrumbs from '@/app/components/common/Breadcrumbs'

export const metadata: Metadata = {
  title: '記事一覧 | 株式会社エヌアンドエス',
  description: '株式会社エヌアンドエスの公式ブログ。生成AI活用、リスキリング研修、キャリア支援に関する最新情報や役立つ記事をお届けします。',
  keywords: 'ブログ,記事一覧,生成AI,ChatGPT,リスキリング,キャリア支援,エヌアンドエス',
  openGraph: {
    title: '記事一覧 | 株式会社エヌアンドエス',
    description: '株式会社エヌアンドエスの公式ブログ。生成AI活用、リスキリング研修、キャリア支援に関する最新情報や役立つ記事をお届けします。',
    url: 'https://nands.tech/posts',
    siteName: '株式会社エヌアンドエス',
    images: ['/images/blog-ogp.jpg'],
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@nands_tech',
    creator: '@nands_tech',
    title: '記事一覧 | 株式会社エヌアンドエス',
    description: '株式会社エヌアンドエスの公式ブログ。生成AI活用、リスキリング研修、キャリア支援に関する最新情報や役立つ記事をお届けします。',
    images: ['/images/blog-ogp.jpg'],
  },
  alternates: {
    canonical: 'https://nands.tech/posts'
  },
}

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnail_url: string | null;
  featured_image?: string | null;
  category?: {
    name: string;
    slug: string;
  };
};

export default async function PostsPage() {
  const supabase = createClient();
  const { data: posts, error } = await supabase
    .from('chatgpt_posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      thumbnail_url,
      featured_image,
      categories (
        name,
        slug
      )
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    return <div>記事の取得中にエラーが発生しました。</div>;
  }

  const formattedPosts: Post[] = (posts || []).map(post => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || '',
    thumbnail_url: post.thumbnail_url,
    featured_image: post.featured_image,
    category: post.categories?.[0]
  }));

  // 記事一覧ページの構造化データを作成
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "記事一覧 | 株式会社エヌアンドエス",
    "description": "株式会社エヌアンドエスの公式ブログ。生成AI活用、リスキリング研修、キャリア支援に関する最新情報や役立つ記事をお届けします。",
    "url": "https://nands.tech/posts",
    "publisher": {
      "@type": "Organization",
      "name": "株式会社エヌアンドエス",
      "logo": {
        "@type": "ImageObject",
        "url": "https://nands.tech/logo.png"
      }
    },
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": formattedPosts.map((post, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://nands.tech/posts/${post.slug}`,
        "name": post.title
      }))
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Script
        id="structured-data-blog-list"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Breadcrumbs customItems={[
        { name: 'ホーム', path: '/' },
        { name: '記事一覧', path: '/posts' }
      ]} />

      <h1 className="text-4xl font-bold mb-8">記事一覧</h1>

      {/* カテゴリーフィルター（将来的に実装するなら） */}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {formattedPosts.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.slug}`}
            className="block group"
          >
            <article className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="relative aspect-[16/9]">
                <PostImage
                  src={post.thumbnail_url || post.featured_image || undefined}
                  alt={post.title}
                />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2 group-hover:text-indigo-600 transition-colors duration-300">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
                {post.category && (
                  <span className="inline-block bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">
                    {post.category.name}
                  </span>
                )}
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  )
} 