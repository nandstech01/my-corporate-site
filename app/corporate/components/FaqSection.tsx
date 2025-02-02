'use client';

import React, { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { PlusCircleIcon, MinusCircleIcon } from '@heroicons/react/24/outline';

interface FaqItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

const FaqItem: React.FC<FaqItemProps> = ({ question, answer, isOpen, onClick }) => {
  const springProps = useSpring({
    maxHeight: isOpen ? 1000 : 0,
    opacity: isOpen ? 1 : 0,
    config: { duration: 300 }
  });

  return (
    <div className="border-b border-gray-200">
      <button
        className="w-full py-4 text-left focus:outline-none"
        onClick={onClick}
      >
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium">{question}</span>
          <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>
      </button>
      <animated.div style={springProps}>
        <div className="pb-4 text-gray-600">{answer}</div>
      </animated.div>
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
  }
];

const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleClick = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">よくある質問</h2>
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <FaqItem
              key={index}
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
