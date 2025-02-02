'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';
import { generateSlug, ensureUniqueSlug } from '@/utils/slug';

type Category = Database['public']['Tables']['categories']['Row'];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*, posts(count)')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'カテゴリーの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCategory.trim();
    if (!name) return;

    try {
      // スラッグの生成
      const baseSlug = generateSlug(name);
      const { data: existingCategories } = await supabase
        .from('categories')
        .select('slug');
      
      const slug = ensureUniqueSlug(
        baseSlug,
        existingCategories?.map(c => c.slug) || []
      );

      const { data, error } = await supabase
        .from('categories')
        .insert([{ name, slug }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('同じ名前のカテゴリーが既に存在します');
        }
        throw error;
      }
      
      if (data) {
        setCategories([...categories, data]);
        setNewCategory('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'カテゴリーの作成に失敗しました');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    const name = editingCategory.name.trim();
    if (!name) return;

    try {
      // スラッグの生成（既存のスラッグと異なる場合のみ）
      let slug = editingCategory.slug;
      if (name !== categories.find(c => c.id === editingCategory.id)?.name) {
        const baseSlug = generateSlug(name);
        const { data: existingCategories } = await supabase
          .from('categories')
          .select('slug')
          .neq('id', editingCategory.id);
        
        slug = ensureUniqueSlug(
          baseSlug,
          existingCategories?.map(c => c.slug) || []
        );
      }

      const { error } = await supabase
        .from('categories')
        .update({ name, slug })
        .eq('id', editingCategory.id);

      if (error) {
        if (error.code === '23505') {
          throw new Error('同じ名前のカテゴリーが既に存在します');
        }
        throw error;
      }

      setCategories(
        categories.map((category) =>
          category.id === editingCategory.id ? { ...editingCategory, name, slug } : category
        )
      );
      setEditingCategory(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'カテゴリーの更新に失敗しました');
    }
  };

  const handleDelete = async (id: string) => {
    // 記事数を確認
    const category = categories.find(c => c.id === id);
    const postCount = category?.posts?.count ?? 0;
    if (postCount > 0) {
      setError('このカテゴリーには記事が存在するため削除できません');
      return;
    }

    if (!window.confirm('このカテゴリーを削除してもよろしいですか？')) {
      return;
    }

    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      setCategories(categories.filter((category) => category.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'カテゴリーの削除に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="md:flex md:items-center md:justify-between md:space-x-4 xl:border-b xl:pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">カテゴリー管理</h1>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
                >
                  <span className="sr-only">閉じる</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="flex gap-4">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="新しいカテゴリー名"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          <button
            type="submit"
            disabled={!newCategory.trim()}
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            追加
          </button>
        </div>
      </form>

      <div className="mt-6">
        <div className="overflow-hidden bg-white shadow sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {categories.map((category) => (
              <li key={category.id}>
                {editingCategory?.id === category.id ? (
                  <form onSubmit={handleUpdate} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-4">
                      <input
                        type="text"
                        value={editingCategory.name}
                        onChange={(e) =>
                          setEditingCategory({ ...editingCategory, name: e.target.value })
                        }
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                      <button
                        type="submit"
                        disabled={!editingCategory.name.trim()}
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        保存
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCategory(null)}
                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        キャンセル
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="px-4 py-4 flex items-center justify-between sm:px-6">
                    <div className="flex items-center space-x-4">
                      <p className="text-sm font-medium text-gray-900">{category.name}</p>
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                        {category.posts?.count || 0} 記事
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingCategory(category)}
                        className="text-sm text-blue-600 hover:text-blue-900"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-sm text-red-600 hover:text-red-900"
                        disabled={(category.posts?.count ?? 0) > 0}
                      >
                        削除
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 