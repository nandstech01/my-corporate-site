'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePostsStore } from '@/stores/posts';
import BlogCard from '@/components/blog/BlogCard';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { posts } = usePostsStore();

  const searchResults = posts.filter(post => {
    const searchText = `${post.title} ${post.content} ${post.meta_description || ''}`.toLowerCase();
    return searchText.includes(query.toLowerCase());
  });

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">
        検索結果: {query}
      </h1>
      
      {searchResults.length === 0 ? (
        <p className="text-gray-600">
          検索結果が見つかりませんでした。
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>検索中...</div>}>
        <SearchResults />
      </Suspense>
    </div>
  );
} 