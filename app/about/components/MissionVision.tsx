import React from 'react';
import { motion } from 'framer-motion';
import { AnimationConfig } from '../types';

interface MissionVisionProps {
  animations: AnimationConfig;
}

const MissionVision: React.FC<MissionVisionProps> = ({ animations }) => {
  const { sectionSpacing, sectionGap, elementGap, cardHover } = animations;

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
        {/* グラデーションオーバーレイ */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white opacity-80" />
        
        {/* 高級感のある動的な背景 */}
        <motion.div
          animate={{
            opacity: [0.02, 0.04, 0.02],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 20% 30%, rgba(0, 0, 0, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(0, 0, 0, 0.05) 0%, transparent 50%)
            `
          }}
        />
        
        {/* 繊細なアクセントライン */}
        <div className="absolute inset-0 opacity-10">
          <motion.div
            animate={{
              opacity: [0.5, 1, 0.5],
              y: [0, 20, 0]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
            className="h-px w-full bg-gradient-to-r from-transparent via-black to-transparent"
            style={{ top: '30%' }}
          />
          <motion.div
            animate={{
              opacity: [0.5, 1, 0.5],
              y: [0, -20, 0]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
            className="h-px w-full bg-gradient-to-r from-transparent via-black to-transparent"
            style={{ bottom: '30%' }}
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 relative">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* ミッション */}
          <motion.div
            initial="rest"
            whileHover="hover"
            variants={cardHover}
            className="group relative"
          >
            <div className="
              relative z-10 bg-white/95 backdrop-blur-sm rounded-2xl p-10
              shadow-[0_4px_20px_rgba(0,0,0,0.08)]
              transition-all duration-500
              group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]
            ">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-3xl font-bold mb-8 text-center !text-black">Mission</h2>
                <div className="space-y-6">
                  <p className="text-xl font-bold !text-black text-center mb-8 leading-relaxed">
                    働く人々の可能性を解放し<br />
                    キャリアの新たな地平を<br />切り拓く
                  </p>
                  <div className="space-y-4">
                    <p className="!text-black">
                      私たちは、テクノロジーの力と人々の潜在能力を結びつけ、
                      一人ひとりが望むキャリアを実現できる社会を創造します。
                    </p>
                    <ul className="space-y-3 !text-black list-none">
                      {['最新技術を活用した実践的なスキル開発支援', '個々のニーズに寄り添った丁寧なキャリア支援', '安心・確実な転職・退職プロセスのサポート'].map((item, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2 * index }}
                          className="flex items-center space-x-3 pl-4"
                        >
                          <span className="w-1.5 h-1.5 bg-black rounded-full flex-shrink-0" />
                          <span>{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>
            {/* エレガントなアクセント */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent rounded-2xl transform translate-x-1 translate-y-1 -z-10" />
          </motion.div>

          {/* ビジョン */}
          <motion.div
            initial="rest"
            whileHover="hover"
            variants={cardHover}
            className="group relative"
          >
            <div className="
              relative z-10 bg-white/95 backdrop-blur-sm rounded-2xl p-10
              shadow-[0_4px_20px_rgba(0,0,0,0.08)]
              transition-all duration-500
              group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]
            ">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-3xl font-bold mb-8 text-center !text-black">Vision</h2>
                <div className="space-y-6">
                  <p className="text-xl font-bold !text-black text-center mb-8 leading-relaxed">
                    2030年<br />
                    日本の働き方を革新する<br />
                    リーディングカンパニーへ
                  </p>
                  <div className="space-y-4">
                    <p className="!text-black">
                      変化の激しい時代において、私たちは以下の目標を掲げ、
                      日本の働き方改革を推進します：
                    </p>
                    <ul className="space-y-6 !text-black">
                      {[
                        { title: 'キャリア革新', desc: '働く人々のキャリアトランスフォーメーションと成長支援を実現' },
                        { title: '企業変革', desc: '企業のデジタルトランスフォーメーションとAI活用推進を支援' },
                        { title: '社会貢献', desc: '日本のAIリテラシ向上を通じた、グローバル競争力の強化' }
                      ].map((item, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2 * index }}
                          className="relative pl-8"
                        >
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-black rounded-full" />
                          <span className="font-semibold block mb-1">{item.title}</span>
                          <span className="block">{item.desc}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>
            {/* エレガントなアクセント */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent rounded-2xl transform translate-x-1 translate-y-1 -z-10" />
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default MissionVision; 