import { NextResponse } from 'next/server';
import { FragmentVectorizer, FragmentInfo } from '@/lib/vector/fragment-vectorizer';

// /aboutページのFragment ID定義（8個の詳細実装）
const ABOUT_FRAGMENTS: FragmentInfo[] = [
  // 1. ヒーローセクション
  {
    fragment_id: 'hero',
    content_title: 'NANDS - Business Concept',
    content: '株式会社エヌアンドエス（NANDS）のBusiness Conceptは、AI技術で働く人の次のステージへ導くことです。2008年の設立以来、時代に寄り添ったソリューションを提供し、全ての働く人が次のステージに進めるよう支援しています。生成AI活用リスキリング研修、AIシステム開発、キャリアコンサルティングを通じて、個人と企業の成長を支えます。',
    content_type: 'section',
    category: 'company-concept'
  },

  // 2. ミッション・ビジョン
  {
    fragment_id: 'mission-vision',
    content_title: 'Mission & Vision - 企業使命とビジョン',
    content: 'Mission: 働く人一人ひとりに寄り添い、次のステージへの挑戦を支援する。Vision: 2030年までに、AI活用人材育成分野でのリーディングカンパニーとなり、企業のDX推進と個人のキャリア発展を同時に実現する革新的なソリューションを提供します。AI技術の民主化を通じて、誰もがAIを活用できる社会の実現を目指します。',
    content_type: 'section',
    category: 'mission-vision'
  },

  // 3. エンタープライズAI
  {
    fragment_id: 'enterprise-ai',
    content_title: 'Enterprise AI Solutions - 企業向けAI',
    content: '企業向けAI導入コンサルティング、AI研修プログラム設計、AI組織構築支援、ROI評価システムを提供。ChatGPT、Claude、Gemini等の最新AI技術を活用し、企業の生産性向上とイノベーション創出を支援します。AI戦略立案から実装、運用まで一貫したサポートで、企業のAI活用を成功に導きます。',
    content_type: 'section',
    category: 'enterprise-ai'
  },

  // 4. 事業内容
  {
    fragment_id: 'business',
    content_title: 'Business - 事業内容',
    content: '主要事業: 1) 生成AI活用リスキリング研修（ChatGPT、Claude活用研修）、2) AIシステム開発（チャットボット、RAGシステム、AI自動化）、3) キャリアコンサルティング（個人・法人向けキャリア支援）、4) 退職支援サービス（円満退職・転職支援）、5) SNSコンサルティング（企業SNS戦略・運用支援）。13のサービスラインで包括的な人材支援を提供しています。',
    content_type: 'section',
    category: 'business-services'
  },

  // 5. 会社概要・代表メッセージ
  {
    fragment_id: 'company-message',
    content_title: 'Company & Message - 会社概要',
    content: '株式会社エヌアンドエス、代表取締役 原田賢治。2008年設立、滋賀県大津市に本社を構え、東京支社も展開。「働く人に寄り添い続ける」を企業理念とし、AI技術の進歩と共に進化し続ける人材支援企業です。個人のキャリア発展と企業の成長を同時に実現するソリューションを提供し、次世代の働き方を創造しています。',
    content_type: 'section',
    category: 'company-overview'
  },

  // 6. 公式SNS - X (Twitter)
  {
    fragment_id: 'company-official-x',
    content_title: 'Official SNS - X (Twitter)',
    content: '公式X（Twitter）アカウント @NANDS_AI では、AI技術の最新動向、サービス情報、業界インサイトを発信しています。生成AI活用事例、リスキリング研修の成果、AI導入のベストプラクティス、レリバンスエンジニアリング理論、Fragment ID実装事例など、実践的な情報を定期的に共有。AI活用を検討する企業・個人の皆様に有益な情報をお届けします。',
    content_type: 'section',
    category: 'official-sns'
  },

  // 7. 代表LinkedIn
  {
    fragment_id: 'representative-linkedin',
    content_title: 'Representative LinkedIn - 原田賢治',
    content: '代表取締役 原田賢治のLinkedInでは、B2B専門性、業界インサイト、経営視点からのAI活用戦略を発信しています。レリバンスエンジニアリング理論の実践、Mike King理論の応用、Fragment ID完全実装の成果、企業のAI導入における課題と解決策、人材育成の未来展望など、経営者・人事担当者向けの専門的な内容を提供しています。',
    content_type: 'section',
    category: 'representative-sns'
  },

  // 8. 企業沿革・アクセス
  {
    fragment_id: 'history-access',
    content_title: 'History & Access - 企業沿革',
    content: '2008年設立、株式会社エヌアンドエス（NANDSTECH）。本社: 滋賀県大津市、東京支社も展開。15年以上にわたり人材支援事業を展開し、AI技術の進歩と共に進化を続けています。創業以来一貫して「働く人に寄り添う」姿勢を貫き、時代の変化に対応したサービスを提供。現在は生成AI活用に特化した研修・コンサルティング企業として、全国の企業・個人を支援しています。',
    content_type: 'section',
    category: 'history-access'
  }
];

export async function POST() {
  try {
    console.log('🚀 /aboutページFragment ID専用ベクトル化開始...');
    
    const fragmentVectorizer = new FragmentVectorizer();
    
    // Fragment IDベクトル化実行
    const result = await fragmentVectorizer.vectorizeBlogFragments({
      post_id: 0, // 特別ID: aboutページ
      post_title: '会社概要 - NANDS',
      slug: 'about',
      page_path: '/about',
      fragments: ABOUT_FRAGMENTS,
      category: 'about',
      seo_keywords: ['会社概要', '株式会社エヌアンドエス', '原田賢治', 'AI研修', 'キャリアコンサルティング', '企業沿革', 'Mission Vision'],
      rag_sources: ['company-profile', 'corporate-information', 'representative-message']
    });

    if (result.success) {
      console.log(`✅ /aboutページFragment IDベクトル化完了:`);
      console.log(`   ベクトル化成功: ${result.vectorizedCount}/${result.totalCount}個`);
      console.log(`   成功率: ${((result.vectorizedCount / result.totalCount) * 100).toFixed(1)}%`);
      console.log(`   エラー数: ${result.errors.length}個`);

      return NextResponse.json({
        success: true,
        message: '/aboutページFragment IDベクトル化完了',
        results: {
          vectorizedCount: result.vectorizedCount,
          totalFragments: result.totalCount,
          successRate: `${((result.vectorizedCount / result.totalCount) * 100).toFixed(1)}%`,
          errors: result.errors,
          pageInfo: {
            page: '/about',
            fragmentCount: ABOUT_FRAGMENTS.length,
            categories: Array.from(new Set(ABOUT_FRAGMENTS.map(f => f.category)))
          }
        }
      });
    } else {
      console.error('❌ /aboutページFragment IDベクトル化失敗');
      return NextResponse.json({
        success: false,
        error: '/aboutページFragment IDベクトル化に失敗しました',
        details: result.errors.join(', ')
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ /aboutページFragment IDベクトル化エラー:', error);
    return NextResponse.json({
      success: false,
      error: 'Fragment IDベクトル化でエラーが発生しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 