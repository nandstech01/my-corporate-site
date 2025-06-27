import React from 'react';
import { motion } from 'framer-motion';
import { AnimationConfig } from '../types';
import { PHI } from '../animations';

interface AccessProps {
  animations: AnimationConfig;
}

const Access: React.FC<AccessProps> = ({ animations }) => {
  const { sectionSpacing, sectionGap, elementGap } = animations;

  const locations = [
    {
      title: "本社",
              address: [
          "〒520-0025",
          "滋賀県大津市皇子が丘２丁目10−25−3004号",
          "株式会社エヌアンドエス"
        ]
    },
    
  ];

  const contact = [
    { label: "メール", value: "contact@nands.tech" },
    { label: "電話", value: "0120-558-551" }
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
          アクセス
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-12">
          {locations.map((location, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 / PHI }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              className="relative group"
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
                <h3 className="text-2xl font-bold mb-6 !text-black">{location.title}</h3>
                <div className="space-y-2">
                  {location.address.map((line, lineIndex) => (
                    <p key={lineIndex} className="text-lg !text-black/80">{line}</p>
                  ))}
                </div>

                {/* ホバーエフェクト */}
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

        <motion.div
          initial={{ opacity: 0, y: 30 / PHI }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-12"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
            <h3 className="text-2xl font-bold mb-6 !text-black">お問い合わせ</h3>
            <div className="space-y-4">
              {contact.map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <span className="text-lg font-medium !text-black/90 w-24">{item.label}</span>
                  <span className="text-lg !text-black/80">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

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

export default Access; 