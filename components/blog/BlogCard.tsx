'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BlogPostWithAuthor } from '../../types/blog';

interface BlogCardProps {
  post: BlogPostWithAuthor;
}

const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 group-hover:shadow-xl">
        <div className="relative h-48">
          <Image
            src={post.thumbnail_url || '/images/default-blog-thumbnail.jpg'}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
            {post.title}
          </h3>
          <p className="text-gray-600 mb-4 line-clamp-2">
            {post.meta_description}
          </p>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
            {post.category && (
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                {post.category.name}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard; 