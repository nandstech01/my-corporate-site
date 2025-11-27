'use client';

import React from 'react';

const DmNandsPage: React.FC = () => {
  return (
    <div className="min-h-screen relative overflow-hidden font-sans text-slate-900 bg-white fixed inset-0 z-[9999] overflow-y-auto">
      {/* 背景装飾 - 下に行くほど鮮やかになるNANDSカラー */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-[#38bdf8] to-[#0284c7] opacity-90"></div>
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-[#0369a1]/40 rounded-full blur-[120px] mix-blend-multiply animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#075985]/40 rounded-full blur-[120px] mix-blend-multiply animate-pulse-slow delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto pb-24 sm:pb-32">
        {/* メインバナー画像エリア - 最前面に配置 */}
        <div className="relative w-full z-[100]">
          <img 
            src="/images/Gemini_Generated_Image_3awfpt3awfpt3awf (1).png" 
            alt="本気で収入を上げたいあなたへ" 
            className="w-full h-auto object-cover shadow-md relative z-[100]"
          />
          {/* 画像と背景を馴染ませるグラデーションフェード */}
          <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-t from-white via-white/60 to-transparent pointer-events-none z-[90]"></div>
        </div>

        {/* コンテンツエリア */}
        <div className="px-4 sm:px-6 lg:px-8 relative z-40 mt-6">
          {/* リストセクション */}
          <div className="space-y-1 mb-8">
            {[
              "収入を増やしたい方",
              "本業を続けつつ副業で稼ぎたい方",
              "明確なキャリアチェンジを考えている方",
              "AIやデジタル分野で新たな可能性を探りたい方",
              "自分のスキルで市場価値を上げたい方",
              "将来性のある新しい職種に挑戦したい方",
              "自分のペースで学びながらキャリアを築きたい方",
              "現場仕事から次のステージに進みたい方",
              "時間や体力に依存する働き方から抜け出したい方",
            ].map((text, index) => (
              <div 
                key={index}
                className="flex items-center justify-start px-4 py-3 border-2 border-cyan-200/60 rounded-lg hover:border-cyan-400 hover:bg-cyan-50/30 transition-all duration-200"
              >
                <p className="text-[15px] xs:text-base sm:text-lg md:text-xl text-white font-bold tracking-tight text-left whitespace-nowrap overflow-hidden text-ellipsis w-full" style={{ 
                  textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, -2px 0 0 #000, 2px 0 0 #000, 0 -2px 0 #000, 0 2px 0 #000'
                }}>
                  {text}
                </p>
              </div>
            ))}
          </div>

          {/* CTAボタン - 極めたデザイン */}
          <div className="sticky bottom-6 z-50 sm:static text-center pb-4 sm:pb-0">
            <a
              href="https://lin.ee/RFuVg33"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full max-w-3xl mx-auto group"
            >
              <div className="relative animate-bounce-slow">
                <button className="relative w-full bg-gradient-to-b from-[#059669] via-[#047857] to-[#065f46] hover:from-[#10b981] hover:via-[#059669] hover:to-[#047857] font-black py-4 sm:py-5 px-6 sm:px-10 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(251,191,36,0.5),inset_0_-8px_20px_rgba(0,0,0,0.3)] transform group-hover:translate-y-[-4px] group-hover:shadow-[0_25px_70px_-10px_rgba(251,191,36,0.7),inset_0_-8px_20px_rgba(0,0,0,0.3)] transition-all duration-300 border-[3px] border-amber-400 overflow-hidden animate-pulse-border">
                  
                  {/* 上部の強いハイライト（立体感） */}
                  <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/30 via-white/10 to-transparent rounded-t-[2rem]"></div>
                  
                  {/* 下部の影（立体感） */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-black/40 to-transparent rounded-b-[2rem]"></div>
                  
                  {/* キラキラ効果（左から右へ） - 常時アニメーション */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shine-continuous"></div>
                  
                  <div className="relative flex items-center justify-center">
                    {/* メインテキスト - ゴールドグラデーション */}
                    <span className="text-sm sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-300 to-yellow-200 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] whitespace-nowrap" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                      月120万円を目指す人のロードマップを受け取る
                    </span>
                  </div>
                </button>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DmNandsPage;