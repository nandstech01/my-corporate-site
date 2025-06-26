"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useInView, useAnimation } from "framer-motion";
import { FaLeaf, FaSeedling, FaGlobeAsia } from "react-icons/fa";

/**
 * =========================================================
 * SustainabilitySection.tsx
 *
 * 概要:
 * ---------------------------------------------------------
 * 1. 波形 (WaveSVG) をセクション上端に配置し、
 *    グリーン背景（bg-green-50）と前セクションを柔らかく繋ぐ。
 *
 * 2. framer-motion によるフェードイン演出:
 *    - タイトル・本文・カードを順番に登場させる。
 *
 * 3. カードにやや大きめのアイコン(leaf/seedling/globe)を添えて
 *    サステナブルかつ華やかな印象。
 *
 * 4. ボタンクリックでさらに詳細ページへ。hover時の微拡大や色変化を
 *    green系に合わせ統一感を保つ。
 *
 * 5. シンプルなパララックス背景 (bg-fixed + 透過)
 *    必要に応じて葉っぱのパターンを敷くなど応用可。
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

export default function SustainabilitySection() {
  const [hovered, setHovered] = useState(false);
  // Intersection Observer
  const sectionRef = useRef<HTMLElement | null>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.2 });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [inView, controls]);

  // タイトルや本文
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: "easeOut" },
    },
  };

  // カード/ボタン個別
  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-16 bg-green-50 text-gray-800 overflow-hidden"
    >
      {/* ----- Wave at the top (connection from previous section) ----- */}
      <WaveSVG />

      {/* ----- Parallax background (optional, subtle) ----- */}
      <div
        className="absolute inset-0 bg-[url('/images/leaf-pattern.png')] bg-cover bg-center bg-fixed opacity-10 pointer-events-none"
        aria-hidden="true"
      />

      <motion.div
        className="relative z-10 max-w-6xl mx-auto px-4"
        initial="hidden"
        animate={controls}
        variants={{
          visible: {
            transition: { staggerChildren: 0.2 },
          },
        }}
      >
        {/* タイトル */}
        <motion.h2
          className="text-3xl font-bold mb-6 mt-16 text-center"
          variants={textVariants}
        >
          サステナビリティへの
          <br className="md:hidden" />
          取り組み
        </motion.h2>
        {/* 本文 */}
        <motion.p
          className="text-center text-gray-600 max-w-2xl mx-auto mb-8"
          variants={textVariants}
          transition={{ delay: 0.1 }}
        >
          NANDSでは、AI技術と人材育成を通じて社会課題解決を目指しています。
          多様な人々が活躍できる環境を創出し、持続可能な未来を共に築きます。
        </motion.p>

        {/* カード一覧 */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10"
          variants={{
            visible: { transition: { staggerChildren: 0.2 } },
          }}
        >
          {/* カード1 */}
          <motion.div variants={itemVariants}>
            <SustainabilityCard
              icon={<FaLeaf size={36} className="text-green-600 mb-2" />}
              title="教育機会の拡大"
              text="学び直し支援や副業サポートを充実させ、誰もが生涯学習にアクセスできる社会へ。"
            />
          </motion.div>
          {/* カード2 */}
          <motion.div variants={itemVariants}>
            <SustainabilityCard
              icon={<FaSeedling size={36} className="text-green-600 mb-2" />}
              title="働きやすい職場づくり"
              text="退職代行を含む労働環境改善をサポートし、働き手の健康と意欲を守ります。"
            />
          </motion.div>
          {/* カード3 */}
          <motion.div variants={itemVariants}>
            <SustainabilityCard
              icon={<FaGlobeAsia size={36} className="text-green-600 mb-2" />}
              title="テクノロジーの力で格差解消"
              text="地域企業のDX推進やAI導入コンサルで、地域格差や情報格差の解消を目指します。"
            />
          </motion.div>
        </motion.div>

        {/* ボタン */}
        <motion.div
          className="text-center mt-12"
          variants={itemVariants}
          transition={{ delay: 0.3 }}
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
          <a
            href="/sustainability"
            className="relative overflow-hidden px-12 py-5 font-bold text-white
            bg-gradient-to-r from-green-800 via-green-600 to-green-500
            hover:from-green-900 hover:via-green-700 hover:to-green-600
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
        </motion.div>
      </motion.div>
    </section>
  );
}

/**
 * WaveSVG: セクション上部の波形
 * 前セクションが仮に濃色(黒など)の場合に自然に繋がる
 */
function WaveSVG() {
  return (
    <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] rotate-180">
      <svg
        className="block w-[200%] h-32 transform -translate-x-1/4 text-green-600"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        {/* ここでは適度にグリーンを入れて、下のbgと馴染むように */}
        <path
          d="M985.66 3.22C860.46 33.55 739.99 74.43 614.2 90.49C542 100.08 466.93 98.99 394.8 
             89.28C316.67 78.39 240.72 55.99 163.39 43.59C99.23 33.34 34.55 33.17 0 33.11V120H1200V0
             C1141.78 3.49 1070.04 -0.77 985.66 3.22Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}

/**
 * カード用のコンポーネント
 */
function SustainabilityCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div
                    className="bg-white p-6 border border-gray-200 shadow hover:shadow-lg transition-shadow
                 border border-transparent hover:border-green-200"
    >
      <div className="flex flex-col items-start">
        {icon}
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
      </div>
      <p className="text-sm text-gray-700">{text}</p>
    </div>
  );
}
