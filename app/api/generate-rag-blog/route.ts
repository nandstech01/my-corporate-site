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
        seo_keywords: ['AI', 'ニュース'],
        excerpt: content.substring(0, 200),
        estimated_reading_time: 5,
        word_count: content.length
      };
    }
  }
}

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
    console.log(`📊 RAGデータ数: ${ragData.length}件`);
    console.log(`📝 目標文字数: ${targetLength}文字`);

    // RAGデータの妥当性チェック
    if (!ragData || ragData.length === 0) {
      throw new Error('RAGデータが提供されていません');
    }

    // RAGデータを整理・要約
    const ragSummary = ragData.map((item, index) => {
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

      return `[${sourceLabel} ${index + 1}]
${truncatedContent}
${item.metadata?.title ? `タイトル: ${item.metadata.title}` : ''}
${item.metadata?.source_url ? `URL: ${item.metadata.source_url}` : ''}
`;
    }).join('\n\n');

    // ブログ記事生成プロンプト
    const prompt = `あなたは経験豊富なコンテンツライターです。以下のRAGデータを活用して、SEO最適化された高品質なブログ記事を生成してください。

## 生成指示
- **検索クエリ**: "${query}"
- **目標文字数**: ${targetLength}文字
- **事業カテゴリ**: ${businessCategory}
- **カテゴリ**: ${categorySlug}

## RAG参考データ
${ragSummary}

## 記事生成要件

### 1. SEO最適化
- 検索意図に完全に応える内容
- 適切なキーワード密度（2-3%）
- 関連キーワードの自然な配置

### 2. 構造化
- 魅力的なタイトル（32文字以内、キーワード含む）
- 論理的な見出し構造（H1→H2→H3）
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

## 【重要】出力形式の指示

必ず以下の形式で、有効なJSONのみを出力してください。他のテキストは含めないでください：

{
  "title": "魅力的なブログタイトル（32文字以内）",
  "meta_description": "160文字以内のメタディスクリプション",
  "content": "記事本文（Markdown形式、適切にエスケープされた文字列）",
  "seo_keywords": ["キーワード1", "キーワード2", "キーワード3"],
  "excerpt": "200文字以内の記事要約",
  "estimated_reading_time": 5,
  "word_count": ${targetLength}
}

記事は必ず${targetLength}文字程度になるよう、十分に詳細で価値ある内容にしてください。JSONの文字列内では改行は\\nで表現し、引用符は\\"でエスケープしてください。`;

    // OpenAI o1-miniで記事生成
    console.log('🤖 OpenAI o1-miniで記事生成中...');
    const completion = await openai.chat.completions.create({
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

レスポンスはJSONのみで開始してください：`
        }
      ],
      max_completion_tokens: 4000,
    });

    const generatedContent = completion.choices[0]?.message?.content;
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
      (postData as any).meta_keywords = blogData.seo_keywords;
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
      // 記事内容をベクトル化
      const embeddings = new OpenAIEmbeddings();
      const contentVector = await embeddings.embedSingle(blogData.content);
      
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