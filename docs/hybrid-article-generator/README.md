# 🚀 ハイブリッド記事生成システム

## 概要

Google検索で上位を獲得する「網羅記事（〇選・おすすめ）」と、AI検索（AIO）で引用される「一次情報・ベクトルリンク記事」を融合した**最強のハイブリッド記事生成システム**。

## 🎯 目的

- **Google検索**: スクレイピングキーワード網羅で上位表示
- **AI検索（AIO）**: Fragment ID + ベクトルリンク化で引用獲得
- **E-E-A-T**: 自社RAGの一次情報で権威性強化
- **資産化**: 全コンテンツが自社RAGに蓄積
- **「私は」視点**: AIアーキテクトとしての一次情報を必ず含める

## ⚠️ 重要な設計原則

1. **既存の記事生成機能（/api/generate-rag-blog）に一切影響を与えない**
2. **既存の高度な機能（エンティティ、構造化データ、AI検索最適化、ベクトルリンク）を完全再利用**
3. **生成記事は既存の自社RAG（company_vectors, fragment_vectors）に格納**
4. **新規テーブルはスクレイピング・ディープリサーチデータ専用**

---

## 📊 テーブル構成

```
┌─────────────────────────────────────────────────────────────────┐
│                    テーブル構成（最終版）                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  【新規作成】スクレイピング・ディープリサーチ専用                │
│  ├── hybrid_scraped_keywords   ← スクレイピングキーワード用     │
│  └── hybrid_deep_research      ← ディープリサーチ結果用         │
│                                                                 │
│  【既存使用】生成記事の自社RAG保存（変更なし）                   │
│  ├── company_vectors           ← 記事全体ベクトル               │
│  ├── fragment_vectors          ← Fragment ID別ベクトル          │
│  └── posts                     ← 記事本体                       │
│                                                                 │
│  【既存使用】パーソナルRAG（「私は」視点）★必須                 │
│  ├── kenji_harada_architect_knowledge  ← AIアーキテクト思想     │
│  └── personal_story_rag                ← 個人ストーリー         │
│                                                                 │
│  【既存使用】その他RAG                                          │
│  ├── trend_vectors             ← トレンド情報（使い捨て型）     │
│  └── youtube_vectors           ← YouTube情報（使い捨て型）      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 システムフロー

```
┌─────────────────────────────────────────────────────────────────┐
│            ハイブリッド記事生成システム 完全フロー                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   📍 入力                                                       │
│   ├── メインキーワード: 「AIリスキリング おすすめ」              │
│   └── サブキーワード:   「ホームページ制作」                     │
│                                                                 │
│                        ↓                                        │
│                                                                 │
│   ❶ スクレイピング A (Brave + Puppeteer MCP)                    │
│   ├── 「AIリスキリング おすすめ」で上位10サイト取得              │
│   ├── 除外: 広告、個人、芸能人、プレスリリース、                 │
│   │         Yahoo!ニュース、楽天、アマゾン                       │
│   ├── H1/H2/H3/本文キーワード抽出                               │
│   └── → hybrid_scraped_keywords テーブル（新規）に保存          │
│                                                                 │
│                        ↓                                        │
│                                                                 │
│   ❷ スクレイピング B (Brave + Puppeteer MCP)                    │
│   ├── 「ホームページ制作」で上位10サイト取得                     │
│   ├── H1/H2/H3/本文キーワード抽出                               │
│   └── → hybrid_scraped_keywords テーブル（新規）に保存          │
│                                                                 │
│                        ↓                                        │
│                                                                 │
│   ❸ ディープリサーチ A (Deep Research MCP / Tavily)             │
│   ├── テーマに応じたリサーチプロンプト自動生成                   │
│   ├── 過去1か月以内の最新情報収集                               │
│   ├── 権威性ある情報源（E-E-A-T基準）                           │
│   └── → hybrid_deep_research テーブル（新規）に保存             │
│                                                                 │
│                        ↓                                        │
│                                                                 │
│   ❹ ディープリサーチ B (Deep Research MCP / Tavily)             │
│   ├── 別角度からのリサーチプロンプト自動生成                     │
│   └── → hybrid_deep_research テーブル（新規）に保存             │
│                                                                 │
│                        ↓                                        │
│                                                                 │
│   ❺ ハイブリッドRAG検索（記事生成用コンテキスト収集）            │
│   ├── hybrid_scraped_keywords（スクレイピングキーワード）        │
│   ├── hybrid_deep_research（ディープリサーチ結果）               │
│   ├── company_vectors（自社一次情報）                           │
│   ├── kenji_harada_architect_knowledge（「私は」視点）★必須    │
│   └── personal_story_rag（個人ストーリー）                      │
│                                                                 │
│                        ↓                                        │
│                                                                 │
│   ❻ 記事生成 (GPT-5 mini)                                       │
│   ├── システムプロンプト適用                                    │
│   ├── スクレイピングキーワード網羅（❶❷）                        │
│   ├── ディープリサーチ情報活用（❸❹）                            │
│   ├── 「私は」AIアーキテクト視点（❺）★一次情報として必須       │
│   └── 20,000〜40,000字生成                                      │
│                                                                 │
│                        ↓                                        │
│                                                                 │
│   ❼ DB保存                                                      │
│   └── posts テーブル（既存）                                    │
│                                                                 │
│                        ↓                                        │
│                                                                 │
│   ❽ ベクトル化（既存関数再利用）                                │
│   ├── company_vectors（既存）← 記事全体                         │
│   └── fragment_vectors（既存）← Fragment ID別                   │
│                                                                 │
│                        ↓                                        │
│                                                                 │
│   ❾ 構造化データ・エンティティ・AI検索最適化（既存関数再利用）   │
│   ├── UnifiedStructuredDataSystem                               │
│   ├── HowToFAQSchemaSystem                                      │
│   ├── generateBlogFAQEntities                                   │
│   ├── generateBlogSectionEntities                               │
│   └── generateCompleteAIEnhancedUnifiedPageData                 │
│                                                                 │
│                        ↓                                        │
│                                                                 │
│   ❿ H2図解自動生成（既存関数再利用）                            │
│   └── generateH2DiagramsAuto（ナノバナナプロ）                  │
│                                                                 │
│                        ↓                                        │
│                                                                 │
│   📤 出力                                                       │
│   ├── posts テーブルに保存済み                                  │
│   ├── company_vectors に記事全体ベクトル保存済み                │
│   ├── fragment_vectors にFragment ID別ベクトル保存済み          │
│   └── 公開 URL 発行                                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 使用するMCP・API

| MCP/API | 用途 | 必要なAPIキー |
|---------|------|--------------|
| **Brave MCP** | URL検索（上位10サイト取得） | BRAVE_API_KEY |
| **Puppeteer MCP** | H1/H2/H3/キーワード抽出 | なし |
| **Deep Research MCP** | ディープリサーチ | TAVILY_API_KEY |
| **GPT-5 mini** | 記事本文生成 | OPENAI_API_KEY |
| **Gemini (ナノバナナプロ)** | H2図解生成 | GOOGLE_AI_API_KEY |

---

## 🔗 既存システムとの関係

### 既存の記事生成API（変更なし）

```
/api/generate-rag-blog/route.ts
├── 一次情報ベースの専門記事生成
├── company_vectors, trend_vectors, youtube_vectors を使用
└── ★ 一切変更しない
```

### 新規ハイブリッド記事生成API（新規作成）

```
/api/generate-hybrid-blog/route.ts（新規）
├── スクレイピング + ディープリサーチ + 一次情報
├── hybrid_scraped_keywords, hybrid_deep_research を使用
├── kenji_harada_architect_knowledge（「私は」視点）を必須で使用
└── 既存の後処理関数を呼び出し
```

### RAGテーブルの使い分け

| テーブル | 用途 | 保存タイミング |
|---------|------|---------------|
| `hybrid_scraped_keywords` | スクレイピングキーワード | 記事生成**前** |
| `hybrid_deep_research` | ディープリサーチ結果 | 記事生成**前** |
| `company_vectors` | 生成記事全体 | 記事生成**後** |
| `fragment_vectors` | Fragment ID別 | 記事生成**後** |
| `kenji_harada_architect_knowledge` | 「私は」視点（参照のみ） | - |

---

## 📁 関連ドキュメント

- [TASKS.md](./TASKS.md) - 実装タスク一覧
- [SCRAPING-SPEC.md](./SCRAPING-SPEC.md) - スクレイピング仕様
- [DEEP-RESEARCH-SPEC.md](./DEEP-RESEARCH-SPEC.md) - ディープリサーチ仕様
- [PROMPT-TEMPLATES.md](./PROMPT-TEMPLATES.md) - プロンプトテンプレート
- [KEYWORD-COMBINATIONS.md](./KEYWORD-COMBINATIONS.md) - キーワード組み合わせ例

---

## 🗓️ 作成日

2025年12月10日

