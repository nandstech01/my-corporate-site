'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useTrail, animated } from '@react-spring/web';
import {
  ChatBubbleLeftRightIcon,
  GlobeAltIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

type CaseStudy = {
  title: string;
  description: string;
  industry: string;
  icon: React.ReactNode; 
};

type Particle = {
  left: string;
  top: string;
  delay: string;
  duration: string;
  opacity: string;
};

export default function CaseStudiesSection() {
  const [isClient, setIsClient] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setIsClient(true);
    
    // クライアントサイドでのみパーティクルを生成
    const newParticles = Array.from({ length: 10 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${5 + Math.random() * 5}s`,
      opacity: '0.3'
    }));
    setParticles(newParticles);
  }, []);

  // 導入事例のデータをuseMemorizationで最適化
  const caseStudies = useMemo<CaseStudy[]>(() => [
    {
      title: '【地元IT企業】ChatGPT導入でドキュメント・コンテンツ作成を効率化',
      description:
        'NANDSのコンサルタントが主導し、地域特化のIT企業へChatGPTを導入。顧客提案資料の作成時間を約40%削減し、プロジェクト受注率向上に貢献。',
      industry: '業種：ITサービス（地方企業）',
      icon: <ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-500 mb-4" />,
    },
    {
      title: '【地域中堅SIer】Next.js活用で生成AIを組み込んだWebアプリを開発',
      description:
        '生成AIをバックエンドに据えたWebアプリをNext.jsで構築。プロトタイプから実装までを短期で完了し、開発コストを70%削減に成功。',
      industry: '業種：システムインテグレーション',
      icon: <GlobeAltIcon className="w-8 h-8 text-blue-500 mb-4" />,
    },
    {
      title: '【中小メーカー】AIエージェントとエンジニアコンサルティングで生産性UP',
      description:
        'エンジニア向けに生成AIとAIエージェントを活用したスキル指導を実施。プログラム開発工数を大幅に縮減し、設計・検証フェーズも効率化。',
      industry: '業種：製造（自動機器）',
      icon: <WrenchScrewdriverIcon className="w-8 h-8 text-blue-500 mb-4" />,
    },
  ], []);

  // クライアントサイドでのみトレイルアニメーションを実行
  const trail = useTrail(isClient ? caseStudies.length : 0, {
    from: { opacity: 0, transform: 'translateY(15px)' },
    to: { opacity: isClient ? 1 : 0, transform: isClient ? 'translateY(0)' : 'translateY(15px)' },
    delay: 200,
    config: { tension: 180, friction: 18 },
    // アニメーションの即時適用
    immediate: !isClient,
  });

  if (!isClient) {
    // サーバーサイドの初期レンダリングでは非表示
    return (
      <section className="relative py-20 bg-white overflow-hidden">
        <div className="container mx-auto px-6 sm:px-8 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">導入事例</h2>
            <div className="w-40 h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 mx-auto rounded-full mb-8" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {caseStudies.map((cs, index) => (
              <div key={index} className="bg-white rounded-xl shadow p-6 relative" style={{ opacity: 0 }}></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-20 bg-white overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Floating particles */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-300 rounded-full animate-float"
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
              opacity: particle.opacity
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 sm:px-8 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 bg-clip-text text-transparent mb-6">
            導入事例
          </h2>
          <div className="w-40 h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 mx-auto rounded-full mb-8" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trail.map((style, index) => {
            const cs = caseStudies[index];
            return (
              <animated.div
                key={index}
                style={style}
                className="group relative"
              >
                {/* Card background with gradient border */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700" />
                
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-blue-100 shadow-xl group-hover:shadow-blue-500/10 transition-all duration-500">
                  {/* Number badge */}
                  <div className="absolute -top-4 -left-4 w-16 h-16">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-400 rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity" />
                    <div className="relative w-full h-full bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center">
                      <span className="text-2xl font-black text-white">{(index + 1).toString().padStart(2, '0')}</span>
                    </div>
                  </div>

                  {/* アイコン */}
                  <div className="ml-10 mb-3">{cs.icon}</div>

                  {/* タイトル */}
                  <h3 className="font-bold text-xl mb-4 text-gray-800 ml-10">{cs.title}</h3>

                  {/* 説明 */}
                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                    {cs.description}
                  </p>

                  {/* 業種ラベル */}
                  <span className="text-xs text-gray-400">{cs.industry}</span>
                  
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-blue-400/0 to-blue-500/0 opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
                </div>
              </animated.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
