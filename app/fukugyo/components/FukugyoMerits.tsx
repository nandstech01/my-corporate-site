'use client';

import React, { useEffect, useState } from 'react';
import { useSpring, animated, config } from '@react-spring/web';

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

  const cardAnimations = merits.map((_, index) => 
    useSpring({
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
    })
  );

  if (!isClient) {
    return null;
  }

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-indigo-950 via-blue-900 to-indigo-950">
      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>
      
      {/* Floating particles */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <animated.div style={fadeIn} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-200 bg-clip-text text-transparent mb-6">
            セミナーで得られる6つのメリット
          </h2>
          <div className="w-40 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 mx-auto rounded-full mb-8" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {merits.map((merit, index) => (
            <animated.div
              key={index}
              style={cardAnimations[index]}
              className="group relative"
            >
              {/* Card background with gradient border */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700" />
              
              <div className="relative bg-gray-900/40 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl group-hover:shadow-cyan-500/20 transition-all duration-500">
                {/* Number badge */}
                <div className="absolute -top-4 -left-4 w-16 h-16">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="relative w-full h-full bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl font-black text-white">{(index + 1).toString().padStart(2, '0')}</span>
                  </div>
                </div>

                {/* Highlight tag */}
                <div className="ml-10 mb-4">
                  <span className="inline-block px-3 py-1 text-sm bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-full text-cyan-300">
                    {merit.highlight}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-4 ml-10">
                  {merit.title}
                </h3>
                <p className="text-white/80 leading-relaxed">
                  {merit.description}
                </p>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-cyan-400/0 to-blue-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
              </div>
            </animated.div>
          ))}
        </div>

        {/* Super Fancy Button Section */}
        <div className="mt-20 relative">
          {/* Decorative light beams */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] animate-spin-slow">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 h-full origin-bottom"
                  style={{
                    transform: `rotate(${i * 30}deg)`,
                  }}
                >
                  <div className="w-px h-1/2 bg-gradient-to-t from-transparent via-cyan-500/30 to-transparent" />
                </div>
              ))}
            </div>
          </div>

          {/* Button container with animations */}
          <div className="relative text-center">
            <style jsx>{`
              .neon-button {
                display: inline-block;
                position: relative;
                padding: 1.5rem 4rem;
                color: #fff;
                text-decoration: none;
                font-size: 1.5rem;
                font-weight: bold;
                border-radius: 50px;
                background: linear-gradient(
                  90deg,
                  rgba(59, 130, 246, 0.9) 0%,
                  rgba(6, 182, 212, 0.9) 50%,
                  rgba(59, 130, 246, 0.9) 100%
                );
                box-shadow: 0 0 15px rgba(59, 130, 246, 0.6),
                  0 0 30px rgba(6, 182, 212, 0.5),
                  0 0 60px rgba(59, 130, 246, 0.4);
                transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                animation: neonPulse 3s infinite alternate;
                border: 1px solid rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(10px);
              }

              .neon-button:hover {
                transform: scale(1.05) translateY(-5px);
                box-shadow: 0 0 25px rgba(59, 130, 246, 0.8),
                  0 0 50px rgba(6, 182, 212, 0.7),
                  0 0 100px rgba(59, 130, 246, 0.6);
                background: linear-gradient(
                  90deg,
                  rgba(59, 130, 246, 1) 0%,
                  rgba(6, 182, 212, 1) 50%,
                  rgba(59, 130, 246, 1) 100%
                );
              }

              .neon-button::before {
                content: '';
                position: absolute;
                inset: -2px;
                border-radius: 50px;
                padding: 2px;
                background: linear-gradient(
                  90deg,
                  #3b82f6,
                  #06b6d4,
                  #3b82f6
                );
                -webkit-mask: 
                  linear-gradient(#fff 0 0) content-box, 
                  linear-gradient(#fff 0 0);
                mask: 
                  linear-gradient(#fff 0 0) content-box, 
                  linear-gradient(#fff 0 0);
                -webkit-mask-composite: xor;
                mask-composite: exclude;
                opacity: 0.7;
                animation: borderRotate 4s linear infinite;
              }

              @keyframes neonPulse {
                0% {
                  box-shadow: 0 0 15px rgba(59, 130, 246, 0.6),
                    0 0 30px rgba(6, 182, 212, 0.5),
                    0 0 60px rgba(59, 130, 246, 0.4);
                }
                100% {
                  box-shadow: 0 0 20px rgba(59, 130, 246, 0.8),
                    0 0 40px rgba(6, 182, 212, 0.7),
                    0 0 80px rgba(59, 130, 246, 0.6);
                }
              }

              @keyframes borderRotate {
                from {
                  transform: rotate(0deg);
                }
                to {
                  transform: rotate(360deg);
                }
              }
            `}</style>

            <div className="mb-8">
              <p className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-200 font-medium">
                まずは無料セミナーに参加して、<br />
                AI副業の可能性を体験してみませんか？
              </p>
            </div>

            <a
              href="https://lin.ee/gUyPhHa"
              className="neon-button group"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="relative z-10">
                無料セミナーに申し込む
                <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </span>
            </a>

            <p className="mt-6 text-blue-200/80 text-sm">
              ※ 参加特典として、AI活用の基礎講座（通常価格5,000円）を無料プレゼント
            </p>
          </div>
        </div>
      </animated.div>
    </section>
  );
} 