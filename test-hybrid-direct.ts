/**
 * ハイブリッド検索の直接テスト
 * 開発サーバーを経由せずに問題を切り分ける
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { OpenAIEmbeddings } from './lib/vector/openai-embeddings';

// .env.localを読み込み
config({ path: resolve(process.cwd(), '.env.local') });

async function testHybridSearchDirect() {
  console.log('\n🧪 ハイブリッド検索 直接テスト開始\n');

  // Supabase接続
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  console.log(`🔧 環境変数チェック:`);
  console.log(`  - SUPABASE_URL: ${supabaseUrl ? '✅ 設定済み' : '❌ 未設定'}`);
  console.log(`  - SERVICE_ROLE_KEY: ${supabaseKey ? '✅ 設定済み' : '❌ 未設定'}\n`);
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  // テストクエリ
  const query = 'ChatGPT';
  console.log(`📝 クエリ: "${query}"\n`);

  // ステップ1: クエリをベクトル化
  console.log('ステップ1: クエリをベクトル化');
  const embeddings = new OpenAIEmbeddings();
  const queryEmbedding = await embeddings.embedSingle(query);
  console.log(`✅ ベクトル化完了: 次元=${queryEmbedding.length}`);
  console.log(`   サンプル値: [${queryEmbedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}, ...]\n`);

  // ステップ2: hybrid_search_company_vectors関数を呼び出し
  console.log('ステップ2: hybrid_search_company_vectors 関数呼び出し');
  console.log('パラメータ:');
  console.log(`  - query_text: "${query}"`);
  console.log(`  - query_embedding: vector(1536)`);
  console.log(`  - match_threshold: 0.1`);
  console.log(`  - match_count: 3`);
  console.log(`  - bm25_weight: 0.4`);
  console.log(`  - vector_weight: 0.6\n`);

  const { data, error } = await supabase.rpc('hybrid_search_company_vectors', {
    query_text: query,
    query_embedding: queryEmbedding,
    match_threshold: 0.1,
    match_count: 3,
    bm25_weight: 0.4,
    vector_weight: 0.6
  });

  if (error) {
    console.error('❌ エラー発生:', error);
    console.error('   詳細:', JSON.stringify(error, null, 2));
    return;
  }

  console.log(`✅ 検索成功: ${data?.length || 0}件取得\n`);

  if (data && data.length > 0) {
    console.log('📊 検索結果:\n');
    data.forEach((result: any, index: number) => {
      console.log(`${index + 1}. [Combined: ${result.combined_score.toFixed(4)}]`);
      console.log(`   - BM25スコア: ${result.bm25_score.toFixed(4)}`);
      console.log(`   - Vectorスコア: ${result.vector_score.toFixed(4)}`);
      console.log(`   - コンテンツ: ${result.content.substring(0, 100)}...`);
      console.log('');
    });
  } else {
    console.log('⚠️ 結果が0件でした\n');
    
    // デバッグ: BM25のみをテスト
    console.log('🔍 デバッグ: BM25検索のみをテスト');
    const { data: bm25Data, error: bm25Error } = await supabase
      .from('company_vectors')
      .select('id, page_slug, content_chunk')
      .textSearch('content_tsvector', query, {
        type: 'websearch',
        config: 'simple'
      })
      .limit(3);

    if (bm25Error) {
      console.error('❌ BM25検索エラー:', bm25Error);
    } else {
      console.log(`✅ BM25検索: ${bm25Data?.length || 0}件`);
      if (bm25Data && bm25Data.length > 0) {
        bm25Data.forEach((item, i) => {
          console.log(`${i + 1}. ${item.page_slug}: ${item.content_chunk.substring(0, 80)}...`);
        });
      }
    }
  }

  console.log('\n✅ テスト完了\n');
}

testHybridSearchDirect().catch(console.error);

