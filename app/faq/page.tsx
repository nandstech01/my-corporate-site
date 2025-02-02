'use client'

import React from 'react';
import { motion } from 'framer-motion';
import Footer from '../../src/components/common/Footer';

const FAQPage = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const faqs = [
    {
      category: "受講について",
      items: [
        {
          q: "プログラミングの経験がなくても受講できますか？",
          a: "はい、プログラミング未経験の方でも受講いただけます。基礎コースでは、生成AIの基本的な使い方から丁寧に解説していきます。"
        },
        {
          q: "オンラインでの受講は可能ですか？",
          a: "はい、全てのコースをオンラインで受講いただけます。ビデオ通話によるメンタリングやチャットサポートなど、充実したオンラインサポート体制を整えています。"
        },
        {
          q: "受講に必要な環境を教えてください",
          a: "インターネット接続環境とパソコン（Windows/Mac）があれば受講可能です。タブレットやスマートフォンでは一部機能が制限される可能性があるため、パソコンでの受講を推奨しています。"
        }
      ]
    },
    {
      category: "コース内容について",
      items: [
        {
          q: "各コースの違いを教えてください",
          a: "基礎コースでは生成AIの基本的な使い方とプロンプトエンジニアリングの基礎を、応用コースではビジネスでの実践的な活用方法を、エキスパートコースではAI導入戦略の立案や組織での展開方法を学びます。"
        },
        {
          q: "受講期間の延長は可能ですか？",
          a: "はい、4週間単位で延長が可能です。延長料金は4週間あたり64,000円（税込）となります。"
        },
        {
          q: "途中でコース変更は可能ですか？",
          a: "原則として受講開始後のコース変更はできませんが、特別な事情がある場合は個別にご相談ください。"
        }
      ]
    },
    {
      category: "料金・お支払いについて",
      items: [
        {
          q: "分割払いは可能ですか？",
          a: "クレジットカード会社による分割払いが可能です。詳細は無料相談時にご案内いたします。"
        },
        {
          q: "返金保証はありますか？",
          a: "はい、受講開始から8日以内であれば、全額返金が可能です。8日を超えた場合は、規定の計算方法に基づいて返金額を算出いたします。"
        }
      ]
    },
    {
      category: "サポート体制について",
      items: [
        {
          q: "質問できる時間帯を教えてください",
          a: "チャットによる質問は24時間受け付けています。回答は原則として24時間以内に行います。ビデオ通話によるメンタリングは10:00〜19:00の間で予約制となっています。"
        },
        {
          q: "メンタリングの回数に制限はありますか？",
          a: "基本的に週2回までのメンタリングをご利用いただけます。それ以上の回数が必要な場合は、個別にご相談ください。"
        }
      ]
    },
    {
      category: "修了後のサポートについて",
      items: [
        {
          q: "修了後もサポートはありますか？",
          a: "はい、修了後も教材の閲覧は可能です。また、有料オプションとして、メンタリングの継続利用も可能です。"
        },
        {
          q: "資格や認定証は発行されますか？",
          a: "はい、コース修了時に修了証を発行いたします。また、エキスパートコース修了者には「NANDSプロンプトエンジニア認定証」を発行いたします。"
        }
      ]
    }
  ];

  return (
    <div className="pt-16">
      <motion.div 
        {...fadeIn}
        className="max-w-4xl mx-auto px-4 py-12"
      >
        <h1 className="text-3xl font-bold mb-8">よくある質問</h1>

        <div className="space-y-12">
          {faqs.map((category, index) => (
            <section key={index} className="bg-white shadow-lg rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-6 text-blue-700">{category.category}</h2>
              <div className="space-y-8">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                    <h3 className="text-lg font-bold mb-3 flex items-start">
                      <span className="text-blue-600 mr-2">Q.</span>
                      <span>{item.q}</span>
                    </h3>
                    <p className="text-gray-700 ml-6">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* お問い合わせ誘導 */}
        <div className="mt-12 bg-gray-50 rounded-lg p-8 text-center">
          <h2 className="text-xl font-bold mb-4">その他のご質問</h2>
          <p className="text-gray-700 mb-6">
            ここに記載がない内容については、お気軽にお問い合わせください。
          </p>
          <div className="space-y-4">
            <p className="text-gray-700">
              <span className="font-semibold">メール：</span>
              <a href="mailto:contact@nands.tech" className="text-blue-600 hover:text-blue-500">
                contact@nands.tech
              </a>
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">電話：</span>
              <a href="tel:0120558551" className="text-blue-600 hover:text-blue-500">
                0120-558-551
              </a>
            </p>
            <p className="text-sm text-gray-600">
              受付時間：10:00〜19:00（土日祝日を除く）
            </p>
          </div>
        </div>
      </motion.div>

      <Footer />
    </div>
  );
};

export default FAQPage; 