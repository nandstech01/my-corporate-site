'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/supabase';
import ImageUploader from '@/components/ImageUploader';
import PostPreview from '@/components/PostPreview';
import { generateSlug, ensureUniqueSlug } from '@/utils/slug';
import { useAuth } from '@/contexts/AuthContext';
import ContentImageManager from '@/components/admin/ContentImageManager';

type Category = {
  id: number;
  slug: string;
  name: string;
  business_id: number;
};

type Business = {
  id: number;
  slug: string;
  name: string;
};

type ChatGPTSection = {
  id: number;
  name: string;
  slug: string;
};

export default function NewPostPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isPreviewMode, setIsPreviewMode] = React.useState(false);
  
  // 投稿タイプの状態
  const [isChatGPTSpecial, setIsChatGPTSpecial] = React.useState(false);
  
  // 通常記事用の状態
  const [businessId, setBusinessId] = React.useState<number | null>(null);
  const [categoryId, setCategoryId] = React.useState<number | null>(null);
  const [businesses, setBusinesses] = React.useState<Business[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  
  // ChatGPT特集用の状態
  const [chatGPTSectionId, setChatGPTSectionId] = React.useState<number | null>(null);
  const [chatGPTSections, setChatGPTSections] = React.useState<ChatGPTSection[]>([]);
  
  // 共通の状態
  const [status, setStatus] = React.useState<'draft' | 'published'>('draft');
  const [thumbnailUrl, setThumbnailUrl] = React.useState<string>('');
  const [metaDescription, setMetaDescription] = React.useState('');
  const [seoKeywords, setSeoKeywords] = React.useState<string[]>([]);
  const [isIndexable, setIsIndexable] = React.useState(true);
  const [canonicalUrl, setCanonicalUrl] = React.useState('');
  const [seoKeywordInput, setSeoKeywordInput] = React.useState('');
  const [tempPostId, setTempPostId] = React.useState<string>('');

  // ChatGPTセクション一覧を取得
  React.useEffect(() => {
    const fetchChatGPTSections = async () => {
      const { data, error } = await supabase
        .from('chatgpt_sections')
        .select('id, name, slug')
        .order('sort_order');
      
      if (error) {
        console.error('Error fetching ChatGPT sections:', error);
        return;
      }

      setChatGPTSections(data || []);
    };

    fetchChatGPTSections();
  }, []);

  // 事業一覧を取得
  React.useEffect(() => {
    const fetchBusinesses = async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, slug, name')
        .order('id');
      
      if (error) {
        console.error('Error fetching businesses:', error);
        return;
      }

      setBusinesses(data || []);
    };

    fetchBusinesses();
  }, []);

  // カテゴリー一覧を取得（事業が選択されたとき）
  React.useEffect(() => {
    const fetchCategories = async () => {
      if (!businessId) {
        setCategories([]);
        return;
      }

      const { data, error } = await supabase
        .from('categories')
        .select('id, slug, name, business_id')
        .eq('business_id', businessId)
        .order('name');
      
      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      setCategories(data || []);
      setCategoryId(null); // 事業が変更されたらカテゴリーの選択をリセット
    };

    fetchCategories();
  }, [businessId]);

  React.useEffect(() => {
    setTempPostId(crypto.randomUUID());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!user) {
      alert('ログインが必要です');
      return;
    }

    console.log('Current user:', user);
    console.log('User authentication status:', await supabase.auth.getSession());

    // バリデーション
    if (isChatGPTSpecial) {
      if (!chatGPTSectionId) {
        alert('セクションを選択してください');
        return;
      }
    } else {
      if (!businessId || !categoryId) {
        alert('事業とカテゴリーを選択してください');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const { data: existingPosts, error: slugError } = await supabase
        .from('chatgpt_posts')
        .select('slug');
      
      if (slugError) {
        console.error('Error checking existing slugs:', slugError);
        throw slugError;
      }

      const baseSlug = generateSlug(title);
      if (!baseSlug) {
        throw new Error('タイトルが無効です');
      }

      const slug = await ensureUniqueSlug(baseSlug, existingPosts?.map((p: { slug: string }) => p.slug) || []);
      if (!slug) {
        throw new Error('スラグの生成に失敗しました');
      }

      // 記事を作成
      const { data: newPost, error: postError } = await supabase
        .from('chatgpt_posts')
        .insert([
          {
            title,
            content,
            excerpt: content.substring(0, 200) + '...',
            business_id: isChatGPTSpecial ? null : businessId,
            category_id: isChatGPTSpecial ? null : categoryId,
            slug,
            author_id: user.id,
            status,
            is_chatgpt_special: isChatGPTSpecial,
            featured_image: thumbnailUrl || null,
            published_at: status === 'published' ? new Date().toISOString() : null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (postError) {
        console.error('Error creating post:', postError);
        throw postError;
      }

      // 画像の関連付けを更新
      if (tempPostId && newPost?.id) {
        const { error: imageError } = await supabase
          .from('post_images')
          .update({ post_id: newPost.id })
          .eq('post_id', tempPostId);

        if (imageError) {
          console.error('Error updating image associations:', imageError);
        }
      }

      await new Promise(resolve => setTimeout(resolve, 100));
      router.push('/admin/posts');
    } catch (error: any) {
      console.error('Error creating post:', error);
      alert(error.message || '記事の作成に失敗しました');
      setIsSubmitting(false);
    }
  };

  const handleAddKeyword = () => {
    if (seoKeywordInput.trim() && !seoKeywords.includes(seoKeywordInput.trim())) {
      setSeoKeywords([...seoKeywords, seoKeywordInput.trim()]);
      setSeoKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setSeoKeywords(seoKeywords.filter(k => k !== keyword));
  };

  const togglePreview = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  const handleImageSelect = (imageId: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (!textarea) return;

    const { selectionStart, selectionEnd } = textarea;
    const currentContent = textarea.value;
    const newContent = 
      currentContent.substring(0, selectionStart) +
      `![[${imageId}]]` +
      currentContent.substring(selectionEnd);

    setContent(newContent);
  };

  if (isPreviewMode) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center">
          <button
            onClick={togglePreview}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            編集に戻る
          </button>
        </div>
        <PostPreview
          title={title}
          content={content}
          thumbnailUrl={thumbnailUrl}
          metaDescription={metaDescription}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">新規記事作成</h1>
        <button
          type="button"
          onClick={togglePreview}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          プレビュー
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            投稿タイプ
          </label>
          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                checked={!isChatGPTSpecial}
                onChange={() => setIsChatGPTSpecial(false)}
              />
              <span className="ml-2">通常記事</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                checked={isChatGPTSpecial}
                onChange={() => setIsChatGPTSpecial(true)}
              />
              <span className="ml-2">ChatGPT特集記事</span>
            </label>
          </div>
        </div>

        {/* 通常記事の場合の入力フィールド */}
        {!isChatGPTSpecial && (
          <>
            <div>
              <label htmlFor="business" className="block text-sm font-medium text-gray-700 mb-1">
                事業選択
              </label>
              <select
                id="business"
                value={businessId || ''}
                onChange={(e) => setBusinessId(e.target.value ? Number(e.target.value) : null)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                required
              >
                <option value="">事業を選択してください</option>
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                カテゴリ選択
              </label>
              <select
                id="category"
                value={categoryId || ''}
                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                required
                disabled={!businessId}
              >
                <option value="">カテゴリを選択してください</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* ChatGPT特集記事の場合の入力フィールド */}
        {isChatGPTSpecial && (
          <div>
            <label htmlFor="chatgptSection" className="block text-sm font-medium text-gray-700 mb-1">
              セクション選択
            </label>
            <select
              id="chatgptSection"
              value={chatGPTSectionId || ''}
              onChange={(e) => setChatGPTSectionId(e.target.value ? Number(e.target.value) : null)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              required
            >
              <option value="">セクションを選択してください</option>
              {chatGPTSections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 共通フィールド */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            タイトル
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ステータス
          </label>
          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                checked={status === 'draft'}
                onChange={() => setStatus('draft')}
              />
              <span className="ml-2">下書き</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                checked={status === 'published'}
                onChange={() => setStatus('published')}
              />
              <span className="ml-2">公開</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            サムネイル画像
          </label>
          <ImageUploader
            onImageUploaded={setThumbnailUrl}
            currentImageUrl={thumbnailUrl}
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
            本文
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-96 font-mono"
                required
              />
            </div>
            <div>
              <ContentImageManager
                postId={tempPostId}
                onImageSelect={handleImageSelect}
              />
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="metaDescription" className="block text-sm font-semibold text-gray-700 mb-2">
            メタディスクリプション
          </label>
          <textarea
            id="metaDescription"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            SEOキーワード
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={seoKeywordInput}
              onChange={(e) => setSeoKeywordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="キーワードを入力"
            />
            <button
              type="button"
              onClick={handleAddKeyword}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              追加
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {seoKeywords.map((keyword) => (
              <span
                key={keyword}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
              >
                {keyword}
                <button
                  type="button"
                  onClick={() => handleRemoveKeyword(keyword)}
                  className="ml-2 inline-flex items-center p-0.5 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none"
                >
                  <span className="sr-only">削除</span>
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="canonicalUrl" className="block text-sm font-semibold text-gray-700 mb-2">
            正規URL（任意）
          </label>
          <input
            type="url"
            id="canonicalUrl"
            value={canonicalUrl}
            onChange={(e) => setCanonicalUrl(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isIndexable"
            checked={isIndexable}
            onChange={(e) => setIsIndexable(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="isIndexable" className="ml-2 block text-sm text-gray-900">
            検索エンジンのインデックスを許可する
          </label>
        </div>
        <div className="flex justify-end gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  );
} 