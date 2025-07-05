import { OpenAIEmbeddings } from './openai-embeddings';

export async function testEmbeddings() {
  console.log('🚀 OpenAI Embeddings テスト開始...');
  
  try {
    const embeddings = new OpenAIEmbeddings();
    
    // 1. 基本設定の確認
    const usage = await embeddings.getUsage();
    console.log('📊 設定情報:', usage);
    
    // 2. 単一テキストのベクトル化テスト
    console.log('\\n🔍 単一テキストのベクトル化テスト...');
    const testText = 'これはテスト用のテキストです。OpenAI Embeddings APIの動作確認を行います。';
    const vector = await embeddings.embedSingle(testText);
    
    console.log(`✅ ベクトル化成功:`);
    console.log(`  - 入力テキスト: "${testText}"`);
    console.log(`  - ベクトル次元: ${vector.length}次元`);
    console.log(`  - 最初の5次元: [${vector.slice(0, 5).map(v => v.toFixed(6)).join(', ')}...]`);
    
    // 3. バッチテストの準備
    console.log('\\n🔍 バッチベクトル化テスト...');
    const testTexts = [
      'レリバンスエンジニアリングとは、生成AI検索に最適化されたコンテンツ設計手法です。',
      'Mike King理論に基づき、GEO（Generative Engine Optimization）を実現します。',
      'トリプルRAGシステムにより、自社RAG、トレンドRAG、権威RAGを統合します。'
    ];
    
    const vectors = await embeddings.embedBatch(testTexts);
    
    console.log(`✅ バッチベクトル化成功:`);
    console.log(`  - 処理テキスト数: ${testTexts.length}`);
    console.log(`  - 生成ベクトル数: ${vectors.length}`);
    
    for (let i = 0; i < vectors.length; i++) {
      console.log(`  - テキスト${i + 1}: ${vectors[i].length}次元`);
    }
    
    // 4. 類似度計算テスト
    console.log('\\n🔍 類似度計算テスト...');
    const similarity = cosineSimilarity(vectors[0], vectors[1]);
    console.log(`  - テキスト1と2の類似度: ${similarity.toFixed(6)}`);
    
    console.log('\\n✨ OpenAI Embeddings テスト完了！');
    
    return {
      success: true,
      usage,
      testResults: {
        singleEmbedding: {
          dimensions: vector.length,
          sample: vector.slice(0, 5)
        },
        batchEmbedding: {
          count: vectors.length,
          dimensions: vectors[0].length
        },
        similarity
      }
    };
    
  } catch (error) {
    console.error('❌ OpenAI Embeddings テストエラー:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// コサイン類似度計算関数
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (normA * normB);
}

// 実際のコンテンツ抽出システムとの統合テスト
export async function testContentIntegration() {
  console.log('🚀 コンテンツ統合テスト開始...');
  
  try {
    // ContentExtractorの動的import
    const { ContentExtractor } = await import('./content-extractor');
    const embeddings = new OpenAIEmbeddings();
    
    const extractor = new ContentExtractor();
    
    // 小さなテストケース: 1つのサービスページだけ
    console.log('📄 テスト用コンテンツ抽出...');
    const allContents = await extractor.extractAllContent();
    
    // レリバンスエンジニアリング関連ファイルから1つだけテスト
    const testContents = allContents
      .filter(content => content.metadata.type === 'structured-data')
      .slice(0, 1); // 最初の1つだけ
    
    console.log(`📊 テスト対象: ${testContents.length}ファイル`);
    
    if (testContents.length > 0) {
      // ベクトル化実行
      const vectorData = await embeddings.processExtractedContent(testContents);
      
      console.log(`✅ ベクトル化完了:`);
      console.log(`  - 処理ファイル数: ${testContents.length}`);
      console.log(`  - 生成ベクトル数: ${vectorData.length}`);
      
      vectorData.forEach((data, index) => {
        console.log(`  - ベクトル${index + 1}:`);
        console.log(`    - ID: ${data.id}`);
        console.log(`    - URL: ${data.metadata.url}`);
        console.log(`    - タイトル: ${data.metadata.title}`);
        console.log(`    - 単語数: ${data.metadata.wordCount}`);
        console.log(`    - ベクトル次元: ${data.embedding.length}`);
      });
      
      return {
        success: true,
        vectorData
      };
    } else {
      console.log('⚠️ テスト対象ファイルが見つかりませんでした');
      return {
        success: false,
        error: 'No test content found'
      };
    }
    
  } catch (error) {
    console.error('❌ コンテンツ統合テストエラー:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 