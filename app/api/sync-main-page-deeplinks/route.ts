import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service Role Key を使用してRLSをバイパス
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// メインページの15個のFragment ID定義
const MAIN_PAGE_FRAGMENTS = [
  // サービス12項目
  {
    fragmentId: 'service-system-development',
    completeURI: 'https://nands.tech/#service-system-development',
    pagePath: '/',
    title: 'システム開発サービス'
  },
  {
    fragmentId: 'service-aio-seo',
    completeURI: 'https://nands.tech/#service-aio-seo',
    pagePath: '/',
    title: 'AIO SEO対策サービス'
  },
  {
    fragmentId: 'service-chatbot-development',
    completeURI: 'https://nands.tech/#service-chatbot-development',
    pagePath: '/',
    title: 'チャットボット開発サービス'
  },
  {
    fragmentId: 'service-vector-rag',
    completeURI: 'https://nands.tech/#service-vector-rag',
    pagePath: '/',
    title: 'ベクトルRAGシステム開発'
  },
  {
    fragmentId: 'service-ai-side-business',
    completeURI: 'https://nands.tech/#service-ai-side-business',
    pagePath: '/',
    title: 'AI副業・フリーランス支援'
  },
  {
    fragmentId: 'service-hr-support',
    completeURI: 'https://nands.tech/#service-hr-support',
    pagePath: '/',
    title: 'HR支援・退職代行サービス'
  },
  {
    fragmentId: 'service-ai-agents',
    completeURI: 'https://nands.tech/#service-ai-agents',
    pagePath: '/',
    title: 'AIエージェント開発サービス'
  },
  {
    fragmentId: 'service-mcp-servers',
    completeURI: 'https://nands.tech/#service-mcp-servers',
    pagePath: '/',
    title: 'MCPサーバー開発サービス'
  },
  {
    fragmentId: 'service-sns-automation',
    completeURI: 'https://nands.tech/#service-sns-automation',
    pagePath: '/',
    title: 'SNS自動化システム'
  },
  {
    fragmentId: 'service-video-generation',
    completeURI: 'https://nands.tech/#service-video-generation',
    pagePath: '/',
    title: 'AI動画生成サービス'
  },
  {
    fragmentId: 'service-corporate-reskilling',
    completeURI: 'https://nands.tech/#service-corporate-reskilling',
    pagePath: '/',
    title: '法人向けAIリスキリング研修'
  },
  {
    fragmentId: 'service-individual-reskilling',
    completeURI: 'https://nands.tech/#service-individual-reskilling',
    pagePath: '/',
    title: '個人向けAIリスキリング研修'
  },
  
  // AIサイト3項目
  {
    fragmentId: 'nands-ai-site',
    completeURI: 'https://nands.tech/#nands-ai-site',
    pagePath: '/',
    title: 'NANDS AI サイト'
  },
  {
    fragmentId: 'ai-site-features',
    completeURI: 'https://nands.tech/#ai-site-features',
    pagePath: '/',
    title: 'AI サイト機能'
  },
  {
    fragmentId: 'ai-site-technology',
    completeURI: 'https://nands.tech/#ai-site-technology',
    pagePath: '/',
    title: 'AI サイト技術'
  }
];

export async function POST() {
  try {
    console.log('🔄 メインページディープリンク同期開始...');
    
    let insertedCount = 0;
    let updatedCount = 0;
    const results = [];
    
    // 各Fragment IDをdeeplink_analyticsテーブルに追加
    for (const fragment of MAIN_PAGE_FRAGMENTS) {
      try {
        const { data, error } = await supabaseServiceRole
          .from('deeplink_analytics')
          .upsert({
            fragment_id: fragment.fragmentId,
            complete_uri: fragment.completeURI,
            page_path: fragment.pagePath,
            click_count: 0,
            ai_quotation_count: 0,
            similarity_score: 0.88, // サービス系の標準類似度
            social_shares: 0,
            video_embeddings: 0,
            line_shares: 0,
            conversion_count: 0,
            form_submissions: 0,
            created_at: new Date().toISOString(),
            last_updated: new Date().toISOString()
          }, {
            onConflict: 'fragment_id,page_path'
          })
          .select()
          .single();
        
        if (error) {
          console.error(`❌ ${fragment.fragmentId} 同期エラー:`, error);
          results.push({
            fragmentId: fragment.fragmentId,
            title: fragment.title,
            status: 'error',
            error: error.message
          });
        } else {
          // 新規作成か更新かを判定（簡易的）
          const isNew = !data.id || data.created_at === data.last_updated;
          if (isNew) {
            insertedCount++;
          } else {
            updatedCount++;
          }
          
          results.push({
            fragmentId: fragment.fragmentId,
            title: fragment.title,
            completeURI: fragment.completeURI,
            status: 'success'
          });
          
          console.log(`✅ ${fragment.fragmentId} 同期完了`);
        }
        
      } catch (error) {
        console.error(`❌ ${fragment.fragmentId} 処理エラー:`, error);
        results.push({
          fragmentId: fragment.fragmentId,
          title: fragment.title,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // 最終統計確認
    const { data: finalCount } = await supabaseServiceRole
      .from('deeplink_analytics')
      .select('id')
      .in('fragment_id', MAIN_PAGE_FRAGMENTS.map(f => f.fragmentId));
      
    const totalSynced = finalCount?.length || 0;
    
    console.log(`🎯 メインページディープリンク同期完了: ${totalSynced}個`);
    console.log(`📊 新規追加: ${insertedCount}個, 更新: ${updatedCount}個`);
    
    return NextResponse.json({
      success: true,
      message: 'メインページディープリンク同期が正常に完了しました',
      results: {
        totalSynced,
        insertedCount,
        updatedCount,
        details: results
      }
    });
    
  } catch (error) {
    console.error('❌ ディープリンク同期エラー:', error);
    
    return NextResponse.json({
      success: false,
      error: 'ディープリンク同期に失敗しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 