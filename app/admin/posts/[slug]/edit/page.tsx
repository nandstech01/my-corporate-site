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

// 記事データの型定義
type Post = {
  id: number | string;
  title: string;
  content: string;
  slug: string;
  status: string;
  business_id?: number | null;
  category_id?: number | null;
  section_id?: number | null;
  chatgpt_section_id?: number | null;
  featured_image?: string;
  thumbnail_url?: string;
  meta_description?: string;
  seo_keywords?: string[];
  meta_keywords?: string[];
  is_indexable?: boolean;
  canonical_url?: string;
  is_chatgpt_special?: boolean;
  table_type?: 'posts' | 'chatgpt_posts';
  business?: Business;
  category?: Category;
  chatgpt_section?: ChatGPTSection;
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
  const [tableType, setTableType] = React.useState<'posts' | 'chatgpt_posts'>('posts');
  const [isGeneratingSEO, setIsGeneratingSEO] = React.useState(false);

  // 両方のテーブルから記事を検索する関数
  const fetchPost = async (slug: string): Promise<Post | null> => {
    const decodedSlug = decodeURIComponent(slug);
    
    // まずpostsテーブルから検索
    const { data: newPost, error: newError } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', decodedSlug)
      .single();
    
    if (newPost && !newError) {
      return { ...newPost, table_type: 'posts' };
    }
    
    // postsテーブルに見つからない場合は、chatgpt_postsテーブルから検索
    const { data: oldPost, error: oldError } = await supabase
      .from('chatgpt_posts')
      .select(`
        *,
        business:business_id(id, slug, name),
        category:category_id(id, slug, name, business_id),
        chatgpt_section:chatgpt_section_id(id, slug, name)
      `)
      .eq('slug', decodedSlug)
      .single();
    
    if (oldPost && !oldError) {
      return { ...oldPost, table_type: 'chatgpt_posts' };
    }
    
    return null;
  };

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
    const loadPost = async () => {
      const post = await fetchPost(params.slug);

      if (!post) {
        console.error('Post not found');
        alert('投稿が見つかりませんでした');
        router.push('/admin/posts');
        return;
      }

      setTitle(post.title);
      setContent(post.content);
      setStatus(post.status as 'draft' | 'published');
      setThumbnailUrl(post.featured_image || post.thumbnail_url || '');
      setMetaDescription(post.meta_description || '');
      setSeoKeywords(post.seo_keywords || post.meta_keywords || []);
      setIsIndexable(post.is_indexable ?? true);
      setCanonicalUrl(post.canonical_url || '');
      setPostId(post.id.toString());
      setTableType(post.table_type || 'posts');

      // RAG記事（postsテーブル）の場合
      if (post.table_type === 'posts') {
        setIsChatGPTSpecial(false);
        setBusinessId(post.business_id || null);
        setCategoryId(post.category_id || null);
      } else {
        // ChatGPT記事（chatgpt_postsテーブル）の場合
        setIsChatGPTSpecial(post.is_chatgpt_special || false);
        
        if (post.is_chatgpt_special) {
          setChatGPTSectionId(post.chatgpt_section?.id || null);
        } else {
          setBusinessId(post.business?.id || null);
          setCategoryId(post.category?.id || null);
        }
      }
    };

    loadPost();
  }, [params.slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!user) {
      alert('ログインが必要です');
      return;
    }

    try {
      if (tableType === 'posts') {
        // RAG記事の更新
        const { error: postError } = await supabase
          .from('posts')
          .update({
            title,
            content,
            status,
            business_id: businessId,
            category_id: categoryId,
            thumbnail_url: thumbnailUrl,
            updated_at: new Date().toISOString(),
            meta_description: metaDescription,
            meta_keywords: seoKeywords,
            canonical_url: canonicalUrl,
          })
          .eq('id', postId);

        if (postError) {
          console.error('Error updating post:', postError);
          alert('投稿の更新に失敗しました');
          return;
        }
      } else {
        // ChatGPT記事の更新
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
            canonical_url: canonicalUrl,
            is_chatgpt_special: isChatGPTSpecial,
          })
          .eq('id', postId);

        if (postError) {
          console.error('Error updating post:', postError);
          alert('投稿の更新に失敗しました');
          return;
        }
      }

      alert('投稿が更新されました');
      router.push('/admin/posts');
    } catch (error) {
      console.error('Error updating post:', error);
      alert('投稿の更新に失敗しました');
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

  const generateSEOMetadata = async () => {
    if (!title || !content) {
      alert('タイトルと本文を入力してからSEOメタデータを生成してください。');
      return;
    }

    setIsGeneratingSEO(true);
    try {
      const response = await fetch('/api/generate-seo-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
        }),
      });

      if (!response.ok) {
        throw new Error('SEOメタデータの生成に失敗しました');
      }

      const data = await response.json();
      setMetaDescription(data.metaDescription);
      setSeoKeywords(data.seoKeywords);
      
      // 生成結果を表示
      if (data.analysis) {
        const analysisMessage = `SEOメタデータを生成しました：\n\n主要トピック: ${data.analysis.primary_topic}\nターゲット読者層: ${data.analysis.target_audience}\n価値提案: ${data.analysis.value_proposition}`;
        alert(analysisMessage);
      }
    } catch (error) {
      console.error('SEOメタデータ生成エラー:', error);
      alert('SEOメタデータの生成に失敗しました。しばらく時間をおいて再度お試しください。');
    } finally {
      setIsGeneratingSEO(false);
    }
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
        <PostPreview content={content} title={title} />
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">SEO設定</h2>
            <button
              type="button"
              onClick={generateSEOMetadata}
              disabled={isGeneratingSEO || !title || !content}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingSEO ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  生成中...
                </>
              ) : (
                'AI自動生成'
              )}
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">
                メタディスクリプション
              </label>
                <span className={`text-xs ${metaDescription.length >= 120 && metaDescription.length <= 160 ? 'text-green-600' : 'text-red-600'}`}>
                  {metaDescription.length}/160文字 {metaDescription.length >= 120 && metaDescription.length <= 160 ? '✓ 最適' : metaDescription.length < 120 ? '(短すぎ)' : '(長すぎ)'}
                </span>
              </div>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={3}
                placeholder="120-160文字でChatGPT・Perplexity・Google AIに最適化された説明文を入力..."
              />
              <p className="mt-1 text-xs text-gray-500">
                AI検索エンジン最適化: クリック率向上のため、価値提案と具体的な成果を含めてください
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">
                SEOキーワード
              </label>
                <span className={`text-xs ${seoKeywords.length >= 10 && seoKeywords.length <= 15 ? 'text-green-600' : 'text-orange-600'}`}>
                  {seoKeywords.length}/15個 {seoKeywords.length >= 10 && seoKeywords.length <= 15 ? '✓ 最適' : seoKeywords.length < 10 ? '(少なすぎ)' : '(多すぎ)'}
                </span>
              </div>
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
                  placeholder="意図ベースの長テールキーワードを入力..."
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
              <p className="mt-1 text-xs text-gray-500">
                AI検索最適化: 関連性の高い共起語と長テールキーワードを重視してください
              </p>
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