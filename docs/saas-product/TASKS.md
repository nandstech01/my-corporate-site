# AI Search Optimizer SaaS - タスク管理

**最終更新**: 2026-01-19
**現在地**: Phase 7（Stripe課金統合）完了
**次アクション**: Phase 5 実験（GSC検証）

---

## 現在のステータス

| Phase | 状態 | 備考 |
|-------|------|------|
| Phase 0-4 | ✅ 完了 | ベクトルリンク化・分析基盤 |
| Phase 5 | ⏳ **準備完了** | 実験開始待ち（GSC検証） |
| Phase 6 | ✅ 完了 | 運営管理画面 |
| Phase 7 | ✅ **完了** | Stripe課金統合 |
| Phase 8 | ⏸️ 未着手 | 本番リリース |

**関連**: Carve-Out基盤 → [`/docs/carve-out/TASKS.md`](../carve-out/TASKS.md)

---

## 安全原則（必守）

```
✅ 許可:
- 新規ファイル作成（lib/aso/*, app/aso/*, app/api/aso/*）
- 新規テーブル作成（aso.* スキーマ内）

❌ 禁止:
- 既存ライブラリの変更（lib/vector/*, lib/structured-data/*）
- 既存APIの変更（/api/generate-*, /api/deep-research等）
- 既存テーブルの変更（public.*）
```

---

## 実装済みファイル一覧

### API（20ファイル）

| ファイル | 説明 |
|---------|------|
| `app/api/aso/me/route.ts` | ユーザー情報取得 |
| `app/api/aso/onboard/route.ts` | オンボーディング |
| `app/api/aso/tenant/route.ts` | テナント情報（GET/PATCH/DELETE） |
| `app/api/aso/switch-tenant/route.ts` | テナント切替 |
| `app/api/aso/analyze/route.ts` | URL分析実行 |
| `app/api/aso/analyses/route.ts` | 分析一覧取得 |
| `app/api/aso/results/[id]/route.ts` | 分析結果詳細 |
| `app/api/aso/job-token/route.ts` | ジョブトークン発行 |
| `app/api/aso/invitations/route.ts` | 招待作成・取消 |
| `app/api/aso/invitations/accept/route.ts` | 招待受諾 |
| `app/api/aso/members/route.ts` | メンバー一覧 |
| `app/api/aso/members/[userId]/route.ts` | メンバー編集・削除 |
| `app/api/aso/admin/tenants/route.ts` | 管理者:テナント一覧 |
| `app/api/aso/admin/tenants/[id]/route.ts` | 管理者:テナント詳細 |
| `app/api/aso/admin/jobs/route.ts` | 管理者:ジョブ監視 |
| `app/api/aso/admin/stats/route.ts` | 管理者:システム統計 |
| `app/api/aso/stripe/checkout/route.ts` | Stripe Checkout |
| `app/api/aso/stripe/portal/route.ts` | Stripe Customer Portal |
| `app/api/aso/stripe/subscription/route.ts` | サブスク情報取得 |
| `app/api/aso/stripe/webhook/route.ts` | Stripe Webhook |

### フロントエンド（18ファイル）

| ファイル | 説明 |
|---------|------|
| `app/aso/page.tsx` | ランディングページ |
| `app/aso/login/page.tsx` | ログインページ |
| `app/aso/layout.tsx` | 共通レイアウト |
| `app/aso/context.tsx` | コンテキストプロバイダー |
| `app/aso/dashboard/page.tsx` | ダッシュボード |
| `app/aso/analyses/page.tsx` | 分析一覧 |
| `app/aso/analyses/[id]/page.tsx` | 分析詳細 |
| `app/aso/stats/page.tsx` | 統計ページ |
| `app/aso/settings/page.tsx` | 設定ページ |
| `app/aso/pricing/page.tsx` | 料金ページ |
| `app/aso/subscription/page.tsx` | サブスク管理 |
| `app/aso/subscription/success/page.tsx` | サブスク成功 |
| `app/aso/admin/layout.tsx` | 管理画面レイアウト |
| `app/aso/admin/page.tsx` | 管理ダッシュボード |
| `app/aso/admin/tenants/page.tsx` | テナント管理 |
| `app/aso/admin/tenants/[id]/page.tsx` | テナント詳細 |
| `app/aso/admin/jobs/page.tsx` | ジョブ監視 |
| `app/aso/admin/stats/page.tsx` | システム統計 |

### コンポーネント（13ファイル）

| ファイル | 説明 |
|---------|------|
| `components/aso/AsoHeader.tsx` | ヘッダー |
| `components/aso/AsoSidebar.tsx` | サイドバー |
| `components/aso/AdminSidebar.tsx` | 管理者サイドバー |
| `components/aso/AnalysesTable.tsx` | 分析テーブル |
| `components/aso/AnalysesFilters.tsx` | フィルター |
| `components/aso/NewAnalysisModal.tsx` | 新規分析モーダル |
| `components/aso/Pagination.tsx` | ページネーション |
| `components/aso/ScoreBar.tsx` | スコアバー |
| `components/aso/JsonViewer.tsx` | JSON表示 |
| `components/aso/StatsKpiCards.tsx` | KPIカード |
| `components/aso/StatsDailyChart.tsx` | 日次推移グラフ |
| `components/aso/StatsScoreChart.tsx` | スコア推移グラフ |
| `components/aso/StatsDistribution.tsx` | スコア分布 |

### ライブラリ（20ファイル）

| ファイル | 説明 |
|---------|------|
| `lib/aso/crawler.ts` | Webクローラー |
| `lib/aso/fragment-vectorizer.ts` | OpenAI Embeddings統合 |
| `lib/aso/semantic-analyzer.ts` | コサイン類似度計算 |
| `lib/aso/topic-consistency-scorer.ts` | トピック一貫性スコア |
| `lib/aso/internal-link-optimizer.ts` | ベクトル近傍検索 |
| `lib/aso/content-improvement-advisor.ts` | Keep/Revise/Optimize |
| `lib/aso/entity-extractor.ts` | OpenAI GPT-4エンティティ抽出 |
| `lib/aso/schema-generator.ts` | Schema.org 16.0+ JSON-LD |
| `lib/aso/admin-auth.ts` | 管理者認証 |
| `lib/aso/types/crawler.ts` | クローラー型定義 |
| `lib/aso/types/analysis.ts` | 分析型定義 |
| `lib/aso/utils/heading-extractor.ts` | 見出し抽出 |
| `lib/aso/utils/metadata-extractor.ts` | メタデータ抽出 |
| `lib/aso/__tests__/fragment-vectorizer.test.ts` | テスト |
| `lib/aso/__tests__/semantic-analyzer.test.ts` | テスト |
| `lib/aso/__tests__/topic-consistency-scorer.test.ts` | テスト |
| `lib/aso/__tests__/internal-link-optimizer.test.ts` | テスト |
| `lib/aso/__tests__/content-improvement-advisor.test.ts` | テスト |
| `lib/aso/__tests__/entity-extractor.test.ts` | テスト |
| `lib/aso/__tests__/schema-generator.test.ts` | テスト |

### WordPress プラグイン

| ファイル | 説明 |
|---------|------|
| `wordpress-plugin/aso-fragment-ids/aso-fragment-ids.php` | Fragment ID自動生成 |
| `wordpress-plugin/aso-fragment-ids/README.md` | プラグイン説明 |

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
  - wordpress-plugin/aso-fragment-ids/ をWordPressに設置
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

- 管理者認証（環境変数 `ASO_PLATFORM_ADMIN_EMAILS`）
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
| Checkout Session作成 | `app/api/aso/stripe/checkout/route.ts` |
| Customer Portal | `app/api/aso/stripe/portal/route.ts` |
| サブスク情報取得 | `app/api/aso/stripe/subscription/route.ts` |
| Webhook処理 | `app/api/aso/stripe/webhook/route.ts` |
| 料金ページ | `app/aso/pricing/page.tsx` |
| サブスク管理画面 | `app/aso/subscription/page.tsx` |
| サブスク成功画面 | `app/aso/subscription/success/page.tsx` |

### マイグレーション
- `20260118000000_add_stripe_subscription_fields.sql`

---

## Phase 8+: 今後のロードマップ

| Phase | 内容 |
|-------|------|
| Phase 8 | 本番リリース・マーケティング |

詳細は Phase 5 実験結果を踏まえて計画。

---

## 変更履歴

| 日付 | Phase | 内容 |
|------|-------|------|
| 2026-01-19 | - | タスク管理ファイル整理・現状反映 |
| 2026-01-18 | Phase 6 | 運営管理画面完了 |
| 2026-01-18 | Phase 7 | Stripe課金統合完了 |
| 2026-01-11 | Phase 3-4 | クライアント管理画面・ベクトルリンク化完了 |
