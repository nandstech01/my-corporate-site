import { NextResponse } from 'next/server';
import { OpenAIEmbeddings } from '@/lib/vector/openai-embeddings';
import { SupabaseVectorStore } from '@/lib/vector/supabase-vector-store';
import { createClient } from '@supabase/supabase-js';

// Service Role Key を使用してRLSをバイパス
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// FAQページの26個のQA専用コンテンツ定義
const FAQ_PAGE_CONTENT = {
  // 技術・開発関連FAQ (8個)
  'faq-tech-1': {
    fragmentId: 'faq-tech-1',
    title: 'システム開発の対応範囲について',
    content: `Q: どのようなシステム開発に対応していますか？
    
    A: NANDSでは幅広いシステム開発に対応しています。Webアプリケーション、スマートフォンアプリ、業務システム、ECサイト、CMS、API開発など、お客様のニーズに合わせたシステムを構築いたします。また、AI技術を活用した次世代システムの開発も得意としており、チャットボット、画像認識、自然言語処理などの機能を組み込んだシステム開発も可能です。`,
    completeURI: 'https://nands.tech/faq#faq-tech-1',
    category: 'faq'
  },
  'faq-tech-2': {
    fragmentId: 'faq-tech-2',
    title: '開発期間の目安について',
    content: `Q: システム開発にはどのくらいの期間がかかりますか？
    
    A: プロジェクトの規模や複雑さによって大きく異なりますが、一般的な目安をお伝えします。簡単なWebサイトは1-2週間、中規模のWebアプリケーションは1-3ヶ月、大規模な業務システムは3-6ヶ月程度です。AI機能を含む場合は、追加で1-2ヶ月程度をお見積もりください。詳細なスケジュールは、要件定義後に正確にお伝えいたします。`,
    completeURI: 'https://nands.tech/faq#faq-tech-2',
    category: 'faq'
  },
  'faq-tech-3': {
    fragmentId: 'faq-tech-3',
    title: '使用技術・言語について',
    content: `Q: どのような技術や言語を使用していますか？
    
    A: 最新の技術スタックを活用しています。フロントエンドはReact、Next.js、TypeScript、バックエンドはNode.js、Python、データベースはPostgreSQL、MongoDB、クラウドはAWS、Vercel、Supabaseを主に使用しています。AI開発ではOpenAI API、Anthropic Claude、Google Gemini、ベクトルデータベースにはPinecone、Chromaなどを活用し、最適な技術選択を行います。`,
    completeURI: 'https://nands.tech/faq#faq-tech-3',
    category: 'faq'
  },
  'faq-tech-4': {
    fragmentId: 'faq-tech-4',
    title: 'AI機能の実装について',
    content: `Q: AI機能はどのようなものが実装可能ですか？
    
    A: 幅広いAI機能の実装が可能です。チャットボット、文書要約、画像認識、音声認識、自然言語処理、レコメンデーション機能、予測分析などに対応しています。特にRAG（Retrieval-Augmented Generation）システムの構築を得意としており、企業の独自データを活用したAIアシスタントの開発も可能です。最新のLLMを活用した革新的なソリューションをご提案いたします。`,
    completeURI: 'https://nands.tech/faq#faq-tech-4',
    category: 'faq'
  },
  'faq-tech-5': {
    fragmentId: 'faq-tech-5',
    title: 'セキュリティ対策について',
    content: `Q: セキュリティ対策はどのように行っていますか？
    
    A: 多層防御によるセキュリティ対策を実施しています。HTTPS通信、認証・認可システム、データ暗号化、SQLインジェクション対策、XSS対策、CSRF対策を標準実装しています。また、定期的なセキュリティ監査、脆弱性診断、ペネトレーションテストも実施可能です。GDPR、個人情報保護法などの法規制にも対応し、お客様のデータを安全に保護します。`,
    completeURI: 'https://nands.tech/faq#faq-tech-5',
    category: 'faq'
  },
  'faq-tech-6': {
    fragmentId: 'faq-tech-6',
    title: 'レスポンシブ対応について',
    content: `Q: スマートフォンやタブレットに対応していますか？
    
    A: すべてのWebサイト・アプリケーションでレスポンシブデザインを標準実装しています。PC、タブレット、スマートフォンのあらゆるデバイスで最適な表示を実現します。また、PWA（Progressive Web App）技術を活用したネイティブアプリ並みのユーザー体験も提供可能です。モバイルファーストの設計思想に基づき、快適な操作性を実現します。`,
    completeURI: 'https://nands.tech/faq#faq-tech-6',
    category: 'faq'
  },
  'faq-tech-7': {
    fragmentId: 'faq-tech-7',
    title: 'データ移行・連携について',
    content: `Q: 既存システムからのデータ移行は可能ですか？
    
    A: 既存システムからのデータ移行・連携に豊富な経験があります。CSV、Excel、データベース、API連携など様々な形式に対応可能です。レガシーシステムの段階的移行、リアルタイムデータ同期、バッチ処理による定期同期などお客様の要件に応じて最適な手法をご提案します。データの整合性チェックとバックアップも万全に行います。`,
    completeURI: 'https://nands.tech/faq#faq-tech-7',
    category: 'faq'
  },
  'faq-tech-8': {
    fragmentId: 'faq-tech-8',
    title: 'アクセス解析・SEO対応について',
    content: `Q: アクセス解析やSEO対策は含まれますか？
    
    A: Google Analytics、Search Console、ヒートマップ解析などの導入・設定を標準で行います。SEO対策では、メタタグ最適化、構造化データ実装、サイトマップ生成、ページ速度最適化を実施します。特にAI検索時代に対応したAIO（AI Optimization）SEOを得意としており、ChatGPTやClaude等のAI検索エンジンでの上位表示・引用獲得をサポートします。`,
    completeURI: 'https://nands.tech/faq#faq-tech-8',
    category: 'faq'
  },

  // 料金・契約関連FAQ (6個)
  'faq-pricing-1': {
    fragmentId: 'faq-pricing-1',
    title: '料金体系について',
    content: `Q: 料金はどのように決まりますか？
    
    A: プロジェクトの規模、複雑さ、期間に応じて個別にお見積もりいたします。基本的には固定価格制を採用しており、追加料金が発生する場合は事前にご相談いたします。小規模サイトは50万円〜、中規模システムは200万円〜、大規模システムは500万円〜が目安です。AI機能の実装は別途お見積もりとなります。詳細なお見積もりは無料でご提供いたします。`,
    completeURI: 'https://nands.tech/faq#faq-pricing-1',
    category: 'faq'
  },
  'faq-pricing-2': {
    fragmentId: 'faq-pricing-2',
    title: '支払い方法について',
    content: `Q: 支払い方法にはどのような選択肢がありますか？
    
    A: 銀行振込、クレジットカード決済に対応しています。支払いタイミングは、着手時50%、完成時50%の分割払いが基本です。大規模プロジェクトの場合は、月次での分割払いも可能です。請求書発行から30日以内のお支払いをお願いしております。法人様の場合は掛け払いにも対応可能ですので、ご相談ください。`,
    completeURI: 'https://nands.tech/faq#faq-pricing-2',
    category: 'faq'
  },
  'faq-pricing-3': {
    fragmentId: 'faq-pricing-3',
    title: '見積もり・相談について',
    content: `Q: 見積もりや相談は無料ですか？
    
    A: 初回相談・お見積もりは完全無料です。オンライン会議やお電話での詳細なヒアリングも無料で承っております。要件定義書の作成、技術調査、概算見積もりまで無料でご提供いたします。有料となるのは、詳細設計や開発着手以降となります。お気軽にお問い合わせください。`,
    completeURI: 'https://nands.tech/faq#faq-pricing-3',
    category: 'faq'
  },
  'faq-pricing-4': {
    fragmentId: 'faq-pricing-4',
    title: '追加開発・変更について',
    content: `Q: 開発途中での仕様変更は可能ですか？
    
    A: 開発段階に応じて柔軟に対応いたします。要件定義段階での変更は無料、設計段階では軽微な変更は無料、開発段階では変更内容に応じてお見積もりいたします。大幅な仕様変更の場合は、追加契約となる場合があります。変更による影響範囲とコストを事前にご説明し、お客様にご判断いただいてから作業を進めます。`,
    completeURI: 'https://nands.tech/faq#faq-pricing-4',
    category: 'faq'
  },
  'faq-pricing-5': {
    fragmentId: 'faq-pricing-5',
    title: '保守・運用費用について',
    content: `Q: 完成後の保守・運用費用はいくらですか？
    
    A: 月額5万円〜の保守プランをご用意しています。基本プランには、サーバー監視、セキュリティ更新、バックアップ、軽微な修正が含まれます。機能追加や大幅な変更は別途お見積もりとなります。お客様のご要望に応じて、保守内容をカスタマイズすることも可能です。長期契約の場合は割引もございます。`,
    completeURI: 'https://nands.tech/faq#faq-pricing-5',
    category: 'faq'
  },
  'faq-pricing-6': {
    fragmentId: 'faq-pricing-6',
    title: '契約期間・解約について',
    content: `Q: 契約期間や解約条件はありますか？
    
    A: 開発契約は基本的にプロジェクト完了までの期間契約です。保守契約は1年契約が基本で、自動更新となります。解約をご希望の場合は、3ヶ月前までにご連絡ください。開発途中での解約の場合は、完了済み作業分のお支払いをお願いしております。お客様都合による解約の場合も、柔軟に対応いたしますのでご相談ください。`,
    completeURI: 'https://nands.tech/faq#faq-pricing-6',
    category: 'faq'
  },

  // サポート・その他FAQ (6個)
  'faq-support-1': {
    fragmentId: 'faq-support-1',
    title: 'サポート体制について',
    content: `Q: 完成後のサポート体制はどうなっていますか？
    
    A: 専任のサポートチームが対応いたします。平日9:00-18:00のサポート時間内であれば、お電話・メール・チャットでのお問い合わせが可能です。緊急時は24時間対応も可能です。リモートサポート、オンサイトサポートも承っております。また、定期的な運用レポートの提供、改善提案も行っています。お客様の事業成長をトータルサポートいたします。`,
    completeURI: 'https://nands.tech/faq#faq-support-1',
    category: 'faq'
  },
  'faq-support-2': {
    fragmentId: 'faq-support-2',
    title: '納期・スケジュールについて',
    content: `Q: 納期の遅延が心配です。スケジュール管理はどうしていますか？
    
    A: プロジェクト管理ツールを使用した透明性の高いスケジュール管理を行っています。週次の進捗報告、マイルストーンでの成果物確認を実施し、遅延リスクを早期に発見・対策します。万が一遅延が発生する場合は、速やかにご報告し、リカバリープランをご提案いたします。お客様のビジネススケジュールに合わせた柔軟な対応も可能です。`,
    completeURI: 'https://nands.tech/faq#faq-support-2',
    category: 'faq'
  },
  'faq-support-3': {
    fragmentId: 'faq-support-3',
    title: 'トレーニング・研修について',
    content: `Q: システムの使い方を教えてもらえますか？
    
    A: システム納品時に操作研修を実施いたします。管理者向け、一般ユーザー向けの研修メニューをご用意しており、オンライン・オンサイトどちらでも対応可能です。操作マニュアルの作成、動画マニュアルの制作も承っております。研修後のフォローアップ、追加研修も随時実施可能です。お客様のスキルレベルに合わせたカスタマイズ研修も行います。`,
    completeURI: 'https://nands.tech/faq#faq-support-3',
    category: 'faq'
  },
  'faq-support-4': {
    fragmentId: 'faq-support-4',
    title: 'データバックアップについて',
    content: `Q: データのバックアップはどのように行われますか？
    
    A: 自動バックアップシステムを標準実装しています。日次、週次、月次の複数世代バックアップを保管し、データ損失リスクを最小化しています。バックアップデータは暗号化され、複数拠点に分散保管されます。災害時の事業継続計画（BCP）にも対応しており、迅速なデータ復旧が可能です。お客様のご要望に応じて、バックアップ頻度や保管期間をカスタマイズできます。`,
    completeURI: 'https://nands.tech/faq#faq-support-4',
    category: 'faq'
  },
  'faq-support-5': {
    fragmentId: 'faq-support-5',
    title: '他社からの移行について',
    content: `Q: 他社で開発したシステムからの移行は可能ですか？
    
    A: 他社開発システムからの移行も承っております。既存システムの調査・分析から始まり、移行計画の策定、データ移行、機能移行を段階的に実施します。移行期間中のシステム併用、段階的切り替えも可能です。移行後の運用サポート、改善提案も行います。お客様の業務に支障をきたさないよう、綿密な計画と実行でサポートいたします。`,
    completeURI: 'https://nands.tech/faq#faq-support-5',
    category: 'faq'
  },
  'faq-support-6': {
    fragmentId: 'faq-support-6',
    title: '地域・リモート対応について',
    content: `Q: 地方や海外からの依頼も可能ですか？
    
    A: 全国・海外どこからでもご依頼いただけます。リモートワークを基本としており、オンライン会議、チャット、メールでの密なコミュニケーションを行います。必要に応じてオンサイト対応も可能です。時差のある海外案件の場合は、お客様の営業時間に合わせたサポート体制を構築いたします。多言語対応（英語、中国語など）も可能です。`,
    completeURI: 'https://nands.tech/faq#faq-support-6',
    category: 'faq'
  },

  // HR・マーケティング関連FAQ (3個)
  'faq-hr-1': {
    fragmentId: 'faq-hr-1',
    title: 'HR支援サービスについて',
    content: `Q: HR支援サービスではどのようなことができますか？
    
    A: 採用プロセスの最適化から人材育成まで幅広くサポートします。AI面接システム、採用管理システム、人事評価システム、勤怠管理システムの構築が可能です。また、従業員エンゲージメント向上のためのアンケートシステム、社内SNS、ナレッジ共有プラットフォームの開発も行います。データ分析による人事戦略の立案もサポートいたします。`,
    completeURI: 'https://nands.tech/faq#faq-hr-1',
    category: 'faq'
  },
  'faq-hr-2': {
    fragmentId: 'faq-hr-2',
    title: 'リスキリング支援について',
    content: `Q: リスキリング支援はどのような内容ですか？
    
    A: AI時代に対応したスキル習得をサポートします。プログラミング研修、AI・機械学習研修、データ分析研修、デジタルマーケティング研修などを提供しています。個人のスキルレベルに応じたカスタマイズ研修、オンライン学習プラットフォームの構築も可能です。学習進捗の可視化、スキル認定システムも併せて提供し、継続的な学習をサポートします。`,
    completeURI: 'https://nands.tech/faq#faq-hr-2',
    category: 'faq'
  },
  'faq-hr-3': {
    fragmentId: 'faq-hr-3',
    title: 'SNS自動化について',
    content: `Q: SNS自動化はどのようなことができますか？
    
    A: SNSマーケティングの効率化を実現します。投稿スケジューリング、コンテンツ自動生成、エンゲージメント分析、フォロワー管理、ハッシュタグ最適化などの機能を提供します。AI技術を活用したコンテンツ生成、トレンド分析、最適投稿時間の予測も可能です。複数SNSプラットフォームの一元管理により、マーケティング業務の大幅な効率化を実現します。`,
    completeURI: 'https://nands.tech/faq#faq-hr-3',
    category: 'faq'
  },

  // AIサイト関連FAQ (3個)
  'faq-ai-site-1': {
    fragmentId: 'faq-ai-site-1',
    title: 'AIサイトとは何ですか',
    content: `Q: AIサイトとは何ですか？
    
    A: AIサイトとは、AI検索エンジン（ChatGPT、Claude、Gemini等）に引用される最適化されたWebサイトのことです。従来のSEOがGoogle検索での上位表示を目指すのに対し、AIサイトはAIが情報源として信頼し、自動引用するサイトを目指します。構造化データ、Fragment ID、レリバンスエンジニアリングなどの技術により、あなたのサイトがAI検索で引用される「資産」に変わります。`,
    completeURI: 'https://nands.tech/faq#faq-ai-site-1',
    category: 'faq'
  },
  'faq-ai-site-2': {
    fragmentId: 'faq-ai-site-2',
    title: 'AIサイトの効果について',
    content: `Q: AIサイトにするとどのような効果がありますか？
    
    A: AI検索エンジンでの引用により、ブランド認知度とアクセス数が劇的に向上します。ChatGPT、Claude、Perplexityなどで企業名や商品が自動引用されることで、24時間365日のマーケティング効果が期待できます。また、AI引用は高い信頼性を示すため、潜在顧客の獲得、専門性の証明、競合優位性の確立につながります。従来のSEOを超えた次世代のWeb戦略です。`,
    completeURI: 'https://nands.tech/faq#faq-ai-site-2',
    category: 'faq'
  },
  'faq-ai-site-3': {
    fragmentId: 'faq-ai-site-3',
    title: 'AIサイト構築の流れについて',
    content: `Q: AIサイトはどのように構築しますか？
    
    A: Mike King理論に基づくレリバンスエンジニアリングを実施します。まず現状サイト分析、次にFragment ID実装、構造化データ最適化、AI検索最適化システム統合を行います。ベクトル化による意味理解向上、OpenAI Plugin対応、5大AI検索エンジン最適化も実施します。構築後はAI引用状況の監視、継続的な最適化により、長期的な効果を維持します。通常3-6ヶ月で完成します。`,
    completeURI: 'https://nands.tech/faq#faq-ai-site-3',
    category: 'faq'
  }
};

export async function POST() {
  try {
    console.log('🚀 FAQページ専用ベクトル化開始...');
    
    // 1. 既存のFAQページベクトルを削除
    console.log('🗑️ 既存のFAQページベクトルを削除中...');
    
    const fragmentIds = Object.keys(FAQ_PAGE_CONTENT);
    const deleteConditions = fragmentIds.map(id => `fragment_id.eq.${id}`).join(',');
    
    // FAQページ関連のベクトルを削除（page_slug = 'faq' または fragment_id が faq- で始まるもの）
    const { data: deletedData, error: deleteError } = await supabaseServiceRole
      .from('company_vectors')
      .delete()
      .or(`page_slug.eq.faq,${deleteConditions}`)
      .select('id');

    if (deleteError) {
      console.error('❌ 既存ベクトル削除エラー:', deleteError);
    } else {
      const deletedCount = deletedData?.length || 0;
      console.log(`✅ ${deletedCount}個の既存FAQページベクトルを削除`);
    }
    
    // 2. OpenAI Embeddings とベクトルストア初期化
    const embeddings = new OpenAIEmbeddings();
    const vectorStore = new SupabaseVectorStore();
    
    let totalVectorized = 0;
    const results = [];
    
    // 3. 各Fragment IDをベクトル化
    for (const [fragmentId, contentData] of Object.entries(FAQ_PAGE_CONTENT)) {
      try {
        console.log(`🔄 ベクトル化中: ${fragmentId}`);
        
        // ベクトル生成
        const vector = await embeddings.embedSingle(contentData.content);
        
        // VectorData形式でデータを準備
        const vectorData = {
          id: contentData.fragmentId,
          content: contentData.content,
          metadata: {
            url: contentData.completeURI,
            title: contentData.title,
            type: 'faq',
            section: contentData.fragmentId,
            wordCount: contentData.content.split(/\s+/).length,
            createdAt: new Date().toISOString(),
            fragmentId: contentData.fragmentId,
            category: contentData.category,
            source: 'faq-page-dedicated-vectorization',
            ai_optimized: true,
            relevance_engineering: true
          },
          embedding: vector
        };

        const saveResult = await vectorStore.saveVector(vectorData);
        
        if (saveResult.success) {
          totalVectorized++;
          results.push({
            fragmentId,
            title: contentData.title,
            status: 'success',
            vectorId: saveResult.id
          });
          console.log(`✅ ${fragmentId} ベクトル化完了`);
        } else {
          results.push({
            fragmentId,
            title: contentData.title,
            status: 'error',
            error: saveResult.error
          });
          console.error(`❌ ${fragmentId} ベクトル化失敗:`, saveResult.error);
        }
      } catch (error) {
        console.error(`❌ ${fragmentId} 処理エラー:`, error);
        results.push({
          fragmentId,
          title: contentData.title,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    console.log(`🎯 FAQページ専用ベクトル化完了: ${totalVectorized}/${Object.keys(FAQ_PAGE_CONTENT).length}`);
    
    return NextResponse.json({
      success: true,
      message: `FAQページ専用ベクトル化完了`,
      results: {
        totalProcessed: Object.keys(FAQ_PAGE_CONTENT).length,
        totalVectorized,
        details: results
      }
    });
    
  } catch (error) {
    console.error('❌ FAQページ専用ベクトル化エラー:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
} 