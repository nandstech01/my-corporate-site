'use client';

import React from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';

interface YouTubeScript {
  id: number;
  fragment_id: string;
  script_title: string;
  script_hook: string;
  script_empathy: string;
  script_body: string;
  script_cta: string;
  script_duration_seconds: number;
  status: string;
  blog_slug: string | null;
  youtube_url: string | null;
  youtube_video_id: string | null;
  virality_score: number;
  ai_optimization_score: number;
  created_at: string;
  published_at: string | null;
  metadata?: {
    youtube_metadata?: {
      youtube_title: string;
      youtube_description: string;
      youtube_tags: string[];
    };
  };
}

export default function YouTubeScriptsListPage() {
  const [scripts, setScripts] = React.useState<YouTubeScript[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filterStatus, setFilterStatus] = React.useState<'all' | 'draft' | 'published'>('all');
  
  const supabase = createClientComponentClient<Database>();

  React.useEffect(() => {
    fetchScripts();
  }, []);

  const fetchScripts = async () => {
    try {
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('company_youtube_shorts')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setScripts((data as unknown as YouTubeScript[]) || []);
    } catch (error: any) {
      console.error('台本取得エラー:', error);
      setError(error.message || '台本の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredScripts = scripts.filter(script => {
    if (filterStatus === 'all') return true;
    return script.status === filterStatus;
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="text-white">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {/* ヘッダー */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-white">🎬 YouTubeショート台本一覧</h1>
          <div className="text-sm text-gray-400">
            全{scripts.length}件
          </div>
        </div>

        {/* フィルター */}
        <div className="flex space-x-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filterStatus === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            全て ({scripts.length})
          </button>
          <button
            onClick={() => setFilterStatus('draft')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filterStatus === 'draft'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Draft ({scripts.filter(s => s.status === 'draft').length})
          </button>
          <button
            onClick={() => setFilterStatus('published')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filterStatus === 'published'
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Published ({scripts.filter(s => s.status === 'published').length})
          </button>
        </div>
      </div>

      {/* 台本リスト */}
      {filteredScripts.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-400">台本がありません</p>
          <Link
            href="/admin/posts"
            className="mt-4 inline-block text-blue-400 hover:text-blue-300"
          >
            → 記事一覧から台本を生成
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredScripts.map((script) => (
            <Link
              key={script.id}
              href={`/admin/youtube-scripts/${script.id}`}
              className="block bg-gray-800 hover:bg-gray-750 rounded-lg p-6 transition-colors border border-gray-700 hover:border-gray-600"
            >
              {/* ヘッダー情報 */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {script.script_title}
                    </h3>
                    {script.status === 'draft' ? (
                      <span className="px-2 py-1 bg-yellow-900 text-yellow-200 text-xs rounded">
                        Draft
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-green-900 text-green-200 text-xs rounded">
                        Published
                      </span>
                    )}
                  </div>
                  
                  {script.blog_slug && (
                    <p className="text-sm text-gray-400 mb-2">
                      📝 関連記事: /posts/{script.blog_slug}
                    </p>
                  )}

                  {script.youtube_url && (
                    <a
                      href={script.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>📺 YouTube</span>
                      <span>↗</span>
                    </a>
                  )}
                </div>

                <div className="text-right space-y-2">
                  <div>
                    <p className="text-xs text-gray-400">AI最適化</p>
                    <p className="text-lg font-bold text-green-400">
                      {script.ai_optimization_score}/100
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">バイラリティ</p>
                    <p className="text-lg font-bold text-purple-400">
                      {script.virality_score}/100
                    </p>
                  </div>
                </div>
              </div>

              {/* 4フェーズプレビュー */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="bg-red-900/20 border border-red-700/30 rounded p-3">
                  <p className="text-xs text-red-300 mb-1">🎣 Hook (冒頭2秒)</p>
                  <p className="text-sm text-red-100 line-clamp-2">
                    {script.script_hook}
                  </p>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-700/30 rounded p-3">
                  <p className="text-xs text-yellow-300 mb-1">🤝 Empathy (3-5秒)</p>
                  <p className="text-sm text-yellow-100 line-clamp-2">
                    {script.script_empathy}
                  </p>
                </div>
                <div className="bg-blue-900/20 border border-blue-700/30 rounded p-3">
                  <p className="text-xs text-blue-300 mb-1">💡 Body (5-20秒)</p>
                  <p className="text-sm text-blue-100 line-clamp-2">
                    {script.script_body}
                  </p>
                </div>
                <div className="bg-green-900/20 border border-green-700/30 rounded p-3">
                  <p className="text-xs text-green-300 mb-1">🚀 CTA (ラスト5秒)</p>
                  <p className="text-sm text-green-100 line-clamp-2">
                    {script.script_cta}
                  </p>
                </div>
              </div>

              {/* YouTubeメタデータプレビュー */}
              {script.metadata?.youtube_metadata && (
                <div className="bg-indigo-900/20 border border-indigo-700/30 rounded p-3 mb-4">
                  <p className="text-xs text-indigo-300 mb-2">📺 YouTube投稿用</p>
                  <p className="text-sm text-indigo-100 font-medium mb-1">
                    {script.metadata.youtube_metadata.youtube_title}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {script.metadata.youtube_metadata.youtube_tags.slice(0, 5).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-indigo-800/50 text-indigo-200 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                    {script.metadata.youtube_metadata.youtube_tags.length > 5 && (
                      <span className="px-2 py-0.5 text-indigo-300 text-xs">
                        +{script.metadata.youtube_metadata.youtube_tags.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* フッター情報 */}
              <div className="flex justify-between items-center text-xs text-gray-400">
                <div className="flex space-x-4">
                  <span>⏱️ {script.script_duration_seconds}秒</span>
                  <span>🔗 {script.fragment_id}</span>
                </div>
                <div>
                  {script.published_at ? (
                    <span>📅 公開: {new Date(script.published_at).toLocaleDateString('ja-JP')}</span>
                  ) : (
                    <span>📅 作成: {new Date(script.created_at).toLocaleDateString('ja-JP')}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

