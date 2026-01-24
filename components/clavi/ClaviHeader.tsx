'use client';

import { createClient } from '@/lib/supabase/browser';
import { useRouter } from 'next/navigation';
import { Menu, X, LogOut, User, Sun, Moon, Bell } from 'lucide-react';
import { useClaviTheme } from '@/app/clavi/context';

interface ClaviHeaderProps {
  user: any;
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

export default function ClaviHeader({ user, onMenuClick, isSidebarOpen }: ClaviHeaderProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useClaviTheme();
  const isDark = theme === 'dark';

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/clavi');
  };

  return (
    <header
      className="sticky top-0 z-20 backdrop-blur-md border-b shrink-0 transition-colors duration-200 px-6 py-4"
      style={{
        background: isDark ? 'rgba(16,32,35,0.8)' : 'rgba(243,245,248,0.8)',
        borderColor: isDark ? '#224249' : '#E2E8F0',
      }}
    >
      <div className="flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg transition-colors"
            style={{ color: isDark ? '#90c1cb' : '#64748B' }}
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Status badge */}
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border"
            style={{
              background: isDark ? 'rgba(16,185,129,0.1)' : '#ECFDF5',
              color: isDark ? '#34D399' : '#15803D',
              borderColor: isDark ? 'rgba(16,185,129,0.2)' : '#BBF7D0',
            }}
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Active
          </div>

          {/* Notification */}
          <button
            className="relative p-2 rounded-full transition-colors hover:bg-white/10"
            style={{ color: isDark ? '#90c1cb' : '#6B7280' }}
          >
            <Bell className="w-5 h-5" />
            <span
              className="absolute top-2 right-2 w-2 h-2 rounded-full border-2"
              style={{
                background: '#EF4444',
                borderColor: isDark ? '#102023' : '#f3f5f8',
              }}
            />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full transition-colors hover:bg-white/10"
            style={{ color: isDark ? '#90c1cb' : '#6B7280' }}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user && (
            <>
              {/* User info */}
              <div
                className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-lg"
                style={{ background: isDark ? '#224249' : '#E2E8F0' }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: isDark ? '#182f34' : '#CBD5E1' }}
                >
                  <User className="w-3.5 h-3.5" style={{ color: isDark ? '#90c1cb' : '#64748B' }} />
                </div>
                <span
                  className="text-sm font-medium"
                  style={{ color: isDark ? '#FFFFFF' : '#334155' }}
                >
                  {user.email?.split('@')[0] || 'User'}
                </span>
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg transition-colors hover:bg-white/10"
                style={{ color: isDark ? '#90c1cb' : '#6B7280' }}
                aria-label="Logout"
                title="ログアウト"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
