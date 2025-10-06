/**
 * ハイブリッド検索システム
 * BM25全文検索 + ベクトル類似度検索 + RRF統合
 * 
 * 既存のベクトルリンク・Triple RAGシステムと完全互換
 */

import { createClient } from '@supabase/supabase-js';
import { OpenAIEmbeddings } from './openai-embeddings';

export interface HybridSearchOptions {
  query: string;
  source: 'company' | 'trend' | 'youtube' | 'fragment';
  limit?: number;
  threshold?: number;
  bm25Weight?: number;
  vectorWeight?: number;
  recencyWeight?: number; // Trend RAG専用
  filterPagePath?: string; // Fragment Vectors専用
  filterContentType?: string; // Fragment Vectors専用
}

export interface HybridSearchResult {
  id: number | string;
  content: string;
  contentType?: string;
  metadata?: any;
  createdAt?: string;
  // ハイブリッド検索スコア
  bm25Score: number;
  vectorScore: number;
  recencyScore?: number; // Trend RAG専用
  combinedScore: number;
  // 既存システムとの互換性
  similarity?: number; // vectorScoreのエイリアス
  source: string;
}

export class HybridSearchSystem {
  private supabase;
  private embeddings: OpenAIEmbeddings;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase環境変数が設定されていません');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.embeddings = new OpenAIEmbeddings();
  }

  /**
   * ハイブリッド検索実行
   */
  async search(options: HybridSearchOptions): Promise<HybridSearchResult[]> {
    const {
      query,
      source,
      limit = 10,
      threshold = 0.3,
      bm25Weight = 0.4,
      vectorWeight = 0.6,
      recencyWeight = 0.3,
      filterPagePath,
      filterContentType
    } = options;

    console.log(`\n========================================`);
    console.log(`🔍 ハイブリッド検索開始`);
    console.log(`  Query: "${query}"`);
    console.log(`  Source: ${source}`);
    console.log(`  Limit: ${limit}`);
    console.log(`  Threshold: ${threshold}`);
    console.log(`⚖️ 重み配分:`);
    console.log(`  BM25: ${bm25Weight}`);
    console.log(`  Vector: ${vectorWeight}`);
    if (recencyWeight) console.log(`  Recency: ${recencyWeight}`);
    console.log(`========================================\n`);

    // クエリをベクトル化
    console.log(`📝 ステップ1: クエリをベクトル化中...`);
    const queryEmbedding = await this.embeddings.embedSingle(query);
    console.log(`✅ ベクトル化完了:`);
    console.log(`  - 次元: ${queryEmbedding.length}`);
    console.log(`  - サンプル値: [${queryEmbedding.slice(0, 3).map(v => v.toFixed(4)).join(', ')}, ...]`);

    // ソース別にハイブリッド検索実行
    let results: any[] = [];
    
    switch (source) {
      case 'company':
        results = await this.searchCompany(query, queryEmbedding, limit, threshold, bm25Weight, vectorWeight);
        break;
      case 'trend':
        results = await this.searchTrend(query, queryEmbedding, limit, threshold, bm25Weight, vectorWeight, recencyWeight);
        break;
      case 'youtube':
        results = await this.searchYouTube(query, queryEmbedding, limit, threshold, bm25Weight, vectorWeight);
        break;
      case 'fragment':
        results = await this.searchFragment(query, queryEmbedding, limit, threshold, bm25Weight, vectorWeight, filterPagePath, filterContentType);
        break;
      default:
        throw new Error(`未対応のソース: ${source}`);
    }

    console.log(`✅ ハイブリッド検索完了: ${results.length}件取得`);

    // 結果を共通フォーマットに変換
    return this.normalizeResults(results, source);
  }

  /**
   * Company Vectorsハイブリッド検索
   */
  private async searchCompany(
    queryText: string,
    queryEmbedding: number[],
    limit: number,
    threshold: number,
    bm25Weight: number,
    vectorWeight: number
  ): Promise<any[]> {
    console.log(`🔍 Company検索パラメータ:`, {
      queryText,
      embeddingLength: queryEmbedding.length,
      threshold,
      limit,
      bm25Weight,
      vectorWeight
    });

    const { data, error } = await this.supabase.rpc('hybrid_search_company_vectors', {
      query_text: queryText,
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      bm25_weight: bm25Weight,
      vector_weight: vectorWeight
    });

    if (error) {
      console.error('❌ Company ハイブリッド検索エラー:', error);
      console.error('   詳細:', JSON.stringify(error, null, 2));
      return [];
    }

    console.log(`✅ Company検索結果: ${data?.length || 0}件`);
    if (data && data.length > 0) {
      console.log(`   サンプル結果:`, {
        bm25_score: data[0].bm25_score,
        vector_score: data[0].vector_score,
        combined_score: data[0].combined_score
      });
    }

    return data || [];
  }

  /**
   * Trend Vectorsハイブリッド検索（鮮度スコア付き）
   */
  private async searchTrend(
    queryText: string,
    queryEmbedding: number[],
    limit: number,
    threshold: number,
    bm25Weight: number,
    vectorWeight: number,
    recencyWeight: number
  ): Promise<any[]> {
    const { data, error } = await this.supabase.rpc('hybrid_search_trend_vectors', {
      query_text: queryText,
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      bm25_weight: bm25Weight,
      vector_weight: vectorWeight,
      recency_weight: recencyWeight
    });

    if (error) {
      console.error('Trend ハイブリッド検索エラー:', error);
      return [];
    }

    return data || [];
  }

  /**
   * YouTube Vectorsハイブリッド検索
   */
  private async searchYouTube(
    queryText: string,
    queryEmbedding: number[],
    limit: number,
    threshold: number,
    bm25Weight: number,
    vectorWeight: number
  ): Promise<any[]> {
    const { data, error } = await this.supabase.rpc('hybrid_search_youtube_vectors', {
      query_text: queryText,
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      bm25_weight: bm25Weight,
      vector_weight: vectorWeight
    });

    if (error) {
      console.error('YouTube ハイブリッド検索エラー:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Fragment Vectorsハイブリッド検索
   */
  private async searchFragment(
    queryText: string,
    queryEmbedding: number[],
    limit: number,
    threshold: number,
    bm25Weight: number,
    vectorWeight: number,
    filterPagePath?: string,
    filterContentType?: string
  ): Promise<any[]> {
    const { data, error } = await this.supabase.rpc('hybrid_search_fragment_vectors', {
      query_text: queryText,
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      bm25_weight: bm25Weight,
      vector_weight: vectorWeight,
      filter_page_path: filterPagePath || null,
      filter_content_type: filterContentType || null
    });

    if (error) {
      console.error('Fragment ハイブリッド検索エラー:', error);
      return [];
    }

    return data || [];
  }

  /**
   * 結果を共通フォーマットに正規化
   */
  private normalizeResults(results: any[], source: string): HybridSearchResult[] {
    return results.map((result: any) => ({
      id: result.id,
      content: result.content,
      contentType: result.content_type,
      metadata: result.metadata || {},
      createdAt: result.created_at,
      // ハイブリッド検索スコア
      bm25Score: result.bm25_score || 0,
      vectorScore: result.vector_score || 0,
      recencyScore: result.recency_score,
      combinedScore: result.combined_score,
      // 既存システムとの互換性
      similarity: result.vector_score || 0,
      source
    }));
  }

  /**
   * レガシーベクトル検索との互換性レイヤー
   * 既存のコードを変更せずにハイブリッド検索を使用可能
   */
  async searchCompatible(
    query: string,
    source: 'company' | 'trend' | 'youtube',
    limit: number = 10,
    threshold: number = 0.3
  ): Promise<any[]> {
    const results = await this.search({
      query,
      source,
      limit,
      threshold,
      // デフォルトの重み
      bm25Weight: 0.4,
      vectorWeight: 0.6,
      recencyWeight: source === 'trend' ? 0.3 : undefined
    });

    // 既存のフォーマットに変換
    return results.map(r => ({
      id: r.id,
      content: r.content,
      content_type: r.contentType,
      metadata: r.metadata,
      created_at: r.createdAt,
      similarity: r.similarity,
      // ハイブリッド検索スコアも含める
      hybrid_scores: {
        bm25: r.bm25Score,
        vector: r.vectorScore,
        recency: r.recencyScore,
        combined: r.combinedScore
      }
    }));
  }
}

