# AIアーキテクト記事生成モード実装計画書

## 📋 概要

既存の高品質なブログ生成システム（教育・情報提供型）を**100%維持**しつつ、
新たに「AIアーキテクト型」記事生成モードを追加する。

生成時にモードを切り替え可能にし、生徒向けキャリア記事と高単価案件獲得用記事を並行生成できるようにする。

---

## ✅ 実装完了状況

### Phase 1: データ準備 ✅

- [x] **Task 1.1**: kenji_harada_architect_knowledge にビジネス戦略データを追加
  - [x] `triple-rag-implementation` - Triple RAG実装経験
  - [x] `vector-link-implementation` - Vector Link実装経験
  - [x] `disposable-rag-design` - 使い捨てRAG設計
  - [x] `thought-rag-implementation` - 思想RAG実装経験
  - [x] `ai-search-optimization-impl` - AI検索最適化実装経験
  - [x] `auto-blog-generation-impl` - 自動ブログ生成実装経験

- [ ] **Task 1.2**: 新データのベクトル化（後日実行）
  - vectorization_status: 'pending' で登録済み
  - 次回の定期バッチでベクトル化される

### Phase 2: RAGクエリ定義 ✅

- [x] **Task 2.1**: `/lib/intelligent-rag/architect-trend-queries.ts` 作成
  - [x] `career_income` - キャリア・年収系クエリ
  - [x] `career_path` - キャリアパス・学習系クエリ
  - [x] `freelance_acquisition` - 案件獲得・フリーランス系クエリ
  - [x] `technical_challenges` - 技術的Pain Point系クエリ
  - [x] `ai_search_optimization` - AI検索・次世代SEO系クエリ

- [ ] **Task 2.2**: YouTube RAG architect用チャンネルリスト追加（後日対応）

### Phase 3: プロンプト設計 ✅

- [x] **Task 3.1**: `/lib/prompts/architect/architect-blog-base.ts` 作成
  - [x] `getArchitectBlogPrompt()` - メインプロンプト関数
  - [x] `getArticleTypeGuidance()` - 記事タイプ別ガイダンス
  - [x] `getKenjiThoughtSearchQueries()` - Kenji Thought RAG検索クエリ

### Phase 4: API拡張 ✅

- [x] **Task 4.1**: `/api/generate-rag-blog/route.ts` モード分岐追加
  - [x] `generationMode` パラメータ追加（デフォルト: 'education'）
  - [x] `articleType` パラメータ追加（デフォルト: 'general'）
  - [x] モードに応じたトレンドクエリ切り替え
  - [x] AIアーキテクトモード用のペルソナ設定

- [x] **Task 4.2**: Kenji Thought RAG検索統合
  - [x] `kenji_harada_architect_knowledge` から思想データを取得
  - [x] 実装経験系カテゴリを優先フィルタリング
  - [x] プロンプトへの自然な注入

### Phase 5: 管理画面UI ✅

- [x] **Task 5.1**: モード切り替えUI追加
  - [x] 「📚 教育・情報提供」「🏗️ AIアーキテクト」の2モードタブ
  - [x] AIアーキテクトモード時の記事タイプ選択
  - [x] 各モードの説明表示

### Phase 6: テスト・検証 ⏳

- [ ] **Task 6.1**: 既存機能の回帰テスト
- [ ] **Task 6.2**: architect モードテスト

---

## 📁 新規作成・変更ファイル

### 新規作成

```
/lib/intelligent-rag/
└── architect-trend-queries.ts    # AIアーキテクト用トレンドクエリ

/lib/prompts/architect/
└── architect-blog-base.ts        # AIアーキテクト用プロンプト

/docs/
├── ARCHITECT_MODE_IMPLEMENTATION.md  # 本ドキュメント
├── AI_ARCHITECT_MARKET_RESEARCH.md   # 市場調査結果
├── KENJI_IMPLEMENTATION_EXPERIENCE.md # 実装経験データ
└── KENJI_THOUGHT_DATA_COLLECTION.md  # 質問テンプレート（参考）
```

### 変更

```
/app/api/generate-rag-blog/route.ts
  - BlogGenerationRequest インターフェースに generationMode, articleType 追加
  - モードに応じたトレンドクエリ切り替えロジック
  - Kenji Thought RAG 検索・注入ロジック
  - モード別ライターペルソナ設定

/app/admin/content-generation/page.tsx
  - BlogGenerationForm インターフェースに generationMode, articleType 追加
  - モード切り替えタブUI
  - 記事タイプ選択UI（AIアーキテクトモード時）
```

---

## 🎯 使い方

### 管理画面での操作

1. `/admin/content-generation` にアクセス
2. 「RAGブログ記事生成」セクションを開く
3. **生成モード選択** で希望のモードをクリック：
   - 📚 **教育・情報提供**: 従来通りのAIツール紹介記事
   - 🏗️ **AIアーキテクト**: キャリア・年収・案件獲得記事

4. AIアーキテクトモードの場合、**記事タイプ**を選択：
   - 💼 **キャリア・年収**: 年収相場、キャリアパス
   - ⚙️ **技術課題**: RAG実装、痛点解決
   - 🚀 **フリーランス**: 案件獲得、単価交渉
   - 📊 **総合**: バランス型記事

5. 通常通りクエリを入力し、記事を生成

### API直接呼び出し

```typescript
// 教育モード（既存動作）
fetch('/api/generate-rag-blog', {
  method: 'POST',
  body: JSON.stringify({
    query: 'ChatGPTの最新機能',
    ragData: [...],
    targetLength: 7000,
    businessCategory: 'fukugyo',
    categorySlug: 'ai-tools',
    includeImages: true,
    autoFetchTrends: true,
    generationMode: 'education',  // または省略（デフォルト）
  })
});

// AIアーキテクトモード
fetch('/api/generate-rag-blog', {
  method: 'POST',
  body: JSON.stringify({
    query: 'AIエンジニアの年収と将来性',
    ragData: [...],
    targetLength: 7000,
    businessCategory: 'fukugyo',
    categorySlug: 'career-change',
    includeImages: true,
    autoFetchTrends: true,
    generationMode: 'architect',
    articleType: 'career',
  })
});
```

---

## 📊 データソース設計

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  教育モード（generationMode: 'education'）                                       │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                 │
│   Brave Search → blog-trend-queries.ts のクエリ                                                                 │
│   ・AIツール紹介、使い方ガイド、最新トレンド解説                                                                 │
│                                                                                                                 │
│   Company RAG → 自社コンテンツ                                                                                  │
│   Fragment Vectors → ベクトルリンク                                                                             │
│                                                                                                                 │
│   ※Kenji Thought RAG は使用しない                                                                               │
│                                                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  AIアーキテクトモード（generationMode: 'architect'）                             │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                 │
│   Brave Search → architect-trend-queries.ts のクエリ                                                            │
│   ・年収相場、キャリアパス、案件獲得、技術課題                                                                   │
│                                                                                                                 │
│   Company RAG → 自社コンテンツ                                                                                  │
│   Fragment Vectors → ベクトルリンク                                                                             │
│                                                                                                                 │
│   🧠 Kenji Thought RAG → kenji_harada_architect_knowledge                                                       │
│   ・Triple RAG実装経験                                                                                          │
│   ・Vector Link実装経験                                                                                         │
│   ・使い捨てRAG設計                                                                                             │
│   ・AI検索最適化実装経験                                                                                        │
│   ・ミッションステートメント                                                                                     │
│   ・AIアーキテクトの役割                                                                                        │
│                                                                                                                 │
│   → 記事に「私がTriple RAGを設計した際に...」などの一人称経験を注入                                               │
│                                                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔒 リスク管理

### 既存機能への影響

1. **デフォルト値設定で100%互換**
   - `generationMode` のデフォルトは `'education'`
   - パラメータ未指定時は従来通りの動作

2. **コード分離**
   - 新機能は新ファイル（`architect-trend-queries.ts`, `architect-blog-base.ts`）
   - 既存ファイルへの変更はif文による分岐追加のみ

3. **嘘をつかない設計**
   - Kenji Thought RAG には**実際の実装経験**のみ登録
   - 市場データ（年収等）は Brave Search でリアルタイム取得
   - 「やったことがないこと」は書かない

---

*実装完了日: 2025年1月*
*作成者: AIアーキテクト 原田賢治 + Cursor AI*
