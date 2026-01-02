# Phase 1: Django RAG API 仕様書

---

## 📋 APIエンドポイント一覧

| メソッド | エンドポイント | 説明 | 認証 |
|---------|--------------|------|------|
| POST | `/api/rag/search` | RAG統一検索 | 不要 |
| GET | `/api/rag/stats` | RAG統計情報 | 不要 |
| GET | `/api/rag/health` | ヘルスチェック | 不要 |

---

## 1. POST /api/rag/search

### 概要
5つのRAGシステムを統一インターフェースで検索

### リクエスト

```http
POST /api/rag/search
Content-Type: application/json

{
  "query": "AIアーキテクトとは何ですか？",
  "sources": ["fragment", "company", "trend", "youtube", "kenji"],
  "match_count": 10,
  "threshold": 0.3,
  "bm25_weight": 0.4,
  "vector_weight": 0.6,
  "filters": {
    "page_path": "/faq",
    "content_type": "faq"
  }
}
```

**パラメータ**:

| フィールド | 型 | 必須 | デフォルト | 説明 |
|-----------|---|------|-----------|------|
| query | string | ✅ | - | 検索クエリ |
| sources | string[] | ❌ | ["fragment", "company", "trend", "youtube", "kenji"] | 検索対象RAG |
| match_count | integer | ❌ | 10 | 取得件数 |
| threshold | float | ❌ | 0.3 | 類似度閾値 |
| bm25_weight | float | ❌ | 0.4 | BM25の重み |
| vector_weight | float | ❌ | 0.6 | Vectorの重み |
| filters | object | ❌ | {} | フィルタ条件 |

**sources配列の値**:
- `"fragment"`: Fragment Vectors（Fragment ID専用）
- `"company"`: Company Vectors（会社情報）
- `"trend"`: Trend Vectors（トレンド情報）
- `"youtube"`: YouTube Vectors（YouTube動画）
- `"kenji"`: Kenji Thoughts（原田賢治思想、3072次元）

### レスポンス（成功）

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "query": "AIアーキテクトとは何ですか？",
  "sources_searched": ["fragment", "company", "kenji"],
  "total_results": 15,
  "search_duration_ms": 247,
  "results": {
    "fragment": [
      {
        "id": 123,
        "fragment_id": "faq-tech-1",
        "complete_uri": "https://nands.tech/faq#faq-tech-1",
        "page_path": "/faq",
        "content_title": "AIアーキテクトとは何ですか？",
        "content": "AIアーキテクトは、AIシステムの設計・構築・運用を統括する専門家です...",
        "content_type": "faq",
        "category": "tech",
        "bm25_score": 0.85,
        "vector_score": 0.92,
        "combined_score": 0.89,
        "semantic_weight": 0.95,
        "target_queries": ["AIアーキテクト", "AI設計者"],
        "related_entities": ["AI開発", "システム設計"],
        "created_at": "2025-01-15T10:30:00Z"
      }
      // ... 他の結果
    ],
    "company": [
      {
        "id": 45,
        "content_id": "service-ai-architect",
        "content_type": "service",
        "content": "AIアーキテクト育成プログラム...",
        "bm25_score": 0.78,
        "vector_score": 0.88,
        "combined_score": 0.84,
        "metadata": {},
        "created_at": "2024-12-01T09:00:00Z"
      }
      // ... 他の結果
    ],
    "kenji": [
      {
        "id": 3,
        "thought_id": "ai-architect-role",
        "thought_title": "AIアーキテクトの役割",
        "thought_content": "AIアーキテクトの本質は...",
        "category": "architecture",
        "priority": 95,
        "vector_score": 0.94,
        "created_at": "2025-01-01T00:00:00Z"
      }
      // ... 他の結果
    ]
  },
  "embedding_dimensions": {
    "fragment": 1536,
    "company": 1536,
    "kenji": 3072
  }
}
```

### レスポンス（エラー）

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "success": false,
  "error": "query parameter is required",
  "details": "The 'query' field cannot be empty."
}
```

```http
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{
  "success": false,
  "error": "OpenAI API error",
  "details": "Failed to generate embedding: API rate limit exceeded"
}
```

---

## 2. GET /api/rag/stats

### 概要
RAGシステムの統計情報を取得

### リクエスト

```http
GET /api/rag/stats
```

### レスポンス

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "timestamp": "2025-12-29T15:30:00Z",
  "rag_systems": {
    "fragment_vectors": {
      "total_records": 1556,
      "table_size": "35 MB",
      "vector_dimension": 1536,
      "content_types": {
        "faq": 639,
        "section": 555,
        "case-study": 153,
        "heading": 77,
        "author": 48,
        "service": 45,
        "other": 39
      },
      "latest_created_at": "2025-12-25T12:00:00Z",
      "hours_since_update": 96
    },
    "company_vectors": {
      "total_records": 128,
      "table_size": "7.5 MB",
      "vector_dimension": 1536,
      "latest_created_at": "2025-12-20T10:00:00Z",
      "hours_since_update": 216
    },
    "trend_vectors": {
      "total_records": 127,
      "table_size": "3.2 MB",
      "vector_dimension": 1536,
      "latest_created_at": "2025-12-29T08:00:00Z",
      "hours_since_update": 8,
      "recency_distribution": {
        "within_24h": 15,
        "within_7d": 48,
        "older": 64
      }
    },
    "youtube_vectors": {
      "total_records": 18,
      "table_size": "1.7 MB",
      "vector_dimension": 1536,
      "latest_created_at": "2025-12-15T14:00:00Z",
      "hours_since_update": 336
    },
    "kenji_thoughts": {
      "total_records": 38,
      "table_size": "576 KB",
      "vector_dimension": 3072,
      "active_thoughts": 35,
      "priority_distribution": {
        "high": 12,
        "medium": 18,
        "low": 8
      },
      "latest_created_at": "2025-01-10T00:00:00Z",
      "hours_since_update": -264
    }
  },
  "search_logs": {
    "total_searches": 0,
    "searches_today": 0,
    "avg_duration_ms": 0
  }
}
```

---

## 3. GET /api/rag/health

### 概要
Django API とSupabase接続のヘルスチェック

### リクエスト

```http
GET /api/rag/health
```

### レスポンス

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "ok",
  "timestamp": "2025-12-29T15:30:00Z",
  "services": {
    "django": "ok",
    "supabase": "ok",
    "openai": "ok"
  },
  "database": {
    "connected": true,
    "rag_tables": {
      "fragment_vectors": "ok",
      "company_vectors": "ok",
      "trend_vectors": "ok",
      "youtube_vectors": "ok",
      "kenji_harada_architect_knowledge": "ok"
    }
  }
}
```

---

## 🔐 認証

Phase 1では**認証不要**（開発環境のみ）

Phase 2以降で以下を検討：
- JWT認証
- API Key認証
- CORS設定の厳格化

---

## 🚨 エラーコード

| コード | 説明 |
|-------|------|
| 400 | リクエストパラメータエラー |
| 404 | RAGデータが見つからない |
| 500 | サーバーエラー（Supabase接続、OpenAI API等） |
| 503 | サービス一時停止 |

---

## 📊 検索ログの記録

`POST /api/rag/search`実行時、以下の情報を`rag_search_logs`テーブルに記録：

```sql
INSERT INTO rag_search_logs (
  query,
  sources,
  result_count,
  top_similarity,
  avg_similarity,
  bm25_score,
  vector_score,
  combined_score,
  search_duration_ms,
  created_at
) VALUES (
  'AIアーキテクトとは何ですか？',
  ARRAY['fragment', 'company', 'kenji'],
  15,
  0.92,
  0.85,
  0.85,
  0.92,
  0.89,
  247,
  NOW()
);
```

---

## 🔗 次のステップ

- [03_IMPLEMENTATION_GUIDE.md](./03_IMPLEMENTATION_GUIDE.md): 実装ガイド
- [04_TEST_PLAN.md](./04_TEST_PLAN.md): テスト計画

