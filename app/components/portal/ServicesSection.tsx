"use client";

import React, { useRef, useEffect } from "react";
import { motion, useInView, useAnimation } from "framer-motion";
import {
  FaGraduationCap,
  FaBuilding,
  FaLaptopCode,
  FaBalanceScale,
} from "react-icons/fa";
import TrueFocus from './TrueFocus';
import "./TrueFocus.css";

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
    id: "personal-reskilling"
  },
  {
    title: "法人向けリスキリング",
    icon: <FaBuilding size={32} />,
    description:
      "企業向けDX研修や生成AI研修で、組織全体を最新技術でアップデート。",
    link: "/corporate",
    id: "corporate-reskilling"
  },
  {
    title: "AI副業",
    icon: <FaLaptopCode size={32} />,
    description:
      "ChatGPTを活用したSEOライティングや副業ノウハウをサポート。",
    link: "/fukugyo",
    id: "ai-side-business"
  },
  {
    title: "退職代行",
    icon: <FaBalanceScale size={32} />,
    description:
      "業界最安2,980円の安心退職。未来のキャリアへ踏み出すお手伝い。",
    link: "https://taishoku-anshin-daiko.com",
    id: "resignation-support"
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
  id
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  id: string;
}) {
  // カード個別のアニメーション設定
  const cardVariants = {
    hidden: { opacity: 0, y: 50, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }, // EaseOutQuint
    },
  };

  return (
    <motion.a
      href={link}
      className={`
        group relative block p-6 rounded-xl transition-all duration-300 ease-out
        bg-gray-900 border border-gray-700 shadow-lg
        hover:bg-gray-800 hover:border-[#00CFFF]/50 hover:shadow-cyan-glow
        overflow-hidden
      `}
      variants={cardVariants} // アニメーションを適用
      style={{ transformOrigin: "center" }}
      whileHover={{ y: -5 }} // ホバー時に少し浮き上がる
    >
      {/* グラデーション枠線演出 (hover時) - 不要であれば削除 */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0
                   group-hover:opacity-100 transition-opacity duration-300"
        style={{
          borderRadius: "inherit",
          background:
            "radial-gradient(circle at center, rgba(0, 207, 255, 0.1), transparent 70%)", // #00CFFF の輝き
          padding: "2px",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
        }}
      ></div>

      {/* アイコン + テキスト */}
      <div className="relative z-10 flex flex-col h-full text-white">
        <div className="mb-4 text-[#00CFFF]"> {/* 色変更 */}
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2">
          <TrueFocus
            sentence={title}
            manualMode={true} // ホバーでフォーカス
            blurAmount={2}
            borderColor="#00CFFF"
            glowColor="rgba(0, 207, 255, 0.7)"
            animationDuration={0.3}
          />
        </h3>
        <p className="text-sm text-gray-400 mb-4 flex-grow">
          {description}
        </p>
        <span className="inline-block mt-auto text-[#00CFFF] font-medium group-hover:underline">
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
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 }); // 発火タイミング調整
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  // タイトルやサブテキストのアニメーション
  const textVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  // カードコンテナのアニメーション（stagger効果）
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15, // 少し早く
        delayChildren: 0.2, // タイトル表示後
      },
    },
  };

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative w-full py-20 md:py-28 bg-black text-white overflow-hidden" // 背景・文字色変更
    >
      {/* パララックス背景 */}
      <ParallaxBG />

      {/* 構造化データ */}
      <StructuredDataScript />

      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" // max-width 調整
        initial="hidden"
        animate={controls}
        variants={textVariants} // セクション全体にフェードイン適用も可能
      >
        {/* タイトル */}
        <div className="text-center mb-12 md:mb-16">
           <TrueFocus
            sentence="サービス紹介"
            manualMode={false} // 自動アニメーション
            blurAmount={3}
            borderColor="#00CFFF"
            glowColor="rgba(0, 207, 255, 0.7)"
            animationDuration={0.8}
            pauseBetweenAnimations={0.5}
           />
           <motion.p
            className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto"
            variants={textVariants} // サブテキストにも適用
           >
             個人から法人まで、AI時代を勝ち抜くためのスキルとサポートを提供します。
           </motion.p>
        </div>

        {/* サービスカードグリッド */}
        <motion.div
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants} // stagger 効果を適用
          initial="hidden"
          animate={controls}
        >
          {servicesData.map((service, index) => (
            <ServiceCard key={service.id} {...service} /> // id を key に
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
