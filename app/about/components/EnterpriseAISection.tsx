import React from 'react';

export default function EnterpriseAISection() {
  return (
    <>
      <section id="enterprise-ai" className="relative py-24 bg-gradient-to-br from-gray-900 via-slate-900 to-black overflow-hidden">
        {/* SSG対応のシンプル背景 */}
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.3px] z-10"></div>
        
        <div className="relative z-20 container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-cyan-300 mb-4">
              Enterprise AI Solutions
            </h2>
          </div>

          {/* 3つのソリューション */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="bg-black/40 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-8 hover:border-cyan-400/40 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center text-black font-bold text-lg mr-4">01</div>
                <h3 className="text-xl font-bold text-cyan-300">AI導入コンサルティング</h3>
              </div>
              <p className="text-cyan-100 leading-relaxed mb-6">
                企業の課題やニーズに合わせた最適なAIソリューションを提案。導入から運用まで一貫してサポートします。
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-cyan-200 text-sm leading-relaxed">AI活用戦略の策定</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-cyan-200 text-sm leading-relaxed">業務プロセスの分析・改善</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-cyan-200 text-sm leading-relaxed">ROI評価とコスト最適化</span>
                </li>
              </ul>
            </div>

            <div className="bg-black/40 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-8 hover:border-cyan-400/40 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center text-black font-bold text-lg mr-4">02</div>
                <h3 className="text-xl font-bold text-cyan-300">企業向けAI研修プログラム</h3>
              </div>
              <p className="text-cyan-100 leading-relaxed mb-6">
                経営層から実務者まで、役職や目的に応じたカスタマイズ可能な研修プログラムを提供します。
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-cyan-200 text-sm leading-relaxed">経営者向けAI戦略研修</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-cyan-200 text-sm leading-relaxed">実務者向けAIツール活用研修</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-cyan-200 text-sm leading-relaxed">開発者向け技術研修</span>
                </li>
              </ul>
            </div>

            <div className="bg-black/40 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-8 hover:border-cyan-400/40 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center text-black font-bold text-lg mr-4">03</div>
                <h3 className="text-xl font-bold text-cyan-300">AI組織構築支援</h3>
              </div>
              <p className="text-cyan-100 leading-relaxed mb-6">
                社内のAI活用を推進する組織づくりから、必要な人材の育成・採用までトータルでサポート。
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-cyan-200 text-sm leading-relaxed">AI人材の採用支援</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-cyan-200 text-sm leading-relaxed">組織体制の設計</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-cyan-200 text-sm leading-relaxed">社内AI活用推進体制の構築</span>
                </li>
              </ul>
            </div>
          </div>

          {/* サマリーセクション */}
          <div className="bg-black/40 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-cyan-300 mb-4">
                Enterprise AI Solutions
              </h2>
            </div>
            
            <div className="text-center max-w-4xl mx-auto">
              <p className="text-lg text-cyan-100 leading-relaxed mb-8">
                急速に進化するAI技術を企業の競争力向上に活用するため、戦略立案から実装、運用まで包括的にサポートします。
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-black/30 border border-cyan-400/30 rounded-lg p-6 hover:border-cyan-400/50 transition-colors">
                  <h4 className="text-lg font-bold text-cyan-300 mb-3">戦略立案</h4>
                  <p className="text-cyan-200 text-sm leading-relaxed">
                    企業の現状分析から最適なAI活用戦略を策定
                  </p>
                </div>
                <div className="bg-black/30 border border-cyan-400/30 rounded-lg p-6 hover:border-cyan-400/50 transition-colors">
                  <h4 className="text-lg font-bold text-cyan-300 mb-3">実装支援</h4>
                  <p className="text-cyan-200 text-sm leading-relaxed">
                    技術選定から導入まで実践的にサポート
                  </p>
                </div>
                <div className="bg-black/30 border border-cyan-400/30 rounded-lg p-6 hover:border-cyan-400/50 transition-colors">
                  <h4 className="text-lg font-bold text-cyan-300 mb-3">運用最適化</h4>
                  <p className="text-cyan-200 text-sm leading-relaxed">
                    継続的な改善と効果測定でROIを最大化
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 