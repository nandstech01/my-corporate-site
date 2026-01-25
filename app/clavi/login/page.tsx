'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle, ArrowRight, Sun, Moon, Shield } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useClaviTheme } from '@/app/clavi/context';

export default function CLAVILoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { theme, toggleTheme } = useClaviTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      if (data.user) {
        router.push('/clavi/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen flex" style={{ background: isDark ? '#0F172A' : '#F8FAFC' }}>
      {/* Left: Branding panel */}
      <div
        className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1E3A8A, #2563EB)' }}
      >
        <div className="relative z-10 max-w-md text-white">
          <Image
            src="/clavi-logo-dark.png"
            alt="CLAVE"
            width={120}
            height={120}
            className="mb-8"
          />
          <h1 className="text-3xl font-bold mb-4">
            CLAVE
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed mb-8">
            構造化データの自動生成で、AI検索エンジンからの可視性を最大化します。
          </p>
          <div className="space-y-3">
            {['JSON-LD自動生成', 'AI構造化スコア', 'Fragment ID最適化'].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-blue-50">{item}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex flex-col">
        {/* Top nav */}
        <div className="flex items-center justify-between px-6 py-4">
          <Link href="/clavi" className="flex items-center lg:hidden">
            <Image
              src="/clavi-logo.png"
              alt="CLAVE"
              width={48}
              height={48}
              className="rounded-full"
              style={{ filter: isDark ? 'brightness(0) invert(1)' : 'none' }}
            />
          </Link>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors"
              style={{
                background: isDark ? '#1E293B' : '#F1F5F9',
                color: isDark ? '#E2E8F0' : '#374151'
              }}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm"
          >
            <div className="mb-8">
              <h1
                className="text-2xl font-bold tracking-tight mb-2"
                style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
              >
                ログイン
              </h1>
              <p style={{ color: isDark ? '#E2E8F0' : '#374151' }}>
                CLAVEにログイン
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2.5 p-3 rounded-lg"
                  style={{
                    background: isDark ? 'rgba(239,68,68,0.1)' : '#FEF2F2',
                    border: '1px solid rgba(239,68,68,0.2)'
                  }}
                >
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </motion.div>
              )}

              <div className="space-y-1.5">
                <label
                  className="text-sm font-medium"
                  style={{ color: isDark ? '#E2E8F0' : '#334155' }}
                >
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={loading}
                  className="w-full px-3.5 py-2.5 rounded-lg text-sm transition-colors outline-none focus:ring-2 focus:ring-blue-500/20"
                  style={{
                    background: isDark ? '#1E293B' : '#FFFFFF',
                    border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
                    color: isDark ? '#F8FAFC' : '#0F172A'
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  className="text-sm font-medium"
                  style={{ color: isDark ? '#E2E8F0' : '#334155' }}
                >
                  パスワード
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full px-3.5 py-2.5 rounded-lg text-sm transition-colors outline-none focus:ring-2 focus:ring-blue-500/20"
                  style={{
                    background: isDark ? '#1E293B' : '#FFFFFF',
                    border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
                    color: isDark ? '#F8FAFC' : '#0F172A'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ログイン中...
                  </>
                ) : (
                  <>
                    ログイン
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
              <Shield className="w-3.5 h-3.5" />
              <span>256-bit SSL暗号化で保護</span>
            </div>

            <div
              className="mt-6 pt-6 border-t text-center text-sm"
              style={{ borderColor: isDark ? '#1E293B' : '#E2E8F0' }}
            >
              <p style={{ color: isDark ? '#E2E8F0' : '#374151' }}>
                アカウントをお持ちでないですか？{' '}
                <Link href="/clavi/signup" className="font-medium text-blue-600 hover:text-blue-700">
                  新規登録
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link
                href="/clavi"
                className="inline-flex items-center gap-1.5 text-sm transition-colors"
                style={{ color: isDark ? '#E2E8F0' : '#374151' }}
              >
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                トップに戻る
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
