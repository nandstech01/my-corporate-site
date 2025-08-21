import React from 'react';

export default function HistoryAccessSection() {
  return (
    <>
      <section id="history-access" className="relative py-24 bg-gradient-to-br from-gray-900 via-slate-900 to-black overflow-hidden">
        {/* SSG対応のシンプル背景 */}
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.3px] z-10"></div>
        
        <div className="relative z-20 container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-cyan-300 mb-4">
              History & Access
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* 企業沿革 */}
            <div className="bg-black/40 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-8">
              <h3 className="text-2xl lg:text-3xl font-bold text-cyan-300 mb-8 text-center">
                企業沿革
              </h3>
              
              <div className="space-y-6">
                <div className="border-l-4 border-cyan-400 pl-6">
                  <h4 className="text-lg font-bold text-cyan-300 mb-2">2008年4月</h4>
                  <p className="text-cyan-100 leading-relaxed">
                    株式会社エヌアンドエス設立<br/>
                    代表取締役 原田賢治 就任
                  </p>
                </div>
                
                <div className="border-l-4 border-green-400 pl-6">
                  <h4 className="text-lg font-bold text-green-400 mb-2">2020年</h4>
                  <p className="text-cyan-100 leading-relaxed">
                    働き方改革支援事業の本格展開<br/>
                    キャリアコンサルティング事業開始
                  </p>
                </div>
                
                <div className="border-l-4 border-purple-400 pl-6">
                  <h4 className="text-lg font-bold text-purple-400 mb-2">2023年</h4>
                  <p className="text-cyan-100 leading-relaxed">
                    生成AI活用リスキリング研修開始<br/>
                    AI時代のキャリア支援へ本格参入
                  </p>
                </div>
                
                <div className="border-l-4 border-yellow-400 pl-6">
                  <h4 className="text-lg font-bold text-yellow-400 mb-2">2024年</h4>
                  <p className="text-cyan-100 leading-relaxed">
                    レリバンスエンジニアリング研修開始<br/>
                    Mike King理論の完全実装による<br/>
                    AI検索最適化コンサルティング展開
                  </p>
                </div>
              </div>
            </div>

            {/* アクセス情報 */}
            <div className="bg-black/40 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-8">
              <h3 className="text-2xl lg:text-3xl font-bold text-cyan-300 mb-8 text-center">
                アクセス
              </h3>
              
              <div className="space-y-6">
                <div className="border-l-4 border-cyan-400 pl-6">
                  <h4 className="text-lg font-bold text-cyan-300 mb-2">本社所在地</h4>
                  <p className="text-cyan-100 leading-relaxed">
                    〒520-0025<br/>
                    滋賀県大津市皇子が丘２丁目10−25−3004号
                  </p>
                </div>
                
                <div className="border-l-4 border-green-400 pl-6">
                  <h4 className="text-lg font-bold text-green-400 mb-2">東京オフィス</h4>
                  <p className="text-cyan-100 leading-relaxed">
                    東京都内（要予約）<br/>
                    ※詳細はお問い合わせください
                  </p>
                </div>
                
                <div className="border-l-4 border-purple-400 pl-6">
                  <h4 className="text-lg font-bold text-purple-400 mb-2">営業時間</h4>
                  <p className="text-cyan-100 leading-relaxed">
                    平日 9:00 - 18:00<br/>
                    ※土日祝日は事前予約制
                  </p>
                </div>
                
                <div className="border-l-4 border-yellow-400 pl-6">
                  <h4 className="text-lg font-bold text-yellow-400 mb-2">アクセス方法</h4>
                  <p className="text-cyan-100 leading-relaxed">
                    JR湖西線「大津京駅」より徒歩15分<br/>
                    ※オンライン面談・研修も対応可能
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 連絡先情報 */}
          <div className="mt-12 bg-black/40 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-8 text-center">
            <h3 className="text-2xl lg:text-3xl font-bold text-cyan-300 mb-8">
              お問い合わせ
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-black/30 border border-cyan-400/30 rounded-lg p-6">
                <h4 className="text-lg font-bold text-cyan-300 mb-3">電話</h4>
                <p className="text-cyan-100">0120-558-551</p>
              </div>
              
              <div className="bg-black/30 border border-cyan-400/30 rounded-lg p-6">
                <h4 className="text-lg font-bold text-cyan-300 mb-3">メール</h4>
                <p className="text-cyan-100">contact@nands.tech</p>
              </div>
              
              <div className="bg-black/30 border border-cyan-400/30 rounded-lg p-6">
                <h4 className="text-lg font-bold text-cyan-300 mb-3">対応地域</h4>
                <p className="text-cyan-100">全国対応</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 