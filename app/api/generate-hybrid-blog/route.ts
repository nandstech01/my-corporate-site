import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { OpenAIEmbeddings } from '@/lib/vector/openai-embeddings';
import { FragmentVectorizer } from '@/lib/vector/fragment-vectorizer';
import { HybridSearchSystem } from '@/lib/vector/hybrid-search';
import { AutoTOCSystem } from '@/lib/structured-data/auto-toc-system';
import { HowToFAQSchemaSystem } from '@/lib/structured-data/howto-faq-schema';
import { UnifiedStructuredDataSystem } from '@/lib/structured-data/index';
import { generateBlogFAQEntities, generateBlogSectionEntities } from '@/lib/structured-data/entity-relationships';

// 🖼️ H2図解自動生成（Nano Banana Pro）
import { generateH2DiagramsAuto, isH2DiagramGenerationEnabled } from '@/lib/ai-image/h2-diagram-auto-generator';

// 🚀 AI検索最適化システム
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

// Next.js 14のAPI Routes用のタイムアウト設定（本番環境対応）
export const maxDuration = 300; // 5分
export const dynamic = 'force-dynamic';

/**
 * ハイブリッド記事生成API
 * 
 * 機能:
 * 1. スクレイピングキーワード（2クエリ）
 * 2. ディープリサーチ（2クエリ）
 * 3. 既存RAG（company, trend, personal_story, kenji_thought）
 * 4. 新RAG（hybrid_scraped_keywords, hybrid_deep_research）
 * 5. GPT-5 miniで30,000文字級記事生成
 * 6. 後処理：Fragment ID、構造化データ、ベクトル化（既存システム100%再利用）
 */

interface HybridBlogRequest {
  // 基本設定
  topic: string;                    // 記事のメイントピック（例: "AIリスキリング"）
  targetKeyword: string;           // ターゲットキーワード（例: "AIリスキリング おすすめ"）
  categorySlug: string;            // カテゴリスラッグ
  businessCategory: string;        // ビジネスカテゴリ

  // スクレイピングクエリ（2つ）
  scrapeQuery1: string;           // スクレイピングクエリ1（例: "AIリスキリング おすすめ"）
  scrapeQuery2: string;           // スクレイピングクエリ2（例: "ホームページ制作"）

  // ディープリサーチクエリ（2つ）
  researchQuery1: string;         // ディープリサーチクエリ1（例: "AIO最新動向"）
  researchQuery2: string;         // ディープリサーチクエリ2（例: "海外AI活用事例"）

  // オプション
  targetLength?: number;          // 目標文字数（デフォルト: 30000）
  enableH2Diagrams?: boolean;     // H2図解生成（デフォルト: true）
  maxH2Diagrams?: number;         // 最大図解数（デフォルト: 5）
  includePersonalRag?: boolean;   // パーソナルRAG使用（デフォルト: true）
  runScraping?: boolean;          // スクレイピング実行（デフォルト: true）
  runDeepResearch?: boolean;      // ディープリサーチ実行（デフォルト: true）
  
  // 地域キーワード（オプション）
  regionKeywords?: string[];      // 例: ["滋賀県 大津", "東京 関東圏"]

  // 🔄 モデル選択（コスト節約用）
  researchModel?: 'deepseek' | 'gemini';    // リサーチ用モデル（デフォルト: 'deepseek'）
  generationModel?: 'deepseek' | 'gemini';  // 記事生成用モデル（デフォルト: 'deepseek'）

  // 🔬 ディープリサーチタイプ
  researchType1?: 'trend' | 'comparison' | 'technical' | 'market';  // リサーチ1のタイプ
  researchType2?: 'trend' | 'comparison' | 'technical' | 'market';  // リサーチ2のタイプ
}

// 🔄 DeepSeek APIクライアント（OpenAI互換）
const deepseekClient = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: 'https://api.deepseek.com',
});

// 🔄 Gemini 3 Pro APIクライアント
import { GoogleGenerativeAI } from '@google/generative-ai';
const geminiClient = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
const geminiModel = geminiClient.getGenerativeModel({ model: 'gemini-3-pro-preview' });

export async function POST(request: NextRequest) {
  try {
    const {
      topic,
      targetKeyword,
      categorySlug,
      businessCategory,
      scrapeQuery1,
      scrapeQuery2,
      researchQuery1,
      researchQuery2,
      targetLength = 30000,
      enableH2Diagrams = false, // デフォルトOFF（料金節約、編集ページで生成可能）
      maxH2Diagrams = 5,
      includePersonalRag = true,
      runScraping = true,
      runDeepResearch = true,
      regionKeywords = [],
      // 🔄 モデル選択（デフォルト: DeepSeek = 低コスト）
      researchModel = 'deepseek',
      generationModel = 'deepseek',
      // 🔬 ディープリサーチタイプ
      researchType1 = 'trend',
      researchType2 = 'comparison'
    }: HybridBlogRequest = await request.json();

    console.log('\n🚀 ========================================');
    console.log('📝 ハイブリッド記事生成開始');
    console.log('🚀 ========================================\n');
    console.log(`📌 トピック: ${topic}`);
    console.log(`🎯 ターゲットキーワード: ${targetKeyword}`);
    console.log(`📂 カテゴリ: ${categorySlug}`);
    console.log(`📊 目標文字数: ${targetLength}文字`);
    console.log(`🔄 リサーチモデル: ${researchModel === 'deepseek' ? 'DeepSeek V3.2 💰' : 'Gemini 3 Pro ⭐'}`);
    console.log(`🔄 生成モデル: ${generationModel === 'deepseek' ? 'DeepSeek V3.2 💰' : 'Gemini 3 Pro ⭐'}`);
    
    // 🔄 モデルに応じてクライアントを選択（Geminiは別処理）
    const useGemini = generationModel === 'gemini';
    const generationClient = generationModel === 'deepseek' ? deepseekClient : openai;
    const generationModelName = generationModel === 'deepseek' ? 'deepseek-chat' : 'gpt-4o-mini';

    // ============================================
    // ステップ1: スクレイピング実行（2クエリ）
    // ============================================
    let scrapedKeywords1: { h1?: string[], h2?: string[], h3?: string[], body?: string[] } = {};
    let scrapedKeywords2: { h1?: string[], h2?: string[], h3?: string[], body?: string[] } = {};

    if (runScraping) {
      console.log('\n📡 ステップ1: スクレイピング実行');
      console.log('─'.repeat(50));

      try {
        // 🚀 スクレイピングAPI呼び出し（クエリ1）- RAG保存OFF・タイムアウト60秒
        console.log(`  🔍 クエリ1: "${scrapeQuery1}"`);
        const controller1 = new AbortController();
        const timeout1 = setTimeout(() => controller1.abort(), 60000); // 60秒タイムアウト
        
        try {
          const scrapeResponse1 = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/scrape-keywords`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              searchQuery: scrapeQuery1,
              maxSites: 5, // 5サイトに削減（速度優先）
              saveToRag: false // RAG保存OFF（速度優先）
            }),
            signal: controller1.signal
          });
          clearTimeout(timeout1);
          
          if (scrapeResponse1.ok) {
            const result1 = await scrapeResponse1.json();
            scrapedKeywords1 = result1.keywords || {};
            console.log(`  ✅ クエリ1完了: ${result1.totalKeywords}キーワード`);
            // 🔍 キーワード詳細ログ
            console.log(`  📋 H1キーワード: ${(result1.keywords?.h1 || []).slice(0, 10).join(', ')}`);
            console.log(`  📋 H2キーワード: ${(result1.keywords?.h2 || []).slice(0, 15).join(', ')}`);
            console.log(`  📋 H3キーワード: ${(result1.keywords?.h3 || []).slice(0, 10).join(', ')}`);
            console.log(`  📋 本文キーワード: ${(result1.keywords?.body || []).slice(0, 20).join(', ')}`);
          } else {
            console.warn(`  ⚠️ クエリ1スクレイピングエラー`);
          }
        } catch (e) {
          clearTimeout(timeout1);
          console.warn(`  ⚠️ クエリ1タイムアウトまたはエラー`);
        }

        // 🚀 スクレイピングAPI呼び出し（クエリ2）- RAG保存OFF・タイムアウト60秒
        console.log(`  🔍 クエリ2: "${scrapeQuery2}"`);
        const controller2 = new AbortController();
        const timeout2 = setTimeout(() => controller2.abort(), 60000);
        
        try {
          const scrapeResponse2 = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/scrape-keywords`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              searchQuery: scrapeQuery2,
              maxSites: 5,
              saveToRag: false
            }),
            signal: controller2.signal
          });
          clearTimeout(timeout2);

          if (scrapeResponse2.ok) {
            const result2 = await scrapeResponse2.json();
            scrapedKeywords2 = result2.keywords || {};
            console.log(`  ✅ クエリ2完了: ${result2.totalKeywords}キーワード`);
            // 🔍 キーワード詳細ログ
            console.log(`  📋 H1キーワード: ${(result2.keywords?.h1 || []).slice(0, 10).join(', ')}`);
            console.log(`  📋 H2キーワード: ${(result2.keywords?.h2 || []).slice(0, 15).join(', ')}`);
          } else {
            console.warn(`  ⚠️ クエリ2スクレイピングエラー`);
          }
        } catch (e) {
          clearTimeout(timeout2);
          console.warn(`  ⚠️ クエリ2タイムアウトまたはエラー`);
        }
      } catch (scrapeError) {
        console.error('  ❌ スクレイピングエラー:', scrapeError);
      }
    }

    // ============================================
    // ステップ2: ディープリサーチ実行（2クエリ）
    // ============================================
    let researchResults1: any = null;
    let researchResults2: any = null;

    if (runDeepResearch) {
      console.log('\n🔬 ステップ2: ディープリサーチ実行');
      console.log('─'.repeat(50));
      console.log(`  📋 リサーチ1タイプ: ${researchType1} | リサーチ2タイプ: ${researchType2}`);

      try {
        // ディープリサーチAPI呼び出し（クエリ1）- 10分タイムアウト
        console.log(`  🔍 リサーチ1: "${researchQuery1}" (${researchType1})`);
        const researchController1 = new AbortController();
        const researchTimeout1 = setTimeout(() => researchController1.abort(), 600000); // 10分タイムアウト
        
        try {
          const researchResponse1 = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/deep-research`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              topic: researchQuery1,
              researchType: researchType1,
              depth: 2, // 速度とクオリティのバランス
              breadth: 3,
              saveToRag: true
            }),
            signal: researchController1.signal
          });
          clearTimeout(researchTimeout1);

          if (researchResponse1.ok) {
            researchResults1 = await researchResponse1.json();
            console.log(`  ✅ リサーチ1完了: ${researchResults1.totalLearnings || researchResults1.totalResults}件の知識`);
          } else {
            console.warn(`  ⚠️ リサーチ1エラー: ${researchResponse1.status}`);
          }
        } catch (e) {
          clearTimeout(researchTimeout1);
          if ((e as Error).name === 'AbortError') {
            console.warn(`  ⚠️ リサーチ1タイムアウト（10分）`);
          } else {
            console.warn(`  ⚠️ リサーチ1エラー:`, (e as Error).message);
          }
        }

        // ディープリサーチAPI呼び出し（クエリ2）- 10分タイムアウト
        console.log(`  🔍 リサーチ2: "${researchQuery2}" (${researchType2})`);
        const researchController2 = new AbortController();
        const researchTimeout2 = setTimeout(() => researchController2.abort(), 600000); // 10分タイムアウト
        
        try {
          const researchResponse2 = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/deep-research`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              topic: researchQuery2,
              researchType: researchType2,
              depth: 2, // 速度とクオリティのバランス
              breadth: 3,
              saveToRag: true
            }),
            signal: researchController2.signal
          });
          clearTimeout(researchTimeout2);

          if (researchResponse2.ok) {
            researchResults2 = await researchResponse2.json();
            console.log(`  ✅ リサーチ2完了: ${researchResults2.totalLearnings || researchResults2.totalResults}件の知識`);
          } else {
            console.warn(`  ⚠️ リサーチ2エラー: ${researchResponse2.status}`);
          }
        } catch (e) {
          clearTimeout(researchTimeout2);
          if ((e as Error).name === 'AbortError') {
            console.warn(`  ⚠️ リサーチ2タイムアウト（10分）`);
          } else {
            console.warn(`  ⚠️ リサーチ2エラー:`, (e as Error).message);
          }
        }
      } catch (researchError) {
        console.error('  ❌ ディープリサーチエラー:', researchError);
      }
    }

    // ============================================
    // ステップ3: 既存RAGデータ取得（エンティティベース・ハイブリッド検索）
    // ============================================
    console.log('\n📚 ステップ3: 既存RAGデータ取得（ハイブリッド検索）');
    console.log('─'.repeat(50));

    const embeddings = new OpenAIEmbeddings();
    const hybridSearch = new HybridSearchSystem();
    const searchQuery = `${topic} ${targetKeyword}`;

    // 3-1: Company Vectors（自社情報）- ハイブリッド検索（BM25 + ベクトル + RRF）
    console.log('  📂 自社情報RAG検索中（ハイブリッド検索）...');
    let companyVectors: any[] = [];
    try {
      const companyResults = await hybridSearch.search({
        query: searchQuery,
        source: 'company',
        limit: 15,
        threshold: 0.3,
        bm25Weight: 0.4,
        vectorWeight: 0.6
      });
      companyVectors = companyResults.map(r => ({
        content_chunk: r.content,
        section_title: r.metadata?.section_title || '',
        content_type: r.contentType,
        combined_score: r.combinedScore
      }));
      console.log(`  ✅ 自社情報: ${companyVectors.length}件（ハイブリッド検索）`);
    } catch (companyError: any) {
      console.warn('  ⚠️ 自社情報RAGエラー:', companyError.message);
      // フォールバック: 単純なSELECT
      const { data: fallbackCompany } = await supabaseServiceRole
        .from('company_vectors')
        .select('*')
        .in('content_type', ['corporate', 'service', 'structured-data'])
        .limit(15);
      companyVectors = fallbackCompany || [];
      console.log(`  ✅ 自社情報: ${companyVectors.length}件（フォールバック）`);
    }

    // 3-2: Personal Story RAG（パーソナルストーリー）
    let personalStoryData: any[] = [];
    if (includePersonalRag) {
      console.log('  📂 パーソナルストーリーRAG検索中...');
      const { data: personalStory, error: personalStoryError } = await supabaseServiceRole
        .from('personal_story_rag')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (personalStoryError) {
        console.warn('  ⚠️ パーソナルストーリーRAGエラー:', personalStoryError.message);
      }
      personalStoryData = personalStory || [];
      console.log(`  ✅ パーソナルストーリー: ${personalStoryData.length}件`);
    }

    // 3-3: Kenji Thought RAG（AIアーキテクト思想）- ハイブリッド検索（3072次元）
    let kenjiThoughtData: any[] = [];
    if (includePersonalRag) {
      console.log('  📂 AIアーキテクト思想RAG検索中（ハイブリッド検索）...');
      try {
        const kenjiResults = await hybridSearch.search({
          query: searchQuery,
          source: 'kenji',
          limit: 10,
          threshold: 0.3
        });
        kenjiThoughtData = kenjiResults.map(r => ({
          thought_title: r.metadata?.thought_title || '',
          thought_content: r.content,
          usage_context: r.metadata?.usage_context || '',
          combined_score: r.combinedScore
        }));
        console.log(`  ✅ AIアーキテクト思想: ${kenjiThoughtData.length}件（ハイブリッド検索）`);
      } catch (kenjiError: any) {
        console.warn('  ⚠️ AIアーキテクト思想RAGエラー:', kenjiError.message);
        // フォールバック: 単純なSELECT
        const { data: fallbackKenji } = await supabaseServiceRole
          .from('kenji_harada_architect_knowledge')
          .select('*')
          .eq('is_active', true)
          .order('priority', { ascending: false })
          .limit(10);
        kenjiThoughtData = fallbackKenji || [];
        console.log(`  ✅ AIアーキテクト思想: ${kenjiThoughtData.length}件（フォールバック）`);
      }
    }

    // 3-4: スクレイピングキーワードを直接使用（DBから再検索しない）
    // ※ scrapedKeywords1, scrapedKeywords2 はステップ1で既に取得済み
    const h1Keywords = [...(scrapedKeywords1.h1 || []), ...(scrapedKeywords2.h1 || [])];
    const h2Keywords = [...(scrapedKeywords1.h2 || []), ...(scrapedKeywords2.h2 || [])];
    const h3Keywords = [...(scrapedKeywords1.h3 || []), ...(scrapedKeywords2.h3 || [])];
    const bodyKeywords = [...(scrapedKeywords1.body || []), ...(scrapedKeywords2.body || [])];
    const totalScrapedCount = h1Keywords.length + h2Keywords.length + h3Keywords.length + bodyKeywords.length;
    console.log(`  ✅ スクレイピングキーワード: ${totalScrapedCount}件（直接使用）`);
    const scrapedRagData = null; // 未使用（直接キーワードを使用）

    // 3-5: ディープリサーチ結果を直接使用（DBから再検索しない）
    // ※ researchResults1, researchResults2 はステップ2で既に取得済み
    const researchRagData = [
      ...(researchResults1?.results || []).slice(0, 10),
      ...(researchResults2?.results || []).slice(0, 10)
    ];
    console.log(`  ✅ ディープリサーチ結果: ${researchRagData.length}件（直接使用）`);

    // ============================================
    // ステップ4: RAGデータを統合してプロンプト生成
    // ============================================
    console.log('\n📝 ステップ4: プロンプト生成');
    console.log('─'.repeat(50));

    // RAGサマリー生成
    const ragSummary = buildRagSummary({
      companyVectors,
      personalStoryData,
      kenjiThoughtData,
      scrapedRagData,
      researchRagData,
      scrapedKeywords1,
      scrapedKeywords2,
      researchResults1,
      researchResults2
    });

    // システムプロンプト（ユーザー提供の20,000-40,000文字生成用プロンプトをベース）
    const systemPrompt = buildHybridSystemPrompt(topic, targetKeyword, categorySlug, targetLength);

    // ============================================
    // ステップ5: GPT-5 miniで記事生成
    // ============================================
    console.log('\n🤖 ステップ5: GPT-5 miniで記事生成');
    console.log('─'.repeat(50));

    const prompt = `${systemPrompt}

## 📚 RAG参考データ
${ragSummary}

## 🎯 スクレイピングキーワード（網羅的に活用）
### クエリ1: "${scrapeQuery1}"
${formatScrapedKeywords(scrapedKeywords1)}

### クエリ2: "${scrapeQuery2}"
${formatScrapedKeywords(scrapedKeywords2)}

${regionKeywords.length > 0 ? `
## 🗺️ 地域キーワード（ロングテール対策）
${regionKeywords.map(r => `- ${r}`).join('\n')}
` : ''}

## 📊 ディープリサーチ結果
### リサーチ1: "${researchQuery1}"
${formatResearchResults(researchResults1)}

### リサーチ2: "${researchQuery2}"
${formatResearchResults(researchResults2)}

---

---

🚨🚨🚨【絶対条件】文字数要件（これを満たさない記事は不合格）🚨🚨🚨

📏 **目標文字数: ${targetLength}文字**（最低でも${Math.floor(targetLength * 0.8)}文字以上）

### 記事構成の必須要件:
1. **H2セクション数**: 最低20個以上
2. **各H2セクションの文字数**: 最低2000文字以上
3. **FAQセクション**: 15問以上（各回答300文字以上）
4. **比較表**: 最低3つ以上
5. **チェックリスト**: 最低2つ以上
6. **具体的な事例**: 最低5つ以上

### キーワード網羅の必須要件:
- スクレイピングで取得した**H1キーワード**: 全て見出しに使用
- スクレイピングで取得した**H2キーワード**: 全て見出しに使用
- スクレイピングで取得した**H3キーワード**: 全てサブ見出しに使用
- スクレイピングで取得した**本文キーワード**: 全て本文に散りばめる

### 文字数が足りない場合の追加コンテンツ:
- 詳細な導入事例（企業名・数字を含む）
- ステップバイステップの手順解説
- メリット・デメリット比較表
- 料金・費用相場の詳細
- よくある失敗例と対策
- 専門家の意見・アドバイス
- 将来の展望・トレンド予測`;

    console.log(`  📝 プロンプト文字数: ${prompt.length}文字`);

    let generatedContent: string | null = null;

    // 🔄 Gemini 3 Pro で記事生成
    if (useGemini) {
      console.log(`\n  🤖 Gemini 3 Pro ⭐ で記事生成開始...`);
      let retryCount = 0;
      const maxRetries = 1;
      const timeoutMs = 180000; // 180秒

      while (retryCount <= maxRetries) {
        try {
          console.log(`  🔄 API呼び出し試行 ${retryCount + 1}/${maxRetries + 1} (Gemini 3 Pro)`);

          const geminiResult = await Promise.race([
            geminiModel.generateContent({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: {
                maxOutputTokens: 60000, // 約120,000文字（40,000文字目標に十分）
                temperature: 0.7, // 少し下げて一貫性向上
              }
            }),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error(`Gemini 3 Pro API timeout after ${timeoutMs / 1000} seconds`)), timeoutMs)
            )
          ]) as any;

          generatedContent = geminiResult.response?.text() || null;
          if (generatedContent) {
            console.log(`  ✅ Gemini 3 Pro API呼び出し成功`);
            break;
          }
        } catch (error) {
          retryCount++;
          console.error(`  ❌ Gemini 3 Pro API呼び出しエラー (試行 ${retryCount}):`, error);

          // Gemini失敗時はGPT-5 miniにフォールバック
          if (retryCount > maxRetries) {
            console.log('  🔄 Gemini 3 Pro失敗、GPT-5 miniにフォールバック...');
            try {
              const fallbackCompletion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 16000,
                temperature: 0.8,
              });
              generatedContent = fallbackCompletion.choices[0]?.message?.content || null;
              if (generatedContent) {
                console.log(`  ✅ GPT-5 mini (フォールバック) API呼び出し成功`);
              }
            } catch (fallbackError) {
              console.error('  ❌ フォールバックも失敗:', fallbackError);
              throw new Error('Gemini 3 ProとGPT-5 miniの両方が失敗しました');
            }
            break;
          }

          const waitTime = Math.pow(2, retryCount) * 1000;
          console.log(`  ⏳ ${waitTime / 1000}秒後にリトライ...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    } else {
      // 🔄 DeepSeek / GPT-5 mini で記事生成（フォールバック機能付き）
      let modelLabel = generationModel === 'deepseek' ? 'DeepSeek V3.2' : 'GPT-5 mini';
      let currentClient = generationClient;
      let currentModelName = generationModelName;
      console.log(`\n  🤖 ${modelLabel}で記事生成開始...`);
      
      let completion;
      let retryCount = 0;
      const maxRetries = 1;
      const timeoutMs = generationModel === 'deepseek' ? 120000 : 180000;

      while (retryCount <= maxRetries) {
        try {
          console.log(`  🔄 API呼び出し試行 ${retryCount + 1}/${maxRetries + 1} (${modelLabel})`);

          completion = await Promise.race([
            currentClient.chat.completions.create({
              model: currentModelName,
              messages: [{ role: "user", content: prompt }],
              max_tokens: generationModel === 'deepseek' ? 8000 : 16000,
              temperature: 0.8,
            }),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error(`${modelLabel} API timeout after ${timeoutMs / 1000} seconds`)), timeoutMs)
            )
          ]);

          console.log(`  ✅ ${modelLabel} API呼び出し成功`);
          generatedContent = (completion as any)?.choices[0]?.message?.content;
          break;

        } catch (error) {
          retryCount++;
          console.error(`  ❌ ${modelLabel} API呼び出しエラー (試行 ${retryCount}):`, error);

          // DeepSeek失敗時はGPT-5 miniにフォールバック
          if (retryCount > maxRetries && generationModel === 'deepseek') {
            console.log('  🔄 DeepSeek失敗、GPT-5 miniにフォールバック...');
            modelLabel = 'GPT-5 mini (フォールバック)';
            currentClient = openai;
            currentModelName = 'gpt-4o-mini';
            retryCount = 0;
            continue;
          }

          if (retryCount > maxRetries) {
            throw new Error(`${modelLabel} API呼び出しが${maxRetries + 1}回失敗しました`);
          }

          const waitTime = Math.pow(2, retryCount) * 1000;
          console.log(`  ⏳ ${waitTime / 1000}秒後にリトライ...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    if (!generatedContent) {
      throw new Error('記事生成に失敗しました');
    }

    // JSONパース
    const blogData = parseGeneratedContent(generatedContent);
    console.log(`  ✅ 記事生成完了: ${blogData.title}`);
    console.log(`  📊 文字数: ${blogData.content?.length || 0}文字`);

    // ============================================
    // ステップ6: 記事保存（既存システム再利用）
    // ============================================
    console.log('\n💾 ステップ6: 記事保存');
    console.log('─'.repeat(50));

    // カテゴリID取得
    const { data: categoryData, error: categoryError } = await supabaseServiceRole
      .from('categories')
      .select('id, business_id')
      .eq('slug', categorySlug)
      .single();

    if (categoryError || !categoryData) {
      throw new Error(`カテゴリが見つかりません: ${categorySlug}`);
    }

    // スラッグ生成
    const baseSlug = (blogData.title || `${topic}-blog`)
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    const timestamp = Date.now().toString().slice(-6);
    const slug = `ai-${baseSlug}-${timestamp}`;

    // 記事保存
    const { data: savedPost, error: saveError } = await supabaseServiceRole
      .from('posts')
      .insert([{
        title: blogData.title,
        content: blogData.content,
        slug: slug,
        business_id: categoryData.business_id,
        category_id: categoryData.id,
        status: 'draft',
        meta_description: blogData.meta_description,
        meta_keywords: blogData.seo_keywords?.slice(0, 3)
      }])
      .select()
      .single();

    if (saveError) {
      console.error('❌ 記事保存エラー:', saveError);
      throw new Error(`記事の保存に失敗しました: ${saveError.message}`);
    }

    console.log(`  ✅ 記事保存完了: ID ${savedPost.id}`);

    // ============================================
    // ステップ7: 後処理（既存システム100%再利用）
    // ============================================
    console.log('\n🔧 ステップ7: 後処理実行');
    console.log('─'.repeat(50));

    let enhancedContent = blogData.content;

    // 7-1: H2図解自動生成
    if (enableH2Diagrams && isH2DiagramGenerationEnabled()) {
      console.log('  🖼️ H2図解自動生成中...');
      try {
        const diagramResult = await generateH2DiagramsAuto(enhancedContent, {
          maxDiagrams: maxH2Diagrams,
          skipFAQ: true
        });

        if (diagramResult.generatedDiagrams.length > 0) {
          const successCount = diagramResult.generatedDiagrams.filter(d => d.success).length;
          console.log(`  ✅ H2図解生成完了: ${successCount}枚`);
          enhancedContent = diagramResult.updatedContent;
        }
      } catch (diagramError) {
        console.error('  ⚠️ H2図解エラー（継続）:', diagramError);
      }
    }

    // 7-2: サムネイル自動配置
    console.log('  🖼️ サムネイル配置中...');
    try {
      const { data: availableThumbnail } = await supabaseServiceRole
        .from('thumbnail_stock')
        .select('*')
        .eq('is_active', true)
        .order('usage_count', { ascending: true })
        .limit(1)
        .single();

      if (availableThumbnail) {
        await supabaseServiceRole
          .rpc('increment_thumbnail_usage', { thumbnail_id: availableThumbnail.id });

        await supabaseServiceRole
          .from('posts')
          .update({ thumbnail_url: availableThumbnail.url })
          .eq('id', savedPost.id);

        console.log(`  ✅ サムネイル設定完了`);
      }
    } catch (thumbnailError) {
      console.error('  ⚠️ サムネイルエラー（継続）:', thumbnailError);
    }

    // 7-3: ベクトル化
    // 🔧 記事全体のベクトル化はスキップ
    // ※ Fragment IDベクトル化がH2セクションごとにベクトル化するため、記事全体は不要
    // ※ これにより8192トークン制限エラーを回避し、コストも削減
    console.log('  ℹ️ 記事全体ベクトル化: スキップ（Fragment IDベクトル化で代替）');

    // 7-4: Fragment ID抽出・ベクトル化
    console.log('  🔍 Fragment IDベクトル化中...');
    try {
      const fragmentVectorizer = new FragmentVectorizer();
      const fragmentResult = await fragmentVectorizer.extractAndVectorizeFromMarkdown(
        enhancedContent,
        {
          post_id: savedPost.id,
          post_title: blogData.title,
          slug: slug,
          page_path: `/posts/${slug}`,
          category: categorySlug,
          seo_keywords: blogData.seo_keywords
        }
      );

      if (fragmentResult.success) {
        console.log(`  ✅ Fragment ID: ${fragmentResult.vectorizedCount}個ベクトル化`);
      }
    } catch (fragmentError) {
      console.error('  ⚠️ Fragment IDエラー（継続）:', fragmentError);
    }

    // 7-5: コンテンツ更新
    if (enhancedContent !== blogData.content) {
      await supabaseServiceRole
        .from('posts')
        .update({ content: enhancedContent })
        .eq('id', savedPost.id);
      console.log('  ✅ コンテンツ更新完了');
    }

    // 7-6: 一時RAGデータ自動削除（DB容量節約）
    console.log('  🗑️ 一時RAGデータ削除中...');
    try {
      // スクレイピングデータ削除
      const { error: scrapeDeleteError } = await supabaseServiceRole
        .from('hybrid_scraped_keywords')
        .delete()
        .gte('id', 0); // 全件削除

      if (!scrapeDeleteError) {
        console.log('  ✅ スクレイピングRAG削除完了');
      }

      // ディープリサーチデータ削除
      const { error: researchDeleteError } = await supabaseServiceRole
        .from('hybrid_deep_research')
        .delete()
        .gte('id', 0); // 全件削除

      if (!researchDeleteError) {
        console.log('  ✅ ディープリサーチRAG削除完了');
      }
    } catch (cleanupError) {
      console.warn('  ⚠️ 一時RAGデータ削除エラー（継続）:', cleanupError);
    }

    // ============================================
    // 完了
    // ============================================
    console.log('\n🎉 ========================================');
    console.log('✅ ハイブリッド記事生成完了！');
    console.log('🎉 ========================================\n');

    return NextResponse.json({
      success: true,
      postId: savedPost.id,
      title: blogData.title,
      slug: slug,
      wordCount: blogData.content?.length || 0,
      metadata: {
        scrapeQueries: [scrapeQuery1, scrapeQuery2],
        researchQueries: [researchQuery1, researchQuery2],
        ragSourcesUsed: {
          company: companyVectors?.length || 0,
          personalStory: personalStoryData.length,
          kenjiThought: kenjiThoughtData.length,
          scrapedKeywords: totalScrapedCount,
          deepResearch: researchRagData?.length || 0
        },
        generationType: 'hybrid',
        h2DiagramsGenerated: enableH2Diagrams
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('\n❌ ハイブリッド記事生成エラー:', error);
    return NextResponse.json(
      {
        error: 'ハイブリッド記事生成でエラーが発生しました',
        details: (error as Error).message
      },
      { status: 500 }
    );
  }
}

// ============================================
// ヘルパー関数
// ============================================

function buildRagSummary(data: any): string {
  const sections: string[] = [];

  // 自社情報
  if (data.companyVectors?.length > 0) {
    sections.push(`### 🏢 自社情報（company_vectors）
${data.companyVectors.slice(0, 5).map((v: any, i: number) =>
      `${i + 1}. ${v.section_title || '自社コンテンツ'}\n   ${(v.content_chunk || '').substring(0, 300)}...`
    ).join('\n\n')}`);
  }

  // パーソナルストーリー
  if (data.personalStoryData?.length > 0) {
    sections.push(`### 👤 パーソナルストーリー（一次情報）
${data.personalStoryData.slice(0, 3).map((p: any, i: number) =>
      `${i + 1}. ${p.story_title || 'ストーリー'}\n   ${(p.story_content || '').substring(0, 300)}...`
    ).join('\n\n')}`);
  }

  // AIアーキテクト思想
  if (data.kenjiThoughtData?.length > 0) {
    sections.push(`### 🧠 AIアーキテクト思想（原田賢治の視点）
${data.kenjiThoughtData.slice(0, 5).map((k: any, i: number) =>
      `${i + 1}. 【${k.thought_title}】\n   ${(k.thought_content || '').substring(0, 400)}...`
    ).join('\n\n')}`);
  }

  // スクレイピングRAG
  if (data.scrapedRagData?.length > 0) {
    sections.push(`### 📊 スクレイピングキーワードRAG
上位キーワード: ${data.scrapedRagData.slice(0, 20).map((s: any) => s.keyword).join(', ')}`);
  }

  // ディープリサーチRAG
  if (data.researchRagData?.length > 0) {
    sections.push(`### 🔬 ディープリサーチRAG
${data.researchRagData.slice(0, 5).map((r: any, i: number) =>
      `${i + 1}. ${r.title}\n   ${(r.summary || r.content || '').substring(0, 300)}...`
    ).join('\n\n')}`);
  }

  return sections.join('\n\n');
}

function buildHybridSystemPrompt(topic: string, targetKeyword: string, categorySlug: string, targetLength: number): string {
  // 🔍 エンティティ分析でトピックの本質を理解
  const topicAnalysis = analyzeTopicEntity(topic, targetKeyword);
  
  return `あなたは${topicAnalysis.authorRole}として記事を執筆します。

## 🎯 記事生成指示
- **トピック**: ${topic}
- **ターゲットキーワード**: ${targetKeyword}
- **カテゴリ**: ${categorySlug}
- **目標文字数**: ${targetLength}文字（必須）

## 🔍 トピック分析結果（これを踏まえて執筆）
${topicAnalysis.guidance}

## 📝 記事品質要件

### 1. ユーザーファースト（最重要）
- **読者が本当に知りたいこと**: ${topicAnalysis.readerNeeds}
- 結論を最初に提示（共感→結論→根拠→方法→体験談→まとめ）
- 実践的なアクションアイテムを含める

### 2. 具体性の徹底
- **必須**: スクレイピングで取得した会社名・サービス名を具体的に記載
- 「A社」「B社」などの抽象的な表現は絶対禁止
- 費用相場は具体的な数字で示す（ただしRAGデータにある情報のみ）

### 3. E-E-A-T（経験・専門性・権威性・信頼性）
- 一次情報（実体験）は補助的に使用
- 読者の悩みへの具体的解決策を優先
- 「私が〜を設計した際に」は必要な場合のみ（過度に使わない）

### 4. SEO・AIO最適化
- Fragment ID付き見出し（例：## はじめに {#introduction}）
- 適切なキーワード密度（2-3%）
- FAQセクション必須（**12問以上**、各{#faq-1}〜{#faq-12}）

### 5. 構造化
- H1→H2→H3の論理的な見出し構造
- 段落は3-4行以内
- 比較表、チェックリストを効果的に使用

### 6. 🚨🚨🚨【絶対条件】文字数要件（最重要）
- **目標文字数: ${targetLength}文字**（最低${Math.floor(targetLength * 0.8)}文字以上）
- H2セクションは最低**20個以上**
- 各H2セクションは**最低2000文字**
- FAQは**15問以上**（各300文字以上）
- 比較表は**3つ以上**
- 具体的事例は**5つ以上**
- スクレイピングキーワードを**全て**記事内に含める

⚠️ 文字数が足りない場合は、具体的な事例、詳細な手順、比較表、チェックリストを追加して必ず目標文字数に到達すること。

## ⚠️ 【絶対禁止】
- 「A社」「B社」などの匿名表記（具体名を使う）
- RAGにない数字の捏造
- 読者が求めていないAI技術の深堀り
- 「レリバンスエンジニアリング」「ベクトルリンク」などの専門用語の過度な使用

## 📋 出力形式【最重要】

🚨 **絶対に以下のJSON形式のみを出力してください。説明文や前置きは一切不要です。**

\`\`\`json
{
  "title": "魅力的なブログタイトル（32文字以内、キーワードを含む）",
  "meta_description": "160文字以内のメタディスクリプション",
  "content": "記事本文（Markdown形式、${targetLength}文字以上）\\n\\n## 見出し1 {#section-1}\\n本文...\\n\\n## 見出し2 {#section-2}\\n本文...",
  "seo_keywords": ["メインキーワード", "関連キーワード1", "関連キーワード2", "関連キーワード3", "関連キーワード4"],
  "excerpt": "200文字以内の記事要約",
  "estimated_reading_time": 30,
  "word_count": ${targetLength}
}
\`\`\`

⚠️ JSONの前後に説明文を追加しないでください。JSONのみを出力してください。`;
}

// 🔍 エンティティ分析関数（トピックの本質を理解）
function analyzeTopicEntity(topic: string, targetKeyword: string): {
  authorRole: string;
  guidance: string;
  readerNeeds: string;
} {
  const lowerTopic = (topic + ' ' + targetKeyword).toLowerCase();
  
  // 地域 × サービス系（例：「滋賀県ホームページ制作」）
  if (/ホームページ|web制作|hp制作|サイト制作/.test(lowerTopic) && /県|市|東京|大阪|名古屋|福岡|札幌|地域/.test(lowerTopic)) {
    return {
      authorRole: '地域のWeb制作に詳しい専門家',
      guidance: `【地域密着型サービス紹介記事】
- 読者は「どの会社に頼めばいいか」を知りたい
- 具体的な会社名、費用相場、選び方のポイントを重視
- AIやテクノロジーの話は最小限に
- 地元の会社の特徴、実績を具体的に紹介`,
      readerNeeds: '信頼できる地元の制作会社を見つけたい、費用相場を知りたい、失敗しない選び方を知りたい'
    };
  }
  
  // 〇選・おすすめ系（例：「AIツールおすすめ10選」）
  if (/おすすめ|選|比較|ランキング|ベスト/.test(lowerTopic)) {
    return {
      authorRole: '実際にツール・サービスを使用した専門家',
      guidance: `【比較・おすすめ記事】
- 読者は「どれを選べばいいか」の答えを求めている
- 各選択肢の具体的なメリット・デメリットを明記
- 価格、機能、使いやすさで比較表を作成
- 「こんな人にはこれがおすすめ」という明確な結論`,
      readerNeeds: '自分に合った選択肢を見つけたい、比較検討の時間を節約したい'
    };
  }
  
  // 転職・キャリア系
  if (/転職|キャリア|エージェント|求人|就職/.test(lowerTopic)) {
    return {
      authorRole: 'キャリアアドバイザー・転職経験者',
      guidance: `【転職・キャリア支援記事】
- 読者は不安を抱えながら情報収集している
- 具体的なエージェント名、サービスの特徴を紹介
- 成功事例、失敗談を交えて親身なアドバイス
- 年齢・業界別のおすすめを明確に`,
      readerNeeds: '転職を成功させたい、自分に合ったエージェントを見つけたい'
    };
  }
  
  // AI・テクノロジー系
  if (/ai|chatgpt|生成ai|rag|mcp|llm/.test(lowerTopic)) {
    return {
      authorRole: 'AIアーキテクト「原田賢治」',
      guidance: `【AI技術解説記事】
- 読者は技術の実践的な使い方を知りたい
- 概念説明→具体的な活用方法→コード例の流れ
- 専門用語は必要に応じて使用（ただし解説付き）
- 実際のプロジェクト経験を交えて信頼性を高める`,
      readerNeeds: 'AIを実務に活用したい、最新動向を把握したい'
    };
  }
  
  // SEO・マーケティング系
  if (/seo|マーケティング|集客|広告|コンテンツ/.test(lowerTopic)) {
    return {
      authorRole: 'Webマーケティングの専門家',
      guidance: `【SEO・マーケティング記事】
- 読者は具体的な成果を出す方法を知りたい
- 施策の優先順位、費用対効果を明確に
- 具体的な事例（Before/After）を含める
- ツールや手法の具体名を出す`,
      readerNeeds: '集客を増やしたい、費用対効果の高い施策を知りたい'
    };
  }
  
  // デフォルト
  return {
    authorRole: '業界の専門家',
    guidance: `【一般的な解説記事】
- 読者の疑問に直接答える構成
- 具体例、数字を豊富に使用
- 専門用語は必要最小限に`,
    readerNeeds: 'このトピックについて詳しく知りたい、実践的な情報が欲しい'
  };
}

function formatScrapedKeywords(keywords: any): string {
  if (!keywords || typeof keywords !== 'object') return '（データなし）';

  const sections: string[] = [];
  // 🔧 全てのキーワードを渡す（上位表示に必須）
  if (keywords.h1?.length > 0) sections.push(`【H1キーワード】全て記事に含めること:\n${keywords.h1.join(', ')}`);
  if (keywords.h2?.length > 0) sections.push(`【H2キーワード】見出しに使用すること:\n${keywords.h2.join(', ')}`);
  if (keywords.h3?.length > 0) sections.push(`【H3キーワード】サブ見出しに使用すること:\n${keywords.h3.join(', ')}`);
  if (keywords.body?.length > 0) sections.push(`【本文キーワード】本文に自然に散りばめること:\n${keywords.body.slice(0, 100).join(', ')}`);

  return sections.length > 0 ? sections.join('\n\n') : '（データなし）';
}

function formatResearchResults(results: any): string {
  if (!results || !results.results) return '（データなし）';

  return results.results.slice(0, 5).map((r: any, i: number) =>
    `${i + 1}. **${r.title}**\n   ${(r.content || '').substring(0, 200)}...`
  ).join('\n\n');
}

function parseGeneratedContent(content: string): any {
  // デバッグ: 最初の500文字を出力
  console.log('📝 生成コンテンツ先頭500文字:', content.substring(0, 500));
  
  try {
    return JSON.parse(content);
  } catch (error) {
    // 🔧 Markdownコードブロック内のJSONを抽出
    try {
      // ```json ... ``` パターン
      const jsonBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonBlockMatch) {
        const jsonContent = jsonBlockMatch[1].trim();
        console.log('📝 JSONブロック抽出成功');
        return JSON.parse(jsonContent);
      }
    } catch (e) {
      console.log('📝 JSONブロック抽出失敗');
    }

    // 🔧 {で始まる最初のJSONオブジェクトを抽出
    try {
      const jsonStart = content.indexOf('{');
      const jsonEnd = content.lastIndexOf('}') + 1;
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        const jsonStr = content.substring(jsonStart, jsonEnd);
        console.log('📝 JSON抽出試行:', jsonStr.substring(0, 200));
        return JSON.parse(jsonStr);
      }
    } catch (secondError) {
      console.log('📝 JSON直接抽出失敗');
    }

    // 🔧 最終フォールバック（Markdownとして処理）
    console.warn('⚠️ JSONパース失敗、Markdownとして処理');
    
    // タイトル抽出（# で始まる行）
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : '生成された記事';
    
    // メタディスクリプション抽出（最初の段落）
    const firstParagraph = content.split('\n\n').find(p => p.trim() && !p.startsWith('#'));
    const metaDesc = firstParagraph?.substring(0, 160) || content.substring(0, 160);
    
    return {
      title: title,
      content: content,
      meta_description: metaDesc,
      seo_keywords: ['AI', 'テクノロジー', 'ビジネス'],
      excerpt: metaDesc,
      estimated_reading_time: Math.ceil(content.length / 500),
      word_count: content.length
    };
  }
}

