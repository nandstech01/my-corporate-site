import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service Role Key を使用してRLSをバイパス
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    console.log('🔍 自社RAG詳細統計取得開始...');

    // 1. company_vectorsの全体統計
    const { data: allVectors, error: allError } = await supabaseServiceRole
      .from('company_vectors')
      .select('id, content_type, created_at, service_id, section_title', { count: 'exact' });

    if (allError) {
      console.error('Company vectors error:', allError);
      return NextResponse.json({ error: allError.message }, { status: 500 });
    }

    // 2. コンテンツタイプ別統計
    const contentTypeStats = allVectors?.reduce((acc, item) => {
      acc[item.content_type] = (acc[item.content_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // 3. 生成ブログの詳細統計
    const { data: generatedBlogs, error: blogError } = await supabaseServiceRole
      .from('company_vectors')
      .select('id, section_title, created_at, metadata')
      .eq('content_type', 'generated_blog')
      .order('created_at', { ascending: false })
      .limit(10);

    if (blogError) {
      console.error('Generated blog error:', blogError);
    }

    // 4. 最新の記事統計（posts テーブルから）
    const { data: recentPosts, error: postsError } = await supabaseServiceRole
      .from('posts')
      .select('id, title, created_at, status, business_id, category_id')
      .order('created_at', { ascending: false })
      .limit(5);

    if (postsError) {
      console.error('Posts error:', postsError);
    }

    // 5. サービス別統計
    const serviceStats = allVectors?.reduce((acc, item) => {
      if (item.content_type === 'service' && item.service_id) {
        acc[item.service_id] = (acc[item.service_id] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>) || {};

    // 6. 時系列統計（週別）
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentStats = {
      total: allVectors?.length || 0,
      last_week: allVectors?.filter(v => new Date(v.created_at) > weekAgo).length || 0,
      last_month: allVectors?.filter(v => new Date(v.created_at) > monthAgo).length || 0
    };

    // 7. Fragment ID・ディープリンク統計
    const { data: fragmentData, error: fragmentError } = await supabaseServiceRole
      .from('company_vectors')
      .select('id, content_chunk, section_title, created_at')
      .eq('content_type', 'fragment-id');

    let fragmentStats = null;
    
    // Fragment IDの詳細分析（ブログ記事 + プロジェクト全体）
    const fragmentDetails: any[] = [];
    let blogDeepLinks = 0;

    // 1. ブログ記事のFragment ID処理
    if (!fragmentError && fragmentData && fragmentData.length > 0) {
      fragmentData.forEach(item => {
        // Fragment IDの抽出
        const fragmentMatches = item.content_chunk.match(/Fragment ID: ([a-zA-Z0-9_-]+)/g) || [];
        const uriMatches = item.content_chunk.match(/完全URI: (https:\/\/[^\s]+)/g) || [];

        fragmentMatches.forEach((match: string, index: number) => {
          const fragmentId = match.replace('Fragment ID: ', '');
          const completeURI = uriMatches[index]?.replace('完全URI: ', '') || '';
          
          fragmentDetails.push({
            id: `blog-${item.id}-${index}`,
            fragmentId,
            completeURI,
            source: item.section_title,
            type: 'ブログ記事',
            created_at: item.created_at
          });
          blogDeepLinks++;
        });
      });
    }

    // 2. プロジェクト全体のFragment ID追加（エンティティマップベース）
    const projectWideDeepLinks = (contentTypeStats.corporate || 0) + 
                                (contentTypeStats.technical || 0) + 
                                (contentTypeStats.service || 0);

    // サービスページのFragment ID（#service）
    const servicePages = [
      'AIエージェント開発サービス', 'システム開発サービス', 'AIO SEO対策サービス',
      'ベクトルRAGシステム開発', 'AIチャットボット開発', 'AI動画生成サービス',
      'HR支援ソリューション', 'SNS自動化システム', 'MCPサーバー開発',
      '個人向けAIリスキリング研修', 'AIサイト開発（Triple RAG統合）',
      'AI副業支援サービス', '法人向けAIソリューション'
    ];

    // 企業情報ページのFragment ID（#company）
    const corporatePages = [
      '企業情報', '会社概要', '持続可能性', 'お客様の声'
    ];

    // 技術情報ページのFragment ID（#company）
    const technicalPages = [
      'よくある質問', '法的情報', 'プライバシーポリシー', '利用規約'
    ];

    // プロジェクト全体Fragment IDを追加
    servicePages.slice(0, contentTypeStats.service || 0).forEach((serviceName, index) => {
      const slug = serviceName === 'AIエージェント開発サービス' ? 'ai-agents' :
                   serviceName === 'システム開発サービス' ? 'system-development' :
                   serviceName === 'AIO SEO対策サービス' ? 'aio-seo' :
                   serviceName === 'ベクトルRAGシステム開発' ? 'vector-rag' :
                   serviceName === 'AIチャットボット開発' ? 'chatbot-development' :
                   serviceName === 'AI動画生成サービス' ? 'video-generation' :
                   serviceName === 'HR支援ソリューション' ? 'hr-solutions' :
                   serviceName === 'SNS自動化システム' ? 'sns-automation' :
                   serviceName === 'MCPサーバー開発' ? 'mcp-servers' :
                   serviceName === '個人向けAIリスキリング研修' ? 'reskilling' :
                   serviceName === 'AIサイト開発（Triple RAG統合）' ? 'ai-site' :
                   serviceName === 'AI副業支援サービス' ? 'fukugyo' :
                   'service';

      fragmentDetails.push({
        id: `service-${index}`,
        fragmentId: 'service',
        completeURI: `https://nands.tech/${slug}#service`,
        source: serviceName,
        type: 'サービスページ',
        created_at: new Date().toISOString()
      });
    });

    corporatePages.slice(0, contentTypeStats.corporate || 0).forEach((pageName, index) => {
      const slug = pageName === '企業情報' ? 'corporate' :
                   pageName === '会社概要' ? 'about' :
                   pageName === '持続可能性' ? 'sustainability' :
                   'reviews';

      fragmentDetails.push({
        id: `corporate-${index}`,
        fragmentId: 'company',
        completeURI: `https://nands.tech/${slug}#company`,
        source: pageName,
        type: '企業情報ページ',
        created_at: new Date().toISOString()
      });
    });

    technicalPages.slice(0, contentTypeStats.technical || 0).forEach((pageName, index) => {
      const slug = pageName === 'よくある質問' ? 'faq' :
                   pageName === '法的情報' ? 'legal' :
                   pageName === 'プライバシーポリシー' ? 'privacy' :
                   'terms';

      fragmentDetails.push({
        id: `technical-${index}`,
        fragmentId: 'company',
        completeURI: `https://nands.tech/${slug}#company`,
        source: pageName,
        type: '技術情報ページ',
        created_at: new Date().toISOString()
      });
    });

    // Fragment ID統計の構築
    if (fragmentDetails.length > 0) {
      fragmentStats = {
        totalRecords: fragmentData?.length || 0,
        totalDeepLinks: blogDeepLinks + projectWideDeepLinks, // ブログ + プロジェクト全体
        blogDeepLinks: blogDeepLinks, // ブログ内のみ
        projectWideDeepLinks: projectWideDeepLinks, // プロジェクト全体（サービス、企業情報等）
        fragmentDetails: fragmentDetails // 全35件を表示可能
      };
    }

    // 8. 検索性能統計（サンプル）
    const searchPerformance = {
      maxSimilarity: 0.95,
      avgSimilarity: 0.78,
      successRate: 1.0
    };

    // 8. レスポンス構成
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      
      // 基本統計
      totalVectors: allVectors?.length || 0,
      vectorsByType: contentTypeStats,
      searchPerformance,
      
      // Fragment ID・ディープリンク統計
      fragmentStats,
      
      // 詳細統計
      detailedStats: {
        contentTypes: {
          generated_blog: {
            count: contentTypeStats.generated_blog || 0,
            percentage: ((contentTypeStats.generated_blog || 0) / (allVectors?.length || 1) * 100).toFixed(1)
          },
          service: {
            count: contentTypeStats.service || 0,
            percentage: ((contentTypeStats.service || 0) / (allVectors?.length || 1) * 100).toFixed(1)
          },
          'structured-data': {
            count: contentTypeStats['structured-data'] || 0,
            percentage: ((contentTypeStats['structured-data'] || 0) / (allVectors?.length || 1) * 100).toFixed(1)
          },
          corporate: {
            count: contentTypeStats.corporate || 0,
            percentage: ((contentTypeStats.corporate || 0) / (allVectors?.length || 1) * 100).toFixed(1)
          },
          technical: {
            count: contentTypeStats.technical || 0,
            percentage: ((contentTypeStats.technical || 0) / (allVectors?.length || 1) * 100).toFixed(1)
          },
          'fragment-id': {
            count: contentTypeStats['fragment-id'] || 0,
            percentage: ((contentTypeStats['fragment-id'] || 0) / (allVectors?.length || 1) * 100).toFixed(1)
          }
        },
        
        serviceBreakdown: serviceStats,
        
        timeSeriesStats: recentStats,
        
        recentActivity: {
          latest_generated_blogs: generatedBlogs?.map(blog => ({
            id: blog.id,
            title: blog.section_title,
            created_at: blog.created_at,
            metadata: blog.metadata
          })) || [],
          
          latest_posts: recentPosts?.map(post => ({
            id: post.id,
            title: post.title,
            created_at: post.created_at,
            status: post.status,
            business_id: post.business_id,
            category_id: post.category_id
          })) || []
        }
      },

      
      // システム情報
      systemInfo: {
        database_connection: 'OK',
        last_updated: new Date().toISOString(),
        vector_dimensions: 1536,
        embedding_model: 'text-embedding-3-large'
      }
    };

    console.log(`✅ 統計取得完了: 総ベクトル数 ${response.totalVectors}`);
    console.log(`📊 コンテンツタイプ別:`, contentTypeStats);

    // キャッシュ制御
    const nextResponse = NextResponse.json(response);
    nextResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    nextResponse.headers.set('Pragma', 'no-cache');
    nextResponse.headers.set('Expires', '0');

    return nextResponse;

  } catch (error) {
    console.error('❌ Vector stats API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch vector statistics',
      details: (error as Error).message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 