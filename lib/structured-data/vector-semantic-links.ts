/**
 * 真セマンティック類似度ベース内部リンクシステム
 * OpenAI Embeddings + ベクトル類似度による意味レベル関連リンク生成
 */

import { createClient } from '@supabase/supabase-js';
import { OpenAIEmbeddings } from '@/lib/vector/openai-embeddings';
import { SemanticLink, LinkContext, SemanticLinkConfig } from './semantic-links';

export interface VectorSemanticLink extends SemanticLink {
  vectorSimilarity: number; // 真のベクトル類似度
  confidenceScore: number;  // 推奨信頼度
}

export interface CachedSimilarity {
  source_id: string;
  target_id: string;
  similarity_score: number;
  context_type: string;
  last_calculated: string;
}

export class VectorSemanticLinksSystem {
  private supabase;
  private embeddings: OpenAIEmbeddings;
  private config: SemanticLinkConfig;
  private cacheExpiry = 7 * 24 * 60 * 60 * 1000; // 7日間

  constructor(config: Partial<SemanticLinkConfig> = {}) {
    this.config = {
      minRelevanceScore: 0.4, // ベクトル類似度の閾値
      maxLinksPerSection: 5,
      enableAIOptimization: true,
      linkTypes: ['service', 'related', 'process', 'case-study', 'faq'],
      ...config
    };

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.embeddings = new OpenAIEmbeddings();
  }

  /**
   * 真セマンティック類似度ベースのリンク生成
   */
  async generateVectorSemanticLinks(context: LinkContext): Promise<VectorSemanticLink[]> {
    try {
      console.log(`🔍 真セマンティック検索開始: ${context.currentPage}`);

      // 1. 現在ページのベクトルデータ取得
      const currentPageVector = await this.getCurrentPageVector(context.currentPage);
      if (!currentPageVector) {
        console.log(`❌ ${context.currentPage}のベクトルが見つかりません`);
        return [];
      }

      // 2. キャッシュから類似度データ取得を試行
      let similarities = await this.getCachedSimilarities(context.currentPage);
      
      // 3. キャッシュが古いか存在しない場合は再計算
      if (similarities.length === 0 || this.isCacheExpired(similarities[0])) {
        console.log(`🔄 ${context.currentPage}の類似度を再計算中...`);
        similarities = await this.calculateAndCacheSimilarities(
          context.currentPage, 
          currentPageVector.embedding
        );
      }

      // 4. 類似度からリンクを生成
      const vectorLinks = await this.buildLinksFromSimilarities(similarities, context);

      console.log(`✅ 真セマンティックリンク生成完了: ${vectorLinks.length}件`);
      return vectorLinks;

    } catch (error) {
      console.error('❌ 真セマンティックリンク生成エラー:', error);
      // フォールバック: 空配列を返す（従来システムが動作）
      return [];
    }
  }

  /**
   * 現在ページのベクトルデータ取得
   */
  private async getCurrentPageVector(pageSlug: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('company_vectors')
      .select('id, page_slug, content_chunk, embedding, metadata')
      .eq('page_slug', pageSlug)
      .eq('content_type', 'service')
      .limit(1)
      .single();

    if (error) {
      console.error(`ベクトル取得エラー (${pageSlug}):`, error);
      return null;
    }

    return data;
  }

  /**
   * キャッシュされた類似度データ取得
   */
  private async getCachedSimilarities(sourceId: string): Promise<CachedSimilarity[]> {
    const { data, error } = await this.supabase
      .from('semantic_similarity_cache')
      .select('*')
      .eq('source_id', sourceId)
      .gte('similarity_score', this.config.minRelevanceScore)
      .order('similarity_score', { ascending: false })
      .limit(this.config.maxLinksPerSection * 2); // 予備を多めに取得

    if (error) {
      console.error('類似度キャッシュ取得エラー:', error);
      return [];
    }

    return data || [];
  }

  /**
   * 類似度計算とキャッシュ保存
   */
  private async calculateAndCacheSimilarities(
    sourceId: string, 
    sourceEmbedding: number[]
  ): Promise<CachedSimilarity[]> {
    // 全ベクトルデータ取得（現在ページ以外）
    const { data: allVectors, error } = await this.supabase
      .from('company_vectors')
      .select('id, page_slug, content_type, section_title, embedding, metadata')
      .neq('page_slug', sourceId)
      .in('content_type', ['service', 'corporate', 'generated_blog']);

    if (error || !allVectors) {
      console.error('全ベクトル取得エラー:', error);
      return [];
    }

    const similarities: CachedSimilarity[] = [];
    const cacheData = [];

    for (const targetVector of allVectors) {
      if (!targetVector.embedding) continue;

      // コサイン類似度計算
      const similarity = this.calculateCosineSimilarity(
        sourceEmbedding, 
        targetVector.embedding
      );

      if (similarity >= this.config.minRelevanceScore) {
        const similarityRecord = {
          source_id: sourceId,
          target_id: targetVector.page_slug,
          similarity_score: similarity,
          context_type: targetVector.content_type,
          last_calculated: new Date().toISOString()
        };

        similarities.push(similarityRecord);
        cacheData.push(similarityRecord);
      }
    }

    // キャッシュに保存（upsert）
    if (cacheData.length > 0) {
      const { error: cacheError } = await this.supabase
        .from('semantic_similarity_cache')
        .upsert(cacheData, { 
          onConflict: 'source_id,target_id,context_type' 
        });

      if (cacheError) {
        console.error('類似度キャッシュ保存エラー:', cacheError);
      } else {
        console.log(`💾 ${cacheData.length}件の類似度をキャッシュ保存`);
      }
    }

    return similarities;
  }

  /**
   * 類似度データからリンク構築
   */
  private async buildLinksFromSimilarities(
    similarities: CachedSimilarity[], 
    context: LinkContext
  ): Promise<VectorSemanticLink[]> {
    const links: VectorSemanticLink[] = [];

    for (const similarity of similarities.slice(0, this.config.maxLinksPerSection)) {
      const linkData = await this.getPageLinkData(similarity.target_id);
      
      if (linkData) {
        links.push({
          url: `/${similarity.target_id}`,
          title: linkData.title,
          description: linkData.description,
          relevanceScore: similarity.similarity_score,
          vectorSimilarity: similarity.similarity_score,
          confidenceScore: this.calculateConfidenceScore(similarity.similarity_score),
          linkType: this.determineLinkType(similarity.context_type),
          keywords: linkData.keywords || []
        });
      }
    }

    return links;
  }

  /**
   * ページのリンクデータ取得
   */
  private async getPageLinkData(pageSlug: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('company_vectors')
      .select('section_title, content_chunk, metadata')
      .eq('page_slug', pageSlug)
      .limit(1)
      .single();

    if (error || !data) return null;

    return {
      title: data.section_title || data.metadata?.title || pageSlug,
      description: data.content_chunk?.substring(0, 150) + '...' || 'AI技術による関連サービス',
      keywords: data.metadata?.keywords || []
    };
  }

  /**
   * コサイン類似度計算
   */
  private calculateCosineSimilarity(vector1: number[], vector2: number[]): number {
    if (vector1.length !== vector2.length) return 0;

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vector1.length; i++) {
      dotProduct += vector1[i] * vector2[i];
      norm1 += vector1[i] * vector1[i];
      norm2 += vector2[i] * vector2[i];
    }

    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }

  /**
   * キャッシュ有効期限チェック
   */
  private isCacheExpired(similarity: CachedSimilarity): boolean {
    const lastCalculated = new Date(similarity.last_calculated).getTime();
    const now = Date.now();
    return (now - lastCalculated) > this.cacheExpiry;
  }

  /**
   * 信頼度スコア計算
   */
  private calculateConfidenceScore(similarity: number): number {
    // 0.4-1.0 の類似度を 0-100% の信頼度に変換
    return Math.min(100, Math.max(0, (similarity - 0.4) / 0.6 * 100));
  }

  /**
   * リンクタイプ判定
   */
  private determineLinkType(contentType: string): 'service' | 'related' | 'process' | 'case-study' | 'faq' {
    const typeMap: Record<string, any> = {
      'service': 'service',
      'corporate': 'related', 
      'generated_blog': 'case-study',
      'technical': 'process'
    };
    
    return typeMap[contentType] || 'related';
  }

  /**
   * キャッシュクリア（メンテナンス用）
   */
  async clearCache(sourceId?: string): Promise<void> {
    let query = this.supabase.from('semantic_similarity_cache').delete();
    
    if (sourceId) {
      query = query.eq('source_id', sourceId);
    }

    const { error } = await query;
    
    if (error) {
      console.error('キャッシュクリアエラー:', error);
    } else {
      console.log(`🗑️ 類似度キャッシュクリア完了 ${sourceId ? `(${sourceId})` : '(全て)'}`);
    }
  }
}

/**
 * デフォルトインスタンス
 */
export const vectorSemanticLinks = new VectorSemanticLinksSystem();

/**
 * 便利関数（従来システムとの互換性）
 */
export const VectorSemanticLinksHelpers = {
  /**
   * ページ用真セマンティックリンク生成
   */
  generateForPage: async (pageKey: string, keywords: string[] = []): Promise<VectorSemanticLink[]> => {
    const context: LinkContext = {
      currentPage: pageKey,
      currentTitle: `${pageKey} page`,
      keywords,
      category: 'service',
      priority: 1
    };

    return await vectorSemanticLinks.generateVectorSemanticLinks(context);
  },

  /**
   * 統計情報取得
   */
  getCacheStats: async (): Promise<any> => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('semantic_similarity_cache')
      .select('context_type, similarity_score')
      .order('similarity_score', { ascending: false });

    if (error) return { error: error.message };

    const stats = {
      totalCached: data?.length || 0,
      avgSimilarity: data?.reduce((sum, item) => sum + item.similarity_score, 0) / (data?.length || 1),
      maxSimilarity: Math.max(...(data?.map(item => item.similarity_score) || [0])),
      typeDistribution: data?.reduce((acc: any, item) => {
        acc[item.context_type] = (acc[item.context_type] || 0) + 1;
        return acc;
      }, {}) || {}
    };

    return stats;
  }
}; 