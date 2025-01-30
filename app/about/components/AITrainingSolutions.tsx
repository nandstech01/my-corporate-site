import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AnimationConfig } from '../types';
import { PHI } from '../animations';

interface AITrainingSolutionsProps {
  animations: AnimationConfig;
}

const AITrainingSolutions: React.FC<AITrainingSolutionsProps> = ({ animations }) => {
  const { sectionSpacing, sectionGap, elementGap } = animations;

  const solutions = [
    {
      number: "01",
      title: "System Engineer Development Program",
      description: "次世代のIT人材を育成する包括的なSE研修プログラム。実践的なプロジェクト経験と最新技術スタックの習得を通じて、即戦力となるエンジニアを育成します。",
      items: [
        "アジャイル開発手法",
        "クラウドアーキテクチャ設計",
        "DevOpsプラクティス"
      ]
    },
    {
      number: "02",
      title: "Generative AI Mastery Course",
      description: "最新の生成AI技術を実践的に学ぶ専門研修。ChatGPT、Stable Diffusion等の活用から、カスタムモデルの開発まで、包括的なAIスキルを習得します。",
      items: [
        "プロンプトエンジニアリング",
        "AIモデルファインチューニング",
        "ビジネス実装戦略"
      ]
    },
    {
      number: "03",
      title: "Advanced Tech Integration",
      description: "AIと従来のITシステムを効果的に統合するための高度な技術研修。実務に即したユースケースを通じて、実践的な統合スキルを身につけます。",
      items: [
        "システム統合設計",
        "APIアーキテクチャ",
        "セキュリティ実装"
      ]
    }
  ];

  const statistics = [
    {
      number: "500+",
      label: "累計受講者数",
      suffix: "名"
    },
    {
      number: "94",
      label: "就職成功率",
      suffix: "%"
    },
    {
      number: "85",
      label: "スキル習得率",
      suffix: "%"
    },
    {
      number: "20+",
      label: "導入企業数",
      suffix: "社"
    },
    {
      number: "98",
      label: "顧客満足度",
      suffix: "%"
    },
    {
      number: "30+",
      label: "平均業務効率化率",
      suffix: "%"
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
          AI Training & Development Solutions
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

        {/* 導入実績・成果セクション */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-center mb-12 !text-black">導入実績・成果</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {statistics.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                className="text-center"
              >
                <p className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.number}{stat.suffix}
                </p>
                <p className="text-lg !text-black/80">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default AITrainingSolutions; 