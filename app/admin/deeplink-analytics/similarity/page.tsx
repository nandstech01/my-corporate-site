'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusIcon } from '@heroicons/react/24/outline';

interface SimilarityTrend {
  fragment_id: string;
  complete_uri: string;
  currentSimilarity: number;
  previousSimilarity: number;
  improvementRate: number;
  trendDirection: 'up' | 'down' | 'stable';
  measurementCount: number;
  ragSourceContribution: {
    companyRAG: number;
    trendRAG: number;
    dynamicRAG: number;
  };
}

interface SimilarityTracking {
  totalFragments: number;
  averageImprovement: number;
  trendSummary: {
    improving: number;
    declining: number;
    stable: number;
  };
  fragmentTrends: SimilarityTrend[];
  timeSeriesData: Array<{
    date: string;
    averageSimilarity: number;
    measurementCount: number;
  }>;
  ragContributionAnalysis: {
    companyRAGAverage: number;
    trendRAGAverage: number;
    dynamicRAGAverage: number;
  };
  improvementSuggestions: Array<{
    fragment_id: string;
    currentScore: number;
    targetScore: number;
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export default function SimilarityTrackingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [tracking, setTracking] = useState<SimilarityTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7');
  const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({});

  // 認証チェック
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin');
    }
  }, [user, authLoading, router]);

  // データ取得
  const fetchTrackingData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/deeplink-analytics/similarity?days=${selectedPeriod}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'データの取得に失敗しました');
      }
      
      if (data.success) {
        setTracking(data.tracking);
      } else {
        throw new Error('データの取得に失敗しました');
      }
    } catch (err) {
      console.error('類似度追跡データ取得エラー:', err);
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTrackingData();
    }
  }, [user, selectedPeriod]);

  // カード展開/折りたたみ
  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  // トレンド方向のアイコン
  const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up':
        return <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />;
      case 'down':
        return <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />;
      case 'stable':
        return <MinusIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  // 優先度のカラー
  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">類似度追跡データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">類似度追跡システム</h1>
                <p className="text-sm text-gray-600">Fragment IDの類似度推移と改善分析</p>
              </div>
            </div>
            
            {/* 期間選択 */}
            <div className="flex items-center space-x-2">
              <label htmlFor="period" className="text-sm font-medium text-gray-700">
                表示期間:
              </label>
              <select
                id="period"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="7">7日間</option>
                <option value="14">14日間</option>
                <option value="30">30日間</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">エラーが発生しました</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {tracking && (
          <>
            {/* サマリーカード */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ChartBarIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">総Fragment数</dt>
                        <dd className="text-lg font-medium text-gray-900">{tracking.totalFragments}個</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

                              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ArrowTrendingUpIcon className={`h-6 w-6 ${tracking.averageImprovement >= 0 ? 'text-green-400' : 'text-red-400'}`} />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">平均改善率</dt>
                        <dd className={`text-lg font-medium ${tracking.averageImprovement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {tracking.averageImprovement >= 0 ? '+' : ''}{(tracking.averageImprovement * 100).toFixed(1)}%
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ArrowTrendingUpIcon className="h-6 w-6 text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">向上中</dt>
                        <dd className="text-lg font-medium text-green-600">{tracking.trendSummary.improving}個</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <MinusIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">安定</dt>
                        <dd className="text-lg font-medium text-gray-600">{tracking.trendSummary.stable}個</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RAG貢献度分析 */}
            <div className="bg-white shadow rounded-lg mb-8">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">RAG貢献度分析</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {(tracking.ragContributionAnalysis.companyRAGAverage * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">Company RAG</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {(tracking.ragContributionAnalysis.trendRAGAverage * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">Trend RAG</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {(tracking.ragContributionAnalysis.dynamicRAGAverage * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">Dynamic RAG</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fragment別パフォーマンス */}
            <div className="bg-white shadow rounded-lg mb-8">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Fragment別類似度推移</h3>
                <div className="space-y-4">
                  {tracking.fragmentTrends.map((trend, index) => (
                    <div key={`${trend.fragment_id}-${index}`} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-blue-600">#{trend.fragment_id}</span>
                            {getTrendIcon(trend.trendDirection)}
                            <span className="text-lg font-semibold">
                              {(trend.currentSimilarity * 100).toFixed(1)}%
                            </span>
                            <span className={`text-sm ${trend.improvementRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ({trend.improvementRate >= 0 ? '+' : ''}{(trend.improvementRate * 100).toFixed(1)}%)
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {trend.complete_uri}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">計測回数: {trend.measurementCount}回</div>
                          <button
                            onClick={() => toggleCardExpansion(`trend-${trend.fragment_id}-${index}`)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            {expandedCards[`trend-${trend.fragment_id}-${index}`] ? '詳細を隠す' : '詳細を表示'}
                          </button>
                        </div>
                      </div>
                      
                      {expandedCards[`trend-${trend.fragment_id}-${index}`] && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Company RAG:</span>
                              <span className="ml-2 text-blue-600">{(trend.ragSourceContribution.companyRAG * 100).toFixed(1)}%</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Trend RAG:</span>
                              <span className="ml-2 text-green-600">{(trend.ragSourceContribution.trendRAG * 100).toFixed(1)}%</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Dynamic RAG:</span>
                              <span className="ml-2 text-purple-600">{(trend.ragSourceContribution.dynamicRAG * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 改善提案 */}
            {tracking.improvementSuggestions.length > 0 && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">改善提案</h3>
                  <div className="space-y-4">
                    {tracking.improvementSuggestions.map((suggestion, index) => (
                      <div key={`suggestion-${suggestion.fragment_id}-${index}`} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm font-medium text-blue-600">#{suggestion.fragment_id}</span>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(suggestion.priority)}`}>
                                {suggestion.priority === 'high' ? '高' : suggestion.priority === 'medium' ? '中' : '低'}優先度
                              </span>
                            </div>
                            <div className="text-sm text-gray-700 mb-2">
                              {suggestion.suggestion}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>現在: {(suggestion.currentScore * 100).toFixed(1)}%</span>
                              <span>→</span>
                              <span>目標: {(suggestion.targetScore * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 