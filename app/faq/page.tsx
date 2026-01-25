import React from 'react';
import Footer from '../../src/components/common/Footer';
import TableOfContents from '@/components/common/TableOfContents';
import Script from 'next/script';
import type { Metadata } from 'next';
import FAQClientComponent from './components/FAQClientComponent';

// 🆕 AI検索最適化統合
import {
  generateCompleteAIEnhancedUnifiedPageData,
  generateCompleteAIEnhancedStructuredDataJSON,
  generateEnhancedAISearchReport
} from '@/lib/structured-data/unified-integration-ai-enhanced';

// Mike King理論準拠 - FAQ目次システム（レリバンスエンジニアリング強化）
const faqTocItems = [
  { 
    id: 'tech-category', 
    title: 'AI・テクノロジーサービス',
    icon: '🤖',
    level: 1,
    semanticWeight: 0.95,
    targetQueries: ['AI技術 FAQ', 'システム連携', 'セキュリティ対策', 'AIモデル カスタマイズ'],
    entities: ['AI技術', 'OpenAI', 'Claude', 'Gemini', 'システム連携', 'セキュリティ']
  },
  { 
    id: 'pricing-category', 
    title: '料金・契約',
    icon: '💰',
    level: 1,
    semanticWeight: 0.92,
    targetQueries: ['料金体系', '契約期間', '追加機能 開発費用', '支払い方法'],
    entities: ['料金体系', '見積もり', '契約期間', 'PoC', '支払い方法']
  },
  { 
    id: 'support-category', 
    title: 'サポート・導入',
    icon: '🛠️',
    level: 1,
    semanticWeight: 0.90,
    targetQueries: ['導入期間', 'オンサイト導入', 'トレーニング研修', '24時間サポート'],
    entities: ['導入期間', 'オンサイト', 'トレーニング', '24時間サポート']
  },
  { 
    id: 'hr-category', 
    title: '人材・研修',
    icon: '👥',
    level: 1,
    semanticWeight: 0.88,
    targetQueries: ['AI人材育成', 'リスキリング研修', '研修形式', '効果測定'],
    entities: ['AI人材育成', 'リスキリング', 'デジタルスキル', '助成金']
  },
  { 
    id: 'marketing-category', 
    title: 'マーケティング・AIO',
    icon: '📈',
    level: 1,
    semanticWeight: 0.87,
    targetQueries: ['AIO対策', 'SEO違い', '効果測定', '効果発現期間'],
    entities: ['AIO対策', 'AI Optimization', 'ChatGPT', 'Claude', 'Perplexity']
  },
  { 
    id: 'ai-site-category', 
    title: 'AIサイト・ブランディング',
    icon: '🤖',
    level: 1,
    semanticWeight: 0.94,
    targetQueries: ['AIサイト定義', 'AI引用', 'デジタル資産', 'Fragment ID実装'],
    entities: ['AIサイト', 'AI引用', 'デジタル資産', 'Fragment ID', 'Mike King理論']
  }
];

// 🆕 静的FAQ データ（SSG対応）
const faqs = [
  {
    category: "AI・テクノロジーサービス",
    icon: "🤖",
    items: [
      {
        id: "faq-tech-1",
        q: "どのようなAI技術を使っていますか？",
        a: "最新のAI技術を幅広く活用しています。OpenAI GPT-4、Claude、Gemini等の大規模言語モデル（LLM）を中心に、RAGシステム、自然言語処理、画像認識、音声処理技術を組み合わせ、お客様のニーズに最適なソリューションを提供します。"
      },
      {
        id: "faq-tech-2",
        q: "既存システムとの連携は可能ですか？",
        a: "はい、既存システムとの連携を重視した設計を行っています。REST API、GraphQL、Webhookを活用し、CRM、ERP、Microsoft 365、Google Workspace、Salesforceなど主要なビジネスシステムとシームレスに連携できます。"
      },
      {
        id: "faq-tech-3",
        q: "セキュリティ対策はどうなっていますか？",
        a: "企業レベルのセキュリティ対策を標準実装しています。ISO27001準拠、データ暗号化（AES-256）、多層アクセス制御、GDPR・個人情報保護法対応など、包括的なセキュリティフレームワークでお客様の重要データを保護します。"
      },
      {
        id: "faq-tech-4",
        q: "AIモデルのカスタマイズは可能ですか？",
        a: "はい、業界・業務特化のAIモデルカスタマイズを提供しています。ファインチューニング、プロンプトエンジニアリング技術により、医療AI、法務AI、製造業AI等、専門分野に特化したAIシステムの構築が可能です。"
      }
    ]
  },
  {
    category: "料金・契約",
    icon: "💰",
    items: [
      {
        id: "faq-pricing-1",
        q: "料金体系を教えてください",
        a: "プロジェクト規模・要件に応じた個別見積もりを基本としています。初期開発費用と月額運用費用の組み合わせ、または従量課金制など、お客様の予算・運用形態に最適な料金プランをご提案します。まずは無料相談でご相談ください。"
      },
      {
        id: "faq-pricing-2",
        q: "最小契約期間はありますか？",
        a: "基本的な最小契約期間は設けていません。PoC（概念実証）から本格導入まで段階的に進められる柔軟な契約形態をご用意し、お客様のリスクを最小限に抑えた導入が可能です。短期間での効果検証も承ります。"
      },
      {
        id: "faq-pricing-3",
        q: "追加機能の開発費用はどうなりますか？",
        a: "追加機能開発は開発工数に基づく個別見積もりとなります。月額保守契約に含まれる軽微な機能追加から、大規模な機能拡張まで、透明性のある料金体系で柔軟に対応いたします。"
      },
      {
        id: "faq-pricing-4",
        q: "支払い方法について教えてください",
        a: "銀行振込、クレジットカード決済、口座自動引き落としに対応しています。大規模プロジェクトでは分割払い、着手金方式など、お客様の資金計画に合わせた支払い条件の調整も可能です。"
      },
      {
        id: "faq-pricing-5",
        q: "PoC（概念実証）から始められますか？",
        a: "はい、PoC（概念実証）から始められます。小規模なプロトタイプで効果を検証し、段階的に本格導入へと進むことで、リスクを最小限に抑えた導入が可能です。"
      }
    ]
  },
  {
    category: "サポート・導入",
    icon: "🛠️",
    items: [
      {
        id: "faq-support-1",
        q: "導入までの期間はどのくらいですか？",
        a: "プロジェクトの規模により異なりますが、簡単なチャットボットは2-4週間、本格的なAIシステムは2-6ヶ月程度が目安です。要件定義、設計、開発、テスト、リリースまでの工程を段階的に進めます。"
      },
      {
        id: "faq-support-2",
        q: "オンサイトでの導入支援はありますか？",
        a: "はい、必要に応じてオンサイトでの導入支援を行っています。システム設置、初期設定、操作研修、運用開始支援まで、専門エンジニアが現地でサポートいたします。遠隔地の場合はリモートサポートも対応可能です。"
      },
      {
        id: "faq-support-3",
        q: "トレーニングや研修はありますか？",
        a: "はい、導入システムの操作研修、AI活用研修、技術者向けトレーニングなど、お客様のレベルに応じた研修プログラムを提供しています。オンライン・オフライン両方に対応し、録画資料も提供いたします。"
      },
      {
        id: "faq-support-4",
        q: "24時間サポートは利用できますか？",
        a: "プレミアムサポートプランにて24時間365日のサポートを提供しています。緊急時の障害対応、システム監視、パフォーマンス最適化など、ミッションクリティカルなシステムの安定運用をサポートします。"
      }
    ]
  },
  {
    category: "人材・研修",
    icon: "👥",
    items: [
      {
        id: "faq-hr-1",
        q: "AI人材の育成支援はありますか？",
        a: "はい、企業のAI人材育成を包括的にサポートしています。基礎的なAIリテラシー研修から、データサイエンティスト育成、AI開発者向け技術研修まで、段階的なカリキュラムを提供し、実践的なスキル習得を支援します。"
      },
      {
        id: "faq-hr-2",
        q: "リスキリング研修の内容を教えてください",
        a: "デジタルスキル基礎、AI・機械学習概論、データ分析、プログラミング基礎、業務自動化ツール活用など、現代のビジネスに必要なスキルを体系的に学習できます。助成金活用により最大80%の補助も可能です。"
      },
      {
        id: "faq-hr-3",
        q: "研修の形式はどのようなものですか？",
        a: "オンライン研修、対面研修、ハイブリッド形式に対応しています。録画講義、ライブセッション、ハンズオン実習、グループワークを組み合わせ、受講者の理解度と実践力向上を重視したプログラム設計を行っています。"
      },
      {
        id: "faq-hr-4",
        q: "研修効果の測定はどのように行いますか？",
        a: "事前・事後のスキルアセスメント、実習課題の評価、修了テスト、実務適用度調査など、多面的な評価システムで研修効果を定量的に測定します。また、受講者の継続的なスキル向上をサポートするフォローアップ体制も整備しています。"
      },
      {
        id: "faq-hr-5",
        q: "助成金の活用サポートはありますか？",
        a: "はい、助成金の活用サポートを提供しています。人材開発支援助成金、IT導入補助金など、各種助成金の申請支援から活用方法まで、専門スタッフがサポートいたします。"
      }
    ]
  },
  {
    category: "マーケティング・AIO",
    icon: "📈",
    items: [
      {
        id: "faq-marketing-1",
        q: "AIO対策とは何ですか？",
        a: "AIO（AI Optimization）対策は、ChatGPT、Claude、PerplexityなどのAI検索エンジンでの表示・引用を最適化する新しいマーケティング手法です。従来のSEOを進化させ、AI時代の検索行動に対応した構造化データと技術実装を行います。"
      },
      {
        id: "faq-marketing-2",
        q: "従来のSEOとの違いは何ですか？",
        a: "従来のSEOがGoogleアルゴリズムを重視するのに対し、AIO対策はAI言語モデルの理解を重視します。Fragment ID実装、エンティティ関係性の明示、セマンティック最適化により、AIが正確に内容を理解・引用できる構造を構築します。"
      },
      {
        id: "faq-marketing-3",
        q: "効果測定はどのように行いますか？",
        a: "AI検索エンジンでの引用回数、ブランド言及頻度、トラフィック分析、コンバージョン率など、包括的なKPIで効果を測定します。競合分析、検索順位追跡、AI応答品質評価も含めた詳細レポートを提供します。"
      },
      {
        id: "faq-marketing-4",
        q: "どのくらいの期間で効果が現れますか？",
        a: "初期効果は1-3ヶ月、本格的な効果は3-6ヶ月程度が目安です。業界特性、コンテンツ品質、競合状況により差がありますが、継続的な最適化により中長期的な成果向上を実現します。"
      }
    ]
  },
  {
    category: "AIサイト・ブランディング",
    icon: "🤖",
    items: [
      {
        id: "faq-ai-site-1",
        q: "AIサイトとは何ですか？",
        a: "AIに引用されるサイトのことです。ChatGPTやClaude、Perplexityなどで検索された際に、あなたの会社のコンテンツが正確に引用される仕組みを持つサイトを指します。従来の「AIサイト＝AI技術を使ったサイト」とは異なり、「AI検索エンジンに引用される価値あるサイト」という新しい概念です。"
      },
      {
        id: "faq-ai-site-2", 
        q: "なぜAIサイト化が重要なのですか？",
        a: "あなたの会社がAIサイト化することで、AI検索エンジンでの引用率が大幅に向上し、すべてのコンテンツがデジタル資産として機能します。ChatGPT、Claude、Perplexityなどで検索された際に、あなたの会社の情報が正確に引用され、継続的にブランド認知度と信頼性が向上していきます。"
      },
      {
        id: "faq-ai-site-3",
        q: "Fragment IDの実装はどのように行いますか？",
        a: "あなたのサイトにFragment IDを実装することで、AIが各セクションを正確に識別・引用できるようになります。Complete URIの設定、構造化データの最適化、Mike King理論の適用により、あなたのコンテンツがAI検索エンジンで確実に引用される仕組みを構築します。"
      },
      {
        id: "faq-ai-site-4",
        q: "AIサイト化の費用はどの程度ですか？",
        a: "あなたのサイト規模と要件に応じて個別見積もりを行います。基本的なFragment ID実装から完全なAI最適化まで、段階的な導入も可能です。投資対効果を重視し、あなたの予算に合わせた最適なプランをご提案いたします。"
      },
      {
        id: "faq-ai-site-5",
        q: "AIサイト化の効果測定はどのように行いますか？",
        a: "AI検索エンジンでの引用回数、ブランド言及頻度、デジタル資産価値の向上などを定量的に測定します。あなたの会社のAI引用率向上を継続的にモニタリングし、ROIを明確に示すレポートを提供いたします。"
      }
    ]
  }
];

// Fragment ID生成関数（SSG対応）
function getFragmentId(itemId: string, category: string): string {
  // itemIdがすでに正しいフォーマット（faq-tech-1）なので、そのまま返す
  return itemId;
}

// カテゴリIDマッピング関数
function getCategoryId(categoryName: string): string {
  const categoryMap: { [key: string]: string } = {
    "AI・テクノロジーサービス": "tech-category",
    "料金・契約": "pricing-category", 
    "サポート・導入": "support-category",
    "人材・研修": "hr-category",
    "マーケティング・AIO": "marketing-category",
    "AIサイト・ブランディング": "ai-site-category"
  };
  return categoryMap[categoryName] || `category-${categoryName}`;
}

// 🆕 AI検索最適化対応FAQ構造化データ生成
async function generateFAQStructuredDataWithAI() {
  // 🚀 AI検索最適化処理を条件付きで実行
  let aiEnhancedData, aiEnhancedStructuredDataJSON;
  
  if (process.env.NODE_ENV === 'production') {
    // 本番環境: フル機能実行
    try {
      aiEnhancedData = await generateCompleteAIEnhancedUnifiedPageData(
        {
          pageSlug: 'faq',
          pageTitle: 'よくある質問 | AI・テクノロジー・研修・サポート',
          keywords: ['FAQ', 'AI技術', 'リスキリング', '料金体系', 'サポート', 'AIO対策', 'AIサイト'],
          category: 'faq'
        },
        ['ChatGPT', 'Perplexity', 'Claude', 'Gemini', 'DeepSeek'] // 🎯 5大AI検索エンジン対応
      );
      aiEnhancedStructuredDataJSON = generateCompleteAIEnhancedStructuredDataJSON(aiEnhancedData);
    } catch (error) {
      console.warn('🚨 AI検索最適化処理エラー:', error);
      aiEnhancedStructuredDataJSON = generateBasicFAQStructuredData();
    }
  } else {
    // 開発環境: 基本版実行
    aiEnhancedStructuredDataJSON = generateBasicFAQStructuredData();
  }
  
  return aiEnhancedStructuredDataJSON;
}

// 基本FAQ構造化データ（フォールバック用）
function generateBasicFAQStructuredData() {
  const questions = faqs.flatMap(category => 
    category.items.map(item => ({
      "@type": "Question",
      "@id": `https://nands.tech/faq#${getFragmentId(item.id, category.category)}`,
      "name": item.q,
      "text": item.q,
      "answerCount": 1,
      "acceptedAnswer": {
        "@type": "Answer",
        "@id": `https://nands.tech/faq#${getFragmentId(item.id, category.category)}-answer`,
        "text": item.a,
        "url": `https://nands.tech/faq#${getFragmentId(item.id, category.category)}`
      },
      "url": `https://nands.tech/faq#${getFragmentId(item.id, category.category)}`
    }))
  );

  // Note: FAQPageは2025年よりGoogle検索で政府・医療機関のみに制限
  // WebPage + ItemList + Question/Answer形式に変更
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://nands.tech/faq#main-content",
    "name": "よくある質問 - 株式会社エヌアンドエス",
    "description": "AI・テクノロジー、料金・契約、サポート・導入、人材・研修、マーケティング・AIO、AIサイト・ブランディングに関するよくある質問",
    "url": "https://nands.tech/faq",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": questions.map((q, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Question",
          "@id": q["@id"],
          "name": q.name,
          "text": q.text,
          "acceptedAnswer": q.acceptedAnswer
        }
      }))
    },
    "hasPart": questions.map(q => ({
      "@type": "WebPageElement",
      "@id": q["@id"],
      "name": q.name,
      "url": q.url
    })),
    "provider": {
      "@type": "Organization",
      "@id": "https://nands.tech/#organization",
      "name": "株式会社エヌアンドエス",
      "url": "https://nands.tech"
    }
  }, null, 2);
}

// 🆕 Metadata（SEO最適化）
export const metadata: Metadata = {
  title: 'よくある質問 | 株式会社エヌアンドエス - AI・テクノロジー・研修・サポート',
  description: 'AI・テクノロジーサービス、料金・契約、サポート・導入、人材・研修、マーケティング・AIO、AIサイト・ブランディングに関するよくある質問。専門スタッフが丁寧にお答えします。',
  openGraph: {
    title: 'よくある質問 | 株式会社エヌアンドエス',
    description: 'AI・テクノロジー、研修、サポートに関するよくある質問',
    url: 'https://nands.tech/faq',
    type: 'website',
    locale: 'ja_JP'
  },
  alternates: {
    canonical: 'https://nands.tech/faq'
  }
};

// 🆕 SSG対応のFAQページ（初期HTMLに全コンテンツ含む）
export default async function FAQPage() {
  const structuredData = await generateFAQStructuredDataWithAI();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Fragment ID for Entity Map - Hidden from users */}
      <div id="company" style={{ display: 'none' }} aria-hidden="true" />
      
      {/* 🆕 完全な構造化データ（Google推奨ベストプラクティス準拠） */}
      <Script
        id="faq-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: structuredData
        }}
      />

      {/* ヘッダー部分 */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              よくある質問
              <span className="block text-2xl md:text-3xl lg:text-4xl text-blue-200 mt-4">
                FAQ
              </span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              AI・テクノロジー、料金・契約、サポート・導入、人材・研修、<br />
              マーケティング・AIO、AIサイト・ブランディングに関する<br />
              よくある質問にお答えします
            </p>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          {/* カテゴリ選択（グリッド表示） */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
              カテゴリから選ぶ
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {faqs.map((category, index) => (
                <a
                  key={index}
                  href={`#${getCategoryId(category.category)}`}
                  className="flex flex-col items-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 group"
                >
                  <div className="text-2xl mb-2">{category.icon}</div>
                  <div className="text-sm font-semibold text-center group-hover:text-blue-600 transition-colors">
                    {category.category}
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* 🆕 目次機能 - Mike King理論準拠レリバンスエンジニアリング強化 */}
          <div className="mb-8">
            <TableOfContents items={faqTocItems} compact={true} />
          </div>

          {/* 🆕 FAQ コンテンツ（初期HTMLに全て含む - Google推奨） */}
          <div className="space-y-6">
            {faqs.map((category, categoryIndex) => (
              <section
                key={categoryIndex}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                {/* 🆕 カテゴリ Fragment ID - 目次連携 */}
                <div 
                  id={getCategoryId(category.category)} 
                  className="absolute -top-16 h-px w-full" 
                  aria-hidden="true"
                />
                
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span>{category.icon}</span>
                    <span>{category.category}</span>
                  </h2>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    {category.items.map((item, itemIndex) => {
                      const fragmentId = getFragmentId(item.id, category.category);
                      
                      return (
                        <div key={itemIndex} className="border border-gray-100 rounded-lg overflow-hidden">
                          {/* 🆕 Fragment ID - AI検索最適化 */}
                          <div 
                            id={fragmentId} 
                            className="absolute -top-16 h-px w-full" 
                            aria-hidden="true"
                          />
                          
                          <div className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-sm">Q</span>
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg text-gray-800">
                                  {item.q}
                                </h3>
                              </div>
                            </div>
                            
                            <div className="mt-4 ml-12">
                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <span className="text-green-600 font-bold text-sm">A</span>
                                </div>
                                <div className="text-gray-700 leading-relaxed">
                                  {item.a}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <div className="bg-blue-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                他にご質問はございませんか？
              </h3>
              <p className="text-gray-600 mb-6">
                お気軽にお問い合わせください。専門スタッフが丁寧にお答えいたします。
              </p>
              <a
                href="/contact"
                className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                お問い合わせ
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 🆕 インタラクティブ機能（クライアントコンポーネント） */}
      <FAQClientComponent faqs={faqs} />

      <Footer />
    </div>
  );
} 