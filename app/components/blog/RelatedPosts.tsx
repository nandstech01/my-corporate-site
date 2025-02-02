'use client';

import Link from 'next/link';
import type { BlogPost, BlogPostWithRelated } from '@/types/blog';

interface RelatedPostsProps {
  currentPost: BlogPostWithRelated;
  maxPosts?: number;
}

export default function RelatedPosts({
  currentPost,
  maxPosts = 3,
}: RelatedPostsProps) {
  const relatedPosts = currentPost.relatedPosts?.filter(
    (post) => post.published_at
  ).slice(0, maxPosts) || [];

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">関連記事</h2>
      <div className="space-y-4">
        {relatedPosts.map((post) => (
          <div key={post.slug} className="bg-white p-4 rounded-lg shadow">
            <Link href={`/blog/${post.slug}`}>
              <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                {post.title}
              </h3>
            </Link>
            <p className="mt-1 text-sm text-gray-500">{post.excerpt}</p>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <time dateTime={post.published_at || ''}>
                {post.published_at ? new Date(post.published_at).toLocaleDateString() : '未公開'}
              </time>
              <span className="mx-2">·</span>
              <span>{post.views || 0} 閲覧</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}