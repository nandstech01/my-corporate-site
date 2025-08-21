import React from 'react';
import dynamic from 'next/dynamic';

// Galaxy背景をLazy Load（SSR安全な実装）
const Galaxy = dynamic(() => import('@/components/lp/Galaxy'), { 
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-900 to-black" />
});

export default function BusinessSection() {
  // 既存のBusiness事業内容（100%維持）
  const businessAreas = [
    {
      title: "キャリア変革支援事業",
      services: [
        {
          name: "生成AI活用リスキリング研修",
          description: "最新のAI技術を活用したスキル開発支援を提供。実践的なプログラムで次世代のキャリアを後押しします。"
        },
        {
          name: "キャリアコンサルティング", 
          description: "一人ひとりの経験とスキルを活かしたオーダーメイドのキャリア支援を提供します。"
        }
      ],
      color: "from-cyan-500 to-cyan-600"
    },
    {
      title: "キャリアサポート事業",
      services: [
        {
          name: "退職支援事業「退職あんしん代行」",
          description: "より良い環境での再スタートをサポート。安心・確実な退職プロセスを提供し、新たなキャリアへの第一歩を支援します。"
        }
      ],
      color: "from-green-400 to-cyan-500"
    }
  ];

  return (
    <>
      {/* ai-site風ブラック×シアン統一デザイン */}
      <section id="business" className="relative py-24 bg-gradient-to-br from-gray-900 via-slate-900 to-black overflow-hidden">
        {/* Galaxy 3D背景（SSR安全な実装） */}
        <div className="absolute inset-0 z-0">
          <Galaxy
            mouseRepulsion
            mouseInteraction
            density={0.6}
            glowIntensity={0.2}
            saturation={0.0}
            hueShift={190}
            twinkleIntensity={0.12}
            rotationSpeed={0.02}
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
              Business
            </h2>
          </div>
          
          <div className="space-y-20">
            {businessAreas.map((area, areaIndex) => (
              <div key={areaIndex} className="bg-black/40 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-8 md:p-12">
                <h3 className="text-2xl lg:text-4xl font-bold text-cyan-300 mb-12 text-center">
                  {area.title}
                </h3>
                
                <div className="grid md:grid-cols-2 gap-8">
                  {area.services.map((service, serviceIndex) => (
                    <div key={serviceIndex} className="relative">
                      {/* サービスカード */}
                      <div className="bg-black/30 border border-cyan-400/30 rounded-xl p-8 hover:border-cyan-400/50 transition-all duration-300 group">
                        <div className="flex items-center mb-6">
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${area.color} flex items-center justify-center text-white font-bold text-lg mr-4`}>
                            {String(serviceIndex + 1).padStart(2, '0')}
                          </div>
                          <h4 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                            {service.name}
                          </h4>
                        </div>
                        <p className="text-cyan-100 leading-relaxed">
                          {service.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* 事業概要セクション */}
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