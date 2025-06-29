"use client";

import React, { useState } from 'react';

export default function MCPContactSection() {
  // フォーム状態管理
  const [formData, setFormData] = useState({
    company: '',
    name: '',
    email: '',
    phone: '',
    service: '',
    systemScale: '',
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
        message: `【MCPサーバー開発のお問い合わせ】
会社名: ${formData.company}
電話番号: ${formData.phone}
ご興味のあるサービス: ${formData.service}
システム規模: ${formData.systemScale}
ご予算感: ${formData.budget}
お問い合わせ内容: ${formData.message}`,
        page: 'MCPサーバー開発'
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
        systemScale: '',
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
        {/* セクションヘッダー */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            お問い合わせ
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            MCPサーバー開発に関するご相談やお見積もりのご依頼は、お気軽にお問い合わせください
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* 左側：お問い合わせフォーム */}
          <div className="bg-white border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              MCPサーバー開発のご相談
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="株式会社○○"
                  />
                </div>
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
                    placeholder="山田 太郎"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="example@company.com"
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
                    className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="03-1234-5678"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                  ご興味のあるサービス <span className="text-red-500">*</span>
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
                  <option value="custom-mcp">カスタムMCPサーバー開発</option>
                  <option value="database-integration">データベース統合MCP</option>
                  <option value="api-integration">API統合MCPサーバー</option>
                  <option value="filesystem-mcp">ファイルシステムMCP</option>
                  <option value="monitoring-mcp">監視・ログMCPサーバー</option>
                  <option value="security-mcp">セキュリティMCPサーバー</option>
                  <option value="migration">既存システム移行</option>
                  <option value="consultation">まずは相談したい</option>
                </select>
              </div>

              <div>
                <label htmlFor="system-scale" className="block text-sm font-medium text-gray-700 mb-2">
                  システム規模
                </label>
                <select
                  id="system-scale"
                  name="systemScale"
                  value={formData.systemScale}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">選択してください</option>
                  <option value="small">小規模（〜100ユーザー）</option>
                  <option value="medium">中規模（100〜1,000ユーザー）</option>
                  <option value="large">大規模（1,000ユーザー〜）</option>
                  <option value="enterprise">エンタープライズ（複数システム連携）</option>
                  <option value="undecided">未定</option>
                </select>
              </div>

              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                  ご予算感
                </label>
                <select
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">選択してください</option>
                  <option value="under-300">300万円未満</option>
                  <option value="300-500">300万円〜500万円</option>
                  <option value="500-1000">500万円〜1000万円</option>
                  <option value="1000-3000">1000万円〜3000万円</option>
                  <option value="over-3000">3000万円以上</option>
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
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="現在の課題や実現したいシステム連携についてお聞かせください。&#10;&#10;例：&#10;・複数のAPIとAIシステムを連携したい&#10;・既存システムをMCPで統合したい&#10;・リアルタイムデータ処理基盤を構築したい&#10;・セキュアなシステム間通信を実現したい&#10;など"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                お問い合わせを送信
              </button>
            </form>
          </div>

          {/* 右側：お問い合わせ情報 */}
          <div className="space-y-8">
            {/* 会社情報 */}
            <div className="bg-white border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                株式会社エヌアンドエス
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <div className="font-medium text-gray-900">本社所在地</div>
                    <div className="text-gray-600">〒520-0025<br />滋賀県大津市皇子が丘２丁目10−25−3004号<br />株式会社エヌアンドエス</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <div className="font-medium text-gray-900">電話番号</div>
                    <div className="text-gray-600">0120-558-551</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <div className="font-medium text-gray-900">メールアドレス</div>
                    <div className="text-gray-600">contact@nands.tech</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="font-medium text-gray-900">営業時間</div>
                    <div className="text-gray-600">平日 9:00〜18:00<br />（土日祝日除く）</div>
                  </div>
                </div>
              </div>
            </div>

            {/* お問い合わせの流れ */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                お問い合わせの流れ
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0 mt-1">
                    1
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">お問い合わせ</div>
                    <div className="text-sm text-gray-600">フォームからご要件をお聞かせください</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0 mt-1">
                    2
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">要件ヒアリング</div>
                    <div className="text-sm text-gray-600">システム要件と技術仕様を詳しく確認</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0 mt-1">
                    3
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">提案・見積もり</div>
                    <div className="text-sm text-gray-600">最適なMCPソリューションをご提案</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0 mt-1">
                    4
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">開発・導入</div>
                    <div className="text-sm text-gray-600">設計から運用開始まで一貫サポート</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 技術的優位性 */}
            <div className="bg-white border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                選ばれる理由
              </h3>
              
              <ul className="space-y-3">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">最新MCPプロトコルの豊富な実装経験</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">エンタープライズレベルのセキュリティ対応</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">業界特化のカスタマイズ開発力</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">運用開始後の継続的サポート体制</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 