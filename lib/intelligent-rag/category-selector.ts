/**
 * カテゴリ選択システム
 * GPT-5 mini による智的カテゴリマッチング最適化
 * Mike King理論準拠のカテゴリ分類
 * 
 * @author 株式会社エヌアンドエス
 * @version 2.0.0 - GPT-5 mini本格実装
 */

import OpenAI from 'openai';
import type { RAGContentAnalysis, OptimalCategory, CategorySelectionOptions } from './types';
import { CATEGORY_MAPPINGS, GPT5_MINI_CONFIG } from './config';

export class CategorySelector {
  private openai: OpenAI;
  private usageStats = {
    totalRequests: 0,
    accuracyScore: 0,
    costSavings: 0
  };

  constructor() {
    // OpenAI GPT-5 mini初期化
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!
    });
    
    console.log('📂 カテゴリ選択システム初期化完了');
    console.log('⚡ GPT-5 mini採用: 智的マッチング + 85%コスト削減');
  }

  /**
   * メイン機能: RAG分析結果から最適なカテゴリを智的選択
   */
  async selectOptimalCategory(
    analysis: RAGContentAnalysis,
    options?: CategorySelectionOptions
  ): Promise<string> {
    const startTime = Date.now();
    
    try {
      console.log('📂 GPT-5 mini による智的カテゴリ選択開始...');
      
      // 設定準備
      const config = {
        availableCategories: options?.availableCategories || CATEGORY_MAPPINGS.map(c => c.id),
        priorityCategories: options?.priorityCategories || [],
        excludeCategories: options?.excludeCategories || [],
        requireExactMatch: options?.requireExactMatch || false,
        allowMultipleCategories: options?.allowMultipleCategories || false
      };

      // 利用可能カテゴリのフィルタリング
      const filteredCategories = this.filterAvailableCategories(config);
      
             if (filteredCategories.length === 0) {
         console.warn('⚠️ 利用可能なカテゴリがありません');
         return 'ai-basics'; // デフォルト
       }

      // 基本マッチング（高速処理用）
      const basicMatch = this.performBasicMatching(analysis, filteredCategories);
      
      // 高精度が必要な場合のみGPT-5 mini使用
      if (basicMatch.confidence >= 0.8) {
        console.log(`📂 高信頼度マッチング: ${basicMatch.category} (信頼度: ${basicMatch.confidence.toFixed(2)})`);
        return basicMatch.category;
      }

      // GPT-5 mini による詳細分析
      const aiCategoryResult = await this.performAICategorySelection(analysis, filteredCategories);
      
      const processingTime = Date.now() - startTime;
      
      console.log(`✅ 智的カテゴリ選択完了 (${processingTime}ms)`);
      console.log(`📂 選択カテゴリ: ${aiCategoryResult.bestMatch}`);
      console.log(`💰 コスト削減: ${this.usageStats.costSavings.toFixed(1)}%`);
      
      return aiCategoryResult.bestMatch;

    } catch (error) {
      console.error('❌ カテゴリ選択エラー:', error);
      
      // フォールバック: 基本マッチング
      return this.performFallbackSelection(analysis);
    }
  }

  /**
   * 利用可能カテゴリのフィルタリング
   */
  private filterAvailableCategories(config: Required<CategorySelectionOptions>) {
    let categories = CATEGORY_MAPPINGS;

    // 利用可能カテゴリで絞り込み
    if (config.availableCategories.length > 0) {
      categories = categories.filter(cat => config.availableCategories.includes(cat.id));
    }

    // 除外カテゴリを削除
    if (config.excludeCategories.length > 0) {
      categories = categories.filter(cat => !config.excludeCategories.includes(cat.id));
    }

    return categories;
  }

  /**
   * 基本マッチング（高速処理）
   */
  private performBasicMatching(analysis: RAGContentAnalysis, categories: typeof CATEGORY_MAPPINGS) {
    let bestMatch = { category: 'ai-basics', confidence: 0 };

    for (const category of categories) {
      let score = 0;
      let matches = 0;

      // 主要トピックとのマッチング
      for (const topic of analysis.semanticAnalysis.mainTopics) {
        for (const keyword of category.keywords) {
          if (topic.toLowerCase().includes(keyword.toLowerCase()) ||
              keyword.toLowerCase().includes(topic.toLowerCase())) {
            score += 0.3;
            matches++;
          }
        }
      }

      // 業界カテゴリとのマッチング
      for (const industryCategory of analysis.semanticAnalysis.industryCategories) {
        for (const keyword of category.keywords) {
          if (industryCategory.toLowerCase().includes(keyword.toLowerCase())) {
            score += 0.2;
            matches++;
          }
        }
      }

      // 技術概念とのマッチング
      for (const concept of analysis.contentThemes.technicalConcepts) {
        for (const keyword of category.keywords) {
          if (concept.toLowerCase().includes(keyword.toLowerCase())) {
            score += 0.1;
            matches++;
          }
        }
      }

      // 技術レベルマッチング
      const levelDiff = Math.abs(analysis.semanticAnalysis.technicalLevel - category.technicalLevel);
      const levelScore = Math.max(0, (10 - levelDiff) / 10) * 0.2;
      score += levelScore;

      // ビジネス価値考慮
      score += (category.businessValue / 10) * 0.1;

      // 正規化
      const confidence = Math.min(1.0, score);
      
      if (confidence > bestMatch.confidence) {
        bestMatch = { category: category.id, confidence };
      }
    }

    return bestMatch;
  }

  /**
   * GPT-5 mini による高精度カテゴリ選択
   */
  private async performAICategorySelection(
    analysis: RAGContentAnalysis, 
    categories: typeof CATEGORY_MAPPINGS
  ): Promise<OptimalCategory> {
    try {
      // 分析データの準備
      const analysisInput = this.prepareAnalysisForAI(analysis);
      const categoriesInput = this.prepareCategoriesForAI(categories);

      // GPT-5 mini プロンプト構築
      const prompt = `
以下のRAG分析結果に基づいて、最適なカテゴリを選択してください。

【RAG分析結果】
${analysisInput}

【利用可能カテゴリ】
${categoriesInput}

【選択基準】
1. 技術レベルの適合性
2. ビジネス価値の整合性
3. キーワードマッチング度
4. コンテンツテーマとの関連性
5. Mike King理論準拠のレリバンスエンジニアリング最適化

【出力形式】
以下のJSON形式で回答してください：
{
  "bestMatch": "最適カテゴリID",
  "secondaryMatches": ["次点カテゴリID1", "次点カテゴリID2"],
  "categoryScore": {
    "カテゴリID1": 0.95,
    "カテゴリID2": 0.87
  },
  "confidenceLevel": 0.92,
  "reasoning": "選択理由の詳細説明"
}
`;

      // GPT-5 mini API呼び出し
      const response = await this.openai.chat.completions.create({
        model: GPT5_MINI_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: 'あなたは世界最高水準のコンテンツカテゴリ分類エキスパートです。Mike King理論に基づくレリバンスエンジニアリングの専門家として、最適なカテゴリを選択してください。JSON形式で正確に回答してください。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 1.0, // GPT-5 miniはデフォルト値(1.0)のみサポート
        max_completion_tokens: 2000
        // top_p: GPT-5 miniではサポートされていません
      });

      // 使用統計更新
      this.updateUsageStats(response.usage);

      // 応答解析
      const categoryResult = this.parseCategoryResponse(response.choices[0].message.content || '{}');
      
      // 結果検証
      return this.validateCategoryResult(categoryResult, categories);

    } catch (error) {
      console.error('❌ AI カテゴリ選択エラー:', error);
      
      // フォールバック
      const basicMatch = this.performBasicMatching(analysis, categories);
      return {
        bestMatch: basicMatch.category,
        secondaryMatches: [],
        categoryScore: { [basicMatch.category]: basicMatch.confidence },
        confidenceLevel: basicMatch.confidence,
        reasoning: 'フォールバック: 基本マッチング結果'
      };
    }
  }

  /**
   * 分析データのAI用整形
   */
  private prepareAnalysisForAI(analysis: RAGContentAnalysis): string {
    return JSON.stringify({
      主要トピック: analysis.semanticAnalysis.mainTopics.slice(0, 5),
      業界カテゴリ: analysis.semanticAnalysis.industryCategories,
      技術レベル: analysis.semanticAnalysis.technicalLevel,
      コンテンツテーマ: analysis.contentThemes.primaryThemes,
      技術概念: analysis.contentThemes.technicalConcepts.slice(0, 10),
      品質指標: {
        充実度: Math.round(analysis.qualityMetrics.contentRichness * 100),
        トピック網羅度: Math.round(analysis.qualityMetrics.topicalCoverage * 100),
        信頼性: Math.round(analysis.qualityMetrics.credibilityScore * 100)
      }
    }, null, 2);
  }

  /**
   * カテゴリデータのAI用整形
   */
  private prepareCategoriesForAI(categories: typeof CATEGORY_MAPPINGS): string {
    return categories.map(cat => ({
      id: cat.id,
      名前: cat.name,
      説明: cat.description,
      キーワード: cat.keywords,
      技術レベル: cat.technicalLevel,
      ビジネス価値: cat.businessValue,
      検索ボリューム: cat.searchVolume,
      関連カテゴリ: cat.relatedCategories
    })).map(cat => JSON.stringify(cat)).join('\n\n');
  }

  /**
   * GPT-5 mini応答の解析
   */
  private parseCategoryResponse(content: string): any {
    try {
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      return JSON.parse(cleanContent);
    } catch (error) {
      console.warn('⚠️ GPT-5 mini応答の解析に失敗:', error);
      return {};
    }
  }

  /**
   * カテゴリ結果の検証
   */
  private validateCategoryResult(result: any, categories: typeof CATEGORY_MAPPINGS): OptimalCategory {
    const validCategoryIds = categories.map(c => c.id);
    
         // bestMatchの検証
     if (!result.bestMatch || !validCategoryIds.includes(result.bestMatch)) {
       result.bestMatch = 'ai-basics'; // デフォルト
     }

    // secondaryMatchesの検証
    if (!Array.isArray(result.secondaryMatches)) {
      result.secondaryMatches = [];
    } else {
      result.secondaryMatches = result.secondaryMatches.filter((id: string) => 
        validCategoryIds.includes(id)
      );
    }

    return {
      bestMatch: result.bestMatch,
      secondaryMatches: result.secondaryMatches,
      categoryScore: result.categoryScore || {},
      confidenceLevel: Math.min(1.0, Math.max(0.0, result.confidenceLevel || 0.5)),
      reasoning: result.reasoning || '自動選択'
    };
  }

  /**
   * フォールバック選択
   */
  private performFallbackSelection(analysis: RAGContentAnalysis): string {
    console.log('⚠️ フォールバック: 基本カテゴリ選択を実行');
    
    // 技術レベルベースの選択（実際のDBカテゴリに基づく）
    const techLevel = analysis.semanticAnalysis.technicalLevel;
    
    if (techLevel >= 8) {
      return 'it-software'; // 高技術レベル
    } else if (techLevel >= 6) {
      return 'ai-tools'; // 中技術レベル
    } else if (techLevel >= 4) {
      return 'chatgpt-usage'; // 中低技術レベル
    } else {
      return 'ai-basics'; // 低技術レベル
    }
  }

  /**
   * 使用統計更新
   */
  private updateUsageStats(usage: any) {
    if (usage) {
      this.usageStats.totalRequests++;
      
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