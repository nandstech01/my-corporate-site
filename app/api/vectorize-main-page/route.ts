import { NextResponse } from 'next/server';
import { OpenAIEmbeddings } from '@/lib/vector/openai-embeddings';
import { SupabaseVectorStore } from '@/lib/vector/supabase-vector-store';
import { createClient } from '@supabase/supabase-js';

// Service Role Key を使用してRLSをバイパス
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// メインページの15個のFragment ID専用コンテンツ定義
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
    
    企業の顧客対応を革新する高性能AIチャットボット開発サービスです。
    
    特徴:
    - OpenAI GPT統合
    - 自然言語処理技術
    - 多言語対応
    - CRM連携
    - 24時間自動対応
    
    カスタマーサポート業務の効率化と顧客満足度向上を実現します。`,
    completeURI: 'https://nands.tech/#service-chatbot-development',
    category: 'service'
  },
  'service-vector-rag': {
    fragmentId: 'service-vector-rag',
    title: 'ベクトルRAGシステム開発',
    content: `ベクトルRAGシステム開発 - NANDS
    
    企業データを活用した高精度検索・回答システム開発サービスです。
    
    特徴:
    - Supabase Vector統合
    - OpenAI Embeddings活用
    - セマンティック検索
    - 自社データ学習
    - リアルタイム回答生成
    
    社内ナレッジを AI が理解し、従業員の業務効率を飛躍的に向上させます。`,
    completeURI: 'https://nands.tech/#service-vector-rag',
    category: 'service'
  },
  'service-ai-side-business': {
    fragmentId: 'service-ai-side-business',
    title: 'AI副業・フリーランス支援',
    content: `AI副業・フリーランス支援サービス - NANDS
    
    AI技術を活用した副業・フリーランス活動支援サービスです。
    
    特徴:
    - AI副業スキル習得支援
    - フリーランス案件マッチング
    - 副業収入最大化コンサルティング
    - AI活用ビジネスモデル構築
    - 継続収入システム開発
    
    働き方の多様化を AI 技術でサポートし、新しいキャリアを創造します。`,
    completeURI: 'https://nands.tech/#service-ai-side-business',
    category: 'service'
  },
  'service-hr-support': {
    fragmentId: 'service-hr-support',
    title: 'HR支援・退職代行サービス',
    content: `HR支援・退職代行サービス - NANDS
    
    人事業務効率化と労働者支援を両立する総合HRサービスです。
    
    特徴:
    - 15年の退職代行実績
    - 労働法専門知識
    - 円満退職サポート
    - 転職活動支援
    - メンタルヘルスケア
    
    労働者の権利を守り、新しいキャリアへの円滑な移行を支援します。`,
    completeURI: 'https://nands.tech/#service-hr-support',
    category: 'service'
  },
  'service-ai-agents': {
    fragmentId: 'service-ai-agents',
    title: 'AIエージェント開発サービス',
    content: `AIエージェント開発サービス - NANDS
    
    業務自動化を実現する高性能AIエージェント開発サービスです。
    
    特徴:
    - マルチモーダルAI対応
    - 業務プロセス自動化
    - スケジュール調整AI
    - データ分析エージェント
    - 顧客対応自動化
    
    人間の意思決定をサポートし、業務効率を革新的に向上させます。`,
    completeURI: 'https://nands.tech/#service-ai-agents',
    category: 'service'
  },
  'service-mcp-servers': {
    fragmentId: 'service-mcp-servers',
    title: 'MCPサーバー開発サービス',
    content: `MCPサーバー開発サービス - NANDS
    
    最新のMCP（Model Context Protocol）対応サーバー開発サービスです。
    
    特徴:
    - Claude Desktop統合
    - カスタムツール開発
    - セキュアな接続プロトコル
    - スケーラブル設計
    - リアルタイムデータ連携
    
    AI モデルとの効率的な連携を実現し、企業システムを次世代に進化させます。`,
    completeURI: 'https://nands.tech/#service-mcp-servers',
    category: 'service'
  },
  'service-sns-automation': {
    fragmentId: 'service-sns-automation',
    title: 'SNS自動化システム',
    content: `SNS自動化システム - NANDS
    
    SNS運用を効率化する革新的な自動化システム開発サービスです。
    
    特徴:
    - 自動投稿スケジューリング
    - コンテンツ生成AI
    - エンゲージメント分析
    - インフルエンサー管理
    - ROI最適化
    
    SNS マーケティングの効果を最大化し、ブランド価値向上を実現します。`,
    completeURI: 'https://nands.tech/#service-sns-automation',
    category: 'service'
  },
  'service-video-generation': {
    fragmentId: 'service-video-generation',
    title: 'AI動画生成サービス',
    content: `AI動画生成サービス - NANDS
    
    最新AI技術を活用した動画コンテンツ自動生成サービスです。
    
    特徴:
    - テキストから動画生成
    - 音声合成・字幕自動付与
    - ブランド統一デザイン
    - 多様な形式対応
    - 高品質レンダリング
    
    動画制作の工数を大幅削減し、効果的なビジュアルコンテンツを量産できます。`,
    completeURI: 'https://nands.tech/#service-video-generation',
    category: 'service'
  },
  'service-corporate-reskilling': {
    fragmentId: 'service-corporate-reskilling',
    title: '法人向けAIリスキリング研修',
    content: `法人向けAIリスキリング研修 - NANDS
    
    企業のDX推進を支援する包括的なAIリスキリング研修サービスです。
    
    特徴:
    - 階層別カスタマイズ研修
    - 実践的AI活用手法
    - 業界特化カリキュラム
    - 成果測定・フォローアップ
    - 組織変革支援
    
    全社員のAIリテラシー向上により、企業の競争力を持続的に強化します。`,
    completeURI: 'https://nands.tech/#service-corporate-reskilling',
    category: 'service'
  },
  'service-individual-reskilling': {
    fragmentId: 'service-individual-reskilling',
    title: '個人向けAIリスキリング研修',
    content: `個人向けAIリスキリング研修 - NANDS
    
    個人のキャリア成長を支援するAIスキル習得研修サービスです。
    
    特徴:
    - パーソナライズ学習プラン
    - 実務直結スキル習得
    - キャリアチェンジ支援
    - 認定資格取得サポート
    - 継続学習フォローアップ
    
    AI 時代に必要なスキルを身につけ、個人の市場価値を向上させます。`,
    completeURI: 'https://nands.tech/#service-individual-reskilling',
    category: 'service'
  },
  
  // AIサイト関連3項目
  'nands-ai-site': {
    fragmentId: 'nands-ai-site',
    title: 'NANDS AI サイト',
    content: `NANDS AI サイト - AIに引用されるサイト
    
    NANDSはAI検索エンジンに正確に引用される「AIサイト」の先駆者です。
    
    特徴:
    - Mike King理論完全実装
    - レリバンスエンジニアリング適用
    - すべてのコンテンツが資産化
    - ChatGPT/Claude引用対応
    - Fragment ID完全対応
    
    「AIに引用されるサイト = すべてが資産になる」というコンセプトを体現し、
    AI検索時代の新しいウェブサイトのあり方を提示しています。`,
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