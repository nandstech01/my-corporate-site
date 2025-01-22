'use client';

import React, { useEffect, useState } from 'react';
import { useSpring, animated } from '@react-spring/web';

export default function FukugyoFlow() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: {
      tension: 120,
      friction: 14,
    },
  });

  if (!isClient) {
    return null;
  }

  const steps = [
    {
      title: 'ステップ1: AI基礎力の習得',
      description: 'ChatGPT、Midjourney、Claudeなどの主要AIツールの基本的な使い方を学びます。実践的なハンズオン形式で、確実にスキルを身につけられます。',
      duration: '所要時間：2時間',
      point: 'Point: AIツールの特性を理解し、用途に応じた使い分けができるようになります。',
    },
    {
      title: 'ステップ2: 実践的スキル開発',
      description: 'AIを使った文章作成、画像生成、データ分析など、実際の仕事で使える実践的なスキルを習得。具体的な案件例を基に、クライアントが求める成果物の作り方を学びます。',
      duration: '所要時間：3時間',
      point: 'Point: 実際の案件で使える具体的なテクニックを習得できます。',
    },
    {
      title: 'ステップ3: 収益化戦略',
      description: '案件の見つけ方、単価設定、クライアントとの交渉術など、実際に収入を得るために必要な知識とスキルを学びます。成功事例を基にした具体的なアプローチ方法を解説。',
      duration: '所要時間：2時間',
      point: 'Point: 副業として月5万円以上の収入を得るための具体的な方法を学べます。',
    },
    {
      title: 'ステップ4: キャリア構築',
      description: 'AI時代のキャリアプランニング。副業から専業への移行、さらにはAIコンサルタントとしてのキャリアまで、段階的な成長戦略を提示します。',
      duration: '所要時間：2時間',
      point: 'Point: 長期的なキャリアビジョンを描き、実現するための具体的なステップを理解できます。',
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <animated.div style={fadeIn} className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
          セミナーの流れ
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4">
                {index + 1}
              </div>
              <h3 className="text-xl font-semibold mb-4 text-blue-600">{step.title}</h3>
              <p className="text-gray-600 mb-4">{step.description}</p>
              <p className="text-sm text-gray-500 mb-2">{step.duration}</p>
              <p className="text-sm font-medium text-blue-600">{step.point}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <p className="text-lg text-gray-700 mb-6">
            全9時間のセミナーで、AI副業に必要な全てのスキルと知識を習得できます。<br />
            セミナー終了後も、専用コミュニティでのサポートが継続されます。
          </p>
          <a className="neon-button group">
            <span className="relative z-10">
              無料セミナーに申し込む
              <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">
                →
              </span>
            </span>
          </a>
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
              cursor: pointer;
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
          `}</style>
        </div>
      </animated.div>
    </section>
  );
} 