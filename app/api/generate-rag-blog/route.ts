import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { OpenAIEmbeddings } from '@/lib/vector/openai-embeddings';
import { FragmentVectorizer } from '@/lib/vector/fragment-vectorizer';
import { AutoTOCSystem } from '@/lib/structured-data/auto-toc-system';
import { HowToFAQSchemaSystem } from '@/lib/structured-data/howto-faq-schema';
import { UnifiedStructuredDataSystem } from '@/lib/structured-data/index';
import { generateBlogFAQEntities, generateBlogSectionEntities } from '@/lib/structured-data/entity-relationships';

// 🔗 Fragment ID内部リンク自動生成システム（一時的に無効化）
// import { enhanceMarkdownWithFragmentLinks, FragmentLinkGenerator } from '@/lib/ai-internal-links/fragment-link-generator';

// 🚀 AI検索最適化システム（既存システム完全保護）
import {
  generateCompleteAIEnhancedUnifiedPageData,
  generateCompleteAIEnhancedStructuredDataJSON
} from '@/lib/structured-data/unified-integration-ai-enhanced';

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
  // 🆕 AIアーキテクト記事生成モード
  generationMode?: 'education' | 'architect';
  articleType?: 'career' | 'technical' | 'freelance' | 'general';
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
      includeImages,
      autoFetchTrends = false, // 新規: トレンドニュース自動収集フラグ
      generationMode = 'education', // 🆕 デフォルトは教育モード（既存動作を維持）
      articleType = 'general' // 🆕 記事タイプ（architectモード時に使用）
    }: BlogGenerationRequest & { autoFetchTrends?: boolean } = await request.json();

    console.log(`🚀 RAGブログ記事生成開始: "${query}"`);
    console.log(`📊 RAGデータ: ${ragData ? ragData.length : 0}件`);
    console.log(`📝 目標文字数: ${targetLength}文字`);
    console.log(`🔄 自動トレンド収集: ${autoFetchTrends ? '有効' : '無効'}`);
    console.log(`🏗️ 生成モード: ${generationMode} / 記事タイプ: ${articleType}`);
    console.log(`📋 受信データ構造:`, { query, ragData: ragData ? 'あり' : 'なし', targetLength, businessCategory, categorySlug, autoFetchTrends, generationMode, articleType });

    // 🆕 自動トレンドニュース収集（既存のragDataを拡張）
    let currentRagData = ragData || [];
    
    if (autoFetchTrends) {
      console.log('\n🔍 ========================================');
      console.log(`🚀 自動トレンドニュース収集開始（${generationMode}モード）`);
      console.log('🔍 ========================================\n');
      
      try {
        // 🆕 モードに応じてクエリを切り替え
        let trendQueries: string[];
        
        if (generationMode === 'architect') {
          // AIアーキテクトモード: キャリア・年収・案件系のクエリ
          const { getArchitectQueriesByArticleType } = await import('@/lib/intelligent-rag/architect-trend-queries');
          trendQueries = getArchitectQueriesByArticleType(articleType as 'career' | 'technical' | 'freelance' | 'general', 5);
          console.log(`🏗️ AIアーキテクトモード: ${articleType}タイプのクエリを選択`);
        } else {
          // 教育モード（既存動作を維持）: 一般的なAI/テックトレンド
          const { getRandomBlogTrendQueries } = await import('@/lib/intelligent-rag/blog-trend-queries');
          trendQueries = getRandomBlogTrendQueries(5);
          console.log(`📚 教育モード: 汎用トレンドクエリを選択`);
        }
        
        console.log(`📰 選択されたトレンドクエリ（5個）:`);
        trendQueries.forEach((q, idx) => console.log(`  ${idx + 1}. "${q}"`));
        
        const embeddings = new OpenAIEmbeddings();
        let totalNewsCollected = 0;
        
        // 各クエリでBrave Search APIを呼び出し
        for (const trendQuery of trendQueries) {
          try {
            console.log(`\n🔍 Brave Search API呼び出し: "${trendQuery}"`);
            
            // 🔧 Brave Search API 無料プラン対応のパラメータ
            // freshness, country, search_lang は有料プランのみ対応の可能性
            const searchResponse = await fetch(
              `https://api.search.brave.com/res/v1/web/search?${new URLSearchParams({
                q: trendQuery,
                count: '10', // 各クエリで10件取得
              })}`,
              {
                headers: {
                  'Accept': 'application/json',
                  'Accept-Encoding': 'gzip',
                  'X-Subscription-Token': process.env.BRAVE_API_KEY || '',
                },
              }
            );
            
            if (!searchResponse.ok) {
              console.warn(`⚠️ Brave Search API エラー (${trendQuery}): ${searchResponse.status}`);
              continue;
            }
            
            const braveData = await searchResponse.json();
            const allResults = braveData.web?.results || [];
            
            // 📅 age情報を使用して24時間以内のニュースのみフィルタリング
            const braveResults = allResults.filter((item: any) => {
              if (item.age) {
                const ageMatch = item.age.match(/(\d+)\s*(minute|hour|day)/i);
                if (ageMatch) {
                  const value = parseInt(ageMatch[1]);
                  const unit = ageMatch[2].toLowerCase();
                  
                  let hoursAgo = 0;
                  if (unit === 'minute') hoursAgo = value / 60;
                  else if (unit === 'hour') hoursAgo = value;
                  else if (unit === 'day') hoursAgo = value * 24;
                  
                  return hoursAgo <= 24;
                }
              }
              return true; // age情報がない場合は含める
            }).slice(0, 3); // 最大3件
            
            console.log(`  ✅ ニュース取得成功（24時間以内）: ${braveResults.length}件 / ${allResults.length}件中`);
            
            // 各ニュースをベクトル化してtrend_vectorsに保存
            for (const item of braveResults) {
              try {
                const contentForVectorization = `
タイトル: ${item.title || ''}
内容: ${item.description || ''}
ソース: ${item.profile?.name || new URL(item.url).hostname.replace('www.', '')}
URL: ${item.url || ''}
                `.trim();
                
                const embedding = await embeddings.embedSingle(contentForVectorization);
                
                const { data: savedVector, error: saveError } = await supabaseServiceRole
                  .from('trend_vectors')
                  .insert([
                    {
                      content_id: `brave_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                      content_type: 'news',
                      content: contentForVectorization,
                      embedding: embedding,
                      trend_topic: item.title || 'No title',
                      source: item.profile?.name || 'Unknown',
                      source_url: item.url || '',
                      relevance_score: 0.8,
                      trend_date: new Date().toISOString().split('T')[0],
                      popularity_score: 0.8,
                      keywords: [],
                      metadata: {
                        query: trendQuery,
                        retrieved_at: new Date().toISOString(),
                        api_source: 'brave_search_api_auto'
                      }
                    }
                  ])
                  .select()
                  .single();
                
                if (saveError) {
                  console.warn(`  ⚠️ ベクトル保存エラー: ${saveError.message}`);
                } else {
                  totalNewsCollected++;
                  console.log(`  ✅ ベクトル化完了: ID ${savedVector.id}`);
                }
              } catch (itemError) {
                console.warn(`  ⚠️ ニュースアイテム処理エラー:`, itemError);
              }
            }
          } catch (queryError) {
            console.warn(`⚠️ クエリ処理エラー (${trendQuery}):`, queryError);
          }
        }
        
        console.log(`\n✅ 自動トレンド収集完了: ${totalNewsCollected}件のニュースを保存`);
        console.log('🔍 ========================================\n');
        
      } catch (autoFetchError) {
        console.error('❌ 自動トレンド収集エラー:', autoFetchError);
        console.warn('⚠️ トレンド収集に失敗しましたが、既存のRAGデータでブログ生成を続行します');
      }
    }

    // 🆕 E-E-A-T「Experience」強化: 全モードで運用事例を取得
    let kenjiThoughtsContext = '';
    let siteExperienceContext = ''; // 教育モード用：当サイトの運用事例
    
    console.log('\n🧠 ========================================');
    console.log('🏗️ 運用事例・思想RAG検索開始（E-E-A-T Experience強化）');
    console.log(`📝 モード: ${generationMode === 'architect' ? 'AIアーキテクト' : '教育・情報提供'}`);
    console.log('🧠 ========================================\n');
    
    try {
      // kenji_harada_architect_knowledge からデータ取得
      const { data: kenjiThoughts, error: kenjiError } = await supabaseServiceRole
        .from('kenji_harada_architect_knowledge')
        .select('thought_id, thought_title, thought_content, thought_category, priority')
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .limit(15);
      
      if (kenjiError) {
        console.warn('⚠️ 運用事例RAG検索エラー:', kenjiError);
      } else if (kenjiThoughts && kenjiThoughts.length > 0) {
        console.log(`✅ 運用事例・思想データ取得: ${kenjiThoughts.length}件`);
        
        // 実装経験系（E-E-A-T Experience用）
        const implementationThoughts = kenjiThoughts.filter(t => 
          t.thought_category === 'implementation' || 
          t.thought_category === 'core-innovation' ||
          t.thought_category === 'architecture-decision' ||
          t.thought_category === 'seo-innovation' ||
          t.thought_category === 'automation' ||
          t.thought_id?.includes('implementation') ||
          t.thought_id?.includes('impl')
        );
        
        // 哲学・ブランディング系
        const philosophyThoughts = kenjiThoughts.filter(t => 
          t.thought_category === 'philosophy' || 
          t.thought_id === 'mission-statement' ||
          t.thought_id === 'ai-architect-role'
        );
        
        if (generationMode === 'architect') {
          // AIアーキテクトモード: 実装経験をランダム選択 + 哲学は固定
          // 🎲 毎回同じにならないよう、実装経験をシャッフルして2-3件選択
          const shuffledImplementation = [...implementationThoughts].sort(() => Math.random() - 0.5);
          const selectedImplementation = shuffledImplementation.slice(0, 3); // ランダムに3件
          
          // 哲学は固定（ブランディングのため1件）
          const selectedPhilosophy = philosophyThoughts.slice(0, 1);
          
          const selectedThoughts = [...selectedImplementation, ...selectedPhilosophy];
          
          kenjiThoughtsContext = selectedThoughts.map(t => 
            `【${t.thought_title}】\n${t.thought_content}`
          ).join('\n\n---\n\n');
          
          console.log(`📝 AIアーキテクトモード - プロンプトに注入する思想: ${selectedThoughts.length}件`);
          console.log(`   🎲 実装経験（ランダム選択）: ${selectedImplementation.length}件`);
          selectedImplementation.forEach(t => console.log(`     - ${t.thought_title}`));
          console.log(`   📜 哲学（固定）: ${selectedPhilosophy.length}件`);
          selectedPhilosophy.forEach(t => console.log(`     - ${t.thought_title}`));
        } else {
          // 教育モード: E-E-A-T Experience強化のため、ランダムに1-2件の運用事例を選択
          const shuffled = [...implementationThoughts].sort(() => Math.random() - 0.5);
          const selectedExperiences = shuffled.slice(0, 2);
          
          if (selectedExperiences.length > 0) {
            siteExperienceContext = selectedExperiences.map(t => {
              // 運用事例を「当サイトでの事例」形式に変換
              return `【当サイト運用事例: ${t.thought_title}】\n${t.thought_content}`;
            }).join('\n\n');
            
            console.log(`📝 教育モード - E-E-A-T Experience用運用事例: ${selectedExperiences.length}件`);
            selectedExperiences.forEach(t => console.log(`  - ${t.thought_title} (${t.thought_category})`));
          }
        }
      }
      
      console.log('🧠 ========================================\n');
      
    } catch (kenjiError) {
      console.error('❌ 運用事例RAGエラー:', kenjiError);
      console.warn('⚠️ 運用事例の取得に失敗しましたが、ブログ生成を続行します');
    }

    // RAGデータの妥当性チェック
    if (!currentRagData || !Array.isArray(currentRagData) || currentRagData.length === 0) {
      throw new Error(`RAGデータが提供されていません。受信データ: ${JSON.stringify({ ragData: currentRagData || 'undefined' })}`);
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
    const enhancedRAGData = currentRagData.map((item, index) => {
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
    // 🆕 モードに応じてペルソナを切り替え
    const writerPersona = generationMode === 'architect' 
      ? `あなたはAIアーキテクト「原田賢治」として記事を執筆します。
- 実績: Triple RAG、Vector Link、使い捨てRAG設計を設計・実装した実務経験者
- 哲学: 「AIが私を理解する構造を設計する」
- トーン: 知的で専門的だが、分かりやすく実践的
- 一人称: 「私」を使用
- 特徴: 自分の実装経験を交えつつ、市場データに基づいた具体的な数字を提示する`
      : 'あなたは経験豊富なコンテンツライターです。';

    const prompt = `${writerPersona}以下のRAGデータを活用して、SEO最適化された高品質なブログ記事を生成してください。

## 生成指示
- **検索クエリ**: "${query}"
- **目標文字数**: ${targetLength}文字（必須：7,000-10,000文字の詳細な記事を生成）
- **事業カテゴリ**: ${businessCategory}
- **カテゴリ**: ${categorySlug}
- **専門性指示**: ${expertiseInstruction}

## RAG参考データ
${ragSummary}

${generationMode === 'architect' && kenjiThoughtsContext ? `## 🧠 原田賢治の思想・経験（AIアーキテクトモード専用）
以下の思想・経験を記事に自然に織り交ぜてください。「私が〜を設計した際に」「私の実装経験では」などの一人称で言及してください。

${kenjiThoughtsContext}

⚠️ **【絶対禁止】嘘・捏造の防止ルール** ⚠️
- 上記の思想・経験に書かれていない具体的な数字（改善率〇%、金額〇円など）を勝手に作らないこと
- 「クライアントの〇〇が〇%改善」など、存在しない実績を捏造しないこと
- サービス価格（〇万円〜など）を勝手に作らないこと
- 年収交渉や営業経験など、上記に書かれていない経験を捏造しないこと
- 数字が必要な場合は「一般的には〜と言われている」「業界平均では〜」などRAGデータからの引用に留めること
- 私（原田）の経験として書けるのは、上記の思想・経験に明記されている内容のみ

` : ''}${generationMode !== 'architect' && siteExperienceContext ? `## 🌟 E-E-A-T「Experience（経験）」強化 - 当サイト独自の運用事例
Googleの品質評価ガイドライン「E-E-A-T」の「Experience（経験）」を強化するため、以下の当サイト独自の運用事例を**記事内に1〜2回**自然に織り込んでください。

【重要】織り込み方のルール:
- 「当サイトで実際に稼働させているシステムでは〜」「筆者が運用しているサイトでは〜」などの形式で言及
- 二次情報のまとめだけでなく、一次体験の「匂い」を出す
- 記事の流れに自然に溶け込ませる（不自然な挿入はNG）
- 毎回同じ文章にならないよう、言い回しを変える

【当サイト運用事例データ】
${siteExperienceContext}

⚠️ **【絶対禁止】嘘・捏造の防止ルール** ⚠️
- 上記の運用事例に書かれていない具体的な数字は作らない
- 「〇%改善」「〇円削減」など、存在しない実績を捏造しない
- 事例として言及できるのは、上記に明記されている内容のみ
- 上記にない経験や実績は絶対に追加しない

` : ''}
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
- Q: [質問文] {#faq-1} A: [回答文] 形式で8-12個の充実したFAQ生成
- 各FAQ質問に必ず個別のFragment ID（{#faq-1}、{#faq-2}、...）を付与
- 読者が実際に検索しそうな具体的な質問を含める
- 各FAQ回答は100-200文字程度の詳細な内容
- 実装手順がある場合は「手順1:」「手順2:」形式のステップも追加
- FAQ・手順セクションにもFragment ID付与
- AI検索エンジンが個別のQ&Aを正確に引用できるよう最適化

### 7. 【重要】必須記事構造（7,000-10,000文字対応）
記事は以下の詳細構造で必ず作成してください：

⚠️ **【超重要】見出しタイトルの生成ルール** ⚠️
- 「メイントピック1」や「サブトピック1-1」のような汎用的な名前は絶対に使わないこと
- 各見出しには、その内容を具体的に表す魅力的で検索されやすいタイトルを付けること
- 見出しタイトルは読者とAI検索エンジンの両方にとって有益で具体的な内容であること
- 良い例: ## Google AIの最新機能と活用方法 {#main-topic-1}
- 悪い例: ## メイントピック1：基礎・概念理解 {#main-topic-1}

🎲 **【重要】記事バリエーション・独自性ルール** 🎲
- 毎回同じ構成・同じ切り口にならないよう、以下のいずれかを意識して変化をつけること：
  ① 切り口を変える（課題→解決策、時系列、比較、ランキング、ケーススタディなど）
  ② 導入部を変える（質問から始める、驚きの事実から、読者の悩みから、統計データからなど）
  ③ セクション順序を変える（結論ファーストか、ストーリー型か、問題提起型かなど）
  ④ FAQ質問を新鮮にする（毎回異なる視点・読者層を想定した質問にする）
- 検索キーワードが同じでも、見出しのワーディングや構成を変えて独自性を出すこと

記事構造テンプレート:
## はじめに {#introduction}
[500-800文字の詳細な導入文・概要・記事の価値提案]

## [具体的で魅力的な見出し1：記事のメインテーマに沿った内容] {#main-topic-1}
[1,200-1,500文字の詳細解説]
### [具体的なサブ見出し1-1：主要ポイント] {#subtopic-1-1}
[400-600文字の詳細内容]
### [具体的なサブ見出し1-2：補足情報] {#subtopic-1-2}
[400-600文字の詳細内容]

## [具体的で魅力的な見出し2：実践的な応用例] {#main-topic-2}
[1,200-1,500文字の詳細解説]
### [具体的なサブ見出し2-1：実装方法] {#subtopic-2-1}
[400-600文字の詳細内容]
### [具体的なサブ見出し2-2：ベストプラクティス] {#subtopic-2-2}
[400-600文字の詳細内容]

## [具体的で魅力的な見出し3：最新トレンドと事例] {#main-topic-3}
[1,200-1,500文字の詳細解説]
### [具体的なサブ見出し3-1：成功事例] {#subtopic-3-1}
[400-600文字の詳細内容]
### [具体的なサブ見出し3-2：業界動向] {#subtopic-3-2}
[400-600文字の詳細内容]

## [具体的で魅力的な見出し4：課題と解決アプローチ] {#main-topic-4}
[1,000-1,200文字の詳細解説]

## よくある質問 {#faq-section}

### Q: [具体的で実用的な質問1] {#faq-1}
A: [150-200文字の詳細な回答1]

### Q: [具体的で実用的な質問2] {#faq-2}
A: [150-200文字の詳細な回答2]

### Q: [具体的で実用的な質問3] {#faq-3}
A: [150-200文字の詳細な回答3]

### Q: [具体的で実用的な質問4] {#faq-4}
A: [150-200文字の詳細な回答4]

### Q: [具体的で実用的な質問5] {#faq-5}
A: [150-200文字の詳細な回答5]

### Q: [具体的で実用的な質問6] {#faq-6}
A: [150-200文字の詳細な回答6]

### Q: [具体的で実用的な質問7] {#faq-7}
A: [150-200文字の詳細な回答7]

### Q: [具体的で実用的な質問8] {#faq-8}
A: [150-200文字の詳細な回答8]

## まとめ {#conclusion}
[800-1,000文字の包括的な総括・次のアクション・実践的なアドバイス]

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

    // OpenAI GPT-5 miniで記事生成（本番環境タイムアウト対応）
    console.log('🤖 OpenAI GPT-5 miniで記事生成中...');
    let completion;
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries) {
      try {
        console.log(`🔄 OpenAI API呼び出し試行 ${retryCount + 1}/${maxRetries + 1}`);
        
        completion = await Promise.race([
          openai.chat.completions.create({
            model: "gpt-5-mini",
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

【超重要：見出しタイトル生成ルール】
絶対に禁止: 「メイントピック1」「サブトピック1-1」のような汎用的な見出し
必須: 記事内容に即した具体的で魅力的な見出し
- 例: 「Google AIの最新機能と活用方法」「実践的な導入ステップ」「成功事例と効果測定」
- 見出しはAI検索エンジンが引用しやすいように、内容を正確に表すこと
- 読者が見出しを見ただけで内容を理解できるようにすること

レスポンスはJSONのみで開始してください：`
              }
            ],
            max_completion_tokens: 8000,
            temperature: 1.0, // GPT-5 miniはデフォルト値(1.0)のみサポート
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

    // 🔗 Fragment ID内部リンク自動挿入（RAGベース動的生成）
    console.log('🔗 RAG検索結果からFragment内部リンク動的生成開始...');
    let enhancedContent = blogData.content || generatedContent;
    
    try {
      // RAG検索結果からFragment IDを持つアイテムを抽出
      const fragmentRAGResults = enhancedRAGData
        .filter(item => item.source === 'fragment') // Fragment Vector結果のみ
        .filter(item => item.metadata?.complete_uri || item.metadata?.fragment_id) // Complete URIを持つもの
        .sort((a, b) => (b.enhancedScore || 0) - (a.enhancedScore || 0)) // スコア順
        .slice(0, 6); // 上位6件
      
      console.log(`📊 RAG Fragment結果: ${fragmentRAGResults.length}件`);
      
      let relatedFragmentLinks = [];
      
      if (fragmentRAGResults.length > 0) {
        // RAG検索結果からFragment内部リンクを生成
        relatedFragmentLinks = fragmentRAGResults.map(item => {
          const completeUri = item.metadata?.complete_uri || `https://nands.tech${item.metadata?.page_path || ''}#${item.metadata?.fragment_id || ''}`;
          const title = item.metadata?.content_title || item.metadata?.title || '関連コンテンツ';
          const category = item.metadata?.category || 'info';
          
          // カテゴリに応じた表示形式
          let displayPrefix = '';
          if (item.metadata?.fragment_id?.startsWith('faq-')) {
            displayPrefix = 'よくある質問: ';
          } else if (item.metadata?.fragment_id?.startsWith('service-')) {
            displayPrefix = 'サービス詳細: ';
          } else if (category === 'section') {
            displayPrefix = '関連記事: ';
          } else {
            displayPrefix = '関連情報: ';
          }
          
          return `[${displayPrefix}${title}](${completeUri})`;
        });
        
        console.log('✅ RAG検索結果から動的内部リンク生成完了');
      } else {
        // フォールバック：固定リンク
        relatedFragmentLinks = [
          '[よくある質問: AI技術について](https://nands.tech/#faq-main-1)',
          '[サービス詳細: AIエージェント開発](https://nands.tech/#service-ai-agents)', 
          '[企業情報: NANDS について](https://nands.tech/about#hero)',
          '[FAQ: システム開発について](https://nands.tech/faq#faq-tech-1)',
          '[AI-Site: 24時間365日無人営業マン](https://nands.tech/ai-site#main-title-ai-site)'
        ];
        console.log('ℹ️ RAG Fragment結果が少ないため、固定リンクを使用');
      }
      
      // 記事末尾に関連リンクセクションを追加
      const relatedLinksSection = `

---

### 📚 関連情報

${relatedFragmentLinks.map((link, index) => `${index + 1}. ${link}`).join('\n')}

`;
      
      enhancedContent = enhancedContent + relatedLinksSection;
      console.log(`✅ Fragment内部リンク挿入完了（動的生成: ${relatedFragmentLinks.length}件）`);
      
    } catch (linkError) {
      console.warn('⚠️ Fragment内部リンク生成エラー（記事生成は継続）:', linkError);
    }

    // 保存データの準備
    const postData = {
      title: blogData.title || `${query}に関する記事`,
      content: enhancedContent, // Fragment内部リンク付きコンテンツ
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

    // 🖼️ サムネイル自動配置（上から順番）
    console.log('🖼️ サムネイル自動配置中...');
    try {
      const { data: availableThumbnail, error: thumbnailError } = await supabaseServiceRole
        .from('thumbnail_stock')
        .select('*')
        .eq('is_active', true)
        .order('usage_count', { ascending: true })
        .order('uploaded_at', { ascending: true })
        .limit(1)
        .single();

      if (thumbnailError || !availableThumbnail) {
        console.warn('⚠️ 利用可能なサムネイルが見つかりません');
      } else {
        // サムネイルの使用回数を更新
        const { error: incrementError } = await supabaseServiceRole
          .rpc('increment_thumbnail_usage', {
            thumbnail_id: availableThumbnail.id
          });

        if (incrementError) {
          console.error('❌ サムネイル使用回数更新エラー:', incrementError);
        } else {
          console.log(`✅ サムネイル選択完了: ${availableThumbnail.filename}`);
        }

        // 記事にサムネイルを設定
        const { error: updateThumbnailError } = await supabaseServiceRole
          .from('posts')
          .update({ thumbnail_url: availableThumbnail.url })
          .eq('id', savedPost.id);

        if (updateThumbnailError) {
          console.error('❌ サムネイル設定エラー:', updateThumbnailError);
        } else {
          console.log('✅ サムネイル設定完了');
        }
      }
    } catch (thumbnailErr) {
      console.error('❌ サムネイル処理エラー:', thumbnailErr);
    }

    // 📝 メタデータ自動生成・DB保存
    console.log('📝 メタデータ自動更新中...');
    try {
      const updateData: any = {};
      
      if (blogData.meta_description) {
        updateData.meta_description = blogData.meta_description;
        console.log('✅ メタディスクリプション設定');
      }
      
      if (blogData.seo_keywords && Array.isArray(blogData.seo_keywords)) {
        // SEOキーワードを最大3つに制限
        const limitedKeywords = blogData.seo_keywords.slice(0, 3);
        updateData.meta_keywords = limitedKeywords;
        console.log(`✅ SEOキーワード設定: ${limitedKeywords.join(', ')}`);
      }

      if (Object.keys(updateData).length > 0) {
        const { error: updateMetaError } = await supabaseServiceRole
          .from('posts')
          .update(updateData)
          .eq('id', savedPost.id);

        if (updateMetaError) {
          console.error('❌ メタデータ更新エラー:', updateMetaError);
        } else {
          console.log('✅ メタデータ更新完了');
        }
      }
    } catch (metaErr) {
      console.error('❌ メタデータ処理エラー:', metaErr);
    }

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

      // 🎯 NEW: 構造化データの自動抽出・ベクトル化（資産化）
      console.log('🔧 構造化データを抽出・ベクトル化中...');
      
      try {
        // Mike King理論準拠: 構造化データシステム初期化
        const autoTOCSystem = new AutoTOCSystem({
          generateFragmentIds: true,
          aiOptimization: true,
          minLevel: 2,
          maxLevel: 4
        });
        const howToFAQSystem = new HowToFAQSchemaSystem();
        const unifiedStructuredData = new UnifiedStructuredDataSystem('https://nands.tech');

        // 🎯 Fragment ID専用抽出・ベクトル化（Google ガイドライン準拠・AI引用対策）
        console.log('🔍 Fragment ID専用抽出開始...');
        console.log('📄 コンテンツサンプル:', blogData.content.substring(0, 200));
        
        // 🎯 H1タイトル + FAQ のFragment ID自動生成
        const fragmentIds: string[] = [];
        let faqEntities: any[] = []; // FAQ エンティティの事前宣言
        
        // 1. H1タイトルのFragment ID生成
        const h1FragmentId = `main-title-${blogData.title.toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 30)}`;
        fragmentIds.push(h1FragmentId);
        
        // 2. FAQセクションのFragment ID生成
        const faqSectionRegex = /## よくある質問[\s\S]*?(?=##|$)/i;
        const faqMatch = blogData.content.match(faqSectionRegex);
        
        if (faqMatch) {
          // FAQセクション全体
          fragmentIds.push('faq-section');
          
          // 個別FAQ項目（Fragment ID付きとなしの両方に対応）
          const faqItemWithIdRegex = /### Q: .+?\{#(faq-\d+)\}/g;
          const faqItemWithoutIdRegex = /### Q: (.+?)(?:\n|$)/g;
          let faqItemMatch;
          let faqIndex = 1;
          
          // Fragment ID付きFAQを検出
          while ((faqItemMatch = faqItemWithIdRegex.exec(faqMatch[0])) !== null) {
            const faqId = faqItemMatch[1]; // faq-1, faq-2 等
            if (!fragmentIds.includes(faqId)) {
              fragmentIds.push(faqId);
            }
          }
          
          // Fragment IDなしFAQがある場合は自動採番
          faqItemWithoutIdRegex.lastIndex = 0; // regex状態をリセット
          const faqsWithoutId = [];
          while ((faqItemMatch = faqItemWithoutIdRegex.exec(faqMatch[0])) !== null) {
            // Fragment IDがない質問のみ検出
            if (!faqItemMatch[0].includes('{#faq-')) {
              faqsWithoutId.push(faqItemMatch[1]);
            }
          }
          
          // IDなしFAQに自動でIDを割り当て
          faqsWithoutId.forEach(() => {
            const faqId = `faq-${faqIndex}`;
            if (!fragmentIds.includes(faqId)) {
              fragmentIds.push(faqId);
            }
            faqIndex++;
          });
          
          // 個別FAQエンティティからFragment IDを追加
          if (faqEntities && faqEntities.length > 0) {
            faqEntities.forEach((entity) => {
              const entityId = entity['@id'];
              const fragmentMatch = entityId.match(/#(faq-\d+)$/);
              if (fragmentMatch && !fragmentIds.includes(fragmentMatch[1])) {
                fragmentIds.push(fragmentMatch[1]);
              }
            });
          }
        }
        
        // 3. 既存の{#id}形式も抽出
        const existingFragmentRegex = /\{#([^}]+)\}/g;
        let existingMatch;
        
        while ((existingMatch = existingFragmentRegex.exec(blogData.content)) !== null) {
          if (!fragmentIds.includes(existingMatch[1])) {
            fragmentIds.push(existingMatch[1]);
          }
        }
        
        console.log(`📊 Fragment ID抽出結果:`);
        console.log(`  - Fragment IDs: ${fragmentIds.length}個`);
        
        // Fragment ID詳細をログ出力
        if (fragmentIds.length > 0) {
          console.log('🔍 抽出されたFragment IDs:');
          fragmentIds.forEach((id: string, i: number) => {
            console.log(`  Fragment ${i + 1}: #${id}`);
          });
        } else {
          console.log('⚠️ Fragment IDが抽出されませんでした');
        }
        
        const hasFragmentIds = fragmentIds.length > 0;

        // 🎯 FAQ個別エンティティ生成（既存システム統合）
        if (faqMatch) {
          console.log('🔧 FAQ個別エンティティ生成中...');
          
          // FAQ質問・回答ペアを抽出
          const faqItems: Array<{ question: string; answer: string; index: number }> = [];
          
          // Fragment ID付きFAQの抽出
          const faqQARegex = /### Q:\s*([^{]+?)(?:\s*\{#faq-(\d+)\})?\s*\n\s*A:\s*([^#]+?)(?=\n\s*###|\n\s*##|$)/g;
          let faqMatch_inner;
          let faqIndex = 1;
          
          while ((faqMatch_inner = faqQARegex.exec(faqMatch[0])) !== null) {
            const question = faqMatch_inner[1].trim();
            const answer = faqMatch_inner[3].trim();
            const extractedIndex = faqMatch_inner[2] ? parseInt(faqMatch_inner[2]) : faqIndex;
            
            faqItems.push({
              question,
              answer,
              index: extractedIndex
            });
            
            console.log(`  FAQ ${extractedIndex}: ${question.substring(0, 50)}...`);
            faqIndex++;
          }
          
          // エンティティ生成（既存システム活用）
          if (faqItems.length > 0) {
            faqEntities = generateBlogFAQEntities(
              {
                id: blogData.id,
                title: blogData.title,
                slug: blogData.slug,
                content: blogData.content
              },
              faqItems
            );
            
            console.log(`✅ FAQ エンティティ生成完了: ${faqEntities.length}個`);
            faqEntities.forEach((entity, i) => {
              console.log(`  Entity ${i + 1}: ${entity['@id']}`);
            });
          }
        }

        // 🎯 統合構造化データ生成（Mike King理論準拠・完全システム統合）
        console.log('🔧 統合構造化データ生成中...');
        let pageSchema: any = null; // AI最適化処理でも使用するためスコープを拡張
        try {
          pageSchema = unifiedStructuredData.generateWebPageSchemaWithHasPart({
            path: `/posts/${blogData.slug}`,
            title: blogData.title,
            description: blogData.excerpt || blogData.title,
            serviceType: 'BlogPost',
            fragmentIds: fragmentIds,
            lastModified: new Date().toISOString()
          });
          
          console.log('✅ 統合構造化データ生成完了');
          console.log(`  - WebPage Schema: ${pageSchema['@type']}`);
          console.log(`  - hasPart要素: ${pageSchema.hasPart?.length || 0}個`);
          console.log(`  - FAQエンティティ統合: ${faqEntities.length}個`);
          
          // 記事にメタデータとして構造化データを保存
          await supabaseServiceRole
            .from('posts')
            .update({
              metadata: {
                ...blogData.metadata,
                structuredData: pageSchema,
                faqEntities: faqEntities,
                fragmentIds: fragmentIds,
                generatedAt: new Date().toISOString()
              }
            })
            .eq('id', blogData.id);
            
          console.log('✅ 構造化データをメタデータとして保存完了');
        } catch (structuredDataError) {
          console.error('⚠️ 構造化データ生成エラー:', structuredDataError);
          // 構造化データエラーは記事生成の失敗とはしない
        }

        // 🚀 【NEW】AI検索最適化追加処理（既存システム完全保護）
        try {
          console.log('🔧 AI検索最適化処理開始...');
          
          // SEOキーワード抽出（既存データから安全に取得）
          const extractedKeywords = blogData.seo_keywords || 
            (typeof blogData.meta_keywords === 'string' ? [blogData.meta_keywords] : blogData.meta_keywords) ||
            ['AI', 'ブログ記事', 'テクノロジー'];
          
          const aiEnhancedData = await generateCompleteAIEnhancedUnifiedPageData(
            {
              pageSlug: `posts/${blogData.slug}`,
              pageTitle: blogData.title,
              keywords: extractedKeywords,
              category: 'generated-blog'
            },
            ['ChatGPT', 'Perplexity', 'Claude', 'Gemini'] // 4大AI検索エンジン対応
          );
          
          const aiEnhancedStructuredDataJSON = generateCompleteAIEnhancedStructuredDataJSON(aiEnhancedData);
          
          // 既存メタデータに追加（既存データは完全保護）
          const currentMetadata = blogData.metadata || {};
          await supabaseServiceRole
            .from('posts')
            .update({
              metadata: {
                ...currentMetadata,
                // 既存データ完全保持
                structuredData: pageSchema,
                faqEntities: faqEntities,
                fragmentIds: fragmentIds,
                generatedAt: new Date().toISOString(),
                // 新規AI強化データ追加
                aiEnhancedData: aiEnhancedData,
                aiEnhancedStructuredDataJSON: aiEnhancedStructuredDataJSON,
                aiSearchOptimizedAt: new Date().toISOString()
              }
            })
            .eq('id', blogData.id);
            
          console.log('✅ AI検索最適化統合完了');
          console.log(`  - 対象エンジン: ChatGPT, Perplexity, Claude, Gemini`);
          console.log(`  - Fragment ID数: ${fragmentIds.length}個`);
          console.log(`  - 最適化スコア: ${aiEnhancedData.aiSearchOptimization?.readinessScore || 'N/A'}`);
          
        } catch (aiOptimizationError) {
          console.warn('⚠️ AI検索最適化エラー（記事生成は正常継続）:', aiOptimizationError);
          // AI最適化エラーは記事生成の成功に影響しない
          // 既存システムは完全に保護される
        }

        // 🎯 Fragment ID専用テキスト生成（Google ガイドライン準拠・AI引用最適化）
        if (hasFragmentIds) {
          const fragmentIdText = `# ${blogData.title} - Fragment ID構造

## AI検索引用最適化Fragment ID一覧
記事URL: https://nands.tech/posts/${slug}

${fragmentIds.map((id: string, index: number) => {
            const fullURI = `https://nands.tech/posts/${slug}#${id}`;
            return `### セクション${index + 1} {#${id}}
- Fragment ID: ${id}
- 完全URI: ${fullURI}
- セクション位置: ${index + 1}/${fragmentIds.length}
- AI引用対応: 完全URI形式でセマンティック識別可能
- セクション重要度: ${index === 0 ? '最高' : index < 3 ? '高' : '中'}`;
          }).join('\n\n')}

## Fragment ID メタデータ
- 親記事ID: ${savedPost.id}
- 親記事タイトル: ${blogData.title}
- カテゴリ: ${categorySlug}
- 総Fragment数: ${fragmentIds.length}
- AI引用最適化: Mike King理論準拠
- URI形式: 完全URI（https://nands.tech/posts/${slug}#fragment）
- セマンティック構造: H1-H6階層対応
- 生成日時: ${new Date().toISOString()}
- RAGソース: ${ragData.map(item => item.source).join(', ')}

## AI検索エンジン対応
- ChatGPT引用対応: ✅ Fragment ID + 完全URI
- Perplexity引用対応: ✅ セクション別参照可能
- Claude引用対応: ✅ 精密セクション特定
- Google AI Overviews対応: ✅ Schema.org @id準拠
- 引用精度向上: Fragment IDによる正確なセクション参照`;

                  // 🎯 Fragment ID専用ベクトル化（AI引用対策・別計測）
          if (fragmentIdText.length > 100) { // 最小限のデータがある場合のみ
            const openaiEmbeddings = new OpenAIEmbeddings();
            const embeddingResponse = await openaiEmbeddings.createEmbedding(fragmentIdText, {});
            
            // OpenAI Embeddingレスポンスから配列を抽出
            const fragmentIdEmbedding = Array.isArray(embeddingResponse) 
              ? embeddingResponse 
              : embeddingResponse.embedding || embeddingResponse;
            
            const fragmentIdVectorData = {
              content_chunk: fragmentIdText,
              embedding: fragmentIdEmbedding,
              content_type: 'fragment-id' as const, // 🎯 Fragment ID専用content_type
              section_title: `${blogData.title} - Fragment ID構造`,
              page_slug: slug,
              fragment_id: `fragments_${savedPost.id}`,
              service_id: businessCategory,
              relevance_score: 0.95, // Fragment IDは最高関連性（AI引用対策）
              metadata: {
                post_id: savedPost.id,
                original_url: `/posts/${slug}`,
                word_count: fragmentIdText.split(/\s+/).length,
                created_at: new Date().toISOString(),
                source_type: 'generated_blog_fragment_ids',
                fragment_count: fragmentIds.length,
                ai_citation_optimized: true,
                mike_king_theory_compliant: true,
                uri_format: 'complete_uri',
                semantic_structure: 'h1_h6_hierarchy',
                category: categorySlug,
                business_category: businessCategory,
                parent_article_title: blogData.title,
                parent_vector_id: vectorData?.id,
                // 🎯 AI検索エンジン対応メタデータ
                chatgpt_citation_ready: true,
                perplexity_section_ready: true,
                claude_precision_ready: true,
                google_ai_overviews_ready: true,
                fragment_uris: fragmentIds.map((id: string) => `https://nands.tech/posts/${slug}#${id}`)
              },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            const { error: fragmentIdVectorError } = await supabaseServiceRole
              .from('company_vectors')
              .insert([fragmentIdVectorData]);

            if (fragmentIdVectorError) {
              console.error('❌ Fragment IDベクトル保存エラー:', fragmentIdVectorError);
              // エラーでも続行（メイン機能を止めない）
            } else {
              console.log('✅ Fragment IDベクトル化完了');
              console.log(`  🎯 記事「${blogData.title}」のFragment IDが資産化されました`);
              console.log(`  📊 Fragment ID詳細:`);
              console.log(`    - Fragment IDs: ${fragmentIds.length}個`);
              console.log(`    - AI引用対応URI: ${fragmentIds.length}個生成`);
              console.log(`    - Mike King理論準拠: ✅`);
              console.log(`    - content_type: fragment-id（別計測対応）`);
            }
          } else {
            console.log('⚠️ Fragment IDが不十分のため、ベクトル化をスキップ');
          }
        } else {
          console.log('⚠️ Fragment IDが抽出されなかったため、ベクトル化をスキップ');
        }

        // 🆕 【NEW】Fragment ID専用テーブルへの自動ベクトル化
        try {
          console.log('🚀 Fragment ID専用テーブル自動ベクトル化開始...');
          
          const fragmentVectorizer = new FragmentVectorizer();
          const fragmentResult = await fragmentVectorizer.extractAndVectorizeFromMarkdown(
            blogData.content,
            {
              post_id: savedPost.id,
              post_title: blogData.title,
              slug: slug,
              page_path: `/posts/${slug}`,
              category: categorySlug,
              seo_keywords: blogData.seo_keywords,
              rag_sources: ragData.map(item => item.source)
            }
          );

          if (fragmentResult.success) {
            console.log('✅ Fragment ID専用テーブルベクトル化完了');
            console.log(`  📊 抽出Fragment数: ${fragmentResult.extractedFragments.length}個`);
            console.log(`  📊 ベクトル化成功: ${fragmentResult.vectorizedCount}個`);
            console.log(`  🎯 Fragment ID詳細:`);
            fragmentResult.extractedFragments.forEach((fragment, index) => {
              console.log(`    ${index + 1}. ${fragment.fragment_id} (${fragment.content_type})`);
            });
          } else {
            console.warn('⚠️ Fragment ID専用テーブルベクトル化でエラーが発生しました');
            fragmentResult.errors.forEach(error => {
              console.warn(`  - ${error}`);
            });
          }

        } catch (fragmentVectorizerError) {
          console.error('❌ Fragment ID専用ベクトル化エラー:', fragmentVectorizerError);
          // Fragment ID専用ベクトル化のエラーは既存システムに影響しない
        }

      } catch (error) {
        console.error('❌ 構造化データ処理エラー（詳細）:', error);
        console.error('❌ エラーメッセージ:', error instanceof Error ? error.message : 'Unknown error');
        console.error('❌ エラースタック:', error instanceof Error ? error.stack : 'No stack trace');
        
        // より具体的なエラー情報をレスポンスに含める
        console.log('⚠️ 構造化データ処理で問題が発生しましたが、記事生成は継続されます');
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

    // 🗑️ 使い捨てトレンドRAGデータの自動削除
    try {
      // 使用済みトレンドRAG削除
      const usedTrendIds = ragData
        .filter(item => item.source === 'trend' && item.id)
        .map(item => item.id);
      
      // 使用済みYouTube RAG削除
      const usedYouTubeIds = ragData
        .filter(item => item.source === 'youtube' && item.id)
        .map(item => item.id);
      
      if (usedTrendIds.length > 0) {
        console.log(`🗑️ 使用済みトレンドRAGデータ削除開始: ${usedTrendIds.length}件`);
        
        const { data: deletedTrends, error: deleteTrendsError } = await supabaseServiceRole
          .from('trend_vectors')
          .delete()
          .in('id', usedTrendIds)
          .select('id, trend_topic');
        
        if (deleteTrendsError) {
          console.error('❌ トレンドデータ削除エラー:', deleteTrendsError);
        } else {
          console.log(`✅ 使用済みトレンドデータ削除完了: ${deletedTrends?.length || 0}件`);
          deletedTrends?.forEach((trend, index) => {
            console.log(`  ${index + 1}. 削除: ${trend.trend_topic} (ID: ${trend.id})`);
          });
          console.log('  💡 理由: トレンドRAGは使い捨て型（24時間以内の情報のみ有効）');
          console.log('  💡 古いトレンド情報は誤情報となるため、使用後は即座に削除');
        }
        
      } else {
        console.log('ℹ️  トレンドRAGデータは使用されませんでした');
      }

      // 🎬 YouTube RAG削除（使い捨て型）
      if (usedYouTubeIds.length > 0) {
        console.log(`🗑️ 使用済みYouTube RAGデータ削除開始: ${usedYouTubeIds.length}件`);
        
        const { data: deletedYouTubes, error: deleteYouTubeError } = await supabaseServiceRole
          .from('youtube_vectors')
          .delete()
          .in('id', usedYouTubeIds)
          .select('id, video_title');
        
        if (deleteYouTubeError) {
          console.error('❌ YouTube RAGデータ削除エラー:', deleteYouTubeError);
        } else {
          console.log(`✅ 使用済みYouTube RAGデータ削除完了: ${deletedYouTubes?.length || 0}件`);
          deletedYouTubes?.forEach((video, index) => {
            console.log(`  ${index + 1}. 削除: ${video.video_title} (ID: ${video.id})`);
          });
          console.log('  💡 理由: YouTube RAGは使い捨て型（他人の動画は参考資料として1回のみ使用）');
          console.log('  💡 記事化された時点で知識は自社資産となり、元動画は不要');
          console.log('  💡 著作権リスク軽減・ストレージ最適化・データ鮮度向上');
        }
      } else {
        console.log('ℹ️  YouTube RAGデータは使用されませんでした');
      }

      // 使用済みRAG履歴をメタデータに一括記録
      if (usedTrendIds.length > 0 || usedYouTubeIds.length > 0) {
        const updatedMetadata: any = { ...savedPost.metadata };
        
        if (usedTrendIds.length > 0) {
          updatedMetadata.usedTrendIds = usedTrendIds;
          updatedMetadata.trendDataDeletedAt = new Date().toISOString();
        }
        
        if (usedYouTubeIds.length > 0) {
          updatedMetadata.usedYouTubeIds = usedYouTubeIds;
          updatedMetadata.youtubeDataDeletedAt = new Date().toISOString();
        }
        
        await supabaseServiceRole
          .from('posts')
          .update({ metadata: updatedMetadata })
          .eq('id', savedPost.id);
          
        console.log('📝 使用済みRAG履歴を記事メタデータに記録完了');
      }

    } catch (deleteError) {
      console.error('❌ RAGデータ削除処理エラー:', deleteError);
      console.warn('⚠️  記事生成は成功しましたが、RAGデータ削除に失敗しました');
      // エラーでも記事生成は成功として扱う
    }

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