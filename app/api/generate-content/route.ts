import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { supabase } from '@/lib/supabase/supabase';
import { SupabaseVectorStore } from '@/lib/vector/supabase-vector-store';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    const { newsItems, type = 'trend-article' } = await request.json();

    if (!newsItems || newsItems.length === 0) {
      return NextResponse.json(
        { error: 'ニュースアイテムが必要です' },
        { status: 400 }
      );
    }

    // 1. トレンドRAG: ニュースコンテンツからキーワードを抽出
    const trendKeywords = extractTrendKeywords(newsItems);
    
    // 2. 自社RAG: 関連する自社コンテンツを検索
    const companyContent = await searchCompanyRAG(trendKeywords);
    
    // 3. 第3のRAG: 業界知識ベース（実装予定）
    const industryContent = await searchIndustryRAG(trendKeywords);
    
    // 4. トリプルRAG統合によるコンテンツ生成
    const generatedContent = await generateTripleRAGContent({
      newsItems,
      companyContent,
      industryContent,
      type
    });

    // 5. 生成されたコンテンツを一時保存
    const { data: savedContent, error: saveError } = await supabase
      .from('generated_content')
      .insert([
        {
          type,
          content: generatedContent.content,
          title: generatedContent.title,
          metadata: {
            newsItems,
            companyContent,
            industryContent,
            keywords: trendKeywords
          },
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (saveError) {
      console.error('Content save error:', saveError);
      throw new Error('コンテンツの保存に失敗しました');
    }

    return NextResponse.json({
      id: savedContent.id,
      title: generatedContent.title,
      content: generatedContent.content,
      metadata: {
        newsCount: newsItems.length,
        companyRAGHits: companyContent.length,
        industryRAGHits: industryContent.length,
        keywords: trendKeywords
      }
    });

  } catch (error) {
    console.error('Content generation error:', error);
    return NextResponse.json(
      { error: 'コンテンツ生成でエラーが発生しました' },
      { status: 500 }
    );
  }
}

// トレンドキーワードの抽出
function extractTrendKeywords(newsItems: NewsItem[]): string[] {
  const allText = newsItems.map(item => `${item.title} ${item.description}`).join(' ');
  
  // 簡単なキーワード抽出（実際にはより高度な処理が必要）
  const keywords = allText
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2)
    .filter(word => !['の', 'が', 'は', 'を', 'に', 'と', 'で', 'から', 'まで'].includes(word))
    .slice(0, 10);

  return Array.from(new Set(keywords));
}

// 自社RAGコンテンツの検索
async function searchCompanyRAG(keywords: string[]): Promise<any[]> {
  try {
    const vectorStore = new SupabaseVectorStore();
    const searchQuery = keywords.join(' ');
    
    // 検索クエリをベクトル化してから検索する必要がありますが、
    // 現在は簡単な実装にしています
    const results = await vectorStore.searchSimilar([], 5); // 空のベクトルで検索
    return results;
  } catch (error) {
    console.error('Company RAG search error:', error);
    return [];
  }
}

// 業界RAGコンテンツの検索（実装予定）
async function searchIndustryRAG(keywords: string[]): Promise<any[]> {
  // 実装予定：業界知識ベースの検索
  return [];
}

// トリプルRAGによるコンテンツ生成
async function generateTripleRAGContent({
  newsItems,
  companyContent,
  industryContent,
  type
}: {
  newsItems: NewsItem[];
  companyContent: any[];
  industryContent: any[];
  type: string;
}): Promise<{ title: string; content: string }> {
  
  const prompt = `
あなたは、AI技術専門のコンテンツライターです。以下の情報を基に、高品質な記事を作成してください。

## 最新ニュース情報 (トレンドRAG)
${newsItems.map(item => `
- タイトル: ${item.title}
- 内容: ${item.description}
- 情報源: ${item.source}
- 公開日: ${item.published}
`).join('\n')}

## 自社関連コンテンツ (自社RAG)
${companyContent.map(content => `
- コンテンツタイプ: ${content.content_type}
- 内容: ${content.content}
- 関連度: ${content.similarity}
`).join('\n')}

## 業界知識ベース (第3のRAG)
${industryContent.length > 0 ? industryContent.map(content => `
- 内容: ${content.content}
`).join('\n') : '（準備中）'}

## 記事作成要件
- 文字数: 5000-7000文字
- 対象読者: AI技術に関心のある企業の経営者・技術者
- 構成: 導入、現状分析、技術解説、実装事例、将来展望、まとめ
- SEO対策: 適切なキーワード配置
- 信頼性: 正確な情報と引用元の明記

記事のタイトルと本文を生成してください。
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'あなたは、AI技術に精通したプロフェッショナルなコンテンツライターです。最新の技術トレンドを分析し、読者にとって価値のある情報を提供します。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.7
    });

    const generatedText = response.choices[0]?.message?.content || '';
    
    // タイトルと本文を分離
    const lines = generatedText.split('\n');
    const titleLine = lines.find(line => line.includes('タイトル:') || line.includes('# '));
    const title = titleLine ? titleLine.replace(/^(タイトル:|# )/, '').trim() : '生成されたAI記事';
    
    const contentStartIndex = lines.findIndex(line => 
      line.includes('本文:') || line.includes('## ') || (!titleLine && line.trim().length > 0)
    );
    const content = lines.slice(contentStartIndex).join('\n').replace(/^本文:/, '').trim();

    return {
      title,
      content: content || generatedText
    };

  } catch (error) {
    console.error('OpenAI generation error:', error);
    throw new Error('コンテンツ生成に失敗しました');
  }
} 