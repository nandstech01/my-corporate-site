'use client';

import React, { useEffect, useState } from 'react';
import { useSpring, animated } from '@react-spring/web';

export default function FukugyoHero() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: {
      tension: 120,
      friction: 14,
    },
  });

  const glowAnimation = useSpring({
    from: { boxShadow: '0 0 20px rgba(59, 130, 246, 0)' },
    to: { boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)' },
    loop: { reverse: true },
    config: { duration: 2000 },
  });

  if (!isClient) {
    return null;
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-blue-800">
      {/* 装飾的な背景要素 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/grid.svg')] opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-40 h-40 bg-blue-500 rounded-full filter blur-[100px] opacity-30"></div>
          <div className="absolute top-40 right-20 w-60 h-60 bg-cyan-400 rounded-full filter blur-[120px] opacity-20"></div>
          <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-blue-300 rounded-full filter blur-[100px] opacity-20"></div>
        </div>
      </div>

      <animated.div style={fadeIn} className="relative z-10 max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="mb-8">
          <span className="inline-block px-4 py-2 bg-white rounded-full text-blue-600 text-sm font-semibold mb-4">
            AI × 副業で人生を変える
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            <span className="block mb-2">AI副業セミナー</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              月収100万円も夢じゃない
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">
            初心者でもゼロから始められる<br />
            <span className="font-bold text-cyan-300">AI時代の新しい働き方</span>
          </p>
        </div>

        <animated.div style={glowAnimation} className="mb-12">
          <div className="inline-block bg-gradient-to-r from-blue-600 to-cyan-500 p-[2px] rounded-lg">
            <div className="bg-gray-900 bg-opacity-90 px-8 py-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">95%</div>
                  <div className="text-blue-300">セミナー満足度</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">好評開催中</div>
                  <div className="text-blue-300">少人数制で丁寧な指導</div>
                </div>
              </div>
            </div>
          </div>
        </animated.div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <button className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
            無料セミナーに申し込む
          </button>
          <div className="text-blue-200">
            ※オンライン受講可能 / 顔出し不要<br />
            少人数制で丁寧にサポート
          </div>
        </div>
      </animated.div>
    </section>
  );
} 