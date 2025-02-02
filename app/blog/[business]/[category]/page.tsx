import { Metadata } from 'next'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Database } from '@/lib/supabase/database.types'

type Props = {
  params: {
    business: string
    category: string
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
  
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', params.business)
    .single()

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', params.category)
    .single()

  if (!business || !category) {
    return {
      title: 'Not Found',
      description: 'ページが見つかりませんでした。',
    }
  }

  return {
    title: `${category.name} | ${business.name} | NANDS TECH`,
    description: category.description || `${business.name}の${category.name}に関する記事一覧です。`,
  }
}

export default async function BusinessCategoryPage({ params }: Props) {
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
  
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', params.business)
    .single()

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', params.category)
    .single()

  if (!business || !category) {
    notFound()
  }

  const { data: posts } = await supabase
    .from('chatgpt_posts')
    .select('*')
    .eq('business_id', business.id)
    .eq('category_id', category.id)
    .eq('status', 'published')
    .eq('is_chatgpt_special', false)
    .order('published_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href={`/blog/${business.slug}`}
          className="text-blue-600 hover:text-blue-800"
        >
          ← {business.name}の記事一覧に戻る
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">{category.name}</h1>
      
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
              href={`/blog/${business.slug}/${category.slug}/${post.slug}`}
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