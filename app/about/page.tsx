'use client'

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Footer from '@/components/common/Footer';

// 定数とインターフェースをコンポーネントの外で定義
const PHI = (1 + Math.sqrt(5)) / 2;

interface TimelineItem {
  date: string;
  title: string;
  description: string;
}

const timelineItems: TimelineItem[] = [
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
    date: "2022年4月",
    title: "退職支援事業開始",
    description: "「退職あんしん代行」サービスを開始し、キャリアチェンジを総合的にサポート"
  },
  {
    date: "2023年6月",
    title: "AI事業本部設立",
    description: "生成AI活用リスキリング研修事業を開始し、次世代のキャリア支援を本格展開"
  },
  {
    date: "2024年1月",
    title: "メディア事業拡大",
    description: "「転職エージェントセレクト」運営開始。キャリアアップの包括的サポートを強化"
  }
];

const textStyles = {
  primary: "!text-black",
  heading: "!text-black font-bold",
  body: "!text-black"
};

const AboutPage = () => {
  // スタイル定数の定義
  const sectionSpacing = "py-20 md:py-32";
  const cardSpacing = "p-8 md:p-10";
  const cardStyle = `
    relative z-10 bg-white/95 backdrop-blur-md rounded-2xl
    shadow-[0_4px_20px_rgba(0,0,0,0.06)]
    transition-all duration-700
    group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)]
    border border-black/5
  `;

  // アニメーション定義
  const cardHover = {
    rest: { 
      scale: 1,
      transition: { 
        duration: 0.8 / PHI,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    hover: { 
      scale: 1 + (1 / (PHI * PHI)),
      transition: { 
        duration: 0.8 / PHI,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const headerParallax = {
    initial: { scale: 1.1 },
    animate: { 
      scale: 1,
      transition: {
        duration: 1.5,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  // アニメーションタイミングの最適化
  const animationTimings = {
    base: 0.8,
    delay: 0.8 / PHI,
    stagger: 0.8 / (PHI * PHI),
  };

  // スクロールアニメーションの最適化
  const fadeIn = {
    initial: { opacity: 0, y: 30 / PHI },
    animate: { opacity: 1, y: 0 },
    transition: { 
      duration: animationTimings.base,
      ease: [0.22, 1, 0.36, 1]
    }
  };

  // セクション間のスペーシングを黄金比で計算
  const sectionGap = Math.round(100 / PHI);
  const elementGap = Math.round(sectionGap / PHI);

  const messageContent = [
    {
      text: "寄り添い続ける！",
      isHeading: true
    },
    {
      text: "2008年の設立以来、「人々の生活を豊かにするために」というビジョンのもと、多くの挑戦を重ねてまいりました。",
      isHeading: false
    },
    {
      text: "2020年以降、世界的な変革の波に対応し、これまで培ってきた経験と技術をもとに、働く人々のキャリアや生活を支援する新たなソリューションの提供を決意しました。",
      isHeading: false
    },
    {
      text: "その中で私たちが特に重視したのが、「本当に自分らしい働き方」を実現するための支援です。退職代行サービスを通じて、より良い環境での再スタートをサポートし、同時にスキルアップ支援を提供することで、一人ひとりが望むキャリアを実現できる環境を整えています。",
      isHeading: false
    },
    {
      text: "また、給付金サポートサービスでは、困難な状況にある方々に寄り添い、本来受けられるべき支援を確実に受けられるようサポートしています。これは単なる手続き支援ではなく、新たな一歩を踏み出すための大切な基盤づくだと考えています。",
      isHeading: false
    },
    {
      text: "特にAI技術においては、私自身が新たな挑戦として習得に取り組み、「AIリスキリング研修」を新たにスタートさせることができました。これからの時代に不可欠なスキルを支えるプログラムを提供することで、次の世代の働く人々のキャリアを後押ししていきます。",
      isHeading: false
    },
    {
      text: "私たちは、一人ひとりの「働く」に真摯に向き合い、より良い未来への扉を開く支援を続けていきます。これからも「すべての働く人々に次のチャンスを提供する」という信念のもと、変化する時代のニーズに応え続けてまいります。",
      isHeading: false
    },
    {
      text: "そして、私たちが最も大切にしているのは、「一人ひとりの人生に寄り添う」という姿勢です。退職は単なる離職ではなく、新たな人生の章を開く重要な転換点です。その瞬間に、私たちは最大限の敬意と配慮を持って、あなたの決断をサポ���トいたします。",
      isHeading: false
    },
    {
      text: "これからも、テクノロジーの進化と人間味のあサポートを両立せながら、すべての働く人々が自分らしく輝ける社会の実現に向けて、邁進してまいります。",
      isHeading: false
    }
  ];

  return (
    <div className="pt-16">
      {/* メインビジュアル - 正方形に修正 */}
      <div className="relative h-screen bg-black"> {/* h-[${Math.round(100 * PHI)}vh] から h-screen に変更 */}
        <motion.div
          variants={headerParallax}
          initial="initial"
          animate="animate"
          className="absolute inset-0"
        >
          <Image
            src="/images/company.jpg"
            alt="NANDS office"
            fill
            className="object-cover opacity-70 mix-blend-overlay"
            priority
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50" />
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="relative z-20 h-full flex items-center justify-center text-white"
        >
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="text-6xl md:text-7xl font-bold mb-6 tracking-tight"
            >
              NANDS
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="text-xl md:text-2xl tracking-widest"
            >
              NEXT SOLUTIONS
            </motion.p>
          </div>
        </motion.div>
      </div>

      {/* 各セクションにスペーシングを適用 */}
      <motion.section 
        {...fadeIn}
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
            initial={{ opacity: 0, y: 20 / PHI }}
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
            initial={{ opacity: 0, y: 30 / PHI }}
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
              <div className="text-center relative container mx-auto"> {/* containerクラスを追加 */}
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
                    relative w-full max-w-4xl mx-auto {/* 幅を調整 */}
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

      {/* ミッション & ビジョン */}
      <motion.section 
        {...fadeIn}
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
                  initial={{ opacity: 0, y: 20 / PHI }}
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
                            initial={{ opacity: 0, x: -20 / PHI }}
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

            {/* ビジョン - 同様のスタイルで */}
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
                  initial={{ opacity: 0, y: 20 / PHI }}
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
                          { title: 'キャリア革新', desc: '10万人の働く人々のキャリアトランスフォーメーションを実現' },
                          { title: '企業変革', desc: '1000社以上の企業のデジタルトランスフォーメーションを支援' },
                          { title: '社会貢献', desc: '日本のAIリテラシ向上を通じた、グローバル競争力の強化' }
                        ].map((item, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -20 / PHI }}
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

      {/* Enterprise AI Solutions */}
      <motion.section 
        {...fadeIn}
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
            Enterprise AI Solutions
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                number: "01",
                title: "AI導入コンサルティング",
                description: "企業の課題やニーズに合わせた最適なAIソリューションを提案。導入から運用まで一貫してサポートします。",
                items: ["AI活用戦略の策定", "業務プロセスの分析・改善", "ROI評価とコスト最適化"]
              },
              {
                number: "02",
                title: "企業向けAI研修プログラム",
                description: "経営層から実務者まで、役職や目的に応じたカスタマイズ可能な研修プログラムを提供します。",
                items: ["経営者向けAI戦略研修", "実務者向けAIツール活用研修", "開発者向け技術研修"]
              },
              {
                number: "03",
                title: "AI組織構築支援",
                description: "社内のAI活用を推進する組織づくりから、必要な人材の育成・採用までトータルでサポート。",
                items: ["AI人材の採用支援", "組織体制の設計", "社内AI活用推進体制の槉築"]
              }
            ].map((solution, index) => (
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

                  {/* カードのメインコンテンツをさらに洗 */}
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

          {/* 導入実績セクションも様に極限まで改善 */}
          <motion.div
            initial={{ opacity: 0, y: 30 / PHI }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-20 relative"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
              <h3 className="text-2xl font-bold mb-12 text-center !text-black">導入実績・成果</h3>
              
              <div className="grid md:grid-cols-3 gap-12">
                {[
                  { number: "20+", label: "導入企業数" },
                  { number: "98%", label: "顧客満足度" },
                  { number: "30%+", label: "平均業務効率化率" }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 / PHI }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2, duration: 0.8 }}
                    className="text-center"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="text-3xl font-bold !text-black mb-2"
                    >
                      {stat.number}
                    </motion.div>
                    <p className="!text-black">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="mt-12 text-center"
              >
                <button className="bg-black text-white hover:bg-black/90 font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300">
                  導入事例を見る
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* 事業内容 */}
      <motion.section 
        {...fadeIn}
        className={`${sectionSpacing} relative overflow-hidden`}
        style={{
          marginBottom: `${sectionGap}px`,
          padding: `${elementGap}px 0`
        }}
      >
        {/* 究極の背景エフェクト */}
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
            initial={{ opacity: 0, y: 20 / PHI }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-4xl font-bold text-center mb-20 !text-black relative inline-block w-full"
          >
            <span className="relative z-10">Business</span>
            <motion.span
              initial={{ width: 0 }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 1 }}
              className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-black/50 to-transparent"
            />
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-12">
            {/* キャリア変革支援事業 */}
            <motion.div
              initial={{ opacity: 0, x: -50 / PHI }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative group"
            >
              <div className="
                relative z-10 bg-white/95 backdrop-blur-md rounded-2xl p-12
                shadow-[0_4px_20px_rgba(0,0,0,0.06)]
                transition-all duration-700
                group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)]
                border border-black/5
              ">
                {/* タイトル装飾 */}
                <div className="relative mb-10">
                  <h3 className="
                    text-lg font-bold !text-black {/* text-2xl から text-lg に変更 */}
                    relative z-10 pl-6
                    before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2
                    before:w-4 before:h-4 before:border-l-2 before:border-t-2 before:border-black/80
                  ">
                    キャリア変革支援事業
                  </h3>
                  <motion.div
                    className="absolute -top-4 -right-4 w-20 h-20 opacity-5"
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  >
                    <div className="w-full h-full border-2 border-black rounded-full" />
                  </motion.div>
                </div>

                {/* コンテンツ */}
                <div className="space-y-8">
                  {[
                    {
                      title: "生成AI活用リスキリング研修",
                      desc: "最新のAI技術を活用した実践的な教育プログラムを提供し、次世代のデジタル人材を育成します。"
                    },
                    {
                      title: "キャリアコンサルティング",
                      desc: "一人ひとりの経験とスキルを活かしたオーダーメイドのキャリア支援を提供します。"
                    }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 / PHI }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 * index }}
                      className="relative"
                    >
                      <h4 className="
                        font-bold mb-3 !text-black text-lg
                        relative inline-block
                        after:content-[''] after:absolute after:bottom-0 after:left-0
                        after:w-full after:h-px after:bg-black/20
                      ">
                        {item.title}
                      </h4>
                      <p className="!text-black pl-4 relative before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-black/20 before:to-transparent">
                        {item.desc}
                      </p>
                    </motion.div>
                  ))}
                </div>
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
            </motion.div>

            {/* キャリアサポート事業 */}
            <motion.div
              initial={{ opacity: 0, x: 50 / PHI }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative group"
            >
              <div className="
                relative z-10 bg-white/95 backdrop-blur-md rounded-2xl p-12
                shadow-[0_4px_20px_rgba(0,0,0,0.06)]
                transition-all duration-700
                group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)]
                border border-black/5
              ">
                <div className="relative mb-10">
                  <h3 className="
                    text-lg font-bold !text-black {/* text-2xl から text-lg に変更 */}
                    relative z-10 pl-6
                    before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2
                    before:w-4 before:h-4 before:border-l-2 before:border-t-2 before:border-black/80
                  ">
                    キャリアサポート事業
                  </h3>
                  <motion.div
                    className="absolute -top-4 -right-4 w-20 h-20 opacity-5"
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  >
                    <div className="w-full h-full border-2 border-black rounded-full" />
                  </motion.div>
                </div>

                <div className="space-y-8">
                  {[
                    {
                      title: "退職支援事業「退職あんしん代行」",
                      desc: "専門アドバイザーによる安心・確実な退職プロセスのサポートを提供します。"
                    },
                    {
                      title: "給付金支援「退職あんしんサポートプロ」",
                      desc: "各種給付金の申請手続きを専門家サポートし、スムズな手続きをお手伝いします。"
                    }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 / PHI }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 * index }}
                      className="relative"
                    >
                      <h4 className="
                        font-bold mb-3 !text-black text-lg
                        relative inline-block
                        after:content-[''] after:absolute after:bottom-0 after:left-0
                        after:w-full after:h-px after:bg-black/20
                      ">
                        {item.title}
                      </h4>
                      <p className="!text-black pl-4 relative before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-black/20 before:to-transparent">
                        {item.desc}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.div
                className="
                  absolute -inset-2 rounded-2xl
                  bg-gradient-to-br from-black/[0.02] to-transparent
                  opacity-0 group-hover:opacity-100
                  transition-all duration-700
                  pointer-events-none
                "
              />
            </motion.div>

            {/* 情報プラットフォーム事業 */}
            <motion.div
              initial={{ opacity: 0, y: 50 / PHI }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="md:col-span-2 relative group"
            >
              <div className="
                relative z-10 bg-white/95 backdrop-blur-md rounded-2xl p-12
                shadow-[0_4px_20px_rgba(0,0,0,0.06)]
                transition-all duration-700
                group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)]
                border border-black/5
              ">
                <div className="relative mb-10">
                  <h3 className="
                    text-lg font-bold !text-black {/* text-2xl から text-lg に変更 */}
                    relative z-10 pl-6
                    before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2
                    before:w-4 before:h-4 before:border-l-2 before:border-t-2 before:border-black/80
                  ">
                    情報プラットフォーム事業
                  </h3>
                  <motion.div
                    className="absolute -top-4 -right-4 w-20 h-20 opacity-5"
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  >
                    <div className="w-full h-full border-2 border-black rounded-full" />
                  </motion.div>
                </div>

                <div className="space-y-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 / PHI }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative"
                  >
                    <h4 className="
                      font-bold mb-3 !text-black text-lg
                      relative inline-block
                      after:content-[''] after:absolute after:bottom-0 after:left-0
                      after:w-full after:h-px after:bg-black/20
                    ">
                      メディア運営「転職エージェントセレクト」
                    </h4>
                    <p className="!text-black pl-4 relative before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-black/20 before:to-transparent">
                      信頼できる転職エージェント情報を提供し、キャリア選択をサポートする情報プラットフォームを運営しています。
                      客観的な情報提供を通じて、より良いキャリア選択をサポートします。
                    </p>
                  </motion.div>
                </div>
              </div>

              <motion.div
                className="
                  absolute -inset-2 rounded-2xl
                  bg-gradient-to-br from-black/[0.02] to-transparent
                  opacity-0 group-hover:opacity-100
                  transition-all duration-700
                  pointer-events-none
                "
              />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* 会社概要 */}
      <motion.section 
        {...fadeIn}
        className={`${sectionSpacing} relative overflow-hidden`}
        style={{
          marginBottom: `${sectionGap}px`,
          padding: `${elementGap}px 0`
        }}
      >
        {/* 洗練された背景エフェクト */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/30 to-white" />
          <motion.div
            animate={{
              opacity: [0.02, 0.04, 0.02],
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
            className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at 30% 20%, rgba(0, 0, 0, 0.03) 0%, transparent 50%),
                radial-gradient(circle at 70% 80%, rgba(0, 0, 0, 0.03) 0%, transparent 50%)
              `
            }}
          />
        </div>

        <div className="max-w-4xl mx-auto px-4 relative">
          <motion.h2 
            initial={{ opacity: 0, y: 20 / PHI }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-4xl font-bold text-center mb-20 !text-black relative inline-block w-full"
          >
            <span className="relative z-10">Company</span>
            <motion.span
              initial={{ width: 0 }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 1 }}
              className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-black/50 to-transparent"
            />
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 30 / PHI }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative bg-white/95 backdrop-blur-md rounded-2xl p-12 shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
          >
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
                className="w-full h-full border-b-2 border-r-2 border-black rounded-tr-full"
              />
            </div>

            <dl className="space-y-8">
              {[
                { label: "会社名", value: "株式会社エヌアンドエス" },
                { label: "代表取締役", value: "原田 賢治" },
                { label: "設立", value: "2008年4月" },
                { label: "本社", value: "〒520-0025\n滋賀県大津市皇子ヶ丘２目１０番２５−３００４号" },
                { label: "東京支社", value: "〒150-0043\n東京都渋谷区道玄坂１丁目１０番８号渋谷道玄坂東急ビル2F-C" },
                { 
                  label: "事業内容",
                  items: [
                    "生成AI活用リスキリング研修事業",
                    "キャリアコンサルティング事業",
                    "人材紹介事業",
                    "退職支援事業",
                    "給付金支援事業",
                    "メディア運営事業"
                  ]
                },
                { 
                  label: "お問い合わせ",
                  contacts: [
                    { type: "メール", value: "contact@nands.tech" },
                    { type: "電話", value: "0120-558-551" }
                  ]
                }
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 / PHI }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 relative group"
                >
                  <dt className="
                    font-bold !text-black md:col-span-1
                    relative pl-6
                    before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2
                    before:w-3 before:h-3 before:border-l before:border-t before:border-black/30
                    group-hover:before:border-black/60 before:transition-colors before:duration-300
                  ">
                    {item.label}
                  </dt>
                  <dd className="md:col-span-3 !text-black">
                    {item.items ? (
                      <ul className="list-none space-y-2">
                        {item.items.map((listItem, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -10 / PHI }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: (index * 0.1) + (i * 0.05) }}
                            className="
                              relative pl-4
                              before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2
                              before:w-2 before:h-px before:bg-black/30
                              group-hover:before:w-3 before:transition-all before:duration-300
                            "
                          >
                            {listItem}
                          </motion.li>
                        ))}
                      </ul>
                    ) : item.contacts ? (
                      <div className="space-y-2">
                        {item.contacts.map((contact, i) => (
                          <motion.p
                            key={i}
                            initial={{ opacity: 0, x: -10 / PHI }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: (index * 0.1) + (i * 0.05) }}
                            className="relative"
                          >
                            <span className="font-semibold">{contact.type}：</span>
                            <a href={contact.type === "メール" ? `mailto:${contact.value}` : `tel:${contact.value}`}
                               className="text-black hover:text-black/80 transition-colors duration-300">
                              {contact.value}
                            </a>
                          </motion.p>
                        ))}
                      </div>
                    ) : (
                      <div className="whitespace-pre-line">{item.value}</div>
                    )}
                  </dd>
                </motion.div>
              ))}
            </dl>

            {/* 装飾的な要素 */}
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
          </motion.div>
        </div>
      </motion.section>

      {/* メッセージ */}
      <motion.section 
        {...fadeIn}
        className={`${sectionSpacing} relative overflow-hidden`}
        style={{
          marginBottom: `${sectionGap}px`,
          padding: `${elementGap}px 0`
        }}
      >
        {/* 洗練された背景エフェクト */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/30 to-white" />
          <motion.div
            animate={{
              opacity: [0.02, 0.04, 0.02],
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
            className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at 30% 20%, rgba(0, 0, 0, 0.03) 0%, transparent 50%),
                radial-gradient(circle at 70% 80%, rgba(0, 0, 0, 0.03) 0%, transparent 50%)
              `
            }}
          />
        </div>

        <div className="max-w-4xl mx-auto px-4 relative">
          <motion.h2 
            initial={{ opacity: 0, y: 20 / PHI }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-4xl font-bold text-center mb-20 !text-black relative inline-block w-full"
          >
            <span className="relative z-10">Message</span>
            <motion.span
              initial={{ width: 0 }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 1 }}
              className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-black/50 to-transparent"
            />
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 30 / PHI }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative bg-white/95 backdrop-blur-md rounded-2xl p-12 shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
          >
            <div className="space-y-8 !text-black">
              {/* メッセージ本文 - 既存のテキストを維持 */}
              <motion.p
                initial={{ opacity: 0, y: 20 / PHI }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-lg font-bold !text-black text-center relative"
              >
                はたらく全ての人を<br/>
                <span className="relative inline-block">
                  次のステージへ！
                  <motion.span
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="absolute bottom-0 left-0 h-px bg-black/20"
                  />
                </span>
              </motion.p>

              {/* 既存のメッセージ段落を維持しながら、アニメーションを追加 */}
              {messageContent.map((content, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, y: 20 / PHI }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + (index * 0.1) }}
                  className={`
                    relative pl-6 !text-black
                    ${content.isHeading ? 'text-lg font-bold text-center mb-8' : 'mb-6'}
                  `}
                >
                  {!content.isHeading && (
                    <span className="
                      absolute left-0 top-0 bottom-0 w-px
                      bg-gradient-to-b from-black/20 via-black/10 to-transparent
                    "/>
                  )}
                  {content.text}
                </motion.p>
              ))}

              {/* 署名部分 */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
                className="text-right mt-12"
              >
                <span className="block text-sm text-black/60">代表取締役</span>
                <span className="block text-xl font-bold mt-1">原田 賢治</span>
              </motion.div>
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

      {/* 沿革セクション */}
      <motion.section 
        {...fadeIn}
        className={`${sectionSpacing} relative overflow-hidden`}
      >
        {/* 洗練された背景エフェクト */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/30 to-white" />
          <motion.div
            animate={{
              opacity: [0.02, 0.04, 0.02],
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
            className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 30%, rgba(0, 0, 0, 0.03) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(0, 0, 0, 0.03) 0%, transparent 50%)
              `
            }}
          />
        </div>

        <div className="max-w-4xl mx-auto px-4 relative">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-4xl font-bold text-center mb-20 !text-black relative inline-block w-full"
          >
            <span className="relative z-10">History</span>
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
            className="relative bg-white/95 backdrop-blur-md rounded-2xl p-12 shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
          >
            <div className="space-y-12">
              {timelineItems.map((item, index) => (
                <motion.div
                  key={item.date}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  {/* 年月表示 */}
                  <div className="flex items-center mb-4 relative">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '100%' }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                      className="absolute top-1/2 left-0 h-px w-full bg-gradient-to-r from-black/20 to-transparent -z-10"
                    />
                    <div className="
                      min-w-[140px] bg-white pr-8
                      text-xl font-bold !text-black
                      relative whitespace-nowrap
                      before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2
                      before:w-3 before:h-3 before:border-2 before:border-black/30 before:rounded-full
                      group-hover:before:border-black/60 before:transition-colors before:duration-300
                      after:content-[''] after:absolute after:left-3 after:top-1/2 after:-translate-y-1/2
                      after:w-4 after:h-px after:bg-black/30
                      group-hover:after:w-6 group-hover:after:bg-black/60 after:transition-all after:duration-300
                    ">
                      {item.date}
                    </div>
                  </div>

                  {/* コンテンツ */}
                  <div className="pl-[140px] w-full max-w-3xl"> {/* max-w-3xlを追加 */}
                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                      className="text-lg font-bold !text-black mb-2"
                    >
                      {item.title}
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      className="!text-black relative pl-4"
                    >
                      <span className="
                        absolute left-0 top-0 bottom-0 w-px
                        bg-gradient-to-b from-black/20 via-black/10 to-transparent
                      "/>
                      {item.description}
                    </motion.p>
                  </div>

                  {/* ホバーエフェクト */}
                  <motion.div
                    className="
                      absolute -inset-4 rounded-xl
                      bg-gradient-to-br from-black/[0.02] to-transparent
                      opacity-0 group-hover:opacity-100
                      transition-all duration-500
                      pointer-events-none
                    "
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* アクセス */}
      <motion.section 
        {...fadeIn}
        className={`${sectionSpacing} bg-gray-50`}
      >
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Access</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* 本社 */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">本社</h3>
                <p className="text-gray-900">
                  〒520-0025<br />
                  滋賀県大津市皇子ヶ丘２丁目１０番２５−３００４号
                </p>
              </div>
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!..."
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>

            {/* 東京支社 */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">東京支社</h3>
                <p className="text-gray-900">
                  〒150-0043<br />
                  東京都渋谷区道玄坂１丁目１０番８号<br />
                  渋谷道玄坂東急ビル2F-C
                </p>
                <div className="mt-4">
                  <p className="text-gray-900">
                    <span className="font-semibold">メール：</span>
                    <a href="mailto:contact@nands.tech" className="text-blue-600 hover:text-blue-500">
                      contact@nands.tech
                    </a>
                  </p>
                  <p className="text-gray-900">
                    <span className="font-semibold">電話：</span>
                    <a href="tel:0120558551" className="text-blue-600 hover:text-blue-500">
                      0120-558-551
                    </a>
                  </p>
                </div>
              </div>
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!..."
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* フッターを追加 */}
      <Footer />
    </div>
  );
};

export default AboutPage;