'use client';

import { motion } from 'framer-motion';

interface ScoreBarProps {
  score: number | null;
  size?: 'sm' | 'md' | 'lg';
  isDark?: boolean;
}

export default function ScoreBar({ score, size = 'md', isDark = false }: ScoreBarProps) {
  if (score === null) {
    return (
      <div className="flex items-center gap-3">
        <div
          className="flex-1 rounded-full h-2"
          style={{ background: isDark ? '#224249' : '#E2E8F0' }}
        />
        <span style={{ color: isDark ? '#6a8b94' : '#94A3B8' }} className="font-semibold text-sm">N/A</span>
      </div>
    );
  }

  const getScoreGradient = (s: number) => {
    if (s >= 70) return 'linear-gradient(90deg, #10B981, #34D399)';
    if (s >= 50) return 'linear-gradient(90deg, #F59E0B, #FBBF24)';
    return 'linear-gradient(90deg, #EF4444, #F87171)';
  };

  const getScoreColor = (s: number) => {
    if (s >= 70) return '#10B981';
    if (s >= 50) return '#F59E0B';
    return '#EF4444';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 90) return '優秀';
    if (s >= 70) return '良好';
    if (s >= 50) return '改善余地あり';
    return '要改善';
  };

  const sizeClasses = {
    sm: { bar: 'h-1.5', text: 'text-lg', label: 'text-xs' },
    md: { bar: 'h-2', text: 'text-2xl', label: 'text-xs' },
    lg: { bar: 'h-3', text: 'text-3xl', label: 'text-sm' },
  };

  const classes = sizeClasses[size];
  const color = getScoreColor(score);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-1.5">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${classes.text} font-bold`}
            style={{ color }}
          >
            {score}
          </motion.span>
          <span className="text-xs" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>/ 100</span>
        </div>
        <span
          className={`${classes.label} font-medium px-2 py-0.5 rounded-md`}
          style={{
            background: `${color}15`,
            color,
          }}
        >
          {getScoreLabel(score)}
        </span>
      </div>

      <div
        className={`rounded-full ${classes.bar} overflow-hidden`}
        style={{ background: isDark ? '#224249' : '#E2E8F0' }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className={`${classes.bar} rounded-full`}
          style={{ background: getScoreGradient(score) }}
        />
      </div>
    </div>
  );
}
