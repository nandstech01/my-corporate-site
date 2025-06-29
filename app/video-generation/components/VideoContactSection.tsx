'use client';

"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EnvelopeIcon, PhoneIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default function VideoContactSection() {
  // フォーム状態管理
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: '',
    service: '',
    message: ''
  });

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxP89a1VvqlldbOXkaomiBSf_49tdd8UGVAzNBzKP7LA7rmcy1i3s9inzAVOuyYDF1jjA/exec';
      
      // 送信データの準備
      const submitData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        message: `【AI動画生成システムのお問い合わせ】
会社名: ${formData.company}
電話番号: ${formData.phone}
ご興味のあるサービス: ${formData.service}
メッセージ: ${formData.message}`,
        page: 'AI動画生成システム'
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
        firstName: '',
        lastName: '',
        email: '',
        company: '',
        phone: '',
        service: '',
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
      <div className="container mx-auto px-4">
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
              className="text-lg text-gray-300 max-w-3xl mx-auto"
            >
              AI動画生成システムの導入について、お気軽にご相談ください。
              専門チームが最適なソリューションをご提案いたします。
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* 左側：お問い合わせフォーム */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                      お名前（姓）
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="山田"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                      お名前（名）
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="太郎"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="example@company.com"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
                    会社名
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="株式会社○○"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                    電話番号
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="03-1234-5678"
                  />
                </div>

                <div>
                  <label htmlFor="service" className="block text-sm font-medium text-gray-300 mb-2">
                    ご興味のあるサービス
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    <option value="">選択してください</option>
                    <option value="ai-video-generation">AI動画生成システム</option>
                    <option value="midjourney-integration">Midjourney連携</option>
                    <option value="veo3-integration">Veo 3連携</option>
                    <option value="custom-workflow">カスタムワークフロー</option>
                    <option value="batch-processing">バッチ処理システム</option>
                    <option value="consultation">その他・相談</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    メッセージ
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    placeholder="ご要望やご質問をお聞かせください..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 transform hover:scale-105"
                >
                  お問い合わせを送信
                </button>
              </form>
            </motion.div>

            {/* 右側：連絡先情報 */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {/* 連絡先カード */}
              <div className="p-8 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 backdrop-blur-sm">
                <h3 className="text-xl font-bold text-white mb-6">お問い合わせ方法</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center mr-4">
                      <EnvelopeIcon className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">メール</div>
                      <div className="text-white font-medium">info@nands.co.jp</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center mr-4">
                      <PhoneIcon className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">電話</div>
                      <div className="text-white font-medium">077-123-4567</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center mr-4">
                      <ChatBubbleLeftRightIcon className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">営業時間</div>
                      <div className="text-white font-medium">平日 9:00-18:00</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 特徴 */}
              <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 backdrop-blur-sm">
                <h3 className="text-xl font-bold text-purple-300 mb-4">なぜエヌアンドエスなのか？</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 mr-3 flex-shrink-0"></div>
                    最新AI技術への深い理解と豊富な実装経験
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 mr-3 flex-shrink-0"></div>
                    お客様のビジネスに最適化されたカスタムソリューション
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 mr-3 flex-shrink-0"></div>
                    導入から運用まで一貫したサポート体制
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 mr-3 flex-shrink-0"></div>
                    コスト効率と高品質を両立する技術力
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
