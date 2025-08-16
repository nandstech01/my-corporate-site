import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service Role Key を使用してRLSをバイパス
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    console.log('🔍 RAG詳細調査開始...');

    // 1. generated_blog詳細調査（削除されたブログ含む）
    const { data: allGeneratedBlogs, error: blogError } = await supabaseServiceRole
      .from('company_vectors')
      .select('id, section_title, created_at, metadata, service_id')
      .eq('content_type', 'generated_blog')
      .order('created_at', { ascending: false });

    if (blogError) {
      console.error('Generated blog vectors error:', blogError);
      return NextResponse.json({ error: blogError.message }, { status: 500 });
    }

    // 2. 実際のpostsテーブルと照合（削除されたブログを特定）
    const { data: existingPosts, error: postsError } = await supabaseServiceRole
      .from('posts')
      .select('id, title, created_at, status')
      .order('created_at', { ascending: false });

    if (postsError) {
      console.error('Posts error:', postsError);
    }

    // 3. service詳細調査（重複確認）
    const { data: allServiceVectors, error: serviceError } = await supabaseServiceRole
      .from('company_vectors')
      .select('id, section_title, created_at, service_id, metadata')
      .eq('content_type', 'service')
      .order('section_title', { ascending: true });

    if (serviceError) {
      console.error('Service vectors error:', serviceError);
      return NextResponse.json({ error: serviceError.message }, { status: 500 });
    }

    // 4. structured-data詳細調査
    const { data: structuredDataVectors, error: structuredError } = await supabaseServiceRole
      .from('company_vectors')
      .select('id, section_title, created_at, metadata, content_chunk')
      .eq('content_type', 'structured-data')
      .order('created_at', { ascending: false });

    if (structuredError) {
      console.error('Structured data vectors error:', structuredError);
    }

    // 5. fragment-id詳細調査
    const { data: fragmentIdVectors, error: fragmentError } = await supabaseServiceRole
      .from('company_vectors')
      .select('id, section_title, created_at, metadata, content_chunk')
      .eq('content_type', 'fragment-id')
      .order('created_at', { ascending: false });

    if (fragmentError) {
      console.error('Fragment ID vectors error:', fragmentError);
    }

    // 6. corporate詳細調査
    const { data: corporateVectors, error: corporateError } = await supabaseServiceRole
      .from('company_vectors')
      .select('id, section_title, created_at, metadata, content_chunk')
      .eq('content_type', 'corporate')
      .order('section_title', { ascending: true });

    if (corporateError) {
      console.error('Corporate vectors error:', corporateError);
    }

    // 7. technical詳細調査
    const { data: technicalVectors, error: technicalError } = await supabaseServiceRole
      .from('company_vectors')
      .select('id, section_title, created_at, metadata, content_chunk')
      .eq('content_type', 'technical')
      .order('section_title', { ascending: true });

    if (technicalError) {
      console.error('Technical vectors error:', technicalError);
    }

    // 分析結果
    const analysis = {
      // generated_blog分析
      generatedBlogAnalysis: {
        totalVectors: allGeneratedBlogs?.length || 0,
        existingPosts: existingPosts?.length || 0,
        potentialOrphans: [],
        recentBlogs: allGeneratedBlogs?.slice(0, 10) || []
      },

      // service分析（重複確認）
      serviceAnalysis: {
        totalVectors: allServiceVectors?.length || 0,
        duplicateGroups: [] as any[],
        uniqueServices: [] as string[],
        serviceDetails: allServiceVectors || []
      },

      // structured-data分析
      structuredDataAnalysis: {
        totalVectors: structuredDataVectors?.length || 0,
        types: [] as any[],
        details: structuredDataVectors?.map(item => ({
          id: item.id,
          title: item.section_title,
          created_at: item.created_at,
          contentPreview: item.content_chunk?.substring(0, 200) + '...',
          metadata: item.metadata
        })) || []
      },

      // fragment-id分析
      fragmentIdAnalysis: {
        totalVectors: fragmentIdVectors?.length || 0,
        details: fragmentIdVectors?.map(item => ({
          id: item.id,
          title: item.section_title,
          created_at: item.created_at,
          contentPreview: item.content_chunk?.substring(0, 200) + '...',
          metadata: item.metadata
        })) || []
      },

      // corporate分析
      corporateAnalysis: {
        totalVectors: corporateVectors?.length || 0,
        details: corporateVectors?.map(item => ({
          id: item.id,
          title: item.section_title,
          created_at: item.created_at,
          contentPreview: item.content_chunk?.substring(0, 200) + '...',
          metadata: item.metadata
        })) || []
      },

      // technical分析
      technicalAnalysis: {
        totalVectors: technicalVectors?.length || 0,
        details: technicalVectors?.map(item => ({
          id: item.id,
          title: item.section_title,
          created_at: item.created_at,
          contentPreview: item.content_chunk?.substring(0, 200) + '...',
          metadata: item.metadata
        })) || []
      }
    };

    // サービス重複グループ化
    if (allServiceVectors) {
      const serviceGroups = allServiceVectors.reduce((acc, vector) => {
        const key = vector.section_title || 'unknown';
        if (!acc[key]) acc[key] = [];
        acc[key].push(vector);
        return acc;
      }, {} as Record<string, any[]>);

      analysis.serviceAnalysis.duplicateGroups = Object.entries(serviceGroups)
        .filter(([_, vectors]) => vectors.length > 1)
        .map(([title, vectors]) => ({
          title,
          count: vectors.length,
          vectors: vectors.map(v => ({
            id: v.id,
            created_at: v.created_at,
            service_id: v.service_id
          }))
        }));

      analysis.serviceAnalysis.uniqueServices = Object.keys(serviceGroups);
    }

    // structured-dataタイプ分析
    if (structuredDataVectors) {
      const typeGroups = structuredDataVectors.reduce((acc, vector) => {
        const metadata = vector.metadata || {};
        const type = metadata.type || metadata.schema_type || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      analysis.structuredDataAnalysis.types = Object.entries(typeGroups).map(([type, count]) => ({
        type,
        count
      }));
    }

    console.log('✅ RAG詳細調査完了');
    console.log(`📊 生成ブログベクトル: ${analysis.generatedBlogAnalysis.totalVectors}`);
    console.log(`📊 サービスベクトル: ${analysis.serviceAnalysis.totalVectors}`);
    console.log(`📊 構造化データベクトル: ${analysis.structuredDataAnalysis.totalVectors}`);
    console.log(`📊 Fragment IDベクトル: ${analysis.fragmentIdAnalysis.totalVectors}`);
    console.log(`📊 Corporateベクトル: ${analysis.corporateAnalysis.totalVectors}`);
    console.log(`📊 Technicalベクトル: ${analysis.technicalAnalysis.totalVectors}`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      analysis
    });

  } catch (error) {
    console.error('❌ Vector details API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch vector details',
      details: (error as Error).message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 