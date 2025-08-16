import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get('content_type');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!contentType) {
      return NextResponse.json({ error: 'content_type parameter is required' }, { status: 400 });
    }

    // company_vectorsから指定されたcontent_typeの詳細データを取得
    const { data: vectors, error } = await supabase
      .from('company_vectors')
      .select('id, section_title, content_chunk, created_at, metadata')
      .eq('content_type', contentType)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Vector details fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch vector details' }, { status: 500 });
    }

    // コンテンツタイプ別の追加情報を取得
    let additionalData = null;
    
    if (contentType === 'generated_blog') {
      // 生成ブログの場合、postsテーブルから追加情報を取得
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('id, title, slug, status, published_at, category_id, business_id')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (!postsError && posts) {
        additionalData = posts;
      }
    } else if (contentType === 'service') {
      // サービスの場合、businessesテーブルから追加情報を取得
      const { data: businesses, error: businessesError } = await supabase
        .from('businesses')
        .select('id, name, description, category, created_at')
        .order('created_at', { ascending: false });
      
      if (!businessesError && businesses) {
        additionalData = businesses;
      }
    }

    // 結果の整形
    const formattedData = vectors?.map((vector, index) => {
      const baseData = {
        id: vector.id,
        title: vector.section_title || `Vector ${vector.id}`,
        content_preview: vector.content_chunk ? vector.content_chunk.substring(0, 150) + '...' : '',
        created_at: vector.created_at,
        metadata: vector.metadata
      };

      // 追加データがある場合はマージ
      if (additionalData && additionalData[index]) {
        return {
          ...baseData,
          additional_info: additionalData[index]
        };
      }

      return baseData;
    }) || [];

    return NextResponse.json({
      success: true,
      content_type: contentType,
      total_count: vectors?.length || 0,
      data: formattedData
    });

  } catch (error) {
    console.error('Vector details API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 