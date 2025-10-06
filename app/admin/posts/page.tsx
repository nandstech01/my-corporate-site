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
  youtube_script_id?: number | null;
  youtube_script_status?: string | null;
};

export default function PostsPage() {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = React.useState(false);
  const [generatingScriptFor, setGeneratingScriptFor] = React.useState<string | null>(null);
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
          updated_at,
          youtube_script_id,
          youtube_script_status
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

      // データを適切な型に変換（重複を防ぐためにテーブル名をプレフィックスとして追加）
      const formattedNewPosts: Post[] = (newPosts || []).map(post => ({
        id: `posts-${post.id}`, // テーブル名をプレフィックスとして追加
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
        is_chatgpt_special: false,
        youtube_script_id: post.youtube_script_id,
        youtube_script_status: post.youtube_script_status
      }));

      const formattedOldPosts: Post[] = (oldPosts || []).map(post => ({
        id: `chatgpt_posts-${post.id}`, // テーブル名をプレフィックスとして追加
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
        is_chatgpt_special: post.is_chatgpt_special || false,
        youtube_script_id: null,
        youtube_script_status: null
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
    if (!window.confirm('この記事を削除してもよろしいですか？\n※関連するRAGベクトルデータも同時に削除されます。')) {
      return;
    }

    setIsDeleting(true);
    try {
      // IDからテーブル名のプレフィックスを除去して元のIDを取得
      const originalId = post.id.toString().replace(/^(posts|chatgpt_posts)-/, '');
      
      console.log('Deleting post with id:', originalId, 'from table:', post.table_type);
      
      // 1. 関連するRAGベクトルデータを削除（postsテーブルの記事のみ）
      if (post.table_type === 'posts') {
        console.log('🗑️ 関連RAGベクトルデータの削除開始...');
        
        try {
          // 1-1. 旧Company Vector削除（互換性維持）
          const { error: vectorDeleteError, count: vectorDeleteCount } = await supabase
            .from('company_vectors')
            .delete({ count: 'exact' })
            .eq('content_type', 'generated_blog')
            .eq('section_title', post.title);

          if (vectorDeleteError) {
            console.error('旧RAGベクトル削除エラー:', vectorDeleteError);
          } else {
            console.log(`✅ 旧RAGベクトル削除完了: ${vectorDeleteCount}件`);
          }

          // 1-2. 新Fragment Vector削除（重要！）
          const postPath = `/posts/${post.slug}`;
          const { error: fragmentDeleteError, count: fragmentDeleteCount } = await supabase
            .from('fragment_vectors')
            .delete({ count: 'exact' })
            .eq('page_path', postPath);

          if (fragmentDeleteError) {
            console.error('Fragment Vector削除エラー:', fragmentDeleteError);
          } else {
            console.log(`✅ Fragment Vector削除完了: ${fragmentDeleteCount}件 (${postPath})`);
          }

          console.log(`🎯 総RAG削除件数: ${(vectorDeleteCount || 0) + (fragmentDeleteCount || 0)}件`);
        } catch (vectorError) {
          console.error('RAGベクトル削除処理でエラー:', vectorError);
          // エラーは記録するが処理は続行
        }
      }
      
      // 2. 適切なテーブルから記事を削除
      const { error: deleteError } = await supabase
        .from(post.table_type)
        .delete()
        .eq('id', originalId);

      if (deleteError) {
        console.error('Error details:', deleteError);
        throw deleteError;
      }

      console.log('✅ 記事削除処理完了（RAGベクトル含む）');
      // 成功したら記事一覧を再取得
      await fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('記事の削除に失敗しました');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGenerateScript = async (post: Post) => {
    // postsテーブルの記事のみ対応
    if (post.table_type !== 'posts') {
      alert('YouTubeショート台本生成はRAG記事のみ対応しています');
      return;
    }

    if (!window.confirm('この記事からYouTubeショート動画の台本を生成しますか？\n\n※中学生でも理解できる簡単な内容に変換されます\n※30秒以内の台本が作成されます\n※バイラル要素が自動で組み込まれます')) {
      return;
    }

    setIsGeneratingScript(true);
    setGeneratingScriptFor(post.id.toString());

    try {
      const originalId = post.id.toString().replace(/^posts-/, '');
      
      console.log('🎬 台本生成開始:', {
        postId: originalId,
        slug: post.slug,
        title: post.title
      });

      const response = await fetch('/api/admin/generate-youtube-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: parseInt(originalId),
          postSlug: post.slug,
          postTitle: post.title,
          postContent: post.content
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          // 既に台本が存在する場合
          if (window.confirm('既に台本が生成されています。台本確認画面に移動しますか？')) {
            window.location.href = `/admin/youtube-scripts/${result.scriptId}`;
          }
          return;
        }
        throw new Error(result.error || '台本生成に失敗しました');
      }

      console.log('✅ 台本生成成功:', result);
      alert(`🎉 台本生成完了！\n\nScript ID: ${result.scriptId}\nAI最適化スコア: ${result.aiOptimizationScore}/100\n\n台本確認画面に移動します。`);
      
      // 台本確認画面にリダイレクト
      window.location.href = `/admin/youtube-scripts/${result.scriptId}`;
      
    } catch (error: any) {
      console.error('❌ 台本生成エラー:', error);
      alert(`台本生成に失敗しました\n\n${error.message}`);
    } finally {
      setIsGeneratingScript(false);
      setGeneratingScriptFor(null);
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
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
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
              <li key={post.id} className="hover:bg-gray-700">
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
                          ID: {post.id.toString().replace(/^(posts|chatgpt_posts)-/, '')}
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
                          {post.table_type === 'posts' && (
                            post.youtube_script_id ? (
                              <Link
                                href={`/admin/youtube-scripts/${post.youtube_script_id}`}
                                className="text-sm text-green-400 hover:text-green-300"
                              >
                                🎬 台本確認
                              </Link>
                            ) : (
                              <button
                                onClick={() => handleGenerateScript(post)}
                                disabled={isGeneratingScript && generatingScriptFor === post.id.toString()}
                                className="text-sm text-yellow-400 hover:text-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isGeneratingScript && generatingScriptFor === post.id.toString() ? '生成中...' : '🎬 台本生成'}
                              </button>
                            )
                          )}
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