import { Metadata } from 'next'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Database } from '@/lib/supabase/database.types'

// 型エイリアス
type ChatGPTSection = Database['public']['Tables']['chatgpt_sections']['Row']
type ChatGPTPost = Database['public']['Tables']['chatgpt_posts']['Row']

type Props = {
  params: {
    section: string
    slug: string
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
  
  console.log('Params received:', params)
  const decodedSlug = decodeURIComponent(params.slug)
  console.log('Decoded slug:', decodedSlug)

  // まずセクションを取得
  const { data: sectionData, error: sectionError } = await supabase
    .from('chatgpt_sections')
    .select('*')
    .eq('slug', params.section)
    .single()
  const section = sectionData as ChatGPTSection | null

  console.log('Section query:', {
    section,
    error: sectionError,
    slug: params.section,
    query: `SELECT * FROM chatgpt_sections WHERE slug = '${params.section}'`
  })

  if (!section) {
    console.log('Section not found:', params.section)
    return {
      title: 'Not Found',
      description: 'ページが見つかりませんでした。',
    }
  }

  // 記事を取得
  const { data: postData, error: postError } = await supabase
    .from('chatgpt_posts')
    .select('*')
    .eq('slug', decodedSlug)
    .eq('chatgpt_section_id', section.id)
    .eq('status', 'published')
    .eq('is_chatgpt_special', true)
    .single()
  const post = postData as ChatGPTPost | null

  console.log('Post query:', {
    post,
    error: postError,
    slug: decodedSlug,
    sectionId: section.id,
    query: `SELECT * FROM chatgpt_posts WHERE slug = '${decodedSlug}' AND chatgpt_section_id = ${section.id} AND status = 'published' AND is_chatgpt_special = true`
  })

  if (!post) {
    console.log('Post not found:', { slug: decodedSlug, sectionId: section.id })
    return {
      title: 'Not Found',
      description: 'ページが見つかりませんでした。',
    }
  }

  return {
    title: `${post.title} | ${section.name} | ChatGPT特集 | NANDS TECH`,
    description: post.meta_description || post.excerpt || `${post.title}に関する記事です。`,
  }
}

export default async function ChatGPTArticlePage({ params }: Props) {
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
  
  console.log('Page params received:', params)
  const decodedSlug = decodeURIComponent(params.slug)
  console.log('Page decoded slug:', decodedSlug)

  // まずセクションを取得
  const { data: sectionData2, error: sectionError } = await supabase
    .from('chatgpt_sections')
    .select('*')
    .eq('slug', params.section)
    .single()
  const section = sectionData2 as ChatGPTSection | null

  console.log('Page section query:', {
    section,
    error: sectionError,
    slug: params.section,
    query: `SELECT * FROM chatgpt_sections WHERE slug = '${params.section}'`
  })

  if (!section) {
    console.log('Page section not found:', params.section)
    notFound()
  }

  // 記事を取得
  const { data: postData2, error: postError } = await supabase
    .from('chatgpt_posts')
    .select('*')
    .eq('slug', decodedSlug)
    .eq('chatgpt_section_id', section.id)
    .eq('status', 'published')
    .eq('is_chatgpt_special', true)
    .single()
  const post = postData2 as ChatGPTPost | null

  console.log('Page post query:', {
    post,
    error: postError,
    slug: decodedSlug,
    sectionId: section.id,
    query: `SELECT * FROM chatgpt_posts WHERE slug = '${decodedSlug}' AND chatgpt_section_id = ${section.id} AND status = 'published' AND is_chatgpt_special = true`
  })

  if (!post) {
    console.log('Page post not found:', { slug: decodedSlug, sectionId: section.id })
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href={`/chatgpt-special/${section.slug}`}
          className="text-blue-600 hover:text-blue-800"
        >
          ← {section.name}の記事一覧に戻る
        </Link>
      </div>

      <article className="prose prose-indigo max-w-none">
        <h1 className="text-3xl font-bold mb-8">{post.title}</h1>
        
        {post.featured_image && (
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-64 object-cover rounded-lg mb-8"
          />
        )}

        <div 
          className="markdown-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  )
} 