'use client';

import React, { useEffect, useState } from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import { AlertCircle, TrendingUp, Clock, BookOpen } from 'lucide-react';

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
      description: "仕事が忙しくて学習時間が取れない...",
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

  // アニメーションの設定を配列として事前に定義
  const cardAnimations = problems.map((_, index) => 
    useSpring({
      from: { opacity: 0, transform: 'scale(0.9)' },
      to: { opacity: 1, transform: 'scale(1)' },
      delay: 200 * index,
      config: config.gentle,
    })
  );

  if (!isClient) {
    return null;
  }

  return (
    <section className="relative py-20 bg-gradient-to-b from-white to-gray-50">
      {/* 装飾的な背景要素 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-full h-full bg-[url('/images/grid.svg')] opacity-5"></div>
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-100 rounded-full filter blur-[100px] opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-cyan-50 rounded-full filter blur-[120px] opacity-30"></div>
      </div>

      <animated.div style={fadeIn} className="relative z-10 max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent">
            このような課題を抱えていませんか？
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            多くの方が感じている不安や課題に、私たちが解決策を提供します
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {problems.map((problem, index) => (
            <animated.div
              key={index}
              style={cardAnimations[index]}
              className="group relative bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {/* グラデーションボーダー */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-400 opacity-75 blur-[2px] -m-[2px]"></div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-400 p-[1px] -m-[1px]">
                <div className="absolute inset-0 rounded-xl bg-white"></div>
              </div>
              
              <div className="relative flex items-start space-x-4">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-300 opacity-20 blur-[10px] animate-pulse"></div>
                  <div className="relative">
                    {problem.icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{problem.title}</h3>
                  <p className="text-gray-600 mb-4">{problem.description}</p>
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4">
                    <p className="text-gray-700">
                      <span className="text-blue-600 font-bold">解決策：</span> {problem.solution}
                    </p>
                  </div>
                </div>
              </div>
            </animated.div>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="inline-block bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-400 p-[1px] rounded-2xl">
            <div className="bg-white px-8 py-6 rounded-2xl">
              <p className="text-xl text-gray-800">
                これらの課題を解決するための<br />
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 text-2xl">
                  具体的な方法をセミナーでお伝えします
                </span>
              </p>
            </div>
          </div>
        </div>
      </animated.div>
    </section>
  );
} 