'use client';

"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EnvelopeIcon, PhoneIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default function SNSContactSection() {
  // フォーム状態管理
  const [formData, setFormData] = useState({
    company: '',
    name: '',
    email: '',
    consultation: '',
    message: ''
  });

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxP89a1VvqlldbOXkaomiBSf_49tdd8UGVAzNBzKP7LA7rmcy1i3s9inzAVOuyYDF1jjA/exec';
      
      // 送信データの準備
      const submitData = {
        name: formData.name,
        email: formData.email,
        message: `【SNS自動化システムのお問い合わせ】
会社名: ${formData.company}
ご相談内容: ${formData.consultation}
詳細・ご要望: ${formData.message}`,
        page: 'SNS自動化システム'
      };

      // Google Apps Scriptに送信
      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      // フォームをリセット
      setFormData({
        company: '',
        name: '',
        email: '',
        consultation: '',
        message: ''
      });

      alert('お問い合わせを受け付けました。');
      
    } catch (error) {
      console.error('Error:', error);
      alert('送信に失敗しました。もう一度お試しください。');
    }
  };

  // 入力値変更処理
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  return (
    <section className="py-20 md:py-32 relative">
      {/* 背景エフェクト */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/30 to-cyan-900/20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* セクションヘッダー */}
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6"
            >
              お問い合わせ
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-lg text-gray-300 max-w-2xl mx-auto"
            >
              SNS自動化システムの導入について、お気軽にご相談ください。
              <br className="hidden md:block" />
              無料相談・デモンストレーションも承っております。
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* 連絡先情報 */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-bold text-white mb-8">連絡先情報</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center mr-4 flex-shrink-0">
                    <EnvelopeIcon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">メール</h4>
                    <p className="text-gray-300">contact@nands.tech</p>
                    <p className="text-sm text-gray-400 mt-1">24時間受付・48時間以内に返信</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center mr-4 flex-shrink-0">
                    <PhoneIcon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">電話</h4>
                    <p className="text-gray-300">077-123-4567</p>
                    <p className="text-sm text-gray-400 mt-1">平日 9:00-18:00</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center mr-4 flex-shrink-0">
                    <ChatBubbleLeftRightIcon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">オンライン相談</h4>
                    <p className="text-gray-300">Zoom・Google Meet対応</p>
                    <p className="text-sm text-gray-400 mt-1">事前予約制・無料相談可能</p>
                  </div>
                </div>
              </div>

              {/* 追加情報 */}
              <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                <h4 className="text-white font-semibold mb-3">無料サービス</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-3" />
                    現状分析・課題診断
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-3" />
                    システム要件定義
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-3" />
                    ROI試算・効果予測
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* お問い合わせフォーム */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="p-8 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 backdrop-blur-sm">
                <h3 className="text-xl font-bold text-white mb-6">お問い合わせフォーム</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      会社名 <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
                      placeholder="株式会社○○"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      お名前 <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
                      placeholder="山田 太郎"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      メールアドレス <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
                      placeholder="example@company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      ご相談内容 <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="consultation"
                      value={formData.consultation}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none transition-colors"
                    >
                      <option value="">選択してください</option>
                      <option value="sns-automation">SNS自動化システム</option>
                      <option value="api-integration">API連携開発</option>
                      <option value="multi-platform">マルチプラットフォーム管理</option>
                      <option value="custom-development">カスタム開発</option>
                      <option value="consultation">無料相談</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      詳細・ご要望
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors resize-none"
                      placeholder="現在の課題や導入したい機能について詳しくお聞かせください"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    送信する
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
