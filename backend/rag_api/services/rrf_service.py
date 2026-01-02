"""
Reciprocal Rank Fusion (RRF) Service

Phase 3: RRF実装
- Vector検索とBM25検索の結果を統合
- RRFスコアに基づいて再ランキング

References:
- Cormack, G. V., Clarke, C. L., & Buettcher, S. (2009). Reciprocal Rank Fusion outperforms condorcet and individual rank learning methods.
"""

from typing import List, Dict, Any


class ReciprocalRankFusionService:
    """
    RRF (Reciprocal Rank Fusion) サービス
    
    複数の検索結果を統合して、より精度の高いランキングを生成
    """
    
    def __init__(self, k: int = 60):
        """
        初期化
        
        Args:
            k: RRFの定数パラメータ（デフォルト: 60）
        """
        self.k = k
    
    def fuse_results(
        self,
        vector_results: List[Dict[str, Any]],
        bm25_results: List[Dict[str, Any]],
        vector_weight: float = 1.0,
        bm25_weight: float = 1.0
    ) -> List[Dict[str, Any]]:
        """
        Vector検索とBM25検索の結果をRRFで統合
        
        Args:
            vector_results: Vector検索結果（similarity順）
            bm25_results: BM25検索結果（BM25スコア順）
            vector_weight: Vector検索の重み（デフォルト: 1.0）
            bm25_weight: BM25検索の重み（デフォルト: 1.0）
        
        Returns:
            RRFスコア順にソートされた統合結果
        """
        # fragment_id ごとの RRFスコアを計算
        rrf_scores: Dict[str, Dict[str, Any]] = {}
        
        # Vector検索結果からスコア計算
        for rank, result in enumerate(vector_results, start=1):
            fragment_id = result.get('fragment_id')
            if not fragment_id:
                continue
            
            rrf_score = vector_weight / (self.k + rank)
            
            if fragment_id not in rrf_scores:
                rrf_scores[fragment_id] = {
                    'fragment_id': fragment_id,
                    'rrf_score': 0.0,
                    'vector_rank': None,
                    'bm25_rank': None,
                    'vector_similarity': None,
                    'bm25_score': None,
                    'content_title': result.get('content_title'),
                    'page_path': result.get('page_path'),
                    'complete_uri': result.get('complete_uri'),
                    'content': result.get('content'),
                }
            
            rrf_scores[fragment_id]['rrf_score'] += rrf_score
            rrf_scores[fragment_id]['vector_rank'] = rank
            rrf_scores[fragment_id]['vector_similarity'] = result.get('similarity')
        
        # BM25検索結果からスコア計算
        for rank, result in enumerate(bm25_results, start=1):
            fragment_id = result.get('fragment_id')
            if not fragment_id:
                continue
            
            rrf_score = bm25_weight / (self.k + rank)
            
            if fragment_id not in rrf_scores:
                rrf_scores[fragment_id] = {
                    'fragment_id': fragment_id,
                    'rrf_score': 0.0,
                    'vector_rank': None,
                    'bm25_rank': None,
                    'vector_similarity': None,
                    'bm25_score': None,
                    'content_title': result.get('content_title'),
                    'page_path': result.get('page_path'),
                    'complete_uri': result.get('complete_uri'),
                    'content': result.get('content'),
                }
            
            rrf_scores[fragment_id]['rrf_score'] += rrf_score
            rrf_scores[fragment_id]['bm25_rank'] = rank
            rrf_scores[fragment_id]['bm25_score'] = result.get('bm25_score')
        
        # RRFスコアでソート
        fused_results = sorted(
            rrf_scores.values(),
            key=lambda x: x['rrf_score'],
            reverse=True
        )
        
        return fused_results
    
    def get_fusion_stats(
        self,
        fused_results: List[Dict[str, Any]],
        top_k: int = 10
    ) -> Dict[str, Any]:
        """
        RRF統合の統計情報を取得
        
        Args:
            fused_results: RRF統合結果
            top_k: 統計を取る上位k件（デフォルト: 10）
        
        Returns:
            統計情報（vector only, bm25 only, both の割合等）
        """
        top_results = fused_results[:top_k]
        
        vector_only_count = 0
        bm25_only_count = 0
        both_count = 0
        
        for result in top_results:
            has_vector = result['vector_rank'] is not None
            has_bm25 = result['bm25_rank'] is not None
            
            if has_vector and has_bm25:
                both_count += 1
            elif has_vector:
                vector_only_count += 1
            elif has_bm25:
                bm25_only_count += 1
        
        stats = {
            'top_k': top_k,
            'total_count': len(top_results),
            'vector_only_count': vector_only_count,
            'bm25_only_count': bm25_only_count,
            'both_count': both_count,
            'vector_only_ratio': vector_only_count / len(top_results) if top_results else 0,
            'bm25_only_ratio': bm25_only_count / len(top_results) if top_results else 0,
            'both_ratio': both_count / len(top_results) if top_results else 0,
        }
        
        return stats

