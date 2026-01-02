"""
RAG Search Log Models

Phase 1: 検索ログ記録
- RAG検索の実行ログを記録
- 検索パフォーマンス分析用
- Grafana可視化用

Phase 2: ML評価基盤
- 評価データセット管理
- 評価結果記録
- Precision@5, MRR計算
"""
from django.db import models
from django.utils import timezone
from django.contrib.postgres.fields import ArrayField


class RAGSearchLog(models.Model):
    """
    RAG検索ログモデル
    既存のfragment_vectors、company_vectors等を読み取るのみ（書き込みなし）
    """
    
    # 検索情報
    query = models.TextField(verbose_name='検索クエリ')
    sources = models.JSONField(verbose_name='検索ソース', default=list)  # ['fragment', 'company', 'trend', 'youtube', 'kenji']
    
    # 検索結果
    results_count = models.IntegerField(verbose_name='結果件数', default=0)
    top_similarity = models.FloatField(verbose_name='最高類似度', null=True, blank=True)
    avg_similarity = models.FloatField(verbose_name='平均類似度', null=True, blank=True)
    
    # パフォーマンス
    search_duration_ms = models.IntegerField(verbose_name='検索時間(ms)', null=True, blank=True)
    
    # メタデータ
    created_at = models.DateTimeField(verbose_name='作成日時', default=timezone.now, db_index=True)
    ip_address = models.GenericIPAddressField(verbose_name='IPアドレス', null=True, blank=True)
    user_agent = models.TextField(verbose_name='User Agent', blank=True)
    
    class Meta:
        db_table = 'rag_search_logs'
        verbose_name = 'RAG検索ログ'
        verbose_name_plural = 'RAG検索ログ'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['query']),
        ]
    
    def __str__(self):
        return f"{self.query[:50]} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"


class RAGDataStatistics(models.Model):
    """
    RAGデータ統計モデル（日次集計用）
    Grafanaダッシュボード用の集計データ
    """
    
    # 統計対象
    source_type = models.CharField(verbose_name='ソース種別', max_length=50)  # 'fragment', 'company', etc.
    stat_date = models.DateField(verbose_name='統計日', default=timezone.now, db_index=True)
    
    # 統計データ
    total_vectors = models.IntegerField(verbose_name='総ベクトル数', default=0)
    total_searches = models.IntegerField(verbose_name='総検索回数', default=0)
    avg_similarity = models.FloatField(verbose_name='平均類似度', default=0.0)
    avg_duration_ms = models.FloatField(verbose_name='平均検索時間(ms)', default=0.0)
    
    # タイムスタンプ
    created_at = models.DateTimeField(verbose_name='作成日時', auto_now_add=True)
    updated_at = models.DateTimeField(verbose_name='更新日時', auto_now=True)
    
    class Meta:
        db_table = 'rag_data_statistics'
        verbose_name = 'RAGデータ統計'
        verbose_name_plural = 'RAGデータ統計'
        unique_together = [['source_type', 'stat_date']]
        ordering = ['-stat_date']
    
    def __str__(self):
        return f"{self.source_type} - {self.stat_date}"


# ============================================================================
# Phase 2: ML評価基盤モデル
# ============================================================================

class EvaluationQuery(models.Model):
    """
    評価クエリモデル
    ML評価用のテストクエリと正解データを管理
    """
    
    # クエリ情報
    query = models.TextField(verbose_name='検索クエリ')
    expected_fragment_ids = ArrayField(
        models.CharField(max_length=255),
        verbose_name='正解のFragment ID',
        help_text='正解として期待されるFragment IDのリスト'
    )
    
    # 分類情報
    category = models.CharField(
        verbose_name='カテゴリ',
        max_length=50,
        help_text='author, technical, general等'
    )
    difficulty = models.IntegerField(
        verbose_name='難易度',
        default=1,
        help_text='1（簡単）〜5（難しい）'
    )
    
    # 説明
    description = models.TextField(
        verbose_name='説明',
        blank=True,
        help_text='このクエリの目的や期待される結果の説明'
    )
    
    # データセットバージョン管理（Phase 4 Week 2）
    dataset_version = models.CharField(
        verbose_name='データセットバージョン',
        max_length=50,
        default='v1.0',
        help_text='評価データセットのバージョン（例: v1.0-reviewed, v2.0-draft）',
        db_index=True
    )
    
    # タイムスタンプ
    created_at = models.DateTimeField(verbose_name='作成日時', auto_now_add=True)
    updated_at = models.DateTimeField(verbose_name='更新日時', auto_now=True)
    
    class Meta:
        db_table = 'evaluation_queries'
        verbose_name = '評価クエリ'
        verbose_name_plural = '評価クエリ'
        ordering = ['category', 'difficulty', 'id']
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['difficulty']),
            models.Index(fields=['dataset_version']),
        ]
    
    def __str__(self):
        return f"{self.query[:50]} ({self.category})"


class EvaluationResult(models.Model):
    """
    評価結果モデル
    各評価実行の結果を記録
    """
    
    # 評価対象
    query = models.ForeignKey(
        EvaluationQuery,
        on_delete=models.CASCADE,
        verbose_name='評価クエリ',
        related_name='results'
    )
    
    # バリアント情報
    variant = models.CharField(
        verbose_name='バリアント',
        max_length=50,
        help_text='baseline, bm25, optimized等'
    )
    
    # 評価指標
    precision_at_5 = models.FloatField(
        verbose_name='Precision@5',
        null=True,
        blank=True,
        help_text='上位5件の精度（0.0〜1.0）'
    )
    mrr = models.FloatField(
        verbose_name='MRR',
        null=True,
        blank=True,
        help_text='Mean Reciprocal Rank（0.0〜1.0）'
    )
    recall_at_20 = models.FloatField(
        verbose_name='Recall@20',
        null=True,
        blank=True,
        help_text='上位20件の網羅性（0.0〜1.0）'
    )
    ndcg = models.FloatField(
        verbose_name='NDCG',
        null=True,
        blank=True,
        help_text='Normalized Discounted Cumulative Gain（0.0〜1.0）'
    )
    
    # パフォーマンス
    search_duration_ms = models.IntegerField(
        verbose_name='検索時間(ms)',
        null=True,
        blank=True
    )
    
    # 検索結果の詳細（JSON形式で保存）
    results_json = models.JSONField(
        verbose_name='検索結果詳細',
        null=True,
        blank=True,
        help_text='検索結果の詳細（デバッグ用）'
    )
    
    # 評価データセットバージョン管理
    dataset_version = models.CharField(
        verbose_name='データセットバージョン',
        max_length=50,
        default='v1.0',
        help_text='評価データセットのバージョン（例: v1.0, v2.0）'
    )
    
    # 評価実行単位の識別子
    run_id = models.UUIDField(
        verbose_name='実行ID',
        null=True,
        blank=True,
        help_text='同一run_idで複数バリアントを比較可能'
    )
    
    # Phase 4: MLflow統合
    mlflow_run_id = models.CharField(
        verbose_name='MLflow Run ID',
        max_length=64,
        null=True,
        blank=True,
        help_text='MLflow Tracking Server上のrun_id（相互参照用）'
    )
    
    # タイムスタンプ
    created_at = models.DateTimeField(verbose_name='作成日時', auto_now_add=True, db_index=True)
    
    class Meta:
        db_table = 'evaluation_results'
        verbose_name = '評価結果'
        verbose_name_plural = '評価結果'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['variant']),
            models.Index(fields=['-created_at']),
            models.Index(fields=['query', 'variant']),
            models.Index(fields=['dataset_version']),
            models.Index(fields=['run_id']),
        ]
    
    def __str__(self):
        return f"{self.query.query[:30]} - {self.variant} (P@5: {self.precision_at_5})"

