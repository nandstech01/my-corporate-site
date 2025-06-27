export default function VectorRagHeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* 背景パターン */}
      <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-10"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* メインタイトル */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            企業内ナレッジを
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              AIで革新する
            </span>
            次世代検索システム
          </h1>
          
          {/* サブタイトル */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            OpenAI Embeddings活用のベクトルRAG検索システムで、膨大な企業内文書から瞬時に最適な回答を生成。
            意味的検索により、従来のキーワード検索を超越した高精度な情報検索を実現します。
          </p>
          
          {/* 特徴ボックス */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-sm border border-gray-200 p-6 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">95%</div>
              <div className="text-sm text-gray-300">検索精度向上</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-gray-200 p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">90%</div>
              <div className="text-sm text-gray-300">回答時間短縮</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-gray-200 p-6 text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">24/7</div>
              <div className="text-sm text-gray-300">自動運用</div>
            </div>
          </div>
          
          {/* CTAボタン */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#contact" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 border border-gray-200 transition-all duration-300 font-semibold"
            >
              無料相談・デモ依頼
            </a>
            <a 
              href="#services" 
              className="bg-transparent border border-gray-200 text-white px-8 py-4 hover:bg-white/10 transition-all duration-300 font-semibold"
            >
              サービス詳細
            </a>
          </div>
        </div>
      </div>
    </section>
  )
} 