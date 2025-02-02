import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/supabase';
import Breadcrumb from '@/components/blog/Breadcrumb';
import BlogCard from '@/components/blog/BlogCard';
import { RelatedTags } from '@/components/blog/RelatedTags';
import { notFound } from 'next/navigation';
import { Post, Category } from '@/types/blog';
import Link from 'next/link';
import { normalizeTag } from '@/utils/url';

// 構造化データの生成
const generateTagStructuredData = (tag: string, posts: Post[], baseUrl: string) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${tag}に関する記事一覧`,
    description: `${tag}に関する記事${posts.length}件を掲載。`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/tags/${encodeURIComponent(tag)}`
    },
    isPartOf: {
      '@type': 'Blog',
      name: 'あんしん退職コラム',
      url: `${baseUrl}/blog`
    },
    hasPart: posts.map(post => ({
      '@type': 'BlogPosting',
      headline: post.title,
      datePublished: post.published_at || post.created_at,
      dateModified: post.updated_at || post.published_at || post.created_at,
      url: `${baseUrl}/blog/${post.slug}`,
      description: post.description || post.excerpt || undefined,
      author: {
        '@type': 'Organization',
        name: '退職あんしん代行編集部'
      }
    }))
  };
};

export async function generateMetadata({ params }: { params: { tag: string } }): Promise<Metadata> {
  const tag = decodeURIComponent(params.tag);
  const normalizedTag = normalizeTag(tag);
  const supabase = createClient();

  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, content, seo_keywords')
    .eq('status', 'published')
    .or(`seo_keywords.cs.{"${tag}"},seo_keywords.cs.{${tag}}`);

  // タグに関連する主要トピックを抽出（最大3つ）
  const topTopics = posts
    ?.map(post => post.title)
    .slice(0, 3)
    .join('、');

  const postCount = posts?.length || 0;

  // タグの特性に基づいて説明文を生成
  let tagDescription = '';
  if (normalizedTag.includes('退職')) {
    tagDescription = `退職に関する手続きや注意点、体験談をまとめています。`;
  } else if (normalizedTag.includes('メンタル') || normalizedTag.includes('ストレス')) {
    tagDescription = `職場でのメンタルヘルスケアや、ストレス対策について解説しています。`;
  } else if (normalizedTag.includes('法律') || normalizedTag.includes('手続き')) {
    tagDescription = `労働法規や各種手続きについての専門家による解説をまとめています。`;
  } else if (normalizedTag.includes('給与') || normalizedTag.includes('賃金')) {
    tagDescription = `給与や賃金に関する法律知識や交渉のポイントを解説しています。`;
  } else if (normalizedTag.includes('パワハラ') || normalizedTag.includes('ハラスメント')) {
    tagDescription = `職場でのハラスメント対策や解決方法について詳しく解説しています。`;
  } else {
    tagDescription = `${normalizedTag}に関する詳しい情報をまとめています。`;
  }

  const title = `退職代行の${normalizedTag}に関する完全ガイド【${postCount}記事】 | 退職代行案内`;
  const description = `${normalizedTag}に関する${postCount}件の記事を掲載。${tagDescription}${
    topTopics ? `主な記事：${topTopics}。` : ''
  }退職代行のプロフェッショナルが解説します。`;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://taishoku-anshin-daiko.com';
  const canonicalUrl = `${baseUrl}/blog/tags/${encodeURIComponent(normalizedTag)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: canonicalUrl
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1
    }
  };
}

export default async function TagPage({ params }: { params: { tag: string } }) {
  const supabase = createClient();
  const decodedTag = decodeURIComponent(params.tag);
  const normalizedTag = normalizeTag(decodedTag);

  try {
    // タグの検索（クォーテーション付きと無しの両方に対応）
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .or(`seo_keywords.cs.{"${decodedTag}"},seo_keywords.cs.{${decodedTag}}`)
      .order('created_at', { ascending: false });

    if (postsError) {
      console.error('Error fetching posts:', postsError);
      return <div>記事の取得中にエラーが発生しました。</div>;
    }

    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      return <div>カテゴリー情報の取得中にエラーが発生しました。</div>;
    }

    if (!posts || posts.length === 0) {
      return (
        <div className="tag-page">
          <Breadcrumb items={[
            { label: 'ホーム', href: '/' },
            { label: 'ブログ', href: '/blog' },
            { label: 'タグ', href: '/blog/tags' },
            { label: `${normalizedTag}の記事一覧` }
          ]} />
          <h1 className="tag-title">{normalizedTag}に関する記事</h1>
          <p className="no-articles">申し訳ありません。{normalizedTag}に関する記事は現在ありません。</p>
          <Link href="/blog" className="back-to-blog">
            ブログトップへ戻る
          </Link>
        </div>
      );
    }

    const postsWithCategories = posts.map(post => ({
      ...post,
      category: categories?.find(cat => cat.slug === post.category_slug)
    }));

    // 構造化データのパンくずリストを更新
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://taishoku-anshin-daiko.com';
    const breadcrumbSchema = {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          item: {
            '@id': baseUrl,
            name: 'ホーム'
          }
        },
        {
          '@type': 'ListItem',
          position: 2,
          item: {
            '@id': `${baseUrl}/blog`,
            name: 'ブログ'
          }
        },
        {
          '@type': 'ListItem',
          position: 3,
          item: {
            '@id': `${baseUrl}/blog/tags`,
            name: 'タグ'
          }
        },
        {
          '@type': 'ListItem',
          position: 4,
          item: {
            '@id': `${baseUrl}/blog/tags/${encodeURIComponent(normalizedTag)}`,
            name: `${normalizedTag}の記事一覧`
          }
        }
      ]
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              ...generateTagStructuredData(normalizedTag, posts, baseUrl),
              breadcrumb: breadcrumbSchema
            })
          }}
        />
        <div className="tag-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb items={[
            { label: 'ホーム', href: '/' },
            { label: 'ブログ', href: '/blog' },
            { label: 'タグ', href: '/blog/tags' },
            { label: `${normalizedTag}の記事一覧` }
          ]} />
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">
              <span className="block text-xl text-gray-600 mb-2">タグ：{normalizedTag}</span>
              <span className="block">記事一覧</span>
            </h1>
            <p className="text-gray-600">
              {normalizedTag}に関する記事が{posts.length}件あります。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {postsWithCategories.map((post) => (
              <BlogCard
                key={post.id}
                post={post}
              />
            ))}
          </div>

          <div className="mt-12">
            <RelatedTags
              currentTag={normalizedTag}
              posts={posts}
              maxTags={5}
            />
          </div>

          <div className="mt-8">
            <Link href="/blog" className="text-blue-600 hover:underline">
              ← ブログトップへ戻る
            </Link>
          </div>
        </div>
      </>
    );
  } catch (error) {
    console.error('Error in TagPage:', error);
    return <div>エラーが発生しました。</div>;
  }
} 