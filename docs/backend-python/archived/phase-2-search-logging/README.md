# Phase 2: RAG検索ログ分析・強化

**期間**: 1週間（Phase 1完了後）
**前提**: Phase 1完了（Django RAG API、基本検索ログ記録が稼働）

---

## 🎯 Phase 2の目的

### 背景
Phase 1で検索ログを記録できるようになったが、**分析が不十分**

### 目標
1. ✅ 検索ログの詳細分析
2. ✅ クエリ分類・パターン分析
3. ✅ RAG別の検索精度比較
4. ✅ Grafana高度ダッシュボード

### 成果物
- 検索ログ分析API
- クエリ分類機能
- Grafana高度ダッシュボード
- 検索パターンレポート

---

## 📊 拡張する機能

### 1. 検索ログテーブル拡張

```sql
ALTER TABLE rag_search_logs ADD COLUMN IF NOT EXISTS
  query_category VARCHAR(50),           -- 'technical', 'pricing', 'general'
  query_intent VARCHAR(50),             -- 'information', 'comparison', 'troubleshooting'
  user_satisfaction FLOAT,              -- 将来的にフィードバック機能で使用
  clicked_fragment_id VARCHAR(255),     -- ユーザーがクリックしたFragment ID
  session_id VARCHAR(255);              -- セッション追跡
```

### 2. 検索パターン分析

```python
# backend/rag_api/services/search_analytics.py
class SearchAnalyticsService:
    def analyze_query_patterns(self, date_from, date_to):
        """
        検索パターン分析
        - 頻出クエリTOP 10
        - RAG別検索回数
        - 時間帯別検索分布
        - 平均similarity推移
        """
        pass
    
    def classify_query(self, query):
        """
        クエリ分類（OpenAI or ルールベース）
        - category: technical, pricing, service, general
        - intent: information, comparison, troubleshooting
        """
        pass
```

### 3. RAG別精度比較

```python
def compare_rag_performance(self):
    """
    各RAGシステムの検索性能を比較
    - Fragment: avg_similarity, search_count
    - Company: avg_similarity, search_count
    - Trend: avg_similarity + recency_score
    - YouTube: avg_similarity, search_count
    - Kenji: avg_similarity, search_count
    """
    pass
```

---

## 📋 APIエンドポイント（追加）

### 1. GET /api/rag/analytics/patterns

```json
{
  "date_from": "2025-12-01",
  "date_to": "2025-12-31",
  "top_queries": [
    {"query": "AIアーキテクト", "count": 45, "avg_similarity": 0.87},
    {"query": "Vector RAG", "count": 38, "avg_similarity": 0.92}
  ],
  "rag_performance": {
    "fragment": {"searches": 150, "avg_similarity": 0.85, "avg_duration_ms": 200},
    "company": {"searches": 45, "avg_similarity": 0.78, "avg_duration_ms": 180},
    "kenji": {"searches": 30, "avg_similarity": 0.91, "avg_duration_ms": 220}
  },
  "hourly_distribution": [...]
}
```

### 2. POST /api/rag/analytics/classify

クエリを自動分類

```json
{
  "query": "料金プランを教えてください",
  "category": "pricing",
  "intent": "information",
  "confidence": 0.95
}
```

---

## 📊 Grafana高度ダッシュボード

### Dashboard 1: 検索パターン分析
- 頻出クエリTOP 10（テーブル）
- クエリカテゴリ分布（円グラフ）
- 時間帯別検索分布（ヒートマップ）

### Dashboard 2: RAG別性能比較
- RAG別検索回数（棒グラフ）
- RAG別平均similarity（折れ線グラフ）
- RAG別検索速度（箱ひげ図）

### Dashboard 3: 検索品質監視
- 平均similarity推移（タイムシリーズ）
- Low similarity検索の検出（アラート）
- 検索エラー率（ゲージ）

---

## ✅ Phase 2完了判定基準

- [ ] 検索ログテーブルが拡張されている
- [ ] クエリ分類機能が動作する
- [ ] Grafana高度ダッシュボードが作成されている
- [ ] 検索パターンレポートが生成できる

---

## 🔗 次のステップ

Phase 2完了後、Phase 3（ML評価システム）へ

