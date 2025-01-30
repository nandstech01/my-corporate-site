'use client';

import React, { useEffect, useState } from 'react';
import { useTrail, animated, useSpringRef } from '@react-spring/web';

type NewsItem = {
  title: string;
  content: string;
  date: string;
  category: string;
};

export default function NewsSection() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // ニュースデータ
  const newsItems: NewsItem[] = [
    {
      title: '新年のご挨拶：2025年に向けた生成AI事業戦略',
      content: '2025年に向けて、NANDSが強化するChatGPT活用領域や研修プログラムの展望についてご紹介します。',
      date: '2024.01.05',
      category: 'お知らせ',
    },
    {
      title: 'AIエージェント活用ラボ 設立レポート',
      content: 'AIエージェントを活用した業務効率化・イノベーション創出をテーマに社内ラボを始動。定期勉強会や事例紹介が盛り上がりを見せています。',
      date: '2023.12.20',
      category: 'プレスリリース',
    },
    {
      title: '新パートナーシップ締結のお知らせ',
      content: '地域のIT企業との連携強化を発表。ChatGPTや生成AIの導入支援を通じて、地方DXの加速を目指します。',
      date: '2023.12.15',
      category: 'プレスリリース',
    },
  ];

  // アニメーション設定
  const springRef = useSpringRef();
  const trail = useTrail(newsItems.length, {
    ref: springRef,
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 120, friction: 14 },
  });

  useEffect(() => {
    if (isClient) {
      springRef.start();
    }
  }, [isClient]);

  if (!isClient) return null;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          NANDS AIニュース
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trail.map((style, index) => {
            const item = newsItems[index];
            return (
              <animated.div
                key={index}
                style={style}
                className="bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600">{item.date}</span>
                    <span className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-3 text-gray-800">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {item.content}
                  </p>
                  <a
                    href="#"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    詳しく読む
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </a>
                </div>
              </animated.div>
            );
          })}
        </div>
      </div>
    </section>
  );
} 