/**
 * AIアーキテクト・ショート台本V2 API
 * 
 * フック最適化 + ディープリサーチ統合 + 専門用語ゼロ化
 * 
 * @created 2025-12-12
 * @version 2.0.0
 * 
 * 【重要】既存の /api/admin/generate-youtube-script とは完全に分離
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { OpenAIEmbeddings } from '@/lib/vector/openai-embeddings';
import { 
  generateOptimizedHook, 
  detectTargetAudience 
} from '@/lib/viral-hooks/hook-optimizer';
import { 
  MultiRAGSearchSystem 
} from '@/lib/rag/multi-rag-search';
import { 
  getSystemPrompt, 
  getUserPrompt, 
  decideCTAType,
  calculateSimplicityScore,
  detectTechnicalTerms,
  type ArchitectShortV2PromptInput
} from '@/lib/prompts/architect-short-v2';

// Vercelタイムアウト設定
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Service Role Key を使用してRLSをバイパス
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface ArchitectShortV2Request {
  postId: number;
  postSlug: string;
  postTitle: string;
  postContent: string;
  scriptType?: 'short' | 'medium'; // V2では'short'のみサポート
  scriptMode?: 'default' | 'architect'; // V2では'architect'のみサポート
}

interface ArchitectShortV2Response {
  success: boolean;
  scriptId?: number;
  aiOptimizationScore?: number;
  hookPattern?: string;
  simplicityScore?: number;
  error?: string;
}

/**
 * メイン関数：AIアーキテクト・ショート台本V2生成
 */
export async function POST(request: NextRequest): Promise<NextResponse<ArchitectShortV2Response>> {
  const startTime = Date.now();
  
  try {
    const { 
      postId, 
      postSlug, 
      postTitle, 
      postContent, 
      scriptType = 'short', 
      scriptMode = 'architect' 
    }: ArchitectShortV2Request = await request.json();

    console.log('\n🚀 ========================================');
    console.log('🏗️ AIアーキテクト・ショート台本V2 生成開始');
    console.log('========================================');
    console.log(`  記事ID: ${postId}`);
    console.log(`  記事Slug: ${postSlug}`);
    console.log(`  記事タイトル: ${postTitle}`);
    console.log(`  台本タイプ: ${scriptType}`);
    console.log(`  台本モード: ${scriptMode}`);
    console.log('========================================\n');

    // V2では'short' + 'architect'のみサポート
    if (scriptType !== 'short' || scriptMode !== 'architect') {
      return NextResponse.json({
        success: false,
        error: 'V2 APIは AIアーキテクト・ショート（short + architect）のみサポートします'
      }, { status: 400 });
    }

    // 既に台本が存在するかチェック
    const { data: existingScript } = await supabaseServiceRole
      .from('company_youtube_shorts')
      .select('id')
      .eq('fragment_id', postSlug)
      .eq('content_type', 'short')
      .single();

    if (existingScript) {
      console.log('⚠️  既に台本が存在します:', existingScript.id);
      return NextResponse.json({
        success: false,
        scriptId: existingScript.id,
        error: '既に台本が生成されています'
      }, { status: 409 });
    }

    // ========================================
    // Step 1: ターゲット層自動検出
    // ========================================
    console.log('🎯 Step 1: ターゲット層自動検出中...');
    const targetAudience = await detectTargetAudience(postTitle, postContent);
    console.log(`✅ ターゲット層: ${targetAudience}\n`);

    // ========================================
    // Step 2: マルチRAG検索（並列）
    // ========================================
    console.log('🔍 Step 2: マルチRAG検索中...');
    const ragSearcher = new MultiRAGSearchSystem();
    const ragResults = await ragSearcher.searchAll({
      query: postTitle,
      blogTitle: postTitle,
      blogSlug: postSlug,
      targetAudience
    });

    console.log(`✅ マルチRAG検索完了:`);
    console.log(`   - ディープリサーチ: ${ragResults.deepResearch.count}件（スコア: ${ragResults.deepResearch.score.toFixed(3)}）`);
    console.log(`   - スクレイピング: ${ragResults.scrapedKeywords.count}件（スコア: ${ragResults.scrapedKeywords.score.toFixed(3)}）`);
    console.log(`   - ブログフラグメント: ${ragResults.blogFragments.count}件（スコア: ${ragResults.blogFragments.score.toFixed(3)}）`);
    console.log(`   - パーソナルストーリー: ${ragResults.personalStories.count}件（スコア: ${ragResults.personalStories.score.toFixed(3)}）`);
    console.log(`   - 総合スコア: ${ragResults.overallScore.toFixed(3)}`);
    console.log(`   - 新規リサーチ必要: ${ragResults.needsNewResearch ? 'はい' : 'いいえ'}\n`);

    // ========================================
    // Step 2.5: 新規ディープリサーチ実行（必要な場合）
    // ========================================
    if (ragResults.needsNewResearch) {
      console.log('\n🔬 Step 2.5: 新規ディープリサーチ実行中...');
      console.log(`   トピック: "${postTitle}"`);
      console.log(`   モデル: DeepSeek V3.2`);
      
      try {
        const deepResearchResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/deep-research`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: postTitle,
            researchType: 'trend', // AIアーキテクト向けは最新トレンド重視
            depth: 2,  // 速度とクオリティのバランス（2-4分）
            breadth: 3,
            saveToRag: true  // RAGに保存
          }),
          signal: AbortSignal.timeout(300000) // 5分タイムアウト
        });

        if (deepResearchResponse.ok) {
          const deepResearchData = await deepResearchResponse.json();
          console.log(`✅ ディープリサーチ完了: ${deepResearchData.totalLearnings || 0}件の知識を取得`);
          
          // 新しいRAGデータで再検索
          console.log('🔄 RAGデータ再検索中...');
          const updatedRagResults = await ragSearcher.searchAll({
            query: postTitle,
            blogTitle: postTitle,
            blogSlug: postSlug,
            targetAudience
          });
          
          // 結果を更新
          Object.assign(ragResults, {
            deepResearch: updatedRagResults.deepResearch,
            overallScore: updatedRagResults.overallScore,
            needsNewResearch: false
          });
          
          console.log(`✅ 再検索完了: ディープリサーチ ${updatedRagResults.deepResearch.count}件（スコア: ${updatedRagResults.deepResearch.score.toFixed(3)}）\n`);
        } else {
          console.warn(`⚠️  ディープリサーチAPI エラー: ${deepResearchResponse.status}`);
          console.log('⚠️  既存データで続行します\n');
        }
      } catch (error: any) {
        if (error.name === 'TimeoutError' || error.name === 'AbortError') {
          console.warn('⚠️  ディープリサーチ タイムアウト（5分）');
        } else {
          console.warn('⚠️  ディープリサーチ エラー:', error.message);
        }
        console.log('⚠️  既存データで続行します\n');
      }
    }

    // ========================================
    // Step 3: フック最適化
    // ========================================
    console.log('🎣 Step 3: フック最適化中...');
    const optimizedHook = await generateOptimizedHook({
      blogTitle: postTitle,
      blogContent: postContent.substring(0, 500),
      deepResearchTopic: ragResults.deepResearch.results[0]?.research_topic || postTitle,
      deepResearchContent: ragResults.deepResearch.results[0]?.content || '',
      targetAudience
    });

    console.log(`✅ フック最適化完了:`);
    console.log(`   - フック: "${optimizedHook.hook_text}"`);
    console.log(`   - パターン: ${optimizedHook.pattern_name}`);
    console.log(`   - 効果スコア: ${(optimizedHook.effectiveness_score * 100).toFixed(0)}%\n`);

    // ========================================
    // Step 4: CTA決定（75% / 25%）
    // ========================================
    console.log('📢 Step 4: CTA決定中...');
    const ctaType = decideCTAType();
    console.log(`✅ CTA: ${ctaType === 'prompt_gift' ? 'プロンプトプレゼント（75%）' : 'ストーリー誘導（25%）'}\n`);

    // ========================================
    // Step 5: プロンプト生成
    // ========================================
    console.log('📝 Step 5: プロンプト生成中...');
    const promptInput: ArchitectShortV2PromptInput = {
      blogTitle: postTitle,
      blogSlug: postSlug,
      targetAudience,
      hook: optimizedHook,
      ragResults,
      ctaType
    };

    const systemPrompt = getSystemPrompt();
    const userPrompt = getUserPrompt(promptInput);
    console.log(`✅ プロンプト生成完了\n`);

    // ========================================
    // Step 6: OpenAI API呼び出し（GPT-4o）
    // ========================================
    console.log('🤖 Step 6: OpenAI API呼び出し中（GPT-5.2）...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-5.2',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      max_completion_tokens: 6000
    });

    const generatedContent = completion.choices[0].message.content;
    if (!generatedContent) {
      throw new Error('OpenAI APIからのレスポンスが空です');
    }

    const parsedScript = JSON.parse(generatedContent);
    console.log(`✅ 台本生成完了\n`);

    // ========================================
    // Step 7: 簡易度スコア計算
    // ========================================
    console.log('📊 Step 7: 簡易度スコア計算中...');
    const fullScript = parsedScript.full_script || '';
    const simplicityScore = calculateSimplicityScore(fullScript);
    const technicalTerms = detectTechnicalTerms(fullScript);

    console.log(`✅ 簡易度スコア: ${simplicityScore.toFixed(3)}`);
    console.log(`   - 専門用語: ${technicalTerms.length}個（${technicalTerms.join(', ')}）\n`);

    // ========================================
    // Step 8: ベクトル化
    // ========================================
    console.log('🧮 Step 8: ベクトル化中...');
    const embeddings = new OpenAIEmbeddings();
    const embedding = await embeddings.embedSingle(fullScript, 1536);
    console.log(`✅ ベクトル化完了（1536次元）\n`);

    // ========================================
    // Step 9: データベース保存
    // ========================================
    console.log('💾 Step 9: データベース保存中...');

    // company_youtube_shortsに保存
    const { data: savedScript, error: saveError } = await supabaseServiceRole
      .from('company_youtube_shorts')
      .insert({
        fragment_id: postSlug,
        content_type: 'short',
        content_title: postTitle,
        content: fullScript,
        script_title: parsedScript.script?.hook || postTitle,
        script_hook: parsedScript.script?.hook || '',
        script_empathy: parsedScript.script?.empathy || '',
        script_body: JSON.stringify(parsedScript.script?.body || {}),
        script_cta: parsedScript.script?.cta || '',
        script_duration_seconds: parsedScript.metadata?.estimated_duration_seconds || 30,
        visual_instructions: {},
        text_overlays: [],
        background_music_suggestion: 'エネルギッシュなBGM',
        viral_elements: ['バイラルフック', '専門用語ゼロ', 'CTA最適化'],
        virality_score: Math.round(optimizedHook.effectiveness_score * 100),
        target_emotion: 'surprise',
        hook_type: optimizedHook.pattern_name,
        title: postTitle.substring(0, 100),
        description: fullScript.substring(0, 500),
        tags: ['AI', 'ショート', '自動化', targetAudience],
        embedding: `[${embedding.join(',')}]`,
        metadata: {
          version: 'v2.0.0',
          hook_pattern_id: optimizedHook.pattern_id,
          hook_pattern_name: optimizedHook.pattern_name,
          hook_effectiveness_score: optimizedHook.effectiveness_score,
          target_audience: targetAudience,
          cta_type: ctaType,
          rag_search_results: {
            deep_research_count: ragResults.deepResearch.count,
            deep_research_score: ragResults.deepResearch.score,
            scraped_keywords_count: ragResults.scrapedKeywords.count,
            blog_fragments_count: ragResults.blogFragments.count,
            personal_stories_count: ragResults.personalStories.count,
            overall_score: ragResults.overallScore,
            needs_new_research: ragResults.needsNewResearch
          },
          simplicity_score: simplicityScore,
          technical_terms_removed: technicalTerms,
          generated_at: new Date().toISOString(),
          sns_variations: {
            x_twitter: parsedScript.sns_variations?.x_twitter || '',
            threads: parsedScript.sns_variations?.threads || '',
            instagram: parsedScript.sns_variations?.instagram || '',
            linkedin: parsedScript.sns_variations?.linkedin || '',
            tiktok: parsedScript.sns_variations?.tiktok || ''
          }
        }
      })
      .select('id')
      .single();

    if (saveError) {
      console.error('❌ データベース保存エラー:', saveError);
      throw saveError;
    }

    console.log(`✅ データベース保存完了: Script ID ${savedScript.id}\n`);

    // postsテーブルのshortScriptIdを更新
    const { error: updateError } = await supabaseServiceRole
      .from('posts')
      .update({ short_script_id: savedScript.id })
      .eq('id', postId);

    if (updateError) {
      console.error('⚠️  postsテーブル更新エラー:', updateError);
      // エラーでも続行（台本は保存済み）
    } else {
      console.log(`✅ postsテーブル更新完了\n`);
    }

    // ========================================
    // 完了
    // ========================================
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('🎉 ========================================');
    console.log('✅ AIアーキテクト・ショート台本V2 生成完了');
    console.log('========================================');
    console.log(`  Script ID: ${savedScript.id}`);
    console.log(`  フックパターン: ${optimizedHook.pattern_name}`);
    console.log(`  効果スコア: ${(optimizedHook.effectiveness_score * 100).toFixed(0)}%`);
    console.log(`  簡易度スコア: ${simplicityScore.toFixed(3)}`);
    console.log(`  専門用語: ${technicalTerms.length}個`);
    console.log(`  所要時間: ${duration}秒`);
    console.log('========================================\n');

    return NextResponse.json({
      success: true,
      scriptId: savedScript.id,
      aiOptimizationScore: Math.round(optimizedHook.effectiveness_score * 100),
      hookPattern: optimizedHook.pattern_name,
      simplicityScore: parseFloat(simplicityScore.toFixed(3))
    });

  } catch (error: any) {
    console.error('\n❌ ========================================');
    console.error('❌ エラー発生');
    console.error('========================================');
    console.error(error);
    console.error('========================================\n');

    return NextResponse.json({
      success: false,
      error: error.message || '台本生成に失敗しました'
    }, { status: 500 });
  }
}

