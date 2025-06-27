"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { CSSTransition } from 'react-transition-group';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [systemDropdownOpen, setSystemDropdownOpen] = useState(false);
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
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
      isTopPage ? 'bg-black' : 'bg-white shadow-md'
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
              <a href="https://nands.tech/reskilling" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors">
                個人向けリスキリング
              </a>
              <Link href="/corporate" className="text-white hover:text-gray-300 transition-colors">
                法人向けリスキリング
              </Link>
              
              {/* システム開発ドロップダウン */}
              <div className="relative">
                <button
                  onMouseEnter={() => setSystemDropdownOpen(true)}
                  onMouseLeave={() => setSystemDropdownOpen(false)}
                  className="flex items-center text-white hover:text-gray-300 transition-colors"
                >
                  システム開発
                  <ChevronDownIcon className="ml-1 h-4 w-4" />
                </button>
                
                {systemDropdownOpen && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                    onMouseEnter={() => setSystemDropdownOpen(true)}
                    onMouseLeave={() => setSystemDropdownOpen(false)}
                  >
                    <Link href="/system-development" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      システム開発
                    </Link>
                    <Link href="/aio-seo" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      AIO対策
                    </Link>
                    <Link href="/chatbot-development" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      チャットボット開発
                    </Link>
                    <Link href="/vector-rag" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      ベクトルRAG検索
                    </Link>
                    <Link href="/ai-agents" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      AIエージェント
                    </Link>
                    <Link href="/mcp-servers" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      MCPサーバー
                    </Link>
                    <Link href="/hr-solutions" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      人材ソリューション
                    </Link>
                  </div>
                )}
              </div>

              {/* 会社概要ドロップダウン */}
              <div className="relative">
                <button
                  onMouseEnter={() => setCompanyDropdownOpen(true)}
                  onMouseLeave={() => setCompanyDropdownOpen(false)}
                  className="flex items-center text-white hover:text-gray-300 transition-colors"
                >
                  会社概要
                  <ChevronDownIcon className="ml-1 h-4 w-4" />
                </button>
                
                {companyDropdownOpen && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                    onMouseEnter={() => setCompanyDropdownOpen(true)}
                    onMouseLeave={() => setCompanyDropdownOpen(false)}
                  >
                    <Link href="/about" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      会社概要
                    </Link>
                    <Link href="/sustainability" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      サステナビリティ
                    </Link>
                  </div>
                )}
              </div>
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
                    background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 50%, #e0f2fe 100%)',
                    boxShadow: '0 0 0 100vmax rgba(255, 255, 255, 0.98)',
                    clipPath: 'inset(0 -100vmax)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <div className="container mx-auto px-6">
                    {/* ヘッダー部分 */}
                    <div className="border-b border-gradient-to-r from-cyan-200/30 via-blue-200/50 to-cyan-200/30" style={{
                      borderImage: 'linear-gradient(90deg, rgba(103, 232, 249, 0.3), rgba(59, 130, 246, 0.5), rgba(103, 232, 249, 0.3)) 1'
                    }}>
                      {/* ロゴ部分 */}
                      <div className="flex items-center justify-center h-16 pt-4">
                        <Link href="/" onClick={() => setIsOpen(false)}>
                          <Image
                            src="/images/logo.svg"
                            alt="N&S Logo"
                            width={120}
                            height={40}
                            className="w-auto h-8"
                          />
                        </Link>
                      </div>
                      
                      {/* ボタン部分 */}
                      <div className="flex justify-center space-x-3 pb-4">
                        <Link
                          href="/reskilling"
                          onClick={() => setIsOpen(false)}
                          className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl rounded-lg transform hover:scale-105 border border-cyan-300/30"
                        >
                          個人様
                        </Link>
                        <Link
                          href="/corporate"
                          onClick={() => setIsOpen(false)}
                          className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl rounded-lg transform hover:scale-105 border border-blue-300/30"
                        >
                          法人様
                        </Link>
                      </div>
                    </div>

                    {/* メインナビゲーション */}
                    <div className="py-8 max-h-[calc(100vh-120px)] overflow-y-auto">
                      <nav className="space-y-2">
                        {/* サービスカテゴリ */}
                        <div className="mb-8">
                          <h3 className="text-sm font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent uppercase tracking-wider mb-4 px-4">
                            リスキリング・研修
                          </h3>
                          <div className="space-y-1">
                            {[
                              ['個人様リスキリング', '/reskilling', 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z'],
                              ['法人様リスキリング', '/corporate', 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4']
                            ].map(([label, href, iconPath]) => (
                              <Link
                                key={href}
                                href={href}
                                className="group flex items-center px-4 py-3 text-gray-700 hover:text-cyan-700 hover:bg-gradient-to-r hover:from-cyan-50/80 hover:to-blue-50/80 rounded-xl transition-all duration-300 backdrop-blur-sm border border-transparent hover:border-cyan-200/50 hover:shadow-md"
                                onClick={() => setIsOpen(false)}
                              >
                                <div className="w-6 h-6 mr-3 flex-shrink-0">
                                  <svg className="w-full h-full text-gray-500 group-hover:text-cyan-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
                                  </svg>
                                </div>
                                <span className="font-medium">{label}</span>
                                <motion.span
                                  className="ml-auto text-cyan-500 opacity-0 group-hover:opacity-100"
                                  whileHover={{ x: 3 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  →
                                </motion.span>
                              </Link>
                            ))}
                          </div>
                        </div>

                        <div className="mb-8">
                          <h3 className="text-sm font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent uppercase tracking-wider mb-4 px-4">
                            AI・テクノロジー
                          </h3>
                          <div className="space-y-1">
                            {[
                              ['システム開発', '/system-development', 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'],
                              ['チャットボット開発', '/chatbot-development', 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'],
                              ['ベクトルRAG検索', '/vector-rag', 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'],
                              ['AIエージェント', '/ai-agents', 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'],
                              ['MCPサーバー', '/mcp-servers', 'M13 10V3L4 14h7v7l9-11h-7z']
                            ].map(([label, href, iconPath]) => (
                              <Link
                                key={href}
                                href={href}
                                className="group flex items-center px-4 py-3 text-gray-700 hover:text-cyan-700 hover:bg-gradient-to-r hover:from-cyan-50/80 hover:to-blue-50/80 rounded-xl transition-all duration-300 backdrop-blur-sm border border-transparent hover:border-cyan-200/50 hover:shadow-md"
                                onClick={() => setIsOpen(false)}
                              >
                                <div className="w-6 h-6 mr-3 flex-shrink-0">
                                  <svg className="w-full h-full text-gray-500 group-hover:text-cyan-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
                                  </svg>
                                </div>
                                <span className="font-medium">{label}</span>
                                <motion.span
                                  className="ml-auto text-cyan-500 opacity-0 group-hover:opacity-100"
                                  whileHover={{ x: 3 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  →
                                </motion.span>
                              </Link>
                            ))}
                          </div>
                        </div>

                        <div className="mb-8">
                          <h3 className="text-sm font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent uppercase tracking-wider mb-4 px-4">
                            マーケティング・支援
                          </h3>
                          <div className="space-y-1">
                            {[
                              ['AIO対策', '/aio-seo', 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'],
                              ['人材ソリューション', '/hr-solutions', 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'],
                              ['AI副業', '/fukugyo', 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0v6a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0V4a2 2 0 00-2-2H10a2 2 0 00-2 2v2']
                            ].map(([label, href, iconPath]) => (
                              <Link
                                key={href}
                                href={href}
                                className="group flex items-center px-4 py-3 text-gray-700 hover:text-cyan-700 hover:bg-gradient-to-r hover:from-cyan-50/80 hover:to-blue-50/80 rounded-xl transition-all duration-300 backdrop-blur-sm border border-transparent hover:border-cyan-200/50 hover:shadow-md"
                                onClick={() => setIsOpen(false)}
                              >
                                <div className="w-6 h-6 mr-3 flex-shrink-0">
                                  <svg className="w-full h-full text-gray-500 group-hover:text-cyan-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
                                  </svg>
                                </div>
                                <span className="font-medium">{label}</span>
                                <motion.span
                                  className="ml-auto text-cyan-500 opacity-0 group-hover:opacity-100"
                                  whileHover={{ x: 3 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  →
                                </motion.span>
                              </Link>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent uppercase tracking-wider mb-4 px-4">
                            企業情報
                          </h3>
                          <div className="space-y-1">
                            {[
                              ['サステナビリティ', '/sustainability', 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z'],
                              ['会社概要', '/about', 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z']
                            ].map(([label, href, iconPath]) => (
                              <Link
                                key={href}
                                href={href}
                                className="group flex items-center px-4 py-3 text-gray-700 hover:text-cyan-700 hover:bg-gradient-to-r hover:from-cyan-50/80 hover:to-blue-50/80 rounded-xl transition-all duration-300 backdrop-blur-sm border border-transparent hover:border-cyan-200/50 hover:shadow-md"
                                onClick={() => setIsOpen(false)}
                              >
                                <div className="w-6 h-6 mr-3 flex-shrink-0">
                                  <svg className="w-full h-full text-gray-500 group-hover:text-cyan-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
                                  </svg>
                                </div>
                                <span className="font-medium">{label}</span>
                                <motion.span
                                  className="ml-auto text-cyan-500 opacity-0 group-hover:opacity-100"
                                  whileHover={{ x: 3 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  →
                                </motion.span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </nav>
                    </div>
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