'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export type BlogCardProps = {
  title: string
  description: string
  thumbnailUrl: string
  businessName: string
  businessSlug: string
  categoryName: string
  categorySlug: string
  slug: string
  publishedAt: string
};

const BlogCard: React.FC<BlogCardProps> = ({
  title,
  description,
  thumbnailUrl,
  businessName,
  businessSlug,
  categoryName,
  categorySlug,
  slug,
  publishedAt,
}) => {
  return (
    <Link
      href={`/blog/${businessSlug}/${categorySlug}/${slug}`}
              className="group block bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="aspect-w-16 aspect-h-9 relative">
        <Image
          src={thumbnailUrl}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-200"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <span>{businessName}</span>
          <span>•</span>
          <span>{categoryName}</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {description}
        </p>
        <time dateTime={publishedAt} className="text-sm text-gray-500">
          {new Date(publishedAt).toLocaleDateString('ja-JP')}
        </time>
      </div>
    </Link>
  );
};

export default BlogCard; 