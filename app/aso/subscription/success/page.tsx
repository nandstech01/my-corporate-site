'use client';

import { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAsoTheme } from '@/app/aso/context';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { theme } = useAsoTheme();
  const isDark = theme === 'dark';
  const [confetti, setConfetti] = useState<{ id: number; x: number; delay: number }[]>([]);

  useEffect(() => {
    // 紙吹雪アニメーション用のデータ生成
    const particles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
    }));
    setConfetti(particles);
  }, []);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-[70vh] flex items-center justify-center"
    >
      <div className="text-center space-y-8 max-w-lg mx-auto px-4 relative">
        {/* 紙吹雪アニメーション */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {confetti.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ y: -20, x: `${particle.x}%`, opacity: 1 }}
              animate={{ y: '100vh', opacity: 0 }}
              transition={{
                duration: 3,
                delay: particle.delay,
                ease: 'linear',
              }}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: `hsl(${Math.random() * 360}, 70%, 60%)`,
                left: `${particle.x}%`,
              }}
            />
          ))}
        </div>

        {/* 成功アイコン */}
        <motion.div
          variants={itemVariants}
          className="relative"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              delay: 0.3,
            }}
            className="w-24 h-24 mx-auto rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,211,238,0.2))',
            }}
          >
            <CheckCircle2
              className="w-12 h-12"
              style={{ color: '#22c55e' }}
            />
          </motion.div>

          {/* キラキラエフェクト */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="w-6 h-6" style={{ color: '#fbbf24' }} />
          </motion.div>
        </motion.div>

        {/* タイトル */}
        <motion.div variants={itemVariants} className="space-y-3">
          <h1
            className="text-3xl md:text-4xl font-bold"
            style={{ color: isDark ? '#ffffff' : '#0f172a' }}
          >
            お申し込みありがとうございます!
          </h1>
          <p
            className="text-lg"
            style={{ color: isDark ? '#94a3b8' : '#64748b' }}
          >
            サブスクリプションが正常に開始されました
          </p>
        </motion.div>

        {/* 説明 */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-6 space-y-4"
          style={{
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
          }}
        >
          <p style={{ color: isDark ? '#e2e8f0' : '#475569' }}>
            これで ASO SaaS のすべての機能をご利用いただけます。
            早速URL分析を始めましょう!
          </p>

          <ul className="text-left space-y-2">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: '#22c55e' }} />
              <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                AI構造化スコア分析
              </span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: '#22c55e' }} />
              <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                Fragment ID自動生成
              </span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: '#22c55e' }} />
              <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                JSON-LD構造化データ出力
              </span>
            </li>
          </ul>
        </motion.div>

        {/* セッションID（デバッグ用、本番では非表示） */}
        {sessionId && process.env.NODE_ENV === 'development' && (
          <motion.p
            variants={itemVariants}
            className="text-xs font-mono"
            style={{ color: isDark ? '#475569' : '#94a3b8' }}
          >
            Session: {sessionId.slice(0, 20)}...
          </motion.p>
        )}

        {/* CTAボタン */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/aso">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #a855f7, #22d3ee)',
              }}
            >
              分析を始める
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>

          <Link href="/aso/subscription">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
              style={{
                background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                color: isDark ? '#ffffff' : '#0f172a',
              }}
            >
              契約を確認
            </motion.button>
          </Link>
        </motion.div>

        {/* ヘルプリンク */}
        <motion.p
          variants={itemVariants}
          className="text-sm"
          style={{ color: isDark ? '#64748b' : '#94a3b8' }}
        >
          ご不明な点は{' '}
          <a
            href="mailto:support@nands.tech"
            className="underline hover:no-underline"
            style={{ color: '#a855f7' }}
          >
            サポート
          </a>
          {' '}までお気軽にお問い合わせください。
        </motion.p>
      </div>
    </motion.div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-purple-500/20 border-t-purple-500"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
