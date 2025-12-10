import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { OpenAIEmbeddings } from '@/lib/vector/openai-embeddings';
import OpenAI from 'openai';

// Supabase Service Role Client (RLS bypass)
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// DeepSeek API クライアント（OpenAI互換）
const deepseekClient = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: 'https://api.deepseek.com',
});

// タイムアウト設定
export const maxDuration = 300; // 5分（ディープリサーチは時間がかかる）
export const dynamic = 'force-dynamic';

/**
 * 🔬 本物のディープリサーチAPI
 * 
 * アーキテクチャ:
 * 1️⃣ 初期検索 (Tavily API)
 * 2️⃣ LLM分析 (DeepSeek) - 結果を分析し、知識を抽出
 * 3️⃣ 追加クエリ生成 (DeepSeek) - 深掘りすべきトピックを特定
 * 4️⃣ 反復検索 (Tavily API) - depth × breadth 回
 * 5️⃣ 最終レポート生成 (DeepSeek) - 全情報を統合
 * 
 * パラメータ:
 * - depth: 反復の深さ（デフォルト: 3）
 * - breadth: 各反復での検索クエリ数（デフォルト: 3）
 * - 予想時間: 3-5分
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { 
      topic,                    // リサーチトピック
      researchType = 'trend',   // リサーチタイプ
      depth = 3,                // 反復の深さ
      breadth = 3,              // 各反復での検索クエリ数
      saveToRag = true,         // RAGに保存するか
      existingLearnings = []    // 既存の学習内容
    } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { error: 'リサーチトピックが必要です' },
        { status: 400 }
      );
    }

    console.log('\n' + '='.repeat(70));
    console.log('🔬 【本物の】ディープリサーチ開始');
    console.log('='.repeat(70));
    console.log(`📌 トピック: ${topic}`);
    console.log(`📊 タイプ: ${researchType}`);
    console.log(`🔄 深さ: ${depth} / 幅: ${breadth}`);
    console.log(`⏱️  予想時間: ${depth * breadth * 20}〜${depth * breadth * 40}秒`);
    console.log('='.repeat(70));

    // 全ての学習内容を蓄積
    let allLearnings: Learning[] = existingLearnings.map((l: string) => ({
      content: l,
      source: 'existing',
      depth: 0,
      query: 'initial'
    }));
    
    // 全ての検索結果を蓄積
    let allResults: ResearchResult[] = [];

    // ============================================
    // ステップ1: 初期検索
    // ============================================
    console.log('\n📡 ステップ1: 初期検索...');
    const initialQuery = generateInitialQuery(topic, researchType);
    console.log(`  🔍 初期クエリ: "${initialQuery}"`);
    
    const initialResults = await searchWithTavily(initialQuery);
    allResults.push(...initialResults);
    console.log(`  ✅ 初期検索完了: ${initialResults.length}件`);

    // ============================================
    // ステップ2: 初期結果の分析
    // ============================================
    console.log('\n🤖 ステップ2: DeepSeekで初期結果を分析...');
    const initialAnalysis = await analyzeWithDeepSeek(
      topic, 
      initialResults, 
      researchType,
      allLearnings
    );
    allLearnings.push(...initialAnalysis.learnings);
    console.log(`  ✅ 分析完了: ${initialAnalysis.learnings.length}件の知識を抽出`);
    console.log(`  📝 学習内容例: ${initialAnalysis.learnings[0]?.content.substring(0, 100)}...`);

    // ============================================
    // ステップ3-4: 反復的な深掘り
    // ============================================
    for (let d = 1; d <= depth; d++) {
      console.log(`\n🔄 ステップ${2 + d}: 深掘り反復 ${d}/${depth}`);
      
      // 追加クエリを生成
      console.log(`  🧠 追加クエリを${breadth}個生成中...`);
      const additionalQueries = await generateAdditionalQueries(
        topic,
        researchType,
        allLearnings,
        breadth
      );
      console.log(`  📝 生成されたクエリ:`);
      additionalQueries.forEach((q, i) => console.log(`     ${i + 1}. ${q}`));

      // 各クエリで検索
      for (let b = 0; b < additionalQueries.length; b++) {
        const query = additionalQueries[b];
        console.log(`  🔍 検索 ${b + 1}/${additionalQueries.length}: "${query.substring(0, 50)}..."`);
        
        try {
          const results = await searchWithTavily(query);
          allResults.push(...results);
          
          // 結果を分析
          const analysis = await analyzeWithDeepSeek(
            topic,
            results,
            researchType,
            allLearnings
          );
          allLearnings.push(...analysis.learnings);
          
          console.log(`     ✅ ${results.length}件取得, ${analysis.learnings.length}件の知識追加`);
        } catch (error) {
          console.error(`     ❌ 検索エラー: ${(error as Error).message}`);
        }

        // レート制限対策
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // ============================================
    // ステップ5: 最終レポート生成
    // ============================================
    console.log('\n📊 ステップ5: 最終レポート生成...');
    const finalReport = await generateFinalReport(
      topic,
      researchType,
      allLearnings,
      allResults
    );
    console.log(`  ✅ レポート生成完了: ${finalReport.summary.length}文字`);

    // ============================================
    // RAGに保存
    // ============================================
    let savedCount = 0;
    if (saveToRag) {
      console.log('\n💾 RAGテーブルに保存中...');
      savedCount = await saveDeepResearchToRag(
        topic,
        researchType,
        allLearnings,
        finalReport
      );
      console.log(`  ✅ ${savedCount}件保存完了`);
    }

    const elapsedTime = Math.round((Date.now() - startTime) / 1000);
    console.log('\n' + '='.repeat(70));
    console.log(`✅ ディープリサーチ完了！`);
    console.log(`⏱️  所要時間: ${elapsedTime}秒`);
    console.log(`📚 総学習内容: ${allLearnings.length}件`);
    console.log(`🔍 総検索結果: ${allResults.length}件`);
    console.log('='.repeat(70));

    return NextResponse.json({
      success: true,
      topic,
      researchType,
      depth,
      breadth,
      totalLearnings: allLearnings.length,
      totalResults: allResults.length,
      savedToRag: savedCount,
      elapsedSeconds: elapsedTime,
      summary: finalReport.summary,
      keyFindings: finalReport.keyFindings,
      recommendations: finalReport.recommendations,
      results: allResults.slice(0, 20),
      learnings: allLearnings.slice(0, 30).map(l => l.content),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const elapsedTime = Math.round((Date.now() - startTime) / 1000);
    console.error(`\n❌ ディープリサーチエラー (${elapsedTime}秒経過):`, error);
    return NextResponse.json(
      { error: 'ディープリサーチでエラーが発生しました: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// ============================================
// 型定義
// ============================================

interface ResearchResult {
  title: string;
  content: string;
  url: string;
  source: string;
  publishedDate?: string;
  score: number;
}

interface Learning {
  content: string;
  source: string;
  depth: number;
  query: string;
}

interface FinalReport {
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  entities: string[];
  statistics: string[];
}

// ============================================
// 初期クエリ生成
// ============================================

function generateInitialQuery(topic: string, researchType: string): string {
  const queryTemplates: { [key: string]: string } = {
    trend: `${topic} 最新動向 2025 トレンド`,
    comparison: `${topic} 比較 おすすめ ランキング 2025`,
    technical: `${topic} 仕組み 技術 実装方法`,
    market: `${topic} 市場規模 シェア 成長率`
  };
  return queryTemplates[researchType] || queryTemplates.trend;
}

// ============================================
// Tavily API検索
// ============================================

async function searchWithTavily(query: string): Promise<ResearchResult[]> {
  const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
  
  if (!TAVILY_API_KEY) {
    console.log('  ⚠️ TAVILY_API_KEYが未設定、スキップ');
    return [];
  }

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: query,
        search_depth: 'advanced',
        include_answer: true,
        include_raw_content: false,
        max_results: 10,
        exclude_domains: [
          'amazon.co.jp', 'rakuten.co.jp', 'twitter.com', 'facebook.com',
          'instagram.com', 'youtube.com', 'tiktok.com', 'pinterest.com'
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Tavily API: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const results: ResearchResult[] = [];

    // AI生成の回答
    if (data.answer) {
      results.push({
        title: `AI分析: ${query}`,
        content: data.answer,
        url: '',
        source: 'Tavily AI',
        score: 1.0
      });
    }

    // 検索結果
    if (data.results) {
      data.results.forEach((result: any, index: number) => {
        results.push({
          title: result.title || '',
          content: result.content || '',
          url: result.url || '',
          source: extractDomain(result.url || ''),
          publishedDate: result.published_date,
          score: result.score || (1 - index * 0.05)
        });
      });
    }

    return results;

  } catch (error) {
    console.error('  ❌ Tavily検索エラー:', (error as Error).message);
    return [];
  }
}

// ============================================
// DeepSeekで分析
// ============================================

async function analyzeWithDeepSeek(
  topic: string,
  results: ResearchResult[],
  researchType: string,
  existingLearnings: Learning[]
): Promise<{ learnings: Learning[] }> {
  if (results.length === 0) {
    return { learnings: [] };
  }

  const existingKnowledge = existingLearnings
    .slice(-10)
    .map(l => `- ${l.content}`)
    .join('\n');

  const resultsText = results
    .slice(0, 5)
    .map(r => `【${r.title}】(${r.source})\n${r.content}`)
    .join('\n\n');

  const prompt = `あなたは専門的なリサーチャーです。以下の検索結果から、「${topic}」に関する重要な知識・インサイトを抽出してください。

## 既存の知識（重複しないこと）
${existingKnowledge || '（なし）'}

## 検索結果
${resultsText}

## 抽出ルール
1. 具体的な数字・統計データを優先
2. 会社名・サービス名・人名などの固有名詞を含める
3. 最新のトレンドや変化を特定
4. 1つの知識は1-3文で簡潔に
5. 既存の知識と重複しないこと

## 出力形式（JSON）
以下の形式で、5-10個の知識を抽出してください:
\`\`\`json
{
  "learnings": [
    "具体的な知識1（数字や固有名詞を含む）",
    "具体的な知識2",
    ...
  ]
}
\`\`\``;

  try {
    const completion = await deepseekClient.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.3, // 分析は低めのtemperature
    });

    const responseText = completion.choices[0]?.message?.content || '';
    
    // JSONを抽出（複数パターン対応）
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                      responseText.match(/\{[\s\S]*"learnings"[\s\S]*\}/) ||
                      responseText.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      try {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        // JSONを修復する試み（末尾のカンマ削除など）
        const cleanedJson = jsonStr
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']')
          .replace(/[\r\n]+/g, ' ')
          .trim();
        
        const parsed = JSON.parse(cleanedJson);
        
        // learningsが配列の場合
        const learningsArray = Array.isArray(parsed) ? parsed : (parsed.learnings || []);
        
        return {
          learnings: learningsArray.map((item: any) => ({
            content: typeof item === 'string' ? item : (item.content || item.text || JSON.stringify(item)),
            source: results[0]?.source || 'unknown',
            depth: existingLearnings.length,
            query: topic
          }))
        };
      } catch (parseError) {
        console.warn('  ⚠️ JSONパースエラー、テキスト抽出を試みます:', (parseError as Error).message);
        // フォールバック: テキストから箇条書きを抽出
        const bulletPoints = responseText.match(/[-•]\s*([^\n]+)/g) || [];
        if (bulletPoints.length > 0) {
          return {
            learnings: bulletPoints.slice(0, 10).map((bp: string) => ({
              content: bp.replace(/^[-•]\s*/, '').trim(),
              source: results[0]?.source || 'unknown',
              depth: existingLearnings.length,
              query: topic
            }))
          };
        }
      }
    }

    return { learnings: [] };

  } catch (error) {
    console.error('  ❌ DeepSeek分析エラー:', (error as Error).message);
    return { learnings: [] };
  }
}

// ============================================
// 追加クエリ生成
// ============================================

async function generateAdditionalQueries(
  topic: string,
  researchType: string,
  learnings: Learning[],
  count: number
): Promise<string[]> {
  const recentLearnings = learnings
    .slice(-15)
    .map(l => `- ${l.content}`)
    .join('\n');

  const prompt = `あなたは専門的なリサーチャーです。「${topic}」についてより深く調査するために、追加の検索クエリを生成してください。

## これまでの学習内容
${recentLearnings}

## リサーチタイプ: ${researchType}

## ルール
1. まだ調査していない角度から質問を生成
2. 具体的で検索しやすいクエリにする
3. 日本語のクエリを生成
4. 数字や具体的な条件を含める
5. 既存の知識を深掘りする方向で

## 出力形式（JSON）
${count}個の検索クエリを生成:
\`\`\`json
{
  "queries": [
    "具体的な検索クエリ1",
    "具体的な検索クエリ2",
    ...
  ]
}
\`\`\``;

  try {
    const completion = await deepseekClient.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.7, // クエリ生成は少し高めのtemperature
    });

    const responseText = completion.choices[0]?.message?.content || '';
    
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) ||
                      responseText.match(/\{[\s\S]*"queries"[\s\S]*\}/) ||
                      responseText.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      try {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        const cleanedJson = jsonStr
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']')
          .replace(/[\r\n]+/g, ' ')
          .trim();
        
        const parsed = JSON.parse(cleanedJson);
        const queriesArray = Array.isArray(parsed) ? parsed : (parsed.queries || []);
        return queriesArray.slice(0, count);
      } catch (parseError) {
        console.warn('  ⚠️ クエリJSONパースエラー:', (parseError as Error).message);
      }
    }

    // フォールバック: デフォルトクエリ
    return [
      `${topic} 料金 価格 費用相場`,
      `${topic} 導入事例 成功事例`,
      `${topic} メリット デメリット 注意点`
    ].slice(0, count);

  } catch (error) {
    console.error('  ❌ クエリ生成エラー:', (error as Error).message);
    return [
      `${topic} おすすめ 比較`,
      `${topic} 選び方 ポイント`
    ].slice(0, count);
  }
}

// ============================================
// 最終レポート生成
// ============================================

async function generateFinalReport(
  topic: string,
  researchType: string,
  learnings: Learning[],
  results: ResearchResult[]
): Promise<FinalReport> {
  const allLearningsText = learnings
    .map(l => `- ${l.content}`)
    .join('\n');

  const allSourcesText = Array.from(new Set(results.map(r => r.source)))
    .filter(s => s && s !== 'Unknown' && s !== 'Tavily AI')
    .slice(0, 20)
    .join(', ');

  const prompt = `あなたは専門的なリサーチャーです。「${topic}」についての調査結果から、包括的なレポートを作成してください。

## 収集した知識（${learnings.length}件）
${allLearningsText}

## 情報ソース
${allSourcesText}

## レポート要件
1. **サマリー**: 300-500文字で全体像を説明
2. **主要な発見**: 最も重要な5-8個のポイント
3. **推奨事項**: 読者へのアクション3-5個
4. **キーエンティティ**: 重要な会社名・サービス名・人名
5. **統計データ**: 数字を含む具体的なデータ

## 出力形式（JSON）
\`\`\`json
{
  "summary": "包括的なサマリー（300-500文字）",
  "keyFindings": [
    "主要な発見1（具体的な数字や名前を含む）",
    "主要な発見2",
    ...
  ],
  "recommendations": [
    "推奨事項1",
    "推奨事項2",
    ...
  ],
  "entities": ["会社名1", "サービス名1", ...],
  "statistics": ["統計データ1", "統計データ2", ...]
}
\`\`\``;

  try {
    const completion = await deepseekClient.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 3000,
      temperature: 0.5,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) ||
                      responseText.match(/\{[\s\S]*"summary"[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        const cleanedJson = jsonStr
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']')
          .replace(/[\r\n]+/g, ' ')
          .trim();
        
        return JSON.parse(cleanedJson);
      } catch (parseError) {
        console.warn('  ⚠️ レポートJSONパースエラー:', (parseError as Error).message);
      }
    }

    // フォールバック
    return {
      summary: `${topic}についてのリサーチが完了しました。${learnings.length}件の知識を収集。`,
      keyFindings: learnings.slice(0, 8).map(l => l.content),
      recommendations: ['詳細な分析を続けることを推奨'],
      entities: [],
      statistics: []
    };

  } catch (error) {
    console.error('  ❌ レポート生成エラー:', (error as Error).message);
    return {
      summary: `${topic}についてのリサーチが完了しました。`,
      keyFindings: learnings.slice(0, 5).map(l => l.content),
      recommendations: [],
      entities: [],
      statistics: []
    };
  }
}

// ============================================
// RAGに保存
// ============================================

async function saveDeepResearchToRag(
  topic: string,
  researchType: string,
  learnings: Learning[],
  report: FinalReport
): Promise<number> {
  const embeddings = new OpenAIEmbeddings();
  let savedCount = 0;

  // レポートを保存
  try {
    const reportContent = `【${topic} ディープリサーチレポート】

## サマリー
${report.summary}

## 主要な発見
${report.keyFindings.map((f, i) => `${i + 1}. ${f}`).join('\n')}

## 推奨事項
${report.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

## 統計データ
${report.statistics.map(s => `- ${s}`).join('\n')}`;

    const embedding = await embeddings.embedSingle(reportContent, 1536);

    const { error } = await supabaseServiceRole
      .from('hybrid_deep_research')
      .insert({
        research_topic: topic,
        research_type: researchType,
        research_prompt: `Deep Research: ${topic} (${researchType})`,
        content: reportContent,
        summary: report.summary,
        source_urls: [],
        source_count: learnings.length,
        authority_score: 1.0,
        embedding: embedding,
        key_findings: report.keyFindings,
        related_entities: report.entities,
        semantic_keywords: [...report.entities, ...report.statistics.slice(0, 5)],
        research_date: new Date().toISOString().split('T')[0],
        data_freshness: 'recent',
        metadata: {
          type: 'final_report',
          learnings_count: learnings.length,
          research_type: researchType
        },
        is_active: true
      });

    if (!error) savedCount++;
  } catch (error) {
    console.error('  ❌ レポート保存エラー:', error);
  }

  // 重要な学習内容も保存（上位10件）
  const topLearnings = learnings.slice(0, 10);
  for (const learning of topLearnings) {
    try {
      const content = `【${topic}】${learning.content}`;
      const embedding = await embeddings.embedSingle(content, 1536);

      const { error } = await supabaseServiceRole
        .from('hybrid_deep_research')
        .insert({
          research_topic: topic,
          research_type: researchType,
          research_prompt: learning.query,
          content: content,
          summary: learning.content.substring(0, 200),
          source_urls: learning.source ? [learning.source] : [],
          source_count: 1,
          authority_score: 0.8,
          embedding: embedding,
          key_findings: [learning.content],
          related_entities: extractEntitiesFromText(learning.content),
          semantic_keywords: extractKeywordsFromText(learning.content),
          research_date: new Date().toISOString().split('T')[0],
          data_freshness: 'recent',
          metadata: {
            type: 'learning',
            depth: learning.depth
          },
          is_active: true
        });

      if (!error) savedCount++;
    } catch (error) {
      // 個別のエラーは無視して続行
    }
  }

  return savedCount;
}

// ============================================
// ヘルパー関数
// ============================================

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return 'Unknown';
  }
}

function extractEntitiesFromText(text: string): string[] {
  if (!text) return [];
  
  const entities: string[] = [];
  
  // 会社名
  const companyMatches = text.match(/(?:株式会社|合同会社)?[A-Za-z\u4E00-\u9FAF]{2,}(?:株式会社|Inc\.|Corp\.)?/g) || [];
  entities.push(...companyMatches.filter(c => c.length > 2).slice(0, 5));
  
  // サービス名（英字）
  const serviceMatches = text.match(/[A-Z][A-Za-z0-9]+/g) || [];
  entities.push(...serviceMatches.filter(s => s.length > 2).slice(0, 5));
  
  return Array.from(new Set(entities)).slice(0, 10);
}

function extractKeywordsFromText(text: string): string[] {
  if (!text) return [];
  
  const keywords: string[] = [];
  
  // 日本語（2-6文字）
  const japaneseMatches = text.match(/[\u4E00-\u9FAF\u3040-\u309F\u30A0-\u30FF]{2,6}/g) || [];
  keywords.push(...japaneseMatches.slice(0, 10));
  
  // 英語
  const englishMatches = text.match(/[A-Z][a-z]+/g) || [];
  keywords.push(...englishMatches.filter(e => e.length > 2).slice(0, 5));
  
  return Array.from(new Set(keywords)).slice(0, 15);
}
