'use client';

import React, { useEffect, useState } from 'react';
import { useSpring, animated, config } from '@react-spring/web';

interface MeritCardProps {
  index: number;
  title: string;
  description: string;
  highlight: string;
}

const MeritCard: React.FC<MeritCardProps> = ({ index, title, description, highlight }) => {
  const style = useSpring({
    from: {
      opacity: 0,
      transform: 'scale(0.8) translateY(50px)',
      filter: 'blur(10px)'
    },
    to: {
      opacity: 1,
      transform: 'scale(1) translateY(0px)',
      filter: 'blur(0px)'
    },
    delay: 200 * index,
    config: config.gentle,
  });

  return (
    <animated.div style={style} className="group relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 via-cyan-300/30 to-blue-400/30 rounded-2xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-700" />
      
      <div className="relative bg-white/[0.8] backdrop-blur-xl rounded-2xl p-8 border border-white/50 shadow-2xl group-hover:shadow-cyan-500/20 transition-all duration-500">
        {/* Number badge with 3D effect */}
        <div className="absolute -top-4 -left-4 w-16 h-16">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity" />
          <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500">
            <span className="text-2xl font-black text-white">{(index + 1).toString().padStart(2, '0')}</span>
          </div>
        </div>

        {/* Highlight tag with glass effect */}
        <div className="ml-10 mb-4">
          <span className="inline-block px-4 py-1.5 text-sm bg-gradient-to-r from-blue-400/20 to-cyan-300/20 border border-blue-400/30 rounded-full text-blue-600 backdrop-blur-md">
            {highlight}
          </span>
        </div>

        {/* Content with enhanced typography */}
        <h3 className="text-2xl font-bold text-gray-800 mb-4 ml-10 tracking-tight">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed text-lg">
          {description}
        </p>

        {/* Interactive hover effects */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-cyan-400/0 to-blue-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
      </div>
    </animated.div>
  );
};

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

  const merits = [
    {
      title: "AIを活用した高単価スキル",
      description: "時給1万円以上も可能な、AI時代に求められる高単価スキルを習得できます。",
      highlight: "時給1万円以上も可能"
    },
    {
      title: "時間効率の最大化",
      description: "AIツールを活用することで、作業時間を大幅に削減。効率的な副業を実現します。",
      highlight: "作業時間を1/6に短縮"
    },
    {
      title: "実践的なノウハウ",
      description: "実際に成果を出している講師陣から、具体的な手法とコツを学べます。",
      highlight: "即実践可能な具体的手法"
    },
    {
      title: "最新AIツールの活用法",
      description: "常に最新のAIツールを取り入れ、効率的な作業フローを構築できます。",
      highlight: "最新技術を常にキャッチアップ"
    },
    {
      title: "キャリアアップ戦略",
      description: "AI時代のキャリア戦略を学び、収入アップと本業でのスキルアップを実現。",
      highlight: "収入とスキル両方の向上"
    },
    {
      title: "継続的なサポート",
      description: "卒業後も、コミュニティでの情報共有や質問対応で、継続的にサポート。",
      highlight: "手厚いアフターフォロー"
    }
  ];

  if (!isClient) {
    return null;
  }

  return (
    <section className="relative py-32 overflow-hidden bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* オーバーレイグラデーション */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-400/[0.1] via-transparent to-blue-400/[0.1]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15),transparent_55%)]" />

      <animated.div style={fadeIn} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold mb-8">
            <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 bg-clip-text text-transparent">
              セミナーで得られる6つのメリット
            </span>
          </h2>
          <p className="text-2xl text-gray-600 font-light max-w-3xl mx-auto">
            AI副業で<span className="font-medium text-blue-700">成功を実現</span>するための
            <span className="font-medium text-blue-700">具体的な方法</span>を学べます
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {merits.map((merit, index) => (
            <MeritCard
              key={index}
              index={index}
              {...merit}
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="https://lin.ee/gUyPhHa"
            className="neon-button group"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="relative z-10 flex items-center">
              無料セミナーに申し込む
              <svg
                className="w-5 h-5 ml-2 transform transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </span>
          </a>
        </div>

        <p className="mt-8 text-gray-600 text-lg">
          ※ 参加特典として、AI活用の基礎講座（通常価格5,000円）を無料プレゼント
        </p>
      </animated.div>
    </section>
  );
} 