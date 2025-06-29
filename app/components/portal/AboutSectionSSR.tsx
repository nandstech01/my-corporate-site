"use client";

import React, { useRef, useEffect, useState, Suspense } from "react";
import { motion, useInView, useAnimation } from "framer-motion";
import dynamic from 'next/dynamic';

// TrueFocusを動的インポート（クライアントサイドのみ）
const TrueFocus = dynamic(() => import('./TrueFocus'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse bg-gray-700 h-6 w-full rounded"></div>
  )
});

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
      className="absolute top-0 left-0 w-1/3 h-full bg-white bg-opacity-20 pointer-events-none mix-blend-screen rounded-full"
    ></div>
  );
}

export default function AboutSectionSSR() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.2 });
  const mainControls = useAnimation();
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (inView) {
      mainControls.start("visible");
    }
  }, [inView, mainControls]);

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: "easeOut" },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: "easeOut" },
    },
  };

  return (
    <>
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "NANDSについて",
            "description": "株式会社エヌアンドエスの企業概要と理念",
            "about": {
              "@type": "Organization",
              "name": "株式会社エヌアンドエス",
              "alternateName": "NANDS",
              "description": "AI時代のキャリアを切り拓くワークテック企業",
              "foundingDate": "2008",
              "mission": "次のステージへ"
            }
          })
        }}
      />

      <section
        ref={sectionRef}
        className="relative py-24 bg-black text-gray-100 overflow-hidden"
        role="region"
        aria-label="会社概要"
      >
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-gray-900 to-black"></div>

        <motion.div
          className="max-w-5xl mx-auto px-4 relative z-10"
          initial="hidden"
          animate={mainControls}
          variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-16 text-center"
            variants={textVariants}
          >
            NANDSについて
          </motion.h2>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col justify-end space-y-8">
              <motion.div variants={textVariants}>
                <noscript>
                  <p className="text-gray-100 leading-relaxed">
                    私たちはAI時代のキャリアを切り拓くワークテック企業です。個人向け・法人向けのリスキリング研修や、AI副業サポート、退職代行までをワンストップで提供し、人々がより自由かつ強いキャリアを築ける世界を目指しています。
                  </p>
                </noscript>
                
                <Suspense fallback={
                  <div className="text-gray-100 leading-relaxed">
                    私たちはAI時代のキャリアを切り拓くワークテック企業です。個人向け・法人向けのリスキリング研修や、AI副業サポート、退職代行までをワンストップで提供し、人々がより自由かつ強いキャリアを築ける世界を目指しています。
                  </div>
                }>
                  <TrueFocus
                    sentence="私たちはAI時代のキャリアを切り拓くワークテック企業です。個人向け・法人向けのリスキリング研修や、AI副業サポート、退職代行までをワンストップで提供し、人々がより自由かつ強いキャリアを築ける世界を目指しています。"
                    manualMode={false}
                    blurAmount={2}
                    animationDuration={0.5}
                    pauseBetweenAnimations={0.3}
                    borderColor="rgba(0, 207, 255, 0.5)"
                    glowColor="rgba(0, 140, 255, 0.5)"
                  />
                </Suspense>
              </motion.div>
              
              <motion.div variants={textVariants}>
                <noscript>
                  <p className="text-gray-100 leading-relaxed">
                    2008年の創業以来、「次のステージへ」を合言葉に、最新技術と実践的なキャリア支援ノウハウを融合。多様な人材が思い切り挑戦できる環境づくりに力を注いでいます。
                  </p>
                </noscript>
                
                <Suspense fallback={
                  <div className="text-gray-100 leading-relaxed">
                    2008年の創業以来、「次のステージへ」を合言葉に、最新技術と実践的なキャリア支援ノウハウを融合。多様な人材が思い切り挑戦できる環境づくりに力を注いでいます。
                  </div>
                }>
                  <TrueFocus
                    sentence="2008年の創業以来、「次のステージへ」を合言葉に、最新技術と実践的なキャリア支援ノウハウを融合。多様な人材が思い切り挑戦できる環境づくりに力を注いでいます。"
                    manualMode={false}
                    blurAmount={2}
                    animationDuration={0.5}
                    pauseBetweenAnimations={0.3}
                    borderColor="rgba(0, 207, 255, 0.5)"
                    glowColor="rgba(0, 140, 255, 0.5)"
                  />
                </Suspense>
              </motion.div>
              
              <motion.div
                className="pt-8"
                variants={itemVariants}
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.03 }}
                onHoverStart={() => setHovered(true)}
                onHoverEnd={() => setHovered(false)}
              >
                <div className="text-center">
                  <a
                    href="/about"
                    className="relative overflow-hidden px-12 py-5 font-bold text-white inline-block bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border border-gray-200 transition-all duration-300"
                  >
                    <div className="absolute inset-0 border border-white opacity-30"></div>
                    <span className="relative z-10 tracking-wider">詳しく見る</span>
                    <ReflectionOverlay hovered={hovered} />
                  </a>
                </div>
              </motion.div>
            </div>

            <motion.div className="flex justify-center" variants={itemVariants}>
              <div className="relative">
                <motion.img
                  src="/images/logo-white.png"
                  alt="NANDS企業ロゴ"
                  className="w-64 h-64 object-contain filter drop-shadow-2xl"
                  whileHover={{ scale: 1.05 }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl -z-10"></div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </>
  );
} 