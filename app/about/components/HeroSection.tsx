import React from 'react';
import dynamic from 'next/dynamic';

// Galaxy背景をLazy Load（ai-siteと同様）
const Galaxy = dynamic(() => import('@/components/lp/Galaxy'), { ssr: false });

export default function HeroSection() {
  return (
    <>
      {/* Fragment ID for Entity Map - Hidden from users */}
      <div id="hero" style={{ display: 'none' }} aria-hidden="true" />
      
      {/* メインビジュアル - ai-site風ブラック×シアン統一 */}
      <section className="relative h-[calc(100vh-8rem)] bg-gradient-to-br from-gray-900 via-slate-900 to-black overflow-hidden">
        {/* Galaxy 3D背景（ai-siteと完全同一設定） */}
        <div className="absolute inset-0 z-0">
          <Galaxy
            mouseRepulsion
            mouseInteraction
            density={1.0}
            glowIntensity={0.3}
            saturation={0.0}
            hueShift={190}
            twinkleIntensity={0.2}
            rotationSpeed={0.03}
            transparent
            loading="lazy"
          />
        </div>

        {/* 3D深度効果強化 */}
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.3px] z-10"></div>
        
        <div className="relative z-20 h-full flex items-start justify-center text-white pt-16">
          <div className="text-center max-w-5xl px-4">
            {/* トップバッジ */}
            <div className="mb-8 lg:mb-12">
              <span className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm lg:text-base text-white font-medium">
                株式会社エヌアンドエス — 会社概要
              </span>
            </div>
            
            {/* メインタイトル（シアングラデーション） */}
            <h1 className="mb-8 lg:mb-12 leading-tight">
              <span 
                className="bg-gradient-to-r bg-clip-text text-transparent font-bold text-6xl md:text-9xl block"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #00FFFF, #40E0D0, #00E5FF, #00CED1, #00FFFF)',
                  backgroundSize: '400% 100%'
                }}
              >
                NANDS
              </span>
            </h1>
            
            {/* サブタイトル */}
            <h2 className="text-2xl md:text-4xl font-medium mb-4 text-cyan-200">
              Business Concept
            </h2>
            
            {/* 企業理念 */}
            <h3 className="text-xl md:text-2xl mb-6 text-slate-200 leading-relaxed">
              全ての働く人を次のステージへ
            </h3>
            
            {/* 技術バッジ（ai-site風） - スマホ版2段表示 */}
            <div className="mb-4">
              <div className="text-xs sm:text-sm tracking-wider text-slate-300/90 uppercase mb-3">AI技術で働く人の次のステージを支援</div>
              
              {/* PC版：1段表示 */}
              <div className="hidden sm:flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full border border-cyan-400/40 bg-cyan-500/10 text-cyan-200 text-xs sm:text-sm font-semibold">レリバンスエンジニアリング</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full border border-cyan-400/40 bg-cyan-500/10 text-cyan-200 text-xs sm:text-sm font-semibold">AI検索最適化</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full border border-cyan-400/40 bg-cyan-500/10 text-cyan-200 text-xs sm:text-sm font-semibold">Mike King理論</span>
              </div>
              
              {/* スマホ版：2段表示 */}
              <div className="sm:hidden flex flex-col items-center justify-center gap-2">
                <div className="flex justify-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full border border-cyan-400/40 bg-cyan-500/10 text-cyan-200 text-xs font-semibold">レリバンスエンジニアリング</span>
                </div>
                <div className="flex justify-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full border border-cyan-400/40 bg-cyan-500/10 text-cyan-200 text-xs font-semibold">AI検索最適化</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full border border-cyan-400/40 bg-cyan-500/10 text-cyan-200 text-xs font-semibold">Mike King理論</span>
                </div>
              </div>
            </div>
            
            {/* 企業メッセージ - スマホ版2段表示 */}
            <div className="inline-flex flex-col items-center px-8 py-4 bg-white/5 backdrop-blur-sm border border-cyan-400/20 rounded-2xl text-base text-cyan-100 font-medium max-w-2xl">
              {/* PC版：1段表示 */}
              <div className="hidden sm:block">
                2008年設立 | 全国対応 | AI時代のキャリア革新企業
              </div>
              
              {/* スマホ版：2段表示・中央揃え */}
              <div className="sm:hidden text-center">
                <div className="mb-1">2008年設立 | 全国対応</div>
                <div>AI時代のキャリア革新企業</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 