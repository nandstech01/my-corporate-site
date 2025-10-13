/**
 * Trend RAGのベクトル化スクリプト
 * 
 * 実行方法:
 * npx tsx scripts/vectorize-trend-rag.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// .env.localを読み込み
config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface TrendRAG {
  id: number;
  trend_title: string;
  trend_content: string;
}

/**
 * OpenAI APIでベクトル化
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-large',
    input: text,
    dimensions: 1536, // trend_ragは1536次元
  });
  return response.data[0].embedding;
}

/**
 * Trend RAGをベクトル化
 */
async function vectorizeTrendRAG() {
  console.log('🚀 Trend RAGのベクトル化を開始します...\n');

  try {
    // 1. ベクトル化待ちのトレンドを取得
    const { data: pendingTrends, error: fetchError } = await supabase
      .from('trend_rag')
      .select('id, trend_title, trend_content')
      .is('embedding', null)
      .eq('is_active', true);

    if (fetchError) {
      console.error('❌ トレンドRAG取得エラー:', fetchError);
      throw fetchError;
    }

    if (!pendingTrends || pendingTrends.length === 0) {
      console.log('✅ ベクトル化待ちのトレンドはありません。');
      return;
    }

    console.log(`📝 ベクトル化対象: ${pendingTrends.length}件\n`);

    // 2. 各トレンドをベクトル化
    for (const trend of pendingTrends) {
      console.log(`⏳ [ID: ${trend.id}] ${trend.trend_title}`);
      console.log(`   内容: ${trend.trend_content.substring(0, 50)}...`);

      try {
        // ベクトル化対象テキスト（タイトル + 内容）
        const textToEmbed = `${trend.trend_title}\n\n${trend.trend_content}`;
        
        // OpenAI APIでベクトル化
        const embedding = await generateEmbedding(textToEmbed);
        console.log(`   ✅ ベクトル生成完了: ${embedding.length}次元`);

        // trend_ragを更新
        const { error: updateError } = await supabase
          .from('trend_rag')
          .update({
            embedding: embedding,
          })
          .eq('id', trend.id);

        if (updateError) {
          console.error(`   ❌ 更新エラー: ${updateError.message}`);
          continue;
        }

        console.log(`   💾 データベース更新完了\n`);

      } catch (error: any) {
        console.error(`   ❌ ベクトル化エラー: ${error.message}\n`);
        continue;
      }
    }

    // 3. 完了状況を確認
    const { data: allTrends, error: statusError } = await supabase
      .from('trend_rag')
      .select('id, trend_title, embedding')
      .eq('is_active', true);

    if (statusError) {
      console.error('❌ ステータス確認エラー:', statusError);
      throw statusError;
    }

    const completed = allTrends?.filter(t => t.embedding !== null).length || 0;
    const pending = allTrends?.filter(t => t.embedding === null).length || 0;

    console.log('\n🎉 ========================================');
    console.log('✅ Trend RAGベクトル化完了！');
    console.log('🎉 ========================================\n');

    console.log('📊 ベクトル化状況:');
    console.log(`   ✅ 完了: ${completed}件`);
    console.log(`   ⏳ 保留: ${pending}件`);

    if (allTrends && allTrends.length > 0) {
      console.log('\n📋 トレンド一覧:');
      allTrends.forEach((trend) => {
        const status = trend.embedding ? '✅' : '⏳';
        console.log(`   ${status} [ID: ${trend.id}] ${trend.trend_title}`);
      });
    }

    console.log('\n✅ スクリプト完了\n');

  } catch (error: any) {
    console.error('❌ エラー:', error.message);
    process.exit(1);
  }
}

// 実行
vectorizeTrendRAG();

