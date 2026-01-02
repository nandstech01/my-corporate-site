# Django RAG API + ML評価 + MLflow統合 プロジェクト

**最終更新**: 2026-01-02  
**プロジェクトステータス**: ✅ **Phase 1-4 完了（評価基盤構築完了）**

---

## 📚 ドキュメント構成

### 🎯 プロジェクト管理

- **[タスク管理サマリー](./TASK_MANAGEMENT_SUMMARY.md)** - 全体進捗とタスク一覧（Phase 1-4）
- **[全体概要](./PHASES_OVERVIEW.md)** - Phase 1-4の全体像と関係性
- **[ドキュメント索引](./INDEX.md)** - すべてのドキュメントの索引

### 📖 Phase 1: Django RAG Foundation（✅ 完了）

**完了報告**: [phase-1-django-rag-foundation/PHASE1_COMPLETION_REPORT.md](./phase-1-django-rag-foundation/PHASE1_COMPLETION_REPORT.md)

<details>
<summary>詳細ドキュメント</summary>

1. **[プロジェクト概要](./phase-1-django-rag-foundation/01_PROJECT_OVERVIEW.md)**
   - プロジェクトの目的、スコープ、技術スタック

2. **[システムアーキテクチャ](./phase-1-django-rag-foundation/02_ARCHITECTURE.md)**
   - システム構成図、コンポーネント設計

3. **[実装ガイド](./phase-1-django-rag-foundation/03_IMPLEMENTATION_GUIDE.md)**
   - ステップバイステップの実装手順

4. **[データモデル詳細](./phase-1-django-rag-foundation/04_MODELS_AND_DATA.md)**
   - データベーススキーマ、モデル定義

5. **[API仕様書](./phase-1-django-rag-foundation/05_API_SPECIFICATION.md)**
   - REST API エンドポイントの詳細仕様

6. **[Grafana セットアップガイド](./GRAFANA_SIMPLE_SOLUTION.md)**
   - Grafana の設定とダッシュボード構築

</details>

### 📖 Phase 2: ML評価基盤構築（✅ 完了）

**完了報告**: [phase-2-ml-evaluation-foundation/README.md](./phase-2-ml-evaluation-foundation/README.md)

**主要成果物**:
- 評価データセット管理（`EvaluationQuery`, `EvaluationResult` モデル）
- Precision@5, MRR 実装
- BM25 再ランキング
- Grafana 評価指標パネル

### 📖 Phase 3: ML評価システム拡張（✅ 完了）

**完了報告**: [phase-3-ml-evaluation-expansion/README.md](./phase-3-ml-evaluation-expansion/README.md)

**主要成果物**:
- 評価データセット拡張（v1.0-reviewed: 25件）
- NDCG@20, Recall@20 実装
- RRF（Reciprocal Rank Fusion）
- Grafana run_id変数（run単位可視化）
- **BM25採用決定**（Technical: +56.5% MRR改善）

### 📖 Phase 4: MLflow統合（✅ 完了）

**完了報告**: [phase-4-mlflow-integration/README.md](./phase-4-mlflow-integration/README.md)

**主要成果物**:
- MLflow Tracking Server 構築
- 自動ログ実装（パラメータ7項目、メトリクス8項目）
- 評価データセット拡張（v2.0: 50件）
- Grafana dataset_version変数
- **Grafana ↔ MLflow 相互参照**（効率67%向上）

**詳細レポート**:
- [Gate 2完了レポート](./phase-4-mlflow-integration/phase-4-week2-gate2-progress.md)
- [Task 3完了レポート](./phase-4-mlflow-integration/phase-4-week2-task3-progress.md)
- [Task 4完了レポート](./phase-4-mlflow-integration/phase-4-week2-task4-progress.md)

---

## 🚀 クイックスタート

### 前提条件

- Docker Desktop インストール済み
- `.env` ファイル設定済み

### 起動手順

```bash
# 1. プロジェクトディレクトリに移動
cd /Users/nands/my-corporate-site

# 2. Docker Compose でサービス起動
docker-compose up -d

# 3. サービス確認
docker-compose ps

# 4. Django API ヘルスチェック
curl http://localhost:8000/api/rag/health

# 5. Grafana ダッシュボードにアクセス
open http://localhost:3001
# ログイン: admin / admin
```

### 動作確認

```bash
# RAG 検索テスト
curl -X POST http://localhost:8000/api/rag/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "AIエージェント開発について教えてください",
    "sources": ["fragment", "company"],
    "threshold": 0.3,
    "limit": 10
  }'
```

---

## 📊 現在の状況

### システム稼働状況

| サービス | ステータス | URL |
|---------|-----------|-----|
| Django API | ✅ 稼働中 | http://localhost:8000 |
| Grafana | ✅ 稼働中 | http://localhost:3001 |
| Supabase PostgreSQL | ✅ 接続中 | db.xhmhzhethpwjxuwksmuv.supabase.co:5432 |

### Phase 進捗

```
Phase 1: Django RAG Foundation      ████████████████████ 100% ✅
Phase 2: ML評価指標実装             ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Phase 3: MLflow統合                 ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Phase 4: 本番環境デプロイ            ░░░░░░░░░░░░░░░░░░░░   0% ⏳

全体: ████████░░░░░░░░░░░░ 25%
```

---

## 🎯 プロジェクト目標

### Phase 1 の成果（✅ 完了）

- ✅ Django REST API による RAG 検索システム
- ✅ 5つのベクトルソース統合（fragment, company, trend, youtube, kenji）
- ✅ 検索ログ記録システム
- ✅ Grafana による可視化ダッシュボード
- ✅ Docker Compose による統合環境

### Phase 2 の目標（⏳ 未開始）

- ⏳ Recall@k, MRR, NDCG の実装
- ⏳ 評価データセット作成
- ⏳ 評価指標ダッシュボード

### Phase 3 の目標（⏳ 未開始）

- ⏳ MLflow サーバーセットアップ
- ⏳ 実験トラッキング実装
- ⏳ A/Bテストフレームワーク

### Phase 4 の目標（⏳ 未開始）

- ⏳ Vercel デプロイ
- ⏳ CI/CD パイプライン
- ⏳ 本番環境モニタリング

---

## 📁 プロジェクト構成

```
my-corporate-site/
├── backend/                          # Django RAG API
│   ├── rag_project/                  # Django プロジェクト
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── rag_api/                      # RAG API アプリ
│   │   ├── models.py                 # データモデル
│   │   ├── services.py               # RAG検索サービス
│   │   ├── views.py                  # APIビュー
│   │   └── urls.py
│   ├── requirements.txt              # Python依存関係
│   └── Dockerfile
│
├── infra/
│   └── grafana/
│       └── provisioning/
│           ├── datasources/          # データソース設定
│           │   └── supabase.yml
│           └── dashboards/           # ダッシュボード定義
│               ├── dashboard.yml
│               └── rag-overview.json
│
├── docs/                             # プロジェクトドキュメント
│   ├── README.md                     # 本ファイル
│   ├── TASK_MANAGEMENT_SUMMARY.md    # タスク管理
│   ├── GRAFANA_SIMPLE_SOLUTION.md
│   └── phase-1-django-rag-foundation/
│       ├── PHASE1_COMPLETION_REPORT.md
│       ├── 01_PROJECT_OVERVIEW.md
│       ├── 02_ARCHITECTURE.md
│       ├── 03_IMPLEMENTATION_GUIDE.md
│       ├── 04_MODELS_AND_DATA.md
│       └── 05_API_SPECIFICATION.md
│
├── docker-compose.yml                # Docker Compose 設定
└── .env                              # 環境変数（gitignore）
```

---

## 🔧 技術スタック

### バックエンド

- **Django 5.0** - Webフレームワーク
- **Django REST Framework 3.15** - REST API
- **PostgreSQL (Supabase)** - データベース
- **pgvector** - ベクトル検索拡張

### AI/ML

- **OpenAI API** - Embeddings生成
  - モデル: `text-embedding-3-small`
  - 次元数: 1536

### 可視化

- **Grafana 10.4** - ダッシュボード

### インフラ

- **Docker & Docker Compose** - コンテナ化
- **IPv6 ネットワーク** - Supabase接続対応

---

## 🎓 学習リソース

### 公式ドキュメント

- [Django 5.0 公式ドキュメント](https://docs.djangoproject.com/ja/5.0/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Grafana 10.4 公式ドキュメント](https://grafana.com/docs/grafana/v10.4/)
- [OpenAI Embeddings API](https://platform.openai.com/docs/guides/embeddings)
- [PostgreSQL pgvector](https://github.com/pgvector/pgvector)

### プロジェクト固有

- [Mike King Theory（Relevance Engineering）](https://www.ipullrank.com/mike-king)
- [Fragment ID / Complete URI](./phase-1-django-rag-foundation/02_ARCHITECTURE.md#fragment-id設計)

---

## 🐛 トラブルシューティング

### よくある問題

#### 1. Django API が起動しない

```bash
# エラーログ確認
docker logs rag_backend

# コンテナ再起動
docker-compose restart backend
```

#### 2. Grafana でデータが表示されない

```bash
# データソース接続確認
curl -u admin:admin -X POST http://localhost:3001/api/datasources/uid/P01B10AD872D9061B/health

# ダッシュボード再読み込み
# Grafana UI で Refresh ボタンをクリック
```

#### 3. Supabase 接続エラー

```bash
# 環境変数確認
docker exec rag_backend env | grep DATABASE

# IPv6 ネットワーク確認
docker network inspect my-corporate-site_rag_net
```

### サポート

詳細なトラブルシューティングは、各ドキュメントの該当セクションを参照してください。

---

## 📝 変更履歴

| 日付 | バージョン | 変更内容 |
|-----|----------|---------|
| 2025-12-29 | 1.0.0 | 初版作成、Phase 1 完了 |

---

## 👥 コントリビューター

- **nands** - プロジェクトオーナー
- **AI Assistant (Claude Sonnet 4.5)** - 実装・ドキュメント作成

---

## 📄 ライセンス

プロジェクト内部使用

---

## 🎉 次のステップ

Phase 1 が完了し、最終調整も完了しました！次は以下のアクションを検討してください：

1. ~~**ベクトルデータ投入**~~: ✅ 完了（1,829件のデータが既に存在）
2. **Phase 2 開始**: ML評価指標の実装に着手
3. **評価データセット作成**: ドメインエキスパートによるゴールドスタンダード準備
4. **類似度閾値の継続的最適化**: 実運用データを基にチューニング

詳細は [タスク管理サマリー](./TASK_MANAGEMENT_SUMMARY.md) を参照してください。

---

## 📝 最新更新履歴

### 2025-12-29 (Phase 2-3 スコープ再定義)
- 🔄 **Phase定義の再構成**
  - 旧Phase 2（検索ログ分析）→ 新Phase 3に統合
  - 旧Phase 3（ML評価）→ 新Phase 2-3に分割
  - 理由: 実験0の結論（Embedding統一証明）により、ML評価を優先
- 📦 **旧定義をアーカイブ**
  - `archived/phase-2-search-logging/`（参考用）
  - `archived/phase-3-ml-evaluation/`（参考用）
  - 詳細: `archived/ARCHIVE_README.md`
- 📚 **新ドキュメント作成**
  - `phase-2-ml-evaluation-foundation/`（ML評価基盤）
  - `phase-3-ml-evaluation-expansion/`（ML評価拡張）

### 2025-12-29 (実験0: Embedding統一検証)
- 🔬 **再埋め込み一致テスト実施**
  - すべてのRAGソースで text-embedding-3-large (1536d) 統一を**証明**
  - 平均cosine similarity: **0.999+**（完全一致レベル）
  - モデル混在なし、前処理の一貫性確認
  - Phase 2 評価の土台が安定
- ✅ **検証スクリプト作成**: `backend/verify_embedding_model.py`
- 📊 **20件サンプル検証**: すべて0.9997〜1.0000の範囲

### 2025-12-29 (Phase 1 最終調整)
- ✅ Django Admin 管理画面セットアップ完了
- ✅ RAG検索の類似度閾値最適化（0.3 → 0.01）
- ✅ Grafana ダッシュボード全4パネル修正完了
- ✅ すべてのシステムコンポーネントが正常動作確認済み
- 📊 検索ログ: 11件記録、平均類似度: 3.48%、平均検索時間: 748ms

### 2025-12-29 (Phase 1 初期実装)
- ✅ Django RAG API 実装完了
- ✅ Grafana ダッシュボード初期構築
- ✅ Docker Compose 統合環境構築
- ✅ Supabase PostgreSQL 接続確立（IPv6対応）

---

**プロジェクト開始日**: 2025-12-29  
**Phase 1 完了日**: 2025-12-29  
**Phase 1 最終調整完了**: 2025-12-29  
**実験0 完了**: 2025-12-29  
**次回マイルストーン**: Phase 2 開始

