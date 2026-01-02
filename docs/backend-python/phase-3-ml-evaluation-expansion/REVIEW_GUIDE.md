# 人間レビュー用ガイド

**作成日**: 2025-12-29  
**Phase**: Phase 3 Week 3 Task 3  
**目的**: 評価データセットの正解定義を精査し、評価の信頼性を向上させる

---

## 📋 レビュー対象

**ファイル**: `evaluation_review_top3.csv`

**対象クエリ（勝ち群上位3）**:
1. **OpenAI GPT-4** (Δrank: +11, MRR改善: +0.92)
2. **Google Gemini** (Δrank: +18, MRR改善: +0.45)
3. **Triple RAG** (Δrank: +2, MRR改善: +0.67)

**データ構造**:
- 3クエリ × 2バリアント（baseline/bm25） × 20件 = **120行**

---

## 🎯 レビュー手順

### Step 1: CSVを開く

Excelまたはスプレッドシートアプリで `evaluation_review_top3.csv` を開く。

### Step 2: 判定を行う

各行について、**「判定」列**に以下のいずれかを記入：

| 判定 | 意味 | 例 |
|------|------|-----|
| **正解** | クエリに対して完全に適切な回答 | 「OpenAI GPT-4」で「OpenAI GPT-4の説明」が出る |
| **準正解** | 関連性はあるが完全ではない | 「OpenAI GPT-4」で「GPT-5の説明」が出る |
| **不正解** | 関連性が低い/全く関係ない | 「OpenAI GPT-4」で「ユニクロの事例」が出る |

### Step 3: 判定理由を記入

**「判定理由」列**に、判定の根拠を簡潔に記入（任意）。

例:
- `正解: クエリ文字列がcontent中に完全一致`
- `準正解: 関連技術だが直接的ではない`
- `不正解: 全く関係ない`

---

## 🔍 判定の基準

### 正解の条件

以下のいずれかを満たす場合、**正解**と判定：

1. **Exact match**: クエリ文字列がtitle/content中に完全一致で含まれる
2. **直接回答**: クエリの質問に直接回答している
3. **主要説明**: クエリのトピックを主題として扱っている

### 準正解の条件

以下のいずれかを満たす場合、**準正解**と判定：

1. **関連技術**: クエリに関連する技術/製品の説明
2. **部分一致**: クエリの一部のみが含まれる
3. **間接回答**: クエリに間接的に関連する情報

### 不正解の条件

以下のいずれかを満たす場合、**不正解**と判定：

1. **無関係**: クエリと全く関係ない
2. **誤情報**: 誤った情報を含む
3. **文脈不一致**: クエリの意図と合わない

---

## 📊 レビュー後の処理

### Step 4: 結果を集計

各クエリ × バリアントについて、以下を集計：

| 指標 | 計算方法 |
|------|---------|
| **正解数** | 「正解」の数 |
| **準正解数** | 「準正解」の数 |
| **不正解数** | 「不正解」の数 |
| **判定率** | （正解数 + 準正解数）/ 20 |

### Step 5: expected_fragment_ids を更新

**正解**と判定したfragment_idを、`EvaluationQuery`の`expected_fragment_ids`に反映。

例:
```python
# OpenAI GPT-4の例
query = EvaluationQuery.objects.get(query="OpenAI GPT-4")
query.expected_fragment_ids = ["faq-tech-1", "gpt-5-overview", ...]  # レビュー結果を反映
query.save()
```

---

## ⚠️ 注意事項

### 1. 判定の一貫性

- 同じクエリで、baselineとbm25の判定基準を統一する
- 迷った場合は「準正解」を選ぶ

### 2. 複数正解の許可

- 1つのクエリに対して複数の「正解」がある場合がある
- すべての正解を`expected_fragment_ids`に含める

### 3. 判定の優先順位

1. **Content match** > Title match
   - Contentに含まれているかが最優先
2. **Direct answer** > Indirect answer
   - 直接回答している方が優先

---

## 📈 期待される成果

### KPI

| 指標 | 目標値 | 現状 |
|------|--------|------|
| **正解セットの確信度** | 高い（主観） | - |
| **判定の一貫性** | 80%以上 | - |
| **複数正解の発見** | クエリあたり3-5件 | - |

### 次のアクション

レビュー完了後：
1. **expected_fragment_ids を更新**
2. **再評価を実行**（同一run_idで）
3. **MRR/NDCG/Recall を再計算**
4. **Grafana分離表示** (Task2)

---

## 📂 関連ファイル

- **CSVファイル**: `backend/evaluation_review_top3.csv`
- **分析レポート**: `docs/backend-python/phase-3-ml-evaluation-expansion/BM25_MECHANISM_ANALYSIS.md`
- **評価モデル**: `backend/rag_api/models.py` (`EvaluationQuery`, `EvaluationResult`)

---

**レビュー担当**: NANDS Backend Python Team  
**最終更新**: 2025-12-29 (Phase 3 Week 3 Task 3)

