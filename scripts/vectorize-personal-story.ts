/**
 * 個人ストーリーRAGベクトル化スクリプト
 * 
 * 目的: Kenji Harada「静かなる構築者」のストーリーをベクトル化
 * 影響: 中尺動画のみ、ショート動画・その他機能に影響なし
 * 
 * 実行: npm run vectorize-personal-story
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

interface PersonalStoryData {
  story_arc: string;
  section_title: string;
  content: string;
  core_theme: string;
  emotion: string;
  voice_direction: string;
  rhythm_note: string;
  use_cases: string[];
  keywords: string[];
  embedding_text: string;
}

async function vectorizePersonalStory() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎬 個人ストーリーRAGベクトル化開始');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // JSONファイル読み込み
  const jsonPath = resolve(process.cwd(), 'rag_data/personal_story_rag.json');
  const data: PersonalStoryData[] = JSON.parse(readFileSync(jsonPath, 'utf-8'));

  console.log(`\n📝 読み込んだストーリー: ${data.length}件`);

  for (let index = 0; index < data.length; index++) {
    const story = data[index];
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🧩 ${index + 1}/${data.length}: ${story.story_arc} - ${story.section_title}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    try {
      // ベクトル生成
      console.log(`📊 ベクトル生成中: "${story.embedding_text}"`);
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-large',
        input: story.embedding_text,
        dimensions: 3072, // 3072次元
      });

      const embedding = embeddingResponse.data[0].embedding;
      console.log(`✅ ベクトル生成完了: ${embedding.length}次元`);

      // データベースに挿入
      const { error } = await supabase
        .from('personal_story_rag')
        .insert({
          story_arc: story.story_arc,
          section_title: story.section_title,
          content: story.content,
          core_theme: story.core_theme,
          emotion: story.emotion,
          voice_direction: story.voice_direction,
          rhythm_note: story.rhythm_note,
          use_cases: story.use_cases,
          keywords: story.keywords,
          embedding_text: story.embedding_text,
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
  console.log('✅ 個人ストーリーRAGベクトル化完了！');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

vectorizePersonalStory().catch(console.error);

