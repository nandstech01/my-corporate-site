'use client';

import type { Bookmark } from '@/types/blog';
import { MOCK_BOOKMARKS } from '@/src/mock/bookmarks';
import BlogCard from '@/components/blog/BlogCard';

export default function BookmarksPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">ブックマーク一覧</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_BOOKMARKS.map((bookmark) => (
          <BlogCard
            key={bookmark.id}
            title={bookmark.title}
            description={bookmark.description}
            thumbnailUrl={bookmark.thumbnail_url}
            date={bookmark.created_at}
            href={bookmark.url}
          />
        ))}
      </div>
    </div>
  );
} 