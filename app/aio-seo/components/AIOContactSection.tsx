"use client";

import React, { useState } from 'react'

const AIOContactSection = () => {
  // フォーム状態管理
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    website: '',
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
        message: `【AIO対策・レリバンスエンジニアリングのお問い合わせ】
会社名: ${formData.company}
サイトURL: ${formData.website}
ご希望のサービス: ${formData.service}
ご予算: ${formData.budget}
相談内容: ${formData.message}`,
        page: 'AIO対策'
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
        name: '',
        company: '',
        email: '',
        website: '',
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
    <section id="consultation-section" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            AIO対策・レリバンスエンジニアリング
            <span className="block text-blue-600">無料相談・お見積もり</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            まずは無料のAIO診断から始めませんか？<br />
            現在のサイト状況を分析し、最適な改善提案をご提供いたします。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-gray-50 border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              お問い合わせフォーム
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  お名前 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  会社名
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

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
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                  サイトURL
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                  ご希望のサービス <span className="text-red-500">*</span>
                </label>
                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">選択してください</option>
                  <option value="free-diagnosis">無料AIO診断</option>
                  <option value="basic-plan">ベーシックプラン</option>
                  <option value="standard-plan">スタンダードプラン</option>
                  <option value="enterprise-plan">エンタープライズプラン</option>
                  <option value="consulting">AIO対策コンサルティング</option>
                  <option value="emergency">緊急AIO対策</option>
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
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">選択してください</option>
                  <option value="under-30">30万円未満</option>
                  <option value="30-60">30万円〜60万円</option>
                  <option value="60-120">60万円〜120万円</option>
                  <option value="120-300">120万円〜300万円</option>
                  <option value="over-300">300万円以上</option>
                  <option value="undecided">未定</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  ご相談内容・ご質問
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="現在のサイトの課題や、AIO対策で実現したい目標などをお聞かせください"
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-4 px-6 font-bold border border-gray-200 hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                無料相談を申し込む
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Details */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border border-gray-200 p-8">
              <h3 className="text-2xl font-bold mb-6">お問い合わせ先</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <svg className="w-6 h-6 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <div className="font-semibold">メールアドレス</div>
                    <div className="text-blue-100">contact@nands.tech</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="font-semibold">営業時間</div>
                    <div className="text-blue-100">平日 9:00 - 18:00</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="font-semibold">対応エリア</div>
                    <div className="text-blue-100">全国対応（オンライン）</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Why Choose Us */}
            <div className="bg-gray-50 border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                なぜエヌアンドエスが選ばれるのか
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="font-semibold text-gray-900">Mike King理論の完全実装</div>
                    <div className="text-gray-600 text-sm">iPullRank社の最新理論を日本で初めて完全実装</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <div>
                    <div className="font-semibold text-gray-900">実証済みの成果</div>
                    <div className="text-gray-600 text-sm">平均185%のオーガニック流入増加実績</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <div>
                    <div className="font-semibold text-gray-900">複数AI検索エンジン対応</div>
                    <div className="text-gray-600 text-sm">Google AI Mode、ChatGPT、Perplexityすべてに対応</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                  </svg>
                  <div>
                    <div className="font-semibold text-gray-900">継続的サポート</div>
                    <div className="text-gray-600 text-sm">導入後も継続的な監視・改善でROIを最大化</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AIOContactSection 