'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  GlobeAltIcon, 
  BoltIcon, 
  DocumentTextIcon, 
  MagnifyingGlassIcon,
  NewspaperIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

interface NewsItem {
  id: string;
  title: string;
  url: string;
  description: string;
  published: string;
  source: string;
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
  };
  third_rag: {
    total: number;
    status: string;
  };
}

export default function TrendRagPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
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

  // Brave Search APIを使用した実際のニュース検索
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setNewsItems([]);
    setApiStatus('');
    
    try {
      console.log(`🔍 Brave Search API検索開始 - クエリ: "${searchQuery}"`);
      
      // APIエンドポイント経由でBrave Search APIを呼び出し
      const response = await fetch('/api/brave-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          type: 'news'
        })
      });

      const data = await response.json();

      if (response.ok && data.results) {
        setNewsItems(data.results);
        setApiStatus(`✅ 成功: ${data.total}件のニュースを取得 (API: ${data.api_source})`);
        console.log(`✅ ${data.total}件のニュースを取得`);
        
        // 新しいニュースがベクトル化されたので統計情報を更新
        await fetchStats();
      } else {
        setApiStatus(`❌ エラー: ${data.error}`);
        console.error('Brave Search API エラー:', data);
        
        if (data.setup_instructions) {
          setApiStatus(`⚠️ 設定が必要: ${data.setup_instructions}`);
        }
      }

    } catch (error) {
      console.error('Brave Search API 呼び出しエラー:', error);
      setApiStatus(`❌ 接続エラー: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  // ニュースをベクトル化
  const vectorizeNews = async (newsItemsToVectorize: NewsItem[]) => {
    if (newsItemsToVectorize.length === 0) return;

    console.log(`🔄 ${newsItemsToVectorize.length}件のニュースをベクトル化開始`);

    for (const newsItem of newsItemsToVectorize) {
      try {
        setVectorizationProgress(prev => ({
          ...prev,
          [newsItem.id]: 'ベクトル化中...'
        }));

        const response = await fetch('/api/vectorize-news', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            newsItem,
            query: searchQuery
          })
        });

        if (response.ok) {
          const data = await response.json();
          
          // 成功した場合の更新
          setNewsItems(prev => prev.map(item => 
            item.id === newsItem.id 
              ? { ...item, vectorized: true, vectorId: data.vectorId }
              : item
          ));

          setVectorizationProgress(prev => ({
            ...prev,
            [newsItem.id]: 'ベクトル化完了'
          }));

          console.log(`✅ ベクトル化完了: ${newsItem.title} (ID: ${data.vectorId})`);
        } else {
          throw new Error('ベクトル化に失敗しました');
        }

      } catch (error) {
        console.error(`❌ ベクトル化エラー (${newsItem.title}):`, error);
        
        setNewsItems(prev => prev.map(item => 
          item.id === newsItem.id 
            ? { ...item, vectorized: false, error: (error as Error).message }
            : item
        ));

        setVectorizationProgress(prev => ({
          ...prev,
          [newsItem.id]: 'エラー'
        }));
      }
    }

    console.log('🎉 ベクトル化処理完了');
    
    // ベクトル化完了後に統計情報を更新
    await fetchStats();
  };

  // アイテム選択
  const handleItemSelect = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // 選択されたニュースをベクトル化
  const handleVectorizeSelected = async () => {
    const selectedNews = newsItems.filter(item => selectedItems.includes(item.id));
    await vectorizeNews(selectedNews);
  };

  // 全ニュースをベクトル化
  const handleVectorizeAll = async () => {
    await vectorizeNews(newsItems);
  };

  // コンテンツ生成
  const handleGenerateContent = async () => {
    const vectorizedNews = newsItems.filter(item => item.vectorized);
    
    if (vectorizedNews.length === 0) {
      alert('ベクトル化されたニュースがありません');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newsItems: vectorizedNews,
          type: 'trend-article'
        })
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/admin/posts/new?generated=${data.id}`);
      }
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setLoading(false);
    }
  };

  // プリセットクエリ
  const presetQueries = [
    // AI技術・モデル関連（英語）
    'Large Language Models',
    'GPT-4 updates',
    'Claude AI developments',
    'ChatGPT features',
    'OpenAI research',
    'Anthropic Claude',
    'Google Bard updates',
    'Microsoft Copilot',
    'AI model training',
    'Neural network architecture',
    'Transformer models',
    'Multimodal AI',
    'Computer vision AI',
    'Natural language processing',
    'Deep learning breakthroughs',
    'AI reasoning capabilities',
    'AGI developments',
    'AI safety research',
    'AI alignment',
    'Reinforcement learning',
    
    // AI業界・ビジネス関連（英語）
    'AI startup funding',
    'AI venture capital',
    'AI industry trends',
    'AI market analysis',
    'AI enterprise adoption',
    'AI productivity tools',
    'AI automation',
    'AI workforce impact',
    'AI regulation news',
    'AI ethics discussions',
    'AI governance',
    'AI policy updates',
    'AI competition',
    'Tech giants AI',
    'AI partnerships',
    'AI acquisitions',
    
    // 検索・RAG技術関連（英語）
    'relevance engineering',
    'RAG improvements',
    'vector databases',
    'semantic search',
    'embedding models',
    'retrieval augmented generation',
    'information retrieval',
    'search algorithms',
    'ranking systems',
    'query understanding',
    'document retrieval',
    'knowledge graphs',
    'AI search optimization',
    'search relevance',
    'personalized search',
    'contextual search',
    
    // 開発・エンジニアリング関連（英語）
    'AI developer tools',
    'LLM optimization',
    'LLMO techniques',
    'AI model deployment',
    'AI infrastructure',
    'MLOps practices',
    'AI model serving',
    'AI scalability',
    'AI performance tuning',
    'Prompt engineering',
    'Fine-tuning methods',
    'AI model evaluation',
    'AI benchmarks',
    'AI testing frameworks',
    
    // 企業・組織別ニュース（英語）
    'OpenAI announcements',
    'Google AI updates',
    'Microsoft AI news',
    'Anthropic research',
    'Meta AI developments',
    'Tesla AI progress',
    'NVIDIA AI advances',
    'Amazon AI services',
    'Apple machine learning',
    'DeepMind research',
    'Hugging Face updates',
    'Stability AI news',
    
    // 応用分野（英語）
    'AI healthcare',
    'AI finance',
    'AI education',
    'AI robotics',
    'AI autonomous vehicles',
    'AI content generation',
    'AI code generation',
    'AI image generation',
    'AI video synthesis',
    'AI music creation',
    'AI translation',
    'AI recommendation systems',
    
    // 日本語（重要なもののみ）
    '生成AI 技術',
    'AI 業界 トレンド',
    '機械学習 最新研究',
    'レリバンスエンジニアリング',
    'AI検索最適化',
    'LLM最適化',
    'ChatGPT ニュース',
    'OpenAI 最新ニュース',
    'Google AI 発表',
    'Microsoft AI アップデート',
    'Claude AI 新機能'
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
      <div className="max-w-7xl mx-auto p-6">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <GlobeAltIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                トレンドRAG管理
              </h1>
              <p className="text-gray-400">Brave Search APIを使用したリアルタイムニュース取得とベクトル化</p>
            </div>
          </div>

          {/* API設定状況の表示 */}
          {apiStatus && (
            <div className={`p-4 rounded-lg mb-4 ${
              apiStatus.includes('エラー') || apiStatus.includes('設定が必要') 
                ? 'bg-red-900/50 border border-red-500' 
                : 'bg-green-900/50 border border-green-500'
            }`}>
              <div className="flex items-center space-x-2">
                {apiStatus.includes('エラー') || apiStatus.includes('設定が必要') ? (
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                ) : (
                  <SparklesIcon className="h-5 w-5 text-green-400" />
                )}
                <span className="text-sm">{apiStatus}</span>
              </div>
              
              {apiStatus.includes('設定が必要') && (
                <div className="mt-3 space-y-2 text-sm text-gray-300">
                  <p><strong>設定手順:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li><a href="https://api.search.brave.com/register" target="_blank" className="text-blue-400 hover:text-blue-300">Brave Search API</a> でアカウントを作成</li>
                    <li>APIキーを取得（無料プラン: 月5,000クエリまで）</li>
                    <li>環境変数 <code className="bg-gray-800 px-2 py-1 rounded">BRAVE_API_KEY=your_api_key_here</code> を設定</li>
                    <li>アプリケーションを再起動</li>
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 検索セクション */}
        <div className="mb-8">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <MagnifyingGlassIcon className="h-5 w-5 mr-2 text-purple-400" />
              ニュース検索
            </h2>
            
            <div className="space-y-4">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="検索クエリを入力..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all"
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

        {/* ニュース結果 */}
        {newsItems.length > 0 && (
          <div className="mb-8">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <NewspaperIcon className="h-5 w-5 mr-2 text-blue-400" />
                  検索結果 ({newsItems.length}件)
                </h2>
                
                <div className="flex space-x-2">
                  <button
                    onClick={handleGenerateContent}
                    disabled={newsItems.filter(item => item.vectorized).length === 0}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-colors text-sm"
                  >
                    記事生成 ({newsItems.filter(item => item.vectorized).length}件のベクトル化済み記事から)
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {newsItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-lg border bg-gray-800 border-gray-700 hover:border-gray-600 transition-all"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-white mb-1">{item.title}</h3>
                            <p className="text-gray-300 text-sm mb-2">{item.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-400">
                              <span>{item.source}</span>
                              <span>{new Date(item.published).toLocaleDateString('ja-JP')}</span>
                              {item.relevance && (
                                <span>関連度: {(item.relevance * 100).toFixed(1)}%</span>
                              )}
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300"
                              >
                                元記事
                              </a>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {item.vectorized && (
                              <span className="text-green-400 text-xs bg-green-900/30 px-2 py-1 rounded">
                                ベクトル化済み
                              </span>
                            )}
                            {vectorizationProgress[item.id] && (
                              <span className="text-yellow-400 text-xs bg-yellow-900/30 px-2 py-1 rounded">
                                {vectorizationProgress[item.id]}
                              </span>
                            )}
                            {item.error && (
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
                <GlobeAltIcon className="h-6 w-6 text-white" />
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
                <p className="text-red-400 text-sm font-medium">YouTubeRAG</p>
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

// ドメインを抽出する関数
function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return 'Unknown';
  }
}

// 関連度を計算する関数
function calculateRelevance(item: any, query: string, index: number): number {
  let relevance = 0.9 - (index * 0.05); // 基本スコア
  
  const title = (item.title || '').toLowerCase();
  const description = (item.description || '').toLowerCase();
  const queryLower = query.toLowerCase();
  
  // タイトルにクエリが含まれる場合のボーナス
  if (title.includes(queryLower)) {
    relevance += 0.1;
  }
  
  // 説明にクエリが含まれる場合のボーナス
  if (description.includes(queryLower)) {
    relevance += 0.05;
  }
  
  return Math.min(relevance, 1.0);
} 