'use client';

import { useState, useEffect } from 'react';

interface TrendItem {
  id?: number;
  trend_title: string;
  trend_content: string;
  trend_url: string;
  trend_category: string;
  trend_date?: string;
  created_at?: string;
}

export default function TrendRAGPage() {
  const [loading, setLoading] = useState(false);
  const [existingTrends, setExistingTrends] = useState<TrendItem[]>([]);
  const [newTrends, setNewTrends] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [selectedCount, setSelectedCount] = useState(10);
  const [searchMode, setSearchMode] = useState<'auto' | 'architect' | 'manual'>('auto');
  const [manualQuery, setManualQuery] = useState('');
  const [architectArticleType, setArchitectArticleType] = useState<'career' | 'technical' | 'freelance' | 'general'>('career');

  // 既存のトレンドRAGを取得
  useEffect(() => {
    fetchExistingTrends();
  }, []);

  const fetchExistingTrends = async () => {
    try {
      const response = await fetch('/api/trend-stats');
      const data = await response.json();
      
      if (data.trends) {
        setExistingTrends(data.trends);
      }
    } catch (error) {
      console.error('❌ 既存トレンド取得エラー:', error);
    }
  };

  /**
   * 🆕 Brave Search APIで実際のニュースを取得（自動）
   * blog-trend-queries.tsからクエリを使用
   */
  const handleFetchTrends = async () => {
    setLoading(true);
    setMessage('');
    setNewTrends([]);

    try {
      console.log(`🔍 Brave Search APIでニュース取得中... (${selectedCount}件)`);

      const response = await fetch('/api/brave-search/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: selectedCount,
          useBlogQueries: true // blog-trend-queries.tsを使用
        })
      });

      const result = await response.json();

      if (result.success) {
        if (result.news && result.news.length > 0) {
          // 🆕 取得したニュースを自動的にベクトル化してDBに保存
          console.log(`🚀 自動保存開始: ${result.news.length}件のニュースをベクトル化してDBに保存中...`);
          setMessage(`⏳ ${result.news.length}件のニュースを取得しました。ベクトル化してDBに保存中...`);
          
          // `/api/admin/fetch-trends` を呼び出して保存
          const saveResponse = await fetch('/api/admin/fetch-trends', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trends: result.news }),
          });

          const saveResult = await saveResponse.json();

          if (saveResult.success) {
            setMessage(`✅ ${result.news.length}件のニュースを取得し、ベクトル化してDBに保存しました！`);
            // 既存トレンドをリロード
            fetchExistingTrends();
          } else {
            setNewTrends(result.news);
            setMessage(`⚠️ ニュースは取得できましたが、保存に失敗しました。「ベクトル化してDBに保存」を押して再試行してください。エラー: ${saveResult.error || '不明なエラー'}`);
          }
        } else {
          setMessage(`⚠️ ニュースが取得できませんでした。原因: Brave APIのレート制限（429エラー）またはパラメータエラー（422エラー）。解決策: ①手動検索モードを使用 ②数分待って再試行 ③取得件数を減らす（5件など）`);
        }
      } else {
        setMessage(`エラー: ${result.error || 'ニュース取得に失敗しました'}`);
      }

    } catch (error: any) {
      console.error('❌ エラー:', error);
      setMessage(`エラー: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🆕 AIアーキテクト用ニュース取得（1週間以内）
   * architect-trend-queries.ts からクエリを使用
   */
  const handleFetchArchitectTrends = async () => {
    setLoading(true);
    setMessage('');
    setNewTrends([]);

    try {
      console.log(`🏗️ AIアーキテクトモード: ${architectArticleType}タイプのニュース取得中... (${selectedCount}件)`);

      const response = await fetch('/api/brave-search/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: selectedCount,
          useArchitectQueries: true, // architect-trend-queries.ts を使用
          articleType: architectArticleType, // 記事タイプ
          freshnessFilter: '7days' // 1週間以内に限定
        })
      });

      const result = await response.json();

      if (result.success) {
        if (result.news && result.news.length > 0) {
          console.log(`🚀 自動保存開始: ${result.news.length}件のニュースをベクトル化してDBに保存中...`);
          setMessage(`⏳ ${result.news.length}件のAIアーキテクト関連ニュースを取得しました。ベクトル化してDBに保存中...`);
          
          const saveResponse = await fetch('/api/admin/fetch-trends', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trends: result.news }),
          });

          const saveResult = await saveResponse.json();

          if (saveResult.success) {
            setMessage(`✅ ${result.news.length}件のAIアーキテクト関連ニュース（${architectArticleType}）を取得し、ベクトル化してDBに保存しました！`);
            fetchExistingTrends();
          } else {
            setNewTrends(result.news);
            setMessage(`⚠️ ニュースは取得できましたが、保存に失敗しました。エラー: ${saveResult.error || '不明なエラー'}`);
          }
        } else {
          setMessage(`⚠️ 1週間以内のAIアーキテクト関連ニュースが見つかりませんでした。別の記事タイプを試してください。`);
        }
      } else {
        setMessage(`エラー: ${result.error || 'ニュース取得に失敗しました'}`);
      }

    } catch (error: any) {
      console.error('❌ AIアーキテクトモードエラー:', error);
      setMessage(`エラー: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🆕 手動検索でニュースを取得
   * 注: このAPIは取得と同時にベクトル化してDBに保存します
   */
  const handleManualSearch = async () => {
    if (!manualQuery.trim()) {
      setMessage('検索キーワードを入力してください');
      return;
    }

    setLoading(true);
    setMessage('');
    setNewTrends([]);

    try {
      console.log(`🔍 手動検索: "${manualQuery}"`);

      const response = await fetch('/api/brave-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: manualQuery,
          type: 'news'
        })
      });

      const result = await response.json();

      if (result.results && result.results.length > 0) {
        const vectorizedCount = result.results.filter((item: any) => item.vectorized).length;

        if (vectorizedCount > 0) {
          setMessage(`✅ ${vectorizedCount}件のニュースを取得し、ベクトル化してDBに保存しました（キーワード: "${manualQuery}"）`);
          // 既存トレンドをリロード
          fetchExistingTrends();
          // 検索フィールドをクリア
          setManualQuery('');
        } else {
          setMessage(`⚠️ ニュースは取得できましたが、ベクトル化に失敗しました`);
        }
      } else {
        setMessage(`⚠️ 検索キーワード "${manualQuery}" に該当する24時間以内のニュースが見つかりませんでした`);
      }

    } catch (error: any) {
      console.error('❌ 手動検索エラー:', error);
      setMessage(`エラー: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 取得したニュースをベクトル化してDBに保存
   */
  const handleVectorizeTrends = async () => {
    if (newTrends.length === 0) {
      setMessage('先にニュースを取得してください。');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      console.log('📥 トレンドをベクトル化中...');

      const response = await fetch('/api/admin/fetch-trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trends: newTrends }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage(result.message);
        setNewTrends([]); // クリア
        fetchExistingTrends(); // 既存リストを再取得
      } else {
        setMessage(`エラー: ${result.error}`);
      }

    } catch (error: any) {
      console.error('❌ ベクトル化エラー:', error);
      setMessage(`エラー: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 個別削除
   */
  const handleDeleteTrend = async (id: number) => {
    if (!confirm('このトレンドRAGを削除しますか？')) {
      return;
    }

    try {
      const response = await fetch(`/api/trend-rag/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setMessage(`✅ 削除しました`);
        fetchExistingTrends();
      } else {
        setMessage(`エラー: ${result.error}`);
      }
    } catch (error: any) {
      console.error('❌ 削除エラー:', error);
      setMessage(`エラー: ${error.message}`);
    }
  };

  /**
   * 全削除（trend_ragテーブルから全件削除）
   */
  const handleDeleteAll = async () => {
    if (existingTrends.length === 0) {
      setMessage('削除対象のトレンドRAGがありません');
      return;
    }

    if (!confirm(`本当に全て（${existingTrends.length}件）削除しますか？この操作は元に戻せません。`)) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      console.log(`🗑️ トレンドRAG全削除開始: ${existingTrends.length}件`);

      let deletedCount = 0;
      let errorCount = 0;

      // 各トレンドを個別に削除
      for (const trend of existingTrends) {
        try {
          const response = await fetch(`/api/trend-rag/${trend.id}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            deletedCount++;
            console.log(`  ✅ 削除成功: ID ${trend.id}`);
          } else {
            errorCount++;
            console.error(`  ❌ 削除失敗: ID ${trend.id}`);
          }
        } catch (error) {
          errorCount++;
          console.error(`  ❌ 削除エラー: ID ${trend.id}`, error);
        }
      }

      if (errorCount === 0) {
        setMessage(`✅ 全削除完了: ${deletedCount}件のトレンドRAGを削除しました`);
      } else {
        setMessage(`⚠️ 削除完了: 成功${deletedCount}件、失敗${errorCount}件`);
      }

      // リスト更新
      fetchExistingTrends();

    } catch (error: any) {
      console.error('❌ 全削除エラー:', error);
      setMessage(`エラー: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">📰 トレンドRAG管理（ブログ生成用）</h1>
          <p className="text-gray-400">AI/テック専門ニュースを自動収集・ベクトル化してブログ記事の幅を広げます</p>
        </div>

        {/* 説明 */}
        <div className="bg-purple-900/30 border border-purple-500/30 rounded-xl p-6 mb-6">
          <h2 className="font-bold text-purple-300 mb-3 flex items-center">
            💡 トレンドRAGとは
          </h2>
          <div className="text-sm text-purple-200 space-y-2">
            <p>
              <strong>目的:</strong> ブログ記事生成時に、AI/テック専門ニュースを参照して、専門性を維持しつつ入口を広げます。
            </p>
            <p>
              <strong>使用クエリ:</strong> blog-trend-queries.ts から60個のAI/テック専門クエリを使用（AI活用事例、DX、AI技術トレンド、ビジネス×AI）
            </p>
            <p className="text-yellow-300">
              <strong>⚠️ 重要:</strong> 台本生成用の一般ニュース（熊、大谷など）は含まれません。
            </p>
          </div>
        </div>

        {/* 既存トレンドRAG統計 */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">📊 現在のトレンドRAG</h2>
            <div className="flex items-center space-x-4">
              <span className="text-2xl font-bold text-purple-400">{existingTrends.length}件</span>
              {existingTrends.length > 0 && (
                <button
                  onClick={handleDeleteAll}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-lg text-sm transition-colors"
                >
                  🗑️ 全削除
                </button>
              )}
            </div>
          </div>

          {existingTrends.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {existingTrends.map((trend) => (
                <div key={trend.id} className="bg-gray-700 rounded-lg p-4 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1">{trend.trend_title}</h3>
                    <p className="text-sm text-gray-300 mb-2 line-clamp-2">{trend.trend_content}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span>📅 {trend.trend_date}</span>
                      <span>📂 {trend.trend_category}</span>
                      <a
                        href={trend.trend_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:underline"
                      >
                        🔗 ソース
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={() => trend.id && handleDeleteTrend(trend.id)}
                    className="ml-4 px-3 py-1 bg-red-600/50 hover:bg-red-600 rounded text-sm transition-colors"
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>まだトレンドRAGがありません</p>
              <p className="text-sm">下のボタンから新しいニュースを取得してください</p>
            </div>
          )}
        </div>

        {/* ステップ1: 新規ニュース取得 */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">🔍 ステップ1: 新規ニュース取得（Brave Search API）</h2>
          
          {/* タブ切り替え */}
          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => setSearchMode('auto')}
              className={`px-6 py-2 rounded-lg transition-colors font-semibold ${
                searchMode === 'auto'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              📚 教育モード自動取得
            </button>
            <button
              onClick={() => setSearchMode('architect')}
              className={`px-6 py-2 rounded-lg transition-colors font-semibold ${
                searchMode === 'architect'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🏗️ AIアーキテクト自動取得
            </button>
            <button
              onClick={() => setSearchMode('manual')}
              className={`px-6 py-2 rounded-lg transition-colors font-semibold ${
                searchMode === 'manual'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🔍 手動検索
            </button>
          </div>

          {/* 教育モード自動取得 */}
          {searchMode === 'auto' && (
            <div>
              <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4 mb-4">
                <h3 className="font-bold text-blue-300 mb-2">📚 教育モード自動取得</h3>
                <p className="text-sm text-blue-200">AIツール紹介、最新技術、DX事例などの一般的なAI/テックニュースを取得します。</p>
              </div>
              <div className="flex items-center space-x-4 mb-4">
                <label className="text-sm text-gray-300">取得件数:</label>
                <select
                  value={selectedCount}
                  onChange={(e) => setSelectedCount(Number(e.target.value))}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value={5}>5件</option>
                  <option value={10}>10件</option>
                  <option value={15}>15件</option>
                  <option value={20}>20件</option>
                </select>
                <button
                  onClick={handleFetchTrends}
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors font-semibold"
                >
                  <span>{loading ? '取得中...' : '📚 教育モードでニュース取得'}</span>
                </button>
              </div>

              <p className="text-xs text-gray-400">
                💡 blog-trend-queries.ts からランダムにクエリを選択し、Brave Search APIで最新のAI/テックニュースを取得します
                <br />
                ⏰ 24時間以内の最新ニュースのみ取得（鮮度が命）
              </p>
            </div>
          )}

          {/* 🆕 AIアーキテクトモード自動取得 */}
          {searchMode === 'architect' && (
            <div>
              <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-600/50 rounded-lg p-4 mb-4">
                <h3 className="font-bold text-purple-300 mb-2">🏗️ AIアーキテクトモード自動取得</h3>
                <p className="text-sm text-purple-200 mb-2">
                  年収・キャリア・案件獲得・技術課題など、AIアーキテクト記事に必要な情報を取得します。
                </p>
                <p className="text-xs text-yellow-300">
                  ⚠️ <strong>1週間以内の新鮮な情報のみ</strong>を取得します（最新の年収・単価データを確保）
                </p>
              </div>
              
              {/* 記事タイプ選択 */}
              <div className="mb-4">
                <label className="block text-sm text-gray-300 mb-2">📝 記事タイプを選択:</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { value: 'career', label: '💼 キャリア・年収', desc: '年収相場、キャリアパス' },
                    { value: 'technical', label: '⚙️ 技術課題', desc: 'RAG実装、痛点解決' },
                    { value: 'freelance', label: '🚀 フリーランス', desc: '案件獲得、単価交渉' },
                    { value: 'general', label: '📊 総合', desc: 'バランス型' },
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setArchitectArticleType(type.value as any)}
                      className={`p-3 rounded-lg text-left transition-all ${
                        architectArticleType === type.value
                          ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <div className="font-medium text-sm">{type.label}</div>
                      <div className="text-xs opacity-70 mt-1">{type.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-4">
                <label className="text-sm text-gray-300">取得件数:</label>
                <select
                  value={selectedCount}
                  onChange={(e) => setSelectedCount(Number(e.target.value))}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value={5}>5件</option>
                  <option value={10}>10件</option>
                  <option value={15}>15件</option>
                  <option value={20}>20件</option>
                </select>
                <button
                  onClick={handleFetchArchitectTrends}
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors font-semibold"
                >
                  <span>{loading ? '取得中...' : '🏗️ AIアーキテクト用ニュース取得'}</span>
                </button>
              </div>

              <div className="p-3 bg-gray-800/50 rounded-lg">
                <p className="text-xs text-gray-400 mb-2">
                  <strong>💡 取得されるクエリ例（{architectArticleType}タイプ）:</strong>
                </p>
                <div className="text-xs text-purple-300">
                  {architectArticleType === 'career' && '「AIエンジニア 年収 2025」「フリーランス 単価 相場」「キャリアパス ロードマップ」'}
                  {architectArticleType === 'technical' && '「RAG 実装 課題」「LLM ハルシネーション 対策」「ベクトル検索 精度」'}
                  {architectArticleType === 'freelance' && '「フリーランス 案件獲得」「エージェント おすすめ」「ポートフォリオ 作り方」'}
                  {architectArticleType === 'general' && '「AIアーキテクト」「AI人材 市場」「生成AI 将来性」'}
                </div>
              </div>
            </div>
          )}

          {/* 手動検索モード */}
          {searchMode === 'manual' && (
            <div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">検索キーワード:</label>
                  <input
                    type="text"
                    value={manualQuery}
                    onChange={(e) => setManualQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
                    placeholder="例: AI 活用 事例、ChatGPT 最新機能、DX 推進 成功事例"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleManualSearch}
                  disabled={loading || !manualQuery.trim()}
                  className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors font-semibold"
                >
                  <span>{loading ? '検索中...' : '🔍 このキーワードで検索'}</span>
                </button>
              </div>

              <div className="mt-4 p-3 bg-blue-900/30 border border-blue-500/30 rounded-lg">
                <p className="text-xs text-blue-300 space-y-1">
                  <strong>💡 ヒント:</strong>
                  <br />
                  ✅ 特定のトピックについてニュースを取得したい場合に使用
                  <br />
                  ✅ 自動取得では出てこないような、特定の企業名や技術名で検索可能
                  <br />
                  ⏰ 24時間以内の最新ニュースのみ取得（鮮度が命）
                  <br />
                  💾 検索と同時にベクトル化してDBに自動保存されます
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ステップ2: 取得結果表示 */}
        {newTrends.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">✅ ステップ2: 取得したニュース（{newTrends.length}件）</h2>
            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {newTrends.map((trend, idx) => (
                <div key={idx} className="bg-gray-700 rounded-lg p-4">
                  <h3 className="font-bold text-white mb-2">{trend.title}</h3>
                  <p className="text-sm text-gray-300 mb-2 line-clamp-2">{trend.content}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <span>📂 {trend.category}</span>
                    <a
                      href={trend.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:underline"
                    >
                      🔗 {trend.url}
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleVectorizeTrends}
              disabled={loading}
              className="w-full px-6 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors font-bold text-lg"
            >
              {loading ? 'ベクトル化中...' : '💾 ベクトル化してtrend_vectorsテーブルに保存'}
            </button>
          </div>
        )}

        {/* メッセージ */}
        {message && (
          <div className={`rounded-xl p-4 mb-6 ${message.includes('エラー') ? 'bg-red-900/30 border border-red-500' : 'bg-green-900/30 border border-green-500'}`}>
            <p className={message.includes('エラー') ? 'text-red-300' : 'text-green-300'}>
              {message}
            </p>
          </div>
        )}

        {/* 使用方法 */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h2 className="font-bold text-white mb-4">📋 使用方法</h2>
          <ol className="text-sm text-gray-300 space-y-3">
            <li className="flex items-start">
              <span className="mr-2">1️⃣</span>
              <span><strong>「Brave Search API でニュース取得」</strong>をクリック → AI/テック専門ニュースを取得</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">2️⃣</span>
              <span>取得したニュースを確認 → blog-trend-queries.tsのクエリから自動選択</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">3️⃣</span>
              <span><strong>「ベクトル化してDBに保存」</strong>をクリック → trend_vectorsテーブルに保存</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">4️⃣</span>
              <span><strong>ブログ記事生成時に自動で使用</strong> → /api/generate-rag-blog で autoFetchTrends: true を指定</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">5️⃣</span>
              <span className="text-yellow-300">⚠️ ブログ生成完了後、使用済みtrend_vectorsは自動削除（使い捨て型）</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
