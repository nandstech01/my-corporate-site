import { Metadata } from 'next'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Database } from '@/lib/supabase/database.types'
import { BUSINESS_CATEGORIES, BusinessCategory, Category } from './metadata'
import Image from 'next/image'
import './blog.css'

export const metadata: Metadata = {
  title: 'NANDSブログ | 生成AI時代の総合情報メディア',
  description: '生成AI時代を生き抜くための総合情報メディア。副業支援、法人向けAI導入、個人向けリスキリングなど、最新のAI活用情報を提供します。',
  keywords: '生成AI,ChatGPT,副業支援,リスキリング,AI導入,DX推進,キャリアアップ,AI活用,NANDS',
  alternates: {
    canonical: process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}/blog` : undefined
  },
  openGraph: {
    title: 'NANDSブログ | 生成AI時代の総合情報メディア',
    description: '生成AI時代を生き抜くための総合情報メディア。副業支援、法人向けAI導入、個人向けリスキリングなど、最新のAI活用情報を提供します。',
    url: process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}/blog` : undefined,
    siteName: 'NANDS',
    locale: 'ja_JP',
    type: 'website',
  }
}

type Post = Database['public']['Tables']['posts']['Row']

async function getLatestPosts(businessCategory: string, limit = 5): Promise<Post[]> {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('business_category', businessCategory)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error(`Error fetching posts for ${businessCategory}:`, error)
      return []
    }

    return data || []
  } catch (error) {
    console.error(`Unexpected error fetching posts for ${businessCategory}:`, error)
    return []
  }
}

export default async function BlogPage() {
  try {
    // 各事業カテゴリーの最新記事を取得
    const latestPostsPromises = Object.keys(BUSINESS_CATEGORIES).map(category =>
      getLatestPosts(category)
    )
    const latestPostsByCategory = await Promise.all(latestPostsPromises)

    return (
      <div className="blog-container">
        <div className="blog-content">
          {/* ヒーローセクション */}
          <section className="blog-header">
            <h1 className="blog-title">NANDS TECH Blog</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              生成AI時代を生き抜くための総合ソリューション情報をお届けします。
              副業支援、法人向けAI導入、個人向けリスキリングなど、最新のAI活用情報が満載。
            </p>
          </section>

          {/* 事業カテゴリー別セクション */}
          <div className="space-y-16">
            {Object.entries(BUSINESS_CATEGORIES).map(([key, business], index) => {
              const latestPosts = latestPostsByCategory[index]
              return (
                <section key={key} className="space-y-8">
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-gray-900">{business.name}</h2>
                    <p className="text-lg text-gray-600">{business.description}</p>
                  </div>

                  {/* カテゴリー一覧 */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {business.categories.map((category) => (
                      <Link
                        key={category.slug}
                        href={`/blog/${key}/${category.slug}`}
                        className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-100"
                      >
                        <h3 className="font-medium text-gray-900">{category.name}</h3>
                      </Link>
                    ))}
                  </div>

                  {/* 最新記事一覧 */}
                  {latestPosts.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900">最新記事</h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {latestPosts.map((post: Post) => (
                          <Link
                            key={post.id}
                            href={`/blog/${key}/${post.category_slug}/${post.slug}`}
                            className="group"
                          >
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                              {post.thumbnail_url && (
                                <div className="aspect-w-16 aspect-h-9 relative">
                                  <Image
                                    src={post.thumbnail_url}
                                    alt={post.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                                  />
                                </div>
                              )}
                              <div className="p-4">
                                <h4 className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                                  {post.title}
                                </h4>
                                {post.meta_description && (
                                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                    {post.meta_description}
                                  </p>
                                )}
                                <div className="mt-4 flex items-center text-sm text-gray-500">
                                  <time dateTime={post.created_at}>
                                    {new Date(post.created_at).toLocaleDateString('ja-JP')}
                                  </time>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <div className="text-center">
                        <Link
                          href={`/blog/${key}`}
                          className="inline-flex items-center text-orange-600 hover:text-orange-700"
                        >
                          もっと見る
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  )}
                </section>
              )
            })}

            {/* ChatGPT特集 */}
            <section className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg p-8">
              <div className="max-w-3xl mx-auto space-y-6">
                <h2 className="text-3xl font-bold">ChatGPT特集</h2>
                <p className="text-lg">
                  ChatGPTの基礎から実践的な活用方法まで、生成AIの可能性を最大限に引き出すための情報を網羅的に解説。
                  プロンプトエンジニアリングやAIツール連携など、実務で使える知識が満載。
                </p>
                <div>
                  <Link
                    href="/chatgpt-special"
                    className="inline-flex items-center bg-white text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    特集を見る
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error rendering blog page:', error)
    return (
      <div className="blog-container">
        <div className="blog-content">
          <div className="text-center">
            <h1 className="blog-title">
              申し訳ありません。エラーが発生しました。
            </h1>
            <p className="mt-4 text-gray-600">
              しばらく時間をおいてから再度アクセスしてください。
            </p>
          </div>
        </div>
      </div>
    )
  }
} 