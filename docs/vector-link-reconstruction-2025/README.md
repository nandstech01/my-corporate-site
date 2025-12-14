# ベクトルリンク再構築プロジェクト 2025

## 📋 プロジェクト概要

トップページ大幅リニューアル（Gateway、Apple風デザイン、Netflix風カテゴリ等）に伴い、**ベクトルリンクシステム**（Fragment ID + ベクトルDB + 構造化データの三位一体）を再構築します。

## 🎯 最重要原則

### ✅ 絶対に守ること
1. **SEO構造を100%維持**
   - GatewayのH1/H2構造
   - 既存の構造化データ（VideoObject、hasPartスキーマ等）
   - メタデータ・OGP情報
2. **既存機能への影響ゼロ**
   - DBのブログ機能
   - 記事投稿・編集機能
   - YouTube動画管理機能
   - company_vectorsテーブル
   - fragment_vectorsの他ページ（/posts/*, /faq, /about等）
3. **ベクトルリンクの完全性**
   - Fragment ID（HTML）
   - ベクトルDB（fragment_vectors）
   - 構造化データ（hasPart スキーマ）
   の三位一体を維持

### ❌ 絶対にやらないこと
- 既存のfragment_vectorsテーブル構造の変更
- company_vectorsテーブルへの影響
- 他ページ（/posts/*, /faq等）のFragment IDへの影響
- ブログ投稿・編集機能への影響

## 📊 現状分析（2025年12月14日時点）

### ✅ 完璧に維持されているFragment ID（15個）

| Fragment ID | HTML | DB | 構造化データ | 状態 |
|-------------|:----:|:--:|:----------:|:----:|
| `service-system-development` | ✅ | ✅ | ✅ | **完璧** |
| `service-aio-seo` | ✅ | ✅ | ✅ | **完璧** |
| `service-chatbot-development` | ✅ | ✅ | ✅ | **完璧** |
| `service-vector-rag` | ✅ | ✅ | ✅ | **完璧** |
| `service-ai-side-business` | ✅ | ✅ | ✅ | **完璧** |
| `service-hr-support` | ✅ | ✅ | ✅ | **完璧** |
| `service-ai-agents` | ✅ | ✅ | ✅ | **完璧** |
| `service-mcp-servers` | ✅ | ✅ | ✅ | **完璧** |
| `service-sns-automation` | ✅ | ✅ | ✅ | **完璧** |
| `service-video-generation` | ✅ | ✅ | ✅ | **完璧** |
| `service-corporate-reskilling` | ✅ | ✅ | ✅ | **完璧** |
| `service-individual-reskilling` | ✅ | ✅ | ✅ | **完璧** |
| `nands-ai-site` | ✅ | ✅ | ✅ | **完璧** |
| `ai-site-features` | ✅ | ✅ | ✅ | **完璧** |
| `ai-site-technology` | ✅ | ✅ | ✅ | **完璧** |

**アクション**: そのまま維持 ✅

### ⚠️ 再構築が必要なFragment ID（8個）

| Fragment ID | HTML | DB | 構造化データ | 問題 |
|-------------|:----:|:--:|:----------:|:-----|
| `faq-main-1` | ❌ | ✅ | ✅ | 古いFAQコンテンツ（8個）がDBに残存 |
| `faq-main-2` ~ `faq-main-8` | ❌ | ✅ | ✅ | 新しいFAQ（21個）に入れ替わった |

**アクション**: 
1. 古い8個を削除
2. 新しい21個を追加

### ❌ 未実装のFragment ID（新セクション）

以下のセクションには**Fragment IDが存在しない**：

| セクション | コンポーネント | Fragment ID候補 | 優先度 |
|-----------|-------------|---------------|--------|
| ProblemSection | `app/components/portal/ProblemSection.tsx` | 未定 | 🔥 **最高** |
| PhilosophySection | `app/components/portal/PhilosophySection.tsx` | 未定 | 🔥 **最高** |
| SolutionBentoGrid | `app/components/portal/SolutionBentoGrid.tsx` | 未定 | ⚠️ 高 |
| PricingSection | `app/components/portal/PricingSection.tsx` | 未定 | ⚠️ 高 |
| CTASection | `app/components/portal/CTASection.tsx` | 未定 | ⚠️ 中 |
| ContactSection | `app/components/portal/ContactSection.tsx` | 未定 | ⚠️ 中 |

**アクション**: Fragment IDを設計・実装してからベクトル化

## 🚀 実装計画

### Phase 0: 準備（現在）
- [x] 現状分析完了
- [x] ドキュメント作成
- [ ] 実装タスク定義
- [ ] リスク評価

### Phase 1: Fragment ID設計
- [ ] 新セクションのFragment ID命名規則を決定
- [ ] コンポーネントへのFragment ID追加計画
- [ ] 構造化データ統合計画

### Phase 2: Fragment ID実装
- [ ] 各コンポーネントにFragment IDを追加
- [ ] `app/structured-data.tsx`を更新
- [ ] `unified-integration.ts`のマッピング更新

### Phase 3: ベクトル化APIの修正
- [ ] `app/api/vectorize-main-page-fragments/route.ts`を更新
- [ ] 新しいFragment定義を追加
- [ ] 古いFAQを削除

### Phase 4: ベクトルDB更新
- [ ] 古い8個のFAQを削除（`DELETE WHERE fragment_id IN ('faq-main-1', ...)`）
- [ ] 新しいFragment IDをベクトル化
- [ ] 検証・テスト

### Phase 5: 検証
- [ ] Fragment ID → HTML存在確認
- [ ] ベクトルDB → 全Fragment登録確認
- [ ] 構造化データ → hasPart完全性確認
- [ ] SEO構造 → H1/H2階層確認
- [ ] 既存機能 → ブログ・YouTube機能確認

## 📁 関連ファイル

### コアファイル（絶対に破壊しない）
```
lib/structured-data/
├── index.ts                          # 構造化データヘルパー
├── entity-relationships.ts            # エンティティ関係性
├── haspart-schema-system.ts          # hasPartスキーマシステム
├── howto-faq-schema.ts               # FAQ構造化データ
├── schema-org-latest.ts              # Schema.org最新対応
└── unified-integration.ts            # 統一統合システム
```

### 修正対象ファイル
```
app/
├── page.tsx                          # メインページ（Fragment IDアンカー）
├── structured-data.tsx               # Fragment ID定義・構造化データ
└── components/portal/
    ├── ProblemSection.tsx            # Fragment ID追加必要
    ├── PhilosophySection.tsx         # Fragment ID追加必要
    ├── SolutionBentoGrid.tsx         # Fragment ID追加必要
    ├── PricingSection.tsx            # Fragment ID追加必要
    ├── CTASection.tsx                # Fragment ID追加必要
    ├── ContactSection.tsx            # Fragment ID追加必要
    └── FAQSection.tsx                # Fragment ID生成済み（動的）

app/api/vectorize-main-page-fragments/
└── route.ts                          # ベクトル化API（修正必要）

lib/vector/
├── fragment-vectorizer.ts            # ベクトル化ロジック（そのまま）
└── fragment-vector-store.ts          # ベクトルストア（そのまま）
```

## ⚠️ リスク管理

### 高リスク
1. **DBの既存Fragment削除**: `page_path = '/'`の条件を**必ず**指定
2. **構造化データの破損**: `app/structured-data.tsx`の既存部分を変更しない
3. **SEO構造の崩壊**: H1/H2階層、VideoObject等を維持

### 中リスク
4. **新Fragment IDの命名衝突**: 既存ID（`faq-tech-*`, `faq-pricing-*`等）と重複しない
5. **ベクトル化API実行ミス**: テスト環境で検証してから本番実行

### 低リスク
6. **パフォーマンス影響**: ISR（30分）があるため影響は限定的

## 📝 実装ログ

### 2025-12-14
- プロジェクト開始
- 現状分析完了
- ドキュメント作成完了

## 🔗 関連ドキュメント

- [ベクトルリンクアーキテクチャ](./ARCHITECTURE.md)（作成予定）
- [Fragment ID設計ガイド](./FRAGMENT_ID_DESIGN.md)（作成予定）
- [実装チェックリスト](./IMPLEMENTATION_CHECKLIST.md)（作成予定）
- [テスト計画](./TEST_PLAN.md)（作成予定）

