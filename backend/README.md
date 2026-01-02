# Backend - Django RAG API + ML評価システム

**最終更新**: 2026年1月2日  
**ステータス**: ✅ Phase 1-4 完了（評価基盤構築完了）

---

## 📂 ディレクトリ構成

```
backend/
├── README.md                        # このファイル
├── manage.py                        # Django管理コマンド
├── requirements.txt                 # Python依存関係
├── Dockerfile                       # Docker設定
├── db.sqlite3                       # ローカル開発用DB（.gitignore）
│
├── VERIFICATION_SCRIPTS_README.md   # 本番運用検証スクリプトの説明
├── verify_all.sh                    # 一括検証スクリプト
├── verify_mlflow_logging.py         # ⭐ MLflowロギング検証
├── verify_grafana_panels.py         # ⭐ Grafanaパネル検証
├── verify_task4_links.py            # ⭐ 相互参照リンク検証
│
├── scripts/                         # 開発・検証スクリプト
│   ├── README.md                    # スクリプト全体の説明
│   ├── development/                 # Phase 4 開発用スクリプト
│   ├── phase1/                      # Phase 1 検証スクリプト
│   ├── phase3/                      # Phase 3 成果物
│   └── database/                    # データベーススクリプト
│
├── rag_api/                         # Django アプリケーション
│   ├── models.py                    # データモデル
│   ├── views.py                     # APIビュー
│   ├── urls.py                      # URLルーティング
│   ├── admin.py                     # Django Admin設定
│   │
│   ├── services/                    # ビジネスロジック
│   │   ├── rag_search_service.py   # RAG検索サービス
│   │   ├── bm25_service.py         # BM25再ランキング
│   │   ├── rrf_service.py          # RRF（Reciprocal Rank Fusion）
│   │   ├── evaluation_service.py   # 評価サービス
│   │   └── mlflow_service.py       # MLflowロギング
│   │
│   ├── management/                  # Django管理コマンド
│   │   └── commands/
│   │       ├── evaluate_final.py   # 評価実行コマンド
│   │       ├── create_v2_dataset.py      # v2.0データセット作成
│   │       ├── create_v2_draft_dataset.py # v2.0-draftデータセット作成
│   │       ├── analyze_bm25_mechanism.py # BM25メカニズム分析
│   │       ├── experiment_rrf_simple.py  # RRF実験（シンプル版）
│   │       ├── experiment_rrf_tuning.py  # RRF実験（チューニング版）
│   │       └── export_review_csv.py      # レビュー用CSV出力
│   │
│   └── migrations/                  # データベースマイグレーション
│       ├── 0001_initial.py
│       ├── 0002_evaluationquery_evaluationresult.py
│       ├── 0003_evaluationresult_dataset_version_and_more.py
│       ├── 0004_add_recall_at_20.py
│       ├── 0005_evaluationresult_mlflow_run_id.py
│       └── 0006_evaluationquery_dataset_version_and_more.py
│
└── rag_project/                     # Djangoプロジェクト設定
    ├── settings.py                  # プロジェクト設定
    ├── urls.py                      # ルートURLルーティング
    ├── wsgi.py                      # WSGI設定
    └── asgi.py                      # ASGI設定
```

---

## 🚀 クイックスタート

### 前提条件
- Docker Desktop インストール済み
- `.env` ファイル設定済み

### 起動方法
```bash
# プロジェクトルートに移動
cd /Users/nands/my-corporate-site

# Docker Composeでサービス起動
docker-compose up -d

# マイグレーション実行
docker exec rag_backend python manage.py migrate

# 評価実行（例：baseline, v2.0データセット）
docker exec rag_backend python manage.py evaluate_final --variant baseline --dataset-version v2.0
```

### アクセス先
- **Django API**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin
- **Grafana Dashboard**: http://localhost:3001/d/rag-overview
- **MLflow UI**: http://localhost:5000

---

## 🔍 検証スクリプト

### 一括検証（推奨）
```bash
cd /Users/nands/my-corporate-site/backend
bash verify_all.sh
```

### 個別検証
```bash
# MLflowロギング検証
docker exec rag_backend python /app/verify_mlflow_logging.py

# Grafanaパネル検証
docker exec rag_backend python /app/verify_grafana_panels.py

# 相互参照リンク検証
docker exec rag_backend python /app/verify_task4_links.py
```

**詳細**: `VERIFICATION_SCRIPTS_README.md`

---

## 📊 評価データセット

### 現在のデータセット
- **v1.0**: 初期データセット（10件、架空ID）
- **v1.0-reviewed**: 人間レビュー済み（25件、実Fragment ID）
- **v2.0-draft**: Phase 4 Gate 2検証用（10件）
- **v2.0**: Phase 4 Task 3拡張版（50件、Technical 60% / General 40%）

### データセット作成
```bash
# v2.0データセット作成（50件）
docker exec rag_backend python manage.py create_v2_dataset

# v2.0-draftデータセット作成（10件）
docker exec rag_backend python manage.py create_v2_draft_dataset
```

---

## 🎯 評価実行

### 基本的な評価実行
```bash
# baseline評価
docker exec rag_backend python manage.py evaluate_final --variant baseline --dataset-version v2.0

# bm25評価
docker exec rag_backend python manage.py evaluate_final --variant bm25 --dataset-version v2.0
```

### 評価バリアント
- **baseline**: ベクトル検索のみ
- **bm25**: BM25再ランキング適用
- **rrf_simple**: RRFシンプル版（実験的）
- **rrf_tuned**: RRFチューニング版（実験的）

---

## 📚 ドキュメント

### プロジェクト全体
- **全体概要**: `docs/backend-python/PHASES_OVERVIEW.md`
- **ドキュメント索引**: `docs/backend-python/INDEX.md`
- **タスク管理**: `docs/backend-python/TASK_MANAGEMENT_SUMMARY.md`

### Phase別ドキュメント
- **Phase 1**: `docs/backend-python/phase-1-django-rag-foundation/PHASE1_COMPLETION_REPORT.md`
- **Phase 2**: `docs/backend-python/phase-2-ml-evaluation-foundation/README.md`
- **Phase 3**: `docs/backend-python/phase-3-ml-evaluation-expansion/README.md`
- **Phase 4**: `docs/backend-python/phase-4-mlflow-integration/README.md`

---

## 🛠️ 開発ガイド

### Django管理コマンド追加
```python
# backend/rag_api/management/commands/your_command.py
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'コマンドの説明'
    
    def handle(self, *args, **options):
        # 実装
        pass
```

### 評価サービス拡張
```python
# backend/rag_api/services/evaluation_service.py
class EvaluationService:
    def evaluate(self, variant: str, dataset_version: str):
        # 実装
        pass
```

### MLflowログ追加
```python
# backend/rag_api/services/mlflow_service.py
import mlflow

mlflow.log_param('parameter_name', value)
mlflow.log_metric('metric_name', value)
mlflow.set_tag('tag_name', value)
```

---

## 🔧 トラブルシューティング

### Docker関連
```bash
# コンテナ再起動
docker-compose restart rag_backend

# ログ確認
docker logs rag_backend

# コンテナ内にアクセス
docker exec -it rag_backend bash
```

### データベース関連
```bash
# マイグレーション確認
docker exec rag_backend python manage.py showmigrations

# マイグレーション実行
docker exec rag_backend python manage.py migrate

# スーパーユーザー作成
docker exec -it rag_backend python manage.py createsuperuser
```

### MLflow関連
```bash
# MLflowサーバー確認
docker ps | grep mlflow

# MLflow UI アクセス
open http://localhost:5000
```

---

## 📈 システム指標

### 評価メトリクス
- **Precision@5**: 上位5件の精度
- **MRR**: Mean Reciprocal Rank
- **NDCG@20**: Normalized Discounted Cumulative Gain
- **Recall@20**: 上位20件の再現率

### BM25効果（Phase 3検証結果）
- **Technical カテゴリ**: +56.5% MRR改善（0.046 → 0.072）
- **General カテゴリ**: -29.4% MRR低下（0.170 → 0.120）
- **総合判定**: Technical優先のため、BM25採用決定

### Phase 4効果
- **デバッグ効率**: 67%時間削減
- **レビュー効率**: 60%時間削減
- **手動作業削減**: 80%時間削減

---

**作成日**: 2026年1月2日  
**最終更新**: 2026年1月2日  
**メンテナー**: AI Assistant

