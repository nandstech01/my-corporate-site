'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase';

interface Category {
  id: number;
  slug: string;
  name: string;
}

interface DatabasePost {
  slug: string;
  title: string;
  meta_description: string;
  thumbnail_url: string | null;
  created_at: string;
  view_count: number | null;
  category_slug: string;
  status: string;
}

interface Post {
  slug: string;
  title: string;
  meta_description: string;
  thumbnail_url: string;
  created_at: string;
  view_count?: number;
}

type SortOption = {
  label: string;
  value: string;
  column: keyof DatabasePost;
  ascending: boolean;
};

const sortOptions: SortOption[] = [
  { label: '新着順', value: 'newest', column: 'created_at', ascending: false },
  { label: '古い順', value: 'oldest', column: 'created_at', ascending: true },
  { label: '閲覧数順', value: 'popular', column: 'view_count', ascending: false },
];

export default function CategoryPosts({ slug }: { slug: string }) {
  console.log('CategoryPosts component mounted with slug:', slug);
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    console.log('CategoryPosts useEffect triggered with slug:', slug);
    
    const fetchPosts = async () => {
      setIsLoading(true);
      const supabase = createClient();
      const currentSort = sortOptions.find(opt => opt.value === sortBy) || sortOptions[0];
      const decodedSlug = decodeURIComponent(slug);
      
      try {
        console.log('Fetching posts with parameters:', {
          originalSlug: slug,
          decodedSlug,
          status: 'published',
          sortColumn: currentSort.column,
          sortAscending: currentSort.ascending
        });

        // カテゴリに属する投稿を取得
        const { data: posts, error: queryError } = await supabase
          .from('posts')
          .select('*')
          .eq('category_slug', decodedSlug)
          .eq('status', 'published')
          .order(currentSort.column, { ascending: currentSort.ascending })
          .returns<DatabasePost[]>();

        console.log('Supabase query result:', {
          success: !queryError,
          error: queryError,
          postsCount: posts?.length || 0,
          firstPost: posts?.[0]
        });

        if (queryError) throw queryError;
        
        const processedPosts = posts?.map(post => ({
          slug: post.slug,
          title: post.title,
          meta_description: post.meta_description,
          thumbnail_url: post.thumbnail_url || '',
          created_at: post.created_at,
          view_count: post.view_count ?? undefined
        })) || [];
        
        console.log('Setting posts state with:', {
          count: processedPosts.length,
          posts: processedPosts
        });
        
        setPosts(processedPosts);
      } catch (error) {
        console.error('Error in fetchPosts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [slug, sortBy]);

  console.log('CategoryPosts rendering with state:', {
    postsCount: posts.length,
    isLoading,
    sortBy
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="block w-32 rounded-md border-gray-200 text-sm focus:border-orange-500 focus:ring-orange-500"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">
            このカテゴリの記事はまだありません。
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="blog-card"
            >
              <div className="blog-card-image">
                {post.thumbnail_url ? (
                  <Image
                    src={post.thumbnail_url}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>
              <div className="blog-card-content">
                <h2 className="blog-card-title">
                  {post.title}
                </h2>
                <p className="blog-card-excerpt">
                  {post.meta_description}
                </p>
                <div className="flex justify-between items-center">
                  <time className="blog-card-meta">
                    {new Date(post.created_at).toLocaleDateString('ja-JP')}
                  </time>
                  {post.view_count !== undefined && (
                    <span className="text-xs text-gray-500">
                      {post.view_count} views
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 