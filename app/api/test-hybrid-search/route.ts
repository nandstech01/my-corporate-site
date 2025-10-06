import { NextRequest, NextResponse } from 'next/server';
import { HybridSearchSystem } from '@/lib/vector/hybrid-search';

/**
 * ハイブリッド検索テストAPI
 * Before/After比較用
 */
export async function POST(request: NextRequest) {
  try {
    const { query, source = 'company', limit = 5 } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'クエリが必要です' },
        { status: 400 }
      );
    }

    console.log(`\n========================================`);
    console.log(`🧪 ハイブリッド検索テスト`);
    console.log(`Query: "${query}"`);
    console.log(`Source: ${source}`);
    console.log(`========================================\n`);

    const hybridSearch = new HybridSearchSystem();

    const results = await hybridSearch.search({
      query,
      source,
      limit,
      threshold: 0.1, // 低めに設定してより多くの結果を表示
      bm25Weight: 0.4,
      vectorWeight: 0.6,
      recencyWeight: source === 'trend' ? 0.3 : undefined
    });

    // 結果を見やすくフォーマット
    const formattedResults = results.map((r, index) => ({
      rank: index + 1,
      content: r.content.substring(0, 200) + '...',
      scores: {
        bm25: r.bm25Score.toFixed(4),
        vector: r.vectorScore.toFixed(4),
        recency: r.recencyScore?.toFixed(4),
        combined: r.combinedScore.toFixed(4)
      },
      metadata: {
        contentType: r.contentType,
        createdAt: r.createdAt
      }
    }));

    console.log(`\n📊 検索結果: ${results.length}件\n`);
    formattedResults.forEach(r => {
      console.log(`${r.rank}. [Combined: ${r.scores.combined}] BM25: ${r.scores.bm25} | Vector: ${r.scores.vector}${r.scores.recency ? ` | Recency: ${r.scores.recency}` : ''}`);
      console.log(`   ${r.content}\n`);
    });

    return NextResponse.json({
      success: true,
      query,
      source,
      totalResults: results.length,
      results: formattedResults,
      weights: {
        bm25: 0.4,
        vector: 0.6,
        recency: source === 'trend' ? 0.3 : undefined
      }
    });
  } catch (error: any) {
    console.error('❌ ハイブリッド検索テストエラー:', error);
    return NextResponse.json(
      {
        error: 'ハイブリッド検索テスト失敗',
        details: error.message
      },
      { status: 500 }
    );
  }
}

