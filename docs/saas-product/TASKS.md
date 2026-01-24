# AI Search Optimizer SaaS - タスク管理

**最終更新**: 2026-01-20
**現在地**: Phase 8（sameAs + Author + マージ機能）完了
**次アクション**: Phase 5 実験（GSC検証）

---

## 現在のステータス

| Phase | 状態 | 備考 |
|-------|------|------|
| Phase 0-4 | ✅ 完了 | ベクトルリンク化・分析基盤 |
| Phase 5 | ⏳ **準備完了** | 実験開始待ち（GSC検証） |
| Phase 6 | ✅ 完了 | 運営管理画面 |
| Phase 7 | ✅ 完了 | Stripe課金統合 |
| Phase 8 | ✅ **完了** | sameAs + Author + マージ機能 |

**関連**: Carve-Out基盤 → [`/docs/carve-out/TASKS.md`](../carve-out/TASKS.md)

---

## 安全原則（必守）

```
✅ 許可:
- 新規ファイル作成（lib/clavi/*, app/clavi/*, app/api/clavi/*）
- 新規テーブル作成（clavi.* スキーマ内）

❌ 禁止:
- 既存ライブラリの変更（lib/vector/*, lib/structured-data/*）
- 既存APIの変更（/api/generate-*, /api/deep-research等）
- 既存テーブルの変更（public.*）
```

---

## 実装済みファイル一覧

### API（21ファイル）

| ファイル | 説明 |
|---------|------|
| `app/api/clavi/me/route.ts` | ユーザー情報取得 |
| `app/api/clavi/onboard/route.ts` | オンボーディング |
| `app/api/clavi/tenant/route.ts` | テナント情報（GET/PATCH/DELETE） |
| `app/api/clavi/switch-tenant/route.ts` | テナント切替 |
| `app/api/clavi/analyze/route.ts` | URL分析実行（Phase 8拡張） |
| `app/api/clavi/analyses/route.ts` | 分析一覧取得 |
| `app/api/clavi/results/[id]/route.ts` | 分析結果詳細 |
| `app/api/clavi/settings/route.ts` | テナント設定（GET/PATCH）（Phase 8） |
| `app/api/clavi/job-token/route.ts` | ジョブトークン発行 |
| `app/api/clavi/invitations/route.ts` | 招待作成・取消 |
| `app/api/clavi/invitations/accept/route.ts` | 招待受諾 |
| `app/api/clavi/members/route.ts` | メンバー一覧 |
| `app/api/clavi/members/[userId]/route.ts` | メンバー編集・削除 |
| `app/api/clavi/admin/tenants/route.ts` | 管理者:テナント一覧 |
| `app/api/clavi/admin/tenants/[id]/route.ts` | 管理者:テナント詳細 |
| `app/api/clavi/admin/jobs/route.ts` | 管理者:ジョブ監視 |
| `app/api/clavi/admin/stats/route.ts` | 管理者:システム統計 |
| `app/api/clavi/stripe/checkout/route.ts` | Stripe Checkout |
| `app/api/clavi/stripe/portal/route.ts` | Stripe Customer Portal |
| `app/api/clavi/stripe/subscription/route.ts` | サブスク情報取得 |
| `app/api/clavi/stripe/webhook/route.ts` | Stripe Webhook |

### フロントエンド（18ファイル）

| ファイル | 説明 |
|---------|------|
| `app/clavi/page.tsx` | ランディングページ |
| `app/clavi/login/page.tsx` | ログインページ |
| `app/clavi/layout.tsx` | 共通レイアウト |
| `app/clavi/context.tsx` | コンテキストプロバイダー |
| `app/clavi/dashboard/page.tsx` | ダッシュボード |
| `app/clavi/analyses/page.tsx` | 分析一覧 |
| `app/clavi/analyses/[id]/page.tsx` | 分析詳細 |
| `app/clavi/stats/page.tsx` | 統計ページ |
| `app/clavi/settings/page.tsx` | 設定ページ |
| `app/clavi/pricing/page.tsx` | 料金ページ |
| `app/clavi/subscription/page.tsx` | サブスク管理 |
| `app/clavi/subscription/success/page.tsx` | サブスク成功 |
| `app/clavi/admin/layout.tsx` | 管理画面レイアウト |
| `app/clavi/admin/page.tsx` | 管理ダッシュボード |
| `app/clavi/admin/tenants/page.tsx` | テナント管理 |
| `app/clavi/admin/tenants/[id]/page.tsx` | テナント詳細 |
| `app/clavi/admin/jobs/page.tsx` | ジョブ監視 |
| `app/clavi/admin/stats/page.tsx` | システム統計 |

### コンポーネント（15ファイル）

| ファイル | 説明 |
|---------|------|
| `components/clavi/ClaviHeader.tsx` | ヘッダー |
| `components/clavi/ClaviSidebar.tsx` | サイドバー |
| `components/clavi/AdminSidebar.tsx` | 管理者サイドバー |
| `components/clavi/AnalysesTable.tsx` | 分析テーブル |
| `components/clavi/AnalysesFilters.tsx` | フィルター |
| `components/clavi/NewAnalysisModal.tsx` | 新規分析モーダル |
| `components/clavi/Pagination.tsx` | ページネーション |
| `components/clavi/ScoreBar.tsx` | スコアバー |
| `components/clavi/JsonViewer.tsx` | JSON表示 |
| `components/clavi/StatsKpiCards.tsx` | KPIカード |
| `components/clavi/StatsDailyChart.tsx` | 日次推移グラフ |
| `components/clavi/StatsScoreChart.tsx` | スコア推移グラフ |
| `components/clavi/StatsDistribution.tsx` | スコア分布 |
| `components/clavi/SameAsInputForm.tsx` | sameAs入力フォーム（Phase 8） |
| `components/clavi/AuthorInputForm.tsx` | Author入力フォーム（Phase 8） |

### ライブラリ（20ファイル）

| ファイル | 説明 |
|---------|------|
| `lib/clavi/crawler.ts` | Webクローラー |
| `lib/clavi/fragment-vectorizer.ts` | OpenAI Embeddings統合 |
| `lib/clavi/semantic-analyzer.ts` | コサイン類似度計算 |
| `lib/clavi/topic-consistency-scorer.ts` | トピック一貫性スコア |
| `lib/clavi/internal-link-optimizer.ts` | ベクトル近傍検索 |
| `lib/clavi/content-improvement-advisor.ts` | Keep/Revise/Optimize |
| `lib/clavi/entity-extractor.ts` | OpenAI GPT-4エンティティ抽出 |
| `lib/clavi/schema-generator.ts` | Schema.org 16.0+ JSON-LD |
| `lib/clavi/admin-auth.ts` | 管理者認証 |
| `lib/clavi/types/crawler.ts` | クローラー型定義 |
| `lib/clavi/types/analysis.ts` | 分析型定義 |
| `lib/clavi/utils/heading-extractor.ts` | 見出し抽出 |
| `lib/clavi/utils/metadata-extractor.ts` | メタデータ抽出 |
| `lib/clavi/__tests__/fragment-vectorizer.test.ts` | テスト |
| `lib/clavi/__tests__/semantic-analyzer.test.ts` | テスト |
| `lib/clavi/__tests__/topic-consistency-scorer.test.ts` | テスト |
| `lib/clavi/__tests__/internal-link-optimizer.test.ts` | テスト |
| `lib/clavi/__tests__/content-improvement-advisor.test.ts` | テスト |
| `lib/clavi/__tests__/entity-extractor.test.ts` | テスト |
| `lib/clavi/__tests__/schema-generator.test.ts` | テスト |

### WordPress プラグイン

| ファイル | 説明 |
|---------|------|
| `wordpress-plugin/clavi-fragment-ids/clavi-fragment-ids.php` | Fragment ID自動生成 |
| `wordpress-plugin/clavi-fragment-ids/README.md` | プラグイン説明 |

---

## Phase 5: 最小実験（2週間）⏳ 準備完了

### 概要

nands.tech で以下を検証:
- Fragment ID の機能性
- JSON-LD の健全性（Rich Results Test 警告ゼロ）
- GSC 指標の非悪化（-10%以内）

### 対象ページ

| ページ | 群 | Fragment ID | JSON-LD |
|--------|---|-------------|---------|
| `/ai-agents` | A | ✅ | ✅ |
| `/faq` | A | ✅ | ✅ |
| `/system-development` | B | ✅ | ❌ |
| `/chatbot-development` | B | ✅ | ❌ |
| `/corporate` | C | ❌ | ❌ |

### 実験手順

```
Day 0: 事前準備
  - wp db export backup.sql
  - GSC 30日データ取得（5ページ分）

Day 1: プラグイン設置
  - wordpress-plugin/clavi-fragment-ids/ をWordPressに設置
  - 有効化・動作確認

Day 2-3: JSON-LD生成
  - npx ts-node scripts/phase5-generate-jsonld.ts --url [URL]
  - WordPressメタボックスに貼り付け
  - Rich Results Test 検証

Day 4: 最終確認
  - Fragment ID動作確認
  - GSC URL検査リクエスト

Day 5-18: KPI観測
  - Day 5, 12, 18: GSCデータ取得
  - Day 8, 12, 18: AIO手動観測（10クエリ）

Day 19: 合否判定
```

### 合格基準

| KPI | 基準 |
|-----|------|
| Rich Results Test | 警告ゼロ |
| Fragment ID | `#id` でジャンプ可能 |
| GSC 表示回数 | -10% 以内 |
| GSC クリック数 | -10% 以内 |

### ロールバック

GSC指標が10%以上悪化した場合:
1. JSON-LDを削除
2. プラグイン無効化
3. バックアップから復元（必要なら）

---

## Phase 6: 運営管理画面 ✅ 完了

**完了日**: 2026-01-18

### 実装内容

- 管理者認証（環境変数 `CLAVI_PLATFORM_ADMIN_EMAILS`）
- 管理ダッシュボード（KPI概要）
- テナント管理（一覧・詳細・編集）
- ジョブ監視（ステータスフィルタ）
- システム統計（期間別グラフ）

---

## Phase 7: Stripe課金統合 ✅ 完了

**完了日**: 2026-01-18

### 実装内容

| 機能 | ファイル |
|------|---------|
| Checkout Session作成 | `app/api/clavi/stripe/checkout/route.ts` |
| Customer Portal | `app/api/clavi/stripe/portal/route.ts` |
| サブスク情報取得 | `app/api/clavi/stripe/subscription/route.ts` |
| Webhook処理 | `app/api/clavi/stripe/webhook/route.ts` |
| 料金ページ | `app/clavi/pricing/page.tsx` |
| サブスク管理画面 | `app/clavi/subscription/page.tsx` |
| サブスク成功画面 | `app/clavi/subscription/success/page.tsx` |

### マイグレーション
- `20260118000000_add_stripe_subscription_fields.sql`

---

## Phase 8: sameAs + Author + マージ機能 ✅ 完了

**完了日**: 2026-01-20

### 概要

Google AIO（AI Overviews）表示最適化のための機能追加:
- **sameAs入力機能**: テナント設定でSNSリンクを一括入力
- **Author/Person Schema**: テナント設定で代表者情報を登録
- **型別マージロジック**: 既存JSON-LD（WordPress等）とCLAVI生成をインテリジェントにマージ

### 実装内容

| 機能 | ファイル |
|------|---------|
| 型定義 | `lib/clavi/types/tenant-settings.ts` |
| スキーママージャー | `lib/clavi/schema-merger.ts` |
| sameAs入力フォーム | `components/clavi/SameAsInputForm.tsx` |
| Author入力フォーム | `components/clavi/AuthorInputForm.tsx` |
| 設定API | `app/api/clavi/settings/route.ts` |
| 設定ページ更新 | `app/clavi/settings/page.tsx` |
| Schema Generator拡張 | `lib/clavi/schema-generator.ts` |
| 分析API更新 | `app/api/clavi/analyze/route.ts` |

### マイグレーション

- `20260120000000_add_tenant_settings.sql`: clavi.tenants.settings JSONB追加

### 生成されるスキーマ例

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://example.com#organization",
      "name": "Example Corp",
      "sameAs": [
        "https://twitter.com/example",
        "https://linkedin.com/company/example"
      ],
      "knowsAbout": ["AI検索最適化", "SEO"]
    },
    {
      "@type": "Person",
      "@id": "https://example.com#author",
      "name": "山田太郎",
      "jobTitle": "代表取締役",
      "knowsAbout": ["AI検索最適化", "マーケティング"],
      "sameAs": ["https://twitter.com/yamada"],
      "worksFor": { "@id": "https://example.com#organization" }
    },
    {
      "@type": "WebSite",
      "@id": "https://example.com#website",
      "url": "https://example.com",
      "publisher": { "@id": "https://example.com#organization" }
    },
    {
      "@type": "WebPage",
      "@id": "https://example.com/page",
      "author": { "@id": "https://example.com#author" },
      "hasPart": [...]
    }
  ]
}
```

### 重複検出・マージ動作

| シナリオ | 動作 |
|---------|------|
| 既存Organization検出 | sameAs/knowsAboutを追加 |
| 既存WebSite検出 | そのまま使用 |
| 既存WebPage検出 | hasPart追加、authorリンク追加 |
| Author設定あり | Person Schemaを常に追加 |

---

## Phase 9+: 今後のロードマップ

| Phase | 内容 |
|-------|------|
| Phase 9 | knowsAbout拡張（5→25個）、hasCredential追加 |
| Phase 10 | potentialAction、additionalType追加 |
| Phase 11 | 本番リリース・マーケティング |

詳細は Phase 5 実験結果を踏まえて計画。

---

## 変更履歴

| 日付 | Phase | 内容 |
|------|-------|------|
| 2026-01-19 | - | タスク管理ファイル整理・現状反映 |
| 2026-01-18 | Phase 6 | 運営管理画面完了 |
| 2026-01-18 | Phase 7 | Stripe課金統合完了 |
| 2026-01-11 | Phase 3-4 | クライアント管理画面・ベクトルリンク化完了 |
