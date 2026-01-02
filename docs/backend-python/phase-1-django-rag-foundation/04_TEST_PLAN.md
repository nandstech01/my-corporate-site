# Phase 1: テスト計画

---

## 🎯 テスト目標

1. ✅ Django RAG APIが正常動作する
2. ✅ 既存Next.js APIが影響を受けていない
3. ✅ Fragment IDベクトル化が正常動作する
4. ✅ ハイブリッド記事生成が正常動作する
5. ✅ 検索ログが記録される
6. ✅ Grafanaでデータが可視化できる

---

## テスト1: Django RAG API動作確認

### 1.1 ヘルスチェック

```bash
curl http://localhost:8000/api/rag/health
```

**期待結果**:
```json
{
  "status": "ok",
  "django": "ok"
}
```

### 1.2 Fragment Vectors検索

```bash
curl -X POST http://localhost:8000/api/rag/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "AIアーキテクトとは何ですか？",
    "sources": ["fragment"],
    "match_count": 5
  }'
```

**期待結果**:
- ✅ `success: true`
- ✅ `results.fragment`に5件のデータ
- ✅ 各結果に`fragment_id`, `content_title`, `combined_score`が含まれる

### 1.3 複数RAG検索

```bash
curl -X POST http://localhost:8000/api/rag/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Vector RAG",
    "sources": ["fragment", "company", "kenji"],
    "match_count": 3
  }'
```

**期待結果**:
- ✅ `results.fragment`, `results.company`, `results.kenji`全てにデータがある
- ✅ `embedding_dimensions`が正しい（fragment: 1536, kenji: 3072）

### 1.4 フィルタリング検索

```bash
curl -X POST http://localhost:8000/api/rag/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "料金",
    "sources": ["fragment"],
    "filters": {
      "page_path": "/faq",
      "content_type": "faq"
    }
  }'
```

**期待結果**:
- ✅ 結果が全て`page_path: "/faq"`, `content_type: "faq"`

---

## テスト2: 既存Next.js API動作確認

### 2.1 ハイブリッド記事生成

```bash
# Next.jsアプリで管理画面から「ハイブリッド記事生成」を実行
# URL: http://localhost:3000/admin/content-generation
```

**期待結果**:
- ✅ 記事生成が正常に完了する
- ✅ `hybrid_scraped_keywords`テーブルにデータが追加される
- ✅ エラーが発生しない

### 2.2 Fragment IDベクトル化

```bash
# Next.jsアプリで記事編集画面から「再ベクトル化」ボタンをクリック
# URL: http://localhost:3000/admin/posts/[slug]/edit
```

**期待結果**:
- ✅ 既存のFragment Vectorsが削除される
- ✅ 新しいFragment Vectorsが作成される
- ✅ エラーが発生しない

### 2.3 構造化データ生成

```bash
# 記事ページにアクセス
curl http://localhost:3000/posts/ai-ai20251000-097498
```

**期待結果**:
- ✅ ページが正常に表示される
- ✅ `<script type="application/ld+json">`に構造化データが含まれる
- ✅ Fragment IDのリンクが正常に機能する

---

## テスト3: 検索ログ記録確認

### 3.1 ログ記録の確認

```bash
# 検索を5回実行
for i in {1..5}; do
  curl -X POST http://localhost:8000/api/rag/search \
    -H "Content-Type: application/json" \
    -d '{"query": "Test query '"$i"'", "sources": ["fragment"]}'
done

# ログテーブルを確認
psql "postgres://postgres:11925532kG1192@db.xhmhzhethpwjxuwksmuv.supabase.co:5432/postgres" \
  -c "SELECT COUNT(*) FROM rag_search_logs;"
```

**期待結果**:
- ✅ レコード数が5件増加している
- ✅ 各レコードに`query`, `sources`, `result_count`が記録されている

### 3.2 ログ統計の確認

```sql
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as search_count,
  AVG(search_duration_ms) as avg_duration_ms,
  AVG(avg_similarity) as avg_similarity
FROM rag_search_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;
```

**期待結果**:
- ✅ 統計データが正しく集計される

---

## テスト4: Grafana可視化確認

### 4.1 Grafana接続確認

```bash
# Grafanaにアクセス
open http://localhost:3001

# ログイン: admin / admin
```

**期待結果**:
- ✅ Grafanaが起動している
- ✅ Supabase Postgresデータソースが接続されている

### 4.2 RAGデータ統計ダッシュボード

```sql
-- Grafanaでクエリを実行
SELECT 
  'fragment_vectors' as rag_name,
  COUNT(*) as record_count,
  '1536' as dimensions
FROM fragment_vectors
UNION ALL
SELECT 
  'company_vectors',
  COUNT(*),
  '1536'
FROM company_vectors;
```

**期待結果**:
- ✅ 各RAGテーブルのレコード数が表示される
- ✅ テーブルパネルが正常に表示される

### 4.3 検索ログダッシュボード

```sql
-- Grafanaでクエリを実行
SELECT 
  DATE_TRUNC('hour', created_at) as time,
  COUNT(*) as search_count
FROM rag_search_logs
GROUP BY time
ORDER BY time DESC;
```

**期待結果**:
- ✅ タイムシリーズグラフが表示される
- ✅ 検索回数の推移が可視化される

---

## テスト5: パフォーマンステスト

### 5.1 検索速度

```bash
# 10回検索して平均速度を計測
for i in {1..10}; do
  curl -X POST http://localhost:8000/api/rag/search \
    -H "Content-Type: application/json" \
    -d '{"query": "AI", "sources": ["fragment"]}' \
    -w "\nTime: %{time_total}s\n"
done
```

**期待結果**:
- ✅ 平均検索時間が500ms以下

### 5.2 同時リクエスト

```bash
# 5つの同時リクエスト
for i in {1..5}; do
  curl -X POST http://localhost:8000/api/rag/search \
    -H "Content-Type: application/json" \
    -d '{"query": "AI", "sources": ["fragment"]}' &
done
wait
```

**期待結果**:
- ✅ 全てのリクエストが正常に完了する
- ✅ エラーが発生しない

---

## テスト6: エラーハンドリング

### 6.1 クエリパラメータなし

```bash
curl -X POST http://localhost:8000/api/rag/search \
  -H "Content-Type: application/json" \
  -d '{}'
```

**期待結果**:
```json
{
  "success": false,
  "error": "query parameter is required"
}
```

### 6.2 無効なsources

```bash
curl -X POST http://localhost:8000/api/rag/search \
  -H "Content-Type: application/json" \
  -d '{"query": "AI", "sources": ["invalid"]}'
```

**期待結果**:
- ✅ エラーが返る、または空の結果が返る

### 6.3 OpenAI API エラー

```bash
# OPENAI_API_KEYを無効にして検索
# （環境変数を一時的に変更）
```

**期待結果**:
```json
{
  "success": false,
  "error": "OpenAI API error",
  "details": "..."
}
```

---

## テスト7: データ整合性確認

### 7.1 Fragment Vectorsの件数確認

```bash
# Django API経由で検索
curl -X POST http://localhost:8000/api/rag/search \
  -H "Content-Type: application/json" \
  -d '{"query": "test", "sources": ["fragment"], "match_count": 1000, "threshold": 0.0}'

# 直接Supabaseで確認
psql "postgres://postgres:11925532kG1192@db.xhmhzhethpwjxuwksmuv.supabase.co:5432/postgres" \
  -c "SELECT COUNT(*) FROM fragment_vectors;"
```

**期待結果**:
- ✅ Django APIの結果件数とSupabaseの件数が一致する

### 7.2 content_type分布の確認

```bash
# Django API経由で取得
curl http://localhost:8000/api/rag/stats

# 直接Supabaseで確認
psql "postgres://postgres:11925532kG1192@db.xhmhzhethpwjxuwksmuv.supabase.co:5432/postgres" \
  -c "SELECT content_type, COUNT(*) FROM fragment_vectors GROUP BY content_type ORDER BY count DESC;"
```

**期待結果**:
- ✅ Django APIの統計とSupabaseの統計が一致する

---

## ✅ Phase 1完了判定

全てのテストが成功したら、Phase 1完了：

- [x] Django RAG APIが正常動作
- [x] 既存Next.js APIが正常動作
- [x] Fragment IDベクトル化が正常動作
- [x] ハイブリッド記事生成が正常動作
- [x] 検索ログが記録される
- [x] Grafanaでデータが可視化できる

---

## 🔗 次のステップ

Phase 1完了後:
- Phase 2: RAG検索ログ分析強化
- Phase 3: ML評価システム構築
- Phase 4: MLflow統合

