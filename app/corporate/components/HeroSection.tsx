'use client';

import React, { useEffect, useState } from 'react';
import { useSpring, animated, useSpringRef, useChain } from '@react-spring/web';

export default function HeroSection() {
  // SSRとクライアントレンダリングの差異を吸収するためのフラグ
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // スクロール処理の追加
  const scrollToContact = () => {
    const contactSection = document.querySelector('#contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // アニメーション用のref
  const contentRef = useSpringRef();
  const bgRef = useSpringRef();

  // メインコンテンツのアニメーション
  const contentAnimation = useSpring({
    ref: contentRef,
    from: { opacity: 0, transform: 'translateY(15px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 120, friction: 14 },
  });

  // 背景円のアニメーション設定
  const bgCircles = [
    {
      style: useSpring({
        ref: bgRef,
        from: { opacity: 0, transform: 'scale(0.5)' },
        to: { opacity: 0.25, transform: 'scale(1.0)' },
        config: { duration: 2000 },
      }),
      className: "absolute top-10 left-10 w-48 h-48 bg-blue-500 rounded-full filter blur-[100px]"
    },
    {
      style: useSpring({
        ref: bgRef,
        from: { opacity: 0, transform: 'scale(0.4)' },
        to: { opacity: 0.2, transform: 'scale(1)' },
        config: { duration: 2200 },
      }),
      className: "absolute top-[40%] right-20 w-72 h-72 bg-cyan-400 rounded-full filter blur-[120px]"
    },
    {
      style: useSpring({
        ref: bgRef,
        from: { opacity: 0, transform: 'scale(0.3)' },
        to: { opacity: 0.2, transform: 'scale(1)' },
        config: { duration: 2000 },
      }),
      className: "absolute bottom-20 left-1/3 w-56 h-56 bg-blue-300 rounded-full filter blur-[100px]"
    }
  ];

  // アニメーションの連鎖を設定
  useChain([bgRef, contentRef], [0, 0.4]);

  if (!isClient) {
    return null; // SSR時には描画しない
  }

  return (
    <section className="relative h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-slate-900 to-blue-900">
      {/* 背景に敷く半透明の模様やブラーエフェクト */}
      <div className="absolute inset-0">
        {/* 薄いグリッド模様を敷く例 */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/grid.svg')] opacity-5"></div>

        {/* ぼんやりとした青系のぼかし丸 */}
        {bgCircles.map((circle, index) => (
          <animated.div
            key={index}
            style={circle.style}
            className={circle.className}
          />
        ))}
      </div>

      {/* コンテンツ（テキスト・ボタン） */}
      <animated.div
        style={contentAnimation}
        className="relative z-10 w-full max-w-4xl mx-auto px-4 flex flex-col items-center"
      >
        <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mt-8 md:mt-12 mb-6 text-center w-full">
          <span className="block text-blue-300 mb-4">NANDS</span>
          法人向け AI導入支援
        </h1>
        <p className="text-lg md:text-xl text-blue-100 mb-10 md:mb-12 text-center w-full">
          生成AIとChatGPT、AIエージェントを活用し、
          <br className="hidden md:block" />
          ビジネスの課題を包括的に解決！
        </p>

        <button
          onClick={scrollToContact}
          className="relative bg-blue-600 text-white py-3 px-8 rounded-full text-lg font-semibold hover:bg-blue-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg mb-8 md:mb-12"
        >
          無料相談はこちら
        </button>
      </animated.div>
    </section>
  );
}
