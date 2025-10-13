/**
 * Kenji Harada思想ドキュメントのベクトル化スクリプト
 * 
 * 実行方法:
 * npx tsx scripts/vectorize-kenji-thoughts.ts
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

interface KenjiThought {
  thought_id: string;
  thought_title: string;
  thought_content: string;
}

/**
 * OpenAI APIでベクトル化
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-large',
    input: text,
  });
  return response.data[0].embedding;
}

/**
 * 思想ドキュメントをベクトル化
 */
async function vectorizeThoughts() {
  console.log('🚀 Kenji Harada思想ドキュメントのベクトル化を開始します...\n');

  try {
    // 1. ベクトル化待ちの思想を取得
    const { data: pendingThoughts, error: fetchError } = await supabase
      .from('kenji_harada_architect_knowledge')
      .select('id, thought_id, thought_title, thought_content')
      .eq('vectorization_status', 'pending')
      .eq('is_active', true);

    if (fetchError) {
      console.error('❌ 思想ドキュメント取得エラー:', fetchError);
      throw fetchError;
    }

    if (!pendingThoughts || pendingThoughts.length === 0) {
      console.log('✅ ベクトル化待ちの思想はありません。');
      return;
    }

    console.log(`📝 ベクトル化対象: ${pendingThoughts.length}件\n`);

    // 2. 各思想をベクトル化
    for (const thought of pendingThoughts) {
      console.log(`⏳ [${thought.thought_id}] ${thought.thought_title}`);
      console.log(`   内容: ${thought.thought_content.substring(0, 100)}...`);

      try {
        // ベクトル化対象テキスト（タイトル + 内容）
        const textToEmbed = `${thought.thought_title}\n\n${thought.thought_content}`;
        
        // OpenAI APIでベクトル化
        const embedding = await generateEmbedding(textToEmbed);
        console.log(`   ✅ ベクトル生成完了: ${embedding.length}次元`);

        // データベース更新
        const { error: updateError } = await supabase
          .from('kenji_harada_architect_knowledge')
          .update({
            embedding: embedding,
            vectorization_status: 'vectorized',
            vector_dimensions: embedding.length,
          })
          .eq('id', thought.id);

        if (updateError) {
          console.error(`   ❌ 更新エラー:`, updateError);
          
          // エラーステータスに更新
          await supabase
            .from('kenji_harada_architect_knowledge')
            .update({
              vectorization_status: 'error',
              metadata: { error: updateError.message }
            })
            .eq('id', thought.id);
        } else {
          console.log(`   💾 データベース更新完了\n`);
        }

        // レート制限対策（1秒待機）
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error: any) {
        console.error(`   ❌ ベクトル化エラー:`, error.message);
        
        // エラーステータスに更新
        await supabase
          .from('kenji_harada_architect_knowledge')
          .update({
            vectorization_status: 'error',
            metadata: { error: error.message }
          })
          .eq('id', thought.id);
      }
    }

    // 3. 完了確認
    const { data: vectorizedThoughts, error: checkError } = await supabase
      .from('kenji_harada_architect_knowledge')
      .select('thought_id, thought_title, vectorization_status')
      .eq('is_active', true);

    if (checkError) {
      console.error('❌ 確認エラー:', checkError);
      throw checkError;
    }

    console.log('\n🎉 ========================================');
    console.log('✅ Kenji Harada思想ベクトル化完了！');
    console.log('🎉 ========================================\n');

    console.log('📊 ベクトル化状況:');
    const vectorizedCount = vectorizedThoughts?.filter(t => t.vectorization_status === 'vectorized').length || 0;
    const pendingCount = vectorizedThoughts?.filter(t => t.vectorization_status === 'pending').length || 0;
    const errorCount = vectorizedThoughts?.filter(t => t.vectorization_status === 'error').length || 0;

    console.log(`   ✅ 完了: ${vectorizedCount}件`);
    console.log(`   ⏳ 保留: ${pendingCount}件`);
    console.log(`   ❌ エラー: ${errorCount}件`);

    if (vectorizedThoughts && vectorizedThoughts.length > 0) {
      console.log('\n📋 思想一覧:');
      vectorizedThoughts.forEach((t) => {
        const status = t.vectorization_status === 'vectorized' ? '✅' : 
                       t.vectorization_status === 'error' ? '❌' : '⏳';
        console.log(`   ${status} [${t.thought_id}] ${t.thought_title}`);
      });
    }

  } catch (error: any) {
    console.error('\n❌ ベクトル化処理エラー:', error);
    process.exit(1);
  }
}

// スクリプト実行
vectorizeThoughts()
  .then(() => {
    console.log('\n✅ スクリプト完了');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ スクリプトエラー:', error);
    process.exit(1);
  });

