import Link from 'next/link'
import PostImage from './PostImage'

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

// SEO最適化されたPostsGrid SSR版（Googleガイドライン準拠）
export default function PostsGridSSR({ initialPosts }: { initialPosts: Post[] }) {
  // 構造化データ（JSON-LD）の生成（ガイドライン準拠）
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "最新記事一覧",
    "description": "株式会社エヌアンドエスの最新記事・ブログ投稿",
    "numberOfItems": initialPosts.length,
    "itemListElement": initialPosts.map((post, index) => {
      const postData: any = {
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "BlogPosting",
          "@id": `https://nands.tech/posts/${post.slug}`,
          "url": `https://nands.tech/posts/${post.slug}`,
          "headline": post.title,
          "description": post.excerpt,
          "author": {
            "@type": "Organization",
            "name": "株式会社エヌアンドエス",
            "url": "https://nands.tech"
          },
          "publisher": {
            "@type": "Organization",
            "name": "株式会社エヌアンドエス"
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://nands.tech/posts/${post.slug}`
          }
        }
      };

      // 画像が実際に存在する場合のみ追加
      if (post.thumbnail_url || post.featured_image) {
        postData.item.image = post.thumbnail_url || post.featured_image;
      }

      // カテゴリが存在する場合のみ追加
      if (post.category) {
        postData.item.about = {
          "@type": "Thing",
          "name": post.category.name
        };
      }

      return postData;
    })
  };

  return (
    <>
      {/* 構造化データの埋め込み */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* セマンティックHTMLでSEO強化 */}
      <section 
        className="posts-grid-container" 
        role="main" 
        aria-label="最新記事一覧"
        itemScope 
        itemType="https://schema.org/ItemList"
      >
        <meta itemProp="name" content="最新記事一覧" />
        <meta itemProp="description" content="株式会社エヌアンドエスの最新記事・ブログ投稿" />
        <meta itemProp="numberOfItems" content={initialPosts.length.toString()} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 posts-grid-ssr">
          {initialPosts.map((post, index) => (
            <article
              key={post.id}
              className="bg-gray-800 border border-gray-200 shadow-lg overflow-hidden hover:border-[#00CFFF] transition-all duration-300 flex flex-col"
              itemScope
              itemType="https://schema.org/BlogPosting"
              itemProp="itemListElement"
              role="article"
              aria-labelledby={`post-title-${post.id}`}
              aria-describedby={`post-excerpt-${post.id}`}
            >
              {/* 構造化データのメタ情報 */}
              <meta itemProp="position" content={(index + 1).toString()} />
              <meta itemProp="url" content={`https://nands.tech/posts/${post.slug}`} />
              <meta itemProp="identifier" content={post.id} />
              
              <Link 
                href={`/posts/${post.slug}`} 
                className="block flex flex-col flex-grow"
                itemProp="url"
                aria-label={`記事「${post.title}」を読む`}
              >
                                  {/* 画像セクション（画像が存在する場合のみ） */}
                {(post.thumbnail_url || post.featured_image) && (
                  <header className="relative w-full flex-shrink-0 overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                    <PostImage
                      src={post.thumbnail_url || post.featured_image}
                      alt={`${post.title}のサムネイル画像`}
                    />
                    <meta itemProp="image" content={post.thumbnail_url || post.featured_image || ''} />
                  </header>
                )}
                
                {/* コンテンツセクション */}
                <div className="p-6 flex flex-col flex-grow">
                  {/* カテゴリ情報 */}
                  {post.category && (
                    <div 
                      className="text-sm text-blue-400 mb-2 font-medium"
                      itemProp="about"
                      itemScope
                      itemType="https://schema.org/Thing"
                    >
                      <span itemProp="name">{post.category.name}</span>
                    </div>
                  )}
                  
                  {/* タイトル */}
                  <h3 
                    id={`post-title-${post.id}`}
                    className="text-xl font-semibold mb-2 text-gray-100 line-clamp-2 hover:text-blue-300 transition-colors duration-200"
                    itemProp="headline"
                  >
                    {post.title}
                  </h3>
                  
                  {/* 抜粋 */}
                  <p 
                    id={`post-excerpt-${post.id}`}
                    className="text-gray-300 text-sm line-clamp-3 mb-4 flex-grow"
                    itemProp="description"
                  >
                    {post.excerpt}
                  </p>
                  
                  {/* 著者情報（構造化データ用） */}
                  <div itemProp="author" itemScope itemType="https://schema.org/Organization" style={{ display: 'none' }}>
                    <meta itemProp="name" content="株式会社エヌアンドエス" />
                    <meta itemProp="url" content="https://nands.tech" />
                  </div>
                  
                  {/* 出版者情報（構造化データ用） */}
                  <div itemProp="publisher" itemScope itemType="https://schema.org/Organization" style={{ display: 'none' }}>
                    <meta itemProp="name" content="株式会社エヌアンドエス" />
                  </div>
                  
                  {/* メインエンティティ（構造化データ用） */}
                  <div itemProp="mainEntityOfPage" itemScope itemType="https://schema.org/WebPage" style={{ display: 'none' }}>
                    <meta itemProp="@id" content={`https://nands.tech/posts/${post.slug}`} />
                  </div>
                  
                  {/* CTA ボタン */}
                  <div className="mt-auto">
                    <span
                      className="inline-block px-6 py-3 font-bold text-white border border-gray-200 text-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
                      role="button"
                      aria-label={`${post.title}の続きを読む`}
                    >
                      続きを読む →
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </>
  )
} 