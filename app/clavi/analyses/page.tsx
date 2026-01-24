'use client';

import { useEffect, useState, useMemo } from 'react';
import { FileSearch, Plus, Activity, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/browser';
import AnalysesTable from '@/components/clavi/AnalysesTable';
import AnalysesFilters from '@/components/clavi/AnalysesFilters';
import NewAnalysisModal from '@/components/clavi/NewAnalysisModal';
import Pagination from '@/components/clavi/Pagination';
import { useClaviTheme } from '@/app/clavi/context';

interface Analysis {
  id: string;
  url: string;
  status: string;
  ai_structure_score: number | null;
  created_at: string;
}

interface Filters {
  status: string;
  startDate: string;
  endDate: string;
  minScore: string;
  maxScore: string;
  search: string;
}

export default function AnalysesPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState<Filters>({
    status: 'all',
    startDate: '',
    endDate: '',
    minScore: '',
    maxScore: '',
    search: '',
  });
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { theme } = useClaviTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    fetchAnalyses();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [analyses, filters, sortBy, sortOrder]);

  const fetchAnalyses = async () => {
    try {
      setIsLoading(true);

      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      const headers: HeadersInit = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/clavi/analyses?limit=1000', {
        credentials: 'include',
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setAnalyses(data.analyses || []);
      }
    } catch (error) {
      console.error('Error fetching analyses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...analyses];

    if (filters.status !== 'all') {
      filtered = filtered.filter((a) => a.status === filters.status);
    }

    if (filters.startDate) {
      filtered = filtered.filter((a) => new Date(a.created_at) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((a) => new Date(a.created_at) <= endDate);
    }

    if (filters.minScore) {
      const min = parseFloat(filters.minScore);
      filtered = filtered.filter((a) => a.ai_structure_score !== null && a.ai_structure_score >= min);
    }
    if (filters.maxScore) {
      const max = parseFloat(filters.maxScore);
      filtered = filtered.filter((a) => a.ai_structure_score !== null && a.ai_structure_score <= max);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((a) => a.url.toLowerCase().includes(searchLower));
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortBy === 'score') {
        const scoreA = a.ai_structure_score ?? -1;
        const scoreB = b.ai_structure_score ?? -1;
        comparison = scoreA - scoreB;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredAnalyses(filtered);
    setCurrentPage(1);
  };

  const handleNewAnalysis = async (url: string) => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/clavi/analyze', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        await fetchAnalyses();
        setIsModalOpen(false);
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.error || '分析に失敗しました' };
      }
    } catch (error) {
      console.error('Error creating analysis:', error);
      return { success: false, error: 'ネットワークエラーが発生しました' };
    }
  };

  const stats = useMemo(() => {
    const completed = analyses.filter((a) => a.status === 'completed');
    const withScore = completed.filter((a) => a.ai_structure_score !== null);
    const avgScore = withScore.length > 0
      ? Math.round(withScore.reduce((sum, a) => sum + (a.ai_structure_score ?? 0), 0) / withScore.length)
      : 0;
    const completionRate = analyses.length > 0
      ? Math.round((completed.length / analyses.length) * 100)
      : 0;

    return { total: analyses.length, avgScore, completionRate, completed: completed.length };
  }, [analyses]);

  const totalPages = Math.ceil(filteredAnalyses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAnalyses = filteredAnalyses.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="relative w-10 h-10 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-[#224249]" />
            <div className="absolute inset-0 rounded-full border-2 border-t-[#06B6D4] animate-spin" />
          </div>
          <p className="text-xs font-medium" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
            分析データを読み込み中...
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-5 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            分析一覧
          </h1>
          <p className="text-xs mt-0.5" style={{ color: isDark ? '#90c1cb' : '#64748B' }}>
            URLの構造化データとSEOスコアを分析・管理
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#06B6D4] hover:bg-[#0891B2] transition-colors shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          新規分析
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5 flex-shrink-0">
        <div
          className="p-3.5 rounded-xl"
          style={{
            background: isDark ? '#182f34' : '#FFFFFF',
            border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
          }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Activity className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
              総分析数
            </span>
          </div>
          <div className="text-xl font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            {stats.total}
          </div>
        </div>
        <div
          className="p-3.5 rounded-xl"
          style={{
            background: isDark ? '#182f34' : '#FFFFFF',
            border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
          }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
              平均スコア
            </span>
          </div>
          <div className="flex items-end gap-1.5">
            <span className="text-xl font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              {stats.avgScore}
            </span>
            <span className="text-[10px] font-medium mb-0.5" style={{ color: stats.avgScore >= 70 ? '#10B981' : stats.avgScore >= 50 ? '#F59E0B' : '#EF4444' }}>
              /100
            </span>
          </div>
        </div>
        <div
          className="p-3.5 rounded-xl"
          style={{
            background: isDark ? '#182f34' : '#FFFFFF',
            border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
          }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
              成功率
            </span>
          </div>
          <div className="flex items-end gap-1.5">
            <span className="text-xl font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              {stats.completionRate}%
            </span>
          </div>
        </div>
        <div
          className="p-3.5 rounded-xl"
          style={{
            background: isDark ? '#182f34' : '#FFFFFF',
            border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
          }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
              要対応
            </span>
          </div>
          <div className="text-xl font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            {analyses.filter((a) => a.status === 'failed').length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex-shrink-0 mb-4">
        <AnalysesFilters
          filters={filters}
          onFiltersChange={setFilters}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={(by, order) => {
            setSortBy(by);
            setSortOrder(order);
          }}
          isDark={isDark}
        />
      </div>

      {/* Table */}
      {currentAnalyses.length === 0 ? (
        <div
          className="flex-1 rounded-xl flex flex-col items-center justify-center p-12 text-center"
          style={{
            background: isDark ? '#182f34' : '#FFFFFF',
            border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
          }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
            style={{ background: isDark ? '#102023' : '#F8FAFC' }}
          >
            <FileSearch className="w-6 h-6" style={{ color: isDark ? '#6a8b94' : '#CBD5E1' }} />
          </div>
          <h3 className="text-sm font-bold mb-1" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            {analyses.length === 0 ? '分析がありません' : 'フィルター条件に一致する結果がありません'}
          </h3>
          <p className="text-xs mb-5" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
            {analyses.length === 0
              ? '新規分析ボタンからURLを入力して分析を開始してください'
              : 'フィルター条件を変更してもう一度お試しください'}
          </p>
          {analyses.length === 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#06B6D4] hover:bg-[#0891B2] transition-colors shadow-lg shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4" />
              新規分析を開始
            </button>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          <AnalysesTable analyses={currentAnalyses} isDark={isDark} />
          <div className="mt-4 flex-shrink-0">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={filteredAnalyses.length}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
              isDark={isDark}
            />
          </div>
        </div>
      )}

      {/* Modal */}
      <NewAnalysisModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleNewAnalysis}
        isDark={isDark}
      />
    </motion.div>
  );
}
