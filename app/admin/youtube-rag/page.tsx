'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  PlayIcon, 
  AcademicCapIcon, 
  DocumentTextIcon, 
  MagnifyingGlassIcon,
  VideoCameraIcon,
  SparklesIcon,
  ChartBarIcon,
  ClockIcon,
  EyeIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

interface YoutubeVideoInfo {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string;
  duration: string;
  viewCount: string;
  likeCount: string;
  videoUrl: string;
  channelUrl: string;
  tags: string[];
  relevance?: number;
  vectorized?: boolean;
  vectorId?: number;
  error?: string;
}

interface Stats {
  trend_vectors: {
    total: number;
    news: number;
    last_24h: number;
  };
  company_vectors: {
    total: number;
  };
  youtube_vectors: {
    total: number;
    status: string;
    last_added: string;
  };
}

export default function YouTubeRagPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [videos, setVideos] = useState<YoutubeVideoInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [vectorizationProgress, setVectorizationProgress] = useState<{[key: string]: string}>({});
  const [apiStatus, setApiStatus] = useState<string>('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // 認証チェック
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin');
      return;
    }
  }, [user, authLoading, router]);

  // 統計情報を取得
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      // キャッシュバスターを追加して常に最新データを取得
      const cacheBuster = `_t=${Date.now()}`;
      const response = await fetch(`/api/trend-stats?${cacheBuster}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        console.log('📊 統計情報取得成功:', data);
      } else {
        console.error('統計情報取得エラー:', response.status);
      }
    } catch (error) {
      console.error('統計情報取得エラー:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // 初期統計情報の取得
  useEffect(() => {
    if (user && !authLoading) {
      fetchStats();
    }
  }, [user, authLoading]);

  // YouTube Data APIを使用した動画検索
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setVideos([]);
    setApiStatus('');
    
    try {
      console.log(`🔍 YouTube Data API検索開始 - クエリ: "${searchQuery}"`);
      
      const response = await fetch('/api/youtube-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          maxResults: 10
        })
      });

      const data = await response.json();

      if (response.ok && data.results) {
        setVideos(data.results);
        setApiStatus(`✅ 成功: ${data.total}件の動画を取得 (API: ${data.api_source})`);
        console.log(`✅ ${data.total}件の動画を取得`);
      } else {
        setApiStatus(`❌ エラー: ${data.error}`);
        console.error('YouTube Data API エラー:', data);
        
        if (data.setup_instructions) {
          setApiStatus(`⚠️ 設定が必要: ${data.setup_instructions}`);
        }
      }

    } catch (error) {
      console.error('YouTube Data API 呼び出しエラー:', error);
      setApiStatus(`❌ 接続エラー: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  // 動画をベクトル化
  const vectorizeVideos = async (videosToVectorize: YoutubeVideoInfo[]) => {
    if (videosToVectorize.length === 0) return;

    console.log(`🔄 ${videosToVectorize.length}件の動画をベクトル化開始`);

    for (const video of videosToVectorize) {
      try {
        setVectorizationProgress(prev => ({
          ...prev,
          [video.id]: 'ベクトル化中...'
        }));

        const response = await fetch('/api/vectorize-youtube', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            videoInfo: video,
            query: searchQuery
          })
        });

        if (response.ok) {
          const data = await response.json();
          
          setVideos(prev => prev.map(item => 
            item.id === video.id 
              ? { ...item, vectorized: true, vectorId: data.vectorId }
              : item
          ));

          setVectorizationProgress(prev => ({
            ...prev,
            [video.id]: 'ベクトル化完了'
          }));

          console.log(`✅ ベクトル化完了: ${video.title} (ID: ${data.vectorId})`);
        } else {
          throw new Error('ベクトル化に失敗しました');
        }

      } catch (error) {
        console.error(`❌ ベクトル化エラー (${video.title}):`, error);
        
        setVideos(prev => prev.map(item => 
          item.id === video.id 
            ? { ...item, vectorized: false, error: (error as Error).message }
            : item
        ));

        setVectorizationProgress(prev => ({
          ...prev,
          [video.id]: 'エラー'
        }));
      }
    }

    console.log('🎉 動画ベクトル化処理完了');
    
    // ベクトル化完了後に統計情報を更新
    await fetchStats();
  };

  // 動画選択
  const handleVideoSelect = (videoId: string) => {
    setSelectedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  // 選択された動画をベクトル化
  const handleVectorizeSelected = async () => {
    const selectedVideoObjects = videos.filter(video => selectedVideos.includes(video.id));
    await vectorizeVideos(selectedVideoObjects);
  };

  // 全動画をベクトル化
  const handleVectorizeAll = async () => {
    await vectorizeVideos(videos);
  };

  // 動画時間をフォーマット
  const formatDuration = (duration: string) => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return duration;
    
    const hours = match[1] ? parseInt(match[1].replace('H', '')) : 0;
    const minutes = match[2] ? parseInt(match[2].replace('M', '')) : 0;
    const seconds = match[3] ? parseInt(match[3].replace('S', '')) : 0;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  // 数値をフォーマット
  const formatNumber = (num: string) => {
    const n = parseInt(num);
    if (n >= 1000000) {
      return (n / 1000000).toFixed(1) + 'M';
    } else if (n >= 1000) {
      return (n / 1000).toFixed(1) + 'K';
    }
    return n.toString();
  };

  // プリセットクエリ
  const presetQueries = [
    'machine learning tutorial',
    'AI programming guide',
    'deep learning basics',
    'neural networks explained',
    'Python for AI',
    'data science fundamentals',
    'computer vision tutorial',
    'natural language processing',
    'AI ethics and safety',
    'modern AI architectures',
    'relevance engineering',
    'relevance engineering SEO',
    'relevance engineering AI',
    'relevance engineering tutorial',
    'relevance engineering guide',
    'relevance engineering optimization',
    'レリバンスエンジニアリング',
    'レリバンスエンジニアリング SEO',
    'レリバンスエンジニアリング AI',
    'SEO optimization',
    'SEO optimization 2024',
    'SEO optimization tutorial',
    'advanced SEO techniques',
    'LLMO large language model optimization',
    'LLMO optimization guide',
    'LLMO tutorial',
    'AIO AI optimization',
    'AIO optimization strategy',
    'GEO generative engine optimization',
    'GEO optimization tutorial',
    'AI search optimization',
    'AI search optimization 2024',
    'semantic search tutorial',
    'vector database tutorial',
    'RAG retrieval augmented generation',
    'RAG implementation guide',
    'RAG tutorial',
    'prompt engineering',
    'prompt engineering guide',
    'prompt engineering advanced',
    'AI content generation',
    'search engine algorithms',
    'Google AI Mode',
    'Google AI Mode optimization',
    'OpenAI GPT tutorial',
    'transformer architecture',
    'attention mechanisms',
    'BERT and language models',
    'AI model fine-tuning',
    'machine learning evaluation',
    'AI system design'
  ];

  if (authLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 pt-4 lg:pt-0">
        {/* ヘッダー */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <PlayIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                YouTube RAG管理
              </h1>
              <p className="text-gray-400">YouTube Data API v3を使用した教育動画の取得とベクトル化</p>
            </div>
          </div>

          {/* API設定状況の表示 */}
          {apiStatus && (
            <div className={`mt-4 p-3 rounded-lg ${
              apiStatus.includes('成功') ? 'bg-green-900/30 border border-green-500' :
              apiStatus.includes('エラー') ? 'bg-red-900/30 border border-red-500' :
              'bg-yellow-900/30 border border-yellow-500'
            }`}>
              <p className="text-sm">{apiStatus}</p>
            </div>
          )}
        </div>

        {/* 検索セクション */}
        <div className="mb-8">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <MagnifyingGlassIcon className="h-5 w-5 mr-2 text-red-400" />
              動画検索
            </h2>
            
            <div className="space-y-4">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="検索クエリを入力..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-2 rounded-lg hover:from-red-700 hover:to-orange-700 disabled:opacity-50 transition-all"
                >
                  {loading ? '検索中...' : '検索'}
                </button>
              </div>

              {/* プリセットクエリ */}
              <div>
                <p className="text-sm text-gray-400 mb-2">プリセットクエリ:</p>
                <div className="flex flex-wrap gap-2">
                  {presetQueries.map((query) => (
                    <button
                      key={query}
                      onClick={() => setSearchQuery(query)}
                      className="bg-gray-800 hover:bg-gray-700 text-sm px-3 py-1 rounded-full border border-gray-700 transition-colors"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 動画結果 */}
        {videos.length > 0 && (
          <div className="mb-8">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <VideoCameraIcon className="h-5 w-5 mr-2 text-red-400" />
                  検索結果 ({videos.length}件)
                </h2>
                
                <div className="flex space-x-2">
                  <button
                    onClick={handleVectorizeSelected}
                    disabled={selectedVideos.length === 0 || loading}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-colors text-sm"
                  >
                    選択をベクトル化
                  </button>
                  <button
                    onClick={handleVectorizeAll}
                    disabled={loading}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-colors text-sm"
                  >
                    全てベクトル化
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className={`p-4 rounded-lg border transition-all ${
                      selectedVideos.includes(video.id)
                        ? 'bg-red-900/30 border-red-500'
                        : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex space-x-4">
                      <div className="flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={selectedVideos.includes(video.id)}
                          onChange={() => handleVideoSelect(video.id)}
                          className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                      </div>
                      
                      <div className="flex-shrink-0 w-32">
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white mb-1 line-clamp-2">{video.title}</h3>
                        <p className="text-sm text-gray-400 mb-2">{video.channelTitle}</p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-400 mb-2">
                          <span className="flex items-center">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            {formatDuration(video.duration)}
                          </span>
                          <span className="flex items-center">
                            <EyeIcon className="h-3 w-3 mr-1" />
                            {formatNumber(video.viewCount)}
                          </span>
                          <span className="flex items-center">
                            <HeartIcon className="h-3 w-3 mr-1" />
                            {formatNumber(video.likeCount)}
                          </span>
                          {video.relevance && (
                            <span>関連度: {(video.relevance * 100).toFixed(1)}%</span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="text-gray-500">
                            {new Date(video.publishedAt).toLocaleDateString('ja-JP')}
                          </span>
                          <a
                            href={video.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-400 hover:text-red-300"
                          >
                            動画を見る
                          </a>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            {video.vectorized && (
                              <span className="text-green-400 text-xs bg-green-900/30 px-2 py-1 rounded">
                                ベクトル化済み
                              </span>
                            )}
                            {vectorizationProgress[video.id] && (
                              <span className="text-yellow-400 text-xs bg-yellow-900/30 px-2 py-1 rounded">
                                {vectorizationProgress[video.id]}
                              </span>
                            )}
                            {video.error && (
                              <span className="text-red-400 text-xs bg-red-900/30 px-2 py-1 rounded">
                                エラー
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 統計情報 */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">統計情報</h2>
            <button
              onClick={fetchStats}
              disabled={statsLoading}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg disabled:opacity-50 transition-colors text-sm"
            >
              {statsLoading ? '更新中...' : '🔄 更新'}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                <DocumentTextIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-green-400 text-sm font-medium">自社RAG</p>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? '...' : stats?.company_vectors?.total || 0}個
                </p>
                <p className="text-gray-400 text-xs">ベクトル化済み</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg flex items-center justify-center mr-3">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-purple-400 text-sm font-medium">トレンドニュース</p>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? '...' : stats?.trend_vectors?.total || 0}個
                </p>
                <p className="text-gray-400 text-xs">ベクトル化済み</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                <PlayIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-red-400 text-sm font-medium">YouTube動画</p>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? '...' : stats?.youtube_vectors?.total || 0}個
                </p>
                <p className="text-gray-400 text-xs">ベクトル化済み</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 