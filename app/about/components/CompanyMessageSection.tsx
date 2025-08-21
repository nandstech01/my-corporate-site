import React from 'react';
import Image from 'next/image';

export default function CompanyMessageSection() {
  return (
    <>
      <section id="company-message" className="relative py-24 bg-gradient-to-br from-gray-900 via-slate-900 to-black overflow-hidden">
        {/* SSG対応のシンプル背景 */}
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.3px] z-10"></div>
        
        <div className="relative z-20 container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-cyan-300 mb-4">
              Company
            </h2>
          </div>
          
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-cyan-300 mb-4">
              Message
            </h2>
          </div>

          {/* 代表メッセージ */}
          <div className="bg-black/40 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-8 md:p-12">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h3 className="text-3xl lg:text-4xl font-bold text-white mb-8">
                  代表メッセージ
                </h3>
              </div>

              <div className="space-y-8">
                <p className="text-lg text-cyan-100 leading-relaxed">
                  2008年の設立以来、「人々の生活を豊かにするために」というビジョンのもと、多くの挑戦を重ねてまいりました。
                </p>
                
                <p className="text-lg text-cyan-100 leading-relaxed">
                  2020年以降、世界的な変革の波に対応し、これまで培ってきた経験と技術をもとに、働く人々のキャリアや生活を支援する新たなソリューションの提供を決意しました。
                </p>

                <p className="text-lg text-cyan-100 leading-relaxed">
                  その中で私たちが特に重視したのが、「本当に自分らしい働き方」を実現するための支援です。退職代行サービスを通じて、より良い環境での再スタートをサポートし、同時にスキルアップ支援を提供することで、一人ひとりが望むキャリアを実現できる環境を整えています。
                </p>

                <p className="text-lg text-cyan-100 leading-relaxed">
                  また、SNSコンサル事業では、困難な状況にある方々に寄り添い、本来受けられるべき支援を確実に受けられるようサポートしています。これは単なる手続き支援ではなく、新たな一歩を踏み出すための大切な基盤づくりだと考えています。
                </p>

                <p className="text-lg text-cyan-100 leading-relaxed">
                  さらに、システム開発事業では、技術の力で社会課題の解決に取り組んでいます。私たちの開発するシステムが、多くの人々の生活をより便利で豊かなものにできるよう、日々研鑽を積んでいます。
                </p>

                <p className="text-lg text-cyan-100 leading-relaxed">
                  そして、これらすべての事業において、私たちが大切にしているのは「寄り添い続ける」という姿勢です。一度関わった方々とは、その後も末永くお付き合いを続け、人生のさまざまなステージでサポートを提供していきたいと考えています。
                </p>

                <p className="text-lg text-cyan-100 leading-relaxed">
                  これからも、変化し続ける社会のニーズに対応しながら、一人ひとりに寄り添い、共に歩んでいく企業でありたいと思います。
                </p>
              </div>

              {/* 代表者情報 */}
              <div className="mt-16 pt-8 border-t border-cyan-400/20">
                <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
                  <div className="text-center md:text-right">
                    <p className="text-xl font-bold text-cyan-300 mb-2">原田 賢治</p>
                    <p className="text-cyan-100">株式会社エヌアンドエス</p>
                    <p className="text-cyan-100">代表取締役</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Image
                      src="/images/author/harada-kenji.jpg"
                      alt="原田賢治"
                      width={96}
                      height={96}
                      className="rounded-full border-2 border-cyan-400/50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 会社概要 */}
          <div className="mt-20 bg-black/40 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-cyan-300 mb-12 text-center">
              会社概要
            </h3>
            
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="border-l-4 border-cyan-400 pl-6">
                  <h4 className="text-lg font-bold text-cyan-300 mb-2">会社名</h4>
                  <p className="text-cyan-100">株式会社エヌアンドエス</p>
                </div>
                
                <div className="border-l-4 border-cyan-400 pl-6">
                  <h4 className="text-lg font-bold text-cyan-300 mb-2">設立</h4>
                  <p className="text-cyan-100">2008年4月</p>
                </div>
                
                <div className="border-l-4 border-cyan-400 pl-6">
                  <h4 className="text-lg font-bold text-cyan-300 mb-2">代表取締役</h4>
                  <p className="text-cyan-100">原田 賢治</p>
                </div>
                
                <div className="border-l-4 border-cyan-400 pl-6">
                  <h4 className="text-lg font-bold text-cyan-300 mb-2">所在地</h4>
                  <p className="text-cyan-100">
                    〒520-0025<br/>
                    滋賀県大津市皇子が丘２丁目10−25−3004号
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="border-l-4 border-green-400 pl-6">
                  <h4 className="text-lg font-bold text-green-400 mb-2">主要事業</h4>
                  <ul className="text-cyan-100 space-y-2">
                    <li>• 生成AI活用リスキリング研修</li>
                    <li>• キャリアコンサルティング</li>
                    <li>• 退職支援事業</li>
                    <li>• SNSコンサル事業</li>
                    <li>• システム開発事業</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-purple-400 pl-6">
                  <h4 className="text-lg font-bold text-purple-400 mb-2">連絡先</h4>
                  <p className="text-cyan-100">
                    電話：0120-558-551<br/>
                    メール：contact@nands.tech
                  </p>
                </div>
                
                <div className="border-l-4 border-yellow-400 pl-6">
                  <h4 className="text-lg font-bold text-yellow-400 mb-2">サービス地域</h4>
                  <p className="text-cyan-100">
                    全国対応<br/>
                    （オンライン研修・リモートサポート対応）
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