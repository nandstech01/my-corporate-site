import { createClient } from '@supabase/supabase-js';

// Fragment Vector専用データ型
export interface FragmentVectorData {
  id?: number;
  fragment_id: string;                    // faq-tech-1, service-ai-agents等
  complete_uri: string;                   // https://nands.tech/faq#faq-tech-1
  page_path: string;                      // /faq, /ai-site, / 等
  content_title: string;                  // Fragment IDが指すコンテンツのタイトル
  content: string;                        // Fragment IDが指すコンテンツ（ベクトル化対象）
  content_type: string;                   // faq, service, section, heading等
  embedding: number[];                    // 1536次元ベクトル
  category?: string;                      // tech, pricing, ai-site等のカテゴリ
  semantic_weight?: number;               // セマンティック重み（0.0-1.0）
  target_queries?: string[];              // ターゲットクエリ配列
  related_entities?: string[];            // 関連エンティティ配列
  metadata?: any;                         // 追加メタデータ
  created_at?: string;
  updated_at?: string;
}

export interface FragmentVectorSearchResult extends FragmentVectorData {
  similarity: number;
}

export class FragmentVectorStore {
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
   * Fragment Vector を保存（重複防止機能付き）
   */
  async saveFragmentVector(data: FragmentVectorData): Promise<{ success: boolean; id?: number; error?: string }> {
    try {
      console.log(`🔄 Fragment Vector保存開始: ${data.fragment_id} (${data.page_path})`);

      // データ準備
      const insertData = {
        fragment_id: data.fragment_id,
        complete_uri: data.complete_uri,
        page_path: data.page_path,
        content_title: data.content_title,
        content: data.content,
        content_type: data.content_type,
        embedding: `[${data.embedding.join(',')}]`, // pgvector互換の文字列形式
        category: data.category,
        semantic_weight: data.semantic_weight || 0.85,
        target_queries: data.target_queries || [],
        related_entities: data.related_entities || [],
        metadata: data.metadata || {}
      };

      // 重複チェック
      const { data: existingData, error: checkError } = await this.supabase
        .from('fragment_vectors')
        .select('id, created_at')
        .eq('fragment_id', data.fragment_id)
        .eq('page_path', data.page_path)
        .limit(1);

      if (checkError) {
        console.warn(`⚠️ 重複チェックエラー (${data.fragment_id}):`, checkError);
      } else if (existingData && existingData.length > 0) {
        console.log(`ℹ️ Fragment ID ${data.fragment_id} (${data.page_path}) は既に存在します (ID: ${existingData[0].id})`);
        return { 
          success: false, 
          error: `重複: Fragment ID ${data.fragment_id} (${data.page_path}) は既に存在します`,
          id: existingData[0].id 
        };
      }

      // データ挿入
      const { data: insertResult, error } = await this.supabase
        .from('fragment_vectors')
        .insert(insertData)
        .select('id')
        .single();

      if (error) {
        console.error('Fragment Vector保存エラー:', error);
        return { success: false, error: error.message };
      }

      console.log(`✅ Fragment Vector保存成功: ID ${insertResult.id}, fragment_id: ${data.fragment_id}`);
      return { success: true, id: insertResult.id };

    } catch (error) {
      console.error('Fragment Vector保存例外:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * 複数のFragment Vectorをバッチで保存
   */
  async saveFragmentVectorsBatch(dataArray: FragmentVectorData[]): Promise<{
    success: boolean;
    savedCount: number;
    totalCount: number;
    errors: string[];
  }> {
    const results = {
      success: true,
      savedCount: 0,
      totalCount: dataArray.length,
      errors: [] as string[]
    };

    console.log(`🔄 ${dataArray.length}個のFragment Vectorをバッチ保存開始...`);

    for (const vectorData of dataArray) {
      const result = await this.saveFragmentVector(vectorData);
      
      if (result.success) {
        results.savedCount++;
      } else {
        results.errors.push(`${vectorData.fragment_id}: ${result.error}`);
        if (!result.error?.includes('重複:')) {
          results.success = false; // 重複以外のエラーの場合のみfailureとする
        }
      }

      // レート制限を避けるため小さな待機
      await this.sleep(50);
    }

    console.log(`📊 Fragment Vectorバッチ保存完了: ${results.savedCount}/${results.totalCount} 成功`);
    
    if (results.errors.length > 0) {
      console.log(`❌ エラー数: ${results.errors.length}`);
      results.errors.forEach(error => console.log(`  - ${error}`));
    }

    return results;
  }

  /**
   * Fragment Vector類似検索
   */
  async searchSimilarFragments(
    queryEmbedding: number[], 
    options: {
      limit?: number;
      threshold?: number;
      filterPagePath?: string;
      filterContentType?: string;
    } = {}
  ): Promise<FragmentVectorSearchResult[]> {
    try {
      const { limit = 5, threshold = 0.3, filterPagePath, filterContentType } = options;
      
      console.log(`🔍 Fragment Vector検索開始 - クエリ次元: ${queryEmbedding.length}, 閾値: ${threshold}`);
      
      // pgvector関数を使用した高速検索
      const { data, error } = await this.supabase
        .rpc('match_fragment_vectors', {
          query_embedding: `[${queryEmbedding.join(',')}]`,
          match_threshold: threshold,
          match_count: limit,
          filter_page_path: filterPagePath || null,
          filter_content_type: filterContentType || null
        });

      if (error) {
        console.error('Fragment Vector検索エラー:', error);
        return [];
      }

      if (!data || data.length === 0) {
        console.log('検索結果が見つかりません');
        return [];
      }

      console.log(`📊 Fragment Vector検索結果: ${data.length}件`);
      data.forEach((result: any, index: number) => {
        console.log(`  ${index + 1}. 類似度: ${result.similarity.toFixed(3)} - ${result.fragment_id} (${result.page_path})`);
      });

      return data.map((item: any) => ({
        id: item.id,
        fragment_id: item.fragment_id,
        complete_uri: item.complete_uri,
        page_path: item.page_path,
        content_title: item.content_title,
        content: item.content,
        content_type: item.content_type,
        embedding: typeof item.embedding === 'string' ? JSON.parse(item.embedding) : item.embedding,
        category: item.category,
        semantic_weight: item.semantic_weight,
        target_queries: item.target_queries,
        related_entities: item.related_entities,
        metadata: item.metadata,
        created_at: item.created_at,
        similarity: item.similarity
      }));

    } catch (error) {
      console.error('Fragment Vector検索例外:', error);
      return [];
    }
  }

  /**
   * Fragment Vector数を取得
   */
  async getFragmentVectorCount(filters: {
    pagePathFilter?: string;
    contentTypeFilter?: string;
  } = {}): Promise<number> {
    try {
      const { pagePathFilter, contentTypeFilter } = filters;
      
      let query = this.supabase
        .from('fragment_vectors')
        .select('id', { count: 'exact', head: true });

      if (pagePathFilter) {
        query = query.eq('page_path', pagePathFilter);
      }

      if (contentTypeFilter) {
        query = query.eq('content_type', contentTypeFilter);
      }

      const { count, error } = await query;

      if (error) {
        console.error('Fragment Vector数取得エラー:', error);
        return 0;
      }

      console.log(`📊 Fragment Vector数: ${count}件`);
      return count || 0;

    } catch (error) {
      console.error('Fragment Vector数取得例外:', error);
      return 0;
    }
  }

  /**
   * Fragment Vector削除（再構築用）
   */
  async clearFragmentVectors(filters: {
    pagePathFilter?: string;
    contentTypeFilter?: string;
  } = {}): Promise<{ success: boolean; deletedCount: number }> {
    try {
      const { pagePathFilter, contentTypeFilter } = filters;
      
      // 先に削除対象の数を取得
      const countBeforeDelete = await this.getFragmentVectorCount(filters);
      
      let query = this.supabase.from('fragment_vectors').delete();
      
      if (pagePathFilter) {
        query = query.eq('page_path', pagePathFilter);
      }

      if (contentTypeFilter) {
        query = query.eq('content_type', contentTypeFilter);
      }

      const { error } = await query;

      if (error) {
        console.error('Fragment Vector削除エラー:', error);
        return { success: false, deletedCount: 0 };
      }

      console.log(`🗑️ ${countBeforeDelete}個のFragment Vectorを削除しました`);
      
      return { success: true, deletedCount: countBeforeDelete };

    } catch (error) {
      console.error('Fragment Vector削除例外:', error);
      return { success: false, deletedCount: 0 };
    }
  }

  /**
   * Fragment IDからComplete URIを取得
   */
  async getCompleteURIByFragmentId(fragmentId: string, pagePath?: string): Promise<string | null> {
    try {
      let query = this.supabase
        .from('fragment_vectors')
        .select('complete_uri')
        .eq('fragment_id', fragmentId);

      if (pagePath) {
        query = query.eq('page_path', pagePath);
      }

      const { data, error } = await query.limit(1).single();

      if (error || !data) {
        console.warn(`Fragment ID ${fragmentId} のComplete URIが見つかりません`);
        return null;
      }

      return data.complete_uri;

    } catch (error) {
      console.error('Complete URI取得例外:', error);
      return null;
    }
  }

  /**
   * 接続テスト
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('fragment_vectors')
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
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 