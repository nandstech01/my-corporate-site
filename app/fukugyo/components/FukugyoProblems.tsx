'use client';

import React, { useEffect, useState } from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import { AlertCircle, TrendingUp, Clock, BookOpen } from 'lucide-react';

const AnimatedCard = ({ index, children }: { index: number; children: React.ReactNode }) => {
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
      {children}
    </animated.div>
  );
};

export default function FukugyoProblems() {
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

  const problems = [
    {
      title: "将来への不安",
      description: "AI時代の到来で、今の仕事がなくなるかもしれない...",
      solution: "AIを味方につけて、新しいスキルを身につけましょう",
      icon: <AlertCircle size={32} strokeWidth={1.5} className="text-blue-500" />
    },
    {
      title: "収入の限界",
      description: "今の給料だけでは将来が心配...",
      solution: "AI副業で新しい収入源を確保できます",
      icon: <TrendingUp size={32} strokeWidth={1.5} className="text-blue-500" />
    },
    {
      title: "時間の制約",
      description: "本業との両立が難しく、時間の確保に悩んでいる",
      solution: "効率的なAIツールの活用で時間を最大限に活用",
      icon: <Clock size={32} strokeWidth={1.5} className="text-blue-500" />
    },
    {
      title: "スキルの不安",
      description: "AIの知識がなく、どこから始めればいいか分からない...",
      solution: "基礎から丁寧に学べるカリキュラムをご用意",
      icon: <BookOpen size={32} strokeWidth={1.5} className="text-blue-500" />
    }
  ];

  if (!isClient) {
    return null;
  }

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,0,0,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,0,0,0.05)_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>
      
      {/* Floating particles */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-red-400 rounded-full animate-float"
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
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-200 via-rose-200 to-red-200 bg-clip-text text-transparent mb-6">
            このような課題を抱えていませんか？
          </h2>
          <div className="w-40 h-1 bg-gradient-to-r from-red-500 via-rose-400 to-red-500 mx-auto rounded-full mb-8" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <AnimatedCard key={index} index={index}>
              {/* Card background with gradient border */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-rose-400 to-red-500 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700" />
              
              <div className="relative bg-gray-900/40 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl group-hover:shadow-red-500/20 transition-all duration-500">
                {/* Number badge */}
                <div className="absolute -top-4 -left-4 w-16 h-16">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-400 rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="relative w-full h-full bg-gradient-to-br from-red-600 to-rose-500 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl font-black text-white">{(index + 1).toString().padStart(2, '0')}</span>
                  </div>
                </div>

                {/* Solution tag */}
                <div className="ml-10 mb-4">
                  <span className="inline-block px-3 py-1 text-sm bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/20 rounded-full text-rose-300">
                    {problem.solution}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-4 ml-10">
                  {problem.title}
                </h3>
                <p className="text-white/80 leading-relaxed">
                  {problem.description}
                </p>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/0 via-rose-400/0 to-red-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
              </div>
            </AnimatedCard>
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
                  <div className="w-px h-1/2 bg-gradient-to-t from-transparent via-rose-500/30 to-transparent" />
                </div>
              ))}
            </div>
          </div>

          {/* Button container with animations */}
          <div className="relative text-center">
            <div className="mb-8">
              <p className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-red-200 via-rose-200 to-red-200 font-medium">
                これらの課題を解決する方法を、<br />
                無料セミナーで詳しくご説明します
              </p>
            </div>

            <a
              href="https://lin.ee/gUyPhHa"
              className="neon-button-red group"
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

            <p className="mt-6 text-red-200/80 text-sm">
              ※ 参加特典として、AI活用の基礎講座（通常価格5,000円）を無料プレゼント
            </p>
          </div>
        </div>
      </animated.div>
    </section>
  );
} 