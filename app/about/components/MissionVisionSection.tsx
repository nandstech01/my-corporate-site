import React from 'react';

export default function MissionVisionSection() {
  return (
    <>
      <section id="mission-vision" className="relative py-24 bg-gradient-to-br from-gray-900 via-slate-900 to-black overflow-hidden">
        {/* SSG対応のシンプル背景 */}
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.3px] z-10"></div>
        
        <div className="relative z-20 container mx-auto px-4 max-w-6xl">
          {/* Mission セクション */}
          <div className="mb-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-cyan-300 mb-4">
                Mission
              </h2>
            </div>
            
            <div className="bg-black/40 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-8 md:p-12">
              <div className="text-center max-w-4xl mx-auto">
                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-8 leading-relaxed">
                  働く人々の可能性を解放し、キャリアの新たな地平を切り拓く
                </h3>
                
                <p className="text-lg text-cyan-100 leading-relaxed mb-8">
                  私たちは、テクノロジーの力と人々の潜在能力を結びつけ、一人ひとりが望むキャリアを実現できる社会を創造します。
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 mt-12">
                  <div className="bg-black/30 border border-cyan-400/30 rounded-lg p-6 hover:border-cyan-400/50 transition-colors">
                    <p className="text-cyan-200 text-sm font-medium leading-relaxed">
                      最新技術を活用した実践的なスキル開発支援
                    </p>
                  </div>
                  <div className="bg-black/30 border border-cyan-400/30 rounded-lg p-6 hover:border-cyan-400/50 transition-colors">
                    <p className="text-cyan-200 text-sm font-medium leading-relaxed">
                      個々のニーズに寄り添った丁寧なキャリア支援
                    </p>
                  </div>
                  <div className="bg-black/30 border border-cyan-400/30 rounded-lg p-6 hover:border-cyan-400/50 transition-colors">
                    <p className="text-cyan-200 text-sm font-medium leading-relaxed">
                      安心・確実な転職・退職プロセスのサポート
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vision セクション */}
          <div>
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-cyan-300 mb-4">
                Vision
              </h2>
            </div>
            
            <div className="bg-black/40 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-8 md:p-12">
              <div className="text-center max-w-4xl mx-auto">
                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-8 leading-relaxed">
                  2030年、日本の働き方を革新するリーディングカンパニーへ
                </h3>
                
                <p className="text-lg text-cyan-100 leading-relaxed mb-12">
                  変化の激しい時代において、私たちは以下の目標を掲げ、日本の働き方改革を推進します：
                </p>
                
                <div className="space-y-8">
                  <div className="bg-black/30 border border-cyan-400/30 rounded-xl p-8 text-left hover:border-cyan-400/50 transition-colors">
                    <h4 className="text-xl font-bold text-cyan-300 mb-3">キャリア革新</h4>
                    <p className="text-cyan-100 leading-relaxed">
                      働く人々のキャリアトランスフォーメーションと成長支援を実現
                    </p>
                  </div>
                  
                  <div className="bg-black/30 border border-cyan-400/30 rounded-xl p-8 text-left hover:border-cyan-400/50 transition-colors">
                    <h4 className="text-xl font-bold text-green-400 mb-3">企業変革</h4>
                    <p className="text-cyan-100 leading-relaxed">
                      企業のデジタルトランスフォーメーションとAI活用推進を支援
                    </p>
                  </div>
                  
                  <div className="bg-black/30 border border-cyan-400/30 rounded-xl p-8 text-left hover:border-cyan-400/50 transition-colors">
                    <h4 className="text-xl font-bold text-purple-400 mb-3">社会貢献</h4>
                    <p className="text-cyan-100 leading-relaxed">
                      日本のAIリテラシー向上を通じた、グローバル競争力の強化
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 