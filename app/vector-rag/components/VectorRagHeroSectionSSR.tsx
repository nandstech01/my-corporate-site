import React from 'react';
import { getReviewStats } from '@/lib/supabase/client';

/**
 * =========================================================
 * VectorRagHeroSectionSSR.tsx - Vector RAG専用【完全版】
 *
 * Mike King理論準拠: AI検索エンジン最適化
 * - SSRでコンテンツ認識可能
 * - 構造化データ完備
 * - GEO対策（生成系検索最適化）
 * - レリバンスエンジニアリング
 * - LLMO完全対応
 * - Vector RAG業界特化設計
 * 
 * 【戦略】
 * ✅ ベクトル検索特化
 * ✅ RAGシステム強調
 * ✅ 知識ベース構築訴求
 * ✅ 実績数値強調
 * ✅ Fragment ID対応
 * ---------------------------------------------------------
 */

// Vector RAG統計データ（GEO対策）
const VECTOR_RAG_STATISTICS = [
  {
    id: "vector-databases",
    value: "8+",
    label: "対応ベクトルDB",
    description: "Pinecone、Weaviate、Chroma、FAISS等主要ベクトルデータベースに対応",
    color: "text-emerald-400",
    databases: ["Pinecone", "Weaviate", "Chroma", "FAISS", "Qdrant", "Milvus", "Elasticsearch", "PostgreSQL+pgvector"]
  },
  {
    id: "search-accuracy",
    value: "92%",
    label: "検索精度",
    description: "高度なEmbedding技術とベクトル検索により92%の高精度検索を実現",
    color: "text-emerald-400"
  },
  {
    id: "response-time",
    value: "<100ms",
    label: "平均応答時間",
    description: "最適化されたベクトルインデックスにより100ms以下の高速検索を実現",
    color: "text-emerald-400"
  }
];

export default async function VectorRagHeroSectionSSR() {
  const reviewStats = await getReviewStats('vector-rag');
  
  // フォールバック値
  const displayRating = reviewStats?.averageRating || 4.8;
  const displayCount = reviewStats?.totalReviews || 14;

  // Vector RAG構造化データ（Mike King理論準拠）
  const vectorRagSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": "https://nands.tech/vector-rag#software",
    "name": "ベクトルRAG開発サービス",
    "description": "高精度な類似検索・セマンティック検索システムの構築。AI検索システム、知識ベース構築、Embedding技術を活用した次世代RAGシステムの開発・提供サービス。",
    "url": "https://nands.tech/vector-rag",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "provider": {
      "@type": "Organization",
      "@id": "https://nands.tech/#organization"
    },
    "offers": {
      "@type": "Offer",
      "name": "ベクトルRAG開発・知識ベース構築",
      "description": "企業文書のベクトル化・インデックス化・検索最適化によるRAGシステム構築",
      "priceCurrency": "JPY",
      "availability": "https://schema.org/InStock"
    },
    "featureList": [
      "高精度ベクトル検索",
      "マルチモーダル対応",
      "リアルタイム更新",
      "スケーラブル設計",
      "API統合対応",
      "多言語対応",
      "セキュリティ強化",
      "コスト最適化"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": displayRating.toString(),
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": displayCount
    },
    "potentialAction": {
      "@type": "ContactAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://nands.tech/vector-rag#contact"
      }
    }
  };

  return (
    <>
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(vectorRagSchema) }}
      />

      <section 
        id="vector-rag-hero"
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32"
      >
        {/* 背景グラデーション */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-emerald-900 to-gray-900" />
        
        {/* 装飾的な背景要素（Vector RAG特化デザイン） */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-teal-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
          
          {/* ベクトル検索アイコン風の装飾 */}
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-teal-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-1/3 left-1/6 w-4 h-4 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Vector RAGバッジ */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 backdrop-blur-sm mb-8">
            <svg className="w-4 h-4 mr-2 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-medium text-emerald-300">Vector RAG System</span>
          </div>

          {/* メインタイトル（GEO対策: Explain-Then-List構造） */}
          <header>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent">
                ベクトルRAG開発
              </span>
              <br />
              <span className="text-white">
                次世代知識検索システム
              </span>
            </h1>

            {/* Topical Coverage: Vector RAG業界特化説明（LLMO対応） */}
            <div className="text-lg md:text-xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              <p className="mb-4">
                高精度な類似検索・セマンティック検索システムの構築で
                <br className="hidden md:block" />
                企業の知識ベースを次世代レベルに進化させます
              </p>
              
              {/* 詳細説明（Mike King理論: 網羅的コンテンツ） */}
              <div className="text-base text-gray-400 max-w-3xl mx-auto mb-8">
                <p>
                  株式会社エヌアンドエスのベクトルRAG開発は、OpenAI、Anthropic、Google等の
                  最新Embedding技術を活用し、企業文書の高精度ベクトル化・インデックス化を実現。
                  マルチモーダル対応、リアルタイム更新、スケーラブル設計により、
                  企業の知識検索システムを革命的に進化させます。
                </p>
              </div>
            </div>
          </header>

          {/* レビュー表示セクション */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center mr-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.floor(displayRating)
                        ? 'text-yellow-400'
                        : star === Math.ceil(displayRating) && displayRating % 1 !== 0
                        ? 'text-yellow-400'
                        : 'text-gray-400'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-white font-semibold text-lg">
                {displayRating}/5.0
              </span>
              <span className="text-emerald-200 ml-2">
                ({displayCount}件のレビュー)
              </span>
            </div>

            <div className="text-left">
              <blockquote className="text-emerald-100 italic mb-2">
                "ベクトルRAGシステムにより、企業の膨大な文書から必要な情報を瞬時に検索できるようになりました。検索精度が従来の10倍以上向上しています。"
              </blockquote>
              <cite className="text-emerald-300 text-sm">
                - 大手コンサルティング会社 情報システム部長
              </cite>
            </div>
          </div>

          {/* 統計情報ボックス（Fragment ID対応） */}
          <div id="vector-rag-statistics" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            {VECTOR_RAG_STATISTICS.map((stat) => (
              <div 
                key={stat.id}
                className="bg-white/10 backdrop-blur-md border border-white/20 p-6 text-center rounded-lg hover:bg-white/15 transition-all duration-300 group"
              >
                <div className={`text-3xl font-bold ${stat.color} mb-2 group-hover:scale-110 transition-transform`}>
                  {stat.value}
                </div>
                <div className="text-gray-300 text-sm font-medium mb-2">
                  {stat.label}
                </div>
                <div className="text-gray-400 text-xs leading-relaxed">
                  {stat.description}
                </div>
                
                {/* ベクトルDB一覧（対応ベクトルDB項目のみ） */}
                {stat.databases && (
                  <div className="mt-3">
                    <div className="flex flex-wrap justify-center gap-1">
                      {stat.databases.slice(0, 3).map((db, index) => (
                        <span key={index} className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full">
                          {db}
                        </span>
                      ))}
                      <span className="text-xs bg-gray-500/20 text-gray-300 px-2 py-1 rounded-full">
                        +{stat.databases.length - 3}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTAボタン（アクセシビリティ対応） */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a
              href="#contact"
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl rounded-lg transform hover:scale-105"
              role="button"
              aria-label="ベクトルRAG開発の無料相談を申し込む"
            >
              無料相談を申し込む
            </a>
            <a
              href="#services"
              className="px-8 py-4 border border-white/30 text-white font-bold hover:bg-white/10 transition-all duration-300 rounded-lg"
              role="button"
              aria-label="ベクトルRAG開発のサービス詳細を見る"
            >
              サービス詳細を見る
            </a>
            <a
              href="/reviews"
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl rounded-lg transform hover:scale-105"
              role="button"
              aria-label="ベクトルRAG開発サービスのレビューを見る"
            >
              レビューを見る
            </a>
          </div>

          {/* 追加コンテンツ: Vector RAG業界トレンド（GEO強化） */}
          <div className="max-w-2xl mx-auto text-sm text-gray-400 leading-relaxed">
            <p>
              <strong className="text-gray-300">ベクトル検索技術の革新</strong>をリードする
              エヌアンドエスのRAGシステムは、OpenAI、Anthropic、Googleなど
              主要AI企業の最新Embedding技術を統合。
              従来の検索システムを<strong className="text-emerald-400">次世代AI</strong>で進化させ、
              企業の知識活用を劇的に改善いたします。
            </p>
          </div>
        </div>
      </section>
    </>
  );
} 