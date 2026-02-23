'use client';

import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

interface FragmentDeviation {
  fragment_id: string;
  similarity: number;
}

interface TopicConsistencyResult {
  score: number;
  grade: string;
  assessment: string;
  recommendations: string[];
  deviations: FragmentDeviation[];
  statistics: {
    mean: number;
    min: number;
    max: number;
    stdDev: number;
  };
}

interface Props {
  data: TopicConsistencyResult | undefined;
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

function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A': return '#10B981';
    case 'B': return '#34D399';
    case 'C': return '#F59E0B';
    case 'D': return '#F97316';
    case 'F': return '#EF4444';
    default: return '#6B7280';
  }
}

function getBarColor(similarity: number): string {
  if (similarity >= 0.8) return '#10B981';
  if (similarity >= 0.6) return '#F59E0B';
  return '#EF4444';
}

export default function TopicConsistency({ data, isDark }: Props) {
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
        <BarChart3 className="w-8 h-8 mx-auto mb-3" style={{ color: isDark ? '#56737a' : '#94A3B8' }} />
        <p className="text-sm" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
          分析を実行してトピック一貫性を表示
        </p>
      </motion.div>
    );
  }

  const gradeColor = getGradeColor(data.grade);

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
        トピック一貫性
      </h2>

      {/* Score + Grade */}
      <div className="flex items-center gap-6">
        <div className="flex items-baseline gap-2">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl font-bold"
            style={{ color: gradeColor }}
          >
            {data.grade}
          </motion.span>
          <span className="text-sm" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
            ({(data.score * 100).toFixed(1)}%)
          </span>
        </div>
        <p className="text-sm flex-1" style={{ color: isDark ? '#90c1cb' : '#64748B' }}>
          {data.assessment}
        </p>
      </div>

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            推奨事項
          </h3>
          <ul className="space-y-1">
            {data.recommendations.map((rec, i) => (
              <li
                key={i}
                className="text-xs pl-3 border-l-2"
                style={{ color: isDark ? '#90c1cb' : '#64748B', borderColor: '#06B6D4' }}
              >
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Fragment deviations */}
      {data.deviations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            フラグメント類似度
          </h3>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {data.deviations.map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <span
                  className="text-xs font-mono w-32 truncate shrink-0"
                  style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}
                  title={decodeURIComponent(d.fragment_id)}
                >
                  {decodeURIComponent(d.fragment_id)}
                </span>
                <div
                  className="flex-1 h-3 rounded-full overflow-hidden"
                  style={{ background: isDark ? '#224249' : '#E2E8F0' }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(d.similarity * 100).toFixed(0)}%` }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                    className="h-full rounded-full"
                    style={{ background: getBarColor(d.similarity) }}
                  />
                </div>
                <span
                  className="text-xs font-medium w-12 text-right shrink-0"
                  style={{ color: getBarColor(d.similarity) }}
                >
                  {(d.similarity * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistics panel */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl"
        style={{
          background: isDark ? '#142628' : '#F8FAFC',
          border: `1px solid ${isDark ? '#1e3a3f' : '#F1F5F9'}`,
        }}
      >
        {[
          { label: 'Mean', value: (data.statistics.mean * 100).toFixed(1) + '%' },
          { label: 'Min', value: (data.statistics.min * 100).toFixed(1) + '%' },
          { label: 'Max', value: (data.statistics.max * 100).toFixed(1) + '%' },
          { label: 'StdDev', value: (data.statistics.stdDev * 100).toFixed(2) + '%' },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-xs mb-1" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
              {stat.label}
            </div>
            <div className="text-sm font-semibold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
