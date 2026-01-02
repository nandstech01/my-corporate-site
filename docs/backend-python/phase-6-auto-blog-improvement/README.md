# Phase 6: 自動ブログ改善エンジン

**最終更新**: 2026-01-03  
**前提**: Phase 1-4完了（Django RAG API、MLflow統合、Grafana可視化）

---

## 🎯 目的

既存のRAGブログ生成システムを**自動評価→改善→生成ループ**に拡張し、日々のブログ生成を継続的に最適化する。

---

## 📐 システム全体像

```
【既存システム】
 ✅ Triple RAG (Company + Trend + YouTube)
 ✅ RAGブログ自動生成 (/api/generate-rag-blog)
 ✅ RAG智的分析 (/api/analyze-rag-content)
 ✅ 構造化データ自動生成 (Fragment ID, エンティティマッピング)
 ✅ Django RAG評価API (Recall@k, MRR, NDCG)
 ✅ MLflow実験トラッキング
 ✅ Grafanaダッシュボード

【Phase 6 拡張】
 🆕 パフォーマンスメトリクス追跡システム
 🆕 A/Bテスト自動実行エンジン
 🆕 パターン学習 & パラメータ最適化
 🆕 自動フィードバックループ
 🆕 週次/月次自動レポート生成
```

---

## 🔧 実装コンポーネント

### 1. パフォーマンスメトリクス追跡システム

**目的**: 生成されたブログ記事のパフォーマンスを自動追跡

**実装場所**: `backend/rag_api/tracking/`

**主要機能**:
- Googleアナリティクス連携（PV、滞在時間、直帰率）
- AI引用追跡（ChatGPT/Perplexity引用回数）
- RAG検索ランキング（ベクトル類似度スコア）
- エンゲージメント追跡（SNSシェア、コメント数）
- ビジネスKPI（CV率、問い合わせ数）

**データモデル**:
```python
# backend/rag_api/models.py
class BlogPerformanceMetrics(models.Model):
    post_id = models.IntegerField()
    post_slug = models.CharField(max_length=255)
    published_at = models.DateTimeField()
    
    # トラフィックメトリクス
    page_views = models.IntegerField(default=0)
    unique_visitors = models.IntegerField(default=0)
    avg_time_on_page = models.FloatField(default=0.0)  # 秒
    bounce_rate = models.FloatField(default=0.0)  # 0-1
    
    # AI引用メトリクス
    chatgpt_citations = models.IntegerField(default=0)
    perplexity_citations = models.IntegerField(default=0)
    claude_citations = models.IntegerField(default=0)
    
    # RAG検索メトリクス
    rag_search_rank_avg = models.FloatField(default=0.0)  # 平均ランキング
    vector_similarity_avg = models.FloatField(default=0.0)  # 平均類似度
    
    # エンゲージメントメトリクス
    social_shares = models.IntegerField(default=0)
    comments_count = models.IntegerField(default=0)
    
    # ビジネスKPI
    conversion_rate = models.FloatField(default=0.0)  # 0-1
    inquiry_count = models.IntegerField(default=0)
    
    # 総合スコア
    performance_score = models.FloatField(default=0.0)  # 0-100
    
    updated_at = models.DateTimeField(auto_now=True)
```

---

### 2. A/Bテスト自動実行エンジン

**目的**: 複数パラメータセットで記事生成し、最適パターンを発見

**実装場所**: `backend/rag_api/ab_testing/`

**主要機能**:
- 複数パラメータセット自動生成
- 同時並行記事生成（A/B/Cテスト）
- パフォーマンス比較
- 統計的有意性検定
- 勝者パターン選定

**パラメータ例**:
```python
# backend/rag_api/ab_testing/parameter_sets.py
AB_TEST_PARAMETERS = [
    {
        'name': 'Pattern A: Company RAG重視',
        'company_rag_weight': 0.6,
        'trend_rag_weight': 0.2,
        'youtube_rag_weight': 0.2,
        'target_length': 7000,
        'h2_diagram_enabled': True,
        'max_h2_diagrams': 3
    },
    {
        'name': 'Pattern B: Trend RAG重視',
        'company_rag_weight': 0.3,
        'trend_rag_weight': 0.5,
        'youtube_rag_weight': 0.2,
        'target_length': 8000,
        'h2_diagram_enabled': True,
        'max_h2_diagrams': 4
    },
    {
        'name': 'Pattern C: バランス型',
        'company_rag_weight': 0.4,
        'trend_rag_weight': 0.3,
        'youtube_rag_weight': 0.3,
        'target_length': 6000,
        'h2_diagram_enabled': False,
        'max_h2_diagrams': 0
    }
]
```

---

### 3. パターン学習 & パラメータ最適化エンジン

**目的**: 高パフォーマンス記事の特徴を学習し、パラメータを自動最適化

**実装場所**: `backend/rag_api/ml_optimization/`

**主要機能**:
- 高パフォーマンス記事の特徴抽出
- 最適RAG比率計算 (Company:Trend:YouTube)
- 最適文字数・構造分析
- カテゴリ別最適パラメータ学習
- MLflowへの実験記録

**機械学習アプローチ**:
```python
# backend/rag_api/ml_optimization/optimizer.py
class ParameterOptimizer:
    """
    ランダムフォレスト / XGBoostによるパラメータ最適化
    
    特徴量:
    - company_rag_weight, trend_rag_weight, youtube_rag_weight
    - target_length (文字数)
    - h2_diagram_enabled (図解有無)
    - max_h2_diagrams (図解数)
    - category (カテゴリ)
    - keywords (キーワード)
    
    目的変数:
    - performance_score (0-100)
    """
    
    def train(self, historical_data: List[Dict]):
        """過去データから学習"""
        pass
    
    def predict_optimal_parameters(self, query: str, category: str) -> Dict:
        """最適パラメータを予測"""
        pass
    
    def log_to_mlflow(self, experiment_name: str, params: Dict, metrics: Dict):
        """MLflowに記録"""
        pass
```

---

### 4. 自動フィードバックループ

**目的**: 週次/月次で自動的にパラメータ最適化 → 再生成

**実装場所**: `backend/rag_api/auto_loop/`

**主要機能**:
- スケジュール実行（Celery Beat）
- 週次パフォーマンスレビュー
- 最適パラメータ更新
- 自動再生成（低パフォーマンス記事）
- Grafana/MLflowへの自動レポート送信

**実装例**:
```python
# backend/rag_api/tasks.py (Celery Tasks)
from celery import shared_task
import mlflow

@shared_task
def weekly_optimization_task():
    """週次最適化タスク"""
    
    # 1. 過去1週間のパフォーマンスデータ取得
    metrics = BlogPerformanceMetrics.objects.filter(
        published_at__gte=timezone.now() - timedelta(days=7)
    )
    
    # 2. パターン学習
    optimizer = ParameterOptimizer()
    optimizer.train(metrics)
    
    # 3. 低パフォーマンス記事の特定
    low_performers = metrics.filter(performance_score__lt=60)
    
    # 4. 最適パラメータで再生成
    for post in low_performers:
        optimal_params = optimizer.predict_optimal_parameters(
            query=post.post_slug,
            category=post.category
        )
        
        # 再生成APIをトリガー
        regenerate_blog_with_params(post.post_id, optimal_params)
    
    # 5. MLflowに記録
    with mlflow.start_run(run_name=f"weekly_optimization_{timezone.now().date()}"):
        mlflow.log_metrics({
            'total_posts': metrics.count(),
            'low_performers': low_performers.count(),
            'avg_performance_score': metrics.aggregate(Avg('performance_score'))['performance_score__avg']
        })
        mlflow.log_params(optimal_params)
    
    return {
        'status': 'success',
        'optimized_posts': low_performers.count()
    }
```

---

### 5. Grafana/MLflow統合ダッシュボード

**目的**: リアルタイム可視化 & 週次/月次レポート自動生成

**実装場所**: 
- Grafanaダッシュボード設定: `backend/grafana_dashboards/auto_blog_optimization.json`
- MLflow実験管理: 既存Phase 4システム拡張

**Grafanaパネル**:
1. **パフォーマンス推移**: 週次/月次の平均スコア
2. **A/Bテスト結果**: パターン別比較
3. **RAG比率最適化**: Company vs Trend vs YouTube
4. **カテゴリ別パフォーマンス**: 30カテゴリの比較
5. **AI引用数推移**: ChatGPT/Perplexity/Claude別
6. **トップ10記事**: 高パフォーマンス記事一覧

**MLflow記録内容**:
- 実験名: `blog_optimization_YYYYMMDD`
- パラメータ: RAG比率、文字数、図解設定
- メトリクス: performance_score, recall@k, mrr, ndcg
- アーティファクト: 生成記事、最適パラメータJSON

---

## 📊 評価指標

### KPI設定

| 指標 | 目標 | 測定方法 |
|------|------|---------|
| 平均パフォーマンススコア | 70点以上 | BlogPerformanceMetrics.performance_score |
| AI引用数 | 月間50回以上 | chatgpt_citations + perplexity_citations + claude_citations |
| RAG検索ランキング | 平均3位以内 | rag_search_rank_avg |
| 週次最適化改善率 | +10%以上 | (今週 - 先週) / 先週 × 100 |
| 低パフォーマンス記事割合 | 20%以下 | performance_score < 60 の記事数 / 全記事数 |

---

## 🗓️ 実装スケジュール

### Week 1: パフォーマンストラッキング基盤
- [ ] `BlogPerformanceMetrics` モデル作成
- [ ] Googleアナリティクス連携
- [ ] AI引用追跡API実装
- [ ] RAG検索ランキング計算

### Week 2: A/Bテスト & 最適化エンジン
- [ ] A/Bテストパラメータセット定義
- [ ] 複数パラメータ同時生成機能
- [ ] パフォーマンス比較・統計検定
- [ ] ParameterOptimizer実装（機械学習）

### Week 3: 自動ループ & ダッシュボード
- [ ] Celery週次最適化タスク
- [ ] 自動再生成機能
- [ ] Grafanaダッシュボード設計
- [ ] MLflow統合レポート機能
- [ ] テスト & デバッグ

---

## 🚀 将来的拡張

### Phase 7候補（オプション）
- **強化学習**: RL(Reinforcement Learning)によるパラメータ最適化
- **マルチモーダル**: 画像生成最適化（H2図解の自動A/Bテスト）
- **リアルタイム最適化**: 1時間毎の自動調整
- **競合分析統合**: 競合サイトのRAG分析 → 差別化戦略
- **ユーザー行動予測**: クリック率・CV率予測モデル

---

## 📚 参考ドキュメント

- [Phase 1-4: Django RAG評価基盤](/docs/backend-python/)
- [RAGブログ生成システム](/app/api/generate-rag-blog/)
- [RAG智的分析システム](/app/api/analyze-rag-content/)
- [構造化データシステム](/lib/structured-data/)
- [MLflow公式ドキュメント](https://mlflow.org/docs/latest/index.html)
- [Grafana公式ドキュメント](https://grafana.com/docs/)

---

## 📝 結論

**Phase 6は完全に実現可能です** 🎉

既存システム（Phase 1-4）の上に、評価→改善→生成の自動ループを構築することで、**日々のブログ生成を継続的に最適化する自律的エンジン**が完成します。

**推定工数**: 2-3週間（既存システム活用により短縮可能）
**技術的難易度**: 中（既存APIを活用し、新規実装は最小限）
**ビジネス価値**: 非常に高い（コンテンツ品質の継続的向上 → SEO/AI引用率向上）

