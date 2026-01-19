'use client';

import { Filter, ArrowUpDown } from 'lucide-react';

interface Filters {
  status: string;
  startDate: string;
  endDate: string;
  minScore: string;
  maxScore: string;
  search: string;
}

interface AnalysesFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  sortBy: 'date' | 'score';
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: 'date' | 'score', sortOrder: 'asc' | 'desc') => void;
  isDark?: boolean;
}

export default function AnalysesFilters({
  filters,
  onFiltersChange,
  sortBy,
  sortOrder,
  onSortChange,
  isDark = true,
}: AnalysesFiltersProps) {
  const handleFilterChange = (key: keyof Filters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleReset = () => {
    onFiltersChange({
      status: 'all',
      startDate: '',
      endDate: '',
      minScore: '',
      maxScore: '',
      search: '',
    });
  };

  const toggleSort = (field: 'date' | 'score') => {
    if (sortBy === field) {
      onSortChange(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(field, 'desc');
    }
  };

  const inputStyle = {
    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,1)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
    color: isDark ? '#ffffff' : '#0f172a',
  };

  return (
    <div
      className="rounded-2xl p-6 space-y-4"
      style={{
        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5" style={{ color: '#a855f7' }} />
          <h3
            className="text-lg font-semibold"
            style={{ color: isDark ? '#ffffff' : '#0f172a' }}
          >
            フィルター & ソート
          </h3>
        </div>
        <button
          onClick={handleReset}
          className="px-3 py-1.5 text-sm rounded-lg transition-colors"
          style={{
            color: isDark ? '#94a3b8' : '#64748b',
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
          }}
        >
          リセット
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: isDark ? '#64748b' : '#94a3b8' }}
          >
            URL検索
          </label>
          <input
            type="text"
            placeholder="URLで検索..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl outline-none transition-all"
            style={inputStyle}
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: isDark ? '#64748b' : '#94a3b8' }}
          >
            ステータス
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl outline-none transition-all"
            style={inputStyle}
          >
            <option value="all">すべて</option>
            <option value="completed">完了</option>
            <option value="failed">失敗</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: isDark ? '#64748b' : '#94a3b8' }}
          >
            開始日
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl outline-none transition-all"
            style={inputStyle}
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: isDark ? '#64748b' : '#94a3b8' }}
          >
            終了日
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl outline-none transition-all"
            style={inputStyle}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: isDark ? '#64748b' : '#94a3b8' }}
          >
            最小スコア
          </label>
          <input
            type="number"
            min="0"
            max="100"
            placeholder="0"
            value={filters.minScore}
            onChange={(e) => handleFilterChange('minScore', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl outline-none transition-all"
            style={inputStyle}
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: isDark ? '#64748b' : '#94a3b8' }}
          >
            最大スコア
          </label>
          <input
            type="number"
            min="0"
            max="100"
            placeholder="100"
            value={filters.maxScore}
            onChange={(e) => handleFilterChange('maxScore', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl outline-none transition-all"
            style={inputStyle}
          />
        </div>
      </div>

      <div
        className="pt-4 border-t"
        style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4" style={{ color: isDark ? '#64748b' : '#94a3b8' }} />
          <span
            className="text-sm font-medium"
            style={{ color: isDark ? '#64748b' : '#94a3b8' }}
          >
            ソート:
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => toggleSort('date')}
              className="px-3 py-1.5 text-sm rounded-lg transition-colors"
              style={{
                background: sortBy === 'date'
                  ? 'linear-gradient(135deg, #a855f7, #22d3ee)'
                  : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                color: sortBy === 'date' ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b')
              }}
            >
              作成日時 {sortBy === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <button
              onClick={() => toggleSort('score')}
              className="px-3 py-1.5 text-sm rounded-lg transition-colors"
              style={{
                background: sortBy === 'score'
                  ? 'linear-gradient(135deg, #a855f7, #22d3ee)'
                  : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                color: sortBy === 'score' ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b')
              }}
            >
              スコア {sortBy === 'score' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
