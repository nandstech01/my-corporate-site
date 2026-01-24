/**
 * CLAVI Fragment Vectorizer
 * 
 * Phase 4.2.1: Fragment IDベクトル化サービス
 * - Mike King理論準拠（50-150語パッセージ）
 * - OpenAI Embeddings（1536次元）
 * - clavi.fragment_vectors への保存（tenant_id付き）
 * 
 * @version 1.0.0
 * @date 2026-01-12
 */

import { OpenAIEmbeddings } from '@/lib/vector/openai-embeddings';
import { createClient } from '@supabase/supabase-js';

export interface FragmentVectorizationParams {
  tenant_id: string;
  analysis_id: string;
  fragments: Array<{
    fragment_id: string;
    title: string;
    content: string; // 50-150語パッセージ
  }>;
}

export interface FragmentVectorizationResult {
  success: boolean;
  successCount: number;
  totalCount: number;
  errors: Array<{
    fragment_id: string;
    error: string;
  }>;
}

export class CLAVIFragmentVectorizer {
  private embeddings: OpenAIEmbeddings;
  private supabase;
  
  constructor() {
    // 既存のOpenAIEmbeddingsクラスを活用（読み取りのみ）
    this.embeddings = new OpenAIEmbeddings();
    
    // Supabase Anon Key使用（RLS適用）
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('[CLAVIFragmentVectorizer] Supabase環境変数が設定されていません');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('[CLAVIFragmentVectorizer] 初期化完了');
  }
  
  /**
   * Fragment IDベクトル化（Mike King理論準拠）
   * 
   * - 50-150語パッセージをベクトル化
   * - clavi.fragment_vectors に保存（tenant_id付き）
   * - エラーハンドリング（個別Fragment失敗時も処理継続）
   */
  async vectorizeFragments(params: FragmentVectorizationParams): Promise<FragmentVectorizationResult> {
    const { tenant_id, analysis_id, fragments } = params;
    
    console.log(`[CLAVIFragmentVectorizer] ベクトル化開始:`);
    console.log(`  - tenant_id: ${tenant_id}`);
    console.log(`  - analysis_id: ${analysis_id}`);
    console.log(`  - fragments: ${fragments.length}個`);
    
    const result: FragmentVectorizationResult = {
      success: true,
      successCount: 0,
      totalCount: fragments.length,
      errors: []
    };
    
    // 各Fragmentを順次処理（レート制限対策）
    for (const fragment of fragments) {
      try {
        await this.vectorizeSingleFragment({
          tenant_id,
          analysis_id,
          fragment
        });
        
        result.successCount++;
        console.log(`[CLAVIFragmentVectorizer] ✅ ${fragment.fragment_id}: 成功 (${result.successCount}/${result.totalCount})`);
        
        // レート制限対策: 100ms待機
        await this.sleep(100);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push({
          fragment_id: fragment.fragment_id,
          error: errorMessage
        });
        
        console.error(`[CLAVIFragmentVectorizer] ❌ ${fragment.fragment_id}: 失敗`, error);
        
        // 個別エラーは全体の処理を止めない
        continue;
      }
    }
    
    // 最終結果判定
    result.success = result.successCount === result.totalCount;
    
    console.log(`[CLAVIFragmentVectorizer] ベクトル化完了:`);
    console.log(`  - 成功: ${result.successCount}/${result.totalCount}`);
    console.log(`  - エラー: ${result.errors.length}個`);
    
    return result;
  }
  
  /**
   * 単一Fragmentのベクトル化 + 保存
   */
  private async vectorizeSingleFragment(params: {
    tenant_id: string;
    analysis_id: string;
    fragment: {
      fragment_id: string;
      title: string;
      content: string;
    };
  }): Promise<void> {
    const { tenant_id, analysis_id, fragment } = params;
    
    // 1. ベクトル化（OpenAI Embeddings 1536次元）
    console.log(`[CLAVIFragmentVectorizer] ベクトル化中: ${fragment.fragment_id}`);
    const embedding = await this.embeddings.embedSingle(fragment.content);
    
    if (!embedding || embedding.length !== 1536) {
      throw new Error(`Invalid embedding dimensions: ${embedding?.length || 0}`);
    }
    
    // 2. pgvector形式に変換
    const embeddingString = `[${embedding.join(',')}]`;
    
    // 3. clavi.fragment_vectors に保存（公開ビュー経由）
    const { error } = await this.supabase
      .from('clavi_fragment_vectors') // 公開ビュー
      .insert({
        tenant_id,
        analysis_id,
        fragment_id: fragment.fragment_id,
        content_title: fragment.title,
        content: fragment.content,
        embedding: embeddingString,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      throw new Error(`Supabase insert error: ${error.message}`);
    }
  }
  
  /**
   * 待機用ヘルパー（レート制限対策）
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * ベクトル化状況確認
   */
  async getVectorizationStatus(params: {
    tenant_id: string;
    analysis_id: string;
  }): Promise<{
    totalCount: number;
    vectorizedCount: number;
    percentage: number;
  }> {
    const { tenant_id, analysis_id } = params;
    
    // analysis_data から総Fragment数を取得
    const { data: analysis } = await this.supabase
      .from('clavi_client_analyses')
      .select('analysis_data')
      .eq('tenant_id', tenant_id)
      .eq('id', analysis_id)
      .single();
    
    const totalCount = analysis?.analysis_data?.fragment_ids?.length || 0;
    
    // ベクトル化済みの数を取得
    const { count: vectorizedCount } = await this.supabase
      .from('clavi_fragment_vectors')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenant_id)
      .eq('analysis_id', analysis_id);
    
    const percentage = totalCount > 0 ? Math.round((vectorizedCount || 0) / totalCount * 100) : 0;
    
    return {
      totalCount,
      vectorizedCount: vectorizedCount || 0,
      percentage
    };
  }
}

