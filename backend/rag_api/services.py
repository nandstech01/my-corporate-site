"""
RAG Search Services

Phase 1: RAG統一検索サービス
- 既存のfragment_vectors、company_vectors等から検索
- 読み取り専用（書き込みなし）
- OpenAI Embeddings使用
"""
import time
from typing import List, Dict, Any, Optional
from django.conf import settings
from django.db import connection
from openai import OpenAI


class RAGSearchService:
    """
    RAG統一検索サービス
    既存のSupabase RAGテーブルから検索（読み取り専用）
    """
    
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.embedding_model = settings.RAG_CONFIG['EMBEDDING_MODEL']
        self.embedding_dimensions = settings.RAG_CONFIG['EMBEDDING_DIMENSIONS']
        self.top_k = settings.RAG_CONFIG['TOP_K']
        self.max_results = settings.RAG_CONFIG['MAX_RESULTS']
    
    def hybrid_search(
        self,
        query: str,
        sources: List[str],
        limit: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        ハイブリッド検索（top-k固定、閾値なし）
        
        Args:
            query: 検索クエリ
            sources: 検索ソース ['fragment', 'company', 'trend', 'youtube', 'kenji']
            limit: 最終結果の最大件数（デフォルト: settings.RAG_CONFIG['MAX_RESULTS']）
        
        Returns:
            検索結果と統計情報
        """
        start_time = time.time()
        
        # クエリのベクトル化
        query_embedding = self._get_embedding(query)
        
        # 各ソースから検索（top-k固定）
        all_results = []
        for source in sources:
            if source == 'fragment':
                results = self._search_fragment_vectors(query, query_embedding)
            elif source == 'company':
                results = self._search_company_vectors(query, query_embedding)
            elif source == 'trend':
                results = self._search_trend_vectors(query, query_embedding)
            elif source == 'youtube':
                results = self._search_youtube_vectors(query, query_embedding)
            elif source == 'kenji':
                results = self._search_kenji_thoughts(query, query_embedding)
            else:
                continue
            
            all_results.extend(results)
        
        # 類似度でソート
        all_results.sort(key=lambda x: x['similarity'], reverse=True)
        
        # 統計情報
        search_duration = int((time.time() - start_time) * 1000)  # ms
        
        return {
            'query': query,
            'sources': sources,
            'results': all_results[:limit or self.max_results],
            'total_count': len(all_results),
            'search_duration_ms': search_duration,
            'top_similarity': all_results[0]['similarity'] if all_results else None,
            'avg_similarity': sum(r['similarity'] for r in all_results) / len(all_results) if all_results else None
        }
    
    def _get_embedding(self, text: str) -> List[float]:
        """OpenAI Embeddingsでベクトル化"""
        response = self.client.embeddings.create(
            input=text,
            model=self.embedding_model,
            dimensions=self.embedding_dimensions  # 1536次元に固定
        )
        return response.data[0].embedding
    
    def _search_fragment_vectors(
        self,
        query: str,
        query_embedding: List[float]
    ) -> List[Dict[str, Any]]:
        """Fragment Vectorsから検索（top-k固定、閾値なし）"""
        
        # ベクトルを文字列形式に変換
        embedding_str = '[' + ','.join(map(str, query_embedding)) + ']'
        
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT
                    fragment_id,
                    complete_uri,
                    page_path,
                    content_title,
                    content,
                    1 - (embedding <=> %s::vector) as similarity
                FROM fragment_vectors
                ORDER BY similarity DESC
                LIMIT %s
            """, [embedding_str, self.top_k])
            
            results = []
            for row in cursor.fetchall():
                results.append({
                    'source': 'fragment',
                    'fragment_id': row[0],
                    'url': row[1],
                    'page_path': row[2],
                    'title': row[3],
                    'content': row[4][:200],  # 200文字まで
                    'similarity': float(row[5])
                })
            
            return results
    
    def _search_company_vectors(
        self,
        query: str,
        query_embedding: List[float]
    ) -> List[Dict[str, Any]]:
        """Company Vectorsから検索（top-k固定、閾値なし）"""
        
        # ベクトルを文字列形式に変換
        embedding_str = '[' + ','.join(map(str, query_embedding)) + ']'
        
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT
                    id,
                    page_slug,
                    section_title,
                    content_chunk,
                    1 - (embedding <=> %s::vector) as similarity
                FROM company_vectors
                ORDER BY similarity DESC
                LIMIT %s
            """, [embedding_str, self.top_k])
            
            results = []
            for row in cursor.fetchall():
                results.append({
                    'source': 'company',
                    'id': row[0],
                    'page_slug': row[1],
                    'title': row[2],
                    'content': row[3][:200],
                    'similarity': float(row[4])
                })
            
            return results
    
    def _search_trend_vectors(
        self,
        query: str,
        query_embedding: List[float]
    ) -> List[Dict[str, Any]]:
        """Trend Vectorsから検索（top-k固定、閾値なし）"""
        
        # ベクトルを文字列形式に変換
        embedding_str = '[' + ','.join(map(str, query_embedding)) + ']'
        
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT
                    id,
                    title,
                    content_chunk,
                    1 - (embedding <=> %s::vector) as similarity
                FROM trend_vectors
                ORDER BY similarity DESC
                LIMIT %s
            """, [embedding_str, self.top_k])
            
            results = []
            for row in cursor.fetchall():
                results.append({
                    'source': 'trend',
                    'id': row[0],
                    'title': row[1],
                    'content': row[2][:200],
                    'similarity': float(row[3])
                })
            
            return results
    
    def _search_youtube_vectors(
        self,
        query: str,
        query_embedding: List[float]
    ) -> List[Dict[str, Any]]:
        """YouTube Vectorsから検索（top-k固定、閾値なし）"""
        
        # ベクトルを文字列形式に変換
        embedding_str = '[' + ','.join(map(str, query_embedding)) + ']'
        
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT
                    id,
                    video_id,
                    title,
                    content_chunk,
                    1 - (embedding <=> %s::vector) as similarity
                FROM youtube_vectors
                ORDER BY similarity DESC
                LIMIT %s
            """, [embedding_str, self.top_k])
            
            results = []
            for row in cursor.fetchall():
                results.append({
                    'source': 'youtube',
                    'id': row[0],
                    'video_id': row[1],
                    'title': row[2],
                    'content': row[3][:200],
                    'similarity': float(row[4])
                })
            
            return results
    
    def _search_kenji_thoughts(
        self,
        query: str,
        query_embedding: List[float]
    ) -> List[Dict[str, Any]]:
        """Kenji Thoughtsから検索（top-k固定、閾値なし）"""
        
        # ベクトルを文字列形式に変換
        embedding_str = '[' + ','.join(map(str, query_embedding)) + ']'
        
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT
                    id,
                    thought_id,
                    title,
                    content,
                    1 - (embedding <=> %s::vector) as similarity
                FROM kenji_thoughts
                ORDER BY similarity DESC
                LIMIT %s
            """, [embedding_str, self.top_k])
            
            results = []
            for row in cursor.fetchall():
                results.append({
                    'source': 'kenji',
                    'id': row[0],
                    'thought_id': row[1],
                    'title': row[2],
                    'content': row[3][:200],
                    'similarity': float(row[4])
                })
            
            return results
    
    def get_source_statistics(self) -> Dict[str, Any]:
        """各RAGソースの統計情報を取得"""
        stats = {}
        
        with connection.cursor() as cursor:
            # Fragment Vectors
            cursor.execute("SELECT COUNT(*), pg_size_pretty(pg_total_relation_size('fragment_vectors')) FROM fragment_vectors")
            row = cursor.fetchone()
            stats['fragment'] = {'count': row[0], 'size': row[1]}
            
            # Company Vectors
            cursor.execute("SELECT COUNT(*), pg_size_pretty(pg_total_relation_size('company_vectors')) FROM company_vectors")
            row = cursor.fetchone()
            stats['company'] = {'count': row[0], 'size': row[1]}
            
            # Trend Vectors
            cursor.execute("SELECT COUNT(*), pg_size_pretty(pg_total_relation_size('trend_vectors')) FROM trend_vectors")
            row = cursor.fetchone()
            stats['trend'] = {'count': row[0], 'size': row[1]}
            
            # YouTube Vectors
            cursor.execute("SELECT COUNT(*), pg_size_pretty(pg_total_relation_size('youtube_vectors')) FROM youtube_vectors")
            row = cursor.fetchone()
            stats['youtube'] = {'count': row[0], 'size': row[1]}
            
            # Kenji Thoughts
            cursor.execute("SELECT COUNT(*), pg_size_pretty(pg_total_relation_size('kenji_thoughts')) FROM kenji_thoughts")
            row = cursor.fetchone()
            stats['kenji'] = {'count': row[0], 'size': row[1]}
        
        return stats

