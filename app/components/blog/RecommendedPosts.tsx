'use client';

import React from 'react';
import { usePostsStore } from '@/stores/posts';
import BlogCard from '@/components/blog/BlogCard';
import { BlogPostWithAuthor } from '@/types/blog';

interface RecommendedPostsProps {
  currentPostId: string;
  maxPosts?: number;
}

export default function RecommendedPosts({ currentPostId, maxPosts = 3 }: RecommendedPostsProps) {
  const { posts } = usePostsStore();
  const recommendedPosts = posts
    .filter(post => post.slug !== currentPostId)
    .slice(0, maxPosts);

  if (recommendedPosts.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">おすすめの記事</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendedPosts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}