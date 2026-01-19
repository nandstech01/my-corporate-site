'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileSearch, BarChart3, Settings, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAsoTheme } from '@/app/aso/context';

interface AsoSidebarProps {
  onItemClick: () => void;
}

const menuItems = [
  {
    icon: LayoutDashboard,
    label: 'ダッシュボード',
    href: '/aso/dashboard',
    description: 'KPI & Overview',
  },
  {
    icon: FileSearch,
    label: '分析一覧',
    href: '/aso/analyses',
    description: 'URL Analysis',
  },
  {
    icon: BarChart3,
    label: '統計',
    href: '/aso/stats',
    description: 'Analytics',
  },
  {
    icon: Settings,
    label: '設定',
    href: '/aso/settings',
    description: 'Settings',
  },
];

export default function AsoSidebar({ onItemClick }: AsoSidebarProps) {
  const pathname = usePathname();
  const { theme } = useAsoTheme();
  const isDark = theme === 'dark';

  return (
    <aside
      className="h-full flex flex-col border-r transition-colors duration-300"
      style={{
        background: isDark
          ? 'rgba(10, 22, 40, 0.95)'
          : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
      }}
    >
      {/* ロゴエリア */}
      <div
        className="p-6 border-b"
        style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}
      >
        <Link href="/aso/dashboard" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl opacity-50 blur group-hover:opacity-70 transition-opacity" />
            <div className="relative w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
          </motion.div>
          <div>
            <h2
              className="font-semibold tracking-tight"
              style={{ color: isDark ? '#ffffff' : '#0f172a' }}
            >
              ASO
            </h2>
            <p
              className="text-xs"
              style={{ color: isDark ? '#64748b' : '#94a3b8' }}
            >
              AI Search Optimizer
            </p>
          </div>
        </Link>
      </div>

      {/* ナビゲーションメニュー */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
            >
              <motion.div
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(34,211,238,0.15))'
                    : 'transparent',
                  border: isActive
                    ? '1px solid rgba(168,85,247,0.3)'
                    : '1px solid transparent'
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{
                    background: isActive
                      ? 'linear-gradient(135deg, #a855f7, #22d3ee)'
                      : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                  }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{
                      color: isActive
                        ? '#ffffff'
                        : isDark ? '#64748b' : '#94a3b8'
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div
                    className="text-sm font-medium"
                    style={{
                      color: isActive
                        ? (isDark ? '#ffffff' : '#0f172a')
                        : (isDark ? '#94a3b8' : '#64748b')
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    className="text-xs"
                    style={{
                      color: isActive
                        ? (isDark ? '#a855f7' : '#7c3aed')
                        : (isDark ? '#475569' : '#94a3b8')
                    }}
                  >
                    {item.description}
                  </div>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* フッター */}
      <div
        className="p-4 border-t"
        style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}
      >
        <div
          className="px-4 py-3 rounded-xl"
          style={{
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}`
          }}
        >
          <p
            className="text-xs"
            style={{ color: isDark ? '#475569' : '#94a3b8' }}
          >
            Version
          </p>
          <p
            className="text-sm font-medium"
            style={{ color: isDark ? '#94a3b8' : '#64748b' }}
          >
            1.0.0 Beta
          </p>
        </div>
      </div>
    </aside>
  );
}
