import React from 'react';
import dynamic from 'next/dynamic';

// SSG/ISR対応：Galaxyのみdynamic import
const Galaxy = dynamic(() => import('@/components/lp/Galaxy'), { ssr: false });

export default function HistoryAccessSection() {
  // 既存の企業沿革データ（100%維持）
  const timelineItems = [
    {
      year: "2008年4月",
      title: "株式会社エヌアンドエス設立",
      description: "「時代のニーズに応じたソリューションを提供する」というビジョンのもと、企業活動をスタート"
    },
    {
      year: "2011年1月",
      title: "デジタルマーケティング事業進出",
      description: "企業のオンラインプレゼンス強化サービスを開始"
    },
    {
      year: "2014年6月",
      title: "人材育成事業本格開始",
      description: "企業内人材教育・スキルアップ支援を展開"
    },
    {
      year: "2018年11月",
      title: "転職サポート事業開始",
      description: "キャリアカウンセリングと転職支援サービスを開始"
    },
    {
      year: "2020年8月",
      title: "事業方針刷新",
      description: "「働く人のキャリアと生活を支える総合サポート企業」として事業を再定義"
    },
    {
      year: "2021年2月",
      title: "AIコンサルティング事業開始",
      description: "AI技術導入支援と業務効率化コンサルティングを展開"
    },
    {
      year: "2022年4月",
      title: "メディア・SNS事業開始",
      description: "インフルエンサーマーケット・AI×SNS運用事業"
    },
    {
      year: "2023年6月",
      title: "AI事業本部設立",
      description: "生成AI活用リスキリング研修事業を開始し、次世代のキャリア支援を本格展開"
    },
    {
      year: "2024年2月",
      title: "退職支援事業開始",
      description: "退職あんしん代行サービスをリリース。働く人の新たなスタートを全面サポート"
    }
  ];

  return (
    <>
      {/* ai-site風ブラック×シアン統一デザイン */}
      <section id="history-access" className="relative py-24 bg-gradient-to-br from-gray-900 via-slate-900 to-black overflow-hidden">
        {/* Galaxy 3D背景（ai-siteと同様） */}
        <div className="absolute inset-0 z-0">
          <Galaxy 
            mouseRepulsion 
            mouseInteraction 
            density={0.4} 
            glowIntensity={0.12} 
            saturation={0.0} 
            hueShift={190} 
            twinkleIntensity={0.06} 
            rotationSpeed={0.01} 
            transparent 
            loading="lazy" 
          />
        </div>
        
        {/* 3D深度効果 */}
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.3px] z-10"></div>
        
        <div className="relative z-20 container mx-auto px-4 max-w-6xl">
          {/* History */}
          <div className="mb-24">
            {/* History H2 */}
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-cyan-300 mb-4">
                History
              </h2>
            </div>
            
            <div className="bg-black/40 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-8 md:p-12">
              <div className="relative">
                {/* タイムライン軸 */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-400 via-cyan-500 to-transparent"></div>
                
                <div className="space-y-12">
                  {timelineItems.map((item, index) => (
                    <div key={index} className="relative flex items-start">
                      {/* タイムライン点 */}
                      <div className="absolute left-6 w-4 h-4 bg-cyan-400 rounded-full border-4 border-black z-10"></div>
                      
                      {/* 内容 */}
                      <div className="ml-20 flex-1">
                        <div className="bg-black/30 border border-cyan-400/30 rounded-xl p-6 hover:border-cyan-400/50 transition-all duration-300">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                            <h3 className="text-xl font-bold text-cyan-300 mb-2 md:mb-0">{item.title}</h3>
                            <span className="text-cyan-100 text-sm font-medium bg-cyan-400/10 px-3 py-1 rounded-full">
                              {item.year}
                            </span>
                          </div>
                          <p className="text-cyan-100 leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Access */}
          <div>
            {/* Access H2 */}
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-cyan-300 mb-4">
                Access
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12">
              {/* 本社 */}
              <div className="bg-black/40 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-cyan-300 mb-8">
                  本社
                </h3>
                
                <div className="space-y-6">
                  <div className="border-l-4 border-cyan-400 pl-6">
                    <h4 className="text-lg font-bold text-cyan-300 mb-2">住所</h4>
                    <p className="text-cyan-100 leading-relaxed">
                      〒520-0802<br/>
                      滋賀県大津市馬場2丁目12-61<br/>
                      大津祭曳山展示館3F
                    </p>
                  </div>
                  <div className="border-l-4 border-green-400 pl-6">
                    <h4 className="text-lg font-bold text-green-400 mb-2">アクセス</h4>
                    <p className="text-cyan-100 leading-relaxed">
                      JR東海道本線「大津駅」徒歩8分<br/>
                      京阪石山坂本線「島ノ関駅」徒歩5分<br/>
                      名神高速道路「大津IC」車で10分
                    </p>
                  </div>
                  <div className="border-l-4 border-purple-400 pl-6">
                    <h4 className="text-lg font-bold text-purple-400 mb-2">営業時間</h4>
                    <p className="text-cyan-100">
                      平日 9:00-18:00<br/>
                      土日祝日は予約制
                    </p>
                  </div>
                </div>
              </div>
              
              {/* お問い合わせ */}
              <div className="bg-black/40 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-cyan-300 mb-8">
                  お問い合わせ
                </h3>
                
                <div className="space-y-6">
                  <div className="border-l-4 border-cyan-400 pl-6">
                    <h4 className="text-lg font-bold text-cyan-300 mb-2">電話でのお問い合わせ</h4>
                    <p className="text-cyan-100 text-xl font-bold mb-2">0120-558-551</p>
                    <p className="text-cyan-200 text-sm">受付時間：平日 9:00-18:00</p>
                  </div>
                  <div className="border-l-4 border-green-400 pl-6">
                    <h4 className="text-lg font-bold text-green-400 mb-2">メールでのお問い合わせ</h4>
                    <p className="text-cyan-100 font-medium">contact@nands.tech</p>
                    <p className="text-cyan-200 text-sm">24時間受付（返信は営業時間内）</p>
                  </div>
                  <div className="border-l-4 border-purple-400 pl-6">
                    <h4 className="text-lg font-bold text-purple-400 mb-2">NANDSTECH</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="text-cyan-200 text-sm mr-2">🤖</span>
                        <span className="text-cyan-100 text-sm">AI・テクノロジー</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-cyan-200 text-sm mr-2">📈</span>
                        <span className="text-cyan-100 text-sm">マーケティング・支援</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-cyan-200 text-sm mr-2">📚</span>
                        <span className="text-cyan-100 text-sm">リスキリング・企業情報</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* お問い合わせボタン */}
                <div className="mt-8 pt-6 border-t border-cyan-400/20">
                  <p className="text-center text-cyan-100 font-medium">無料相談・お問い合わせ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 