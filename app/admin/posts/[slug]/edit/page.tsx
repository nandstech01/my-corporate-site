'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/supabase';
import ImageUploader from '@/components/ImageUploader';
import PostPreview from '@/components/PostPreview';
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

export default function EditPostPage({
  params,
}: {
  params: { slug: string };
}) {
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
  const [postId, setPostId] = React.useState<string>('');

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
    };

    fetchCategories();
  }, [businessId]);

  // 記事データの取得
  React.useEffect(() => {
    const fetchPost = async () => {
      const decodedSlug = decodeURIComponent(params.slug);
      
      const { data: post, error } = await supabase
        .from('chatgpt_posts')
        .select(`
          *,
          business:business_id(id, slug, name),
          category:category_id(id, slug, name, business_id),
          chatgpt_section:chatgpt_section_id(id, slug, name)
        `)
        .eq('slug', decodedSlug)
        .single();

      if (error) {
        console.error('Error fetching post:', error);
        if (error.code === 'PGRST116') {
          alert('投稿が見つかりませんでした');
          router.push('/admin/posts');
        }
        return;
      }

      if (post) {
        setTitle(post.title);
        setContent(post.content);
        setStatus(post.status);
        setThumbnailUrl(post.featured_image || '');
        setMetaDescription(post.meta_description || '');
        setSeoKeywords(post.seo_keywords || []);
        setIsIndexable(post.is_indexable ?? true);
        setCanonicalUrl(post.canonical_url || '');
        setPostId(post.id);
        setIsChatGPTSpecial(post.is_chatgpt_special);

        if (post.is_chatgpt_special) {
          setChatGPTSectionId(post.chatgpt_section?.id || null);
        } else {
          setBusinessId(post.business?.id || null);
          setCategoryId(post.category?.id || null);
        }
      }
    };

    fetchPost();
  }, [params.slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!user) {
      alert('ログインが必要です');
      return;
    }

    try {
      const { error: postError } = await supabase
        .from('chatgpt_posts')
        .update({
          title,
          content,
          status,
          business_id: isChatGPTSpecial ? null : businessId,
          category_id: isChatGPTSpecial ? null : categoryId,
          chatgpt_section_id: isChatGPTSpecial ? chatGPTSectionId : null,
          featured_image: thumbnailUrl,
          updated_at: new Date().toISOString(),
          meta_description: metaDescription,
          seo_keywords: seoKeywords,
          is_indexable: isIndexable,
          canonical_url: canonicalUrl || null,
          is_chatgpt_special: isChatGPTSpecial
        })
        .eq('slug', params.slug);

      if (postError) throw postError;

      router.push('/admin/posts');
    } catch (error) {
      console.error('Error updating post:', error);
      alert('記事の更新に失敗しました');
    } finally {
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

  const toggleStatus = () => {
    setStatus(status === 'published' ? 'draft' : 'published');
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
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">{title}</h1>
          <button
            onClick={togglePreview}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            編集に戻る
          </button>
        </div>
        <PostPreview content={content} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">記事の編集</h1>
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
                <PostPreview content={content} />
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
                    postId={postId}
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