'use client';

import React, { useEffect, useState } from 'react';
import { useTrail, animated } from '@react-spring/web';
import {
  ChatBubbleLeftEllipsisIcon,
  MagnifyingGlassCircleIcon,
  ServerStackIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';

export default function FlowSection() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // --- 4ステップの情報を配列管理 ---
  const steps = [
    {
      title: 'STEP1',
      icon: <ChatBubbleLeftEllipsisIcon className="w-8 h-8 text-blue-500" />,
      content:
        'お問い合わせフォームからご連絡ください。要件や課題が漠然としていても問題ありません。担当者が丁寧にヒアリングいたします。',
    },
    {
      title: 'STEP2',
      icon: <MagnifyingGlassCircleIcon className="w-8 h-8 text-blue-500" />,
      content:
        'NANDSのエンジニアコンサルタントが課題を分析。AIエージェントや生成AIの導入プランを複数の視点からご提案します。',
    },
    {
      title: 'STEP3',
      icon: <ServerStackIcon className="w-8 h-8 text-blue-500" />,
      content:
        '要件や予算を踏まえ、最適な開発体制・パートナーを選定。Next.jsなどの技術スタックやクラウド環境もあわせてご提案します。',
    },
    {
      title: 'STEP4',
      icon: <RocketLaunchIcon className="w-8 h-8 text-blue-500" />,
      content:
        'PoC（概念実証）や試験運用を経て、正式リリースに向けてプロジェクトを進行。導入後も運用支援や追加アドバイスを継続提供します。',
    },
  ];

  // --- 各ステップを順番にフェードインするアニメーション ---
  const trail = useTrail(steps.length, {
    from: { opacity: 0, transform: 'translateY(30px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 140, friction: 18 },
    delay: 200,
  });

  if (!isClient) return null;

  return (
    <section className="relative py-16 bg-gray-100 overflow-hidden">
      {/* 上部Wave背景 */}
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

      {/* Main Container */}
      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-3xl font-bold text-center mb-10">ご利用の流れ</h2>

        {/* Timeline (steps) */}
        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Horizontal line (hidden on mobile, shown on md+) */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-blue-100 z-0" />

          {trail.map((style, index) => {
            const step = steps[index];
            return (
              <animated.div
                key={index}
                style={style}
                className="bg-white rounded-xl shadow hover:shadow-xl p-6 relative z-10 transition-transform duration-300"
              >
                {/* Circle icon container */}
                <div className="flex items-center justify-center w-14 h-14 bg-blue-50 rounded-full mb-4 mx-auto md:mx-0 md:mb-2 relative">
                  {/* Position indicator line (vertical) for mobile */}
                  {index < steps.length - 1 && (
                    <div className="absolute bottom-[-50%] left-[50%] w-0.5 h-[50%] bg-blue-100 md:hidden" />
                  )}
                  {/* Icon */}
                  {step.icon}
                </div>
                <h3 className="font-bold text-lg text-center md:text-left mb-2 text-gray-800">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed text-center md:text-left">
                  {step.content}
                </p>
              </animated.div>
            );
          })}
        </div>
      </div>

      {/* 下部Wave背景 */}
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
