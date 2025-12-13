'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { VideoJob } from '@/lib/types/videoJob';
import ScriptMetaTab from './tabs/ScriptMetaTab';
import AvatarTab from './tabs/AvatarTab';
import AssetsTab from './tabs/AssetsTab';
import PublishTab from './tabs/PublishTab';

type Tab = 'script' | 'avatar' | 'assets' | 'publish';

export default function VideoJobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const jobId = params.id as string;

  const [videoJob, setVideoJob] = React.useState<VideoJob | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<Tab>('script');

  // 認証チェック
  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin');
    }
  }, [user, authLoading, router]);

  const fetchVideoJob = React.useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      const { data, error: fetchError } = await supabase
        .from('video_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (fetchError) throw fetchError;
      if (!data) throw new Error('Video job not found');

      setVideoJob(data as unknown as VideoJob);
    } catch (err: any) {
      console.error('Error fetching video job:', err);
      setError(err.message || 'VIDEO Jobの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  React.useEffect(() => {
    fetchVideoJob();
  }, [fetchVideoJob]);

  const tabs: Array<{ id: Tab; label: string; icon: string; gradient: string }> = [
    { id: 'script', label: 'Script & Meta', icon: '📝', gradient: 'from-blue-600 to-indigo-600' },
    { id: 'avatar', label: 'Avatar (Akool)', icon: '🎭', gradient: 'from-purple-600 to-pink-600' },
    { id: 'assets', label: 'Assets', icon: '🎨', gradient: 'from-yellow-600 to-orange-600' },
    { id: 'publish', label: 'Publish', icon: '🚀', gradient: 'from-green-600 to-emerald-600' },
  ];

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error || !videoJob) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white inline-flex items-center transition-colors duration-200"
        >
          <span className="mr-2">←</span>
          戻る
        </button>
        <div className="bg-red-900/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
          <p className="font-medium">エラー</p>
          <p className="text-sm mt-1">{error || 'VIDEO Jobが見つかりません'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white mb-4 inline-flex items-center transition-colors duration-200"
        >
          <span className="mr-2">←</span>
          戻る
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {videoJob.title_internal}
            </h1>
            <div className="flex items-center space-x-3 mt-2">
              {getStatusBadge(videoJob.status)}
              <span className="text-sm text-gray-400">
                ID: {videoJob.id.substring(0, 8)}...
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 overflow-hidden">
        <div className="flex border-b border-gray-700/50 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.gradient} text-white`
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <span className="mr-2 text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* タブコンテンツ */}
        <div className="p-6">
          {activeTab === 'script' && (
            <ScriptMetaTab videoJob={videoJob} onUpdate={fetchVideoJob} />
          )}
          {activeTab === 'avatar' && (
            <AvatarTab videoJob={videoJob} onUpdate={fetchVideoJob} />
          )}
          {activeTab === 'assets' && (
            <AssetsTab videoJob={videoJob} onUpdate={fetchVideoJob} />
          )}
          {activeTab === 'publish' && (
            <PublishTab videoJob={videoJob} onUpdate={fetchVideoJob} />
          )}
        </div>
      </div>
    </div>
  );
}

