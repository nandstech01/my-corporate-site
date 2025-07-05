import { NextRequest, NextResponse } from 'next/server';
import { OpenAIEmbeddings } from '@/lib/vector/openai-embeddings';
import { ContentExtractor } from '@/lib/vector/content-extractor';

export async function GET(request: NextRequest) {
  console.log('🚀 コンテンツベクトル化テスト開始...');
  
  try {
    // 1. コンテンツ抽出
    console.log('📄 コンテンツ抽出中...');
    const extractor = new ContentExtractor();
    const allContents = await extractor.extractAllContent();
    
    // 2. レリバンスエンジニアリング関連ファイルのみを対象
    const structuredDataContents = allContents.filter(content => 
      content.metadata.type === 'structured-data'
    );
    
    console.log(`📊 抽出されたコンテンツ:`);
    console.log(`  - 総コンテンツ数: ${allContents.length}`);
    console.log(`  - RE関連ファイル数: ${structuredDataContents.length}`);
    
    // 3. テスト用に小さなサンプルを選択（最初の2ファイル）
    const sampleContents = structuredDataContents.slice(0, 2);
    
    console.log(`🔍 ベクトル化対象:`);
    sampleContents.forEach((content, index) => {
      console.log(`  ${index + 1}. ${content.title} (${content.content.length}文字)`);
    });
    
    // 4. OpenAI Embeddings でベクトル化
    console.log('🔄 ベクトル化実行中...');
    const embeddings = new OpenAIEmbeddings();
    const vectorData = await embeddings.processExtractedContent(sampleContents);
    
    console.log('✅ ベクトル化完了！');
    
    // 5. 結果の詳細分析
    const results = {
      timestamp: new Date().toISOString(),
      success: true,
      summary: {
        total_content_files: allContents.length,
        structured_data_files: structuredDataContents.length,
        processed_files: sampleContents.length,
        generated_vectors: vectorData.length,
        total_chunks: vectorData.length,
        average_chunk_size: vectorData.reduce((sum, data) => sum + data.metadata.wordCount, 0) / vectorData.length
      },
      processed_content: sampleContents.map(content => ({
        url: content.url,
        title: content.title,
        type: content.metadata.type,
        content_length: content.content.length,
        word_count: content.metadata.wordCount
      })),
      vector_data: vectorData.map(data => ({
        id: data.id,
        url: data.metadata.url,
        title: data.metadata.title,
        type: data.metadata.type,
        word_count: data.metadata.wordCount,
        vector_dimensions: data.embedding.length,
        embedding_sample: data.embedding.slice(0, 5) // 最初の5次元のみ
      })),
      message: 'コンテンツベクトル化テスト完了！'
    };
    
    console.log(`📊 最終結果:`);
    console.log(`  - 処理ファイル数: ${sampleContents.length}`);
    console.log(`  - 生成ベクトル数: ${vectorData.length}`);
    console.log(`  - 平均チャンクサイズ: ${results.summary.average_chunk_size.toFixed(0)}語`);
    
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('❌ コンテンツベクトル化テストエラー:', error);
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'コンテンツベクトル化テストに失敗しました'
    }, { status: 500 });
  }
} 