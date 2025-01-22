'use client';

import React, { useEffect, useState } from 'react';
import { useSpring, animated } from '@react-spring/web';

export default function BuzzWordSuccessSection() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: {
      tension: 120,
      friction: 14,
    },
  });

  const cardAnimations = [
    useSpring({
      from: { opacity: 0, transform: 'translateY(40px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
      delay: 200,
      config: { tension: 120, friction: 14 },
    }),
    useSpring({
      from: { opacity: 0, transform: 'translateY(40px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
      delay: 400,
      config: { tension: 120, friction: 14 },
    }),
    useSpring({
      from: { opacity: 0, transform: 'translateY(40px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
      delay: 600,
      config: { tension: 120, friction: 14 },
    }),
  ];

  if (!isClient) {
    return null;
  }

  return (
    <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-blue-900 to-blue-400">
      {/* 装飾的な背景要素 */}
      <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px]" />
      <div className="absolute bottom-[-20%] left-[-5%] w-[300px] h-[300px] bg-white/10 rounded-full blur-[80px]" />

      <animated.div style={fadeIn} className="relative max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            受講生が「BUZZ WORD」で収益化に成功！
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            株式会社エヌアンドエスが開発したオリジナルスクレイピングツール
            <span className="font-bold">「BUZZ WORD」</span> を使えば、
            <br />
            未経験からでも"稼げる"インターネット領域を効率的に調査し、
            <br />
            すぐにAI副業へとつなげることが可能です。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* CASE 1 */}
          <animated.div style={cardAnimations[0]} className="group relative bg-white/20 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            {/* 装飾的な背景グラデーション */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400/20 to-cyan-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* CASEナンバー */}
            <div className="relative mb-4">
              <span className="inline-block bg-white/30 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                CASE 01
              </span>
              <span className="ml-2 text-white/90 font-medium">ユウタさん（20代）</span>
            </div>

            {/* 実績 */}
            <div className="relative mb-4 bg-white/10 rounded-lg p-4">
              <p className="text-white text-lg font-bold">
                <span className="text-cyan-300">BUZZ WORD</span>×AIライティングで
                <br />
                <span className="text-2xl bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                  月収8万円
                </span>
                を達成
              </p>
              <div className="absolute top-0 right-0 transform -translate-y-1/2 translate-x-1/2">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold">2M</span>
                </div>
              </div>
            </div>

            {/* コメント */}
            <div className="relative">
              <p className="text-white/90 text-sm leading-relaxed">
                「未経験でも<span className="font-bold text-cyan-300">短期間</span>で情報収集を効率化できるので、スキマ時間に記事作成ができました！」
              </p>
            </div>

            {/* ホバー時のグロー効果 */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
          </animated.div>

          {/* CASE 2 */}
          <animated.div style={cardAnimations[1]} className="group relative bg-white/20 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            {/* 装飾的な背景グラデーション */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400/20 to-cyan-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* CASEナンバー */}
            <div className="relative mb-4">
              <span className="inline-block bg-white/30 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                CASE 02
              </span>
              <span className="ml-2 text-white/90 font-medium">エリナさん（30代）</span>
            </div>

            {/* 実績 */}
            <div className="relative mb-4 bg-white/10 rounded-lg p-4">
              <p className="text-white text-lg font-bold">
                在宅ワークで
                <br />
                <span className="text-2xl bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                  月10万円
                </span>
                のプラス収入
              </p>
              <div className="absolute top-0 right-0 transform -translate-y-1/2 translate-x-1/2">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold">3M</span>
                </div>
              </div>
            </div>

            {/* コメント */}
            <div className="relative">
              <p className="text-white/90 text-sm leading-relaxed">
                「<span className="font-bold text-cyan-300">BUZZ WORD</span>で市場ニーズを先取りして記事ネタを発掘。AIツールと組み合わせたらライティング効率が大幅アップ！」
              </p>
            </div>

            {/* ホバー時のグロー効果 */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
          </animated.div>

          {/* CASE 3 */}
          <animated.div style={cardAnimations[2]} className="group relative bg-white/20 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            {/* 装飾的な背景グラデーション */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400/20 to-cyan-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* CASEナンバー */}
            <div className="relative mb-4">
              <span className="inline-block bg-white/30 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                CASE 03
              </span>
              <span className="ml-2 text-white/90 font-medium">ショウタロウさん（40代）</span>
            </div>

            {/* 実績 */}
            <div className="relative mb-4 bg-white/10 rounded-lg p-4">
              <p className="text-white text-lg font-bold">
                SNS運用代行で
                <br />
                <span className="text-2xl bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                  月12万円
                </span>
                の安定収入
              </p>
              <div className="absolute top-0 right-0 transform -translate-y-1/2 translate-x-1/2">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold">4M</span>
                </div>
              </div>
            </div>

            {/* コメント */}
            <div className="relative">
              <p className="text-white/90 text-sm leading-relaxed">
                「SNSのトレンドをスクレイピングで素早くキャッチし、AIで投稿文を生成。顧客から好評で案件が増えています！」
              </p>
            </div>

            {/* ホバー時のグロー効果 */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
          </animated.div>
        </div>

        <div className="text-center">
          <p className="text-sm text-white/80 max-w-3xl mx-auto">
            ※上記は受講生の一例で、稼働状況やスキル・個人差によって結果は異なります。
            <br />
            <span className="font-bold">BUZZ WORD</span>はあくまでも"最速アシストツール"です。正しい知識や継続的な取り組みで、着実に成果を目指しましょう。
          </p>
        </div>
      </animated.div>
    </section>
  );
} 