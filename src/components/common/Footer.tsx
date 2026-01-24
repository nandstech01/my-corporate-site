'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  // システムのテーマを検出
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      setTheme(mediaQuery.matches ? 'dark' : 'light');
    };

    setTheme(mediaQuery.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleChange);
    setMounted(true);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 管理画面・CLAVIの場合はフッターを表示しない
  if (pathname && (pathname.startsWith('/admin') || pathname.startsWith('/partner-admin') || pathname.startsWith('/clavi'))) {
    return null;
  }

  // マウント前はnullを返す（ちらつき防止）
  if (!mounted) {
    return null;
  }

  return (
    <footer 
      className="relative text-white"
      style={{
        background: theme === 'dark' 
          ? '#000000' 
          : '#ffffff'
      }}
    >
      <div className="container mx-auto px-4 py-16 sm:py-20">
        {/* メインフッターコンテンツ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* AI・テクノロジーサービス */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h4 
                className="text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }}
              >
                AI Development
              </h4>
              <nav className="space-y-3 text-sm">
                <Link 
                  href="/system-development" 
                  className="block transition-colors"
                  style={{ 
                    color: theme === 'dark' ? '#d1d5db' : '#4b5563',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#1a1a1a'}
                  onMouseLeave={(e) => e.currentTarget.style.color = theme === 'dark' ? '#d1d5db' : '#4b5563'}
                >
                  システム開発
                </Link>
                <Link 
                  href="/chatbot-development" 
                  className="block transition-colors"
                  style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#1a1a1a'}
                  onMouseLeave={(e) => e.currentTarget.style.color = theme === 'dark' ? '#d1d5db' : '#4b5563'}
                >
                  チャットボット開発
                </Link>
                <Link 
                  href="/vector-rag" 
                  className="block transition-colors"
                  style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#1a1a1a'}
                  onMouseLeave={(e) => e.currentTarget.style.color = theme === 'dark' ? '#d1d5db' : '#4b5563'}
                >
                  ベクトルRAG検索
                </Link>
                <Link 
                  href="/ai-agents" 
                  className="block transition-colors"
                  style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#1a1a1a'}
                  onMouseLeave={(e) => e.currentTarget.style.color = theme === 'dark' ? '#d1d5db' : '#4b5563'}
                >
                  AIエージェント
                </Link>
                <Link 
                  href="/mcp-servers" 
                  className="block transition-colors"
                  style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#1a1a1a'}
                  onMouseLeave={(e) => e.currentTarget.style.color = theme === 'dark' ? '#d1d5db' : '#4b5563'}
                >
                  MCPサーバー
                </Link>
              </nav>
            </motion.div>
          </div>

          {/* マーケティング・支援サービス */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h4 
                className="text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }}
              >
                Marketing & Support
              </h4>
              <nav className="space-y-3 text-sm">
                <Link 
                  href="/aio-seo" 
                  className="block transition-colors"
                  style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#1a1a1a'}
                  onMouseLeave={(e) => e.currentTarget.style.color = theme === 'dark' ? '#d1d5db' : '#4b5563'}
                >
                  AIO対策
                </Link>
                <Link 
                  href="/sns-automation" 
                  className="block transition-colors"
                  style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#1a1a1a'}
                  onMouseLeave={(e) => e.currentTarget.style.color = theme === 'dark' ? '#d1d5db' : '#4b5563'}
                >
                  SNS自動化
                </Link>
                <Link 
                  href="/video-generation" 
                  className="block transition-colors"
                  style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#1a1a1a'}
                  onMouseLeave={(e) => e.currentTarget.style.color = theme === 'dark' ? '#d1d5db' : '#4b5563'}
                >
                  AI動画生成
                </Link>
                <Link 
                  href="/hr-solutions" 
                  className="block transition-colors"
                  style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#1a1a1a'}
                  onMouseLeave={(e) => e.currentTarget.style.color = theme === 'dark' ? '#d1d5db' : '#4b5563'}
                >
                  人材ソリューション
                </Link>
                <Link 
                  href="/fukugyo" 
                  className="block transition-colors"
                  style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#1a1a1a'}
                  onMouseLeave={(e) => e.currentTarget.style.color = theme === 'dark' ? '#d1d5db' : '#4b5563'}
                >
                  AI副業支援
                </Link>
              </nav>
            </motion.div>
          </div>

          {/* リスキリング・研修 */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h4 
                className="text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }}
              >
                Reskilling
              </h4>
              <nav className="space-y-3 text-sm">
                <Link 
                  href="/reskilling" 
                  className="block transition-colors"
                  style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#1a1a1a'}
                  onMouseLeave={(e) => e.currentTarget.style.color = theme === 'dark' ? '#d1d5db' : '#4b5563'}
                >
                  個人向けリスキリング
                </Link>
                <Link 
                  href="/corporate" 
                  className="block transition-colors"
                  style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#1a1a1a'}
                  onMouseLeave={(e) => e.currentTarget.style.color = theme === 'dark' ? '#d1d5db' : '#4b5563'}
                >
                  法人向けリスキリング
                </Link>
              </nav>
            </motion.div>
          </div>

          {/* 企業情報 */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h4 
                className="text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }}
              >
                Company
              </h4>
              <nav className="space-y-3 text-sm">
                <Link 
                  href="/about" 
                  className="block transition-colors"
                  style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#1a1a1a'}
                  onMouseLeave={(e) => e.currentTarget.style.color = theme === 'dark' ? '#d1d5db' : '#4b5563'}
                >
                  会社概要
                </Link>
                <Link 
                  href="/sustainability" 
                  className="block transition-colors"
                  style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#1a1a1a'}
                  onMouseLeave={(e) => e.currentTarget.style.color = theme === 'dark' ? '#d1d5db' : '#4b5563'}
                >
                  サステナビリティ
                </Link>
                <Link 
                  href="/contact" 
                  className="block transition-colors"
                  style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#1a1a1a'}
                  onMouseLeave={(e) => e.currentTarget.style.color = theme === 'dark' ? '#d1d5db' : '#4b5563'}
                >
                  お問い合わせ
                </Link>
                <Link 
                  href="/#faq-support" 
                  className="block transition-colors"
                  style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#1a1a1a'}
                  onMouseLeave={(e) => e.currentTarget.style.color = theme === 'dark' ? '#d1d5db' : '#4b5563'}
                >
                  よくある質問
                </Link>
              </nav>
            </motion.div>
          </div>
        </div>

        {/* CTA セクション */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="border-t pt-12 pb-12"
          style={{ borderColor: theme === 'dark' ? '#1f2937' : '#e5e7eb' }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <h3 
              className="text-2xl sm:text-3xl font-bold mb-4"
              style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}
            >
              AIアーキテクトに相談する
            </h3>
            <p 
              className="text-base sm:text-lg mb-8"
              style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
            >
              AI駆動開発、リスキリング、システム開発など、<br className="hidden sm:block" />
              お気軽にご相談ください。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="https://lin.ee/s5dmFuD"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full font-bold text-base sm:text-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/40 hover:scale-105 transition-all duration-300"
              >
                <span className="mr-2">すぐに無料相談</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="https://nands.tech/dm-form"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full font-bold text-base sm:text-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/40 hover:scale-105 transition-all duration-300"
              >
                <span className="mr-2">無料で資料請求</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* 会社情報 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="border-t pt-12 mb-12"
          style={{ borderColor: theme === 'dark' ? '#1f2937' : '#e5e7eb' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 
                className="text-xl font-bold mb-4"
                style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}
              >
                株式会社エヌアンドエス
              </h3>
              <p 
                className="text-sm leading-relaxed mb-4"
                style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
              >
                滋賀県大津市を拠点とする総合AI開発企業。<br />
                AIアーキテクト育成、AI駆動開発、レリバンスエンジニアリングなど、<br />
                次世代のソリューションを提供しています。
              </p>
            </div>
            <div 
              className="space-y-2 text-sm"
              style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
            >
              <p className="flex items-start">
                <span 
                  className="font-semibold w-16"
                  style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }}
                >
                  本社
                </span>
                <span>滋賀県大津市皇子が丘２丁目10−25−3004号</span>
              </p>
              <p className="flex items-start">
                <span 
                  className="font-semibold w-16"
                  style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }}
                >
                  電話
                </span>
                <a 
                  href="tel:0120407638" 
                  className="transition-colors"
                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#1a1a1a'}
                  onMouseLeave={(e) => e.currentTarget.style.color = theme === 'dark' ? '#9ca3af' : '#6b7280'}
                >
                  0120-407-638
                </a>
              </p>
              <p className="flex items-start">
                <span 
                  className="font-semibold w-16"
                  style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }}
                >
                  Email
                </span>
                <a 
                  href="mailto:contact@nands.tech" 
                  className="transition-colors"
                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#1a1a1a'}
                  onMouseLeave={(e) => e.currentTarget.style.color = theme === 'dark' ? '#9ca3af' : '#6b7280'}
                >
                  contact@nands.tech
                </a>
              </p>
            </div>
          </div>
        </motion.div>

        {/* 下部リーガル情報 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="border-t pt-8"
          style={{ borderColor: theme === 'dark' ? '#1f2937' : '#e5e7eb' }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span 
                className="font-bold text-xl"
                style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}
              >
                NANDS
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-bold text-xl">
                TECH
              </span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link
                href="/about"
                className="transition-colors"
                style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                onMouseEnter={(e) => e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#1a1a1a'}
                onMouseLeave={(e) => e.currentTarget.style.color = theme === 'dark' ? '#9ca3af' : '#6b7280'}
              >
                運営会社
              </Link>
              <Link
                href="/terms"
                className="transition-colors"
                style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                onMouseEnter={(e) => e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#1a1a1a'}
                onMouseLeave={(e) => e.currentTarget.style.color = theme === 'dark' ? '#9ca3af' : '#6b7280'}
              >
                利用規約
              </Link>
              <Link
                href="/privacy"
                className="transition-colors"
                style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                onMouseEnter={(e) => e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#1a1a1a'}
                onMouseLeave={(e) => e.currentTarget.style.color = theme === 'dark' ? '#9ca3af' : '#6b7280'}
              >
                プライバシーポリシー
              </Link>
              <Link
                href="/legal"
                className="transition-colors"
                style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                onMouseEnter={(e) => e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#1a1a1a'}
                onMouseLeave={(e) => e.currentTarget.style.color = theme === 'dark' ? '#9ca3af' : '#6b7280'}
              >
                特定商取引法
              </Link>
            </div>
          </div>
          
          <div 
            className="mt-8 text-center text-xs"
            style={{ color: theme === 'dark' ? '#4b5563' : '#9ca3af' }}
          >
            © 2014 - {new Date().getFullYear()} NANDS Inc. All rights reserved.
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
