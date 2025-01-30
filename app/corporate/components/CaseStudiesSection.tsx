'use client';

import React, { useEffect, useState } from 'react';
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

export default function CaseStudiesSection() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // --- 導入事例のデータ（アイコン追加で視覚的に差別化） ---
  const caseStudies: CaseStudy[] = [
    {
      title: '【地元IT企業】ChatGPT導入でドキュメント作成を効率化',
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
  ];

  // --- カードフェードイン（react-spring useTrail） ---
  const trail = useTrail(caseStudies.length, {
    from: { opacity: 0, transform: 'translateY(15px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    delay: 200,
    config: { tension: 180, friction: 18 },
  });

  if (!isClient) {
    return null;
  }

  return (
    <section className="relative py-16 bg-gray-100 overflow-hidden">
      {/* 上部Wave背景（薄いグレー） */}
      <div className="absolute top-0 left-0 w-full leading-[0]">
        <svg
          className="block w-full h-[80px]"
          fill="#F3F4F6" 
          preserveAspectRatio="none"
          viewBox="0 0 1200 120"
        >
          <path d="M1200 0L1200 46.29C1152.4 68.29 1101.5 78.2 1052 82.35C997.78 86.92 943.35 81.01 890 72.92C838.45 65.06 786.88 54.62 736 60.21C687.23 65.61 640.6 85.73 593 99.28C552 110.81 507.86 119.56 465 116.64C428.59 114.28 394.17 104.52 360 94.46C319.78 82.93 280.7 69.62 240 64.99C192.05 59.67 144.4 66.51 97 75.87C66.47 81.75 36.23 89.32 6 96.43L0 97.71V0Z" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-3xl font-bold text-center mb-10">導入事例</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trail.map((style, index) => {
            const cs = caseStudies[index];
            return (
              <animated.div
                key={index}
                style={style}
                className="bg-white rounded-xl shadow hover:shadow-xl transition-shadow duration-300 p-6 relative"
              >
                {/* アイコン */}
                <div>{cs.icon}</div>

                {/* タイトル */}
                <h3 className="font-bold mb-3 text-gray-800">{cs.title}</h3>

                {/* 説明 */}
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                  {cs.description}
                </p>

                {/* 業種ラベル */}
                <span className="text-xs text-gray-400">{cs.industry}</span>

                {/* 装飾ライン（左端） */}
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-50 rounded-l-xl"></div>
              </animated.div>
            );
          })}
        </div>
      </div>

      {/* 下部Wave背景（さらに薄いグレー） */}
      <div className="absolute bottom-0 left-0 w-full leading-[0] rotate-180">
        <svg
          className="block w-full h-[80px]"
          fill="#F3F4F6"
          preserveAspectRatio="none"
          viewBox="0 0 1200 120"
        >
          <path d="M1200 0V46.29C1140.9 59.93 1080.3 63.18 1022 68.54C968.12 73.38 915.83 80.81 862 73.29C806.59 65.44 750.74 44.72 696 31.23C652.67 20 613.52 13.38 568 16.63C516.88 20.48 468.22 35.17 419 44.56C371.76 53.28 323.09 55.33 274 49.8C236.25 45.27 198.81 36.58 160 31.48C113.88 25.59 67.83 28.37 21 37.51C10.23 39.56 0 42.53 0 42.53V0Z" />
        </svg>
      </div>
    </section>
  );
}
