'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * --------------------------------------------------------------------------------
 * 1. FooterItemProps & FooterItem コンポーネント
 *    - Q&A形式 or サブメニュー形式で開閉する項目
 * --------------------------------------------------------------------------------
 */
interface FooterItemProps {
  label: string;
  href?: string;
  children?: React.ReactNode;
  isExternal?: boolean;
}

const FooterItem: React.FC<FooterItemProps> = ({
  label,
  href,
  children,
  isExternal,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // メインの表示部分
  const content = (
    <div className="py-2">
      <div
        className="flex items-center justify-between cursor-pointer group"
        onClick={() => children && setIsOpen(!isOpen)}
      >
        <span className="flex items-center text-white hover:text-blue-300 transition-colors">
          <motion.span
            whileHover={{ rotate: 15, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            className="mr-2"
          >
            <ChevronRight size={16} />
          </motion.span>
          {label}
        </span>
        {children && (
          <motion.span
            className="text-white"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown size={16} />
          </motion.span>
        )}
      </div>

      <AnimatePresence>
        {isOpen && children && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="ml-6 mt-2 space-y-2"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // リンクの場合
  if (href) {
    const linkProps = isExternal
      ? { target: '_blank', rel: 'noopener noreferrer' }
      : {};

    return (
      <Link href={href} className="block hover:bg-white/5 rounded-lg transition-colors" {...linkProps}>
        {content}
      </Link>
    );
  }

  // リンクでない場合（純粋な開閉制御用の親アイテム）
  return content;
};

/**
 * --------------------------------------------------------------------------------
 * 2. Footer本体
 * --------------------------------------------------------------------------------
 */
const Footer: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // 管理画面の場合はフッターを表示しない
  if (pathname && (pathname.startsWith('/admin') || pathname.startsWith('/partner-admin'))) {
    return null;
  }

  // LPページのみCTAの配色をダーク/シアン系に変更（他ページへは影響なし）
  const isLP = pathname?.startsWith('/lp');
  const ctaClass = isLP
    ? 'bg-gradient-to-b from-gray-900/70 via-slate-900/60 to-black/70 backdrop-blur-md rounded-2xl p-8 mb-12 border border-cyan-500/20'
    : 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-blue-500/20';

  return (
    <footer className="relative font-sans text-white bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 overflow-hidden">
      {/* 背景エフェクト */}
      <div className="absolute inset-0 pointer-events-none">
        {/* グラデーション背景 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        {/* グリッドパターン */}
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-10 bg-repeat" />
        {/* 動的パーティクル */}
        {mounted && [...Array(15)].map((_, i) => {
          const left = `${Math.random() * 100}%`;
          const top = `${Math.random() * 100}%`;
          return (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-60"
              style={{ left, top }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1, 0.8, 1],
                opacity: [0.2, 0.8, 0.4, 0.6],
                y: [0, -20, 10, -5],
              }}
              transition={{
                duration: 8 + i * 0.5,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />
          );
        })}
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* メインフッターコンテンツ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* 会社情報 */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <h3 className="text-2xl font-bold mb-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                  NANDS
                </span>
                <span className="text-white ml-1">TECH</span>
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                滋賀県大津市を拠点とする総合人材支援企業。
                AI・テクノロジーを活用した次世代のソリューションを提供しています。
              </p>
              <div className="space-y-2 text-sm text-gray-400">
                <p>📍 滋賀県大津市皇子が丘２丁目10−25−3004号</p>
                <p>📞 0120-407-638</p>
                <p>📧 contact@nands.tech</p>
              </div>
            </motion.div>
          </div>

          {/* AI・テクノロジーサービス */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h4 className="text-lg font-bold mb-4 text-blue-300">🤖 AI・テクノロジー</h4>
              <nav className="space-y-1 text-sm">
                <FooterItem label="システム開発" href="/system-development" />
                <FooterItem label="チャットボット開発" href="/chatbot-development" />
                <FooterItem label="ベクトルRAG検索" href="/vector-rag" />
                <FooterItem label="AIエージェント" href="/ai-agents" />
                <FooterItem label="MCPサーバー" href="/mcp-servers" />
              </nav>
            </motion.div>
          </div>

          {/* マーケティング・支援サービス */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h4 className="text-lg font-bold mb-4 text-green-300">📈 マーケティング・支援</h4>
              <nav className="space-y-1 text-sm">
                <FooterItem label="AIO対策" href="/aio-seo" />
                <FooterItem label="人材ソリューション" href="/hr-solutions" />
                <FooterItem label="AI副業支援" href="/fukugyo" />
              </nav>
            </motion.div>
          </div>

          {/* リスキリング・企業情報 */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h4 className="text-lg font-bold mb-4 text-purple-300">📚 リスキリング・企業情報</h4>
              <nav className="space-y-1 text-sm">
                <FooterItem label="個人様リスキリング" href="/reskilling" />
                <FooterItem label="法人様リスキリング" href="/corporate" />
                <FooterItem label="会社概要" href="/about" />
                <FooterItem label="サステナビリティ" href="/sustainability" />
                <FooterItem label="よくある質問" href="/faq" />
              </nav>
            </motion.div>
          </div>
        </div>

        {/* CTA セクション */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className={ctaClass}
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4 text-white">
              無料相談・お問い合わせ
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              AI導入、リスキリング、システム開発など、お気軽にご相談ください。
              専門スタッフが最適なソリューションをご提案いたします。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://lin.ee/LRj3T2V"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-bold transition-colors"
              >
                <span>💬</span>
                <span>LINEで無料相談</span>
              </a>
              <a
                href="tel:0120558551"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold transition-colors"
              >
                <span>📞</span>
                <span>0120-407-638</span>
              </a>
              <a
                href="mailto:contact@nands.tech"
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-bold transition-colors"
              >
                <span>📧</span>
                <span>メールで相談</span>
              </a>
            </div>
          </div>
        </motion.div>

        {/* 下部リーガル情報 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="border-t border-gray-700 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center">
              <motion.span
                className="text-white font-bold text-xl mr-2"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
              >
                NANDS
              </motion.span>
              <motion.span
                className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-bold text-xl"
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
              >
                TECH
              </motion.span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link
                href="/about"
                className="text-gray-400 hover:text-white transition-colors"
              >
                運営会社
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-white transition-colors"
              >
                利用規約
              </Link>
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-white transition-colors"
              >
                プライバシーポリシー
              </Link>
              <Link
                href="/legal"
                className="text-gray-400 hover:text-white transition-colors"
              >
                特定商取引法
              </Link>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <div className="text-xs text-gray-500">
              ©2014 - {new Date().getFullYear()} NANDS Inc. All rights reserved.
            </div>
            <div className="text-xs text-gray-600 mt-2">
              株式会社エヌアンドエス｜滋賀県大津市｜AI・テクノロジーソリューション
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
