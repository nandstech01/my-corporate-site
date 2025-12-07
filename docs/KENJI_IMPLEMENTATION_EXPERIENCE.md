# 原田賢治 実装経験データ（事実ベース）

## 📋 概要

このファイルは、原田賢治がこのプロジェクトで**実際に実装した**技術経験を記録します。
これらは**事実**であり、`kenji_harada_architect_knowledge` に登録して
AIアーキテクト型記事生成に活用します。

---

## 🏗️ 実装した技術スタック（事実）

### 1. Triple RAG システム

```
thought_category: implementation
thought_id: triple-rag-implementation

【実装概要】
Company RAG（自社コンテンツ）、Trend RAG（トレンドニュース）、YouTube RAG（動画）の
3つのRAGソースを統合したハイブリッド検索システムを設計・実装した。

【技術的特徴】
・ベクトル検索（pgvector 1536次元）+ BM25（全文検索）のハイブリッド
・RRF（Reciprocal Rank Fusion）による結果統合
・カテゴリ別の重み付けと関連性スコアリング

【実装の工夫】
・Company RAGは永続的に保持（知的資産化）
・Trend RAG・YouTube RAGは記事生成後に削除（使い捨てRAG設計）
・これにより著作権リスクを回避しつつ、最新情報を活用
```

### 2. Vector Link（ベクトルリンク）

```
thought_category: core-innovation
thought_id: vector-link-implementation

【実装概要】
Fragment ID（ディープリンク）とベクトル埋め込みを1対1で対応づける
「二層的リンク資産」を設計・実装した。

【技術的特徴】
・fragment_vectors テーブル（1536次元）
・完全URI + ベクトル埋め込み + メタデータの統合管理
・HNSWインデックスによる高速ベクトル検索

【AI検索最適化への貢献】
・Google AI Overviewsでの引用確率向上
・ChatGPT/Claude/Perplexityでの正確な参照を実現
・意味検索と位置指定の両立
```

### 3. 使い捨てRAG設計

```
thought_category: architecture-decision
thought_id: disposable-rag-design

【設計思想】
外部コンテンツ（ニュース、YouTube）を一時的にRAGとして活用し、
記事生成後に削除することで、著作権問題と情報鮮度を同時に解決。

【実装詳細】
・trend_vectors: 記事生成後に自動削除
・youtube_vectors: 記事生成後に自動削除
・company_vectors: 永続保持（自社資産）
・fragment_vectors: 永続保持（ベクトルリンク資産）

【ビジネス価値】
・法務リスクの軽減
・常に最新情報でのコンテンツ生成
・ストレージコストの最適化
```

### 4. kenji_harada_architect_knowledge（思想RAG）

```
thought_category: personal-branding
thought_id: thought-rag-implementation

【実装概要】
自分自身の思想・哲学をベクトル化し、コンテンツ生成に活用する
「Thought RAG」システムを設計・実装した。

【技術的特徴】
・text-embedding-3-large（3072次元）を採用
・thought_category, usage_context, tone, priorityによる多次元フィルタリング
・analogy（比喩）カテゴリによる説明力強化

【独自性】
・AIアーキテクトの思想を構造化して保存
・生成コンテンツに一貫した「原田賢治らしさ」を注入
・「AIが私を理解する」という哲学の実装
```

### 5. AI検索最適化（AIO）

```
thought_category: seo-innovation
thought_id: ai-search-optimization

【実装概要】
Schema.org 16.0+に準拠した構造化データを自動生成し、
AI検索エンジンに最適化されたコンテンツを出力する仕組みを実装した。

【技術的特徴】
・エンティティ統合（knowsAbout, mentions）
・Fragment ID強化
・日本語エンタープライズ対応

【対応AI検索エンジン】
・Google AI Overviews
・ChatGPT
・Claude
・Perplexity
```

### 6. 自動ブログ生成システム

```
thought_category: automation
thought_id: auto-blog-generation

【実装概要】
GPT-5 miniを活用した高品質な長文記事（5000-10000文字）の
自動生成システムを設計・実装した。

【技術的特徴】
・Triple RAGからのコンテキスト注入
・Fragment ID自動生成・挿入
・サムネイル自動配置
・構造化データ自動抽出
・内部リンク自動生成（セマンティック類似度ベース）

【コスト最適化】
・GPT-5 miniの採用により、品質を維持しつつコスト削減
・1記事あたりの生成コストを最小化
```

---

## 📊 市場価値との照合（Brave調査結果）

| 私の実装スキル | 市場で求められるスキル | 月額単価相場 |
|---------------|----------------------|-------------|
| Triple RAG | RAGアーキテクチャ設計 | 70-170万円 |
| Vector Link | ベクトルDB運用 | 75-120万円 |
| ハイブリッド検索 | BM25+Vector統合 | 80-100万円 |
| GPT-5 mini統合 | LLM統合開発 | 70-120万円 |
| 使い捨てRAG設計 | 法務リスク対応 | 付加価値高 |
| AI検索最適化 | AIO/LLMO | 新興分野 |

---

## 🎯 記事生成で使用する「私の経験」フレーズ

### 技術記事用

```
・「私がTriple RAGを設計した際に気づいたことは...」
・「ベクトルリンクを実装して分かったのは、意味と位置の両立が重要だということです」
・「使い捨てRAG設計により、著作権問題と情報鮮度を同時に解決できました」
・「3072次元のベクトル埋め込みを採用した理由は...」
```

### キャリア記事用

```
・「私自身、AIエンジニアとしての実装経験から、AIアーキテクトへと進化しました」
・「このプロジェクトで実装したRAGシステムは、市場で70-170万円/月の価値があります」
・「実装力を持った構造設計者として、『なぜ』と『どう』の両方を語れることが強みです」
・「AIアーキテクトになるには、まず実装経験を積むことが重要です」
```

---

## ✅ kenji_harada_architect_knowledge への登録データ案

### 登録予定データ（6件）

| thought_id | thought_title | thought_category | priority |
|------------|---------------|------------------|----------|
| triple-rag-implementation | Triple RAG実装経験 | implementation | 85 |
| vector-link-implementation | Vector Link実装経験 | core-innovation | 90 |
| disposable-rag-design | 使い捨てRAG設計 | architecture-decision | 80 |
| thought-rag-implementation | 思想RAG実装経験 | personal-branding | 75 |
| ai-search-optimization | AI検索最適化実装経験 | seo-innovation | 80 |
| auto-blog-generation | 自動ブログ生成実装経験 | automation | 70 |

---

*作成日: 2025-01-XX*
*このデータは原田賢治の実際の実装経験に基づく事実です*

