'use client';

import React from 'react';
import BlogCard from '@/components/blog/BlogCard';
import { BlogPostWithAuthor } from '@/types/blog';

interface RecommendedPostsProps {
  posts: BlogPostWithAuthor[];
}

const RecommendedPosts: React.FC<RecommendedPostsProps> = ({ posts }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default RecommendedPosts;