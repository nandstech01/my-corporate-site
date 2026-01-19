'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, ExternalLink, RefreshCw, Download, FileSearch, Copy, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ScoreBar from '@/components/aso/ScoreBar';
import JsonViewer from '@/components/aso/JsonViewer';
import { createClient } from '@/lib/supabase/client';
import { useAsoTheme } from '@/app/aso/context';

interface AnalysisDetail {
  id: string;
  url: string;
  status: string;
  ai_structure_score: number | null;
  created_at: string;
  updated_at: string;
  metadata: any;
  structured_data: any;
  headings: any;
  error_message: string | null;
  analysis_data?: {
    fragment_ids?: string[];
    fragment_schemas?: any[];
    [key: string]: any;
  };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

export default function AnalysisDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { theme } = useAsoTheme();
  const isDark = theme === 'dark';

  const [analysis, setAnalysis] = useState<AnalysisDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedFragment, setCopiedFragment] = useState<number | null>(null);

  useEffect(() => {
    fetchAnalysis();
  }, [id]);

  const fetchAnalysis = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      const response = await fetch(`/api/aso/results/${id}`, {
        credentials: 'include',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
      } else if (response.status === 404) {
        setError('分析が見つかりません');
      } else if (response.status === 401) {
        setError('ログインが必要です（セッションが切れています）');
      } else {
        setError('分析の取得に失敗しました');
      }
    } catch (err) {
      console.error('Error fetching analysis:', err);
      setError('ネットワークエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReanalyze = async () => {
    if (!analysis) return;

    setIsReanalyzing(true);

    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      const response = await fetch('/api/aso/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ url: analysis.url }),
      });

      if (response.ok) {
        await fetchAnalysis();
      } else {
        alert('再分析に失敗しました');
      }
    } catch (err) {
      console.error('Error reanalyzing:', err);
      alert('ネットワークエラーが発生しました');
    } finally {
      setIsReanalyzing(false);
    }
  };

  const handleExport = () => {
    if (!analysis) return;

    const dataStr = JSON.stringify(analysis, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analysis-${id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyFragmentUrl = (fragmentId: string, index: number) => {
    navigator.clipboard.writeText(`${analysis?.url}#${fragmentId}`);
    setCopiedFragment(index);
    setTimeout(() => setCopiedFragment(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-purple-500/20 border-t-purple-500"></div>
          <p className="mt-4" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
            Loading analysis...
          </p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <Link
            href="/aso/analyses"
            className="inline-flex items-center gap-2 transition-colors"
            style={{ color: isDark ? '#94a3b8' : '#64748b' }}
          >
            <ArrowLeft className="w-4 h-4" />
            分析一覧に戻る
          </Link>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-12 text-center"
          style={{
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`
          }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(239,68,68,0.1)' }}
          >
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: isDark ? '#ffffff' : '#0f172a' }}
          >
            {error || 'エラーが発生しました'}
          </h3>
          <p className="mb-6" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
            分析データを取得できませんでした
          </p>
          <Link href="/aso/analyses">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white"
              style={{ background: 'linear-gradient(135deg, #a855f7, #22d3ee)' }}
            >
              <ArrowLeft className="w-5 h-5" />
              分析一覧に戻る
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ヘッダー */}
      <motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-4">
        <Link
          href="/aso/analyses"
          className="inline-flex items-center gap-2 transition-colors"
          style={{ color: isDark ? '#94a3b8' : '#64748b' }}
        >
          <ArrowLeft className="w-4 h-4" />
          分析一覧に戻る
        </Link>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReanalyze}
            disabled={isReanalyzing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              color: isDark ? '#ffffff' : '#0f172a',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
            }}
          >
            <RefreshCw className={`w-4 h-4 ${isReanalyzing ? 'animate-spin' : ''}`} />
            再分析
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-white"
            style={{ background: 'linear-gradient(135deg, #a855f7, #22d3ee)' }}
          >
            <Download className="w-4 h-4" />
            エクスポート
          </motion.button>
        </div>
      </motion.div>

      {/* 基本情報 */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl p-6 space-y-4"
        style={{
          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`
        }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <h1
              className="text-2xl font-bold mb-2 break-all"
              style={{ color: isDark ? '#ffffff' : '#0f172a' }}
            >
              {analysis.url}
            </h1>
            <a
              href={analysis.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 transition-colors"
              style={{ color: '#a855f7' }}
            >
              サイトを開く
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <span
            className="px-3 py-1.5 text-sm font-medium rounded-full"
            style={{
              background: analysis.status === 'completed'
                ? 'rgba(34,211,238,0.1)'
                : 'rgba(239,68,68,0.1)',
              color: analysis.status === 'completed' ? '#22d3ee' : '#ef4444'
            }}
          >
            {analysis.status === 'completed' ? '完了' : '失敗'}
          </span>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t"
          style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}
        >
          <div>
            <div className="text-sm mb-1" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>作成日時</div>
            <div style={{ color: isDark ? '#ffffff' : '#0f172a' }}>
              {new Date(analysis.created_at).toLocaleString('ja-JP')}
            </div>
          </div>
          <div>
            <div className="text-sm mb-1" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>更新日時</div>
            <div style={{ color: isDark ? '#ffffff' : '#0f172a' }}>
              {new Date(analysis.updated_at).toLocaleString('ja-JP')}
            </div>
          </div>
        </div>

        {analysis.error_message && (
          <div
            className="p-4 rounded-xl"
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)'
            }}
          >
            <div className="text-sm font-medium text-red-400 mb-1">エラー</div>
            <div className="text-sm text-red-300">{analysis.error_message}</div>
          </div>
        )}
      </motion.div>

      {/* スコア */}
      {analysis.status === 'completed' && (
        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-6"
          style={{
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`
          }}
        >
          <h2
            className="text-lg font-semibold mb-4"
            style={{ color: isDark ? '#ffffff' : '#0f172a' }}
          >
            AI構造化スコア
          </h2>
          <ScoreBar score={analysis.ai_structure_score} size="lg" isDark={isDark} />
        </motion.div>
      )}

      {/* メタデータ */}
      {analysis.metadata && Object.keys(analysis.metadata).length > 0 && (
        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-6 space-y-4"
          style={{
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`
          }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ color: isDark ? '#ffffff' : '#0f172a' }}
          >
            メタデータ
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {analysis.metadata.title && (
              <div>
                <div className="text-sm mb-1" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>タイトル</div>
                <div style={{ color: isDark ? '#ffffff' : '#0f172a' }}>{analysis.metadata.title}</div>
              </div>
            )}

            {analysis.metadata.description && (
              <div>
                <div className="text-sm mb-1" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>ディスクリプション</div>
                <div style={{ color: isDark ? '#ffffff' : '#0f172a' }}>{analysis.metadata.description}</div>
              </div>
            )}

            {analysis.metadata.canonical_url && (
              <div>
                <div className="text-sm mb-1" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>正規URL</div>
                <div className="break-all" style={{ color: '#a855f7' }}>
                  {analysis.metadata.canonical_url}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* 見出し */}
      {analysis.headings && Object.keys(analysis.headings).length > 0 && (
        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-6 space-y-4"
          style={{
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`
          }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ color: isDark ? '#ffffff' : '#0f172a' }}
          >
            見出し構造
          </h2>

          <div className="space-y-4">
            {Object.entries(analysis.headings).map(([level, headings]) => (
              Array.isArray(headings) && headings.length > 0 && (
                <div key={level}>
                  <div
                    className="text-sm font-medium mb-2"
                    style={{ color: '#a855f7' }}
                  >
                    {level.toUpperCase()} ({headings.length}件)
                  </div>
                  <ul className="space-y-1 ml-4">
                    {headings.map((heading: string, index: number) => (
                      <li
                        key={index}
                        className="text-sm"
                        style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                      >
                        • {heading}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            ))}
          </div>
        </motion.div>
      )}

      {/* 構造化データ */}
      {analysis.structured_data && Object.keys(analysis.structured_data).length > 0 && (
        <motion.div variants={itemVariants} className="space-y-4">
          <h2
            className="text-lg font-semibold"
            style={{ color: isDark ? '#ffffff' : '#0f172a' }}
          >
            構造化データ（JSON-LD）
          </h2>
          <JsonViewer data={analysis.structured_data} title="Structured Data" isDark={isDark} />
        </motion.div>
      )}

      {/* Fragment IDs */}
      {analysis.analysis_data?.fragment_ids && analysis.analysis_data.fragment_ids.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-6"
          style={{
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`
          }}
        >
          <h3
            className="text-lg font-semibold mb-4"
            style={{ color: isDark ? '#ffffff' : '#0f172a' }}
          >
            Fragment IDs ({analysis.analysis_data.fragment_ids.length}件)
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {analysis.analysis_data.fragment_ids.map((fragmentId: string, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}`
                }}
              >
                <code
                  className="text-sm break-all"
                  style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                >
                  {decodeURIComponent(fragmentId)}
                </code>
                <div className="flex items-center gap-2 ml-2 shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => copyFragmentUrl(fragmentId, index)}
                    className="p-2 rounded-lg transition-colors"
                    style={{
                      background: copiedFragment === index
                        ? 'rgba(34,211,238,0.1)'
                        : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
                      color: copiedFragment === index ? '#22d3ee' : '#a855f7'
                    }}
                    title="URLをコピー"
                  >
                    {copiedFragment === index ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </motion.button>
                  <a
                    href={`${analysis.url}#${fragmentId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm"
                    style={{ color: '#a855f7' }}
                  >
                    開く →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 生データ（開発用） */}
      <motion.details
        variants={itemVariants}
        className="rounded-2xl overflow-hidden"
        style={{
          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`
        }}
      >
        <summary
          className="px-6 py-4 cursor-pointer transition-colors font-medium"
          style={{ color: isDark ? '#ffffff' : '#0f172a' }}
        >
          生データを表示（開発用）
        </summary>
        <div
          className="border-t"
          style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}
        >
          <JsonViewer data={analysis} title="Raw Analysis Data" isDark={isDark} />
        </div>
      </motion.details>
    </motion.div>
  );
}
