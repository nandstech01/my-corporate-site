# Phase 3: ML評価システム

**期間**: 2週間（Phase 2完了後）
**前提**: Phase 1、Phase 2完了（検索ログ分析が稼働）

---

## 🎯 Phase 3の目的

### 背景
検索ログは記録できているが、**RAG検索の精度が数値化されていない**

### 目標
1. ✅ RAG検索精度の自動評価
2. ✅ 評価データセット構築
3. ✅ ML評価指標の実装（Recall@k、MRR、NDCG）
4. ✅ A/Bテスト基盤

### 成果物
- 評価データセット（100+件）
- ML評価システム
- 評価指標API
- A/Bテストフレームワーク

---

## 📊 ML評価指標

### 1. Recall@k（上位k件の再現率）

```
正解: ["faq-tech-1", "service-ai-agents", "faq-pricing-1"]
検索結果TOP 5: ["faq-tech-1", "other-1", "service-ai-agents", "other-2", "other-3"]

Recall@5 = 2 / 3 = 0.67 (67%)
```

### 2. MRR（Mean Reciprocal Rank）

```
正解が1位 → 1.0
正解が2位 → 0.5
正解が3位 → 0.33
正解が10位 → 0.1
```

### 3. NDCG（Normalized Discounted Cumulative Gain）

順位を考慮した精度指標（上位ほど重要）

---

## 🗄️ データベース設計

### 1. 評価データセット

```sql
CREATE TABLE evaluation_queries (
  id BIGSERIAL PRIMARY KEY,
  query TEXT NOT NULL,
  expected_fragment_ids TEXT[] NOT NULL,  -- 正解のFragment ID
  category VARCHAR(50),                   -- 'technical', 'pricing', etc.
  difficulty INTEGER,                     -- 1-5
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- サンプルデータ
INSERT INTO evaluation_queries (query, expected_fragment_ids, category, difficulty) VALUES
('AIアーキテクトとは何ですか？', ARRAY['faq-tech-1', 'service-ai-agents'], 'technical', 2),
('料金プランを教えてください', ARRAY['faq-pricing-1', 'pricing-individual-main'], 'pricing', 1),
('Vector RAGの構築方法', ARRAY['service-vector-rag', 'faq-tech-5'], 'technical', 4);
```

### 2. 評価結果履歴

```sql
CREATE TABLE evaluation_results (
  id BIGSERIAL PRIMARY KEY,
  experiment_id VARCHAR(255),
  variant VARCHAR(50),                    -- 'baseline', 'variant_a', 'variant_b'
  recall_at_5 FLOAT,
  recall_at_10 FLOAT,
  mrr FLOAT,
  ndcg FLOAT,
  bm25_weight FLOAT,
  vector_weight FLOAT,
  threshold FLOAT,
  total_queries INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔧 ML評価システム実装

### 1. 評価サービス

```python
# backend/rag_api/services/evaluation_service.py
class EvaluationService:
    def evaluate_recall_at_k(self, results, expected_ids, k=5):
        """
        Recall@k: 上位k件に正解がいくつ含まれるか
        """
        top_k_ids = [r['fragment_id'] for r in results[:k]]
        hits = len(set(top_k_ids) & set(expected_ids))
        return hits / len(expected_ids) if len(expected_ids) > 0 else 0.0
    
    def evaluate_mrr(self, results, expected_ids):
        """
        MRR: Mean Reciprocal Rank
        """
        for i, result in enumerate(results):
            if result['fragment_id'] in expected_ids:
                return 1.0 / (i + 1)
        return 0.0
    
    def evaluate_ndcg(self, results, expected_ids, k=10):
        """
        NDCG: Normalized Discounted Cumulative Gain
        """
        dcg = 0.0
        for i, result in enumerate(results[:k]):
            if result['fragment_id'] in expected_ids:
                # rel = 1 if hit, 0 if not
                dcg += 1.0 / np.log2(i + 2)  # i+2 because i starts at 0
        
        # Ideal DCG
        idcg = sum(1.0 / np.log2(i + 2) for i in range(min(len(expected_ids), k)))
        
        return dcg / idcg if idcg > 0 else 0.0
    
    def run_full_evaluation(self, variant='baseline'):
        """
        評価データセット全体でRAGを評価
        """
        queries = self.get_evaluation_queries()
        
        metrics = {
            'recall_at_5': [],
            'recall_at_10': [],
            'mrr': [],
            'ndcg': []
        }
        
        for query_item in queries:
            results = self.rag_search_service.hybrid_search(
                query_item['query'],
                ['fragment']
            )
            
            metrics['recall_at_5'].append(
                self.evaluate_recall_at_k(results, query_item['expected_fragment_ids'], k=5)
            )
            metrics['recall_at_10'].append(
                self.evaluate_recall_at_k(results, query_item['expected_fragment_ids'], k=10)
            )
            metrics['mrr'].append(
                self.evaluate_mrr(results, query_item['expected_fragment_ids'])
            )
            metrics['ndcg'].append(
                self.evaluate_ndcg(results, query_item['expected_fragment_ids'])
            )
        
        return {
            'variant': variant,
            'avg_recall_at_5': np.mean(metrics['recall_at_5']),
            'avg_recall_at_10': np.mean(metrics['recall_at_10']),
            'avg_mrr': np.mean(metrics['mrr']),
            'avg_ndcg': np.mean(metrics['ndcg']),
            'total_queries': len(queries)
        }
```

---

## 📋 APIエンドポイント（追加）

### 1. POST /api/rag/evaluate

```json
{
  "variant": "baseline",
  "sources": ["fragment"],
  "params": {
    "bm25_weight": 0.4,
    "vector_weight": 0.6,
    "threshold": 0.3
  }
}

→ Response:
{
  "success": true,
  "variant": "baseline",
  "metrics": {
    "recall_at_5": 0.85,
    "recall_at_10": 0.92,
    "mrr": 0.78,
    "ndcg": 0.88
  },
  "total_queries": 100
}
```

### 2. POST /api/rag/ab-test

A/Bテスト実行

```json
{
  "variant_a": {
    "bm25_weight": 0.4,
    "vector_weight": 0.6
  },
  "variant_b": {
    "bm25_weight": 0.5,
    "vector_weight": 0.5
  }
}

→ Response:
{
  "winner": "variant_a",
  "variant_a_metrics": {...},
  "variant_b_metrics": {...},
  "improvement": "+5.2%"
}
```

---

## 📊 評価データセット準備

### 1. 手動作成（初期100件）

```sql
-- 各カテゴリから作成
-- Technical: 30件
-- Pricing: 20件
-- Service: 20件
-- General: 20件
-- Troubleshooting: 10件
```

### 2. 検索ログから自動生成（将来）

```python
def generate_dataset_from_logs(self):
    """
    検索ログから頻出クエリを抽出し、
    クリックされたFragment IDを正解とする
    """
    pass
```

---

## ✅ Phase 3完了判定基準

- [ ] 評価データセット100件以上作成
- [ ] ML評価システムが動作する
- [ ] Recall@5、MRR、NDCGが計算できる
- [ ] A/Bテストが実行できる
- [ ] 評価結果がDBに保存される

---

## 🔗 次のステップ

Phase 3完了後、Phase 4（MLflow統合）へ

---

## 💡 柔軟性のポイント

### 評価指標は追加・変更可能
- Precision@k
- F1-score
- Hit Rate
- Mean Average Precision (MAP)

### 評価データセットは段階的に拡張
- Phase 3.1: 手動100件
- Phase 3.2: 検索ログから自動生成200件
- Phase 3.3: ユーザーフィードバック統合

### A/Bテストパラメータは柔軟
- weight調整
- threshold調整
- RAG組み合わせ変更
- 検索アルゴリズム変更

