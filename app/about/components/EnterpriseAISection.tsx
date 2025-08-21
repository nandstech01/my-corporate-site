import React from 'react';
import dynamic from 'next/dynamic';

// SSG/ISR対応：Galaxyのみdynamic import
const Galaxy = dynamic(() => import('@/components/lp/Galaxy'), { ssr: false });

export default function EnterpriseAISection() {
  // 既存のEnterprise AI Solutions内容（100%維持）
  const aiSolutions = [
    {
      number: "01",
      title: "AI導入コンサルティング",
      description: "企業の課題やニーズに合わせた最適なAIソリューションを提案。導入から運用まで一貫してサポートします。",
      features: [
        "AI活用戦略の策定",
        "業務プロセスの分析・改善",
        "ROI評価とコスト最適化"
      ]
    },
    {
      number: "02", 
      title: "企業向けAI研修プログラム",
      description: "経営層から実務者まで、役職や目的に応じたカスタマイズ可能な研修プログラムを提供します。",
      features: [
        "経営者向けAI戦略研修",
        "実務者向けAIツール活用研修",
        "開発者向け技術研修"
      ]
    },
    {
      number: "03",
      title: "AI組織構築支援", 
      description: "社内のAI活用を推進する組織づくりから、必要な人材の育成・採用までトータルでサポート。",
      features: [
        "AI人材の採用支援",
        "組織体制の設計",
        "社内AI活用推進体制の構築"
      ]
    }
  ];

  return (
    <>
      {/* Fragment ID for Entity Map - Hidden from users */}
      <div id="enterprise-ai" style={{ display: 'none' }} aria-hidden="true" />
      
      {/* ai-site風ブラック×シアン統一デザイン */}
      <section className="relative py-24 bg-gradient-to-br from-gray-900 via-slate-900 to-black overflow-hidden">
        {/* Galaxy 3D背景（ai-siteと同様） */}
        <div className="absolute inset-0 z-0">
          <Galaxy 
            mouseRepulsion 
            mouseInteraction 
            density={0.7} 
            glowIntensity={0.25} 
            saturation={0.0} 
            hueShift={190} 
            twinkleIntensity={0.15} 
            rotationSpeed={0.025} 
            transparent 
            loading="lazy" 
          />
        </div>
        
        {/* 3D深度効果 */}
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.3px] z-10"></div>
        
        <div className="relative z-20 container mx-auto px-4 max-w-6xl">
          {/* H2タイトル */}
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-cyan-300 mb-4">
              Enterprise AI Solutions
            </h2>
          </div>
          
          {/* AI Solutions Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {aiSolutions.map((solution, index) => (
              <div key={index} className="bg-black/40 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-8 hover:border-cyan-400/40 transition-all duration-300">
                {/* ソリューション番号 */}
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center text-black font-bold text-lg mr-4">
                    {solution.number}
                  </div>
                  <h3 className="text-xl font-bold text-cyan-300">
                    {solution.title}
                  </h3>
                </div>
                
                {/* 説明 */}
                <p className="text-cyan-100 leading-relaxed mb-6">
                  {solution.description}
                </p>
                
                {/* 詳細項目 */}
                <ul className="space-y-2">
                  {solution.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-cyan-200 text-sm leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          {/* Enterprise AI概要 */}
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
                  <p className="text-cyan-200 text-sm leading-relaxed">企業の現状分析から最適なAI活用戦略を策定</p>
                </div>
                <div className="bg-black/30 border border-cyan-400/30 rounded-lg p-6 hover:border-cyan-400/50 transition-colors">
                  <h4 className="text-lg font-bold text-cyan-300 mb-3">実装支援</h4>
                  <p className="text-cyan-200 text-sm leading-relaxed">技術選定から導入まで実践的にサポート</p>
                </div>
                <div className="bg-black/30 border border-cyan-400/30 rounded-lg p-6 hover:border-cyan-400/50 transition-colors">
                  <h4 className="text-lg font-bold text-cyan-300 mb-3">運用最適化</h4>
                  <p className="text-cyan-200 text-sm leading-relaxed">継続的な改善と効果測定でROIを最大化</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 