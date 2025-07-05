import { NextResponse } from 'next/server';
import { SupabaseVectorStore } from '@/lib/vector/supabase-vector-store';

interface VectorDebugInfo {
  id: number;
  page_slug: string;
  content_type: string;
}

export async function GET() {
  try {
    console.log('🔍 データベース状態デバッグ開始...');

    const vectorStore = new SupabaseVectorStore();

    // 1. 接続テスト
    const connectionTest = await vectorStore.testConnection();
    console.log(`🔌 接続テスト: ${connectionTest.success ? 'Success' : 'Failed'}`);

    // 2. ベクトル数確認
    const totalCount = await vectorStore.getVectorCount();
    console.log(`📊 getVectorCount(): ${totalCount}`);

    // 3. 直接Supabaseクエリでデータ確認
    const supabase = (vectorStore as any).supabase;
    const { data: allVectors, error } = await supabase
      .from('company_vectors')
      .select('id, page_slug, content_type')
      .order('id', { ascending: true });

    if (error) {
      console.error('直接クエリエラー:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    console.log(`📊 直接クエリ結果: ${allVectors?.length || 0}件`);

    // 4. 最新5件の詳細
    const latest5 = allVectors?.slice(-5) || [];
    console.log('📊 最新5件:');
    latest5.forEach((v: VectorDebugInfo) => {
      console.log(`  ID: ${v.id}, Slug: ${v.page_slug}, Type: ${v.content_type}`);
    });

    // 5. コンテンツタイプ別の分布
    const typeDistribution = allVectors?.reduce((acc: Record<string, number>, v: VectorDebugInfo) => {
      acc[v.content_type] = (acc[v.content_type] || 0) + 1;
      return acc;
    }, {}) || {};

    return NextResponse.json({
      success: true,
      debug: {
        connection: connectionTest,
        getVectorCount: totalCount,
        directQueryCount: allVectors?.length || 0,
        typeDistribution,
        latest5Vectors: latest5,
        allVectorIds: allVectors?.map((v: VectorDebugInfo) => v.id) || []
      }
    });

  } catch (error) {
    console.error('デバッグエラー:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 