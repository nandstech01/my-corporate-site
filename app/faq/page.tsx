'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../../src/components/common/Footer';

const FAQPage = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setActiveCategory(activeCategory === category ? null : category);
  };

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const faqs = [
    {
      category: "AI・テクノロジーサービス",
      icon: "🤖",
      items: [
        {
          id: "tech-1",
          q: "システム開発の対応範囲を教えてください",
          a: "Webアプリケーション、AIシステム、データ分析基盤、API開発など幅広く対応しています。React、Next.js、Python、Node.jsなど最新技術を活用し、スケーラブルなシステムを構築します。"
        },
        {
          id: "tech-2",
          q: "チャットボット開発の導入期間はどのくらいですか？",
          a: "基本的なチャットボットで2-4週間、高度なAI機能を含む場合は6-8週間程度です。お客様の要件に応じてカスタマイズいたします。"
        },
        {
          id: "tech-3",
          q: "ベクトルRAG検索システムとは何ですか？",
          a: "大量の文書データから関連性の高い情報を瞬時に検索できるAIシステムです。社内文書、FAQ、マニュアルなどを効率的に活用できます。"
        },
        {
          id: "tech-4",
          q: "AIエージェント開発ではどのようなことができますか？",
          a: "業務自動化、顧客対応、データ分析、レポート生成など様々なタスクを自動化するAIエージェントを開発します。複数のエージェントが連携するマルチエージェントシステムも構築可能です。"
        },
        {
          id: "tech-5",
          q: "MCPサーバーとは何ですか？",
          a: "Model Context Protocolサーバーは、AIモデルと外部システムを安全に連携させるためのサーバーです。Claude Desktopなどとの統合により、効率的なAI活用が可能になります。"
        }
      ]
    },
    {
      category: "リスキリング・研修",
      icon: "📚",
      items: [
        {
          id: "reskill-1",
          q: "プログラミングの経験がなくても受講できますか？",
          a: "はい、プログラミング未経験の方でも受講いただけます。基礎コースでは、生成AIの基本的な使い方から丁寧に解説していきます。"
        },
        {
          id: "reskill-2",
          q: "オンラインでの受講は可能ですか？",
          a: "はい、全てのコースをオンラインで受講いただけます。ビデオ通話によるメンタリングやチャットサポートなど、充実したオンラインサポート体制を整えています。"
        },
        {
          id: "reskill-3",
          q: "法人向け研修のカスタマイズは可能ですか？",
          a: "はい、企業様の業種・規模・目的に合わせて研修内容をカスタマイズいたします。製造業、金融業、小売業など、業界特化型の研修プログラムもご用意しています。"
        },
        {
          id: "reskill-4",
          q: "助成金の活用は可能ですか？",
          a: "はい、人材開発支援助成金をはじめとする各種助成金の活用をサポートしています。最大75%の助成を受けられる場合があります。"
        }
      ]
    },
    {
      category: "マーケティング・支援サービス",
      icon: "📈",
      items: [
        {
          id: "marketing-1",
          q: "AIO対策とは何ですか？",
          a: "AI Optimization（AI最適化）の略で、ChatGPTやBingなどのAI検索エンジンに対する最適化手法です。従来のSEOに加えて、AI時代の新しいマーケティング戦略です。"
        },
        {
          id: "marketing-2",
          q: "AIO対策の効果が出るまでの期間は？",
          a: "通常2-3ヶ月で効果が現れ始め、6ヶ月で大幅な改善が期待できます。従来のSEOよりも早期に効果を実感いただけることが多いです。"
        },
        {
          id: "marketing-3",
          q: "人材ソリューションではどのようなサービスを提供していますか？",
          a: "求人サイト構築、AIマッチングエンジン、レコメンド機能、職務経歴書自動生成、履歴書・退職届自動生成など、人材関連業務の包括的なデジタル化をサポートします。"
        },
        {
          id: "marketing-4",
          q: "副業支援はどのような内容ですか？",
          a: "AI活用による副業スキルの習得から、実際の案件獲得まで総合的にサポートします。プログラミング、データ分析、コンテンツ制作など多様な分野に対応しています。"
        }
      ]
    },
    {
      category: "料金・契約について",
      icon: "💰",
      items: [
        {
          id: "price-1",
          q: "料金体系について教えてください",
          a: "サービスによって異なりますが、基本的には初期費用+月額料金、または一括料金での提供となります。お客様の予算に応じたプランをご提案いたします。"
        },
        {
          id: "price-2",
          q: "分割払いは可能ですか？",
          a: "はい、クレジットカード会社による分割払いや、銀行振込での分割払いも可能です。詳細は無料相談時にご案内いたします。"
        },
        {
          id: "price-3",
          q: "契約期間の縛りはありますか？",
          a: "サービスによって異なりますが、効果を実感いただくために最低契約期間を設けている場合があります。詳細は各サービスページをご確認ください。"
        },
        {
          id: "price-4",
          q: "返金保証はありますか？",
          a: "研修サービスでは受講開始から8日以内の全額返金保証があります。その他のサービスについては個別にご相談ください。"
        }
      ]
    },
    {
      category: "サポート・その他",
      icon: "🛠️",
      items: [
        {
          id: "support-1",
          q: "サポート時間を教えてください",
          a: "平日10:00〜19:00でのサポートを基本としていますが、緊急時や重要なプロジェクトについては時間外対応も可能です。"
        },
        {
          id: "support-2",
          q: "地方からでもサービスを利用できますか？",
          a: "はい、オンラインでのリモートサービスを中心に提供しているため、全国どこからでもご利用いただけます。必要に応じて出張対応も可能です。"
        },
        {
          id: "support-3",
          q: "セキュリティ対策は大丈夫ですか？",
          a: "最新のセキュリティ基準に準拠し、データの暗号化、アクセス制御、定期的なセキュリティ監査を実施しています。機密性の高いプロジェクトにも対応可能です。"
        },
        {
          id: "support-4",
          q: "導入後の継続サポートはありますか？",
          a: "はい、導入後も継続的なサポートを提供しています。定期的なメンテナンス、アップデート、追加機能の開発なども対応いたします。"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Fragment ID for Entity Map - Hidden from users */}
      <div id="company" style={{ display: 'none' }} aria-hidden="true" />
      
      {/* ヘッダースペース */}
      <div className="pt-20">
        <motion.div 
          {...fadeIn}
          className="max-w-6xl mx-auto px-4 py-12"
        >
          {/* ページタイトル */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              よくある質問
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              エヌアンドエスのサービスに関するよくあるご質問をまとめました。
              <br />お探しの情報が見つからない場合は、お気軽にお問い合わせください。
            </p>
          </div>

          {/* FAQ カテゴリー選択 */}
          <div className="mb-12">
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {faqs.map((category, index) => (
                <button
                  key={index}
                  onClick={() => toggleCategory(category.category)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${
                    activeCategory === category.category
                      ? 'bg-blue-600 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.category}</span>
                </button>
              ))}
            </div>
          </div>

          {/* FAQ コンテンツ */}
          <div className="space-y-8">
            {faqs.map((category, categoryIndex) => (
              <motion.section 
                key={categoryIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: !activeCategory || activeCategory === category.category ? 1 : 0.3,
                  y: 0,
                  scale: !activeCategory || activeCategory === category.category ? 1 : 0.95
                }}
                transition={{ duration: 0.3 }}
                className={`${
                  activeCategory && activeCategory !== category.category ? 'hidden' : ''
                }`}
              >
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <span className="text-3xl">{category.icon}</span>
                      <span>{category.category}</span>
                    </h2>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-4">
                      {category.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="border border-gray-100 rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleItem(item.id)}
                            className="w-full text-left p-6 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-sm">Q</span>
                              </div>
                              <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                {item.q}
                              </span>
                            </div>
                            <motion.div
                              animate={{ rotate: openItems.includes(item.id) ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                              className="flex-shrink-0 ml-4"
                            >
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </motion.div>
                          </button>
                          
                          <AnimatePresence>
                            {openItems.includes(item.id) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className="px-6 pb-6 pt-2">
                                  <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                      <span className="text-green-600 font-bold text-sm">A</span>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed">
                                      {item.a}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.section>
            ))}
          </div>

          {/* お問い合わせ誘導セクション */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center"
          >
            <h2 className="text-2xl font-bold mb-4">その他のご質問・お問い合わせ</h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              ここに記載がない内容や、より詳細な情報が必要な場合は、
              お気軽にお問い合わせください。専門スタッフが丁寧にご対応いたします。
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="font-semibold mb-3">📧 メールでのお問い合わせ</h3>
                <a 
                  href="mailto:contact@nands.tech" 
                  className="text-blue-200 hover:text-white transition-colors underline"
                >
                  contact@nands.tech
                </a>
                <p className="text-sm text-blue-200 mt-2">
                  24時間受付・24時間以内に回答
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="font-semibold mb-3">📞 お電話でのお問い合わせ</h3>
                <a 
                  href="tel:0120558551" 
                  className="text-blue-200 hover:text-white transition-colors underline text-xl font-bold"
                >
                  0120-558-551
                </a>
                <p className="text-sm text-blue-200 mt-2">
                  平日 10:00〜19:00
                </p>
              </div>
            </div>

            <div className="mt-8">
              <a
                href="https://lin.ee/LRj3T2V"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition-colors"
              >
                <span>💬</span>
                <span>LINEで無料相談</span>
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default FAQPage; 