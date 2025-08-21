import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// OpenAI Embeddings APIの簡易モック（実際の実装では本物のAPIを使用）
async function mockVectorSimilarity(text1: string, text2: string): Promise<number> {
  // 実際の実装では OpenAI Embeddings API を使用
  // ここでは文字列の類似度計算の簡易版
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  
  const intersection = words1.filter(word => words2.includes(word));
  const union = Array.from(new Set([...words1, ...words2]));
  
  return intersection.length / union.length;
}

function keywordSimilarity(service1: string, service2: string): number {
  // 既存のキーワードマッチング手法のモック
  const keywordMap: Record<string, string[]> = {
    'ai-agents': ['ai', 'automation', 'agent', 'intelligent'],
    'vector-rag': ['rag', 'search', 'vector', 'retrieval'],
    'aio-seo': ['seo', 'optimization', 'search', 'ranking'],
    'system-development': ['development', 'system', 'software', 'programming'],
    'chatbot-development': ['chatbot', 'ai', 'conversation', 'automation'],
    'mcp-servers': ['server', 'integration', 'api', 'protocol']
  };
  
  const keywords1 = keywordMap[service1] || [];
  const keywords2 = keywordMap[service2] || [];
  
  const intersection = keywords1.filter(keyword => keywords2.includes(keyword));
  const union = Array.from(new Set([...keywords1, ...keywords2]));
  
  return intersection.length / (union.length || 1);
}

export async function POST(request: NextRequest) {
  try {
    console.log('Starting semantic migration test...');
    
    // テスト対象サービス
    const testServices = [
      'ai-agents',
      'vector-rag', 
      'aio-seo',
      'system-development',
      'chatbot-development',
      'mcp-servers'
    ];

    // サービス説明（実際のRAGデータから取得予定）
    const serviceDescriptions: Record<string, string> = {
      'ai-agents': 'AI エージェント開発 自動化 インテリジェント システム',
      'vector-rag': 'ベクトル RAG 検索 情報取得 AI データベース',
      'aio-seo': 'AI検索最適化 SEO ランキング Web マーケティング',
      'system-development': 'システム開発 ソフトウェア プログラミング アプリケーション',
      'chatbot-development': 'チャットボット開発 AI 対話 自動応答',
      'mcp-servers': 'MCP サーバー API 統合 プロトコル'
    };

    const testResults = {
      vectorResults: [] as Array<{service1: string, service2: string, similarity: number}>,
      keywordResults: [] as Array<{service1: string, service2: string, similarity: number}>,
      hybridResults: [] as Array<{service1: string, service2: string, similarity: number}>
    };

    // 全ペアの組み合わせをテスト
    for (let i = 0; i < testServices.length; i++) {
      for (let j = i + 1; j < testServices.length; j++) {
        const service1 = testServices[i];
        const service2 = testServices[j];
        
        // ベクトル類似度テスト
        const vectorSim = await mockVectorSimilarity(
          serviceDescriptions[service1],
          serviceDescriptions[service2]
        );
        testResults.vectorResults.push({
          service1,
          service2, 
          similarity: vectorSim
        });

        // キーワード類似度テスト
        const keywordSim = keywordSimilarity(service1, service2);
        testResults.keywordResults.push({
          service1,
          service2,
          similarity: keywordSim
        });

        // ハイブリッド類似度（ベクトル70% + キーワード30%）
        const hybridSim = vectorSim * 0.7 + keywordSim * 0.3;
        testResults.hybridResults.push({
          service1,
          service2,
          similarity: hybridSim
        });
      }
    }

    // 精度計算（人間の評価に基づく理想的な類似度と比較）
    const idealSimilarities: Record<string, number> = {
      'ai-agents_chatbot-development': 0.8,
      'ai-agents_vector-rag': 0.7,
      'vector-rag_aio-seo': 0.6,
      'system-development_mcp-servers': 0.7,
      'ai-agents_aio-seo': 0.5,
      'chatbot-development_vector-rag': 0.6
    };

    const calculateAccuracy = (results: Array<{service1: string, service2: string, similarity: number}>): number => {
      let totalError = 0;
      let comparisons = 0;
      
      results.forEach(result => {
        const key1 = `${result.service1}_${result.service2}`;
        const key2 = `${result.service2}_${result.service1}`;
        const ideal = idealSimilarities[key1] || idealSimilarities[key2];
        
        if (ideal !== undefined) {
          const error = Math.abs(result.similarity - ideal);
          totalError += error;
          comparisons++;
        }
      });
      
      return comparisons > 0 ? Math.max(0, (1 - totalError / comparisons)) * 100 : 0;
    };

    const vectorAccuracy = calculateAccuracy(testResults.vectorResults);
    const keywordAccuracy = calculateAccuracy(testResults.keywordResults);
    const hybridAccuracy = calculateAccuracy(testResults.hybridResults);

    // テスト結果をデータベースに保存（オプション）
    const testRecord = {
      test_date: new Date().toISOString(),
      vector_accuracy: vectorAccuracy,
      keyword_accuracy: keywordAccuracy,
      hybrid_accuracy: hybridAccuracy,
      test_pairs: testResults.vectorResults.length
    };

    console.log('Migration test completed:', testRecord);

    return NextResponse.json({
      success: true,
      message: 'セマンティック移行テストを実行しました',
      testResults: {
        vectorAccuracy: Math.round(vectorAccuracy),
        keywordAccuracy: Math.round(keywordAccuracy),
        hybridAccuracy: Math.round(hybridAccuracy)
      },
      detailedResults: {
        testedPairs: testResults.vectorResults.length,
        bestMethod: hybridAccuracy > vectorAccuracy && hybridAccuracy > keywordAccuracy ? 'hybrid' :
                   vectorAccuracy > keywordAccuracy ? 'vector' : 'keyword',
        improvementPotential: Math.round(Math.max(vectorAccuracy, hybridAccuracy) - keywordAccuracy),
        recommendations: [
          hybridAccuracy > vectorAccuracy ? 
            'ハイブリッド方式が最適です' : 
            'ベクトル方式への完全移行を推奨',
          vectorAccuracy > keywordAccuracy ? 
            `ベクトル方式で${Math.round(vectorAccuracy - keywordAccuracy)}%の精度向上が期待できます` : 
            'キーワード方式の改善が必要です'
        ]
      },
      executedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Migration test error:', error);
    return NextResponse.json(
      { 
        error: 'セマンティック移行テストの実行に失敗しました',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 