import React from 'react';
import { motion } from 'framer-motion';
import { AnimationConfig } from '../types';
import { PHI } from '../animations';

interface HistoryProps {
  animations: AnimationConfig;
}

const History: React.FC<HistoryProps> = ({ animations }) => {
  const { sectionSpacing, sectionGap, elementGap } = animations;

  const timelineItems = [
    {
      date: "2008年4月",
      title: "株式会社エヌアンドエス設立",
      description: "「時代のニーズに応じたソリューションを提供する」というビジョンのもと、企業活動をスタート"
    },
    {
      date: "2011年1月",
      title: "デジタルマーケティング事業進出",
      description: "企業のオンラインプレゼンス強化サービスを開始"
    },
    {
      date: "2014年6月",
      title: "人材育成事業本格開始",
      description: "企業内人材教育・スキルアップ支援を展開"
    },
    {
      date: "2018年11月",
      title: "転職サポート事業開始",
      description: "キャリウンセリングと転職支援サービスを開始"
    },
    {
      date: "2020年8月",
      title: "事業方針刷新",
      description: "「働く人のキャリアと生活を支える総合サポート企業」として事業を再定義"
    },
    {
      date: "2021年2月",
      title: "AIコンサルティング事業開始",
      description: "AI技術導入支援と業務効率化コンサルティングを展開"
    },

    {
      date: "2023年6月",
      title: "AI事業本部設立",
      description: "生成AI活用リスキリング研修事業を開始し、次世代のキャリア支援を本格展開"
    },

    {
        date: "2024年2月",
        title: "退職支援事業開始",
        description: "「退職あんしん代行」サービスを開始し、キャリアチェンジを総合的にサポート"
      },

    {
      date: "2024年3月",
      title: "メディア事業拡大",
      description: "「転職エージェントセレクト」運営開始。キャリアアップの包括的サポートを強化"
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

      <div className="max-w-4xl mx-auto px-4 relative">
        <motion.h2
          initial={{ opacity: 0, y: 20 / PHI }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-4xl font-bold text-center mb-20 !text-black"
        >
          沿革
        </motion.h2>

        <div className="space-y-12">
          {timelineItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 / PHI }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              className="relative pl-8 md:pl-0"
            >
              <div className="flex flex-col md:flex-row md:items-start group">
                {/* 日付 */}
                <div className="md:w-48 shrink-0 mb-4 md:mb-0">
                  <span className="
                    text-lg font-bold !text-black
                    relative
                    before:content-[''] before:absolute before:left-[-2rem] before:top-1/2 before:-translate-y-1/2
                    before:w-3 before:h-3 before:bg-black before:rounded-full
                    md:before:left-auto md:before:right-8
                  ">
                    {item.date}
                  </span>
                </div>

                {/* コンテンツ */}
                <div className="flex-1 relative">
                  <h3 className="text-xl font-bold mb-2 !text-black">{item.title}</h3>
                  <p className="text-lg !text-black/80">{item.description}</p>

                  {/* 縦線 */}
                  <div className="absolute left-[-2rem] top-0 bottom-0 w-px bg-gradient-to-b from-black/20 to-transparent md:left-[-3rem]" />
                </div>
              </div>

              {/* ホバーエフェクト */}
              <div className="
                absolute left-[-2rem] top-[-1rem] bottom-[-1rem] w-[calc(100%+2rem)]
                bg-gradient-to-r from-black/[0.02] to-transparent
                opacity-0 group-hover:opacity-100
                transition-opacity duration-500
                rounded-l-2xl
                pointer-events-none
                md:left-[-3rem] md:w-[calc(100%+3rem)]
              " />
            </motion.div>
          ))}
        </div>

        {/* 装飾的な要素 */}
        <div className="absolute top-0 right-0 w-40 h-40 opacity-5">
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
            className="w-full h-full border-2 border-black rounded-full"
          />
        </div>
      </div>
    </motion.section>
  );
};

export default History; 