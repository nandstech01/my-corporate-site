"""
Week 2 実験A: RRF切り分け実験
目的: RRFが負けた原因を「候補集合（TOP_K）」と「k」で切り分ける
"""

from django.core.management.base import BaseCommand
from rag_api.services.evaluation_service import EvaluationService
from rag_api.services.rag_search_service import RAGSearchService
from rag_api.models import EvaluationResult, EvaluationQuery
from django.conf import settings
import uuid
import itertools


class Command(BaseCommand):
    help = 'Week 2 実験A: RRF切り分け実験（TOP_K × RRF_K のグリッドサーチ）'

    def handle(self, *args, **options):
        self.stdout.write("=" * 80)
        self.stdout.write(self.style.SUCCESS("🔬 Week 2 実験A: RRF切り分け実験"))
        self.stdout.write("=" * 80)
        self.stdout.write("")

        # 実験パラメータ
        TOP_K_VALUES = [20, 50, 100]
        RRF_K_VALUES = [10, 30, 60]
        
        # 同一run_idで全実験を実行
        experiment_run_id = uuid.uuid4()
        dataset_version = 'v1.0'

        self.stdout.write(f"📋 実験条件:")
        self.stdout.write(f"  Dataset Version: {dataset_version}")
        self.stdout.write(f"  Run ID: {experiment_run_id}")
        self.stdout.write(f"  TOP_K: {TOP_K_VALUES}")
        self.stdout.write(f"  RRF_K: {RRF_K_VALUES}")
        self.stdout.write(f"  総実験数: {len(TOP_K_VALUES) * len(RRF_K_VALUES) + 2} (baseline + bm25 + RRF variations)")
        self.stdout.write("")

        # baseline と bm25 を先に実行（比較基準）
        self.stdout.write("━" * 80)
        self.stdout.write("📊 [Baseline] Vector検索のみ")
        self.stdout.write("━" * 80)
        
        evaluation_service = EvaluationService()
        baseline_results = evaluation_service.run_evaluation(
            variant='baseline',
            limit=20,
            use_bm25=False,
            use_rrf=False,
            dataset_version=dataset_version,
            run_id=experiment_run_id
        )

        self.stdout.write("")
        self.stdout.write("━" * 80)
        self.stdout.write("📊 [BM25] Vector + BM25再ランキング")
        self.stdout.write("━" * 80)
        
        bm25_results = evaluation_service.run_evaluation(
            variant='bm25',
            limit=20,
            use_bm25=True,
            use_rrf=False,
            dataset_version=dataset_version,
            run_id=experiment_run_id
        )

        self.stdout.write("")
        self.stdout.write("=" * 80)
        self.stdout.write("🔬 RRFパラメータ探索開始")
        self.stdout.write("=" * 80)
        self.stdout.write("")

        # RRFパラメータのグリッドサーチ
        experiment_count = 0
        best_mrr_technical = 0.0
        best_config = None

        for top_k, rrf_k in itertools.product(TOP_K_VALUES, RRF_K_VALUES):
            experiment_count += 1
            variant = f'rrf_top{top_k}_k{rrf_k}'
            
            self.stdout.write("━" * 80)
            self.stdout.write(f"📊 [{experiment_count}/{len(TOP_K_VALUES) * len(RRF_K_VALUES)}] {variant}")
            self.stdout.write(f"    TOP_K={top_k}, RRF_K={rrf_k}")
            self.stdout.write("━" * 80)

            # 一時的にTOP_Kを変更
            original_top_k = settings.RAG_CONFIG['TOP_K']
            settings.RAG_CONFIG['TOP_K'] = top_k

            try:
                # RRF実行（rrf_kは動的に設定できないため、評価サービスを直接カスタマイズ）
                # ここでは簡易的に、EvaluationServiceを呼び出し
                # 本来は RAGSearchService の RRF_K を動的に変更すべき
                
                # 暫定: RRFServiceのkを動的に変更する方法を実装
                from rag_api.services.rrf_service import ReciprocalRankFusionService
                # 注: これは理想的ではないが、実験のため一時的に対応
                
                rrf_results = self._run_rrf_evaluation_with_custom_k(
                    evaluation_service=evaluation_service,
                    variant=variant,
                    rrf_k=rrf_k,
                    dataset_version=dataset_version,
                    run_id=experiment_run_id
                )

                # カテゴリ別の結果を取得
                technical_mrr = self._get_category_mrr(experiment_run_id, variant, 'technical')
                
                self.stdout.write(f"  ✅ Technical MRR: {technical_mrr:.4f}")
                
                if technical_mrr > best_mrr_technical:
                    best_mrr_technical = technical_mrr
                    best_config = {'TOP_K': top_k, 'RRF_K': rrf_k, 'variant': variant}
                    self.stdout.write(self.style.SUCCESS(f"  🎯 新ベスト！"))

            finally:
                # TOP_Kを元に戻す
                settings.RAG_CONFIG['TOP_K'] = original_top_k

            self.stdout.write("")

        # 結果サマリー
        self.stdout.write("=" * 80)
        self.stdout.write("📊 実験結果サマリー")
        self.stdout.write("=" * 80)
        self.stdout.write("")

        # baseline と bm25 のカテゴリ別結果
        baseline_technical_mrr = self._get_category_mrr(experiment_run_id, 'baseline', 'technical')
        bm25_technical_mrr = self._get_category_mrr(experiment_run_id, 'bm25', 'technical')

        self.stdout.write(f"  Baseline (technical): MRR = {baseline_technical_mrr:.4f}")
        self.stdout.write(f"  BM25 (technical):     MRR = {bm25_technical_mrr:.4f} ({(bm25_technical_mrr/baseline_technical_mrr - 1)*100:+.1f}%)")
        self.stdout.write(f"  Best RRF (technical): MRR = {best_mrr_technical:.4f} ({(best_mrr_technical/baseline_technical_mrr - 1)*100:+.1f}%)")
        self.stdout.write("")

        if best_config:
            self.stdout.write(f"🎯 ベスト設定:")
            self.stdout.write(f"  TOP_K: {best_config['TOP_K']}")
            self.stdout.write(f"  RRF_K: {best_config['RRF_K']}")
            self.stdout.write(f"  Variant: {best_config['variant']}")
        self.stdout.write("")

        # 合否判定
        self.stdout.write("━" * 80)
        self.stdout.write("🎯 実験結果の評価")
        self.stdout.write("━" * 80)
        self.stdout.write("")

        if best_mrr_technical >= bm25_technical_mrr:
            self.stdout.write(self.style.SUCCESS(f"✅ RRFがBM25を上回りました！"))
            self.stdout.write(f"  → RRFを採用（TOP_K={best_config['TOP_K']}, RRF_K={best_config['RRF_K']}）")
        else:
            self.stdout.write(self.style.WARNING(f"❌ RRFはBM25を上回りませんでした。"))
            self.stdout.write(f"  → BM25単独を採用（RRFは一旦保留）")

        self.stdout.write("")
        self.stdout.write("=" * 80)

    def _run_rrf_evaluation_with_custom_k(self, evaluation_service, variant, rrf_k, dataset_version, run_id):
        """
        カスタムRRF_Kで評価を実行
        注: EvaluationService.run_evaluation は rrf_k を受け取れるため、それを使用する
        """
        results = evaluation_service.run_evaluation(
            variant=variant,
            limit=20,
            use_bm25=False,
            use_rrf=True,  # 注: rrf_k=60固定
            rrf_k=rrf_k,
            dataset_version=dataset_version,
            run_id=run_id
        )
        return results

    def _get_category_mrr(self, run_id, variant, category):
        """指定されたrun_id、variant、categoryのMRR平均を取得"""
        from django.db.models import Avg
        
        results = EvaluationResult.objects.filter(
            run_id=run_id,
            variant=variant,
            query__category=category
        ).aggregate(avg_mrr=Avg('mrr'))
        
        return results['avg_mrr'] or 0.0

