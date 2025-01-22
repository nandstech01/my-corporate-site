'use client';

import React, { useEffect, useState } from 'react';
import { useSpring, animated } from '@react-spring/web';

export default function FukugyoMerits() {
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

  const cardAnimations = [
    useSpring({
      from: { opacity: 0, transform: 'translateY(40px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
      delay: 200 * 0,
      config: {
        tension: 120,
        friction: 14,
      },
    }),
    useSpring({
      from: { opacity: 0, transform: 'translateY(40px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
      delay: 200 * 1,
      config: {
        tension: 120,
        friction: 14,
      },
    }),
    useSpring({
      from: { opacity: 0, transform: 'translateY(40px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
      delay: 200 * 2,
      config: {
        tension: 120,
        friction: 14,
      },
    }),
    useSpring({
      from: { opacity: 0, transform: 'translateY(40px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
      delay: 200 * 3,
      config: {
        tension: 120,
        friction: 14,
      },
    }),
    useSpring({
      from: { opacity: 0, transform: 'translateY(40px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
      delay: 200 * 4,
      config: {
        tension: 120,
        friction: 14,
      },
    }),
    useSpring({
      from: { opacity: 0, transform: 'translateY(40px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
      delay: 200 * 5,
      config: {
        tension: 120,
        friction: 14,
      },
    }),
  ];

  const merits = [
    {
      title: 'AIを活用した高単価スキル',
      description: 'ChatGPTやその他のAIツールを駆使して、時給1万円以上の案件を獲得できるスキルを習得できます。実践的な事例とともに、具体的な案件獲得までの手順を学べます。',
      highlight: '時給1万円以上も可能',
    },
    {
      title: '時間効率の最大化',
      description: '通常3時間かかる作業を30分で完了させる方法など、AIを活用した具体的な時間短縮テクニックを習得。限られた時間で最大の成果を出すための戦略を学べます。',
      highlight: '作業時間を1/6に短縮',
    },
    {
      title: '実践的なノウハウ',
      description: '実際に月収100万円を達成している受講生の事例を基に、案件の見つけ方、単価交渉、継続的な収入確保まで、成功に必要な具体的なステップを提供します。',
      highlight: '具体的な成功事例あり',
    },
    {
      title: '最新AIツールの活用法',
      description: 'ChatGPT-4、Midjourney、Claude等の最新AIツールを使いこなし、クライアントに価値を提供する方法を学べます。実際の業務で使える実践的なプロンプトも提供。',
      highlight: '最新AIツールを網羅',
    },
    {
      title: 'キャリアアップ戦略',
      description: 'AI時代に求められる人材になるためのロードマップを提供。副業から専業、さらにはAIコンサルタントとしてのキャリア構築まで、段階的な成長戦略を学べます。',
      highlight: '明確なキャリアパス',
    },
    {
      title: '継続的なサポート',
      description: 'セミナー受講後も、専用のコミュニティで質問や相談が可能。先輩受講生との交流や、最新のAI活用事例の共有など、継続的な学習環境を提供します。',
      highlight: '手厚いアフターフォロー',
    },
  ];

  const numberAnimations = merits.map((_, index) => 
    useSpring({
      from: { 
        opacity: 0,
        transform: 'scale(0.3) rotate(-45deg) translateX(-100px)',
        filter: 'blur(20px)'
      },
      to: { 
        opacity: 0.15,
        transform: 'scale(1.2) rotate(0deg) translateX(0)',
        filter: 'blur(0px)'
      },
      delay: 300 * index,
      config: {
        tension: 100,
        friction: 20,
      },
    })
  );

  if (!isClient) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* 装飾的な背景要素 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-full h-full bg-[url('/images/grid.svg')] opacity-5"></div>
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-100 rounded-full filter blur-[100px] opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-cyan-50 rounded-full filter blur-[120px] opacity-30 animate-pulse"></div>
      </div>

      <animated.div style={fadeIn} className="relative max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent">
            セミナーで得られる6つのメリット
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            AI時代の新しいキャリアを確実に手に入れるための具体的なメリットをご紹介
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {merits.map((merit, index) => (
            <animated.div
              key={index}
              style={cardAnimations[index]}
              className="group relative bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* 背景の大きな数字 */}
              <animated.div
                style={numberAnimations[index]}
                className="absolute -top-10 -left-6 text-[300px] font-black text-blue-600 leading-none pointer-events-none select-none bg-gradient-to-br from-blue-600 to-cyan-400 bg-clip-text text-transparent"
              >
                {index + 1}
              </animated.div>

              {/* グラデーションボーダー */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-400 opacity-75 blur-[2px] -m-[2px]"></div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-400 p-[1px] -m-[1px]">
                <div className="absolute inset-0 rounded-xl bg-white"></div>
              </div>

              <div className="relative">
                {/* 小さな数字バッジ */}
                <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {index + 1}
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg px-4 py-2 mb-4 inline-block ml-6">
                  <span className="text-blue-600 font-semibold">{merit.highlight}</span>
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">{merit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{merit.description}</p>
              </div>
            </animated.div>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="inline-block bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-400 p-[1px] rounded-2xl">
            <div className="bg-white px-8 py-6 rounded-2xl">
              <p className="text-xl text-gray-800">
                これらのメリットは、<span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">多くの受講生が実証済み</span>。<br />
                あなたも今すぐAI時代の新しいキャリアをスタートできます。
              </p>
            </div>
          </div>
        </div>
      </animated.div>
    </section>
  );
} 