"use client";

import React from "react";
import dynamic from 'next/dynamic';

// 動的インポートでSquaresコンポーネントを読み込み（CSR）
const Squares = dynamic(() => import('../../corporate/components/Squares'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-cyan-900/20" />
});

// システム開発の実績データ
const SYSTEM_ACHIEVEMENTS = [
  {
    id: "relevance-engineering",
    title: "レリバンスエンジニアリング",
    description: "Mike King理論に基づくAI検索最適化",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    metric: "AIO対策",
    status: "運用中"
  },
  {
    id: "auto-generation",
    title: "30分自動生成システム",
    description: "Triple RAGによる高精度コンテンツ生成",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
    ),
    metric: "30分間隔",
    status: "24時間稼働"
  },
  {
    id: "legal-rag-system",
    title: "13法令準拠RAGシステム",
    description: "e-Gov API連携による法令情報の自動更新",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
      </svg>
    ),
    metric: "372項目",
    status: "運用中"
  },
  {
    id: "vector-search",
    title: "ベクトル検索エンジン",
    description: "企業エンティティ111社データベース統合",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
      </svg>
    ),
    metric: "111社DB",
    status: "高精度検索"
  }
];

const SystemHeroSection = () => {

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden bg-black">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70 z-[1]" />

      {/* Animated squares background - CSR only */}
      <div className="absolute inset-0 z-[2]">
        <Squares 
          speed={0.5} 
          squareSize={40}
          direction='diagonal'
          borderColor='rgba(59, 130, 246, 0.2)'
          hoverFillColor='rgba(59, 130, 246, 0.1)'
        />
      </div>

      {/* SEO重要部分（SSR対応） */}
      <div className="relative z-10 container mx-auto px-4 text-center pt-32 md:pt-40">
        <div className="mb-6">
          <span className="inline-block px-4 py-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-medium mb-4">
            業界最速・最安値のAIシステム開発
          </span>
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
          AIシステム開発
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
          レリバンスエンジニアリング・AIO対策・RAGシステムなど<br className="hidden md:block" />
          <span className="text-cyan-400 font-semibold">最新AI技術</span>によるシステム開発を実現
        </p>

        {/* 主要実績の表示 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12 max-w-6xl mx-auto">
          {SYSTEM_ACHIEVEMENTS.map((achievement) => (
            <div
              key={achievement.id}
              className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 hover:bg-white/10 transition-all duration-300 group"
            >
              <div className="text-cyan-400 mb-2">{achievement.icon}</div>
              <h3 className="text-white font-bold text-sm mb-1 group-hover:text-cyan-400 transition-colors">
                {achievement.title}
              </h3>
              <p className="text-gray-400 text-xs mb-2 leading-tight">
                {achievement.description}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-cyan-400 font-bold text-xs">
                  {achievement.metric}
                </span>
                <span className="text-green-400 text-xs">
                  {achievement.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <a
            href="#consultation-section"
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold border border-gray-200 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <span className="flex items-center justify-center">
              無料システム相談
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </span>
          </a>
          
          <a
            href="#project-showcase"
            className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white font-bold transition-all duration-300"
          >
            開発実績を見る
          </a>
        </div>

        {/* 特徴的な数値指標 */}
        <div className="flex flex-wrap justify-center gap-8 text-center">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 px-6 py-4">
            <div className="text-2xl md:text-3xl font-bold text-cyan-400">30分</div>
            <div className="text-sm text-gray-300">自動生成間隔</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 px-6 py-4">
            <div className="text-2xl md:text-3xl font-bold text-green-400">24時間</div>
            <div className="text-sm text-gray-300">無停止運用</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 px-6 py-4">
            <div className="text-2xl md:text-3xl font-bold text-yellow-400">372項目</div>
            <div className="text-sm text-gray-300">法令データベース</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 px-6 py-4">
            <div className="text-2xl md:text-3xl font-bold text-purple-400">AIO対策</div>
            <div className="text-sm text-gray-300">AI検索最適化</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SystemHeroSection; 