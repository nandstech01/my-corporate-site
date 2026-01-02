"""
RAG API Admin
"""
from django.contrib import admin
from .models import RAGSearchLog, RAGDataStatistics, EvaluationQuery, EvaluationResult


@admin.register(RAGSearchLog)
class RAGSearchLogAdmin(admin.ModelAdmin):
    list_display = ['query', 'sources', 'results_count', 'top_similarity', 'search_duration_ms', 'created_at']
    list_filter = ['created_at', 'sources']
    search_fields = ['query']
    readonly_fields = ['created_at']
    ordering = ['-created_at']


@admin.register(RAGDataStatistics)
class RAGDataStatisticsAdmin(admin.ModelAdmin):
    list_display = ['source_type', 'stat_date', 'total_vectors', 'total_searches', 'avg_similarity', 'avg_duration_ms']
    list_filter = ['source_type', 'stat_date']
    ordering = ['-stat_date']


@admin.register(EvaluationQuery)
class EvaluationQueryAdmin(admin.ModelAdmin):
    list_display = ['query', 'category', 'difficulty', 'dataset_version', 'created_at']
    list_filter = ['category', 'difficulty', 'dataset_version', 'created_at']
    search_fields = ['query', 'description']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['dataset_version', 'category', 'difficulty', 'id']
    
    fieldsets = (
        ('クエリ情報', {
            'fields': ('query', 'expected_fragment_ids', 'description')
        }),
        ('分類情報', {
            'fields': ('category', 'difficulty', 'dataset_version')
        }),
        ('タイムスタンプ', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(EvaluationResult)
class EvaluationResultAdmin(admin.ModelAdmin):
    list_display = ['query', 'variant', 'precision_at_5', 'mrr', 'ndcg', 'recall_at_20', 'mlflow_run_id', 'created_at']
    list_filter = ['variant', 'query__dataset_version', 'query__category', 'created_at']
    search_fields = ['query__query', 'mlflow_run_id']
    readonly_fields = ['created_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('評価情報', {
            'fields': ('query', 'variant', 'run_id', 'dataset_version')
        }),
        ('評価メトリクス', {
            'fields': ('precision_at_5', 'mrr', 'ndcg', 'recall_at_20', 'search_duration_ms')
        }),
        ('検索結果', {
            'fields': ('results_json',),
            'classes': ('collapse',)
        }),
        ('MLflow連携', {
            'fields': ('mlflow_run_id', 'created_at')
        }),
    )

