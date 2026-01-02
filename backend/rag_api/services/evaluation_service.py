"""
Evaluation Service

Phase 2: ML評価基盤
- Precision@k: 上位k件の精度評価
- MRR: Mean Reciprocal Rank
- 評価データセットを使用した自動評価
"""

from typing import List, Dict, Any, Optional
import uuid
import numpy as np
import logging
from django.conf import settings

from rag_api.models import EvaluationQuery, EvaluationResult
from rag_api.services.rag_search_service import RAGSearchService

logger = logging.getLogger(__name__)


class EvaluationService:
    """
    RAG評価サービス
    
    Phase 2: Precision@5, MRR
    Phase 3: NDCG, A/Bテスト（拡張予定）
    """
    
    def __init__(self):
        """初期化"""
        self.rag_service = RAGSearchService()
    
    def evaluate_precision_at_k(
        self,
        results: List[Dict[str, Any]],
        expected_ids: List[str],
        k: int = 5
    ) -> float:
        """
        Precision@k: 上位k件に正解がいくつ含まれるか
        
        Args:
            results: 検索結果 [{'fragment_id': '...', ...}, ...]
            expected_ids: 正解のFragment ID
            k: 上位何件を評価するか
        
        Returns:
            Precision@k (0.0 ~ 1.0)
        
        Example:
            正解: ['a', 'b', 'c']
            結果TOP5: ['a', 'x', 'b', 'y', 'z']
            → Precision@5 = 2 / 5 = 0.4
        """
        if k <= 0:
            return 0.0
        
        # 上位k件のFragment IDを取得
        top_k_ids = [r.get('fragment_id') for r in results[:k] if r.get('fragment_id')]
        
        # 正解とのマッチ数をカウント
        hits = len(set(top_k_ids) & set(expected_ids))
        
        return hits / k
    
    def evaluate_mrr(
        self,
        results: List[Dict[str, Any]],
        expected_ids: List[str]
    ) -> float:
        """
        MRR: Mean Reciprocal Rank
        最初の正解が何位に出現するか
        
        Args:
            results: 検索結果
            expected_ids: 正解のFragment ID
        
        Returns:
            MRR (0.0 ~ 1.0)
            - 正解が1位 → 1.0
            - 正解が2位 → 0.5
            - 正解が3位 → 0.33
            - 正解がない → 0.0
        
        Example:
            正解: ['a', 'b', 'c']
            結果: ['x', 'y', 'b', ...]
            → MRR = 1 / 3 = 0.33
        """
        for i, result in enumerate(results):
            fragment_id = result.get('fragment_id')
            if fragment_id and fragment_id in expected_ids:
                return 1.0 / (i + 1)
        
        return 0.0
    
    def evaluate_recall_at_k(
        self,
        results: List[Dict[str, Any]],
        expected_ids: List[str],
        k: int = 20
    ) -> float:
        """
        Recall@k: 上位k件に含まれる正解の割合
        
        Args:
            results: 検索結果リスト
            expected_ids: 正解のFragment IDリスト
            k: 評価する上位件数（デフォルト: 20）
        
        Returns:
            Recall@k値（0.0〜1.0）
        
        Example:
            正解: ['a', 'b', 'c', 'd', 'e'] (5件)
            結果: ['a', 'x', 'b', 'y', 'c', ...] (上位20件)
            → 上位20件に 'a', 'b', 'c' の3件が含まれる
            → Recall@20 = 3 / 5 = 0.60
        """
        if not expected_ids:
            return 0.0
        
        # 上位k件を取得
        top_k_results = results[:k]
        
        # 上位k件に含まれる正解数をカウント
        found_count = 0
        for result in top_k_results:
            fragment_id = result.get('fragment_id')
            if fragment_id in expected_ids:
                found_count += 1
        
        # Recall = 見つかった正解数 / 全正解数
        recall = found_count / len(expected_ids)
        return recall
    
    def evaluate_ndcg(
        self,
        results: List[Dict[str, Any]],
        expected_ids: List[str],
        k: int = 20
    ) -> float:
        """
        NDCG (Normalized Discounted Cumulative Gain): 順位を考慮した評価指標
        
        Args:
            results: 検索結果リスト
            expected_ids: 正解のFragment IDリスト
            k: 評価する上位件数（デフォルト: 20）
        
        Returns:
            NDCG@k値（0.0〜1.0）
        
        Example:
            正解: ['a', 'b', 'c']
            結果: ['a', 'x', 'b', 'y', 'c', ...] (上位20件)
            → DCG = 1/log2(2) + 1/log2(4) + 1/log2(6) = 1.0 + 0.5 + 0.387 = 1.887
            → IDCG = 1/log2(2) + 1/log2(3) + 1/log2(4) = 1.0 + 0.631 + 0.5 = 2.131
            → NDCG = 1.887 / 2.131 = 0.885
        """
        if not expected_ids:
            return 0.0
        
        # 上位k件を取得
        top_k_results = results[:k]
        
        # DCG (Discounted Cumulative Gain) を計算
        dcg = 0.0
        for rank, result in enumerate(top_k_results, start=1):
            fragment_id = result.get('fragment_id')
            if fragment_id in expected_ids:
                # rel = 1（正解）、それ以外は0
                rel = 1
                # DCG += rel / log2(rank + 1)
                dcg += rel / np.log2(rank + 1)
        
        # IDCG (Ideal DCG) を計算（全正解が上位に並んだ場合）
        idcg = 0.0
        for rank in range(1, min(len(expected_ids), k) + 1):
            idcg += 1.0 / np.log2(rank + 1)
        
        # NDCG = DCG / IDCG
        if idcg == 0:
            return 0.0
        
        ndcg = dcg / idcg
        return ndcg
    
    def run_evaluation(
        self,
        variant: str = 'baseline',
        sources: Optional[List[str]] = None,
        limit: int = 20,
        use_bm25: bool = False,
        use_rrf: bool = False,
        rrf_k: int = 60,
        dataset_version: str = 'v1.0',
        run_id: Optional[uuid.UUID] = None
    ) -> Dict[str, Any]:
        """
        評価データセット全体で評価実行
        
        Args:
            variant: 評価対象のバリアント（baseline, bm25, rrf等）
            sources: 検索ソース（デフォルト: ['fragment']）
            limit: 検索結果の上限
            use_bm25: BM25再ランキングを使用するか
            use_rrf: RRF (Reciprocal Rank Fusion)を使用するか
            rrf_k: RRFのkパラメータ（デフォルト: 60）
            dataset_version: 評価データセットのバージョン（デフォルト: 'v1.0'）
            run_id: 評価実行単位の識別子（Noneの場合は新規UUID生成）
        
        Returns:
            {
                'variant': 'baseline',
                'avg_precision_at_5': 0.75,
                'avg_mrr': 0.68,
                'total_queries': 10,
                'dataset_version': 'v1.0',
                'run_id': 'uuid',
                'query_results': [...]
            }
        """
        if sources is None:
            sources = ['fragment']
        
        # run_id が未指定の場合は新規生成
        if run_id is None:
            run_id = uuid.uuid4()
        
        # 評価クエリを取得（dataset_versionで絞り込み）
        queries = EvaluationQuery.objects.filter(dataset_version=dataset_version)
        
        precision_scores = []
        mrr_scores = []
        recall_at_20_scores = []
        ndcg_scores = []
        query_results = []
        
        print(f"\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print(f"🔬 評価実行: {variant}")
        print(f"   Dataset Version: {dataset_version}")
        print(f"   Run ID: {run_id}")
        print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
        
        for i, query_item in enumerate(queries, 1):
            # RAG検索実行
            search_results = self.rag_service.hybrid_search(
                query=query_item.query,
                sources=sources,
                limit=limit,
                use_bm25=use_bm25,
                use_rrf=use_rrf,
                rrf_k=rrf_k
            )
            
            # Precision@5計算
            precision = self.evaluate_precision_at_k(
                search_results['results'],
                query_item.expected_fragment_ids,
                k=5
            )
            precision_scores.append(precision)
            
            # MRR計算
            mrr = self.evaluate_mrr(
                search_results['results'],
                query_item.expected_fragment_ids
            )
            mrr_scores.append(mrr)
            
            # Recall@20計算
            recall_at_20 = self.evaluate_recall_at_k(
                search_results['results'],
                query_item.expected_fragment_ids,
                k=20
            )
            recall_at_20_scores.append(recall_at_20)
            
            # NDCG@20計算
            ndcg = self.evaluate_ndcg(
                search_results['results'],
                query_item.expected_fragment_ids,
                k=20
            )
            ndcg_scores.append(ndcg)
            
            query_result = {
                'query': query_item.query,
                'precision_at_5': precision,
                'mrr': mrr,
                'recall_at_20': recall_at_20,
                'ndcg': ndcg,
                'category': query_item.category,
                'difficulty': query_item.difficulty,
                'results_count': len(search_results['results'])
            }
            query_results.append(query_result)
            
            # 進捗表示
            print(f"  [{i:2d}/{len(queries)}] {query_item.query:30s} | "
                  f"P@5: {precision:.2f} | MRR: {mrr:.2f} | R@20: {recall_at_20:.2f} | NDCG: {ndcg:.2f}")
            
            # 結果をDBに保存
            EvaluationResult.objects.create(
                query=query_item,
                variant=variant,
                precision_at_5=precision,
                mrr=mrr,
                recall_at_20=recall_at_20,
                ndcg=ndcg,
                search_duration_ms=search_results.get('search_duration_ms'),
                results_json={
                    'top_5': search_results['results'][:5],    # 既存（互換性維持）
                    'top_20': search_results['results'][:20],  # 新規（順位分析用）
                    'total_count': search_results['total_count']
                },
                dataset_version=dataset_version,
                run_id=run_id
            )
        
        # カテゴリ別集計
        category_breakdown = self._breakdown_by_category(query_results)
        
        result = {
            'variant': variant,
            'avg_precision_at_5': float(np.mean(precision_scores)),
            'avg_mrr': float(np.mean(mrr_scores)),
            'avg_recall_at_20': float(np.mean(recall_at_20_scores)),
            'avg_ndcg': float(np.mean(ndcg_scores)),
            'total_queries': len(queries),
            'dataset_version': dataset_version,
            'run_id': str(run_id),
            'query_results': query_results,
            'category_breakdown': category_breakdown
        }
        
        print(f"\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print(f"📊 評価結果サマリー")
        print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print(f"  Precision@5: {result['avg_precision_at_5']:.3f}")
        print(f"  MRR:         {result['avg_mrr']:.3f}")
        print(f"  Recall@20:   {result['avg_recall_at_20']:.3f}")
        print(f"  NDCG@20:     {result['avg_ndcg']:.3f}")
        print(f"  評価クエリ数: {result['total_queries']}")
        print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
        
        # Phase 4: MLflowへ自動ログ
        try:
            from rag_api.services.mlflow_service import MLflowService
            
            mlflow_service = MLflowService()
            
            # embedding_dims実測値取得（最初のクエリから取得）
            # TODO: 全クエリで一致を確認（fail-fast）
            first_search_result = EvaluationResult.objects.filter(
                run_id=run_id,
                variant=variant
            ).first()
            
            if first_search_result and 'embedding_dims' in first_search_result.results_json:
                embedding_dims_actual = first_search_result.results_json['embedding_dims']
            else:
                # フォールバック: text-embedding-3-largeのデフォルト次元数（Week 1暫定）
                print("⚠️  Warning: embedding_dims not found in results, using default 1536")
                embedding_dims_actual = 1536
            
            # index_fingerprintを取得
            index_fingerprint = mlflow_service.get_index_fingerprint()
            
            # MLflowへログ
            mlflow_run_id = mlflow_service.log_evaluation_run(
                django_run_id=str(run_id),
                dataset_version=dataset_version,
                variant=variant,
                params={
                    'top_k': limit,
                    'fusion_method': 'rrf' if use_rrf else ('none' if not use_bm25 else 'none'),
                    'embedding_model': 'text-embedding-3-large',  # TODO: 動的取得
                },
                metrics={
                    'precision_at_5': result['avg_precision_at_5'],
                    'mrr': result['avg_mrr'],
                    'ndcg_at_20': result['avg_ndcg'],
                    'recall_at_20': result['avg_recall_at_20'],
                },
                category_metrics=category_breakdown,
                embedding_dims_actual=embedding_dims_actual,
                index_fingerprint=index_fingerprint
            )
            
            # resultにmlflow_run_idを追加
            result['mlflow_run_id'] = mlflow_run_id
            print(f"✅ MLflow run logged: {mlflow_run_id}")
            
            # DBに保存（同一run_idの全EvaluationResultを一括更新）
            # 【重要】mlflow_run_id は必ず「Django run_id 単位で一括UPDATE」すること
            # 部分更新は将来必ず壊れるため、コード規約として強制
            
            # 期待値を取得（一括更新前の全行数）
            expected_count = EvaluationResult.objects.filter(
                run_id=run_id,
                variant=variant
            ).count()
            
            # 一括更新実行
            updated_count = EvaluationResult.objects.filter(
                run_id=run_id,
                variant=variant
            ).update(mlflow_run_id=mlflow_run_id)
            
            # 完全性保証（fail-fast）
            if updated_count != expected_count:
                error_msg = (
                    f"mlflow_run_id 一括更新の完全性違反: "
                    f"期待値={expected_count}, 実際値={updated_count}. "
                    f"部分更新が発生しました。評価全体をFAILED扱いにします。"
                )
                logger.error(error_msg)
                raise RuntimeError(error_msg)
            
            logger.info(f"Updated {updated_count}/{expected_count} EvaluationResult records with mlflow_run_id: {mlflow_run_id}")
            
        except Exception as e:
            print(f"⚠️  Warning: MLflow logging failed: {e}")
            print("   Evaluation results are still saved to Django DB.")
            result['mlflow_run_id'] = None
        
        return result
    
    def _breakdown_by_category(
        self,
        query_results: List[Dict[str, Any]]
    ) -> Dict[str, Dict[str, float]]:
        """カテゴリ別に評価指標を集計"""
        categories = {}
        
        for result in query_results:
            category = result['category']
            if category not in categories:
                categories[category] = {
                    'precision_at_5': [],
                    'mrr': [],
                    'ndcg': [],
                    'recall_at_20': []
                }
            
            categories[category]['precision_at_5'].append(result['precision_at_5'])
            categories[category]['mrr'].append(result['mrr'])
            categories[category]['ndcg'].append(result['ndcg'])
            categories[category]['recall_at_20'].append(result['recall_at_20'])
        
        # 平均を計算
        breakdown = {}
        for category, metrics in categories.items():
            breakdown[category] = {
                'avg_precision_at_5': float(np.mean(metrics['precision_at_5'])),
                'avg_mrr': float(np.mean(metrics['mrr'])),
                'ndcg_at_20': float(np.mean(metrics['ndcg'])),
                'recall_at_20': float(np.mean(metrics['recall_at_20'])),
                'count': len(metrics['precision_at_5'])
            }
        
        return breakdown

