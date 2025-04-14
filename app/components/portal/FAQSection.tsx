'use client';

import React, { useState } from 'react';
import Script from 'next/script';

// FAQ項目の型定義
interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'エヌアンドエスのリスキリング研修はどのようなサービスですか？',
    answer: '当社のリスキリング研修は、最新の生成AI技術を活用したカリキュラムで、デジタルスキルの習得から実践的な業務活用まで幅広くサポートします。企業の業種・規模に合わせたカスタマイズプランも提供しています。'
  },
  {
    question: '研修の対象者や前提知識はありますか？',
    answer: '初心者から中級者まで、様々なレベルに対応したコースをご用意しています。特にAI初心者向けのプログラムも充実しており、前提知識がなくても安心して学び始めることができます。'
  },
  {
    question: 'キャリアコンサルティングはどのような流れで進みますか？',
    answer: '初回のヒアリングでご要望や現状を把握し、キャリア分析とビジョン設計を行います。その後、具体的なアクションプランを策定し、継続的なサポートを通じて目標達成までをバックアップします。'
  },
  {
    question: '法人向けと個人向けのサービスの違いは何ですか？',
    answer: '法人向けサービスでは組織全体のスキル底上げや人材育成戦略の策定をサポートし、個人向けサービスではキャリアチェンジや転職、スキルアップなど個々の目標に合わせた支援を提供しています。'
  },
  {
    question: '地方在住でもサービスを利用できますか？',
    answer: 'はい、オンラインでのリモート研修やコンサルティングも提供しているため、全国どこからでもご利用いただけます。対面でのサービスをご希望の場合も、状況に応じて対応いたしますのでご相談ください。'
  }
];

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // FAQ構造化データの作成
  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    }))
  };

  return (
    <section className="py-16 bg-gray-50">
      <Script
        id="faq-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">よくあるご質問</h2>
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div key={index} className="mb-4">
              <button
                onClick={() => toggleFAQ(index)}
                className="flex justify-between items-center w-full text-left p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="font-medium text-lg">{faq.question}</span>
                <span className="text-blue-600 ml-4">
                  {openIndex === index ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  )}
                </span>
              </button>
              
              <div 
                id={`faq-answer-${index}`}
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96 mt-2' : 'max-h-0'
                }`}
              >
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection; 