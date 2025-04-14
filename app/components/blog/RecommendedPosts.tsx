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
        <BlogCard 
          key={post.id} 
          title={post.title}
          description={post.meta_description || post.content.substring(0, 150) + '...'}
          thumbnailUrl={post.thumbnail_url || '/images/placeholder.jpg'}
          businessName={post.category?.name || 'ブログ'}
          businessSlug={'blog'}
          categoryName={post.category?.name || 'その他'}
          categorySlug={post.category?.slug || 'other'}
          slug={post.slug}
          publishedAt={post.published_at || post.created_at}
        />
      ))}
    </div>
  );
};

export default RecommendedPosts;