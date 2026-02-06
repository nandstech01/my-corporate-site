import { NextRequest, NextResponse } from 'next/server';
import { OpenAIEmbeddings } from '@/lib/vector/openai-embeddings';
import { supabase } from '@/lib/supabase/supabase';

interface NewsItem {
  id: string;
  title: string;
  url: string;
  description: string;
  published: string;
  source: string;
  relevance?: number;
}

export async function POST(request: NextRequest) {
  try {
    const { newsItem, query } = await request.json();

    if (!newsItem || !query) {
      return NextResponse.json(
        { error: 'newsItemとqueryパラメータが必要です' },
        { status: 400 }
      );
    }

    console.log(`🔄 ベクトル化開始: ${newsItem.title}`);

    // ベクトル化用のコンテンツを作成
    const contentForVectorization = `
タイトル: ${newsItem.title}
内容: ${newsItem.description}
ソース: ${newsItem.source}
URL: ${newsItem.url}
公開日: ${newsItem.published}
    `.trim();

    console.log(`📝 ベクトル化対象コンテンツ: ${contentForVectorization.substring(0, 100)}...`);

    // OpenAI Embeddingsでベクトル化
    const embeddings = new OpenAIEmbeddings();
    const embedding = await embeddings.embedSingle(contentForVectorization);

    console.log(`🔢 ベクトル次元: ${embedding.length}`);

    // trend_vectorsテーブルに保存（既存のテーブル構造に合わせて）
    const { data: savedVector, error: saveError } = await supabase
      .from('trend_vectors')
      .insert([
        {
          content_id: newsItem.id,
          content_type: 'news',
          trend_topic: newsItem.title,
          content: contentForVectorization,
          embedding: JSON.stringify(embedding),
          source: newsItem.source,
          source_url: newsItem.url,
          relevance_score: newsItem.relevance || 0,
          trend_date: new Date(newsItem.published).toISOString().split('T')[0],
          popularity_score: 0.0,
          keywords: extractKeywords(newsItem.title, newsItem.description),
          metadata: {
            title: newsItem.title,
            url: newsItem.url,
            source: newsItem.source,
            published: newsItem.published,
            relevance: newsItem.relevance || 0,
            query: query,
            retrieved_at: new Date().toISOString(),
            original_description: newsItem.description
          }
        }
      ])
      .select()
      .single();

    if (saveError) {
      console.error('❌ ベクトル保存エラー:', saveError);
      return NextResponse.json(
        { error: 'ベクトル保存でエラーが発生しました: ' + saveError.message },
        { status: 500 }
      );
    }

    console.log(`✅ ベクトル化完了: ID ${savedVector.id}`);

    return NextResponse.json({
      success: true,
      vectorId: savedVector.id,
      newsItem: newsItem,
      contentLength: contentForVectorization.length,
      embeddingDimensions: embedding.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ ベクトル化エラー:', error);
    return NextResponse.json(
      { error: 'ベクトル化でエラーが発生しました: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// キーワード抽出関数
function extractKeywords(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const keywords = [];
  
  // AI関連キーワード
  const aiKeywords = ['ai', 'artificial intelligence', '人工知能', 'openai', 'chatgpt', 'gpt', 'machine learning', '機械学習', 'deep learning', 'llm', 'transformer'];
  const techKeywords = ['api', 'sdk', 'プログラミング', 'ソフトウェア', 'システム', 'クラウド', 'データ', 'アルゴリズム'];
  const businessKeywords = ['投資', '企業', '買収', '発表', '新機能', 'アップデート', 'リリース', 'サービス'];
  
  const allKeywords = [...aiKeywords, ...techKeywords, ...businessKeywords];
  
  for (const keyword of allKeywords) {
    if (text.includes(keyword)) {
      keywords.push(keyword);
    }
  }
  
  return keywords.slice(0, 10); // 最大10個まで
} 