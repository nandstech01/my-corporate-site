"""
Phase 4 Week 2 ゲート2: v2.0-draft 評価データセット作成

目的:
- 追加10件（technical 6 / general 4）で健全性チェック
- Phase 3の手法（実Fragment IDベース）を継承
- Strict idempotent（再実行時に同じ10件、既存なら0件更新）

データ獲得元:
- fragment_vectors テーブルから実際のFragment IDを調査済み
- 固有名詞中心（BM25が効きやすいクエリ）
- 主キー: fragment_id（fragment_vectorsテーブル）

健全性保証:
- dataset_version分離（クエリ抽出・結果保存・MLflowログ）
- カテゴリはDBの列で固定（推測に頼らない）
- 再実行時は既存チェック → 0件更新で終了
"""

from django.core.management.base import BaseCommand
from rag_api.models import EvaluationQuery
from django.db import transaction


class Command(BaseCommand):
    help = 'Phase 4 Week 2: v2.0-draft 評価データセット作成（10件、実Fragment ID起点）'

    def handle(self, *args, **options):
        self.stdout.write("=" * 80)
        self.stdout.write(self.style.SUCCESS("🔬 v2.0-draft 評価データセット作成（10件）"))
        self.stdout.write("=" * 80)
        self.stdout.write("")
        
        # v2.0-draft データセット（10件）
        # fragment_vectorsから実際のFragment IDを調査済み（investigate_fragment_ids.py）
        # 固有名詞中心、BM25が効きやすいクエリを選定
        v2_draft_queries = [
            # Technical カテゴリ（6件）
            # キーワード: API関連
            {
                "query": "RAG API integration",
                "category": "technical",
                "difficulty": 3,  # medium
                "expected_fragment_ids": ["h2-interface", "faq-3"],
                "dataset_version": "v2.0-draft",
                "notes": "fragment_vectors実ID起点（API検索）"
            },
            # キーワード: AIサイト技術
            {
                "query": "AI site technology stack",
                "category": "technical",
                "difficulty": 3,  # medium
                "expected_fragment_ids": ["ai-site-technology"],
                "dataset_version": "v2.0-draft",
                "notes": "fragment_vectors実ID起点（TypeScript/React/Next.js）"
            },
            # キーワード: Supabase
            {
                "query": "Supabase agentic workflow",
                "category": "technical",
                "difficulty": 3,  # medium
                "expected_fragment_ids": ["agentic-workflow", "ai-site-technology"],
                "dataset_version": "v2.0-draft",
                "notes": "fragment_vectors実ID起点（Supabase検索）"
            },
            # キーワード: Claude
            {
                "query": "Claude enterprise AI solutions",
                "category": "technical",
                "difficulty": 3,  # medium
                "expected_fragment_ids": ["enterprise-ai", "business"],
                "dataset_version": "v2.0-draft",
                "notes": "fragment_vectors実ID起点（Claude検索）"
            },
            # キーワード: GraphQL
            {
                "query": "GraphQL system integration",
                "category": "technical",
                "difficulty": 3,  # medium
                "expected_fragment_ids": ["faq-tech-2"],
                "dataset_version": "v2.0-draft",
                "notes": "fragment_vectors実ID起点（GraphQL検索）"
            },
            # キーワード: Vercel
            {
                "query": "Vercel deployment configuration",
                "category": "technical",
                "difficulty": 3,  # medium
                "expected_fragment_ids": ["ai-site-technology"],
                "dataset_version": "v2.0-draft",
                "notes": "fragment_vectors実ID起点（Vercel検索）"
            },
            
            # General カテゴリ（4件）
            # キーワード: optimization
            {
                "query": "AI optimization best practices",
                "category": "general",
                "difficulty": 4,  # hard
                "expected_fragment_ids": ["architect-view", "faq-2"],
                "dataset_version": "v2.0-draft",
                "notes": "fragment_vectors実ID起点（optimization検索）"
            },
            # キーワード: design
            {
                "query": "system design architecture",
                "category": "general",
                "difficulty": 4,  # hard
                "expected_fragment_ids": ["architect-definition"],
                "dataset_version": "v2.0-draft",
                "notes": "fragment_vectors実ID起点（design検索）"
            },
            # キーワード: business
            {
                "query": "enterprise business solutions",
                "category": "general",
                "difficulty": 4,  # hard
                "expected_fragment_ids": ["business", "enterprise-ai"],
                "dataset_version": "v2.0-draft",
                "notes": "fragment_vectors実ID起点（business検索）"
            },
            # キーワード: coding
            {
                "query": "autonomous coding capabilities",
                "category": "general",
                "difficulty": 4,  # hard
                "expected_fragment_ids": ["coding-capabilities"],
                "dataset_version": "v2.0-draft",
                "notes": "fragment_vectors実ID起点（coding検索）"
            },
        ]
        
        self.stdout.write(f"📋 作成予定:")
        self.stdout.write(f"  Technical: 6件")
        self.stdout.write(f"  General: 4件")
        self.stdout.write(f"  合計: 10件")
        self.stdout.write(f"  Dataset Version: v2.0-draft")
        self.stdout.write("")
        
        # トランザクション内で一括作成
        with transaction.atomic():
            # 既存の v2.0-draft をチェック（strict idempotent）
            existing_count = EvaluationQuery.objects.filter(
                dataset_version="v2.0-draft"
            ).count()
            
            if existing_count > 0:
                self.stdout.write(self.style.WARNING(f"⚠️  v2.0-draft は既に存在します（{existing_count}件）"))
                self.stdout.write(self.style.WARNING("   Strict idempotent: 0件更新で終了"))
                self.stdout.write("")
                self.stdout.write("=" * 80)
                self.stdout.write(self.style.SUCCESS("✅ v2.0-draft データセット確認完了（変更なし）"))
                self.stdout.write("=" * 80)
                return
            
            # 新規作成
            created_count = 0
            for query_data in v2_draft_queries:
                # notes フィールドを除外（モデルに存在しない）
                query_data_clean = {k: v for k, v in query_data.items() if k != 'notes'}
                EvaluationQuery.objects.create(**query_data_clean)
                created_count += 1
                category_emoji = "🔧" if query_data["category"] == "technical" else "📚"
                self.stdout.write(f"  {category_emoji} [{query_data['category']:10s}] {query_data['query']}")
                self.stdout.write(f"     → Fragment IDs: {', '.join(query_data['expected_fragment_ids'])}")
            
            self.stdout.write("")
            self.stdout.write(self.style.SUCCESS(f"✅ v2.0-draft データセット作成完了: {created_count}件"))
        
        # 統計情報
        self.stdout.write("")
        self.stdout.write("━" * 80)
        self.stdout.write("📊 データセット統計")
        self.stdout.write("━" * 80)
        
        technical_count = EvaluationQuery.objects.filter(
            dataset_version="v2.0-draft",
            category="technical"
        ).count()
        
        general_count = EvaluationQuery.objects.filter(
            dataset_version="v2.0-draft",
            category="general"
        ).count()
        
        self.stdout.write(f"  Technical: {technical_count}件 (60%)")
        self.stdout.write(f"  General: {general_count}件 (40%)")
        self.stdout.write(f"  合計: {technical_count + general_count}件")
        self.stdout.write("")
        
        # フォーシング・クエスチョンへの回答
        self.stdout.write("━" * 80)
        self.stdout.write("🔍 実データ起点の保証")
        self.stdout.write("━" * 80)
        self.stdout.write("  Q1: どのテーブルのどの列で実データ起点を保証？")
        self.stdout.write("      A1: fragment_vectors テーブルの fragment_id（主キー）")
        self.stdout.write("")
        self.stdout.write("  Q2: dataset_version分離は3点すべてで効いている？")
        self.stdout.write("      A2: (a)評価対象抽出: EvaluationService.run_evaluation()")
        self.stdout.write("          → EvaluationQuery.objects.filter(dataset_version=...)")
        self.stdout.write("          (b)結果保存: EvaluationResult.query.dataset_version")
        self.stdout.write("          (c)MLflowログ: MLflowService.log_evaluation_run()")
        self.stdout.write("          → mlflow.log_param('dataset_version', ...)")
        self.stdout.write("")
        self.stdout.write("  Q3: ゲート2の合否はコマンド1発で落ちる？")
        self.stdout.write("      A3: python backend/verify_mlflow_logging.py --gate 2")
        self.stdout.write("          → 機械判定で合否判定")
        self.stdout.write("")
        
        self.stdout.write("=" * 80)
        self.stdout.write(self.style.SUCCESS("✅ 次のステップ:"))
        self.stdout.write("  1. python manage.py evaluate_final --variant baseline --dataset-version v2.0-draft")
        self.stdout.write("  2. python manage.py evaluate_final --variant bm25 --dataset-version v2.0-draft")
        self.stdout.write("  3. python backend/verify_mlflow_logging.py --gate 2")
        self.stdout.write("=" * 80)
