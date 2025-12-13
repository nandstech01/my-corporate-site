# Phase 0: データベース調査結果

**実施日:** 2025-12-12 02:30  
**ステータス:** ✅ 完了

---

## 📊 既存テーブル確認

### ✅ 必要なテーブルが全て存在

```sql
-- 台本保存用
company_youtube_shorts           ✅ 存在

-- RAGテーブル
hybrid_deep_research             ✅ 存在（ディープリサーチRAG）
fragment_vectors                 ✅ 存在（ブログ記事RAG）
kenji_harada_architect_knowledge ✅ 存在（Kenji思想RAG）
personal_story_rag               ✅ 存在（パーソナルRAG）
```

---

## 🔍 company_youtube_shorts テーブル詳細

### 重要フィールド

| フィールド | 型 | 説明 | V2での活用 |
|-----------|-----|------|-----------|
| `script_hook` | text | フック台本 | ✅ **最適化されたフックを保存** |
| `metadata` | jsonb | メタデータ | ✅ **フック情報、CTA設定を追加** |
| `content_type` | varchar(100) | 台本タイプ | 'youtube-short'（既存） |
| `related_blog_post_id` | integer | 記事ID | ブログ記事との紐付け |
| `embedding` | vector(1536) | ベクトル | ハイブリッド検索用 |

### metadataフィールドの拡張案

```json
{
  "generation_method": "architect-short-v2",
  "hook_optimization": {
    "pattern_type": "shock-value",
    "effectiveness_score": 95,
    "source": "mrbeast",
    "original_pattern": "{subject} {action} {shocking_result}"
  },
  "deep_research": {
    "topic": "AI automation success story small business 2025",
    "research_type": "success-case-study",
    "learnings_count": 25,
    "elapsed_seconds": 180
  },
  "target_audience": "general",
  "simplicity_metrics": {
    "technical_terms_count": 0,
    "metaphor_used": "教師が赤ペン入れてくれる",
    "simplicity_score": 95
  },
  "cta_config": {
    "type": "normal",
    "keyword": "売上2倍",
    "script_generation_count": 3
  }
}
```

---

## 🔍 hybrid_deep_research テーブル詳細

### 重要フィールド

| フィールド | 型 | 説明 | V2での活用 |
|-----------|-----|------|-----------|
| `research_topic` | varchar(500) | リサーチトピック | ✅ ブログから生成 |
| `research_type` | varchar(100) | リサーチタイプ | ✅ **'cutting-edge-ai'等を追加** |
| `content` | text | リサーチ結果 | ✅ 台本生成に使用 |
| `summary` | text | サマリー | ✅ 台本生成に使用 |
| `key_findings` | text[] | 主要発見 | ✅ フック生成に使用 |
| `embedding` | vector(1536) | ベクトル | ✅ ハイブリッド検索用 |
| `content_tsvector` | tsvector | BM25用 | ✅ ハイブリッド検索用 |
| `authority_score` | numeric(3,2) | 権威性 | 高品質のみ取得 |

### インデックス（全て存在）

```sql
✅ idx_hybrid_deep_research_embedding  -- ベクトル検索（ivfflat）
✅ idx_hybrid_deep_research_tsvector   -- BM25検索（gin）
✅ idx_hybrid_deep_research_type       -- リサーチタイプ
✅ idx_hybrid_deep_research_authority  -- 権威性スコア
```

---

## 🆕 新規テーブル設計: viral_hook_patterns

### 目的

MrBeast、TikTokバイラル動画のフックパターンをRAG化。

### テーブル定義

```sql
CREATE TABLE IF NOT EXISTS viral_hook_patterns (
  id SERIAL PRIMARY KEY,
  
  -- フック情報
  hook_text TEXT NOT NULL,                    -- 元のフック
  hook_pattern TEXT NOT NULL,                 -- 抽象化パターン
  hook_category VARCHAR(50) NOT NULL,         -- shock-value, pov, negation等
  
  -- ソース情報
  source_creator VARCHAR(50),                 -- mrbeast, tiktok, aliabdaal
  source_url TEXT,                            -- 元動画URL
  views BIGINT DEFAULT 0,                     -- 再生回数
  engagement_rate FLOAT DEFAULT 0,            -- エンゲージメント率
  
  -- パターン情報
  hook_variables JSONB,                       -- {subject, action, result}等
  effectiveness_score FLOAT DEFAULT 0,        -- 効果スコア（0-100）
  applicable_topics TEXT[],                   -- 適用可能なトピック
  
  -- 検索用
  embedding VECTOR(1536),                     -- ベクトル埋め込み
  content_tsvector TSVECTOR,                  -- BM25検索用
  
  -- メタデータ
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- タイムスタンプ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_viral_hooks_embedding 
ON viral_hook_patterns USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

CREATE INDEX idx_viral_hooks_tsvector 
ON viral_hook_patterns USING gin (content_tsvector);

CREATE INDEX idx_viral_hooks_category 
ON viral_hook_patterns (hook_category);

CREATE INDEX idx_viral_hooks_effectiveness 
ON viral_hook_patterns (effectiveness_score DESC);

CREATE INDEX idx_viral_hooks_topics 
ON viral_hook_patterns USING gin (applicable_topics);

-- トリガー（BM25用）
CREATE OR REPLACE FUNCTION update_viral_hooks_tsvector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.content_tsvector := to_tsvector('english', 
    COALESCE(NEW.hook_text, '') || ' ' ||
    COALESCE(NEW.hook_pattern, '') || ' ' ||
    COALESCE(array_to_string(NEW.applicable_topics, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_viral_hooks_tsvector
BEFORE INSERT OR UPDATE ON viral_hook_patterns
FOR EACH ROW
EXECUTE FUNCTION update_viral_hooks_tsvector();
```

### 初期データ例

```sql
-- MrBeast型（shock-value）
INSERT INTO viral_hook_patterns (
  hook_text,
  hook_pattern,
  hook_category,
  source_creator,
  effectiveness_score,
  hook_variables,
  applicable_topics
) VALUES (
  'I gave $1,000,000 to random people',
  '{subject} {action} {shocking_result}',
  'shock-value',
  'mrbeast',
  95,
  '{"subject": "I", "action": "gave", "result": "$1,000,000", "target": "random people"}',
  ARRAY['business', 'finance', 'charity']
);

-- TikTok型（POV）
INSERT INTO viral_hook_patterns (
  hook_text,
  hook_pattern,
  hook_category,
  source_creator,
  effectiveness_score,
  hook_variables,
  applicable_topics
) VALUES (
  'POV: You''re a CEO making $10M/year',
  'POV: あなたは{ideal_situation}',
  'pov',
  'tiktok',
  90,
  '{"ideal_situation": "CEO making $10M/year"}',
  ARRAY['business', 'career', 'success']
);

-- Transformation型（before/after）
INSERT INTO viral_hook_patterns (
  hook_text,
  hook_pattern,
  hook_category,
  source_creator,
  effectiveness_score,
  hook_variables,
  applicable_topics
) VALUES (
  'From $0 to $1M in 6 months',
  '{before}が、{after}になった話',
  'transformation',
  'aliabdaal',
  88,
  '{"before": "$0", "after": "$1M in 6 months"}',
  ARRAY['business', 'finance', 'startup']
);
```

---

## ✅ 結論

### 既存テーブルの状況

```
✅ company_youtube_shorts      - 台本保存用、変更不要
✅ hybrid_deep_research         - ディープリサーチRAG、活用可能
✅ fragment_vectors             - ブログRAG、活用可能
✅ kenji_harada_architect_knowledge - Kenji思想RAG、活用可能
✅ personal_story_rag           - パーソナルRAG、活用可能
```

### 必要な変更

```
🆕 viral_hook_patterns テーブル作成（新規）
   - フックパターンRAG用
   - ハイブリッド検索対応
   - 初期データ投入
```

### 既存テーブルへの影響

```
❌ 影響ゼロ
   - 既存テーブル構造の変更なし
   - 既存データへの影響なし
   - 既存機能への影響なし
```

---

## 🚀 次のステップ

Phase 1に進む準備完了：

1. ✅ DB調査完了
2. ✅ 新規テーブル設計完了
3. [ ] Phase 1開始: フックパターンRAG構築

---

**調査者:** AI Assistant  
**完了日:** 2025-12-12 02:35

