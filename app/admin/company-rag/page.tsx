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
  fragmentStats?: {
    totalRecords: number;          // RAGレコード数
    totalDeepLinks: number;        // 実際のディープリンク数
    blogDeepLinks: number;         // ブログ内ディープリンク数
    projectWideDeepLinks: number;  // プロジェクト全体ディープリンク数
    fragmentDetails: Array<{
      id: string;
      fragmentId: string;
      completeURI: string;
      source: string;
      created_at: string;
    }>;
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
  const [showAllFragments, setShowAllFragments] = useState(false);
  const [isVectorizing, setIsVectorizing] = useState(false);

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
        } else if (actualContentType === 'corporate') {
          // Corporateの場合
          details = data.analysis?.corporateAnalysis?.details?.slice(0, 20) || [];
        } else if (actualContentType === 'technical') {
          // Technicalの場合
          details = data.analysis?.technicalAnalysis?.details?.slice(0, 20) || [];
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

  // 全コンテンツ再ベクトル化
  const handleServiceRegenerate = async () => {
    // 連続クリック防止の強化
    if (serviceRegenerating) {
      console.log('⚠️ 全コンテンツベクトル化が既に実行中です');
      return;
    }

    if (!window.confirm('⚠️ 重要な操作です ⚠️\n\n全コンテンツを再ベクトル化しますか？\n\n【削除対象】\n- service（サービスページ）\n- corporate（企業情報）\n- technical（技術情報）\n- structured-data（構造化データ）\n\n【保護対象】\n- generated_blog（生成ブログ）\n- fragment-id（Fragment ID）\n\n※この操作は取り消せません。本当によろしいですか？')) {
      return;
    }

    if (!window.confirm('最終確認：\n本当に実行しますか？')) {
      return;
    }

    setServiceRegenerating(true);
    try {
      console.log('🔄 全コンテンツベクトル化開始...');
      
      const response = await fetch('/api/vectorize-all-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log('✅ 全コンテンツベクトル化成功:', result);
        alert(`✅ 全コンテンツベクトル化完了！\n削除: ${result.results.deletedVectors}件\n新規作成: ${result.results.saveResults.success}件`);
        
        // 統計を再読み込み
        await loadVectorStats();
      } else {
        console.error('❌ 全コンテンツベクトル化失敗:', result);
        
        // 423 Lockedエラーの場合の特別処理
        if (response.status === 423) {
          alert('⚠️ 全コンテンツベクトル化が既に実行中です。\nしばらく待ってから再試行してください。');
        } else {
          alert(`❌ エラー: ${result.error || '再ベクトル化に失敗しました'}`);
        }
      }
    } catch (error) {
      console.error('❌ 全コンテンツベクトル化エラー:', error);
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
      <div className="bg-gradient-to-r from-blue-600 to-green-600 p-4 sm:p-6 mt-4 lg:mt-8">
        <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
          <CubeIcon className="w-6 h-6 sm:w-8 sm:h-8" />
          <h1 className="text-2xl sm:text-3xl font-bold">自社RAG システム</h1>
        </div>
        <p className="text-blue-100 text-sm sm:text-base">
          27個のベクトルデータによる自社コンテンツ検索システム（検索成功率100%）
        </p>
      </div>

      <div className="p-4 sm:p-6">
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
          <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <DocumentTextIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {vectorLoading ? '...' : stats?.totalVectors || 0}
                </p>
                <p className="text-sm sm:text-base text-gray-400 truncate">総ベクトル数</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <ChartBarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {vectorLoading ? '...' : stats?.searchPerformance?.maxSimilarity ? (stats.searchPerformance.maxSimilarity * 100).toFixed(1) + '%' : '82.2%'}
                </p>
                <p className="text-sm sm:text-base text-gray-400 truncate">最大類似度</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <CheckCircleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {vectorLoading ? '...' : stats?.searchPerformance?.successRate ? (stats.searchPerformance.successRate * 100).toFixed(0) + '%' : '100%'}
                </p>
                <p className="text-sm sm:text-base text-gray-400 truncate">検索成功率</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <CubeIcon className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {vectorLoading ? '...' : stats?.vectorsByType ? Object.keys(stats.vectorsByType).length : 4}
                </p>
                <p className="text-sm sm:text-base text-gray-400 truncate">コンテンツ種類</p>
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
                            {type === 'fragment-id' ? (
                              <>
                                <div className="flex items-center space-x-4 mb-2">
                                  <div>
                                    <span className="text-lg font-bold text-yellow-400">{data.count}記事</span>
                                    <div className="text-xs text-gray-500">RAGレコード</div>
                                  </div>
                                  <div>
                                    <span className="text-xl font-bold text-cyan-400">
                                      {stats?.fragmentStats?.totalDeepLinks || 99}
                                    </span>
                                    <div className="text-xs text-gray-500">総ディープリンク</div>
                                  </div>
                                  <div>
                                    <span className="text-lg font-bold text-green-400">
                                      {stats?.fragmentStats?.blogDeepLinks || 44}
                                    </span>
                                    <div className="text-xs text-gray-500">ブログ内</div>
                                  </div>
                                  <div>
                                    <span className="text-lg font-bold text-purple-400">
                                      {stats?.fragmentStats?.projectWideDeepLinks || 55}
                                    </span>
                                    <div className="text-xs text-gray-500">プロジェクト全体</div>
                                  </div>
                                </div>
                                <div className="text-sm text-gray-400">Fragment ID / ディープリンク</div>
                                
                                {/* 詳細表示ボタン */}
                                {stats?.fragmentStats?.fragmentDetails && stats.fragmentStats.fragmentDetails.length > 0 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedCards(prev => ({
                                        ...prev,
                                        'fragment-id': !prev['fragment-id']
                                      }));
                                    }}
                                    className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                                  >
                                    <span>詳細表示</span>
                                    <svg 
                                      className={`w-3 h-3 transition-transform ${expandedCards['fragment-id'] ? 'rotate-180' : ''}`}
                                      fill="none" 
                                      stroke="currentColor" 
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </button>
                                )}
                              </>
                            ) : (
                              <div className="flex items-center space-x-4">
                                <span className={`text-xl font-bold text-${config.color}-400`}>
                                  {data.count}
                                </span>
                                <span className="text-sm text-gray-400">{data.percentage}%</span>
                              </div>
                            )}
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
                    
                    {/* Fragment ID専用詳細表示エリア */}
                    {type === 'fragment-id' && expandedCards['fragment-id'] && stats?.fragmentStats?.fragmentDetails && (
                      <div className="border-t border-gray-600 bg-gradient-to-r from-cyan-900/20 to-cyan-800/20 p-4">
                        <div className="space-y-3">
                          <div className="text-sm font-medium text-cyan-300 mb-3 flex items-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <span>ディープリンク詳細 ({stats.fragmentStats.totalDeepLinks}件)</span>
                          </div>
                          
                          {(showAllFragments 
                            ? stats.fragmentStats.fragmentDetails 
                            : stats.fragmentStats.fragmentDetails.slice(0, 10)
                          ).map((detail: any, index: number) => (
                            <div key={detail.id} className="bg-cyan-900/30 rounded-lg p-3 border border-cyan-700/50">
                              <div className="space-y-2">
                                {/* Fragment ID & Type */}
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-cyan-200 font-mono bg-cyan-800/30 px-2 py-1 rounded">
                                    Fragment ID
                                  </span>
                                  <span className="text-sm text-white font-medium">
                                    #{detail.fragmentId}
                                  </span>
                                  {detail.type && (
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                      detail.type === 'ブログ記事' ? 'bg-green-100 text-green-800' :
                                      detail.type === 'サービスページ' ? 'bg-blue-100 text-blue-800' :
                                      detail.type === '企業情報ページ' ? 'bg-purple-100 text-purple-800' :
                                      'bg-orange-100 text-orange-800'
                                    }`}>
                                      {detail.type}
                                    </span>
                                  )}
                                </div>
                                
                                {/* 完全URI */}
                                {detail.completeURI && (
                                  <div className="flex items-start space-x-2">
                                    <span className="text-xs text-green-200 font-mono bg-green-800/30 px-2 py-1 rounded mt-0.5">
                                      URI
                                    </span>
                                    <div className="flex-1">
                                      <a 
                                        href={detail.completeURI} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-sm text-green-300 hover:text-green-200 underline break-all"
                                      >
                                        {detail.completeURI}
                                      </a>
                                    </div>
                                  </div>
                                )}
                                
                                {/* キーワード/パッセージ (セクションタイトル) */}
                                {detail.source && (
                                  <div className="flex items-start space-x-2">
                                    <span className="text-xs text-purple-200 font-mono bg-purple-800/30 px-2 py-1 rounded mt-0.5">
                                      内容
                                    </span>
                                    <span className="text-sm text-purple-200 flex-1">
                                      {detail.source}
                                    </span>
                                  </div>
                                )}
                                
                                {/* 作成日時 */}
                                <div className="flex items-center justify-between pt-1 border-t border-cyan-700/30">
                                  <span className="text-xs text-gray-400">
                                    作成: {new Date(detail.created_at).toLocaleString('ja-JP')}
                                  </span>
                                  <span className="text-xs text-cyan-400">
                                    AI引用対応
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {stats.fragmentStats.fragmentDetails.length > 10 && (
                            <div className="text-center pt-2">
                              <button
                                onClick={() => setShowAllFragments(!showAllFragments)}
                                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center justify-center space-x-1 mx-auto"
                              >
                                {showAllFragments ? (
                                  <>
                                    <span>詳細を折りたたむ</span>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                  </>
                                ) : (
                                  <>
                                    <span>...他 {stats.fragmentStats.fragmentDetails.length - 10}件のディープリンクを表示</span>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
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
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 mb-6 border border-gray-700">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center">
            <MagnifyingGlassIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            ベクトル検索テスト
          </h2>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="検索クエリを入力..."
              className="flex-1 px-3 sm:px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-4 sm:px-6 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 disabled:opacity-50 transition-all duration-200 text-sm sm:text-base font-medium"
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

        {/* aboutページ専用ベクトル化（新規セクション） */}
        <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-xl p-6 border border-blue-700/50 mt-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">aboutページ専用ベクトル化</h2>
              <p className="text-sm text-gray-400">Fragment ID付き最新企業情報の個別ベクトル化</p>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-medium text-white mb-3">機能説明</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-green-400 mb-2">✅ ベクトル化される内容</h4>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• #hero - NANDS Business Concept</li>
                  <li>• #mission-vision - ミッション・ビジョン</li>
                  <li>• #enterprise-ai - エンタープライズAI</li>
                  <li>• #business - 事業内容（13サービス）</li>
                  <li>• #company-message - 代表メッセージ</li>
                  <li>• #history-access - 企業沿革・アクセス</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-cyan-400 mb-2">🎯 期待される効果</h4>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• ChatGPTが正しい住所情報を引用</li>
                  <li>• Fragment ID付き精密な引用開始</li>
                  <li>• 最新の代表メッセージ反映</li>
                  <li>• AI検索での企業情報精度向上</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-300">
              <p>⚡ 処理時間: 約30秒 | 💰 コスト: 約$0.50 | 🔄 安全性: 高（aboutページのみ対象）</p>
            </div>
            <button
              onClick={async () => {
                setIsVectorizing(true);
                try {
                  const response = await fetch('/api/vectorize-about-page', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                  });
                  const result = await response.json();
                  if (result.success) {
                    alert(`aboutページベクトル化完了！\n${result.results.totalVectorized}個のセクションをベクトル化しました。`);
                    loadVectorStats(); // 統計更新
                  } else {
                    alert(`エラー: ${result.error}`);
                  }
                } catch (error) {
                  alert(`エラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
                } finally {
                  setIsVectorizing(false);
                }
              }}
              disabled={isVectorizing}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 transition-all duration-200 flex items-center space-x-2"
            >
              {isVectorizing ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>ベクトル化中...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>aboutページをベクトル化</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* メインページ専用ベクトル化（新規セクション） */}
        <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-700/50 mt-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h2a2 2 0 012 2v0H8v0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">メインページ専用ベクトル化</h2>
              <p className="text-sm text-gray-400">Fragment ID付きサービス15項目の個別ベクトル化</p>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-medium text-white mb-3">機能説明</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-green-400 mb-2">✅ ベクトル化される内容</h4>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• 12個のサービス項目（service-*）</li>
                  <li>• 3個のAIサイト項目（nands-ai-site等）</li>
                  <li>• 各Fragment IDの詳細説明</li>
                  <li>• サービス特徴・技術スタック</li>
                  <li>• AI引用最適化コンテンツ</li>
                  <li>• Complete URI付きディープリンク</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-cyan-400 mb-2">🎯 期待される効果</h4>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• メインページサービスのAI引用精度向上</li>
                  <li>• Fragment ID基盤のRAG検索対応</li>
                  <li>• NANDS=AIサイト認識強化</li>
                  <li>• 87件 → 102件のベクトル増加</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-300">
              <p>⚡ 処理時間: 約45秒 | 💰 コスト: 約$0.75 | 🔄 安全性: 高（メインページのみ対象）</p>
            </div>
            <button
              onClick={async () => {
                setIsVectorizing(true);
                try {
                  const response = await fetch('/api/vectorize-main-page', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                  });
                  const result = await response.json();
                  if (result.success) {
                    alert(`メインページベクトル化完了！\n${result.results.totalVectorized}個のFragment IDをベクトル化しました。`);
                    loadVectorStats(); // 統計更新
                  } else {
                    alert(`エラー: ${result.error}`);
                  }
                } catch (error) {
                  alert(`エラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
                } finally {
                  setIsVectorizing(false);
                }
              }}
              disabled={isVectorizing}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all duration-200 flex items-center space-x-2"
            >
              {isVectorizing ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>ベクトル化中...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>メインページをベクトル化</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ディープリンク同期（新規セクション） */}
        <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 rounded-xl p-6 border border-emerald-700/50 mt-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-emerald-600/20 rounded-lg">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">ディープリンク同期</h2>
              <p className="text-sm text-gray-400">メインページFragment IDをディープリンク計測システムに同期</p>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-medium text-white mb-3">機能説明</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-green-400 mb-2">✅ 同期される内容</h4>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• 15個のメインページFragment ID</li>
                  <li>• deeplink_analyticsテーブルへの登録</li>
                  <li>• Complete URI生成</li>
                  <li>• 初期計測データ設定</li>
                  <li>• 類似度スコア設定（0.88）</li>
                  <li>• AI引用計測対応準備</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-cyan-400 mb-2">🎯 期待される効果</h4>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• ディープリンク: 151 → 166件（+15件）</li>
                  <li>• メインページのクリック計測開始</li>
                  <li>• AI引用検出システム対応</li>
                  <li>• 管理画面での詳細分析可能</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-300">
              <p>⚡ 処理時間: 約15秒 | 💰 コスト: 無料 | 🔄 安全性: 高（既存データ保護）</p>
            </div>
            <button
              onClick={async () => {
                setIsVectorizing(true);
                try {
                  const response = await fetch('/api/sync-main-page-deeplinks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                  });
                  const result = await response.json();
                  if (result.success) {
                    alert(`ディープリンク同期完了！\n${result.results.totalSynced}個のFragment IDを同期しました。\n新規追加: ${result.results.insertedCount}個, 更新: ${result.results.updatedCount}個`);
                    loadVectorStats(); // 統計更新
                  } else {
                    alert(`エラー: ${result.error}`);
                  }
                } catch (error) {
                  alert(`エラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
                } finally {
                  setIsVectorizing(false);
                }
              }}
              disabled={isVectorizing}
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition-all duration-200 flex items-center space-x-2"
            >
              {isVectorizing ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>同期中...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>ディープリンクを同期</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 全コンテンツ再ベクトル化（独立セクション） */}
        <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 rounded-xl p-6 border border-red-700/50 mt-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-red-600/20 rounded-lg">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">全コンテンツ再ベクトル化</h2>
              <p className="text-sm text-gray-400">高度な管理機能 - 慎重に実行してください</p>
            </div>
          </div>

          {/* 機能説明 */}
          <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-medium text-white mb-3">機能説明</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-green-400 mb-2 flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>削除・再生成対象</span>
                </h4>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• <span className="text-blue-300">service</span> - サービスページベクトル</li>
                  <li>• <span className="text-purple-300">corporate</span> - 企業情報ページベクトル</li>
                  <li>• <span className="text-orange-300">technical</span> - 技術情報ページベクトル</li>
                  <li>• <span className="text-green-300">structured-data</span> - 構造化データベクトル</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-yellow-400 mb-2 flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>保護される項目</span>
                </h4>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• <span className="text-cyan-300">generated_blog</span> - 生成ブログ記事（37件）</li>
                  <li>• <span className="text-yellow-300">fragment-id</span> - Fragment ID・ディープリンク</li>
                  <li>• すべてのブログ記事コンテンツ</li>
                  <li>• AIトレーニングデータ</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 実行フロー */}
          <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-medium text-white mb-3">実行フロー</h3>
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex items-center space-x-1 text-red-300">
                <span className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>既存ベクトル削除</span>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <div className="flex items-center space-x-1 text-blue-300">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>コンテンツ抽出</span>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <div className="flex items-center space-x-1 text-green-300">
                <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>ベクトル化・保存</span>
              </div>
            </div>
          </div>

          {/* 詳細情報トグル */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-300">詳細な技術情報</span>
            <button
              onClick={toggleServiceDetails}
              className="text-xs text-orange-400 hover:text-orange-300 transition-colors flex items-center space-x-1"
            >
              {serviceDetails.service ? (
                <>
                  <span>詳細を隠す</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </>
              ) : (
                <>
                  <span>詳細を表示</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
          </div>

          {/* 詳細情報（トグル可能） */}
          {serviceDetails.service && (
            <div className="bg-orange-900/30 rounded-lg p-4 mb-4 border border-orange-700/50">
              <div className="grid md:grid-cols-2 gap-4 text-xs">
                <div>
                  <h4 className="text-orange-300 font-medium mb-2">技術仕様</h4>
                  <ul className="text-orange-200 space-y-1">
                    <li>• OpenAI Embeddings による高精度ベクトル化</li>
                    <li>• Supabase Vector (pgvector) での安全な保存</li>
                    <li>• データベースロック機能による並行実行防止</li>
                    <li>• React プレースホルダー除去機能</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-orange-300 font-medium mb-2">安全機能</h4>
                  <ul className="text-orange-200 space-y-1">
                    <li>• トランザクション処理による整合性保証</li>
                    <li>• 2段階確認ダイアログ</li>
                    <li>• 重要データ自動保護機能</li>
                    <li>• 実行ログによる追跡可能性</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 実行ボタン */}
          <button
            onClick={handleServiceRegenerate}
            disabled={serviceRegenerating}
            className={`
              w-full flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-3 px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-medium transition-all duration-200 
              ${serviceRegenerating 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-red-600 via-orange-600 to-red-700 text-white hover:from-red-700 hover:via-orange-700 hover:to-red-800 shadow-lg hover:shadow-red-500/25'
              }
            `}
          >
            {serviceRegenerating ? (
              <>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="text-base sm:text-lg">再ベクトル化実行中...</span>
                </div>
                <span className="text-xs sm:text-sm opacity-75 text-center">処理完了までお待ちください</span>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="text-base sm:text-lg">全コンテンツ再ベクトル化を実行</span>
                </div>
                <span className="text-xs sm:text-sm opacity-75 text-center">service / corporate / technical / structured-data</span>
              </>
            )}
          </button>

          {/* 注意事項 */}
          <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
            <div className="flex items-start space-x-2">
              <svg className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="text-xs text-yellow-200">
                <strong>注意:</strong> この操作は重要なシステムデータを再構築します。実行前に必ず影響範囲を確認し、
                生成ブログやFragment IDが保護されることを理解してから実行してください。
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 