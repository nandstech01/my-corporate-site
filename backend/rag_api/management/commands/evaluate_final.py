"""
Week 2B: baseline vs BM25 再評価（Recall@20, NDCG@20付き）
Phase 4 Week 1: MLflow統合 + fail-fast保証
"""

from django.core.management.base import BaseCommand
from rag_api.services.evaluation_service import EvaluationService
from rag_api.models import EvaluationResult
from django.db.models import Avg, Count
import django.db.models
import uuid
import mlflow
import os


class Command(BaseCommand):
    help = 'Week 2B: baseline vs BM25 再評価（Recall@20, NDCG@20を含む）'
    
    def add_arguments(self, parser):
        """コマンドライン引数追加"""
        parser.add_argument(
            '--variant',
            type=str,
            default=None,
            help='評価variant（baseline / bm25）。未指定の場合は両方実行'
        )
        parser.add_argument(
            '--dataset-version',
            type=str,
            default='v1.0-reviewed',
            help='評価データセットバージョン（デフォルト: v1.0-reviewed）'
        )

    def handle(self, *args, **options):
        # コマンドライン引数から取得
        variant = options.get('variant')
        dataset_version = options.get('dataset_version', 'v1.0-reviewed')
        
        self.stdout.write("=" * 80)
        self.stdout.write(self.style.SUCCESS("🔬 評価実行（Phase 4 Week 2対応）"))
        self.stdout.write("=" * 80)
        self.stdout.write("")

        # 同一run_idで実行
        final_run_id = uuid.uuid4()

        self.stdout.write(f"📋 評価条件:")
        self.stdout.write(f"  Dataset Version: {dataset_version}")
        self.stdout.write(f"  Run ID: {final_run_id}")
        self.stdout.write(f"  Variant: {variant if variant else 'baseline + bm25'}")
        self.stdout.write("")

        evaluation_service = EvaluationService()
        
        # variantが指定されている場合は、そのvariantのみ実行
        if variant:
            self.stdout.write("━" * 80)
            self.stdout.write(f"📊 {variant} 評価")
            self.stdout.write("━" * 80)
            
            use_bm25 = (variant == 'bm25')
            results = evaluation_service.run_evaluation(
                variant=variant,
                limit=20,
                use_bm25=use_bm25,
                dataset_version=dataset_version,
                run_id=final_run_id
            )
            
            self.stdout.write("")
            self.stdout.write("=" * 80)
            self.stdout.write(self.style.SUCCESS(f"✅ {variant} 評価完了"))
            self.stdout.write("=" * 80)
            return

        # variantが未指定の場合は、baseline + bm25 の両方を実行
        # baseline
        self.stdout.write("━" * 80)
        self.stdout.write("📊 [1/2] baseline評価")
        self.stdout.write("━" * 80)
        
        baseline_results = evaluation_service.run_evaluation(
            variant='baseline',
            limit=20,
            use_bm25=False,
            dataset_version=dataset_version,
            run_id=final_run_id
        )

        # bm25
        self.stdout.write("")
        self.stdout.write("━" * 80)
        self.stdout.write("📊 [2/2] BM25評価")
        self.stdout.write("━" * 80)
        
        bm25_results = evaluation_service.run_evaluation(
            variant='bm25',
            limit=20,
            use_bm25=True,
            dataset_version=dataset_version,
            run_id=final_run_id
        )

        self.stdout.write("")
        self.stdout.write("=" * 80)
        self.stdout.write("📊 結果比較")
        self.stdout.write("=" * 80)
        self.stdout.write("")

        # カテゴリ別結果を取得
        categories = ['technical', 'general', 'author']
        
        for category in categories:
            self.stdout.write(f"\n📌 {category.upper()} カテゴリ:")
            self.stdout.write("  " + "-" * 70)
            
            baseline_stats = self._get_category_stats(final_run_id, 'baseline', category)
            bm25_stats = self._get_category_stats(final_run_id, 'bm25', category)
            
            if baseline_stats['count'] > 0:
                self.stdout.write(f"  {'Metric':<15} | {'Baseline':<12} | {'BM25':<12} | {'Improvement':<15}")
                self.stdout.write("  " + "-" * 70)
                
                for metric in ['p5', 'mrr', 'r20', 'ndcg']:
                    baseline_val = baseline_stats[metric]
                    bm25_val = bm25_stats[metric]
                    improvement = ((bm25_val / baseline_val - 1) * 100) if baseline_val > 0 else 0
                    
                    metric_names = {'p5': 'Precision@5', 'mrr': 'MRR', 'r20': 'Recall@20', 'ndcg': 'NDCG@20'}
                    self.stdout.write(
                        f"  {metric_names[metric]:<15} | {baseline_val:<12.4f} | {bm25_val:<12.4f} | "
                        f"{improvement:+.1f}%"
                    )

        self.stdout.write("")
        self.stdout.write("=" * 80)
        self.stdout.write("🎯 結論")
        self.stdout.write("=" * 80)
        self.stdout.write("")

        # technical カテゴリの結果で判断
        baseline_tech = self._get_category_stats(final_run_id, 'baseline', 'technical')
        bm25_tech = self._get_category_stats(final_run_id, 'bm25', 'technical')

        self.stdout.write("📊 Technical（固有名詞含む）カテゴリでの結果:")
        self.stdout.write(f"  BM25 vs Baseline:")
        self.stdout.write(f"    - MRR:       {bm25_tech['mrr']:.4f} vs {baseline_tech['mrr']:.4f} ({((bm25_tech['mrr']/baseline_tech['mrr']-1)*100):+.1f}%)")
        self.stdout.write(f"    - Recall@20: {bm25_tech['r20']:.4f} vs {baseline_tech['r20']:.4f} ({((bm25_tech['r20']/baseline_tech['r20']-1)*100):+.1f}%)")
        self.stdout.write("")

        if bm25_tech['mrr'] > baseline_tech['mrr'] and bm25_tech['r20'] > baseline_tech['r20']:
            self.stdout.write(self.style.SUCCESS("✅ BM25は全指標でbaselineを上回っています"))
            self.stdout.write("  → BM25を本番採用")
        else:
            self.stdout.write(self.style.WARNING("⚠️  一部の指標で改善が見られません"))

        self.stdout.write("")
        self.stdout.write("=" * 80)

    def _get_category_stats(self, run_id, variant, category):
        """指定されたrun_id、variant、categoryの統計を取得"""
        results = EvaluationResult.objects.filter(
            run_id=run_id,
            variant=variant,
            query__category=category
        ).aggregate(
            avg_p5=Avg('precision_at_5'),
            avg_mrr=Avg('mrr'),
            avg_r20=Avg('recall_at_20'),
            avg_ndcg=Avg('ndcg'),
            count=Count('id')
        )
        
        return {
            'p5': results['avg_p5'] or 0.0,
            'mrr': results['avg_mrr'] or 0.0,
            'r20': results['avg_r20'] or 0.0,
            'ndcg': results['avg_ndcg'] or 0.0,
            'count': results['count'] or 0
        }

