import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { supabase } from '@/lib/supabase/supabase';
import { SupabaseVectorStore } from '@/lib/vector/supabase-vector-store';
import { createClient } from '@/lib/supabase/supabase';

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

// プロンプトテンプレートのランダム化要素
const CONTENT_STRUCTURES = [
  {
    name: 'expert_analysis',
    pattern: '専門家分析パターン',
    sections: ['概要', '詳細分析', '技術的洞察', '業界への影響', 'FAQ', '実装ガイド', '結論']
  },
  {
    name: 'how_to_guide',
    pattern: 'HOW TOガイドパターン',
    sections: ['背景', 'ステップ別解説', '詳細な手順', '技術表', 'よくある質問', 'トラブルシューティング', 'まとめ']
  },
  {
    name: 'comprehensive_review',
    pattern: '包括的レビューパターン',
    sections: ['導入', '現状分析', '比較表', '詳細評価', 'FAQ', '推奨事項', '将来展望']
  }
];

const WRITING_STYLES = [
  {
    tone: 'authoritative_expert',
    description: '権威のある専門家として、豊富な経験と深い洞察を持つ',
    personality: '15年以上のAI業界経験を持つシニアコンサルタント'
  },
  {
    tone: 'practical_implementer',
    description: '実践的な実装者として、具体的で行動可能な情報を提供',
    personality: '大手企業でAI導入を成功させたテックリード'
  },
  {
    tone: 'strategic_advisor',
    description: '戦略的アドバイザーとして、ビジネス価値と技術を結び付ける',
    personality: 'AI戦略コンサルティングファームの共同創設者'
  }
];

const CONTENT_FORMATS = [
  {
    type: 'faq_heavy',
    weight: 30,
    description: 'FAQ重点型 - 読者の疑問を徹底的に解決',
    structure: { faq_sections: 3, how_to_sections: 1, tables: 2 }
  },
  {
    type: 'how_to_focused',
    weight: 30,
    description: 'HOW TO重点型 - 実践的な手順を詳細に説明',
    structure: { faq_sections: 1, how_to_sections: 3, tables: 2 }
  },
  {
    type: 'table_rich',
    weight: 25,
    description: '表重点型 - データと比較を視覚的に表現',
    structure: { faq_sections: 2, how_to_sections: 1, tables: 4 }
  },
  {
    type: 'balanced_premium',
    weight: 15,
    description: 'バランス型 - すべての要素を最適な割合で配分',
    structure: { faq_sections: 2, how_to_sections: 2, tables: 3 }
  }
];

// ランダム選択関数（重み付きランダム）
function weightedRandomSelect<T extends { weight: number }>(items: T[]): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) return item;
  }
  return items[items.length - 1];
}

function randomSelect<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
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
        keywords: trendKeywords,
        ...(generatedContent.metadata || {})
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

// 内部リンク用の関連記事検索
async function searchRelatedPosts(keywords: string[], currentTitle: string): Promise<any[]> {
  try {
    const supabase = createClient();
    
    // キーワードを使ってタイトルやコンテンツから関連記事を検索
    const searchTerms = keywords.join(' | ');
    
    // postsテーブルとchatgpt_postsテーブルの両方から検索
    const [postsResults, chatgptPostsResults] = await Promise.all([
      supabase
        .from('posts')
        .select('id, title, slug, content, meta_description')
        .eq('status', 'published')
        .neq('title', currentTitle)
        .or(`title.ilike.%${keywords[0]}%,content.ilike.%${keywords[0]}%`)
        .limit(5),
      
      supabase
        .from('chatgpt_posts')
        .select('id, title, slug, content, excerpt')
        .eq('status', 'published')
        .neq('title', currentTitle)
        .or(`title.ilike.%${keywords[0]}%,content.ilike.%${keywords[0]}%`)
        .limit(5)
    ]);

    const allPosts = [
      ...(postsResults.data || []).map(post => ({ ...post, source: 'posts' })),
      ...(chatgptPostsResults.data || []).map(post => ({ ...post, source: 'chatgpt_posts' }))
    ];

    // 関連性スコアを計算
    const scoredPosts = allPosts.map(post => {
      let score = 0;
      const title = post.title.toLowerCase();
      const content = (post.content || (post as any).excerpt || '').toLowerCase();
      
      keywords.forEach(keyword => {
        const lowerKeyword = keyword.toLowerCase();
        if (title.includes(lowerKeyword)) score += 3;
        if (content.includes(lowerKeyword)) score += 1;
      });
      
      return { ...post, relevanceScore: score };
    });

    // スコア順でソートして上位3件を返す
    return scoredPosts
      .filter(post => post.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 3);

  } catch (error) {
    console.error('Related posts search error:', error);
    return [];
  }
}

// 業界RAGコンテンツの検索（実装予定）
async function searchIndustryRAG(keywords: string[]): Promise<any[]> {
  // 実装予定：業界知識ベースの検索
  return [];
}

// 内部リンクHTML生成
function generateInternalLinks(relatedPosts: any[]): string {
  if (relatedPosts.length === 0) return '';
  
  const linkHTML = relatedPosts.map(post => {
    const description = (post as any).meta_description || (post as any).excerpt || 
                       `${post.title}について詳しく解説した記事です。`;
    
    return `<a href="/posts/${post.slug}" class="internal-link" title="${post.title}">${post.title}</a>`;
  }).join('、');
  
  return `

---

## 関連記事

${relatedPosts.map(post => {
  const description = (post as any).meta_description || (post as any).excerpt || 
                     `${post.title}について詳しく解説した記事です。`;
  return `- [${post.title}](/posts/${post.slug}) - ${description.substring(0, 100)}...`;
}).join('\n')}

---

`;
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
}): Promise<{ title: string; content: string; metadata?: any }> {
  
  // ランダム化要素の選択
  const selectedStructure = randomSelect(CONTENT_STRUCTURES);
  const selectedStyle = randomSelect(WRITING_STYLES);
  const selectedFormat = weightedRandomSelect(CONTENT_FORMATS);
  
  // o1-mini用分割生成アプローチ
  return await generateWithSectionSplit({
    newsItems,
    companyContent,
    industryContent,
    structure: selectedStructure,
    style: selectedStyle,
    format: selectedFormat
  });
}

// o1-mini用分割生成システム
async function generateWithSectionSplit({
  newsItems,
  companyContent,
  industryContent,
  structure,
  style,
  format
}: {
  newsItems: NewsItem[];
  companyContent: any[];
  industryContent: any[];
  structure: typeof CONTENT_STRUCTURES[0];
  style: typeof WRITING_STYLES[0];
  format: typeof CONTENT_FORMATS[0];
}): Promise<{ title: string; content: string; metadata?: any }> {

  console.log('🔄 o1-mini分割生成システム開始');

  // 1. まずタイトルと概要を生成
  const titleAndOverview = await generateTitleAndOverview({
    newsItems, companyContent, industryContent, structure, style, format
  });

  // 2. 関連記事を検索（内部リンク用）
  const trendKeywords = extractTrendKeywords(newsItems);
  const relatedPosts = await searchRelatedPosts(trendKeywords, titleAndOverview.title);
  console.log(`🔗 関連記事検索完了: ${relatedPosts.length}件`);

  // 3. SEOメタデータを生成
  const seoMetadata = await generateSEOMetadata({
    title: titleAndOverview.title,
    newsItems,
    companyContent,
    style
  });

  // 4. メインセクションを分割生成
  const mainSections = await generateMainSections({
    newsItems, companyContent, industryContent, structure, style, format, title: titleAndOverview.title, relatedPosts
  });

  // 5. FAQ セクションを生成
  const faqSections = await generateFAQSections({
    newsItems, companyContent, industryContent, format, title: titleAndOverview.title, relatedPosts
  });

  // 6. HOW TO セクションを生成
  const howToSections = await generateHowToSections({
    newsItems, companyContent, industryContent, format, title: titleAndOverview.title, relatedPosts
  });

  // 7. データ表を生成
  const dataTables = await generateDataTables({
    newsItems, companyContent, industryContent, format, title: titleAndOverview.title, relatedPosts
  });

  // 8. 結論セクションを生成
  const conclusion = await generateConclusion({
    newsItems, companyContent, industryContent, title: titleAndOverview.title, relatedPosts
  });

  // 9. 内部リンクセクションを生成
  const internalLinksSection = generateInternalLinks(relatedPosts);

  // 10. 全セクションを結合
  const fullContent = combineAllSections({
    overview: titleAndOverview.overview,
    mainSections,
    faqSections,
    howToSections,
    dataTables,
    conclusion,
    internalLinks: internalLinksSection
  });

  const finalCharCount = fullContent.length;
  console.log(`📊 最終文字数: ${finalCharCount}文字`);

  return {
    title: titleAndOverview.title,
    content: fullContent,
    metadata: {
      seo: seoMetadata,
      wordCount: finalCharCount,
      structure: structure.name,
      style: style.tone,
      format: format.type
    }
  };
}

// 1. タイトルと概要生成
async function generateTitleAndOverview({
  newsItems, companyContent, industryContent, structure, style, format
}: any): Promise<{ title: string; overview: string }> {
  
  const prompt = `# 専門分析レポート: タイトルと概要作成

**役割**: ${style.personality}として専門分析を行います。
**分析対象**: 最新AI技術トレンドとビジネス応用

## 分析データ
### トレンド情報
${newsItems.map((item: any, index: number) => `
**ニュース${index + 1}**: ${item.title}
詳細: ${item.description}
`).join('\n')}

### 自社情報
${companyContent.length > 0 ? companyContent.map((content: any, index: number) => `
**自社データ${index + 1}**: ${content.content || content.content_chunk || '内容なし'}
`).join('\n') : '自社データなし'}

## タスク
1. **魅力的なタイトル**を1つ作成（SEO最適化済み）
2. **詳細な概要セクション**を作成（1,500-2,000文字）

概要では以下を含めてください：
- 現在の業界状況の詳細分析
- 主要トレンドの背景説明
- 技術的な重要性の解説
- 本レポートで扱う内容の詳細予告

タイトル: [ここにタイトル]

## 概要
[詳細な概要を1,500-2,000文字で記述]`;

  try {
    const response = await openai.chat.completions.create({
      model: 'o1-mini',
      messages: [{ role: 'user', content: prompt }]
    });

    const result = response.choices[0]?.message?.content || '';
    const lines = result.split('\n');
    
    const titleLine = lines.find(line => line.includes('タイトル:'));
    const title = titleLine ? titleLine.replace('タイトル:', '').trim() : 'AI技術分析レポート';
    
    const overviewStartIndex = lines.findIndex(line => line.includes('## 概要'));
    const overview = lines.slice(overviewStartIndex + 1).join('\n').trim();

    console.log(`✅ タイトル・概要生成完了: ${overview.length}文字`);
    return { title, overview };

  } catch (error) {
    console.error('タイトル・概要生成エラー:', error);
    return { 
      title: 'AI技術分析レポート',
      overview: 'AI技術の最新動向と企業への影響について詳細に分析します。'
    };
  }
}

// 2. メインセクション生成
async function generateMainSections({
  newsItems, companyContent, industryContent, structure, style, format, title, relatedPosts
}: any): Promise<string[]> {
  
  const sections = [];
  
  for (let i = 0; i < structure.sections.length - 2; i++) { // FAQ、結論を除く
    const sectionTitle = structure.sections[i];
    
    const relatedPostsContext = relatedPosts && relatedPosts.length > 0 ? `

### 参考記事情報（内部リンク用）
${relatedPosts.map((post: any, index: number) => `
関連記事${index + 1}: ${post.title} (/posts/${post.slug})
概要: ${(post as any).meta_description || (post as any).excerpt || '関連情報'}
`).join('\n')}
` : '';

    const prompt = `# 専門分析レポート詳細セクション作成

**🎯 必須達成目標**: このセクションで必ず2,000-2,500文字を生成してください

**レポートタイトル**: ${title}
**担当セクション**: ${sectionTitle}
**専門家役割**: ${style.personality}
**文字数目標**: 2,000-2,500文字（これは絶対要件です）

## 分析対象データ
${newsItems.map((item: any, index: number) => `
📰 **ニュース${index + 1}**: ${item.title}
詳細: ${item.description}
ソース: ${item.source}
`).join('\n')}

${relatedPostsContext}

## 🚀 重要指示: 詳細で包括的な分析を実行

「${sectionTitle}」について、**必ず2,000-2,500文字**で以下の全要素を含む詳細セクションを作成してください：

### 📋 必須要素（各要素で400-500文字ずつ記述）

#### 1. 技術的背景の詳細説明（400-500文字）
- 技術の歴史的経緯
- 現在の技術的成熟度
- 他技術との比較・違い
- 技術的課題と解決策

#### 2. 具体的事例とケーススタディ（500-600文字）
- 最低3つの実例を詳細に解説
- 各事例の背景・実装・結果
- 定量的な成果指標
- 失敗事例と学習ポイント

#### 3. 数値データに基づく分析（400-500文字）
- 市場規模・成長率の詳細
- ROI・コスト削減効果
- 導入企業の統計データ
- 将来予測と根拠

#### 4. 業界への影響とビジネス価値（400-500文字）
- 各業界への具体的インパクト
- 新しいビジネスモデルの創出
- 競争優位性の獲得方法
- 長期的な市場変化

#### 5. 実装における注意点（300-400文字）
- 技術的制約と対処法
- 導入時のリスク要因
- 成功のためのベストプラクティス
- 避けるべき失敗パターン

### 📝 構造化要求
- 見出しは ## ${sectionTitle} から開始
- サブセクションは ### を使用（上記5要素をサブセクション化）
- 箇条書きは - または 1. 2. 3. を使用
- 重要なポイントは **太字** で強調
- 具体的な数値は **太字** で強調
- 表形式データがある場合は適切な表記法を使用
- 各段落は最低3-4文で構成

### ⚠️ 重要な制約
- **絶対に短縮しないでください**
- **各要素を詳細に展開してください**  
- **具体例を豊富に含めてください**
- **数値データを可能な限り引用してください**
- **専門用語は必ず解説してください**

## ${sectionTitle}
[上記の構造に従い、各要素を400-600文字ずつ詳細に記述し、合計2,000-2,500文字で完成させてください]`;

    try {
      const response = await openai.chat.completions.create({
        model: 'o1-mini',
        messages: [{ role: 'user', content: prompt }]
      });

      const content = response.choices[0]?.message?.content || '';
      sections.push(content);
      console.log(`✅ ${sectionTitle}セクション生成完了: ${content.length}文字`);
      
      // API制限対策で少し待機
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`${sectionTitle}セクション生成エラー:`, error);
      sections.push(`## ${sectionTitle}\n\n[このセクションは生成中にエラーが発生しました]`);
    }
  }
  
  return sections;
}

// 3. FAQ セクション生成
async function generateFAQSections({
  newsItems, companyContent, industryContent, format, title, relatedPosts
}: any): Promise<string> {
  
  const relatedPostsContext = relatedPosts && relatedPosts.length > 0 ? `

### 参考記事（適切な場合は回答に言及）
${relatedPosts.map((post: any, index: number) => `
関連記事${index + 1}: ${post.title} (/posts/${post.slug})
`).join('\n')}
` : '';

  const prompt = `# FAQ詳細セクション作成

**🎯 必須達成目標**: FAQセクション全体で必ず1,500-2,000文字を生成してください

**レポートタイトル**: ${title}
**必要FAQ数**: ${format.structure.faq_sections * 5} 個
**文字数目標**: 1,500-2,000文字（各FAQ回答は300-400文字）

## 分析データ
${newsItems.map((item: any, index: number) => `📰 **ニュース${index + 1}**: ${item.title}`).join('\n')}

${relatedPostsContext}

## 🚀 重要指示: 詳細で実用的なFAQ作成

読者が抱く実務的な疑問について、専門家として**各回答300-400文字**で詳細に回答してください。

### 📋 FAQ作成要件
1. **質問の種類を多様化**：
   - 技術的仕組みに関する質問（2-3個）
   - 導入・実装に関する質問（2-3個）
   - コスト・ROIに関する質問（2個）
   - リスク・注意点に関する質問（2個）
   - 将来性・トレンドに関する質問（1-2個）

2. **回答の詳細化要件**：
   - 各回答は必ず300-400文字で記述
   - 具体例を2-3個含める
   - 数値データがあれば積極的に引用
   - 段階的な説明を心がける
   - 実務的なアドバイスを含める

### 📝 構造化要求
- 見出しは ## よくある質問 (FAQ) から開始
- 各質問は **Q[番号]:** で開始
- 各回答は **A:** で開始
- 回答内で箇条書きを積極的に使用
- 重要なポイントは **太字** で強調
- 具体的な数値や期間は **太字** で強調

### ✅ FAQ形式例
**Q1: [具体的で実務的な質問]**
**A:** [詳細で実用的な回答。必ず300-400文字で記述。以下の要素を含める：
- 基本的な回答
- 具体例2-3個
- 数値データ（可能であれば）
- 実務的なアドバイス
- 注意点や補足情報]

### ⚠️ 重要な制約
- **各回答を絶対に短縮しないでください**
- **必ず300-400文字で回答してください**
- **具体例と数値を豊富に含めてください**
- **実務的で actionable な内容にしてください**

## よくある質問 (FAQ)
[${format.structure.faq_sections * 5}個のFAQを上記形式で生成し、全体で1,500-2,000文字を達成してください]`;

  try {
    const response = await openai.chat.completions.create({
      model: 'o1-mini',
      messages: [{ role: 'user', content: prompt }]
    });

    const content = response.choices[0]?.message?.content || '';
    console.log(`✅ FAQセクション生成完了: ${content.length}文字`);
    return content;

  } catch (error) {
    console.error('FAQセクション生成エラー:', error);
    return '## よくある質問 (FAQ)\n\n[FAQセクションの生成中にエラーが発生しました]';
  }
}

// 4. HOW TO セクション生成
async function generateHowToSections({
  newsItems, companyContent, industryContent, format, title, relatedPosts
}: any): Promise<string> {
  
  const prompt = `# 実装ガイド詳細セクション作成

**🎯 必須達成目標**: 実装ガイドセクション全体で必ず1,800-2,200文字を生成してください

**レポートタイトル**: ${title}
**必要ガイド数**: ${format.structure.how_to_sections} 個
**文字数目標**: 1,800-2,200文字（各ガイドで600-800文字）

## 🚀 重要指示: 超詳細な実装ガイド作成

実際の導入・実装について、**各ガイド600-800文字**で具体的な手順を詳細に説明してください。

### 📋 実装ガイド作成要件
1. **ガイドの種類**：
   - 技術的実装ガイド（1個）
   - 組織的導入ガイド（1個）
   - 運用・メンテナンスガイド（1個）

2. **各ガイドの詳細化要件**：
   - 各ガイドは必ず600-800文字で記述
   - 各ステップは150-200文字で詳細説明
   - 具体的なツール名・サービス名を明記
   - 時間的目安を具体的に提示
   - 失敗事例と対処法を含める

### 📝 構造化要求
- 見出しは ## 実装ガイド から開始
- 各ガイドは ### [実装方法] でサブセクション化
- ステップは #### で階層化
- 箇条書きは - または 1. 2. 3. を使用
- 重要な注意点は **太字** で強調
- 具体的な期間・コストは **太字** で強調
- コードや設定例は適切にフォーマット

### ✅ ガイド形式例
### [具体的な実装・導入方法名（例：社内AI導入の技術的実装ガイド）]

#### ステップ1: [具体的なアクション名]
**実施期間**: [具体的な期間]
**必要なリソース**: [人員・予算・ツール]

- [詳細な説明と注意点。150-200文字で具体的に記述]
- [必要なツール・サービスの具体名]
- [チェックポイントと成功指標]
- [よくある失敗とその対処法]

#### ステップ2: [次のアクション名]
**実施期間**: [具体的な期間]
**前提条件**: [ステップ1の完了事項]

- [具体例と実装のコツ。150-200文字で詳細記述]
- [よくある問題と具体的対処法]
- [品質チェックの方法]

#### ステップ3: [最終段階名]
**実施期間**: [具体的な期間]
**完了条件**: [明確な成功基準]

- [完了条件と評価方法。150-200文字で詳細記述]
- [次のステップへの準備事項]
- [継続的改善のポイント]

### ⚠️ 重要な制約
- **各ガイドを絶対に短縮しないでください**
- **必ず600-800文字で各ガイドを記述してください**
- **具体的なツール名・期間・コストを明記してください**
- **実務的で immediately actionable な内容にしてください**

## 実装ガイド
[${format.structure.how_to_sections}個の詳細ガイドを上記形式で生成し、全体で1,800-2,200文字を達成してください]`;

  try {
    const response = await openai.chat.completions.create({
      model: 'o1-mini',
      messages: [{ role: 'user', content: prompt }]
    });

    const content = response.choices[0]?.message?.content || '';
    console.log(`✅ HOW TOセクション生成完了: ${content.length}文字`);
    return content;

  } catch (error) {
    console.error('HOW TOセクション生成エラー:', error);
    return '## 実装ガイド\n\n[実装ガイドの生成中にエラーが発生しました]';
  }
}

// 5. データ表生成
async function generateDataTables({
  newsItems, companyContent, industryContent, format, title, relatedPosts
}: any): Promise<string> {
  
  const prompt = `# 専門分析レポート: データ表セクション

**レポートタイトル**: ${title}
**必要表数**: ${format.structure.tables} 個

## タスク
ニュースデータから重要な数値、比較データ、統計情報を抽出し、
読みやすい表形式でまとめてください。

### 構造化要求
- 見出しは ## データ比較表 から開始
- 各表には ### [表のタイトル] でサブタイトル
- Markdown表形式を厳密に使用
- 表の前後には説明文を追加
- 重要な数値は **太字** で強調

### 表形式例
### [表のタイトル：具体的な比較内容]

[表の説明文：何を比較しているかの解説]

| 項目 | 値/詳細 | 前年比 | 備考 |
|------|---------|--------|------|
| **項目1** | 具体的数値 | +XX% | 解説・注意点 |
| **項目2** | 具体的数値 | -XX% | トレンド分析 |

[表の解釈：重要なポイントの解説]

## データ比較表
[${format.structure.tables}個の詳細な比較表を上記形式で生成]`;

  try {
    const response = await openai.chat.completions.create({
      model: 'o1-mini',
      messages: [{ role: 'user', content: prompt }]
    });

    const content = response.choices[0]?.message?.content || '';
    console.log(`✅ データ表セクション生成完了: ${content.length}文字`);
    return content;

  } catch (error) {
    console.error('データ表セクション生成エラー:', error);
    return '## データ分析表\n\n[データ表の生成中にエラーが発生しました]';
  }
}

// 6. 結論セクション生成
async function generateConclusion({
  newsItems, companyContent, industryContent, title, relatedPosts
}: any): Promise<string> {
  
  const relatedPostsContext = relatedPosts && relatedPosts.length > 0 ? `

### 参考記事（適切な場合は結論に言及）
${relatedPosts.map((post: any, index: number) => `
関連記事${index + 1}: ${post.title} (/posts/${post.slug})
概要: ${(post as any).meta_description || (post as any).excerpt || '関連情報'}
`).join('\n')}
` : '';

  const prompt = `# まとめセクション詳細作成

**🎯 必須達成目標**: まとめセクションで必ず1,800-2,200文字を生成してください

**レポートタイトル**: ${title}
**文字数目標**: 1,800-2,200文字（これは絶対要件です）

${relatedPostsContext}

## 🚀 重要指示: 包括的で詳細なまとめ作成

このレポート全体を総括し、**必ず1,800-2,200文字**で以下を含む詳細な結論を作成してください：

### 📋 必須要素（各要素で300-400文字ずつ記述）

#### 1. 主要な発見事項の総括（350-400文字）
- 本レポートで明らかになった最重要ポイント3-4点
- 数値データの要約
- 業界への インパクトの整理
- 技術的成熟度の現状評価

#### 2. 企業への戦略的示唆（350-400文字）
- 短期・中期・長期の戦略的アプローチ
- 競合他社との差別化ポイント
- 投資優先順位の提言
- 組織体制の最適化案

#### 3. 今後の展望と予測（350-400文字）
- 12ヶ月以内の市場変化予測
- 3-5年後の技術進化シナリオ
- 新しいビジネス機会の詳細
- 業界構造の変化予測

#### 4. 具体的なアクションプラン（400-450文字）
- 今すぐ開始すべき具体的アクション5項目
- 各アクションの実施期間と予算目安
- 成功指標（KPI）の設定方法
- 実行順序と依存関係の整理

#### 5. リスクと機会の評価（350-400文字）
- 主要リスク要因3項目とその対策
- 見逃されがちな機会2-3項目
- リスク軽減のための推奨対策
- 機会を最大化するための条件

### 📝 構造化要求
- 見出しは ## まとめ から開始
- サブセクションは ### を使用（上記5要素をサブセクション化）
- 重要なポイントは **太字** で強調
- 具体的な数値・期間は **太字** で強調
- 具体的なアクションアイテムは箇条書きで明示
- 各段落は最低3-4文で構成

### ⚠️ 重要な制約
- **絶対に短縮しないでください**
- **各要素を350-450文字で詳細に記述してください**
- **具体的で actionable な内容にしてください**
- **数値目標と期限を可能な限り含めてください**
- **実務的で即座に実行可能な提言をしてください**

## まとめ
[上記の構造に従い、各要素を350-450文字ずつ詳細に記述し、合計1,800-2,200文字で完成させてください]`;

  try {
    const response = await openai.chat.completions.create({
      model: 'o1-mini',
      messages: [{ role: 'user', content: prompt }]
    });

    const content = response.choices[0]?.message?.content || '';
    console.log(`✅ 結論セクション生成完了: ${content.length}文字`);
    return content;

  } catch (error) {
    console.error('結論セクション生成エラー:', error);
    return '## 結論\n\n[結論セクションの生成中にエラーが発生しました]';
  }
}

// 7. セクション結合
function combineAllSections({
  overview,
  mainSections,
  faqSections,
  howToSections,
  dataTables,
  conclusion,
  internalLinks = ''
}: {
  overview: string;
  mainSections: string[];
  faqSections: string;
  howToSections: string;
  dataTables: string;
  conclusion: string;
  internalLinks?: string;
}): string {
  
  const sections = [
    overview,
    ...mainSections,
    faqSections,
    howToSections,
    dataTables,
    conclusion,
    internalLinks
  ].filter(section => section && section.trim().length > 0);

  const combined = sections.join('\n\n---\n\n');
  
  console.log(`🎯 セクション結合完了`);
  console.log(`📊 各セクション文字数:`);
  console.log(`   概要: ${overview.length}文字`);
  mainSections.forEach((section, index) => {
    console.log(`   メイン${index + 1}: ${section.length}文字`);
  });
  console.log(`   FAQ: ${faqSections.length}文字`);
  console.log(`   HOW TO: ${howToSections.length}文字`);
  console.log(`   データ表: ${dataTables.length}文字`);
  console.log(`   結論: ${conclusion.length}文字`);
  if (internalLinks) {
    console.log(`   内部リンク: ${internalLinks.length}文字`);
  }
  console.log(`🎉 合計: ${combined.length}文字`);

  return combined;
}

// SEOメタデータ生成関数
async function generateSEOMetadata({
  title,
  newsItems,
  companyContent,
  style
}: {
  title: string;
  newsItems: any[];
  companyContent: any[];
  style: any;
}): Promise<{ description: string; keywords: string[] }> {
  
  const prompt = `# SEOメタデータ生成タスク

**記事タイトル**: ${title}
**専門家役割**: ${style.personality}

## 分析対象
### ニュースデータ
${newsItems.map((item: any, index: number) => `
- ${item.title}: ${item.description}
`).join('\n')}

### 自社データ
${companyContent.length > 0 ? companyContent.map((content: any, index: number) => `
- ${content.content || content.content_chunk || '内容なし'}
`).join('\n') : '自社データなし'}

## タスク
1. **メタディスクリプション**を生成（120-160文字、SEO最適化済み）
2. **SEOキーワード**を10-15個生成（主要キーワード、関連キーワード、ロングテールキーワード含む）

## 要件
- メタディスクリプション: 読者にクリックを促す魅力的な文章
- キーワード: 検索ボリュームと関連性を考慮
- 自然で読みやすい表現

## 出力形式
メタディスクリプション: [120-160文字の説明文]

SEOキーワード:
- [キーワード1]
- [キーワード2]
- [キーワード3]
...`;

  try {
    const response = await openai.chat.completions.create({
      model: 'o1-mini',
      messages: [{ role: 'user', content: prompt }]
    });

    const result = response.choices[0]?.message?.content || '';
    const lines = result.split('\n');
    
    // メタディスクリプション抽出
    const descLine = lines.find(line => line.includes('メタディスクリプション:'));
    const description = descLine ? descLine.replace('メタディスクリプション:', '').trim() : 
      `${title}について詳細解説。最新動向、実装方法、FAQ、具体例を専門家が分析。企業のAI導入を成功に導く実践的情報をお届けします。`;
    
    // キーワード抽出
    const keywordStartIndex = lines.findIndex(line => line.includes('SEOキーワード:'));
    const keywordLines = lines.slice(keywordStartIndex + 1)
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace(/^-\s*/, '').trim())
      .filter(keyword => keyword.length > 0);

    const keywords = keywordLines.length > 0 ? keywordLines : 
      ['AI技術', '人工知能', 'DX推進', 'デジタル変革', '業務効率化', '最新トレンド'];

    console.log(`✅ SEOメタデータ生成完了`);
    console.log(`📝 メタディスクリプション: ${description.length}文字`);
    console.log(`🔍 SEOキーワード: ${keywords.length}個`);

    return { description, keywords };

  } catch (error) {
    console.error('SEOメタデータ生成エラー:', error);
    return {
      description: `${title}について詳細解説。最新動向、実装方法、具体例を専門家が分析します。`,
      keywords: ['AI技術', '人工知能', 'DX推進', 'デジタル変革']
    };
  }
} 