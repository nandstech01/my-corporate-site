'use client';

import { useState, useEffect } from 'react';
import { PostgrestResponse } from '@supabase/supabase-js';
import Link from 'next/link';
import type { BlogPost } from '@/types/blog';
import { createClient } from '@/lib/supabase';

export default function ArticlesPage() {
  const [articles, setArticles] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            category:categories(*)
          `)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        if (data) {
          const typedData = data.map((item: any) => ({
            id: item.id,
            title: item.title,
            content: item.content,
            slug: item.slug,
            status: item.status,
            meta_description: item.meta_description,
            thumbnail_url: item.thumbnail_url,
            created_at: item.created_at,
            updated_at: item.updated_at,
            category_id: item.category_id,
            view_count: item.view_count,
            category: item.category
          } as BlogPost));
          setArticles(typedData);
        }
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">記事一覧</h1>
        <Link
          href="/admin/articles/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          新規作成
        </Link>
      </div>

      <div className="grid gap-4">
        {articles.map((article) => (
          <div
            key={article.id}
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <Link href={`/admin/articles/${article.id}`}>
              <div>
                <h2 className="text-xl font-semibold mb-2">{article.title}</h2>
                <p className="text-gray-600 mb-2">{article.meta_description}</p>
                <div className="text-sm text-gray-500">
                  作成日: {new Date(article.created_at).toLocaleDateString('ja-JP')}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
} 