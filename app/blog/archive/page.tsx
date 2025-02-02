'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/blog/Breadcrumb';
import { ArchiveBulkActions } from '@/components/blog/ArchiveBulkActions';
import { useArchive } from '@/hooks/useArchive';

export default function ArchivePage() {
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterTag, setFilterTag] = useState<string>('');
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const { archivedPosts, removeMultipleFromArchive } = useArchive();

  // カテゴリーとタグの一覧を取得（重複を除去）
  const categories = Array.from(new Set(archivedPosts.map(post => post.category))).sort();
  const tags = Array.from(new Set(archivedPosts.flatMap(post => post.tags))).sort();

  // フィルタリングと並び替えを適用
  const filteredAndSortedPosts = archivedPosts
    .filter(post => !filterCategory || post.category === filterCategory)
    .filter(post => !filterTag || post.tags.includes(filterTag))
    .sort((a, b) => {
      if (sortBy === 'date') {
        return b.timestamp - a.timestamp;
      }
      return a.title.localeCompare(b.title, 'ja');
    });

  const handlePostSelect = (postSlug: string) => {
    setSelectedPosts(prev =>
      prev.includes(postSlug)
        ? prev.filter(slug => slug !== postSlug)
        : [...prev, postSlug]
    );
  };

  const handleClearSelection = () => {
    setSelectedPosts([]);
  };

  const handleRemoveSelected = () => {
    if (removeMultipleFromArchive(selectedPosts)) {
      setSelectedPosts([]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Breadcrumb items={[
          { label: 'ホーム', href: '/' },
          { label: 'ブログ', href: '/blog' },
          { label: 'アーカイブ', href: '/blog/archive' }
        ]} />
        
        <h1 className="text-3xl font-bold mb-8">アーカイブ一覧</h1>

        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                並び替え
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
                className="w-full rounded-lg border-gray-300 text-sm focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="date">保存日時順</option>
                <option value="title">タイトル順</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                カテゴリー
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full rounded-lg border-gray-300 text-sm focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">すべて</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                タグ
              </label>
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="w-full rounded-lg border-gray-300 text-sm focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">すべて</option>
                {tags.map(tag => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredAndSortedPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              アーカイブされた記事はありません
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredAndSortedPosts.map(post => (
              <article
                key={post.slug}
                className={`p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                  selectedPosts.includes(post.slug) ? 'ring-2 ring-orange-500' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={selectedPosts.includes(post.slug)}
                      onChange={() => handlePostSelect(post.slug)}
                      className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                    />
                  </div>
                  <Link href={`/blog/${post.slug}`} className="block flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-orange-100 text-orange-800 rounded-full px-2 py-0.5">
                        {post.category}
                      </span>
                      <time className="text-xs text-gray-500">
                        {new Date(post.timestamp).toLocaleDateString('ja-JP')}
                      </time>
                    </div>
                    <h2 className="text-xl font-bold mb-2 hover:text-orange-600 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        <ArchiveBulkActions
          selectedPosts={selectedPosts}
          onClearSelection={handleClearSelection}
          onRemoveSelected={handleRemoveSelected}
        />
      </div>
    </div>
  );
} 