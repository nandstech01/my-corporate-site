import { Metadata } from 'next'
import Link from 'next/link'
import PostImage from '@/components/common/PostImage'
import Breadcrumbs from '@/app/components/common/Breadcrumbs'
import { listPublishedPosts, type PublishedPostSummary } from './_lib/public-client'
import {
  SITE_URL,
  organizationNode,
  organizationRef,
  postUrl,
  toJsonLdScript,
} from '@/lib/structured-data/site-entities'

// cookie を使わない公開クライアントで取得するので ISR が効く (公開・非公開の反映は最大 5 分遅れる)
export const revalidate = 300

const PAGE_TITLE = '記事一覧'
const PAGE_URL = `${SITE_URL}/posts`
const PAGE_DESCRIPTION = '株式会社エヌアンドエスの公式ブログ。生成AI活用、リスキリング研修、キャリア支援に関する最新情報や役立つ記事をお届けします。'

export const metadata: Metadata = {
  // 社名は app/layout.tsx の title.template が付ける (ここで付けると二重になる)
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: 'ブログ,記事一覧,生成AI,ChatGPT,リスキリング,キャリア支援,エヌアンドエス',
  openGraph: {
    title: '記事一覧 | 株式会社エヌアンドエス',
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
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
    description: PAGE_DESCRIPTION,
    images: ['/images/blog-ogp.jpg'],
  },
  alternates: {
    canonical: PAGE_URL,
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
}

/** CollectionPage + BreadcrumbList + Organization を 1 つの @graph で出す (素の <script> で SSR される) */
function buildJsonLd(posts: readonly PublishedPostSummary[]) {
  const breadcrumbId = `${PAGE_URL}#breadcrumb`

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: PAGE_TITLE,
        description: PAGE_DESCRIPTION,
        inLanguage: 'ja',
        publisher: organizationRef(),
        breadcrumb: { '@id': breadcrumbId },
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: posts.length,
          itemListElement: posts.map((post, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: postUrl(post.slug),
            name: post.title,
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': breadcrumbId,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'ホーム', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: PAGE_TITLE, item: PAGE_URL },
        ],
      },
      // publisher の参照先。layout の Organization は next/script で素の HTML に出ないため、ここで定義する
      organizationNode(),
    ],
  }
}

export default async function PostsPage() {
  // posts + chatgpt_posts を slug で重複排除し、公開日 (published_at ?? created_at) の新しい順。
  // DB エラーは throw させる (ISR は直前の正常なページを出し続ける)
  const posts = await listPublishedPosts()
  const jsonLd = buildJsonLd(posts)

  return (
    <div className="container mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLdScript(jsonLd) }}
      />
      {/* 「ホーム」は Breadcrumbs が自動で先頭に付ける。BreadcrumbList は上の @graph で出す */}
      <Breadcrumbs customItems={[{ name: PAGE_TITLE, path: '/posts' }]} withSchema={false} />

      <h1 className="text-4xl font-bold mb-8">記事一覧</h1>

      {/* カテゴリーフィルター（将来的に実装するなら） */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <Link
            key={`${post.source}_${post.id}`}
            href={`/posts/${post.slug}`}
            className="block group"
          >
            <article className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="relative aspect-[16/9]">
                <PostImage
                  src={post.image_url}
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
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  )
}
