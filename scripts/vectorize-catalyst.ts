/**
 * 偉人RAG（Catalyst RAG）ベクトル化スクリプト
 * 
 * 目的: 偉人の名言・哲学をベクトル化し、感情的触媒として利用
 * 影響: 中尺動画のみ、ショート動画・その他機能に影響なし
 * 
 * 実行: npm run vectorize-catalyst
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// 環境変数を読み込む
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const openaiApiKey = process.env.OPENAI_API_KEY!;

if (!supabaseUrl || !supabaseServiceKey || !openaiApiKey) {
  console.error('❌ 環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const openai = new OpenAI({ apiKey: openaiApiKey });

interface CatalystData {
  person: string;
  quote: string;
  theme: string;
  subthemes: string[];          // NEW
  emotion: string;               // NEW
  emotion_code: string;
  your_voice_paraphrase: string;
  core_message: string;
  use_cases: string[];
  insertion_style: string;       // NEW
  counterpoint: string;
  source_url: string;            // NEW
  verify_status: string;
  lang: string;                  // NEW
  embedding_text: string;
}

async function vectorizeCatalyst() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💎 偉人RAG（Catalyst RAG）ベクトル化開始');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // JSONファイル読み込み（v2: 新フィールド対応）
  const jsonPath = resolve(process.cwd(), 'rag_data/catalyst_rag_v2.json');
  const data: CatalystData[] = JSON.parse(readFileSync(jsonPath, 'utf-8'));

  console.log(`\n📝 読み込んだ偉人の名言: ${data.length}件`);

  for (let index = 0; index < data.length; index++) {
    const catalyst = data[index];
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`💎 ${index + 1}/${data.length}: ${catalyst.person} - ${catalyst.theme}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    try {
      // ベクトル生成
      console.log(`📊 ベクトル生成中: "${catalyst.embedding_text}"`);
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-large',
        input: catalyst.embedding_text,
        dimensions: 3072, // 3072次元
      });

      const embedding = embeddingResponse.data[0].embedding;
      console.log(`✅ ベクトル生成完了: ${embedding.length}次元`);

      // データベースに挿入（新フィールド追加）
      const { error } = await supabase
        .from('catalyst_rag')
        .insert({
          person: catalyst.person,
          quote: catalyst.quote,
          theme: catalyst.theme,
          subthemes: catalyst.subthemes,                    // NEW
          emotion: catalyst.emotion,                        // NEW
          emotion_code: catalyst.emotion_code,
          your_voice_paraphrase: catalyst.your_voice_paraphrase,
          core_message: catalyst.core_message,
          use_cases: catalyst.use_cases,
          insertion_style: catalyst.insertion_style,        // NEW
          counterpoint: catalyst.counterpoint,
          source_url: catalyst.source_url,                  // NEW
          verify_status: catalyst.verify_status,
          lang: catalyst.lang,                              // NEW
          embedding_text: catalyst.embedding_text,
          embedding: JSON.stringify(embedding), // pgvectorはJSON文字列として挿入
        });

      if (error) {
        console.error(`❌ DB挿入エラー:`, error);
      } else {
        console.log(`✅ DB挿入成功`);
      }

      // APIレート制限対策: 500ms待機
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`❌ エラー発生:`, error);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ 偉人RAG（Catalyst RAG）ベクトル化完了！');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

vectorizeCatalyst().catch(console.error);

