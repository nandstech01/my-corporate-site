import { createClient } from '@supabase/supabase-js';
import { VectorData } from './openai-embeddings';

export interface SupabaseVectorData {
  id?: number;
  page_slug: string;
  content_type: string;
  section_title?: string;
  content_chunk: string;
  embedding: number[];
  metadata?: any;
  fragment_id?: string;
  service_id?: string;
  relevance_score?: number;
  created_at?: string;
  updated_at?: string;
}

export interface VectorSearchResult extends SupabaseVectorData {
  similarity: number;
}

export class SupabaseVectorStore {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase環境変数が設定されていません');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * 単一のベクトルデータを保存
   */
  async saveVector(vectorData: VectorData): Promise<{ success: boolean; id?: number; error?: string }> {
    try {
      const supabaseData: Omit<SupabaseVectorData, 'id'> = {
        page_slug: this.extractPageSlug(vectorData.metadata.url),
        content_type: vectorData.metadata.type,
        section_title: vectorData.metadata.title,
        content_chunk: vectorData.content,
        embedding: vectorData.embedding,
        metadata: {
          original_url: vectorData.metadata.url,
          word_count: vectorData.metadata.wordCount,
          section: vectorData.metadata.section,
          created_at: vectorData.metadata.createdAt
        },
        fragment_id: this.generateFragmentId(vectorData.id),
        service_id: this.extractServiceId(vectorData.metadata.url),
        relevance_score: 1.0
      };

      const { data, error } = await this.supabase
        .from('company_vectors')
        .insert(supabaseData)
        .select('id')
        .single();

      if (error) {
        console.error('ベクトル保存エラー:', error);
        return { success: false, error: error.message };
      }

      console.log(`✅ ベクトル保存成功: ID ${data.id}`);
      return { success: true, id: data.id };

    } catch (error) {
      console.error('ベクトル保存例外:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * 複数のベクトルデータをバッチで保存
   */
  async saveVectorsBatch(vectorDataArray: VectorData[]): Promise<{
    success: boolean;
    savedCount: number;
    totalCount: number;
    errors: string[];
  }> {
    const results = {
      success: true,
      savedCount: 0,
      totalCount: vectorDataArray.length,
      errors: [] as string[]
    };

    console.log(`🔄 ${vectorDataArray.length}個のベクトルをバッチ保存開始...`);

    for (const vectorData of vectorDataArray) {
      const result = await this.saveVector(vectorData);
      
      if (result.success) {
        results.savedCount++;
      } else {
        results.errors.push(`${vectorData.id}: ${result.error}`);
        results.success = false;
      }

      // レート制限を避けるため小さな待機
      await this.sleep(50);
    }

    console.log(`📊 バッチ保存完了: ${results.savedCount}/${results.totalCount} 成功`);
    
    if (results.errors.length > 0) {
      console.log(`❌ エラー数: ${results.errors.length}`);
      results.errors.forEach(error => console.log(`  - ${error}`));
    }

    return results;
  }

  /**
   * ベクトル類似検索（JavaScript実装）
   */
  async searchSimilar(
    queryEmbedding: number[], 
    limit: number = 5, 
    threshold: number = 0.3
  ): Promise<VectorSearchResult[]> {
    try {
      // 全てのベクトルを取得してJavaScriptでコサイン類似度を計算
      const { data, error } = await this.supabase
        .from('company_vectors')
        .select(`
          id,
          page_slug,
          content_type,
          section_title,
          content_chunk,
          embedding,
          metadata,
          fragment_id,
          service_id,
          relevance_score,
          created_at,
          updated_at
        `);

      if (error) {
        console.error('ベクトル検索エラー:', error);
        return [];
      }

      if (!data || data.length === 0) {
        console.log('検索対象のベクトルが見つかりません');
        return [];
      }

      console.log(`📊 検索対象ベクトル数: ${data.length}`);

      // JavaScriptでコサイン類似度を計算
      const resultsWithSimilarity = data.map((item: any) => {
        const similarity = this.calculateCosineSimilarity(queryEmbedding, item.embedding);
        return {
          ...item,
          similarity
        };
      });

      // 類似度でソートして閾値以上のものを返す
      const filteredResults = resultsWithSimilarity
        .filter(item => item.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      console.log(`📊 閾値(${threshold})以上の結果: ${filteredResults.length}件`);

      return filteredResults;

    } catch (error) {
      console.error('ベクトル検索例外:', error);
      return [];
    }
  }

  /**
   * コサイン類似度を計算
   */
  private calculateCosineSimilarity(vector1: number[], vector2: number[]): number {
    if (vector1.length !== vector2.length) {
      console.error(`ベクトルの次元が一致しません: ${vector1.length} vs ${vector2.length}`);
      return 0;
    }

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
   * 既存のベクトルを削除（再構築用）
   */
  async clearVectors(contentType?: string): Promise<{ success: boolean; deletedCount: number }> {
    try {
      const countBeforeDelete = await this.getVectorCount(contentType);
      
      let query = this.supabase.from('company_vectors').delete();
      
      if (contentType) {
        query = query.eq('content_type', contentType);
      }

      const { error } = await query;

      if (error) {
        console.error('ベクトル削除エラー:', error);
        return { success: false, deletedCount: 0 };
      }

      console.log(`🗑️ ${countBeforeDelete}個のベクトルを削除しました`);
      
      return { success: true, deletedCount: countBeforeDelete };

    } catch (error) {
      console.error('ベクトル削除例外:', error);
      return { success: false, deletedCount: 0 };
    }
  }

  /**
   * 保存されているベクトル数を取得
   */
  async getVectorCount(contentType?: string): Promise<number> {
    try {
      let query = this.supabase
        .from('company_vectors')
        .select('id', { count: 'exact', head: true });

      if (contentType) {
        query = query.eq('content_type', contentType);
      }

      const { count, error } = await query;

      if (error) {
        console.error('ベクトル数取得エラー:', error);
        return 0;
      }

      return count || 0;

    } catch (error) {
      console.error('ベクトル数取得例外:', error);
      return 0;
    }
  }

  /**
   * 接続テスト
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('company_vectors')
        .select('id')
        .limit(1);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // ヘルパーメソッド

  private extractPageSlug(url: string): string {
    const cleanUrl = url.replace(/^\/+|\/+$/g, '');
    return cleanUrl || 'root';
  }

  private extractServiceId(url: string): string | undefined {
    const serviceMatch = url.match(/\/(ai-agents|aio-seo|chatbot-development|hr-solutions|mcp-servers|sns-automation|system-development|vector-rag|video-generation)\//);
    return serviceMatch ? serviceMatch[1] : undefined;
  }

  private generateFragmentId(originalId: string): string {
    return originalId.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
