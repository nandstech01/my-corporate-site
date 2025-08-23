import { NextResponse } from 'next/server';
import { OpenAIEmbeddings } from '@/lib/vector/openai-embeddings';
import { SupabaseVectorStore } from '@/lib/vector/supabase-vector-store';
import { createClient } from '@supabase/supabase-js';

// Service Role Key を使用してRLSをバイパス
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// メインページの23個のFragment ID専用コンテンツ定義（15個 + FAQ 8個）
const MAIN_PAGE_CONTENT = {
  // サービス12項目
  'service-system-development': {
    fragmentId: 'service-system-development',
    title: 'システム開発サービス',
    content: `システム開発サービス - NANDS
    
    業務効率化とDX推進を実現するシステム開発サービスです。
    
    特徴:
    - Web・スマホアプリ開発
    - データベース設計・構築
    - API開発・連携
    - セキュリティ対策
    - レガシーシステム移行
    
    AI技術を活用した次世代システム開発により、業務プロセス最適化を実現します。`,
    completeURI: 'https://nands.tech/#service-system-development',
    category: 'service'
  },
  'service-aio-seo': {
    fragmentId: 'service-aio-seo',
    title: 'AIO SEO対策サービス',
    content: `AIO SEO対策サービス - NANDS
    
    AI検索時代に対応した革新的なSEO戦略サービスです。
    
    特徴:
    - Mike King理論完全実装
    - レリバンスエンジニアリング
    - AI検索最適化（ChatGPT/Claude対応）
    - 構造化データ最適化
    - Fragment ID実装
    
    従来のSEOを超越し、AIに引用される資産サイトを構築します。`,
    completeURI: 'https://nands.tech/#service-aio-seo',
    category: 'service'
  },
  'service-chatbot-development': {
    fragmentId: 'service-chatbot-development',
    title: 'チャットボット開発サービス',
    content: `チャットボット開発サービス - NANDS
    
    AIチャットボットの企画・開発・運用を一貫してサポートします。
    
    特徴:
    - OpenAI GPT連携
    - 自然言語処理最適化
    - カスタマーサポート自動化
    - 社内問い合わせ効率化
    - 多言語対応
    
    業務効率化と顧客満足度向上を同時に実現するAIソリューションです。`,
    completeURI: 'https://nands.tech/#service-chatbot-development',
    category: 'service'
  },
  'service-vector-rag': {
    fragmentId: 'service-vector-rag',
    title: 'ベクトルRAG検索システム',
    content: `ベクトルRAG検索システム - NANDS
    
    企業の膨大な情報資産を活用するAI検索システムです。
    
    特徴:
    - セマンティック検索機能
    - 文書の自動ベクトル化
    - 高精度な類似検索
    - マルチモーダル対応
    - リアルタイム更新
    
    社内ナレッジの活用効率を劇的に向上させるソリューションです。`,
    completeURI: 'https://nands.tech/#service-vector-rag',
    category: 'service'
  },
  'service-ai-side-business': {
    fragmentId: 'service-ai-side-business',
    title: 'AI副業支援サービス',
    content: `AI副業支援サービス - NANDS
    
    AIスキルを活用した副業・フリーランス活動を全面支援します。
    
    特徴:
    - プロンプトエンジニアリング研修
    - AI活用ビジネスモデル構築
    - 案件マッチング支援
    - 収益化コンサルティング
    - コミュニティ運営
    
    AI時代の新しい働き方を実現するキャリア支援サービスです。`,
    completeURI: 'https://nands.tech/#service-ai-side-business',
    category: 'service'
  },
  'service-hr-support': {
    fragmentId: 'service-hr-support',
    title: 'HR・人材ソリューション',
    content: `HR・人材ソリューション - NANDS
    
    採用から退職まで、人事業務のDX化を総合的にサポートします。
    
    特徴:
    - AI面接システム
    - 人材マッチング最適化
    - 退職代行サービス
    - キャリアコンサルティング
    - 労務管理効率化
    
    人事部門の業務効率化と従業員満足度向上を実現します。`,
    completeURI: 'https://nands.tech/#service-hr-support',
    category: 'service'
  },
  'service-ai-agents': {
    fragmentId: 'service-ai-agents',
    title: 'AIエージェント開発',
    content: `AIエージェント開発 - NANDS
    
    自律的に動作するAIエージェントの設計・開発サービスです。
    
    特徴:
    - マルチエージェントシステム
    - タスク自動実行
    - 学習機能搭載
    - API連携対応
    - スケーラブル設計
    
    複雑な業務プロセスを自動化する次世代AIソリューションです。`,
    completeURI: 'https://nands.tech/#service-ai-agents',
    category: 'service'
  },
  'service-mcp-servers': {
    fragmentId: 'service-mcp-servers',
    title: 'MCPサーバー開発',
    content: `MCPサーバー開発 - NANDS
    
    Model Context Protocol対応のサーバー開発・運用サービスです。
    
    特徴:
    - Claude/ChatGPT連携
    - カスタムプロトコル実装
    - 高性能データ処理
    - セキュリティ強化
    - 運用監視体制
    
    AI時代の新しいサーバーアーキテクチャを提供します。`,
    completeURI: 'https://nands.tech/#service-mcp-servers',
    category: 'service'
  },
  'service-sns-automation': {
    fragmentId: 'service-sns-automation',
    title: 'SNS自動化ツール',
    content: `SNS自動化ツール - NANDS
    
    SNSマーケティングの効率化を実現する自動化ソリューションです。
    
    特徴:
    - 投稿スケジューリング
    - コンテンツ自動生成
    - エンゲージメント分析
    - トレンド連動投稿
    - マルチプラットフォーム対応
    
    SNS運用の工数削減と効果最大化を同時に実現します。`,
    completeURI: 'https://nands.tech/#service-sns-automation',
    category: 'service'
  },
  'service-video-generation': {
    fragmentId: 'service-video-generation',
    title: '動画生成・編集サービス',
    content: `動画生成・編集サービス - NANDS
    
    AI技術を活用した動画コンテンツの企画・制作・編集サービスです。
    
    特徴:
    - AI動画生成
    - 自動字幕生成
    - 多言語音声合成
    - エフェクト自動適用
    - ブランド統一デザイン
    
    高品質な動画コンテンツを効率的に制作できるソリューションです。`,
    completeURI: 'https://nands.tech/#service-video-generation',
    category: 'service'
  },
  'service-corporate-reskilling': {
    fragmentId: 'service-corporate-reskilling',
    title: '法人向けリスキリング',
    content: `法人向けリスキリング - NANDS
    
    企業のDX推進を支援する包括的なリスキリングプログラムです。
    
    特徴:
    - カスタマイズ研修プログラム
    - 実践的スキル習得
    - 助成金活用サポート
    - 成果測定・分析
    - 継続的フォローアップ
    
    従業員のスキルアップと企業競争力向上を実現します。`,
    completeURI: 'https://nands.tech/#service-corporate-reskilling',
    category: 'service'
  },
  'service-individual-reskilling': {
    fragmentId: 'service-individual-reskilling',
    title: '個人向けリスキリング',
    content: `個人向けリスキリング - NANDS
    
    個人のキャリアアップを支援するパーソナライズ学習プログラムです。
    
    特徴:
    - 個別学習プラン設計
    - AI活用スキル習得
    - 転職・昇進サポート
    - 実務プロジェクト体験
    - メンタリング制度
    
    AI時代に求められるスキルを効率的に習得できます。`,
    completeURI: 'https://nands.tech/#service-individual-reskilling',
    category: 'service'
  },

  // AIサイト3項目
  'nands-ai-site': {
    fragmentId: 'nands-ai-site',
    title: 'NANDSのAIサイト',
    content: `NANDSのAIサイト - AI引用最適化の実践例
    
    当サイト自体がAI検索エンジンに引用される設計を実装しています。
    
    実装機能:
    - 完全な構造化データ対応
    - Fragment ID による詳細リンク
    - セマンティック検索最適化
    - AI引用トラッキング
    - レリバンスエンジニアリング実装
    
    「AIサイト＝AIに引用されるサイト」の概念を体現し、
    すべてのコンテンツが検索可能な資産として機能しています。`,
    completeURI: 'https://nands.tech/#nands-ai-site',
    category: 'ai-site'
  },
  'ai-site-features': {
    fragmentId: 'ai-site-features',
    title: 'AI サイト機能',
    content: `AI サイト機能 - 革新的なAI引用機能
    
    NANDSサイトに実装されたAI引用最適化機能群です。
    
    主要機能:
    - 構造化データ完全対応
    - Fragment ID システム
    - セマンティック検索最適化
    - AI引用計測システム
    - 類似度分析機能
    
    これらの機能により、サイト内のすべてのコンテンツがAI検索エンジンで
    正確に引用される仕組みを実現しています。`,
    completeURI: 'https://nands.tech/#ai-site-features',
    category: 'ai-site'
  },
  'ai-site-technology': {
    fragmentId: 'ai-site-technology',
    title: 'AI サイト技術',
    content: `AI サイト技術 - 最新のAI引用技術スタック
    
    NANDSサイトの技術基盤となるAI引用最適化技術です。
    
    技術スタック:
    - Next.js + TypeScript
    - Supabase Vector (pgvector)
    - OpenAI Embeddings
    - Schema.org準拠構造化データ
    - Fragment ID システム
    
    レリバンスエンジニアリング理論に基づく設計により、
    AI検索エンジンが理解しやすい情報アーキテクチャを構築しています。`,
    completeURI: 'https://nands.tech/#ai-site-technology',
    category: 'ai-site'
  },

  // 🆕 FAQ 8項目を追加
  'faq-main-reskilling': {
    fragmentId: 'faq-main-reskilling',
    title: 'リスキリング研修FAQ',
    content: `エヌアンドエスのリスキリング研修はどのようなサービスですか？
    
    当社のリスキリング研修は、最新の生成AI技術を活用したカリキュラムで、デジタルスキルの習得から実践的な業務活用まで幅広くサポートします。企業の業種・規模に合わせたカスタマイズプランも提供しています。
    
    特徴:
    - 生成AI技術活用カリキュラム
    - デジタルスキル習得サポート
    - 実践的業務活用指導
    - 企業カスタマイズプラン
    - 業種・規模対応`,
    completeURI: 'https://nands.tech/#faq-main-reskilling',
    category: 'faq'
  },
  'faq-main-system-dev': {
    fragmentId: 'faq-main-system-dev',
    title: 'システム開発・AI導入FAQ',
    content: `システム開発やAIソリューションの導入期間はどのくらいですか？
    
    プロジェクトの規模や要件により異なりますが、チャットボット開発は2-4週間、ベクトルRAG検索システムは4-8週間、フルスタックシステム開発は2-6ヶ月程度が目安となります。お客様のご要望に応じて柔軟に対応いたします。
    
    導入期間目安:
    - チャットボット開発: 2-4週間
    - ベクトルRAG検索システム: 4-8週間
    - フルスタックシステム開発: 2-6ヶ月
    - 柔軟な対応可能`,
    completeURI: 'https://nands.tech/#faq-main-system-dev',
    category: 'faq'
  },
  'faq-main-pricing': {
    fragmentId: 'faq-main-pricing',
    title: '料金体系FAQ',
    content: `サービスの料金体系はどのようになっていますか？
    
    プロジェクトの内容や規模に応じてお見積もりいたします。リスキリング研修は助成金活用により最大80%の補助が可能です。まずは無料相談にてご要望をお聞かせください。
    
    料金特徴:
    - プロジェクト規模対応見積もり
    - リスキリング研修助成金活用
    - 最大80%補助可能
    - 無料相談サービス`,
    completeURI: 'https://nands.tech/#faq-main-pricing',
    category: 'faq'
  },
  'faq-main-remote': {
    fragmentId: 'faq-main-remote',
    title: '地方対応FAQ',
    content: `地方在住でもサービスを利用できますか？
    
    はい、全国どこからでもご利用いただけます。オンライン会議システムを活用したリモート対応により、地域に関係なく高品質なサービスを提供しています。必要に応じて現地での打ち合わせも可能です。
    
    地方対応特徴:
    - 全国対応可能
    - オンライン会議システム活用
    - リモート高品質サービス
    - 現地打ち合わせ対応`,
    completeURI: 'https://nands.tech/#faq-main-remote',
    category: 'faq'
  },
  'faq-main-aio': {
    fragmentId: 'faq-main-aio',
    title: 'AIO対策・人材ソリューションFAQ',
    content: `AIO対策や人材ソリューションの効果はどの程度期待できますか？
    
    AIO対策では検索順位の向上とAI検索での露出増加、人材ソリューションでは採用効率の大幅改善を実現しています。具体的な効果は業界や現状により異なるため、まずは無料診断をお受けください。
    
    期待効果:
    - 検索順位向上
    - AI検索露出増加
    - 採用効率大幅改善
    - 業界別効果分析
    - 無料診断サービス`,
    completeURI: 'https://nands.tech/#faq-main-aio',
    category: 'faq'
  },
  'faq-main-ai-site-definition': {
    fragmentId: 'faq-main-ai-site-definition',
    title: 'AIサイト定義FAQ',
    content: `AIサイトとは何ですか？
    
    AIに引用されるサイトのことです。ChatGPTやClaude、Perplexityなどで検索された際に、あなたの会社のコンテンツが正確に引用される仕組みを持つサイトを指します。従来の「AIサイト＝AI技術を使ったサイト」とは異なり、「AI検索エンジンに引用される価値あるサイト」という新しい概念です。
    
    AIサイト特徴:
    - AI検索エンジン引用対応
    - 正確なコンテンツ引用仕組み
    - 価値あるサイト概念
    - 新しいサイト定義`,
    completeURI: 'https://nands.tech/#faq-main-ai-site-definition',
    category: 'faq'
  },
  'faq-main-ai-site-features': {
    fragmentId: 'faq-main-ai-site-features',
    title: 'AIサイト特徴FAQ',
    content: `NANDSのAIサイトの特徴は何ですか？
    
    あなたのサイトをAIサイト化する際の特徴として、Fragment ID実装、構造化データ最適化、Mike King理論による完全なAI引用最適化を行います。これにより、すべてのコンテンツにFragment IDが付与され、AI検索エンジンがあなたの会社の情報を正確に引用できる仕組みを構築できます。
    
    AIサイト化特徴:
    - Fragment ID実装
    - 構造化データ最適化
    - Mike King理論適用
    - 完全AI引用最適化
    - 正確な情報引用仕組み`,
    completeURI: 'https://nands.tech/#faq-main-ai-site-features',
    category: 'faq'
  },
  'faq-main-ai-site-benefits': {
    fragmentId: 'faq-main-ai-site-benefits',
    title: 'AIサイトメリットFAQ',
    content: `AIサイトのメリットは何ですか？
    
    AIサイト化により、あなたの会社の専門知識や製品情報がAI検索で正確に引用されるようになります。これにより、潜在顧客があなたの業界について質問した際に、あなたの会社が権威ある情報源として認識され、ブランド認知度向上と信頼性確立につながります。さらに、従来のSEOでは難しかった長文検索やニッチなキーワードでの露出も可能になります。
    
    AIサイトメリット:
    - AI検索での正確な引用
    - 権威ある情報源として認識
    - ブランド認知度向上
    - 信頼性確立
    - 長文・ニッチキーワード対応`,
    completeURI: 'https://nands.tech/#faq-main-ai-site-benefits',
    category: 'faq'
  }
};

export async function POST() {
  try {
    console.log('🚀 メインページ専用ベクトル化開始...');
    
    // 1. 既存のメインページベクトルを削除（Fragment ID含む）
    console.log('🗑️ 既存のメインページベクトルを削除中...');
    
    const fragmentIds = Object.keys(MAIN_PAGE_CONTENT);
    const deleteConditions = fragmentIds.map(id => `fragment_id.eq.${id}`).join(',');
    
    const { data: deletedData, error: deleteError } = await supabaseServiceRole
      .from('company_vectors')
      .delete()
      .or(deleteConditions)
      .select('id');

    if (deleteError) {
      console.error('❌ 既存ベクトル削除エラー:', deleteError);
    } else {
      const deletedCount = deletedData?.length || 0;
      console.log(`✅ ${deletedCount}個の既存メインページベクトルを削除`);
    }
    
    // 2. OpenAI Embeddings とベクトルストア初期化
    const embeddings = new OpenAIEmbeddings();
    const vectorStore = new SupabaseVectorStore();
    
    let totalVectorized = 0;
    const results = [];
    
    // 3. 各Fragment IDをベクトル化
    for (const [fragmentKey, fragmentData] of Object.entries(MAIN_PAGE_CONTENT)) {
      try {
        console.log(`📝 ${fragmentData.title} をベクトル化中...`);
        
        // ベクトル化実行
        const embedding = await embeddings.embedSingle(fragmentData.content);
        
        const vectorData = {
          id: `${fragmentData.fragmentId}-${Date.now()}`, // main-を削除
          content: fragmentData.content,
          embedding: embedding,
          metadata: {
            url: fragmentData.completeURI,
            title: fragmentData.title,
            type: 'fragment-id',
            wordCount: fragmentData.content.split(/\s+/).length,
            createdAt: new Date().toISOString(),
            section: fragmentData.fragmentId,
            category: fragmentData.category,
            page: 'main',
            fragment_id: fragmentData.fragmentId // 実際のFragment IDを追加
          },
          fragment_id: fragmentData.fragmentId, // 実際のFragment IDを正しく設定
          content_type: 'fragment-id' // content_typeも明示的に設定
        };
        
        const result = await vectorStore.saveVector(vectorData);
        totalVectorized++;
        
        results.push({
          section: fragmentKey,
          title: fragmentData.title,
          fragmentId: fragmentData.fragmentId,
          completeURI: fragmentData.completeURI,
          category: fragmentData.category,
          status: 'success'
        });
        
        console.log(`✅ ${fragmentData.title} ベクトル化完了`);
        
      } catch (error) {
        console.error(`❌ ${fragmentData.title} ベクトル化エラー:`, error);
        results.push({
          section: fragmentKey,
          title: fragmentData.title,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // 4. 統計確認
    const { data: newVectorData } = await supabaseServiceRole
      .from('company_vectors')
      .select('id')
      .eq('content_type', 'fragment-id')
      .like('metadata->>page', 'main');
      
    const newVectorCount = newVectorData?.length || 0;
    
    console.log(`🎯 メインページベクトル化完了: ${totalVectorized}個作成`);
    console.log(`📊 メインページFragment IDベクトル総数: ${newVectorCount}個`);
    
    return NextResponse.json({
      success: true,
      message: 'メインページ専用ベクトル化が正常に完了しました',
      results: {
        totalVectorized,
        newVectorCount,
        details: results
      }
    });
    
  } catch (error) {
    console.error('❌ メインページベクトル化エラー:', error);
    
    return NextResponse.json({
      success: false,
      error: 'メインページベクトル化に失敗しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 