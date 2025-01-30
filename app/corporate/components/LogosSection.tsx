'use client';

import React, { useEffect } from 'react';
import { useSpring, animated, useSpringRef } from '@react-spring/web';
import Image from 'next/image';

export default function LogosSection() {
  // アニメーション設定
  const springRef = useSpringRef();
  const [containerAnimation, api] = useSpring(() => ({
    ref: springRef,
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 120, friction: 14 },
  }));

  useEffect(() => {
    springRef.start();
  }, []);

  // 企業ロゴデータ
  const logos = [
    {
      src: '/images/google-office.jpg',
      alt: 'テックイノベーション企業',
      width: 160,
      height: 60,
    },
    {
      src: '/images/amazon-warehouse.jpg',
      alt: 'グローバルAI企業',
      width: 160,
      height: 60,
    },
    {
      src: '/images/meeting_scene.png',
      alt: '未来システム企業',
      width: 160,
      height: 60,
    },
    {
      src: '/images/support_scene.png',
      alt: 'AIソリューションズ企業',
      width: 160,
      height: 60,
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <animated.div
        style={containerAnimation}
        className="container mx-auto px-4"
      >
        <h2 className="text-3xl font-bold text-center mb-12">
          導入実績
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
          {logos.map((logo, index) => (
            <div
              key={index}
              className="w-full max-w-[200px] h-[80px] relative bg-white rounded-lg shadow-sm p-4 flex items-center justify-center hover:shadow-md transition-shadow duration-300"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={logo.width}
                height={logo.height}
                className="object-contain"
              />
            </div>
          ))}
        </div>
        <p className="text-center text-gray-600 mt-8 text-sm">
          ※一部抜粋（順不同）
        </p>
      </animated.div>
    </section>
  );
} 