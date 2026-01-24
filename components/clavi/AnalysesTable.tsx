'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Eye } from 'lucide-react';

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

export default function AnalysesTable({ analyses, isDark = false }: AnalysesTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const getScoreColor = (score: number | null) => {
    if (score === null) return { text: isDark ? '#6a8b94' : '#94A3B8', bg: isDark ? '#224249' : '#E2E8F0' };
    if (score >= 70) return { text: '#10B981', bg: isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5' };
    if (score >= 50) return { text: '#F59E0B', bg: isDark ? 'rgba(245,158,11,0.15)' : '#FFFBEB' };
    return { text: '#EF4444', bg: isDark ? 'rgba(239,68,68,0.15)' : '#FEF2F2' };
  };

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: isDark ? '#182f34' : '#FFFFFF',
        border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
      }}
    >
      <div className="overflow-x-auto">
        {/* Table Header */}
        <div
          className="grid grid-cols-[1fr_90px_120px_110px_70px] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider"
          style={{
            background: isDark ? '#142628' : '#F8FAFC',
            borderBottom: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
            color: isDark ? '#6a8b94' : '#94A3B8',
          }}
        >
          <span>URL</span>
          <span>Status</span>
          <span>Score</span>
          <span>Date</span>
          <span className="text-right">Action</span>
        </div>

        {/* Rows */}
        {analyses.map((analysis) => {
          const sc = getScoreColor(analysis.ai_structure_score);
          const isHovered = hoveredRow === analysis.id;

          return (
            <div
              key={analysis.id}
              onMouseEnter={() => setHoveredRow(analysis.id)}
              onMouseLeave={() => setHoveredRow(null)}
              className="grid grid-cols-[1fr_90px_120px_110px_70px] px-4 py-3 items-center transition-colors cursor-pointer group"
              style={{
                background: isHovered ? (isDark ? 'rgba(6,182,212,0.05)' : '#F0FDFA') : 'transparent',
                borderBottom: `1px solid ${isDark ? '#1e3a3f' : '#F1F5F9'}`,
                borderLeft: isHovered ? '3px solid #06B6D4' : '3px solid transparent',
              }}
            >
              {/* URL */}
              <div className="min-w-0 pr-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium font-mono truncate" style={{ color: isDark ? '#E2E8F0' : '#334155' }}>
                    {analysis.url}
                  </span>
                  <a
                    href={analysis.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-3 h-3" style={{ color: '#06B6D4' }} />
                  </a>
                </div>
              </div>

              {/* Status */}
              <div>
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium"
                  style={{
                    background: analysis.status === 'completed'
                      ? isDark ? 'rgba(16,185,129,0.1)' : '#ECFDF5'
                      : isDark ? 'rgba(239,68,68,0.1)' : '#FEF2F2',
                    color: analysis.status === 'completed' ? '#10B981' : '#EF4444',
                    border: `1px solid ${analysis.status === 'completed'
                      ? isDark ? 'rgba(16,185,129,0.2)' : '#A7F3D0'
                      : isDark ? 'rgba(239,68,68,0.2)' : '#FECACA'}`,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: analysis.status === 'completed' ? '#10B981' : '#EF4444' }}
                  />
                  {analysis.status === 'completed' ? '完了' : '失敗'}
                </span>
              </div>

              {/* Score */}
              <div className="flex items-center gap-2">
                {analysis.ai_structure_score !== null ? (
                  <>
                    <div
                      className="w-12 h-1.5 rounded-full overflow-hidden"
                      style={{ background: isDark ? '#224249' : '#E2E8F0' }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${analysis.ai_structure_score}%`,
                          background: sc.text,
                          boxShadow: `0 0 4px ${sc.text}`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold tabular-nums" style={{ color: sc.text }}>
                      {analysis.ai_structure_score}
                    </span>
                  </>
                ) : (
                  <span className="text-[11px]" style={{ color: isDark ? '#56737a' : '#CBD5E1' }}>-</span>
                )}
              </div>

              {/* Date */}
              <div>
                <div className="text-[11px] font-medium" style={{ color: isDark ? '#E2E8F0' : '#334155' }}>
                  {new Date(analysis.created_at).toLocaleDateString('ja-JP')}
                </div>
                <div className="text-[10px]" style={{ color: isDark ? '#56737a' : '#CBD5E1' }}>
                  {new Date(analysis.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* Action */}
              <div className="text-right">
                <Link
                  href={`/clavi/analyses/${analysis.id}`}
                  className="inline-flex items-center p-1.5 rounded-lg transition-colors"
                  style={{
                    color: isHovered ? '#06B6D4' : isDark ? '#56737a' : '#94A3B8',
                    background: isHovered ? (isDark ? 'rgba(6,182,212,0.1)' : '#ECFEFF') : 'transparent',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Eye className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
