'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase';
import './categories.css';

interface DatabaseCategory {
  id: number;
  name: string;
  slug: string;
}

interface DatabasePost {
  title: string;
  slug: string;
  thumbnail_url: string | null;
  created_at: string;
  category_slug: string;
  status: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  post_count?: number;
  latest_posts?: {
    title: string;
    slug: string;
    thumbnail_url?: string;
    created_at: string;
  }[];
}

export default function CategoriesList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient();
      
      try {
        // カテゴリとそれに関連する記事数を取得
        const { data: categoriesData, error: countError } = await supabase
          .from('categories')
          .select(`
            id,
            name,
            slug
          `)
          .returns<DatabaseCategory[]>()
          .order('name');

        if (countError) throw countError;

        // 各カテゴリの最新記事を取得
        const categoriesWithPosts = await Promise.all(
          (categoriesData || []).map(async (category) => {
            const { data: posts, error: postsError } = await supabase
              .from('posts')
              .select('title, slug, thumbnail_url, created_at')
              .eq('category_slug', category.slug)
              .eq('status', 'published')
              .order('created_at', { ascending: false })
              .limit(3)
              .returns<DatabasePost[]>();

            // 記事数を取得
            const { count: postCount } = await supabase
              .from('posts')
              .select('*', { count: 'exact', head: true })
              .eq('category_slug', category.slug)
              .eq('status', 'published');

            if (postsError) throw postsError;

            return {
              ...category,
              post_count: postCount || 0,
              latest_posts: posts?.map(post => ({
                ...post,
                thumbnail_url: post.thumbnail_url || undefined
              })) || [],
            };
          })
        );

        setCategories(categoriesWithPosts);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="blog-categories">
      {categories.map((category) => (
        <div key={category.slug} className="blog-category-card">
          <div className="blog-category-header">
            <div className="flex justify-between items-center">
              <Link 
                href={`/blog/category/${category.slug}`}
                className="blog-category-title"
              >
                {category.name}
              </Link>
              <span className="blog-category-count">
                {category.post_count}件の記事
              </span>
            </div>
          </div>
          
          <div className="blog-category-posts">
            {category.latest_posts?.map((post) => (
              <Link 
                key={post.slug} 
                href={`/blog/${post.slug}`}
                className="blog-category-post"
              >
                <div className="blog-category-post-image">
                  {post.thumbnail_url ? (
                    <Image
                      src={post.thumbnail_url}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded" />
                  )}
                </div>
                <h3 className="blog-category-post-title">
                  {post.title}
                </h3>
                <time className="blog-category-post-date">
                  {new Date(post.created_at).toLocaleDateString('ja-JP')}
                </time>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 