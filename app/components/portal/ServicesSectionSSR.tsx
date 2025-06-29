"use client";

import React, { useRef, useEffect, useState, Suspense } from "react";
import { motion, useInView, useAnimation, AnimatePresence } from "framer-motion";
import {
  FaGraduationCap,
  FaBuilding,
  FaLaptopCode,
  FaBalanceScale,
  FaCogs,
  FaSearch,
  FaComments,
  FaDatabase,
  FaRobot,
  FaPlug,
  FaShareAlt,
  FaVideo,
} from "react-icons/fa";
import dynamic from 'next/dynamic';

// TrueFocusを動的インポート（クライアントサイドのみ）
const TrueFocus = dynamic(() => import('./TrueFocus'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse bg-gray-200 h-8 w-full rounded"></div>
  )
});

/**
 * =========================================================
 * ServicesSectionSSR.tsx
 *
 * Mike King理論準拠: AI検索エンジン最適化
 * - SSRでコンテンツ認識可能
 * - 構造化データ完備
 * - セマンティックHTML構造
 * - アニメーション機能維持
 * 
 * 【特徴】
 * ✅ サーバーサイドレンダリング対応
 * ✅ AI検索エンジン最適化
 * ✅ レリバンスエンジニアリング準拠
 * ✅ アニメーション100%維持
 * ---------------------------------------------------------
 */

// ======= サービスデータ =======
const servicesData = [
  {
    title: "個人向けリスキリング",
    icon: <FaGraduationCap size={32} />,
    description:
      "生成AIやプロンプトエンジニアリングで、新時代のスキルを習得します。",
    link: "/reskilling",
    id: "personal-reskilling"
  },
  {
    title: "法人向けリスキリング",
    icon: <FaBuilding size={32} />,
    description:
      "企業向けDX研修や生成AI研修で、組織全体を最新技術でアップデート。",
    link: "/corporate",
    id: "corporate-reskilling"
  },
  {
    title: "システム開発",
    icon: <FaCogs size={32} />,
    description:
      "レリバンスエンジニアリング・AIO対策を含む最新AI技術によるシステム開発。",
    link: "/system-development",
    id: "system-development"
  },
  {
    title: "AIO対策・GEO",
    icon: <FaSearch size={32} />,
    description:
      "Mike King理論に基づくレリバンスエンジニアリング＋GEO（生成系検索最適化）でAI検索結果を最適化。",
    link: "/aio-seo",
    id: "aio-seo"
  },
  {
    title: "チャットボット開発",
    icon: <FaComments size={32} />,
    description:
      "GPT-4活用の高性能チャットボット開発。24時間自動応答で業務効率化を実現。",
    link: "/chatbot-development",
    id: "chatbot-development"
  },
  {
    title: "ベクトルRAG検索",
    icon: <FaDatabase size={32} />,
    description:
      "企業内文書の意味的検索システム。OpenAI Embeddings活用で検索精度95%向上。",
    link: "/vector-rag",
    id: "vector-rag"
  },
  {
    title: "AI副業",
    icon: <FaLaptopCode size={32} />,
    description:
      "ChatGPTを活用したSEOライティングや副業ノウハウをサポート。",
    link: "/fukugyo",
    id: "ai-side-business"
  },
  {
    title: "人材ソリューション",
    icon: <FaBalanceScale size={32} />,
    description:
      "AIを活用した人事・労務支援サービス。法令準拠システムで安心サポート。",
    link: "/hr-solutions",
    id: "hr-support"
  },
  {
    title: "AIエージェント",
    icon: <FaRobot size={32} />,
    description:
      "Mastra Framework活用の自律型AIエージェント開発。業務自動化とインテリジェント処理を実現。",
    link: "/ai-agents",
    id: "ai-agents"
  },
  {
    title: "MCPサーバー",
    icon: <FaPlug size={32} />,
    description:
      "Model Context Protocol対応のカスタムサーバー開発。AIシステム連携とデータ統合を効率化。",
    link: "/mcp-servers",
    id: "mcp-servers"
  },
  {
    title: "SNS自動化",
    icon: <FaShareAlt size={32} />,
    description:
      "AI活用のSNS投稿自動化とコンテンツ生成。ブランド認知度向上と効率的な運用を実現。",
    link: "/sns-automation",
    id: "sns-automation"
  },
  {
    title: "動画生成",
    icon: <FaVideo size={32} />,
    description:
      "AI技術を活用した動画コンテンツ生成。マーケティング効果を最大化する映像制作サービス。",
    link: "/video-generation",
    id: "video-generation"
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
 * パララックス背景 (簡易実装)
 * - 背景画像を固定し、軽めの演出
 * ==========================================
 */
function ParallaxBG() {
  return (
    <div
      className="absolute inset-0 bg-[url('/images/background.jpg')] bg-cover bg-center bg-fixed opacity-10 pointer-events-none"
      aria-hidden="true"
    />
  );
}

/**
 * ==========================================
 * Card: サービスカード
 * ==========================================
 */
function ServiceCard({
  icon,
  title,
  description,
  link,
  id,
  onComingSoon,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  id: string;
  onComingSoon?: () => void;
}) {
  // 動きのあるアニメーション設定 - ただし控えめ
  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    },
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // アナリティクス等の処理をここに追加可能
    console.log(`Clicked on service: ${title}`);
  };

  return (
    <motion.div
      className="group relative"
      variants={cardVariants}
      whileHover={{ 
        scale: 1.03,
        transition: { duration: 0.3 }
      }}
    >
      <a
        href={link}
        onClick={handleClick}
        className="block w-full h-full p-6 bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300"
        role="article"
        aria-label={`${title}について詳しく見る`}
      >
        {/* アイコン */}
        <div className="flex justify-center mb-4 text-blue-600">
          {icon}
        </div>

        {/* タイトル */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 text-center group-hover:text-blue-600 transition-colors">
          {title}
        </h3>

        {/* 説明 */}
        <p className="text-gray-600 text-center text-sm leading-relaxed">
          {description}
        </p>

        {/* ホバー時のグラデーション境界線 */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-transparent to-blue-500/20 border-2 border-transparent bg-clip-padding"></div>
        </div>
      </a>
    </motion.div>
  );
}

/**
 * ==========================================
 * メインセクション
 * ==========================================
 */
export default function ServicesSectionSSR() {
  // framer-motion制御
  const sectionRef = useRef<HTMLElement | null>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.3 });
  const mainControls = useAnimation();

  // Coming Soonモーダル
  const [showComingSoon, setShowComingSoon] = useState(false);

  useEffect(() => {
    if (inView) {
      mainControls.start("visible");
    }
  }, [inView, mainControls]);

  // アニメーション設定
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    },
  };

  return (
    <>
      {/* 構造化データ */}
      <StructuredDataScript />

      <section
        id="services"
        ref={sectionRef}
        className="relative py-20 bg-white overflow-hidden"
        role="region"
        aria-label="サービス一覧"
      >
        {/* パララックス背景 */}
        <ParallaxBG />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* セクションタイトル */}
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            animate={mainControls}
            variants={titleVariants}
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              私たちの
              <span className="block text-blue-600">サービス</span>
            </h2>
            
            {/* SSR時の静的テキスト */}
            <div className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
              <noscript>
                AI時代のキャリア支援から最新技術開発まで、包括的なソリューションを提供しています。
              </noscript>
            </div>
            
            {/* TrueFocus（動的インポート） */}
            <Suspense fallback={
              <div className="text-xl text-gray-600 max-w-3xl mx-auto">
                AI時代のキャリア支援から最新技術開発まで、包括的なソリューションを提供しています。
              </div>
            }>
              <TrueFocus
                sentence="AI時代のキャリア支援から最新技術開発まで、包括的なソリューションを提供しています。"
                manualMode={false}
                blurAmount={3}
                animationDuration={0.8}
                pauseBetweenAnimations={0.4}
                borderColor="rgba(59, 130, 246, 0.6)"
                glowColor="rgba(96, 165, 250, 0.8)"
              />
            </Suspense>
          </motion.div>

          {/* サービスグリッド */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial="hidden"
            animate={mainControls}
            variants={containerVariants}
          >
            {servicesData.map((service) => (
              <ServiceCard
                key={service.id}
                icon={service.icon}
                title={service.title}
                description={service.description}
                link={service.link}
                id={service.id}
                onComingSoon={() => setShowComingSoon(true)}
              />
            ))}
          </motion.div>

          {/* 下部CTA */}
          <motion.div
            className="text-center mt-16"
            initial="hidden"
            animate={mainControls}
            variants={titleVariants}
          >
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                お気軽にご相談ください
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                どのサービスが最適かわからない場合も、<br />
                専門スタッフが丁寧にヒアリングいたします
              </p>
              <a
                href="/contact"
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-bold border border-gray-200 hover:bg-blue-700 transition-colors"
                role="button"
                aria-label="お問い合わせフォームへ移動"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.13 8.13 0 01-2.939-.541l-3.515 1.464a.25.25 0 01-.329-.329l1.464-3.515A8.13 8.13 0 013 12a8 8 0 018-8 8 8 0 018 8z" />
                </svg>
                無料相談する
              </a>
            </div>
          </motion.div>
        </div>

        {/* Coming Soonモーダル */}
        <AnimatePresence>
          {showComingSoon && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowComingSoon(false)}
            >
              <motion.div
                className="bg-white p-8 max-w-md text-center border border-gray-200 shadow-xl"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Coming Soon
                </h3>
                <p className="text-gray-600 mb-6">
                  このサービスページは現在準備中です。<br />
                  近日公開予定ですので、もうしばらくお待ちください。
                </p>
                <button
                  onClick={() => setShowComingSoon(false)}
                  className="px-6 py-3 bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
                >
                  閉じる
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </>
  );
} 