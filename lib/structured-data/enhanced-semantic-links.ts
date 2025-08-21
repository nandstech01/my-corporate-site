/**
 * 段階的統合セマンティックリンクシステム
 * 従来のキーワードベース + 新しいベクトルベースのハイブリッド実装
 */

import { SemanticLinksSystem, SemanticLink, LinkContext, SemanticLinkConfig } from './semantic-links';
import { VectorSemanticLinksSystem, VectorSemanticLink, vectorSemanticLinks } from './vector-semantic-links';

export interface EnhancedSemanticLink extends VectorSemanticLink {
  sourceType: 'vector' | 'keyword' | 'hybrid';
  fallbackUsed: boolean;
}

export interface EnhancedSemanticConfig extends SemanticLinkConfig {
  useVectorSimilarity: boolean;
  fallbackToKeyword: boolean;
  hybridMode: boolean;
  vectorWeight: number; // 0.0-1.0
  keywordWeight: number; // 0.0-1.0
}

export class EnhancedSemanticLinksSystem {
  private keywordSystem: SemanticLinksSystem;
  private vectorSystem: VectorSemanticLinksSystem;
  private config: EnhancedSemanticConfig;

  constructor(config: Partial<EnhancedSemanticConfig> = {}) {
    this.config = {
      minRelevanceScore: 0.3,
      maxLinksPerSection: 5,
      enableAIOptimization: true,
      linkTypes: ['service', 'related', 'process', 'case-study', 'faq'],
      useVectorSimilarity: true,    // 真セマンティック優先
      fallbackToKeyword: true,      // フォールバック有効
      hybridMode: false,            // ハイブリッドモード
      vectorWeight: 0.7,           // ベクトル類似度の重み
      keywordWeight: 0.3,          // キーワード類似度の重み
      ...config
    };

    this.keywordSystem = new SemanticLinksSystem(this.config);
    this.vectorSystem = new VectorSemanticLinksSystem(this.config);
  }

  /**
   * 段階的統合リンク生成
   */
  async generateEnhancedSemanticLinks(context: LinkContext): Promise<EnhancedSemanticLink[]> {
    const startTime = Date.now();
    console.log(`🔄 段階的セマンティックリンク生成開始: ${context.currentPage}`);

    try {
      if (this.config.hybridMode) {
        // ハイブリッドモード: 両方の結果を統合
        return await this.generateHybridLinks(context);
      } else if (this.config.useVectorSimilarity) {
        // ベクトル優先モード: フォールバック付き
        return await this.generateVectorFirstLinks(context);
      } else {
        // キーワードモード: 従来システム
        return await this.generateKeywordOnlyLinks(context);
      }
    } catch (error) {
      console.error('段階的セマンティックリンク生成エラー:', error);
      // 緊急フォールバック
      return await this.generateKeywordOnlyLinks(context);
    } finally {
      const duration = Date.now() - startTime;
      console.log(`⏱️ セマンティックリンク生成完了: ${duration}ms`);
    }
  }

  /**
   * ハイブリッドモード: ベクトル + キーワードの統合
   */
  private async generateHybridLinks(context: LinkContext): Promise<EnhancedSemanticLink[]> {
    console.log(`🔀 ハイブリッドモード実行中...`);

    // 並行実行でパフォーマンス向上
    const [vectorLinks, keywordLinks] = await Promise.all([
      this.vectorSystem.generateVectorSemanticLinks(context).catch(() => []),
      this.keywordSystem.generateSemanticLinks(context)
    ]);

    console.log(`📊 ベクトルリンク: ${vectorLinks.length}件, キーワードリンク: ${keywordLinks.length}件`);

    // スコア統合とランキング
    const hybridLinks = this.mergeAndRankLinks(vectorLinks, keywordLinks, context);

    return hybridLinks.slice(0, this.config.maxLinksPerSection);
  }

  /**
   * ベクトル優先モード: フォールバック付き
   */
  private async generateVectorFirstLinks(context: LinkContext): Promise<EnhancedSemanticLink[]> {
    console.log(`🎯 ベクトル優先モード実行中...`);

    // まずベクトル類似度を試行
    const vectorLinks = await this.vectorSystem.generateVectorSemanticLinks(context);

    if (vectorLinks.length >= this.config.maxLinksPerSection * 0.6) {
      // 十分なベクトルリンクが取得できた場合
      console.log(`✅ ベクトルリンク十分: ${vectorLinks.length}件`);
      return vectorLinks.map(link => ({
        ...link,
        sourceType: 'vector' as const,
        fallbackUsed: false
      }));
    } else if (this.config.fallbackToKeyword) {
      // フォールバック: キーワードベースで補完
      console.log(`🔄 フォールバック実行: ベクトル${vectorLinks.length}件 → キーワード補完`);
      
      const keywordLinks = this.keywordSystem.generateSemanticLinks(context);
      const fallbackLinks = this.supplementWithKeywordLinks(vectorLinks, keywordLinks);
      
      return fallbackLinks;
    } else {
      // フォールバック無効: ベクトルリンクのみ
      return vectorLinks.map(link => ({
        ...link,
        sourceType: 'vector' as const,
        fallbackUsed: false
      }));
    }
  }

  /**
   * キーワードオンリーモード
   */
  private async generateKeywordOnlyLinks(context: LinkContext): Promise<EnhancedSemanticLink[]> {
    console.log(`🔤 キーワードオンリーモード実行中...`);
    
    const keywordLinks = this.keywordSystem.generateSemanticLinks(context);
    
    return keywordLinks.map(link => ({
      ...link,
      vectorSimilarity: 0,
      confidenceScore: link.relevanceScore * 100,
      sourceType: 'keyword' as const,
      fallbackUsed: false
    }));
  }

  /**
   * ベクトル + キーワードリンクの統合
   */
  private mergeAndRankLinks(
    vectorLinks: VectorSemanticLink[],
    keywordLinks: SemanticLink[],
    context: LinkContext
  ): EnhancedSemanticLink[] {
    const mergedLinks: EnhancedSemanticLink[] = [];
    const urlSet = new Set<string>();

    // ベクトルリンクを優先追加
    for (const vLink of vectorLinks) {
      if (!urlSet.has(vLink.url)) {
        mergedLinks.push({
          ...vLink,
          sourceType: 'vector',
          fallbackUsed: false
        });
        urlSet.add(vLink.url);
      }
    }

    // キーワードリンクで補完（重複除去）
    for (const kLink of keywordLinks) {
      if (!urlSet.has(kLink.url)) {
        const enhancedLink: EnhancedSemanticLink = {
          ...kLink,
          vectorSimilarity: 0,
          confidenceScore: kLink.relevanceScore * 100,
          sourceType: 'keyword',
          fallbackUsed: true
        };

        // ハイブリッドスコア計算
        const hybridScore = this.calculateHybridScore(enhancedLink, context);
        enhancedLink.relevanceScore = hybridScore;

        mergedLinks.push(enhancedLink);
        urlSet.add(kLink.url);
      }
    }

    // ハイブリッドスコアでソート
    mergedLinks.sort((a, b) => b.relevanceScore - a.relevanceScore);

    console.log(`🔗 統合完了: ${mergedLinks.length}件 (ベクトル: ${vectorLinks.length}, キーワード: ${keywordLinks.length})`);
    return mergedLinks;
  }

  /**
   * キーワードリンクでベクトルリンクを補完
   */
  private supplementWithKeywordLinks(
    vectorLinks: VectorSemanticLink[],
    keywordLinks: SemanticLink[]
  ): EnhancedSemanticLink[] {
    const supplementedLinks: EnhancedSemanticLink[] = [];
    const urlSet = new Set(vectorLinks.map(link => link.url));

    // ベクトルリンクを追加
    vectorLinks.forEach(link => {
      supplementedLinks.push({
        ...link,
        sourceType: 'vector',
        fallbackUsed: false
      });
    });

    // 不足分をキーワードリンクで補完
    const needed = this.config.maxLinksPerSection - vectorLinks.length;
    let added = 0;

    for (const kLink of keywordLinks) {
      if (added >= needed) break;
      if (!urlSet.has(kLink.url)) {
        supplementedLinks.push({
          ...kLink,
          vectorSimilarity: 0,
          confidenceScore: kLink.relevanceScore * 100,
          sourceType: 'keyword',
          fallbackUsed: true
        });
        added++;
      }
    }

    console.log(`🔧 補完完了: ベクトル${vectorLinks.length}件 + キーワード${added}件`);
    return supplementedLinks;
  }

  /**
   * ハイブリッドスコア計算
   */
  private calculateHybridScore(link: EnhancedSemanticLink, context: LinkContext): number {
    const vectorScore = link.vectorSimilarity || 0;
    const keywordScore = link.relevanceScore || 0;

    // 重み付き平均
    const hybridScore = (vectorScore * this.config.vectorWeight) + 
                       (keywordScore * this.config.keywordWeight);

    // コンテキスト補正
    const contextBonus = this.calculateContextBonus(link, context);
    
    return Math.min(1.0, hybridScore + contextBonus);
  }

  /**
   * コンテキストボーナス計算
   */
  private calculateContextBonus(link: EnhancedSemanticLink, context: LinkContext): number {
    let bonus = 0;

    // 同一カテゴリボーナス
    if (link.linkType === context.category) {
      bonus += 0.1;
    }

    // キーワード一致ボーナス
    const keywordMatches = context.keywords.filter(keyword =>
      link.keywords.some(linkKeyword => 
        linkKeyword.toLowerCase().includes(keyword.toLowerCase())
      )
    ).length;
    
    bonus += (keywordMatches / Math.max(1, context.keywords.length)) * 0.1;

    return Math.min(0.2, bonus); // 最大20%のボーナス
  }

  /**
   * 設定更新
   */
  updateConfig(newConfig: Partial<EnhancedSemanticConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log(`⚙️ 設定更新:`, newConfig);
  }

  /**
   * システム統計取得
   */
  async getSystemStats(): Promise<any> {
    try {
      const vectorStats = {}; // この部分は実装済みのVectorSemanticLinksSystemのメソッドに合わせて調整が必要
      
      return {
        config: this.config,
        vectorCache: vectorStats,
        systemHealth: {
          vectorSystemAvailable: true,
          keywordSystemAvailable: true,
          lastUpdate: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        config: this.config,
        systemHealth: {
          vectorSystemAvailable: false,
          keywordSystemAvailable: true,
          error: (error as Error).message,
          lastUpdate: new Date().toISOString()
        }
      };
    }
  }
}

/**
 * デフォルトインスタンス（段階的移行用）
 */
export const enhancedSemanticLinks = new EnhancedSemanticLinksSystem({
  useVectorSimilarity: true,
  fallbackToKeyword: true,
  hybridMode: false,
  vectorWeight: 0.7,
  keywordWeight: 0.3
});

/**
 * 設定プリセット
 */
export const SemanticConfigPresets = {
  // 本番環境: ベクトル優先 + フォールバック
  production: {
    useVectorSimilarity: true,
    fallbackToKeyword: true,
    hybridMode: false,
    vectorWeight: 0.8,
    keywordWeight: 0.2,
    minRelevanceScore: 0.4
  },

  // 開発環境: ハイブリッドモード
  development: {
    useVectorSimilarity: true,
    fallbackToKeyword: true,
    hybridMode: true,
    vectorWeight: 0.6,
    keywordWeight: 0.4,
    minRelevanceScore: 0.3
  },

  // フォールバック: キーワードのみ
  fallback: {
    useVectorSimilarity: false,
    fallbackToKeyword: false,
    hybridMode: false,
    vectorWeight: 0,
    keywordWeight: 1.0,
    minRelevanceScore: 0.3
  }
}; 