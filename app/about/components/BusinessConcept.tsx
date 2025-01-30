import React from 'react';
import { motion } from 'framer-motion';
import { AnimationConfig } from '../types';

interface BusinessConceptProps {
  animations: AnimationConfig;
}

const BusinessConcept: React.FC<BusinessConceptProps> = ({ animations }) => {
  const { sectionSpacing, sectionGap, elementGap } = animations;

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
        <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/30 to-white" />
        
        {/* 動的なグリッドパターン */}
        <motion.div
          animate={{
            opacity: [0.02, 0.04, 0.02],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
          className="absolute inset-0"
          style={{
            backgroundImage: `
              repeating-linear-gradient(90deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 80px),
              repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 80px)
            `
          }}
        />

        {/* エレガントな装飾ライン */}
        <motion.div
          animate={{
            opacity: [0.1, 0.2, 0.1],
            y: [0, 20, 0]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(90deg, transparent, rgba(0,0,0,0.05) 50%, transparent),
              linear-gradient(0deg, transparent 30%, rgba(0,0,0,0.02) 50%, transparent 70%)
            `
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 relative">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-4xl font-bold text-center mb-20 !text-black relative inline-block w-full"
        >
          <span className="relative z-10">Business Concept</span>
          <motion.span
            initial={{ width: 0 }}
            whileInView={{ width: '100%' }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-black/50 to-transparent"
          />
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative"
        >
          <div className="
            relative z-10 bg-white/95 backdrop-blur-md rounded-2xl p-16
            shadow-[0_4px_20px_rgba(0,0,0,0.06)]
            group
          ">
            {/* メインコンセプト */}
            <div className="text-center relative container mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative inline-block mb-12"
              >
                <span className="
                  text-[160px] font-black text-black opacity-[0.02] absolute -top-20 left-1/2 -translate-x-1/2
                  font-serif select-none pointer-events-none
                ">
                  NEXT
                </span>
                <motion.h3
                  animate={{
                    textShadow: [
                      "0 0 20px rgba(0,0,0,0.1)",
                      "0 0 40px rgba(0,0,0,0.2)",
                      "0 0 20px rgba(0,0,0,0.1)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-3xl md:text-4xl font-bold !text-black mb-6 tracking-wider"
                >
                  全ての働く人を<br />
                  次のステージへ
                </motion.h3>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="
                  text-xl !text-black leading-relaxed mb-12
                  relative w-full max-w-4xl mx-auto
                  before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0
                  before:w-px before:bg-gradient-to-b before:from-black/20 before:via-black/10 before:to-transparent
                  after:content-[''] after:absolute after:right-0 after:top-0 after:bottom-0
                  after:w-px after:bg-gradient-to-b after:from-black/20 after:via-black/10 after:to-transparent
                "
              >
                私たちは<br/>急速に変化する<br/>時代において<br/>
                一人ひとりの可能性を<br/>最大限に引き出し<br/>
                確かな一歩を<br/>踏み出すための<br/>ソリューションを<br/>提供します。
              </motion.p>
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
                className="w-full h-full border-t-2 border-r-2 border-black rounded-tr-full"
              />
            </div>
            <div className="absolute bottom-0 left-0 w-40 h-40 opacity-5">
              <motion.div
                animate={{
                  rotate: [0, -360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                className="w-full h-full border-b-2 border-l-2 border-black rounded-bl-full"
              />
            </div>

            {/* ホバーエフェクト */}
            <motion.div
              className="
                absolute -inset-2 rounded-2xl
                bg-gradient-to-br from-black/[0.02] to-transparent
                opacity-0 group-hover:opacity-100
                transition-all duration-700
                pointer-events-none
              "
            />
          </div>

          {/* 背後の装飾 */}
          <div className="absolute -inset-4 bg-gradient-to-br from-black/[0.02] to-transparent rounded-3xl -z-10" />
        </motion.div>
      </div>
    </motion.section>
  );
};

export default BusinessConcept; 