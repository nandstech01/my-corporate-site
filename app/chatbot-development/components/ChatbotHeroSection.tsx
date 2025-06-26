export default function ChatbotHeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        {/* Badge */}
        <div className="mb-8 mt-32">
          <span className="inline-block px-4 py-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-medium mb-4">
            GPT-4活用チャットボット開発
          </span>
        </div>

        {/* Main Heading */}
        <div className="max-w-4xl mb-12">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            <span className="block">AIチャットボット開発で</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
              カスタマーサポートを革新
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
            GPT-4を活用した高性能チャットボットで24時間自動応答を実現。
            <br className="hidden md:block" />
            工数80%削減、顧客満足度向上を同時に達成します。
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <a
            href="#consultation-section"
            className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 border border-gray-200 text-white font-semibold text-lg transition-all duration-300 hover:from-cyan-400 hover:to-blue-500 hover:shadow-lg hover:shadow-cyan-500/25 hover:-translate-y-1"
          >
            無料相談を始める
            <svg className="inline-block ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
          <a
            href="#showcase-section"
            className="px-8 py-4 border border-white/30 text-white font-semibold text-lg transition-all duration-300 hover:bg-white/10 hover:border-white/50"
          >
            実績を見る
          </a>
        </div>

        {/* Key Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="group bg-white/5 backdrop-blur-sm border border-white/10 p-6 transition-all duration-300 hover:bg-white/10 hover:border-white/20">
            <svg className="w-8 h-8 text-cyan-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-cyan-300 transition-colors">
              24時間自動応答
            </h3>
            <p className="text-sm text-gray-400">
              GPT-4による高精度な自動応答で顧客対応を24時間365日実現
            </p>
          </div>

          <div className="group bg-white/5 backdrop-blur-sm border border-white/10 p-6 transition-all duration-300 hover:bg-white/10 hover:border-white/20">
            <svg className="w-8 h-8 text-green-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-green-300 transition-colors">
              多言語対応
            </h3>
            <p className="text-sm text-gray-400">
              日本語、英語、中国語など複数言語での自動対応が可能
            </p>
          </div>

          <div className="group bg-white/5 backdrop-blur-sm border border-white/10 p-6 transition-all duration-300 hover:bg-white/10 hover:border-white/20">
            <svg className="w-8 h-8 text-yellow-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-yellow-300 transition-colors">
              工数80%削減
            </h3>
            <p className="text-sm text-gray-400">
              自動化により人的コストを大幅削減、効率的な運用を実現
            </p>
          </div>
        </div>

        {/* 特徴的な数値指標 */}
        <div className="flex flex-wrap justify-center gap-8 text-center">
          <div className="bg-white/5 backdrop-blur-sm px-6 py-4 border border-white/10">
            <div className="text-2xl md:text-3xl font-bold text-cyan-400">24時間</div>
            <div className="text-sm text-gray-300">自動応答対応</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm px-6 py-4 border border-white/10">
            <div className="text-2xl md:text-3xl font-bold text-green-400">80%</div>
            <div className="text-sm text-gray-300">工数削減実績</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm px-6 py-4 border border-white/10">
            <div className="text-2xl md:text-3xl font-bold text-yellow-400">95%</div>
            <div className="text-sm text-gray-300">顧客満足度</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm px-6 py-4 border border-white/10">
            <div className="text-2xl md:text-3xl font-bold text-purple-400">10言語</div>
            <div className="text-sm text-gray-300">多言語対応</div>
          </div>
        </div>
      </div>
    </section>
  )
} 