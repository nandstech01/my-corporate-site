'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface Analysis {
  id: string;
  url: string;
  status: string;
  ai_structure_score: number | null;
  created_at: string;
}

interface AnalysesTableProps {
  analyses: Analysis[];
  isDark?: boolean;
}

export default function AnalysesTable({ analyses, isDark = true }: AnalysesTableProps) {
  const getScoreStyle = (score: number | null) => {
    if (score === null) return { color: isDark ? '#64748b' : '#94a3b8', bg: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' };
    if (score >= 70) return { color: '#22d3ee', bg: 'rgba(34,211,238,0.1)' };
    if (score >= 50) return { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' };
    return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' };
  };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead
            className="border-b"
            style={{
              background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
            }}
          >
            <tr>
              <th
                className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: isDark ? '#64748b' : '#94a3b8' }}
              >
                URL
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: isDark ? '#64748b' : '#94a3b8' }}
              >
                ステータス
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: isDark ? '#64748b' : '#94a3b8' }}
              >
                スコア
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: isDark ? '#64748b' : '#94a3b8' }}
              >
                作成日時
              </th>
              <th
                className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider"
                style={{ color: isDark ? '#64748b' : '#94a3b8' }}
              >
                アクション
              </th>
            </tr>
          </thead>
          <tbody>
            {analyses.map((analysis, index) => (
              <tr
                key={analysis.id}
                className="transition-colors"
                style={{
                  borderBottom: index < analyses.length - 1
                    ? `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}`
                    : 'none'
                }}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 max-w-md">
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm font-medium truncate"
                        style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                      >
                        {analysis.url}
                      </div>
                      <a
                        href={analysis.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs inline-flex items-center gap-1 mt-1"
                        style={{ color: '#a855f7' }}
                      >
                        サイトを開く
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span
                    className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full"
                    style={{
                      background: analysis.status === 'completed'
                        ? 'rgba(34,211,238,0.1)'
                        : 'rgba(239,68,68,0.1)',
                      color: analysis.status === 'completed' ? '#22d3ee' : '#ef4444'
                    }}
                  >
                    {analysis.status === 'completed' ? '完了' : '失敗'}
                  </span>
                </td>

                <td className="px-6 py-4">
                  {analysis.ai_structure_score !== null ? (
                    <div className="flex items-center gap-2">
                      <div
                        className="inline-flex items-center justify-center w-12 h-12 rounded-xl"
                        style={{ background: getScoreStyle(analysis.ai_structure_score).bg }}
                      >
                        <span
                          className="text-lg font-bold"
                          style={{ color: getScoreStyle(analysis.ai_structure_score).color }}
                        >
                          {analysis.ai_structure_score}
                        </span>
                      </div>
                      <div className="text-xs" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>点</div>
                    </div>
                  ) : (
                    <span className="text-sm" style={{ color: isDark ? '#475569' : '#94a3b8' }}>-</span>
                  )}
                </td>

                <td className="px-6 py-4">
                  <div className="text-sm" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                    {new Date(analysis.created_at).toLocaleDateString('ja-JP')}
                  </div>
                  <div className="text-xs" style={{ color: isDark ? '#475569' : '#94a3b8' }}>
                    {new Date(analysis.created_at).toLocaleTimeString('ja-JP')}
                  </div>
                </td>

                <td className="px-6 py-4 text-right">
                  <Link href={`/aso/analyses/${analysis.id}`}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium text-white"
                      style={{ background: 'linear-gradient(135deg, #a855f7, #22d3ee)' }}
                    >
                      詳細
                    </motion.button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
