import { Metadata } from 'next'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Database } from '@/lib/supabase/database.types'

type Props = {
  params: {
    section: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
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
  
  const { data: section } = await supabase
    .from('chatgpt_sections')
    .select('*')
    .eq('slug', params.section)
    .single()

  if (!section) {
    return {
      title: 'Not Found',
      description: 'ページが見つかりませんでした。',
    }
  }

  return {
    title: `${section.name} | ChatGPT特集 | NANDS TECH`,
    description: section.description || `ChatGPT特集の${section.name}に関する記事一覧です。`,
  }
}

export default async function ChatGPTSectionPage({ params }: Props) {
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
  
  const { data: section } = await supabase
    .from('chatgpt_sections')
    .select('*')
    .eq('slug', params.section)
    .single()

  if (!section) {
    notFound()
  }

  const { data: posts } = await supabase
    .from('chatgpt_posts')
    .select('*')
    .eq('section_id', section.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href="/chatgpt-special"
          className="text-blue-600 hover:text-blue-800"
        >
          ← ChatGPT特集トップに戻る
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">{section.name}</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts?.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
            {post.featured_image && (
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            <h2 className="text-xl font-semibold mb-4">{post.title}</h2>
            <p className="text-gray-600 mb-4">{post.excerpt}</p>
            <Link
              href={`/chatgpt-special/${section.slug}/${post.slug}`}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              記事を読む →
            </Link>
          </div>
        ))}

        {posts?.length === 0 && (
          <p className="text-gray-600">
            まだ記事が投稿されていません。
          </p>
        )}
      </div>
    </div>
  )
} 