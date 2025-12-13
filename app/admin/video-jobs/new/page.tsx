'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function NewVideoJobPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState({
    title_internal: '',
    youtube_title: '',
    script_raw: '',
  });

  // 認証チェック
  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title_internal.trim() || !formData.youtube_title.trim() || !formData.script_raw.trim()) {
      setError('すべての必須フィールドを入力してください');
      return;
    }

    if (!user) {
      setError('ログインが必要です');
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);

      // 新しいVIDEO Jobを作成
      const { data, error: insertError } = await supabase
        .from('video_jobs')
        .insert([
          {
            user_id: user.id,
            title_internal: formData.title_internal.trim(),
            youtube_title: formData.youtube_title.trim(),
            script_raw: formData.script_raw.trim(),
            status: 'draft',
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      // 詳細ページにリダイレクト
      router.push(`/admin/video-jobs/${data.id}`);
    } catch (err: any) {
      console.error('Error creating video job:', err);
      setError(err.message || 'VIDEO Jobの作成に失敗しました');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ヘッダー */}
      <div>
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white mb-4 inline-flex items-center transition-colors duration-200"
        >
          <span className="mr-2">←</span>
          戻る
        </button>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
          新規 VIDEO Job 作成
        </h1>
        <p className="text-gray-400 mt-2">
          基本情報を入力して新しい動画制作ジョブを開始します
        </p>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
          <p className="font-medium">エラー</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* フォーム */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50 space-y-6">
          {/* 内部タイトル */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              内部タイトル <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title_internal}
              onChange={(e) => setFormData({ ...formData, title_internal: e.target.value })}
              placeholder="例: サービス紹介動画 #001"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              管理画面で表示される識別用タイトル
            </p>
          </div>

          {/* YouTubeタイトル */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              YouTubeタイトル <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.youtube_title}
              onChange={(e) => setFormData({ ...formData, youtube_title: e.target.value })}
              placeholder="例: 【完全解説】サービスの選び方｜失敗しないポイント"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
              disabled={isSubmitting}
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              YouTube投稿時に使用されるタイトル（最大100文字）
            </p>
          </div>

          {/* 台本 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              台本（Raw） <span className="text-red-400">*</span>
            </label>
            <textarea
              value={formData.script_raw}
              onChange={(e) => setFormData({ ...formData, script_raw: e.target.value })}
              placeholder="動画の台本を入力してください..."
              rows={12}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-y"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              アバター動画生成に使用する台本テキスト
            </p>
          </div>
        </div>

        {/* ボタン */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="px-6 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                作成中...
              </span>
            ) : (
              <span className="flex items-center">
                <span className="mr-2">🎬</span>
                VIDEO Job を作成
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

