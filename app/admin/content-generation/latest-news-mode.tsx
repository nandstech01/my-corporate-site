'use client';

import { useState } from 'react';
import { NewspaperIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';

interface LatestNewsModeProps {
  onSearch: (params: LatestNewsSearchParams) => void;
  onGenerate: () => void;
  searchLoading: boolean;
  generateLoading: boolean;
  searchResults: any[];
}

interface LatestNewsSearchParams {
  query: string;
  dateFilter: '7days' | '30days' | '90days';
  sources: ['trend']; // 最新ニュースモードでは主にTrend RAG
  latestNewsMode: true;
}

export default function LatestNewsMode({
  onSearch,
  onGenerate,
  searchLoading,
  generateLoading,
  searchResults
}: LatestNewsModeProps) {
  const [query, setQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'7days' | '30days' | '90days'>('7days');

  const handleSearch = () => {
    if (!query.trim()) {
      alert('検索クエリを入力してください');
      return;
    }

    onSearch({
      query,
      dateFilter,
      sources: ['trend'],
      latestNewsMode: true
    });
  };

  const getDateFilterLabel = (filter: string) => {
    switch (filter) {
      case '7days': return '過去7日間';
      case '30days': return '過去30日間';
      case '90days': return '過去90日間';
      default: return filter;
    }
  };

  return (
    <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 mb-6">
      <div className="flex items-center space-x-3 mb-4">
        <NewspaperIcon className="w-6 h-6 text-white" />
        <h3 className="text-xl font-semibold text-white">最新ニュース記事生成モード</h3>
      </div>
      
      <p className="text-green-100 mb-6">
        📰 最新のトレンドニュースを中心とした記事を生成します。古いRAGデータは除外されます。
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* 検索クエリ */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            最新ニュース検索クエリ
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="例: AI業界 最新動向、ChatGPT アップデート"
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-transparent"
          />
        </div>

        {/* 日付フィルタ */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            対象期間
          </label>
          <div className="flex space-x-2">
            {['7days', '30days', '90days'].map((filter) => (
              <button
                key={filter}
                onClick={() => setDateFilter(filter as any)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  dateFilter === filter
                    ? 'bg-white text-green-600 font-semibold'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {getDateFilterLabel(filter)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 特徴説明 */}
      <div className="bg-white/10 rounded-lg p-4 mb-6">
        <h4 className="text-white font-semibold mb-2">✨ 最新ニュースモードの特徴</h4>
        <ul className="text-white/90 text-sm space-y-1">
          <li>• 📅 指定期間内の最新ニュースのみを検索対象</li>
          <li>• 🎯 Trend RAGを重点的に活用（Company/YouTube RAGは補助的）</li>
          <li>• ⚡ 新鮮さとスコアを組み合わせた最適な記事生成</li>
          <li>• 📰 古い情報は自動的に除外</li>
        </ul>
      </div>

      {/* アクションボタン */}
      <div className="flex items-center space-x-4">
        <button
          onClick={handleSearch}
          disabled={searchLoading || !query.trim()}
          className="flex items-center space-x-2 px-6 py-3 bg-white text-green-600 hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors font-semibold"
        >
          <CalendarIcon className="w-5 h-5" />
          <span>{searchLoading ? '最新ニュース検索中...' : '最新ニュース検索'}</span>
        </button>
        
        {searchResults.length > 0 && (
          <button
            onClick={onGenerate}
            disabled={generateLoading}
            className="flex items-center space-x-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors font-semibold"
          >
            <ClockIcon className="w-5 h-5" />
            <span>{generateLoading ? '最新ニュース記事生成中...' : '最新ニュース記事生成'}</span>
          </button>
        )}
      </div>

      {/* 検索結果表示 */}
      {searchResults.length > 0 && (
        <div className="mt-6 p-4 bg-white/10 rounded-lg">
          <h4 className="text-white font-semibold mb-3">
            🔍 最新ニュース検索結果: {searchResults.length}件
          </h4>
          <div className="space-y-2">
            {searchResults.slice(0, 3).map((result, index) => (
              <div key={index} className="p-3 bg-white/10 rounded text-sm">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="px-2 py-1 text-xs rounded bg-green-600 text-white">
                    {result.source.toUpperCase()}
                  </span>
                  <span className="text-white/80">
                    {result.metadata.published_at ? 
                      new Date(result.metadata.published_at).toLocaleDateString('ja-JP') : 
                      '日付不明'
                    }
                  </span>
                  <span className="text-white/60">
                    スコア: {(result.score || 0).toFixed(3)}
                  </span>
                </div>
                <p className="text-white/90 line-clamp-2">
                  {result.content.substring(0, 100)}...
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 