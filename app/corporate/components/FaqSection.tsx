'use client';

import React, { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { PlusCircleIcon, MinusCircleIcon } from '@heroicons/react/24/outline';

type FaqItem = {
  question: string;
  answer: string;
};

export default function FaqSection() {
  const [isClient, setIsClient] = useState(false);
  const [openIndex, setOpenIndex] = useState<null | number>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // ▼ 既存3問 + 新規6問、合計9件のFAQ ▼
  const faqItems: FaqItem[] = [
    // ------------------ 既存3問 ------------------
    {
      question:
        'Q. NANDSへの相談やパートナー企業の紹介に費用はかかりますか？',
      answer:
        'A. ご相談はすべて無料で承っております。企業様に最適なAI導入をサポートするのが私たちの使命です。',
    },
    {
      question:
        'Q. ChatGPTやAIエージェントの活用イメージがまだ曖昧ですが、大丈夫ですか？',
      answer:
        'A. 問題ございません。ヒアリングやワークショップを通じて、実際の業務プロセスに合わせた具体的な活用シナリオを描いていきます。',
    },
    {
      question:
        'Q. 既存システムとの連携や社内教育もサポートいただけますか？',
      answer:
        'A. はい。NANDSのエンジニアコンサルタントやパートナー企業が、既存システムへの統合や研修プログラムのカスタマイズにも対応いたします。',
    },

    // ------------------ 新規6問 ------------------
    {
      question: 'Q. AI導入までにかかる期間はどのくらいですか？',
      answer:
        'A. 企業規模や導入範囲にもよりますが、PoC（概念実証）から本格運用まで一般的には2〜3ヶ月程度が目安です。要件定義や内部調整の状況によって前後します。',
    },
    {
      question: 'Q. 初期費用や導入コストはどうなりますか？',
      answer:
        'A. コンサルティングは無料相談から始められますが、開発費やライセンス費用などは要件によって変動します。導入ROIを含めた試算レポートを事前にご提案いたします。',
    },
    {
      question:
        'Q. 社内でAI推進するための組織体制づくりもサポートしてもらえますか？',
      answer:
        'A. はい。AI推進部門の設計や人材育成、必要なツール・研修プログラムの選定までトータルで支援します。組織体制の構築により効果的かつ継続的なAI活用を実現します。',
    },
    {
      question: 'Q. 小規模の会社や個人事業主でも依頼できますか？',
      answer:
        'A. もちろん可能です。NANDSは大手企業だけでなく、スタートアップや個人事業主向けのAI活用ソリューションも柔軟にご用意しています。',
    },
    {
      question: 'Q. AI導入後の運用やアップデートはどうなりますか？',
      answer:
        'A. 運用保守フェーズでは、定期的なシステム監視やアップデートを実施。追加機能の相談や新モデルへの切り替えなど、継続的にサポートいたします。',
    },
    {
      question: 'Q. 他の競合サービスとの違いは何でしょうか？',
      answer:
        'A. NANDSはAIエージェントやChatGPT導入のコンサルから開発、運用までを一貫してサポートできる点が強みです。ROI最大化を目指すビジネス視点の提案を大切にしています。',
    },
  ];

  // アニメーション設定
  const springConfig = {
    from: { opacity: 0, maxHeight: 0 },
    config: { tension: 210, friction: 26 },
  };

  // 各FAQアイテムのアニメーション状態を管理
  const animations = faqItems.map((_, index) => {
    const [styles, api] = useSpring(() => springConfig);

    useEffect(() => {
      api.start({
        opacity: openIndex === index ? 1 : 0,
        maxHeight: openIndex === index ? 500 : 0,
      });
    }, [openIndex, index, api]);

    return styles;
  });

  if (!isClient) return null;

  return (
    <section className="relative py-16 bg-white overflow-hidden">
      {/* 上部 Wave */}
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
          よくあるご質問
        </h2>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="bg-gray-50 rounded shadow p-4 transition-all"
              >
                {/* 質問部分 */}
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h3 className="font-bold text-sm md:text-base mr-2">
                    {item.question}
                  </h3>
                  {isOpen ? (
                    <MinusCircleIcon className="w-6 h-6 text-blue-500" />
                  ) : (
                    <PlusCircleIcon className="w-6 h-6 text-blue-500" />
                  )}
                </button>

                {/* 答え部分 (アコーディオン) */}
                <animated.div
                  style={animations[index]}
                  className="overflow-hidden text-sm mt-2"
                >
                  <div className="py-2 px-1 text-gray-600">
                    {item.answer}
                  </div>
                </animated.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 下部 Wave */}
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
