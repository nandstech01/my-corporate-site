# 05. 構造化データ・Fragment ID戦略

> **AI検索エンジン最適化のための技術仕様**

---

## 📋 概要

### 現状
- **23個のベクトルリンク**が`fragment_vectors`テーブルに格納済み
- Mike King理論準拠の構造化データ（JSON-LD）実装済み
- Fragment ID最適化によるAI引用可能性の確保

### 新LPでの課題
- THE SWITCHによる動的コンテンツ切り替え
- Fragment IDの静的アンカーとの矛盾
- 構造化データの更新必要性

### 解決策
1. **Layer分離**: 動的コンテンツとFragment ID領域を分離
2. **Services Blueprint**: 折りたたみでFragment IDを保持
3. **JSON-LD更新**: 新しいセクション構造に対応

---

## 🔗 Fragment ID保持戦略

### 現在の23個のFragment ID

```typescript
// fragment_vectorsテーブルの内容
const FRAGMENT_IDS = {
  services: [
    'service-system-development',
    'service-aio-seo',
    'service-chatbot-development',
    'service-vector-rag',
    'service-ai-agents',
    'service-hr-support',
    'service-individual-reskilling',
    'service-corporate-reskilling',
    'service-ai-side-business',
    'service-mcp-servers',
    'service-sns-automation',
    'service-video-generation',
  ],
  faqs: [
    'faq-main-1', // NANDSの主要サービスについて
    'faq-main-2', // AI検索最適化について
    'faq-main-3', // Fragment IDシステムについて
    'faq-main-4', // ベクトルRAGシステムについて
    'faq-main-5', // AIエージェント開発について
    'faq-main-6', // 導入期間・費用について
    'faq-main-7', // サポート体制について
    'faq-main-8', // セキュリティ対策について
  ],
  sections: [
    'nands-ai-site',
    'ai-site-features',
    'ai-site-technology',
  ],
}
```

### 新規追加Fragment ID

```typescript
// 新LPで追加するFragment ID
const NEW_FRAGMENT_IDS = {
  philosophy: 'philosophy',           // 原田賢治セクション
  hero: 'hero',                       // ヒーローセクション
  knowledge: 'knowledge',             // ナレッジショーケース
  'services-blueprint': 'services-blueprint', // サービス一覧
}
```

### 配置ルール

```
┌────────────────────────────────────────────────────────────┐
│ Section 1-4: 動的コンテンツ（THE SWITCH領域）              │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ ❌ Fragment ID なし                                        │
│ ✅ 構造化データ（WebPageElement）で補完                    │
└────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────┐
│ Section 5: Philosophy                                       │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ ✅ Fragment ID: #philosophy                                 │
└────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────┐
│ Section 6: Services Blueprint                               │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ ✅ Fragment ID: #services-blueprint                         │
│ ✅ 23個の既存Fragment ID（折りたたみ内に配置）             │
│    - #service-system-development                            │
│    - #service-aio-seo                                       │
│    - ... (計23個)                                           │
└────────────────────────────────────────────────────────────┘
```

---

## 📄 JSON-LD更新仕様

### 1. Organization（更新）

```json
{
  "@context": "https://schema.org",
  "@type": ["Organization", "TechnologyCompany", "EducationalOrganization"],
  "@id": "https://nands.tech/#organization",
  "name": "株式会社エヌアンドエス",
  "alternateName": ["NANDS", "NANDS TECH", "エヌアンドエス"],
  "description": "AIアーキテクトによる企業OS設計とレリバンスエンジニアリングの専門企業。個人向けリスキリング研修、法人向けAI顧問サービスを提供。",
  "url": "https://nands.tech",
  "logo": "https://nands.tech/images/logo.png",
  "founder": {
    "@type": "Person",
    "@id": "https://nands.tech/#founder",
    "name": "原田賢治",
    "jobTitle": "AI Architect / Relevance Engineer",
    "knowsAbout": [
      "AI Architecture",
      "Vector Link",
      "Relevance Engineering",
      "RAG Construction",
      "Cursor 2.0",
      "Mastra Framework"
    ]
  },
  "knowsAbout": [
    "AI Architect",
    "Vector Link",
    "Relevance Engineering",
    "企業OS設計",
    "RAG構築",
    "AIリスキリング研修",
    "助成金対応研修"
  ],
  "makesOffer": [
    {
      "@type": "Offer",
      "name": "個人向けAIアーキテクト養成講座",
      "description": "Cursor 2.0、Vector Link、Mastra Frameworkを学ぶリスキリング講座",
      "price": "180000",
      "priceCurrency": "JPY",
      "category": "Education"
    },
    {
      "@type": "Offer",
      "name": "法人向け企業OS設計・AI顧問",
      "description": "ベクトルリンクによるデータ構造化と業務自動化AIの設計",
      "category": "Consulting"
    }
  ]
}
```

### 2. WebPage（新規追加・hasPartセマンティクス）

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://nands.tech/#webpage",
  "url": "https://nands.tech",
  "name": "NANDS TECH - AIアーキテクトによる企業OS設計",
  "description": "AIに使われるな。AIが使う「構造」を設計せよ。個人向けリスキリング、法人向け企業OS設計を提供。",
  "isPartOf": {
    "@id": "https://nands.tech/#website"
  },
  "about": {
    "@id": "https://nands.tech/#organization"
  },
  "mainEntity": {
    "@id": "https://nands.tech/#organization"
  },
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [
      "#hero h2",
      "#philosophy",
      ".solution-main"
    ]
  },
  "hasPart": [
    {
      "@type": "WebPageElement",
      "@id": "https://nands.tech/#hero",
      "name": "ヒーローセクション",
      "description": "AIに使われるな。AIが使う「構造」を設計せよ。",
      "cssSelector": "#hero"
    },
    {
      "@type": "WebPageElement",
      "@id": "https://nands.tech/#philosophy",
      "name": "フィロソフィー - Relevance Engineering",
      "description": "原田賢治によるAIアーキテクト思想の解説",
      "cssSelector": "#philosophy"
    },
    {
      "@type": "WebPageElement",
      "@id": "https://nands.tech/#services-blueprint",
      "name": "サービスアーキテクチャ",
      "description": "23のサービスと機能の構造化マップ",
      "cssSelector": "#services-blueprint"
    }
  ]
}
```

### 3. FAQPage（既存更新）

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": "https://nands.tech/#faq",
  "mainEntity": [
    {
      "@type": "Question",
      "@id": "https://nands.tech/#faq-main-1",
      "name": "NANDSの主要サービスは何ですか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "個人向けAIアーキテクト養成講座（Cursor 2.0、Vector Link、Mastra Framework習得）と、法人向け企業OS設計・AI顧問サービスを提供しています。"
      }
    },
    {
      "@type": "Question",
      "@id": "https://nands.tech/#faq-main-2",
      "name": "ベクトルリンク（Vector Link）とは何ですか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "ベクトルリンクとは、WebページのFragment IDとベクトル埋め込み（Embedding）を統合し、AI検索エンジンが特定のコンテンツを正確に引用できるようにする技術です。完全URI（ディープリンク）とセマンティック検索を両立させます。"
      }
    },
    {
      "@type": "Question",
      "@id": "https://nands.tech/#faq-main-3",
      "name": "AIアーキテクトとは何ですか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AIアーキテクトとは、単にコードを書くエンジニアではなく、社内データ構造（ベクトルリンク）と業務フロー全体を設計し、AIが自律的に稼働する「企業OS」を構築する専門職です。"
      }
    }
  ]
}
```

### 4. HowTo（新規追加・AI検索最適化）

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "@id": "https://nands.tech/#howto-architect",
  "name": "AIアーキテクトになるためのステップ",
  "description": "コーダーからAIアーキテクトへキャリアシフトするための実践的なステップ",
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Cursor 2.0を習得する",
      "text": "AIペアプログラミング環境であるCursor 2.0を使いこなし、AIと協働するワークフローを構築します。"
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Vector Linkを理解する",
      "text": "データの構造化手法であるVector Linkを学び、AIが理解できる形でコンテキストを設計します。"
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "Mastra Frameworkでエージェントを構築",
      "text": "自律型AIエージェントを構築するためのMastra Frameworkを使い、実践的なシステムを開発します。"
    },
    {
      "@type": "HowToStep",
      "position": 4,
      "name": "企業OSを設計する",
      "text": "習得した技術を統合し、業務自動化からマーケティング自動化まで一貫した企業OSを設計します。"
    }
  ],
  "totalTime": "PT6M",
  "tool": [
    {"@type": "HowToTool", "name": "Cursor 2.0"},
    {"@type": "HowToTool", "name": "Mastra Framework"},
    {"@type": "HowToTool", "name": "OpenAI Embeddings"}
  ]
}
```

---

## 🔄 ベクトルリンク更新手順

### 1. 新Fragment IDのベクトル化

新しいセクション（`#philosophy`等）を追加した後、以下のAPIを呼び出してベクトル化：

```bash
# 管理画面から実行
POST /api/vectorize-main-page-fragments
```

または管理画面（`/admin/company-rag`）から「メインページFragment IDをベクトル化」ボタンを押下。

### 2. fragment_vectorsテーブルの確認

```sql
SELECT fragment_id, complete_uri, content_type, content_title
FROM fragment_vectors
WHERE page_path = '/'
ORDER BY content_type, fragment_id;
```

### 3. 構造化データの検証

```bash
# Google Rich Results Test
npm run validate-structured-data

# または
npx ts-node scripts/validate-structured-data.ts
```

---

## 📊 H1/H2戦略

### セマンティック・サンドイッチ構造

```html
<header id="hero">
  <!-- SEO用H1（非表示） -->
  <h1 class="sr-only">
    NANDS TECH - AIアーキテクトによる企業OS設計とレリバンスエンジニアリング
  </h1>
  
  <!-- ブランドロゴ（視覚的） -->
  <div class="logo">NANDS TECH</div>
  
  <!-- 視覚的H1（実際はH2） -->
  <h2 class="hero-headline">
    AIに使われるな。<br>
    AIが使う「構造」を設計せよ。
  </h2>
</header>
```

### 検索エンジンへの影響

| 要素 | 役割 | 検索クエリ |
|-----|------|----------|
| H1（非表示） | 主題の明示 | 「NANDS TECH」「AIアーキテクト」 |
| H2（視覚的） | 感情訴求 | 「AI 使われる」「構造 設計」 |
| JSON-LD | エンティティ結合 | 「AIアーキテクトとは」「Vector Linkとは」 |

---

## 🎯 AI引用最適化チェックリスト

### Google AI Overviews対応
- [ ] `speakable`でキーセクションを指定
- [ ] `FAQPage`で定義文を提供
- [ ] `HowTo`でステップバイステップを提供
- [ ] Fragment IDで特定セクションへのディープリンク

### ChatGPT / Perplexity対応
- [ ] `knowsAbout`で専門領域を明示
- [ ] 独自用語（Vector Link, Relevance Engineering）の定義を記述
- [ ] 著者情報（原田賢治）を`founder`として関連付け

### Bing / Microsoft Copilot対応
- [ ] `Organization`スキーマの充実
- [ ] `sameAs`でソーシャルリンク
- [ ] 地域情報（滋賀県大津市）の明示

---

## 🔍 モニタリング

### deeplink_analyticsテーブル

Fragment IDがAI検索エンジンにどれだけ引用されているかを追跡：

```sql
SELECT 
  fragment_id,
  source_type,
  COUNT(*) as citations,
  MAX(created_at) as last_cited
FROM deeplink_analytics
WHERE page_path = '/'
GROUP BY fragment_id, source_type
ORDER BY citations DESC;
```

### 追跡すべき指標
1. **引用数（Citations）**: 各Fragment IDがAIに何回引用されたか
2. **引用元（Source）**: Google AI Overview / ChatGPT / Perplexity
3. **コンテキスト（Context）**: どのような質問で引用されたか

---

**次のドキュメント**: [06-implementation.md](./06-implementation.md) - 実装ガイド

