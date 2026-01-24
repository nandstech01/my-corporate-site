/**
 * CLAVI Internal Link Optimizer
 * 
 * Phase 4.3.1: 内部リンク最適化（ベクトル近傍検索）
 * - Mike King理論準拠（ベクトル近傍検索による内部リンク最適化）
 * - pgvectorでコサイン類似度検索
 * - テナント分離（RLS）確保
 * 
 * @version 1.0.0
 * @date 2026-01-12
 */

import { createClient } from '@supabase/supabase-js';

export interface InternalLinkRecommendation {
  fragmentId: string;
  completeUri: string;
  contentTitle: string;
  similarityScore: number; // 0.0-1.0
  reason: string;
}

export interface InternalLinkRecommendationsResult {
  sourceFragmentId: string;
  sourceTitle: string;
  recommendations: InternalLinkRecommendation[];
  totalCandidates: number;
}

export class InternalLinkOptimizer {
  private supabase;
  
  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('[InternalLinkOptimizer] Supabase環境変数が設定されていません');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('[InternalLinkOptimizer] 初期化完了');
  }
  
  /**
   * Mike King理論: ベクトル近傍検索による内部リンク最適化
   * 
   * アルゴリズム:
   * 1. 対象Fragmentのベクトル取得
   * 2. pgvectorでコサイン類似度検索（RPC関数呼び出し）
   * 3. 自分自身を除外 + スコア付与
   * 4. 推奨理由生成
   * 
   * @param params - テナントID、分析ID、Fragment ID、top-k
   * @returns 内部リンク推奨リスト
   */
  async recommendInternalLinks(params: {
    tenant_id: string;
    analysis_id: string;
    fragment_id: string;
    top_k?: number; // デフォルト: 5
    match_threshold?: number; // デフォルト: 0.6（60%以上）
  }): Promise<InternalLinkRecommendationsResult> {
    const {
      tenant_id,
      analysis_id,
      fragment_id,
      top_k = 5,
      match_threshold = 0.6
    } = params;
    
    console.log(`[InternalLinkOptimizer] 内部リンク推奨開始:`);
    console.log(`  - tenant_id: ${tenant_id}`);
    console.log(`  - analysis_id: ${analysis_id}`);
    console.log(`  - fragment_id: ${fragment_id}`);
    console.log(`  - top_k: ${top_k}`);
    console.log(`  - match_threshold: ${match_threshold}`);
    
    // 1. 対象Fragmentのベクトル取得
    const { data: targetFragment, error: targetError } = await this.supabase
      .from('clavi_fragment_vectors')
      .select('embedding, content_title')
      .eq('tenant_id', tenant_id)
      .eq('analysis_id', analysis_id)
      .eq('fragment_id', fragment_id)
      .single();
    
    if (targetError || !targetFragment) {
      throw new Error(
        `[InternalLinkOptimizer] Target fragment not found: ${fragment_id} - ${targetError?.message}`
      );
    }
    
    console.log(`[InternalLinkOptimizer] ターゲットFragment取得完了: ${targetFragment.content_title}`);
    
    // 2. pgvectorでコサイン類似度検索（RPC関数呼び出し）
    // ⚠️ 修正: p_tenant_id引数を削除（RPC側で auth.uid() から導出）
    // 注: RPC関数 find_similar_fragments_clavi は Task 4.3.2で作成（安全版v2）
    const { data: candidates, error: searchError } = await this.supabase.rpc(
      'find_similar_fragments_clavi',
      {
        query_embedding: targetFragment.embedding,
        match_threshold: match_threshold,
        match_count: top_k + 1, // 自分自身を除外するため+1（上限20件）
        p_analysis_id: analysis_id
      }
    );
    
    if (searchError) {
      // RPC関数が未作成の場合のフォールバック
      console.warn(`[InternalLinkOptimizer] RPC関数エラー（Task 4.3.2で作成予定）: ${searchError.message}`);
      
      return {
        sourceFragmentId: fragment_id,
        sourceTitle: targetFragment.content_title,
        recommendations: [],
        totalCandidates: 0
      };
    }
    
    console.log(`[InternalLinkOptimizer] 類似Fragment検索完了: ${candidates?.length || 0}件`);
    
    // 3. 自分自身を除外 + スコア付与
    const filteredCandidates = (candidates || [])
      .filter((c: any) => c.fragment_id !== fragment_id)
      .slice(0, top_k);
    
    // 4. 推奨理由生成
    const recommendations: InternalLinkRecommendation[] = filteredCandidates.map((candidate: any) => ({
      fragmentId: candidate.fragment_id,
      completeUri: candidate.complete_uri || `#${candidate.fragment_id}`,
      contentTitle: candidate.content_title,
      similarityScore: candidate.similarity,
      reason: this.generateRecommendationReason(
        targetFragment.content_title,
        candidate.content_title,
        candidate.similarity
      )
    }));
    
    console.log(`[InternalLinkOptimizer] 内部リンク推奨完了: ${recommendations.length}件`);
    
    return {
      sourceFragmentId: fragment_id,
      sourceTitle: targetFragment.content_title,
      recommendations,
      totalCandidates: candidates?.length || 0
    };
  }
  
  /**
   * 推奨理由生成
   */
  private generateRecommendationReason(
    sourceTitle: string,
    targetTitle: string,
    similarity: number
  ): string {
    const percentage = (similarity * 100).toFixed(1);
    
    if (similarity >= 0.8) {
      return `"${sourceTitle}" と強く関連しています（類似度: ${percentage}%）。ユーザーにとって有益な補足情報です。`;
    } else if (similarity >= 0.7) {
      return `"${sourceTitle}" と意味的に関連しています（類似度: ${percentage}%）。関連トピックとして紹介できます。`;
    } else if (similarity >= 0.6) {
      return `"${sourceTitle}" と部分的に関連しています（類似度: ${percentage}%）。補足情報として検討してください。`;
    } else {
      return `"${sourceTitle}" との関連性があります（類似度: ${percentage}%）。`;
    }
  }
  
  /**
   * 全Fragment間の内部リンク推奨マトリクス構築
   * 
   * すべてのFragmentについて、推奨内部リンクを一括取得
   */
  async buildInternalLinkMatrix(params: {
    tenant_id: string;
    analysis_id: string;
    top_k?: number;
    match_threshold?: number;
  }): Promise<{
    matrix: Map<string, InternalLinkRecommendationsResult>;
    totalFragments: number;
  }> {
    const { tenant_id, analysis_id, top_k = 5, match_threshold = 0.6 } = params;
    
    console.log(`[InternalLinkOptimizer] 内部リンクマトリクス構築開始`);
    
    // 1. 全Fragment IDを取得
    const { data: allFragments, error: listError } = await this.supabase
      .from('clavi_fragment_vectors')
      .select('fragment_id, content_title')
      .eq('tenant_id', tenant_id)
      .eq('analysis_id', analysis_id);
    
    if (listError || !allFragments) {
      throw new Error(
        `[InternalLinkOptimizer] Failed to list fragments: ${listError?.message}`
      );
    }
    
    console.log(`[InternalLinkOptimizer] 全Fragment取得完了: ${allFragments.length}個`);
    
    // 2. 各Fragmentについて推奨リンクを取得
    const matrix = new Map<string, InternalLinkRecommendationsResult>();
    
    for (let i = 0; i < allFragments.length; i++) {
      const fragment = allFragments[i];
      
      try {
        const recommendations = await this.recommendInternalLinks({
          tenant_id,
          analysis_id,
          fragment_id: fragment.fragment_id,
          top_k,
          match_threshold
        });
        
        matrix.set(fragment.fragment_id, recommendations);
        
        // 進捗表示（10%ごと）
        if ((i + 1) % Math.max(1, Math.floor(allFragments.length / 10)) === 0) {
          const progress = Math.round(((i + 1) / allFragments.length) * 100);
          console.log(`[InternalLinkOptimizer] 進捗: ${progress}% (${i + 1}/${allFragments.length})`);
        }
        
        // レート制限対策: 100ms待機
        await this.sleep(100);
        
      } catch (error) {
        console.error(`[InternalLinkOptimizer] エラー: ${fragment.fragment_id}`, error);
        // エラーが発生しても処理継続
        continue;
      }
    }
    
    console.log(`[InternalLinkOptimizer] 内部リンクマトリクス構築完了`);
    
    return {
      matrix,
      totalFragments: allFragments.length
    };
  }
  
  /**
   * 内部リンク最適化レポート生成
   */
  generateOptimizationReport(
    matrix: Map<string, InternalLinkRecommendationsResult>
  ): {
    summary: {
      totalFragments: number;
      averageRecommendations: number;
      strongLinks: number; // 類似度0.8以上
      moderateLinks: number; // 類似度0.6-0.8
    };
    topOpportunities: Array<{
      fragmentId: string;
      fragmentTitle: string;
      recommendationCount: number;
      avgSimilarity: number;
    }>;
  } {
    const allRecommendations = Array.from(matrix.values());
    
    let totalRecommendations = 0;
    let strongLinks = 0;
    let moderateLinks = 0;
    
    const opportunities: Array<{
      fragmentId: string;
      fragmentTitle: string;
      recommendationCount: number;
      avgSimilarity: number;
    }> = [];
    
    for (const result of allRecommendations) {
      totalRecommendations += result.recommendations.length;
      
      let totalSimilarity = 0;
      for (const rec of result.recommendations) {
        totalSimilarity += rec.similarityScore;
        
        if (rec.similarityScore >= 0.8) {
          strongLinks++;
        } else if (rec.similarityScore >= 0.6) {
          moderateLinks++;
        }
      }
      
      const avgSimilarity = result.recommendations.length > 0
        ? totalSimilarity / result.recommendations.length
        : 0;
      
      opportunities.push({
        fragmentId: result.sourceFragmentId,
        fragmentTitle: result.sourceTitle,
        recommendationCount: result.recommendations.length,
        avgSimilarity
      });
    }
    
    // 推奨数が多い順にソート
    opportunities.sort((a, b) => b.recommendationCount - a.recommendationCount);
    
    return {
      summary: {
        totalFragments: matrix.size,
        averageRecommendations: matrix.size > 0
          ? Math.round(totalRecommendations / matrix.size * 10) / 10
          : 0,
        strongLinks,
        moderateLinks
      },
      topOpportunities: opportunities.slice(0, 10) // 上位10件
    };
  }
  
  /**
   * 待機用ヘルパー（レート制限対策）
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

