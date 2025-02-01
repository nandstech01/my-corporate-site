"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useInView, useAnimation } from "framer-motion";

/**
 * =========================================================
 * ContactSection.tsx (フォーム版)
 *
 * 主なポイント:
 * ---------------------------------------------------------
 * 1. 波形(WaveSVG)とパララックス背景
 *    - 前セクションとの境界を自然につなぎ、
 *      単調な色ブロックにならないよう淡く演出
 *
 * 2. フォーム
 *    - 名前、お問い合わせ内容などをユーザーが入力
 *    - Tailwind CSSでシンプル & 上品に
 *    - フォーカス時にやや強調 (border色の変化, box-shadow)
 *    - framer-motionでフォーム各要素をフェードイン
 *
 * 3. ボタン
 *    - "送信する" ボタンを丸み + subtle hoverで洗練
 *    - 押した時のscale変化などをframer-motionで実装
 *
 * 4. コードを長すぎず保守しやすく
 *    - 余計な3D回転やギラギラを排除
 *    - LINEボタンを削除
 *
 * 5. バグを減らし、かつ高級感を高める
 * ---------------------------------------------------------
 */

export default function ContactSection() {
  // Intersection Observer
  const sectionRef = useRef<HTMLElement | null>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.2 });
  const controls = useAnimation();

  // Form state (簡易例)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [inView, controls]);

  // タイトル等のフェードアップ
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: "easeOut" },
    },
  };

  // フォーム要素それぞれ
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  // ボタン
  const buttonVariants = {
    rest: { scale: 1 },
    hover: {
      scale: 1.03,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    tap: { scale: 0.97, transition: { duration: 0.2 } },
  };

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxP89a1VvqlldbOXkaomiBSf_49tdd8UGVAzNBzKP7LA7rmcy1i3s9inzAVOuyYDF1jjA/exec';
      
      // 送信データの準備
      const formData = {
        name,
        email,
        message
      };

      // Google Apps Scriptに送信
      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // CORS対策
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // フォームをリセット
      setName("");
      setEmail("");
      setMessage("");

      // 成功メッセージを表示
      alert('お問い合わせを受け付けました。');
      
    } catch (error) {
      console.error('Error:', error);
      alert('送信に失敗しました。もう一度お試しください。');
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-16 bg-indigo-50 text-gray-800 overflow-hidden"
    >
      {/* 波形で前セクションとの境界を演出 */}
      <WaveSVG />

      {/* 背景のパララックス模様 */}
      <div
        className="absolute inset-0 bg-[url('/images/indigo-pattern.png')] bg-cover bg-center bg-fixed opacity-10 pointer-events-none"
        aria-hidden="true"
      />

      {/* 全体コンテナ */}
      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-4"
        initial="hidden"
        animate={controls}
        variants={{
          visible: { transition: { staggerChildren: 0.2 } },
        }}
      >
        {/* タイトル */}
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-6"
          variants={textVariants}
        >
          無料相談・お問い合わせ
        </motion.h2>
        {/* 説明文 */}
        <motion.p
          className="text-center text-gray-600 mb-12"
          variants={textVariants}
          transition={{ delay: 0.1 }}
        >
          AI時代の学び直しや副業、退職代行など、まずは気軽にご相談ください。
        </motion.p>

        {/* フォーム */}
        <motion.form
          onSubmit={handleSubmit}
          className="mx-auto w-full md:w-3/4 bg-white p-6 rounded-lg shadow-md"
          variants={itemVariants}
        >
          {/* お名前 */}
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-gray-700 font-medium mb-2"
            >
              お名前
            </label>
            <input
              id="name"
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded
                         focus:border-indigo-500 focus:ring focus:ring-indigo-200
                         transition-colors"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 font-medium mb-2"
            >
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded
                         focus:border-indigo-500 focus:ring focus:ring-indigo-200
                         transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* お問い合わせ内容 */}
          <div className="mb-6">
            <label
              htmlFor="message"
              className="block text-gray-700 font-medium mb-2"
            >
              お問い合わせ内容
            </label>
            <textarea
              id="message"
              className="w-full px-4 py-2 border border-gray-300 rounded
                         focus:border-indigo-500 focus:ring focus:ring-indigo-200
                         transition-colors"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            ></textarea>
          </div>

          {/* ボタン */}
          <motion.button
            type="submit"
            className="relative overflow-hidden px-12 py-5 font-bold text-white mx-auto block
                       bg-gradient-to-r from-indigo-800 via-indigo-600 to-indigo-500
                       hover:from-indigo-900 hover:via-indigo-700 hover:to-indigo-600
                       transition-all duration-300"
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            {/* 外側の白い枠 */}
            <div className="absolute inset-0 border border-white opacity-30"></div>
            
            {/* 内側の白い枠 */}
            <div 
              className="absolute inset-[2px]"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.6)',
                background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.1) 100%)',
                opacity: 0.2,
              }}
            ></div>

            {/* ボタンテキスト */}
            <span className="relative z-10 tracking-wider">送信する</span>

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

            {/* ホバー時のグロー効果 */}
            <div
              className="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none"
              style={{
                background: "radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%)",
                opacity: hovered ? 0.6 : 0,
              }}
            ></div>
          </motion.button>
        </motion.form>
      </motion.div>
    </section>
  );
}

/**
 * WaveSVG
 * - 前セクションとの境界を波形にし、デザインを柔らかく
 */
function WaveSVG() {
  return (
    <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0]">
      <svg
        className="block w-[200%] h-32 transform -translate-x-1/4 text-indigo-200"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path
          d="M985.66 3.22C860.46 33.55 739.99 74.43 614.2 90.49 
             C542 100.08 466.93 98.99 394.8 89.28 
             C316.67 78.39 240.72 55.99 163.39 43.59 
             C99.23 33.34 34.55 33.17 0 33.11V120H1200V0
             C1141.78 3.49 1070.04 -0.77 985.66 3.22Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}

/**
 * ReflectionOverlay コンポーネント
 */
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
