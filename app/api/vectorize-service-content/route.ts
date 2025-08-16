import { NextResponse } from 'next/server';
import { ContentExtractor } from '@/lib/vector/content-extractor';
import { OpenAIEmbeddings } from '@/lib/vector/openai-embeddings';
import { SupabaseVectorStore } from '@/lib/vector/supabase-vector-store';
import { createClient } from '@supabase/supabase-js';

// Service Role Key を使用してRLSをバイパス
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    console.log('🔄 サービス内容再ベクトル化開始...');
    
    // 1. 既存のサービスベクトルを完全削除
    console.log('🗑️ 既存のサービスベクトルを削除中...');
    const { data: deletedData, error: deleteError } = await supabaseServiceRole
      .from('company_vectors')
      .delete()
      .eq('content_type', 'service')
      .select('id');

    if (deleteError) {
      console.error('❌ サービスベクトル削除エラー:', deleteError);
      return NextResponse.json({
        success: false,
        error: `削除エラー: ${deleteError.message}`
      }, { status: 500 });
    }

    const deletedCount = deletedData?.length || 0;
    console.log(`✅ ${deletedCount}個の既存サービスベクトルを削除`);

    // 2. サービスページのみを抽出
    const contentExtractor = new ContentExtractor();
    const serviceContents = await contentExtractor.extractServicePages();
    console.log(`📄 抽出されたサービスページ数: ${serviceContents.length}`);

    if (serviceContents.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'サービスページが見つかりません'
      }, { status: 404 });
    }

    // 3. OpenAI Embeddings初期化
    const embeddings = new OpenAIEmbeddings();
    
    // 4. SupabaseVectorStore初期化
    const vectorStore = new SupabaseVectorStore();
    
    // 5. サービスコンテンツのみをベクトル化
    console.log(`🔄 ${serviceContents.length}個のサービスページをベクトル化中...`);
    const serviceVectors = await embeddings.processExtractedContent(serviceContents);
    
    console.log(`🎯 生成されたサービスベクトル数: ${serviceVectors.length}`);
    
    // 6. 新しいサービスベクトルを保存
    console.log('💾 新しいサービスベクトルを保存中...');
    const saveResults = [];
    let successCount = 0;
    let failureCount = 0;
    
    for (const vector of serviceVectors) {
      try {
        const result = await vectorStore.saveVector(vector);
        saveResults.push(result);
        successCount++;
        console.log(`✅ サービスベクトル保存成功: ${vector.metadata.title} (ID: ${result.id})`);
      } catch (error) {
        console.error(`❌ サービスベクトル保存エラー: ${vector.metadata.title}`, error);
        failureCount++;
      }
    }
    
    console.log(`✅ サービス再ベクトル化完了！削除: ${deletedCount}, 新規作成: ${successCount}, 失敗: ${failureCount}`);
    
    return NextResponse.json({
      success: true,
      message: 'サービス内容再ベクトル化完了',
      results: {
        deletedVectors: deletedCount,
        extractedPages: serviceContents.length,
        generatedVectors: serviceVectors.length,
        saveResults: {
          success: successCount,
          failed: failureCount,
          total: serviceVectors.length
        },
        servicePages: serviceContents.map(content => ({
          url: content.url,
          title: content.title,
          wordCount: content.metadata.wordCount
        }))
      }
    });
    
  } catch (error) {
    console.error('❌ サービス再ベクトル化エラー:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '不明なエラー'
    }, { status: 500 });
  }
} 