'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Menu, X, LogOut, User, Sun, Moon, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAsoTheme } from '@/app/aso/context';

interface AsoHeaderProps {
  user: any;
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

export default function AsoHeader({ user, onMenuClick, isSidebarOpen }: AsoHeaderProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useAsoTheme();
  const isDark = theme === 'dark';

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/aso');
  };

  return (
    <header
      className="border-b transition-colors duration-300"
      style={{
        background: isDark
          ? 'rgba(10, 22, 40, 0.8)'
          : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
      }}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 左側: メニューボタン + ロゴ */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg transition-colors"
              style={{
                color: isDark ? '#9ca3af' : '#6b7280',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
              }}
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl opacity-50 blur" />
                <div className="relative w-9 h-9 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Layers className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <h1
                  className="text-lg font-semibold tracking-tight hidden sm:block"
                  style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                >
                  ASO
                </h1>
                <p
                  className="text-xs hidden md:block"
                  style={{ color: isDark ? '#64748b' : '#94a3b8' }}
                >
                  AI Search Optimizer
                </p>
              </div>
            </div>
          </div>

          {/* 右側: テーマ切替 + ユーザーメニュー */}
          <div className="flex items-center gap-2">
            {/* テーマ切替ボタン */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2.5 rounded-full transition-colors"
              style={{
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                color: isDark ? '#9ca3af' : '#6b7280'
              }}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>

            {user && (
              <>
                {/* ユーザー情報 */}
                <div
                  className="hidden md:flex items-center gap-3 px-3 py-2 rounded-xl"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(34,211,238,0.2))'
                    }}
                  >
                    <User className="w-4 h-4" style={{ color: isDark ? '#a855f7' : '#7c3aed' }} />
                  </div>
                  <div className="text-right">
                    <p
                      className="text-sm font-medium"
                      style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                    >
                      {user.email?.split('@')[0] || 'User'}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: isDark ? '#64748b' : '#94a3b8' }}
                    >
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* ログアウトボタン */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="p-2.5 rounded-full transition-colors"
                  style={{
                    background: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.05)',
                    color: '#ef4444'
                  }}
                  aria-label="Logout"
                  title="ログアウト"
                >
                  <LogOut className="w-5 h-5" />
                </motion.button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
