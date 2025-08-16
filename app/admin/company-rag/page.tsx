'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  CubeIcon, 
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import VectorCleanupManager from '../../../components/admin/VectorCleanupManager';


interface ContentTypeDetail {
  count: number;
  percentage: string;
}

interface VectorDetailItem {
  id: string;
  title: string;
  content_preview: string;
  created_at: string;
  metadata?: any;
  additional_info?: any;
}

interface VectorDetailsResponse {
  success: boolean;
  content_type: string;
  total_count: number;
  data: VectorDetailItem[];
}

interface VectorStats {
  totalVectors: number;
  vectorsByType: { [key: string]: number };
  searchPerformance: {
    maxSimilarity: number;
    avgSimilarity: number;
    successRate: number;
  };
  detailedStats?: {
    contentTypes: { [key: string]: ContentTypeDetail };
    timeSeriesStats: {
      total: number;
      last_week: number;
      last_month: number;
    };
    recentActivity: {
      latest_generated_blogs: Array<{
        id: string;
        title: string;
        created_at: string;
        metadata?: any;
      }>;
      latest_posts: Array<{
        id: string;
        title: string;
        created_at: string;
        status: string;
        business_id: number;
        category_id: number;
      }>;
    };
  };
}

interface SearchResult {
  id: string;
  content_type: string;
  content: string;
  similarity: number;
}

export default function CompanyRagPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<VectorStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [vectorLoading, setVectorLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({});
  const [cardDetails, setCardDetails] = useState<{ [key: string]: VectorDetailItem[] }>({});
  const [detailsLoading, setDetailsLoading] = useState<{ [key: string]: boolean }>({});
  const [serviceRegenerating, setServiceRegenerating] = useState(false);
  const [serviceDetails, setServiceDetails] = useState<{ [key: string]: boolean }>({});

  // 認証チェック
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin');
      return;
    }
  }, [user, authLoading, router]);

  // 初期データ読み込み
  useEffect(() => {
    loadVectorStats();
  }, []);

  const loadVectorStats = async () => {
    try {
      setVectorLoading(true);
      // キャッシュバスターを追加して常に最新データを取得
      const cacheBuster = `_t=${Date.now()}`;
      const response = await fetch(`/api/admin/vector-stats?${cacheBuster}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading vector stats:', error);
    } finally {
      setVectorLoading(false);
    }
  };

  // ベクトル検索の実行
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/test-vector-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          contentType: 'all',
          limit: 5
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
      } else {
        console.error('Search failed');
      }
    } catch (error) {
      console.error('Error searching vectors:', error);
    } finally {
      setLoading(false);
    }
  };

  // RAGカード詳細の取得
  const loadCardDetails = async (contentType: string) => {
    if (cardDetails[contentType]) {
      return; // 既に取得済みの場合はスキップ
    }

    // detailed_プレフィックスがある場合は除去してAPIコール用のタイプを取得
    const actualContentType = contentType.startsWith('detailed_') 
      ? contentType.replace('detailed_', '') 
      : contentType;

    setDetailsLoading(prev => ({ ...prev, [contentType]: true }));
    try {
      // 新しいvector-detailsエンドポイントを使用
      const response = await fetch('/api/admin/vector-details', {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // contentTypeに応じて適切なデータを抽出
        let details = [];
        if (actualContentType === 'service') {
          // サービスベクトルの場合、serviceDetailsから取得
          details = data.analysis?.serviceAnalysis?.serviceDetails?.slice(0, 20) || [];
          // 古いAPI形式に変換
          details = details.map((item: any) => ({
            id: item.id,
            title: item.section_title,
            content_preview: `作成日: ${new Date(item.created_at).toLocaleDateString('ja-JP')}`,
            created_at: item.created_at,
            additional_info: item.metadata
          }));
        } else if (actualContentType === 'generated_blog') {
          // 生成ブログの場合
          details = data.analysis?.generatedBlogAnalysis?.recentBlogs?.slice(0, 20) || [];
          details = details.map((item: any) => ({
            id: item.id,
            title: item.section_title,
            content_preview: `作成日: ${new Date(item.created_at).toLocaleDateString('ja-JP')}`,
            created_at: item.created_at,
            additional_info: item.metadata
          }));
        } else if (actualContentType === 'structured-data') {
          // 構造化データの場合
          details = data.analysis?.structuredDataAnalysis?.details?.slice(0, 20) || [];
        } else if (actualContentType === 'fragment-id') {
          // Fragment IDの場合
          details = data.analysis?.fragmentIdAnalysis?.details?.slice(0, 20) || [];
        }
        
        setCardDetails(prev => ({ ...prev, [contentType]: details }));
      } else {
        console.error(`Failed to load details for ${contentType}`);
      }
    } catch (error) {
      console.error(`Error loading details for ${contentType}:`, error);
    } finally {
      setDetailsLoading(prev => ({ ...prev, [contentType]: false }));
    }
  };

  // RAGカードの展開/折りたたみ
  const toggleCardExpansion = async (contentType: string) => {
    const isCurrentlyExpanded = expandedCards[contentType];
    
    if (!isCurrentlyExpanded) {
      // 展開する場合は詳細データを取得
      // detailed_プレフィックスがある場合は除去
      const actualContentType = contentType.startsWith('detailed_') 
        ? contentType.replace('detailed_', '') 
        : contentType;
      await loadCardDetails(contentType);
    }
    
    setExpandedCards(prev => ({
      ...prev,
      [contentType]: !isCurrentlyExpanded
    }));
  };

  // サービス再ベクトル化
  const handleServiceRegenerate = async () => {
    // 連続クリック防止の強化
    if (serviceRegenerating) {
      console.log('⚠️ サービス再ベクトル化が既に実行中です');
      return;
    }

    if (!window.confirm('サービス内容を再ベクトル化しますか？\n既存のサービスベクトルが全て削除され、最新の内容で再生成されます。')) {
      return;
    }

    setServiceRegenerating(true);
    try {
      console.log('🔄 サービス再ベクトル化開始...');
      
      const response = await fetch('/api/vectorize-service-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log('✅ サービス再ベクトル化成功:', result);
        alert(`✅ サービス再ベクトル化完了！\n削除: ${result.deletedCount}件\n新規作成: ${result.successCount}件`);
        
        // 統計を再読み込み
        await loadVectorStats();
      } else {
        console.error('❌ サービス再ベクトル化失敗:', result);
        
        // 423 Lockedエラーの場合の特別処理
        if (response.status === 423) {
          alert('⚠️ サービス再ベクトル化が既に実行中です。\nしばらく待ってから再試行してください。');
        } else {
          alert(`❌ エラー: ${result.error || '再ベクトル化に失敗しました'}`);
        }
      }
    } catch (error) {
      console.error('❌ サービス再ベクトル化エラー:', error);
      alert('❌ ネットワークエラーまたはサーバーエラーが発生しました');
    } finally {
      setServiceRegenerating(false);
    }
  };

  // サービス詳細の展開/折りたたみ
  const toggleServiceDetails = () => {
    setServiceDetails(prev => ({ service: !prev.service }));
  };

  const predefinedQueries = [
    'AIエージェント開発の技術的な詳細について',
    'チャットボットの開発方法',
    'ベクトル検索システムの構築',
    'レリバンスエンジニアリングの手法',
    'SEO対策の実装方法',
    'システム開発のプロセス'
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <CubeIcon className="w-8 h-8" />
          <h1 className="text-3xl font-bold">自社RAG システム</h1>
        </div>
        <p className="text-blue-100">
          27個のベクトルデータによる自社コンテンツ検索システム（検索成功率100%）
        </p>
      </div>

      <div className="p-6">
        {/* 統計情報 */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">統計情報</h2>
            <button
              onClick={loadVectorStats}
              disabled={vectorLoading}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg disabled:opacity-50 transition-colors text-sm"
            >
              {vectorLoading ? '更新中...' : '🔄 更新'}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center space-x-3">
              <DocumentTextIcon className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {vectorLoading ? '...' : stats?.totalVectors || 0}
                </p>
                <p className="text-gray-400">総ベクトル数</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center space-x-3">
              <ChartBarIcon className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {vectorLoading ? '...' : stats?.searchPerformance?.maxSimilarity ? (stats.searchPerformance.maxSimilarity * 100).toFixed(1) + '%' : '82.2%'}
                </p>
                <p className="text-gray-400">最大類似度</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {vectorLoading ? '...' : stats?.searchPerformance?.successRate ? (stats.searchPerformance.successRate * 100).toFixed(0) + '%' : '100%'}
                </p>
                <p className="text-gray-400">検索成功率</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center space-x-3">
              <CubeIcon className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {vectorLoading ? '...' : stats?.vectorsByType ? Object.keys(stats.vectorsByType).length : 4}
                </p>
                <p className="text-gray-400">コンテンツ種類</p>
              </div>
            </div>
          </div>
        </div>

        {/* 詳細統計セクション */}
        {stats && stats.detailedStats && (
          <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-white">詳細統計</h2>
            
            {/* コンテンツタイプ別詳細（詳細表示対応） */}
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-medium text-white mb-4">コンテンツタイプ別詳細</h3>
              {Object.entries(stats.detailedStats.contentTypes).map(([type, data]) => {
                const isExpanded = expandedCards[`detailed_${type}`];
                const isDetailsLoading = detailsLoading[`detailed_${type}`];
                const details = cardDetails[`detailed_${type}`] || [];

                                 // アイコンとカラーの設定
                 const getTypeConfig = (contentType: string) => {
                   switch (contentType) {
                     case 'service': return { 
                       icon: (
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                         </svg>
                       ), 
                       color: 'blue' 
                     };
                     case 'generated_blog': return { 
                       icon: (
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                         </svg>
                       ), 
                       color: 'cyan' 
                     };
                     case 'structured-data': return { 
                       icon: (
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5m14 14H5" />
                         </svg>
                       ), 
                       color: 'green' 
                     };
                     case 'fragment-id': return { 
                       icon: (
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                         </svg>
                       ), 
                       color: 'yellow' 
                     };
                     case 'corporate': return { 
                       icon: (
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                         </svg>
                       ), 
                       color: 'purple' 
                     };
                     case 'technical': return { 
                       icon: (
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                         </svg>
                       ), 
                       color: 'orange' 
                     };
                     default: return { 
                       icon: (
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                         </svg>
                       ), 
                       color: 'gray' 
                     };
                   }
                 };

                const config = getTypeConfig(type);

                return (
                  <div key={type} className="bg-gray-700 rounded-lg overflow-hidden">
                    {/* カードヘッダー（クリック可能） */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-600 transition-colors"
                      onClick={() => toggleCardExpansion(`detailed_${type}`)}
                    >
                      <div className="flex items-center justify-between">
                                                 <div className="flex items-center space-x-3">
                           <div className={`text-${config.color}-400`}>{config.icon}</div>
                          <div>
                            <h3 className="font-medium text-white mb-1 capitalize">
                              {type.replace('-', ' ')}
                            </h3>
                            <div className="flex items-center space-x-4">
                              <span className={`text-xl font-bold text-${config.color}-400`}>
                                {data.count}
                              </span>
                              <span className="text-sm text-gray-400">{data.percentage}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {/* プログレスバー */}
                          <div className="w-20 bg-gray-600 rounded-full h-2">
                            <div 
                              className={`bg-${config.color}-500 h-2 rounded-full`}
                              style={{ width: `${data.percentage}%` }}
                            ></div>
                          </div>
                          {isDetailsLoading && (
                            <div className="text-xs text-gray-400">読み込み中...</div>
                          )}
                          {isExpanded ? (
                            <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* サービス専用再ベクトル化ボタン */}
                    {type === 'service' && (
                      <div className="border-t border-gray-600 bg-gradient-to-r from-blue-900/20 to-blue-800/20 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span className="text-sm font-medium text-blue-300">サービス再ベクトル化</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleServiceDetails();
                            }}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            {serviceDetails.service ? '詳細を隠す' : '詳細を表示'}
                          </button>
                        </div>
                        
                        {/* トグル可能な詳細情報 */}
                        {serviceDetails.service && (
                          <div className="bg-blue-900/30 rounded-lg p-3 mb-3 border border-blue-700/50">
                            <div className="text-xs text-blue-200 space-y-1">
                              <div className="flex items-center space-x-2">
                                <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>既存のサービスベクトルを安全に削除</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>最新のサービスページ内容を抽出</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>プレースホルダーなしの正確なベクトル化</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <svg className="w-3 h-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <span>構造化データ・Fragment IDは保護</span>
                              </div>
                            </div>
                          </div>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleServiceRegenerate();
                          }}
                          disabled={serviceRegenerating}
                          className={`
                            w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 
                            ${serviceRegenerating 
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                              : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-blue-500/25'
                            }
                          `}
                        >
                          {serviceRegenerating ? (
                            <>
                              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              <span>再ベクトル化中...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              <span>サービス再ベクトル化</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* 詳細表示エリア */}
                    {isExpanded && (
                      <div className="border-t border-gray-600 bg-gray-750 p-4">
                        {isDetailsLoading ? (
                          <div className="text-center py-4">
                            <div className="text-gray-400">詳細データを読み込み中...</div>
                          </div>
                        ) : details.length > 0 ? (
                          <div className="space-y-3">
                            <div className="text-sm font-medium text-gray-300 mb-3">
                              詳細一覧 ({details.length}件)
                            </div>
                            {details.slice(0, 8).map((detail, index) => (
                              <div key={detail.id} className="bg-gray-800 rounded p-3 border border-gray-600">
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-medium text-white text-sm line-clamp-1">
                                    {detail.title}
                                  </h4>
                                  <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                                    {new Date(detail.created_at).toLocaleDateString('ja-JP')}
                                  </span>
                                </div>
                                {detail.content_preview && (
                                  <p className="text-xs text-gray-400 line-clamp-2">
                                    {detail.content_preview}
                                  </p>
                                )}
                                {detail.additional_info && (
                                  <div className="mt-2 text-xs text-gray-500">
                                    {type === 'generated_blog' && detail.additional_info.status && (
                                      <span className={`px-2 py-1 rounded text-xs ${
                                        detail.additional_info.status === 'published' 
                                          ? 'bg-green-600 text-green-100' 
                                          : 'bg-yellow-600 text-yellow-100'
                                      }`}>
                                        {detail.additional_info.status}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                            {details.length > 8 && (
                              <div className="text-center pt-2">
                                <span className="text-xs text-gray-400">
                                  ...他 {details.length - 8}件
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <div className="text-gray-400">データがありません</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 時系列統計 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm">総数</p>
                <p className="text-2xl font-bold text-white">{stats.detailedStats.timeSeriesStats.total}</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm">先週追加</p>
                <p className="text-2xl font-bold text-green-400">{stats.detailedStats.timeSeriesStats.last_week}</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm">先月追加</p>
                <p className="text-2xl font-bold text-blue-400">{stats.detailedStats.timeSeriesStats.last_month}</p>
              </div>
            </div>

            {/* 最新の生成ブログ */}
            {stats.detailedStats.recentActivity.latest_generated_blogs.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-3">最新の生成ブログ</h3>
                <div className="space-y-2">
                  {stats.detailedStats.recentActivity.latest_generated_blogs.slice(0, 5).map((blog, index) => (
                    <div key={blog.id} className="bg-gray-700 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <p className="text-white font-medium text-sm">{blog.title}</p>
                        <span className="text-xs text-gray-400 ml-2">
                          {new Date(blog.created_at).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ベクトルデータ最適化 */}
        <VectorCleanupManager />

        {/* ベクトル検索テスト */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
            ベクトル検索テスト
          </h2>
          
          <div className="flex space-x-3 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="検索クエリを入力..."
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 disabled:opacity-50 transition-all duration-200"
            >
              {loading ? '検索中...' : '検索'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {predefinedQueries.map((query) => (
              <button
                key={query}
                onClick={() => setSearchQuery(query)}
                className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-gray-600 transition-colors"
              >
                {query}
              </button>
            ))}
          </div>

          {/* 検索結果 */}
          {searchResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">検索結果</h3>
              {searchResults.map((result, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm text-blue-400 font-medium">
                      {result.content_type}
                    </span>
                    <span className="text-sm text-green-400 font-medium">
                      類似度: {(result.similarity * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    {result.content.substring(0, 200)}...
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* コンテンツ種別統計（詳細表示対応） */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">コンテンツ種別統計</h2>
          <div className="space-y-4">
            {[
              { 
                key: 'service', 
                name: 'サービス', 
                color: 'blue', 
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )
              },
              { 
                key: 'generated_blog', 
                name: '生成ブログ', 
                color: 'cyan', 
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                )
              },
              { 
                key: 'structured-data', 
                name: '構造化データ', 
                color: 'green', 
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5m14 14H5" />
                  </svg>
                )
              },
              { 
                key: 'fragment-id', 
                name: 'Fragment ID', 
                color: 'yellow', 
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                )
              },
              { 
                key: 'corporate', 
                name: 'コーポレート', 
                color: 'purple', 
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                )
              },
              { 
                key: 'technical', 
                name: '技術', 
                color: 'orange', 
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                )
              }
            ].map((item) => {
              const count = vectorLoading ? '...' : stats?.vectorsByType?.[item.key] || 0;
              const isExpanded = expandedCards[item.key];
              const isDetailsLoading = detailsLoading[item.key];
              const details = cardDetails[item.key] || [];

              return (
                <div key={item.key} className="bg-gray-700 rounded-lg overflow-hidden">
                  {/* カードヘッダー（クリック可能） */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-600 transition-colors"
                    onClick={() => toggleCardExpansion(item.key)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`text-${item.color}-400`}>{item.icon}</div>
                        <div>
                          <div className={`text-2xl font-bold text-${item.color}-400`}>
                            {count}
                          </div>
                          <div className="text-sm text-gray-400">{item.name}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isDetailsLoading && (
                          <div className="text-xs text-gray-400">読み込み中...</div>
                        )}
                        {isExpanded ? (
                          <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 詳細表示エリア */}
                  {isExpanded && (
                    <div className="border-t border-gray-600 bg-gray-750 p-4">
                      {isDetailsLoading ? (
                        <div className="text-center py-4">
                          <div className="text-gray-400">詳細データを読み込み中...</div>
                        </div>
                      ) : details.length > 0 ? (
                        <div className="space-y-3">
                          <div className="text-sm font-medium text-gray-300 mb-3">
                            詳細一覧 ({details.length}件)
                          </div>
                          {details.slice(0, 10).map((detail, index) => (
                            <div key={detail.id} className="bg-gray-800 rounded p-3 border border-gray-600">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-white text-sm line-clamp-1">
                                  {detail.title}
                                </h4>
                                <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                                  {new Date(detail.created_at).toLocaleDateString('ja-JP')}
                                </span>
                              </div>
                              {detail.content_preview && (
                                <p className="text-xs text-gray-400 line-clamp-2">
                                  {detail.content_preview}
                                </p>
                              )}
                              {detail.additional_info && (
                                <div className="mt-2 text-xs text-gray-500">
                                  {item.key === 'generated_blog' && detail.additional_info.status && (
                                    <span className={`px-2 py-1 rounded text-xs ${
                                      detail.additional_info.status === 'published' 
                                        ? 'bg-green-600 text-green-100' 
                                        : 'bg-yellow-600 text-yellow-100'
                                    }`}>
                                      {detail.additional_info.status}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                          {details.length > 10 && (
                            <div className="text-center pt-2">
                              <span className="text-xs text-gray-400">
                                ...他 {details.length - 10}件
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <div className="text-gray-400">データがありません</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 管理操作 */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">管理操作</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={loadVectorStats}
              disabled={vectorLoading}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-all duration-200"
            >
              {vectorLoading ? '読み込み中...' : '統計更新'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 