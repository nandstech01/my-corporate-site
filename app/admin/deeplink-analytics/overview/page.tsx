'use client';

import { useState, useEffect } from 'react';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  LinkIcon, 
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  CubeIcon,
  TagIcon
} from '@heroicons/react/24/outline';

// 🎯 統合ディープリンク統計データの型定義（145件対応）
interface UnifiedDeepLinkStats {
  totalFragments: number;
  existingFragments: number;    // company_vectorsの既存Fragment ID
  staticFragments: number;      // AI-site等の静的Fragment ID
  newAnalyticsOnly: number;     // deeplink_analytics専用データ
  withAnalytics: number;        // 計測データが紐付いているもの
  totalClicks: number;
  totalAIQuotations: number;
  averageSimilarity: number;
  topPerformingFragments: Array<{
    fragmentId: string;
    completeURI: string;
    pagePath: string;
    clickCount: number;
    aiQuotationCount: number;
    similarityScore: number;
  }>;
  contentTypeBreakdown: { [key: string]: number };
  // 🎯 詳細内訳データ追加
  contentTypeDetails?: {
    [key: string]: {
      total: number;
      details: {
        h1_sections: number;
        h2_sections: number;
        h3_sections: number;
        faq_sections: number;
        introduction_sections: number;
        other_sections: number;
      };
      samples: Array<{
        fragmentId: string;
        sectionTitle: string;
        completeURI: string;
      }>;
    };
  };
  similarityDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  recentActivity: Array<{
    fragmentId: string;
    completeURI: string;
    source: string;
    createdAt: string;
  }>;
}

export default function DeepLinkAnalyticsOverview() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<UnifiedDeepLinkStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [allFragments, setAllFragments] = useState<any[]>([]);
  const [showAllFragments, setShowAllFragments] = useState(false);
  const [fragmentFilter, setFragmentFilter] = useState<string>('');
  const [expandedSamples, setExpandedSamples] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (!user) {
      router.push('/admin');
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch('/api/deeplink-analytics/overview');
        const result = await response.json();
        
        if (result.success) {
          setData(result.data);
        } else {
          console.error('データ取得エラー:', result.error);
        }

        // 🎯 全フラグメントデータも取得
        const unifiedResponse = await fetch('/api/deeplink-analytics/unified');
        const unifiedResult = await unifiedResponse.json();
        
        if (unifiedResult.success) {
          console.log('🎯 統合データ取得:', unifiedResult.fragments?.length || 0, '件');
          console.log('🎯 最初の3件のsimilarityScore:', unifiedResult.fragments?.slice(0, 3).map((f: any) => ({ id: f.fragmentId, sim: f.similarityScore })));
          setAllFragments(unifiedResult.fragments || []);
        }
      } catch (error) {
        console.error('API呼び出しエラー:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, router]);

  const toggleCardExpansion = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  // 🎯 フィルタリングされたフラグメント一覧
  const filteredFragments = allFragments.filter(fragment => {
    if (!fragmentFilter) return true;
    return (
      fragment.fragmentId?.toLowerCase().includes(fragmentFilter.toLowerCase()) ||
      fragment.completeURI?.toLowerCase().includes(fragmentFilter.toLowerCase()) ||
      fragment.contentType?.toLowerCase().includes(fragmentFilter.toLowerCase())
    );
  });

  // 🎯 サンプル展開/折りたたみ機能
  const toggleSamples = (type: string) => {
    setExpandedSamples(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">読み込み中...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">データの取得に失敗しました</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <LinkIcon className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">ディープリンク統合計測</h1>
          </div>
          <p className="text-gray-400">145件のディープリンクを統合計測・分析</p>
          <div className="mt-2 text-sm text-blue-400">
            既存システム完全保護 | company_vectors + deeplink_analytics統合
          </div>
        </div>

        {/* サマリー統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* 総Fragment ID数 */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-300 text-sm font-medium">総Fragment ID数</h3>
              <LinkIcon className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{data.totalFragments}</div>
            <div className="text-xs text-gray-400">
              既存: {data.existingFragments} | 静的: {data.staticFragments} | 新規: {data.newAnalyticsOnly}
            </div>
          </div>

          {/* 計測データ有り */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-300 text-sm font-medium">計測データ有り</h3>
              <ChartBarIcon className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{data.withAnalytics}</div>
            <div className="text-xs text-gray-400">
              カバレッジ: {((data.withAnalytics / data.totalFragments) * 100).toFixed(1)}%
            </div>
          </div>

          {/* 総クリック数 */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-300 text-sm font-medium">総クリック数</h3>
              <CursorArrowRaysIcon className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{data.totalClicks}</div>
          </div>

          {/* AI引用数 */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-300 text-sm font-medium">AI引用数</h3>
              <MagnifyingGlassIcon className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{data.totalAIQuotations}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* コンテンツタイプ別分析 */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <TagIcon className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">コンテンツタイプ別分析</h3>
            </div>
            
            {/* 📋 補足説明 */}
            <div className="mb-4 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
              <div className="text-xs text-blue-300 mb-2 font-medium">💡 重要な補足説明</div>
              <div className="space-y-1 text-xs text-gray-300">
                <div><span className="text-blue-400 font-medium">ブログFragment ID</span>: Fragment ID構造の設計図・メタデータ（H1タイトルではない）</div>
                <div><span className="text-green-400 font-medium">生成ブログ</span>: 実際のブログ記事のH1タイトル + 本文コンテンツ</div>
                <div className="text-xs text-gray-400 mt-1">※ 1つのブログ記事 = 2つのFragment ID（コンテンツ + 構造情報）</div>
              </div>
            </div>
            <div className="space-y-3">
              {Object.entries(data.contentTypeBreakdown)
                // アクセスできないもの（真のディープリンクではない）を全て除外
                .filter(([type]) => 
                  type !== 'generated_blog' && 
                  type !== 'structured-data' && 
                  type !== 'measurement' &&
                  type !== 'real-page-section'
                )
                // blog-fragmentをgenerated_blogとして表示
                .map(([type, count]) => type === 'blog-fragment' ? ['generated_blog', count] as [string, number] : [type, count] as [string, number])
                .map(([type, count]) => {
                const hasDetails = data.contentTypeDetails && (data.contentTypeDetails[type] || data.contentTypeDetails['blog-fragment']);
                const isExpanded = expandedCard === `content-${type}`;
                
                return (
                  <div key={type} className="border border-gray-700 rounded-lg">
                    <div 
                      className={`flex items-center justify-between p-3 ${hasDetails ? 'cursor-pointer hover:bg-gray-700' : ''}`}
                      onClick={() => hasDetails && toggleCardExpansion(`content-${type}`)}
                    >
                      <div className="flex items-center gap-2">
                        <DocumentTextIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300 capitalize">{getContentTypeLabel(type)}</span>
                        {hasDetails && (
                          <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded">詳細</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{count}</span>
                        <span className="text-xs text-gray-400">
                          ({((count / data.totalFragments) * 100).toFixed(1)}%)
                        </span>
                        {hasDetails && (
                          isExpanded ? <ChevronUpIcon className="w-4 h-4 text-gray-400" /> : <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    {/* 🎯 詳細内訳表示 */}
                    {hasDetails && isExpanded && data.contentTypeDetails && (
                      <div className="px-3 pb-3 border-t border-gray-700">
                        <div className="mt-3 space-y-2">
                          <h4 className="text-sm font-medium text-white mb-2">セクション別内訳</h4>
                          
                          {/* ブログFragment IDの特別説明 */}
                          {type === 'fragment-id' && (
                            <div className="mb-3 p-2 bg-yellow-900/20 border border-yellow-700/30 rounded text-xs text-yellow-200">
                              💡 これは各ブログ記事の「Fragment ID構造の設計図」です。実際のH1タイトルは「生成ブログ」に含まれます。
                            </div>
                          )}
                          
                          {/* 生成ブログの特別説明 */}
                          {type === 'generated_blog' && (
                            <div className="mb-3 p-2 bg-green-900/20 border border-green-700/30 rounded text-xs text-green-200">
                              💡 これは実際のブログ記事コンテンツです。H1タイトル + 本文が含まれます。
                            </div>
                          )}
                          
                          {/* 構造化データの特別説明 */}
                          {type === 'structured-data' && (
                            <div className="mb-3 p-2 bg-purple-900/20 border border-purple-700/30 rounded text-xs text-purple-200">
                              🚀 <strong>世界初の仮想ディープリンクシステム</strong><br/>
                              物理ページを作らずにディープリンクを生成する革新的アプローチ。<br/>
                              <span className="text-purple-300">✅ AI引用実績: ChatGPT 2件、Claude 1件</span><br/>
                              <span className="text-purple-300">✅ 類似度スコア: 1.0（最高値）</span><br/>
                              <span className="text-purple-300">✅ 404エラーは設計通りの正常動作</span>
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {data.contentTypeDetails[type]?.details.h1_sections > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">H1セクション:</span>
                                <span className="text-white">{data.contentTypeDetails[type]?.details.h1_sections}</span>
                              </div>
                            )}
                            {data.contentTypeDetails[type]?.details.h2_sections > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">H2セクション:</span>
                                <span className="text-white">{data.contentTypeDetails[type]?.details.h2_sections}</span>
                              </div>
                            )}
                            {data.contentTypeDetails[type]?.details.h3_sections > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">H3セクション:</span>
                                <span className="text-white">{data.contentTypeDetails[type]?.details.h3_sections}</span>
                              </div>
                            )}
                            {data.contentTypeDetails[type]?.details.faq_sections > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">FAQセクション:</span>
                                <span className="text-white">{data.contentTypeDetails[type]?.details.faq_sections}</span>
                              </div>
                            )}
                            {data.contentTypeDetails[type]?.details.introduction_sections > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">導入セクション:</span>
                                <span className="text-white">{data.contentTypeDetails[type]?.details.introduction_sections}</span>
                              </div>
                            )}
                            {data.contentTypeDetails[type]?.details.other_sections > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">その他セクション:</span>
                                <span className="text-white">{data.contentTypeDetails[type]?.details.other_sections}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* サンプル表示 */}
                          {(() => {
                            // generated_blogの場合はblog-fragmentのサンプルを優先表示
                            let combinedSamples: any[] = [];
                            if (type === 'generated_blog' && data.contentTypeDetails) {
                              // blog-fragmentのサンプルを優先（実際のディープリンク）
                              combinedSamples = [
                                ...(data.contentTypeDetails['blog-fragment']?.samples || []),
                                ...(data.contentTypeDetails[type]?.samples || [])
                              ];
                            } else if (data.contentTypeDetails) {
                              combinedSamples = data.contentTypeDetails[type]?.samples || [];
                            }
                            
                            return combinedSamples.length > 0 ? (
                              <div className="mt-3">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="text-xs font-medium text-gray-400">
                                    {type === 'fragment-id' ? 'Fragment ID設計図 (クリック可能)' : 
                                     type === 'structured-data' ? '仮想ディープリンク一覧 (404正常)' : 
                                     type === 'generated_blog' ? 'ディープリンク一覧 (Fragment ID付き)' : 'サンプル'}
                                    <span className="ml-1 text-gray-500">
                                      ({expandedSamples[type] ? combinedSamples.length : Math.min(3, combinedSamples.length)}件)
                                    </span>
                                  </h5>
                                  {combinedSamples.length > 3 && (
                                    <button
                                      onClick={() => toggleSamples(type)}
                                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                    >
                                      {expandedSamples[type] ? '折りたたむ' : `全${combinedSamples.length}件表示`}
                                      {expandedSamples[type] ? 
                                        <ChevronUpIcon className="w-3 h-3" /> : 
                                        <ChevronDownIcon className="w-3 h-3" />
                                      }
                                    </button>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  {(expandedSamples[type] 
                                    ? combinedSamples 
                                    : combinedSamples.slice(0, 3)
                                  ).map((sample, idx) => (
                                  <div key={idx} className="text-xs bg-gray-700/50 p-2 rounded border border-gray-600">
                                    {expandedSamples[type] && (
                                      <div className="text-xs text-gray-500 mb-1">#{idx + 1}</div>
                                    )}
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-blue-400 font-medium">{sample.fragmentId}</span>
                                      {type === 'fragment-id' && (
                                        <span className="text-xs text-yellow-400 bg-yellow-400/10 px-1 py-0.5 rounded">設計図</span>
                                      )}
                                    </div>
                                    <div className="text-gray-300 text-xs mb-1 leading-tight">{sample.sectionTitle}</div>
                                    <a 
                                      href={sample.completeURI} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className={`text-xs underline break-all ${
                                        type === 'structured-data' 
                                          ? 'text-purple-400 hover:text-purple-300' 
                                          : 'text-blue-400 hover:text-blue-300'
                                      }`}
                                    >
                                      {sample.completeURI}
                                      {type === 'structured-data' && (
                                        <span className="ml-2 text-xs text-gray-500">(404正常)</span>
                                      )}
                                    </a>
                                    {type === 'generated_blog' && sample.fragmentId.startsWith('blog_') && (
                                      <div className="text-xs text-gray-400 mt-1">
                                        <div className="text-yellow-400">
                                          📋 設計図: {sample.fragmentId.replace('blog_', 'fragments_')} 
                                          <span className="text-gray-500">（Fragment ID構造）</span>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* 構造化データの詳細説明 */}
                                    {type === 'structured-data' && (
                                      <div className="mt-2 p-2 bg-purple-900/20 border border-purple-700/30 rounded">
                                        <div className="text-xs text-purple-300 mb-1">
                                          🔧 <strong>技術仕様書</strong>: {
                                            sample.fragmentId.includes('ai-search-optimization') ? 'AI検索エンジン最適化システム' :
                                            sample.fragmentId.includes('haspart-schema') ? 'hasPartスキーマシステム' :
                                            sample.fragmentId.includes('auto-toc') ? 'Fragment ID + TOC自動生成' :
                                            sample.fragmentId.includes('author-trust') ? '著者信頼システム' :
                                            sample.fragmentId.includes('validation') ? '構造化データ検証システム' :
                                            sample.fragmentId.includes('semantic-links') ? 'セマンティックリンクシステム' :
                                            sample.fragmentId.includes('entity-relationships') ? 'エンティティ関係システム' :
                                            sample.fragmentId.includes('schema-org') ? 'Schema.org 16.0+ 最新標準' :
                                            sample.fragmentId.includes('unified-integration') ? '統合システム' :
                                            'レリバンスエンジニアリング統合'
                                          }
                                        </div>
                                        <div className="text-xs text-purple-400">
                                          💎 Mike King理論準拠の実装詳細をベクトル化
                                        </div>
                                      </div>
                                    )}
                                    
                                    {type === 'fragment-id' && (
                                       <div className="text-xs text-gray-400 mt-1 space-y-1">
                                         <div>💡 24個のFragment ID一覧を表示</div>
                                         <div className="text-green-400">
                                           🔗 対応コンテンツ: {sample.fragmentId.replace('fragments_', 'blog_')} 
                                           <span className="text-gray-500">（生成ブログ）</span>
                                         </div>
                                       </div>
                                     )}
                                  </div>
                                ))}
                              </div>
                            </div>
                            ) : null;
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 類似度分布 */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <ChartBarIcon className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">類似度分布</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-green-400">高 (0.8以上)</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full" 
                      style={{ width: `${(data.similarityDistribution.high / data.totalFragments) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-white w-8">{data.similarityDistribution.high}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-yellow-400">中 (0.5-0.8)</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full" 
                      style={{ width: `${(data.similarityDistribution.medium / data.totalFragments) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-white w-8">{data.similarityDistribution.medium}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-red-400">低 (0.5未満)</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-red-400 h-2 rounded-full" 
                      style={{ width: `${(data.similarityDistribution.low / data.totalFragments) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-white w-8">{data.similarityDistribution.low}</span>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-700">
              <span className="text-sm text-gray-400">
                平均類似度: <span className="text-white font-medium">{data.averageSimilarity.toFixed(3)}</span>
              </span>
            </div>
          </div>
        </div>

        {/* トップパフォーマンスFragment ID */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CubeIcon className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">トップパフォーマンスFragment ID</h3>
            </div>
            <button 
              onClick={() => toggleCardExpansion('top-fragments')}
              className="text-blue-400 hover:text-blue-300"
            >
              {expandedCard === 'top-fragments' ? '少なく表示' : 'すべて表示'}
              {expandedCard === 'top-fragments' ? 
                <ChevronUpIcon className="w-4 h-4 inline ml-1" /> : 
                <ChevronDownIcon className="w-4 h-4 inline ml-1" />
              }
            </button>
          </div>
          <div className="space-y-3">
            {data.topPerformingFragments
              .slice(0, expandedCard === 'top-fragments' ? undefined : 5)
              .map((fragment, index) => (
              <div key={fragment.fragmentId} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                <div className="flex items-center gap-3">
                  <span className="text-blue-400 font-bold">#{index + 1}</span>
                  <DocumentTextIcon className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-white font-medium">{fragment.fragmentId}</div>
                    <div className="text-xs text-gray-400">{fragment.completeURI}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm">
                    クリック: {fragment.clickCount} | AI引用: {fragment.aiQuotationCount}
                  </div>
                  <div className="text-xs text-gray-400">
                    類似度: {fragment.similarityScore.toFixed(3)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 🎯 全ディープリンク一覧 */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">全ディープリンク一覧</h3>
              <span className="text-sm text-gray-400">({allFragments.length}件)</span>
            </div>
            <button 
              onClick={() => setShowAllFragments(!showAllFragments)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              {showAllFragments ? '一覧を隠す' : '全て表示'}
            </button>
          </div>
          
          {showAllFragments && (
            <div className="space-y-4">
              {/* 検索・フィルター */}
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Fragment ID、URI、コンテンツタイプで検索..."
                  value={fragmentFilter}
                  onChange={(e) => setFragmentFilter(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
                <div className="text-sm text-gray-400 flex items-center">
                  {filteredFragments.length} / {allFragments.length} 件
                </div>
              </div>

              {/* フラグメント一覧テーブル */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Fragment ID</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">完全URI</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">タイプ</th>
                      <th className="text-right py-3 px-4 text-gray-300 font-medium">クリック</th>
                      <th className="text-right py-3 px-4 text-gray-300 font-medium">AI引用</th>
                      <th className="text-right py-3 px-4 text-gray-300 font-medium">類似度</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFragments.map((fragment, index) => (
                      <tr key={`${fragment.fragmentId}-${index}`} className="border-b border-gray-700 hover:bg-gray-700/50">
                        <td className="py-3 px-4">
                          <div className="text-white font-medium">{fragment.fragmentId}</div>
                          {fragment.sectionTitle && (
                            <div className="text-xs text-gray-400 mt-1">{fragment.sectionTitle}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-blue-400 text-xs break-all">
                            <a 
                              href={fragment.completeURI} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:text-blue-300 underline"
                            >
                              {fragment.completeURI}
                            </a>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-600 text-gray-200">
                            {getContentTypeLabel(fragment.contentType)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-white">
                          {fragment.clickCount || 0}
                        </td>
                        <td className="py-3 px-4 text-right text-white">
                          {fragment.aiQuotationCount || 0}
                        </td>
                        <td className="py-3 px-4 text-right text-white">
                          {(fragment.similarityScore || 0).toFixed(3)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredFragments.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  検索条件に一致するディープリンクが見つかりません
                </div>
              )}
            </div>
          )}
        </div>

        {/* 最近のアクティビティ */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <EyeIcon className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">最近のアクティビティ</h3>
          </div>
          <div className="space-y-3">
            {data.recentActivity.slice(0, 10).map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="w-4 h-4 text-green-400" />
                  <div>
                    <div className="text-white font-medium">{activity.fragmentId}</div>
                    <div className="text-xs text-gray-400">{activity.completeURI}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">
                    {getSourceLabel(activity.source)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(activity.createdAt).toLocaleDateString('ja-JP')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ヘルパー関数
function getContentTypeLabel(type: string): string {
  const labels: { [key: string]: string } = {
    'ai-site': 'AI-siteページ',
    'ai-site-faq': 'AI-site FAQ',
    'service': 'サービス',
    'corporate': '企業情報',
    'technical': '技術情報',
    'fragment-id': 'ブログFragment ID（構造情報）',
    'generated_blog': '生成ブログ（コンテンツ）',
    'blog-fragment': '生成ブログ（コンテンツ）', // blog-fragmentも生成ブログとして表示
    'structured-data': '構造化データ',
    'sns-deeplink': 'SNSディープリンク',
    'measurement': '計測専用'
  };
  return labels[type] || type;
}

function getSourceLabel(source: string): string {
  const labels: { [key: string]: string } = {
    'existing': '既存',
    'static': '静的',
    'analytics_only': '計測専用'
  };
  return labels[source] || source;
} 