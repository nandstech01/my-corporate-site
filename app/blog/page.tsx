import { Metadata } from 'next'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Database } from '@/lib/supabase/database.types'

export const metadata: Metadata = {
  title: 'ブログ一覧 | NANDS TECH',
  description: '副業支援、個人向けリスキリング、法人向けリスキリングに関する最新情報をお届けします。',
}

export default async function BlogPage() {
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value
        },
      },
    }
  )
  
  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .order('id')

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">ブログ一覧</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businesses?.map((business) => (
          <div key={business.id} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">{business.name}</h2>
            <p className="text-gray-600 mb-4">{business.description}</p>
            <Link
              href={`/blog/${business.slug}`}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              記事一覧を見る →
            </Link>
          </div>
        ))}

        {/* ChatGPT特集へのリンク */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">ChatGPT特集</h2>
          <p className="mb-4">
            ChatGPTの最新情報から活用方法まで、すべてを網羅した特集ページ
          </p>
          <Link
            href="/chatgpt-special"
            className="text-white hover:text-gray-100 font-medium"
          >
            特集を見る →
          </Link>
        </div>
      </div>
    </div>
  )
} 