"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useInView, useAnimation } from "framer-motion";

/**
 * =========================================================
 * AboutSection.tsx
 *
 * 主なポイント:
 * ---------------------------------------------------------
 * 1. Wave（波形）を上部に配置
 *    - トップバナー(黒背景) などのセクションと
 *      この白背景セクションを自然に繋ぐ
 *
 * 2. フェードイン演出 (framer-motion)
 *    - セクションがViewportに入ったらタイトル・テキストが上品に登場
 *
 * 3. ボタンデザイン
 *    - 過去の "RefinedServiceButton" 等の洗練スタイルを踏襲しつつ
 *      やや控えめで一貫性を保つ
 *
 * 4. ロゴ表示
 *    - ロゴ画像には subtle scale on hover を追加し、連動感を演出
 *
 * 5. デザインとコードのバグを削減
 *    - 波形SVGはシンプルな実装
 *    - 余計な3D演出や過剰エフェクトを排除して保守性を確保
 * ---------------------------------------------------------
 */

// ReflectionOverlay コンポーネント
function ReflectionOverlay({ hovered }: { hovered: boolean }) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!overlayRef.current) return;

    if (hovered) {
      overlayRef.current.animate(
        [
          { transform: "translateX(-120%)", opacity: 0 },
          { transform: "translateX(120%)", opacity: 0.2 },
        ],
        {
          duration: 800,
          easing: "ease-out",
          fill: "forwards",
        }
      );
    } else {
      overlayRef.current.animate(
        [{ transform: "translateX(-120%)", opacity: 0 }],
        {
          duration: 300,
          fill: "forwards",
        }
      );
    }
  }, [hovered]);

  return (
    <div
      ref={overlayRef}
      className="absolute top-0 left-0 w-1/3 h-full
      bg-white bg-opacity-20
      pointer-events-none
      mix-blend-screen
      rounded-full"
      style={{
        borderRadius: "9999px",
      }}
    ></div>
  );
}

export default function AboutSection() {
  /**
   * セクションアニメ
   */
  const sectionRef = useRef<HTMLElement | null>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.2 });
  const mainControls = useAnimation();
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (inView) {
      mainControls.start("visible");
    }
  }, [inView, mainControls]);

  // タイトルと本文
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: "easeOut" },
    },
  };

  // 画像・ボタンなどの要素
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: "easeOut" },
    },
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-24 bg-white text-gray-800 overflow-hidden"
    >
      {/* 上部の装飾 - より洗練された境界線 */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-gray-50 to-white"></div>

      <motion.div
        className="max-w-5xl mx-auto px-4 relative z-10"
        initial="hidden"
        animate={mainControls}
        variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
      >
        {/* タイトル */}
        <motion.h2
          className="text-3xl md:text-4xl font-bold mb-16 text-center"
          variants={textVariants}
        >
          N&Sについて
        </motion.h2>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* テキストカラム */}
          <div className="flex flex-col justify-end space-y-8">
            <motion.p
              className="text-lg leading-relaxed text-gray-700"
              variants={textVariants}
            >
              私たちはAI時代のキャリアを切り拓くワークテック企業です。個人向け・法人向けのリスキリング研修や、AI副業サポート、退職代行までをワンストップで提供し、人々がより自由かつ強いキャリアを築ける世界を目指しています。
            </motion.p>
            <motion.p
              className="text-lg leading-relaxed text-gray-700 mb-12"
              variants={textVariants}
              transition={{ delay: 0.1 }}
            >
              2008年の創業以来、「次のステージへ」を合言葉に、最新技術と実践的なキャリア支援ノウハウを融合。多様な人材が思い切り挑戦できる環境づくりに力を注いでいます。
            </motion.p>
            <motion.div
              className="pt-8"
              variants={itemVariants}
              transition={{ delay: 0.2 }}
              initial={{ scale: 1 }}
              whileHover={{
                scale: 1.03,
                transition: { duration: 0.3 }
              }}
              whileTap={{
                scale: 0.97,
                transition: { duration: 0.2 }
              }}
              onHoverStart={() => setHovered(true)}
              onHoverEnd={() => setHovered(false)}
            >
              {/* ボタン */}
              <div className="text-center">
                <a
                  href="/about"
                  className="relative overflow-hidden px-12 py-5 font-bold text-white inline-block
                  bg-gradient-to-r from-blue-800 via-blue-600 to-blue-500
                  hover:from-blue-900 hover:via-blue-700 hover:to-blue-600
                  transition-all duration-300"
                  style={{
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* 外側の白い枠 - より細く洗練された印象に */}
                  <div className="absolute inset-0 border border-white opacity-30"></div>
                  
                  {/* 内側の白い枠 - アクセントとして */}
                  <div 
                    className="absolute inset-[2px]"
                    style={{
                      border: '1px solid rgba(255, 255, 255, 0.6)',
                      background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.1) 100%)',
                      opacity: 0.2,
                    }}
                  ></div>

                  {/* ボタンテキスト */}
                  <span className="relative z-10 tracking-wider">詳しく見る</span>

                  {/* 光沢エフェクト */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.1) 100%)",
                      mixBlendMode: "overlay",
                    }}
                  ></div>

                  {/* 反射レイヤー */}
                  <ReflectionOverlay hovered={hovered} />

                  {/* ホバー時のグロー効果 - より繊細に */}
                  <div
                    className="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: "radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%)",
                      opacity: hovered ? 0.6 : 0,
                    }}
                  ></div>
                </a>
              </div>
            </motion.div>
          </div>

          {/* 画像カラム */}
          <motion.div
            className="flex justify-center"
            variants={itemVariants}
            transition={{ delay: 0.2 }}
          >
            <motion.img
              src="/images/logo.svg"
              alt="N&Sロゴ"
              className="w-48 h-auto hover:scale-105 transition-transform"
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
