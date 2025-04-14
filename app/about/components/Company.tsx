'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { AnimationConfig } from '../types';
import { PHI } from '../animations';

interface CompanyProps {
  animations: AnimationConfig;
}

const Company: React.FC<CompanyProps> = ({ animations }) => {
  const { sectionSpacing, sectionGap, elementGap } = animations;

  const companyInfo = [
    { label: "会社名", value: "株式会社エヌアンドエス" },
    { label: "代表取締役", value: "原田 賢治" },
    { label: "設立", value: "2008年4月" },
    { 
      label: "本社", 
      value: "〒520-0025\n滋賀県大津市皇子ヶ丘２目１０番２５−３００４号",
      multiline: true
    },
    { 
      label: "東京支社", 
      value: "〒150-0043\n東京都渋谷区道玄坂１丁目１０番８号渋谷道玄坂東急ビル2F-C",
      multiline: true
    },
    { 
      label: "事業内容", 
      value: [
        "生成AI活用リスキリング研修事業",
        "AI導入コンサルティング",
        "企業向けAI研修プログラム",
        "AI組織構築支援",
        "Web開発人材育成支援",
        "プログラミング教育支援",
        "SEOコンサルティング",
        "キャリアコンサルティング事業",
        "転職支援",
        "退職支援事業",
        "給付金支援事業",
        "メディア運営事業"
      ],
      list: true
    },
    { 
      label: "お問い合わせ", 
      value: [
        "メール：contact@nands.tech",
        "電話：0120-558-551"
      ],
      list: true
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
          会社概要
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 30 / PHI }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-12 shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
        >
          <div className="grid md:grid-cols-2 gap-8">
            {companyInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 / PHI }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`relative ${(info.list || info.multiline) ? 'md:col-span-2' : ''}`}
              >
                <div className="flex items-start space-x-8 group">
                  {/* ラベル */}
                  <div className="w-32 shrink-0">
                    <span className="
                      font-bold !text-black
                      relative pl-4
                      before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2
                      before:w-2 before:h-2 before:bg-black/80 before:rounded-full
                    ">
                      {info.label}
                    </span>
                  </div>

                  {/* 値 */}
                  <div className="flex-1">
                    {info.list ? (
                      <ul className="space-y-2">
                        {(Array.isArray(info.value) ? info.value : [info.value]).map((item, itemIndex) => (
                          <li key={itemIndex} className="!text-black text-lg">{item}</li>
                        ))}
                      </ul>
                    ) : info.multiline ? (
                      <p className="!text-black text-lg whitespace-pre-line">{info.value}</p>
                    ) : (
                      <p className="
                        !text-black text-lg
                        relative
                        before:content-[''] before:absolute before:left-0 before:top-1/2
                        before:w-full before:h-px before:bg-black/10
                        before:transform before:scale-x-0 before:origin-left
                        before:transition-transform before:duration-500
                        group-hover:before:scale-x-100
                      ">
                        {info.value}
                      </p>
                    )}
                  </div>
                </div>

                {/* 区切り線 */}
                {index < companyInfo.length - 1 && (
                  <div className="absolute left-0 right-0 bottom-0 h-px bg-gradient-to-r from-black/10 via-black/5 to-transparent" />
                )}
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
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Company; 