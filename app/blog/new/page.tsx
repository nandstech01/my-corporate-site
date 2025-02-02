'use client';

import { createClient } from '@/lib/supabase/supabase';
import { generateSlug } from '@/utils/slug';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewPostPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const title = formData.get('title') as string;
      const content = formData.get('content') as string;
      const description = formData.get('description') as string;
      const categorySlug = formData.get('category_slug') as string;
      
      if (!title || !content) {
        setError('タイトルと本文は必須です。');
        return;
      }

      const slug = await generateSlug(title);
      const supabase = createClient();

      const { data, error: insertError } = await supabase
        .from('posts')
        .insert({
          title,
          content,
          slug,
          status: 'published',
          category_slug: categorySlug || 'general',
          description,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating post:', insertError);
        setError('記事の作成に失敗しました。');
        return;
      }

      router.push(`/blog/${data.slug}`);
    } catch (err) {
      console.error('Error creating post:', err);
      setError('記事の作成に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">新規記事作成</h1>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            タイトル
          </label>
          <input
            type="text"
            name="title"
            id="title"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            説明文
          </label>
          <textarea
            name="description"
            id="description"
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          />
        </div>

        <div>
          <label htmlFor="category_slug" className="block text-sm font-medium text-gray-700">
            カテゴリー
          </label>
          <select
            name="category_slug"
            id="category_slug"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          >
            <option value="general">一般</option>
            <option value="news">ニュース</option>
            <option value="guide">ガイド</option>
          </select>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            本文 (Markdown)
          </label>
          <textarea
            name="content"
            id="content"
            rows={20}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 font-mono"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center rounded-md border border-transparent bg-orange-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  );
} 