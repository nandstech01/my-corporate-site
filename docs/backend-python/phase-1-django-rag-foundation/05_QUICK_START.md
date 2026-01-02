# Phase 1: Django RAG Foundation - クイックスタートガイド

**実装完了日**: 2025年12月29日  
**ステータス**: ✅ 完了

---

## 🎯 Phase 1の目的

1. ✅ Django RAG API（統一検索エンドポイント）
2. ✅ 検索ログ記録（`rag_search_logs` テーブル）
3. ✅ Grafana可視化（RAGデータ統計ダッシュボード）
4. ✅ 既存システム保護（Fragment/Company Vectorsは読み取り専用）

---

## 📁 プロジェクト構造

```
my-corporate-site/
├── backend/                         # Django RAG API
│   ├── rag_project/                # Django設定
│   │   ├── __init__.py
│   │   ├── settings.py            # ✅ Supabase接続、CORS
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── rag_api/                    # RAG APIアプリ
│   │   ├── __init__.py
│   │   ├── apps.py
│   │   ├── models.py              # ✅ RAGSearchLog、RAGDataStatistics
│   │   ├── services.py            # ✅ RAGSearchService（ハイブリッド検索）
│   │   ├── views.py               # ✅ API endpoints
│   │   ├── urls.py
│   │   ├── admin.py
│   │   └── migrations/
│   ├── manage.py
│   ├── requirements.txt           # ✅ Django、DRF、OpenAI、Langchain
│   ├── Dockerfile                 # ✅ Python 3.11
│   └── test_api.sh               # ✅ APIテストスクリプト
├── infra/
│   └── grafana/
│       └── provisioning/
│           ├── datasources/
│           │   └── supabase.yml   # ✅ Supabase PostgreSQL接続
│           └── dashboards/
│               ├── dashboard.yml
│               └── rag-overview.json  # ✅ RAG統計ダッシュボード
├── docs/
│   └── phase-1-django-rag-foundation/
│       ├── 00_DATABASE_SURVEY.md
│       ├── 01_README.md
│       ├── 02_API_SPEC.md
│       ├── 03_IMPLEMENTATION_GUIDE.md
│       ├── 04_TEST_PLAN.md
│       ├── 05_QUICK_START.md      # このファイル
│       └── SUMMARY.md
├── docker-compose.yml              # ✅ backend + grafana
└── .env.local.example              # ✅ 環境変数テンプレート
```

---

## 🚀 起動手順

### 1. 環境変数設定

**⚠️ 重要**: 既存の`.env`ファイルがある場合は、**末尾に追加**してください。

```bash
# プロジェクトルートで既存の.envファイルに追加
cd /Users/nands/my-corporate-site

# .envファイルの末尾にDjango用設定を追加
cat >> .env << 'EOF'

# ========================================
# Django RAG API 追加設定 (2025-12-29)
# ========================================
DJANGO_SECRET_KEY=django-insecure-dev-key-change-in-production
DEBUG=True
EOF
```

**既に存在するはずの変数**（確認のみ、追加不要）:
- `DATABASE_PASSWORD=11925532kG1192` - Supabase接続（既存）
- `OPENAI_API_KEY=sk-...` - OpenAI API（既存）

**📚 詳細**: [06_ENV_SETUP.md](./06_ENV_SETUP.md)

### 2. Docker Compose起動

```bash
# コンテナビルド & 起動
docker-compose up -d

# ログ確認
docker-compose logs -f backend
docker-compose logs -f grafana
```

### 3. データベースマイグレーション

```bash
# Djangoマイグレーション実行
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate

# 管理者ユーザー作成（オプション）
docker-compose exec backend python manage.py createsuperuser
```

### 4. サービスアクセス

- **Django API**: http://localhost:8000/api/rag/
- **Grafana**: http://localhost:3001 (admin/admin)
- **Django Admin**: http://localhost:8000/admin

---

## 📋 APIエンドポイント

### 1. ハイブリッド検索

```bash
POST http://localhost:8000/api/rag/search
Content-Type: application/json

{
  "query": "AIエージェント開発について教えてください",
  "sources": ["fragment", "company"],
  "threshold": 0.3,
  "limit": 10
}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "query": "AIエージェント開発について教えてください",
    "sources": ["fragment", "company"],
    "results": [
      {
        "source": "fragment",
        "fragment_id": "ai-agents#main-title",
        "url": "https://nands.tech/ai-agents#main-title",
        "title": "AIエージェント開発",
        "content": "Mastra Frameworkを活用した...",
        "similarity": 0.92
      }
    ],
    "total_count": 15,
    "search_duration_ms": 234,
    "top_similarity": 0.92,
    "avg_similarity": 0.78
  }
}
```

### 2. RAGデータ統計

```bash
GET http://localhost:8000/api/rag/stats
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "rag_sources": {
      "fragment": {"count": 1556, "size": "35 MB"},
      "company": {"count": 128, "size": "7584 kB"},
      "trend": {"count": 127, "size": "3296 kB"},
      "youtube": {"count": 18, "size": "1712 kB"},
      "kenji": {"count": 38, "size": "576 kB"}
    },
    "search_stats_last_7_days": {
      "total_searches": 145,
      "avg_similarity": 0.82,
      "avg_duration": 198
    }
  }
}
```

### 3. ヘルスチェック

```bash
GET http://localhost:8000/api/rag/health
```

**レスポンス**:
```json
{
  "success": true,
  "status": "healthy",
  "database": "connected",
  "openai_api": "connected",
  "embedding_dimensions": 1536,
  "timestamp": "2025-12-29T10:00:00Z"
}
```

---

## 📊 Grafanaダッシュボード

### アクセス方法

1. http://localhost:3001 にアクセス
2. ユーザー名: `admin`、パスワード: `admin`
3. 「RAG Overview Dashboard」を選択

### ダッシュボード内容

- **検索回数（24時間）**: 時系列グラフ
- **RAGソース別データ件数**: Fragment、Company、Trend、YouTube、Kenjiの件数
- **検索ソース別利用率（7日間）**: 円グラフ
- **平均類似度推移（24時間）**: 類似度の時系列推移

---

## 🔒 既存システム保護

### 読み取り専用テーブル

以下のテーブルは**読み取り専用**（Django APIから書き込みなし）:

- ✅ `fragment_vectors` (1,556件)
- ✅ `company_vectors` (128件)
- ✅ `trend_vectors` (127件)
- ✅ `youtube_vectors` (18件)
- ✅ `kenji_thoughts` (38件)

### Djangoが書き込むテーブル

以下のテーブルのみDjango APIが作成・書き込み:

- ✅ `rag_search_logs` (検索ログ)
- ✅ `rag_data_statistics` (日次統計)

---

## 🧪 テスト方法

### 1. APIテスト（テストスクリプト使用）

```bash
# プロジェクトルートで実行
cd /Users/nands/my-corporate-site

# テストスクリプトを実行
./backend/test_api.sh
```

### 2. APIテスト（curl手動）

```bash
# 検索テスト
curl -X POST http://localhost:8000/api/rag/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "レリバンスエンジニアリングとは",
    "sources": ["fragment"],
    "limit": 5
  }'

# 統計テスト
curl http://localhost:8000/api/rag/stats

# ヘルスチェック
curl http://localhost:8000/api/rag/health
```

### 3. Grafana確認

1. http://localhost:3001 にアクセス
2. ダッシュボードで検索ログが表示されることを確認
3. データソース接続が正常であることを確認

---

## 🛠️ トラブルシューティング

### エラー: `django-admin: command not found`

→ Dockerコンテナ内で実行するため、ローカルインストール不要

### エラー: `relation "fragment_vectors" does not exist`

→ Supabaseデータベース接続を確認:
```bash
# .envファイルのDATABASE_*変数を確認
cat .env | grep DATABASE
```

### エラー: `OpenAI API key not found`

→ `.env`ファイルに`OPENAI_API_KEY`を設定:
```bash
OPENAI_API_KEY=sk-...
```

### Grafanaでデータが表示されない

→ Grafanaデータソース設定を確認:
```bash
# Grafanaコンテナログ確認
docker-compose logs grafana

# データソース接続テスト
# Grafana UI → Configuration → Data Sources → Supabase PostgreSQL → Test
```

### Dockerコンテナが起動しない

```bash
# コンテナステータス確認
docker-compose ps

# コンテナ再起動
docker-compose restart

# コンテナ再ビルド
docker-compose down
docker-compose up -d --build
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

Phase 1完了後、**Phase 2: RAG検索ログ分析**へ進みます。

詳細: `docs/phase-2-search-logging/README.md`

---

## 📚 関連ドキュメント

- `00_DATABASE_SURVEY.md` - データベース調査結果
- `01_README.md` - Phase 1概要
- `02_API_SPEC.md` - API仕様書
- `03_IMPLEMENTATION_GUIDE.md` - 実装ガイド
- `04_TEST_PLAN.md` - テスト計画
- `SUMMARY.md` - Phase 1実装サマリー

---

**作成者**: AI Assistant  
**プロジェクト**: NANDS RAG Visualization & ML Evaluation  
**Phase**: 1/4 ✅

