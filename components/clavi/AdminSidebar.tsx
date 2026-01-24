'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Activity,
  BarChart3,
  Shield,
  ArrowLeft,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useClaviTheme } from '@/app/clavi/context';

interface AdminSidebarProps {
  onItemClick: () => void;
}

const menuItems = [
  {
    icon: LayoutDashboard,
    label: '管理ダッシュボード',
    href: '/clavi/admin',
    description: 'Overview',
  },
  {
    icon: Building2,
    label: 'テナント管理',
    href: '/clavi/admin/tenants',
    description: 'Tenants',
  },
  {
    icon: Activity,
    label: 'ジョブ監視',
    href: '/clavi/admin/jobs',
    description: 'Jobs',
  },
  {
    icon: BarChart3,
    label: 'システム統計',
    href: '/clavi/admin/stats',
    description: 'Analytics',
  },
];

export default function AdminSidebar({ onItemClick }: AdminSidebarProps) {
  const pathname = usePathname();
  const { theme } = useClaviTheme();
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
        <Link href="/clavi/admin" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl opacity-50 blur group-hover:opacity-70 transition-opacity" />
            <div className="relative w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
          </motion.div>
          <div>
            <h2
              className="font-semibold tracking-tight"
              style={{ color: isDark ? '#ffffff' : '#0f172a' }}
            >
              CLAVI Admin
            </h2>
            <p
              className="text-xs"
              style={{ color: isDark ? '#64748b' : '#94a3b8' }}
            >
              Platform Management
            </p>
          </div>
        </Link>
      </div>

      {/* 戻るリンク */}
      <div
        className="px-4 py-3 border-b"
        style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}
      >
        <Link
          href="/clavi/dashboard"
          className="flex items-center gap-2 text-sm transition-colors"
          style={{ color: isDark ? '#64748b' : '#94a3b8' }}
          onClick={onItemClick}
        >
          <ArrowLeft className="w-4 h-4" />
          クライアント画面へ戻る
        </Link>
      </div>

      {/* ナビゲーションメニュー */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href ||
            (item.href !== '/clavi/admin' && pathname.startsWith(item.href + '/'));

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
                    ? 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(239,68,68,0.15))'
                    : 'transparent',
                  border: isActive
                    ? '1px solid rgba(249,115,22,0.3)'
                    : '1px solid transparent'
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{
                    background: isActive
                      ? 'linear-gradient(135deg, #f97316, #ef4444)'
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
                        ? (isDark ? '#f97316' : '#ea580c')
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
            background: isDark ? 'rgba(249,115,22,0.1)' : 'rgba(249,115,22,0.05)',
            border: `1px solid ${isDark ? 'rgba(249,115,22,0.2)' : 'rgba(249,115,22,0.1)'}`
          }}
        >
          <p
            className="text-xs"
            style={{ color: isDark ? '#f97316' : '#ea580c' }}
          >
            Admin Mode
          </p>
          <p
            className="text-sm font-medium"
            style={{ color: isDark ? '#fb923c' : '#f97316' }}
          >
            Platform Administrator
          </p>
        </div>
      </div>
    </aside>
  );
}
