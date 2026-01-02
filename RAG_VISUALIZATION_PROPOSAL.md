# 既存RAGシステム可視化提案書

## 📊 現状分析：既存RAGシステムの全体像

### 🎯 既存の5つのRAGシステム

| RAG名 | テーブル名 | 次元 | 特徴 | レコード数（想定） |
|-------|-----------|------|------|------------------|
| **Fragment Vectors** | `fragment_vectors` | 1536 | Fragment ID専用、Complete URI | 100+ |
| **Company Vectors** | `company_vectors` | 1536 | 会社情報・サービス | 50+ |
| **Trend Vectors** | `trend_vectors` | 1536 | トレンド情報、**鮮度スコア付き** | 200+ |
| **YouTube Vectors** | `youtube_vectors` | 1536 | YouTube動画、view_count/like_count | 100+ |
| **Kenji Thoughts** | `kenji_harada_architect_knowledge` | 3072 | 原田賢治の設計思想 | 5+ |

### 🔍 既存のハイブリッド検索システム

```
ユーザークエリ
    ↓
┌─────────────────────────────────────┐
│  BM25全文検索 (40%)                 │  ← キーワード完全一致
│  + Vector検索 (60%)                  │  ← 意味的類似性
│  + Recency (30%) ※Trendのみ         │  ← 鮮度スコア
│  = RRF統合                           │
└─────────────────────────────────────┘
    ↓
結果（combined_score順）
```

---

## 🎯 可視化の目的整理（打ち合わせ）

### ✅ あなたの方向性：「今のRAGを可視化したい」

**第1段階**: Grafanaで可視化
**第2段階**: MLflowで評価実験

### 🤔 質問1：何を可視化したいですか？

| 選択肢 | 内容 | Grafanaの見せ方 |
|--------|------|----------------|
| **A. RAG検索の実行ログ** | どのクエリが、どのRAGで検索されたか | タイムシリーズグラフ（検索回数/日） |
| **B. RAG検索の精度** | similarity、bm25_score、combined_scoreの分布 | ヒストグラム、散布図 |
| **C. RAGデータの統計** | 各テーブルのレコード数、ベクトル次元、鮮度 | ゲージ、テーブルパネル |
| **D. RAGデータの鮮度監視** | Trend Vectorsの最新データ日時、古いデータ検出 | タイムシリーズ、アラート |

**👉 推奨**: まず **C（RAGデータの統計）** と **D（鮮度監視）** から始めるのが現実的です。

---

## 📊 Grafanaで見るべきメトリクス（具体的提案）

### Dashboard 1: RAGデータ統計ダッシュボード

```sql
-- Panel 1: 各RAGテーブルのレコード数
SELECT 
  'Fragment Vectors' as rag_name,
  COUNT(*) as record_count,
  '1536' as dimensions
FROM fragment_vectors
UNION ALL
SELECT 
  'Company Vectors',
  COUNT(*),
  '1536'
FROM company_vectors
UNION ALL
SELECT 
  'Trend Vectors',
  COUNT(*),
  '1536'
FROM trend_vectors
UNION ALL
SELECT 
  'YouTube Vectors',
  COUNT(*),
  '1536'
FROM youtube_vectors
UNION ALL
SELECT 
  'Kenji Thoughts',
  COUNT(*),
  '3072'
FROM kenji_harada_architect_knowledge;

-- Panel 2: Fragment Vectorsの内訳（content_type別）
SELECT 
  content_type,
  COUNT(*) as count
FROM fragment_vectors
GROUP BY content_type
ORDER BY count DESC;

-- Panel 3: Trend Vectorsの鮮度分布
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as count
FROM trend_vectors
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY date
ORDER BY date DESC;

-- Panel 4: YouTube Vectorsのview_count分布
SELECT 
  video_title,
  view_count,
  like_count,
  created_at
FROM youtube_vectors
ORDER BY view_count DESC
LIMIT 10;
```

### Dashboard 2: RAG鮮度監視ダッシュボード

```sql
-- Panel 1: 最新データの日時
SELECT 
  'Fragment Vectors' as rag_name,
  MAX(created_at) as latest_data_time,
  EXTRACT(EPOCH FROM (NOW() - MAX(created_at))) / 3600 as hours_since_update
FROM fragment_vectors
UNION ALL
SELECT 
  'Trend Vectors',
  MAX(created_at),
  EXTRACT(EPOCH FROM (NOW() - MAX(created_at))) / 3600
FROM trend_vectors;

-- Panel 2: 古いデータの検出（7日以上更新なし）
SELECT 
  fragment_id,
  page_path,
  content_title,
  created_at,
  updated_at,
  EXTRACT(DAY FROM (NOW() - updated_at)) as days_old
FROM fragment_vectors
WHERE updated_at < NOW() - INTERVAL '7 days'
ORDER BY days_old DESC
LIMIT 20;

-- Panel 3: Trend Vectorsの鮮度スコア分布
SELECT 
  ROUND(GREATEST(0, 1 - EXTRACT(EPOCH FROM (NOW() - created_at)) / (7 * 24 * 3600))::numeric, 2) as recency_score,
  COUNT(*) as count
FROM trend_vectors
GROUP BY recency_score
ORDER BY recency_score DESC;
```

---

## 🤔 MLflowは本当に必要か？（検討）

### MLflowが**必要なケース**

1. **RAG精度の評価実験**
   - Recall@5、Recall@10、MRR（Mean Reciprocal Rank）を計測
   - ハイブリッド検索のweight調整（BM25: 0.4 vs 0.5 vs 0.6）
   - threshold調整（0.3 vs 0.5 vs 0.7）

2. **A/Bテスト**
   - 「BM25なし vs あり」の精度比較
   - 「Recencyあり vs なし」の精度比較（Trend RAG）

3. **プロンプトエンジニアリング**
   - RAG結果をLLMに渡す際のプロンプト最適化
   - Few-shotの効果測定

### MLflowが**不要なケース**

1. **データ統計の可視化だけでOK**
   - レコード数、鮮度、分布を見るだけ → **Grafanaで十分**

2. **RAGロジックは固定**
   - ハイブリッド検索のweightは固定（調整不要）
   - threshold も固定

3. **評価データセットがない**
   - RAG精度を測るための「正解データ」がない

---

## 💡 私の提案：段階的アプローチ

### 🎯 Phase 1: Grafana可視化（2週間）

**目標**: 既存RAGの健全性を監視

**実装内容**:
1. Grafana + Supabase接続（Postgres Data Source）
2. RAGデータ統計ダッシュボード作成
3. RAG鮮度監視ダッシュボード作成
4. アラート設定（7日以上更新なし）

**Django実装**: **不要**（Grafanaから直接Supabaseにクエリ）

**成果物**:
- Grafana Dashboardファイル（JSON）
- Supabase接続設定ドキュメント

---

### 🎯 Phase 2: RAG検索ログ記録（2週間）

**目標**: どのクエリがどのRAGで検索されたか記録

**実装内容**:
1. Django APIエンドポイント作成
   - `/api/rag/search` (クエリ受付)
   - `/api/rag/log` (検索ログ記録)

2. Supabaseに新テーブル作成
```sql
CREATE TABLE rag_search_logs (
  id BIGSERIAL PRIMARY KEY,
  query TEXT NOT NULL,
  rag_source TEXT NOT NULL, -- 'fragment', 'company', 'trend', 'youtube', 'kenji'
  result_count INT,
  top_similarity FLOAT,
  avg_similarity FLOAT,
  search_duration_ms INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

3. Grafanaダッシュボード追加
   - 検索回数/日（タイムシリーズ）
   - RAGソース別検索回数（円グラフ）
   - 平均similarity推移（折れ線グラフ）

**成果物**:
- Django RAG検索API
- 検索ログダッシュボード

---

### 🎯 Phase 3: MLflow導入検討（任意）

**前提条件**（これがないとMLflowは無意味）:
1. ✅ **評価データセット**: 100個以上のクエリ＋正解のFragment ID
2. ✅ **評価指標の定義**: Recall@5、MRR、NDCG等
3. ✅ **実験計画**: 「何を」「どう」調整して精度向上するか

**実装内容**（Phase 2完了後）:
1. MLflow Tracking Server（Docker）
2. 評価データセット準備
3. RAG精度評価スクリプト（Python）
4. ハイブリッド検索のweight調整実験

---

## 📋 Grafanaで見るべきテーブル一覧

| テーブル名 | 優先度 | 見るべきカラム | 可視化パネル |
|-----------|-------|---------------|-------------|
| `fragment_vectors` | ⭐⭐⭐ | `id`, `fragment_id`, `content_type`, `created_at` | レコード数、content_type別分布 |
| `company_vectors` | ⭐⭐ | `id`, `content_type`, `created_at` | レコード数、日時推移 |
| `trend_vectors` | ⭐⭐⭐ | `id`, `created_at`, `metadata` | レコード数、鮮度分布、最新日時 |
| `youtube_vectors` | ⭐⭐ | `id`, `video_title`, `view_count`, `created_at` | レコード数、人気動画Top10 |
| `kenji_harada_architect_knowledge` | ⭐ | `id`, `thought_title`, `priority`, `is_active` | レコード数、アクティブ思想数 |
| `posts` | ⭐ | `id`, `status`, `created_at` | 公開記事数、日時推移 |
| `company_youtube_shorts` | ⭐ | `id`, `status`, `youtube_video_id` | 動画数、公開済み動画数 |

---

## 🤔 打ち合わせポイント（質問）

### Q1: Phase 1だけでOKですか？

**Phase 1（Grafana可視化のみ）**で、以下が達成できます：
- RAGデータの健全性監視
- 鮮度監視とアラート
- データ分布の可視化

これで十分なら、**Django/Python実装は不要**です。

**Yes → Phase 1のみ実装**
**No → Phase 2（検索ログ記録）も実装**

---

### Q2: MLflowは本当に必要ですか？

**以下の場合、MLflowは不要**です：
- RAG精度を数値で測る必要がない
- ハイブリッド検索のweightは固定でOK
- 評価データセット（正解データ）がない

**MLflowが必要なのは**：
- RAG精度を向上させたい（A/Bテスト）
- プロンプト最適化の効果を測りたい
- 複数のRAGシステムの精度比較をしたい

---

### Q3: Django実装の目的は？

**可視化のみ → Django不要**（Grafanaから直接Supabaseにクエリ）

**検索ログ記録 → Django必要**（Next.jsからDjango API経由でログ記録）

---

## ✅ 私の意見：あなたの方向性は正しい

**✅ 正しい点**:
1. 可視化が第一目的（Grafana）
2. MLflowは第二段階（実装の意味を検討）
3. 既存RAGの可視化を極める

**⚠️ 調整すべき点**:
1. **Django実装は可視化だけなら不要**
   - GrafanaがSupabaseに直接クエリできる
2. **MLflowは評価データセットが前提**
   - 評価データなしでMLflowを入れても意味がない
3. **Phase 1（Grafana可視化）から始めるべき**
   - 2週間で結果が見える

---

## 🚀 推奨実装プラン

### **最小MVP（2週間）**:
1. ✅ Grafana + Supabase接続
2. ✅ RAGデータ統計ダッシュボード
3. ✅ RAG鮮度監視ダッシュボード

**Django/Python**: 不要
**MLflow**: 不要

### **拡張版（4週間）**:
1. ✅ 上記MVP
2. ✅ Django RAG検索API
3. ✅ 検索ログ記録
4. ✅ 検索ログダッシュボード

**MLflow**: Phase 2完了後に検討

---

## 📝 次のアクション

あなたの意見を教えてください：
1. **Phase 1（Grafana可視化のみ）で十分ですか？**
2. **Django実装は必要ですか？**（検索ログ記録したい場合）
3. **MLflowは本当に必要ですか？**（評価データセットはありますか？）

この3つに答えていただければ、最適な実装プランを提案します。

