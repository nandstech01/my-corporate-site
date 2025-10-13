'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';

interface KenjiThought {
  id: number;
  thought_id: string;
  thought_title: string;
  thought_category: string;
  thought_content: string;
  key_terms: string[];
  usage_context: string;
  priority: number;
  vectorization_status: 'pending' | 'vectorized' | 'error';
  vectorization_date: string | null;
  vector_dimensions: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function KenjiThoughtManagementPage() {
  const [thoughts, setThoughts] = useState<KenjiThought[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'vectorized' | 'pending' | 'error'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    fetchThoughts();
  }, [filter, categoryFilter]);

  async function fetchThoughts() {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('kenji_harada_architect_knowledge')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      // フィルター適用
      if (filter !== 'all') {
        query = query.eq('vectorization_status', filter);
      }

      if (categoryFilter !== 'all') {
        query = query.eq('thought_category', categoryFilter);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setThoughts(data || []);
    } catch (err: any) {
      console.error('思想データ取得エラー:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(thoughtId: number, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('kenji_harada_architect_knowledge')
        .update({ is_active: !currentStatus })
        .eq('id', thoughtId);

      if (error) throw error;

      // 再取得
      fetchThoughts();
    } catch (err: any) {
      console.error('アクティブ状態更新エラー:', err);
      alert(`エラー: ${err.message}`);
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      vectorized: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const text = {
      vectorized: '✅ ベクトル化済み',
      pending: '⏳ 待機中',
      error: '❌ エラー',
    };
    return text[status as keyof typeof text] || status;
  };

  const getCategoryText = (category: string) => {
    const categories: Record<string, string> = {
      'core-concept': 'コアコンセプト',
      'implementation': '実装',
      'philosophy': '哲学',
    };
    return categories[category] || category;
  };

  const stats = {
    total: thoughts.length,
    vectorized: thoughts.filter(t => t.vectorization_status === 'vectorized').length,
    pending: thoughts.filter(t => t.vectorization_status === 'pending').length,
    error: thoughts.filter(t => t.vectorization_status === 'error').length,
    active: thoughts.filter(t => t.is_active).length,
  };

  const uniqueCategories = Array.from(new Set(thoughts.map(t => t.thought_category)));

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧠 Kenji Harada 思想RAG管理
          </h1>
          <p className="text-gray-600">
            AIアーキテクトの設計思想を管理・ベクトル化し、台本生成時にRAG参照します
          </p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">総思想数</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-green-600">ベクトル化済み</div>
            <div className="mt-2 text-3xl font-semibold text-green-700">{stats.vectorized}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-yellow-600">待機中</div>
            <div className="mt-2 text-3xl font-semibold text-yellow-700">{stats.pending}</div>
          </div>
          <div className="bg-red-50 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-red-600">エラー</div>
            <div className="mt-2 text-3xl font-semibold text-red-700">{stats.error}</div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-blue-600">アクティブ</div>
            <div className="mt-2 text-3xl font-semibold text-blue-700">{stats.active}</div>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ベクトル化ステータス
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全て</option>
                <option value="vectorized">ベクトル化済み</option>
                <option value="pending">待機中</option>
                <option value="error">エラー</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カテゴリ
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全て</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{getCategoryText(cat)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">❌ エラー: {error}</p>
          </div>
        )}

        {/* ローディング */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        ) : (
          /* 思想リスト */
          <div className="space-y-4">
            {thoughts.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500">思想データがありません</p>
              </div>
            ) : (
              thoughts.map((thought) => (
                <div
                  key={thought.id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {thought.thought_title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(thought.vectorization_status)}`}>
                          {getStatusText(thought.vectorization_status)}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {getCategoryText(thought.thought_category)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${thought.is_active ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                          {thought.is_active ? '🟢 アクティブ' : '⚫️ 非アクティブ'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        ID: <code className="bg-gray-100 px-2 py-1 rounded">{thought.thought_id}</code>
                        {' '} | 優先度: <span className="font-semibold">{thought.priority}</span>
                        {' '} | 使用文脈: {thought.usage_context || 'なし'}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleActive(thought.id, thought.is_active)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        thought.is_active
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {thought.is_active ? '無効化' : '有効化'}
                    </button>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed">
                      {thought.thought_content}
                    </p>
                  </div>

                  {thought.key_terms && thought.key_terms.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">重要用語:</p>
                      <div className="flex flex-wrap gap-2">
                        {thought.key_terms.map((term, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm"
                          >
                            {term}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">ベクトル次元</p>
                        <p className="font-medium text-gray-900">{thought.vector_dimensions || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">ベクトル化日時</p>
                        <p className="font-medium text-gray-900">
                          {thought.vectorization_date 
                            ? new Date(thought.vectorization_date).toLocaleString('ja-JP')
                            : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">作成日</p>
                        <p className="font-medium text-gray-900">
                          {new Date(thought.created_at).toLocaleString('ja-JP')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">更新日</p>
                        <p className="font-medium text-gray-900">
                          {new Date(thought.updated_at).toLocaleString('ja-JP')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

