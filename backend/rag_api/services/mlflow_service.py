"""
MLflow統合サービス

評価実行をMLflowにロギングし、Django run_idと紐付ける。
Phase 4 Week 1: 最小で確実な実装
"""

import mlflow
import os
import logging
from typing import Dict, List, Optional
from django.conf import settings

logger = logging.getLogger(__name__)


class MLflowService:
    """MLflow Tracking Serverへの自動ログサービス"""
    
    def __init__(self):
        """
        MLflowクライアントを初期化
        
        環境変数 MLFLOW_TRACKING_URI が必要:
        - Docker内: http://mlflow:5000
        - ローカル実行: http://localhost:5000
        """
        self.tracking_uri = os.getenv('MLFLOW_TRACKING_URI', 'http://localhost:5000')
        mlflow.set_tracking_uri(self.tracking_uri)
        mlflow.set_experiment('rag-optimization')
        
        logger.info(f"MLflowService initialized with tracking_uri: {self.tracking_uri}")
    
    def log_evaluation_run(
        self,
        django_run_id: str,
        dataset_version: str,
        variant: str,
        params: Dict,
        metrics: Dict,
        category_metrics: Dict,
        embedding_dims_actual: int,
        index_fingerprint: str
    ) -> Optional[str]:
        """
        評価実行をMLflowにログ
        
        Args:
            django_run_id: Django側の run_id（UUID文字列）
            dataset_version: 評価データセットバージョン（例: "v1.0-reviewed"）
            variant: 検索variant（"baseline" / "bm25"）
            params: その他パラメータ（top_k, fusion_method等）
            metrics: 全体メトリクス（precision_at_5, mrr, ndcg_at_20, recall_at_20）
            category_metrics: カテゴリ別メトリクス（technical, general）
            embedding_dims_actual: 実測embedding次元数（len(embedding)）
            index_fingerprint: vectorインデックスのfingerprint
            
        Returns:
            mlflow_run_id: MLflow側のrun_id（文字列）、失敗時はNone
        
        Note:
            評価が失敗しても、MLflow runは残します（status="FAILED"）。
            これにより失敗パターンも監査でき、"壊れない実験管理"を実現します。
        """
        run = None
        try:
            # embedding_dims混在検知（fail-fast）
            if embedding_dims_actual <= 0:
                raise ValueError(f"Invalid embedding_dims_actual: {embedding_dims_actual}")
            
            # Run開始
            run = mlflow.start_run(run_name=f"{variant}-{dataset_version}")
            with run:
                # パラメータログ（必須7項目）
                mlflow.log_param('dataset_version', dataset_version)
                mlflow.log_param('variant', variant)
                mlflow.log_param('top_k', params.get('top_k', 20))
                mlflow.log_param('fusion_method', params.get('fusion_method', 'none'))
                mlflow.log_param('embedding_model', params.get('embedding_model', 'text-embedding-3-large'))
                mlflow.log_param('embedding_dims', embedding_dims_actual)  # 実測値
                mlflow.log_param('index_fingerprint', index_fingerprint)
                
                # メトリクスログ（全体4項目）
                mlflow.log_metric('precision_at_5', metrics['precision_at_5'])
                mlflow.log_metric('mrr', metrics['mrr'])
                mlflow.log_metric('ndcg_at_20', metrics['ndcg_at_20'])
                mlflow.log_metric('recall_at_20', metrics['recall_at_20'])
                
                # メトリクスログ（カテゴリ別4項目）
                mlflow.log_metric('technical.mrr', category_metrics['technical']['avg_mrr'])
                mlflow.log_metric('technical.ndcg_at_20', category_metrics['technical']['ndcg_at_20'])
                mlflow.log_metric('general.mrr', category_metrics['general']['avg_mrr'])
                mlflow.log_metric('general.ndcg_at_20', category_metrics['general']['ndcg_at_20'])
                
                # タグログ（相互参照用）
                mlflow.set_tag('phase', '4')
                mlflow.set_tag('experiment_type', 'rag_evaluation')
                mlflow.set_tag('django_run_id', django_run_id)
                
                # Phase 4 Week 2 Task 4: Grafana ↔ MLflow 相互参照
                mlflow.set_tag('grafana_url', f'http://localhost:3001/d/rag-overview?var-run_id={django_run_id}')
                mlflow.set_tag('django_admin_url', f'http://localhost:8000/admin/rag_api/evaluationresult/?run_id={django_run_id}')
                
                # 成功時のステータスログ
                mlflow.set_tag('status', 'SUCCESS')
                
                mlflow_run_id = run.info.run_id
                logger.info(f"MLflow run logged successfully: {mlflow_run_id} (django_run_id: {django_run_id})")
                
                return mlflow_run_id
        
        except Exception as e:
            logger.error(f"Failed to log MLflow run for django_run_id {django_run_id}: {e}")
            
            # failed runを残す（監査可能にする）
            if run:
                try:
                    mlflow.set_tag('status', 'FAILED')
                    # error_messageは先頭1000文字に切る（MLflowタグ上限対策）
                    error_message = str(e)[:1000]
                    mlflow.set_tag('error_message', error_message)
                    mlflow.log_param('django_run_id', django_run_id)  # 最低限の紐付け
                    logger.warning(f"MLflow run marked as FAILED: {run.info.run_id}")
                except:
                    pass  # failed run記録も失敗した場合は諦める
            
            # Week 1: fail-fast（例外を再送出）
            raise
    
    def get_actual_embedding_dims(self, embedding: List[float]) -> int:
        """
        embedding次元数を実測
        
        Args:
            embedding: OpenAI embedding API結果のベクトル
            
        Returns:
            次元数（len(embedding)）
        """
        dims = len(embedding)
        if dims <= 0:
            raise ValueError(f"Invalid embedding dimensions: {dims}")
        return dims
    
    def get_index_fingerprint(self) -> str:
        """
        現在のvectorインデックスのfingerprintを取得
        
        フォーマット: `index_build:<identifier>`
        
        Week 1実装: ハードコード（暫定）
        Week 2以降: fragment_vectorsテーブルのメタデータから取得、またはハッシュ計算
        
        Returns:
            index_fingerprint（例: "index_build:v1.0-2025-12-29"）
        """
        # TODO: Week 2で動的取得に変更
        # 将来の自動生成時も同じフォーマット（index_build:<run_id>）で置換可能
        return "index_build:v1.0-2025-12-29"

