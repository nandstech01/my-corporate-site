'use client';

import { motion } from 'framer-motion';

interface ScoreBarProps {
  score: number | null;
  size?: 'sm' | 'md' | 'lg';
  isDark?: boolean;
}

export default function ScoreBar({ score, size = 'md', isDark = true }: ScoreBarProps) {
  if (score === null) {
    return (
      <div className="flex items-center gap-3">
        <div
          className="flex-1 rounded-full h-2"
          style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
        >
          <div className="h-full rounded-full" style={{ width: '0%', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
        </div>
        <span style={{ color: isDark ? '#64748b' : '#94a3b8' }} className="font-semibold">N/A</span>
      </div>
    );
  }

  const getScoreGradient = (score: number) => {
    if (score >= 70) return 'linear-gradient(90deg, #22d3ee, #4ade80)';
    if (score >= 50) return 'linear-gradient(90deg, #f59e0b, #fbbf24)';
    return 'linear-gradient(90deg, #ef4444, #f87171)';
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 70) return '#22d3ee';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return '優秀';
    if (score >= 70) return '良好';
    if (score >= 50) return '改善余地あり';
    return '要改善';
  };

  const getScoreBadgeStyle = (score: number) => {
    if (score >= 70) return { background: 'rgba(34,211,238,0.1)', color: '#22d3ee' };
    if (score >= 50) return { background: 'rgba(245,158,11,0.1)', color: '#f59e0b' };
    return { background: 'rgba(239,68,68,0.1)', color: '#ef4444' };
  };

  const sizeClasses = {
    sm: { bar: 'h-2', text: 'text-lg', label: 'text-xs' },
    md: { bar: 'h-3', text: 'text-2xl', label: 'text-sm' },
    lg: { bar: 'h-4', text: 'text-4xl', label: 'text-base' },
  };

  const classes = sizeClasses[size];
  const badgeStyle = getScoreBadgeStyle(score);

  return (
    <div className="space-y-3">
      {/* スコア表示 */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${classes.text} font-bold`}
            style={{ color: getScoreTextColor(score) }}
          >
            {score}
          </motion.span>
          <span style={{ color: isDark ? '#64748b' : '#94a3b8' }}>/ 100点</span>
        </div>
        <span
          className={`${classes.label} font-medium px-3 py-1 rounded-full`}
          style={badgeStyle}
        >
          {getScoreLabel(score)}
        </span>
      </div>

      {/* プログレスバー */}
      <div className="space-y-2">
        <div
          className={`flex-1 rounded-full ${classes.bar} overflow-hidden`}
          style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`${classes.bar} rounded-full`}
            style={{ background: getScoreGradient(score) }}
          />
        </div>

        {/* スケール */}
        <div className="flex justify-between text-xs" style={{ color: isDark ? '#475569' : '#94a3b8' }}>
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      </div>

      {/* 説明 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-sm"
        style={{ color: isDark ? '#94a3b8' : '#64748b' }}
      >
        {score >= 90 && (
          <p>優秀な構造化データです。検索エンジンに最適化されています。</p>
        )}
        {score >= 70 && score < 90 && (
          <p>良好な構造化データです。基本的な最適化が施されています。</p>
        )}
        {score >= 50 && score < 70 && (
          <p>改善の余地があります。追加の構造化データを検討してください。</p>
        )}
        {score < 50 && (
          <p>構造化データが不足しています。メタデータの追加を強く推奨します。</p>
        )}
      </motion.div>
    </div>
  );
}
