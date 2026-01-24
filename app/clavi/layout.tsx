'use client';

import { createClient } from '@/lib/supabase/browser';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import ClaviHeader from '@/components/clavi/ClaviHeader';
import ClaviSidebar from '@/components/clavi/ClaviSidebar';
import { ClaviThemeContext } from './context';

type Theme = 'light' | 'dark';

const PUBLIC_ROUTES = [
  '/clavi',
  '/clavi/login',
  '/clavi/signup',
  '/clavi/pricing',
  '/clavi/features',
  '/clavi/contact',
  '/clavi/case-studies',
  '/clavi/blog',
];

// Routes that require auth but NOT a tenant
const AUTH_ONLY_ROUTES = ['/clavi/onboard'];

const isPublicRoute = (pathname: string): boolean => {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  if (pathname.startsWith('/clavi/features/')) return true;
  if (pathname.startsWith('/clavi/case-studies/')) return true;
  if (pathname.startsWith('/clavi/contact/')) return true;
  return false;
};

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('clavi-theme');
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
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(getInitialTheme());
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('clavi-theme', newTheme);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user && !isPublicRoute(pathname)) {
        router.push('/clavi');
        setIsLoading(false);
        return;
      }

      // Authenticated user: check tenant membership (skip for public/onboard routes)
      if (user && !isPublicRoute(pathname) && !AUTH_ONLY_ROUTES.includes(pathname)) {
        const { data: tenants } = await supabase
          .from('user_tenants')
          .select('tenant_id')
          .eq('user_id', user.id)
          .limit(1);

        if (!tenants || tenants.length === 0) {
          router.push('/clavi/onboard');
          setIsLoading(false);
          return;
        }
      }

      setUser(user);
      setIsLoading(false);
    };

    checkAuth();
  }, [router, pathname]);

  const isDark = theme === 'dark';

  // Public pages render without app layout
  if (isPublicRoute(pathname)) {
    return (
      <ClaviThemeContext.Provider value={{ theme, toggleTheme }}>
        {children}
      </ClaviThemeContext.Provider>
    );
  }

  // Onboard page renders without sidebar
  if (AUTH_ONLY_ROUTES.includes(pathname)) {
    return (
      <ClaviThemeContext.Provider value={{ theme, toggleTheme }}>
        <div
          className="min-h-screen"
          style={{ background: isDark ? '#101f22' : '#f3f5f8' }}
        >
          {children}
        </div>
      </ClaviThemeContext.Provider>
    );
  }

  if (isLoading || !mounted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: isDark ? '#101f22' : '#f3f5f8'
        }}
      >
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#A5F3FC] border-t-[#06B6D4]"></div>
          <p className="mt-3 text-sm" style={{ color: isDark ? '#90c1cb' : '#64748B' }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ClaviThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className="h-screen overflow-hidden flex transition-colors duration-200">
        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed top-0 bottom-0 left-0 z-40 w-64 transform transition-transform duration-200 ease-out
          lg:relative lg:transform-none lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <ClaviSidebar onItemClick={() => setIsSidebarOpen(false)} />
        </div>

        {/* Main content area */}
        <main
          className="flex-1 flex flex-col h-full overflow-hidden relative w-full"
          style={{ background: isDark ? '#101f22' : '#f3f5f8' }}
        >
          <ClaviHeader
            user={user}
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
          />
          <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
            {children}
          </div>
        </main>
      </div>
    </ClaviThemeContext.Provider>
  );
}
