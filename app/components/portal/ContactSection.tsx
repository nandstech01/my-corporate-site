"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTheme } from './ThemeContext';

export default function ContactSection() {
  const { theme } = useTheme();
  
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxP89a1VvqlldbOXkaomiBSf_49tdd8UGVAzNBzKP7LA7rmcy1i3s9inzAVOuyYDF1jjA/exec';
      
      const formData = {
        name,
        email,
        message
      };

      await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // フォームをリセット
      setName("");
      setEmail("");
      setMessage("");
      alert('お問い合わせを受け付けました。');
      
    } catch (error) {
      console.error('Error:', error);
      alert('送信に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact-section"
      className="relative py-20 sm:py-28 overflow-hidden scroll-mt-20"
      style={{
        background: theme === 'dark'
          ? 'linear-gradient(180deg, #0A1628 0%, #0D1B2A 100%)'
          : 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)'
      }}
    >
      <div className="container mx-auto px-4 relative z-10">
        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p 
            className="text-sm font-semibold uppercase tracking-wider mb-3"
            style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
          >
            Contact
          </p>
          <h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
            style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}
          >
            お問い合わせ
          </h2>
          <p 
            className="text-base sm:text-lg max-w-3xl mx-auto"
            style={{ color: theme === 'dark' ? '#9ca3af' : '#4a5568' }}
          >
            AIアーキテクト育成、AI駆動開発、システム開発など、<br className="hidden sm:block" />
            まずは気軽にご相談ください。
          </p>
        </motion.div>

        {/* メインコンテンツ */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
          
          {/* 左側：フォーム */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* お名前 */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold mb-2"
                  style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                >
                  お名前
                </label>
                <input
                  id="name"
                  type="text"
                  className={`
                    w-full px-4 py-3 rounded-xl
                    ${theme === 'dark'
                      ? 'bg-gray-900 border-gray-800 text-white placeholder-gray-500'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                    }
                    border focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none
                    transition-all duration-300
                  `}
                  placeholder="山田 太郎"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* メールアドレス */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold mb-2"
                  style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                >
                  メールアドレス
                </label>
                <input
                  id="email"
                  type="email"
                  className={`
                    w-full px-4 py-3 rounded-xl
                    ${theme === 'dark'
                      ? 'bg-gray-900 border-gray-800 text-white placeholder-gray-500'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                    }
                    border focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none
                    transition-all duration-300
                  `}
                  placeholder="example@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* お問い合わせ内容 */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-semibold mb-2"
                  style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                >
                  お問い合わせ内容
                </label>
                <textarea
                  id="message"
                  className={`
                    w-full px-4 py-3 rounded-xl resize-none
                    ${theme === 'dark'
                      ? 'bg-gray-900 border-gray-800 text-white placeholder-gray-500'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                    }
                    border focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none
                    transition-all duration-300
                  `}
                  rows={6}
                  placeholder="お問い合わせ内容をご記入ください"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                ></textarea>
              </div>

              {/* 送信ボタン */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className={`
                  w-full px-8 py-4 rounded-full font-bold text-base sm:text-lg
                  bg-gradient-to-r from-cyan-500 to-blue-600 text-white
                  shadow-lg shadow-cyan-500/40
                  hover:scale-105 transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? '送信中...' : '送信する'}
              </motion.button>
            </form>
          </motion.div>

          {/* 右側：その他の連絡方法 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            {/* LINE相談 */}
            <div 
              className={`
                rounded-3xl p-8 shadow-xl
                ${theme === 'dark'
                  ? 'bg-gray-900/50 border border-gray-800'
                  : 'bg-white border border-gray-200'
                }
              `}
            >
              <div className="flex items-start mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 5.94 2 10.82c0 2.99 1.91 5.65 4.86 7.23-.12.52-.78 3.37-.9 3.91-.14.66.24.65.51.47.21-.14 3.38-2.24 4.31-2.86C11.5 19.73 12.74 20 14 20c5.52 0 10-3.94 10-8.82S19.52 2 12 2z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 
                    className="text-xl font-bold mb-2"
                    style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}
                  >
                    LINE無料相談
                  </h3>
                  <p 
                    className="text-sm mb-4"
                    style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                  >
                    最も早くご返信できます。<br />
                    お気軽にご相談ください。
                  </p>
                  <Link
                    href="https://lin.ee/s5dmFuD"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-full font-bold text-sm
                               bg-green-500 text-white hover:bg-green-600
                               transition-all duration-300 hover:scale-105"
                  >
                    <span className="mr-2">LINEで相談</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* 電話相談 */}
            <div 
              className={`
                rounded-3xl p-8 shadow-xl
                ${theme === 'dark'
                  ? 'bg-gray-900/50 border border-gray-800'
                  : 'bg-white border border-gray-200'
                }
              `}
            >
              <div className="flex items-start mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 
                    className="text-xl font-bold mb-2"
                    style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}
                  >
                    お電話でのお問い合わせ
                  </h3>
                  <p 
                    className="text-sm mb-2"
                    style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                  >
                    平日 9:00 - 18:00
                  </p>
                  <a
                    href="tel:0120407638"
                    className="text-2xl font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    0120-407-638
                  </a>
                </div>
              </div>
            </div>

            {/* 資料請求 */}
            <div 
              className={`
                rounded-3xl p-8 shadow-xl
                ${theme === 'dark'
                  ? 'bg-gray-900/50 border border-gray-800'
                  : 'bg-white border border-gray-200'
                }
              `}
            >
              <div className="flex items-start mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 
                    className="text-xl font-bold mb-2"
                    style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}
                  >
                    資料請求
                  </h3>
                  <p 
                    className="text-sm mb-4"
                    style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                  >
                    サービス資料を無料でお送りします。<br />
                    助成金活用ガイドも同梱。
                  </p>
                  <Link
                    href="https://nands.tech/dm-form"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-full font-bold text-sm
                               bg-gradient-to-r from-purple-500 to-indigo-600 text-white
                               shadow-lg shadow-purple-500/40
                               hover:scale-105 transition-all duration-300"
                  >
                    <span className="mr-2">資料請求</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
