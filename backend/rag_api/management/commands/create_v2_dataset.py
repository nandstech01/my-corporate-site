"""
Phase 4 Week 2 Task 3: v2.0 評価データセット作成（50件）

v2.0-draft（10件）を拡張し、50件の評価データセットを作成
- Technical: 30件（60%）
- General: 20件（40%）
- 実Fragment IDベース
- Strict idempotent（再実行時に同じ50件を作る保証）
"""

from django.core.management.base import BaseCommand
from django.db import transaction
from rag_api.models import EvaluationQuery


class Command(BaseCommand):
    help = 'Phase 4 Week 2 Task 3: v2.0 評価データセット作成（50件、実Fragment ID起点）'

    def handle(self, *args, **options):
        self.stdout.write("=" * 80)
        self.stdout.write(self.style.SUCCESS("🔬 v2.0 評価データセット作成（50件）"))
        self.stdout.write("=" * 80)
        self.stdout.write("")
        
        # v2.0 データセット（50件）
        # Technical 30件 / General 20件（60:40維持）
        # fragment_vectorsから実際のFragment IDを使用
        v2_queries = [
            # =====================================================
            # Technical カテゴリ（30件）
            # =====================================================
            
            # --- グループ1: API関連（5件） ---
            {
                "query": "RAG API integration",
                "category": "technical",
                "difficulty": 3,
                "expected_fragment_ids": ["h2-interface", "faq-3"],
                "dataset_version": "v2.0",
                "description": "RAG API統合に関するクエリ"
            },
            {
                "query": "REST API endpoint design",
                "category": "technical",
                "difficulty": 3,
                "expected_fragment_ids": ["h2-interface"],
                "dataset_version": "v2.0",
                "description": "REST APIエンドポイント設計"
            },
            {
                "query": "API authentication methods",
                "category": "technical",
                "difficulty": 3,
                "expected_fragment_ids": ["h2-interface", "faq-3"],
                "dataset_version": "v2.0",
                "description": "API認証方法"
            },
            {
                "query": "GraphQL system integration",
                "category": "technical",
                "difficulty": 3,
                "expected_fragment_ids": ["faq-tech-2"],
                "dataset_version": "v2.0",
                "description": "GraphQLシステム統合"
            },
            {
                "query": "API rate limiting implementation",
                "category": "technical",
                "difficulty": 4,
                "expected_fragment_ids": ["h2-interface"],
                "dataset_version": "v2.0",
                "description": "APIレート制限の実装"
            },
            
            # --- グループ2: AI技術（5件） ---
            {
                "query": "AI site technology stack",
                "category": "technical",
                "difficulty": 3,
                "expected_fragment_ids": ["ai-site-technology"],
                "dataset_version": "v2.0",
                "description": "AIサイトの技術スタック"
            },
            {
                "query": "Claude enterprise AI solutions",
                "category": "technical",
                "difficulty": 3,
                "expected_fragment_ids": ["enterprise-ai", "business"],
                "dataset_version": "v2.0",
                "description": "Claude enterpriseのAIソリューション"
            },
            {
                "query": "OpenAI GPT-4 integration",
                "category": "technical",
                "difficulty": 3,
                "expected_fragment_ids": ["ai-site-technology"],
                "dataset_version": "v2.0",
                "description": "OpenAI GPT-4統合"
            },
            {
                "query": "machine learning model deployment",
                "category": "technical",
                "difficulty": 4,
                "expected_fragment_ids": ["ai-site-technology"],
                "dataset_version": "v2.0",
                "description": "機械学習モデルのデプロイ"
            },
            {
                "query": "neural network architecture",
                "category": "technical",
                "difficulty": 4,
                "expected_fragment_ids": ["ai-site-technology"],
                "dataset_version": "v2.0",
                "description": "ニューラルネットワークアーキテクチャ"
            },
            
            # --- グループ3: データベース/バックエンド（5件） ---
            {
                "query": "Supabase agentic workflow",
                "category": "technical",
                "difficulty": 3,
                "expected_fragment_ids": ["agentic-workflow", "ai-site-technology"],
                "dataset_version": "v2.0",
                "description": "Supabaseのエージェンティックワークフロー"
            },
            {
                "query": "PostgreSQL vector search",
                "category": "technical",
                "difficulty": 3,
                "expected_fragment_ids": ["ai-site-technology"],
                "dataset_version": "v2.0",
                "description": "PostgreSQLベクトル検索"
            },
            {
                "query": "database indexing strategies",
                "category": "technical",
                "difficulty": 4,
                "expected_fragment_ids": ["ai-site-technology"],
                "dataset_version": "v2.0",
                "description": "データベースインデックス戦略"
            },
            {
                "query": "Redis caching implementation",
                "category": "technical",
                "difficulty": 3,
                "expected_fragment_ids": ["ai-site-technology"],
                "dataset_version": "v2.0",
                "description": "Redisキャッシング実装"
            },
            {
                "query": "SQL query optimization",
                "category": "technical",
                "difficulty": 4,
                "expected_fragment_ids": ["ai-site-technology"],
                "dataset_version": "v2.0",
                "description": "SQLクエリ最適化"
            },
            
            # --- グループ4: フロントエンド/デプロイ（5件） ---
            {
                "query": "Vercel deployment configuration",
                "category": "technical",
                "difficulty": 3,
                "expected_fragment_ids": ["ai-site-technology"],
                "dataset_version": "v2.0",
                "description": "Vercelデプロイ設定"
            },
            {
                "query": "Next.js server-side rendering",
                "category": "technical",
                "difficulty": 3,
                "expected_fragment_ids": ["ai-site-technology"],
                "dataset_version": "v2.0",
                "description": "Next.jsサーバーサイドレンダリング"
            },
            {
                "query": "React component optimization",
                "category": "technical",
                "difficulty": 3,
                "expected_fragment_ids": ["ai-site-technology"],
                "dataset_version": "v2.0",
                "description": "Reactコンポーネント最適化"
            },
            {
                "query": "TypeScript type safety",
                "category": "technical",
                "difficulty": 3,
                "expected_fragment_ids": ["ai-site-technology"],
                "dataset_version": "v2.0",
                "description": "TypeScript型安全性"
            },
            {
                "query": "CI/CD pipeline setup",
                "category": "technical",
                "difficulty": 4,
                "expected_fragment_ids": ["ai-site-technology"],
                "dataset_version": "v2.0",
                "description": "CI/CDパイプライン構築"
            },
            
            # --- グループ5: 検索/RAG技術（5件） ---
            {
                "query": "vector embedding generation",
                "category": "technical",
                "difficulty": 3,
                "expected_fragment_ids": ["ai-site-technology"],
                "dataset_version": "v2.0",
                "description": "ベクトル埋め込み生成"
            },
            {
                "query": "semantic search implementation",
                "category": "technical",
                "difficulty": 3,
                "expected_fragment_ids": ["ai-site-technology"],
                "dataset_version": "v2.0",
                "description": "セマンティック検索実装"
            },
            {
                "query": "BM25 ranking algorithm",
                "category": "technical",
                "difficulty": 4,
                "expected_fragment_ids": ["ai-site-technology"],
                "dataset_version": "v2.0",
                "description": "BM25ランキングアルゴリズム"
            },
            {
                "query": "hybrid search fusion",
                "category": "technical",
                "difficulty": 4,
                "expected_fragment_ids": ["ai-site-technology"],
                "dataset_version": "v2.0",
                "description": "ハイブリッド検索融合"
            },
            {
                "query": "retrieval augmented generation",
                "category": "technical",
                "difficulty": 4,
                "expected_fragment_ids": ["ai-site-technology"],
                "dataset_version": "v2.0",
                "description": "検索拡張生成（RAG）"
            },
            
            # --- グループ6: その他技術（5件） ---
            {
                "query": "Docker containerization",
                "category": "technical",
                "difficulty": 3,
                "expected_fragment_ids": ["ai-site-technology"],
                "dataset_version": "v2.0",
                "description": "Dockerコンテナ化"
            },
            {
                "query": "Kubernetes orchestration",
                "category": "technical",
                "difficulty": 4,
                "expected_fragment_ids": ["ai-site-technology"],
                "dataset_version": "v2.0",
                "description": "Kubernetesオーケストレーション"
            },
            {
                "query": "microservices architecture",
                "category": "technical",
                "difficulty": 4,
                "expected_fragment_ids": ["architect-definition"],
                "dataset_version": "v2.0",
                "description": "マイクロサービスアーキテクチャ"
            },
            {
                "query": "WebSocket real-time communication",
                "category": "technical",
                "difficulty": 3,
                "expected_fragment_ids": ["ai-site-technology"],
                "dataset_version": "v2.0",
                "description": "WebSocketリアルタイム通信"
            },
            {
                "query": "serverless function deployment",
                "category": "technical",
                "difficulty": 3,
                "expected_fragment_ids": ["ai-site-technology"],
                "dataset_version": "v2.0",
                "description": "サーバーレス関数デプロイ"
            },
            
            # =====================================================
            # General カテゴリ（20件）
            # =====================================================
            
            # --- グループ1: 最適化・設計（5件） ---
            {
                "query": "AI optimization best practices",
                "category": "general",
                "difficulty": 4,
                "expected_fragment_ids": ["architect-view", "faq-2"],
                "dataset_version": "v2.0",
                "description": "AI最適化のベストプラクティス"
            },
            {
                "query": "system design architecture",
                "category": "general",
                "difficulty": 4,
                "expected_fragment_ids": ["architect-definition"],
                "dataset_version": "v2.0",
                "description": "システム設計アーキテクチャ"
            },
            {
                "query": "performance optimization strategies",
                "category": "general",
                "difficulty": 4,
                "expected_fragment_ids": ["architect-view"],
                "dataset_version": "v2.0",
                "description": "パフォーマンス最適化戦略"
            },
            {
                "query": "scalability planning",
                "category": "general",
                "difficulty": 4,
                "expected_fragment_ids": ["architect-definition"],
                "dataset_version": "v2.0",
                "description": "スケーラビリティ計画"
            },
            {
                "query": "software architecture patterns",
                "category": "general",
                "difficulty": 4,
                "expected_fragment_ids": ["architect-definition"],
                "dataset_version": "v2.0",
                "description": "ソフトウェアアーキテクチャパターン"
            },
            
            # --- グループ2: ビジネス・エンタープライズ（5件） ---
            {
                "query": "enterprise business solutions",
                "category": "general",
                "difficulty": 4,
                "expected_fragment_ids": ["business", "enterprise-ai"],
                "dataset_version": "v2.0",
                "description": "エンタープライズビジネスソリューション"
            },
            {
                "query": "digital transformation strategy",
                "category": "general",
                "difficulty": 4,
                "expected_fragment_ids": ["business", "enterprise-ai"],
                "dataset_version": "v2.0",
                "description": "デジタルトランスフォーメーション戦略"
            },
            {
                "query": "business process automation",
                "category": "general",
                "difficulty": 4,
                "expected_fragment_ids": ["business"],
                "dataset_version": "v2.0",
                "description": "ビジネスプロセス自動化"
            },
            {
                "query": "ROI optimization methods",
                "category": "general",
                "difficulty": 4,
                "expected_fragment_ids": ["business"],
                "dataset_version": "v2.0",
                "description": "ROI最適化手法"
            },
            {
                "query": "enterprise AI adoption",
                "category": "general",
                "difficulty": 4,
                "expected_fragment_ids": ["enterprise-ai"],
                "dataset_version": "v2.0",
                "description": "エンタープライズAI導入"
            },
            
            # --- グループ3: 開発・コーディング（5件） ---
            {
                "query": "autonomous coding capabilities",
                "category": "general",
                "difficulty": 4,
                "expected_fragment_ids": ["coding-capabilities"],
                "dataset_version": "v2.0",
                "description": "自律的コーディング機能"
            },
            {
                "query": "code quality improvement",
                "category": "general",
                "difficulty": 3,
                "expected_fragment_ids": ["coding-capabilities"],
                "dataset_version": "v2.0",
                "description": "コード品質改善"
            },
            {
                "query": "test-driven development practices",
                "category": "general",
                "difficulty": 3,
                "expected_fragment_ids": ["coding-capabilities"],
                "dataset_version": "v2.0",
                "description": "テスト駆動開発プラクティス"
            },
            {
                "query": "code review best practices",
                "category": "general",
                "difficulty": 3,
                "expected_fragment_ids": ["coding-capabilities"],
                "dataset_version": "v2.0",
                "description": "コードレビューのベストプラクティス"
            },
            {
                "query": "software development lifecycle",
                "category": "general",
                "difficulty": 3,
                "expected_fragment_ids": ["coding-capabilities"],
                "dataset_version": "v2.0",
                "description": "ソフトウェア開発ライフサイクル"
            },
            
            # --- グループ4: セキュリティ・品質（5件） ---
            {
                "query": "security best practices",
                "category": "general",
                "difficulty": 4,
                "expected_fragment_ids": ["faq-2"],
                "dataset_version": "v2.0",
                "description": "セキュリティのベストプラクティス"
            },
            {
                "query": "data privacy compliance",
                "category": "general",
                "difficulty": 4,
                "expected_fragment_ids": ["faq-2"],
                "dataset_version": "v2.0",
                "description": "データプライバシー準拠"
            },
            {
                "query": "quality assurance methodologies",
                "category": "general",
                "difficulty": 3,
                "expected_fragment_ids": ["faq-2"],
                "dataset_version": "v2.0",
                "description": "品質保証手法"
            },
            {
                "query": "monitoring and observability",
                "category": "general",
                "difficulty": 3,
                "expected_fragment_ids": ["architect-view"],
                "dataset_version": "v2.0",
                "description": "監視と可観測性"
            },
            {
                "query": "incident response planning",
                "category": "general",
                "difficulty": 4,
                "expected_fragment_ids": ["architect-view"],
                "dataset_version": "v2.0",
                "description": "インシデント対応計画"
            },
        ]
        
        self.stdout.write(f"📋 作成予定:")
        self.stdout.write(f"  Technical: 30件（60%）")
        self.stdout.write(f"  General: 20件（40%）")
        self.stdout.write(f"  合計: 50件")
        self.stdout.write(f"  Dataset Version: v2.0")
        self.stdout.write("")
        
        # トランザクション内で一括作成
        with transaction.atomic():
            # 既存の v2.0 をチェック（strict idempotent）
            existing_count = EvaluationQuery.objects.filter(
                dataset_version="v2.0"
            ).count()
            
            if existing_count > 0:
                self.stdout.write(self.style.WARNING(f"⚠️  v2.0 は既に存在します（{existing_count}件）"))
                self.stdout.write(self.style.WARNING("   Strict idempotent: 0件更新で終了"))
                self.stdout.write("")
                self.stdout.write("=" * 80)
                self.stdout.write(self.style.SUCCESS("✅ v2.0 データセット確認完了（変更なし）"))
                self.stdout.write("=" * 80)
                return
            
            # 新規作成
            created_count = 0
            for query_data in v2_queries:
                EvaluationQuery.objects.create(**query_data)
                created_count += 1
                category_emoji = "🔧" if query_data["category"] == "technical" else "📚"
                self.stdout.write(f"  {category_emoji} [{query_data['category']:10s}] {query_data['query']}")
                if created_count % 10 == 0:
                    self.stdout.write(f"     ... {created_count}件作成完了")
            
            self.stdout.write("")
            self.stdout.write(self.style.SUCCESS(f"✅ v2.0 データセット作成完了: {created_count}件"))
        
        # 統計情報
        self.stdout.write("")
        self.stdout.write("━" * 80)
        self.stdout.write("📊 データセット統計")
        self.stdout.write("━" * 80)
        
        technical_count = EvaluationQuery.objects.filter(
            dataset_version="v2.0",
            category="technical"
        ).count()
        
        general_count = EvaluationQuery.objects.filter(
            dataset_version="v2.0",
            category="general"
        ).count()
        
        total_count = EvaluationQuery.objects.filter(
            dataset_version="v2.0"
        ).count()
        
        self.stdout.write(f"  Technical: {technical_count}件（{technical_count/total_count*100:.1f}%）")
        self.stdout.write(f"  General: {general_count}件（{general_count/total_count*100:.1f}%）")
        self.stdout.write(f"  合計: {total_count}件")
        self.stdout.write("")
        
        # 難易度分布
        for difficulty in [1, 2, 3, 4, 5]:
            count = EvaluationQuery.objects.filter(
                dataset_version="v2.0",
                difficulty=difficulty
            ).count()
            if count > 0:
                self.stdout.write(f"  難易度{difficulty}: {count}件")
        
        self.stdout.write("")
        self.stdout.write("=" * 80)
        self.stdout.write(self.style.SUCCESS("🎉 v2.0 データセット作成完了！"))
        self.stdout.write("=" * 80)

