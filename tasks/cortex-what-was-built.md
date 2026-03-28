# CORTEX実装レポート — 何を作ったのか

**作成日**: 2026-03-28
**ステータス**: Phase 1 + Phase 2 コード実装完了（デプロイ前）
**テスト**: 134テスト全合格（12ファイル）— Phase 1: 94 + Phase 2: 40
**TypeScript**: エラー0（tsc --noEmit通過）
**既存システム影響**: 最小限（tools.tsにLINEツール追加、funnel-tracker.tsにbridge呼出追加、cron-runner.tsにケース追加 — 全てtry/catch隔離）

## Phase 2 追加分 (LINE Harness SDK統合)

### 新規ファイル（7ファイル + 2マイグレーション + 4テスト）

**SDK基盤:**
- `lib/cortex/line-harness/types.ts` — SDK型再export + スコアリング定数 + UTMタグマップ
- `lib/cortex/line-harness/client.ts` — Singleton SDKクライアント（getLineHarnessClient/Safe）

**統合モジュール:**
- `lib/cortex/line-harness/funnel-bridge.ts` — SNS流入→LINE Harnessタグ付け+シナリオ登録
- `lib/cortex/line-harness/data-sync.ts` — LINE Harness→Supabase定期同期（100件/ページ）
- `lib/cortex/line-harness/scoring-bridge.ts` — 統一リードスコアリング+リッチメニュー切替
- `lib/cortex/line-harness/buzz-broadcaster.ts` — バズ→LINE緊急配信（AI Judge判断、4h制限）
- `lib/cortex/line-harness/slack-tools.ts` — Slack Agent用5ツール（broadcast/segment/analytics/scenario/richmenu）

**DB:**
- `cortex_line_friends` — LINE友だちミラー（分析用）
- `cortex_line_scoring_log` — スコア変更ログ

**既存ファイル変更（3箇所のみ）:**
- `tools.ts` — 12ツール末尾に5 LINEツール追加（動的import、失敗時スキップ）
- `funnel-tracker.ts` — handleFollowに`bridgeFollowToHarness`追加（try/catch隔離）
- `cron-runner.ts` — 3ケース追加（sync/scoring/buzz-broadcast）

---

## 一言で言うと

**「Discord (Claude Code) が根拠のあるデータで回答でき、LINEからワンタップでSNS全操作ができる基盤」を作った。**

---

## 元の構想 vs 実装状況

### 1. SNSファネル → LINE CRM オムニチャネル自動化

| 構想 | 実装状況 |
|------|---------|
| SNS投稿にLINE友だち追加リンク埋め込み（tracked_link） | ✅ `funnel-tracker.ts` の `generateLineAddUrl()` — utm_source/campaign/content付きURL生成 |
| LINE友だち追加時に自動タグ付け（流入元SNS + 興味トピック） | ✅ `funnel-tracker.ts` の `handleFollow()` — Webhookで友だち追加イベント処理 |
| SNS投稿にCTA埋め込み | ✅ `funnel-tracker.ts` の `embedLineCTA()` — 長文投稿にLINE追加リンク自動付与 |
| タグベースのステップ配信開始 | ⬜ LINE Harness SDK統合が必要（Phase 2） |
| 行動スコアリング → ホットリード化 | ⬜ LINE Harness scoring_rulesとの統合（Phase 2） |
| 既存CRM（system_dev_leads）に自動連携 | ⬜ Phase 2 |

### 2. クロスプラットフォーム行動スコアリング統一

| 構想 | 実装状況 |
|------|---------|
| X/LinkedIn/Instagram/LINE全行動データを統合スコア化 | 🔶 部分的 — `unified-orchestrator.ts` が全プラットフォームのエンゲージメントを統合集計。ただしスコアリングルール統一はPhase 2 |
| 高スコアでリッチメニュー自動切替 | ⬜ LINE Harness rich_menus API統合が必要（Phase 2） |
| Slack通知 → 営業即アプローチ | ✅ 既存のlead-pipeline/notify.tsがそのまま使える |

### 3. AI Slack Agent → LINE配信オーケストレーター

| 構想 | 実装状況 |
|------|---------|
| 既存8ツールのSlack AIエージェント | ✅ 既存（変更なし） |
| LINE一斉配信ツール追加 | ✅ `webhook-handler.ts` の `pushToLine()` — メッセージプッシュ機能 |
| LINEからの6コマンド操作 | ✅ `command-router.ts` — バズ/投稿/成績/トレンド/ルール/分析 |
| Flex Messageでプレビュー + 承認ボタン | ✅ `command-router.ts` — 投稿プレビューBubble + Approve/Edit/Reject Postback |
| HITLワークフロー統合 | ✅ `command-router.ts` の `handlePostback()` — 承認でslack_pending_actionsにINSERT |
| LINEセグメント配信（タグ/スコア指定） | ⬜ LINE Harness SDK統合（Phase 2） |
| LINEシナリオ作成/編集 | ⬜ Phase 2 |

### 4. SNSバズ検知 → LINE緊急配信

| 構想 | 実装状況 |
|------|---------|
| バズ検知（既存buzz-collector） | ✅ 既存（変更なし） |
| バズ検知 → LINE Flex Message通知 | ✅ `command-router.ts` の `handleBuzzCommand()` — Carouselで表示 |
| AI分析（なぜバズったか） | ✅ `viral-structure-analyzer.ts` — 感情トリガー/情報密度/新規性/再現可能性スコア |
| ワンタップで全SNS展開 | ✅ Postbackボタンで即投稿 |
| 逆パターン（LINE → SNS展開） | ✅ `command-router.ts` — 「投稿して [テーマ]」コマンドでAI生成→投稿 |

### 5. SNS Pilot SaaS + LINE Harness = 統合マーケティングSaaS

| 構想 | 実装状況 |
|------|---------|
| LINE公式アカウント管理統合 | 🔶 基盤完了 — Webhook受信/署名検証/コマンドルーティング。LINE Harness SDK組込はPhase 2 |
| LINE×SNSクロス分析 | ✅ `unified-orchestrator.ts` + `cross-channel-intelligence.ts` — 全チャネル横断分析 |
| オムニチャネルリードスコアリング | 🔶 分析基盤あり、スコアリングルール統合はPhase 2 |

### 6. CLAVI × LINE Harness 教育ファネル

| 構想 | 実装状況 |
|------|---------|
| LIFF: AI検索診断フォーム | ⬜ Phase 2（LIFF開発） |
| LINE Harness: 診断結果Flex Message配信 | ✅ Flex Message基盤完了 |
| ステップ配信 | ⬜ LINE Harness SDK統合（Phase 2） |

### 7. パートナーアフィリエイト × LINE

| 構想 | 実装状況 |
|------|---------|
| パートナー専用LINE友だち追加リンク | ✅ `generateLineAddUrl()` でref パラメータ付与可能 |
| ref別の友だち追跡 | ✅ UTM追跡基盤あり |
| パートナー向けステップ配信 | ⬜ Phase 2 |

### 8. Voice Agent × LINE

| 構想 | 実装状況 |
|------|---------|
| 音声→テキスト変換→LINE送信 | ⬜ Phase 3（Voice Agent統合） |

---

## CORTEX独自機能（構想になかった追加価値）

### Claude Codeが「答え」を持つためのナレッジ基盤

**これが核心。構想にあった「ただの技術屋にならない」を実現する仕組み。**

| 機能 | ファイル | 何をするか |
|------|---------|-----------|
| **プラットフォームルール自動収集** | `platform-rule-collector.ts` | X/LinkedIn/Threads/Instagramの公式ドキュメントを自動でクロール→構造化→DB保存。Claude Codeは「最新の公式ルール」を根拠に回答できる |
| **バイラル構造分析** | `viral-structure-analyzer.ts` | バズ投稿の「なぜバズったか」を分析（感情トリガー/情報密度/新規性/権威性/再現可能性）。メトリクスだけでなく構造を理解する |
| **時間帯パターンマイニング** | `temporal-pattern-miner.ts` | 90日分の投稿データから曜日×時間帯×トピック×コンテンツタイプの統計分析。95%信頼区間付き。「火曜18時のAI投稿はER 3.2%」のような根拠を出せる |
| **ディープトレンドリサーチ** | `deep-trend-researcher.ts` | トレンドの「なぜ今ホットか」「誰も言ってない角度」「日本市場の独自角度」を分析。表面的なインフルエンサー監視ではなく深層分析 |
| **週次自動改善提案** | `auto-improver.ts` | パターン性能/AI Judge閾値/投稿スケジュールの偏りを分析→改善提案を生成→cortex_conversation_logに記録 |
| **統合学習オーケストレーター** | `unified-orchestrator.ts` | 全プラットフォームの学習結果を統合。クロスプラットフォームパターン発見、時間帯分析、改善軌道計算 |
| **チャネル横断インテリジェンス** | `cross-channel-intelligence.ts` | Discord/LINE/Slackでの意思決定を追跡し、「その決定で実際に成績が上がったか」を計測 |

### Discord会話で使える4つのコマンド（全てデータ付き回答）

| コマンド | 何ができるか | 回答の根拠 |
|---------|-------------|-----------|
| コンテンツレビュー | 投稿文を分析→改善提案 | cortex_platform_rules + cortex_viral_analysis + cortex_temporal_patterns + pattern_performance |
| トレンド分析 | 今日のバズネタ + 具体的投稿案3パターン | buzz_posts + cortex_viral_analysis + slack_bot_memory |
| パフォーマンスレビュー | 週間成績 + 改善点 | x/linkedin/threads_post_analytics + pattern_performance + model_drift_log |
| ガイドライン確認 | 最新ルール + 変更履歴 | cortex_platform_rules (active + deprecated) |

---

## 作成ファイル一覧（全21ファイル + 8テスト）

### 新規DBテーブル（4つ、既存テーブル変更ゼロ）

```
supabase/migrations/
├── 20260328000000_create_cortex_platform_rules.sql    # プラットフォームルールDB
├── 20260328000001_create_cortex_viral_analysis.sql    # バイラル構造分析
├── 20260328000002_create_cortex_temporal_patterns.sql # 時間帯パターン
└── 20260328000003_create_cortex_conversation_log.sql  # 会話ログ
```

### CORTEX本体（15ファイル）

```
lib/cortex/
├── types.ts                                    # 全型定義
├── cron-runner.ts                              # 7ジョブディスパッチャー
├── knowledge/
│   ├── platform-rule-collector.ts              # ルール自動収集（週1）
│   ├── viral-structure-analyzer.ts             # バイラル深層分析（毎日）
│   ├── temporal-pattern-miner.ts               # 時間帯統計分析（週1）
│   └── deep-trend-researcher.ts                # トレンド深層分析（毎日3回）
├── discord/
│   ├── context-builder.ts                      # 全データ統合コンテキスト
│   ├── command-handler.ts                      # 4コマンド（根拠付き回答）
│   └── auto-improver.ts                        # 週次自動改善提案
├── line/
│   ├── webhook-handler.ts                      # LINE Webhook受信・署名検証
│   ├── command-router.ts                       # 6コマンド + Flex Message
│   ├── discord-bridge.ts                       # LINE↔Discord転送
│   └── funnel-tracker.ts                       # UTM追跡・友だち追加処理
└── learning/
    ├── unified-orchestrator.ts                 # 全PF統合学習
    └── cross-channel-intelligence.ts           # チャネル横断意思決定追跡
```

### API Route（1ファイル）

```
app/api/cortex/line-webhook/route.ts            # LINE Webhook エンドポイント
```

### GitHub Actions（1ファイル）

```
.github/workflows/cortex-cron.yml               # 7スケジュールジョブ
```

### テスト（8ファイル、94テスト全合格）

```
tests/unit/cortex/
├── types.test.ts                               # 型バリデーション（7テスト）
├── context-builder.test.ts                     # コンテキスト生成（11テスト）
├── webhook-handler.test.ts                     # LINE署名検証（5テスト）
├── funnel-tracker.test.ts                      # UTM追跡・CTA埋め込み（13テスト）
├── knowledge-modules.test.ts                   # ナレッジ収集全4モジュール（29テスト）
├── command-handler.test.ts                     # Discord 4コマンド（11テスト）
├── line-router.test.ts                         # LINE 6コマンド + Postback（10テスト）
└── learning.test.ts                            # 学習ループ2モジュール（8テスト）
```

---

## Cronジョブスケジュール（全て新規、既存ジョブ変更なし）

| ジョブ | スケジュール (JST) | 内容 |
|-------|-------------------|------|
| cortex-platform-rule-collector | 日曜 03:00 | 公式ドキュメントからルール自動収集 |
| cortex-viral-structure-analyzer | 毎日 01:00 | バズ投稿の深層構造分析 |
| cortex-temporal-pattern-miner | 月曜 02:00 | 90日分の時間帯×ER統計計算 |
| cortex-deep-trend-researcher | 毎日 12:00, 18:00, 00:00 | トレンドの深層分析（3回/日） |
| cortex-auto-improver | 水曜 04:00 | 週次自動改善提案 |
| cortex-unified-learner | 毎日 02:00 | 全PF統合学習 |
| cortex-cross-channel-intelligence | 日曜 05:00 | チャネル横断意思決定追跡 |

---

## データフロー図

```
  [既存SNS投稿]        [既存Buzz Collector]       [既存Engagement Learner]
       │                      │                          │
       ↓                      ↓                          ↓
  x_post_analytics       buzz_posts              pattern_performance
  linkedin_post_analytics                        slack_bot_memory
  threads_post_analytics
       │                      │                          │
       ├──────────────────────┼──────────────────────────┤
       │                      │                          │
       ↓                      ↓                          ↓
  ┌─────────────── CORTEX Knowledge Layer ──────────────────┐
  │                                                          │
  │  temporal-pattern-miner   viral-structure-analyzer       │
  │  (曜日×時間帯×ER統計)     (なぜバズったか構造分析)       │
  │         ↓                        ↓                      │
  │  cortex_temporal_patterns  cortex_viral_analysis         │
  │                                                          │
  │  platform-rule-collector   deep-trend-researcher         │
  │  (公式ルール自動収集)      (トレンド深層分析)            │
  │         ↓                        ↓                      │
  │  cortex_platform_rules     cortex_viral_analysis         │
  │                                                          │
  └──────────────────────┬───────────────────────────────────┘
                         │
                         ↓
  ┌─────────── CORTEX Intelligence Layer ──────────────────┐
  │                                                         │
  │  context-builder.ts (全データ統合)                       │
  │         ↓                                               │
  │  command-handler.ts (根拠付き回答生成)                   │
  │         ↓                                               │
  │  ┌─────────────────────────────────────┐                │
  │  │ Discord (Claude Code)               │                │
  │  │ ・コンテンツレビュー（根拠付き）     │                │
  │  │ ・トレンド分析                      │                │
  │  │ ・パフォーマンスレビュー            │                │
  │  │ ・ガイドライン確認                  │                │
  │  └─────────────────────────────────────┘                │
  │         ↕ discord-bridge.ts                             │
  │  ┌─────────────────────────────────────┐                │
  │  │ LINE CORTEX                         │                │
  │  │ ・バズ通知 → ワンタップ投稿        │                │
  │  │ ・AI投稿生成 → プレビュー → 承認  │                │
  │  │ ・週間パフォーマンスレポート        │                │
  │  │ ・ディープトレンド分析              │                │
  │  │ ・ガイドライン確認                  │                │
  │  │ ・コンテンツ構造分析                │                │
  │  └─────────────────────────────────────┘                │
  │                                                         │
  └──────────────────────┬──────────────────────────────────┘
                         │
                         ↓
  ┌─────────── CORTEX Learning Layer ──────────────────────┐
  │                                                         │
  │  unified-orchestrator.ts                                │
  │  (全PFエンゲージメント統合 → パターン相関分析)          │
  │                                                         │
  │  cross-channel-intelligence.ts                          │
  │  (意思決定追跡 → 効果測定)                              │
  │                                                         │
  │  auto-improver.ts                                       │
  │  (パターン/閾値/スケジュール改善提案)                   │
  │                                                         │
  │         ↓                                               │
  │  cortex_conversation_log (全意思決定の記録)             │
  │                                                         │
  └─────────────────────────────────────────────────────────┘
```

---

## Phase 2でやること（未実装）

| 項目 | 理由 |
|------|------|
| LINE Harness SDK統合 | OSSのSDKインストール + APIクライアント設定が必要 |
| ステップ配信・セグメント配信 | LINE Harnessのscenarios API統合 |
| リッチメニュー動的切替 | LINE Harnessのrich_menus API統合 |
| 統一リードスコアリング | LINE Harness scoring_rules + 既存CRMの統合設計 |
| LIFF Mini-app（診断フォーム等） | フロントエンド開発 |
| D1 ↔ Supabase ユーザーID紐付け | external_id マッピング設計 |
| Voice Agent × LINE | OpenAI Realtime → LINE テキスト変換 |

---

## デプロイ手順

```bash
# 1. DBマイグレーション適用
supabase db push

# 2. 環境変数追加（Vercel + GitHub Actions）
LINE_CHANNEL_SECRET=xxx
LINE_CHANNEL_ACCESS_TOKEN=xxx
LINE_OFFICIAL_ACCOUNT_ID=xxx   # オプション（funnel-tracker用）
DISCORD_WEBHOOK_URL=xxx         # オプション（discord-bridge用）

# 3. LINE Developers ConsoleでWebhook URL設定
# https://nands.tech/api/cortex/line-webhook

# 4. GitHub Actionsでcortex-cron.ymlを有効化
# リポジトリのActions → cortex-cron → Enable workflow
```
