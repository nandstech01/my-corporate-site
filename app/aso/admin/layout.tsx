'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import AsoHeader from '@/components/aso/AsoHeader';
import AdminSidebar from '@/components/aso/AdminSidebar';
import { AsoThemeContext } from '../context';
import { Shield, AlertTriangle } from 'lucide-react';

type Theme = 'light' | 'dark';

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem('aso-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTheme(getInitialTheme());
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('aso-theme', newTheme);
  };

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/aso/login');
          return;
        }

        setUser({ id: user.id, email: user.email || '' });

        // 管理者権限チェック（APIを呼び出して確認）
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch('/api/aso/admin/stats?period=7d', {
          credentials: 'include',
          headers: session?.access_token
            ? { 'Authorization': `Bearer ${session.access_token}` }
            : {},
        });

        if (response.status === 403) {
          setError('管理者権限がありません');
          setIsAdmin(false);
        } else if (response.status === 401) {
          router.push('/aso/login');
          return;
        } else if (response.ok) {
          setIsAdmin(true);
        } else {
          setError('認証エラーが発生しました');
        }
      } catch (err) {
        console.error('Admin auth check failed:', err);
        setError('認証エラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAuth();
  }, [router, pathname]);

  const isDark = theme === 'dark';

  if (isLoading || !mounted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #0A1628 0%, #0D1B2A 50%, #050A14 100%)'
        }}
      >
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-orange-500/20 border-t-orange-500"></div>
          <p className="mt-4 text-gray-400">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #0A1628 0%, #0D1B2A 50%, #050A14 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)'
        }}
      >
        <div
          className="max-w-md w-full mx-4 p-8 rounded-2xl text-center"
          style={{
            background: isDark
              ? 'rgba(255,255,255,0.03)'
              : 'rgba(255,255,255,0.8)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
          }}
        >
          <div
            className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(249,115,22,0.2))'
            }}
          >
            <AlertTriangle className="w-8 h-8" style={{ color: '#ef4444' }} />
          </div>

          <h1
            className="text-xl font-bold mb-2"
            style={{ color: isDark ? '#ffffff' : '#0f172a' }}
          >
            アクセス拒否
          </h1>

          <p
            className="mb-6"
            style={{ color: isDark ? '#64748b' : '#94a3b8' }}
          >
            {error || '管理者権限がありません。'}
          </p>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/aso/dashboard')}
              className="w-full py-3 px-4 rounded-xl font-medium transition-all"
              style={{
                background: 'linear-gradient(135deg, #a855f7, #22d3ee)',
                color: '#ffffff',
              }}
            >
              ダッシュボードへ戻る
            </button>

            <p
              className="text-sm"
              style={{ color: isDark ? '#475569' : '#94a3b8' }}
            >
              ログイン中: {user?.email}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AsoThemeContext.Provider value={{ theme, toggleTheme }}>
      <div
        className="min-h-screen transition-colors duration-300"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #0A1628 0%, #0D1B2A 50%, #050A14 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)'
        }}
      >
        {/* ヘッダー */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <AsoHeader
            user={user}
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
          />
        </div>

        {/* モバイル用オーバーレイ */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* サイドバー */}
        <div className={`
          fixed top-0 bottom-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out
          lg:transform-none lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <AdminSidebar onItemClick={() => setIsSidebarOpen(false)} />
        </div>

        {/* メインコンテンツエリア */}
        <div className="lg:ml-64">
          <main className="p-4 sm:p-6 min-h-screen pt-20 lg:pt-24">
            <div className="max-w-7xl mx-auto">
              {/* 管理者バッジ */}
              <div
                className="mb-6 flex items-center gap-2 px-4 py-2 rounded-lg w-fit"
                style={{
                  background: isDark
                    ? 'rgba(249,115,22,0.1)'
                    : 'rgba(249,115,22,0.05)',
                  border: `1px solid ${isDark ? 'rgba(249,115,22,0.2)' : 'rgba(249,115,22,0.1)'}`
                }}
              >
                <Shield className="w-4 h-4" style={{ color: '#f97316' }} />
                <span
                  className="text-sm font-medium"
                  style={{ color: '#f97316' }}
                >
                  Platform Admin
                </span>
              </div>

              {children}
            </div>
          </main>
        </div>
      </div>
    </AsoThemeContext.Provider>
  );
}
