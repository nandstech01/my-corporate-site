import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    console.log('🔍 直接Supabase接続テスト開始...');

    // 新しいSupabaseインスタンスを作成
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // テスト1: 全ベクトル数を取得
    const { data: allData, error: allError } = await supabase
      .from('company_vectors')
      .select('id');

    if (allError) {
      console.error('全ベクトル取得エラー:', allError);
      return NextResponse.json({
        success: false,
        error: allError.message
      }, { status: 500 });
    }

    console.log(`🔍 全ベクトル数: ${allData?.length || 0}`);

    // テスト2: 最新10件のIDを取得
    const { data: recentData, error: recentError } = await supabase
      .from('company_vectors')
      .select('id, page_slug, content_type')
      .order('id', { ascending: false })
      .limit(10);

    if (recentError) {
      console.error('最新ベクトル取得エラー:', recentError);
    }

    console.log('🔍 最新10件:');
    recentData?.forEach((v, i) => {
      console.log(`  ${i + 1}. ID: ${v.id}, Slug: ${v.page_slug}, Type: ${v.content_type}`);
    });

    // テスト3: コンテンツタイプ別の数を取得
    const { data: serviceData, error: serviceError } = await supabase
      .from('company_vectors')
      .select('id')
      .eq('content_type', 'service');

    const serviceCount = serviceData?.length || 0;
    console.log(`🔍 サービス型ベクトル数: ${serviceCount}`);

    return NextResponse.json({
      success: true,
      results: {
        totalVectors: allData?.length || 0,
        serviceVectors: serviceCount,
        recentVectors: recentData?.map(v => ({
          id: v.id,
          pageSlug: v.page_slug,
          contentType: v.content_type
        })) || [],
        allVectorIds: allData?.map(v => v.id) || []
      }
    });

  } catch (error) {
    console.error('直接Supabase接続エラー:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 