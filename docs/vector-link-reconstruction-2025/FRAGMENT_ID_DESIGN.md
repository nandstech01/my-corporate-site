# Fragment ID設計ガイド

## 📋 Fragment ID命名規則

### 基本原則
1. **小文字 + ハイフン区切り**: `section-name-detail`
2. **SEO最適化**: 意味のある英単語を使用
3. **一意性**: 全ページで一意（page_path + fragment_idの組み合わせ）
4. **短く明確**: 20文字以内を推奨

### 既存のカテゴリプレフィックス

| プレフィックス | 用途 | 例 |
|-------------|------|-----|
| `service-` | サービス紹介 | `service-ai-agents` |
| `faq-main-` | メインページFAQ | `faq-main-1` |
| `faq-tech-` | 技術FAQ（/faqページ） | `faq-tech-1` |
| `ai-site-` | AIサイト関連 | `ai-site-features` |
| `nands-` | NANDS固有 | `nands-ai-site` |

## 🎯 新セクションのFragment ID設計

### 1. ProblemSection（課題提起セクション）

**個人向け（2カード）**
- `problem-individual-ai-career`
  - タイトル: "2026年、そのコードはAIが1秒で書く"
  - リンク先: AIキャリア記事
  - 内容: AIエンジニアのキャリア変革
  
- `problem-individual-relevance`
  - タイトル: "AIは質問に答えるのではなく意図に応える"
  - リンク先: レリバンスエンジニアリング記事
  - 内容: レリバンスエンジニアリングの重要性

**法人向け（2カード）**
- `problem-corporate-vector-link`
  - タイトル: "RAGを入れたのに、なぜ御社のAIはバカなのか"
  - リンク先: ベクトルリンク記事
  - 内容: ベクトルリンクによる構造化の必要性
  
- `problem-corporate-ai-architect`
  - タイトル: "社員を雇うのではなくAIを構築する時代"
  - リンク先: AIアーキテクト記事
  - 内容: AIアーキテクトの重要性

**実装方法**: セクション全体に1つのID + 各カードに個別ID

### 2. PhilosophySection（原田賢治の哲学セクション）

- `philosophy-kenji-harada`
  - 内容: 原田賢治の哲学とRelevance Engineering
  - タイプ: author/philosophy
  - 重要度: 高（Trust Signals）

### 3. SolutionBentoGrid（ソリューションセクション）

**個人向け（2カード）**
- `solution-individual-step1`
  - タイトル: "STEP 1: Cursor 2.0 完全習得"
  - 内容: AIペアプログラミング
  
- `solution-individual-step2`
  - タイトル: "STEP 2: AIアーキテクト養成プログラム"
  - 内容: Vector Link、Mastra、MCP

**法人向け（2カード）**
- `solution-corporate-layer1`
  - タイトル: "LAYER 1: Brain 構造化基盤"
  - 内容: Vector Linkによるデータ再構築
  
- `solution-corporate-layer2`
  - タイトル: "LAYER 2-3: Agent & Output 業務自動化"
  - 内容: マーケティング自動化

### 4. PricingSection（料金セクション）

**個人向け（2カード）**
- `pricing-individual-main`
  - タイトル: "月額10,000円（生存戦略プラン）"
  - 内容: 個人向けメインプラン
  
- `pricing-individual-bonus`
  - タイトル: "裏カリキュラム（LINE限定特典）"
  - 内容: ボーナス特典

**法人向け（2カード）**
- `pricing-corporate-main`
  - タイトル: "実質1人1日333円"
  - 内容: 助成金活用プラン
  
- `pricing-corporate-support`
  - タイトル: "AIアーキテクト直接対応"
  - 内容: サポート内容

### 5. CTASection（行動喚起セクション）

**個人向け（2カード）**
- `cta-individual-line`
  - タイトル: "LINE限定 - 裏カリキュラム（無料配布中）"
  - CTA: LINE登録
  
- `cta-individual-consultation`
  - タイトル: "個別相談 - キャリア相談（無料）"
  - CTA: 無料相談申込

**法人向け（2カード）**
- `cta-corporate-technical`
  - タイトル: "技術相談 - AIアーキテクト（直接対応）"
  - CTA: 技術相談申込
  
- `cta-corporate-documents`
  - タイトル: "資料請求 - サービス資料（無料）"
  - CTA: 資料請求

### 6. ContactSection（お問い合わせセクション）

- `contact-form`
  - 内容: お問い合わせフォーム
  - タイプ: contact
  - 重要度: 中

### 7. FAQSection（新しいFAQ - 21個）

**既存の動的生成を維持**:
```typescript
faq-main-1  // AIアーキテクトとは何ですか？
faq-main-2  // Cursor 2.0とは何ですか？
faq-main-3  // MCP、Mastra Frameworkとは？
...
faq-main-21 // 資料請求はできますか？
```

**カテゴリ分類**:
- AIアーキテクト育成: 4個
- AIキャリア戦略: 3個
- 法人リスキリング: 4個
- AI駆動開発: 4個
- 料金・サポート: 3個

**削除対象の古いFAQ**: `faq-main-1` ~ `faq-main-8`（コンテンツが異なる）

## 📊 Fragment ID一覧（メインページ全体）

### ✅ 既存（維持） - 15個
```
service-system-development
service-aio-seo
service-chatbot-development
service-vector-rag
service-ai-side-business
service-hr-support
service-ai-agents
service-mcp-servers
service-sns-automation
service-video-generation
service-corporate-reskilling
service-individual-reskilling
nands-ai-site
ai-site-features
ai-site-technology
```

### 🆕 新規追加 - 18個
```
# ProblemSection
problem-individual-ai-career
problem-individual-relevance
problem-corporate-vector-link
problem-corporate-ai-architect

# PhilosophySection
philosophy-kenji-harada

# SolutionBentoGrid
solution-individual-step1
solution-individual-step2
solution-corporate-layer1
solution-corporate-layer2

# PricingSection
pricing-individual-main
pricing-individual-bonus
pricing-corporate-main
pricing-corporate-support

# CTASection
cta-individual-line
cta-individual-consultation
cta-corporate-technical
cta-corporate-documents

# ContactSection
contact-form
```

### 🔄 更新 - 21個
```
faq-main-1 ~ faq-main-21  # 新しいFAQコンテンツで再ベクトル化
```

## 合計: 54個のFragment ID

- 既存維持: 15個
- 新規追加: 18個
- 更新: 21個

## 🎯 実装優先度

### Phase 1（最優先）
1. FAQSection: 21個（動的生成済み、ベクトル化のみ）
2. ProblemSection: 4個（SEO最重要）

### Phase 2（高優先度）
3. PhilosophySection: 1個（Trust Signals）
4. PricingSection: 4個（コンバージョン直結）

### Phase 3（中優先度）
5. SolutionBentoGrid: 4個
6. CTASection: 4個
7. ContactSection: 1個

## 🔗 Complete URI形式

```
https://nands.tech/#problem-individual-ai-career
https://nands.tech/#philosophy-kenji-harada
https://nands.tech/#pricing-corporate-main
https://nands.tech/#faq-main-5
```

## ⚠️ 注意事項

1. **既存IDとの衝突回避**
   - `/faq`ページの`faq-tech-*`と区別
   - `/posts/`ページの`author-profile`と区別

2. **SEO構造維持**
   - Fragment IDはSEOに直接影響しない
   - 構造化データ（hasPart）での記述が重要

3. **モード切替対応**
   - 個人/法人で異なるFragment IDを使用
   - AnimatePresenceで動的切替

4. **ベクトルリンク完全性**
   - HTML: `<div id="xxx">`
   - DB: `fragment_vectors`テーブル
   - 構造化データ: `hasPart`スキーマ
   の三位一体を維持

