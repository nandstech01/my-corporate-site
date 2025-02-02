'use client';

import { createClient } from '@/lib/supabase/supabase';
import { generateSlug } from '@/utils/slug';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BUSINESS_CATEGORIES } from '../metadata';

type BusinessCategory = keyof typeof BUSINESS_CATEGORIES;

export default function NewPostPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessCategory>('fukugyo');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const title = formData.get('title') as string;
      const content = formData.get('content') as string;
      const metaDescription = formData.get('meta_description') as string;
      const businessCategory = formData.get('business_category') as BusinessCategory;
      const categorySlug = formData.get('category_slug') as string;
      const tags = (formData.get('tags') as string).split(',').map(tag => tag.trim()).filter(Boolean);
      
      if (!title || !content || !businessCategory || !categorySlug) {
        setError('タイトル、本文、事業カテゴリー、カテゴリーは必須です。');
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
          business_category: businessCategory,
          category_slug: categorySlug,
          meta_description: metaDescription || null,
          tags: tags.length > 0 ? tags : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          views: 0,
          likes: 0,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating post:', insertError);
        setError('記事の作成に失敗しました。');
        return;
      }

      router.push(`/blog/${businessCategory}/${categorySlug}/${data.slug}`);
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
          <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700">
            メタ説明文
          </label>
          <textarea
            name="meta_description"
            id="meta_description"
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            placeholder="検索結果やSNSでの表示に使用される説明文を入力してください"
          />
        </div>

        <div>
          <label htmlFor="business_category" className="block text-sm font-medium text-gray-700">
            事業カテゴリー
          </label>
          <select
            name="business_category"
            id="business_category"
            value={selectedBusiness}
            onChange={(e) => setSelectedBusiness(e.target.value as BusinessCategory)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          >
            {Object.entries(BUSINESS_CATEGORIES).map(([key, value]) => (
              <option key={key} value={key}>
                {value.name}
              </option>
            ))}
          </select>
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
            {BUSINESS_CATEGORIES[selectedBusiness].categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
            タグ（カンマ区切り）
          </label>
          <input
            type="text"
            name="tags"
            id="tags"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            placeholder="AI, ChatGPT, リスキリング"
          />
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