'use client';

import React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/supabase';

type Post = {
  id: string;
  slug: string;
  title: string;
  content: string;
  section_id: number | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
};

export default function PostsPage() {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('chatgpt_posts')
        .select(`
          id,
          slug,
          title,
          content,
          section_id,
          thumbnail_url,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // データを適切な型に変換
      const formattedPosts: Post[] = (data || []).map(post => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        content: post.content,
        section_id: post.section_id,
        thumbnail_url: post.thumbnail_url,
        created_at: post.created_at,
        updated_at: post.updated_at
      }));

      setPosts(formattedPosts);
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

  const handleDelete = async (slug: string) => {
    if (!window.confirm('この記事を削除してもよろしいですか？')) {
      return;
    }

    setIsDeleting(true);
    try {
      // 記事を削除
      const { error: deleteError } = await supabase
        .from('chatgpt_posts')
        .delete()
        .eq('slug', slug);

      if (deleteError) throw deleteError;

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
          <div className="text-gray-500">読み込み中...</div>
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
        <h1 className="text-2xl font-bold">記事一覧</h1>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          新規作成
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
          記事がありません
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {posts.map((post) => (
              <li key={post.slug} className="hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-medium text-gray-900">
                          {post.title}
                        </span>
                        <div className="flex space-x-2">
                          <Link
                            href={`/admin/posts/${post.slug}/edit`}
                            className="text-sm text-indigo-600 hover:text-indigo-900"
                          >
                            編集
                          </Link>
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-500 hover:text-gray-700"
                          >
                            プレビュー ↗
                          </Link>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(post.slug)}
                      disabled={isDeleting}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      削除
                    </button>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        作成日: {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        更新日: {new Date(post.updated_at).toLocaleDateString()}
                      </p>
                    </div>
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