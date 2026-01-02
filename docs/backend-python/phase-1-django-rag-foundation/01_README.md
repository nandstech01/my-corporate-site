# Phase 1: Django RAG Foundation - 概要

**Phase**: 1/4  
**期間**: 2週間（完了）  
**ステータス**: ✅ 完了

---

## 📋 目次

1. [00_DATABASE_SURVEY.md](./00_DATABASE_SURVEY.md) - データベース調査結果
2. [01_README.md](./01_README.md) - Phase 1概要（このファイル）
3. [02_API_SPEC.md](./02_API_SPEC.md) - API仕様書
4. [03_IMPLEMENTATION_GUIDE.md](./03_IMPLEMENTATION_GUIDE.md) - 実装ガイド
5. [04_TEST_PLAN.md](./04_TEST_PLAN.md) - テスト計画
6. [05_QUICK_START.md](./05_QUICK_START.md) - クイックスタートガイド ⭐
7. [06_ENV_SETUP.md](./06_ENV_SETUP.md) - 環境変数設定ガイド（既存プロジェクト用）
8. [07_INSTALLATION_GUIDE.md](./07_INSTALLATION_GUIDE.md) - インストールガイド（Django/Python/Grafana MCP） 🚀
9. [08_GRAFANA_MCP_SETUP.md](./08_GRAFANA_MCP_SETUP.md) - Grafana MCP Server セットアップ（完了） ✅
10. [09_DOCKER_SETUP.md](./09_DOCKER_SETUP.md) - Docker セットアップガイド
11. [SUMMARY.md](./SUMMARY.md) - Phase 1実装サマリー

**クイックスタート**: [/SETUP_COMPLETE_GUIDE.md](../../SETUP_COMPLETE_GUIDE.md) を参照してください 🎯

---

## 🎯 Phase 1の目的

### 背景
既存のSupabase PostgreSQL（pgvector）に格納されている5つのRAGシステム（Fragment、Company、Trend、YouTube、Kenji）を統一的にアクセスし、検索ログを記録・可視化する基盤を構築する。

### 目標

1. **Django RAG API**: 5つのRAGソースを統一的に検索できるAPIを構築
2. **検索ログ記録**: 検索クエリ、結果、パフォーマンスを記録
3. **Grafana可視化**: 検索ログをリアルタイムで可視化
4. **既存システム保護**: Fragment/Company Vectors等に一切書き込みを行わない

---

## 🏗️ アーキテクチャ

```
┌─────────────────────────────────────────────────┐
│          Next.js Frontend (既存)                │
│                                                 │
│  - lib/structured-data/                        │
│  - lib/vector/                                 │
│  - Fragment ID System                          │
└────────────┬────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────┐
│          Django RAG API (新規)                  │
│                                                 │
│  POST /api/rag/search    - ハイブリッド検索    │
│  GET  /api/rag/stats     - RAGデータ統計       │
│  GET  /api/rag/health    - ヘルスチェック      │
└────────────┬────────────────────────────────────┘
             │
             ↓ (読み取り専用)
┌─────────────────────────────────────────────────┐
│       Supabase PostgreSQL + pgvector            │
│                                                 │
│  [読み取り専用]                                 │
│  - fragment_vectors (1,556件)                  │
│  - company_vectors (128件)                     │
│  - trend_vectors (127件)                       │
│  - youtube_vectors (18件)                      │
│  - kenji_thoughts (38件)                       │
│                                                 │
│  [Django書き込み]                               │
│  - rag_search_logs (検索ログ)                  │
│  - rag_data_statistics (日次統計)              │
└────────────┬────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────┐
│          Grafana (可視化)                       │
│                                                 │
│  - RAG Overview Dashboard                      │
│  - 検索回数、類似度推移                         │
│  - RAGソース別統計                              │
└─────────────────────────────────────────────────┘
```

---

## 📦 実装内容

### 1. Django RAG API

#### 3つのエンドポイント

| エンドポイント | メソッド | 機能 |
|---------------|---------|------|
| `/api/rag/search` | POST | ハイブリッド検索（BM25 + Vector） |
| `/api/rag/stats` | GET | RAGデータ統計取得 |
| `/api/rag/health` | GET | ヘルスチェック |

#### 対応RAGソース

1. **Fragment Vectors**: 1,556件（Fragment ID対応）
2. **Company Vectors**: 128件（会社情報）
3. **Trend Vectors**: 127件（トレンド、鮮度スコア付き）
4. **YouTube Vectors**: 18件（YouTube動画）
5. **Kenji Thoughts**: 38件（Kenjiの思考、3072次元）

### 2. データベースモデル

#### RAGSearchLog
検索ログを記録するモデル

| フィールド | 型 | 説明 |
|-----------|---|------|
| query | TextField | 検索クエリ |
| sources | JSONField | 検索ソース |
| results_count | IntegerField | 結果件数 |
| top_similarity | FloatField | 最高類似度 |
| avg_similarity | FloatField | 平均類似度 |
| search_duration_ms | IntegerField | 検索時間 |
| created_at | DateTimeField | 作成日時 |

#### RAGDataStatistics
日次統計を記録するモデル

| フィールド | 型 | 説明 |
|-----------|---|------|
| source_type | CharField | ソース種別 |
| stat_date | DateField | 統計日 |
| total_vectors | IntegerField | 総ベクトル数 |
| total_searches | IntegerField | 総検索回数 |
| avg_similarity | FloatField | 平均類似度 |

### 3. Grafana可視化

#### RAG Overview Dashboard

- **検索回数（24時間）**: 時系列グラフ
- **RAGソース別データ件数**: Gaugeチャート
- **検索ソース別利用率（7日間）**: 円グラフ
- **平均類似度推移（24時間）**: 時系列グラフ

---

## 🔒 既存システム保護

### 読み取り専用テーブル

以下のテーブルは**読み取り専用**（Django APIから書き込みなし）:

- ✅ `fragment_vectors` - Fragment ID検索
- ✅ `company_vectors` - 会社情報検索
- ✅ `trend_vectors` - トレンド検索
- ✅ `youtube_vectors` - YouTube検索
- ✅ `kenji_thoughts` - Kenjiの思考検索

### 保護される既存システム

- ✅ `lib/structured-data/` - エンティティ関係性システム
- ✅ `lib/vector/` - ベクトル検索システム
- ✅ Fragment ID システム
- ✅ Complete URI生成
- ✅ ハイブリッド記事生成

---

## 🛠️ 技術スタック

| 層 | 技術 | バージョン |
|---|------|----------|
| Backend | Django | 5.0.6 |
| API Framework | Django REST Framework | 3.15.1 |
| Database | Supabase PostgreSQL | 15 |
| Vector DB | pgvector | (Supabase内蔵) |
| Embeddings | OpenAI API | `text-embedding-3-small` |
| Monitoring | Grafana | 10.4.2 |
| Container | Docker Compose | 3.8 |
| Python | Python | 3.11 |

---

## 📂 ディレクトリ構造

```
my-corporate-site/
├── backend/                         # Django RAG API
│   ├── rag_project/                # Django設定
│   │   ├── settings.py            # Supabase接続、CORS
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── rag_api/                    # RAG APIアプリ
│   │   ├── models.py              # RAGSearchLog、RAGDataStatistics
│   │   ├── services.py            # RAGSearchService
│   │   ├── views.py               # API endpoints
│   │   ├── urls.py
│   │   └── admin.py
│   ├── manage.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── test_api.sh
├── infra/
│   └── grafana/
│       └── provisioning/
│           ├── datasources/supabase.yml
│           └── dashboards/rag-overview.json
├── docs/
│   └── phase-1-django-rag-foundation/
│       ├── 00_DATABASE_SURVEY.md
│       ├── 01_README.md           # このファイル
│       ├── 02_API_SPEC.md
│       ├── 03_IMPLEMENTATION_GUIDE.md
│       ├── 04_TEST_PLAN.md
│       ├── 05_QUICK_START.md      # クイックスタート
│       └── SUMMARY.md
├── docker-compose.yml
└── .env.local.example
```

---

## 🚀 クイックスタート

**詳細な起動手順は [05_QUICK_START.md](./05_QUICK_START.md) を参照してください。**

### 最小限の起動手順（既存プロジェクト用）

```bash
# 1. 環境変数設定（既存の.envに追加）
# 詳細: 06_ENV_SETUP.md
cat >> .env << 'EOF'
DJANGO_SECRET_KEY=django-insecure-dev-key-change-in-production
DEBUG=True
EOF

# 2. Docker Compose起動
docker-compose up -d

# 3. マイグレーション
docker-compose exec backend python manage.py migrate

# 4. アクセス
# Django API: http://localhost:8000/api/rag/
# Grafana: http://localhost:3001 (admin/admin)
```

---

## ✅ Phase 1完了判定基準

- [x] Django RAG APIが起動する
- [x] `/api/rag/search`でハイブリッド検索ができる
- [x] `/api/rag/stats`でRAGデータ統計が取得できる
- [x] `/api/rag/health`でヘルスチェックが成功する
- [x] 検索ログが`rag_search_logs`テーブルに記録される
- [x] Grafanaダッシュボードで検索ログが可視化される
- [x] 既存のFragment/Company Vectorsに影響がない

---

## 🔗 次のステップ

### Phase 2: RAG検索ログ分析（1週間）

**実装内容**:
- 検索ログテーブル拡張（query_category、query_intent）
- クエリ分類機能
- 検索パターン分析
- Grafana高度ダッシュボード

**詳細**: `docs/phase-2-search-logging/README.md`

---

## 📚 関連ドキュメント

### Phase 1ドキュメント

- `00_DATABASE_SURVEY.md` - データベース調査結果（5つのRAGシステム分析）
- `02_API_SPEC.md` - API仕様書（詳細なエンドポイント仕様）
- `03_IMPLEMENTATION_GUIDE.md` - 実装ガイド（Day 1-14の手順）
- `04_TEST_PLAN.md` - テスト計画（7種類のテスト）
- `05_QUICK_START.md` - クイックスタートガイド（起動手順） ⭐
- `SUMMARY.md` - Phase 1実装サマリー

### 全体ドキュメント

- `docs/PHASES_OVERVIEW.md` - 全Phase概要（Phase 1-4）
- `docs/phase-2-search-logging/README.md` - Phase 2概要
- `docs/phase-3-ml-evaluation/README.md` - Phase 3概要
- `docs/phase-4-mlflow-integration/README.md` - Phase 4概要

---

**作成者**: AI Assistant  
**プロジェクト**: NANDS RAG Visualization & ML Evaluation  
**Phase**: 1/4 ✅  
**最終更新**: 2025年12月29日
