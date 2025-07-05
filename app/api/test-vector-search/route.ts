import { NextResponse } from 'next/server';
import { OpenAIEmbeddings } from '@/lib/vector/openai-embeddings';
import { SupabaseVectorStore } from '@/lib/vector/supabase-vector-store';

export async function GET() {
  try {
    console.log('🔍 ベクトル類似検索テスト開始...');

    // Step 1: テスト用の検索クエリ
    const testQueries = [
      'AIエージェント開発の技術的な詳細について',
      'チャットボットの開発方法',
      'ベクトル検索システムの構築',
      'レリバンスエンジニアリングの手法'
    ];

    const embeddings = new OpenAIEmbeddings();
    const vectorStore = new SupabaseVectorStore();

    const searchResults = [];

    for (const query of testQueries) {
      console.log(`🔍 検索クエリ: "${query}"`);
      
      // Step 2: クエリをベクトル化
      const queryVector = await embeddings.embedSingle(query);
      console.log(`📊 クエリベクトル次元: ${queryVector.length}`);

      // Step 3: 類似検索実行
      const similarResults = await vectorStore.searchSimilar(queryVector, 3, 0.1);
      
      console.log(`📊 類似検索結果: ${similarResults.length}件`);
      similarResults.forEach((result, index) => {
        console.log(`  ${index + 1}. 類似度: ${result.similarity?.toFixed(3)} - ${result.page_slug} (${result.content_type})`);
      });

      searchResults.push({
        query,
        results: similarResults.map(r => ({
          id: r.id,
          pageSlug: r.page_slug,
          contentType: r.content_type,
          sectionTitle: r.section_title,
          similarity: r.similarity,
          contentPreview: r.content_chunk?.substring(0, 100) + '...'
        }))
      });
    }

    // Step 4: 保存されているベクトルの統計情報
    const vectorCount = await vectorStore.getVectorCount();
    console.log(`📊 総ベクトル数: ${vectorCount}`);

    return NextResponse.json({
      success: true,
      message: 'ベクトル類似検索テスト完了',
      results: {
        totalVectors: vectorCount,
        queries: searchResults,
        summary: {
          totalQueries: testQueries.length,
          avgResultsPerQuery: searchResults.reduce((sum, r) => sum + r.results.length, 0) / testQueries.length,
          avgSimilarity: searchResults.reduce((sum, r) => 
            sum + r.results.reduce((s, res) => s + (res.similarity || 0), 0) / r.results.length, 0
          ) / searchResults.length
        }
      }
    });

  } catch (error) {
    console.error('ベクトル類似検索テスト例外:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      step: 'search_test'
    }, { status: 500 });
  }
} 