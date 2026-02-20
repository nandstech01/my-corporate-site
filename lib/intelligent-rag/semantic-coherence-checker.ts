/**
 * セマンティック整合性チェックシステム
 * GPT-5 mini による智的セマンティック整合性評価
 * Mike King理論準拠の意味的整合性分析
 *
 * @author 株式会社エヌアンドエス
 * @version 2.0.0 - GPT-5 mini本格実装
 */

import OpenAI from 'openai';
import type { RAGContentAnalysis, CoherenceCheckResult } from './types';
import { GPT5_MINI_CONFIG, PROMPT_TEMPLATES, CATEGORY_MAPPINGS } from './config';

export class SemanticCoherenceChecker {
  private openai: OpenAI;
  private usageStats = {
    totalRequests: 0,
    totalTokens: 0,
    costSavings: 0
  };

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not configured');
    }
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * メイン機能: クエリ・カテゴリ・RAG分析結果のセマンティック整合性チェック
   * 3段階アプローチ: 基本検証 → GPT-5 mini AI分析 → フォールバック
   */
  async checkCoherence(params: {
    query: string;
    category: string;
    ragAnalysis: RAGContentAnalysis;
  }): Promise<CoherenceCheckResult> {
    try {
      // Stage 1: 基本検証（高速・APIコール不要）
      const basicResult = this.performBasicValidation(params);

      if (basicResult.score < 0.3) {
        return basicResult;
      }

      // Stage 2: GPT-5 mini AI分析（高精度）
      const aiResult = await this.performAICoherenceCheck(params);
      return aiResult;
    } catch (error) {
      // Stage 3: フォールバック（API障害時）
      console.error('SemanticCoherenceChecker: AI analysis failed, using fallback:', error);
      return this.buildFallbackResult(params);
    }
  }

  /**
   * Stage 1: 基本検証（高速・APIコール不要）
   * criticalスコア(< 0.3)ならGPT APIコールをスキップしてコスト節約
   */
  private performBasicValidation(params: {
    query: string;
    category: string;
    ragAnalysis: RAGContentAnalysis;
  }): CoherenceCheckResult {
    const { query, category, ragAnalysis } = params;
    const issues: string[] = [];
    let score = 0;

    // クエリ↔RAGトピックのキーワード重複チェック
    const queryLower = query.toLowerCase();
    const mainTopics = ragAnalysis.semanticAnalysis.mainTopics;
    const topicOverlap = mainTopics.filter(topic =>
      queryLower.includes(topic.toLowerCase()) ||
      topic.toLowerCase().includes(queryLower.substring(0, 10))
    ).length;
    const topicScore = mainTopics.length > 0
      ? Math.min(topicOverlap / Math.max(mainTopics.length * 0.3, 1), 1.0)
      : 0.5;

    if (topicOverlap === 0 && mainTopics.length > 0) {
      issues.push('クエリとRAGトピック間にキーワード重複がありません');
    }

    // カテゴリ↔RAG業界カテゴリの整合チェック
    const categoryMapping = CATEGORY_MAPPINGS.find(c => c.id === category);
    let categoryScore = 0.5;
    if (categoryMapping) {
      const industryCategories = ragAnalysis.semanticAnalysis.industryCategories;
      const categoryKeywords = categoryMapping.keywords;
      const categoryOverlap = industryCategories.some(ic =>
        categoryKeywords.some(kw =>
          ic.toLowerCase().includes(kw.toLowerCase()) ||
          kw.toLowerCase().includes(ic.toLowerCase())
        )
      );
      categoryScore = categoryOverlap ? 0.8 : 0.4;
      if (!categoryOverlap && industryCategories.length > 0) {
        issues.push('選択カテゴリとRAG業界カテゴリの整合性が低い');
      }
    }

    // contentRichness < 0.3 の場合ペナルティ
    const richness = ragAnalysis.qualityMetrics.contentRichness;
    const richnessPenalty = richness < 0.3 ? 0.3 : 0;
    if (richness < 0.3) {
      issues.push('RAGコンテンツの充実度が低い（contentRichness < 0.3）');
    }

    score = (topicScore * 0.4 + categoryScore * 0.4 + ragAnalysis.semanticAnalysis.topicalCoherence * 0.2) - richnessPenalty;
    score = Math.max(0, Math.min(1, score));

    return {
      score,
      isCoherent: score >= 0.7,
      issues,
      recommendations: issues.length > 0
        ? ['RAGデータの品質向上を推奨', 'より関連性の高いデータソースの追加']
        : [],
      semanticGaps: issues.length > 0
        ? ['クエリとRAGデータ間のセマンティックギャップを検出']
        : [],
      improvementSuggestions: issues.length > 0
        ? ['キーワードマッチングの最適化', 'カテゴリ選択基準の見直し']
        : []
    };
  }

  /**
   * Stage 2: GPT-5 mini AI分析（高精度）
   */
  private async performAICoherenceCheck(params: {
    query: string;
    category: string;
    ragAnalysis: RAGContentAnalysis;
  }): Promise<CoherenceCheckResult> {
    const { query, category, ragAnalysis } = params;

    const analysisInput = JSON.stringify({
      mainTopics: ragAnalysis.semanticAnalysis.mainTopics.slice(0, 5),
      industryCategories: ragAnalysis.semanticAnalysis.industryCategories,
      technicalLevel: ragAnalysis.semanticAnalysis.technicalLevel,
      contentRichness: ragAnalysis.qualityMetrics.contentRichness,
      topicalCoherence: ragAnalysis.semanticAnalysis.topicalCoherence,
      primaryThemes: ragAnalysis.contentThemes.primaryThemes
    });

    const prompt = PROMPT_TEMPLATES.coherenceCheck
      .replace('{query}', query)
      .replace('{category}', category)
      .replace('{analysisResult}', analysisInput);

    const response = await this.openai.chat.completions.create({
      model: GPT5_MINI_CONFIG.model,
      messages: [
        {
          role: 'system',
          content: 'あなたはコンテンツ整合性チェックの専門家です。JSON形式で正確な評価結果を返してください。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: GPT5_MINI_CONFIG.temperature,
      max_completion_tokens: GPT5_MINI_CONFIG.max_tokens
    });

    this.updateUsageStats(response.usage);

    const parsed = this.parseGPTResponse(response.choices[0].message.content || '{}');
    return this.validateAndStructureResult(parsed, params);
  }

  /**
   * GPT応答のJSON解析（フォールバック付きパーサー）
   */
  private parseGPTResponse(content: string): Record<string, unknown> {
    try {
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      return JSON.parse(cleanContent);
    } catch {
      return {};
    }
  }

  /**
   * GPT応答を型安全なCoherenceCheckResultに変換
   */
  private validateAndStructureResult(
    parsed: Record<string, unknown>,
    params: { query: string; category: string; ragAnalysis: RAGContentAnalysis }
  ): CoherenceCheckResult {
    const rawScore = typeof parsed.score === 'number' ? parsed.score
      : typeof parsed.semanticCoherence === 'number' ? parsed.semanticCoherence
      : typeof parsed.coherenceScore === 'number' ? parsed.coherenceScore
      : null;

    if (rawScore === null) {
      return this.buildFallbackResult(params);
    }

    const score = Math.max(0, Math.min(1, rawScore));

    const toStringArray = (val: unknown): string[] => {
      if (Array.isArray(val)) return val.filter((v): v is string => typeof v === 'string');
      return [];
    };

    return {
      score,
      isCoherent: score >= 0.7,
      issues: toStringArray(parsed.issues),
      recommendations: toStringArray(parsed.recommendations),
      semanticGaps: toStringArray(parsed.semanticGaps),
      improvementSuggestions: toStringArray(parsed.improvementSuggestions)
    };
  }

  /**
   * Stage 3: フォールバック（API障害時）
   * qualityMetrics.contentRichness * 0.4 + topicalCoherence * 0.6
   */
  private buildFallbackResult(params: {
    query: string;
    category: string;
    ragAnalysis: RAGContentAnalysis;
  }): CoherenceCheckResult {
    const { ragAnalysis } = params;
    const score = ragAnalysis.qualityMetrics.contentRichness * 0.4 +
      ragAnalysis.semanticAnalysis.topicalCoherence * 0.6;
    const clampedScore = Math.max(0, Math.min(1, score));

    return {
      score: clampedScore,
      isCoherent: clampedScore >= 0.7,
      issues: ['AI分析が利用できないため、簡易評価を使用'],
      recommendations: [
        'RAGデータの品質向上',
        'セマンティック関連性の強化'
      ],
      semanticGaps: [],
      improvementSuggestions: [
        'より関連性の高いRAGデータの追加',
        'キーワードマッチングの最適化'
      ]
    };
  }

  /**
   * 使用統計更新（GPT-5 mini用）
   */
  private updateUsageStats(usage: OpenAI.Completions.CompletionUsage | undefined) {
    if (!usage) return;
    this.usageStats.totalRequests++;
    this.usageStats.totalTokens += (usage.prompt_tokens || 0) + (usage.completion_tokens || 0);

    const gpt5MiniCost = (usage.prompt_tokens || 0) * 0.25 / 1000000 + (usage.completion_tokens || 0) * 2.00 / 1000000;
    const gpt4oCost = (usage.prompt_tokens || 0) * 2.50 / 1000000 + (usage.completion_tokens || 0) * 10.00 / 1000000;
    this.usageStats.costSavings = gpt4oCost > 0 ? ((gpt4oCost - gpt5MiniCost) / gpt4oCost) * 100 : 0;
  }

  getUsageStats() {
    return { ...this.usageStats };
  }
}
