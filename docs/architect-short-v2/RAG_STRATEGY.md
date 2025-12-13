# RAG活用戦略 - 既存データ最優先

**作成日:** 2025-12-12 02:45  
**重要度:** ⭐⭐⭐⭐⭐

---

## 🎯 基本方針

```
既存RAGを最大限活用 → 必要な時だけ新規リサーチ
```

---

## 📊 フロー図（修正版）

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ユーザーが🏗️ショートボタンをクリック                       │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. ブログ記事情報を受け取る                                   │
│    └─ タイトル: 「滋賀県でホームページ制作」                  │
│    └─ カテゴリ: web-design, regional                        │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. 既存RAGをハイブリッド検索（5秒）⚡                         │
│    ├─ hybrid_deep_research RAG 検索                         │
│    │   └─ クエリ: "AI website builder automation 2025"     │
│    │   └─ 結果: 5件（score: 0.82）← 十分な関連度！          │
│    │                                                         │
│    ├─ hybrid_scraped_keywords RAG 検索                      │
│    │   └─ クエリ: "homepage creation trends"               │
│    │   └─ 結果: 3件（score: 0.79）← 十分！                 │
│    │                                                         │
│    ├─ fragment_vectors RAG 検索（ブログ記事）                │
│    │   └─ 結果: 2件（score: 0.85）← 意味の接続用            │
│    │                                                         │
│    └─ personal_story_rag RAG 検索（Kenjiのトーン）           │
│        └─ 結果: 1件（score: 0.88）← トーン抽出用            │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. スコア判定（条件分岐）                                     │
│                                                              │
│    ✅ ディープリサーチRAG score >= 0.75                      │
│    └─ 既存データで十分 → Phase 5へ                          │
│                                                              │
│    ❌ ディープリサーチRAG score < 0.75                       │
│    └─ 新規リサーチ必要 → Phase 4-B へ                       │
└─────────────────────────────────────────────────────────────┘
    ↓ (score >= 0.75の場合)
┌─────────────────────────────────────────────────────────────┐
│ 5. フックパターンRAG検索（5秒）⚡                             │
│    └─ viral_hook_patterns 検索                              │
│    └─ 最適フックパターン選択                                 │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. GPT-5で台本生成（20秒）⚡                                  │
│    ├─ 既存RAGデータを使用                                    │
│    ├─ フック最適化                                          │
│    ├─ 専門用語→日常語変換                                   │
│    └─ CTA追加                                               │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. company_youtube_shorts に保存                             │
└─────────────────────────────────────────────────────────────┘

⚡ 総所要時間: 約30秒（高速！）
```

---

## 🔄 Phase 4-B: 新規リサーチが必要な場合

```
┌─────────────────────────────────────────────────────────────┐
│ 4-B. 新規ディープリサーチ実行（3-5分）💰                      │
│    ├─ トピック生成                                          │
│    ├─ DeepSeek V3使用                                        │
│    ├─ Tavily API使用                                         │
│    ├─ 海外ソース優先                                         │
│    └─ hybrid_deep_research に保存（RAGとして蓄積）           │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│ 4-C. 新規スクレイピング実行（1-2分）💰                        │
│    ├─ Google検索（top 10）                                  │
│    ├─ Brave MCP使用                                          │
│    ├─ Puppeteer MCP使用                                      │
│    └─ hybrid_scraped_keywords に保存（RAGとして蓄積）        │
└─────────────────────────────────────────────────────────────┘
    ↓
(Phase 5へ)

💰 総所要時間: 約4-7分（遅いがデータ蓄積）
```

---

## 📊 実行パターンの比較

### パターンA: 既存RAGで十分（85%のケース）

```
実行時間: 約30秒 ⚡
コスト: $0.05（GPT-5のみ）
RAG検索:
├─ hybrid_deep_research (既存) ✅
├─ hybrid_scraped_keywords (既存) ✅
├─ fragment_vectors (既存) ✅
└─ personal_story_rag (既存) ✅
```

### パターンB: 新規リサーチ必要（15%のケース）

```
実行時間: 約4-7分 🐢
コスト: $1.50（DeepSeek + Tavily + Scraping + GPT-5）
新規実行:
├─ ディープリサーチ 💰
├─ スクレイピング 💰
└─ hybrid_deep_research / hybrid_scraped_keywords に保存
```

---

## 🎯 RAG検索の優先順位

### 1. ディープリサーチRAG（90%の重要度）

```typescript
const deepResearchResults = await supabase
  .from('hybrid_deep_research')
  .select('*')
  .textSearch('fts', query)
  .order('authority_score', { ascending: false })
  .limit(5);

// スコア判定
if (deepResearchResults.similarity_score >= 0.75) {
  // 既存データ使用 ✅
  return deepResearchResults;
} else {
  // 新規リサーチ実行 💰
  return await performNewDeepResearch(topic);
}
```

### 2. スクレイピングRAG（補助的）

```typescript
const scrapedResults = await supabase
  .from('hybrid_scraped_keywords')
  .select('*')
  .textSearch('fts', query)
  .limit(3);

// スコア問わず使用（補助情報）
```

### 3. ブログ記事RAG（1%の接続用）

```typescript
const blogResults = await supabase
  .from('fragment_vectors')
  .select('*')
  .textSearch('fts', query)
  .limit(2);

// SEO用の意味の接続
```

### 4. パーソナルRAG（トーン抽出）

```typescript
const personalResults = await supabase
  .from('personal_story_rag')
  .select('*')
  .textSearch('fts', 'kenjiのトーン')
  .limit(1);

// Kenjiの語り口を抽出
```

---

## 💾 RAGへの保存戦略

### 新規リサーチ実行時のみ保存

```typescript
// 新規ディープリサーチを実行した場合
if (isNewResearch) {
  // hybrid_deep_research に保存
  await supabase.from('hybrid_deep_research').insert({
    research_topic: topic,
    content: researchResult.content,
    summary: researchResult.summary,
    key_findings: researchResult.keyFindings,
    source_urls: researchResult.sourceUrls,
    authority_score: researchResult.authorityScore,
    embedding: researchResult.embedding,
    metadata: {
      created_by: 'architect-short-v2',
      blog_post_id: postId,
      research_depth: 2,
      research_breadth: 4,
    }
  });
}

// 新規スクレイピング実行した場合
if (isNewScraping) {
  // hybrid_scraped_keywords に保存
  await supabase.from('hybrid_scraped_keywords').insert({
    keyword: keyword,
    url: url,
    title: title,
    content: content,
    meta_description: metaDescription,
    embedding: embedding,
  });
}
```

**→ RAGは蓄積型。使えば使うほど賢くなる**

---

## 📈 RAGの成長戦略

### 初期状態（リリース時）

```
hybrid_deep_research:        100件（既存データ）
hybrid_scraped_keywords:     500件（既存データ）
viral_hook_patterns:          50件（新規作成）
```

### 3ヶ月後（予想）

```
hybrid_deep_research:        150件（+50件追加）
hybrid_scraped_keywords:     700件（+200件追加）
viral_hook_patterns:         100件（+50件追加）

→ 新規リサーチ実行率: 15% → 5%に低下
→ 平均生成時間: 30秒（高速化）
```

### 6ヶ月後（予想）

```
hybrid_deep_research:        200件（+100件追加）
hybrid_scraped_keywords:    1000件（+500件追加）
viral_hook_patterns:         150件（+100件追加）

→ 新規リサーチ実行率: 5% → 2%に低下
→ 平均生成時間: 25秒（さらに高速化）
→ RAGがほぼすべてをカバー
```

**→ 時間とともに高速化・高品質化**

---

## ⚡ パフォーマンス最適化

### 並列検索（高速化）

```typescript
// 4つのRAGを並列検索
const [deepResearch, scraped, blog, personal] = await Promise.all([
  searchDeepResearchRAG(query),
  searchScrapedRAG(query),
  searchBlogRAG(query),
  searchPersonalRAG(query),
]);

// 5秒以内に完了 ⚡
```

### キャッシュ戦略

```typescript
// 同じトピックは24時間キャッシュ
const cacheKey = `architect-short-${blogPostId}`;
const cached = await redis.get(cacheKey);

if (cached) {
  // キャッシュヒット（1秒以内）⚡⚡⚡
  return cached;
}
```

---

## 🎯 まとめ

### ✅ 正しいアプローチ

```
1. まず既存RAGを検索（5秒）⚡
2. 既存データで十分なら即生成（85%）
3. 不十分な場合のみ新規リサーチ（15%）
4. 新規データはRAGに蓄積
5. 使えば使うほど高速化
```

### ❌ 間違ったアプローチ（私の初期説明）

```
1. 毎回新規ディープリサーチ実行 ← 遅い、高い
2. hybrid_deep_research に保存
3. 既存RAGを使わない ← もったいない
```

---

**修正者:** AI Assistant  
**修正日:** 2025-12-12 02:45  
**重要度:** 最重要

