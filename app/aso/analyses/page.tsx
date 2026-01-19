'use client';

import { useEffect, useState } from 'react';
import { FileSearch, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import AnalysesTable from '@/components/aso/AnalysesTable';
import AnalysesFilters from '@/components/aso/AnalysesFilters';
import NewAnalysisModal from '@/components/aso/NewAnalysisModal';
import Pagination from '@/components/aso/Pagination';
import { useAsoTheme } from '@/app/aso/context';

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
  const { theme } = useAsoTheme();
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

      const response = await fetch('/api/aso/analyses?limit=1000', {
        credentials: 'include',
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setAnalyses(data.analyses || []);
      } else {
        console.error('Failed to fetch analyses:', response.status);
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

      const response = await fetch('/api/aso/analyze', {
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

  const totalPages = Math.ceil(filteredAnalyses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAnalyses = filteredAnalyses.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-purple-500/20 border-t-purple-500"></div>
          <p className="mt-4" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
            Loading analyses...
          </p>
        </div>
      </div>
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
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(34,211,238,0.2))'
            }}
          >
            <FileSearch className="w-6 h-6" style={{ color: '#a855f7' }} />
          </div>
          <div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: isDark ? '#ffffff' : '#0f172a' }}
            >
              分析一覧
            </h1>
            <p style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
              {filteredAnalyses.length} 件の分析結果
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 text-white"
          style={{ background: 'linear-gradient(135deg, #a855f7, #22d3ee)' }}
        >
          <Plus className="w-5 h-5" />
          新規分析
        </motion.button>
      </motion.div>

      {/* フィルター */}
      <motion.div variants={itemVariants}>
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
      </motion.div>

      {/* テーブル */}
      {currentAnalyses.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-12 text-center"
          style={{
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`
          }}
        >
          <FileSearch
            className="w-12 h-12 mx-auto mb-4"
            style={{ color: isDark ? '#475569' : '#94a3b8' }}
          />
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: isDark ? '#ffffff' : '#0f172a' }}
          >
            {analyses.length === 0 ? '分析がありません' : 'フィルター条件に一致する結果がありません'}
          </h3>
          <p className="mb-6" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
            {analyses.length === 0
              ? '新規分析ボタンからURLを入力して分析を開始してください'
              : 'フィルター条件を変更してもう一度お試しください'}
          </p>
          {analyses.length === 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 rounded-xl font-medium transition-colors inline-flex items-center gap-2 text-white"
              style={{ background: 'linear-gradient(135deg, #a855f7, #22d3ee)' }}
            >
              <Plus className="w-5 h-5" />
              新規分析を開始
            </motion.button>
          )}
        </motion.div>
      ) : (
        <>
          <motion.div variants={itemVariants}>
            <AnalysesTable analyses={currentAnalyses} isDark={isDark} />
          </motion.div>

          <motion.div variants={itemVariants}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={filteredAnalyses.length}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
              isDark={isDark}
            />
          </motion.div>
        </>
      )}

      {/* 新規分析モーダル */}
      <NewAnalysisModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleNewAnalysis}
        isDark={isDark}
      />
    </motion.div>
  );
}
