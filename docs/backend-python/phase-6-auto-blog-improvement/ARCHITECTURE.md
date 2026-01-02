# Phase 6: 自動ブログ改善エンジン - アーキテクチャ設計書

**最終更新**: 2026-01-03

---

## 🏗️ システムアーキテクチャ

### 全体データフロー

```
┌─────────────────────────────────────────────────────────────────────┐
│                     自動ブログ改善エンジン                              │
│              (Auto Blog Improvement Engine)                         │
└─────────────────────────────────────────────────────────────────────┘

【1. 生成フェーズ】
┌──────────────────────────────────────────┐
│  Next.js Frontend                        │
│  /admin/content-generation               │
└───────────────┬──────────────────────────┘
                │ POST /api/analyze-rag-content
                ↓
┌───────────────────────────────────────────────────────────┐
│  RAG智的分析システム                                        │
│  - IntelligentRAGOptimizationSystem                       │
│  - OptimalQueryGenerator                                  │
│  - CategorySelector                                       │
│  - SemanticCoherenceChecker                               │
└───────────────┬───────────────────────────────────────────┘
                │ 最適パラメータ生成
                ↓
┌───────────────────────────────────────────────────────────┐
│  A/Bテストエンジン (新規)                                    │
│  /api/ab-test-blog-generation                             │
│                                                            │
│  入力: 最適パラメータ                                        │
│  処理:                                                     │
│   1. 3パターンのパラメータセット生成                          │
│      - Pattern A: Company RAG重視                         │
│      - Pattern B: Trend RAG重視                           │
│      - Pattern C: バランス型                               │
│   2. 並行してTriple RAGブログ生成                           │
│   3. 各記事にexperiment_id付与                             │
│                                                            │
│  出力: 3つの記事バリエーション                               │
└───────────────┬───────────────────────────────────────────┘
                │
                ↓
┌───────────────────────────────────────────────────────────┐
│  RAGブログ生成API (既存 + 拡張)                              │
│  /api/generate-rag-blog                                   │
│                                                            │
│  - Triple RAG (Company + Trend + YouTube)                │
│  - Fragment ID自動生成                                     │
│  - 構造化データ自動統合                                      │
│  + experiment_metadata記録 (新規)                          │
│    - experiment_id                                        │
│    - parameter_set_name                                   │
│    - generation_timestamp                                 │
│                                                            │
└───────────────┬───────────────────────────────────────────┘
                │
                ↓
┌───────────────────────────────────────────────────────────┐
│  Supabase                                                 │
│  - generated_articles テーブル (既存)                       │
│  + blog_performance_metrics テーブル (新規)                │
│  + ab_test_experiments テーブル (新規)                     │
└───────────────────────────────────────────────────────────┘

【2. 追跡フェーズ】
┌───────────────────────────────────────────────────────────┐
│  パフォーマンストラッキングシステム (新規)                     │
│  Django Backend: rag_api/tracking/                        │
│                                                            │
│  1. Google Analytics連携                                  │
│     - PV, 滞在時間, 直帰率                                  │
│     → /api/tracking/analytics                             │
│                                                            │
│  2. AI引用追跡                                             │
│     - ChatGPT/Perplexity/Claude引用数                     │
│     → /api/tracking/ai-citations                          │
│     (方法: リファラー解析 + API連携)                        │
│                                                            │
│  3. RAG検索ランキング追跡                                   │
│     - ベクトル類似度スコア                                  │
│     - 検索結果順位                                         │
│     → Django RAG API (既存)                               │
│                                                            │
│  4. エンゲージメント追跡                                    │
│     - SNSシェア数                                          │
│     - コメント数                                           │
│     → /api/tracking/engagement                            │
│                                                            │
│  出力: blog_performance_metrics テーブルに記録               │
└───────────────┬───────────────────────────────────────────┘
                │
                ↓ (定期実行: 1日1回)
┌───────────────────────────────────────────────────────────┐
│  メトリクス集計 Celery Task                                 │
│  backend/rag_api/tasks/daily_metrics_aggregation.py       │
│                                                            │
│  処理:                                                     │
│   1. 過去24時間のパフォーマンスデータ収集                     │
│   2. performance_score計算                                │
│      = (PV × 0.2) + (滞在時間 × 0.2) +                    │
│        (AI引用数 × 0.3) + (RAGランク × 0.2) +              │
│        (エンゲージメント × 0.1)                              │
│   3. データベース更新                                       │
│   4. Grafana Push (Prometheus Pushgateway)                │
│                                                            │
└───────────────┬───────────────────────────────────────────┘
                │
                ↓
┌───────────────────────────────────────────────────────────┐
│  PostgreSQL (Django DB)                                   │
│  - blog_performance_metrics                               │
│  - rag_search_logs (既存)                                  │
│  - rag_evaluation_results (既存)                          │
└───────────────────────────────────────────────────────────┘

【3. 評価フェーズ】
┌───────────────────────────────────────────────────────────┐
│  Django RAG評価API (既存 Phase 3-4)                        │
│  /rag-api/evaluate                                        │
│                                                            │
│  メトリクス:                                                │
│   - Recall@k                                              │
│   - MRR (Mean Reciprocal Rank)                            │
│   - NDCG (Normalized Discounted Cumulative Gain)          │
│   - セマンティック整合性スコア                               │
│                                                            │
│  入力: 記事ID、クエリセット                                  │
│  出力: 評価スコア → MLflow記録                              │
└───────────────┬───────────────────────────────────────────┘
                │
                ↓
┌───────────────────────────────────────────────────────────┐
│  MLflow Tracking Server (既存 Phase 4)                    │
│  http://mlflow:5000                                       │
│                                                            │
│  記録内容:                                                 │
│   - 実験名: blog_optimization_YYYYMMDD                     │
│   - パラメータ: RAG比率、文字数、図解設定、カテゴリ           │
│   - メトリクス: recall@k, mrr, ndcg, performance_score    │
│   - タグ: experiment_id, parameter_set_name                │
│   - アーティファクト: 生成記事HTML、パラメータJSON            │
│                                                            │
└───────────────┬───────────────────────────────────────────┘
                │
                ↓
┌───────────────────────────────────────────────────────────┐
│  Grafana Dashboard (既存 Phase 1)                         │
│  http://grafana:3001                                      │
│                                                            │
│  パネル (新規追加):                                         │
│   1. 📊 パフォーマンス推移グラフ                             │
│   2. 🧪 A/Bテスト結果比較                                   │
│   3. 📈 RAG比率最適化推移                                   │
│   4. 🏆 トップ10記事ランキング                               │
│   5. 🤖 AI引用数推移                                        │
│   6. 📂 カテゴリ別パフォーマンス                             │
│                                                            │
└───────────────────────────────────────────────────────────┘

【4. 学習フェーズ】
┌───────────────────────────────────────────────────────────┐
│  パラメータ最適化エンジン (新規)                             │
│  Django Backend: rag_api/ml_optimization/                 │
│                                                            │
│  機械学習モデル: RandomForest / XGBoost                     │
│                                                            │
│  特徴量:                                                   │
│   - company_rag_weight (0.0 - 1.0)                        │
│   - trend_rag_weight (0.0 - 1.0)                          │
│   - youtube_rag_weight (0.0 - 1.0)                        │
│   - target_length (5000 - 10000)                          │
│   - h2_diagram_enabled (Boolean)                          │
│   - max_h2_diagrams (0 - 5)                               │
│   - category (30カテゴリ → One-Hot Encoding)               │
│   - keywords_embedding (ベクトル化: 768次元)               │
│                                                            │
│  目的変数:                                                 │
│   - performance_score (0 - 100)                           │
│                                                            │
│  処理:                                                     │
│   1. 過去データ取得 (blog_performance_metrics)              │
│   2. 特徴量エンジニアリング                                 │
│   3. モデル学習 (scikit-learn)                             │
│   4. 最適パラメータ予測                                     │
│   5. MLflowにモデル保存                                     │
│                                                            │
│  API: /api/ml-optimization/predict-optimal-params         │
│  入力: query, category                                     │
│  出力: optimal_parameters (JSON)                           │
└───────────────┬───────────────────────────────────────────┘
                │
                ↓
┌───────────────────────────────────────────────────────────┐
│  MLflow Model Registry                                    │
│  - モデルバージョン管理                                      │
│  - Production / Staging / Archived                        │
│  - モデル比較・ロールバック                                  │
└───────────────────────────────────────────────────────────┘

【5. 改善フェーズ】
┌───────────────────────────────────────────────────────────┐
│  自動フィードバックループ (新規)                             │
│  Celery Periodic Task                                     │
│  backend/rag_api/tasks/weekly_optimization.py             │
│                                                            │
│  スケジュール: 毎週日曜 03:00 JST                           │
│                                                            │
│  処理:                                                     │
│   1. 過去1週間のパフォーマンスレビュー                       │
│      - 平均performance_score計算                           │
│      - 低パフォーマンス記事特定 (score < 60)                │
│                                                            │
│   2. パラメータ最適化エンジン実行                            │
│      - 全カテゴリの最適パラメータ予測                        │
│      - A/Bテスト勝者パターン分析                            │
│                                                            │
│   3. 低パフォーマンス記事の自動再生成                        │
│      - 最適パラメータで再生成API実行                        │
│      - 旧記事アーカイブ、新記事公開                          │
│                                                            │
│   4. レポート生成 & 送信                                    │
│      - Grafana Weekly Report自動生成                       │
│      - Slack通知 (オプション)                              │
│      - MLflow実験記録                                      │
│                                                            │
│   5. 次週のA/Bテストパラメータ更新                           │
│      - 新パターン vs 最適解                                │
│      - 継続的な探索 (Exploration vs Exploitation)         │
│                                                            │
│  出力:                                                     │
│   - 再生成記事数                                           │
│   - 平均改善率 (%)                                         │
│   - 最適パラメータセット (JSON)                             │
└───────────────┬───────────────────────────────────────────┘
                │
                ↓ (自動ループ再開)
                【1. 生成フェーズ】へ戻る
```

---

## 📊 データモデル設計

### 1. `blog_performance_metrics` (新規)

```sql
CREATE TABLE blog_performance_metrics (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL,
    post_slug VARCHAR(255) NOT NULL,
    published_at TIMESTAMP NOT NULL,
    
    -- トラフィックメトリクス
    page_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    avg_time_on_page FLOAT DEFAULT 0.0,  -- 秒
    bounce_rate FLOAT DEFAULT 0.0,  -- 0-1
    
    -- AI引用メトリクス
    chatgpt_citations INTEGER DEFAULT 0,
    perplexity_citations INTEGER DEFAULT 0,
    claude_citations INTEGER DEFAULT 0,
    
    -- RAG検索メトリクス
    rag_search_rank_avg FLOAT DEFAULT 0.0,  -- 平均ランキング
    vector_similarity_avg FLOAT DEFAULT 0.0,  -- 平均類似度
    
    -- エンゲージメントメトリクス
    social_shares INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    
    -- ビジネスKPI
    conversion_rate FLOAT DEFAULT 0.0,  -- 0-1
    inquiry_count INTEGER DEFAULT 0,
    
    -- 総合スコア
    performance_score FLOAT DEFAULT 0.0,  -- 0-100
    
    -- メタデータ
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- インデックス
    INDEX idx_post_slug (post_slug),
    INDEX idx_published_at (published_at),
    INDEX idx_performance_score (performance_score DESC)
);
```

### 2. `ab_test_experiments` (新規)

```sql
CREATE TABLE ab_test_experiments (
    id SERIAL PRIMARY KEY,
    experiment_id VARCHAR(100) UNIQUE NOT NULL,  -- 例: exp_20260103_001
    experiment_name VARCHAR(255) NOT NULL,
    
    -- 実験設定
    parameter_sets JSONB NOT NULL,  -- A/B/Cパターンのパラメータ
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    
    -- 実験結果
    winner_pattern VARCHAR(50),  -- 例: "Pattern A"
    winner_score FLOAT,
    statistical_significance FLOAT,  -- p値
    
    -- メタデータ
    status VARCHAR(50) DEFAULT 'running',  -- running, completed, cancelled
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- インデックス
    INDEX idx_experiment_id (experiment_id),
    INDEX idx_status (status),
    INDEX idx_start_date (start_date DESC)
);
```

### 3. `blog_generation_parameters` (新規)

```sql
CREATE TABLE blog_generation_parameters (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL UNIQUE,
    experiment_id VARCHAR(100),  -- ab_test_experimentsへの外部キー
    parameter_set_name VARCHAR(100) NOT NULL,  -- 例: "Pattern A"
    
    -- RAG比率パラメータ
    company_rag_weight FLOAT NOT NULL,
    trend_rag_weight FLOAT NOT NULL,
    youtube_rag_weight FLOAT NOT NULL,
    
    -- 生成パラメータ
    target_length INTEGER NOT NULL,
    h2_diagram_enabled BOOLEAN DEFAULT TRUE,
    max_h2_diagrams INTEGER DEFAULT 3,
    
    -- カテゴリ・クエリ
    category VARCHAR(100),
    query_text TEXT,
    
    -- メタデータ
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- 外部キー制約
    FOREIGN KEY (experiment_id) REFERENCES ab_test_experiments(experiment_id),
    
    -- インデックス
    INDEX idx_post_id (post_id),
    INDEX idx_experiment_id (experiment_id),
    INDEX idx_category (category)
);
```

---

## 🔧 主要API仕様

### 1. A/Bテストブログ生成API (新規)

**エンドポイント**: `POST /api/ab-test-blog-generation`

**リクエスト**:
```json
{
  "base_query": "レリバンスエンジニアリング 実践ガイド",
  "category": "aio-seo",
  "parameter_sets": [
    {
      "name": "Pattern A: Company RAG重視",
      "company_rag_weight": 0.6,
      "trend_rag_weight": 0.2,
      "youtube_rag_weight": 0.2,
      "target_length": 7000,
      "h2_diagram_enabled": true,
      "max_h2_diagrams": 3
    },
    {
      "name": "Pattern B: Trend RAG重視",
      "company_rag_weight": 0.3,
      "trend_rag_weight": 0.5,
      "youtube_rag_weight": 0.2,
      "target_length": 8000,
      "h2_diagram_enabled": true,
      "max_h2_diagrams": 4
    },
    {
      "name": "Pattern C: バランス型",
      "company_rag_weight": 0.4,
      "trend_rag_weight": 0.3,
      "youtube_rag_weight": 0.3,
      "target_length": 6000,
      "h2_diagram_enabled": false,
      "max_h2_diagrams": 0
    }
  ]
}
```

**レスポンス**:
```json
{
  "experiment_id": "exp_20260103_001",
  "generated_posts": [
    {
      "post_id": 1234,
      "parameter_set_name": "Pattern A",
      "post_url": "/posts/relevance-engineering-guide-a",
      "preview_url": "/admin/preview/1234"
    },
    {
      "post_id": 1235,
      "parameter_set_name": "Pattern B",
      "post_url": "/posts/relevance-engineering-guide-b",
      "preview_url": "/admin/preview/1235"
    },
    {
      "post_id": 1236,
      "parameter_set_name": "Pattern C",
      "post_url": "/posts/relevance-engineering-guide-c",
      "preview_url": "/admin/preview/1236"
    }
  ],
  "estimated_evaluation_date": "2026-01-10T00:00:00Z"
}
```

---

### 2. パフォーマンストラッキングAPI (新規)

**エンドポイント**: `POST /api/tracking/update-metrics`

**リクエスト**:
```json
{
  "post_id": 1234,
  "metrics": {
    "page_views": 150,
    "unique_visitors": 120,
    "avg_time_on_page": 180.5,
    "bounce_rate": 0.35,
    "chatgpt_citations": 3,
    "perplexity_citations": 2,
    "social_shares": 10,
    "comments_count": 5
  }
}
```

**レスポンス**:
```json
{
  "post_id": 1234,
  "updated": true,
  "performance_score": 72.5,
  "performance_tier": "good"  // poor, fair, good, excellent
}
```

---

### 3. 最適パラメータ予測API (新規)

**エンドポイント**: `POST /api/ml-optimization/predict-optimal-params`

**リクエスト**:
```json
{
  "query": "レリバンスエンジニアリング 実践ガイド",
  "category": "aio-seo",
  "target_audience": "business",
  "content_style": "education"
}
```

**レスポンス**:
```json
{
  "optimal_parameters": {
    "company_rag_weight": 0.55,
    "trend_rag_weight": 0.25,
    "youtube_rag_weight": 0.20,
    "target_length": 7200,
    "h2_diagram_enabled": true,
    "max_h2_diagrams": 3
  },
  "predicted_performance_score": 78.3,
  "confidence_interval": [73.1, 83.5],
  "model_version": "v1.2.0",
  "prediction_timestamp": "2026-01-03T10:30:00Z"
}
```

---

## 🔄 Celeryタスク設計

### 1. 日次メトリクス集計タスク

**タスク名**: `daily_metrics_aggregation`

**スケジュール**: 毎日 01:00 JST

**処理内容**:
```python
@shared_task
def daily_metrics_aggregation():
    """過去24時間のパフォーマンスメトリクス集計"""
    
    # 1. Google Analytics APIから取得
    ga_data = fetch_google_analytics_data(
        start_date=yesterday(),
        end_date=today()
    )
    
    # 2. AI引用数取得（リファラー解析）
    ai_citations = count_ai_citations(
        start_date=yesterday(),
        end_date=today()
    )
    
    # 3. RAG検索ランキング計算
    rag_rankings = calculate_rag_rankings()
    
    # 4. パフォーマンススコア計算
    for post_id in all_post_ids:
        score = calculate_performance_score(
            page_views=ga_data[post_id]['page_views'],
            avg_time=ga_data[post_id]['avg_time_on_page'],
            ai_citations=ai_citations[post_id],
            rag_rank=rag_rankings[post_id]
        )
        
        BlogPerformanceMetrics.objects.update_or_create(
            post_id=post_id,
            defaults={'performance_score': score, ...}
        )
    
    # 5. Grafana Push
    push_to_prometheus(metrics_data)
    
    return {
        'status': 'success',
        'updated_posts': len(all_post_ids)
    }
```

---

### 2. 週次最適化タスク

**タスク名**: `weekly_optimization_task`

**スケジュール**: 毎週日曜 03:00 JST

**処理内容**:
```python
@shared_task
def weekly_optimization_task():
    """週次パフォーマンスレビュー & 最適化"""
    
    # 1. 過去1週間のパフォーマンスデータ取得
    metrics = BlogPerformanceMetrics.objects.filter(
        published_at__gte=timezone.now() - timedelta(days=7)
    )
    
    avg_score = metrics.aggregate(Avg('performance_score'))['performance_score__avg']
    low_performers = metrics.filter(performance_score__lt=60)
    
    # 2. パラメータ最適化エンジン学習
    optimizer = ParameterOptimizer()
    optimizer.train(historical_data=metrics)
    
    # 3. 低パフォーマンス記事の再生成
    regenerated_posts = []
    for post in low_performers:
        optimal_params = optimizer.predict_optimal_parameters(
            query=post.post_slug,
            category=post.category
        )
        
        # 再生成API実行
        new_post_id = regenerate_blog_with_params(
            old_post_id=post.post_id,
            new_params=optimal_params
        )
        regenerated_posts.append(new_post_id)
    
    # 4. MLflowに記録
    with mlflow.start_run(run_name=f"weekly_optimization_{today()}"):
        mlflow.log_params(optimal_params)
        mlflow.log_metrics({
            'avg_performance_score': avg_score,
            'low_performers_count': low_performers.count(),
            'regenerated_posts_count': len(regenerated_posts)
        })
        mlflow.log_artifact('weekly_report.pdf')
    
    # 5. Grafana Weekly Report生成
    generate_grafana_weekly_report()
    
    # 6. Slack通知（オプション）
    send_slack_notification(
        channel='#blog-optimization',
        message=f'週次最適化完了: 平均スコア {avg_score:.1f}点、再生成 {len(regenerated_posts)}記事'
    )
    
    return {
        'status': 'success',
        'avg_performance_score': avg_score,
        'regenerated_posts': len(regenerated_posts)
    }
```

---

## 📈 機械学習モデル設計

### 特徴量設計

```python
# backend/rag_api/ml_optimization/features.py

import pandas as pd
from sklearn.preprocessing import StandardScaler, LabelEncoder

def engineer_features(data: List[Dict]) -> pd.DataFrame:
    """特徴量エンジニアリング"""
    
    df = pd.DataFrame(data)
    
    # 1. 数値特徴量
    numeric_features = [
        'company_rag_weight',
        'trend_rag_weight',
        'youtube_rag_weight',
        'target_length',
        'max_h2_diagrams'
    ]
    
    # 2. カテゴリ特徴量（One-Hot Encoding）
    categorical_features = ['category']
    df = pd.get_dummies(df, columns=categorical_features)
    
    # 3. ブーリアン特徴量（0/1変換）
    df['h2_diagram_enabled'] = df['h2_diagram_enabled'].astype(int)
    
    # 4. テキスト特徴量（ベクトル化）
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    query_embeddings = model.encode(df['query_text'].tolist())
    embedding_df = pd.DataFrame(
        query_embeddings,
        columns=[f'query_emb_{i}' for i in range(query_embeddings.shape[1])]
    )
    
    df = pd.concat([df, embedding_df], axis=1)
    
    # 5. 派生特徴量
    df['rag_diversity'] = (
        df[['company_rag_weight', 'trend_rag_weight', 'youtube_rag_weight']]
        .std(axis=1)
    )
    df['total_rag_weight'] = (
        df['company_rag_weight'] + 
        df['trend_rag_weight'] + 
        df['youtube_rag_weight']
    )
    
    return df
```

---

## 🔍 パフォーマンススコア計算式

```python
# backend/rag_api/tracking/metrics.py

def calculate_performance_score(
    page_views: int,
    avg_time_on_page: float,
    ai_citations: int,
    rag_rank_avg: float,
    social_shares: int,
    bounce_rate: float
) -> float:
    """
    総合パフォーマンススコア計算 (0-100)
    
    重み配分:
     - PV: 20%
     - 滞在時間: 20%
     - AI引用数: 30%
     - RAGランク: 20%
     - エンゲージメント: 10%
    """
    
    # 正規化関数（0-10スケール）
    def normalize(value, max_value):
        return min(10, (value / max_value) * 10)
    
    # 各メトリクス正規化
    pv_score = normalize(page_views, 1000)  # 1000PV = 満点
    time_score = normalize(avg_time_on_page, 300)  # 5分 = 満点
    ai_score = normalize(ai_citations, 10)  # 10引用 = 満点
    rag_score = 10 - normalize(rag_rank_avg, 10)  # ランク1位 = 満点
    engagement_score = normalize(social_shares, 50)  # 50シェア = 満点
    
    # 直帰率ペナルティ
    bounce_penalty = bounce_rate * 5  # 0-5点減点
    
    # 総合スコア計算
    total_score = (
        (pv_score * 0.20) +
        (time_score * 0.20) +
        (ai_score * 0.30) +
        (rag_score * 0.20) +
        (engagement_score * 0.10) -
        bounce_penalty
    )
    
    # 0-100スケールに変換
    return max(0, min(100, total_score * 10))
```

---

## 📊 Grafanaダッシュボード設計

### パネル構成

#### 1. **パフォーマンス推移グラフ**
- **データソース**: PostgreSQL (blog_performance_metrics)
- **クエリ**:
```sql
SELECT 
    DATE_TRUNC('day', published_at) AS time,
    AVG(performance_score) AS avg_score,
    COUNT(*) AS post_count
FROM blog_performance_metrics
WHERE published_at >= NOW() - INTERVAL '30 days'
GROUP BY time
ORDER BY time
```
- **可視化**: Time Series (折れ線グラフ)

#### 2. **A/Bテスト結果比較**
- **データソース**: PostgreSQL (ab_test_experiments + blog_performance_metrics)
- **クエリ**:
```sql
SELECT 
    bgp.parameter_set_name,
    AVG(bpm.performance_score) AS avg_score,
    COUNT(*) AS sample_size
FROM blog_generation_parameters bgp
JOIN blog_performance_metrics bpm ON bgp.post_id = bpm.post_id
WHERE bgp.experiment_id = 'exp_20260103_001'
GROUP BY bgp.parameter_set_name
ORDER BY avg_score DESC
```
- **可視化**: Bar Chart (棒グラフ)

#### 3. **RAG比率最適化推移**
- **データソース**: PostgreSQL (blog_generation_parameters)
- **クエリ**:
```sql
SELECT 
    DATE_TRUNC('week', created_at) AS time,
    AVG(company_rag_weight) AS company_weight,
    AVG(trend_rag_weight) AS trend_weight,
    AVG(youtube_rag_weight) AS youtube_weight
FROM blog_generation_parameters
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY time
ORDER BY time
```
- **可視化**: Time Series (積み上げエリアチャート)

#### 4. **トップ10記事ランキング**
- **データソース**: PostgreSQL (blog_performance_metrics)
- **クエリ**:
```sql
SELECT 
    post_slug,
    performance_score,
    page_views,
    ai_citations_total
FROM (
    SELECT 
        post_slug,
        performance_score,
        page_views,
        (chatgpt_citations + perplexity_citations + claude_citations) AS ai_citations_total
    FROM blog_performance_metrics
    WHERE published_at >= NOW() - INTERVAL '30 days'
) sub
ORDER BY performance_score DESC
LIMIT 10
```
- **可視化**: Table (テーブル)

---

## 🚀 デプロイメント

### Docker Compose拡張（Phase 6追加）

```yaml
# docker-compose.yml (追加部分)
services:
  # 既存サービス（backend, grafana, mlflow）は継続

  celery-worker:
    build: ./backend
    command: celery -A rag_api worker --loglevel=info
    volumes:
      - ./backend:/app
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - CELERY_BROKER_URL=redis://redis:6379/0
    depends_on:
      - redis
      - backend

  celery-beat:
    build: ./backend
    command: celery -A rag_api beat --loglevel=info
    volumes:
      - ./backend:/app
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - CELERY_BROKER_URL=redis://redis:6379/0
    depends_on:
      - redis
      - backend

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

---

## 📝 まとめ

**Phase 6アーキテクチャ**は、既存Phase 1-4の基盤を活用し、**自動評価→改善→生成の完全なループ**を実現します。

### 技術スタック
- **Frontend**: Next.js (既存)
- **Backend**: Django + Celery (新規: Celery)
- **DB**: PostgreSQL (既存 + 新テーブル3個)
- **ML**: scikit-learn, XGBoost (新規)
- **Monitoring**: Grafana + MLflow (既存拡張)
- **Task Queue**: Celery + Redis (新規)

### 推定工数
- **2-3週間** (既存システム活用により短縮)

### ビジネス価値
- **継続的なコンテンツ品質向上**
- **AI引用率向上 → SEO/ブランド認知向上**
- **データドリブンな意思決定**

