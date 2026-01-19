'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import {
  Layers,
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
  Sun,
  Moon,
  Shield,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

type Theme = 'light' | 'dark';

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem('aso-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export default function ASOLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    setTheme(getInitialTheme());
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('aso-theme', newTheme);
  };

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
        router.push('/aso/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // Staggered animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A1628]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-10 h-10 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"
        />
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #0A1628 0%, #0D1B2A 50%, #050A14 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)'
      }}
    >
      {/* Animated ambient light */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)'
          }}
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 70%)'
          }}
        />
      </div>

      {/* Subtle grid pattern */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: isDark
            ? `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
               linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`
            : `linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
               linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-50 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-20">
            <Link href="/aso" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl opacity-50 blur group-hover:opacity-70 transition-opacity" />
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-white" />
                </div>
              </motion.div>
              <span
                className="text-lg font-semibold tracking-tight"
                style={{ color: isDark ? '#ffffff' : '#1a1a1a' }}
              >
                ASO
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="p-2.5 rounded-full transition-colors"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                  color: isDark ? '#9ca3af' : '#6b7280'
                }}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[420px]"
        >
          {/* Glass Card */}
          <motion.div
            variants={itemVariants}
            className="relative"
          >
            {/* Card glow effect */}
            <div
              className="absolute -inset-px rounded-[28px] opacity-50"
              style={{
                background: 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(34,211,238,0.3))',
                filter: 'blur(1px)'
              }}
            />

            <div
              className="relative rounded-[28px] p-8 sm:p-10"
              style={{
                background: isDark
                  ? 'rgba(15, 23, 42, 0.8)'
                  : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(40px)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                boxShadow: isDark
                  ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                  : '0 25px 50px -12px rgba(0, 0, 0, 0.1)'
              }}
            >
              {/* Header */}
              <motion.div variants={itemVariants} className="text-center mb-8">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg"
                  style={{
                    boxShadow: '0 10px 40px -10px rgba(168,85,247,0.5)'
                  }}
                >
                  <Sparkles className="w-8 h-8 text-white" />
                </motion.div>
                <h1
                  className="text-2xl sm:text-3xl font-bold tracking-tight mb-2"
                  style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                >
                  おかえりなさい
                </h1>
                <p style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                  AI Search Optimizerにログイン
                </p>
              </motion.div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-5">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 rounded-xl"
                    style={{
                      background: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.05)',
                      border: '1px solid rgba(239,68,68,0.2)'
                    }}
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-500">{error}</p>
                  </motion.div>
                )}

                {/* Email Field */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <label
                    className="flex items-center gap-2 text-sm font-medium"
                    style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                  >
                    <Mail className="w-4 h-4" />
                    メールアドレス
                  </label>
                  <div className="relative">
                    <motion.div
                      animate={{
                        opacity: focusedField === 'email' ? 1 : 0,
                        scale: focusedField === 'email' ? 1 : 0.95
                      }}
                      className="absolute -inset-px rounded-xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(168,85,247,0.5), rgba(34,211,238,0.5))',
                        filter: 'blur(2px)'
                      }}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="your@email.com"
                      required
                      disabled={loading}
                      className="relative w-full px-4 py-3.5 rounded-xl text-base transition-all duration-300 outline-none"
                      style={{
                        background: isDark ? 'rgba(30,41,59,0.8)' : 'rgba(255,255,255,1)',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                        color: isDark ? '#ffffff' : '#0f172a'
                      }}
                    />
                  </div>
                </motion.div>

                {/* Password Field */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <label
                    className="flex items-center gap-2 text-sm font-medium"
                    style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                  >
                    <Lock className="w-4 h-4" />
                    パスワード
                  </label>
                  <div className="relative">
                    <motion.div
                      animate={{
                        opacity: focusedField === 'password' ? 1 : 0,
                        scale: focusedField === 'password' ? 1 : 0.95
                      }}
                      className="absolute -inset-px rounded-xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(168,85,247,0.5), rgba(34,211,238,0.5))',
                        filter: 'blur(2px)'
                      }}
                    />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="••••••••"
                      required
                      disabled={loading}
                      className="relative w-full px-4 py-3.5 rounded-xl text-base transition-all duration-300 outline-none"
                      style={{
                        background: isDark ? 'rgba(30,41,59,0.8)' : 'rgba(255,255,255,1)',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                        color: isDark ? '#ffffff' : '#0f172a'
                      }}
                    />
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.div variants={itemVariants}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="group relative w-full py-4 rounded-xl font-semibold text-base text-white overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500" />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-400 to-cyan-400"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    <span className="relative flex items-center justify-center gap-3">
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ログイン中...
                        </>
                      ) : (
                        <>
                          ログイン
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                  </motion.button>
                </motion.div>
              </form>

              {/* Security Badge */}
              <motion.div
                variants={itemVariants}
                className="mt-6 flex items-center justify-center gap-2"
                style={{ color: isDark ? '#64748b' : '#94a3b8' }}
              >
                <Shield className="w-4 h-4" />
                <span className="text-xs">256-bit SSL暗号化で保護</span>
              </motion.div>

              {/* Divider */}
              <motion.div
                variants={itemVariants}
                className="mt-6 pt-6 border-t"
                style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}
              >
                <p
                  className="text-sm font-medium mb-3"
                  style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                >
                  テスト用アカウント
                </p>
                <div
                  className="p-4 rounded-xl font-mono text-xs space-y-1.5"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    color: isDark ? '#94a3b8' : '#64748b'
                  }}
                >
                  <p>
                    <span className="opacity-60">Email:</span>{' '}
                    <span style={{ color: isDark ? '#ffffff' : '#0f172a' }}>aso-test@nands.tech</span>
                  </p>
                  <p>
                    <span className="opacity-60">Pass:</span>{' '}
                    <span style={{ color: isDark ? '#ffffff' : '#0f172a' }}>Test1234!@#$</span>
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Back link */}
          <motion.div
            variants={itemVariants}
            className="mt-8 text-center"
          >
            <Link
              href="/aso"
              className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: isDark ? '#94a3b8' : '#64748b' }}
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              トップに戻る
            </Link>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="relative z-10 py-6 text-center"
      >
        <p
          className="text-xs"
          style={{ color: isDark ? '#475569' : '#94a3b8' }}
        >
          Mike King理論に基づくレリバンスエンジニアリング
        </p>
      </motion.footer>
    </div>
  );
}
