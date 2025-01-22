'use client';

import React from 'react';
import { useSpring, animated } from '@react-spring/web';

export default function BuzzWordToolSection() {
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

  return (
    <section className="relative py-12 px-4 overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 rounded-xl shadow-2xl my-8">
      {/* 装飾的な背景要素 */}
      <div className="absolute top-[-40%] left-[-20%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[80px] animate-pulse" />
      <div className="absolute bottom-[-40%] right-[-20%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse" />
      
      {/* グリッドパターン */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />

      <animated.div style={fadeIn} className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block mb-6 relative">
            <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 blur-xl opacity-30 animate-pulse" />
            <h2 className="relative text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-300">
              株式会社エヌアンドエス独自開発
              <br />
              <span className="text-yellow-300">「BuzzWord」</span> で効率UP
            </h2>
          </div>

          <p className="text-lg text-white/80 max-w-3xl mx-auto leading-relaxed">
            「BuzzWord」は、<span className="font-bold text-cyan-300">高精度スクレイピング</span>と
            <span className="font-bold text-cyan-300">AI連携</span>を融合させた、エヌアンドエス独自の最先端ツールです。
            <br />
            類似ツール「パスカル」を参考に、より直感的でスピーディーな作業を実現。
            <br />
            副業やSEO施策、ネットビジネスで<span className="font-bold text-cyan-300">最短ルート</span>を切り拓きます。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. 高精度スクレイピング */}
          <animated.div style={cardAnimations[0]} className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur-md opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="relative bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-white/10 shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
              <div className="absolute -top-3 -left-3 w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center font-bold text-white shadow-lg">
                01
              </div>
              <h3 className="text-xl font-bold text-white mb-3 ml-8">
                高精度スクレイピング
              </h3>
              <p className="text-white/90 mb-2">
                <span className="font-bold text-cyan-300">BUZZ WORDエンジン</span>がWeb上のテキストや数値情報を
                自動解析。欲しい情報をピンポイントでリスト化し、ミスや漏れを
                最小限に抑えます。
              </p>
              <p className="text-sm text-white/80">
                ネットビジネスや副業で重要となる市場調査・競合分析を
                <span className="font-bold text-cyan-300">圧倒的スピード</span>で実現。
              </p>
            </div>
          </animated.div>

          {/* 2. AIと連動した自動要約 / トレンド分析 */}
          <animated.div style={cardAnimations[1]} className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur-md opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="relative bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-white/10 shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
              <div className="absolute -top-3 -left-3 w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center font-bold text-white shadow-lg">
                02
              </div>
              <h3 className="text-xl font-bold text-white mb-3 ml-8">
                AI×自動要約 & トレンド分析
              </h3>
              <p className="text-white/90 mb-2">
                収集した膨大なデータをAIが要約し、即座に
                <span className="font-bold text-cyan-300">「使える情報」</span>へ変換。トレンドを見逃さず、コンテンツ作成や商品企画に
                活かせます。
              </p>
              <p className="text-sm text-white/80">
                今が"熱い"キーワードやテーマを逃さないから、
                <span className="font-bold text-cyan-300">投稿のクリック率やCVR</span>も向上！
              </p>
            </div>
          </animated.div>

          {/* 3. ノーコードUIで使いやすい */}
          <animated.div style={cardAnimations[2]} className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur-md opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="relative bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-white/10 shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
              <div className="absolute -top-3 -left-3 w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center font-bold text-white shadow-lg">
                03
              </div>
              <h3 className="text-xl font-bold text-white mb-3 ml-8">
                ノーコードUI & サポート体制
              </h3>
              <p className="text-white/90 mb-2">
                専門知識不要で操作できるノーコードの管理画面を採用。
                <br />
                わからない時は、専任スタッフがサポートします。
              </p>
              <p className="text-sm text-white/80">
                受講生の90%以上が、<span className="font-bold text-cyan-300">30分以内</span>に基本操作をマスターしています。
              </p>
            </div>
          </animated.div>
        </div>
      </animated.div>
    </section>
  );
} 