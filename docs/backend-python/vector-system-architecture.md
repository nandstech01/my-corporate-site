# Vector System Architecture（ベクトルシステム設計）

**作成日**: 2025年1月
**ステータス**: 本番稼働中
**目的**: AI検索最適化のための二層構造システム

---

## 🎯 システム概要

このプロジェクトは、**「意味と位置の両立」** を実現するベクトルシステムを実装しています。

```
┌─────────────────────────────────────────────────────┐
│  AI検索時代の二層構造                               │
├─────────────────────────────────────────────────────┤
│  【公開層】                                         │
│  - Fragment ID（#faq-1, #service-ai 等）           │
│  - Complete URI（https://nands.tech/page#faq-1）  │
│  - 構造化データ（JSON-LD）                          │
│                                                     │
│  【非公開層】                                       │
│  - Vector Embedding（1536次元）                    │
│  - Semantic Weight（意味的重み）                   │
│  - Target Queries（ターゲットクエリ）              │
│                                                     │
│  ↕️  ベクトルリンク = 公開層 + 非公開層            │
└─────────────────────────────────────────────────────┘
```

---

## 🔑 核心コンセプト: ベクトルリンク（Vector Link）

### 定義

```
ベクトルリンクとは、断片を指し示す完全URI（ディープリンク）と、
その断片の意味を表すベクトル埋め込みを対応づけた二層的リンク資産であり、
AI検索時代における意味と位置の両立を保証する仕組みである。
```

### 構成要素

```typescript
interface VectorLink {
  // 公開層（Googleが見える）
  completeUri: string;        // "https://nands.tech/faq#faq-1"
  fragmentId: string;         // "faq-1"
  
  // 非公開層（AIが意味検索に使う）
  embedding: number[];        // [0.1234, -0.5678, ...] (1536次元)
  
  // メタデータ
  metadata: {
    contentTitle: string;     // "料金について"
    content: string;          // "料金は月額3万円から..."
    semanticWeight: number;   // 0.88 (重要度)
    targetQueries: string[];  // ["料金", "価格", "費用"]
  }
}
```

---

## 🏗️ システムアーキテクチャ

### 全体図

```
┌─────────────────────────────────────────────────┐
│  1. コンテンツ抽出                              │
│     ContentExtractor                            │
│     - サービスページ                            │
│     - ブログ記事                                │
│     - 構造化データファイル                      │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│  2. Fragment ID生成                             │
│     FragmentVectorizer                          │
│     - マークダウン解析                          │
│     - H1/H2/FAQ自動抽出                         │
│     - Fragment ID割り当て                       │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│  3. ベクトル化                                  │
│     OpenAIEmbeddings                            │
│     - text-embedding-3-small (1536次元)        │
│     - text-embedding-3-large (3072次元)        │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│  4. データベース保存                            │
│     FragmentVectorStore                         │
│     - fragment_vectors テーブル                 │
│     - pgvector (HNSW Index)                     │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│  5. ハイブリッド検索                            │
│     HybridSearchSystem                          │
│     - BM25全文検索                              │
│     - ベクトル類似度検索                        │
│     - RRF統合スコア                             │
└─────────────────────────────────────────────────┘
```

---

## 📦 主要コンポーネント

### 1. ContentExtractor（コンテンツ抽出）

**役割**: サイト全体のコンテンツを抽出

```typescript
// 実装ファイル: lib/vector/content-extractor.ts

// 抽出対象:
- サービスページ（14サービス）
- 企業情報ページ
- ブログ記事
- 技術情報ページ
- レリバンスエンジニアリング関連ファイル（.ts）

// 出力:
interface ExtractedContent {
  url: string;
  title: string;
  description: string;
  content: string;
  metadata: {
    type: 'service' | 'blog' | 'corporate' | 'technical' | 'structured-data';
    wordCount: number;
    headings: string[];
  };
}
```

**特徴**:
- ✅ Reactファイル（.tsx）からJSXテキストを抽出
- ✅ TypeScriptファイル（.ts）からコメント・型定義を抽出
- ✅ プレースホルダー除去（{variable}等）

---

### 2. FragmentVectorizer（Fragment ID生成・ベクトル化）

**役割**: マークダウンからFragment IDを抽出し、ベクトル化

```typescript
// 実装ファイル: lib/vector/fragment-vectorizer.ts

// Fragment ID自動抽出:
1. H1タイトル → main-title-xxxxx
2. FAQ → faq-1, faq-2, ...
3. 著者情報 → author-profile
4. 既存{#id}形式 → そのまま使用

// ベクトル化対象:
- fragment.content（Fragment IDが指すコンテンツ）
- 例: "質問: 料金について\n\n回答: 月額3万円から..."

// 出力:
interface FragmentVectorData {
  fragment_id: string;
  complete_uri: string;
  embedding: number[];
  semantic_weight: number;
  target_queries: string[];
}
```

**特徴**:
- ✅ 自動FAQ抽出（正規表現ベース）
- ✅ セマンティック重み自動計算
- ✅ ターゲットクエリ自動生成

---

### 3. FragmentVectorStore（データベース管理）

**役割**: Fragment Vectorをデータベースに保存・検索

```typescript
// 実装ファイル: lib/vector/fragment-vector-store.ts

// 主要メソッド:
- saveFragmentVector()           // 単体保存
- saveFragmentVectorsBatch()     // バッチ保存
- searchSimilarFragments()       // 類似検索
- clearFragmentVectors()         // 削除（再構築用）

// データベース:
fragment_vectors テーブル
  - fragment_id (VARCHAR)
  - complete_uri (TEXT)
  - embedding (vector(1536))
  - target_queries (TEXT[])
  - metadata (JSONB)
```

**特徴**:
- ✅ 重複防止機能（UNIQUE制約）
- ✅ pgvector HNSW Index（高速検索）
- ✅ GIN Index（配列・JSONB検索）

---

### 4. HybridSearchSystem（ハイブリッド検索）

**役割**: BM25全文検索 + ベクトル類似度検索

```typescript
// 実装ファイル: lib/vector/hybrid-search.ts

// 検索ソース:
- company（Company Vectors）
- trend（Trend Vectors + 鮮度スコア）
- youtube（YouTube Vectors）
- fragment（Fragment Vectors）
- kenji（Kenji Thought Vectors - 3072次元）

// RRF統合スコア:
combinedScore = 
  bm25Weight * (1 / (rrf_k + bm25Rank)) +
  vectorWeight * (1 / (rrf_k + vectorRank))

// 出力:
interface HybridSearchResult {
  bm25Score: number;
  vectorScore: number;
  combinedScore: number;
}
```

**特徴**:
- ✅ BM25全文検索（PostgreSQL `ts_rank_cd`）
- ✅ ベクトル類似度検索（pgvector `<=>` 演算子）
- ✅ RRF統合（Reciprocal Rank Fusion）
- ✅ 重み調整可能（bm25Weight, vectorWeight）

---

### 5. VectorLinkDefinitions（ベクトルリンク定義）

**役割**: ベクトルリンクの公式定義・ロードマップ

```typescript
// 実装ファイル: lib/vector/vector-link-definitions.ts

// 公式定義:
"ベクトルリンクとは、断片を指し示す完全URI（ディープリンク）と、
その断片の意味を表すベクトル埋め込みを対応づけた二層的リンク資産であり、
AI検索時代における意味と位置の両立を保証する仕組みである。"

// ロードマップ:
Phase 1: ✅ 完了（メインページFragment IDベクトル化）
Phase 2: 🚧 進行中（全ページのベクトルリンク化）
Phase 3: 📋 計画中（統合管理システム）
```

---

## 🗄️ データベース設計

### fragment_vectors テーブル

```sql
CREATE TABLE fragment_vectors (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  fragment_id VARCHAR(255) NOT NULL,
  complete_uri TEXT NOT NULL,
  page_path VARCHAR(500) NOT NULL,
  content_title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_type VARCHAR(100) NOT NULL,
  embedding vector(1536) NOT NULL,
  category VARCHAR(100),
  semantic_weight FLOAT DEFAULT 0.85,
  target_queries TEXT[],
  related_entities TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(fragment_id, page_path)
);

-- HNSW Index（高速ベクトル検索）
CREATE INDEX idx_fragment_vectors_embedding
ON fragment_vectors USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- GIN Index（配列・JSONB検索）
CREATE INDEX idx_fragment_vectors_target_queries
ON fragment_vectors USING gin(target_queries);
```

---

## 🔍 ハイブリッド検索の仕組み

### RRF（Reciprocal Rank Fusion）

```sql
-- Company Vectors ハイブリッド検索例
CREATE FUNCTION hybrid_search_company_vectors(
  query_text text,
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 10,
  bm25_weight float DEFAULT 0.4,
  vector_weight float DEFAULT 0.6
)
RETURNS TABLE (...) AS $$
BEGIN
  -- BM25全文検索
  WITH bm25_results AS (
    SELECT *, 
      ts_rank_cd(content_tsvector, websearch_to_tsquery('simple', query_text)) as rank_score,
      ROW_NUMBER() OVER (...) as rank
    FROM company_vectors
    WHERE content_tsvector @@ websearch_to_tsquery('simple', query_text)
  ),
  -- ベクトル類似度検索
  vector_results AS (
    SELECT *,
      (1 - (embedding <=> query_embedding)) as similarity,
      ROW_NUMBER() OVER (...) as rank
    FROM company_vectors
    WHERE (1 - (embedding <=> query_embedding)) > match_threshold
  ),
  -- RRF統合
  combined_results AS (
    SELECT
      COALESCE(b.id, v.id) as id,
      (bm25_weight * COALESCE(1.0 / (60 + b.rank), 0.0) +
       vector_weight * COALESCE(1.0 / (60 + v.rank), 0.0)) as combined_score
    FROM bm25_results b
    FULL OUTER JOIN vector_results v ON b.id = v.id
  )
  SELECT * FROM combined_results ORDER BY combined_score DESC LIMIT match_count;
END;
$$ LANGUAGE plpgsql;
```

---

## 🎨 TypeScript / Python の棲み分け

### TypeScript（フロントエンド・API）

```
役割:
- Next.js API Routes（/app/api/）
- ベクトル化クラス（FragmentVectorizer）
- データベース操作（FragmentVectorStore）
- ハイブリッド検索（HybridSearchSystem）

理由:
- Next.jsとの統合が容易
- TypeScript型安全性
- OpenAI SDK（TypeScript版）が充実
```

### Python（バックエンド・AI処理）

```
役割:
- Deep Research（DeepSeek V3.2 + Tavily）
- URLクロール（SaaS商品化時）
- 重い計算処理
- データ分析・可視化

理由:
- AI/MLライブラリが豊富（LangChain, LlamaIndex等）
- スクレイピングツールが充実（BeautifulSoup, Scrapy）
- データ分析が得意（Pandas, NumPy）
```

### データ交換フォーマット: JSON

```json
{
  "fragment_id": "faq-1",
  "complete_uri": "https://nands.tech/faq#faq-1",
  "embedding": [0.1234, -0.5678, ...],
  "metadata": {
    "contentTitle": "料金について",
    "semanticWeight": 0.88
  }
}
```

---

## 🚀 SaaS商品化への応用

### クライアントサイト分析フロー

```
1. URL入力（TypeScript）
   ↓
2. コンテンツ抽出（Python or TypeScript）
   - ContentExtractor.extractAllContent()
   ↓
3. Fragment ID生成（TypeScript）
   - FragmentVectorizer.extractAndVectorizeFromMarkdown()
   ↓
4. ベクトルリンク生成（TypeScript）
   - FragmentVectorStore.saveFragmentVectorsBatch()
   ↓
5. 構造化データ生成（TypeScript）
   - UnifiedIntegrationSystem.generateUnifiedPageData()
   ↓
6. コード生成（Python or TypeScript）
   - code_generator.py or TypeScript生成関数
   ↓
7. ZIPダウンロード（TypeScript）
```

---

## 📊 統計情報

### 現在のベクトルリンク数

```
- Company Vectors: 約150件
- Trend Vectors: 約200件
- YouTube Vectors: 約100件
- Fragment Vectors: 約50件（Phase 2で拡大予定）
- Kenji Thought Vectors: 約30件
```

### 検索パフォーマンス

```
- ベクトル検索平均速度: 50ms（HNSW Index使用）
- ハイブリッド検索平均速度: 120ms（BM25 + Vector + RRF）
- 精度向上: 15-20%（ベクトル単体 vs ハイブリッド）
```

---

## ✅ まとめ

### Vector Systemの強み

1. **二層構造**: 公開層（Fragment ID）+ 非公開層（Embedding）
2. **ハイブリッド検索**: BM25 + ベクトル + RRF統合
3. **自動化**: Fragment ID自動抽出・ベクトル化
4. **スケーラブル**: pgvector HNSW Index（高速検索）
5. **商品化可能**: SaaSツールとして外販可能

### 次のステップ

- [ ] Phase 2完了（全ページベクトルリンク化）
- [ ] SaaSプロトタイプ開発
- [ ] Python/TypeScript API統合
- [ ] ダッシュボード構築
- [ ] βテスト実施

---

## 🔗 関連ファイル

```
/lib/vector/
  ├── fragment-vectorizer.ts        ← Fragment ID生成・ベクトル化
  ├── content-extractor.ts          ← コンテンツ抽出
  ├── fragment-vector-store.ts      ← データベース管理
  ├── hybrid-search.ts              ← ハイブリッド検索
  ├── vector-link-definitions.ts    ← ベクトルリンク定義
  └── openai-embeddings.ts          ← OpenAI Embeddings

/lib/structured-data/
  ├── entity-relationships.ts       ← エンティティ関係
  ├── haspart-schema-system.ts      ← hasPart スキーマ
  └── unified-integration.ts        ← 統合システム

/docs/
  ├── saas-product-concept.md       ← SaaS商品化コンセプト
  └── vector-system-architecture.md ← このファイル
```

