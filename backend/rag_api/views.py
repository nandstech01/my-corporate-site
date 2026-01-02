"""
RAG API Views

Phase 1: RAG統一検索API
- POST /api/rag/search - ハイブリッド検索
- GET /api/rag/stats - RAGデータ統計
- GET /api/rag/health - ヘルスチェック
"""
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import RAGSearchLog
from .services.rag_search_service import RAGSearchService


@api_view(['POST'])
def hybrid_search(request):
    """
    RAGハイブリッド検索（top-k固定、閾値なし）
    
    POST /api/rag/search
    {
        "query": "AIエージェント開発について教えてください",
        "sources": ["fragment", "company"],
        "limit": 10
    }
    """
    try:
        # リクエスト検証
        query = request.data.get('query')
        if not query:
            return Response(
                {'error': 'query is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        sources = request.data.get('sources', ['fragment'])
        limit = request.data.get('limit')
        
        # 検索実行
        rag_service = RAGSearchService()
        search_results = rag_service.hybrid_search(
            query=query,
            sources=sources,
            limit=limit
        )
        
        # 検索ログ記録
        try:
            RAGSearchLog.objects.create(
                query=query,
                sources=sources,
                results_count=search_results['total_count'],
                top_similarity=search_results['top_similarity'],
                avg_similarity=search_results['avg_similarity'],
                search_duration_ms=search_results['search_duration_ms'],
                ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
        except Exception as log_error:
            # ログ記録エラーは無視（検索結果は返す）
            print(f"検索ログ記録エラー: {log_error}")
        
        return Response({
            'success': True,
            'data': search_results
        })
    
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def get_statistics(request):
    """
    RAGデータ統計取得
    
    GET /api/rag/stats
    """
    try:
        rag_service = RAGSearchService()
        stats = rag_service.get_source_statistics()
        
        # 検索ログ統計
        from django.db.models import Count, Avg
        from datetime import timedelta
        
        last_7_days = timezone.now() - timedelta(days=7)
        search_stats = RAGSearchLog.objects.filter(
            created_at__gte=last_7_days
        ).aggregate(
            total_searches=Count('id'),
            avg_similarity=Avg('avg_similarity'),
            avg_duration=Avg('search_duration_ms')
        )
        
        return Response({
            'success': True,
            'data': {
                'rag_sources': stats,
                'search_stats_last_7_days': search_stats
            }
        })
    
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def health_check(request):
    """
    ヘルスチェック
    
    GET /api/rag/health
    """
    try:
        # データベース接続確認
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        
        # OpenAI API確認（embedding生成テスト）
        rag_service = RAGSearchService()
        test_embedding = rag_service._get_embedding("test")
        
        return Response({
            'success': True,
            'status': 'healthy',
            'database': 'connected',
            'openai_api': 'connected',
            'embedding_dimensions': len(test_embedding),
            'timestamp': timezone.now().isoformat()
        })
    
    except Exception as e:
        return Response(
            {
                'success': False,
                'status': 'unhealthy',
                'error': str(e)
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )


def get_client_ip(request):
    """クライアントIPアドレス取得"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

