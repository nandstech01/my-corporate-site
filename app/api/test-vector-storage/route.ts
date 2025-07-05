import { NextResponse } from 'next/server';
import { ContentExtractor } from '@/lib/vector/content-extractor';
import { OpenAIEmbeddings } from '@/lib/vector/openai-embeddings';
import { SupabaseVectorStore } from '@/lib/vector/supabase-vector-store';

export async function GET() {
  try {
    console.log('🚀 ベクトル保存テスト開始...');

    // Step 1: Supabase接続テスト
    console.log('🔍 Supabase接続テスト...');
    const vectorStore = new SupabaseVectorStore();
    const connectionTest = await vectorStore.testConnection();
    
    if (!connectionTest.success) {
      return NextResponse.json({
        success: false,
        error: `Supabase接続失敗: ${connectionTest.error}`,
        step: 'connection_test'
      }, { status: 500 });
    }

    console.log('✅ Supabase接続成功');

    // Step 2: 既存のベクトル数を確認
    const existingCount = await vectorStore.getVectorCount();
    console.log(`📊 既存ベクトル数: ${existingCount}`);

    // Step 3: コンテンツ抽出
    console.log('📄 コンテンツ抽出中...');
    const extractor = new ContentExtractor();
    const extractedContents = await extractor.extractAllContent();
    
    console.log(`📊 抽出されたコンテンツ:
  - 総コンテンツ数: ${extractedContents.length}
  - 構造化データ関連: ${extractedContents.filter(c => c.metadata.type === 'structured-data').length}
  - サービスページ: ${extractedContents.filter(c => c.metadata.type === 'service').length}`);

    // Step 4: OpenAI Embeddings でベクトル化（テスト用に最初の3つだけ）
    console.log('🔍 ベクトル化テスト（最初の3つのコンテンツ）...');
    const embeddings = new OpenAIEmbeddings();
    const testContents = extractedContents.slice(0, 3);
    
    const vectorResults = await Promise.all(
      testContents.map(async (content, index) => {
        try {
          const vectorData = await embeddings.createEmbedding(content.content, {
            id: `content-${index}`,
            url: content.url,
            title: content.title,
            type: content.metadata.type,
            wordCount: content.metadata.wordCount,
            section: content.metadata.category,
            createdAt: new Date().toISOString()
          });
          return { success: true, data: vectorData };
        } catch (error) {
          return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error',
            contentId: `content-${index}`
          };
        }
      })
    );

    const successfulVectors = vectorResults.filter(r => r.success);
    const failedVectors = vectorResults.filter(r => !r.success);

    console.log(`📊 ベクトル化結果:
  - 成功: ${successfulVectors.length}
  - 失敗: ${failedVectors.length}`);

    if (failedVectors.length > 0) {
      console.log('❌ ベクトル化エラー:');
      failedVectors.forEach(f => console.log(`  - ${f.contentId}: ${f.error}`));
    }

    // Step 5: ベクトル保存テスト
    if (successfulVectors.length > 0) {
      console.log('💾 ベクトル保存テスト...');
      const vectorsToSave = successfulVectors.map(v => v.data!);
      const saveResult = await vectorStore.saveVectorsBatch(vectorsToSave);

      console.log(`📊 保存結果:
  - 保存成功: ${saveResult.savedCount}/${saveResult.totalCount}
  - 全体成功: ${saveResult.success}`);

      if (saveResult.errors.length > 0) {
        console.log('❌ 保存エラー:');
        saveResult.errors.forEach(error => console.log(`  - ${error}`));
      }

      // Step 6: 保存後のベクトル数を確認
      const finalCount = await vectorStore.getVectorCount();
      console.log(`📊 保存後ベクトル数: ${finalCount} (増加: ${finalCount - existingCount})`);

      // Step 7: 類似検索テスト（最初のベクトルを使用）
      if (saveResult.savedCount > 0) {
        console.log('🔍 類似検索テスト...');
        const firstVector = vectorsToSave[0];
        const searchResults = await vectorStore.searchSimilar(firstVector.embedding, 3);
        
        console.log(`📊 類似検索結果: ${searchResults.length}件`);
        searchResults.forEach((result, index) => {
          console.log(`  ${index + 1}. 類似度: ${result.similarity?.toFixed(3)} - ${result.section_title}`);
        });
      }

      return NextResponse.json({
        success: true,
        message: 'ベクトル保存テスト完了',
        results: {
          connection: connectionTest.success,
          extraction: {
            total: extractedContents.length,
            structuredData: extractedContents.filter(c => c.metadata.type === 'structured-data').length,
            servicePages: extractedContents.filter(c => c.metadata.type === 'service').length
          },
          vectorization: {
            attempted: testContents.length,
            successful: successfulVectors.length,
            failed: failedVectors.length
          },
          storage: {
            attempted: vectorsToSave.length,
            saved: saveResult.savedCount,
            success: saveResult.success,
            errors: saveResult.errors
          },
          vectorCount: {
            before: existingCount,
            after: finalCount,
            increase: finalCount - existingCount
          }
        }
      });

    } else {
      return NextResponse.json({
        success: false,
        error: 'ベクトル化に成功したコンテンツがありません',
        step: 'vectorization'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('ベクトル保存テスト例外:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      step: 'general'
    }, { status: 500 });
  }
} 