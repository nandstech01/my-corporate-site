import React from 'react';

export default function BusinessSection() {
  return (
    <>
      <section id="business" className="relative py-24 bg-gradient-to-br from-gray-900 via-slate-900 to-black overflow-hidden">
        {/* SSG対応のシンプル背景 */}
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.3px] z-10"></div>
        
        <div className="relative z-20 container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-cyan-300 mb-4">
              Business
            </h2>
          </div>

          <div className="space-y-20">
            {/* キャリア変革支援事業 */}
            <div className="bg-black/40 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-8 md:p-12">
              <h3 className="text-2xl lg:text-4xl font-bold text-cyan-300 mb-12 text-center">
                キャリア変革支援事業
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="relative">
                  <div className="bg-black/30 border border-cyan-400/30 rounded-xl p-8 hover:border-cyan-400/50 transition-all duration-300 group">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 flex items-center justify-center text-white font-bold text-lg mr-4">01</div>
                      <h4 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                        生成AI活用リスキリング研修
                      </h4>
                    </div>
                    <p className="text-cyan-100 leading-relaxed">
                      最新のAI技術を活用したスキル開発支援を提供。実践的なプログラムで次世代のキャリアを後押しします。
                    </p>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="bg-black/30 border border-cyan-400/30 rounded-xl p-8 hover:border-cyan-400/50 transition-all duration-300 group">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 flex items-center justify-center text-white font-bold text-lg mr-4">02</div>
                      <h4 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                        キャリアコンサルティング
                      </h4>
                    </div>
                    <p className="text-cyan-100 leading-relaxed">
                      一人ひとりの経験とスキルを活かしたオーダーメイドのキャリア支援を提供します。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* キャリアサポート事業 */}
            <div className="bg-black/40 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-8 md:p-12">
              <h3 className="text-2xl lg:text-4xl font-bold text-cyan-300 mb-12 text-center">
                キャリアサポート事業
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="relative">
                  <div className="bg-black/30 border border-cyan-400/30 rounded-xl p-8 hover:border-cyan-400/50 transition-all duration-300 group">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-cyan-500 flex items-center justify-center text-white font-bold text-lg mr-4">01</div>
                      <h4 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                        退職支援事業「退職あんしん代行」
                      </h4>
                    </div>
                    <p className="text-cyan-100 leading-relaxed">
                      より良い環境での再スタートをサポート。安心・確実な退職プロセスを提供し、新たなキャリアへの第一歩を支援します。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 大切にしていること */}
          <div className="mt-20 bg-black/40 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-8 md:p-12 text-center">
            <h3 className="text-2xl lg:text-3xl font-bold text-cyan-300 mb-8">
              私たちが大切にしていること
            </h3>
            <p className="text-lg text-cyan-100 leading-relaxed max-w-4xl mx-auto">
              すべての事業において、私たちは「一人ひとりに寄り添う」ことを最も大切にしています。
              お客様の人生の重要な転機に関わらせていただく責任を深く理解し、
              最後まで責任を持ってサポートすることをお約束いたします。
            </p>
          </div>
        </div>
      </section>
    </>
  );
} 