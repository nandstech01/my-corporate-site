'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
        <span className="flex items-center text-white">
          <motion.span
            // アイコンをほんの少し回転させるなど
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
      <Link href={href} className="block" {...linkProps}>
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
 *    - HeroSection風の宇宙的演出を軽めに取り入れたデザイン例
 * --------------------------------------------------------------------------------
 */
const Footer: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer className="relative font-sans text-white bg-gray-900 overflow-hidden">
      {/* 背景に薄い星やグラデーションを演出 */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 背景: グラデーション */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-gray-900 to-black opacity-80" />
        {/* 星っぽいドット模様（CSSで繰り返しパターン） */}
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-5 bg-repeat" />
        {/* ランダムに配置されたモーション星（クライアントサイドでのみ生成） */}
        {mounted && [...Array(12)].map((_, i) => {
          const left = `${Math.random() * 100}%`;
          const top = `${Math.random() * 100}%`;
          return (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-70"
              style={{ left, top }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1, 0.8, 1],
                opacity: 1,
                y: [0, -10, 10],
              }}
              transition={{
                duration: 5 + i,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />
          );
        })}
      </div>

      <div className="container mx-auto px-4 py-10 relative z-10">
        {/* 上部タイトル & ナビゲーション */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
              NANDS AIソリューション
            </span>
          </h2>
          <nav className="space-y-2">
            {/* ====== メインリンク一覧 ====== */}
            <FooterItem label="TOP" href="/" />
            <FooterItem label="副業支援" href="/fukugyo" />
            <FooterItem label="法人向けAI導入" href="/corporate" />
            <FooterItem label="リスキリング" href="/reskilling" />

            <FooterItem
              label="無料相談"
              href="https://lin.ee/LRj3T2V"
              isExternal={true}
            />
            <FooterItem label="コース申し込み" href="#contact-form" />
            <FooterItem label="よくある質問" href="/faq" />
          </nav>
        </div>

        {/* 下部 会社情報 / 利用規約 等 */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex items-center mb-4">
            <motion.span
              className="text-white font-bold text-lg mr-2"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            >
              NANDS
            </motion.span>
            <motion.span
              className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 font-bold text-lg"
              whileHover={{ scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            >
              TECH
            </motion.span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
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
              特定商取引に関する表示
            </Link>
          </div>
          <div className="mt-8 text-xs text-gray-500">
            ©2014 - {new Date().getFullYear()} NANDS Inc.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
