'use client';

import { useState, useEffect } from 'react';
import { useAIDetectionStats } from '../../../../components/common/AIDetectionTracker';

interface DetectionStats {
  totalDetections: number;
  byEngine: Record<string, number>;
  byConfidence: {
    high: number;
    medium: number;
    low: number;
  };
  recentDetections: Array<{
    id: string;
    fragment_id: string;
    complete_uri: string;
    ai_engine: string;
    quotation_context: string;
    quotation_quality_score: number;
    detected_at: string;
  }>;
}

export default function AIDetectionPage() {
  const [stats, setStats] = useState<DetectionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(7);
  const { fetchStats } = useAIDetectionStats();

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchStats(selectedPeriod);
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [selectedPeriod]);

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.8) return { label: '高信頼度', color: 'text-green-400' };
    if (score >= 0.5) return { label: '中信頼度', color: 'text-yellow-400' };
    return { label: '低信頼度', color: 'text-red-400' };
  };

  const getEngineIcon = (engine: string) => {
    switch (engine.toLowerCase()) {
      case 'chatgpt': return '🤖';
      case 'google ai': return '🔍';
      case 'claude': return '🎭';
      case 'perplexity': return '🔮';
      case 'copilot': return '💼';
      default: return '🤖';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3">AI引用検出統計を読み込み中...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-400 mb-2">エラーが発生しました</h2>
            <p className="text-red-300">{error}</p>
            <button 
              onClick={loadStats}
              className="mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
            >
              再試行
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🤖 AI検索エンジンアクセス検出システム</h1>
          <p className="text-gray-400">
            User-AgentとReferrerを使用した無料のAI検索エンジンからのアクセス検出システム
          </p>
        </div>

        {/* 期間選択 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            表示期間
          </label>
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(Number(e.target.value))}
            className="bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={1}>過去24時間</option>
            <option value={7}>過去7日間</option>
            <option value={30}>過去30日間</option>
            <option value={90}>過去90日間</option>
          </select>
        </div>

        {/* 統計サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-2">総検出数</h3>
            <p className="text-3xl font-bold text-blue-400">{stats?.totalDetections || 0}</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-2">高信頼度検出</h3>
            <p className="text-3xl font-bold text-green-400">{stats?.byConfidence.high || 0}</p>
            <p className="text-sm text-gray-400">信頼度 ≥ 80%</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-2">中信頼度検出</h3>
            <p className="text-3xl font-bold text-yellow-400">{stats?.byConfidence.medium || 0}</p>
            <p className="text-sm text-gray-400">信頼度 50-80%</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-2">低信頼度検出</h3>
            <p className="text-3xl font-bold text-red-400">{stats?.byConfidence.low || 0}</p>
            <p className="text-sm text-gray-400">信頼度 30-50%</p>
          </div>
        </div>

        {/* エンジン別統計 */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8">
          <h2 className="text-xl font-bold mb-4">🔍 AI検索エンジン別統計</h2>
          {stats && Object.keys(stats.byEngine).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(stats.byEngine).map(([engine, count]) => (
                <div key={engine} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{getEngineIcon(engine)}</span>
                      <span className="font-medium">{engine}</span>
                    </div>
                    <span className="text-xl font-bold text-blue-400">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">まだAI引用が検出されていません</p>
          )}
        </div>

        {/* 最近の検出履歴 */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-bold mb-4">📋 最近の検出履歴</h2>
          {stats && stats.recentDetections.length > 0 ? (
            <div className="space-y-4">
              {stats.recentDetections.map((detection) => {
                const confidence = getConfidenceLabel(detection.quotation_quality_score);
                return (
                  <div key={detection.id} className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        <span className="text-xl mr-2">{getEngineIcon(detection.ai_engine)}</span>
                        <div>
                          <span className="font-medium text-white">{detection.ai_engine}</span>
                          <span className={`ml-2 text-sm ${confidence.color}`}>
                            {confidence.label} ({(detection.quotation_quality_score * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-400">
                        {new Date(detection.detected_at).toLocaleString('ja-JP')}
                      </span>
                    </div>
                    
                    <div className="mb-2">
                      <span className="text-sm text-gray-400">Fragment ID: </span>
                      <code className="bg-gray-600 px-2 py-1 rounded text-sm text-blue-300">
                        {detection.fragment_id}
                      </code>
                    </div>
                    
                    <div className="mb-2">
                      <span className="text-sm text-gray-400">URL: </span>
                      <a 
                        href={detection.complete_uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm break-all"
                      >
                        {detection.complete_uri}
                      </a>
                    </div>
                    
                    <div>
                      <span className="text-sm text-gray-400">検出詳細: </span>
                      <span className="text-sm text-gray-300">{detection.quotation_context}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400">まだ検出履歴がありません</p>
          )}
        </div>

        {/* 使用方法説明 */}
        <div className="mt-8 bg-blue-900/20 border border-blue-700/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-blue-400 mb-4">💡 システムの仕組み</h2>
          <div className="space-y-3 text-sm text-gray-300">
            <p><strong>🆓 完全無料:</strong> 外部APIを使わず、既存のWebアクセスログのみを活用</p>
            <p><strong>🎯 自動検出:</strong> User-AgentとReferrerでAI検索エンジンを識別</p>
            <p><strong>📊 詳細分析:</strong> 検出方法、信頼度、エンジン別の詳細統計</p>
            <p><strong>⚡ リアルタイム:</strong> ページ読み込み時に自動でAI引用を検出・記録</p>
          </div>
        </div>
      </div>
    </div>
  );
} 