'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  ChatBubbleLeftRightIcon, 
  StarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  MinusIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface AIQuotationAnalytics {
  totalQuotations: number;
  averageQualityScore: number;
  quotationsByEngine: { [engine: string]: number };
  quotationsByType: { [type: string]: number };
  qualityDistribution: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
  };
  fragmentPerformance: Array<{
    fragment_id: string;
    complete_uri: string;
    quotation_count: number;
    average_quality: number;
    best_engine: string;
    latest_quotation: string;
  }>;
  engineComparison: Array<{
    ai_engine: string;
    quotation_count: number;
    average_quality: number;
    quality_trend: 'up' | 'down' | 'stable';
  }>;
  recentQuotations: Array<{
    fragment_id: string;
    complete_uri: string;
    ai_engine: string;
    quotation_context: string;
    quality_score: number;
    quotation_type: string;
    detected_at: string;
  }>;
  contextAnalysis: Array<{
    context_keyword: string;
    frequency: number;
    average_quality: number;
  }>;
}

export default function AIQuotationAnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [analytics, setAnalytics] = useState<AIQuotationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedEngine, setSelectedEngine] = useState('all');
  const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({});

  // 認証チェック
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin');
    }
  }, [user, authLoading, router]);

  // データ取得
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        days: selectedPeriod,
        ...(selectedEngine !== 'all' && { ai_engine: selectedEngine })
      });
      
      const response = await fetch(`/api/deeplink-analytics/quotations?${params}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'データの取得に失敗しました');
      }
      
      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        throw new Error('データの取得に失敗しました');
      }
    } catch (err) {
      console.error('AI引用分析データ取得エラー:', err);
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user, selectedPeriod, selectedEngine]);

  // カード展開/折りたたみ
  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  // 品質スコアの色
  const getQualityColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.7) return 'text-blue-600';
    if (score >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 品質スコアのラベル
  const getQualityLabel = (score: number) => {
    if (score >= 0.9) return '優秀';
    if (score >= 0.7) return '良好';
    if (score >= 0.5) return '普通';
    return '要改善';
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

  // 引用タイプの色
  const getQuotationTypeColor = (type: string) => {
    switch (type) {
      case 'citation':
        return 'bg-blue-100 text-blue-800';
      case 'reference':
        return 'bg-green-100 text-green-800';
      case 'mention':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">AI引用分析データを読み込み中...</p>
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
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI引用計測システム</h1>
                <p className="text-sm text-gray-600">AI検索エンジンによるFragment ID引用分析</p>
              </div>
            </div>
            
            {/* フィルター */}
            <div className="flex items-center space-x-4">
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
                  <option value="90">90日間</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <label htmlFor="engine" className="text-sm font-medium text-gray-700">
                  AIエンジン:
                </label>
                <select
                  id="engine"
                  value={selectedEngine}
                  onChange={(e) => setSelectedEngine(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="all">全て</option>
                  <option value="ChatGPT">ChatGPT</option>
                  <option value="Claude">Claude</option>
                  <option value="Perplexity">Perplexity</option>
                  <option value="Gemini">Gemini</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">エラーが発生しました</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {analytics && (
          <>
            {/* サマリーカード */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ChatBubbleLeftRightIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">総引用数</dt>
                        <dd className="text-lg font-medium text-gray-900">{analytics.totalQuotations}件</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <StarIcon className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">平均品質スコア</dt>
                        <dd className={`text-lg font-medium ${getQualityColor(analytics.averageQualityScore)}`}>
                          {(analytics.averageQualityScore * 100).toFixed(1)}%
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
                      <StarIcon className="h-6 w-6 text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">優秀品質</dt>
                        <dd className="text-lg font-medium text-green-600">{analytics.qualityDistribution.excellent}件</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ClockIcon className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">AIエンジン数</dt>
                        <dd className="text-lg font-medium text-blue-600">
                          {Object.keys(analytics.quotationsByEngine).length}種類
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* エンジン比較分析 */}
            <div className="bg-white shadow rounded-lg mb-8">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">AIエンジン比較分析</h3>
                <div className="space-y-4">
                  {analytics.engineComparison.map((engine, index) => (
                    <div key={engine.ai_engine} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {engine.ai_engine.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">{engine.ai_engine}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>引用数: {engine.quotation_count}件</span>
                              <span>品質: {(engine.average_quality * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getTrendIcon(engine.quality_trend)}
                          <span className={`text-sm font-medium ${
                            engine.quality_trend === 'up' ? 'text-green-600' :
                            engine.quality_trend === 'down' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {engine.quality_trend === 'up' ? '向上' :
                             engine.quality_trend === 'down' ? '低下' : '安定'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Fragment別パフォーマンス */}
            <div className="bg-white shadow rounded-lg mb-8">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Fragment別引用パフォーマンス</h3>
                <div className="space-y-4">
                  {analytics.fragmentPerformance.map((fragment, index) => (
                    <div key={`${fragment.fragment_id}-${index}`} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-medium text-blue-600">#{fragment.fragment_id}</span>
                            <span className="text-lg font-semibold">{fragment.quotation_count}件</span>
                            <span className={`text-sm font-medium ${getQualityColor(fragment.average_quality)}`}>
                              ({(fragment.average_quality * 100).toFixed(1)}%)
                            </span>
                            <span className="text-xs text-gray-500">
                              最高評価: {fragment.best_engine}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {fragment.complete_uri}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">
                            最新引用: {new Date(fragment.latest_quotation).toLocaleDateString()}
                          </div>
                          <button
                            onClick={() => toggleCardExpansion(`fragment-${fragment.fragment_id}-${index}`)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            {expandedCards[`fragment-${fragment.fragment_id}-${index}`] ? '詳細を隠す' : '詳細を表示'}
                          </button>
                        </div>
                      </div>
                      
                      {expandedCards[`fragment-${fragment.fragment_id}-${index}`] && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="text-sm text-gray-600">
                            <p><strong>品質評価:</strong> {getQualityLabel(fragment.average_quality)}</p>
                            <p><strong>推奨改善:</strong> 
                              {fragment.average_quality < 0.7 ? 
                                'コンテンツの質向上とRAGデータの拡充を推奨します' :
                                '現在のパフォーマンスを維持してください'
                              }
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 最新引用フィード */}
            <div className="bg-white shadow rounded-lg mb-8">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">最新AI引用フィード</h3>
                <div className="space-y-4">
                  {analytics.recentQuotations.map((quotation, index) => (
                    <div key={`quotation-${index}`} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-medium text-blue-600">#{quotation.fragment_id}</span>
                            <span className="text-sm font-medium text-gray-900">{quotation.ai_engine}</span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getQuotationTypeColor(quotation.quotation_type)}`}>
                              {quotation.quotation_type}
                            </span>
                            <span className={`text-sm font-medium ${getQualityColor(quotation.quality_score)}`}>
                              {(quotation.quality_score * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="text-sm text-gray-700 mb-2">
                            {quotation.quotation_context}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(quotation.detected_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* コンテキスト分析 */}
            {analytics.contextAnalysis.length > 0 && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">引用コンテキスト分析</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analytics.contextAnalysis.map((context, index) => (
                      <div key={`context-${index}`} className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {context.context_keyword}
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>出現: {context.frequency}回</span>
                          <span className={getQualityColor(context.average_quality)}>
                            品質: {(context.average_quality * 100).toFixed(0)}%
                          </span>
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