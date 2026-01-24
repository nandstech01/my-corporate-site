'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, Sun, Moon, Shield, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useClaviTheme } from '@/app/clavi/context';

export default function CLAVISignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { theme, toggleTheme } = useClaviTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/clavi/dashboard`,
        }
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        if (data.user.identities?.length === 0) {
          setError('このメールアドレスは既に登録されています');
        } else if (data.session) {
          router.push('/clavi/dashboard');
          router.refresh();
        } else {
          setSuccess(true);
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '登録に失敗しました';
      setError(errorMessage);
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
        style={{ background: 'linear-gradient(135deg, #0891B2, #06B6D4)' }}
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
            無料で始めよう
          </h1>
          <p className="text-cyan-50 text-lg leading-relaxed mb-8">
            Starterプランなら無料で3名まで利用可能。
            今すぐAI検索最適化を始めましょう。
          </p>
          <div className="space-y-3">
            {['月3回のURL分析', '基本スコアリング', '30日間データ保存'].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-cyan-50">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Right: Signup form */}
      <div className="flex-1 flex flex-col">
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
                color: isDark ? '#94A3B8' : '#64748B'
              }}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

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
                新規登録
              </h1>
              <p style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                CLAVEを始めよう
              </p>
            </div>

            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4 p-6 rounded-xl"
                style={{
                  background: isDark ? '#1E293B' : '#FFFFFF',
                  border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`
                }}
              >
                <div
                  className="w-14 h-14 mx-auto rounded-full flex items-center justify-center"
                  style={{ background: isDark ? 'rgba(16,185,129,0.1)' : '#ECFDF5' }}
                >
                  <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                </div>
                <div>
                  <h2
                    className="text-lg font-semibold mb-1"
                    style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
                  >
                    確認メールを送信しました
                  </h2>
                  <p className="text-sm" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                    メールに記載されたリンクをクリックして登録を完了してください
                  </p>
                </div>
                <Link
                  href="/clavi/login"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600"
                >
                  ログインページへ
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            ) : (
              <>
                <form onSubmit={handleSignup} className="space-y-4">
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
                    <label className="text-sm font-medium" style={{ color: isDark ? '#E2E8F0' : '#334155' }}>
                      メールアドレス
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      disabled={loading}
                      className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                      style={{
                        background: isDark ? '#1E293B' : '#FFFFFF',
                        border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
                        color: isDark ? '#F8FAFC' : '#0F172A'
                      }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium" style={{ color: isDark ? '#E2E8F0' : '#334155' }}>
                      パスワード
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="8文字以上"
                      required
                      disabled={loading}
                      className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                      style={{
                        background: isDark ? '#1E293B' : '#FFFFFF',
                        border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
                        color: isDark ? '#F8FAFC' : '#0F172A'
                      }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium" style={{ color: isDark ? '#E2E8F0' : '#334155' }}>
                      パスワード（確認）
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="パスワードを再入力"
                      required
                      disabled={loading}
                      className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
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
                    className="w-full py-2.5 rounded-lg font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        登録中...
                      </>
                    ) : (
                      <>
                        アカウントを作成
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>
                  <Shield className="w-3.5 h-3.5" />
                  <span>256-bit SSL暗号化で保護</span>
                </div>

                <div
                  className="mt-6 pt-6 border-t text-center text-sm"
                  style={{ borderColor: isDark ? '#1E293B' : '#E2E8F0' }}
                >
                  <p style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                    既にアカウントをお持ちですか？{' '}
                    <Link href="/clavi/login" className="font-medium text-blue-600 hover:text-blue-700">
                      ログイン
                    </Link>
                  </p>
                </div>
              </>
            )}

            <div className="mt-4 text-center">
              <Link
                href="/clavi"
                className="inline-flex items-center gap-1.5 text-sm transition-colors"
                style={{ color: isDark ? '#94A3B8' : '#64748B' }}
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
