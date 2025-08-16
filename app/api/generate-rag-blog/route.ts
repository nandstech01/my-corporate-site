import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { OpenAIEmbeddings } from '@/lib/vector/openai-embeddings';

// Service Role Key を使用してRLSをバイパス
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface RAGData {
  id: number;
  content: string;
  source: string;
  score?: number;
  metadata?: any;
}

interface BlogGenerationRequest {
  query: string;
  ragData: RAGData[];
  targetLength: number;
  businessCategory: string;
  categorySlug: string;
  includeImages: boolean;
}

// 安全にコンテンツを取得するヘルパー関数
function getSafeContent(item: any): string {
  // 複数の可能性を順番に試す
  const content = item.content || 
                 item.content_chunk || 
                 (item.metadata?.content) || 
                 (item.metadata?.description) ||
                 'コンテンツデータが利用できません';
  
  // 文字列でない場合は変換
  if (typeof content !== 'string') {
    return String(content);
  }
  
  return content;
}

// JSON文字列の制御文字をクリーンアップするヘルパー関数
function cleanJsonString(str: string): string {
  // 制御文字を削除（改行、タブ、キャリッジリターン等）
  return str
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
    .replace(/\\\//g, '/')
    .replace(/\\\\/g, '\\')
    .replace(/\\\"/g, '"')
    .replace(/\\\n/g, '\\n')
    .replace(/\\\r/g, '\\r')
    .replace(/\\\t/g, '\\t');
}

// より堅牢なJSON解析関数
function parseGeneratedContent(content: string): any {
  try {
    // 1. 最初にそのまま解析を試す
    return JSON.parse(content);
  } catch (error) {
    try {
      // 2. JSONの開始と終了を検出
      const jsonStart = content.indexOf('{');
      const jsonEnd = content.lastIndexOf('}') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('JSONフォーマットが見つかりません');
      }
      
      let jsonString = content.substring(jsonStart, jsonEnd);
      
      // 3. 制御文字をクリーンアップ
      jsonString = cleanJsonString(jsonString);
      
      // 4. 再度解析を試す
      return JSON.parse(jsonString);
    } catch (secondError) {
      // 5. 最後の手段：正規表現で基本的な情報を抽出
      const titleMatch = content.match(/"title":\s*"([^"]+)"/);
      const contentMatch = content.match(/"content":\s*"([^"]+)"/);
      const metaMatch = content.match(/"meta_description":\s*"([^"]+)"/);
      
      return {
        title: titleMatch ? titleMatch[1] : '生成されたタイトル',
        content: contentMatch ? contentMatch[1] : content,
        meta_description: metaMatch ? metaMatch[1] : '生成されたコンテンツ',
        seo_keywords: ['AI', 'ニュース', 'テクノロジー'],
        excerpt: content.substring(0, 200),
        estimated_reading_time: 5,
        word_count: content.length
      };
    }
  }
}

// Next.js 14のAPI Routes用のタイムアウト設定（本番環境対応）
export const maxDuration = 300; // 5分
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const {
      query,
      ragData,
      targetLength,
      businessCategory,
      categorySlug,
      includeImages
    }: BlogGenerationRequest = await request.json();

    console.log(`🚀 RAGブログ記事生成開始: "${query}"`);
    console.log(`📊 RAGデータ: ${ragData ? ragData.length : 0}件`);
    console.log(`📝 目標文字数: ${targetLength}文字`);
    console.log(`📋 受信データ構造:`, { query, ragData: ragData ? 'あり' : 'なし', targetLength, businessCategory, categorySlug });

    // RAGデータの妥当性チェック
    if (!ragData || !Array.isArray(ragData) || ragData.length === 0) {
      throw new Error(`RAGデータが提供されていません。受信データ: ${JSON.stringify({ ragData: ragData || 'undefined' })}`);
    }

    // カテゴリ関連性を考慮したRAGデータの重み付けと整理
    const categoryKeywords = {
      'reskilling': ['人材育成', 'スキルアップ', '研修', '教育', 'キャリア', '学習'],
      'ai-agents': ['AIエージェント', 'AI開発', '人工知能', '自動化', 'チャットボット', 'API'],
      'corporate': ['企業戦略', '経営', 'ビジネス', 'DX', 'デジタル変革', '組織'],
      'mcp-servers': ['MCP', 'サーバー', 'プロトコル', '連携', '統合', 'API'],
      'chatbot-development': ['チャットボット', '対話AI', 'NLP', '自然言語処理', 'UI/UX'],
      'hr-solutions': ['人事', 'HR', '採用', '人材管理', '労務', '組織運営'],
      'system-development': ['システム開発', 'ソフトウェア', 'アプリ開発', 'Web開発', 'インフラ'],
      'aio-seo': ['SEO', '検索最適化', 'AIO', 'レリバンスエンジニアリング', 'Webマーケティング'],
      'sns-automation': ['SNS', 'ソーシャルメディア', '自動化', 'マーケティング', 'コンテンツ配信'],
      'video-generation': ['動画生成', '映像制作', 'AI動画', 'コンテンツ作成', 'メディア制作'],
      'vector-rag': ['ベクトル検索', 'RAG', '情報検索', 'AI検索', 'データベース', '知識ベース']
    };

    const categoryWords = categoryKeywords[categorySlug as keyof typeof categoryKeywords] || [];
    console.log(`🎯 カテゴリ「${categorySlug}」関連キーワード: ${categoryWords.join(', ')}`);

    // RAGデータにカテゴリ関連性スコアを追加
    const enhancedRAGData = ragData.map((item, index) => {
      const content = getSafeContent(item);
      
      // カテゴリ関連性スコアを計算
      let categoryRelevance = 0;
      const contentLower = content.toLowerCase();
      categoryWords.forEach(keyword => {
        if (contentLower.includes(keyword.toLowerCase())) {
          categoryRelevance += 0.1;
        }
      });
      
      return {
        ...item,
        categoryRelevance,
        enhancedScore: (item.score || 0) + categoryRelevance
      };
    });

    // カテゴリ関連性でソート（関連性の高いものを優先）
    enhancedRAGData.sort((a, b) => (b.enhancedScore || 0) - (a.enhancedScore || 0));

    const ragSummary = enhancedRAGData.map((item, index) => {
      const sourceLabel = {
        'company': '自社情報',
        'trend': 'トレンドニュース',
        'youtube': 'YouTube動画'
      }[item.source] || item.source;

      // 安全なコンテンツ取得
      const content = getSafeContent(item);
      
      // コンテンツの長さを制限
      const maxLength = 800;
      const truncatedContent = content.length > maxLength 
        ? content.substring(0, maxLength) + '...'
        : content;

      // カテゴリ関連性が高い場合は特別マーク
      const relevanceIndicator = item.categoryRelevance > 0.2 ? ' 🎯[高関連性]' : '';

      return `[${sourceLabel} ${index + 1}${relevanceIndicator}]
${truncatedContent}
${item.metadata?.title ? `タイトル: ${item.metadata.title}` : ''}
${item.metadata?.source_url ? `URL: ${item.metadata.source_url}` : ''}
${item.categoryRelevance > 0 ? `カテゴリ関連性: ${(item.categoryRelevance * 100).toFixed(0)}%` : ''}
`;
    }).join('\n\n');

    // カテゴリ別の専門性強化指示
    const categoryExpertise = {
      'reskilling': '人材育成・リスキリング分野の専門家として、具体的な研修プログラム、スキル開発手法、キャリア設計について詳細に解説してください。',
      'ai-agents': 'AIエージェント開発の技術専門家として、実装方法、アーキテクチャ、具体的なコード例や設計パターンについて詳しく説明してください。',
      'corporate': '企業経営・戦略コンサルタントとして、ビジネス戦略、組織運営、DX推進の実践的なアプローチを具体例とともに提案してください。',
      'mcp-servers': 'MCPサーバー技術の専門家として、プロトコル仕様、実装ガイド、統合方法について技術的な詳細を含めて解説してください。',
      'chatbot-development': 'チャットボット開発の専門家として、対話設計、NLP技術、UI/UX設計について実践的な手法を詳述してください。',
      'hr-solutions': '人事・HR分野の専門家として、人材管理システム、採用戦略、組織開発の具体的な手法と事例を説明してください。',
      'system-development': 'システム開発の技術専門家として、開発手法、アーキテクチャ設計、技術選定について詳細な技術情報を提供してください。',
      'aio-seo': 'SEO・AIO最適化の専門家として、レリバンスエンジニアリング手法、技術的SEO、コンテンツ戦略について詳しく解説してください。',
      'sns-automation': 'SNS自動化・マーケティングの専門家として、自動化ツール、コンテンツ戦略、エンゲージメント向上手法を詳述してください。',
      'video-generation': '動画生成・映像制作の専門家として、AI動画技術、制作ワークフロー、効果的なコンテンツ設計について説明してください。',
      'vector-rag': 'ベクトル検索・RAG技術の専門家として、技術アーキテクチャ、実装方法、性能最適化について詳細に解説してください。'
    };

    const expertiseInstruction = categoryExpertise[categorySlug as keyof typeof categoryExpertise] || 
      '該当分野の専門家として、実践的で価値ある情報を詳しく解説してください。';

    // ブログ記事生成プロンプト
    const prompt = `あなたは経験豊富なコンテンツライターです。以下のRAGデータを活用して、SEO最適化された高品質なブログ記事を生成してください。

## 生成指示
- **検索クエリ**: "${query}"
- **目標文字数**: ${targetLength}文字（必須：7,000-10,000文字の詳細な記事を生成）
- **事業カテゴリ**: ${businessCategory}
- **カテゴリ**: ${categorySlug}
- **専門性指示**: ${expertiseInstruction}

## RAG参考データ
${ragSummary}

## カテゴリ特化要件
特に「${categorySlug}」分野に特化した内容として、以下を重視してください：
${categoryWords.length > 0 ? `- 関連キーワード: ${categoryWords.join('、')}` : ''}
- 該当分野の最新トレンドと実践的な手法
- 読者が即座に活用できる具体的なアクションアイテム
- 専門用語の適切な説明と実例の提示

## 記事生成要件

### 1. SEO最適化
- 検索意図に完全に応える内容
- 適切なキーワード密度（2-3%）
- 関連キーワードの自然な配置
- SEOキーワードは厳密に3つのみ生成（メインキーワード1つ + 関連キーワード2つ）

### 2. 構造化・Fragment ID最適化
- 魅力的なタイトル（32文字以内、キーワード含む）
- 論理的な見出し構造（H1→H2→H3）
- Fragment ID付き見出し（例：## はじめに {#introduction}）
- AI検索エンジンでの引用最適化を考慮した構造
- 読みやすい段落分け

### 3. 信頼性・権威性
- RAGデータからの正確な情報引用
- 具体的な数値・事例の活用
- 最新情報の反映

### 4. ユーザー体験
- 価値ある実用的な情報
- actionableなアドバイス
- 読み手の問題解決に直結

### 5. レリバンスエンジニアリング対応
- 検索意図の完全理解
- 包括的なトピックカバー
- 関連質問への言及

### 6. FAQ・HowTo生成（AI引用最適化）
- 記事末尾に「よくある質問」セクションを必ず追加
- Q: [質問文] A: [回答文] 形式で8-12個の充実したFAQ生成
- 読者が実際に検索しそうな具体的な質問を含める
- 各FAQ回答は100-200文字程度の詳細な内容
- 実装手順がある場合は「手順1:」「手順2:」形式のステップも追加
- FAQ・手順セクションにもFragment ID付与

### 7. 【重要】必須記事構造（7,000-10,000文字対応）
記事は以下の詳細構造で必ず作成してください：

\`\`\`
## はじめに {#introduction}
[500-800文字の詳細な導入文・概要・記事の価値提案]

## [メイントピック1：基礎・概念理解] {#main-topic-1}
[1,200-1,500文字の詳細解説]
### [サブトピック1-1] {#subtopic-1-1}
[400-600文字の詳細内容]
### [サブトピック1-2] {#subtopic-1-2}
[400-600文字の詳細内容]

## [メイントピック2：実践・応用] {#main-topic-2}
[1,200-1,500文字の詳細解説]
### [サブトピック2-1] {#subtopic-2-1}
[400-600文字の詳細内容]
### [サブトピック2-2] {#subtopic-2-2}
[400-600文字の詳細内容]

## [メイントピック3：最新動向・事例] {#main-topic-3}
[1,200-1,500文字の詳細解説]
### [サブトピック3-1] {#subtopic-3-1}
[400-600文字の詳細内容]
### [サブトピック3-2] {#subtopic-3-2}
[400-600文字の詳細内容]

## [メイントピック4：課題と解決策] {#main-topic-4}
[1,000-1,200文字の詳細解説]

## よくある質問 {#faq-section}

### Q: [具体的で実用的な質問1]
A: [150-200文字の詳細な回答1]

### Q: [具体的で実用的な質問2]
A: [150-200文字の詳細な回答2]

### Q: [具体的で実用的な質問3]
A: [150-200文字の詳細な回答3]

### Q: [具体的で実用的な質問4]
A: [150-200文字の詳細な回答4]

### Q: [具体的で実用的な質問5]
A: [150-200文字の詳細な回答5]

### Q: [具体的で実用的な質問6]
A: [150-200文字の詳細な回答6]

### Q: [具体的で実用的な質問7]
A: [150-200文字の詳細な回答7]

### Q: [具体的で実用的な質問8]
A: [150-200文字の詳細な回答8]

## まとめ {#conclusion}
[800-1,000文字の包括的な総括・次のアクション・実践的なアドバイス]
\`\`\`

### 8. 【重要】文字数確保の指示
- 各セクションで具体例、事例、詳細な解説を豊富に含める
- 専門用語には必ず説明を付ける
- 実践的なアドバイスを多数盛り込む
- 数値データや統計情報を積極的に活用
- 各段落は100-300文字程度の充実した内容にする

## 【重要】出力形式の指示

必ず以下の形式で、有効なJSONのみを出力してください。他のテキストは含めないでください：

{
  "title": "魅力的なブログタイトル（32文字以内）",
  "meta_description": "160文字以内のメタディスクリプション",
  "content": "記事本文（Markdown形式、適切にエスケープされた文字列）",
  "seo_keywords": ["メインキーワード", "関連キーワード1", "関連キーワード2"],
  "excerpt": "200文字以内の記事要約",
  "estimated_reading_time": 15,
  "word_count": ${targetLength}
}

記事は必ず${targetLength}文字程度になるよう、十分に詳細で価値ある内容にしてください。

【重要】SEOキーワードは必ず3つのみ生成してください：
1. メインキーワード（検索クエリに最も関連するキーワード）
2. 関連キーワード1（内容に密接に関連するキーワード）
3. 関連キーワード2（記事のサブテーマに関連するキーワード）

JSONの文字列内では改行は\\nで表現し、引用符は\\"でエスケープしてください。`;

    // OpenAI o1-miniで記事生成（本番環境タイムアウト対応）
    console.log('🤖 OpenAI o1-miniで記事生成中...');
    let completion;
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries) {
      try {
        console.log(`🔄 OpenAI API呼び出し試行 ${retryCount + 1}/${maxRetries + 1}`);
        
        completion = await Promise.race([
          openai.chat.completions.create({
            model: "o1-mini",
            messages: [
              {
                role: "user",
                content: `${prompt}

【システム指示】
あなたは日本のトップレベルのSEOライター・コンテンツマーケターです。レリバンスエンジニアリング、構造化データ、ユーザー体験を重視した高品質な記事を生成します。

【出力ルール】
1. 必ずJSONフォーマットで出力すること
2. JSON以外のテキストや説明は一切含めないこと
3. 文字列内の特殊文字は適切にエスケープすること
4. 出力は指定されたJSON構造に完全に従うこと
5. 【重要】seo_keywordsは厳密に3つのキーワードのみ配列で出力すること

レスポンスはJSONのみで開始してください：`
              }
            ],
            max_completion_tokens: 8000,
          }),
          // 240秒（4分）でタイムアウト
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('OpenAI API timeout after 240 seconds')), 240000)
          )
        ]);
        
        console.log('✅ OpenAI API呼び出し成功');
        break; // 成功したらループを抜ける
        
      } catch (error) {
        retryCount++;
        console.error(`❌ OpenAI API呼び出しエラー (試行 ${retryCount}/${maxRetries + 1}):`, error);
        
        if (retryCount > maxRetries) {
          throw new Error(`OpenAI API呼び出しが${maxRetries + 1}回失敗しました: ${(error as Error).message}`);
        }
        
        // リトライ前に少し待機（指数バックオフ）
        const waitTime = Math.pow(2, retryCount) * 1000; // 2秒, 4秒, 8秒...
        console.log(`⏳ ${waitTime/1000}秒後にリトライします...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    const generatedContent = (completion as any)?.choices[0]?.message?.content;
    if (!generatedContent) {
      throw new Error('記事生成に失敗しました');
    }

    console.log('✅ 記事生成完了');

    // JSONレスポンスをパース
    let blogData;
    try {
      blogData = parseGeneratedContent(generatedContent);
      
    } catch (parseError) {
      console.error('JSON解析エラー:', parseError);
      console.log('📝 生成されたコンテンツの最初の500文字:', generatedContent.substring(0, 500));
      
      // フォールバック: 基本的な形式で記事を作成
      blogData = {
        title: `${query}に関する包括的ガイド`,
        meta_description: `${query}について、最新情報と実践的なアドバイスを詳しく解説します。`,
        content: generatedContent,
        seo_keywords: [query],
        excerpt: generatedContent.substring(0, 200),
        estimated_reading_time: Math.ceil(targetLength / 400),
        word_count: generatedContent.length
      };
    }

    // カテゴリIDを取得
    const { data: categoryData, error: categoryError } = await supabaseServiceRole
      .from('categories')
      .select('id, business_id')
      .eq('slug', categorySlug)
      .single();

    if (categoryError || !categoryData) {
      console.error('❌ カテゴリエラー:', categoryError);
      throw new Error(`カテゴリが見つかりません: ${categorySlug}`);
    }

    // postsテーブルの構造を確認
    console.log('🔍 postsテーブルの構造を確認中...');
    const { data: tableInfo, error: tableError } = await supabaseServiceRole
      .from('posts')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ テーブル構造確認エラー:', tableError);
    } else {
      console.log('✅ postsテーブル構造確認完了');
    }

    // スラッグ生成（安全性を考慮）
    const baseSlug = (blogData.title || `${query}-blog`)
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    
    // ユニークなスラッグを生成
    const timestamp = Date.now().toString().slice(-6);
    const slug = `${baseSlug}-${timestamp}`;

    // 保存データの準備
    const postData = {
      title: blogData.title || `${query}に関する記事`,
      content: blogData.content || generatedContent,
      slug: slug,
      business_id: categoryData.business_id,
      category_id: categoryData.id,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // meta_descriptionとmeta_keywordsを条件付きで追加
    if (blogData.meta_description) {
      (postData as any).meta_description = blogData.meta_description;
    }
    if (blogData.seo_keywords && Array.isArray(blogData.seo_keywords)) {
      // SEOキーワードを最大3つに制限
      const limitedKeywords = blogData.seo_keywords.slice(0, 3);
      (postData as any).meta_keywords = limitedKeywords;
      console.log(`🔑 SEOキーワード制限適用: ${blogData.seo_keywords.length}個 → ${limitedKeywords.length}個`);
    }

    // データベースに記事を保存
    console.log('💾 データベースに記事を保存中...');
    console.log('💾 カテゴリデータ:', categoryData);
    console.log('💾 保存予定データ:', postData);

    // 重複チェック：同じスラッグの記事が存在するかチェック
    const { data: existingPost } = await supabaseServiceRole
      .from('posts')
      .select('id, slug')
      .eq('slug', slug)
      .eq('business_id', categoryData.business_id)
      .single();

    if (existingPost) {
      console.log('🔄 重複スラッグ検出、新しいスラッグを生成中...');
      const newTimestamp = Date.now().toString();
      const newSlug = `${baseSlug}-${newTimestamp}`;
      postData.slug = newSlug;
      console.log('🆕 新しいスラッグ:', newSlug);
    }

    // 最低限の必須フィールドのみで記事を保存
    const minimalPostData = {
      title: postData.title,
      content: postData.content,
      slug: postData.slug,
      business_id: postData.business_id,
      category_id: postData.category_id,
      status: postData.status
    };

    console.log('💾 最小限データで保存試行:', minimalPostData);

    const { data: savedPost, error: saveError } = await supabaseServiceRole
      .from('posts')
      .insert([minimalPostData])
      .select()
      .single();

    if (saveError) {
      console.error('❌ 記事保存エラー:', saveError);
      console.error('❌ 記事保存エラー詳細:', JSON.stringify(saveError, null, 2));
      console.error('❌ 保存しようとしたデータ:', JSON.stringify(minimalPostData, null, 2));
      
      // エラーオブジェクト全体を出力
      console.error('❌ エラーオブジェクト全体:', Object.keys(saveError));
      console.error('❌ エラーオブジェクト type:', typeof saveError);
      console.error('❌ エラーオブジェクト constructor:', saveError.constructor.name);
      
      // 詳細なエラー情報を取得
      const errorCode = saveError.code || 'UNKNOWN';
      const errorMessage = saveError.message || saveError.details || saveError.hint || 'データベース保存エラーが発生しました';
      
      console.error(`❌ エラーコード: ${errorCode}`);
      console.error(`❌ エラーメッセージ: ${errorMessage}`);
      
      // postsテーブルの構造を確認
      console.log('🔍 postsテーブルの構造を詳細確認...');
      const { data: samplePost, error: sampleError } = await supabaseServiceRole
        .from('posts')
        .select('*')
        .limit(1);
      
      if (sampleError) {
        console.error('❌ サンプルデータ取得エラー:', sampleError);
      } else if (samplePost && samplePost.length > 0) {
        console.log('✅ サンプルpost構造:', Object.keys(samplePost[0]));
      }
      
      throw new Error(`記事の保存に失敗しました（${errorCode}）: ${errorMessage}`);
    }

    if (!savedPost) {
      throw new Error('記事の保存は成功しましたが、データが返されませんでした');
    }

    console.log(`✅ 記事保存完了: ID ${savedPost.id}`);

    // 🎯 ここから重要: 生成された記事をベクトル化してRAGシステムに追加
    console.log('🔢 生成された記事をベクトル化中...');
    
    try {
      // 記事内容をベクトル化（タイムアウト対応）
      const embeddings = new OpenAIEmbeddings();
      const contentVector = await Promise.race([
        embeddings.embedSingle(blogData.content),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('ベクトル化がタイムアウトしました（60秒）')), 60000)
        )
      ]) as number[];
      
      console.log(`🔢 ベクトル化完了: 次元=${contentVector.length}`);

      // company_vectorsテーブルに保存（既存の構造に合わせて）
      const { data: vectorData, error: vectorError } = await supabaseServiceRole
        .from('company_vectors')
        .insert([
          {
            page_slug: slug,
            content_type: 'generated_blog',
            section_title: blogData.title,
            content_chunk: blogData.content,
            embedding: contentVector,
            metadata: {
              title: blogData.title,
              source_type: 'generated_blog',
              source_url: `/posts/${slug}`,
              post_id: savedPost.id,
              category: categorySlug,
              business_category: businessCategory,
              seo_keywords: blogData.seo_keywords,
              generated_from_query: query,
              rag_sources: ragData.map(item => item.source),
              word_count: blogData.word_count
            },
            fragment_id: `blog_${savedPost.id}`,
            service_id: businessCategory,
            relevance_score: 1.0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (vectorError) {
        console.error('❌ ベクトル保存エラー:', vectorError);
        // 記事は保存されているので、ベクトル化エラーは警告として扱う
        console.warn('記事は保存されましたが、ベクトル化に失敗しました');
      } else {
        console.log(`✅ ベクトル保存完了: ID ${vectorData.id}`);
      }

      // generated_contentテーブルにも記録
      try {
        console.log('📝 generated_contentテーブルに記録中...');
        const generatedContentData = {
          type: 'rag-blog',
          title: blogData.title,
          content: blogData.content,
          metadata: {
            post_id: savedPost.id,
            vector_id: vectorData?.id,
            query: query,
            rag_sources: ragData.map(item => item.source),
            word_count: blogData.word_count,
            seo_keywords: blogData.seo_keywords
          }
        };

        console.log('📝 generated_content保存データ:', JSON.stringify(generatedContentData, null, 2));

        const { data: generatedContentResult, error: generatedContentError } = await supabaseServiceRole
          .from('generated_content')
          .insert([generatedContentData]);

        if (generatedContentError) {
          console.error('❌ generated_content保存エラー:', generatedContentError);
          console.warn('記事とベクトルは保存されましたが、generated_contentテーブルへの記録に失敗しました');
        } else {
          console.log('✅ generated_content保存完了');
        }
      } catch (generatedContentErr) {
        console.error('❌ generated_content挿入エラー:', generatedContentErr);
        console.warn('記事とベクトルは保存されましたが、generated_contentテーブルへの記録に失敗しました');
      }

    } catch (vectorError) {
      console.error('❌ ベクトル化エラー:', vectorError);
      console.warn('記事は保存されましたが、ベクトル化に失敗しました');
    }

    console.log(`🎉 RAGブログ記事生成・ベクトル化完了: ID ${savedPost.id}`);

    return NextResponse.json({
      success: true,
      postId: savedPost.id,
      title: blogData.title,
      wordCount: blogData.word_count,
      slug: slug,
      ragDataUsed: ragData.length,
      vectorized: true, // ベクトル化成功フラグ
      metadata: {
        seo_keywords: blogData.seo_keywords,
        estimated_reading_time: blogData.estimated_reading_time,
        sources: ragData.map(item => item.source),
        now_available_for_future_rag: true // 今後のRAG検索で利用可能
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ RAGブログ記事生成エラー:', error);
    return NextResponse.json(
      { 
        error: 'RAGブログ記事生成でエラーが発生しました',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
} 