# Grafana パネル設定ガイド（Task2: Technical vs General分離表示）

**作成日**: 2025-12-29  
**目的**: Phase 3 Week 3 Task2 - BM25の効果をカテゴリ別に可視化

---

## 📋 概要

このドキュメントは、RAG Overview Dashboard に **Technical** と **General** カテゴリを分離表示するパネルを追加するための設定ガイドです。

### 目標

1. **Technical カテゴリ**: BM25が大きく改善（MRR +32.6%, NDCG@20 +25.8%）
2. **General カテゴリ**: BM25の改善が小さい/不変
3. この差を**一目で分かる**ように可視化

---

## 🎯 ダッシュボード変数の追加

まず、`run_id` をダッシュボード変数として追加し、将来の切り替えを可能にします。

### Step 1: Dashboard Settings を開く

1. Grafana ダッシュボード右上の **⚙️ Dashboard settings** をクリック
2. 左メニューから **Variables** を選択
3. **Add variable** をクリック

### Step 2: run_id 変数を追加

**設定内容**:

| 項目 | 値 |
|------|-----|
| **Name** | `run_id` |
| **Label** | `Selected run (Run ID)` |
| **Type** | `Query` |
| **Data source** | `PostgreSQL` (your Supabase connection) |
| **Query** | (下記の **堅牢版クエリ** を使用) |
| **Regex** | (空白) |
| **Sort** | `Disabled` |
| **Multi-value** | `Off` (単一選択) |
| **Include All option** | `Off` |

**推奨デフォルト値**: `29f25cb4-4880-463d-9a3a-2b3ce6b3ba1c` (reviewed run_id)

#### ⚠️ 堅牢版クエリ（推奨）

```sql
SELECT 
  er.run_id::text AS __value, 
  er.run_id::text AS __text 
FROM evaluation_results er 
GROUP BY er.run_id 
ORDER BY MAX(er.created_at) DESC 
LIMIT 50;
```

**特徴**:
- `__value` / `__text` を明示 → Grafana テンプレート変数の安定化
- `MAX(created_at)` で新しいrunを上位に
- `LIMIT 50` で大量データ時のパフォーマンス保証
- UUID型のエラーを回避

---

## 📊 パネル1: Technical カテゴリ評価指標（直近値）

### パネル設定

| 項目 | 値 |
|------|-----|
| **Title** | `📊 Technical カテゴリ評価指標（Baseline vs BM25）` |
| **Type** | `Stat` |
| **Data source** | `PostgreSQL` (Supabase) |

### SQL クエリ

```sql
SELECT
  er.variant AS metric,
  ROUND(AVG(er.mrr)::numeric, 4) AS "MRR",
  ROUND(AVG(er.ndcg)::numeric, 4) AS "NDCG@20",
  ROUND(AVG(er.recall_at_20)::numeric, 4) AS "Recall@20"
FROM
  evaluation_results er
  INNER JOIN evaluation_queries eq ON er.query_id = eq.id
WHERE
  eq.category = 'technical'
  AND er.run_id = '$run_id'::uuid
  AND er.variant IN ('baseline', 'bm25')
GROUP BY
  er.variant
ORDER BY
  er.variant;
```

### パネル表示設定

**Value options**:
- **Show**: All values
- **Calculation**: Last (not null)

**Standard options**:
- **Unit**: None
- **Decimals**: 4
- **Color scheme**: From thresholds (by value)

**Thresholds**:
- Base: Green
- Above 0.3: Yellow
- Above 0.4: Orange
- Above 0.5: Red (good)

**Text size**:
- **Title**: Auto
- **Value**: Auto

---

## 📊 パネル2: General カテゴリ評価指標（直近値）

### パネル設定

| 項目 | 値 |
|------|-----|
| **Title** | `📊 General カテゴリ評価指標（Baseline vs BM25）` |
| **Type** | `Stat` |
| **Data source** | `PostgreSQL` (Supabase) |

### SQL クエリ

```sql
SELECT
  er.variant AS metric,
  ROUND(AVG(er.mrr)::numeric, 4) AS "MRR",
  ROUND(AVG(er.ndcg)::numeric, 4) AS "NDCG@20",
  ROUND(AVG(er.recall_at_20)::numeric, 4) AS "Recall@20"
FROM
  evaluation_results er
  INNER JOIN evaluation_queries eq ON er.query_id = eq.id
WHERE
  eq.category = 'general'
  AND er.run_id = '$run_id'::uuid
  AND er.variant IN ('baseline', 'bm25')
GROUP BY
  er.variant
ORDER BY
  er.variant;
```

**パネル表示設定**: パネル1と同じ

---

## 📈 パネル3: Technical カテゴリ MRR 推移（時系列）

### パネル設定

| 項目 | 値 |
|------|-----|
| **Title** | `📈 Technical カテゴリ MRR 推移` |
| **Type** | `Time series` |
| **Data source** | `PostgreSQL` (Supabase) |

### SQL クエリ

#### ⚠️ run単位1点版（推奨）

```sql
SELECT
  MAX(er.created_at) AS time,
  er.variant,
  AVG(er.mrr) AS value
FROM
  evaluation_results er
  INNER JOIN evaluation_queries eq ON er.query_id = eq.id
WHERE
  eq.category = 'technical'
  AND er.variant IN ('baseline', 'bm25')
  AND $__timeFilter(er.created_at)
GROUP BY
  er.run_id, er.variant
ORDER BY
  time ASC;
```

**特徴**:
- `GROUP BY er.run_id, er.variant` で **1run=1点** を保証
- `MAX(er.created_at)` を時間軸として使用
- minute近似の歪み（複数点の平均）を排除
- トレンドが正確に表示される

### パネル表示設定

**Standard options**:
- **Unit**: None
- **Min**: 0
- **Max**: 1
- **Decimals**: 4

**Legend**:
- **Mode**: List
- **Placement**: Bottom
- **Values**: Last, Mean

**Graph styles**:
- **Style**: Lines
- **Line width**: 2
- **Fill opacity**: 10
- **Point size**: 5

---

## 📈 パネル4: General カテゴリ MRR 推移（時系列）

### パネル設定

| 項目 | 値 |
|------|-----|
| **Title** | `📈 General カテゴリ MRR 推移` |
| **Type** | `Time series` |
| **Data source** | `PostgreSQL` (Supabase) |

### SQL クエリ

```sql
SELECT
  er.created_at AS time,
  er.variant,
  AVG(er.mrr) AS mrr
FROM
  evaluation_results er
  INNER JOIN evaluation_queries eq ON er.query_id = eq.id
WHERE
  eq.category = 'general'
  AND er.variant IN ('baseline', 'bm25')
  AND $__timeFilter(er.created_at)
GROUP BY
  er.created_at, er.variant, er.run_id
ORDER BY
  time;
```

**パネル表示設定**: パネル3と同じ

---

## 📈 パネル5: Technical カテゴリ NDCG@20 推移（時系列）

### パネル設定

| 項目 | 値 |
|------|-----|
| **Title** | `📈 Technical カテゴリ NDCG@20 推移` |
| **Type** | `Time series` |
| **Data source** | `PostgreSQL` (Supabase) |

### SQL クエリ

```sql
SELECT
  er.created_at AS time,
  er.variant,
  AVG(er.ndcg) AS ndcg
FROM
  evaluation_results er
  INNER JOIN evaluation_queries eq ON er.query_id = eq.id
WHERE
  eq.category = 'technical'
  AND er.variant IN ('baseline', 'bm25')
  AND $__timeFilter(er.created_at)
GROUP BY
  er.created_at, er.variant, er.run_id
ORDER BY
  time;
```

**パネル表示設定**: パネル3と同じ

---

## 📈 パネル6: General カテゴリ NDCG@20 推移（時系列）

### パネル設定

| 項目 | 値 |
|------|-----|
| **Title** | `📈 General カテゴリ NDCG@20 推移` |
| **Type** | `Time series` |
| **Data source** | `PostgreSQL` (Supabase) |

### SQL クエリ

```sql
SELECT
  er.created_at AS time,
  er.variant,
  AVG(er.ndcg) AS ndcg
FROM
  evaluation_results er
  INNER JOIN evaluation_queries eq ON er.query_id = eq.id
WHERE
  eq.category = 'general'
  AND er.variant IN ('baseline', 'bm25')
  AND $__timeFilter(er.created_at)
GROUP BY
  er.created_at, er.variant, er.run_id
ORDER BY
  time;
```

**パネル表示設定**: パネル3と同じ

---

## 🎨 パネル配置推奨

**Row 1（既存）**: 検索回数、RAGソース別データ件数、検索ソース別利用率、平均類似度推移

**Row 2（既存）**: Precision@5 推移（全体）、MRR 推移（全体）

**Row 3（新規追加）**: Technical カテゴリ評価指標（Stat）、General カテゴリ評価指標（Stat）

**Row 4（新規追加）**: Technical MRR 推移、General MRR 推移

**Row 5（新規追加）**: Technical NDCG@20 推移、General NDCG@20 推移

---

## ✅ 期待される表示結果

### Technical カテゴリ (run_id: 29f25cb4-...)

| Variant | MRR | NDCG@20 | Recall@20 |
|---------|-----|---------|-----------|
| **baseline** | 0.3265 | 0.3866 | 0.6667 |
| **bm25** | 0.4330 | 0.4862 | 0.6667 |

**改善幅**: MRR +32.6%, NDCG@20 +25.8%

### General カテゴリ (run_id: 29f25cb4-...)

| Variant | MRR | NDCG@20 | Recall@20 |
|---------|-----|---------|-----------|
| **baseline** | ~0.35 | ~0.40 | ~0.70 |
| **bm25** | ~0.36 | ~0.41 | ~0.70 |

**改善幅**: MRR +3%, NDCG@20 +2%（小さい）

---

## 🔍 SQL クエリのテスト

パネル追加前に、以下のコマンドでSQLクエリをテストできます：

```bash
cd /Users/nands/my-corporate-site/backend
source venv311/bin/activate
python manage.py shell
```

```python
from django.db import connection

# Technical カテゴリの集計
with connection.cursor() as cursor:
    cursor.execute("""
        SELECT
          er.variant AS metric,
          ROUND(AVG(er.mrr)::numeric, 4) AS "MRR",
          ROUND(AVG(er.ndcg)::numeric, 4) AS "NDCG@20",
          ROUND(AVG(er.recall_at_20)::numeric, 4) AS "Recall@20"
        FROM
          evaluation_results er
          INNER JOIN evaluation_queries eq ON er.query_id = eq.id
        WHERE
          eq.category = 'technical'
          AND er.run_id = '29f25cb4-4880-463d-9a3a-2b3ce6b3ba1c'::uuid
          AND er.variant IN ('baseline', 'bm25')
        GROUP BY
          er.variant
        ORDER BY
          er.variant;
    """)
    for row in cursor.fetchall():
        print(row)
```

---

## 🚀 実装手順サマリー

1. ✅ **ダッシュボード変数追加**: `run_id` を追加（推奨デフォルト: reviewed run_id）
2. ✅ **Stat パネル追加**: Technical / General カテゴリの直近値表示
3. ✅ **Time series パネル追加**: MRR / NDCG@20 の推移表示
4. ✅ **パネル配置**: Row 3-5 に新規パネルを配置
5. ✅ **ダッシュボード保存**: 右上の **💾 Save dashboard** をクリック

---

## 📝 備考

- **reviewed run_id**: `29f25cb4-4880-463d-9a3a-2b3ce6b3ba1c`（人間レビュー後）
- **dataset_version**: `v1.0-reviewed`
- **BM25の勝因**: Technical カテゴリで固有名詞のexact matchを順位改善
- **Generalでの効果**: 一般語は意味的類似が強く、BM25の改善余地が小さい

---

**作成者**: NANDS Backend Python Team  
**最終更新**: 2025-12-29 (Phase 3 Week 3 Task2 完了時 + 再発防止追記)

---

## 🛡️ 再発防止（2025-12-29 確定）

### 問題の背景

Task2 実装時に以下の問題が発生しました：

1. **Templating [run_id] エラー**: UUID型返却 + 複雑クエリでSQL失敗
2. **provisioning更新されない**: `overwrite: true` が無く、変数更新がスキップされた
3. **minute近似の歪み**: `date_trunc('minute')` で1run内の複数点が平均化された

### 解決策

#### 1. run_id 変数クエリの堅牢化

上記の「Step 2: run_id 変数を追加」セクションに記載された **堅牢版クエリ** を使用。

#### 2. All runs trend のrun単位1点化

上記の「パネル3: Technical カテゴリ MRR 推移」セクションに記載された **run単位1点版SQL** を使用。

**注**: General MRR / Technical NDCG / General NDCG も同様の構造で、`category` と指標（`mrr` / `ndcg`）を変更します。

#### 3. API検収スクリプト

```bash
# 1コマンドで検証
cd /Users/nands/my-corporate-site/backend
python verify_grafana_panels.py
```

**検証内容**:
- ✅ run_id 変数の存在とクエリ正当性
- ✅ Panel 8-13 の存在とタイトル
- ✅ Time series パネルのSQL（run単位1点）

#### 4. dashboard.yml への overwrite 追加

```yaml
# infra/grafana/provisioning/dashboards/dashboard.yml
providers:
  - name: 'RAG Dashboards'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /etc/grafana/provisioning/dashboards
      foldersFromFilesStructure: true
    overwrite: true  # ← これが重要
```

### 成果

- ✅ **Templating エラー解消**: run_id 変数が正常に動作
- ✅ **provisioning自動更新**: `overwrite: true` で既存ダッシュボードが更新される
- ✅ **run単位1点の正確なトレンド**: minute近似の歪みを排除
- ✅ **再現可能な検証**: API検収スクリプトで常に検証可能

