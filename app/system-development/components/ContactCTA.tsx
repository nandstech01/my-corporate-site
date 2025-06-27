import React from 'react';

const ContactCTA = () => {
  return (
    <section id="consultation-section" className="py-20 bg-gradient-to-r from-blue-600 to-cyan-600">
      <div className="container mx-auto px-4">
        <div className="text-center text-white">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6">
        システム開発のご相談
      </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
            業界最速・最安値でのAIシステム開発について<br className="hidden md:block" />
            無料でご相談いただけます
          </p>

          {/* 相談内容の例 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 border border-white/30 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">求人マッチングシステム</h3>
              <p className="text-blue-100">
                AI求人推薦・自動スクリーニング<br />
                工数90%削減を実現
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 border border-white/30 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">チャットボット</h3>
              <p className="text-blue-100">
                AI対話システム<br />
                24時間自動応答
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 border border-white/30 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15.586 13H14a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Webアプリ構築</h3>
              <p className="text-blue-100">
                フルスタック開発<br />
                React・Next.js・Python
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 border border-white/30 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">データ分析システム</h3>
              <p className="text-blue-100">
                Python・機械学習<br />
                予測分析・レポート自動化
              </p>
            </div>
          </div>

          {/* 問い合わせフォーム */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/30 p-8 mb-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-center">
              お問い合わせフォーム
            </h3>
            
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold mb-2">お名前 *</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:border-white/50 transition-colors"
                  placeholder="山田太郎"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2">会社名</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:border-white/50 transition-colors"
                  placeholder="株式会社○○"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2">メールアドレス *</label>
                <input 
                  type="email" 
                  required
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:border-white/50 transition-colors"
                  placeholder="example@company.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2">開発種別</label>
                <select className="w-full px-4 py-3 bg-white/20 border border-white/30 text-white focus:outline-none focus:border-white/50 transition-colors">
                  <option value="" className="text-gray-900">選択してください</option>
                  <option value="求人マッチング" className="text-gray-900">求人マッチングシステム</option>
                  <option value="チャットボット" className="text-gray-900">チャットボット</option>
                  <option value="Webアプリ" className="text-gray-900">Webアプリ構築</option>
                  <option value="Python分析" className="text-gray-900">Python・データ分析</option>
                  <option value="RAG" className="text-gray-900">RAGシステム</option>
                  <option value="その他" className="text-gray-900">その他</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2">予算</label>
                <select className="w-full px-4 py-3 bg-white/20 border border-white/30 text-white focus:outline-none focus:border-white/50 transition-colors">
                  <option value="" className="text-gray-900">選択してください</option>
                  <option value="50万円未満" className="text-gray-900">50万円未満</option>
                  <option value="50-100万円" className="text-gray-900">50-100万円</option>
                  <option value="100-200万円" className="text-gray-900">100-200万円</option>
                  <option value="200万円以上" className="text-gray-900">200万円以上</option>
                  <option value="要相談" className="text-gray-900">要相談</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2">ご相談内容 *</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:border-white/50 transition-colors resize-none"
                  placeholder="開発したいシステムの詳細、機能要件、希望納期などをお聞かせください"
                ></textarea>
              </div>
              
              <div className="md:col-span-2 text-center">
                <button 
                  type="submit"
                  className="px-8 py-4 bg-white text-blue-600 font-bold border border-white hover:bg-gray-100 transition-all duration-300 shadow-lg"
                >
                  送信する
                </button>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-blue-100 text-sm mb-2">
                または直接メールでお問い合わせください
              </p>
              <a 
                href="mailto:contact@nands.tech" 
                className="text-xl font-bold hover:text-yellow-300 transition-colors"
              >
                contact@nands.tech
              </a>
            </div>
          </div>

          {/* CTA ボタン */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="mailto:contact@nands.tech?subject=システム開発のご相談&body=システム開発について相談したいことがあります。%0D%0A%0D%0A【開発種別】%0D%0A求人マッチングシステム / チャットボット / Webアプリ構築 / Python・データ分析 / その他%0D%0A%0D%0A【相談内容】%0D%0A%0D%0A【希望する機能】%0D%0A%0D%0A【予算】%0D%0A%0D%0A【希望納期】%0D%0A%0D%0A【連絡先】%0D%0A"
              className="px-8 py-4 bg-white text-blue-600 font-bold border border-white hover:bg-gray-100 transition-all duration-300 shadow-lg inline-flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              メールで相談
            </a>
            
            <a
              href="#consultation-section"
              className="px-8 py-4 bg-white/20 border border-white/30 text-white font-bold hover:bg-white/30 transition-all duration-300 inline-flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              フォームで相談
            </a>
          </div>

          {/* 追加情報 */}
          <div className="mt-12 text-center">
            <p className="text-blue-100 text-lg">
              🚀 <strong>業界最速</strong>での開発 | 💰 <strong>業界最安値</strong>での提供 | 🔧 <strong>24時間</strong>サポート体制
            </p>
            <p className="text-blue-200 text-sm mt-4">
              ※ 相談は完全無料です。お気軽にお問い合わせください。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactCTA; 