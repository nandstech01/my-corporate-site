'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LightBulbIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

// 最適化提案データの型定義
interface OptimizationSuggestion {
  id: string;
  type: 'similarity' | 'fragment_id' | 'ai_quotation' | 'performance';
  priority: 'high' | 'medium' | 'low';
  fragment_id: string;
  complete_uri: string;
  current_score: number;
  target_score: number;
  improvement_potential: number;
  suggestion_title: string;
  suggestion_description: string;
  action_items: string[];
  estimated_impact: string;
  implementation_difficulty: 'easy' | 'medium' | 'hard';
  estimated_time: string;
}

interface OptimizationAnalysis {
  totalSuggestions: number;
  highPrioritySuggestions: number;
  totalImprovementPotential: number;
  suggestionsByType: {
    similarity: number;
    fragment_id: number;
    ai_quotation: number;
    performance: number;
  };
  topSuggestions: OptimizationSuggestion[];
  quickWins: OptimizationSuggestion[];
  longTermImprovements: OptimizationSuggestion[];
  automationOpportunities: Array<{
    area: string;
    description: string;
    potential_savings: string;
    automation_complexity: 'low' | 'medium' | 'high';
  }>;
}

export default function OptimizationPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [optimizationData, setOptimizationData] = useState<OptimizationAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'all' | 'quick-wins' | 'long-term' | 'automation'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'similarity' | 'fragment_id' | 'ai_quotation' | 'performance'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // 認証チェック
  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin');
      return;
    }
  }, [user, loading, router]);

  // データ取得
  const fetchOptimizationData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        limit: '50'
      });
      
      if (priorityFilter !== 'all') {
        queryParams.append('priority', priorityFilter);
      }
      
      if (typeFilter !== 'all') {
        queryParams.append('type', typeFilter);
      }

      const response = await fetch(`/api/deeplink-analytics/optimization?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setOptimizationData(data.analysis);
      } else {
        setError(data.error || '最適化データの取得に失敗しました');
      }
    } catch (error) {
      console.error('最適化データ取得エラー:', error);
      setError('最適化データの取得中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOptimizationData();
    }
  }, [user, priorityFilter, typeFilter]);

  // カードの展開/折りたたみ
  const toggleCardExpansion = (cardId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
  };

  // 優先度に応じた色とアイコン
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          badge: 'bg-red-100 text-red-800',
          icon: ExclamationTriangleIcon
        };
      case 'medium':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          badge: 'bg-yellow-100 text-yellow-800',
          icon: ClockIcon
        };
      case 'low':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          badge: 'bg-green-100 text-green-800',
          icon: CheckCircleIcon
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          badge: 'bg-gray-100 text-gray-800',
          icon: CogIcon
        };
    }
  };

  // タイプに応じた色
  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'similarity':
        return 'bg-blue-100 text-blue-800';
      case 'fragment_id':
        return 'bg-purple-100 text-purple-800';
      case 'ai_quotation':
        return 'bg-indigo-100 text-indigo-800';
      case 'performance':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 難易度に応じた色
  const getDifficultyStyle = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // タブごとのデータ取得
  const getTabData = () => {
    if (!optimizationData) return [];
    
    switch (activeTab) {
      case 'quick-wins':
        return optimizationData.quickWins;
      case 'long-term':
        return optimizationData.longTermImprovements;
      case 'automation':
        return [];
      default:
        return optimizationData.topSuggestions;
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <ArrowPathIcon className="h-5 w-5 animate-spin text-blue-500" />
          <span className="text-gray-600">最適化データを読み込み中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200">
          <div className="flex items-center space-x-2 text-red-600">
            <ExclamationTriangleIcon className="h-5 w-5" />
            <span>エラー: {error}</span>
          </div>
          <button
            onClick={fetchOptimizationData}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <LightBulbIcon className="h-8 w-8 mr-3 text-yellow-500" />
            自動最適化提案
          </h1>
          <p className="mt-2 text-gray-600">
            AI分析による具体的な改善提案とアクションプランを確認できます
          </p>
        </div>

        {/* 統計カード */}
        {optimizationData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <LightBulbIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">総提案数</p>
                  <p className="text-2xl font-bold text-gray-900">{optimizationData.totalSuggestions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">高優先度</p>
                  <p className="text-2xl font-bold text-gray-900">{optimizationData.highPrioritySuggestions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">クイックウィン</p>
                  <p className="text-2xl font-bold text-gray-900">{optimizationData.quickWins.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CogIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">改善ポテンシャル</p>
                  <p className="text-2xl font-bold text-gray-900">{optimizationData.totalImprovementPotential.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* タブとフィルター */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-between px-6 py-4">
              <nav className="flex space-x-8">
                {[
                  { key: 'all', label: '全提案', count: optimizationData?.totalSuggestions || 0 },
                  { key: 'quick-wins', label: 'クイックウィン', count: optimizationData?.quickWins.length || 0 },
                  { key: 'long-term', label: '長期改善', count: optimizationData?.longTermImprovements.length || 0 },
                  { key: 'automation', label: '自動化機会', count: optimizationData?.automationOpportunities.length || 0 }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.key
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </nav>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                <FunnelIcon className="h-4 w-4" />
                <span>フィルター</span>
              </button>
            </div>

            {/* フィルター */}
            {showFilters && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      優先度
                    </label>
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">すべて</option>
                      <option value="high">高優先度</option>
                      <option value="medium">中優先度</option>
                      <option value="low">低優先度</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      タイプ
                    </label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">すべて</option>
                      <option value="similarity">類似度</option>
                      <option value="fragment_id">Fragment ID</option>
                      <option value="ai_quotation">AI引用</option>
                      <option value="performance">パフォーマンス</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* コンテンツエリア */}
          <div className="p-6">
            {activeTab === 'automation' ? (
              // 自動化機会の表示
              <div className="space-y-4">
                {optimizationData?.automationOpportunities.map((opportunity, index) => (
                  <div
                    key={index}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">
                          {opportunity.area}
                        </h3>
                        <p className="text-blue-700 mb-3">
                          {opportunity.description}
                        </p>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-blue-600">
                            💰 {opportunity.potential_savings}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            opportunity.automation_complexity === 'low' ? 'bg-green-100 text-green-800' :
                            opportunity.automation_complexity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {opportunity.automation_complexity === 'low' ? '簡単' :
                             opportunity.automation_complexity === 'medium' ? '中程度' : '複雑'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // 提案リストの表示
              <div className="space-y-4">
                {getTabData().map((suggestion) => {
                  const priorityStyle = getPriorityStyle(suggestion.priority);
                  const PriorityIcon = priorityStyle.icon;
                  const isExpanded = expandedCards.has(suggestion.id);

                  return (
                    <div
                      key={suggestion.id}
                      className={`${priorityStyle.bg} ${priorityStyle.border} border rounded-lg p-4 transition-all duration-200`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <PriorityIcon className={`h-5 w-5 ${priorityStyle.text}`} />
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityStyle.badge}`}>
                              {suggestion.priority === 'high' ? '高優先度' :
                               suggestion.priority === 'medium' ? '中優先度' : '低優先度'}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeStyle(suggestion.type)}`}>
                              {suggestion.type === 'similarity' ? '類似度' :
                               suggestion.type === 'fragment_id' ? 'Fragment ID' :
                               suggestion.type === 'ai_quotation' ? 'AI引用' : 'パフォーマンス'}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyStyle(suggestion.implementation_difficulty)}`}>
                              {suggestion.implementation_difficulty === 'easy' ? '簡単' :
                               suggestion.implementation_difficulty === 'medium' ? '中程度' : '困難'}
                            </span>
                          </div>

                          <h3 className={`text-lg font-semibold ${priorityStyle.text} mb-2`}>
                            {suggestion.suggestion_title}
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <div>
                              <span className="text-sm text-gray-500">Fragment ID:</span>
                              <p className="font-mono text-sm text-gray-700">{suggestion.fragment_id}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">現在スコア:</span>
                              <p className="text-sm font-medium text-gray-900">
                                {(suggestion.current_score * 100).toFixed(1)}%
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">改善ポテンシャル:</span>
                              <p className="text-sm font-medium text-green-600">
                                +{(suggestion.improvement_potential * 100).toFixed(1)}%
                              </p>
                            </div>
                          </div>

                          <p className={`${priorityStyle.text} mb-3`}>
                            {suggestion.suggestion_description}
                          </p>

                          {isExpanded && (
                            <div className="mt-4 space-y-4">
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2">アクションアイテム:</h4>
                                <ul className="space-y-1">
                                  {suggestion.action_items.map((item, index) => (
                                    <li key={index} className="flex items-start space-x-2">
                                      <span className="text-blue-500 mt-1">•</span>
                                      <span className="text-gray-700">{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <span className="text-sm text-gray-500">予想効果:</span>
                                  <p className="text-sm text-gray-700">{suggestion.estimated_impact}</p>
                                </div>
                                <div>
                                  <span className="text-sm text-gray-500">実装期間:</span>
                                  <p className="text-sm text-gray-700">{suggestion.estimated_time}</p>
                                </div>
                              </div>

                              <div className="pt-3 border-t border-gray-200">
                                <span className="text-sm text-gray-500">Complete URI:</span>
                                <p className="text-sm font-mono text-blue-600 break-all">
                                  {suggestion.complete_uri}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => toggleCardExpansion(suggestion.id)}
                          className={`ml-4 p-2 rounded-lg ${priorityStyle.text} hover:bg-white hover:bg-opacity-50 transition-colors`}
                        >
                          {isExpanded ? (
                            <ChevronUpIcon className="h-5 w-5" />
                          ) : (
                            <ChevronDownIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {getTabData().length === 0 && (
                  <div className="text-center py-8">
                    <LightBulbIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">提案がありません</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      現在の設定では表示する提案がありません。フィルターを調整してください。
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 