'use client';

import { createClient } from '@/lib/supabase/browser';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import ClaviHeader from '@/components/clavi/ClaviHeader';
import ClaviSidebar from '@/components/clavi/ClaviSidebar';
import { ClaviThemeContext } from './context';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  showDetails: boolean;
}

class ClaviErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, showDetails: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '50vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            textAlign: 'center',
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '24px',
            }}>
              !
            </div>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#F8FAFC',
              marginBottom: '0.5rem',
            }}>
              問題が発生しました
            </h2>
            <p style={{
              fontSize: '0.875rem',
              color: '#90c1cb',
              marginBottom: '1.5rem',
            }}>
              予期しないエラーが発生しました。再度お試しください。
            </p>
            <button
              onClick={this.handleReset}
              style={{
                padding: '0.5rem 1.5rem',
                borderRadius: '0.5rem',
                background: '#0891B2',
                color: '#FFFFFF',
                fontSize: '0.875rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                marginBottom: '1rem',
              }}
            >
              再試行
            </button>
            {this.state.error && (
              <div>
                <button
                  onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    color: '#6a8b94',
                    display: 'block',
                    margin: '0 auto',
                  }}
                >
                  {this.state.showDetails ? '詳細を隠す' : '詳細を表示'}
                </button>
                {this.state.showDetails && (
                  <pre style={{
                    marginTop: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    fontSize: '0.7rem',
                    color: '#EF4444',
                    textAlign: 'left',
                    overflow: 'auto',
                    maxHeight: '200px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}>
                    {this.state.error.message}
                    {this.state.error.stack && `\n\n${this.state.error.stack}`}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

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
        <ClaviErrorBoundary>
          {children}
        </ClaviErrorBoundary>
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
          <ClaviErrorBoundary>
            {children}
          </ClaviErrorBoundary>
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
            <ClaviErrorBoundary>
              {children}
            </ClaviErrorBoundary>
          </div>
        </main>
      </div>
    </ClaviThemeContext.Provider>
  );
}
