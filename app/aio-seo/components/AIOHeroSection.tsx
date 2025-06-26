import React from 'react'

const AIOHeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(14, 165, 233, 0.3) 0%, transparent 50%)`
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="mb-8 mt-32">
          <span className="inline-block px-4 py-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-medium mb-4">
            Mike King理論完全準拠
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          <span className="block">AIO対策・</span>
          <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            レリバンスエンジニアリング
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
          Google AI Mode対策の専門サービス<br />
          あなたのサイトをAI検索結果で上位表示させる革新的技術
        </p>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-blue-300 transition-colors">
              Mike King理論
            </h3>
            <p className="text-sm text-gray-400">
              iPullRank社が開発した最新のレリバンスエンジニアリング理論を完全実装
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-green-300 transition-colors">
              AI検索最適化
            </h3>
            <p className="text-sm text-gray-400">
              Google AI Mode・ChatGPT・Perplexityでの発見確率を劇的に向上
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-yellow-300 transition-colors">
              日本初導入準備
            </h3>
            <p className="text-sm text-gray-400">
              海外実績を基に日本市場向けAIO対策サービスを開発中
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <a
            href="#consultation-section"
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold border border-gray-200 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <span className="flex items-center justify-center">
              無料AIO診断
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
            href="#case-studies"
            className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white font-bold transition-all duration-300"
          >
            導入事例を見る
          </a>
        </div>

        {/* サービス準備状況 */}
        <div className="flex flex-wrap justify-center gap-8 text-center">
          <div className="bg-white/5 backdrop-blur-sm px-6 py-4 border border-white/10">
            <div className="text-2xl md:text-3xl font-bold text-cyan-400">準備中</div>
            <div className="text-sm text-gray-300">Mike King理論実装</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm px-6 py-4 border border-white/10">
            <div className="text-2xl md:text-3xl font-bold text-green-400">運用中</div>
            <div className="text-sm text-gray-300">AI検索研究・開発</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm px-6 py-4 border border-white/10">
            <div className="text-2xl md:text-3xl font-bold text-yellow-400">対応済</div>
            <div className="text-sm text-gray-300">複数AI検索エンジン</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm px-6 py-4 border border-white/10">
            <div className="text-2xl md:text-3xl font-bold text-purple-400">開発中</div>
            <div className="text-sm text-gray-300">日本語AIO対策</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-white/30 flex justify-center">
          <div className="w-1 h-3 bg-white/50 animate-bounce mt-2"></div>
        </div>
      </div>
    </section>
  )
}

export default AIOHeroSection 