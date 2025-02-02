import { Metadata } from 'next'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Database } from '@/lib/supabase/database.types'

export const metadata: Metadata = {
  title: 'ChatGPT特集 | NANDS TECH',
  description: 'ChatGPTの最新情報から活用方法まで、すべてを網羅した特集ページです。',
}

export default async function ChatGPTSpecialPage() {
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
  
  const { data: sections } = await supabase
    .from('chatgpt_sections')
    .select('*')
    .order('sort_order')

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">ChatGPT特集</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections?.map((section) => (
          <div key={section.id} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">{section.name}</h2>
            <p className="text-gray-600 mb-4">{section.description}</p>
            <Link
              href={`/chatgpt-special/${section.slug}`}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              記事一覧を見る →
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
} 