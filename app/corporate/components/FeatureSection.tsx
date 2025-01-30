'use client';

import React, { useEffect, useState } from 'react';
import { useTrail, animated } from '@react-spring/web';
import {
  UserGroupIcon,
  BoltIcon,
  ArrowPathIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';

type FeatureItem = {
  title: string;
  text: string;
  icon: React.ReactNode;
};

export default function FeatureSection() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // ----- 4つの特徴を定義 -----
  const features: FeatureItem[] = [
    {
      title: 'AI人材不足を解決',
      text: 'AIエージェントとエンジニアコンサルタントによる二重サポート。国内外の幅広いネットワークを活用し、人材不足をスピード解消します。',
      icon: <UserGroupIcon className="w-8 h-8 text-blue-500 mb-4" />,
    },
    {
      title: 'ChatGPT導入ノウハウを提供',
      text: '最新の生成AI事例や研修プログラムをもとに、企業特有の課題に柔軟に対応。スムーズなシステム連携でROIを最大化します。',
      icon: <BoltIcon className="w-8 h-8 text-blue-500 mb-4" />,
    },
    {
      title: '大幅な業務効率化',
      text: 'ChatGPTやAIエージェントが単純作業を代行。Next.jsで構築したWebアプリと連携し、社内外のワークフローを圧倒的に短縮します。',
      icon: <ArrowPathIcon className="w-8 h-8 text-blue-500 mb-4" />,
    },
    {
      title: 'スピーディーなDX推進',
      text: '全社横断のDXをスモールスタートから展開し、段階的に拡張。迅速な検証サイクルで競合優位を確立する体制を築きます。',
      icon: <RocketLaunchIcon className="w-8 h-8 text-blue-500 mb-4" />,
    },
  ];

  // ----- フェードインアニメーション（useTrailで4項目分） -----
  const trail = useTrail(features.length, {
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 120, friction: 14 },
    delay: 200,
  });

  if (!isClient) {
    return null; // SSR時にはレンダリングしない
  }

  return (
    <section className="relative py-16 bg-white overflow-hidden">
      {/* Top wave */}
      <div className="absolute top-0 left-0 w-full leading-[0]">
        <svg
          className="block w-full h-[80px]"
          fill="#FFFFFF"
          preserveAspectRatio="none"
          viewBox="0 0 1200 120"
        >
          <path d="M0,0V46.29c47.6,22,98.5,31.91,148,36.06,54.22,4.57,108.65-1.34,162-9.43,51.55-7.86,103.12-18.31,154-12.72,48.77,5.4,95.4,25.52,143,39.07,41,11.53,85.14,20.28,128,17.36,36.41-2.36,70.83-12.12,105-22.18,40.22-11.53,79.3-24.84,120-29.46,47.95-5.32,95.6,1.52,143,10.88,30.53,5.88,60.77,13.45,91,20.56V0Z" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-3xl font-bold text-center mb-8">
          NANDS AI活用で解決できる課題
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
          {trail.map((style, index) => {
            const f = features[index];
            return (
              <animated.div
                key={index}
                style={style}
                className="bg-gray-50 p-6 rounded-lg shadow hover:shadow-xl transition-shadow duration-300 flex flex-col items-start"
              >
                {f.icon}
                <h3 className="font-bold text-lg mb-2 text-gray-800">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {f.text}
                </p>
              </animated.div>
            );
          })}
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 w-full leading-[0] rotate-180">
        <svg
          className="block w-full h-[80px]"
          fill="#FFFFFF"
          preserveAspectRatio="none"
          viewBox="0 0 1200 120"
        >
          <path d="M0,0V46.29c47.6,22,98.5,31.91,148,36.06,54.22,4.57,108.65-1.34,162-9.43,51.55-7.86,103.12-18.31,154-12.72,48.77,5.4,95.4,25.52,143,39.07,41,11.53,85.14,20.28,128,17.36,36.41-2.36,70.83-12.12,105-22.18,40.22-11.53,79.3-24.84,120-29.46,47.95-5.32,95.6,1.52,143,10.88,30.53,5.88,60.77,13.45,91,20.56V0Z" />
        </svg>
      </div>
    </section>
  );
} 