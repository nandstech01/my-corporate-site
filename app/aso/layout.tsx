'use client';

import { createClient } from '@/lib/supabase/browser';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import AsoHeader from '@/components/aso/AsoHeader';
import AsoSidebar from '@/components/aso/AsoSidebar';
import { AsoThemeContext } from './context';

type Theme = 'light' | 'dark';

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem('aso-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export default function AsoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

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
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // 未ログインユーザーは /aso, /aso/login, /aso/signup のみアクセス可能
        if (pathname !== '/aso' && pathname !== '/aso/login' && pathname !== '/aso/signup') {
          router.push('/aso');
        }
      }

      setUser(user);
      setIsLoading(false);
    };

    checkAuth();
  }, [router, pathname]);

  const isDark = theme === 'dark';

  // ランディングページ、ログインページ、新規登録ページはレイアウトなしで表示
  if (pathname === '/aso' || pathname === '/aso/login' || pathname === '/aso/signup') {
    return <>{children}</>;
  }

  if (isLoading || !mounted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #0A1628 0%, #0D1B2A 50%, #050A14 100%)'
        }}
      >
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-purple-500/20 border-t-purple-500"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
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
          <AsoSidebar onItemClick={() => setIsSidebarOpen(false)} />
        </div>

        {/* メインコンテンツエリア */}
        <div className="lg:ml-64">
          <main className="p-4 sm:p-6 min-h-screen pt-20 lg:pt-24">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AsoThemeContext.Provider>
  );
}

