import { NextResponse } from 'next/server';
import { FragmentVectorizer, FragmentInfo } from '@/lib/vector/fragment-vectorizer';

// /faqページのFragment ID定義（26個の詳細実装）
const FAQ_FRAGMENTS: FragmentInfo[] = [
  // AI・テクノロジーサービス（4個）
  {
    fragment_id: 'faq-tech-1',
    content_title: 'どのようなAI技術を使っていますか？',
    content: '最新のAI技術を幅広く活用しています。OpenAI GPT-4、Claude、Gemini等の大規模言語モデル（LLM）を中心に、RAGシステム、自然言語処理、画像認識、音声処理技術を組み合わせ、お客様のニーズに最適なソリューションを提供します。',
    content_type: 'faq',
    category: 'tech'
  },
  {
    fragment_id: 'faq-tech-2',
    content_title: '既存システムとの連携は可能ですか？',
    content: 'はい、既存システムとの連携を重視した設計を行っています。REST API、GraphQL、Webhookを活用し、CRM、ERP、Microsoft 365、Google Workspace、Salesforceなど主要なビジネスシステムとシームレスに連携できます。',
    content_type: 'faq',
    category: 'tech'
  },
  {
    fragment_id: 'faq-tech-3',
    content_title: 'セキュリティ対策はどうなっていますか？',
    content: '企業レベルのセキュリティ対策を標準実装しています。ISO27001準拠、データ暗号化（AES-256）、多層アクセス制御、GDPR・個人情報保護法対応など、包括的なセキュリティフレームワークでお客様の重要データを保護します。',
    content_type: 'faq',
    category: 'tech'
  },
  {
    fragment_id: 'faq-tech-4',
    content_title: 'AIモデルのカスタマイズは可能ですか？',
    content: 'はい、業界・業務特化のAIモデルカスタマイズを提供しています。ファインチューニング、プロンプトエンジニアリング技術により、医療AI、法務AI、製造業AI等、専門分野に特化したAIシステムの構築が可能です。',
    content_type: 'faq',
    category: 'tech'
  },

  // 料金・契約（5個）
  {
    fragment_id: 'faq-pricing-1',
    content_title: '料金体系を教えてください',
    content: 'プロジェクト規模・要件に応じた個別見積もりを基本としています。初期開発費用と月額運用費用の組み合わせ、または従量課金制など、お客様の予算・運用形態に最適な料金プランをご提案します。まずは無料相談でご相談ください。',
    content_type: 'faq',
    category: 'pricing'
  },
  {
    fragment_id: 'faq-pricing-2',
    content_title: '最小契約期間はありますか？',
    content: '基本的な最小契約期間は設けていません。PoC（概念実証）から本格導入まで段階的に進められる柔軟な契約形態をご用意し、お客様のリスクを最小限に抑えた導入が可能です。短期間での効果検証も承ります。',
    content_type: 'faq',
    category: 'pricing'
  },
  {
    fragment_id: 'faq-pricing-3',
    content_title: '追加機能の開発費用はどうなりますか？',
    content: '追加機能開発は開発工数に基づく個別見積もりとなります。月額保守契約に含まれる軽微な機能追加から、大規模な機能拡張まで、透明性のある料金体系で柔軟に対応いたします。',
    content_type: 'faq',
    category: 'pricing'
  },
  {
    fragment_id: 'faq-pricing-4',
    content_title: '支払い方法について教えてください',
    content: '銀行振込、クレジットカード決済、口座自動引き落としに対応しています。大規模プロジェクトでは分割払い、着手金方式など、お客様の資金計画に合わせた支払い条件の調整も可能です。',
    content_type: 'faq',
    category: 'pricing'
  },
  {
    fragment_id: 'faq-pricing-5',
    content_title: 'PoC（概念実証）から始められますか？',
    content: 'はい、PoC（概念実証）から始められます。小規模なプロトタイプで効果を検証し、段階的に本格導入へと進むことで、リスクを最小限に抑えた導入が可能です。',
    content_type: 'faq',
    category: 'pricing'
  },

  // サポート・導入（4個）
  {
    fragment_id: 'faq-support-1',
    content_title: '導入までの期間はどのくらいですか？',
    content: 'プロジェクトの規模により異なりますが、簡単なチャットボットは2-4週間、本格的なAIシステムは2-6ヶ月程度が目安です。要件定義、設計、開発、テスト、リリースまでの工程を段階的に進めます。',
    content_type: 'faq',
    category: 'support'
  },
  {
    fragment_id: 'faq-support-2',
    content_title: 'オンサイトでの導入支援はありますか？',
    content: 'はい、必要に応じてオンサイトでの導入支援を行っています。システム設置、初期設定、操作研修、運用開始支援まで、専門エンジニアが現地でサポートいたします。遠隔地の場合はリモートサポートも対応可能です。',
    content_type: 'faq',
    category: 'support'
  },
  {
    fragment_id: 'faq-support-3',
    content_title: 'トレーニングや研修はありますか？',
    content: 'はい、導入システムの操作研修、AI活用研修、技術者向けトレーニングなど、お客様のレベルに応じた研修プログラムを提供しています。オンライン・オフライン両方に対応し、録画資料も提供いたします。',
    content_type: 'faq',
    category: 'support'
  },
  {
    fragment_id: 'faq-support-4',
    content_title: '24時間サポートは利用できますか？',
    content: 'プレミアムサポートプランにて24時間365日のサポートを提供しています。緊急時の障害対応、システム監視、パフォーマンス最適化など、ミッションクリティカルなシステムの安定運用をサポートします。',
    content_type: 'faq',
    category: 'support'
  },

  // 人材・研修（5個）
  {
    fragment_id: 'faq-hr-1',
    content_title: 'AI人材の育成支援はありますか？',
    content: 'はい、企業のAI人材育成を包括的にサポートしています。基礎的なAIリテラシー研修から、データサイエンティスト育成、AI開発者向け技術研修まで、段階的なカリキュラムを提供し、実践的なスキル習得を支援します。',
    content_type: 'faq',
    category: 'hr'
  },
  {
    fragment_id: 'faq-hr-2',
    content_title: 'リスキリング研修の内容を教えてください',
    content: 'デジタルスキル基礎、AI・機械学習概論、データ分析、プログラミング基礎、業務自動化ツール活用など、現代のビジネスに必要なスキルを体系的に学習できます。助成金活用により最大80%の補助も可能です。',
    content_type: 'faq',
    category: 'hr'
  },
  {
    fragment_id: 'faq-hr-3',
    content_title: '研修の形式はどのようなものですか？',
    content: 'オンライン研修、対面研修、ハイブリッド形式に対応しています。録画講義、ライブセッション、ハンズオン実習、グループワークを組み合わせ、受講者の理解度と実践力向上を重視したプログラム設計を行っています。',
    content_type: 'faq',
    category: 'hr'
  },
  {
    fragment_id: 'faq-hr-4',
    content_title: '研修効果の測定はどのように行いますか？',
    content: '事前・事後のスキルアセスメント、実習課題の評価、修了テスト、実務適用度調査など、多面的な評価システムで研修効果を定量的に測定します。また、受講者の継続的なスキル向上をサポートするフォローアップ体制も整備しています。',
    content_type: 'faq',
    category: 'hr'
  },
  {
    fragment_id: 'faq-hr-5',
    content_title: '助成金の活用サポートはありますか？',
    content: 'はい、助成金の活用サポートを提供しています。人材開発支援助成金、IT導入補助金など、各種助成金の申請支援から活用方法まで、専門スタッフがサポートいたします。',
    content_type: 'faq',
    category: 'hr'
  },

  // マーケティング・AIO（4個）
  {
    fragment_id: 'faq-marketing-1',
    content_title: 'AIO対策とは何ですか？',
    content: 'AIO（AI Optimization）対策は、ChatGPT、Claude、PerplexityなどのAI検索エンジンでの表示・引用を最適化する新しいマーケティング手法です。従来のSEOを進化させ、AI時代の検索行動に対応した構造化データと技術実装を行います。',
    content_type: 'faq',
    category: 'marketing'
  },
  {
    fragment_id: 'faq-marketing-2',
    content_title: '従来のSEOとの違いは何ですか？',
    content: '従来のSEOがGoogleアルゴリズムを重視するのに対し、AIO対策はAI言語モデルの理解を重視します。Fragment ID実装、エンティティ関係性の明示、セマンティック最適化により、AIが正確に内容を理解・引用できる構造を構築します。',
    content_type: 'faq',
    category: 'marketing'
  },
  {
    fragment_id: 'faq-marketing-3',
    content_title: '効果測定はどのように行いますか？',
    content: 'AI検索エンジンでの引用回数、ブランド言及頻度、トラフィック分析、コンバージョン率など、包括的なKPIで効果を測定します。競合分析、検索順位追跡、AI応答品質評価も含めた詳細レポートを提供します。',
    content_type: 'faq',
    category: 'marketing'
  },
  {
    fragment_id: 'faq-marketing-4',
    content_title: 'どのくらいの期間で効果が現れますか？',
    content: '初期効果は1-3ヶ月、本格的な効果は3-6ヶ月程度が目安です。業界特性、コンテンツ品質、競合状況により差がありますが、継続的な最適化により中長期的な成果向上を実現します。',
    content_type: 'faq',
    category: 'marketing'
  },

  // AIサイト・ブランディング（5個）
  {
    fragment_id: 'faq-ai-site-1',
    content_title: 'AIサイトとは何ですか？',
    content: 'AIに引用されるサイトのことです。ChatGPTやClaude、Perplexityなどで検索された際に、あなたの会社のコンテンツが正確に引用される仕組みを持つサイトを指します。従来の「AIサイト＝AI技術を使ったサイト」とは異なり、「AI検索エンジンに引用される価値あるサイト」という新しい概念です。',
    content_type: 'faq',
    category: 'ai-site'
  },
  {
    fragment_id: 'faq-ai-site-2',
    content_title: 'なぜAIサイト化が重要なのですか？',
    content: 'あなたの会社がAIサイト化することで、AI検索エンジンでの引用率が大幅に向上し、すべてのコンテンツがデジタル資産として機能します。ChatGPT、Claude、Perplexityなどで検索された際に、あなたの会社の情報が正確に引用され、継続的にブランド認知度と信頼性が向上していきます。',
    content_type: 'faq',
    category: 'ai-site'
  },
  {
    fragment_id: 'faq-ai-site-3',
    content_title: 'Fragment IDの実装はどのように行いますか？',
    content: 'あなたのサイトにFragment IDを実装することで、AIが各セクションを正確に識別・引用できるようになります。Complete URIの設定、構造化データの最適化、Mike King理論の適用により、あなたのコンテンツがAI検索エンジンで確実に引用される仕組みを構築します。',
    content_type: 'faq',
    category: 'ai-site'
  },
  {
    fragment_id: 'faq-ai-site-4',
    content_title: 'AIサイト化の費用はどの程度ですか？',
    content: 'あなたのサイト規模と要件に応じて個別見積もりを行います。基本的なFragment ID実装から完全なAI最適化まで、段階的な導入も可能です。投資対効果を重視し、あなたの予算に合わせた最適なプランをご提案いたします。',
    content_type: 'faq',
    category: 'ai-site'
  },
  {
    fragment_id: 'faq-ai-site-5',
    content_title: 'AIサイト化の効果測定はどのように行いますか？',
    content: 'AI検索エンジンでの引用回数、ブランド言及頻度、デジタル資産価値の向上などを定量的に測定します。あなたの会社のAI引用率向上を継続的にモニタリングし、ROIを明確に示すレポートを提供いたします。',
    content_type: 'faq',
    category: 'ai-site'
  }
];

export async function POST() {
  try {
    console.log('🚀 /faqページFragment ID専用ベクトル化開始...');
    
    const fragmentVectorizer = new FragmentVectorizer();
    
    // Fragment IDベクトル化実行
    const result = await fragmentVectorizer.vectorizeBlogFragments({
      post_id: 0, // 特別ID: faqページ
      post_title: 'よくある質問 - NANDS',
      slug: 'faq',
      page_path: '/faq',
      fragments: FAQ_FRAGMENTS,
      category: 'faq',
      seo_keywords: ['FAQ', 'よくある質問', 'AI技術', '料金体系', 'サポート', '人材研修', 'AIO対策', 'AIサイト'],
      rag_sources: ['faq-content', 'customer-support', 'service-information']
    });

    if (result.success) {
      console.log(`✅ /faqページFragment IDベクトル化完了:`);
      console.log(`   ベクトル化成功: ${result.vectorizedCount}/${result.totalCount}個`);
      console.log(`   成功率: ${((result.vectorizedCount / result.totalCount) * 100).toFixed(1)}%`);
      console.log(`   エラー数: ${result.errors.length}個`);

      return NextResponse.json({
        success: true,
        message: '/faqページFragment IDベクトル化完了',
        results: {
          vectorizedCount: result.vectorizedCount,
          totalFragments: result.totalCount,
          successRate: `${((result.vectorizedCount / result.totalCount) * 100).toFixed(1)}%`,
          errors: result.errors,
          pageInfo: {
            page: '/faq',
            fragmentCount: FAQ_FRAGMENTS.length,
            categories: Array.from(new Set(FAQ_FRAGMENTS.map(f => f.category)))
          }
        }
      });
    } else {
      console.error('❌ /faqページFragment IDベクトル化失敗');
      return NextResponse.json({
        success: false,
        error: '/faqページFragment IDベクトル化に失敗しました',
        details: result.errors.join(', ')
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ /faqページFragment IDベクトル化エラー:', error);
    return NextResponse.json({
      success: false,
      error: 'Fragment IDベクトル化でエラーが発生しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 