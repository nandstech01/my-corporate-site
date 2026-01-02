# Backend Python (Django RAG / ML評価) ドキュメント

このディレクトリには、Django RAG API、ML評価システム、MLflow統合に関するすべてのドキュメントが格納されています。

---

## 📂 ディレクトリ構成

```
backend-python/
├── README.md                           # このファイル
├── TASK_MANAGEMENT_SUMMARY.md          # 全体タスク管理・進捗サマリー
├── PHASES_OVERVIEW.md                  # Phase 1〜4 の概要
│
├── phase-1-django-rag-foundation/      # Phase 1: Django RAG基盤構築
│   ├── 01_README.md                    # Phase 1 概要
│   ├── 03_IMPLEMENTATION_GUIDE.md      # 実装ガイド
│   ├── PHASE1_COMPLETION_REPORT.md     # Phase 1 完了報告
│   ├── EMBEDDING_VERIFICATION_REPORT.md # Embedding統一検証報告
│   └── ... (その他の詳細ドキュメント)
│
├── phase-2-ml-evaluation-foundation/   # Phase 2: ML評価基盤構築（最小実装）
│   └── README.md                       # Phase 2 計画・完了報告
│
├── phase-3-ml-evaluation-expansion/    # Phase 3: ML評価システム拡張
│   ├── README.md                       # Phase 3 計画
│   ├── WEEK1_WORK_LOG.md               # Week 1 作業ログ（詳細）
│   └── PROGRESS_REPORT_20251229.md     # Week 1 進捗レポート
│
├── phase-4-mlflow-integration/         # Phase 4: MLflow統合
│   ├── INDEX.md                        # Phase 4 ドキュメント索引
│   ├── README.md                       # Phase 4 計画・完了報告
│   ├── GATE2_CORRECTIONS.md            # Gate 2 修正報告
│   ├── phase-4-week2-gate2-progress.md # Gate 2 完了レポート
│   ├── phase-4-week2-task3-progress.md # Task 3 完了レポート
│   ├── phase-4-week2-task4-requirements.md # Task 4 要件定義
│   └── phase-4-week2-task4-progress.md # Task 4 完了レポート
│
└── archived/                           # アーカイブ（旧Phase 2/3計画）
    ├── ARCHIVE_README.md               # アーカイブ説明
    ├── phase-2-search-logging/         # 旧Phase 2（Phase 3に統合）
    └── phase-3-ml-evaluation/          # 旧Phase 3（Phase 2/3に分割）
```

---

## 🎯 プロジェクト概要

### 目的
既存のSupabase RAGシステムに対して、Django APIを構築し、ML評価・MLflow統合を実現する。

### 技術スタック
- **Backend**: Django 5.0, Django REST Framework
- **Database**: Supabase PostgreSQL (pgvector)
- **ML/AI**: OpenAI Embeddings (text-embedding-3-large, 1536d), BM25, RRF
- **Monitoring**: Grafana, MLflow
- **Deployment**: Docker Compose

---

## 📋 Phase 別進捗

### ✅ Phase 1: Django RAG基盤構築（完了）

**期間**: 2週間  
**ステータス**: ✅ 完了

**主要成果物**:
- Django RAG API (`/api/rag/search`, `/api/rag/stats`, `/api/rag/health`)
- Supabase PostgreSQL 接続（既存の5テーブルを読み取り専用で利用）
- Grafana ダッシュボード（RAG Overview Dashboard - 7パネル）
- Embedding統一検証（text-embedding-3-large, 1536d で統一証明）
- Top-k固定検索（LIMIT 20、閾値なし）

**詳細**: `phase-1-django-rag-foundation/PHASE1_COMPLETION_REPORT.md`

---

### ✅ Phase 2: ML評価基盤構築（完了）

**期間**: 1週間  
**ステータス**: ✅ 完了

**主要成果物**:
- 評価データセット管理システム (`EvaluationQuery`, `EvaluationResult` モデル)
- Precision@5, MRR 実装 (`EvaluationService`)
- BM25 再ランキング実装 (`BM25Service`)
- Grafana 評価指標パネル追加（Panel 5-7）

**検収結果**:
- ✅ 検収1: 評価の再実行性（合格）
- ✅ 検収2: 保存先の一貫性（合格）
- ✅ 検収3: Grafanaの参照確認（合格）
- ⚠️ 検収4: 改善が見える（Phase 3へ持ち越し - 架空IDのため）

**詳細**: `phase-2-ml-evaluation-foundation/README.md`

---

### ✅ Phase 3: ML評価システム拡張（完了）

**期間**: 2週間  
**ステータス**: ✅ 完了

**主要成果物**:
- ✅ 実Fragment IDベース評価データセット（v1.0-reviewed: 25件）
- ✅ NDCG@20, Recall@20 実装
- ✅ RRF（Reciprocal Rank Fusion）実装
- ✅ BM25 vs Baseline 効果検証
- ✅ Grafana run_id変数追加（run単位の評価推移可視化）
- ✅ Technical vs General カテゴリ分離表示

**検証結果**:
- **BM25効果**: Technical カテゴリで **+56.5% MRR改善**（0.046 → 0.072）
- **採用判定**: BM25を本番採用決定

**詳細**: 
- `phase-3-ml-evaluation-expansion/README.md` - 全体計画・完了報告

---

### ✅ Phase 4: MLflow統合（完了）

**期間**: 2週間（想定）→ 1週間（実績）  
**ステータス**: ✅ 完了  
**完了日**: 2026年1月2日

**主要成果物**:
- ✅ MLflow Tracking Server 構築（Docker Compose統合）
- ✅ 自動ログ実装（パラメータ7項目、メトリクス8項目）
- ✅ 評価データセット拡張（v2.0: 50件、Technical 60% / General 40%）
- ✅ Grafana dataset_version変数追加（堅牢版SQL）
- ✅ Grafana ↔ MLflow 相互参照実装（ワンクリック遷移）

**検収結果**:
- ✅ Gate 2検証: MLflowロギング完全性（合格）
- ✅ Task 3検証: dataset_version変数（合格）
- ✅ Task 4検証: 相互参照リンク（合格）

**期待効果**:
- デバッグ効率: **67%時間削減**
- レビュー効率: **60%時間削減**
- 手動作業削減: **80%時間削減**

**詳細**: 
- `phase-4-mlflow-integration/README.md` - Phase 4全体計画・完了報告
- `phase-4-mlflow-integration/phase-4-week2-gate2-progress.md` - Gate 2完了レポート
- `phase-4-mlflow-integration/phase-4-week2-task3-progress.md` - Task 3完了レポート
- `phase-4-mlflow-integration/phase-4-week2-task4-progress.md` - Task 4完了レポート

---

## 🔗 重要なドキュメント

### プロジェクト全体

- **`TASK_MANAGEMENT_SUMMARY.md`**: 全体のタスク管理、進捗、完了判定基準
- **`PHASES_OVERVIEW.md`**: Phase 1〜4 の概要と依存関係

### Phase 1（基盤構築）

- **`phase-1-django-rag-foundation/PHASE1_COMPLETION_REPORT.md`**: Phase 1 完了報告
- **`phase-1-django-rag-foundation/EMBEDDING_VERIFICATION_REPORT.md`**: Embedding統一検証報告（Experiment 0）
- **`phase-1-django-rag-foundation/FINAL_ADJUSTMENT_REPORT.md`**: 最終調整報告（閾値最適化、Grafanaパネル修正）

### Phase 2（ML評価基盤）

- **`phase-2-ml-evaluation-foundation/README.md`**: Phase 2 計画・検収結果・Phase 3への引き継ぎ

### Phase 3（ML評価拡張）

- **`phase-3-ml-evaluation-expansion/WEEK1_WORK_LOG.md`**: Week 1 の詳細作業ログ（再現可能な手順記載）
- **`phase-3-ml-evaluation-expansion/PROGRESS_REPORT_20251229.md`**: Week 1 進捗レポート

---

## 🚀 クイックスタート

### 1. Django RAG API の起動

```bash
cd /Users/nands/my-corporate-site
docker-compose up -d
```

**アクセス**:
- Django API: `http://localhost:8000`
- Django Admin: `http://localhost:8000/admin` (admin / admin)
- Grafana: `http://localhost:3001` (admin / admin)

### 2. 評価データセットの確認

```bash
cd /Users/nands/my-corporate-site/backend
python << 'EOF'
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rag_project.settings')
django.setup()

from rag_api.models import EvaluationQuery
print(f"評価クエリ数: {EvaluationQuery.objects.count()}")
for q in EvaluationQuery.objects.all()[:5]:
    print(f"  - {q.query} ({q.category})")
EOF
```

### 3. 評価実行（baseline）

```bash
cd /Users/nands/my-corporate-site/backend
python test_evaluation.py
```

---

## 📊 現在の状態

### システム稼働状況

- ✅ Django RAG API: 稼働中
- ✅ Grafana Dashboard: 稼働中（7パネル表示）
- ✅ 評価データセット: 25クエリ投入済み
- ⏳ RRF実装: 未着手

### データベース

- **Supabase PostgreSQL**:
  - `fragment_vectors`: 1,556件
  - `company_vectors`: データあり
  - `trend_vectors`: データあり
  - `youtube_vectors`: データあり
  - `knowledge_vectors`: データあり
  - `evaluation_queries`: 25件
  - `evaluation_results`: baseline, bm25 評価結果あり

### Embedding統一状況

- ✅ **統一完了**: すべてのRAGソーステーブルで `text-embedding-3-large (1536d)` を使用
- ✅ **検証完了**: 再埋め込み一致テストで平均0.999+の類似度を確認

---

## 🎯 次のステップ

### Phase 3 Week 1（進行中）

1. ⏳ **Task 2 完了** (15分) - `EvaluationService` 更新
2. 🔲 **Task 3** (2日) - RRF実装
3. 🔲 **Task 4** (1日) - baseline vs RRF 効果検証
4. 🔲 **Task 5** (1日) - 結果分析・ドキュメント更新

### Phase 3 Week 2（計画中）

- Recall@k 実装
- NDCG 実装
- A/Bテスト基盤
- APIエンドポイント追加 (`/api/rag/evaluate`, `/api/rag/ab-test`)
- 評価データセット拡張（25→50件）

---

## 📝 ドキュメント管理方針

### 作業ログ

- **詳細な作業ログ**: `phase-X/WEEKY_WORK_LOG.md` - 再現可能な手順を記載
- **進捗レポート**: `phase-X/PROGRESS_REPORT_YYYYMMDD.md` - 定期的な進捗サマリー

### 完了報告

- **Phase完了報告**: `phase-X/PHASEХ_COMPLETION_REPORT.md` - Phase完了時に作成

### アーカイブ

- **旧計画の保管**: `archived/` - 計画変更前のドキュメントを保管

---

## 🔍 トラブルシューティング

### よくある問題

1. **Docker コンテナが起動しない**
   - `docker-compose down -v` → `docker-compose up -d --build`

2. **Grafana でデータが表示されない**
   - Supabase接続確認: `docker logs rag_grafana`
   - データソースUID確認: `P01B10AD872D9061B`

3. **評価実行でエラー**
   - 評価データセット確認: `EvaluationQuery.objects.count()`
   - マイグレーション確認: `python manage.py showmigrations`

---

**最終更新**: 2025-12-29  
**管理者**: Phase 3 Week 1 実装チーム

