"use client";

import React, { useRef, useEffect } from "react";
import { motion, useInView, useAnimation } from "framer-motion";
import {
  FaGraduationCap,
  FaBuilding,
  FaLaptopCode,
  FaBalanceScale,
} from "react-icons/fa";

/**
 * =========================================================
 * ServicesSection.tsx
 *
 * 主なポイント:
 * ---------------------------------------------------------
 * 1. 構造化データ (JSON-LD):
 *    - サービス一覧を検索エンジンに理解させるため scriptタグを挿入
 *
 * 2. パララックス背景 (ParallaxBG):
 *    - スクロールに応じて背景がわずかに動いて見える
 *    - ただし実装はシンプル (bg-fixed + opacity)
 *
 * 3. カードのアニメーション:
 *    - framer-motionを使い、ホバー時に subtle scale + gradient border
 *    - 3D回転(フリップ)は廃止し、上品でバグの起きにくい挙動に
 *
 * 4. シームレスなフェードイン:
 *    - セクション表示時にタイトルやカードが段階的にフェードイン
 *
 * 5. 大量のコメントで情報過多
 *    - しかし読みやすさを意識しつつ、バグを減らす工夫
 * ---------------------------------------------------------
 */

// ======= サービスデータ =======
const servicesData = [
  {
    title: "個人向けリスキリング",
    icon: <FaGraduationCap size={32} />,
    description:
      "生成AIやプロンプトエンジニアリングで、新時代のスキルを習得します。",
    link: "/reskilling",
  },
  {
    title: "法人向けリスキリング",
    icon: <FaBuilding size={32} />,
    description:
      "企業向けDX研修や生成AI研修で、組織全体を最新技術でアップデート。",
    link: "/corporate",
  },
  {
    title: "AI副業",
    icon: <FaLaptopCode size={32} />,
    description:
      "ChatGPTを活用したSEOライティングや副業ノウハウをサポート。",
    link: "/fukugyo",
  },
  {
    title: "退職代行",
    icon: <FaBalanceScale size={32} />,
    description:
      "業界最安2,980円の安心退職。未来のキャリアへ踏み出すお手伝い。",
    link: "https://taishoku-anshin-daiko.com",
  },
];

/**
 * ==========================================
 * JSON-LD: 構造化データを挿入
 * ==========================================
 */
function StructuredDataScript() {
  const serviceItems = servicesData.map((item) => ({
    "@type": "Service",
    name: item.title,
    description: item.description,
    url: item.link,
    provider: {
      "@type": "Organization",
      name: "N&S",
    },
  }));

  const jsonLD = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: serviceItems.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: service,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLD) }}
    />
  );
}

/**
 * ==========================================
 * パララックス背景 (簡易実装)
 * - 背景画像を固定し、軽めの演出
 * ==========================================
 */
function ParallaxBG() {
  return (
    <div
      className="absolute inset-0 bg-[url('/images/background.jpg')] bg-cover bg-center bg-fixed opacity-10 pointer-events-none"
      aria-hidden="true"
    />
  );
}

/**
 * ==========================================
 * Card: サービスカード
 * - 3Dフリップは廃止
 * - ホバー時に subtle scale & グラデーション枠線
 * ==========================================
 */
function ServiceCard({
  icon,
  title,
  description,
  link,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
}) {
  return (
    <motion.a
      href={link}
      className={`
        group relative block p-6 rounded-xl transition-all
        bg-white border border-gray-200 shadow-sm
        overflow-hidden
      `}
      whileHover={{
        scale: 1.03,
      }}
      whileTap={{ scale: 0.97 }}
      style={{ transformOrigin: "center" }}
    >
      {/* グラデーション枠線演出 (hover時) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0
                   group-hover:opacity-100 transition-opacity"
        style={{
          borderRadius: "inherit",
          background:
            "linear-gradient(135deg, rgba(99,102,241,0.5), rgba(236,72,153,0.5))",
          // 枠線に見せるために内側にpaddingを入れて白色をくり抜き
          padding: "2px",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
        }}
      ></div>

      {/* アイコン + テキスト */}
      <div className="relative z-10 flex flex-col h-full text-gray-800">
        <div className="mb-4 text-indigo-500">{icon}</div>
        <h3 className="text-xl font-semibold mb-2 group-hover:text-indigo-600">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mb-4 flex-grow">
          {description}
        </p>
        <span className="inline-block mt-auto text-indigo-500 font-medium group-hover:underline">
          詳しく見る →
        </span>
      </div>
    </motion.a>
  );
}

/**
 * ==========================================
 * メインセクション
 * ==========================================
 */
export default function ServicesSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.2 });
  const mainControls = useAnimation();

  useEffect(() => {
    if (inView) {
      mainControls.start("visible");
    }
  }, [inView, mainControls]);

  // タイトルやサブテキストのアニメーション
  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: "easeOut" },
    },
  };

  // カード一覧全体
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  // カード単体
  const cardVariants = {
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
      id="services"
      className="relative w-full py-16 bg-white text-gray-800 overflow-hidden"
    >
      {/* パララックス背景 */}
      <ParallaxBG />

      {/* 構造化データ */}
      <StructuredDataScript />

      <motion.div
        className="relative z-10 max-w-6xl mx-auto px-4"
        variants={containerVariants}
        initial="hidden"
        animate={mainControls}
      >
        {/* タイトル */}
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-8"
          variants={textVariants}
        >
          提供サービス
        </motion.h2>
        {/* 説明 */}
        <motion.p
          className="text-center text-gray-600 mb-12 max-w-3xl mx-auto"
          variants={textVariants}
          transition={{ delay: 0.2 }}
        >
          NANDSでは、AI時代を見据えた多角的なサービスをワンストップでご提供しています。
          <br />
          それぞれの領域で新たな可能性を切り拓き、あなたの未来を支えます。
        </motion.p>

        {/* カード一覧 */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
        >
          {servicesData.map((service, index) => (
            <motion.div key={index} variants={cardVariants}>
              <ServiceCard
                icon={service.icon}
                title={service.title}
                description={service.description}
                link={service.link}
              />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
