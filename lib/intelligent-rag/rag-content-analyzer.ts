/**
 * RAG内容智的分析システム
 * GPT-5 mini採用によるコスト最適化 + 高精度分析
 * 
 * @description
 * 既存のRAGデータを分析して、最適な記事生成パラメータを智的に決定
 * 既存システムには一切影響を与えない独立実装
 * 
 * @author 株式会社エヌアンドエス
 * @version 1.0.0
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import type {
  RAGContentAnalysis,
  TrendRAGContent,
  YouTubeRAGContent,
  FragmentRAGContent,
  RAGAnalysisOptions,
  SemanticAnalysis,
  IntelligentRAGError
} from './types';
import { 
  INTELLIGENT_RAG_CONFIG, 
  GPT5_MINI_CONFIG, 
  PROMPT_TEMPLATES,
  ERROR_MESSAGES 
} from './config';

export class RAGContentAnalyzer {
  private supabase;
  private openai: OpenAI;
  private usageStats = {
    totalRequests: 0,
    totalTokens: 0,
    totalCost: 0,
    costSavings: 0
  };

  constructor() {
    // Supabase接続（読み取り専用）
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    this.supabase = createClient(supabaseUrl, supabaseKey);

    // OpenAI GPT-5 mini設定
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!
    });

    console.log('🧠 RAG内容分析システム初期化完了');
    console.log('⚡ GPT-5 mini使用: 85%コスト削減 + 高精度分析');
  }

  /**
   * メイン機能: RAGデータ内容の包括分析
   */
  async analyzeRAGContent(options: RAGAnalysisOptions = {}): Promise<RAGContentAnalysis> {
    const startTime = Date.now();
    
    try {
      console.log('📊 RAGデータ分析開始...');
      
      // デフォルトオプション設定
      const config = {
        includeTrend: options.includeTrend ?? true,
        includeYouTube: options.includeYouTube ?? true,
        includeFragment: options.includeFragment ?? true,
        maxItemsPerSource: options.maxItemsPerSource ?? 10,
        minimumContentLength: options.minimumContentLength ?? 50,
        enableDeepAnalysis: options.enableDeepAnalysis ?? true,
        prioritizeRecent: options.prioritizeRecent ?? true
      };

      // 1. RAGデータ取得（既存システムから安全に読み取り）
      console.log('🔍 RAGデータ取得中...');
      const ragData = await this.fetchRAGData(config);

      // 2. データ統計計算
      console.log('📈 データ統計計算中...');
      const dataStatistics = this.calculateDataStatistics(ragData);

      // 3. GPT-5 mini によるセマンティック分析
      console.log('🧠 GPT-5 mini セマンティック分析中...');
      const semanticAnalysis = await this.performSemanticAnalysis(ragData);

      // 4. コンテンツテーマ抽出
      console.log('🏷️ コンテンツテーマ抽出中...');
      const contentThemes = await this.extractContentThemes(ragData, semanticAnalysis);

      // 5. 品質メトリクス計算
      console.log('⭐ 品質メトリクス計算中...');
      const qualityMetrics = this.calculateQualityMetrics(ragData, semanticAnalysis);

      // 6. Mike King理論準拠度評価
      console.log('👑 Mike King理論準拠度評価中...');
      const mikeKingCompliance = this.evaluateMikeKingCompliance(ragData, semanticAnalysis);

      const processingTime = Date.now() - startTime;
      
      console.log(`✅ RAGデータ分析完了 (${processingTime}ms)`);
      console.log(`📊 総データ数: ${dataStatistics.totalItems}件`);
      console.log(`💰 コスト削減: ${this.usageStats.costSavings.toFixed(2)}%`);

      return {
        ragContent: ragData,
        dataStatistics,
        semanticAnalysis,
        contentThemes,
        qualityMetrics,
        mikeKingCompliance
      };

    } catch (error) {
      console.error('❌ RAGデータ分析エラー:', error);
      throw this.createIntelligentRAGError(
        'ANALYSIS_FAILED',
        'RAGデータ分析に失敗しました',
        error,
        'analyzer'
      );
    }
  }

  /**
   * RAGデータの安全な取得（既存システムから読み取り専用）
   */
  private async fetchRAGData(config: Required<RAGAnalysisOptions>): Promise<{
    trend: TrendRAGContent[];
    youtube: YouTubeRAGContent[];
    fragment: FragmentRAGContent[];
  }> {
    const ragData = {
      trend: [] as TrendRAGContent[],
      youtube: [] as YouTubeRAGContent[],
      fragment: [] as FragmentRAGContent[]
    };

    try {
      // Trend RAGデータ取得
      if (config.includeTrend) {
        const { data: trendData, error: trendError } = await this.supabase
          .from('trend_vectors')
          .select('id, trend_topic, content, source, trend_date, keywords, created_at')
          .gte('created_at', config.prioritizeRecent ? 
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() : 
            '2020-01-01'
          )
          .order('created_at', { ascending: false })
          .limit(config.maxItemsPerSource);

        if (trendError) {
          console.warn('⚠️ Trend RAGデータ取得エラー:', trendError);
        } else {
          ragData.trend = (trendData || [])
            .filter(item => item.content && item.content.length >= config.minimumContentLength)
            .map(item => ({
              ...item,
              keywords: Array.isArray(item.keywords) ? item.keywords : []
            }));
          console.log(`📈 Trend RAGデータ: ${ragData.trend.length}件取得`);
        }
      }

      // YouTube RAGデータ取得
      if (config.includeYouTube) {
        const { data: youtubeData, error: youtubeError } = await this.supabase
          .from('youtube_vectors')
          .select('id, video_title, content, channel_name, video_url, keywords, created_at')
          .gte('created_at', config.prioritizeRecent ? 
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() : 
            '2020-01-01'
          )
          .order('created_at', { ascending: false })
          .limit(config.maxItemsPerSource);

        if (youtubeError) {
          console.warn('⚠️ YouTube RAGデータ取得エラー:', youtubeError);
        } else {
          ragData.youtube = (youtubeData || [])
            .filter(item => item.content && item.content.length >= config.minimumContentLength)
            .map(item => ({
              ...item,
              keywords: Array.isArray(item.keywords) ? item.keywords : []
            }));
          console.log(`🎥 YouTube RAGデータ: ${ragData.youtube.length}件取得`);
        }
      }

      // Fragment RAGデータ取得
      if (config.includeFragment) {
        const { data: fragmentData, error: fragmentError } = await this.supabase
          .from('fragment_vectors')
          .select('id, fragment_id, content_title, content, content_type, category, complete_uri, page_path, created_at')
          .order('created_at', { ascending: false })
          .limit(config.maxItemsPerSource);

        if (fragmentError) {
          console.warn('⚠️ Fragment RAGデータ取得エラー:', fragmentError);
        } else {
          ragData.fragment = (fragmentData || [])
            .filter(item => item.content && item.content.length >= config.minimumContentLength);
          console.log(`📋 Fragment RAGデータ: ${ragData.fragment.length}件取得`);
        }
      }

      return ragData;

    } catch (error) {
      console.error('❌ RAGデータ取得エラー:', error);
      throw new Error(`RAGデータの取得に失敗しました: ${error}`);
    }
  }

  /**
   * GPT-5 mini によるセマンティック分析
   */
  private async performSemanticAnalysis(ragData: {
    trend: TrendRAGContent[];
    youtube: YouTubeRAGContent[];
    fragment: FragmentRAGContent[];
  }): Promise<SemanticAnalysis> {
    try {
      // RAGデータを分析用に整形
      const combinedContent = [
        ...ragData.trend.map(item => ({ type: 'trend', title: item.trend_topic, content: item.content })),
        ...ragData.youtube.map(item => ({ type: 'youtube', title: item.video_title, content: item.content })),
        ...ragData.fragment.map(item => ({ type: 'fragment', title: item.content_title, content: item.content }))
      ];

      if (combinedContent.length === 0) {
        console.warn('⚠️ 分析対象のRAGデータがありません');
        return this.getDefaultSemanticAnalysis();
      }

      // GPT-5 mini APIコール
      const prompt = PROMPT_TEMPLATES.ragAnalysis.replace(
        '{ragData}', 
        JSON.stringify(combinedContent.slice(0, 10), null, 2) // トークン数制限のため最大10件
      );

      const response = await this.openai.chat.completions.create({
        model: GPT5_MINI_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: 'あなたはRAG内容分析の専門家です。JSON形式で正確な分析結果を返してください。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: GPT5_MINI_CONFIG.temperature,
        max_completion_tokens: GPT5_MINI_CONFIG.max_tokens,
        top_p: GPT5_MINI_CONFIG.top_p
      });

      // 使用統計更新
      this.updateUsageStats(response.usage);

      // JSON解析
      const analysisResult = this.parseGPTResponse(response.choices[0].message.content || '{}');
      
      return {
        mainTopics: analysisResult.mainTopics || [],
        keywordClusters: analysisResult.keywordClusters || [],
        industryCategories: analysisResult.industryCategories || [],
        technicalLevel: analysisResult.technicalLevel || 5,
        confidenceScore: analysisResult.confidenceScore || 0.8,
        languageComplexity: analysisResult.languageComplexity || 5,
        topicalCoherence: analysisResult.topicalCoherence || 0.7
      };

    } catch (error) {
      console.error('❌ セマンティック分析エラー:', error);
      return this.getDefaultSemanticAnalysis();
    }
  }

  /**
   * データ統計計算
   */
  private calculateDataStatistics(ragData: {
    trend: TrendRAGContent[];
    youtube: YouTubeRAGContent[];
    fragment: FragmentRAGContent[];
  }) {
    const totalItems = ragData.trend.length + ragData.youtube.length + ragData.fragment.length;
    
    const allKeywords = [
      ...ragData.trend.flatMap(item => item.keywords || []),
      ...ragData.youtube.flatMap(item => item.keywords || []),
    ];
    
    const uniqueKeywords = Array.from(new Set(allKeywords));
    
    const allContent = [
      ...ragData.trend.map(item => item.content),
      ...ragData.youtube.map(item => item.content),
      ...ragData.fragment.map(item => item.content)
    ];
    
    const averageContentLength = allContent.length > 0 
      ? allContent.reduce((sum, content) => sum + content.length, 0) / allContent.length 
      : 0;

    return {
      totalItems,
      trendCount: ragData.trend.length,
      youtubeCount: ragData.youtube.length,
      fragmentCount: ragData.fragment.length,
      averageContentLength: Math.round(averageContentLength),
      keywordDiversity: uniqueKeywords.length
    };
  }

  /**
   * コンテンツテーマ抽出
   */
  private async extractContentThemes(ragData: any, semanticAnalysis: SemanticAnalysis) {
    // 簡易版実装（将来的にGPT-5 miniで強化予定）
    return {
      primaryThemes: semanticAnalysis.mainTopics.slice(0, 3),
      secondaryThemes: semanticAnalysis.mainTopics.slice(3, 6),
      emergingTopics: semanticAnalysis.industryCategories.slice(0, 3),
      technicalConcepts: semanticAnalysis.keywordClusters.flat().slice(0, 10)
    };
  }

  /**
   * 品質メトリクス計算
   */
  private calculateQualityMetrics(ragData: any, semanticAnalysis: SemanticAnalysis) {
    const totalItems = ragData.trend.length + ragData.youtube.length + ragData.fragment.length;
    
    return {
      contentRichness: Math.min(totalItems / 20, 1.0), // 20件で満点
      topicalCoverage: semanticAnalysis.topicalCoherence,
      informationDensity: Math.min(semanticAnalysis.technicalLevel / 10, 1.0),
      credibilityScore: semanticAnalysis.confidenceScore
    };
  }

  /**
   * Mike King理論準拠度評価
   */
  private evaluateMikeKingCompliance(ragData: any, semanticAnalysis: SemanticAnalysis) {
    return {
      relevanceEngineeringScore: semanticAnalysis.topicalCoherence,
      entityCoverage: Math.min(ragData.fragment.length / 10, 1.0), // Fragment数で評価
      fragmentOptimization: ragData.fragment.length > 0 ? 0.9 : 0.5,
      structuredDataReadiness: semanticAnalysis.confidenceScore
    };
  }

  /**
   * ヘルパーメソッド
   */
  private parseGPTResponse(content: string) {
    try {
      // JSONマーカーを除去
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      return JSON.parse(cleanContent);
    } catch (error) {
      console.warn('⚠️ GPT応答の解析に失敗:', error);
      return {};
    }
  }

  private updateUsageStats(usage: any) {
    if (usage) {
      this.usageStats.totalRequests++;
      this.usageStats.totalTokens += (usage.prompt_tokens || 0) + (usage.completion_tokens || 0);
      
      // GPT-5 mini料金計算（$0.25 input, $2.00 output per 1M tokens）
      const inputCost = (usage.prompt_tokens || 0) * 0.25 / 1000000;
      const outputCost = (usage.completion_tokens || 0) * 2.00 / 1000000;
      this.usageStats.totalCost += inputCost + outputCost;
      
      // GPT-4oと比較した節約額計算（$2.50 input, $10 output per 1M tokens）
      const gpt4oCost = (usage.prompt_tokens || 0) * 2.50 / 1000000 + (usage.completion_tokens || 0) * 10 / 1000000;
      this.usageStats.costSavings = ((gpt4oCost - (inputCost + outputCost)) / gpt4oCost) * 100;
    }
  }

  private getDefaultSemanticAnalysis(): SemanticAnalysis {
    return {
      mainTopics: ['AI', '技術', 'ビジネス'],
      keywordClusters: [['AI', '人工知能'], ['技術', 'テクノロジー'], ['ビジネス', '事業']],
      industryCategories: ['IT', 'AI'],
      technicalLevel: 5,
      confidenceScore: 0.5,
      languageComplexity: 5,
      topicalCoherence: 0.5
    };
  }

  private createIntelligentRAGError(
    code: string,
    message: string,
    details: any,
    component: 'analyzer' | 'query-generator' | 'category-selector' | 'coherence-checker'
  ): IntelligentRAGError {
    return {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
      component,
      severity: 'high',
      suggestions: ['システム管理者に連絡してください', 'しばらく時間をおいて再試行してください']
    };
  }

  /**
   * 使用統計取得
   */
  getUsageStats() {
    return { ...this.usageStats };
  }
} 