import React from 'react';
import { motion } from 'framer-motion';
import { AnimationConfig } from '../types';
import { PHI } from '../animations';

interface DigitalMarketingSolutionsProps {
  animations: AnimationConfig;
}

const DigitalMarketingSolutions: React.FC<DigitalMarketingSolutionsProps> = ({ animations }) => {
  const { sectionSpacing, sectionGap, elementGap } = animations;

  const solutions = [
    {
      number: "01",
      title: "SEO Strategy & Optimization",
      description: "最新のSEOトレンドとAI技術を活用した包括的な検索エンジン最適化支援。データ分析に基づく効果的なSEO戦略を展開します。",
      items: [
        "サイト分析・改善提案",
        "コンテンツ最適化支援",
        "検索順位改善施策"
      ]
    },
    {
      number: "02",
      title: "Digital Marketing Training",
      description: "実践的なデジタルマーケティングスキルを習得する専門研修プログラム。最新のツールと手法を学び、即実践可能なスキルを身につけます。",
      items: [
        "マーケティング基礎講座",
        "SNSマーケティング実践",
        "アナリティクス活用研修"
      ]
    },
    {
      number: "03",
      title: "Digital Reskilling Program",
      description: "デジタル時代に必要なスキルの再教育プログラムを提供。個人のキャリア目標に合わせた、カスタマイズされた学習機会を提供します。",
      items: [
        "スキルアセスメント",
        "カスタマイズ研修",
        "キャリア転換支援"
      ]
    }
  ];

  return (
    <motion.section 
      {...animations.fadeIn}
      className={`${sectionSpacing} relative overflow-hidden`}
      style={{
        marginBottom: `${sectionGap}px`,
        padding: `${elementGap}px 0`
      }}
    >
      {/* 洗練された背景エフェクト */}
      <div className="absolute inset-0">
        {/* 高級感のあるグラデーション背景 */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/50 to-white" />
        
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
          Web Marketing Solutions
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {solutions.map((solution, index) => (
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
                {/* 数字の装飾を劇的に改善 */}
                <div className="relative mb-8">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 + 0.3, duration: 0.5 }}
                    className="relative z-10"
                  >
                    <span className="
                      text-[120px] font-black !text-black opacity-[0.03] 
                      absolute -top-10 -left-6 
                      transform -rotate-12
                      font-serif
                    ">
                      {solution.number}
                    </span>
                    <span className="
                      text-[120px] font-black !text-black opacity-[0.03]
                      absolute -top-10 -left-6 
                      transform blur-sm
                      font-serif
                    ">
                      {solution.number}
                    </span>
                    <motion.span
                      initial={{ width: 0 }}
                      whileInView={{ width: '100%' }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 + 0.5, duration: 0.8 }}
                      className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-black/50 via-black/5 to-transparent"
                    />
                  </motion.div>

                  {/* タイトルを数字の上に配置 */}
                  <h3 className="
                    relative z-20 text-lg font-bold !text-black
                    pl-4 border-l-2 border-black/80
                    transform translate-y-6
                  ">
                    {solution.title}
                  </h3>
                </div>

                {/* カードのメインコンテンツをさらに洗練 */}
                <div className="
                  relative z-10 
                  bg-gradient-to-br from-white/95 to-white/90
                  backdrop-blur-md rounded-xl p-8
                  shadow-[0_4px_20px_rgba(0,0,0,0.06)]
                  transition-all duration-500
                  group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)]
                  border border-black/5
                ">
                  {/* 説明文をより印象的に */}
                  <p className="
                    !text-black text-lg leading-relaxed mb-8
                    relative pl-4
                    before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0
                    before:w-px before:bg-gradient-to-b before:from-black/20 before:to-transparent
                  ">
                    {solution.description}
                  </p>

                  {/* リスト項目をより洗練されたデザインに */}
                  <ul className="space-y-4">
                    {solution.items.map((item, itemIndex) => (
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
                        <span className="!text-black font-medium">{item}</span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* 装飾的な要素を追加 */}
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

export default DigitalMarketingSolutions; 