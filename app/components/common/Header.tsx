"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { CSSTransition } from 'react-transition-group';
import { 
  ChevronDownIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  RocketLaunchIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  BoltIcon,
  LinkIcon,
  UsersIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  QuestionMarkCircleIcon,
  ShareIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import { getStoredTheme, toggleStoredTheme } from '@/app/components/portal/ThemeContext';

// モードの取得と保存（localStorageベース）
const getStoredMode = (): 'individual' | 'corporate' => {
  if (typeof window === 'undefined') return 'individual';
  return (localStorage.getItem('nands-selected-mode') as 'individual' | 'corporate') || 'individual';
};

const setStoredMode = (mode: 'individual' | 'corporate') => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('nands-selected-mode', mode);
  // カスタムイベントで他のコンポーネントに通知
  window.dispatchEvent(new CustomEvent('nands-mode-change', { detail: { mode } }));
};

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [systemDropdownOpen, setSystemDropdownOpen] = useState(false);
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mode, setMode] = useState<'individual' | 'corporate'>('individual');
  const pathname = usePathname();
  const isTopPage = pathname === '/';

  // /claviパスではグローバルヘッダーを非表示（CLAVI専用ヘッダーを使用）
  if (pathname?.startsWith('/clavi')) {
    return null;
  }
  
  // テーマ状態の同期（トップページのみ）
  useEffect(() => {
    if (!isTopPage) return;
    
    // 初期値を取得
    setTheme(getStoredTheme());
    
    // カスタムイベントを監視して同期
    const handleThemeChange = (e: CustomEvent) => {
      setTheme(e.detail.theme);
    };
    
    window.addEventListener('nands-theme-change', handleThemeChange as EventListener);
    return () => {
      window.removeEventListener('nands-theme-change', handleThemeChange as EventListener);
    };
  }, [isTopPage]);
  
  // モード状態の同期（トップページのみ）
  useEffect(() => {
    if (!isTopPage) return;
    
    // 初期値を取得
    setMode(getStoredMode());
    
    // カスタムイベントを監視して同期
    const handleModeChange = (e: CustomEvent) => {
      setMode(e.detail.mode);
    };
    
    window.addEventListener('nands-mode-change', handleModeChange as EventListener);
    return () => {
      window.removeEventListener('nands-mode-change', handleModeChange as EventListener);
    };
  }, [isTopPage]);
  
  // モード切り替えハンドラ
  const handleModeChange = (newMode: 'individual' | 'corporate') => {
    setMode(newMode);
    setStoredMode(newMode);
    // カスタムイベントを発行
    window.dispatchEvent(new CustomEvent('nands-mode-change', { detail: { mode: newMode } }));
  };

  const handleToggleTheme = () => {
    const newTheme = toggleStoredTheme();
    setTheme(newTheme);
  };
  const isReskillingPage = pathname === '/reskilling';
  const isLPPage = pathname === '/lp';

  useEffect(() => {
    const fixedButtons = document.querySelector('.fixed-buttons') as HTMLElement;
    if (fixedButtons) {
      if (isOpen) {
        fixedButtons.style.display = 'none';
      } else {
        fixedButtons.style.display = 'flex';
      }
    }
  }, [isOpen]);

  // 管理画面とLPページの場合はヘッダーを表示しない
  if (pathname && (pathname.startsWith('/admin') || pathname.startsWith('/partner-admin') || pathname === '/lp' || pathname === '/ai-site')) {
    return null;
  }

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md ${
        isTopPage && !isLPPage
          ? (theme === 'light' 
              ? 'bg-white border-b border-gray-200/50' 
              : 'bg-black border-b border-gray-800/50')
          : 'bg-white border-b border-gray-200/50' 
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between h-12">
            {/* ロゴ */}
            <Link href="/" className="flex items-center">
              {isTopPage && !isLPPage ? (
                theme === 'light' ? (
                  <Image
                    src="/images/logo.svg"
                    alt="N&S Logo"
                    width={120}
                    height={40}
                    className="w-auto h-8"
                    priority
                  />
                ) : (
                <Image
                  src="/images/logo-white.svg"
                  alt="N&S Logo"
                  width={180}
                  height={60}
                  className="w-auto h-12"
                  priority
                />
                )
              ) : (
                <Image
                  src="/images/logo.svg"
                  alt="N&S Logo"
                  width={120}
                  height={40}
                  className="w-auto h-8"
                  priority
                />
              )}
            </Link>

            {/* 個人様/法人様 セグメントコントロール（トップページのみ・全デバイス表示） */}
            {isTopPage && (
              <div 
                className="relative flex items-center rounded-full p-0.5 transition-all duration-300 md:ml-auto"
                style={{
                  background: theme === 'dark' 
                    ? 'rgba(255, 255, 255, 0.08)' 
                    : 'rgba(0, 0, 0, 0.06)',
                  border: theme === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.1)'
                    : '1px solid rgba(0, 0, 0, 0.08)'
                }}
              >
                {/* スライディングインジケーター */}
                <motion.div
                  className="absolute top-0.5 bottom-0.5 rounded-full"
                  style={{
                    background: theme === 'dark'
                      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(99, 102, 241, 0.9) 100%)'
                      : 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                    boxShadow: theme === 'dark'
                      ? '0 2px 8px rgba(59, 130, 246, 0.3)'
                      : '0 2px 8px rgba(59, 130, 246, 0.25)',
                    width: 'calc(50% - 2px)',
                  }}
                  initial={false}
                  animate={{
                    x: mode === 'individual' ? 2 : 'calc(100% + 2px)',
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
                
                {/* 個人様ボタン */}
                <button
                  onClick={() => handleModeChange('individual')}
                  className="relative z-10 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors duration-200"
                  style={{
                    color: mode === 'individual'
                      ? '#ffffff'
                      : (theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)')
                  }}
                >
                  個人様
                </button>
                
                {/* 法人様ボタン */}
                <button
                  onClick={() => handleModeChange('corporate')}
                  className="relative z-10 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors duration-200"
                  style={{
                    color: mode === 'corporate'
                      ? '#ffffff'
                      : (theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)')
                  }}
                >
                  法人様
                </button>
              </div>
            )}

            {/* PC用ナビゲーション - メインページのみ */}
            {isTopPage && (
              <nav className="hidden md:flex items-center space-x-6">
                
                {/* サービス ドロップダウン - Apple風 */}
                <div className="relative">
                  <motion.button
                    onMouseEnter={() => setSystemDropdownOpen(true)}
                    onMouseLeave={() => setSystemDropdownOpen(false)}
                    className={`flex items-center transition-all duration-300 px-3 py-2 ${
                      isTopPage && !isLPPage
                        ? (theme === 'light'
                            ? 'text-gray-800 hover:text-black'
                            : 'text-white/90 hover:text-white')
                        : 'text-gray-800 hover:text-black'
                    }`}
                  >
                    <span className="text-sm font-normal">サービス</span>
                    <ChevronDownIcon className={`ml-1 h-3 w-3 transition-transform duration-200 ${systemDropdownOpen ? 'rotate-180' : ''}`} />
                  </motion.button>
                  
                  <AnimatePresence>
                    {systemDropdownOpen && (
                      <motion.div 
                        className="fixed left-0 right-0 top-[80px] bg-white shadow-lg z-50 border-b border-gray-200"
                        onMouseEnter={() => setSystemDropdownOpen(true)}
                        onMouseLeave={() => setSystemDropdownOpen(false)}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                      >
                        <div className="max-w-6xl mx-auto px-8 py-10">
                          <div className="grid grid-cols-3 gap-x-16 gap-y-1">
                            {/* 左列: AI開発サービス */}
                            <div>
                              <h3 className="text-xs font-normal text-gray-500 mb-4 tracking-wide">
                                AI開発サービス
                          </h3>
                              <ul className="space-y-3">
                                {[
                                  { label: 'システム開発', href: '/system-development' },
                                  { label: 'チャットボット開発', href: '/chatbot-development' },
                                  { label: 'ベクトルRAG検索', href: '/vector-rag' },
                                  { label: 'AIエージェント', href: '/ai-agents' },
                                  { label: 'MCPサーバー', href: '/mcp-servers' },
                                ].map((item) => (
                                  <li key={item.href}>
                                    <Link 
                                      href={item.href}
                                      className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors block"
                                    >
                                      {item.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                        </div>
                        
                            {/* 中央列: マーケティング・支援 */}
                            <div>
                              <h3 className="text-xs font-normal text-gray-500 mb-4 tracking-wide">
                                マーケティング・支援
                              </h3>
                              <ul className="space-y-3">
                                {[
                                  { label: 'AIO対策', href: '/aio-seo' },
                                  { label: 'SNS自動化', href: '/sns-automation' },
                                  { label: 'AI動画生成', href: '/video-generation' },
                                  { label: '人材ソリューション', href: '/hr-solutions' },
                                  { label: 'AI副業', href: '/fukugyo' },
                                ].map((item) => (
                                  <li key={item.href}>
                              <Link 
                                href={item.href} 
                                      className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors block"
                                    >
                                      {item.label}
                              </Link>
                                  </li>
                                ))}
                              </ul>
                        </div>
                        
                            {/* 右列: リスキリング */}
                            <div>
                              <h3 className="text-xs font-normal text-gray-500 mb-4 tracking-wide">
                                リスキリング
                              </h3>
                              <ul className="space-y-3">
                                {[
                                  { label: '個人向けリスキリング', href: '/reskilling' },
                                  { label: '法人向けリスキリング', href: '/corporate' },
                                ].map((item) => (
                                  <li key={item.href}>
                                    <Link 
                                      href={item.href}
                                      className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors block"
                                    >
                                      {item.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                              
                              {/* 追加リンク */}
                              <div className="mt-8 pt-6 border-t border-gray-200">
                          <Link 
                            href="/faq" 
                                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                          >
                                  よくある質問
                          </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 会社概要 ドロップダウン - Apple風 */}
                <div className="relative">
                  <motion.button
                    onMouseEnter={() => setCompanyDropdownOpen(true)}
                    onMouseLeave={() => setCompanyDropdownOpen(false)}
                    className={`flex items-center transition-all duration-300 px-3 py-2 ${
                      isTopPage && !isLPPage
                        ? (theme === 'light'
                            ? 'text-gray-800 hover:text-black'
                            : 'text-white/90 hover:text-white')
                        : 'text-gray-800 hover:text-black'
                    }`}
                  >
                    <span className="text-sm font-normal">会社概要</span>
                    <ChevronDownIcon className={`ml-1 h-3 w-3 transition-transform duration-200 ${companyDropdownOpen ? 'rotate-180' : ''}`} />
                  </motion.button>
                  
                  <AnimatePresence>
                    {companyDropdownOpen && (
                      <motion.div 
                        className="fixed left-0 right-0 top-[80px] bg-white shadow-lg z-50 border-b border-gray-200"
                        onMouseEnter={() => setCompanyDropdownOpen(true)}
                        onMouseLeave={() => setCompanyDropdownOpen(false)}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                      >
                        <div className="max-w-6xl mx-auto px-8 py-10">
                          <div className="grid grid-cols-2 gap-x-16 gap-y-1">
                            {/* 左列: 企業情報 */}
                            <div>
                              <h3 className="text-xs font-normal text-gray-500 mb-4 tracking-wide">
                            企業情報
                          </h3>
                              <ul className="space-y-3">
                          {[
                                  { label: '会社概要', href: '/about' },
                                  { label: 'サステナビリティ', href: '/sustainability' },
                                ].map((item) => (
                                  <li key={item.href}>
                              <Link 
                                href={item.href} 
                                      className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors block"
                                    >
                                      {item.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                                    </div>
                            
                            {/* 右列: 空白またはサポートリンク */}
                            <div>
                              <h3 className="text-xs font-normal text-gray-500 mb-4 tracking-wide">
                                サポート
                              </h3>
                              <ul className="space-y-3">
                                <li>
                                  <Link 
                                    href="/faq"
                                    className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors block"
                                  >
                                    よくある質問
                                  </Link>
                                </li>
                                <li>
                                  <Link 
                                    href="/contact"
                                    className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors block"
                                  >
                                    お問い合わせ
                                  </Link>
                                </li>
                              </ul>
                            </div>
                                </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </nav>
            )}


            {/* シンプルハンバーガーメニューボタン */}
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
              className="relative w-12 h-12 z-[99999] focus:outline-none group flex items-center justify-center"
              aria-label="メニュー"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* ハンバーガーライン */}
              <div className="relative">
                {/* 上のライン */}
                <motion.span
                  className={`absolute left-1/2 -translate-x-1/2 block h-0.5 w-6 rounded-full ${
                    isOpen 
                      ? 'bg-gray-700' 
                      : isTopPage && !isLPPage
                        ? (theme === 'light' ? 'bg-gray-700' : 'bg-white')
                        : 'bg-gray-700'
                  }`}
                  style={{ transformOrigin: 'center' }}
                  initial={false}
                  animate={
                    isOpen
                      ? { 
                          rotate: 45, 
                          y: 0,
                        }
                      : { 
                          rotate: 0, 
                          y: -6,
                        }
                  }
                  transition={{ 
                    duration: 0.3, 
                    ease: "easeInOut"
                  }}
                />

                {/* 中央のライン */}
                <motion.span
                  className={`absolute left-1/2 -translate-x-1/2 block h-0.5 w-6 rounded-full ${
                    isOpen 
                      ? 'bg-gray-700' 
                      : isTopPage && !isLPPage
                        ? (theme === 'light' ? 'bg-gray-700' : 'bg-white')
                        : 'bg-gray-700'
                  }`}
                  style={{ transformOrigin: 'center' }}
                  initial={false}
                  animate={
                    isOpen
                      ? { 
                          opacity: 0,
                          scaleX: 0,
                        }
                      : { 
                          opacity: 1,
                          scaleX: 1,
                        }
                  }
                  transition={{ 
                    duration: 0.3, 
                    ease: "easeInOut"
                  }}
                />

                {/* 下のライン */}
                <motion.span
                  className={`absolute left-1/2 -translate-x-1/2 block h-0.5 w-6 rounded-full ${
                    isOpen 
                      ? 'bg-gray-700' 
                      : isTopPage && !isLPPage
                        ? (theme === 'light' ? 'bg-gray-700' : 'bg-white')
                        : 'bg-gray-700'
                  }`}
                  style={{ transformOrigin: 'center' }}
                  initial={false}
                  animate={
                    isOpen
                      ? { 
                          rotate: -45, 
                          y: 0,
                        }
                      : { 
                          rotate: 0, 
                          y: 6,
                        }
                  }
                  transition={{ 
                    duration: 0.3, 
                    ease: "easeInOut"
                  }}
                />
              </div>
            </motion.button>
          </div>
        </div>
      </header>

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
              {/* ヘッダー部分 - タイトルと❌ボタン */}
              <div className="flex items-start justify-between mb-8">
                <div className="text-white text-2xl font-bold">
                  -NANDS-
                  <br />
                  生成AIリスキング研修
                </div>
                {/* ❌閉じるボタン */}
                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 border border-white/20 backdrop-blur-sm ml-4 flex-shrink-0"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="メニューを閉じる"
                >
                  <motion.div
                    className="relative w-5 h-5"
                    whileHover={{ rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* ❌の線 */}
                    <motion.span
                      className="absolute top-1/2 left-1/2 w-4 h-0.5 bg-white rounded-full"
                      style={{
                        transformOrigin: 'center',
                        transform: 'translate(-50%, -50%) rotate(45deg)',
                      }}
                    />
                    <motion.span
                      className="absolute top-1/2 left-1/2 w-4 h-0.5 bg-white rounded-full"
                      style={{
                        transformOrigin: 'center',
                        transform: 'translate(-50%, -50%) rotate(-45deg)',
                      }}
                    />
                  </motion.div>
                </motion.button>
              </div>

              <nav className="space-y-8">
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
                      ['無料相談', 'https://lin.ee/vQmAwMU'],
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
                  <div className="flex items-center justify-between h-16 pt-4">
                    <div className="flex-1"></div>
                    <Link href="/" onClick={() => setIsOpen(false)}>
                      <Image
                        src="/images/logo.svg"
                        alt="N&S Logo"
                        width={120}
                        height={40}
                        className="w-auto h-8"
                        priority
                      />
                    </Link>
                    <div className="flex-1 flex justify-end">
                      {/* ❌閉じるボタン */}
                      <motion.button
                        onClick={() => setIsOpen(false)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100/50 hover:bg-gray-200/80 transition-all duration-300 border border-gray-200/50 backdrop-blur-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="メニューを閉じる"
                      >
                        <motion.div
                          className="relative w-5 h-5"
                          whileHover={{ rotate: 90 }}
                          transition={{ duration: 0.2 }}
                        >
                          {/* ❌の線 */}
                          <motion.span
                            className="absolute top-1/2 left-1/2 w-4 h-0.5 bg-gray-600 rounded-full"
                            style={{
                              transformOrigin: 'center',
                              transform: 'translate(-50%, -50%) rotate(45deg)',
                            }}
                          />
                          <motion.span
                            className="absolute top-1/2 left-1/2 w-4 h-0.5 bg-gray-600 rounded-full"
                            style={{
                              transformOrigin: 'center',
                              transform: 'translate(-50%, -50%) rotate(-45deg)',
                            }}
                          />
                        </motion.div>
                      </motion.button>
                    </div>
                  </div>
                  
                  {/* トップページの場合：テーマ切り替えのみ（モード切り替えはヘッダーに常時表示） */}
                  {isTopPage ? (
                    <div className="pb-4">
                      {/* テーマ切り替えボタン */}
                      <div className="flex justify-center">
                        <motion.button
                          onClick={handleToggleTheme}
                          className="flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300"
                          style={{
                            background: 'rgba(0, 0, 0, 0.05)',
                            border: '1px solid rgba(0, 0, 0, 0.1)'
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {theme === 'dark' ? (
                            <>
                              <SunIcon className="w-5 h-5 text-yellow-500" />
                              <span className="text-sm font-medium text-gray-700">ライトモード</span>
                            </>
                          ) : (
                            <>
                              <MoonIcon className="w-5 h-5 text-gray-700" />
                              <span className="text-sm font-medium text-gray-700">ダークモード</span>
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    /* その他のページ：従来のボタン */
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
                  )}
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
    </>
  );
} 