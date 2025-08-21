import React from 'react';

export default function RepresentativeSNSSection() {
  return (
    <>
      {/* Fragment ID for Entity Map - Hidden from users */}
      <div id="representative-linkedin" style={{ display: 'none' }} aria-hidden="true" />
      
      <section className="py-16 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              代表 LinkedIn
            </h2>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              原田賢治の専門見解・業界インサイト・経営視点での発信
            </p>
          </div>

          {/* LinkedIn Section */}
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            {/* 代表プロフィール */}
            <div className="flex items-center mb-8 pb-6 border-b border-gray-200">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mr-6 flex-shrink-0">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
              <div className="flex-grow">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  原田賢治
                </h3>
                <p className="text-gray-700 text-lg mb-1">
                  株式会社エヌアンドエス 代表取締役
                </p>
                <p className="text-blue-600 font-medium">
                  レリバンスエンジニアリング・AI検索最適化専門家
                </p>
              </div>
            </div>

            {/* 専門分野・実績 */}
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">
                専門分野・実績
              </h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <h5 className="font-semibold text-gray-900">Mike King理論実装</h5>
                      <p className="text-gray-600 text-sm">レリバンスエンジニアリング完全実装</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <h5 className="font-semibold text-gray-900">AI検索最適化</h5>
                      <p className="text-gray-600 text-sm">ChatGPT・Claude・Perplexity対応</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <h5 className="font-semibold text-gray-900">Fragment ID実装</h5>
                      <p className="text-gray-600 text-sm">145個のディープリンク管理</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <h5 className="font-semibold text-gray-900">企業DX支援</h5>
                      <p className="text-gray-600 text-sm">AI活用・業務効率化コンサルティング</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <h5 className="font-semibold text-gray-900">リスキリング研修</h5>
                      <p className="text-gray-600 text-sm">生成AI活用・プロンプトエンジニアリング</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <h5 className="font-semibold text-gray-900">関西地域AI推進</h5>
                      <p className="text-gray-600 text-sm">滋賀県拠点・関西エリア専門支援</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 代表メッセージ */}
            <div className="mb-8 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <h5 className="text-lg font-semibold text-gray-900 mb-4">
                代表からのメッセージ
              </h5>
              <div className="space-y-4 text-gray-700">
                <p className="leading-relaxed">
                  「AI検索時代において、企業の情報発信戦略は根本的な変革が求められています。
                  従来のSEOからレリバンスエンジニアリングへのシフトは、単なる技術的な変更ではなく、
                  <strong className="text-blue-600">情報の価値創造そのものの再定義</strong>なのです。」
                </p>
                <p className="leading-relaxed">
                  「Mike King理論に基づく実装は、AI検索エンジンとの対話を可能にし、
                  企業の専門性を正確に伝える架け橋となります。私たちは<strong className="text-blue-600">技術と人をつなぐ役割</strong>を担い、
                  お客様の成功を全力でサポートしています。」
                </p>
                <p className="leading-relaxed text-blue-600 font-medium">
                  「共に、AI時代の新しい価値創造に挑戦しましょう。」
                </p>
              </div>
            </div>

            {/* 最新の取り組み */}
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">
                最新の取り組み・発信内容
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-semibold text-gray-900 mb-2">AI検索最適化研究</h5>
                  <p className="text-gray-600 text-sm mb-2">ChatGPT・Claude・Perplexityでの企業引用率向上手法の研究開発</p>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">技術研究</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-semibold text-gray-900 mb-2">レリバンスエンジニアリング実装</h5>
                  <p className="text-gray-600 text-sm mb-2">Mike King理論の実践的応用・Fragment ID完全実装</p>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">実装完了</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-semibold text-gray-900 mb-2">企業向けAI研修</h5>
                  <p className="text-gray-600 text-sm mb-2">生成AI活用・プロンプトエンジニアリング研修の提供</p>
                  <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">サービス提供中</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-semibold text-gray-900 mb-2">業界ネットワーキング</h5>
                  <p className="text-gray-600 text-sm mb-2">関西地域でのAI技術推進・企業間連携促進</p>
                  <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">継続活動</span>
                </div>
              </div>
            </div>

            {/* LinkedInプロフィールCTA */}
            <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <h5 className="text-lg font-semibold text-gray-900 mb-2">
                ビジネス連携・専門的な情報交換
              </h5>
              <p className="text-blue-600 mb-6 leading-relaxed">
                AI技術・企業DX・キャリア支援に関する専門的な情報交換、<br />
                ビジネス連携のご相談をお待ちしています
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://www.linkedin.com/in/%E8%B3%A2%E6%B2%BB-%E5%8E%9F%E7%94%B0-77a4b7353/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedInでつながる
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  お問い合わせ
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 