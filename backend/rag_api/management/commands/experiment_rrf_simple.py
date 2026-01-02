"""
Week 2 実験A: RRF切り分け実験（簡略版）
目的: RRFが負けた原因を「RRF_K」で切り分ける（TOP_Kは20固定）

ユーザーフィードバックに基づき、以下の点を確認:
1. Q1: Vector topN=20, BM25はVector結果全体に対してスコア付与
2. Q2: fragment_idで完全一致（問題なし）
3. Q3: technical（固有名詞含む）でBM25がMRR +56.5%改善（劇的）

実験計画:
- RRF_K ∈ {10, 30, 60} の3通りを試す
- 固有名詞（technical）でのMRRを比較
- BM25単独（MRR=0.4330）を超えるか確認
"""

from django.core.management.base import BaseCommand
from rag_api.services.evaluation_service import EvaluationService
from rag_api.models import EvaluationResult
from django.db.models import Avg
import uuid


class Command(BaseCommand):
    help = 'Week 2 実験A: RRF切り分け実験（RRF_Kのみ変化、TOP_K=20固定）'

    def handle(self, *args, **options):
        self.stdout.write("=" * 80)
        self.stdout.write(self.style.SUCCESS("🔬 Week 2 実験A: RRF切り分け実験"))
        self.stdout.write("=" * 80)
        self.stdout.write("")

        # 実験パラメータ
        RRF_K_VALUES = [10, 30, 60]
        
        # 同一run_idで全実験を実行
        experiment_run_id = uuid.uuid4()
        dataset_version = 'v1.0'

        self.stdout.write(f"📋 実験条件:")
        self.stdout.write(f"  Dataset Version: {dataset_version}")
        self.stdout.write(f"  Run ID: {experiment_run_id}")
        self.stdout.write(f"  RRF_K: {RRF_K_VALUES}")
        self.stdout.write(f"  TOP_K: 20（固定）")
        self.stdout.write(f"  総実験数: {len(RRF_K_VALUES) + 2} (baseline + bm25 + RRF variations)")
        self.stdout.write("")

        evaluation_service = EvaluationService()

        # baseline と bm25 を先に実行（比較基準）
        self.stdout.write("━" * 80)
        self.stdout.write("📊 [Baseline] Vector検索のみ")
        self.stdout.write("━" * 80)
        
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
        best_mrr_technical = 0.0
        best_config = None

        for i, rrf_k in enumerate(RRF_K_VALUES, 1):
            variant = f'rrf_k{rrf_k}'
            
            self.stdout.write("━" * 80)
            self.stdout.write(f"📊 [{i}/{len(RRF_K_VALUES)}] {variant}")
            self.stdout.write(f"    RRF_K={rrf_k}")
            self.stdout.write("━" * 80)

            rrf_results = evaluation_service.run_evaluation(
                variant=variant,
                limit=20,
                use_bm25=False,
                use_rrf=True,
                rrf_k=rrf_k,
                dataset_version=dataset_version,
                run_id=experiment_run_id
            )

            # カテゴリ別の結果を取得
            technical_mrr = self._get_category_mrr(experiment_run_id, variant, 'technical')
            general_mrr = self._get_category_mrr(experiment_run_id, variant, 'general')
            
            self.stdout.write(f"  ✅ Technical MRR: {technical_mrr:.4f}")
            self.stdout.write(f"  ✅ General MRR:   {general_mrr:.4f}")
            
            if technical_mrr > best_mrr_technical:
                best_mrr_technical = technical_mrr
                best_config = {'RRF_K': rrf_k, 'variant': variant}
                self.stdout.write(self.style.SUCCESS(f"  🎯 新ベスト！"))

            self.stdout.write("")

        # 結果サマリー
        self.stdout.write("=" * 80)
        self.stdout.write("📊 実験結果サマリー")
        self.stdout.write("=" * 80)
        self.stdout.write("")

        # baseline と bm25 のカテゴリ別結果
        baseline_technical_mrr = self._get_category_mrr(experiment_run_id, 'baseline', 'technical')
        bm25_technical_mrr = self._get_category_mrr(experiment_run_id, 'bm25', 'technical')

        self.stdout.write(f"  {'Variant':<20} | {'Technical MRR':<15} | {'vs Baseline':<15}")
        self.stdout.write("  " + "-" * 60)
        self.stdout.write(f"  {'Baseline':<20} | {baseline_technical_mrr:<15.4f} | {'-':<15}")
        self.stdout.write(f"  {'BM25':<20} | {bm25_technical_mrr:<15.4f} | {f'+{(bm25_technical_mrr/baseline_technical_mrr - 1)*100:.1f}%':<15}")
        
        for rrf_k in RRF_K_VALUES:
            variant = f'rrf_k{rrf_k}'
            rrf_technical_mrr = self._get_category_mrr(experiment_run_id, variant, 'technical')
            improvement = (rrf_technical_mrr / baseline_technical_mrr - 1) * 100
            self.stdout.write(f"  {variant:<20} | {rrf_technical_mrr:<15.4f} | {f'{improvement:+.1f}%':<15}")
        
        self.stdout.write("")

        if best_config:
            self.stdout.write(f"🎯 ベスト設定:")
            self.stdout.write(f"  RRF_K: {best_config['RRF_K']}")
            self.stdout.write(f"  Technical MRR: {best_mrr_technical:.4f}")
        self.stdout.write("")

        # 合否判定
        self.stdout.write("━" * 80)
        self.stdout.write("🎯 実験結果の評価")
        self.stdout.write("━" * 80)
        self.stdout.write("")

        if best_mrr_technical >= bm25_technical_mrr:
            self.stdout.write(self.style.SUCCESS(f"✅ RRFがBM25を上回りました！"))
            self.stdout.write(f"  → RRFを採用（RRF_K={best_config['RRF_K']}）")
        else:
            diff = bm25_technical_mrr - best_mrr_technical
            self.stdout.write(self.style.WARNING(f"❌ RRFはBM25を上回りませんでした（差分: -{diff:.4f}）"))
            self.stdout.write(f"  → BM25単独を採用（RRFは一旦保留）")
            self.stdout.write("")
            self.stdout.write(f"  📌 考察:")
            self.stdout.write(f"     - Vector topN=20では候補が少なすぎる可能性")
            self.stdout.write(f"     - BM25単独が既に十分強い（technical: +56.5%）")
            self.stdout.write(f"     - RRFで融合すると、かえってノイズが増える")

        self.stdout.write("")
        self.stdout.write("=" * 80)

    def _get_category_mrr(self, run_id, variant, category):
        """指定されたrun_id、variant、categoryのMRR平均を取得"""
        results = EvaluationResult.objects.filter(
            run_id=run_id,
            variant=variant,
            query__category=category
        ).aggregate(avg_mrr=Avg('mrr'))
        
        return results['avg_mrr'] or 0.0

