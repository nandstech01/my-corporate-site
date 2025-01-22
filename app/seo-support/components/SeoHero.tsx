'use client';

import { FC } from 'react';
import { useSpring, animated, config } from '@react-spring/web';

const SeoHero: FC = () => {
  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { ...config.gentle },
    delay: 100,
  });

  const backgroundAnimation = useSpring({
    from: { backgroundPosition: '0% 50%' },
    to: { backgroundPosition: '100% 50%' },
    config: { duration: 20000 },
    loop: true,
  });

  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      {/* アニメーションする背景 */}
      <animated.div
        style={{
          ...backgroundAnimation,
          backgroundSize: '200% 200%',
          position: 'absolute',
          inset: 0,
        }}
        className="bg-gradient-to-r from-blue-800 via-blue-600 to-blue-800"
      />

      {/* 背景の地球アイコン */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
        <div 
          className="w-[800px] h-[800px] animate-spin-slow opacity-10"
          style={{
            background: `url('/images/globe.svg') no-repeat center center`,
            backgroundSize: 'contain',
            filter: 'brightness(1.5) saturate(0) contrast(1.2)',
          }}
        />
      </div>

      {/* オーバーレイグラデーション */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/50 to-transparent" />

      {/* メインコンテンツ */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        <animated.div style={fadeIn} className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-8 drop-shadow-lg">
            助成金活用
            <br />
            <span className="bg-gradient-to-r from-blue-50 to-blue-200 bg-clip-text text-transparent">
              SEO支援サービス
            </span>
          </h1>

          <div className="space-y-8">
            <div className="flex flex-wrap items-baseline gap-4">
              <p className="text-xl text-blue-50">費用の</p>
              <p className="text-7xl sm:text-8xl font-black text-blue-100 leading-none drop-shadow-lg">
                80%
              </p>
              <p className="text-xl text-blue-50">が補助される</p>
            </div>

            <p className="text-2xl font-bold text-blue-50 drop-shadow">
              ビッグチャンスを見逃すな！
            </p>

            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-lg">
              <p className="text-lg text-blue-50">
                令和8年度末までの期間限定支援制度。
                <br />
                最新のSEO戦略を導入し、あなたのビジネスの成長を加速させます。
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <a
                href="#contact"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 text-blue-900 hover:from-blue-100 hover:via-blue-200 hover:to-blue-100 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg"
              >
                資料ダウンロード
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a
                href="#flow"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full border-2 border-blue-100/50 text-blue-50 hover:bg-blue-100/10 transition-all duration-300 backdrop-blur-sm"
              >
                サービスの流れ
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>
          </div>
        </animated.div>
      </div>
    </section>
  );
};

export default SeoHero; 