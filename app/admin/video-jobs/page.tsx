'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type VideoJob = {
  id: string;
  title_internal: string;
  status: string;
  created_at: string;
  updated_at: string;
  youtube_video_id: string | null;
  akool_job_id: string | null;
};

export default function VideoJobsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [videoJobs, setVideoJobs] = React.useState<VideoJob[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  // 認証チェック
  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin');
    }
  }, [user, authLoading, router]);

  const fetchVideoJobs = React.useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      let query = supabase
        .from('video_jobs')
        .select('id, title_internal, status, created_at, updated_at, youtube_video_id, akool_job_id')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setVideoJobs((data as VideoJob[]) || []);
    } catch (err: any) {
      console.error('Error fetching video jobs:', err);
      setError(err.message || 'VIDEO Jobsの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  React.useEffect(() => {
    fetchVideoJobs();
  }, [fetchVideoJobs]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      draft: { label: '下書き', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
      script_ready: { label: '台本準備完了', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
      akool_processing: { label: 'アバター生成中', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
      akool_done: { label: 'アバター準備完了', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
      final_uploaded: { label: '最終動画アップ済', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
      youtube_uploaded: { label: 'YouTube投稿済', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
      error: { label: 'エラー', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleDelete = async (jobId: string, jobTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm(`「${jobTitle}」を削除してもよろしいですか？\n\nこの操作は取り消せません。`)) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('video_jobs')
        .delete()
        .eq('id', jobId);

      if (deleteError) throw deleteError;

      setVideoJobs(prev => prev.filter(job => job.id !== jobId));
      alert('VIDEO Jobを削除しました');
    } catch (err: any) {
      console.error('Error deleting video job:', err);
      alert(`削除に失敗しました: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
            VIDEO Jobs 管理
          </h1>
          <p className="text-gray-400 mt-2">
            動画制作ジョブの管理と進捗確認
          </p>
        </div>
        <Link
          href="/admin/video-jobs/new"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
        >
          <span className="mr-2">🎬</span>
          新規 VIDEO Job
        </Link>
      </div>

      {/* フィルター */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-300">ステータス:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">すべて</option>
            <option value="draft">下書き</option>
            <option value="akool_processing">アバター生成中</option>
            <option value="akool_done">アバター準備完了</option>
            <option value="final_uploaded">最終動画アップ済</option>
            <option value="youtube_uploaded">YouTube投稿済</option>
            <option value="error">エラー</option>
          </select>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
          <p className="font-medium">エラー</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* ローディング */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
      ) : (
        <>
          {/* 統計情報 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 border border-gray-700/50">
              <p className="text-gray-400 text-sm">総ジョブ数</p>
              <p className="text-2xl font-bold text-white mt-1">{videoJobs.length}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 rounded-lg p-4 border border-yellow-700/50">
              <p className="text-gray-400 text-sm">処理中</p>
              <p className="text-2xl font-bold text-yellow-300 mt-1">
                {videoJobs.filter(j => j.status === 'akool_processing').length}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 rounded-lg p-4 border border-purple-700/50">
              <p className="text-gray-400 text-sm">アバター準備完了</p>
              <p className="text-2xl font-bold text-purple-300 mt-1">
                {videoJobs.filter(j => j.status === 'akool_done').length}
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/20 rounded-lg p-4 border border-emerald-700/50">
              <p className="text-gray-400 text-sm">YouTube投稿済</p>
              <p className="text-2xl font-bold text-emerald-300 mt-1">
                {videoJobs.filter(j => j.status === 'youtube_uploaded').length}
              </p>
            </div>
          </div>

          {/* テーブル */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 overflow-hidden">
            {videoJobs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">VIDEO Jobがまだありません</p>
                <p className="text-gray-500 text-sm mt-2">
                  「新規 VIDEO Job」ボタンから作成してください
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700/50 bg-gray-900/50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        タイトル
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        ステータス
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        作成日時
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        更新日時
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        進捗
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {videoJobs.map((job) => (
                      <tr
                        key={job.id}
                        onClick={() => router.push(`/admin/video-jobs/${job.id}`)}
                        className="hover:bg-gray-700/30 cursor-pointer transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-white">
                              {job.title_internal}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(job.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {formatDate(job.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {formatDate(job.updated_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {job.akool_job_id && (
                              <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded border border-purple-500/30">
                                Akool✓
                              </span>
                            )}
                            {job.youtube_video_id && (
                              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded border border-emerald-500/30">
                                YouTube✓
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={(e) => handleDelete(job.id, job.title_internal, e)}
                            className="inline-flex items-center px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-lg text-sm font-medium transition-all duration-200 border border-red-600/30 hover:border-red-600/50"
                            title="VIDEO Jobを削除"
                          >
                            🗑️ 削除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

