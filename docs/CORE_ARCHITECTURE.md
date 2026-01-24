# コアアーキテクチャ

**最終更新**: 2026-01-19

本プロジェクトのコア機能であるレリバンスエンジニアリングとベクトル検索システムの技術仕様。

---

## 概要

```
lib/
├── structured-data/     # レリバンスエンジニアリング（Mike King理論）
└── vector/              # ベクトル検索システム（Fragment ID + ハイブリッド検索）
```

---

## lib/structured-data/

**Mike King理論に基づくレリバンスエンジニアリング（RE）実装**

AI検索エンジン（ChatGPT, Perplexity, Claude, Gemini）に最適化された構造化データを生成。

### ファイル構成

| ファイル | 役割 |
|---------|------|
| `index.ts` | エントリーポイント・統合クラス |
| `entity-relationships.ts` | エンティティ定義（Organization, Service等） |
| `ai-search-optimization.ts` | AI検索最適化（knowsAbout, mentions, Fragment ID連携） |
| `unified-integration.ts` | 統合構造化データ生成 |
| `schema-org-latest.ts` | Schema.org 16.0+ 対応 |
| `author-trust-system.ts` | 著者信頼性システム（E-E-A-T） |
| `haspart-schema-system.ts` | hasPart階層構造 |
| `howto-faq-schema.ts` | HowTo/FAQ構造化データ |
| `auto-toc-system.ts` | 自動目次生成 |
| `semantic-links.ts` | セマンティックリンク |
| `validation-system.ts` | JSON-LD検証 |

### 主要クラス

#### UnifiedStructuredDataSystem

```typescript
import { UnifiedStructuredDataSystem } from '@/lib/structured-data';

const system = new UnifiedStructuredDataSystem('https://nands.tech');

// 組織スキーマ生成
const orgSchema = system.generateOrganizationSchema();

// サービスページスキーマ生成
const serviceSchema = system.generateServiceSchema('ai-agents');

// 記事スキーマ生成（Fragment ID連携）
const articleSchema = system.generateArticleSchema({
  title: '記事タイトル',
  fragments: ['faq-1', 'section-intro']
});
```

#### エンティティ定義

```typescript
import {
  ORGANIZATION_ENTITY,
  SERVICE_ENTITIES,
  getEntityRelationships
} from '@/lib/structured-data';

// 組織エンティティ
ORGANIZATION_ENTITY = {
  '@id': 'https://nands.tech/#organization',
  '@type': 'Organization',
  name: '株式会社エヌアンドエス',
  knowsAbout: [
    'レリバンスエンジニアリング',
    'AI検索最適化',
    'RAG',
    // ...
  ]
}

// サービスエンティティ
SERVICE_ENTITIES = {
  'ai-agents': { /* AIエージェント開発 */ },
  'system-development': { /* システム開発 */ },
  // ...
}
```

### AI検索最適化

```typescript
import {
  generateDetailedKnowsAbout,
  generateDetailedMentions
} from '@/lib/structured-data/ai-search-optimization';

// 専門知識の詳細化
const knowsAbout = generateDetailedKnowsAbout({
  subject: 'RAG',
  expertiseLevel: 5,
  category: 'technology',
  fragmentId: 'tech-rag-overview'
});

// 関連エンティティ明示
const mentions = generateDetailedMentions({
  entity: 'OpenAI',
  entityType: 'Organization',
  context: 'integrates',
  importance: 9
});
```

---

## lib/vector/

**Fragment IDベースのベクトル検索システム**

ハイブリッド検索（BM25 + Vector + RRF）によるセマンティック検索を実現。

### ファイル構成

| ファイル | 役割 |
|---------|------|
| `hybrid-search.ts` | ハイブリッド検索（BM25 + Vector + RRF） |
| `fragment-vectorizer.ts` | Fragment ID自動ベクトル化 |
| `openai-embeddings.ts` | OpenAI Embeddings API連携 |
| `fragment-vector-store.ts` | Fragment Vector Store |
| `supabase-vector-store.ts` | Supabase Vector Store |
| `content-extractor.ts` | コンテンツ抽出 |
| `vector-link-definitions.ts` | ベクトルリンク定義 |

### 主要クラス

#### HybridSearchSystem

```typescript
import { HybridSearchSystem } from '@/lib/vector/hybrid-search';

const search = new HybridSearchSystem();

// ハイブリッド検索実行
const results = await search.search({
  query: 'AIエージェント開発',
  source: 'fragment',  // 'company' | 'trend' | 'youtube' | 'fragment' | 'kenji'
  limit: 10,
  threshold: 0.3,
  bm25Weight: 0.4,
  vectorWeight: 0.6
});

// 結果
results.forEach(r => {
  console.log(r.content);
  console.log(`Combined Score: ${r.combinedScore}`);
  console.log(`BM25: ${r.bm25Score}, Vector: ${r.vectorScore}`);
});
```

#### FragmentVectorizer

```typescript
import { FragmentVectorizer } from '@/lib/vector/fragment-vectorizer';

const vectorizer = new FragmentVectorizer();

// ブログ記事のFragment IDを自動ベクトル化
const result = await vectorizer.vectorizeBlogFragments({
  post_id: 123,
  post_title: '記事タイトル',
  slug: 'article-slug',
  page_path: '/blog/article-slug',
  fragments: [
    {
      fragment_id: 'intro-section',
      content_title: '導入',
      content: 'AIエージェントとは...',
      content_type: 'section'
    },
    {
      fragment_id: 'faq-1',
      content_title: 'よくある質問',
      content: 'Q: AIエージェントの開発期間は？',
      content_type: 'faq'
    }
  ]
});
```

#### OpenAIEmbeddings

```typescript
import { OpenAIEmbeddings } from '@/lib/vector/openai-embeddings';

const embeddings = new OpenAIEmbeddings();

// 単一テキストをベクトル化
const vector = await embeddings.embedSingle('検索クエリ');
// → number[1536]

// バッチベクトル化
const vectors = await embeddings.embedBatch([
  'テキスト1',
  'テキスト2'
]);
```

---

## データベース構造

### fragment_vectors テーブル

```sql
CREATE TABLE fragment_vectors (
  id BIGSERIAL PRIMARY KEY,
  fragment_id TEXT UNIQUE NOT NULL,      -- 'faq-tech-1', 'service-ai-agents'
  complete_uri TEXT NOT NULL,            -- 'https://nands.tech/faq#faq-tech-1'
  page_path TEXT NOT NULL,               -- '/faq'
  content_title TEXT,
  content TEXT NOT NULL,
  content_type TEXT,                     -- 'faq', 'service', 'section', 'heading'
  embedding VECTOR(1536),                -- OpenAI text-embedding-3-small
  category TEXT,
  semantic_weight FLOAT,
  target_queries TEXT[],
  related_entities TEXT[],
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ハイブリッド検索用インデックス
CREATE INDEX idx_fragment_vectors_embedding ON fragment_vectors
  USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_fragment_vectors_content_fts ON fragment_vectors
  USING gin (to_tsvector('japanese', content));
```

### RAGソース

| テーブル | 件数 | 用途 |
|---------|------|------|
| `fragment_vectors` | 1,500+ | Fragment ID検索 |
| `company_vectors` | 128 | 会社情報 |
| `trend_vectors` | 127 | トレンド（鮮度スコア付き） |
| `youtube_vectors` | 18 | YouTube動画 |
| `kenji_thoughts` | 38 | Kenji思想（3072次元） |

---

## 検索アルゴリズム

### ハイブリッド検索フロー

```
クエリ入力
    │
    ├─→ [BM25全文検索] ─→ bm25_score (0-1)
    │       PostgreSQL tsvector/tsquery
    │
    ├─→ [Vector検索] ─→ vector_score (0-1)
    │       OpenAI Embeddings → cosine similarity
    │
    └─→ [RRF統合]
            combined_score =
              bm25_weight × bm25_score +
              vector_weight × vector_score +
              (recency_weight × recency_score)  // Trend RAGのみ

            デフォルト: bm25_weight=0.4, vector_weight=0.6
```

### Fragment IDシステム

```
Complete URI: https://nands.tech/faq#faq-tech-1
                      │         │    │
                      │         │    └── Fragment ID
                      │         └── Page Path
                      └── Base URL

用途:
1. AI検索エンジンの引用精度向上
2. ページ内セクションへのディープリンク
3. 構造化データの@id参照
4. ベクトル検索の粒度制御
```

---

## 使用例

### 1. ページにJSON-LD追加

```tsx
// app/ai-agents/page.tsx
import { UnifiedStructuredDataSystem } from '@/lib/structured-data';

export default function AIAgentsPage() {
  const system = new UnifiedStructuredDataSystem();
  const jsonLd = system.generateServiceSchema('ai-agents');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ページコンテンツ */}
    </>
  );
}
```

### 2. RAG検索API

```typescript
// app/api/search-rag/route.ts
import { HybridSearchSystem } from '@/lib/vector/hybrid-search';

export async function POST(request: Request) {
  const { query, sources } = await request.json();
  const search = new HybridSearchSystem();

  const results = await search.search({
    query,
    source: 'fragment',
    limit: 10
  });

  return Response.json({ results });
}
```

### 3. 記事公開時の自動ベクトル化

```typescript
// 記事保存後のフック
import { FragmentVectorizer } from '@/lib/vector/fragment-vectorizer';

async function onArticleSave(article: Article) {
  const vectorizer = new FragmentVectorizer();

  await vectorizer.vectorizeBlogFragments({
    post_id: article.id,
    post_title: article.title,
    slug: article.slug,
    page_path: `/blog/${article.slug}`,
    fragments: extractFragments(article.content)
  });
}
```

---

## 関連ドキュメント

- [Backend Python Phase概要](./backend-python/PHASES_OVERVIEW.md) - Django RAG API
- [SaaS Product](./saas-product/TASKS.md) - CLAVI SaaS実装
