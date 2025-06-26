'use client';

import React from 'react';
import Link from 'next/link';
import type { BlogPost, BlogPostWithRelated } from '../../../types/blog';

interface RelatedPostsProps {
  currentPost: BlogPostWithRelated;
}

const RelatedPosts: React.FC<RelatedPostsProps> = ({ currentPost }) => {
  if (!currentPost.related_posts || currentPost.related_posts.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">関連記事</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentPost.related_posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="block group bg-white border border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                {post.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2">
                {post.meta_description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedPosts;