import { NextResponse } from 'next/server';
import { ContentExtractor } from '@/lib/vector/content-extractor';
import { OpenAIEmbeddings } from '@/lib/vector/openai-embeddings';
import { SupabaseVectorStore } from '@/lib/vector/supabase-vector-store';

export async function POST() {
  try {
    console.log('🚀 全コンテンツベクトル化開始...');
    
    // 1. コンテンツ抽出
    const contentExtractor = new ContentExtractor();
    const contents = await contentExtractor.extractAllContent();
    console.log(`📄 抽出されたコンテンツ数: ${contents.length}`);
    
    // 2. OpenAI Embeddings初期化
    const embeddings = new OpenAIEmbeddings();
    
    // 3. SupabaseVectorStore初期化
    const vectorStore = new SupabaseVectorStore();
    
    // 4. 全コンテンツをベクトル化
    console.log(`🔄 ${contents.length}個のコンテンツをベクトル化中...`);
    const allVectors = await embeddings.processExtractedContent(contents);
    
    console.log(`🎯 総ベクトル数: ${allVectors.length}`);
    
    // 5. 全ベクトルを保存
    console.log('💾 全ベクトルを保存中...');
    const saveResults = [];
    let successCount = 0;
    let failureCount = 0;
    
    for (const vector of allVectors) {
      try {
        const result = await vectorStore.saveVector(vector);
        saveResults.push(result);
        successCount++;
        console.log(`✅ ベクトル保存成功: ${vector.metadata.title} (ID: ${result.id})`);
      } catch (error) {
        console.error(`❌ ベクトル保存エラー: ${vector.metadata.title}`, error);
        failureCount++;
      }
    }
    
    console.log(`✅ 全コンテンツベクトル化完了！成功: ${successCount}, 失敗: ${failureCount}`);
    
    return NextResponse.json({
      success: true,
      message: '全コンテンツベクトル化完了',
      results: {
        totalContent: contents.length,
        totalVectors: allVectors.length,
        saveResults: {
          success: successCount,
          failed: failureCount,
          total: allVectors.length
        },
        contentBreakdown: {
          structured: contents.filter(c => c.metadata.type === 'structured-data').length,
          services: contents.filter(c => c.metadata.type === 'service').length,
          others: contents.filter(c => !['structured-data', 'service'].includes(c.metadata.type)).length
        }
      }
    });
    
  } catch (error) {
    console.error('❌ 全コンテンツベクトル化エラー:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '不明なエラー'
    }, { status: 500 });
  }
} 