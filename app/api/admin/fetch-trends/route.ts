/**
 * トレンドニュース取得API（Brave MCP）
 * 
 * 実行方法:
 * curl http://localhost:3000/api/admin/fetch-trends
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function GET() {
  console.log('🚀 トレンドニュース取得開始（Brave MCP）\n');

  try {
    // 🔍 Brave MCPで一般ニュース取得
    console.log('🔍 Brave MCPで日本のニュース検索中...\n');
    
    // Note: Brave MCP呼び出しはクライアント側でのみ可能
    // そのため、この実装ではダミーデータで説明
    // 実際の実装では、フロントエンドでBrave MCPを呼び出して、このAPIに送信する
    
    return NextResponse.json({
      success: false,
      message: 'Brave MCPはサーバーサイドで直接呼び出せません。フロントエンドから呼び出してください。',
      instruction: `
        実装方法:
        1. 管理画面（/admin）で「トレンド取得」ボタンを作成
        2. ボタンクリックでBrave MCPを呼び出し
        3. 取得したニュースをこのAPIに送信してベクトル化
      `
    });

  } catch (error: any) {
    console.error('❌ トレンド取得エラー:', error.message);
    return NextResponse.json(
      { error: 'トレンド取得に失敗しました', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * フロントエンドから送信されたトレンドニュースをベクトル化
 */
export async function POST(request: Request) {
  console.log('📥 トレンドニュースのベクトル化開始\n');

  try {
    const { trends } = await request.json();

    if (!trends || !Array.isArray(trends)) {
      return NextResponse.json(
        { error: 'trendsが必要です（配列形式）' },
        { status: 400 }
      );
    }

    console.log(`📝 受信したトレンド: ${trends.length}件\n`);

    const results = [];

    for (const trend of trends) {
      const { title, content, url, category = 'general' } = trend;

      console.log(`⏳ [${title}] をベクトル化中...`);

      // ベクトル化対象テキスト
      const textToEmbed = `${title}\n\n${content}`;

      // OpenAI APIでベクトル化
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-large',
        input: textToEmbed,
        dimensions: 1536, // trend_ragは1536次元
      });

      const embedding = embeddingResponse.data[0].embedding;
      console.log(`   ✅ ベクトル生成完了: ${embedding.length}次元`);

      // trend_ragに保存
      const { data, error } = await supabase
        .from('trend_rag')
        .insert({
          trend_title: title,
          trend_content: content,
          trend_url: url,
          trend_category: category,
          trend_source: 'brave',
          embedding: embedding,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error(`   ❌ 保存エラー: ${error.message}`);
        results.push({ title, success: false, error: error.message });
      } else {
        console.log(`   💾 データベース保存完了（ID: ${data.id}）\n`);
        results.push({ title, success: true, id: data.id });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`\n✅ ベクトル化完了: ${successCount}/${trends.length}件\n`);

    return NextResponse.json({
      success: true,
      message: `${successCount}件のトレンドをベクトル化しました`,
      results,
    });

  } catch (error: any) {
    console.error('❌ ベクトル化エラー:', error.message);
    return NextResponse.json(
      { error: 'ベクトル化に失敗しました', details: error.message },
      { status: 500 }
    );
  }
}

