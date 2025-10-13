'use client';

import { useState } from 'react';
import { TrashIcon, ClockIcon, DocumentTextIcon, GlobeAltIcon, PlayIcon } from '@heroicons/react/24/outline';

interface CleanupStats {
  trend_vectors: {
    total_before: number;
    deleted: number;
    remaining: number;
  };
  youtube_vectors: {
    total_before: number;
    deleted: number;
    remaining: number;
  };
  company_vectors: {
    total_before: number;
    deleted: number;
    remaining: number;
  };
}

interface PreviewData {
  preview: boolean;
  deletion_targets: {
    trend_vectors: number;
    youtube_vectors: number;
    company_vectors: number;
  };
  thresholds: {
    trend: string;
    youtube: string;
    company: string;
  };
  total_targets: number;
}

export default function RAGCleanupPage() {
  const [cleanupForm, setCleanupForm] = useState({
    trend_days: 0,    // トレンドニュースは0日（即座削除・使い捨て）
    youtube_days: 90, // YouTube動画は90日で削除
    company_days: 365 // 生成記事は365日で削除
  });
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [cleanupStats, setCleanupStats] = useState<CleanupStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  // 削除対象のプレビュー
  const loadPreview = async () => {
    setPreviewLoading(true);
    setPreview(null); // 既存のプレビューをクリア
    
    try {
      // キャッシュバスターを追加して確実に最新データを取得
      const params = new URLSearchParams({
        trend_days: cleanupForm.trend_days.toString(),
        youtube_days: cleanupForm.youtube_days.toString(),
        company_days: cleanupForm.company_days.toString(),
        _t: Date.now().toString() // キャッシュバスター
      });

      const response = await fetch(
        `/api/cleanup-old-rag?${params}`,
        {
          cache: 'no-cache', // キャッシュを無効化
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setPreview(data);
        
        // デバッグ用ログ
        console.log('プレビューデータ取得:', {
          trend_vectors: data.deletion_targets.trend_vectors,
          youtube_vectors: data.deletion_targets.youtube_vectors,
          company_vectors: data.deletion_targets.company_vectors,
          total: data.total_targets,
          timestamp: data.timestamp
        });
      } else {
        throw new Error('プレビューデータの取得に失敗しました');
      }
    } catch (error) {
      console.error('プレビューエラー:', error);
      alert('プレビューでエラーが発生しました');
    } finally {
      setPreviewLoading(false);
    }
  };

  // 実際の削除実行
  const executeCleanup = async (dryRun: boolean = false) => {
    if (!dryRun && !confirm('本当に古いRAGデータを削除しますか？この操作は元に戻せません。')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/cleanup-old-rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dry_run: dryRun,
          trend_days: cleanupForm.trend_days,
          youtube_days: cleanupForm.youtube_days,
          company_days: cleanupForm.company_days
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCleanupStats(data.stats);
        
        // 削除実行後にプレビューを自動更新
        setTimeout(() => {
          loadPreview();
        }, 1000);
        
        if (dryRun) {
          alert(`DRY RUN完了\n\n削除対象: ${data.total_deleted}件\n- トレンドニュース: ${data.stats.trend_vectors.deleted}件\n- YouTube動画: ${data.stats.youtube_vectors.deleted}件\n- 生成記事: ${data.stats.company_vectors.deleted}件`);
        } else {
          alert(`削除完了\n\n削除された件数: ${data.total_deleted}件\n- トレンドニュース: ${data.stats.trend_vectors.deleted}件\n- YouTube動画: ${data.stats.youtube_vectors.deleted}件\n- 生成記事: ${data.stats.company_vectors.deleted}件`);
        }
      } else {
        throw new Error('削除処理に失敗しました');
      }
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除処理でエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">RAGデータ削除管理</h1>
          <p className="text-gray-400">古いRAGデータを削除してストレージを最適化します</p>
        </div>

        {/* 削除設定 */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <ClockIcon className="w-6 h-6 mr-2" />
            削除設定
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                トレンドニュース保持期間
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  max="365"
                  value={cleanupForm.trend_days}
                  onChange={(e) => setCleanupForm({
                    ...cleanupForm,
                    trend_days: parseInt(e.target.value) || 0
                  })}
                  className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-gray-400">日</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                推奨: 0日（即座削除・使い捨て型）⚠️ トレンドRAGは台本生成後すぐに削除
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                YouTube動画保持期間
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={cleanupForm.youtube_days}
                  onChange={(e) => setCleanupForm({
                    ...cleanupForm,
                    youtube_days: parseInt(e.target.value) || 90
                  })}
                  className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-gray-400">日</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                推奨: 90日（教育コンテンツ）
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                生成記事保持期間
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={cleanupForm.company_days}
                  onChange={(e) => setCleanupForm({
                    ...cleanupForm,
                    company_days: parseInt(e.target.value) || 365
                  })}
                  className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-gray-400">日</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                推奨: 365日（自社コンテンツ）
              </p>
            </div>
          </div>

          <div className="flex space-x-4 mt-6">
            <button
              onClick={loadPreview}
              disabled={previewLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <DocumentTextIcon className="w-5 h-5" />
              <span>{previewLoading ? 'プレビュー中...' : 'プレビュー'}</span>
            </button>
          </div>
        </div>

        {/* プレビュー結果 */}
        {preview && (
          <div className="bg-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <DocumentTextIcon className="w-6 h-6 mr-2" />
              削除対象プレビュー
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center">
                  <GlobeAltIcon className="w-8 h-8 text-purple-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-400">トレンドニュース</div>
                    <div className="text-2xl font-bold text-white">{preview.deletion_targets.trend_vectors}</div>
                    <div className="text-xs text-gray-500">削除対象</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center">
                  <PlayIcon className="w-8 h-8 text-red-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-400">YouTube動画</div>
                    <div className="text-2xl font-bold text-white">{preview.deletion_targets.youtube_vectors}</div>
                    <div className="text-xs text-gray-500">削除対象</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center">
                  <DocumentTextIcon className="w-8 h-8 text-green-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-400">生成記事</div>
                    <div className="text-2xl font-bold text-white">{preview.deletion_targets.company_vectors}</div>
                    <div className="text-xs text-gray-500">削除対象</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center">
                  <TrashIcon className="w-8 h-8 text-orange-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-400">合計</div>
                    <div className="text-2xl font-bold text-white">{preview.total_targets}</div>
                    <div className="text-xs text-gray-500">削除対象</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <h3 className="font-semibold mb-2">削除基準日</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• トレンドニュース: {preview.thresholds.trend} より古い配信日</li>
                <li>• YouTube動画: {preview.thresholds.youtube} より古い取得日</li>
                <li>• 生成記事: {preview.thresholds.company} より古い生成日</li>
              </ul>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => executeCleanup(true)}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <ClockIcon className="w-5 h-5" />
                <span>{loading ? '実行中...' : 'DRY RUN（テスト実行）'}</span>
              </button>

              <button
                onClick={() => executeCleanup(false)}
                disabled={loading || preview.total_targets === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <TrashIcon className="w-5 h-5" />
                <span>{loading ? '実行中...' : '実際に削除実行'}</span>
              </button>
            </div>

            {preview.total_targets === 0 && (
              <div className="mt-4 p-4 bg-green-800 rounded-lg">
                <p className="text-green-200">削除対象のデータはありません。すべて最新のデータです。</p>
              </div>
            )}
          </div>
        )}

        {/* 削除結果 */}
        {cleanupStats && (
          <div className="bg-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <TrashIcon className="w-6 h-6 mr-2" />
              削除結果
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold mb-2">トレンドニュース</h3>
                <div className="text-sm text-gray-300">
                  <div>削除前: {cleanupStats.trend_vectors.total_before}件</div>
                  <div>削除: {cleanupStats.trend_vectors.deleted}件</div>
                  <div>残り: {cleanupStats.trend_vectors.remaining}件</div>
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold mb-2">YouTube動画</h3>
                <div className="text-sm text-gray-300">
                  <div>削除前: {cleanupStats.youtube_vectors.total_before}件</div>
                  <div>削除: {cleanupStats.youtube_vectors.deleted}件</div>
                  <div>残り: {cleanupStats.youtube_vectors.remaining}件</div>
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold mb-2">生成記事</h3>
                <div className="text-sm text-gray-300">
                  <div>削除前: {cleanupStats.company_vectors.total_before}件</div>
                  <div>削除: {cleanupStats.company_vectors.deleted}件</div>
                  <div>残り: {cleanupStats.company_vectors.remaining}件</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 使用方法 */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">使用方法</h2>
          <div className="space-y-4 text-sm text-gray-300">
            <div>
              <h3 className="font-semibold text-white mb-2">1. 削除設定を調整</h3>
              <p>各RAGシステムの保持期間を設定します。推奨値は既に設定されています。</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">2. プレビューで確認</h3>
              <p>削除対象の件数を確認します。実際の削除は行われません。</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">3. DRY RUN（推奨）</h3>
              <p>実際の削除を行わずにテスト実行します。ログで削除処理をシミュレートします。</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">4. 実際に削除実行</h3>
              <p>確認後、実際に古いRAGデータを削除します。この操作は元に戻せません。</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-800 rounded-lg">
            <h3 className="font-semibold text-yellow-200 mb-2">⚠️ 注意事項</h3>
            <ul className="text-sm text-yellow-200 space-y-1">
              <li>• 削除されたデータは復元できません</li>
              <li>• 実行前に必ずDRY RUNでテストしてください</li>
              <li>• 自社の固定情報（Company RAGの元データ）は削除されません</li>
              <li>• 削除対象は生成記事と外部取得データのみです</li>
              <li>• <strong>トレンドニュース</strong>: ニュース配信日基準で削除（0日=即座削除推奨・使い捨て型）</li>
              <li>• <strong>YouTube・生成記事</strong>: 取得・生成日基準で削除</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 