'use client';

import React, { useEffect } from 'react';
import Script from 'next/script';

export default function OfficialSNSSection() {
  // Twitter widgets.js初期化
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).twttr) {
      (window as any).twttr.widgets.load();
    }
  }, []);

  return (
    <>
      {/* Twitter widgets.js読み込み */}
      <Script
        src="https://platform.twitter.com/widgets.js"
        strategy="lazyOnload"
        onLoad={() => {
          if ((window as any).twttr) {
            (window as any).twttr.widgets.load();
          }
        }}
      />

      {/* Fragment ID for Entity Map - Hidden from users */}
      <div id="company-official-x" style={{ display: 'none' }} aria-hidden="true" />
      
      <section className="py-16 bg-gradient-to-br from-blue-50 to-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              公式SNS
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              最新のAI技術動向、サービス情報、業界インサイトを発信しています
            </p>
          </div>

          {/* X (Twitter) Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mr-4">
                <span className="text-white font-bold text-xl">𝕏</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  @NANDS_AI
                </h3>
                <p className="text-gray-600">
                  株式会社エヌアンドエス公式アカウント
                </p>
              </div>
              <div className="ml-auto">
                <a
                  href="https://x.com/NANDS_AI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-colors"
                >
                  フォローする
                </a>
              </div>
            </div>

            {/* X埋め込み投稿 */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                最新の投稿
              </h4>
              
              {/* 実際のX投稿埋め込み（サンプル投稿URL） */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* 投稿1 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <blockquote className="twitter-tweet" data-theme="light" data-width="400">
                    <p lang="ja" dir="ltr">
                      AI検索エンジン最適化について最新の研究成果をまとめました。Fragment IDを活用することで、より精密な引用が可能になります。
                      <a href="https://t.co/example1">https://t.co/example1</a>
                    </p>
                    &mdash; NANDS AI (@NANDS_AI) 
                    <a href="https://x.com/NANDS_AI/status/1234567890">January 20, 2025</a>
                  </blockquote>
                </div>

                {/* 投稿2 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <blockquote className="twitter-tweet" data-theme="light" data-width="400">
                    <p lang="ja" dir="ltr">
                      レリバンスエンジニアリング研修、多くの企業様からご好評をいただいています！Mike King理論の実践的な活用方法をお伝えしています。
                      <a href="https://t.co/example2">https://t.co/example2</a>
                    </p>
                    &mdash; NANDS AI (@NANDS_AI) 
                    <a href="https://x.com/NANDS_AI/status/1234567891">January 18, 2025</a>
                  </blockquote>
                </div>
              </div>

              {/* フォローCTA */}
              <div className="text-center mt-8 p-6 bg-blue-50 rounded-lg">
                <h5 className="text-lg font-semibold text-gray-900 mb-2">
                  最新情報をいち早くキャッチ
                </h5>
                <p className="text-gray-600 mb-4">
                  AI技術の最新動向、サービス情報、業界インサイトを毎日発信中
                </p>
                <a
                  href="https://x.com/NANDS_AI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-8 py-3 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  X でフォロー
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 