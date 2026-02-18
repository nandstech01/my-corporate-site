/**
 * フック最適化エンジン
 * 
 * ブログ記事とディープリサーチから最適なフックパターンを選択し、
 * バイラル性の高いフックを生成する
 * 
 * @created 2025-12-12
 * @version 1.0.0
 */

import OpenAI from 'openai';
import { VIRAL_HOOK_PATTERNS, type HookPattern } from './hook-templates';
import { supabase } from '@/lib/supabase/supabase';

export interface HookGenerationInput {
  blogTitle: string;
  blogContent: string;
  deepResearchTopic: string;
  deepResearchContent: string;
  targetAudience: 'general' | 'developer' | 'architect';
}

export interface GeneratedHook {
  hook_text: string;
  pattern_id: string;
  pattern_name: string;
  effectiveness_score: number;
  rationale: string;
}

/**
 * ブログトピックからターゲットオーディエンスを自動検出
 */
export async function detectTargetAudience(
  blogTitle: string,
  blogContent: string
): Promise<'general' | 'developer' | 'architect'> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `以下のブログ記事のターゲットオーディエンスを判定してください。

ブログタイトル: ${blogTitle}
ブログ内容（抜粋）: ${blogContent.substring(0, 500)}

判定基準:
- "general": 一般層・ビジネス層（経営者、マーケター、事業主など）
- "developer": 実装者層（エンジニア、デザイナー、実務担当者など）
- "architect": 上級者層（AIアーキテクト、CTOクラス、技術リーダーなど）

必ず "general", "developer", "architect" のいずれか1つだけを返してください。`;

  const response = await openai.chat.completions.create({
    model: 'gpt-5-mini',
    messages: [
      {
        role: 'system',
        content: 'あなたはターゲットオーディエンス分析の専門家です。ブログ記事を読んで、最適なターゲット層を判定してください。'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    max_completion_tokens: 300
  });

  const result = response.choices[0].message.content?.trim().toLowerCase() || 'general';
  
  if (result.includes('developer')) return 'developer';
  if (result.includes('architect')) return 'architect';
  return 'general';
}

/**
 * 最適なフックパターンを選択
 */
export async function selectBestHookPattern(
  input: HookGenerationInput
): Promise<HookPattern> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // ターゲットオーディエンスに合ったパターンを取得
  const candidatePatterns = VIRAL_HOOK_PATTERNS.filter(
    pattern => 
      pattern.target_audience === input.targetAudience || 
      pattern.target_audience === 'all'
  );

  // 効果スコア順にソート
  candidatePatterns.sort((a, b) => b.effectiveness_score - a.effectiveness_score);

  // Top 10パターンを候補にする
  const topPatterns = candidatePatterns.slice(0, 10);

  const prompt = `以下のブログ記事とディープリサーチから、最適なフックパターンを選択してください。

【ブログ記事】
タイトル: ${input.blogTitle}
内容（抜粋）: ${input.blogContent.substring(0, 300)}

【ディープリサーチ】
トピック: ${input.deepResearchTopic}
内容（抜粋）: ${input.deepResearchContent.substring(0, 300)}

【ターゲット層】
${input.targetAudience === 'general' ? '一般層・ビジネス層' : input.targetAudience === 'developer' ? '実装者層・エンジニア' : '上級者層・AIアーキテクト'}

【候補パターン】
${topPatterns.map((p, i) => `${i + 1}. ${p.name} (${p.id})
   テンプレート: ${p.template}
   例: ${p.example}
   効果スコア: ${p.effectiveness_score}`).join('\n\n')}

最適なパターンのIDを1つだけ返してください（例: shock-mrbeast-challenge）`;

  const response = await openai.chat.completions.create({
    model: 'gpt-5-mini',
    messages: [
      {
        role: 'system',
        content: 'あなたはバイラルコンテンツの専門家です。記事内容に最も合ったフックパターンを選択してください。'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    max_completion_tokens: 500
  });

  const selectedId = response.choices[0].message.content?.trim() || topPatterns[0].id;
  
  // 選択されたパターンを取得
  const selectedPattern = topPatterns.find(p => selectedId.includes(p.id)) || topPatterns[0];
  
  return selectedPattern;
}

/**
 * フックパターンの変数を抽出
 */
export async function extractHookVariables(
  pattern: HookPattern,
  input: HookGenerationInput
): Promise<Record<string, string>> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `以下の情報から、フックパターンの変数を抽出してください。

【フックパターン】
名前: ${pattern.name}
テンプレート: ${pattern.template}
変数: ${pattern.variables.join(', ')}
例: ${pattern.example}

【ブログ記事】
タイトル: ${input.blogTitle}
内容（抜粋）: ${input.blogContent.substring(0, 300)}

【ディープリサーチ】
トピック: ${input.deepResearchTopic}
内容（抜粋）: ${input.deepResearchContent.substring(0, 500)}

各変数に最適な値を抽出してください。
必ずJSON形式で返してください: { "変数名": "値", ... }`;

  const response = await openai.chat.completions.create({
    model: 'gpt-5.2',
    messages: [
      {
        role: 'system',
        content: 'あなたはバイラルフック生成の専門家です。記事からフックパターンの変数を抽出してください。'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    response_format: { type: 'json_object' },
    max_completion_tokens: 1000
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');
  return result;
}

/**
 * フックテキストを生成
 */
export async function generateHookText(
  pattern: HookPattern,
  variables: Record<string, string>
): Promise<string> {
  let hookText = pattern.template;
  
  // 変数を置き換え
  for (const [key, value] of Object.entries(variables)) {
    hookText = hookText.replace(`{${key}}`, value);
  }
  
  // GPT-4oで自然な日本語に最適化
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `以下のフックテキストを、より自然でバイラル性の高い日本語に最適化してください。

元のフック: ${hookText}
パターン: ${pattern.name}
効果スコア: ${pattern.effectiveness_score}

要件:
1. 30文字以内
2. 中学生でも理解できる
3. 最初の3秒で興味を引く
4. 専門用語は使わない
5. 感情を刺激する

最適化されたフックテキストのみを返してください（説明不要）。`;

  const response = await openai.chat.completions.create({
    model: 'gpt-5.2',
    messages: [
      {
        role: 'system',
        content: 'あなたはバイラルフック最適化の専門家です。YouTubeショートで最高の視聴維持率を達成するフックを生成してください。'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    max_completion_tokens: 500
  });

  const optimizedHook = response.choices[0].message.content?.trim() || hookText;
  return optimizedHook;
}

/**
 * メイン関数：最適化されたフックを生成
 */
export async function generateOptimizedHook(
  input: HookGenerationInput
): Promise<GeneratedHook> {
  console.log('🎣 フック最適化開始...');

  // 1. 最適なフックパターンを選択
  console.log('1️⃣ フックパターン選択中...');
  const selectedPattern = await selectBestHookPattern(input);
  console.log(`✅ 選択されたパターン: ${selectedPattern.name} (${selectedPattern.id})`);

  // 2. 変数を抽出
  console.log('2️⃣ 変数抽出中...');
  const variables = await extractHookVariables(selectedPattern, input);
  console.log(`✅ 抽出された変数:`, variables);

  // 3. フックテキストを生成
  console.log('3️⃣ フックテキスト生成中...');
  const hookText = await generateHookText(selectedPattern, variables);
  console.log(`✅ 生成されたフック: ${hookText}`);

  // 4. 結果を返す
  return {
    hook_text: hookText,
    pattern_id: selectedPattern.id,
    pattern_name: selectedPattern.name,
    effectiveness_score: selectedPattern.effectiveness_score,
    rationale: `${selectedPattern.name}パターンを使用。${selectedPattern.description}。効果スコア: ${selectedPattern.effectiveness_score * 100}%`
  };
}

/**
 * 複数のフック候補を生成（A/Bテスト用）
 */
export async function generateMultipleHooks(
  input: HookGenerationInput,
  count: number = 3
): Promise<GeneratedHook[]> {
  const hooks: GeneratedHook[] = [];

  // ターゲットオーディエンスに合ったパターンを取得
  const candidatePatterns = VIRAL_HOOK_PATTERNS.filter(
    pattern => 
      pattern.target_audience === input.targetAudience || 
      pattern.target_audience === 'all'
  );

  // 効果スコア順にソート
  candidatePatterns.sort((a, b) => b.effectiveness_score - a.effectiveness_score);

  // Top N パターンで生成
  for (let i = 0; i < Math.min(count, candidatePatterns.length); i++) {
    const pattern = candidatePatterns[i];
    
    try {
      const variables = await extractHookVariables(pattern, input);
      const hookText = await generateHookText(pattern, variables);
      
      hooks.push({
        hook_text: hookText,
        pattern_id: pattern.id,
        pattern_name: pattern.name,
        effectiveness_score: pattern.effectiveness_score,
        rationale: pattern.description
      });
    } catch (error) {
      console.error(`フック生成エラー (パターン: ${pattern.id}):`, error);
    }
  }

  return hooks;
}

/**
 * フックパターンをRAGテーブルに保存
 */
export async function saveHookPatternsToRAG(): Promise<void> {

  console.log('💾 フックパターンをRAGに保存中...');

  for (const pattern of VIRAL_HOOK_PATTERNS) {
    // 既存のパターンをチェック
    const { data: existing } = await supabase
      .from('viral_hook_patterns')
      .select('pattern_id')
      .eq('pattern_id', pattern.id)
      .single();

    if (existing) {
      console.log(`⏭️  ${pattern.id} は既に存在するのでスキップ`);
      continue;
    }

    // 新規パターンを挿入
    const { error } = await supabase
      .from('viral_hook_patterns')
      .insert({
        pattern_id: pattern.id,
        name: pattern.name,
        type: pattern.type,
        template: pattern.template,
        variables: pattern.variables,
        effectiveness_score: pattern.effectiveness_score,
        target_audience: pattern.target_audience,
        description: pattern.description,
        example: pattern.example,
        source: pattern.source,
        use_cases: pattern.use_cases,
      });

    if (error) {
      console.error(`❌ ${pattern.id} の保存エラー:`, error);
    } else {
      console.log(`✅ ${pattern.id} を保存`);
    }
  }

  console.log('✅ フックパターンの保存完了');
}

