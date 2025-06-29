import React from "react";

/**
 * =========================================================
 * ServicesSectionSSR.tsx - 真のSSR版
 *
 * Mike King理論準拠: AI検索エンジン最適化
 * - 完全サーバーサイドレンダリング
 * - JavaScript依存なし
 * - モバイル完全対応
 * - プロフェッショナルデザイン
 * 
 * 【特徴】
 * ✅ 真のサーバーサイドレンダリング
 * ✅ AI検索エンジン最適化
 * ✅ レリバンスエンジニアリング準拠
 * ✅ モバイル確実表示
 * ✅ JavaScript依存0
 * ✅ 洗練されたミニマルデザイン
 * ---------------------------------------------------------
 */

/**
 * ==========================================
 * SVGアイコンコンポーネント
 * ==========================================
 */
const ServiceIcons = {
  gear: (
    <svg className="w-12 h-12 text-blue-600 group-hover:text-blue-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  search: (
    <svg className="w-12 h-12 text-blue-600 group-hover:text-blue-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  ),
  chat: (
    <svg className="w-12 h-12 text-blue-600 group-hover:text-blue-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  ),
  database: (
    <svg className="w-12 h-12 text-blue-600 group-hover:text-blue-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
  ),
  lightBulb: (
    <svg className="w-12 h-12 text-blue-600 group-hover:text-blue-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    </svg>
  ),
  users: (
    <svg className="w-12 h-12 text-blue-600 group-hover:text-blue-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  cpu: (
    <svg className="w-12 h-12 text-blue-600 group-hover:text-blue-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-16.5 3.75H3m18 0h-1.5M8.25 19.5V21M12 19.5V21m3.75-1.5V21m-9-18V3M12 3v1.5m3.75-1.5V3m-3.75 4.5a3 3 0 100 6 3 3 0 000-6z" />
      <rect x="6" y="6" width="12" height="12" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
    </svg>
  ),
  wrench: (
    <svg className="w-12 h-12 text-blue-600 group-hover:text-blue-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
    </svg>
  ),
  phone: (
    <svg className="w-12 h-12 text-blue-600 group-hover:text-blue-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
  ),
  video: (
    <svg className="w-12 h-12 text-blue-600 group-hover:text-blue-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m15.75 10.5 4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
    </svg>
  ),
  academicCap: (
    <svg className="w-12 h-12 text-blue-600 group-hover:text-blue-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
    </svg>
  ),
  building: (
    <svg className="w-12 h-12 text-blue-600 group-hover:text-blue-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m2.25-18v18m13.5-18v18m2.25-18v18M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
    </svg>
  )
};

/**
 * ==========================================
 * サービスカード一覧
 * ==========================================
 */
const servicesData = [
  {
    title: "システム開発",
    description:
      "Webアプリケーション開発からAI統合システムまで幅広く対応。",
    link: "/system-development",
    id: "system-development",
    icon: ServiceIcons.gear
  },
  {
    title: "AIO対策",
    description:
      "レリバンスエンジニアリングによるAI時代のSEO最適化サービス。",
    link: "/aio-seo",
    id: "aio-seo",
    icon: ServiceIcons.search
  },
  {
    title: "チャットボット開発",
    description:
      "ChatGPT・Claude統合チャットボット。顧客対応を24時間自動化。",
    link: "/chatbot-development",
    id: "chatbot-development",
    icon: ServiceIcons.chat
  },
  {
    title: "ベクトルRAG検索",
    description:
      "企業内文書の意味的検索システム。OpenAI Embeddings活用で検索精度95%向上。",
    link: "/vector-rag",
    id: "vector-rag",
    icon: ServiceIcons.database
  },
  {
    title: "AI副業",
    description:
      "ChatGPTを活用したSEOライティングや副業ノウハウをサポート。",
    link: "/fukugyo",
    id: "ai-side-business",
    icon: ServiceIcons.lightBulb
  },
  {
    title: "人材ソリューション",
    description:
      "AIを活用した人事・労務支援サービス。法令準拠システムで安心サポート。",
    link: "/hr-solutions",
    id: "hr-support",
    icon: ServiceIcons.users
  },
  {
    title: "AIエージェント",
    description:
      "Mastra Framework活用の自律型AIエージェント開発。業務自動化とインテリジェント処理を実現。",
    link: "/ai-agents",
    id: "ai-agents",
    icon: ServiceIcons.cpu
  },
  {
    title: "MCPサーバー",
    description:
      "Model Context Protocol対応のカスタムサーバー開発。AIシステム連携とデータ統合を効率化。",
    link: "/mcp-servers",
    id: "mcp-servers",
    icon: ServiceIcons.wrench
  },
  {
    title: "SNS自動化",
    description:
      "AI活用のSNS投稿自動化とコンテンツ生成。ブランド認知度向上と効率的な運用を実現。",
    link: "/sns-automation",
    id: "sns-automation",
    icon: ServiceIcons.phone
  },
  {
    title: "動画生成",
    description:
      "AI技術を活用した動画コンテンツ生成。マーケティング効果を最大化する映像制作サービス。",
    link: "/video-generation",
    id: "video-generation",
    icon: ServiceIcons.video
  },
  {
    title: "法人向けリスキリング",
    description:
      "企業のDX推進を支援する法人向け人材育成プログラム。AI・データサイエンス研修を提供。",
    link: "/reskilling",
    id: "corporate-reskilling",
    icon: ServiceIcons.building
  },
  {
    title: "個人向けリスキリング",
    description:
      "個人のキャリアアップを支援するスキル習得プログラム。最新テクノロジーの学習機会を提供。",
    link: "/reskilling",
    id: "individual-reskilling",
    icon: ServiceIcons.academicCap
  },
];

/**
 * ==========================================
 * JSON-LD: 構造化データを挿入
 * ==========================================
 */
function StructuredDataScript() {
  const serviceItems = servicesData.map((item) => ({
    "@type": "Service",
    name: item.title,
    description: item.description,
    url: item.link,
    provider: {
      "@type": "Organization",
      name: "N&S",
    },
  }));

  const jsonLD = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: serviceItems.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: service,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLD) }}
    />
  );
}

/**
 * ==========================================
 * Card: サービスカード（SSR版・プロフェッショナル）
 * ==========================================
 */
function ServiceCard({
  title,
  description,
  link,
  id,
  icon,
}: {
  title: string;
  description: string;
  link: string;
  id: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group relative">
      <a
        href={link}
        className="flex flex-col items-center justify-center w-full h-full p-6 bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg transform hover:scale-105 text-center"
        role="article"
        aria-label={`${title}について詳しく見る`}
      >
        {/* アイコン */}
        <div className="flex items-center justify-center mb-4">
          {icon}
        </div>

        {/* タイトル */}
        <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>

        {/* 説明 */}
        <p className="text-gray-600 text-sm leading-relaxed">
          {description}
        </p>

        {/* ホバー時のグラデーション境界線 */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-transparent to-blue-500/20 border-2 border-blue-300 rounded-lg"></div>
        </div>
      </a>
    </div>
  );
}

/**
 * ==========================================
 * メインセクション（真のSSR版）
 * ==========================================
 */
export default function ServicesSectionSSR() {
  return (
    <>
      {/* 構造化データ */}
      <StructuredDataScript />

      <section
        id="services"
        className="relative py-20 bg-white overflow-hidden"
        role="region"
        aria-label="サービス一覧"
      >
        {/* パララックス背景（軽量版） */}
        <div
          className="absolute inset-0 bg-[url('/images/background.jpg')] bg-cover bg-center bg-fixed opacity-10 pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* セクションタイトル */}
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              私たちの
              <span className="block text-blue-600">サービス</span>
            </h2>
            
            {/* 説明テキスト */}
            <div className="text-xl text-gray-600 max-w-3xl mx-auto">
              AI時代のキャリア支援から最新技術開発まで、包括的なソリューションを提供しています。
            </div>
          </div>

          {/* サービスグリッド（SSR版） */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {servicesData.map((service) => (
              <ServiceCard
                key={service.id}
                title={service.title}
                description={service.description}
                link={service.link}
                id={service.id}
                icon={service.icon}
              />
            ))}
          </div>

          {/* 下部CTA */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-gray-200 p-8 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                お気軽にご相談ください
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                どのサービスが最適かわからない場合も、<br />
                専門スタッフが丁寧にヒアリングいたします
              </p>
              <a
                href="/contact"
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-bold border border-gray-200 hover:bg-blue-700 transition-colors rounded-lg"
                role="button"
                aria-label="お問い合わせフォームへ移動"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.13 8.13 0 01-2.939-.541l-3.515 1.464a.25.25 0 01-.329-.329l1.464-3.515A8.13 8.13 0 013 12a8 8 0 018-8 8 8 0 018 8z" />
                </svg>
                無料相談する
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 