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
    if (!fragmentError && fragmentData && fragmentData.length > 0) {
      // Fragment IDの詳細分析
      const fragmentDetails: any[] = [];
      let totalDeepLinks = 0;

      fragmentData.forEach(item => {
        // Fragment IDの抽出
        const fragmentMatches = item.content_chunk.match(/Fragment ID: ([a-zA-Z0-9_-]+)/g) || [];
        const uriMatches = item.content_chunk.match(/完全URI: (https:\/\/[^\s]+)/g) || [];

        fragmentMatches.forEach((match: string, index: number) => {
          const fragmentId = match.replace('Fragment ID: ', '');
          const completeURI = uriMatches[index]?.replace('完全URI: ', '') || '';
          
          fragmentDetails.push({
            id: `${item.id}-${index}`,
            fragmentId,
            completeURI,
            source: item.section_title,
            created_at: item.created_at
          });
          totalDeepLinks++;
        });
      });

      // 今後のプロジェクト全体ディープリンク計算のため
      // Corporate (4) + Technical (4) + Service (11) の#companyディープリンクも考慮
      const projectWideDeepLinks = (contentTypeStats.corporate || 0) + 
                                  (contentTypeStats.technical || 0) + 
                                  (contentTypeStats.service || 0);

      fragmentStats = {
        totalRecords: fragmentData.length,
        totalDeepLinks: totalDeepLinks + projectWideDeepLinks, // ブログ + プロジェクト全体
        blogDeepLinks: totalDeepLinks, // ブログ内のみ
        projectWideDeepLinks: projectWideDeepLinks, // プロジェクト全体（サービス、企業情報等）
        fragmentDetails: fragmentDetails.slice(0, 20) // 最大20件表示
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