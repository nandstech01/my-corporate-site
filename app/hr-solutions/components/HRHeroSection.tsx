export default function HRHeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
      {/* 背景グラデーション */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900" />
      
      {/* 装飾的な背景要素 */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/5 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* メインタイトル */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            AI人材ソリューション
          </span>
          <br />
          <span className="text-white">
            次世代の人材マッチングを実現
          </span>
        </h1>

        {/* サブタイトル */}
        <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
          求人サイト構築からAIマッチング、書類自動生成まで。
          <br className="hidden md:block" />
          人材業界のDXを包括的にサポートする総合ソリューション
        </p>

        {/* 特徴ボックス */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">95%</div>
            <div className="text-gray-300 text-sm">マッチング精度向上</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-2">80%</div>
            <div className="text-gray-300 text-sm">業務効率化</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">24/7</div>
            <div className="text-gray-300 text-sm">自動化サポート</div>
          </div>
        </div>

        {/* CTAボタン */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#contact"
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            無料相談を申し込む
          </a>
          <a
            href="#services"
            className="px-8 py-4 border border-white/30 text-white font-bold hover:bg-white/10 transition-all duration-300"
          >
            サービス詳細を見る
          </a>
        </div>
      </div>
    </section>
  );
} 