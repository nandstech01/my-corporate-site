import { NextRequest, NextResponse } from 'next/server';
import { PatternTemplate, patternTemplates } from '@/lib/x-post-generation/pattern-templates';
import { TagGenerator } from '@/lib/x-post-generation/tag-generator';
import { DiagramGenerator } from '@/lib/x-post-generation/diagram-generator';

// OpenAI APIの設定は環境変数から取得
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export interface XPostGenerationRequest {
  patternId: string;
  query?: string;
  generateDiagram?: boolean;
  includeThread?: boolean;
}

/**
 * X投稿生成レスポンス型（引用機能強化版）
 */
export interface XPostResponse {
  success: boolean;
  pattern: PatternTemplate;
  generatedPost: string;
  tags: string[];
  diagram?: string;
  threadPosts?: string[];
  xQuotes?: Array<{url: string, content: string, author?: string}>;
  urlQuotes?: Array<{url: string, title: string, content: string}>;
  metadata: {
    ragSources: string[];
    dataUsed: number;
    generatedAt: string;
    url?: string;
  };
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: XPostGenerationRequest = await request.json();
    const { patternId, query, generateDiagram = false, includeThread = false } = body;

    // パターンの検索
    const pattern = patternTemplates.find(p => p.id === patternId);
    if (!pattern) {
      return NextResponse.json(
        { success: false, error: `Pattern not found: ${patternId}` },
        { status: 400 }
      );
    }

    // RAGデータの取得
    const ragData = await fetchRAGData(pattern.dataSources, query);
    
    // 最新ニュースパターンの場合はX投稿も取得
    let xPosts: any[] = [];
    const isNewsPattern = ['google_news', 'openai_news', 'anthropic_news', 'genspark_news'].includes(patternId);
    
    if (isNewsPattern) {
      const companyMap = {
        'google_news': 'Google',
        'openai_news': 'OpenAI',
        'anthropic_news': 'Anthropic',
        'genspark_news': 'Genspark'
      };
      
      const company = companyMap[patternId as keyof typeof companyMap];
      const searchQuery = query || `${company} AI 最新 ニュース`;
      
      xPosts = await fetchXPosts(searchQuery, company);
      console.log(`🐦 ${company}のX投稿: ${xPosts.length}件取得`);
    }
    
    // RAGデータとX投稿を統合
    const allData = [...ragData, ...xPosts];
    
    // 🚀 高度な投稿文の生成（OpenAI API使用）
    console.log('🚀 高度なコンテンツ生成を開始...');
    const advancedResult = await generateAdvancedPostContent(pattern, allData, query || 'トレンド分析');
    const generatedPost = advancedResult.content;
    
    // 📄 X引用とURL引用の処理
    const quoteSources = extractBestQuoteSources(allData);
    console.log(`📋 引用ソース: X投稿=${quoteSources.xQuotes.length}件, URL引用=${quoteSources.urlQuotes.length}件`);
    
    // タグの生成
    const tagGenerator = new TagGenerator();
    const tags = tagGenerator.generateTags({
      patternId,
      content: generatedPost,
      ragSources: pattern.dataSources,
      maxTags: 3
    });

    // 図解の生成（オプション）
    let diagram: string | undefined;
    if (generateDiagram && pattern.generateDiagram) {
      const diagramGenerator = new DiagramGenerator();
      const diagramResult = await diagramGenerator.generateOptimalDiagram(
        generatedPost,
        `${pattern.name}図解`
      );
      diagram = diagramResult.diagram;
    }

    // 🧵 スレッド投稿の生成（高度版を優先）
    let threadPosts: string[] | undefined;
    if (includeThread) {
      if (advancedResult.threadPosts && advancedResult.threadPosts.length > 0) {
        threadPosts = advancedResult.threadPosts;
        console.log('✅ OpenAI生成のスレッド投稿を使用');
      } else {
        threadPosts = await generateThreadPosts(generatedPost, pattern);
        console.log('✅ 従来のスレッド投稿生成を使用');
      }
    }

    // URLの抽出
    const extractedUrl = extractUrlFromRAGData(ragData);

    const response: XPostResponse = {
      success: true,
      pattern,
      generatedPost,
      tags: tags.all,
      diagram,
      threadPosts,
      xQuotes: quoteSources.xQuotes,
      urlQuotes: quoteSources.urlQuotes,
      metadata: {
        ragSources: pattern.dataSources,
        dataUsed: ragData.length,
        generatedAt: new Date().toISOString(),
        url: extractedUrl
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('X Post Generation Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

/**
 * RAGデータを取得
 */
async function fetchRAGData(dataSources: string[], query?: string): Promise<any[]> {
  const searchQuery = query || 'AI 最新技術 トレンド';
  
  console.log(`🔍 RAGデータ取得開始: クエリ="${searchQuery}", ソース=[${dataSources.join(', ')}]`);
  
  try {
    // 開発環境ではlocalhostを使用、本番環境では適切なURLを設定
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? (process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_URL || 'https://your-domain.com')
      : 'http://localhost:3000';
    
    console.log(`🌐 RAG検索URL: ${baseUrl}/api/search-rag`);
    
    const response = await fetch(`${baseUrl}/api/search-rag`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: searchQuery,
        sources: dataSources, // 修正: sources (複数形) として配列を送信
        limit: 10,
        threshold: 0.3,
        dateFilter: '7days',
        latestNewsMode: true // 最新情報を重視
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ RAG検索成功: ${data.results?.length || 0}件取得`);
      console.log(`📊 データソース内訳:`, data.summary);
      
      return data.results || [];
    } else {
      console.error(`❌ RAG検索失敗: ${response.status} ${response.statusText}`);
      const errorData = await response.text();
      console.error('エラー詳細:', errorData);
      return [];
    }
  } catch (error) {
    console.error('❌ RAG検索API呼び出しエラー:', error);
    return [];
  }
}

/**
 * Brave MCPを使ってX投稿を検索（改良版）
 */
async function fetchXPosts(query: string, company?: string): Promise<any[]> {
  try {
    console.log(`🐦 X投稿検索開始: "${query}" (企業: ${company})`);
    
    // 複数の検索戦略を試す
    const searchQueries = [];
    
    if (company) {
      // 1. 企業名 + キーワードで広範囲検索
      searchQueries.push(`${company} ${query}`);
      // 2. 企業名のX投稿を探す
      searchQueries.push(`"${company}" twitter.com OR x.com`);
      // 3. 企業公式アカウントを探す
      searchQueries.push(`${company} official account twitter`);
    } else {
      // 一般的な検索
      searchQueries.push(query);
      searchQueries.push(`${query} twitter.com OR x.com`);
    }

    let allResults: any[] = [];
    
    // 各検索クエリを順次試す
    for (const searchQuery of searchQueries) {
      console.log(`🔍 検索クエリ: ${searchQuery}`);
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/brave-search?q=${encodeURIComponent(searchQuery)}&count=10`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`📄 検索結果: ${data.results?.length || 0}件`);

          if (data.results && data.results.length > 0) {
            allResults.push(...data.results);
            // 十分な結果が得られたら終了
            if (allResults.length >= 20) break;
          }
        }
      } catch (error) {
        console.log(`⚠️ 検索エラー (クエリ: ${searchQuery}):`, error);
        continue;
      }
    }

    console.log(`📊 全検索結果: ${allResults.length}件`);

    if (allResults.length === 0) {
      console.log('⚠️ すべての検索で結果が得られませんでした');
      return [];
    }

    // 重複除去
    const uniqueResults = allResults.filter((result, index, self) => 
      index === self.findIndex(r => r.url === result.url)
    );

    console.log(`🔄 重複除去後: ${uniqueResults.length}件`);

    // 企業の公式URLや関連URLを検索結果から抽出
    const companyUrls: any[] = [];
    const xPosts: any[] = [];

    uniqueResults.forEach((result: any) => {
      const isXPost = result.url && (
        result.url.includes('x.com') || 
        result.url.includes('twitter.com')
      );
      
      const isCompanyRelated = company && (
        result.url?.includes(company.toLowerCase()) ||
        result.title?.toLowerCase().includes(company.toLowerCase()) ||
        result.description?.toLowerCase().includes(company.toLowerCase())
      );

      if (isXPost) {
        const postData = {
          content: result.description || result.title || '',
          metadata: {
            title: result.title || '',
            url: result.url || '',
            source: 'x_post',
            post_text: result.description || '',
            published_date: result.age || ''
          },
          source: 'x_post'
        };
        xPosts.push(postData);
      } else if (isCompanyRelated && result.url) {
        // 企業関連のURLも保存
        companyUrls.push({
          content: result.description || result.title || '',
          metadata: {
            title: result.title || '',
            url: result.url || '',
            source: 'company_related',
            description: result.description || '',
            published_date: result.age || ''
          },
          source: 'company_related'
        });
      }
    });

    // X投稿がない場合は企業関連URLを使用
    const finalResults = xPosts.length > 0 ? xPosts : companyUrls;
    
    console.log(`🎯 最終結果: X投稿=${xPosts.length}件, 企業関連=${companyUrls.length}件`);
    console.log(`📝 使用するデータ: ${finalResults.length}件`);

    return finalResults.slice(0, 5); // 最大5件

  } catch (error) {
    console.error('❌ X投稿検索エラー:', error);
    return [];
  }
}

/**
 * パターンとRAGデータから投稿文を生成
 */
async function generatePostContent(
  pattern: PatternTemplate, 
  ragData: any[], 
  query?: string
): Promise<string> {
  // RAGデータから重要な情報を抽出
  const insights = extractInsights(ragData);
  
  // URL抽出の詳細ログ
  console.log(`🔗 URL抽出処理開始 - データ件数: ${ragData.length}`);
  console.log(`📊 RAGデータサンプル:`, ragData.slice(0, 2).map(item => ({
    source: item.source,
    hasUrl: !!item.url,
    hasMetadataUrl: !!item.metadata?.url,
    hasSourceUrl: !!item.metadata?.source_url,
    url: item.url || item.metadata?.url || item.metadata?.source_url || 'なし'
  })));
  
  // 使用するURLの決定（改良版）
  let finalUrl = 'https://nands.tech'; // デフォルト
  
  // 企業名マッピング（公式URL）
  const companyUrls: { [key: string]: string } = {
    'Google': 'https://blog.google/',
    'OpenAI': 'https://openai.com/blog/',
    'Microsoft': 'https://blogs.microsoft.com/',
    'Anthropic': 'https://www.anthropic.com/news',
    'Meta': 'https://ai.meta.com/',
    'Amazon': 'https://www.amazon.science/',
    'Apple': 'https://machinelearning.apple.com/',
    'NVIDIA': 'https://blogs.nvidia.com/',
    'Tesla': 'https://www.tesla.com/blog',
    'DeepMind': 'https://deepmind.google/discover/blog/',
  };

  // 1. X投稿のURLを最優先
  const xPostUrls = ragData
    .filter(item => item.source === 'x_post')
    .map(item => item.metadata?.url)
    .filter(Boolean);
  
  // 2. 企業関連URLを次に優先
  const companyRelatedUrls = ragData
    .filter(item => item.source === 'company_related')
    .map(item => item.metadata?.url)
    .filter(Boolean);
  
  // 3. 一般的なRAGデータのURL
  const urls = extractUrls(ragData);

  if (xPostUrls.length > 0) {
    finalUrl = xPostUrls[0];
    console.log(`🐦 X投稿からURL使用: ${finalUrl}`);
  } else if (companyRelatedUrls.length > 0) {
    finalUrl = companyRelatedUrls[0];
    console.log(`🏢 企業関連URLを使用: ${finalUrl}`);
  } else if (urls.length > 0) {
    finalUrl = urls[0];
    console.log(`📰 RAGデータからURL使用: ${finalUrl}`);
  } else {
    // 4. クエリから企業名を推測して公式URLを使用
    const detectedCompany = Object.keys(companyUrls).find(company => 
      (query && query.toLowerCase().includes(company.toLowerCase())) ||
      ragData.some(item => 
        item.content?.toLowerCase().includes(company.toLowerCase()) ||
        item.metadata?.title?.toLowerCase().includes(company.toLowerCase())
      )
    );
    
    if (detectedCompany) {
      finalUrl = companyUrls[detectedCompany];
      console.log(`🎯 推測企業の公式URL使用: ${detectedCompany} → ${finalUrl}`);
    } else {
      console.log('⚠️ URLが取得できませんでした。デフォルトURLを使用');
      
      // デバッグ用：全データ構造を出力
      console.log('🔍 デバッグ用データ構造:');
      ragData.forEach((item, index) => {
        console.log(`データ${index + 1}:`, {
          source: item.source,
          keys: Object.keys(item),
          metadata_keys: item.metadata ? Object.keys(item.metadata) : 'なし',
          hasContent: !!item.content,
          contentPreview: item.content?.substring(0, 50) + '...'
        });
      });
    }
  }
  
  // テンプレートの変数を置換
  let content = pattern.template;
  
  // パターンごとの変数置換
  switch (pattern.id) {
    case 'breaking_insight':
      content = content
        .replace('{industry}', insights.industry || 'AI業界')
        .replace('{important_fact}', insights.fact || 'AIの急速な進歩が確認されています')
        .replace('{analysis}', insights.analysis || '市場への影響は想像以上に大きい可能性があります');
      break;
      
    case 'data_analysis':
      content = content
        .replace('{shocking_number}', insights.number || '75%の企業がAI導入を検討')
        .replace('{insight_1}', insights.insights?.[0] || '実装コストの課題')
        .replace('{insight_2}', insights.insights?.[1] || '人材不足の問題')
        .replace('{insight_3}', insights.insights?.[2] || 'ROI測定の困難さ');
      break;
      
    case 'trend_forecast':
      content = content
        .replace('{tech_field}', insights.field || 'AI技術')
        .replace('{prediction_1}', insights.predictions?.[0] || '自動化の更なる進展')
        .replace('{prediction_2}', insights.predictions?.[1] || '新しいビジネスモデルの登場')
        .replace('{prediction_3}', insights.predictions?.[2] || '人とAIの協業スタイル確立');
      break;
      
    case 'tech_explanation':
      content = content
        .replace('{tech_theme}', insights.theme || 'AI技術')
        .replace('{point_1}', insights.techPoints?.[0] || '導入のメリットが明確')
        .replace('{point_2}', insights.techPoints?.[1] || '実装プロセスが確立')
        .replace('{point_3}', insights.techPoints?.[2] || '成果測定が可能');
      break;
      
    case 'company_comparison':
      content = content
        .replace('{industry}', insights.industry || 'AI業界')
        .replace('{company_a}', insights.companies?.[0] || 'Google')
        .replace('{feature_a}', insights.companyFeatures?.[0] || '包括的なAIソリューション')
        .replace('{company_b}', insights.companies?.[1] || 'OpenAI')
        .replace('{feature_b}', insights.companyFeatures?.[1] || '言語モデルに特化')
        .replace('{company_c}', insights.companies?.[2] || 'Microsoft')
        .replace('{feature_c}', insights.companyFeatures?.[2] || 'エンタープライズ向け統合');
      break;
      
    case 'use_case':
      content = content
        .replace('{technology}', insights.tech || 'AI')
        .replace('{use_case_1}', insights.useCases?.[0] || 'コンテンツ自動生成による効率化')
        .replace('{use_case_2}', insights.useCases?.[1] || 'データ分析の精度向上')
        .replace('{use_case_3}', insights.useCases?.[2] || '顧客対応の品質改善');
      break;
      
    case 'learning_guide':
      content = content
        .replace('{technology}', insights.tech || 'AI')
        .replace('{step_1}', insights.learningSteps?.[0] || '基礎概念の理解')
        .replace('{step_2}', insights.learningSteps?.[1] || '実践的なツール体験')
        .replace('{step_3}', insights.learningSteps?.[2] || 'プロジェクトでの実装');
      break;
      
    case 'question_answer':
      content = content
        .replace('{question}', insights.question || 'AIをどう活用すべきか？')
        .replace('{answer}', insights.answer || '段階的なアプローチが効果的です')
        .replace('{reasoning}', insights.reasoning || '実用性と投資対効果を重視');
      break;
      
    // === 専門技術パターン ===
    case 'aio_analysis':
      content = content
        .replace('{aio_insight}', insights.fact || 'AIO技術の急速な進歩が確認されています')
        .replace('{aio_point_1}', insights.techPoints?.[0] || 'コンテンツ最適化の高度化')
        .replace('{aio_point_2}', insights.techPoints?.[1] || 'ユーザー体験の個別化')
        .replace('{aio_point_3}', insights.techPoints?.[2] || 'パフォーマンス測定の精密化');
      break;

    case 'ai_mode_deep':
      content = content
        .replace('{ai_mode_explanation}', insights.fact || 'AIモードの実装技術が進化しています')
        .replace('{mode_aspect_1}', insights.techPoints?.[0] || 'リアルタイム処理能力')
        .replace('{mode_aspect_2}', insights.techPoints?.[1] || '学習アルゴリズムの最適化')
        .replace('{mode_aspect_3}', insights.techPoints?.[2] || 'ユーザー適応性の向上');
      break;

    case 'relevance_engineering':
      content = content
        .replace('{re_concept}', insights.fact || 'レリバンスエンジニアリングの重要性が高まっています')
        .replace('{re_factor_1}', insights.techPoints?.[0] || 'クエリ理解の精度向上')
        .replace('{re_factor_2}', insights.techPoints?.[1] || 'コンテキスト認識の強化')
        .replace('{re_factor_3}', insights.techPoints?.[2] || 'パーソナライゼーションの実現');
      break;

    case 'ai_feed_tech':
      content = content
        .replace('{feed_technology}', insights.fact || 'AI FEEDシステムの技術革新が進んでいます')
        .replace('{feed_feature_1}', insights.techPoints?.[0] || 'インテリジェントフィルタリング')
        .replace('{feed_feature_2}', insights.techPoints?.[1] || 'リアルタイム更新機能')
        .replace('{feed_feature_3}', insights.techPoints?.[2] || 'プリディクティブ配信');
      break;

    case 'geo_optimization':
      content = content
        .replace('{geo_strategy}', insights.fact || 'GEO戦略の効果が実証されています')
        .replace('{geo_approach_1}', insights.techPoints?.[0] || 'コンテンツ構造の最適化')
        .replace('{geo_approach_2}', insights.techPoints?.[1] || 'エンティティ関連性の強化')
        .replace('{geo_approach_3}', insights.techPoints?.[2] || 'セマンティック検索対応');
      break;

    case 'llmo_strategy':
      content = content
        .replace('{llmo_implementation}', insights.fact || 'LLMO戦略の実装事例が増加しています')
        .replace('{llmo_element_1}', insights.techPoints?.[0] || 'プロンプト最適化')
        .replace('{llmo_element_2}', insights.techPoints?.[1] || 'コンテキスト設計')
        .replace('{llmo_element_3}', insights.techPoints?.[2] || 'アウトプット品質管理');
      break;

    case 'seo_advanced':
      content = content
        .replace('{seo_advanced_tech}', insights.fact || '先進SEO技術の導入が加速しています')
        .replace('{seo_technique_1}', insights.techPoints?.[0] || 'AI駆動のキーワード分析')
        .replace('{seo_technique_2}', insights.techPoints?.[1] || '構造化データの活用')
        .replace('{seo_technique_3}', insights.techPoints?.[2] || 'ユーザー行動予測');
      break;

    case 'entity_analysis':
      content = content
        .replace('{entity_concept}', insights.fact || 'エンティティベース最適化の効果が明確になっています')
        .replace('{entity_method_1}', insights.techPoints?.[0] || '関連性マッピング')
        .replace('{entity_method_2}', insights.techPoints?.[1] || '属性カテゴリ化')
        .replace('{entity_method_3}', insights.techPoints?.[2] || 'ナレッジグラフ構築');
      break;

    case 'query_fanout':
      content = content
        .replace('{query_fanout_strategy}', insights.fact || 'クエリファンアウト技術の実装が進んでいます')
        .replace('{fanout_point_1}', insights.techPoints?.[0] || '並列処理の最適化')
        .replace('{fanout_point_2}', insights.techPoints?.[1] || 'レスポンス統合技術')
        .replace('{fanout_point_3}', insights.techPoints?.[2] || 'パフォーマンス向上');
      break;

    // === 最新ニュースパターン ===
    case 'google_news':
      content = content
        .replace('{google_news_headline}', insights.newsHeadline || 'Googleの最新AI技術発表')
        .replace('{google_point_1}', insights.newsPoints?.[0] || '検索アルゴリズムの革新')
        .replace('{google_point_2}', insights.newsPoints?.[1] || 'ユーザー体験の向上')
        .replace('{google_point_3}', insights.newsPoints?.[2] || '開発者エコシステムの拡充');
      break;

    case 'openai_news':
      content = content
        .replace('{openai_news_headline}', insights.newsHeadline || 'OpenAIの重要なアップデート')
        .replace('{openai_update_1}', insights.newsPoints?.[0] || 'モデル性能の大幅向上')
        .replace('{openai_update_2}', insights.newsPoints?.[1] || '新機能の追加')
        .replace('{openai_update_3}', insights.newsPoints?.[2] || 'API機能の拡張');
      break;

    case 'anthropic_news':
      content = content
        .replace('{anthropic_news_headline}', insights.newsHeadline || 'Anthropicの技術革新')
        .replace('{anthropic_innovation_1}', insights.newsPoints?.[0] || '安全性の向上')
        .replace('{anthropic_innovation_2}', insights.newsPoints?.[1] || '推論能力の強化')
        .replace('{anthropic_innovation_3}', insights.newsPoints?.[2] || '実用性の拡大');
      break;

    case 'genspark_news':
      content = content
        .replace('{genspark_news_headline}', insights.newsHeadline || 'Gensparkプラットフォームの進化')
        .replace('{genspark_evolution_1}', insights.newsPoints?.[0] || '検索機能の強化')
        .replace('{genspark_evolution_2}', insights.newsPoints?.[1] || 'コンテンツ生成の向上')
        .replace('{genspark_evolution_3}', insights.newsPoints?.[2] || 'ユーザビリティの改善');
      break;
      
    default:
      // 基本的な置換（フォールバック）
      content = content
        .replace('{tech_theme}', insights.theme || 'AI技術')
        .replace('{technology}', insights.tech || 'AI')
        .replace('{question}', insights.question || 'AIの活用方法は？')
        .replace('{answer}', insights.answer || '段階的な導入がポイントです');
  }
  
  // 共通変数の置換
  content = content
    .replace('{url}', finalUrl)
    .replace('{hashtags}', generateHashtags(pattern.id));

  return content;
}

/**
 * OpenAI GPT-4を使用した高度な投稿コンテンツ生成（引用機能強化版）
 */
async function generateAdvancedPostContent(
  pattern: PatternTemplate,
  ragData: any[],
  query: string
): Promise<{
  content: string;
  threadPosts?: string[];
  xQuotes?: Array<{url: string, content: string, author?: string}>;
  urlQuotes?: Array<{url: string, title: string, content: string}>;
}> {
  try {
    // RAGデータから内容を結合してcontentを作成
    const allContent = ragData.map(item => {
      const content = item.content || '';
      const title = item.metadata?.title || item.metadata?.video_title || '';
      const source = item.metadata?.source || '';
      return `${title} ${content} ${source}`.trim();
    }).join(' ');

    // 最新データを取得
    const latestData = ragData.length > 0 ? ragData[0] : null;

    const specificFact = extractSpecificFact(allContent, latestData);
    const analysisInsight = extractAnalysis(allContent, ragData);
    const quoteSources = extractBestQuoteSources(ragData);

    // 引用コンテンツを準備
    const quoteContext = {
      xQuotes: quoteSources.xQuotes,
      urlQuotes: quoteSources.urlQuotes
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `あなたは最高品質のX投稿コンテンツクリエイターです。

【重要】以下の引用機能を活用してください：
1. X引用：関連するX投稿のURLを含めて引用
2. URL引用：高品質なニュースや公式サイトのURLを1つだけ引用

【投稿作成ガイドライン】
- 文字数：350-400文字程度でより詳細に
- 構成：問題提起 → 具体的事実 → 分析・洞察 → 行動喚起
- 専門性：業界トレンドと実用的な価値を提供
- エンゲージメント：読者が共感・議論したくなる内容

必ず以下のJSONフォーマットで回答してください：
{
  "content": "投稿内容（350-400文字程度）",
  "threadPosts": ["追加投稿1", "追加投稿2"],
  "primaryQuote": {
    "type": "x_post" または "url",
    "url": "引用URL（1つのみ）",
    "context": "引用理由"
  }
}`
          },
          {
            role: 'user',
            content: `
【投稿パターン】${pattern.name}
【クエリ】${query}

【利用可能な引用ソース】
X引用（${quoteSources.xQuotes.length}件）:
${quoteSources.xQuotes.map((q, i) => `${i+1}. ${q.author}: ${q.content.substring(0, 100)}...\nURL: ${q.url}`).join('\n')}

URL引用（${quoteSources.urlQuotes.length}件）:
${quoteSources.urlQuotes.map((q, i) => `${i+1}. ${q.title}\n概要: ${q.content.substring(0, 100)}...\nURL: ${q.url}`).join('\n')}

【分析データ】
具体的事実: ${specificFact}
分析インサイト: ${analysisInsight}

【要求事項】
1. 最も関連性の高い引用を1つだけ選択（X引用優先）
2. 具体的な数値や事例を含める
3. 読者が行動を起こしたくなる内容
4. 350-400文字程度で詳細に展開
5. 専門知識と実用性のバランス

高品質で充実した投稿を生成してください。`
          }
        ],
        max_tokens: 1200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.choices[0].message.content;

    // JSONパースを試行
    try {
      const parsed = JSON.parse(rawContent);
      return {
        content: parsed.content || rawContent,
        threadPosts: parsed.threadPosts || [],
        xQuotes: quoteSources.xQuotes,
        urlQuotes: quoteSources.urlQuotes
      };
    } catch (parseError) {
      console.warn('OpenAI JSON解析エラー、生テキストを使用:', parseError);
      return {
        content: rawContent,
        xQuotes: quoteSources.xQuotes,
        urlQuotes: quoteSources.urlQuotes
      };
    }

  } catch (error) {
    console.error('OpenAI APIエラー:', error);
    // フォールバック：従来の生成方法
    const fallbackContent = await generatePostContent(pattern, ragData, query);
    const quoteSources = extractBestQuoteSources(ragData);
    
    return {
      content: fallbackContent,
      xQuotes: quoteSources.xQuotes,
      urlQuotes: quoteSources.urlQuotes
    };
  }
}

/**
 * DALL-E 3を使用した投稿用画像生成 - 削除済み
 * X引用とURL引用に特化した機能に変更
 */
// generatePostImage関数は削除

/**
 * RAGデータから洞察を抽出
 */
function extractInsights(ragData: any[]): any {
  console.log(`🧠 洞察抽出開始: ${ragData.length}件のRAGデータ処理`);
  
  if (!ragData.length) {
    console.log('⚠️ RAGデータなし - デフォルト値を使用');
    return {
      industry: 'AI業界',
      fact: '技術革新が継続中',
      analysis: '今後の動向に注目'
    };
  }

  // RAGデータの内容を結合（メタデータも含める）
  const allContent = ragData.map(item => {
    const content = item.content || '';
    const title = item.metadata?.title || item.metadata?.video_title || '';
    const source = item.metadata?.source || '';
    return `${title} ${content} ${source}`.trim();
  }).join(' ');

  console.log(`📝 結合コンテンツ長: ${allContent.length}文字`);
  console.log(`📄 コンテンツサンプル: ${allContent.substring(0, 200)}...`);

  // 最新のトレンドデータを優先して分析
  const trendData = ragData.filter(item => item.source === 'trend');
  const latestContent = trendData.length > 0 ? trendData[0] : ragData[0];
  
  // より具体的な事実を抽出
  const extractedFact = extractSpecificFact(allContent, latestContent);
  const extractedAnalysis = extractAnalysis(allContent, ragData);
  
  const insights = {
    industry: extractIndustry(allContent) || 'AI業界',
    fact: extractedFact,
    analysis: extractedAnalysis,
    number: extractNumber(allContent),
    insights: extractKeyInsights(allContent),
    predictions: extractPredictions(allContent),
    theme: extractTheme(allContent),
    tech: extractTechnology(allContent),
    question: extractQuestion(allContent),
    answer: extractAnswer(allContent),
    // 追加の詳細情報
    companies: extractCompanies(allContent),
    products: extractProducts(allContent),
    trends: extractTrends(allContent),
    // パターン固有の情報
    useCases: extractUseCases(allContent),
    techPoints: extractTechPoints(allContent),
    companyFeatures: extractCompanyFeatures(allContent),
    learningSteps: extractLearningSteps(allContent),
    reasoning: extractReasoning(allContent),
    field: extractField(allContent),
    newsHeadline: extractNewsHeadline(allContent),
    newsPoints: extractNewsPoints(allContent)
  };

  console.log('🎯 抽出された洞察:', {
    industry: insights.industry,
    fact: insights.fact?.substring(0, 50) + '...',
    analysis: insights.analysis?.substring(0, 50) + '...',
    theme: insights.theme
  });

  return insights;
}

/**
 * 具体的な事実を抽出（改良版）
 */
function extractSpecificFact(content: string, latestData?: any): string {
  // 最新データのタイトルや重要情報を優先
  if (latestData?.metadata?.title) {
    const title = latestData.metadata.title;
    if (title.length > 10 && title.length < 100) {
      // タイトルに補足情報を追加
      const description = latestData.metadata?.description || latestData.content || '';
      if (description) {
        const firstSentence = description.split(/[。！？.]/).find((s: string) => s.trim().length > 20);
        if (firstSentence) {
          return `${title}：${firstSentence.trim()}`;
        }
      }
      return title;
    }
  }

  // 企業・製品・技術名を含む具体的な文章を抽出
  const companyKeywords = ['Google', 'OpenAI', 'Microsoft', 'Meta', 'Amazon', 'Apple', 'NVIDIA', 'Tesla', 'Anthropic'];
  const techKeywords = ['AI', '人工知能', 'ChatGPT', 'GPT', 'Claude', 'Gemini', '機械学習', 'LLM', 'AGI'];
  
  // 企業名と技術名を含む文章を優先
  const sentences = content.split(/[。！？.]/).filter(s => s.trim().length > 15);
  
  for (const sentence of sentences) {
    const hasCompany = companyKeywords.some(keyword => sentence.includes(keyword));
    const hasTech = techKeywords.some(keyword => sentence.includes(keyword));
    const hasNumbers = /\d+/.test(sentence);
    
    if ((hasCompany || hasTech) && sentence.length > 20 && sentence.length < 150) {
      // 数値がある場合はより優先
      if (hasNumbers) {
        return sentence.trim();
      }
      // ニュース性のあるキーワードがある場合
      if (sentence.includes('発表') || sentence.includes('リリース') || 
          sentence.includes('開始') || sentence.includes('開発') || 
          sentence.includes('導入') || sentence.includes('実現') ||
          sentence.includes('採用') || sentence.includes('活用')) {
        return sentence.trim();
      }
    }
  }

  // 数値を含む文章を優先
  const numberSentences = sentences.filter(s => 
    /\d+/.test(s) && s.length > 20 && s.length < 150
  );
  
  if (numberSentences.length > 0) {
    return numberSentences[0].trim();
  }

  // 「発表」「リリース」「開始」などのニュース性のある文章
  const newsSentences = sentences.filter(s => 
    (s.includes('発表') || s.includes('リリース') || s.includes('開始') || 
     s.includes('開発') || s.includes('導入') || s.includes('実現') ||
     s.includes('採用') || s.includes('活用') || s.includes('対応')) &&
    s.length > 20 && s.length < 120
  );
    
  if (newsSentences.length > 0) {
    return newsSentences[0].trim();
  }

  // 最後の手段として最初の有意味な文章
  const meaningfulSentence = sentences.find((s: string) => s.length > 30 && s.length < 100);
  return meaningfulSentence ? meaningfulSentence.trim() : extractFirstSentence(content);
}

/**
 * 分析コメントを抽出（改良版）
 */
function extractAnalysis(content: string, ragData: any[]): string {
  // データソースと内容を分析して、より具体的な分析を生成
  const hasTrend = ragData.some(item => item.source === 'trend');
  const hasYoutube = ragData.some(item => item.source === 'youtube');
  const hasCompany = ragData.some(item => item.source === 'company');
  const hasXPost = ragData.some(item => item.source === 'x_post');

  // 企業名や技術名を検出
  const companyMentions = ['Google', 'OpenAI', 'Microsoft', 'Meta', 'Amazon', 'Apple', 'NVIDIA'];
  const techMentions = ['AI', '人工知能', 'ChatGPT', 'LLM', '機械学習', 'ディープラーニング'];
  
  const mentionedCompanies = companyMentions.filter(company => content.includes(company));
  const mentionedTechs = techMentions.filter(tech => content.includes(tech));

  // 数値やパーセンテージの存在をチェック
  const hasNumbers = /\d+%|\d+億|\d+万|\d+倍/.test(content);
  const hasGrowth = content.includes('増加') || content.includes('成長') || content.includes('拡大');
  const hasChallenge = content.includes('課題') || content.includes('問題') || content.includes('懸念');

  // より具体的な分析を生成
  if (mentionedCompanies.length > 1) {
    if (hasNumbers) {
      return '大手テック企業間の競争が激化し、市場シェア争いが新たな局面を迎えています';
    }
    return 'テック業界のリーダー企業たちの戦略転換が業界全体に与える影響は計り知れません';
  }

  if (mentionedCompanies.length === 1 && mentionedTechs.length > 0) {
    const company = mentionedCompanies[0];
    if (company === 'Google') {
      return 'Googleの技術革新は検索・広告業界のゲームチェンジャーとなる可能性があります';
    }
    if (company === 'OpenAI') {
      return 'OpenAIの新技術は生成AI市場の標準を再定義する重要な転換点です';
    }
    if (company === 'Microsoft') {
      return 'Microsoftの企業向けAI戦略は、ビジネス現場でのAI普及を大きく加速させます';
    }
    return `${company}の技術開発は業界の将来を左右する重要な動きと言えるでしょう`;
  }

  if (hasTrend) {
    if (hasNumbers && hasGrowth) {
      return '市場データが示す急成長ぶりは、この分野への投資機会の大きさを物語っています';
    }
    if (content.includes('市場') || content.includes('業界')) {
      return '業界構造そのものが変革期を迎え、新たなビジネスモデルの台頭が予想されます';
    }
    if (mentionedTechs.length > 0) {
      return '技術進歩のスピードが加速し、実用化フェーズへの移行が現実味を帯びてきました';
    }
    return '市場トレンドの変化は、関連業界全体のパラダイムシフトを示唆しています';
  }

  if (hasChallenge) {
    return '技術的課題の解決策が見えてきたことで、実用化への道筋がより明確になりました';
  }

  if (hasYoutube && hasCompany) {
    return '実際の導入事例が増えることで、技術の成熟度と実用性が証明されつつあります';
  }

  if (hasNumbers) {
    return '具体的な数値が示す成果は、この技術の商業的価値の高さを裏付けています';
  }

  // デフォルトの分析（より魅力的に）
  if (content.includes('新') || content.includes('革新')) {
    return '革新的な技術の登場により、既存の常識が覆される可能性があります';
  }

  return '今回の動きは業界の未来を占う重要な指標として注目すべき展開です';
}

/**
 * 業界を抽出
 */
function extractIndustry(content: string): string | null {
  const industries = [
    'AI業界', 'テクノロジー業界', 'IT業界', 'ソフトウェア業界',
    '金融業界', '医療業界', '製造業界', '教育業界', '小売業界'
  ];
  
  for (const industry of industries) {
    if (content.includes(industry.replace('業界', ''))) {
      return industry;
    }
  }
  
  return null;
}

/**
 * 重要な洞察を抽出
 */
function extractKeyInsights(content: string): string[] {
  const insights = [];
  
  if (content.includes('コスト') || content.includes('費用')) {
    insights.push('導入・運用コストの最適化');
  }
  if (content.includes('人材') || content.includes('スキル')) {
    insights.push('専門人材の確保と育成');
  }
  if (content.includes('効果') || content.includes('成果')) {
    insights.push('実用的な効果測定');
  }
  if (content.includes('セキュリティ') || content.includes('安全')) {
    insights.push('セキュリティ要件の重要性');
  }
  if (content.includes('データ')) {
    insights.push('データ活用戦略の明確化');
  }
  
  return insights.length > 0 ? insights.slice(0, 3) : [
    '技術的な実現可能性',
    'ビジネス価値の明確化',
    '導入プロセスの最適化'
  ];
}

/**
 * 予測を抽出
 */
function extractPredictions(content: string): string[] {
  const predictions = [];
  
  if (content.includes('自動化') || content.includes('AI')) {
    predictions.push('業務自動化の更なる進展');
  }
  if (content.includes('市場') || content.includes('成長')) {
    predictions.push('市場規模の大幅な拡大');
  }
  if (content.includes('新') || content.includes('革新')) {
    predictions.push('新しいサービスモデルの登場');
  }
  
  return predictions.length > 0 ? predictions.slice(0, 3) : [
    '技術の成熟化',
    '市場での標準化', 
    '新たな応用分野の開拓'
  ];
}

/**
 * テーマを抽出
 */
function extractTheme(content: string): string {
  const themes = [
    'ChatGPT', 'GPT-4', 'Claude', 'Gemini',
    '機械学習', 'ディープラーニング', 'AI', 'LLM',
    'DX', 'デジタル変革', 'IoT', 'ブロックチェーン'
  ];
  
  for (const theme of themes) {
    if (content.toLowerCase().includes(theme.toLowerCase())) {
      return theme;
    }
  }
  
  return 'AI技術';
}

/**
 * 技術名を抽出
 */
function extractTechnology(content: string): string {
  return extractTheme(content);
}

/**
 * 質問を抽出
 */
function extractQuestion(content: string): string {
  if (content.includes('活用')) {
    return 'どのように活用すべきか？';
  }
  if (content.includes('導入')) {
    return '導入時の注意点は？';
  }
  if (content.includes('効果')) {
    return '期待できる効果は？';
  }
  
  return 'どのように取り組むべきか？';
}

/**
 * 回答を抽出
 */
function extractAnswer(content: string): string {
  if (content.includes('段階') || content.includes('ステップ')) {
    return '段階的なアプローチが効果的です';
  }
  if (content.includes('戦略') || content.includes('計画')) {
    return '明確な戦略立案が重要です';
  }
  
  return '専門的な知見を活用した検討が必要です';
}

/**
 * 企業名を抽出
 */
function extractCompanies(content: string): string[] {
  const companies = ['OpenAI', 'Google', 'Microsoft', 'Meta', 'Amazon', 'Apple', 'Tesla'];
  return companies.filter(company => 
    content.toLowerCase().includes(company.toLowerCase())
  );
}

/**
 * 製品名を抽出
 */
function extractProducts(content: string): string[] {
  const products = ['ChatGPT', 'GPT-4', 'Claude', 'Gemini', 'GitHub Copilot'];
  return products.filter(product => 
    content.toLowerCase().includes(product.toLowerCase())
  );
}

/**
 * トレンドキーワードを抽出
 */
function extractTrends(content: string): string[] {
  const trends = ['AGI', 'マルチモーダル', 'RAG', 'ファインチューニング', 'プロンプトエンジニアリング'];
  return trends.filter(trend => 
    content.toLowerCase().includes(trend.toLowerCase())
  );
}

/**
 * 最初の文を抽出
 */
function extractFirstSentence(content: string): string {
  const sentences = content.split(/[。！？.]/).filter(s => s.trim().length > 10);
  return sentences[0]?.substring(0, 50) + '...' || '注目すべき動向が見られます';
}

/**
 * 数値を抽出
 */
function extractNumber(content: string): string {
  const numberMatch = content.match(/(\d+(?:\.\d+)?)[%％]/);
  if (numberMatch) {
    return `${numberMatch[1]}%`;
  }
  
  const yearMatch = content.match(/(20\d{2})/);
  if (yearMatch) {
    return `${yearMatch[1]}年の動向`;
  }
  
  return '急速な成長';
}

/**
 * キーワードを抽出
 */
function extractKeyword(content: string, keywords: string[]): string | null {
  for (const keyword of keywords) {
    if (content.toLowerCase().includes(keyword.toLowerCase())) {
      return keyword;
    }
  }
  return null;
}

/**
 * URLを抽出
 */
function extractUrls(ragData: any[]): string[] {
  console.log('🔗 URL抽出開始 - データ詳細分析');
  
  const urls: string[] = [];
  
  ragData.forEach((item, index) => {
    console.log(`📋 データ${index + 1} (source: ${item.source}):`);
    
    // 各種URLフィールドをチェック
    const urlCandidates = [
      { field: 'url', value: item.url },
      { field: 'link', value: item.link },
      { field: 'source_url', value: item.source_url },
      { field: 'metadata.source_url', value: item.metadata?.source_url },
      { field: 'metadata.url', value: item.metadata?.url },
      { field: 'metadata.video_url', value: item.metadata?.video_url },
      { field: 'metadata.link', value: item.metadata?.link }
    ];
    
    urlCandidates.forEach(candidate => {
      if (candidate.value) {
        console.log(`  ✓ ${candidate.field}: ${candidate.value}`);
        if (!urls.includes(candidate.value)) {
          urls.push(candidate.value);
        }
      } else {
        console.log(`  ✗ ${candidate.field}: なし`);
      }
    });
    
    // X投稿の場合の特別処理
    if (item.source === 'x_post') {
      console.log(`  🐦 X投稿データ検出`);
      console.log(`    タイトル: ${item.metadata?.title || 'なし'}`);
      console.log(`    URL: ${item.metadata?.url || 'なし'}`);
    }
    
    console.log(`  📊 このデータからの取得URL: ${urlCandidates.filter(c => c.value).length}件`);
  });
  
  // 重複除去と最大3件に制限
  const uniqueUrls = Array.from(new Set(urls)).slice(0, 3);
  
  console.log(`✅ 最終URL抽出結果: ${uniqueUrls.length}件`);
  uniqueUrls.forEach((url, index) => {
    console.log(`  ${index + 1}. ${url}`);
  });
  
  return uniqueUrls;
}

/**
 * URLをRAGデータから抽出
 */
function extractUrlFromRAGData(ragData: any[]): string | undefined {
  const urls = extractUrls(ragData);
  return urls[0];
}

/**
 * ハッシュタグを生成
 */
function generateHashtags(patternId: string): string {
  const tagMap: Record<string, string> = {
    'breaking_insight': '#速報 #AI',
    'data_analysis': '#データ分析',
    'trend_forecast': '#未来予測',
    'tech_explanation': '#技術解説',
    'company_comparison': '#企業分析',
    'use_case': '#活用事例',
    'learning_guide': '#学習ガイド',
    'question_answer': '#Q&A',
    'aio_analysis': '#AIO #AI',
    'ai_mode_deep': '#AI #技術',
    'relevance_engineering': '#AI #技術革新',
    'ai_feed_tech': '#AI #システム',
    'geo_optimization': '#SEO',
    'llmo_strategy': '#LLMO',
    'seo_advanced': '#SEO #AI',
    'entity_analysis': '#分析',
    'query_fanout': '#技術',
    'google_news': '#Google #AI',
    'openai_news': '#OpenAI #AI',
    'anthropic_news': '#Anthropic #AI',
    'genspark_news': '#Genspark #AI'
  };
  
  return tagMap[patternId] || '#AI';
}

/**
 * スレッド投稿を生成
 */
async function generateThreadPosts(mainPost: string, pattern: PatternTemplate): Promise<string[]> {
  const maxLength = 240; // X投稿の制限
  
  if (mainPost.length <= maxLength) {
    return [mainPost];
  }
  
  // 長い投稿を分割
  const sentences = mainPost.split('\n').filter(s => s.trim());
  const posts: string[] = [];
  let currentPost = '';
  
  for (const sentence of sentences) {
    if (currentPost.length + sentence.length + 1 <= maxLength) {
      currentPost += (currentPost ? '\n' : '') + sentence;
    } else {
      if (currentPost) posts.push(currentPost);
      currentPost = sentence;
    }
  }
  
  if (currentPost) posts.push(currentPost);
  
  // 投稿番号を追加
  return posts.map((post, index) => {
    if (posts.length === 1) return post;
    return `${index + 1}/${posts.length}\n\n${post}`;
  });
} 

/**
 * 活用事例を抽出
 */
function extractUseCases(content: string): string[] {
  const useCases = [];
  
  if (content.includes('効率') || content.includes('自動化')) {
    useCases.push('業務効率化による生産性向上');
  }
  if (content.includes('分析') || content.includes('データ')) {
    useCases.push('データ分析の精度と速度向上');
  }
  if (content.includes('顧客') || content.includes('サービス')) {
    useCases.push('顧客サービスの品質改善');
  }
  if (content.includes('コスト') || content.includes('削減')) {
    useCases.push('運用コストの最適化');
  }
  if (content.includes('創造') || content.includes('革新')) {
    useCases.push('新しい価値創造の実現');
  }
  
  return useCases.length > 0 ? useCases.slice(0, 3) : [
    'コンテンツ自動生成による効率化',
    'データ分析の精度向上',
    '顧客対応の品質改善'
  ];
}

/**
 * 技術ポイントを抽出
 */
function extractTechPoints(content: string): string[] {
  const points = [];
  
  if (content.includes('導入') || content.includes('実装')) {
    points.push('導入の手軽さと実用性');
  }
  if (content.includes('精度') || content.includes('品質')) {
    points.push('高い精度と安定性');
  }
  if (content.includes('拡張') || content.includes('スケール')) {
    points.push('スケーラブルな設計');
  }
  if (content.includes('コスト') || content.includes('効率')) {
    points.push('費用対効果の高さ');
  }
  
  return points.length > 0 ? points.slice(0, 3) : [
    '導入のメリットが明確',
    '実装プロセスが確立',
    '成果測定が可能'
  ];
}

/**
 * 企業の特徴を抽出
 */
function extractCompanyFeatures(content: string): string[] {
  const features = [];
  
  if (content.includes('Google') || content.includes('グーグル')) {
    features.push('包括的なAIエコシステム');
  }
  if (content.includes('OpenAI')) {
    features.push('生成AI技術のリーダー');
  }
  if (content.includes('Microsoft') || content.includes('マイクロソフト')) {
    features.push('エンタープライズ向け統合');
  }
  if (content.includes('Amazon') || content.includes('アマゾン')) {
    features.push('クラウドベースのAIサービス');
  }
  
  return features.length > 0 ? features.slice(0, 3) : [
    '包括的なAIソリューション',
    '言語モデルに特化',
    'エンタープライズ向け統合'
  ];
}

/**
 * 学習ステップを抽出
 */
function extractLearningSteps(content: string): string[] {
  const steps = [];
  
  if (content.includes('基礎') || content.includes('基本')) {
    steps.push('基礎概念と仕組みの理解');
  }
  if (content.includes('体験') || content.includes('試用')) {
    steps.push('実際のツールでの体験');
  }
  if (content.includes('実践') || content.includes('応用')) {
    steps.push('実業務での実践と応用');
  }
  
  return steps.length > 0 ? steps.slice(0, 3) : [
    '基礎概念の理解',
    '実践的なツール体験',
    'プロジェクトでの実装'
  ];
}

/**
 * 推論・理由を抽出
 */
function extractReasoning(content: string): string {
  if (content.includes('実用') || content.includes('効果')) {
    return '実用性と投資対効果を重視するため';
  }
  if (content.includes('段階') || content.includes('ステップ')) {
    return '段階的なアプローチが成功の鍵だから';
  }
  if (content.includes('戦略') || content.includes('計画')) {
    return '明確な戦略と計画が必要だから';
  }
  
  return '実用性と投資対効果を重視';
}

/**
 * 技術分野を抽出
 */
function extractField(content: string): string {
  const fields = [
    'AI技術', 'ディープラーニング', '機械学習', 'LLM',
    'データサイエンス', 'ロボティクス', 'IoT', 'DX'
  ];
  
  for (const field of fields) {
    if (content.toLowerCase().includes(field.toLowerCase())) {
      return field;
    }
  }
  
  return 'AI技術';
} 

/**
 * ニュース見出しを抽出
 */
function extractNewsHeadline(content: string): string {
  const headlines = [
    '発表', 'リリース', '開始', '開発', '導入', '実現', '革新', '進化', '進展', '拡充'
  ];
  for (const headline of headlines) {
    if (content.includes(headline)) {
      return `${headline}の詳細`;
    }
  }
  return '最新の技術動向';
}

/**
 * ニュースポイントを抽出
 */
function extractNewsPoints(content: string): string[] {
  const points = [];
  const pointPatterns = [
    '検索アルゴリズムの革新', 'ユーザー体験の向上', '開発者エコシステムの拡充',
    'モデル性能の大幅向上', '新機能の追加', 'API機能の拡張',
    '安全性の向上', '推論能力の強化', '実用性の拡大',
    '検索機能の強化', 'コンテンツ生成の向上', 'ユーザビリティの改善'
  ];
  for (const point of pointPatterns) {
    if (content.includes(point)) {
      points.push(point);
    }
  }
  return points.length > 0 ? points.slice(0, 3) : [
    '検索アルゴリズムの革新', 'ユーザー体験の向上', '開発者エコシステムの拡充'
  ];
} 

/**
 * 最適な引用ソースを抽出（X引用優先）
 */
function extractBestQuoteSources(ragData: any[]): {
  xQuotes: Array<{url: string, content: string, author?: string}>;
  urlQuotes: Array<{url: string, title: string, content: string}>;
} {
  const xQuotes: Array<{url: string, content: string, author?: string}> = [];
  const urlQuotes: Array<{url: string, title: string, content: string}> = [];

  console.log(`🔍 引用ソース解析開始: ${ragData.length}件のデータを処理`);

  ragData.forEach((item, index) => {
    // URL取得 (複数パターンに対応)
    const url = item.metadata?.url || item.metadata?.source_url || item.url;
    
    console.log(`📄 データ${index + 1}: source=${item.source}, url=${url ? 'あり' : 'なし'}`);
    
    if (!url) return;

    // X投稿の場合
    if (item.source === 'x_post' && (url.includes('x.com') || url.includes('twitter.com'))) {
      const quote = {
        url,
        content: item.content || item.metadata?.post_text || '',
        author: extractXUsername(url)
      };
      xQuotes.push(quote);
      console.log(`🐦 X投稿引用追加: ${quote.author} - ${quote.content.substring(0, 50)}...`);
    }
    // 高品質URLの場合（trend, company_related, または一般的なソース）
    else {
      const title = item.metadata?.title || item.title || 'ニュース記事';
      const content = item.content || item.metadata?.description || '';
      
      // Company RAG、Trend RAG、または高品質ソースを引用対象とする
      const isCompanyRAG = item.source === 'company';
      const isTrendRAG = item.source === 'trend';
      const isHighQuality = isHighQualitySource(url);
      
      if ((isCompanyRAG || isTrendRAG || isHighQuality) && content) {
        // 相対パスの場合は絶対パスに変換
        const fullUrl = url.startsWith('/') ? `https://your-domain.com${url}` : url;
        
        const quote = {
          url: fullUrl,
          title,
          content: content.substring(0, 200) // 200文字に制限
        };
        urlQuotes.push(quote);
        console.log(`🔗 URL引用追加: ${title} - ${fullUrl}`);
      } else {
        console.log(`❌ 引用除外: source=${item.source}, isHighQuality=${isHighQuality}, content=${content ? 'あり' : 'なし'}`);
      }
    }
  });

  console.log(`📊 引用ソース取得完了: X投稿=${xQuotes.length}件, URL引用=${urlQuotes.length}件`);

  // X引用は最大1件、URL引用は最大1件に制限（品質重視）
  return {
    xQuotes: xQuotes.slice(0, 1),
    urlQuotes: urlQuotes.slice(0, 1)
  };
}

/**
 * X投稿URLからユーザー名を抽出
 */
function extractXUsername(url: string): string | undefined {
  const match = url.match(/(?:x\.com|twitter\.com)\/([^\/\?]+)/);
  return match ? `@${match[1]}` : undefined;
}

/**
 * 高品質なソースかどうかを判定
 */
function isHighQualitySource(url: string): boolean {
  const highQualityDomains = [
    // 企業公式
    'google.com', 'blog.google', 'ai.google',
    'openai.com', 'microsoft.com', 'blogs.microsoft.com',
    'meta.com', 'ai.meta.com', 'amazon.com',
    'apple.com', 'machinelearning.apple.com',
    'nvidia.com', 'blogs.nvidia.com',
    
    // ニュースサイト
    'nikkei.com', 'techcrunch.com', 'wired.com',
    'reuters.com', 'bbc.com', 'cnn.com',
    'theverge.com', 'arstechnica.com',
    
    // 技術系メディア
    'github.com', 'medium.com', 'qiita.com',
    'zenn.dev', 'dev.to'
  ];

  return highQualityDomains.some(domain => url.includes(domain));
} 

/**
 * 実用性ポイントを抽出
 */
function extractPracticalPoints(content: string): string[] {
  const points = [];
  
  if (content.includes('効率') || content.includes('自動化')) {
    points.push('業務効率化で生産性を30-50%向上');
  }
  if (content.includes('コスト') || content.includes('削減')) {
    points.push('運用コストを大幅に削減可能');
  }
  if (content.includes('精度') || content.includes('品質')) {
    points.push('作業精度と品質の向上を実現');
  }
  if (content.includes('時間') || content.includes('短縮')) {
    points.push('作業時間を従来の1/3に短縮');
  }
  if (content.includes('新機能') || content.includes('アップデート')) {
    points.push('新機能で競争優位性を確保');
  }
  if (content.includes('データ') || content.includes('分析')) {
    points.push('データ活用で意思決定を高速化');
  }
  
  return points.length > 0 ? points.slice(0, 2) : [
    '企業の競争力強化に直結',
    '実装コストと効果のバランスが良好'
  ];
}