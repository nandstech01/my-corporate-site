'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/supabase';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  post_count?: number;
}

export default function RelatedCategories({ currentCategoryId }: { currentCategoryId: number }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedCategories = async () => {
      const supabase = createClient();
      
      try {
        // 現在のカテゴリ以外のカテゴリを取得し、記事数で並び替え
        const { data: categoriesWithCount, error } = await supabase
          .from('categories')
          .select(`
            id,
            name,
            slug,
            description,
            posts!inner (id)
          `)
          .neq('id', currentCategoryId)
          .order('name');

        if (error) throw error;

        // 記事数をカウントして整形
        const formattedCategories = (categoriesWithCount || []).map(category => ({
          ...category,
          post_count: category.posts?.length || 0
        }))
        .sort((a, b) => (b.post_count || 0) - (a.post_count || 0))
        .slice(0, 3); // 上位3つのカテゴリのみ表示

        setCategories(formattedCategories);
      } catch (error) {
        console.error('Error fetching related categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelatedCategories();
  }, [currentCategoryId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-gray-100 pt-12">
      <h2 className="text-xl font-bold text-center mb-8">関連カテゴリ</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/blog/category/${category.slug}`}
            className="block group"
          >
            <div className="bg-white rounded-lg border border-gray-100 p-6 transition-all duration-200 hover:border-orange-100 hover:shadow-md">
              <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors mb-2">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {category.description}
                </p>
              )}
              <span className="text-xs text-gray-500">
                {category.post_count}件の記事
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
} 