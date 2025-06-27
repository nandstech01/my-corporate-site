'use client';

import React, { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

// FAQ項目の型定義
interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: "リスキリング・研修",
    question: 'エヌアンドエスのリスキリング研修はどのようなサービスですか？',
    answer: '当社のリスキリング研修は、最新の生成AI技術を活用したカリキュラムで、デジタルスキルの習得から実践的な業務活用まで幅広くサポートします。企業の業種・規模に合わせたカスタマイズプランも提供しています。'
  },
  {
    category: "AI・テクノロジー",
    question: 'システム開発やAIソリューションの導入期間はどのくらいですか？',
    answer: 'プロジェクトの規模や要件により異なりますが、チャットボット開発は2-4週間、ベクトルRAG検索システムは4-8週間、フルスタックシステム開発は2-6ヶ月程度が目安となります。お客様のご要望に応じて柔軟に対応いたします。'
  },
  {
    category: "料金・契約",
    question: 'サービスの料金体系はどのようになっていますか？',
    answer: 'プロジェクトの内容や規模に応じてお見積もりいたします。リスキリング研修は助成金活用により最大80%の補助が可能です。まずは無料相談にてご要望をお聞かせください。'
  },
  {
    category: "サポート",
    question: '地方在住でもサービスを利用できますか？',
    answer: 'はい、オンラインでのリモート研修やコンサルティングも提供しているため、全国どこからでもご利用いただけます。対面でのサービスをご希望の場合も、状況に応じて対応いたしますのでご相談ください。'
  },
  {
    category: "マーケティング・支援",
    question: 'AIO対策や人材ソリューションの効果はどの程度期待できますか？',
    answer: 'AIO対策では検索順位の向上とAI検索での露出増加、人材ソリューションでは採用効率の大幅改善を実現しています。具体的な効果は業界や現状により異なるため、まずは無料診断をお受けください。'
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

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/50 relative overflow-hidden">
      <Script
        id="faq-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      
      {/* 背景装飾 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        {/* ヘッダーセクション */}
        <motion.div 
          className="text-center mb-16"
          {...fadeIn}
        >
          <div className="flex items-center justify-center mb-4">
            <QuestionMarkCircleIcon className="w-8 h-8 text-blue-600 mr-3" />
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
              FAQ
            </span>
          </div>
          
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            よくある
            <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 bg-clip-text text-transparent">
              ご質問
            </span>
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            お客様からよくいただくご質問をまとめました。<br />
            その他のご質問がございましたら、お気軽にお問い合わせください。
          </p>
        </motion.div>

        {/* FAQ項目 */}
        <div className="max-w-4xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <motion.button
                onClick={() => toggleFAQ(index)}
                className="flex justify-between items-start w-full text-left p-6 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex-1 pr-4">
                  {/* カテゴリーバッジ */}
                  <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full mb-3">
                    {faq.category}
                  </span>
                  
                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-700 transition-colors">
                    {faq.question}
                  </h3>
                </div>
                
                <motion.div
                  className="flex-shrink-0 ml-4"
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDownIcon className="w-6 h-6 text-blue-600 group-hover:text-blue-700" />
                </motion.div>
              </motion.button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    id={`faq-answer-${index}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 border border-gray-200/50 rounded-2xl mt-2 backdrop-blur-sm">
                      <p className="text-gray-700 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* CTAセクション */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              他にもご質問がございますか？
            </h3>
            <p className="text-gray-600 mb-6">
              より詳しいFAQページもご用意しております。<br />
              お気軽にお問い合わせください。
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/faq"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <QuestionMarkCircleIcon className="w-5 h-5 mr-2" />
                FAQ一覧を見る
              </Link>
              
              <Link
                href="#contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-300"
              >
                お問い合わせ
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection; 