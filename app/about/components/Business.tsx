import React from 'react';
import { motion } from 'framer-motion';
import { AnimationConfig } from '../types';
import { PHI } from '../animations';

interface BusinessProps {
  animations: AnimationConfig;
}

const Business: React.FC<BusinessProps> = ({ animations }) => {
  const { sectionSpacing, sectionGap, elementGap } = animations;

  const businessItems = [
    {
      title: "企業向けAIソリューション",
      description: "企業のデジタル変革を支援するAIソリューションを提供。業務効率化から新規事業開発まで、包括的なサポートを実現します。",
      items: [
        "AI導入コンサルティング",
        "業務自動化支援",
        "データ分析・活用支援"
      ]
    },
    {
      title: "デジタルマーケティング支援",
      description: "最新のデジタルマーケティング手法を活用し、企業の成長戦略をサポート。効果的なオンラインプレゼンスの確立を支援します。",
      items: [
        "SEO対策支援",
        "コンテンツマーケティング",
        "SNSマーケティング"
      ]
    },
    {
      title: "人材育成・研修サービス",
      description: "デジタル時代に必要なスキルの習得を支援。実践的な研修プログラムを通じて、企業の人材育成をサポートします。",
      items: [
        "デジタルスキル研修",
        "リーダーシップ開発",
        "チーム育成プログラム"
      ]
    }
  ];

  return (
    <motion.section 
      {...animations.fadeIn}
      className={`${sectionSpacing} relative overflow-hidden bg-gray-50`}
      style={{
        marginBottom: `${sectionGap}px`,
        padding: `${elementGap}px 0`
      }}
    >
      <div className="absolute inset-0">
        {/* 動的なグリッドパターン */}
        <motion.div
          animate={{
            opacity: [0.03, 0.05, 0.03],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />

        {/* エレガントな装飾ライン */}
        <div className="absolute left-0 right-0 top-20 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
        <div className="absolute left-0 right-0 bottom-20 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-4 relative">
        <motion.h2
          initial={{ opacity: 0, y: 20 / PHI }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-4xl font-bold text-center mb-20 !text-black"
        >
          事業内容
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {businessItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 / PHI }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              whileHover={{ y: -5 / PHI }}
              className="group relative"
            >
              {/* カードの装飾的な背景 */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/[0.02] to-transparent rounded-2xl transform group-hover:scale-105 transition-transform duration-500" />
              
              {/* メインカード */}
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-10 shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-500 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)]">
                {/* タイトル */}
                <h3 className="text-xl font-bold mb-6 !text-black relative pl-4 border-l-2 border-black/80">
                  {item.title}
                </h3>

                {/* カードのメインコンテンツ */}
                <div className="
                  relative z-10 
                  bg-gradient-to-br from-white/95 to-white/90
                  backdrop-blur-md rounded-xl p-8
                  shadow-[0_4px_20px_rgba(0,0,0,0.06)]
                  transition-all duration-500
                  group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)]
                  border border-black/5
                ">
                  {/* 説明文 */}
                  <p className="
                    !text-black text-lg leading-relaxed mb-8
                    relative pl-4
                    before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0
                    before:w-px before:bg-gradient-to-b before:from-black/20 before:to-transparent
                  ">
                    {item.description}
                  </p>

                  {/* リスト項目 */}
                  <ul className="space-y-4">
                    {item.items.map((subItem, itemIndex) => (
                      <motion.li
                        key={itemIndex}
                        initial={{ opacity: 0, x: -20 / PHI }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.2 + itemIndex * 0.1 + 0.5 }}
                        className="
                          flex items-center space-x-4
                          relative pl-6
                          before:content-[''] before:absolute before:left-0 before:top-1/2
                          before:w-4 before:h-px before:bg-black/50
                          hover:before:w-6 before:transition-all before:duration-300
                        "
                      >
                        <span className="!text-black font-medium">{subItem}</span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* 装飾的な要素 */}
                  <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
                    <motion.div
                      animate={{
                        rotate: [0, 360],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                      className="w-full h-full border-t-2 border-r-2 border-black rounded-tr-2xl"
                    />
                  </div>
                </div>

                {/* ホバー時のアクセント効果 */}
                <motion.div
                  className="
                    absolute -inset-px rounded-2xl
                    bg-gradient-to-br from-black/5 via-transparent to-transparent
                    opacity-0 group-hover:opacity-100
                    transition-opacity duration-500
                    pointer-events-none
                  "
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default Business; 