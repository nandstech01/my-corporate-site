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
  
  // 両テーブルから記事を取得して統合
  let posts: Array<{
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
  }> = [];

  try {
    // 1. 新しいpostsテーブルから記事を取得
    const { data: newPostsData, error: newPostsError } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        slug,
        meta_description,
        thumbnail_url,
        category:categories(name, slug)
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (newPostsError) {
      console.error('Error fetching posts from posts table:', newPostsError);
    }

    // 2. 従来のchatgpt_postsテーブルから記事を取得
    const { data: chatgptPostsData, error: chatgptPostsError } = await supabase
      .from('chatgpt_posts')
      .select(`
        id,
        title,
        slug,
        excerpt,
        thumbnail_url,
        featured_image,
        is_chatgpt_special,
        categories (
          name,
          slug
        )
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (chatgptPostsError) {
      console.error('Error fetching posts from chatgpt_posts table:', chatgptPostsError);
    }

    // 3. 両テーブルのデータを統合・重複排除
    const combinedPostsData = [];
    
    // 新しいpostsテーブルの記事を追加
    if (newPostsData) {
      combinedPostsData.push(...newPostsData.map((post: any) => ({
        ...post,
        excerpt: post.meta_description, // meta_descriptionをexcerptとして使用
        featured_image: null, // postsテーブルにはfeatured_imageがない
        source_table: 'posts'
      })));
    }

    // chatgpt_postsテーブルの記事を追加（重複チェック）
    if (chatgptPostsData) {
      const existingSlugs = new Set(combinedPostsData.map(post => post.slug));
      const uniqueChatgptPosts = chatgptPostsData.filter((post: any) => !existingSlugs.has(post.slug));
      
      combinedPostsData.push(...uniqueChatgptPosts.map((post: any) => ({
        ...post,
        source_table: 'chatgpt_posts'
      })));
    }

    // 4. 画像URLの処理とデータ整形
    posts = combinedPostsData.map((post: any) => {
      const imageUrl = post.thumbnail_url || post.featured_image;
      const finalImageUrl = imageUrl 
        ? imageUrl.startsWith('http') 
          ? imageUrl 
          : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${imageUrl}`
        : null;

      return {
        id: `${post.source_table}_${post.id}`, // React key用のユニークID
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || '', // excerptがnullの場合は空文字
        thumbnail_url: finalImageUrl,
        featured_image: finalImageUrl,
        category: post.category?.[0] || post.categories?.[0]
      };
    });

    // 作成日時順でソート（最新順）
    // postsテーブルの記事を先頭に、その後chatgpt_postsテーブルの記事を表示
    posts.sort((a, b) => {
      const aSource = a.id.split('_')[0];
      const bSource = b.id.split('_')[0];
      
      // postsテーブルの記事を優先表示
      if (aSource === 'posts' && bSource === 'chatgpt') return -1;
      if (aSource === 'chatgpt' && bSource === 'posts') return 1;
      
      // 同じテーブル内ではID降順（新しい記事が上）
      const aId = parseInt(a.id.split('_')[1]);
      const bId = parseInt(b.id.split('_')[1]);
      return bId - aId;
    });

  } catch (error) {
    console.error('Error fetching posts:', error);
    return <div>記事の取得中にエラーが発生しました。</div>;
  }

  const formattedPosts: Post[] = posts;

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