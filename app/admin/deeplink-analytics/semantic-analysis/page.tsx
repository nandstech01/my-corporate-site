'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  CpuChipIcon, 
  BeakerIcon, 
  ChartBarIcon, 
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  FireIcon
} from '@heroicons/react/24/outline';

// =============================================================================
// TypeScript interfaces
// =============================================================================

interface SemanticSystemComparison {
  trueSystem: {
    name: string;
    type: 'vector';
    model: string;
    dimensions: number;
    accuracy: string;
    status: 'active';
    implementation: string;
    cost: string;
  };
  falseSystem: {
    name: string;
    type: 'keyword';
    method: string;
    accuracy: string;
    status: 'legacy';
    implementation: string;
    limitations: string[];
  };
}

interface VectorSimilarityData {
  totalVectors: number;
  breakdown: {
    generatedBlog: number;
    structuredData: number;
    companyInfo: number;
    serviceInfo: number;
    fragmentId: number;
    technicalInfo: number;
  };
  performanceMetrics: {
    averageQueryTime: number;
    accuracy: string;
    improvementRate: string;
  };
}

interface CacheStatus {
  totalCachedPairs: number;
  hitRate: number;
  lastUpdated: string;
  cacheEfficiency: number;
  topPerformingPairs: Array<{
    sourceId: string;
    targetId: string;
    similarityScore: number;
    contextType: string;
    usageCount: number;
  }>;
}

interface MigrationProgress {
  phase: 'planning' | 'testing' | 'migrating' | 'completed';
  overallProgress: number;
  migratedServices: string[];
  pendingServices: string[];
  testResults: {
    vectorAccuracy: number;
    keywordAccuracy: number;
    hybridAccuracy: number;
  };
  nextSteps: string[];
}

interface SemanticAnalysisData {
  systemComparison: SemanticSystemComparison;
  vectorData: VectorSimilarityData;
  cacheStatus: CacheStatus;
  migrationProgress: MigrationProgress;
  recommendations: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    estimatedROI: string;
    implementationTime: string;
  }>;
}

// =============================================================================
// Main Component
// =============================================================================

export default function SemanticAnalysisPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<SemanticAnalysisData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'comparison' | 'cache' | 'migration'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // =============================================================================
  // Effects
  // =============================================================================

  useEffect(() => {
    if (!user) {
      router.push('/admin');
      return;
    }
    
    fetchSemanticAnalysisData();
  }, [user, router]);

  // =============================================================================
  // Data fetching
  // =============================================================================

  const fetchSemanticAnalysisData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/semantic-analysis');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        console.error('Failed to fetch semantic analysis data');
      }
    } catch (error) {
      console.error('Error fetching semantic analysis data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchSemanticAnalysisData();
    setIsRefreshing(false);
  };

  const triggerCacheRefresh = async () => {
    try {
      const response = await fetch('/api/admin/semantic-analysis/cache-refresh', {
        method: 'POST'
      });
      if (response.ok) {
        await refreshData();
      }
    } catch (error) {
      console.error('Error refreshing cache:', error);
    }
  };

  const runMigrationTest = async () => {
    try {
      const response = await fetch('/api/admin/semantic-analysis/migration-test', {
        method: 'POST'
      });
      if (response.ok) {
        await refreshData();
      }
    } catch (error) {
      console.error('Error running migration test:', error);
    }
  };

  // =============================================================================
  // Render helpers
  // =============================================================================

  const renderSystemComparison = () => {
    if (!data) return null;

    const { trueSystem, falseSystem } = data.systemComparison;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* True Semantic System */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-green-200 dark:border-green-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 flex items-center">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                真のセマンティックシステム
              </h3>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                アクティブ
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">実装</span>
                <span className="font-medium">{trueSystem.implementation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">モデル</span>
                <span className="font-medium">{trueSystem.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">次元数</span>
                <span className="font-medium">{trueSystem.dimensions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">精度向上</span>
                <span className="font-medium text-green-600">{trueSystem.accuracy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">月額コスト</span>
                <span className="font-medium">{trueSystem.cost}</span>
              </div>
            </div>
          </div>
        </div>

        {/* False Semantic System */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-yellow-200 dark:border-yellow-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-yellow-700 dark:text-yellow-300 flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                偽のセマンティックシステム
              </h3>
              <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">
                レガシー
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">実装</span>
                <span className="font-medium">{falseSystem.implementation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">手法</span>
                <span className="font-medium">{falseSystem.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">精度</span>
                <span className="font-medium text-yellow-600">{falseSystem.accuracy}</span>
              </div>
              
              <div className="mt-4">
                <span className="text-gray-600 dark:text-gray-300 text-sm">制限事項:</span>
                <ul className="mt-2 space-y-1">
                  {falseSystem.limitations.map((limitation, index) => (
                    <li key={index} className="text-sm text-gray-500 dark:text-gray-400 flex items-start">
                      <span className="text-yellow-500 mr-2">•</span>
                      {limitation}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderVectorData = () => {
    if (!data) return null;

    const { breakdown, performanceMetrics } = data.vectorData;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vector Breakdown */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2" />
              ベクトルデータ分布
            </h3>
            
            <div className="space-y-4">
              {Object.entries(breakdown).map(([key, value]) => {
                const labels: Record<string, string> = {
                  generatedBlog: '生成ブログ',
                  structuredData: '構造化データ',
                  companyInfo: '企業情報',
                  serviceInfo: 'サービス情報',
                  fragmentId: 'Fragment ID',
                  technicalInfo: '技術情報'
                };
                
                const percentage = ((value / data.vectorData.totalVectors) * 100).toFixed(1);
                
                return (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                      <span className="text-gray-700 dark:text-gray-300">{labels[key]}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{percentage}%</span>
                      <span className="font-medium">{value}個</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FireIcon className="h-5 w-5 mr-2" />
              パフォーマンス
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">平均クエリ時間</div>
                <div className="text-2xl font-bold text-blue-600">{performanceMetrics.averageQueryTime}ms</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">検索精度</div>
                <div className="text-2xl font-bold text-green-600">{performanceMetrics.accuracy}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">改善率</div>
                <div className="text-2xl font-bold text-purple-600">{performanceMetrics.improvementRate}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCacheStatus = () => {
    if (!data) return null;

    const { cacheStatus } = data;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cache Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <ClockIcon className="h-5 w-5 mr-2" />
                キャッシュ状況
              </h3>
              <button
                onClick={triggerCacheRefresh}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                更新
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">キャッシュ済みペア</span>
                <span className="font-medium">{cacheStatus.totalCachedPairs.toLocaleString()}組</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">ヒット率</span>
                <span className="font-medium text-green-600">{cacheStatus.hitRate.toFixed(1)}%</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">効率性</span>
                <span className="font-medium text-blue-600">{cacheStatus.cacheEfficiency.toFixed(1)}%</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">最終更新</span>
                <span className="font-medium">{cacheStatus.lastUpdated}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performing Pairs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              高性能ペア Top 5
            </h3>
            
            <div className="space-y-3">
              {cacheStatus.topPerformingPairs.map((pair, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {pair.sourceId} → {pair.targetId}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {pair.contextType} • {pair.usageCount}回使用
                    </div>
                  </div>
                  <div className="text-sm font-medium text-blue-600">
                    {pair.similarityScore.toFixed(3)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMigrationProgress = () => {
    if (!data) return null;

    const { migrationProgress } = data;

    return (
      <div className="space-y-6">
        {/* Progress Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <ArrowPathIcon className="h-5 w-5 mr-2" />
                移行進捗
              </h3>
              <button
                onClick={runMigrationTest}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
              >
                テスト実行
              </button>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span>進捗</span>
                <span>{migrationProgress.overallProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${migrationProgress.overallProgress}%` }}
                ></div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">移行済み</div>
                <div className="text-xl font-bold text-green-600">{migrationProgress.migratedServices.length}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">待機中</div>
                <div className="text-xl font-bold text-yellow-600">{migrationProgress.pendingServices.length}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">フェーズ</div>
                <div className="text-xl font-bold text-blue-600 capitalize">{migrationProgress.phase}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              テスト結果比較
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">ベクトル精度</div>
                <div className="text-2xl font-bold text-green-600">{migrationProgress.testResults.vectorAccuracy}%</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">キーワード精度</div>
                <div className="text-2xl font-bold text-yellow-600">{migrationProgress.testResults.keywordAccuracy}%</div>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">ハイブリッド精度</div>
                <div className="text-2xl font-bold text-blue-600">{migrationProgress.testResults.hybridAccuracy}%</div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">次のステップ</h4>
              <ul className="space-y-2">
                {migrationProgress.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRecommendations = () => {
    if (!data) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <BeakerIcon className="h-5 w-5 mr-2" />
            推奨実装
          </h3>
          
          <div className="space-y-4">
            {data.recommendations.map((rec, index) => {
              const priorityColors = {
                high: 'border-red-200 bg-red-50 dark:bg-red-900/20',
                medium: 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20',
                low: 'border-green-200 bg-green-50 dark:bg-green-900/20'
              };
              
              return (
                <div key={index} className={`border rounded-lg p-4 ${priorityColors[rec.priority]}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{rec.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rec.description}</p>
                      
                      <div className="flex items-center space-x-4 mt-3 text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          ROI: <span className="font-medium text-green-600">{rec.estimatedROI}</span>
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          実装時間: <span className="font-medium text-blue-600">{rec.implementationTime}</span>
                        </span>
                      </div>
                    </div>
                    
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                      rec.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {rec.priority}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // =============================================================================
  // Main Render
  // =============================================================================

  if (!user) {
    return <div>Loading...</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">セマンティック分析データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <CpuChipIcon className="h-8 w-8 mr-3 text-blue-600" />
              セマンティック類似度システム分析
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              真偽セマンティックシステムの比較・分析・最適化管理
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isRefreshing ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  更新中
                </>
              ) : (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  データ更新
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'overview', label: '概要', icon: ChartBarIcon },
                { key: 'comparison', label: 'システム比較', icon: BeakerIcon },
                { key: 'cache', label: 'キャッシュ状況', icon: ClockIcon },
                { key: 'migration', label: '移行進捗', icon: ArrowPathIcon }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                    activeTab === key
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <>
              {renderVectorData()}
              {renderRecommendations()}
            </>
          )}
          
          {activeTab === 'comparison' && renderSystemComparison()}
          {activeTab === 'cache' && renderCacheStatus()}
          {activeTab === 'migration' && renderMigrationProgress()}
        </div>
      </div>
    </div>
  );
} 