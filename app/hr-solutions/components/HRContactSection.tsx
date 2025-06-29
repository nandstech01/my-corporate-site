"use client";

import React, { useState } from 'react';

export default function HRContactSection() {
  // フォーム状態管理
  const [formData, setFormData] = useState({
    company: '',
    name: '',
    email: '',
    phone: '',
    service: '',
    budget: '',
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
        message: `【人材ソリューションのお問い合わせ】
会社名: ${formData.company}
電話番号: ${formData.phone}
ご希望のサービス: ${formData.service}
ご予算: ${formData.budget}
お問い合わせ内容: ${formData.message}`,
        page: '人材ソリューション'
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
        phone: '',
        service: '',
        budget: '',
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
    <section id="contact" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* 左側：お問い合わせフォーム */}
          <div className="bg-white border border-gray-200 p-8">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              お問い合わせ
            </h2>
            <p className="text-gray-600 mb-8">
              人材ソリューションに関するご質問やご相談は、お気軽にお問い合わせください。
              専門スタッフが丁寧にサポートいたします。
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    会社名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    担当者名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    電話番号
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                  ご希望のサービス
                </label>
                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">選択してください</option>
                  <option value="job-site">求人サイト構築</option>
                  <option value="ai-matching">AIマッチングエンジン</option>
                  <option value="recommend">レコメンド機能</option>
                  <option value="document-generation">書類自動生成</option>
                  <option value="comprehensive">包括的ソリューション</option>
                  <option value="consultation">コンサルティング</option>
                  <option value="other">その他</option>
                </select>
              </div>

              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                  ご予算
                </label>
                <select
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">選択してください</option>
                  <option value="under-100">100万円未満</option>
                  <option value="100-300">100万円〜300万円</option>
                  <option value="300-500">300万円〜500万円</option>
                  <option value="500-1000">500万円〜1000万円</option>
                  <option value="over-1000">1000万円以上</option>
                  <option value="undecided">未定</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  お問い合わせ内容 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  required
                  placeholder="ご質問やご要望をお聞かせください"
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-6 font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300"
              >
                送信する
              </button>
            </form>
          </div>

          {/* 右側：会社情報・サポート情報 */}
          <div className="space-y-8">
            {/* 会社情報 */}
            <div className="bg-white border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                会社情報
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-gray-900">本社</h4>
                    <p className="text-gray-600">〒520-0025<br />滋賀県大津市皇子が丘２丁目10−25−3004号<br />株式会社エヌアンドエス</p>
                  </div>
                </div>
                

                
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-600">contact@nands.tech</span>
                </div>
                
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-600">0120-558-551</span>
                </div>
              </div>
            </div>

            {/* サポート体制 */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                サポート体制
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-gray-900">24時間以内初回回答</h4>
                    <p className="text-gray-600 text-sm">お問い合わせから24時間以内に担当者よりご連絡いたします</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-gray-900">専任エンジニア</h4>
                    <p className="text-gray-600 text-sm">AI・人材システム専門のエンジニアが直接対応いたします</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-gray-900">導入後サポート</h4>
                    <p className="text-gray-600 text-sm">システム導入後も継続的にサポートいたします</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 