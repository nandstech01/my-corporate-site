"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { CSSTransition } from 'react-transition-group';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isTopPage = pathname === '/';
  const isReskillingPage = pathname === '/reskilling';

  useEffect(() => {
    const fixedButtons = document.querySelector('.fixed-buttons');
    if (fixedButtons && isReskillingPage) {
      if (isOpen) {
        fixedButtons.classList.add('hidden');
      } else {
        fixedButtons.classList.remove('hidden');
      }
    }
  }, [isOpen, isReskillingPage]);

  return (
    <header className={`${isTopPage ? 'absolute' : 'fixed'} top-0 left-0 right-0 z-[90] transition-all duration-300 ${
      isTopPage ? 'bg-black/30 backdrop-blur-sm' : 'bg-white shadow-md'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* ロゴ */}
          <Link href="/" className="flex items-center relative z-[110]">
            {isTopPage ? (
              <Image
                src="/images/logo-white.svg"
                alt="N&S Logo"
                width={180}
                height={60}
                className="w-auto h-12"
                priority
              />
            ) : (
              <Image
                src="/images/logo.svg"
                alt="N&S Logo"
                width={120}
                height={40}
                className="w-auto h-8"
              />
            )}
          </Link>

          {/* PC用ナビゲーション - メインページのみ */}
          {isTopPage && (
            <nav className="hidden md:flex space-x-8">
              <Link href="/reskilling-personal" className="text-white hover:text-gray-300 transition-colors">
                個人様リスキリング
              </Link>
              <Link href="/corporate" className="text-white hover:text-gray-300 transition-colors">
                法人様リスキリング
              </Link>
              <Link href="/fukugyo" className="text-white hover:text-gray-300 transition-colors">
                AI副業
              </Link>
              <Link href="/sustainability" className="text-white hover:text-gray-300 transition-colors">
                サステナビリティ
              </Link>
              <Link href="/about" className="text-white hover:text-gray-300 transition-colors">
                会社概要
              </Link>
            </nav>
          )}

          {/* ハンバーガーメニュー */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`relative z-[99999] focus:outline-none ${isTopPage ? 'text-white' : 'text-gray-800'} ${
              isOpen && 'text-gray-800'
            }`}
            aria-label="メニュー"
          >
            <motion.div className="w-8 h-8 flex flex-col justify-center items-center">
              <motion.span
                className={`block w-6 h-0.5 absolute ${
                  isOpen ? 'bg-gray-800' : isTopPage ? 'bg-white' : 'bg-gray-800'
                }`}
                animate={isOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              />
              <motion.span
                className={`block w-6 h-0.5 absolute ${
                  isOpen ? 'bg-gray-800' : isTopPage ? 'bg-white' : 'bg-gray-800'
                }`}
                animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              <motion.span
                className={`block w-6 h-0.5 absolute ${
                  isOpen ? 'bg-gray-800' : isTopPage ? 'bg-white' : 'bg-gray-800'
                }`}
                animate={isOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 8 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </button>

          {/* メニュー - リスキリングページは既存のまま */}
          {isReskillingPage ? (
            // リスキリングページ用の既存メニュー
            <CSSTransition
              in={isOpen}
              timeout={300}
              classNames="menu"
              unmountOnExit
            >
              <div className="fixed right-0 top-16 h-[calc(100vh-64px)] w-full max-w-sm bg-black/90">
                <div className="p-6 h-full overflow-y-auto">
                  <div className="text-white text-2xl font-bold">
                    -NANDS-
                    <br />
                    生成AIリスキング研修
                  </div>

                  <nav className="mt-8 space-y-8">
                    <div className="space-y-4">
                      {[
                        'コースの特徴',
                        '受講生の声',
                        '選ばれる理由',
                        'プラン・料金',
                        '受講までの流れ'
                      ].map((item) => (
                        <Link
                          key={item} 
                          href={`#${item}`} 
                          className="block text-white text-lg font-semibold"
                          onClick={() => setIsOpen(false)}
                        >
                          - {item}
                        </Link>
                      ))}
                    </div>

                    <div className="py-4 border-y border-white/30">
                      <div className="space-y-4">
                        <div className="text-white text-xl font-bold">Top</div>
                        <Link
                          href="#contact-form"
                          className="block text-white text-xl font-bold"
                          onClick={() => setIsOpen(false)}
                        >
                          コース紹介
                        </Link>
                        <div className="pl-4 space-y-2">
                          {[
                            '基礎コース',
                            '応用コース',
                            'エキスパートコース'
                          ].map((course) => (
                            <div key={course} className="text-white">
                              {course}
                            </div>
                          ))}
                        </div>
                        {[
                          ['無料相談', 'https://lin.ee/LRj3T2V'],
                          ['コース申し込み', '#contact-form'],
                          ['よくある質問・お問い合わせ', '/faq'],
                          ['法人パートナー ログイン ＞', '#']
                        ].map(([label, href]) => (
                          <Link
                            key={label}
                            href={href}
                            className="block text-white text-lg hover:opacity-80"
                            onClick={() => setIsOpen(false)}
                            {...(href.startsWith('https://') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                          >
                            {label}
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Link
                        href="#"
                        className="text-white text-xl font-bold hover:opacity-80"
                      >
                        NAND.TECH ▢
                      </Link>
                    </div>
                  </nav>
                </div>
              </div>
            </CSSTransition>
          ) : (
            // その他のページ用の改善されたスライドメニュー
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  className="fixed inset-0 z-[9999]"
                  initial={{ opacity: 0, x: "100%" }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: "100%" }}
                  transition={{ type: "tween", duration: 0.3 }}
                  style={{
                    backgroundColor: '#ffffff',
                    boxShadow: '0 0 0 100vmax rgba(255, 255, 255, 1)',
                    clipPath: 'inset(0 -100vmax)',
                  }}
                >
                  <div className="container mx-auto px-4 pt-24">
                    <nav className="space-y-6">
                      <div className="space-y-4">
                        {[
                          ['個人様リスキリング', '/reskilling-personal'],
                          ['法人様リスキリング', '/corporate'],
                          ['AI副業', '/fukugyo'],
                          ['サステナビリティ', '/sustainability'],
                          ['会社概要', '/about']
                        ].map(([label, href]) => (
                          <Link
                            key={href}
                            href={href}
                            className="flex items-center justify-between py-4 text-xl text-gray-800 border-b border-gray-200"
                            onClick={() => setIsOpen(false)}
                          >
                            <span>{label}</span>
                            <motion.span
                              className="text-blue-600"
                              whileHover={{ x: 5 }}
                              transition={{ duration: 0.2 }}
                            >
                              →
                            </motion.span>
                          </Link>
                        ))}
                      </div>
                    </nav>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </header>
  );
} 