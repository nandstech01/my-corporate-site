'use client';

import React from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';

type Post = {
  id: number | string;
  slug: string;
  title: string;
  content: string;
  business_id?: number | null;
  category_id?: number | null;
  section_id?: number | null;
  thumbnail_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  table_type: 'posts' | 'chatgpt_posts';
  is_chatgpt_special: boolean;
};

export default function PostsPage() {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const supabase = createClientComponentClient<Database>();

  const fetchPosts = async () => {
    try {
      setError(null);
      
      // postsテーブルから記事を取得
      const { data: newPosts, error: newError } = await supabase
        .from('posts')
        .select(`
          id,
          slug,
          title,
          content,
          business_id,
          category_id,
          thumbnail_url,
          status,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (newError) throw newError;

      // chatgpt_postsテーブルから記事を取得（is_chatgpt_specialも取得）
      const { data: oldPosts, error: oldError } = await supabase
        .from('chatgpt_posts')
        .select(`
          id,
          slug,
          title,
          content,
          section_id,
          category_id,
          thumbnail_url,
          status,
          created_at,
          updated_at,
          is_chatgpt_special
        `)
        .order('created_at', { ascending: false });

      if (oldError) throw oldError;

      // データを適切な型に変換
      const formattedNewPosts: Post[] = (newPosts || []).map(post => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        content: post.content,
        business_id: post.business_id,
        category_id: post.category_id,
        thumbnail_url: post.thumbnail_url,
        status: post.status || 'draft',
        created_at: post.created_at,
        updated_at: post.updated_at,
        table_type: 'posts',
        is_chatgpt_special: false
      }));

      const formattedOldPosts: Post[] = (oldPosts || []).map(post => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        content: post.content,
        section_id: post.section_id,
        category_id: post.category_id,
        thumbnail_url: post.thumbnail_url,
        status: post.status || 'draft',
        created_at: post.created_at,
        updated_at: post.updated_at,
        table_type: 'chatgpt_posts',
        is_chatgpt_special: post.is_chatgpt_special || false
      }));

      // 両方のテーブルの記事を合体して日付順でソート
      const allPosts = [...formattedNewPosts, ...formattedOldPosts];
      allPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setPosts(allPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('記事の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (post: Post) => {
    if (!window.confirm('この記事を削除してもよろしいですか？')) {
      return;
    }

    setIsDeleting(true);
    try {
      console.log('Deleting post with id:', post.id, 'from table:', post.table_type);
      
      // 適切なテーブルから記事を削除
      const { error: deleteError } = await supabase
        .from(post.table_type)
        .delete()
        .eq('id', post.id);

      if (deleteError) {
        console.error('Error details:', deleteError);
        throw deleteError;
      }

      console.log('Delete operation completed successfully');
      // 成功したら記事一覧を再取得
      await fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('記事の削除に失敗しました');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="text-white">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchPosts}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">記事一覧</h1>
        <div className="flex space-x-2">
          <Link
            href="/admin/content-generation"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            RAG記事生成
          </Link>
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            新規作成
          </Link>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="bg-gray-800 shadow rounded-lg p-6 text-center text-white">
          記事がありません
        </div>
      ) : (
        <div className="bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-600">
            {posts.map((post) => (
              <li key={`${post.table_type}-${post.slug}`} className="hover:bg-gray-700">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-medium text-white">
                          {post.title}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          post.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {post.status === 'published' ? '公開' : '下書き'}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          post.table_type === 'posts' 
                            ? 'bg-green-100 text-green-800'
                            : post.is_chatgpt_special 
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {post.table_type === 'posts' ? 'RAG記事' : 
                           post.is_chatgpt_special ? 'ChatGPT特集記事' : '旧システム記事'}
                        </span>
                        <span className="text-xs text-gray-300">
                          ID: {post.id}
                        </span>
                        <div className="flex space-x-2">
                          <Link
                            href={`/admin/posts/${post.slug}/edit`}
                            className="text-sm text-indigo-400 hover:text-indigo-300"
                          >
                            編集
                          </Link>
                          <Link
                            href={`/posts/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-300 hover:text-white"
                          >
                            プレビュー ↗
                          </Link>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(post)}
                      disabled={isDeleting}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      削除
                    </button>
                  </div>
                  <div className="mt-2 text-sm text-gray-300">
                    作成日: {new Date(post.created_at).toLocaleDateString('ja-JP')}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 