/**
 * 最適クエリ生成システム
 * GPT-5 mini による智的検索クエリ最適化
 * Mike King理論準拠のレリバンスエンジニアリング
 * 
 * @author 株式会社エヌアンドエス
 * @version 2.0.0 - GPT-5 mini本格実装
 */

import OpenAI from 'openai';
import type { RAGContentAnalysis, OptimalQuery, QueryGenerationOptions } from './types';
import { GPT5_MINI_CONFIG, PROMPT_TEMPLATES } from './config';

export class OptimalQueryGenerator {
  private openai: OpenAI;
  private usageStats = {
    totalRequests: 0,
    totalTokens: 0,
    costSavings: 0
  };

  constructor() {
    // OpenAI GPT-5 mini初期化
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!
    });
    
    console.log('🔍 最適クエリ生成システム初期化完了');
    console.log('⚡ GPT-5 mini採用: 高精度クエリ生成 + 85%コスト削減');
  }

  /**
   * メイン機能: RAG分析結果から最適な検索クエリを生成
   */
  async generateOptimalQuery(
    analysis: RAGContentAnalysis,
    options?: QueryGenerationOptions
  ): Promise<string> {
    const startTime = Date.now();
    
    try {
      console.log('🔍 GPT-5 mini による最適クエリ生成開始...');
      
      // デフォルトオプション設定
      const config = {
        targetAudience: options?.targetAudience || 'general',
        contentStyle: options?.contentStyle || 'business',
        primaryGoal: options?.primaryGoal || 'education',
        maxQueryLength: options?.maxQueryLength || 80,
        includeKeywords: options?.includeKeywords || [],
        excludeKeywords: options?.excludeKeywords || []
      };

      // RAG分析結果を要約して入力データを作成
      const analysisInput = this.prepareAnalysisInput(analysis);
      
      // GPT-5 mini プロンプト生成
      const prompt = this.buildQueryGenerationPrompt(analysisInput, config);
      
      // GPT-5 mini API呼び出し
      const response = await this.openai.chat.completions.create({
        model: GPT5_MINI_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: `あなたは世界最高水準の検索クエリ最適化エキスパートです。
Mike King理論に基づくレリバンスエンジニアリングの専門家として、
AI検索エンジン（ChatGPT、Perplexity、Claude）に最適化された記事タイトルを生成してください。

要件:
- 日本語読者向け
- ${config.maxQueryLength}文字以内
- ${config.targetAudience}レベルの読者対象
- ${config.contentStyle}スタイル
- ${config.primaryGoal}を目的とした内容
- JSON形式で回答`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: GPT5_MINI_CONFIG.temperature,
        max_completion_tokens: GPT5_MINI_CONFIG.max_tokens
        // top_p: GPT-5 miniではサポートされていません
      });

      // 使用統計更新
      this.updateUsageStats(response.usage);

      // GPT-5 mini応答解析
      const queryResult = this.parseQueryResponse(response.choices[0].message.content || '{}');
      
      // 品質チェック
      const finalQuery = this.validateAndOptimizeQuery(queryResult, config, analysis);
      
      const processingTime = Date.now() - startTime;
      
      console.log(`✅ 最適クエリ生成完了 (${processingTime}ms)`);
      console.log(`📝 生成クエリ: "${finalQuery}"`);
      console.log(`💰 コスト削減: ${this.usageStats.costSavings.toFixed(1)}%`);
      
      return finalQuery;

    } catch (error) {
      console.error('❌ 最適クエリ生成エラー:', error);
      
      // フォールバック: 分析結果ベースの簡易生成
      return this.generateFallbackQuery(analysis);
    }
  }

  /**
   * RAG分析結果を入力用に整形
   */
  private prepareAnalysisInput(analysis: RAGContentAnalysis): string {
    const input = {
      主要トピック: analysis.semanticAnalysis.mainTopics.slice(0, 5),
      業界カテゴリ: analysis.semanticAnalysis.industryCategories.slice(0, 3),
      技術レベル: analysis.semanticAnalysis.technicalLevel,
      コンテンツテーマ: {
        プライマリ: analysis.contentThemes.primaryThemes,
        セカンダリ: analysis.contentThemes.secondaryThemes,
        技術概念: analysis.contentThemes.technicalConcepts.slice(0, 8)
      },
      品質メトリクス: {
        コンテンツ充実度: Math.round(analysis.qualityMetrics.contentRichness * 100),
        信頼性スコア: Math.round(analysis.qualityMetrics.credibilityScore * 100)
      },
      データ統計: {
        総データ数: analysis.dataStatistics.totalItems,
        平均コンテンツ長: analysis.dataStatistics.averageContentLength,
        キーワード多様性: analysis.dataStatistics.keywordDiversity
      }
    };

    return JSON.stringify(input, null, 2);
  }

  /**
   * クエリ生成プロンプト構築
   */
  private buildQueryGenerationPrompt(
    analysisInput: string, 
    config: Required<QueryGenerationOptions>
  ): string {
    return `
以下のRAG分析結果に基づいて、最適な記事タイトル（検索クエリ）を生成してください。

【RAG分析結果】
${analysisInput}

【生成要件】
- 対象読者: ${config.targetAudience}
- コンテンツスタイル: ${config.contentStyle}
- 主要目的: ${config.primaryGoal}
- 最大文字数: ${config.maxQueryLength}文字
${config.includeKeywords.length > 0 ? `- 含めるキーワード: ${config.includeKeywords.join(', ')}` : ''}
${config.excludeKeywords.length > 0 ? `- 除外キーワード: ${config.excludeKeywords.join(', ')}` : ''}

【出力形式】
以下のJSON形式で回答してください：
{
  "primaryQuery": "最適なメインクエリ",
  "alternatives": ["代替クエリ1", "代替クエリ2", "代替クエリ3"],
  "keywords": ["関連キーワード1", "関連キーワード2"],
  "reasoning": "選択理由の説明",
  "searchIntent": "informational/transactional/navigational/commercial",
  "difficultyScore": 1-10の数値
}
`;
  }

  /**
   * GPT-5 mini応答の解析
   */
  private parseQueryResponse(content: string): any {
    try {
      // JSONマーカーを除去
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const parsed = JSON.parse(cleanContent);
      
      // 必須フィールドの確認
      if (!parsed.primaryQuery || typeof parsed.primaryQuery !== 'string') {
        throw new Error('primaryQueryが不正です');
      }
      
      return parsed;
      
    } catch (error) {
      console.warn('⚠️ GPT-5 mini応答の解析に失敗:', error);
      return {};
    }
  }

  /**
   * クエリの品質チェックと最適化
   */
  private validateAndOptimizeQuery(
    queryResult: any,
    config: Required<QueryGenerationOptions>,
    analysis: RAGContentAnalysis
  ): string {
    if (!queryResult.primaryQuery) {
      return this.generateFallbackQuery(analysis);
    }

    let query = queryResult.primaryQuery;

    // 文字数チェック
    if (query.length > config.maxQueryLength) {
      // 代替クエリから適切な長さのものを選択
      if (queryResult.alternatives && Array.isArray(queryResult.alternatives)) {
        for (const alt of queryResult.alternatives) {
          if (alt.length <= config.maxQueryLength) {
            query = alt;
            break;
          }
        }
      }
      
      // それでも長い場合は短縮
      if (query.length > config.maxQueryLength) {
        query = query.substring(0, config.maxQueryLength - 3) + '...';
      }
    }

    // 必須キーワードの確認
    if (config.includeKeywords.length > 0) {
      const hasRequiredKeywords = config.includeKeywords.some(keyword =>
        query.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (!hasRequiredKeywords) {
        // 必須キーワードを含む代替クエリを検索
        if (queryResult.alternatives && Array.isArray(queryResult.alternatives)) {
          for (const alt of queryResult.alternatives) {
            if (config.includeKeywords.some(keyword =>
              alt.toLowerCase().includes(keyword.toLowerCase())
            )) {
              query = alt;
              break;
            }
          }
        }
      }
    }

    return query;
  }

  /**
   * フォールバック: 簡易クエリ生成
   */
  private generateFallbackQuery(analysis: RAGContentAnalysis): string {
    console.log('⚠️ フォールバック: 簡易クエリ生成を実行');
    
    const mainTopics = analysis.semanticAnalysis.mainTopics;
    
    if (mainTopics.length > 0) {
      const primaryTopic = mainTopics[0];
      const year = new Date().getFullYear();
      
      // 技術レベルに応じた表現調整
      const techLevel = analysis.semanticAnalysis.technicalLevel;
      if (techLevel >= 8) {
        return `${primaryTopic}の実装方法と最新技術動向${year}`;
      } else if (techLevel >= 6) {
        return `${primaryTopic}の活用法と効果的な導入方法`;
      } else {
        return `${primaryTopic}とは？基本から分かる活用ガイド`;
      }
    }
    
    return 'AI技術の最新動向と実践的な活用方法';
  }

  /**
   * 使用統計更新（GPT-5 mini用）
   */
  private updateUsageStats(usage: any) {
    if (usage) {
      this.usageStats.totalRequests++;
      this.usageStats.totalTokens += (usage.prompt_tokens || 0) + (usage.completion_tokens || 0);
      
      // GPT-4oとの比較でコスト削減率計算
      const gpt5MiniCost = (usage.prompt_tokens || 0) * 0.25 / 1000000 + (usage.completion_tokens || 0) * 2.00 / 1000000;
      const gpt4oCost = (usage.prompt_tokens || 0) * 2.50 / 1000000 + (usage.completion_tokens || 0) * 10.00 / 1000000;
      
      this.usageStats.costSavings = ((gpt4oCost - gpt5MiniCost) / gpt4oCost) * 100;
    }
  }

  /**
   * 使用統計取得
   */
  getUsageStats() {
    return { ...this.usageStats };
  }
} 