'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, ExternalLink, RefreshCw, Download, FileSearch, Copy, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ScoreBar from '@/components/clavi/ScoreBar';
import JsonViewer from '@/components/clavi/JsonViewer';
import { createClient } from '@/lib/supabase/browser';
import { useClaviTheme } from '@/app/clavi/context';
import ImprovementProposals from './ImprovementProposals';
import TopicConsistency from './TopicConsistency';
import LinkRecommendations from './LinkRecommendations';
import JsonLdDeploy from './JsonLdDeploy';
import WordPressGuide from './WordPressGuide';

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
  const { theme } = useClaviTheme();
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

      const response = await fetch(`/api/clavi/results/${id}`, {
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

      const response = await fetch('/api/clavi/analyze', {
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
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#A5F3FC] border-t-[#06B6D4]"></div>
          <p className="mt-4" style={{ color: isDark ? '#90c1cb' : '#64748B' }}>
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
            href="/clavi/analyses"
            className="inline-flex items-center gap-2 transition-colors"
            style={{ color: isDark ? '#90c1cb' : '#64748B' }}
          >
            <ArrowLeft className="w-4 h-4" />
            分析一覧に戻る
          </Link>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="rounded-xl p-12 text-center"
          style={{
            background: isDark ? '#182f34' : '#FFFFFF',
            border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`
          }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(239,68,68,0.1)' }}
          >
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h3
            className="text-base font-semibold mb-2"
            style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
          >
            {error || 'エラーが発生しました'}
          </h3>
          <p className="text-sm mb-6" style={{ color: isDark ? '#90c1cb' : '#64748B' }}>
            分析データを取得できませんでした
          </p>
          <Link href="/clavi/analyses">
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#0891B2] hover:bg-[#0E7490] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              分析一覧に戻る
            </button>
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
          href="/clavi/analyses"
          className="inline-flex items-center gap-2 transition-colors"
          style={{ color: isDark ? '#90c1cb' : '#64748B' }}
        >
          <ArrowLeft className="w-4 h-4" />
          分析一覧に戻る
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReanalyze}
            disabled={isReanalyzing}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: isDark ? '#224249' : '#F1F5F9',
              color: isDark ? '#E2E8F0' : '#334155',
              border: `1px solid ${isDark ? '#56737a' : '#E2E8F0'}`
            }}
          >
            <RefreshCw className={`w-4 h-4 ${isReanalyzing ? 'animate-spin' : ''}`} />
            再分析
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white bg-[#0891B2] hover:bg-[#0E7490] transition-colors"
          >
            <Download className="w-4 h-4" />
            エクスポート
          </button>
        </div>
      </motion.div>

      {/* 基本情報 */}
      <motion.div
        variants={itemVariants}
        className="rounded-xl p-6 space-y-4"
        style={{
          background: isDark ? '#182f34' : '#FFFFFF',
          border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`
        }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <h1
              className="text-2xl font-bold mb-2 break-all"
              style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
            >
              {analysis.url}
            </h1>
            <a
              href={analysis.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 transition-colors"
              style={{ color: '#06B6D4' }}
            >
              サイトを開く
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <span
            className="px-3 py-1.5 text-sm font-medium rounded-full"
            style={{
              background: analysis.status === 'completed'
                ? 'rgba(16,185,129,0.1)'
                : 'rgba(239,68,68,0.1)',
              color: analysis.status === 'completed' ? '#10B981' : '#ef4444'
            }}
          >
            {analysis.status === 'completed' ? '完了' : '失敗'}
          </span>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t"
          style={{ borderColor: isDark ? '#224249' : '#E2E8F0' }}
        >
          <div>
            <div className="text-sm mb-1" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>作成日時</div>
            <div style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              {new Date(analysis.created_at).toLocaleString('ja-JP')}
            </div>
          </div>
          <div>
            <div className="text-sm mb-1" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>更新日時</div>
            <div style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
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
          className="rounded-xl p-6"
          style={{
            background: isDark ? '#182f34' : '#FFFFFF',
            border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`
          }}
        >
          <h2
            className="text-lg font-semibold mb-4"
            style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
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
          className="rounded-xl p-6 space-y-4"
          style={{
            background: isDark ? '#182f34' : '#FFFFFF',
            border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`
          }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
          >
            メタデータ
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {analysis.metadata.title && (
              <div>
                <div className="text-sm mb-1" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>タイトル</div>
                <div style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{analysis.metadata.title}</div>
              </div>
            )}

            {analysis.metadata.description && (
              <div>
                <div className="text-sm mb-1" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>ディスクリプション</div>
                <div style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{analysis.metadata.description}</div>
              </div>
            )}

            {analysis.metadata.canonical_url && (
              <div>
                <div className="text-sm mb-1" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>正規URL</div>
                <div className="break-all" style={{ color: '#06B6D4' }}>
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
          className="rounded-xl p-6 space-y-4"
          style={{
            background: isDark ? '#182f34' : '#FFFFFF',
            border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`
          }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
          >
            見出し構造
          </h2>

          <div className="space-y-4">
            {Object.entries(analysis.headings).map(([level, headings]) => (
              Array.isArray(headings) && headings.length > 0 && (
                <div key={level}>
                  <div
                    className="text-sm font-medium mb-2"
                    style={{ color: '#06B6D4' }}
                  >
                    {level.toUpperCase()} ({headings.length}件)
                  </div>
                  <ul className="space-y-1 ml-4">
                    {headings.map((heading: string, index: number) => (
                      <li
                        key={index}
                        className="text-sm"
                        style={{ color: isDark ? '#90c1cb' : '#64748B' }}
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
            style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
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
          className="rounded-xl p-6"
          style={{
            background: isDark ? '#182f34' : '#FFFFFF',
            border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`
          }}
        >
          <h3
            className="text-lg font-semibold mb-4"
            style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
          >
            Fragment IDs ({analysis.analysis_data.fragment_ids.length}件)
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {analysis.analysis_data.fragment_ids.map((fragmentId: string, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{
                  background: isDark ? '#182f34' : '#F8FAFC',
                  border: `1px solid ${isDark ? '#224249' : '#F1F5F9'}`
                }}
              >
                <code
                  className="text-sm break-all"
                  style={{ color: isDark ? '#90c1cb' : '#64748B' }}
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
                        ? 'rgba(16,185,129,0.1)'
                        : (isDark ? '#224249' : '#F1F5F9'),
                      color: copiedFragment === index ? '#10B981' : '#06B6D4'
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
                    style={{ color: '#06B6D4' }}
                  >
                    開く →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 改善提案 */}
      {analysis.status === 'completed' && (
        <ImprovementProposals
          data={analysis.analysis_data?.improvement_proposals}
          isDark={isDark}
        />
      )}

      {/* トピック一貫性 */}
      {analysis.status === 'completed' && (
        <TopicConsistency
          data={analysis.analysis_data?.topic_consistency_score}
          isDark={isDark}
        />
      )}

      {/* 内部リンク推奨 */}
      {analysis.status === 'completed' && (
        <LinkRecommendations
          data={analysis.analysis_data?.link_recommendations}
          isDark={isDark}
        />
      )}

      {/* JSON-LD デプロイ */}
      {analysis.status === 'completed' && (
        <JsonLdDeploy
          structuredData={analysis.analysis_data?.structured_data || analysis.structured_data}
          mergeReport={analysis.analysis_data?.merge_report}
          isDark={isDark}
        />
      )}

      {/* WordPress プラグインガイド */}
      {analysis.status === 'completed' && (
        <WordPressGuide isDark={isDark} />
      )}

      {/* 生データ（開発用） */}
      <motion.details
        variants={itemVariants}
        className="rounded-xl overflow-hidden"
        style={{
          background: isDark ? '#182f34' : '#FFFFFF',
          border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`
        }}
      >
        <summary
          className="px-6 py-4 cursor-pointer transition-colors font-medium"
          style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
        >
          生データを表示（開発用）
        </summary>
        <div
          className="border-t"
          style={{ borderColor: isDark ? '#224249' : '#E2E8F0' }}
        >
          <JsonViewer data={analysis} title="Raw Analysis Data" isDark={isDark} />
        </div>
      </motion.details>
    </motion.div>
  );
}
