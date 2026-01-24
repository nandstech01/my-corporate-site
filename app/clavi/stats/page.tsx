'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import StatsKpiCards from '@/components/clavi/StatsKpiCards';
import StatsDailyChart from '@/components/clavi/StatsDailyChart';
import StatsScoreChart from '@/components/clavi/StatsScoreChart';
import StatsDistribution from '@/components/clavi/StatsDistribution';
import { useClaviTheme } from '@/app/clavi/context';

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

interface StatsData {
  kpi: {
    total_analyses: number;
    success_rate: number;
    average_score: number;
    this_month_count: number;
  };
  daily_counts: Array<{
    date: string;
    total_count: number;
    success_count: number;
  }>;
  daily_scores: Array<{
    date: string;
    avg_score: number;
  }>;
  score_distribution: Array<{
    range: string;
    count: number;
  }>;
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'7days' | '30days' | '3months'>('30days');
  const [error, setError] = useState<string | null>(null);
  const { theme } = useClaviTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 期間の計算
      const endDate = new Date();
      const startDate = new Date();
      switch (period) {
        case '7days':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '3months':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
      }

      // 簡易版: analysesAPIからデータ取得して計算
      const response = await fetch('/api/clavi/analyses?limit=1000', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const analyses = data.analyses || [];

        // 期間でフィルター
        const filteredAnalyses = analyses.filter((a: any) => {
          const createdAt = new Date(a.created_at);
          return createdAt >= startDate && createdAt <= endDate;
        });

        // KPI計算
        const totalCount = filteredAnalyses.length;
        const completedAnalyses = filteredAnalyses.filter((a: any) => a.status === 'completed');
        const successRate = totalCount > 0 ? (completedAnalyses.length / totalCount) * 100 : 0;
        const avgScore = completedAnalyses.length > 0
          ? completedAnalyses.reduce((sum: number, a: any) => sum + (a.ai_structure_score || 0), 0) / completedAnalyses.length
          : 0;

        // 今月の分析件数
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthCount = analyses.filter((a: any) => 
          new Date(a.created_at) >= thisMonthStart
        ).length;

        // 日次データ集計
        const dailyMap = new Map<string, { total: number; success: number; scores: number[] }>();
        filteredAnalyses.forEach((a: any) => {
          const date = new Date(a.created_at).toISOString().split('T')[0];
          if (!dailyMap.has(date)) {
            dailyMap.set(date, { total: 0, success: 0, scores: [] });
          }
          const entry = dailyMap.get(date)!;
          entry.total++;
          if (a.status === 'completed') {
            entry.success++;
            if (a.ai_structure_score !== null) {
              entry.scores.push(a.ai_structure_score);
            }
          }
        });

        const daily_counts = Array.from(dailyMap.entries())
          .map(([date, data]) => ({
            date,
            total_count: data.total,
            success_count: data.success,
          }))
          .sort((a, b) => a.date.localeCompare(b.date));

        const daily_scores = Array.from(dailyMap.entries())
          .filter(([_, data]) => data.scores.length > 0)
          .map(([date, data]) => ({
            date,
            avg_score: data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length,
          }))
          .sort((a, b) => a.date.localeCompare(b.date));

        // スコア分布
        const distributionMap = new Map<string, number>();
        const ranges = ['0-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80-89', '90-100'];
        ranges.forEach(r => distributionMap.set(r, 0));

        completedAnalyses.forEach((a: any) => {
          if (a.ai_structure_score !== null) {
            const score = a.ai_structure_score;
            const rangeIndex = Math.min(Math.floor(score / 10), 9);
            const range = ranges[rangeIndex];
            distributionMap.set(range, (distributionMap.get(range) || 0) + 1);
          }
        });

        const score_distribution = Array.from(distributionMap.entries())
          .map(([range, count]) => ({ range, count }));

        setStats({
          kpi: {
            total_analyses: totalCount,
            success_rate: successRate,
            average_score: avgScore,
            this_month_count: thisMonthCount,
          },
          daily_counts,
          daily_scores,
          score_distribution,
        });
      } else {
        setError('統計データの取得に失敗しました');
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('ネットワークエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ヘッダー */}
      <motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(34,211,238,0.2))'
            }}
          >
            <BarChart3 className="w-6 h-6" style={{ color: '#a855f7' }} />
          </div>
          <div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: isDark ? '#ffffff' : '#0f172a' }}
            >
              統計ダッシュボード
            </h1>
            <p style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
              分析データの統計・トレンド分析
            </p>
          </div>
        </div>

        {/* 期間選択 */}
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5" style={{ color: isDark ? '#64748b' : '#94a3b8' }} />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as '7days' | '30days' | '3months')}
            className="px-4 py-2.5 rounded-xl outline-none transition-all"
            style={{
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,1)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              color: isDark ? '#ffffff' : '#0f172a'
            }}
          >
            <option value="7days">過去7日間</option>
            <option value="30days">過去30日間</option>
            <option value="3months">過去3ヶ月</option>
          </select>
        </div>
      </motion.div>

      {/* エラー表示 */}
      {error && (
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-xl"
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)'
          }}
        >
          <p style={{ color: '#ef4444' }}>{error}</p>
        </motion.div>
      )}

      {/* KPIカード */}
      <motion.div variants={itemVariants}>
        <StatsKpiCards data={stats?.kpi || null} isLoading={isLoading} isDark={isDark} />
      </motion.div>

      {/* グラフエリア */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <StatsDailyChart data={stats?.daily_counts || []} isLoading={isLoading} isDark={isDark} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatsScoreChart data={stats?.daily_scores || []} isLoading={isLoading} isDark={isDark} />
        </motion.div>
      </div>

      {/* スコア分布 */}
      <motion.div variants={itemVariants}>
        <StatsDistribution data={stats?.score_distribution || []} isLoading={isLoading} isDark={isDark} />
      </motion.div>

      {/* フッター情報 */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl p-6"
        style={{
          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(34,211,238,0.2))'
            }}
          >
            <span className="text-2xl">💡</span>
          </div>
          <div>
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: isDark ? '#ffffff' : '#0f172a' }}
            >
              統計データの活用方法
            </h3>
            <ul className="space-y-2 text-sm" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
              <li>• <strong style={{ color: isDark ? '#ffffff' : '#0f172a' }}>日次推移グラフ</strong>: 分析活動のトレンドを把握し、ピーク時期を特定できます</li>
              <li>• <strong style={{ color: isDark ? '#ffffff' : '#0f172a' }}>スコア推移グラフ</strong>: サイト品質の改善傾向を可視化し、施策効果を測定できます</li>
              <li>• <strong style={{ color: isDark ? '#ffffff' : '#0f172a' }}>スコア分布</strong>: 全体的な品質レベルを把握し、改善優先度を判断できます</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

