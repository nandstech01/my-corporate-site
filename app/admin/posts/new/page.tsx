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
    textarea.value = newContent;
    textarea.focus();
    textarea.setSelectionRange(
      selectionStart + imageId.length + 4,
      selectionStart + imageId.length + 4
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">新規記事作成</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 投稿タイプ切り替え */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">投稿タイプ</h2>
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
              <span className="ml-2">ChatGPT特集</span>
            </label>
          </div>
        </div>

        {/* カテゴリー選択（通常記事の場合） */}
        {!isChatGPTSpecial && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">カテゴリー</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  事業
                </label>
                <select
                  value={businessId || ''}
                  onChange={(e) => setBusinessId(e.target.value ? Number(e.target.value) : null)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">選択してください</option>
                  {businesses.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  カテゴリー
                </label>
                <select
                  value={categoryId || ''}
                  onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  disabled={!businessId}
                >
                  <option value="">選択してください</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ChatGPTセクション選択（ChatGPT特集の場合） */}
        {isChatGPTSpecial && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">ChatGPTセクション</h2>
            <select
              value={chatGPTSectionId || ''}
              onChange={(e) => setChatGPTSectionId(e.target.value ? Number(e.target.value) : null)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">選択してください</option>
              {chatGPTSections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 記事情報 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">記事情報</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                タイトル
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                サムネイル画像
              </label>
              <ImageUploader
                onImageUploaded={setThumbnailUrl}
                currentImageUrl={thumbnailUrl}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  本文
                </label>
                <button
                  type="button"
                  onClick={togglePreview}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  {isPreviewMode ? '編集に戻る' : 'プレビュー'}
                </button>
              </div>
              {isPreviewMode ? (
                <PostPreview content={content} title={title} />
              ) : (
                <>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={10}
                    required
                  />
                  <ContentImageManager
                    postId={tempPostId}
                    onImageSelect={handleImageSelect}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* SEO設定 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">SEO設定</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                メタディスクリプション
              </label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                SEOキーワード
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  value={seoKeywordInput}
                  onChange={(e) => setSeoKeywordInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddKeyword();
                    }
                  }}
                  className="flex-1 rounded-none rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-gray-500 hover:bg-gray-100"
                >
                  追加
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {seoKeywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-0.5 text-sm font-medium text-indigo-800"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="ml-1.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-indigo-600 hover:bg-indigo-200 hover:text-indigo-500 focus:bg-indigo-500 focus:text-white focus:outline-none"
                    >
                      <span className="sr-only">Remove {keyword}</span>
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Canonical URL
              </label>
              <input
                type="url"
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isIndexable}
                  onChange={(e) => setIsIndexable(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-600">
                  検索エンジンのインデックスを許可する
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* 公開設定 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">公開設定</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                ステータス
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="draft">下書き</option>
                <option value="published">公開</option>
              </select>
            </div>
          </div>
        </div>

        {/* 送信ボタン */}
        <div className="flex justify-end">
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