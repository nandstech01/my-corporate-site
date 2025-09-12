import { NextResponse } from 'next/server';
import { OpenAIEmbeddings } from '@/lib/vector/openai-embeddings';
import { SupabaseVectorStore } from '@/lib/vector/supabase-vector-store';
import { createClient } from '@supabase/supabase-js';

// Service Role Key を使用してRLSをバイパス
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// aboutページの最新コンテンツ定義（Fragment ID付き）
const ABOUT_PAGE_CONTENT = {
  hero: {
    fragmentId: 'hero',
    title: 'NANDS - Business Concept',
    content: `株式会社エヌアンドエス - 会社概要
    
    NANDS Business Concept
    全ての働く人を次のステージへ
    
    AI技術で働く人の次のステージを支援する企業です。レリバンスエンジニアリング、AI検索最適化、Mike King理論の完全実装により、AI検索時代の先行者利益を提供します。
    
    2008年設立、全国対応のAI時代のキャリア革新企業として、働く人々の成長と企業のDXを支援しています。`,
    completeURI: 'https://nands.tech/about#hero'
  },
  missionVision: {
    fragmentId: 'mission-vision',
    title: 'Mission & Vision',
    content: `ミッション・ビジョン
    
    ミッション: 全ての働く人を次のステージへ
    AI技術を活用し、個人のキャリア成長と企業の持続的発展を支援します。
    
    ビジョン: AI検索時代のリーディングカンパニー
    レリバンスエンジニアリングとMike King理論の実践により、AI検索最適化分野での業界標準を確立します。`,
    completeURI: 'https://nands.tech/about#mission-vision'
  },
  enterpriseAI: {
    fragmentId: 'enterprise-ai',
    title: 'エンタープライズAIソリューション',
    content: `エンタープライズAIソリューション
    
    企業向けの包括的なAI導入支援サービスを提供しています。
    - AIリスキリング研修
    - DX推進支援
    - 業務自動化コンサルティング
    - AI戦略・ガバナンス構築
    
    業界別カスタマイズ対応により、組織全体のAIリテラシー向上を実現します。`,
    completeURI: 'https://nands.tech/about#enterprise-ai'
  },
  business: {
    fragmentId: 'business',
    title: '事業内容',
    content: `事業内容
    
    主要サービス:
    1. AIエージェント開発サービス
    2. システム開発サービス
    3. AIO SEO対策サービス
    4. ベクトルRAGシステム開発
    5. AIチャットボット開発
    6. AI動画生成サービス
    7. HR支援ソリューション
    8. SNS自動化システム
    9. MCPサーバー開発
    10. 個人向けAIリスキリング研修
    11. AIサイト開発（Triple RAG統合）
    12. AI副業支援サービス
    13. 法人向けAIソリューション
    
    全サービスでレリバンスエンジニアリング理論を適用し、AI検索最適化を実現します。`,
    completeURI: 'https://nands.tech/about#business'
  },
  companyMessage: {
    fragmentId: 'company-message',
    title: '会社情報・代表メッセージ',
    content: `会社情報・代表メッセージ
    
    代表取締役: 原田 賢治
    所在地: 〒520-0025 滋賀県大津市皇子が丘２丁目10−25−3004号
    設立: 2008年
    事業内容: AI技術を活用したシステム開発・コンサルティング
    
    代表メッセージ:
    AI検索時代において、企業が「AIに選ばれる」存在になることが重要です。当社は、Mike King理論に基づくレリバンスエンジニアリングにより、お客様の情報がAI検索エンジンで正確に引用される仕組みを構築します。
    
    私たちは、AI技術で働く人の可能性を最大化し、企業の持続的成長を支援することを使命としています。`,
    completeURI: 'https://nands.tech/about#company-message'
  },
  historyAccess: {
    fragmentId: 'history-access',
    title: '企業沿革・アクセス',
    content: `企業沿革・アクセス
    
    企業沿革:
    2008年: 株式会社エヌアンドエス設立
    2020年: AI技術分野への本格参入
    2023年: レリバンスエンジニアリング事業開始
    2024年: Mike King理論完全実装達成
    2025年: AI検索最適化サービス本格展開
    
    アクセス情報:
    住所: 〒520-0025 滋賀県大津市皇子が丘２丁目10−25−3004号
    アクセス: 全国対応（オンライン・リモート対応）
    営業時間: 平日 9:00-18:00
    
    お問い合わせ:
    電話: 0120-407-638
    メール: contact@nands.tech
    Web: https://nands.tech`,
    completeURI: 'https://nands.tech/about#history-access'
  }
};

export async function POST() {
  try {
    console.log('🚀 aboutページ専用ベクトル化開始...');
    
    // 1. 既存のaboutページベクトルを削除
    console.log('🗑️ 既存のaboutページベクトルを削除中...');
    
    const { data: deletedData, error: deleteError } = await supabaseServiceRole
      .from('company_vectors')
      .delete()
      .or('fragment_id.like.*about*,content_chunk.like.*会社概要*,content_chunk.like.*代表取締役*')
      .select('id');

    if (deleteError) {
      console.error('❌ 既存ベクトル削除エラー:', deleteError);
    } else {
      const deletedCount = deletedData?.length || 0;
      console.log(`✅ ${deletedCount}個の既存aboutベクトルを削除`);
    }
    
    // 2. OpenAI Embeddings とベクトルストア初期化
    const embeddings = new OpenAIEmbeddings();
    const vectorStore = new SupabaseVectorStore();
    
    let totalVectorized = 0;
    const results = [];
    
    // 3. 各セクションをベクトル化
    for (const [sectionKey, sectionData] of Object.entries(ABOUT_PAGE_CONTENT)) {
      try {
        console.log(`📝 ${sectionData.title} をベクトル化中...`);
        
        // ベクトル化実行
        const embedding = await embeddings.embedSingle(sectionData.content);
        
        const vectorData = {
          id: `about-${sectionData.fragmentId}-${Date.now()}`,
          content: sectionData.content,
          embedding: embedding,
          metadata: {
            url: sectionData.completeURI,
            title: sectionData.title,
            type: 'corporate',
            wordCount: sectionData.content.split(/\s+/).length,
            createdAt: new Date().toISOString(),
            section: sectionData.fragmentId,
            category: 'about'
          }
        };
        
        const result = await vectorStore.saveVector(vectorData);
        totalVectorized++;
        
        results.push({
          section: sectionKey,
          title: sectionData.title,
          fragmentId: sectionData.fragmentId,
          completeURI: sectionData.completeURI,
          status: 'success'
        });
        
        console.log(`✅ ${sectionData.title} ベクトル化完了`);
        
      } catch (error) {
        console.error(`❌ ${sectionData.title} ベクトル化エラー:`, error);
        results.push({
          section: sectionKey,
          title: sectionData.title,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // 4. 統計確認
    const { data: newVectorData } = await supabaseServiceRole
      .from('company_vectors')
      .select('id')
      .eq('content_type', 'corporate');
      
    const newVectorCount = newVectorData?.length || 0;
    
    console.log(`🎯 aboutページベクトル化完了: ${totalVectorized}個作成`);
    console.log(`📊 現在のcorporateベクトル総数: ${newVectorCount}個`);
    
    return NextResponse.json({
      success: true,
      message: 'aboutページのベクトル化が完了しました',
      results: {
        totalVectorized,
        newVectorCount,
        sectionResults: results
      }
    });
    
  } catch (error) {
    console.error('❌ aboutページベクトル化エラー:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 