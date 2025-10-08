import React from 'react';

/**
 * MCPContactSectionSSR.tsx
 * Mike King理論準拠: AI検索エンジン最適化
 */

export default function MCPContactSectionSSR() {
  return (
    <section id="consultation-section" className="py-20 bg-gradient-to-br from-gray-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            MCP Servers開発のご相談
          </h2>
          <p className="text-xl text-gray-600">
            Claude・AI統合用MCPサーバー開発について<br />
            無料でご相談いただけます
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* フォーム */}
          <div className="bg-white p-8 border border-gray-200 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">お問い合わせフォーム</h3>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    お名前 <span className="text-red-500">*</span>
                  </label>
                  <input type="text" id="name" name="name" required className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-green-500 transition-colors" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <input type="email" id="email" name="email" required className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-green-500 transition-colors" />
                </div>
              </div>

              <div>
                <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                  ご希望のサービス <span className="text-red-500">*</span>
                </label>
                <select id="service" name="service" required className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-green-500 transition-colors">
                  <option value="">選択してください</option>
                  <option value="mcp-development">MCP Server開発</option>
                  <option value="claude-integration">Claude統合開発</option>
                  <option value="custom-tools">カスタムツール開発</option>
                  <option value="consultation">まずは相談したい</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">お問い合わせ内容</label>
                <textarea id="message" name="message" rows={5} className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-green-500 resize-vertical transition-colors" placeholder="MCP Servers開発についてお聞かせください..." />
              </div>

              <div className="text-center">
                <button type="submit" className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white font-bold hover:from-green-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                  相談内容を送信
                </button>
              </div>
            </form>
          </div>

          {/* 右側：連絡先・実績 */}
          <div className="space-y-8">
            <div className="bg-white p-8 border border-gray-200 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6">直接お問い合わせ</h3>
              <div className="space-y-4">
                <a href="tel:+81-120-407-638" className="flex items-center text-green-600 hover:text-green-800">
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  0120-407-638
                </a>
                <a href="mailto:contact@nands.tech" className="flex items-center text-blue-600 hover:text-blue-800">
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  contact@nands.tech
                </a>
              </div>
            </div>

            <div className="bg-green-50 p-8 border border-green-200">
              <h3 className="text-xl font-bold text-green-900 mb-4">MCP開発実績</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">15+</div>
                  <div className="text-sm text-green-800">MCP Server数</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">99.9%</div>
                  <div className="text-sm text-green-800">稼働率</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">1週間</div>
                  <div className="text-sm text-green-800">開発期間</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">24/7</div>
                  <div className="text-sm text-green-800">サポート</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 