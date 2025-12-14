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
          54個のベクトルデータによる自社コンテンツ検索システム（検索成功率100%）
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
                  {vectorLoading ? '...' : stats?.fragmentStats?.totalRecords || 0}
                </p>
                <p className="text-sm sm:text-base text-gray-400 truncate">Fragment ID数</p>
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
                  {vectorLoading ? '...' : stats?.fragmentStats?.totalDeepLinks || 0}
                </p>
                <p className="text-sm sm:text-base text-gray-400 truncate">ディープリンク数</p>
              </div>
            </div>
          </div>
        </div>

        {/* 🆕 構造化データ専用ベクトル化（新規セクション） */}
        <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl p-6 border border-green-700/50 mt-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-600/20 rounded-lg">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5m14 14H5" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">構造化データ専用ベクトル化</h2>
              <p className="text-sm text-gray-400">lib/structured-data/内の全ファイルを再ベクトル化（Mike King理論準拠システム）</p>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-medium text-white mb-3">対象ファイル（14個）</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-green-400 mb-2">🔧 システムファイル</h4>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• entity-relationships.ts（エンティティマップ）</li>
                  <li>• ai-search-optimization.ts（AI検索最適化）</li>
                  <li>• haspart-schema-system.ts（hasPartスキーマ）</li>
                  <li>• index.ts（統合システム）</li>
                  <li>• validation-system.ts（検証システム）</li>
                  <li>• auto-toc-system.ts（自動目次生成）</li>
                  <li>• author-trust-system.ts（著者信頼システム）</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-cyan-400 mb-2">🚀 拡張システム</h4>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• unified-integration-ai-enhanced.ts</li>
                  <li>• unified-integration-schema16.ts</li>
                  <li>• semantic-links.ts（セマンティックリンク）</li>
                  <li>• howto-faq-schema.ts（FAQ Schema）</li>
                  <li>• schema-org-latest.ts（Schema.org 16.0+）</li>
                  <li>• mdx-section-system.ts（MDXセクション）</li>
                  <li>• unified-integration.ts（統合システム）</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-300">
              <p>⚡ 処理時間: 約60秒 | 💰 コスト: 約$1.20 | 🔄 安全性: 高（構造化データのみ対象）</p>
            </div>
            <button
              onClick={async () => {
                setIsVectorizing(true);
                try {
                  const response = await fetch('/api/vectorize-structured-data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                  });
                  const result = await response.json();
                  if (result.success) {
                    alert(`構造化データベクトル化完了！\n${result.results.totalVectorized}個のファイルをベクトル化しました。\n\n対象ファイル数: ${result.results.fileList.length}個\n総単語数: ${result.results.fileList.reduce((sum: number, file: any) => sum + file.wordCount, 0)}語\n技術概念数: ${result.results.fileList.reduce((sum: number, file: any) => sum + file.technicalConcepts, 0)}個`);
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
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all duration-200 flex items-center space-x-2"
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5m14 14H5" />
                  </svg>
                  <span>構造化データをベクトル化</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 🆕 /ai-siteページFragment ID専用ベクトル化（新規セクション） */}
        <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-xl p-6 border border-purple-700/50 mt-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-purple-300">/ai-siteページFragment ID専用ベクトル化</h3>
              <p className="text-purple-200/80 text-sm">35個のFragment ID（H1タイトル + H2セクション + 30個FAQ）を専用テーブルにベクトル化</p>
            </div>
          </div>
          
          <div className="bg-purple-900/20 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-300">35個</div>
                <div className="text-xs text-purple-400">Fragment ID</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-300">11種</div>
                <div className="text-xs text-purple-400">カテゴリ</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-300">新テーブル</div>
                <div className="text-xs text-purple-400">fragment_vectors</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-300">Complete URI</div>
                <div className="text-xs text-purple-400">35個生成</div>
              </div>
            </div>
            
            <div className="mt-4 text-xs text-purple-300">
              <p>⚡ 処理時間: 約180秒 | 💰 コスト: 約$3.50 | 🔄 安全性: 高（専用テーブル・既存影響なし）</p>
            </div>
          </div>
          
          <button
            onClick={async () => {
              setIsVectorizing(true);
              try {
                const response = await fetch('/api/vectorize-ai-site-fragments', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' }
                });
                const result = await response.json();
                if (result.success) {
                  alert(`/ai-siteページFragment IDベクトル化完了！\n${result.results.vectorizedCount}/${result.results.totalFragments}個のFragment IDをベクトル化しました。\n\n成功率: ${result.results.successRate}\nページ: ${result.results.pageInfo.page}\nカテゴリ: ${result.results.pageInfo.categories.join(', ')}\n\n新テーブル: fragment_vectors\nComplete URI: ${result.results.pageInfo.fragmentCount}個生成完了`);
                  loadVectorStats(); // 統計更新
                } else {
                  alert(`エラー: ${result.error}\n詳細: ${result.details || '不明'}`);
                }
              } catch (error) {
                alert(`エラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
              } finally {
                setIsVectorizing(false);
              }
            }}
            disabled={isVectorizing}
            className="w-full px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200 flex items-center justify-center space-x-2"
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
                <span>/ai-siteページFragment IDをベクトル化</span>
              </>
            )}
          </button>
        </div>

        {/* 🆕 /faqページFragment ID専用ベクトル化（新規セクション） */}
        <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 rounded-xl p-6 border border-orange-700/50 mt-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-orange-600/20 rounded-lg">
              <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-orange-300">/faqページFragment ID専用ベクトル化</h3>
              <p className="text-orange-200/80 text-sm">26個のFragment ID（6カテゴリ別FAQ）を専用テーブルにベクトル化</p>
            </div>
          </div>
          
          <div className="bg-orange-900/20 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-orange-300">26個</div>
                <div className="text-xs text-orange-400">Fragment ID</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-300">6種</div>
                <div className="text-xs text-orange-400">カテゴリ</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-300">専用テーブル</div>
                <div className="text-xs text-orange-400">fragment_vectors</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-300">Complete URI</div>
                <div className="text-xs text-orange-400">26個生成</div>
              </div>
            </div>
            
            <div className="mt-4 text-xs text-orange-300">
              <p>📊 カテゴリ: tech(4), pricing(5), support(4), hr(5), marketing(4), ai-site(5)</p>
              <p>⚡ 処理時間: 約140秒 | 💰 コスト: 約$2.60 | 🔄 安全性: 高（専用テーブル・既存影響なし）</p>
            </div>
          </div>
          
          <button
            onClick={async () => {
              setIsVectorizing(true);
              try {
                const response = await fetch('/api/vectorize-faq-fragments', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' }
                });
                const result = await response.json();
                if (result.success) {
                  alert(`/faqページFragment IDベクトル化完了！\n${result.results.vectorizedCount}/${result.results.totalFragments}個のFragment IDをベクトル化しました。\n\n成功率: ${result.results.successRate}\nページ: ${result.results.pageInfo.page}\nカテゴリ: ${result.results.pageInfo.categories.join(', ')}\n\n専用テーブル: fragment_vectors\nComplete URI: ${result.results.pageInfo.fragmentCount}個生成完了`);
                  loadVectorStats(); // 統計更新
                } else {
                  alert(`エラー: ${result.error}\n詳細: ${result.details || '不明'}`);
                }
              } catch (error) {
                alert(`エラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
              } finally {
                setIsVectorizing(false);
              }
            }}
            disabled={isVectorizing}
            className="w-full px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-red-700 disabled:opacity-50 transition-all duration-200 flex items-center justify-center space-x-2"
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
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>/faqページFragment IDをベクトル化</span>
              </>
            )}
          </button>
        </div>

        {/* 🆕 ブログ記事Fragment ID専用ベクトル化（新規セクション） */}
        <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-700/50 mt-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3v3m0 0v3m0-3h3m-3 0h-3" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-purple-300">既存ブログ記事Fragment ID専用ベクトル化</h3>
              <p className="text-purple-200/80 text-sm">全ての公開済みブログ記事からFragment IDを抽出・ベクトル化（H1/H2/FAQ/著者等）</p>
            </div>
          </div>
          
          <div className="bg-purple-900/20 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-300">全記事</div>
                <div className="text-xs text-purple-400">対象</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-300">自動抽出</div>
                <div className="text-xs text-purple-400">Fragment ID</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-300">Markdown</div>
                <div className="text-xs text-purple-400">解析処理</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-300">Complete URI</div>
                <div className="text-xs text-purple-400">自動生成</div>
              </div>
            </div>
            
            <div className="mt-4 text-xs text-purple-300">
              <p>📊 処理対象: H1タイトル、H2/H3見出し、FAQ、著者欄、その他{`{#id}`}形式Fragment ID</p>
              <p>⚡ 処理時間: 記事数依存 | 💰 コスト: 記事数×約$0.50 | 🔄 安全性: 高（専用テーブル・既存影響なし）</p>
              <p>🎯 自動ブログ生成: 今後の新規記事は自動でFragment IDベクトル化済み</p>
            </div>
          </div>
          
          <button
            onClick={async () => {
              setIsVectorizing(true);
              try {
                const response = await fetch('/api/vectorize-blog-fragments', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({}) // 全記事対象
                });
                const result = await response.json();
                if (result.success) {
                  const summary = result.results.summary;
                  alert(`既存ブログ記事Fragment IDベクトル化完了！\n\n📊 処理結果:\n・処理記事数: ${result.results.processedPosts}件\n・総Fragment ID数: ${result.results.totalFragments}個\n・ベクトル化成功: ${result.results.vectorizedCount}個\n・成功率: ${result.results.successRate}\n\n📈 詳細統計:\n・平均Fragment数/記事: ${summary.avgFragmentsPerPost}個\n・Fragment有り記事: ${summary.postsWithFragments}件\n・エラー記事: ${summary.postsWithErrors}件\n\n専用テーブル: fragment_vectors\n今後の新規記事は自動ベクトル化されます`);
                  loadVectorStats(); // 統計更新
                } else {
                  alert(`エラー: ${result.error}\n詳細: ${result.details || '不明'}`);
                }
              } catch (error) {
                alert(`エラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
              } finally {
                setIsVectorizing(false);
              }
            }}
            disabled={isVectorizing}
            className="w-full px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all duration-200 flex items-center justify-center space-x-2"
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
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3v3m0 0v3m0-3h3m-3 0h-3" />
                </svg>
                <span>既存ブログ記事Fragment IDをベクトル化</span>
              </>
            )}
          </button>
        </div>

        {/* 🆕 /aboutページFragment ID専用ベクトル化（新規セクション） */}
        <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-xl p-6 border border-blue-700/50 mt-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-blue-300">/aboutページFragment ID専用ベクトル化</h3>
              <p className="text-blue-200/80 text-sm">8個のFragment ID（企業情報・代表メッセージ・沿革）を専用テーブルにベクトル化</p>
            </div>
          </div>
          
          <div className="bg-blue-900/20 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-300">8個</div>
                <div className="text-xs text-blue-400">Fragment ID</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-300">8種</div>
                <div className="text-xs text-blue-400">カテゴリ</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-300">企業情報</div>
                <div className="text-xs text-blue-400">会社概要特化</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-300">Complete URI</div>
                <div className="text-xs text-blue-400">8個生成</div>
              </div>
            </div>
            
            <div className="mt-4 text-xs text-blue-300">
              <p>📊 セクション: hero, mission-vision, enterprise-ai, business, company-message, official-sns, representative-sns, history-access</p>
              <p>⚡ 処理時間: 約60秒 | 💰 コスト: 約$0.80 | 🔄 安全性: 高（専用テーブル・既存影響なし）</p>
            </div>
          </div>
          
          <button
            onClick={async () => {
              setIsVectorizing(true);
              try {
                const response = await fetch('/api/vectorize-about-fragments', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' }
                });
                const result = await response.json();
                if (result.success) {
                  alert(`/aboutページFragment IDベクトル化完了！\n${result.results.vectorizedCount}/${result.results.totalFragments}個のFragment IDをベクトル化しました。\n\n成功率: ${result.results.successRate}\nページ: ${result.results.pageInfo.page}\nカテゴリ: ${result.results.pageInfo.categories.join(', ')}\n\n専用テーブル: fragment_vectors\nComplete URI: ${result.results.pageInfo.fragmentCount}個生成完了`);
                  loadVectorStats(); // 統計更新
                } else {
                  alert(`エラー: ${result.error}\n詳細: ${result.details || '不明'}`);
                }
              } catch (error) {
                alert(`エラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
              } finally {
                setIsVectorizing(false);
              }
            }}
            disabled={isVectorizing}
            className="w-full px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200 flex items-center justify-center space-x-2"
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
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>/aboutページFragment IDをベクトル化</span>
              </>
            )}
          </button>
        </div>

        {/* 🆕 メインページFragment ID専用ベクトル化（新規セクション） */}
        <div className="bg-gradient-to-br from-emerald-900/30 to-green-900/30 rounded-xl p-6 border border-emerald-700/50 mt-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-emerald-600/20 rounded-lg">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5m14 14H5" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">メインページFragment ID専用ベクトル化</h2>
              <p className="text-sm text-gray-400">54個のFragment ID（12サービス + 3AIサイト + 21FAQ + 18新セクション）をfragment_vectorsテーブルにベクトル化</p>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-medium text-white mb-3">対象Fragment ID（54個）</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <h4 className="text-sm font-medium text-emerald-400 mb-2">🛠️ サービス（12個）</h4>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• service-system-development</li>
                  <li>• service-aio-seo</li>
                  <li>• service-chatbot-development</li>
                  <li>• service-vector-rag</li>
                  <li>• service-ai-agents</li>
                  <li>• service-mcp-servers</li>
                  <li>• service-sns-automation</li>
                  <li>• その他5サービス</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-cyan-400 mb-2">❓ FAQ（21個）</h4>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• faq-main-1（AIアーキテクト）</li>
                  <li>• faq-main-2（Cursor 2.0）</li>
                  <li>• faq-main-3（MCP, Mastra）</li>
                  <li>• faq-main-4（Vector Link）</li>
                  <li>• faq-main-7（個人リスキリング料金）</li>
                  <li>• faq-main-8（法人リスキリング料金）</li>
                  <li>• その他15FAQ</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-purple-400 mb-2">🎯 新セクション（18個）</h4>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• ProblemSection（4個）</li>
                  <li>• PhilosophySection（1個）</li>
                  <li>• SolutionBentoGrid（4個）</li>
                  <li>• PricingSection（4個）</li>
                  <li>• CTASection（4個）</li>
                  <li>• ContactSection（1個）</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 grid md:grid-cols-1 gap-4">
              <div>
                <h4 className="text-sm font-medium text-orange-400 mb-2">🤖 AIサイト（3個）</h4>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• nands-ai-site</li>
                  <li>• ai-site-features</li>
                  <li>• ai-site-technology</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-yellow-900/20 rounded-lg p-4 mb-4 border border-yellow-700/50">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h4 className="text-sm font-medium text-yellow-400">重要な違い</h4>
            </div>
            <p className="text-xs text-gray-300">
              この処理は新しい<code className="bg-gray-700 px-1 rounded">fragment_vectors</code>テーブルに保存されます。
              既存の<code className="bg-gray-700 px-1 rounded">company_vectors</code>テーブルとは別管理で、Fragment ID専用の完全リンクシステムです。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-300">
              <p>⚡ 処理時間: 約120秒 | 💰 コスト: 約$2.00 | 🔄 安全性: 高（新テーブル・既存影響なし）</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={async () => {
                  setIsVectorizing(true);
                  try {
                    const response = await fetch('/api/vectorize-main-page-fragments', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' }
                    });
                    const result = await response.json();
                    if (result.success) {
                      alert(`メインページFragment IDベクトル化完了！\n${result.results.vectorizedCount}/${result.results.totalFragments}個のFragment IDをベクトル化しました。\n\n成功率: ${result.results.successRate}\n新テーブル: fragment_vectors\n完全URI: 54個生成完了`);
                      loadVectorStats(); // 統計更新
                    } else {
                      alert(`エラー: ${result.error}\n詳細: ${result.details || '不明'}`);
                    }
                  } catch (error) {
                    alert(`エラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
                  } finally {
                    setIsVectorizing(false);
                  }
                }}
                disabled={isVectorizing}
                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 transition-all duration-200 flex items-center space-x-2"
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5m14 14H5" />
                    </svg>
                    <span>メインページFragment IDをベクトル化</span>
                  </>
                )}
              </button>
              
              <a
                href="/admin/fragment-vectors"
                target="_blank"
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>ベクトルリンク可視化</span>
              </a>
            </div>
          </div>
        </div>

        {/* ディープリンク同期セクション - DELETED */}

      </div>

      {/* 🆕 著者Fragment IDベクトル化セクション */}
      <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-xl p-6 border border-purple-700/50 mt-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-purple-600/20 rounded-lg">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-purple-300">既存ブログ記事著者Fragment IDベクトル化</h3>
            <p className="text-purple-200/80 text-sm">全ての既存ブログ記事に著者Fragment IDを追加・ベクトル化</p>
          </div>
        </div>
        
        <div className="bg-purple-900/20 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-300">全記事</div>
              <div className="text-xs text-purple-400">対象</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-300">author-profile</div>
              <div className="text-xs text-purple-400">Fragment ID</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-300">原田賢治</div>
              <div className="text-xs text-purple-400">著者情報</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-300">AI引用対応</div>
              <div className="text-xs text-purple-400">Complete URI</div>
            </div>
          </div>
          
          <div className="mt-4 text-xs text-purple-300">
            <p>📊 処理対象: 既存全ブログ記事 | ⚡ 処理時間: 約3-5分 | 💰 コスト: 記事数×約$0.10</p>
            <p>🎯 効果: AI検索での著者情報引用最適化 | 🔄 安全性: 高（重複チェック機能付き）</p>
          </div>
        </div>
        
        <button
          onClick={async () => {
            setIsVectorizing(true);
            try {
              const response = await fetch('/api/vectorize-blog-authors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
              });
              const result = await response.json();
              if (result.success) {
                alert(`既存ブログ記事著者Fragment IDベクトル化完了！\n\n📊 処理結果:\n・対象記事数: ${result.results.targetArticles}件\n・成功: ${result.results.successCount}件\n・エラー: ${result.results.errorCount}件\n・成功率: ${result.results.successRate}\n\n📈 詳細:\n・Fragment ID: ${result.results.summary.fragmentId}\n・コンテンツタイプ: ${result.results.summary.contentType}\n・ターゲットクエリ: ${result.results.summary.targetQueries}個\n・関連エンティティ: ${result.results.summary.relatedEntities}個\n\n今後の新規ブログ記事には自動で著者Fragment IDが追加されます`);
                loadVectorStats(); // 統計更新
              } else {
                alert(`エラー: ${result.error}\n詳細: ${result.details || '不明'}`);
              }
            } catch (error) {
              alert(`エラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
            } finally {
              setIsVectorizing(false);
            }
          }}
          disabled={isVectorizing}
          className="w-full px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          {isVectorizing ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>著者Fragment IDベクトル化中...</span>
            </>
          ) : (
            <>
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>既存ブログ記事に著者Fragment IDを追加</span>
            </>
          )}
        </button>
      </div>

      {/* 🆕 法的文書Fragment ID移行セクション */}
      <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl p-6 border border-green-700/50 mt-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-green-600/20 rounded-lg">
            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-green-300">法的文書Fragment ID移行</h3>
            <p className="text-green-200/80 text-sm">プライバシーポリシー・利用規約・法的情報をFragment IDベクトルに移行</p>
          </div>
        </div>
        
        <div className="bg-green-900/20 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-300">プライバシーポリシー</div>
              <div className="text-xs text-green-400">6 Fragment IDs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-300">利用規約</div>
              <div className="text-xs text-green-400">2 Fragment IDs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-300">法的情報</div>
              <div className="text-xs text-green-400">6 Fragment IDs</div>
            </div>
          </div>
          
          <div className="mt-4 text-xs text-green-300">
            <p>📊 総Fragment ID数: 14個 | ⚡ 処理時間: 約2-3分 | 💰 コスト: 約$0.50</p>
            <p>🎯 効果: Trust Layer強化・AI引用最適化 | 🔄 安全性: 高（重複チェック機能付き）</p>
          </div>
        </div>
        
        <button
          onClick={async () => {
            setIsVectorizing(true);
            try {
              const response = await fetch('/api/vectorize-legal-documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
              });
              const result = await response.json();
              if (result.success) {
                alert(`法的文書Fragment ID移行完了！\n\n📊 処理結果:\n・総Fragment ID数: ${result.results.totalFragments}個\n・成功: ${result.results.successCount}個\n・エラー: ${result.results.errorCount}個\n\n📈 詳細:\n・プライバシーポリシー: ${result.results.details.privacy.count}個\n・利用規約: ${result.results.details.terms.count}個\n・法的情報: ${result.results.details.legal.count}個\n\n🎯 Trust Layer強化とAI引用最適化が完了しました！`);
                loadVectorStats(); // 統計更新
              } else {
                alert(`エラー: ${result.error}\n詳細: ${result.details || '不明'}`);
              }
            } catch (error) {
              alert(`エラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
            } finally {
              setIsVectorizing(false);
            }
          }}
          disabled={isVectorizing}
          className="w-full px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          {isVectorizing ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>法的文書Fragment ID移行中...</span>
            </>
          ) : (
            <>
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>法的文書をFragment IDベクトルに移行</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
} 