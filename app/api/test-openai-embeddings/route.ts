import { NextRequest, NextResponse } from 'next/server';
import { OpenAIEmbeddings } from '@/lib/vector/openai-embeddings';

export async function GET(request: NextRequest) {
  console.log('🚀 OpenAI Embeddings テスト開始...');
  
  try {
    const embeddings = new OpenAIEmbeddings();
    
    // 1. 基本設定の確認
    const usage = await embeddings.getUsage();
    console.log('📊 設定情報:', usage);
    
    // 2. 単一テキストのベクトル化テスト
    console.log('🔍 単一テキストのベクトル化テスト...');
    const testText = 'これはテスト用のテキストです。OpenAI Embeddings APIの動作確認を行います。';
    const vector = await embeddings.embedSingle(testText);
    
    console.log(`✅ ベクトル化成功:`);
    console.log(`  - 入力テキスト: "${testText}"`);
    console.log(`  - ベクトル次元: ${vector.length}次元`);
    console.log(`  - 最初の5次元: [${vector.slice(0, 5).map(v => v.toFixed(6)).join(', ')}...]`);
    
    // 3. バッチテストの準備
    console.log('🔍 バッチベクトル化テスト...');
    const testTexts = [
      'レリバンスエンジニアリングとは、生成AI検索に最適化されたコンテンツ設計手法です。',
      'Mike King理論に基づき、GEO（Generative Engine Optimization）を実現します。',
      'トリプルRAGシステムにより、自社RAG、トレンドRAG、権威RAGを統合します。'
    ];
    
    const vectors = await embeddings.embedBatch(testTexts);
    
    console.log(`✅ バッチベクトル化成功:`);
    console.log(`  - 処理テキスト数: ${testTexts.length}`);
    console.log(`  - 生成ベクトル数: ${vectors.length}`);
    
    // 4. 類似度計算テスト
    const similarity = cosineSimilarity(vectors[0], vectors[1]);
    console.log(`🔍 類似度計算: ${similarity.toFixed(6)}`);
    
    const results = {
      timestamp: new Date().toISOString(),
      success: true,
      usage,
      tests: {
        single_embedding: {
          input: testText,
          dimensions: vector.length,
          sample: vector.slice(0, 5)
        },
        batch_embedding: {
          input_count: testTexts.length,
          output_count: vectors.length,
          dimensions: vectors[0].length
        },
        similarity: {
          vectors_compared: [0, 1],
          score: similarity
        }
      },
      message: 'OpenAI Embeddings テスト完了！'
    };
    
    console.log('✨ OpenAI Embeddings テスト完了！');
    
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('❌ OpenAI Embeddings テストエラー:', error);
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'OpenAI Embeddings テストに失敗しました'
    }, { status: 500 });
  }
}

// コサイン類似度計算関数
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (normA * normB);
} 