/**
 * プロンプト統合エクスポート
 * 
 * 全てのプロンプトを一箇所から管理・エクスポート
 */

// 共通ルール
export {
  COMMON_RULES,
  HOOK_PATTERNS,
  EMPATHY_PATTERNS,
  BODY_PATTERNS,
  CTA_PATTERNS,
  MODEL_CONFIG,
} from './common-rules';

/**
 * ブランディング：AIアーキテクト
 * 
 * Kenji Haradaは「AIアーキテクト」として、
 * AIエンジニアとしての実装力を持ちながら、
 * 構造設計・情報アーキテクチャの視点で情報を発信します。
 * 
 * - ショート動画：実装パターンの解説（AIエンジニアとしての経験を匂わせる）
 * - 中尺動画：設計思想と実装の統合的解説
 * - 思想RAG：AIアーキテクトの核心的な設計哲学
 */

// YouTube動画プロンプト
export {
  getShortScriptSystemPrompt,
  getShortScriptUserPrompt,
} from './youtube/short-base';

export {
  getMediumScriptSystemPrompt,
  getMediumScriptUserPrompt,
} from './youtube/medium-base';

// AIアーキテクト向けYouTube動画プロンプト
export {
  getArchitectShortScriptSystemPrompt,
  getArchitectShortScriptUserPrompt,
} from './youtube/architect-short-base';

// SNSプロンプト（ドキュメント用）
export { X_TWITTER_RULES } from './sns/x-twitter';
export { LINKEDIN_RULES } from './sns/linkedin';
export { THREADS_RULES } from './sns/threads';
export { INSTAGRAM_RULES } from './sns/instagram';
export { TIKTOK_RULES } from './sns/tiktok';
export { LEMON8_RULES } from './sns/lemon8';

/**
 * プロンプトシステムの概要
 * 
 * ## 構成
 * 
 * ### 1. 共通ルール (common-rules.ts)
 * - データの正確性（最重要）
 * - トーン・スタイル
 * - エンジニア視点
 * - Kenji Harada思想の統合
 * - バイラル要素
 * - モデル設定（GPT-5）
 * 
 * ### 2. YouTube動画プロンプト
 * - ショート動画（30秒）: youtube/short-base.ts
 * - 中尺動画（130秒）: youtube/medium-base.ts
 * 
 * ### 3. SNS最適化ルール
 * - X（Twitter）: 280文字、バズ要素最大化
 * - LinkedIn: プロフェッショナル、ビジネス価値
 * - Threads: 500文字、ストーリー性
 * - Instagram: 2200文字、ビジュアル・エモーショナル
 * - TikTok: 100文字、若年層・キャッチー
 * - Lemon8: 1000文字、実用的・ライフスタイル
 * 
 * ## 使い方
 * 
 * ```typescript
 * import {
 *   getShortScriptSystemPrompt,
 *   getShortScriptUserPrompt,
 *   getMediumScriptSystemPrompt,
 *   getMediumScriptUserPrompt,
 *   MODEL_CONFIG,
 * } from '@/lib/prompts';
 * 
 * // ショート動画台本生成
 * const systemPrompt = getShortScriptSystemPrompt();
 * const userPrompt = getShortScriptUserPrompt(postTitle, postContent);
 * 
 * const completion = await openai.chat.completions.create({
 *   model: MODEL_CONFIG.SCRIPT_MODEL, // 'gpt-5'
 *   messages: [
 *     { role: 'system', content: systemPrompt },
 *     { role: 'user', content: userPrompt }
 *   ],
 *   temperature: MODEL_CONFIG.TEMPERATURE.SHORT, // 0.7
 *   max_tokens: MODEL_CONFIG.MAX_TOKENS.SHORT, // 2000
 * });
 * ```
 * 
 * ## 重要な設計方針
 * 
 * ### データの正確性（最重要）
 * - ブログ記事にない数字・データは絶対に使わない
 * - 記事にある情報のみを使用
 * - 架空の数値や推測値を追加しない
 * 
 * ### Kenji Harada思想の統合
 * - ブログ記事の内容が最優先
 * - 思想は「補強」として自然に織り込む
 * - 過剰な専門用語を避ける
 * - ショート動画: 1つの用語のみ（控えめに）
 * - 中尺動画: 2-3個の用語（適度に）
 * 
 * ### モデル設定
 * - 全ての台本生成でGPT-5を使用
 * - 品質最優先（コストよりも質を重視）
 * 
 * ## メンテナンス
 * 
 * ### プロンプトの追加・修正
 * 1. 該当ファイルを編集
 * 2. このindex.tsにエクスポートを追加
 * 3. route.tsのインポートを更新（必要に応じて）
 * 
 * ### 新しいSNSプラットフォームの追加
 * 1. /lib/prompts/sns/[platform].ts を作成
 * 2. このindex.tsにエクスポートを追加
 * 3. ショート動画プロンプトに統合
 */

