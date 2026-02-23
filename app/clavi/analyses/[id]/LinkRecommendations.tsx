'use client';

import { motion } from 'framer-motion';
import { Link2, ExternalLink } from 'lucide-react';

interface LinkRecommendation {
  target_title: string;
  target_uri: string;
  similarity: number;
  reason: string;
}

interface FragmentLinks {
  fragment_id: string;
  recommendations: LinkRecommendation[];
}

interface LinkData {
  fragments: FragmentLinks[];
  summary: {
    total_fragments: number;
    avg_recommendations: number;
    strong_links: number;
    moderate_links: number;
  };
}

interface Props {
  data: LinkData | undefined;
  isDark: boolean;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

function getSimilarityColor(similarity: number): string {
  if (similarity >= 0.8) return '#10B981';
  if (similarity >= 0.6) return '#F59E0B';
  return '#EF4444';
}

export default function LinkRecommendations({ data, isDark }: Props) {
  if (!data) {
    return (
      <motion.div
        variants={itemVariants}
        className="rounded-xl p-8 text-center"
        style={{
          background: isDark ? '#182f34' : '#FFFFFF',
          border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
        }}
      >
        <Link2 className="w-8 h-8 mx-auto mb-3" style={{ color: isDark ? '#56737a' : '#94A3B8' }} />
        <p className="text-sm" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
          分析を実行して内部リンク推奨を表示
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={itemVariants}
      className="rounded-xl p-6 space-y-5"
      style={{
        background: isDark ? '#182f34' : '#FFFFFF',
        border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
      }}
    >
      <h2 className="text-lg font-semibold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
        内部リンク推奨
      </h2>

      {/* Summary stats */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl"
        style={{
          background: isDark ? '#142628' : '#F8FAFC',
          border: `1px solid ${isDark ? '#1e3a3f' : '#F1F5F9'}`,
        }}
      >
        {[
          { label: 'フラグメント数', value: data.summary.total_fragments },
          { label: '平均推奨数', value: data.summary.avg_recommendations.toFixed(1) },
          { label: '強い関連', value: data.summary.strong_links, color: '#10B981' },
          { label: '中程度の関連', value: data.summary.moderate_links, color: '#F59E0B' },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-xs mb-1" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
              {stat.label}
            </div>
            <div
              className="text-sm font-semibold"
              style={{ color: stat.color || (isDark ? '#F8FAFC' : '#0F172A') }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Fragment groups */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto">
        {data.fragments.map((fragment, fi) => (
          <div
            key={fi}
            className="rounded-xl overflow-hidden"
            style={{
              background: isDark ? '#1a3338' : '#F8FAFC',
              border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
            }}
          >
            <div
              className="px-4 py-2.5 text-xs font-mono font-medium"
              style={{
                color: '#06B6D4',
                background: isDark ? '#142628' : '#F1F5F9',
                borderBottom: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
              }}
            >
              {decodeURIComponent(fragment.fragment_id)}
            </div>
            <div className="divide-y" style={{ borderColor: isDark ? '#1e3a3f' : '#F1F5F9' }}>
              {fragment.recommendations.map((rec, ri) => (
                <div key={ri} className="px-4 py-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-medium truncate"
                        style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
                      >
                        {rec.target_title}
                      </span>
                      <a
                        href={rec.target_uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0"
                      >
                        <ExternalLink className="w-3 h-3" style={{ color: '#06B6D4' }} />
                      </a>
                    </div>
                    <p className="text-xs mt-1" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
                      {rec.reason}
                    </p>
                  </div>
                  <span
                    className="text-xs font-bold shrink-0 px-2 py-0.5 rounded-full"
                    style={{
                      color: getSimilarityColor(rec.similarity),
                      background: `${getSimilarityColor(rec.similarity)}15`,
                    }}
                  >
                    {(rec.similarity * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
