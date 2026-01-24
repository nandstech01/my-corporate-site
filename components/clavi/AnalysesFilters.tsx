'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, X, ArrowUpDown } from 'lucide-react';

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
  isDark = false,
}: AnalysesFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

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

  const hasActiveFilters = filters.status !== 'all' || filters.startDate || filters.endDate || filters.minScore || filters.maxScore;

  const statusFilters = [
    { id: 'all', label: 'すべて' },
    { id: 'completed', label: '完了', dotColor: '#10B981' },
    { id: 'failed', label: '失敗', dotColor: '#EF4444' },
  ];

  return (
    <div className="space-y-3">
      {/* Search + Status Chips + Sort */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div
          className="flex items-center rounded-lg px-3 py-2 flex-1 max-w-sm"
          style={{
            background: isDark ? '#182f34' : '#FFFFFF',
            border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
          }}
        >
          <Search className="w-4 h-4 mr-2" style={{ color: isDark ? '#56737a' : '#94A3B8' }} />
          <input
            type="text"
            placeholder="URLで検索..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="bg-transparent border-none text-xs focus:ring-0 focus:outline-none p-0 w-full"
            style={{ color: isDark ? '#E2E8F0' : '#334155' }}
          />
          {filters.search && (
            <button onClick={() => handleFilterChange('search', '')} className="ml-1">
              <X className="w-3.5 h-3.5" style={{ color: isDark ? '#56737a' : '#94A3B8' }} />
            </button>
          )}
        </div>

        {/* Status Chips */}
        <div className="flex items-center gap-1.5">
          {statusFilters.map((s) => (
            <button
              key={s.id}
              onClick={() => handleFilterChange('status', s.id)}
              className="flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[11px] font-medium transition-colors"
              style={{
                background: filters.status === s.id
                  ? isDark ? 'rgba(6,182,212,0.15)' : '#ECFEFF'
                  : isDark ? '#224249' : '#F1F5F9',
                border: `1px solid ${filters.status === s.id ? '#06B6D4' : isDark ? '#2d5359' : '#E2E8F0'}`,
                color: filters.status === s.id
                  ? '#06B6D4'
                  : isDark ? '#E2E8F0' : '#334155',
              }}
            >
              {s.dotColor && (
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dotColor }} />
              )}
              {s.label}
            </button>
          ))}
        </div>

        {/* Sort Buttons */}
        <div className="flex items-center gap-1.5 ml-auto">
          <ArrowUpDown className="w-3.5 h-3.5" style={{ color: isDark ? '#56737a' : '#94A3B8' }} />
          <button
            onClick={() => toggleSort('date')}
            className="h-7 px-2.5 rounded-full text-[11px] font-medium transition-colors"
            style={{
              background: sortBy === 'date' ? '#06B6D4' : isDark ? '#224249' : '#F1F5F9',
              color: sortBy === 'date' ? '#FFFFFF' : isDark ? '#E2E8F0' : '#334155',
              border: `1px solid ${sortBy === 'date' ? '#06B6D4' : isDark ? '#2d5359' : '#E2E8F0'}`,
            }}
          >
            日付 {sortBy === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
          <button
            onClick={() => toggleSort('score')}
            className="h-7 px-2.5 rounded-full text-[11px] font-medium transition-colors"
            style={{
              background: sortBy === 'score' ? '#06B6D4' : isDark ? '#224249' : '#F1F5F9',
              color: sortBy === 'score' ? '#FFFFFF' : isDark ? '#E2E8F0' : '#334155',
              border: `1px solid ${sortBy === 'score' ? '#06B6D4' : isDark ? '#2d5359' : '#E2E8F0'}`,
            }}
          >
            スコア {sortBy === 'score' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
        </div>

        {/* Advanced Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1 h-7 px-2.5 rounded-full text-[11px] font-medium transition-colors"
          style={{
            background: showAdvanced || hasActiveFilters
              ? isDark ? 'rgba(6,182,212,0.15)' : '#ECFEFF'
              : isDark ? '#224249' : '#F1F5F9',
            border: `1px solid ${showAdvanced || hasActiveFilters ? '#06B6D4' : isDark ? '#2d5359' : '#E2E8F0'}`,
            color: showAdvanced || hasActiveFilters ? '#06B6D4' : isDark ? '#E2E8F0' : '#334155',
          }}
        >
          <SlidersHorizontal className="w-3 h-3" />
          詳細
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]" />
          )}
        </button>
      </div>

      {/* Advanced Filters (collapsible) */}
      {showAdvanced && (
        <div
          className="rounded-xl p-4"
          style={{
            background: isDark ? '#182f34' : '#FFFFFF',
            border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
              詳細フィルター
            </span>
            {hasActiveFilters && (
              <button
                onClick={handleReset}
                className="text-[10px] font-medium text-[#06B6D4] hover:underline"
              >
                リセット
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-medium mb-1" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
                開始日
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs outline-none"
                style={{
                  background: isDark ? '#102023' : '#F8FAFC',
                  border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
                  color: isDark ? '#E2E8F0' : '#334155',
                }}
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium mb-1" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
                終了日
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs outline-none"
                style={{
                  background: isDark ? '#102023' : '#F8FAFC',
                  border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
                  color: isDark ? '#E2E8F0' : '#334155',
                }}
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium mb-1" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
                最小スコア
              </label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="0"
                value={filters.minScore}
                onChange={(e) => handleFilterChange('minScore', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs outline-none"
                style={{
                  background: isDark ? '#102023' : '#F8FAFC',
                  border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
                  color: isDark ? '#E2E8F0' : '#334155',
                }}
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium mb-1" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
                最大スコア
              </label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="100"
                value={filters.maxScore}
                onChange={(e) => handleFilterChange('maxScore', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs outline-none"
                style={{
                  background: isDark ? '#102023' : '#F8FAFC',
                  border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
                  color: isDark ? '#E2E8F0' : '#334155',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
