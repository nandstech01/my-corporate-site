"""
BM25 Service

Phase 2: BM25再ランキング
- PostgreSQL Full-Text Search を使用
- Vector検索結果の再ランキング
- スコア統合による精度向上
"""

from typing import List, Dict, Any, Tuple
from django.db import connection
import numpy as np


class BM25Service:
    """
    BM25再ランキングサービス
    
    PostgreSQL Full-Text Searchを使用して、
    Vector検索結果をBM25スコアで再ランキング
    """
    
    def __init__(self, k1: float = 1.5, b: float = 0.75, alpha: float = 0.7):
        """
        初期化
        
        Args:
            k1: BM25のk1パラメータ（用語頻度の飽和度）
            b: BM25のbパラメータ（文書長の正規化）
            alpha: スコア統合の重み（Vector重視度）
                   final_score = alpha * vector_sim + (1-alpha) * bm25_score
        """
        self.k1 = k1
        self.b = b
        self.alpha = alpha
    
    def rerank_results(
        self,
        query: str,
        results: List[Dict[str, Any]],
        source: str = 'fragment'
    ) -> List[Dict[str, Any]]:
        """
        Vector検索結果をBM25で再ランキング
        
        Args:
            query: 検索クエリ
            results: Vector検索結果
            source: 検索ソース ('fragment', 'company', etc.)
        
        Returns:
            再ランキングされた結果（BM25スコア統合済み）
        """
        if not results:
            return results
        
        # Fragment IDsを抽出
        fragment_ids = [r.get('fragment_id') for r in results if r.get('fragment_id')]
        
        if not fragment_ids:
            return results
        
        # BM25スコアを計算
        bm25_scores = self._calculate_bm25_scores(query, fragment_ids, source)
        
        # Vector SimilarityとBM25スコアを統合
        reranked_results = []
        for result in results:
            fragment_id = result.get('fragment_id')
            vector_sim = result.get('similarity', 0.0)
            bm25_score = bm25_scores.get(fragment_id, 0.0)
            
            # スコア統合
            combined_score = self.alpha * vector_sim + (1 - self.alpha) * bm25_score
            
            # 結果にBM25情報を追加
            reranked_result = result.copy()
            reranked_result['bm25_score'] = bm25_score
            reranked_result['combined_score'] = combined_score
            reranked_result['original_similarity'] = vector_sim
            
            reranked_results.append(reranked_result)
        
        # Combined scoreで再ソート
        reranked_results.sort(key=lambda x: x['combined_score'], reverse=True)
        
        return reranked_results
    
    def _calculate_bm25_scores(
        self,
        query: str,
        fragment_ids: List[str],
        source: str
    ) -> Dict[str, float]:
        """
        BM25スコアを計算
        
        Args:
            query: 検索クエリ
            fragment_ids: 対象のFragment IDs
            source: 検索ソース
        
        Returns:
            {fragment_id: normalized_bm25_score}
        """
        table_name = self._get_table_name(source)
        
        # PostgreSQL Full-Text Searchを使用
        # ts_rank_cd は BM25に近いランキング関数
        with connection.cursor() as cursor:
            placeholders = ','.join(['%s'] * len(fragment_ids))
            
            # 日本語対応のため、'simple' configurationを使用
            # ts_rank_cd でBM25ライクなスコアリング
            sql = f"""
                SELECT
                    fragment_id,
                    ts_rank_cd(
                        to_tsvector('simple', COALESCE(content, '') || ' ' || COALESCE(content_title, '')),
                        plainto_tsquery('simple', %s),
                        32  -- normalization flag: document length
                    ) as bm25_score
                FROM {table_name}
                WHERE fragment_id IN ({placeholders})
            """
            
            cursor.execute(sql, [query] + fragment_ids)
            rows = cursor.fetchall()
            
            # スコアを正規化 (0.0 ~ 1.0)
            scores = {row[0]: float(row[1]) for row in rows}
            
            if scores:
                max_score = max(scores.values())
                if max_score > 0:
                    scores = {k: v / max_score for k, v in scores.items()}
            
            return scores
    
    def _get_table_name(self, source: str) -> str:
        """ソース名からテーブル名を取得"""
        table_mapping = {
            'fragment': 'fragment_vectors',
            'company': 'company_vectors',
            'trend': 'trend_vectors',
            'youtube': 'youtube_vectors',
            'kenji': 'knowledge_vectors'
        }
        return table_mapping.get(source, 'fragment_vectors')
    
    def batch_rerank(
        self,
        query: str,
        source_results: Dict[str, List[Dict[str, Any]]]
    ) -> List[Dict[str, Any]]:
        """
        複数ソースの結果をまとめて再ランキング
        
        Args:
            query: 検索クエリ
            source_results: {source: [results]}
        
        Returns:
            統合・再ランキングされた結果
        """
        all_reranked = []
        
        for source, results in source_results.items():
            reranked = self.rerank_results(query, results, source)
            all_reranked.extend(reranked)
        
        # 全体を combined_score でソート
        all_reranked.sort(key=lambda x: x['combined_score'], reverse=True)
        
        return all_reranked

