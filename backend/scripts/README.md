# Backend Scripts

このディレクトリには、プロジェクトで使用される各種スクリプトが格納されています。

---

## 📂 ディレクトリ構成

```
scripts/
├── README.md              # このファイル
├── development/           # 開発・デバッグ用スクリプト（Phase 4）
├── phase1/                # Phase 1 検証スクリプト
├── phase3/                # Phase 3 成果物
└── database/              # データベーススクリプト
```

---

## 📋 スクリプト分類

### Phase 1 検証スクリプト（`phase1/`）

Phase 1完了時の検証スクリプトです。

- **`verify_embedding_model.py`** - Embedding統一検証（実験0）
- **`test_api.sh`** - RAG API 手動テスト

**詳細**: `phase1/README.md`

---

### Phase 3 成果物（`phase3/`）

Phase 3で生成された成果物です。

- **`evaluation_review_top3.csv`** - BM25効果上位3クエリのレビュー用データ（120行）

**詳細**: `phase3/README.md`

---

### データベーススクリプト（`database/`）

データベース関連の手動スクリプトです。

- **`migrations_manual.sql`** - 手動マイグレーションSQL（Phase 2/3）

**詳細**: `database/README.md`

---

### 開発・デバッグ用スクリプト（`development/`）

Phase 4の開発・検証スクリプトです。本番運用では使用しません。

#### Grafana Dashboard更新スクリプト
- **`update_grafana_dashboard.py`** - 初期ダッシュボード作成
- **`update_grafana_dashboard_task2.py`** - Phase 3 Week 3 Task 2: run_id変数追加
- **`update_grafana_dashboard_task3.py`** - Phase 4 Week 2 Task 3: dataset_version変数追加
- **`update_grafana_dashboard_task4.py`** - Phase 4 Week 2 Task 4: MLflow Run Linkパネル追加

#### データセット作成スクリプト
- **`seed_evaluation_dataset.py`** - v1.0評価データセット作成（初期版）
- **`seed_evaluation_dataset_v2.py`** - v1.0-reviewed評価データセット作成（レビュー版）

#### 調査・検証スクリプト
- **`check_embedding_consistency.py`** - Embedding統一性検証（Phase 1実験0）
- **`investigate_fragment_ids.py`** - Fragment ID調査（v2.0-draft作成前）
- **`investigate_similarity.py`** - 類似度スコア調査

---

## ⚠️ 注意事項

### 開発用スクリプトについて

これらのスクリプトは**開発・検証目的**で作成されたものです：

1. **本番運用では使用しない**: 一度実行して目的を達成したら再実行不要
2. **履歴として保存**: 後から「どうやって設定したか」を確認できるように保存
3. **ドキュメント代わり**: コードがドキュメントとして機能する

### 再実行時の注意

もし再実行が必要な場合：
- Grafana更新スクリプト: `overwrite: True` が設定されているため、既存ダッシュボードを上書きします
- データセット作成スクリプト: Djangoのmanagement commandを使用してください（`create_v2_dataset.py`など）

---

## 🔧 本番運用スクリプト

本番運用で使用する検収スクリプトは、`backend/`ディレクトリ直下に配置されています：

- **`verify_mlflow_logging.py`** - MLflowロギング検証（Phase 4 Week 1）
- **`verify_grafana_panels.py`** - Grafanaパネル検証（Phase 3 Week 3 + Phase 4 Week 2）
- **`verify_task4_links.py`** - Grafana↔MLflow相互参照検証（Phase 4 Week 2）

これらは定期的に実行してシステムの正常性を確認するために使用します。

---

## 📚 関連ドキュメント

- **Phase 1完了報告**: `docs/backend-python/phase-1-django-rag-foundation/PHASE1_COMPLETION_REPORT.md`
- **Phase 3完了報告**: `docs/backend-python/phase-3-ml-evaluation-expansion/README.md`
- **Phase 4完了報告**: `docs/backend-python/phase-4-mlflow-integration/README.md`
- **タスク管理サマリー**: `docs/backend-python/TASK_MANAGEMENT_SUMMARY.md`

---

**作成日**: 2026年1月2日  
**最終更新**: 2026年1月2日

