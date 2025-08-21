import React from 'react';

export default function OfficialSNSSection() {
  return (
    <>

      {/* Fragment ID for Entity Map - Hidden from users */}
      <div id="company-official-x" style={{ display: 'none' }} aria-hidden="true" />
      
      <section className="py-16 bg-gradient-to-br from-blue-50 to-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              公式SNS
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              最新のAI技術動向、サービス情報、業界インサイトを発信しています
            </p>
          </div>

          {/* X (Twitter) Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mr-4">
                <span className="text-white font-bold text-xl">𝕏</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  @NANDS_AI
                </h3>
                <p className="text-gray-600">
                  株式会社エヌアンドエス公式アカウント
                </p>
              </div>
              <div className="ml-auto">
                <a
                  href="https://x.com/NANDS_AI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-colors"
                >
                  フォローする
                </a>
              </div>
            </div>

            {/* X埋め込み投稿 */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                最新の投稿
              </h4>
              
              {/* 実際のX投稿埋め込み（SSG対応静的版） */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* 投稿1 */}
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold">
                      N
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold text-gray-900">NANDS AI</span>
                        <span className="text-gray-500">@NANDS_AI</span>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-500">Jan 20</span>
                      </div>
                      <p className="text-gray-900 mb-3 leading-relaxed">
                        AI検索エンジン最適化について最新の研究成果をまとめました。Fragment IDを活用することで、より精密な引用が可能になります。
                        <br />
                        <span className="text-blue-500">#AI最適化 #FragmentID #レリバンスエンジニアリング</span>
                      </p>
                      <a 
                        href="https://x.com/NANDS_AI" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 text-sm"
                      >
                        Xで詳細を見る →
                      </a>
                    </div>
                  </div>
                </div>

                {/* 投稿2 */}
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold">
                      N
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold text-gray-900">NANDS AI</span>
                        <span className="text-gray-500">@NANDS_AI</span>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-500">Jan 18</span>
                      </div>
                      <p className="text-gray-900 mb-3 leading-relaxed">
                        レリバンスエンジニアリング研修、多くの企業様からご好評をいただいています！Mike King理論の実践的な活用方法をお伝えしています。
                        <br />
                        <span className="text-blue-500">#レリバンスエンジニアリング #MikeKing理論 #AI研修</span>
                      </p>
                      <a 
                        href="https://x.com/NANDS_AI" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 text-sm"
                      >
                        Xで詳細を見る →
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* フォローCTA */}
              <div className="text-center mt-8 p-6 bg-blue-50 rounded-lg">
                <h5 className="text-lg font-semibold text-gray-900 mb-2">
                  最新情報をいち早くキャッチ
                </h5>
                <p className="text-gray-600 mb-4">
                  AI技術の最新動向、サービス情報、業界インサイトを毎日発信中
                </p>
                <a
                  href="https://x.com/NANDS_AI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-8 py-3 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  X でフォロー
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 