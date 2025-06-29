"use client";

import React, { useRef, useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence, useAnimation, useInView } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";
import dynamic from 'next/dynamic';

// 3Dシーンを動的インポート（クライアントサイドのみ）
const ThreeScene = dynamic(() => import('./ThreeScene'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-black">
      {/* SSRでも基本的な背景は表示 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black opacity-80"></div>
      {/* CSS星空代替（軽量）*/}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-70 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  )
});

// リフレクションオーバーレイコンポーネント（3D無しでも動作）
function ReflectionOverlay({ hovered }: { hovered: boolean }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none transition-opacity duration-300"
      style={{
        background: hovered
          ? "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)"
          : "transparent",
        opacity: hovered ? 1 : 0,
      }}
    />
  );
}

/**
 * SSR対応版 HeroSection
 * 
 * Mike King理論準拠: AI検索エンジン最適化
 * - セマンティックHTML構造
 * - 構造化データ対応
 * - SSRでコンテンツ認識可能
 * - 3Dデザイン100%維持（別レイヤー）
 * 
 * 【特徴】
 * ✅ サーバーサイドレンダリング対応
 * ✅ AI検索エンジンによるコンテンツ認識
 * ✅ SEO最適化済み
 * ✅ レリバンスエンジニアリング準拠
 * ✅ 3Dデザイン完全維持
 */
export default function HeroSectionSSR() {
  // スプリットテキスト管理
  const [splitTitle, setSplitTitle] = useState<JSX.Element | null>(null);

  // framer-motion
  const heroRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(heroRef, { once: true, amount: 0.1 });
  const mainControls = useAnimation();

  useEffect(() => {
    // スマホ版とPC版で異なるテキスト分割を行う
    const text = "AIとともに未来を切り拓く";
    const mobileText = ["AIとともに", "未来を切り拓く"];
    
    const splitted = (
      <div className="relative">
        {/* PC版: 1行表示 */}
        <div className="hidden md:block">
          {text.split("").map((char, idx) => (
            <motion.span
              key={`pc-${idx}`}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.1 * idx,
                duration: 0.6,
                ease: "easeOut",
              }}
              className="inline-block hover:text-[#00CFFF]"
            >
              {char}
            </motion.span>
          ))}
        </div>
        
        {/* スマホ版: 2行表示 */}
        <div className="block md:hidden">
          {mobileText.map((line, lineIdx) => (
            <div key={`line-${lineIdx}`} className="mb-2">
              {line.split("").map((char, charIdx) => (
                <motion.span
                  key={`mobile-${lineIdx}-${charIdx}`}
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.1 * (charIdx + (lineIdx * line.length)),
                    duration: 0.6,
                    ease: "easeOut",
                  }}
                  className="inline-block hover:text-[#00CFFF]"
                >
                  {char}
                </motion.span>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
    
    setSplitTitle(splitted);
  }, []);

  useEffect(() => {
    if (inView) {
      mainControls.start("visible");
    }
  }, [inView, mainControls]);

  // リッチなサービスボタン用のstate
  const [hovered, setHovered] = useState(false);

  return (
    <>
      {/* 構造化データ（Mike King理論準拠） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPageElement",
            "name": "ヒーローセクション",
            "description": "株式会社エヌアンドエスのメインビジュアルエリア",
            "about": [
              "AIとともに未来を切り拓く",
              "個人・法人向けリスキリング", 
              "AI副業サポート",
              "退職サポート",
              "キャリア支援"
            ],
            "mainEntity": {
              "@type": "Organization",
              "name": "株式会社エヌアンドエス",
              "alternateName": "NANDS",
              "description": "AI時代のキャリアをトータルサポートする総合人材支援企業"
            }
          })
        }}
      />

      <section
        ref={heroRef}
        className="relative w-full min-h-screen flex flex-col items-center justify-center bg-black text-white overflow-hidden"
        role="banner"
        aria-label="メインビジュアル"
      >
        {/* ========================= */}
        {/* 3Dシーン（動的インポート） */}
        {/* ========================= */}
        <Suspense fallback={
          <div className="absolute inset-0 bg-black">
            <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black opacity-80"></div>
          </div>
        }>
          <ThreeScene />
        </Suspense>

        {/* ========================= */}
        {/* メインコンテンツ（SSR対応） */}
        {/* ========================= */}
        <div className="relative z-10 max-w-4xl px-4 py-8 text-center">
          <AnimatePresence>
            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-tight"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              {/* SSR用の静的テキスト（JavaScriptなしでも表示） */}
              <noscript>
                <span>AIとともに未来を切り拓く</span>
              </noscript>
              
              {/* 動的なスプリットテキスト */}
              {splitTitle}
            </motion.h1>
          </AnimatePresence>

          <motion.p
            className="text-lg md:text-xl text-gray-200 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
          >
            {/* PC版のテキスト */}
            <span className="hidden md:inline">
              個人・法人向けリスキリングからAI副業、退職サポートまで。
              <br />
              <span className="font-semibold" style={{ color: '#00CFFF' }}>NANDS</span>
              があなたのキャリアをトータルでサポートします。
            </span>

            {/* スマホ版のテキスト */}
            <span className="block md:hidden text-center">
              個人・法人向けリスキリングから
              <br />
              AI副業、退職サポートまで。
              <br />
              <span className="font-semibold" style={{ color: '#00CFFF' }}>NANDS</span>
              があなたのキャリアを
              <br />
              トータルでサポートします。
            </span>
          </motion.p>

          {/* リッチなサービスボタン */}
          <motion.div
            className="relative inline-block mt-4 md:mt-8 lg:mt-8 mb-20 md:mb-8"
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
              href="#services"
              className="relative overflow-hidden px-12 py-5 font-bold text-white
              bg-[#00CFFF] hover:bg-[#00BDEE]
              transition-all duration-300"
              style={{
                transformStyle: "preserve-3d",
              }}
              role="button"
              aria-label="サービス一覧を表示"
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
              <span className="relative z-10 tracking-wider text-black">サービスを見る</span>

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
            </a>

            {/* ホバー時のグロー効果 - より繊細に */}
            <div
              className="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none"
              style={{
                background: "radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%)",
                opacity: hovered ? 0.6 : 0,
              }}
            ></div>
          </motion.div>
        </div>

        {/* 下方向スクロール案内 */}
        <div className="absolute bottom-10 flex justify-center w-full text-gray-300">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 4,
              repeat: Infinity,
              repeatType: "reverse",
              duration: 1.5,
            }}
            role="img"
            aria-label="下にスクロール"
          >
            <FaChevronDown size={24} />
          </motion.div>
        </div>
      </section>
    </>
  );
} 