'use client';

import React, { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

type Particle = {
  left: string;
  top: string;
  delay: string;
  duration: string;
  opacity: string;
};

interface FaqItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
  index: number;
}

const FaqItem: React.FC<FaqItemProps> = ({ question, answer, isOpen, onClick, index }) => {
  const springProps = useSpring({
    maxHeight: isOpen ? 1000 : 0,
    opacity: isOpen ? 1 : 0,
    config: { duration: 300 }
  });

  return (
    <div className="mb-6 group relative">
      {/* Card background glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 rounded-xl ${isOpen ? 'opacity-10' : 'opacity-0'} group-hover:opacity-10 blur-lg transition-opacity duration-500`} />
      
      <div className="relative bg-white/90 backdrop-blur-sm rounded-xl p-1 border border-blue-100 shadow-lg overflow-hidden">
        <button
          className="w-full py-4 px-6 text-left focus:outline-none"
          onClick={onClick}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full flex items-center justify-center mr-4">
                <span className="text-sm font-bold text-white">{(index + 1).toString().padStart(2, '0')}</span>
              </div>
              <span className="text-lg font-medium text-gray-800">{question}</span>
            </div>
            <span className="flex-shrink-0 ml-4">
              {isOpen ? (
                <MinusIcon className="w-6 h-6 text-blue-500" />
              ) : (
                <PlusIcon className="w-6 h-6 text-blue-500" />
              )}
            </span>
          </div>
        </button>
        <animated.div style={springProps} className="overflow-hidden">
          <div className="px-6 pb-4 text-gray-600 ml-12">{answer}</div>
        </animated.div>
      </div>
    </div>
  );
};

const faqs = [
  {
    question: "AIソリューションの導入にかかる期間はどのくらいですか？",
    answer: "プロジェクトの規模や要件によって異なりますが、通常は2〜6ヶ月程度です。具体的な期間は、初回のコンサルティングでご提案させていただきます。"
  },
  {
    question: "導入後のサポート体制はどうなっていますか？",
    answer: "24時間365日のテクニカルサポート、定期的なメンテナンス、アップデート情報の提供など、包括的なサポート体制を整えています。"
  },
  {
    question: "セキュリティ対策は万全ですか？",
    answer: "最新のセキュリティ基準に準拠し、データの暗号化、アクセス制御、定期的なセキュリティ監査を実施しています。"
  },
  {
    question: "費用はどのくらいかかりますか？",
    answer: "プロジェクトの規模や期間によって異なります。初回のご相談は無料ですので、お気軽にお問い合わせください。お客様の予算に合わせたプランをご提案いたします。"
  },
  {
    question: "自社に合ったAIソリューションの選び方を教えてください",
    answer: "まずは現状の課題と目標を明確にすることが大切です。具体的な業務プロセスや既存システムの分析を行い、AIによる改善効果が高い領域を特定します。無料相談会では、御社に最適なAIソリューションをご提案いたします。"
  }
];

const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // クライアントサイドでのみパーティクルを生成
    const newParticles = Array.from({ length: 8 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${5 + Math.random() * 5}s`,
      opacity: '0.2'
    }));
    setParticles(newParticles);
  }, []);

  const handleClick = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 bg-clip-text text-transparent mb-6">
            よくある質問
          </h2>
          <div className="w-40 h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 mx-auto rounded-full mb-8" />
          <p className="text-gray-600 max-w-2xl mx-auto">
            サービスに関するよくあるご質問と回答をまとめました
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <FaqItem
              key={index}
              index={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => handleClick(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
