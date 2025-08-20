'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  ShareIcon,
  PlayIcon,
  LinkIcon,
  ChartBarIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface SNSIntegrationData {
  totalSNSLinks: number;
  totalVideoEmbeddings: number;
  totalLINEShares: number;
  totalConversions: number;
  platformBreakdown: {
    youtube: number;
    tiktok: number;
    instagram: number;
    line: number;
    x: number;
  };
  recentSNSActivities: Array<{
    id: string;
    fragment_id: string;
    complete_uri: string;
    platform: string;
    original_url: string;
    deeplink_url: string;
    click_count: number;
    conversion_count: number;
    created_at: string;
  }>;
  conversionAnalysis: Array<{
    platform: string;
    total_clicks: number;
    total_conversions: number;
    conversion_rate: number;
    average_quality: number;
  }>;
  topPerformingContent: Array<{
    fragment_id: string;
    complete_uri: string;
    platform: string;
    performance_score: number;
    total_engagement: number;
  }>;
}

interface URLConversionResult {
  originalUrl: string;
  deeplinkUrl: string;
  fragmentId: string;
  platform: string;
  createdAt: string;
}

export default function SNSIntegrationPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [integration, setIntegration] = useState<SNSIntegrationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({});
  
  // URL変換フォーム
  const [showUrlConverter, setShowUrlConverter] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [platformInput, setPlatformInput] = useState('auto');
  const [fragmentIdInput, setFragmentIdInput] = useState('');
  const [conversionResult, setConversionResult] = useState<URLConversionResult | null>(null);
  const [converting, setConverting] = useState(false);

  // 認証チェック
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin');
    }
  }, [user, authLoading, router]);

  // データ取得
  const fetchIntegrationData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        days: selectedPeriod,
        ...(selectedPlatform !== 'all' && { platform: selectedPlatform })
      });
      
      const response = await fetch(`/api/deeplink-analytics/sns-integration?${params}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'データの取得に失敗しました');
      }
      
      if (data.success) {
        setIntegration(data.integration);
      } else {
        throw new Error('データの取得に失敗しました');
      }
    } catch (err) {
      console.error('SNS統合データ取得エラー:', err);
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchIntegrationData();
    }
  }, [user, selectedPeriod, selectedPlatform]);

  // URL変換処理
  const handleUrlConversion = async () => {
    if (!urlInput.trim()) return;
    
    try {
      setConverting(true);
      setError(null);
      
      const response = await fetch('/api/deeplink-analytics/sns-integration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalUrl: urlInput,
          platform: platformInput === 'auto' ? undefined : platformInput,
          fragmentId: fragmentIdInput || undefined
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'URL変換に失敗しました');
      }
      
      if (data.success) {
        setConversionResult(data.conversion);
        setUrlInput('');
        setFragmentIdInput('');
        // データを再取得して最新状態に更新
        fetchIntegrationData();
      } else {
        throw new Error('URL変換に失敗しました');
      }
    } catch (err) {
      console.error('URL変換エラー:', err);
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setConverting(false);
    }
  };

  // カード展開/折りたたみ
  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  // プラットフォームアイコン
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return <PlayIcon className="h-5 w-5 text-red-500" />;
      case 'tiktok':
      case 'instagram':
        return <ShareIcon className="h-5 w-5 text-purple-500" />;
      case 'line':
        return <ShareIcon className="h-5 w-5 text-green-500" />;
      case 'x':
        return <ShareIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <LinkIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  // プラットフォーム名の日本語化
  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'youtube': return 'YouTube';
      case 'tiktok': return 'TikTok';
      case 'instagram': return 'Instagram';
      case 'line': return 'LINE';
      case 'x': return 'X (旧Twitter)';
      default: return 'その他';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">SNS統合データを読み込み中...</p>
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
              <ShareIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SNS・動画統合システム</h1>
                <p className="text-sm text-gray-600">SNS URL → ディープリンク変換・分析</p>
              </div>
            </div>
            
            {/* フィルター・アクション */}
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
                <label htmlFor="platform" className="text-sm font-medium text-gray-700">
                  プラットフォーム:
                </label>
                <select
                  id="platform"
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="all">全て</option>
                  <option value="youtube">YouTube</option>
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="line">LINE</option>
                  <option value="x">X (旧Twitter)</option>
                </select>
              </div>
              
              <button
                onClick={() => setShowUrlConverter(!showUrlConverter)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                URL変換
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* エラー表示 */}
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

        {/* URL変換成功表示 */}
        {conversionResult && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-800">URL変換が完了しました</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p><strong>変換後URL:</strong> <a href={conversionResult.deeplinkUrl} target="_blank" rel="noopener noreferrer" className="underline">{conversionResult.deeplinkUrl}</a></p>
                  <p><strong>Fragment ID:</strong> {conversionResult.fragmentId}</p>
                  <p><strong>プラットフォーム:</strong> {getPlatformName(conversionResult.platform)}</p>
                </div>
              </div>
              <button
                onClick={() => setConversionResult(null)}
                className="text-green-400 hover:text-green-600"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* URL変換フォーム */}
        {showUrlConverter && (
          <div className="mb-8 bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">SNS URL → ディープリンク変換</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="url-input" className="block text-sm font-medium text-gray-700">
                    変換するURL
                  </label>
                                      <input
                      type="url"
                      id="url-input"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://youtube.com/watch?v=... または https://x.com/user/status/..."
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="platform-input" className="block text-sm font-medium text-gray-700">
                      プラットフォーム
                    </label>
                    <select
                      id="platform-input"
                      value={platformInput}
                      onChange={(e) => setPlatformInput(e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="auto">自動検出</option>
                      <option value="youtube">YouTube</option>
                      <option value="tiktok">TikTok</option>
                      <option value="instagram">Instagram</option>
                      <option value="line">LINE</option>
                      <option value="x">X (旧Twitter)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="fragment-input" className="block text-sm font-medium text-gray-700">
                      Fragment ID（オプション）
                    </label>
                    <input
                      type="text"
                      id="fragment-input"
                      value={fragmentIdInput}
                      onChange={(e) => setFragmentIdInput(e.target.value)}
                      placeholder="カスタムFragment ID"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowUrlConverter(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleUrlConversion}
                    disabled={!urlInput.trim() || converting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {converting ? '変換中...' : '変換実行'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {integration && (
          <>
            {/* サマリーカード */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <LinkIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">総SNSリンク</dt>
                        <dd className="text-lg font-medium text-gray-900">{integration.totalSNSLinks}件</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <PlayIcon className="h-6 w-6 text-red-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">動画埋め込み</dt>
                        <dd className="text-lg font-medium text-red-600">{integration.totalVideoEmbeddings}件</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ShareIcon className="h-6 w-6 text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">LINE共有</dt>
                        <dd className="text-lg font-medium text-green-600">{integration.totalLINEShares}件</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ChartBarIcon className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">総コンバージョン</dt>
                        <dd className="text-lg font-medium text-blue-600">{integration.totalConversions}件</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* プラットフォーム別内訳 */}
            <div className="bg-white shadow rounded-lg mb-8">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">プラットフォーム別内訳</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(integration.platformBreakdown).map(([platform, count]) => (
                    <div key={platform} className="text-center">
                      <div className="flex justify-center mb-2">
                        {getPlatformIcon(platform)}
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{count}</div>
                      <div className="text-sm text-gray-500">{getPlatformName(platform)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 最新SNSアクティビティ */}
            <div className="bg-white shadow rounded-lg mb-8">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">最新SNSアクティビティ</h3>
                <div className="space-y-4">
                  {integration.recentSNSActivities.map((activity, index) => (
                    <div key={activity.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {getPlatformIcon(activity.platform)}
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-blue-600">#{activity.fragment_id}</span>
                              <span className="text-sm text-gray-500">{getPlatformName(activity.platform)}</span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {activity.complete_uri}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            クリック: {activity.click_count}回 | コンバージョン: {activity.conversion_count}回
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(activity.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* コンバージョン分析 */}
            {integration.conversionAnalysis.length > 0 && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">プラットフォーム別コンバージョン分析</h3>
                  <div className="space-y-4">
                    {integration.conversionAnalysis.map((analysis, index) => (
                      <div key={`analysis-${index}`} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {getPlatformIcon(analysis.platform)}
                            <div>
                              <div className="text-lg font-medium text-gray-900">
                                {getPlatformName(analysis.platform)}
                              </div>
                              <div className="text-sm text-gray-500">
                                品質スコア: {(analysis.average_quality * 100).toFixed(1)}%
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-blue-600">
                              {(analysis.conversion_rate * 100).toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-500">
                              {analysis.total_clicks}クリック → {analysis.total_conversions}CV
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