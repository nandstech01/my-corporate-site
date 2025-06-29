'use client';

"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';

export default function ContactSection() {
  // Intersection Observer
  const sectionRef = useRef<HTMLElement | null>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.2 });
  const controls = useAnimation();

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [inView, controls]);

  // アニメーション設定
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: "easeOut" },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

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
      
      const formData = {
        name,
        email,
        company,
        message,
        source: 'corporate'
      };

      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      setName("");
      setEmail("");
      setCompany("");
      setMessage("");

      alert('お問い合わせを受け付けました。');
      
    } catch (error) {
      console.error('Error:', error);
      alert('送信に失敗しました。もう一度お試しください。');
    }
  };

  return (
    <section
      id="consultation-section"
      ref={sectionRef}
      className="relative py-20 bg-gray-900 text-white"
    >
      {/* 背景のグラデーション */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 opacity-50" />

      {/* グリッドパターン */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:14px_24px]" />

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
          AI導入に関するご相談
        </motion.h2>

        <motion.p
          className="text-center text-gray-300 mb-12"
          variants={textVariants}
        >
          生成AIの活用やリスキリング研修など、お気軽にご相談ください。
        </motion.p>

        {/* フォーム */}
        <motion.form
          onSubmit={handleSubmit}
          className="mx-auto w-full md:w-3/4 bg-white/10 backdrop-blur-lg p-8 rounded-lg"
          variants={itemVariants}
        >
          {/* お名前 */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-200 font-medium mb-2">
              お名前
            </label>
            <input
              id="name"
              type="text"
              className="w-full px-4 py-2 bg-white/5 border border-gray-700 rounded-lg
                         text-white placeholder-gray-400
                         focus:border-blue-500 focus:ring focus:ring-blue-500/20
                         transition-colors"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* 会社名 */}
          <div className="mb-4">
            <label htmlFor="company" className="block text-gray-200 font-medium mb-2">
              会社名
            </label>
            <input
              id="company"
              type="text"
              className="w-full px-4 py-2 bg-white/5 border border-gray-700 rounded-lg
                         text-white placeholder-gray-400
                         focus:border-blue-500 focus:ring focus:ring-blue-500/20
                         transition-colors"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-200 font-medium mb-2">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-2 bg-white/5 border border-gray-700 rounded-lg
                         text-white placeholder-gray-400
                         focus:border-blue-500 focus:ring focus:ring-blue-500/20
                         transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* お問い合わせ内容 */}
          <div className="mb-6">
            <label htmlFor="message" className="block text-gray-200 font-medium mb-2">
              お問い合わせ内容
            </label>
            <textarea
              id="message"
              className="w-full px-4 py-2 bg-white/5 border border-gray-700 rounded-lg
                         text-white placeholder-gray-400
                         focus:border-blue-500 focus:ring focus:ring-blue-500/20
                         transition-colors"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          {/* 送信ボタン */}
          <motion.button
            type="submit"
            className="w-full md:w-auto px-12 py-4 bg-blue-600 text-white font-semibold rounded-lg
                     hover:bg-blue-700 transition-colors duration-300
                     flex items-center justify-center mx-auto"
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
          >
            無料相談を申し込む
          </motion.button>
        </motion.form>
      </motion.div>
    </section>
  );
} 