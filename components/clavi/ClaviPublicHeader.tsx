'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClaviTheme } from '@/app/clavi/context';

const navItems = [
  { label: '機能', href: '/clavi/features' },
  { label: '料金', href: '/clavi/pricing' },
  { label: 'お問い合わせ', href: '/clavi/contact' },
];

export default function ClaviPublicHeader() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useClaviTheme();
  const isDark = theme === 'dark';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md transition-colors duration-200"
      style={{
        background: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)',
        borderBottom: `1px solid ${isDark ? '#1E293B' : '#F1F5F9'}`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/clavi" className="flex items-center">
            <Image
              src="/clavi-logo.png"
              alt="CLAVI"
              width={120}
              height={120}
              className="rounded-full"
              style={{
                filter: isDark ? 'brightness(0) invert(1)' : 'none',
              }}
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm font-medium transition-colors"
                  style={{
                    color: isActive
                      ? '#2563EB'
                      : isDark ? '#CBD5E1' : '#475569',
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full transition-colors"
              style={{
                color: isDark ? '#E2E8F0' : '#374151',
              }}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link
              href="/clavi/signup"
              className="hidden sm:inline-flex px-5 py-2 rounded-full text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all"
              style={{
                background: '#2563EB',
              }}
            >
              無料で始める
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{
                color: isDark ? '#E2E8F0' : '#374151',
              }}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t overflow-hidden"
            style={{
              background: isDark ? '#0F172A' : '#FFFFFF',
              borderColor: isDark ? '#1E293B' : '#F1F5F9',
            }}
          >
            <div className="px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    color: isDark ? '#E2E8F0' : '#475569',
                  }}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-3">
                <Link
                  href="/clavi/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-full text-sm font-bold text-white text-center"
                  style={{ background: '#2563EB' }}
                >
                  無料で始める
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
