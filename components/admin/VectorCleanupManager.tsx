'use client';

import React, { useState } from 'react';
import { 
  TrashIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

interface CleanupStats {
  total_service_records: number;
  unique_services: number;
  records_to_preserve: number;
  records_to_delete: number;
  protected_data: Record<string, number>;
  execution_mode: string;
  actually_deleted: number;
  final_service_count: number;
  data_integrity_ok: boolean;
}

interface CleanupResponse {
  success: boolean;
  dry_run: boolean;
  stats: CleanupStats;
  message: string;
  recommendations: string[];
}

export default function VectorCleanupManager() {
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<CleanupResponse | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const runCleanup = async (dryRun: boolean = true) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/cleanup-duplicate-vectors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dry_run: dryRun })
      });

      if (response.ok) {
        const data: CleanupResponse = await response.json();
        setLastResult(data);
        if (dryRun) {
          setShowConfirmation(true);
        }
      } else {
        console.error('Cleanup failed');
      }
    } catch (error) {
      console.error('Error running cleanup:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeLiveCleanup = async () => {
    setShowConfirmation(false);
    await runCleanup(false);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 flex items-center text-white">
        <TrashIcon className="w-5 h-5 mr-2" />
        ベクトルデータ最適化
      </h2>

      {/* 現状の問題説明 */}
      <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <ExclamationTriangleIcon className="w-5 h-5 text-amber-400 mr-2 mt-0.5" />
          <div>
            <h3 className="text-amber-400 font-medium mb-2">重複データ検出</h3>
            <p className="text-amber-200 text-sm mb-2">
              serviceデータが大量に重複生成されています（同じサービスページが150回以上ベクトル化）
            </p>
            <ul className="text-amber-200 text-sm space-y-1">
              <li>• ベクトルRAGシステム: 159個 → 1個に最適化</li>
              <li>• AIエージェント開発: 159個 → 1個に最適化</li>
              <li>• チャットボット開発: 159個 → 1個に最適化</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 保護対象データ */}
      <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <ShieldCheckIcon className="w-5 h-5 text-green-400 mr-2 mt-0.5" />
          <div>
            <h3 className="text-green-400 font-medium mb-2">絶対保護データ</h3>
            <p className="text-green-200 text-sm mb-2">以下のデータは絶対に削除されません：</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-green-200">生成ブログ記事: 37個</span>
              <span className="text-green-200">構造化データ: 10個</span>
              <span className="text-green-200">企業情報: 4個</span>
              <span className="text-green-200">技術情報: 4個</span>
            </div>
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex space-x-3 mb-6">
        <button
          onClick={() => runCleanup(true)}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center"
        >
          <PlayIcon className="w-4 h-4 mr-2" />
          {loading ? '分析中...' : '安全性確認 (DRY RUN)'}
        </button>
      </div>

      {/* DRY RUN結果 */}
      {lastResult && lastResult.dry_run && (
        <div className="bg-gray-700 rounded-lg p-4 mb-4">
          <h3 className="text-white font-medium mb-3 flex items-center">
            <CheckCircleIcon className="w-5 h-5 text-green-400 mr-2" />
            安全性確認完了
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{lastResult.stats.total_service_records}</p>
              <p className="text-gray-400 text-sm">現在の重複レコード</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-cyan-400">{lastResult.stats.records_to_delete}</p>
              <p className="text-gray-400 text-sm">削除対象</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{lastResult.stats.records_to_preserve}</p>
              <p className="text-gray-400 text-sm">保持対象</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-400">{lastResult.stats.unique_services}</p>
              <p className="text-gray-400 text-sm">ユニークサービス</p>
            </div>
          </div>

          <div className="bg-gray-600 rounded-lg p-3 mb-4">
            <p className="text-white text-sm font-medium mb-2">予想効果:</p>
            <p className="text-green-400 text-sm">
              • データサイズ削減: {lastResult.stats.total_service_records} → {lastResult.stats.records_to_preserve} 
              ({((1 - lastResult.stats.records_to_preserve / lastResult.stats.total_service_records) * 100).toFixed(1)}% 削減)
            </p>
            <p className="text-green-400 text-sm">
              • 検索精度向上: 重複ノイズ除去により関連性の高い結果を優先表示
            </p>
            <p className="text-green-400 text-sm">
              • 応答速度向上: ベクトル検索処理の高速化
            </p>
          </div>

          {lastResult.stats.data_integrity_ok && showConfirmation && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
              <h4 className="text-red-400 font-medium mb-2">⚠️ 最終確認</h4>
              <p className="text-red-200 text-sm mb-3">
                {lastResult.stats.records_to_delete}個の重複レコードを削除します。
                保護対象データは完全に保持されることが確認されました。
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={executeLiveCleanup}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-4 py-2 rounded-lg text-white font-medium transition-colors"
                >
                  {loading ? '実行中...' : '最適化実行'}
                </button>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-white font-medium transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* LIVE実行結果 */}
      {lastResult && !lastResult.dry_run && (
        <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
          <h3 className="text-green-400 font-medium mb-3 flex items-center">
            <CheckCircleIcon className="w-5 h-5 mr-2" />
            最適化完了
          </h3>
          <p className="text-green-200 text-sm mb-2">{lastResult.message}</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xl font-bold text-green-400">{lastResult.stats.actually_deleted}</p>
              <p className="text-gray-400 text-sm">削除完了</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">{lastResult.stats.final_service_count}</p>
              <p className="text-gray-400 text-sm">最終レコード数</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-cyan-400">
                {lastResult.stats.data_integrity_ok ? '✅' : '❌'}
              </p>
              <p className="text-gray-400 text-sm">データ整合性</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 