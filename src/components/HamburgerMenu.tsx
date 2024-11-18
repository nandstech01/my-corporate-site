import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CSSTransition } from 'react-transition-group';

const HamburgerMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    const fixedButtons = document.querySelector('.fixed-buttons');
    if (fixedButtons) {
      if (isOpen) {
        fixedButtons.classList.add('hidden');
      } else {
        fixedButtons.classList.remove('hidden');
      }
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        onClick={toggleMenu}
        className="p-2 rounded-md hover:bg-gray-100 focus:outline-none"
        aria-label="メニューを開く"
      >
        <div className={`hamburger-icon ${isOpen ? 'open' : ''}`}>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
        </div>
      </button>

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
                    onClick={toggleMenu}
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
                    onClick={toggleMenu}
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
                      onClick={toggleMenu}
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
    </div>
  );
};

export default HamburgerMenu;