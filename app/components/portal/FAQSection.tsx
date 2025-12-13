'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useTheme } from './ThemeContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// FAQ項目の型定義
interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  // AIアーキテクト育成
  {
    category: "AIアーキテクト育成",
    question: 'AIアーキテクトとは何ですか？',
    answer: 'AIアーキテクトは、システム全体を俯瞰し、AIを「部品」として組み込む設計者です。もはやコードは書きません。MCP、RAG、Agentsを統合し、企業OS全体を設計します。2026年、エンジニアは「作る人」から「設計する人」へ進化します。'
  },
  {
    category: "AIアーキテクト育成",
    question: 'Cursor 2.0とは何ですか？なぜ重要なのですか？',
    answer: 'Cursor 2.0は、AIペアプログラミング環境で効率を10倍にするツールです。Claude・GPT-4統合によるコード生成、Composer機能でプロジェクト全体を操ります。もう「書く」時代は終わりました。6ヶ月で実務レベルに到達可能です。'
  },
  {
    category: "AIアーキテクト育成",
    question: 'MCP、Mastra Frameworkとは何ですか？',
    answer: 'MCPはModel Context Protocolの略で、AIツール連携の標準規格です。Mastra Frameworkはエージェント開発フレームワークで、これらを統合することでシステム全体を俯瞰するアーキテクト思考を習得できます。'
  },
  {
    category: "AIアーキテクト育成",
    question: 'Vector Link構造化設計とは何ですか？',
    answer: 'Vector Linkは、データの「意味（Context）」を構造化し、AIがデータを正確に理解できる仕組みです。構造なきデータは、AIにとってノイズでしかありません。ベクトルリンクによる構造化が、RAGの精度を決定づけます。'
  },
  
  // AIキャリア戦略
  {
    category: "AIキャリア戦略",
    question: '2026年、エンジニアのキャリアはどう変わりますか？',
    answer: '2026年、生き残るのは「書く人」ではなく「設計する人」です。AIを『使う側』から『操る人』へ。コードを書く時代は終わり、AIが1秒で書きます。あなたはシステムを設計する側に回る必要があります。'
  },
  {
    category: "AIキャリア戦略",
    question: 'プログラミング未経験でもAIアーキテクトになれますか？',
    answer: 'はい、可能です。従来のプログラミングスキルよりも、システム全体を俯瞰する設計思考が重要です。Cursor 2.0を使えば、AIがコードを書いてくれるため、あなたは「何を作るか」に集中できます。6ヶ月の実践カリキュラムで実務レベルに到達します。'
  },
  {
    category: "AIキャリア戦略",
    question: '個人向けリスキリングの料金はいくらですか？',
    answer: '月額10,000円の「生存戦略プラン」を提供しています。6ヶ月コースで、Cursor 2.0完全習得からAIアーキテクト養成プログラムまで、実践的なカリキュラムを受講できます。さらにLINE限定の裏カリキュラムも無料配布中です。'
  },

  // 法人リスキリング
  {
    category: "法人リスキリング",
    question: '法人向けリスキリングの料金はいくらですか？',
    answer: '正規240,000円のところ、人材開発助成金を活用すると国が75%負担するため、実質60,000円/人（6ヶ月）となります。1日あたり333円で社員をAIアーキテクトに育成できます。助成金申請サポートも付いています。'
  },
  {
    category: "法人リスキリング",
    question: '人材開発助成金とは何ですか？どのように活用できますか？',
    answer: '厚生労働省が認定する「人材開発助成金プログラム」により、研修費用の75%を国が負担します。当社は助成金申請サポートも提供しているため、申請手続きもスムーズに進められます。国が認めたプログラムで安心して社員のAIリスキリングを進められます。'
  },
  {
    category: "法人リスキリング",
    question: '社員のAIリスキリングで何を学べますか？',
    answer: 'ChatGPT、Gemini、Claude、Genspark、ManusなどのLLMの基礎から学習できます。月1万円から受講可能で、AIを基礎から学習し、実務で活用できるレベルまで育成します。カスタマイズ研修も可能です。'
  },
  {
    category: "法人リスキリング",
    question: '研修期間はどのくらいですか？オンラインでも受講できますか？',
    answer: '6ヶ月の実践カリキュラムです。完全オンライン対応のため、全国どこからでも受講可能です。社員の業務と並行して学習でき、実務に即したスキルを習得できます。'
  },

  // AI駆動開発
  {
    category: "AI駆動開発",
    question: 'AI駆動開発とは何ですか？',
    answer: '全自動化を目指すための開発手法です。Cursor、Mastra、MCP、Akoolなどのツールを統合し、AIエージェントによる自動化システムを構築します。カスタマイズ研修も可能で、全自動化AIアーキテクトを養成します。'
  },
  {
    category: "AI駆動開発",
    question: 'チャットボット開発とベクトルRAG検索の違いは何ですか？',
    answer: 'チャットボットは「質問に答える」ツールです。しかし、ベクトルRAG検索は「意図に応える」システムです。AIはファイルを読みません。データの「意味（Context）」を読みます。ベクトルリンクによる構造化が、RAGの精度を決定づけます。'
  },
  {
    category: "AI駆動開発",
    question: 'RAGを導入したのに精度が悪いのはなぜですか？',
    answer: 'ChatGPTにPDFを読ませただけのRAGは、ただの「検索窓」です。構造なきデータは、AIにとってノイズでしかありません。必要なのは「ベクトルリンク」による構造化です。データの渡し方（コンテキスト）が、AIの回答精度を決めます。'
  },
  {
    category: "AI駆動開発",
    question: 'システム開発の期間と料金はどのくらいですか？',
    answer: 'プロジェクトの規模により異なりますが、チャットボット開発は2-4週間、ベクトルRAG検索システムは4-8週間、フルスタックシステム開発は2-6ヶ月が目安です。まずは無料相談でご要望をお聞かせください。IT補助金の活用も可能です。'
  },

  // 料金・サポート
  {
    category: "料金・サポート",
    question: '無料相談はどのように申し込めますか？',
    answer: 'LINEまたはお問い合わせフォームから無料相談を申し込めます。AIアーキテクトが直接対応し、あなたのキャリアや企業の課題に合わせた最適なプランをご提案します。'
  },
  {
    category: "料金・サポート",
    question: '地方在住でもサービスを利用できますか？',
    answer: 'はい、完全オンライン対応のため、全国どこからでもご利用いただけます。滋賀県・関西地方での実績も豊富にあります。対面でのサービスをご希望の場合も、状況に応じて対応いたしますのでご相談ください。'
  },
  {
    category: "料金・サポート",
    question: '資料請求はできますか？',
    answer: 'はい、無料で資料請求が可能です。サービス資料をPDFでお送りしますので、お問い合わせフォームからご請求ください。法人向けには助成金活用ガイドも同梱しています。'
  }
];

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { theme } = useTheme();
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);

  // Fragment IDマッピング（データベースのfragment_vectorsテーブルと一致）
  const getFragmentId = (index: number): string => {
    return `faq-main-${index + 1}`;
  };

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // 🆕 ディープリンク対応：URLハッシュ検出でFAQを自動展開
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      
      if (hash) {
        const targetIndex = faqs.findIndex((faq, index) => {
          const fragmentId = getFragmentId(index);
          return fragmentId === hash;
        });
        
        if (targetIndex !== -1) {
          setOpenIndex(targetIndex);
          
          // スライダーを該当のスライドに移動
          if (swiperInstance) {
            swiperInstance.slideTo(targetIndex);
          }
          
          setTimeout(() => {
            const element = document.getElementById(hash);
            
            if (element) {
              const headerOffset = 120;
              const elementPosition = element.getBoundingClientRect().top;
              const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
              
              window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
              });
            }
          }, 500);
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [swiperInstance]);

  return (
    <section 
      className="py-20 sm:py-28 relative overflow-hidden scroll-mt-20"
      style={{
        background: theme === 'dark'
          ? 'linear-gradient(180deg, #0A1628 0%, #0D1B2A 100%)'
          : 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)'
      }}
    >
      <div className="container mx-auto px-4 relative z-10">
        {/* ヘッダーセクション */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p 
            className="text-sm font-semibold uppercase tracking-wider mb-3"
            style={{ color: theme === 'dark' ? '#00d4ff' : '#0066cc' }}
          >
            FAQ
          </p>
          
          <h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
            style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}
          >
            よくある
            <span 
              className="text-transparent bg-clip-text bg-gradient-to-r ml-2"
              style={{
                backgroundImage: theme === 'dark'
                  ? 'linear-gradient(to right, #00d4ff, #9333ea)'
                  : 'linear-gradient(to right, #0066cc, #6b46c1)'
              }}
            >
              ご質問
            </span>
          </h2>
          
          <p 
            className="text-base sm:text-lg max-w-3xl mx-auto"
            style={{ color: theme === 'dark' ? '#d1d5db' : '#4a5568' }}
          >
            AIアーキテクト育成、AIキャリア、法人リスキリング、AI駆動開発に関する<br className="hidden sm:block" />
            よくいただくご質問をまとめました。
          </p>
        </motion.div>

        {/* FAQ スライダー */}
        <div className="max-w-6xl mx-auto mb-8">
          <Swiper
            modules={[Navigation, Pagination, Keyboard]}
            spaceBetween={24}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            keyboard={{ enabled: true }}
            breakpoints={{
              768: {
                slidesPerView: 2,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 32,
              },
            }}
            onSwiper={setSwiperInstance}
            className="faq-swiper"
            style={{
              paddingBottom: '60px',
            }}
          >
            {faqs.map((faq, index) => {
              const fragmentId = getFragmentId(index);

              return (
                <SwiperSlide key={index}>
                  <motion.div
                    className="relative h-full"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    {/* Fragment IDアンカー要素 */}
                    <div id={fragmentId} className="absolute -top-20" aria-hidden="true"></div>
                    
                    <motion.button
                      onClick={() => toggleFAQ(index)}
                      className={`
                        flex flex-col justify-between items-start w-full text-left p-6 sm:p-8 rounded-3xl h-full
                        ${theme === 'dark'
                          ? 'bg-gray-900/50 border border-gray-800 hover:bg-gray-900/70'
                          : 'bg-white border border-gray-200 hover:bg-gray-50'
                        }
                        shadow-xl hover:shadow-2xl transition-all duration-300 group
                      `}
                      aria-expanded={openIndex === index}
                      aria-controls={`faq-answer-${index}`}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex-1 w-full">
                        {/* カテゴリーバッジ */}
                        <span 
                          className={`
                            inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3
                            ${theme === 'dark'
                              ? 'bg-cyan-500/20 text-cyan-400'
                              : 'bg-blue-100 text-blue-700'
                            }
                          `}
                        >
                          {faq.category}
                        </span>
                        
                        <h3 
                          className={`
                            font-bold text-lg sm:text-xl mb-4
                            ${theme === 'dark'
                              ? 'text-white group-hover:text-cyan-400'
                              : 'text-gray-900 group-hover:text-blue-600'
                            }
                            transition-colors
                          `}
                        >
                          {faq.question}
                        </h3>

                        <AnimatePresence>
                          {openIndex === index && (
                            <motion.div
                              id={`faq-answer-${index}`}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.4, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <p 
                                className={`
                                  text-sm sm:text-base leading-relaxed pt-4 border-t
                                  ${theme === 'dark'
                                    ? 'text-gray-300 border-gray-700'
                                    : 'text-gray-700 border-gray-200'
                                  }
                                `}
                              >
                                {faq.answer}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      <motion.div
                        className="flex-shrink-0 mt-4"
                        animate={{ rotate: openIndex === index ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDownIcon 
                          className={`
                            w-6 h-6
                            ${theme === 'dark'
                              ? 'text-cyan-400'
                              : 'text-blue-600'
                            }
                          `}
                        />
                      </motion.div>
                    </motion.button>
                  </motion.div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        {/* CTAセクション */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div 
            className={`
              rounded-3xl p-8 sm:p-12 max-w-2xl mx-auto
              ${theme === 'dark'
                ? 'bg-gray-900/50 border border-gray-800'
                : 'bg-white border border-gray-200'
              }
              shadow-xl
            `}
          >
            <h3 
              className={`
                text-2xl sm:text-3xl font-bold mb-4
                ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
              `}
            >
              他にご質問はございませんか？
            </h3>
            <p 
              className={`
                text-base sm:text-lg mb-8
                ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}
              `}
            >
              AIアーキテクトが直接お答えします。<br />
              お気軽にお問い合わせください。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="https://lin.ee/s5dmFuD"
                className={`
                  inline-flex items-center justify-center px-8 py-4 rounded-full font-bold text-base sm:text-lg
                  transition-all duration-300 hover:scale-105
                  ${theme === 'dark'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/40'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-700 text-white shadow-lg shadow-blue-500/40'
                  }
                `}
              >
                <span className="mr-2">すぐに無料相談</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="https://nands.tech/dm-form"
                className={`
                  inline-flex items-center justify-center px-8 py-4 rounded-full font-bold text-base sm:text-lg
                  transition-all duration-300 hover:scale-105
                  ${theme === 'dark'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/40'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-700 text-white shadow-lg shadow-purple-500/40'
                  }
                `}
              >
                <span className="mr-2">無料で資料請求</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* カスタムスタイル */}
      <style jsx global>{`
        .faq-swiper .swiper-button-next,
        .faq-swiper .swiper-button-prev {
          color: ${theme === 'dark' ? '#00d4ff' : '#0066cc'};
          background: ${theme === 'dark' ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.9)'};
          width: 44px;
          height: 44px;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .faq-swiper .swiper-button-next:after,
        .faq-swiper .swiper-button-prev:after {
          font-size: 20px;
          font-weight: bold;
        }

        .faq-swiper .swiper-pagination-bullet {
          background: ${theme === 'dark' ? '#4b5563' : '#d1d5db'};
          opacity: 1;
        }

        .faq-swiper .swiper-pagination-bullet-active {
          background: ${theme === 'dark' ? '#00d4ff' : '#0066cc'};
        }
      `}</style>
    </section>
  );
};

export default FAQSection;
