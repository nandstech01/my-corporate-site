'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabaseクライアント
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface FragmentVector {
  id: number;
  fragment_id: string;
  complete_uri: string;
  page_path: string;
  content_title: string;
  content: string;
  content_type: string;
  category: string;
  semantic_weight: number;
  target_queries: string[];
  related_entities: string[];
  metadata: any;
  created_at: string;
  updated_at: string;
}

interface FragmentStats {
  totalFragments: number;
  uniquePages: number;
  contentTypes: { [key: string]: number };
  categories: { [key: string]: number };
  pageBreakdown: { [key: string]: number };
}

export default function FragmentVectorsPage() {
  const [fragments, setFragments] = useState<FragmentVector[]>([]);
  const [stats, setStats] = useState<FragmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterContentType, setFilterContentType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPagePath, setFilterPagePath] = useState('');
  const [selectedFragment, setSelectedFragment] = useState<FragmentVector | null>(null);

  // データ読み込み
  useEffect(() => {
    loadFragmentVectors();
  }, []);

  const loadFragmentVectors = async () => {
    try {
      setLoading(true);

      // Fragment Vectorsデータ取得
      const { data: fragmentsData, error: fragmentsError } = await supabase
        .from('fragment_vectors')
        .select('*')
        .order('created_at', { ascending: false });

      if (fragmentsError) {
        console.error('Fragment Vectors取得エラー:', fragmentsError);
        return;
      }

      setFragments(fragmentsData || []);

      // 統計情報計算
      if (fragmentsData) {
        const stats: FragmentStats = {
          totalFragments: fragmentsData.length,
          uniquePages: new Set(fragmentsData.map(f => f.page_path)).size,
          contentTypes: {},
          categories: {},
          pageBreakdown: {}
        };

        fragmentsData.forEach(fragment => {
          // コンテンツタイプ別集計
          stats.contentTypes[fragment.content_type] = 
            (stats.contentTypes[fragment.content_type] || 0) + 1;

          // カテゴリ別集計
          stats.categories[fragment.category] = 
            (stats.categories[fragment.category] || 0) + 1;

          // ページ別集計
          stats.pageBreakdown[fragment.page_path] = 
            (stats.pageBreakdown[fragment.page_path] || 0) + 1;
        });

        setStats(stats);
      }

    } catch (error) {
      console.error('データ読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  // フィルタ適用
  const filteredFragments = fragments.filter(fragment => {
    const matchesSearch = !searchTerm || 
      fragment.fragment_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fragment.content_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fragment.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesContentType = !filterContentType || fragment.content_type === filterContentType;
    const matchesCategory = !filterCategory || fragment.category === filterCategory;
    const matchesPagePath = !filterPagePath || fragment.page_path === filterPagePath;

    return matchesSearch && matchesContentType && matchesCategory && matchesPagePath;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Fragment Vectors データ読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Fragment ID 可視化ダッシュボード</h1>
          <p className="text-gray-400">Fragment IDの抽出・ベクトル化・Complete URI生成の詳細分析</p>
          <div className="mt-2 text-sm text-gray-500">
            <span className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 px-3 py-1 rounded-full border border-cyan-500/30">
              🔍 Fragment ID → Complete URI → Vector Embedding
            </span>
          </div>
        </div>

        {/* 統計情報 */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-900/30 rounded-xl p-6 border border-blue-700/50">
              <div className="text-2xl font-bold text-blue-400">{stats.totalFragments}</div>
              <div className="text-sm text-gray-300">総Fragment ID数</div>
            </div>
            <div className="bg-green-900/30 rounded-xl p-6 border border-green-700/50">
              <div className="text-2xl font-bold text-green-400">{stats.uniquePages}</div>
              <div className="text-sm text-gray-300">対象ページ数</div>
            </div>
            <div className="bg-purple-900/30 rounded-xl p-6 border border-purple-700/50">
              <div className="text-2xl font-bold text-purple-400">{Object.keys(stats.contentTypes).length}</div>
              <div className="text-sm text-gray-300">コンテンツタイプ数</div>
            </div>
            <div className="bg-orange-900/30 rounded-xl p-6 border border-orange-700/50">
              <div className="text-2xl font-bold text-orange-400">{Object.keys(stats.categories).length}</div>
              <div className="text-sm text-gray-300">カテゴリ数</div>
            </div>
          </div>
        )}

        {/* 詳細統計 */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* コンテンツタイプ別 */}
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-cyan-400">コンテンツタイプ別</h3>
              <div className="space-y-2">
                {Object.entries(stats.contentTypes).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-gray-300">{type}</span>
                    <span className="bg-cyan-600/20 px-2 py-1 rounded text-cyan-400 text-sm">
                      {count}個
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* カテゴリ別 */}
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-emerald-400">カテゴリ別</h3>
              <div className="space-y-2">
                {Object.entries(stats.categories).map(([category, count]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-gray-300">{category}</span>
                    <span className="bg-emerald-600/20 px-2 py-1 rounded text-emerald-400 text-sm">
                      {count}個
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ページ別 */}
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-yellow-400">ページ別</h3>
              <div className="space-y-2">
                {Object.entries(stats.pageBreakdown).map(([path, count]) => (
                  <div key={path} className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">{path}</span>
                    <span className="bg-yellow-600/20 px-2 py-1 rounded text-yellow-400 text-sm">
                      {count}個
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 検索・フィルタ */}
        <div className="bg-gray-800/50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">検索・フィルタ</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Fragment ID、タイトル、内容で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400"
            />
            <select
              value={filterContentType}
              onChange={(e) => setFilterContentType(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="">全コンテンツタイプ</option>
              {stats && Object.keys(stats.contentTypes).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="">全カテゴリ</option>
              {stats && Object.keys(stats.categories).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={filterPagePath}
              onChange={(e) => setFilterPagePath(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="">全ページ</option>
              {stats && Object.keys(stats.pageBreakdown).map(path => (
                <option key={path} value={path}>{path}</option>
              ))}
            </select>
          </div>
          <div className="mt-4 text-sm text-gray-400">
            {filteredFragments.length}件 / {fragments.length}件を表示
          </div>
        </div>

        {/* Fragment一覧テーブル */}
        <div className="bg-gray-800/50 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold">Fragment ID一覧</h3>
            <p className="text-sm text-gray-400 mt-1">Fragment IDから生成されたComplete URIとベクトル埋め込み</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Fragment ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    タイトル
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    タイプ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    カテゴリ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    ページ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    重み
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredFragments.map((fragment) => (
                  <tr key={fragment.id} className="hover:bg-gray-700/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="bg-gray-700 px-2 py-1 rounded text-sm text-cyan-400">
                        {fragment.fragment_id}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-white truncate max-w-xs">
                        {fragment.content_title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {fragment.content_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {fragment.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {fragment.page_path}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {fragment.semantic_weight?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedFragment(fragment)}
                        className="text-indigo-400 hover:text-indigo-300"
                      >
                        詳細
                      </button>
                      <a
                        href={fragment.complete_uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 text-cyan-400 hover:text-cyan-300"
                      >
                        リンク
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 詳細モーダル */}
        {selectedFragment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Fragment詳細情報</h3>
                <button
                  onClick={() => setSelectedFragment(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Fragment ID</label>
                  <code className="block bg-gray-700 p-2 rounded text-cyan-400">
                    {selectedFragment.fragment_id}
                  </code>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Complete URI</label>
                  <a 
                    href={selectedFragment.complete_uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-gray-700 p-2 rounded text-blue-400 hover:text-blue-300"
                  >
                    {selectedFragment.complete_uri}
                  </a>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">コンテンツタイトル</label>
                  <div className="bg-gray-700 p-2 rounded text-white">
                    {selectedFragment.content_title}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">コンテンツ内容</label>
                  <div className="bg-gray-700 p-3 rounded text-gray-200 max-h-40 overflow-y-auto">
                    {selectedFragment.content}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">コンテンツタイプ</label>
                    <div className="bg-gray-700 p-2 rounded text-white">
                      {selectedFragment.content_type}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">カテゴリ</label>
                    <div className="bg-gray-700 p-2 rounded text-white">
                      {selectedFragment.category}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">ターゲットクエリ</label>
                  <div className="bg-gray-700 p-2 rounded">
                    <div className="flex flex-wrap gap-1">
                      {selectedFragment.target_queries?.map((query, index) => (
                        <span key={index} className="bg-blue-600/20 px-2 py-1 rounded text-blue-400 text-sm">
                          {query}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">関連エンティティ</label>
                  <div className="bg-gray-700 p-2 rounded">
                    <div className="flex flex-wrap gap-1">
                      {selectedFragment.related_entities?.map((entity, index) => (
                        <span key={index} className="bg-green-600/20 px-2 py-1 rounded text-green-400 text-sm">
                          {entity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">メタデータ</label>
                  <pre className="bg-gray-700 p-3 rounded text-gray-200 text-sm overflow-x-auto">
                    {JSON.stringify(selectedFragment.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 