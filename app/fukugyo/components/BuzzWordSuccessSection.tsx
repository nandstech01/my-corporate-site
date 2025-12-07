'use client';

import React, { useEffect, useState } from 'react';
import { useSpring, animated } from '@react-spring/web';

export default function BuzzWordSuccessSection() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: {
      tension: 280,
      friction: 20,
    },
  });

  const cardAnimations = [
    useSpring({
      from: { opacity: 0, transform: 'translateY(40px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
      delay: 200,
      config: { tension: 280, friction: 20 },
    }),
    useSpring({
      from: { opacity: 0, transform: 'translateY(40px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
      delay: 400,
      config: { tension: 280, friction: 20 },
    }),
    useSpring({
      from: { opacity: 0, transform: 'translateY(40px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
      delay: 600,
      config: { tension: 280, friction: 20 },
    }),
  ];

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
            BUZZ WORDで実現できること
          </h2>
          <div className="w-40 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 mx-auto rounded-full mb-8" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "情報収集の効率化",
              description: "AIを活用して最新トレンドを自動収集。時間を大幅に削減できます。",
              highlight: "作業時間を1/10に"
            },
            {
              title: "高品質なコンテンツ",
              description: "AIによる文章生成と人間による編集で、質の高い記事を作成できます。",
              highlight: "クオリティ保証"
            },
            {
              title: "安定した収入",
              description: "定期的な記事作成で、毎月の安定収入を実現できます。",
              highlight: "月5-10万円の収入"
            }
          ].map((item, index) => (
            <animated.div key={index} style={cardAnimations[index]} className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700" />
              
              <div className="relative bg-gray-900/40 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl group-hover:shadow-cyan-500/20 transition-all duration-500">
                <div className="absolute -top-4 -left-4 w-16 h-16">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="relative w-full h-full bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl font-black text-white">{(index + 1).toString().padStart(2, '0')}</span>
                  </div>
                </div>

                <div className="ml-10 mb-4">
                  <span className="inline-block px-3 py-1 text-sm bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-full text-cyan-300">
                    {item.highlight}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-4 ml-10">
                  {item.title}
                </h3>
                <p className="text-white/80 leading-relaxed">
                  {item.description}
                </p>

                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-cyan-400/0 to-blue-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
              </div>
          </animated.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <a
            href="https://lin.ee/vQmAwMU"
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
          <p className="mt-8 text-blue-200/80 text-lg">
            ※ 初回相談限定で、BUZZ WORD活用診断（通常価格3万円）を無料実施
          </p>
        </div>
      </animated.div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </section>
  );
} 