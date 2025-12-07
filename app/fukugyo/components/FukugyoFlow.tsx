'use client';

import React, { useEffect, useState } from 'react';
import { useSpring, animated, config } from '@react-spring/web';

export default function FukugyoFlow() {
  const [isClient, setIsClient] = useState(false);
  const [satisfaction, setSatisfaction] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    setIsClient(true);
    const timer = setTimeout(() => {
      setSatisfaction(95);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const { number } = useSpring({
    from: { number: 0 },
    to: { number: satisfaction },
    config: config.molasses,
  });

  // Calculate the circle's circumference and offset
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const maxOffset = circumference * 0.95; // 95% of the circle

  const steps = [
    {
      title: 'AIで広がるチャンス',
      description:
        '今、AIを活用しているのは日本人の10％以下。だからこそ大きな伸びしろがあり、誰でも「先行者メリット」を得られる可能性があります。',
      subNote: '未経験からでもOK！ 周りと差をつけましょう。',
      point: 'Key: AI副業はまだレッドオーシャン',
      gradient: 'from-blue-500 to-purple-500',
    },
    {
      title: '「BuzzWord」の力',
      description:
        '株式会社エヌアンドエス独自開発のスクレイピングツール「BuzzWord」を誰でも使えます。市場調査やキーワード分析を一瞬で終わらせ、稼ぐためのネタ探しも楽々！',
      subNote: '精度の高い自動解析でデータ収集の時短を実現。',
      point: 'Key: 誰でも「BuzzWord」を使えれば稼げる',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      title: '絶対使うべきAIツール',
      description:
        'ChatGPT、Midjourney、Claudeなど、多彩なAIツールの効果的な活用法を公開。用途に応じた使い分けで、あなたの仕事が劇的に効率UPします。',
      subNote: '各ツールの活用ポイントを学び、稼げる仕組みを吸収！',
      point: 'Key: 作業効率2倍・3倍が当たり前の時代へ',
      gradient: 'from-pink-500 to-red-500',
    },
    {
      title: 'AIキャリアロードマップ',
      description:
        '副業から専業へのステップアップ、さらにAIコンサルタントとしてのキャリア形成まで、一気通貫でイメージが描けるロードマップを提示。',
      subNote: '短期収益だけでなく、長期的なキャリアにも対応可能！',
      point: 'Key: AI時代の生き方を最速で攻略',
      gradient: 'from-red-500 to-yellow-500',
    },
  ];

  if (!isClient) return null;

  return (
    <section className="relative py-20 bg-gradient-to-b from-sky-50 to-white overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)',
            filter: 'blur(100px)',
            animation: 'float 15s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)',
            filter: 'blur(100px)',
            animation: 'float 20s ease-in-out infinite reverse',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">
          <span className="bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            この無料セミナーで
            <br className="md:hidden" />
            得られるもの
          </span>
        </h2>

        <div className="flex flex-col items-center justify-center mb-20">
          <div className="relative w-72 h-72">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="fukugyo-flow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="8"
              />
              <animated.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#fukugyo-flow-gradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${number.to(n => (maxOffset * (n / 100)).toFixed(2))}, ${circumference}`}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <animated.span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {number.to(n => `${n.toFixed(0)}%`)}
              </animated.span>
              <span className="text-gray-600 text-lg mt-2">満足度</span>
            </div>
          </div>
          <div className="text-center mt-6">
            <p className="text-xl text-gray-800 font-medium">
              セミナー満足度
              <span className="text-blue-600 font-bold mx-1">95%</span>
              以上！
            </p>
            <p className="text-gray-600 mt-2 max-w-lg mx-auto">
              多くの方が「想像以上にわかりやすかった」「すぐに使えそう」と回答。
              きっとあなたの疑問や不安も解消されるはずです。
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                transform: hoveredCard === index ? 'scale(1.02)' : 'scale(1)',
                transition: 'transform 0.3s ease-out',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-5 rounded-2xl transition-opacity duration-300 group-hover:opacity-10"
                style={{
                  background: `linear-gradient(135deg, ${step.gradient.split(' ')[1]}, ${step.gradient.split(' ')[3]})`,
                }}
              />
              <div className="p-6 relative z-10">
                <div className="relative mb-6">
                  <div className={`absolute -left-2 -top-2 w-16 h-16 bg-gradient-to-r ${step.gradient} rounded-2xl shadow-lg transform -rotate-6 transition-transform duration-300 group-hover:rotate-0 group-hover:scale-110 opacity-20`} />
                  <div className={`absolute -left-1 -top-1 w-16 h-16 bg-gradient-to-r ${step.gradient} rounded-2xl shadow-lg transform rotate-3 transition-transform duration-300 group-hover:rotate-0 group-hover:scale-105 opacity-40`} />
                  <div className={`relative w-16 h-16 bg-gradient-to-r ${step.gradient} rounded-2xl shadow-lg flex items-center justify-center transform transition-all duration-300 group-hover:scale-100`}>
                    <span className="text-white text-2xl font-bold">
                      {index + 1}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {step.title}
                </h3>
                <p className="text-gray-700 mb-4 leading-relaxed">{step.description}</p>
                <p className="text-sm text-gray-500 italic mb-3">{step.subNote}</p>
                <div className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {step.point}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-xl text-gray-800 mb-8 leading-relaxed max-w-3xl mx-auto">
            これらを身につけると、AI副業を"実際に動かす"ための武器が揃います
            <br />
            <span className="font-medium text-blue-600">
              あなたも今すぐ、膨大なチャンスを手にする第一歩を踏み出しませんか？
            </span>
          </p>

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
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </section>
  );
} 