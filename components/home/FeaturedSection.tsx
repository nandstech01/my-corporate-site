'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import PostImage from '@/components/common/PostImage'

type Post = {
  id: string
  title: string
  slug: string
  excerpt: string
  thumbnail_url: string | null
  featured_image: string | null
}

export function FeaturedSection() {
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    const fetchPosts = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('chatgpt_posts')
        .select(`
          id,
          title,
          slug,
          excerpt,
          thumbnail_url,
          featured_image
        `)
        .eq('status', 'published')
        .eq('is_chatgpt_special', true)
        .order('created_at', { ascending: false })
        .limit(3)

      if (error) {
        console.error('Error fetching posts:', error)
        return
      }

      console.log('Fetched ChatGPT posts:', data)
      setPosts(data || [])
    }

    fetchPosts()
  }, [])

  if (posts.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">ChatGPT特集</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            最新のAIテクノロジーを活用したビジネスソリューションと導入事例をご紹介します
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <Link
              key={post.id}
              href={`/posts/${post.slug}`}
              className="group transform hover:-translate-y-1 transition-all duration-300"
            >
              <article className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative w-full" style={{ paddingBottom: '66.67%' }}>
                  <PostImage
                    src={post.thumbnail_url || post.featured_image}
                    alt={post.title}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 line-clamp-2 mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 font-medium group-hover:text-blue-800 transition-colors duration-200">
                      詳しく見る →
                    </span>
                    <div className="flex items-center space-x-1">
                      <span className="inline-flex items-center justify-center bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                        ChatGPT
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/posts"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            すべての記事を見る
          </Link>
        </div>
      </div>
    </section>
  )
} 