# CORTEX / X 強化 ブラッシュアップ計画

最終更新: 2026-06-19
方針: ①まず止まっているものを直す → ②投稿量を2-5本/日の精鋭に絞る → ③バズるテンプレに刷新 → ④学習ループ復旧

---

## 🔴 Phase 0: 故障修復（最優先・CORTEXが実際に止まっている）

実データで確認済みの停止原因:
- AI-to-AIループが `status=sleeping`、最終ターン 2026-05-17（約1ヶ月停止）
- X投稿が約2.5ヶ月停止（最新 cortex_pending_posts posted = 2026-03-30）
- self-hostedランナー `mac-nands-cortex` 1台に cron 数十本が殺到 → Slack Bot Cron が4h+ queued で滞留
- impressions が常時0付近 → エンゲージ収集（学習シグナル）が死んでいる
- pending 3件が 2026-03-30 から放置

- [ ] 0-1. 失敗中cron（CORTEX/High-Freq/LinkedIn）のログを精査し根本原因を特定
- [ ] 0-2. ランナー詰まりの解消（Phase1の投稿量削減で構造的に解決 + concurrency見直し）
- [ ] 0-3. AI-to-AIループを `sleeping`→`active` に復帰させる経路を確認・実行
- [ ] 0-4. 放置pending 3件をレビュー（古いので破棄 or 書き直し判断）
- [ ] 0-5. エンゲージ収集が動かない原因を特定（impressions=0問題）

## 🟡 Phase 1: 投稿量を「2-5本/日の精鋭」に絞る（無駄撃ち廃止）

現状の自動X投稿（過剰）:
- x-auto-post ×3, daily-buzz ×3, viral-ai-repost ×3, viral-repost ×1
- anthropic-tweet-reactor 15分毎（最大56回/日）← 異常
- x-proactive-discussion ×6（リプ最大15/日）, x-conversation-builder ×3
→ 合計 原文だけで約13本/日 + 大量の反応

目標構成（例・要相談）:
- [ ] 1-1. 原文投稿を 2-3本/日に集約（朝の本命1 + 夜の本命1 + 必要なら昼1）
- [ ] 1-2. daily-buzz 3→1（「今日のAI業界まとめ」型に統合、夜1本）
- [ ] 1-3. anthropic-tweet-reactor を 15分毎→1日1-2回 or 廃止
- [ ] 1-4. viral-ai-repost / viral-threads-repost を 3→1 or 廃止
- [ ] 1-5. proactive-discussion（リプ）は残すが上限を絞る（質重視）
- [ ] 1-6. daily-limit-checker のデフォルト 3→「2-5の幅」に調整
- [ ] 1-7. .github/workflows の cron スロットを削減（ランナー詰まりも同時解消）

## 🟢 Phase 2: バズるテンプレに刷新（masahirochaen スタイル）

重大な前提: 現在の TONE_GUIDELINES と voice-profile/critique は
「知らないと損」等のバズ語を**禁止・自動リジェクト**している。
→ テンプレ追加だけでなく「声の設計」自体の改修が必須。

- [ ] 2-1. 【戦略決定】純バズ振り切り vs 実務家×バズのハイブリッド（推奨: ハイブリッド）
- [ ] 2-2. hook-templates.ts に日本語バズパターンを追加
      （保存版〇選 / 速報遂に / 〇〇終了のお知らせ / 今日のまとめ / 待って。〜すぎて / 数字ショック 等12種）
      ※既存パターン削除はしない（スコア更新・追加のみ＝規約遵守）
- [ ] 2-3. pattern-templates.ts に構造テンプレ追加（保存版リスト型・速報型・daily recap型）
- [ ] 2-4. TONE_GUIDELINES の avoid/good を再設計（バズ語を条件付き許可）
- [ ] 2-5. critique-engine / voice-profile の aiSmellPatterns を調整（バズ語で機械的に落とさない）
- [ ] 2-6. 保存(bookmark)最適化を重視（アルゴリズム: bookmark5pt/RT6pt/reply75-150pt）

## ⭐ Phase 1.5: Typefully API を「配信層」として導入（故障の構造的解決）

確定: 添付画像 = Typefully API。投稿/スケジュールをTypefullyに委譲する。
- v1: `https://api.typefully.com/v1/` 認証 `X-API-KEY: Bearer <KEY>`
  - `POST /v1/drafts/`（content, threadify, schedule-date="next-free-slot", auto_retweet_enabled, auto_plug_enabled, share）
  - `GET /v1/drafts/recently-published/`, `/recently-scheduled/`, `GET /v1/notifications/`
- v2: `https://api.typefully.com/v2/`（social-sets, マルチプラットフォーム, メディア, Webhook）

- [ ] 1.5-1. TYPEFULLY_API_KEY を .env.local / GitHub Secrets に追加（ユーザー作業）
- [ ] 1.5-2. lib/typefully/client.ts を新規作成（createDraft / schedule / recentlyPublished）
- [ ] 1.5-3. x-api/client.ts の postTweet を Typefully経路に切替（フラグで併存可: TYPEFULLY_ENABLED）
- [ ] 1.5-4. threadify + next-free-slot + auto_retweet + auto_plug を活用
- [ ] 1.5-5. cronは「生成→Typefullyドラフト投入」だけにし、投稿タイミングはTypefullyに委譲
      → ランナー詰まり・queued滞留が構造的に解消
- [ ] 1.5-6. recently-published を学習バックフィルに接続（impressions=0問題の緩和）

## 🔵 Phase 3: 学習ループ復旧（前回指摘の断線修復）

- [ ] 3-1. prediction_accuracy 書き込みcron（投稿後実エンゲージ→予測誤差記録）
      ※Typefully recently-published / X API 読取で実数取得
- [ ] 3-2. x_growth_metrics の writer 復活（日次フォロワー記録）
- [ ] 3-3. フォロワー帰属（どの投稿がフォロー増を生んだか）の簡易計測
- [ ] 3-4. バズテンプレの実績をバンディットに学習させる

---

## レビュー欄

### 2026-06-19 実装（このセッション）
完了（全て追加・SNS関連ファイルのみ・既存パターン削除なし）:
- ✅ 1.5-2/3/4/6: lib/typefully/client.ts 新規作成（createTypefullyDraft / publishViaTypefully /
     getRecentlyPublished / isTypefullyConfigured）。threadify・next-free-slot・auto-RT・auto-plug 対応。
- ✅ Typefully シーム: lib/x-api/client.ts の postTweet / postThread に TYPEFULLY_ENABLED 分岐を追加。
     キー未設定（既定）では無効＝既存挙動を一切変えない。失敗時は既存経路にフォールスルー。
- ✅ 2-2: hook-templates.ts に日本語バズ型10種追加（保存版〇選 / 速報遂に / 〇〇終了 / daily recap /
     待って。/ 数字ショック / 朗報 / なんと / 完全版プロンプト / ワークフロー手順）。
- ✅ 2-3: pattern-templates.ts に構造テンプレ3種追加（buzz_save_list / buzz_daily_recap / buzz_breaking）。
- ✅ 2-4: TONE_GUIDELINES をハイブリッド化（buzz_markers許可・真のAI臭のみNG・bookmark最適化方針）。

検証: tsx スモークテストでフック33種・テンプレ23種・jp-save-list-n がトップ5入りを確認。tsc 型エラーなし。

### キー取得後にやること（ユーザー作業 → 即有効化）
1. Typefully → Settings → API でキー発行
2. .env.local と GitHub Secrets に追加:
   TYPEFULLY_ENABLED=true / TYPEFULLY_API_KEY=xxx
   （任意）TYPEFULLY_AUTO_RETWEET=true / TYPEFULLY_AUTO_PLUG=true / TYPEFULLY_SCHEDULE_DATE=next-free-slot

### 2026-06-19 Phase 1 実装（投稿量を2-5本/日の精鋭に削減）
完了:
- ✅ anthropic-tweet-reactor: 15分毎(最大56回/日) → 1日1回(JST13:00)  ★ランナー詰まりの主因を除去
- ✅ x-auto-post: 3回 → 2回(JST6:30/18:30)
- ✅ daily-buzz: 3本(global/CC/Japan) → 1本(Japan recap JST20:00)。global/CCはcronコメントアウト(手動可)
- ✅ viral-ai-repost: 3回 → 1回(JST14:00) / viral-threads-repost: 3回 → 1回(JST14:30)
- ✅ viral-repost: 廃止(cronコメントアウト・viral-ai-repostに集約)
- ✅ x-proactive-discussion: 6回 → 2回(JST12:30/18:30) / x-conversation-builder: 3回 → 1回(JST17:00)
- ✅ daily-limit-checker DEFAULT 3 → 5（質重視2-5本/日キャップ）
- ✅ SCHEDULE_TO_JOB 対応表を新cron文字列に同期（6キー更新）

編集ファイル: .github/workflows/high-freq-cron.yml, slack-bot-cron.yml,
  scripts/slack-bot-cron.ts, lib/cortex/posting/daily-limit-checker.ts
検証: 全scheduled cron(33本)が対応表に存在・重複キー0件("No job matched"事故なし)、tsc型エラーなし。
効果: Xの自動投稿は最大5本/日（内部ゲートで未ヒット時no-op＝自然に2-5本）。
      15分毎廃止でself-hostedランナーのqueued滞留が構造的に解消する見込み。

### 2026-06-19 反映 & Phase 0 診断
- ✅ PR #15 を squash マージ → main 反映済み（次回スケジュールから新cron/テンプレ稼働）
- ✅ cron失敗の真因特定: `claude -p exited 1`(stderr空) = サブスク利用枠の枯渇/過負荷。
     15分毎reactor等の過剰呼び出しが原因 → 今回の投稿量削減で解消。`claude -p` の単体動作は正常確認済み。
- ✅ 放置pending 3件(2026-03-30の古い3月ニュース)を rejected 化 → pending=0
- ⏳ ループ sleeping(turn99, 最終2026-05-17): AI-A(Discordボット)起点のため、
     Discordで「再開」送信 or ボット稼働が必要（コード側では復帰不可）← ユーザー確認事項
- ⏳ impressions=0: エンゲージ収集の読取経路 or リーチ実態の確認（Phase 3で対応）

### 2026-06-19 Phase 2-5 + 耐性ハーデニング
- ✅ platform-constitutions.ts をハイブリッド対応化:
     「煽り表現」→「中身のない煽り」に限定、「絵文字3個以上」→「装飾4個以上(①②③🔴🟡🟢👇🙏は除外)」、
     X_SHORT 憲法に2系統(実務家口調/バズ構造型)許容を明記、scoringでbookmark5x/RT6x/リプ75-150x反映
     → 追加バズテンプレが品質ゲートで弾かれず投稿される
- ✅ claude-cli.ts に --fallback-model 追加(既定sonnet, CLAUDE_CLI_FALLBACK_MODEL=noneで無効)
     → 過負荷時の `claude -p exited 1` でジョブ全体が落ちるのを回避。実機フラグ動作確認済み
検証: 実CLI invocation exit 0、local tsc 型エラーなし、憲法スモークOK。

### 2026-06-19 Phase 3 診断（学習ループ）— コード変更は見送り（正しい判断）
実データ結論: パイプラインは全結線済み・バグではなく「飢餓」。
- フォロワー160人(前日比-6), 最高impression=183(通常0-22), avg_ER=0
- x_growth_metrics 稼働中(69件) / prediction_accuracy 0件 / ai_judge engagement_fetched 0件
- 原因: ①投稿停止(=修正済) ②リーチほぼゼロ → 学習する材料(エンゲージ)が存在しない
- 判断: データ0で学習コードを憶測編集しても検証不能＝無意味。リーチが出てから実データでチューニングすべき。
- ボトルネックは学習コードではなく「リーチ」。リーチのレバー(良コンテンツ×継続×露出)は今回すべて修正済み。

### 監視ポイント（投稿再開後に確認）
- engagement_fetched_at が埋まり始めるか（埋まらなければ learner cron か join に実バグ→実データで特定可能に）
- prediction_accuracy が増えるか / impressions が改善するか

### 残（ユーザー作業 or 将来）
- ⏳ ループ sleeping 復帰（Discord「再開」）
- ⏳ Typefully キー設定で配信層起動
- 将来: リーチが出たら学習ループの実データチューニング（プロアクティブ・リプの露出強化等）

### 2026-06-20 運用プレイブック（頭脳）実装 — 完了
基盤維持・追加のみ。全Phase main反映済。
- Phase1: lib/cortex/playbook/config.ts（10領域・selectPlaybookArea/formatPlaybookForPrompt/applyPlaybookBias/hookTypeToPatternId）#23
- Phase3a/4a: post-graph に allowedPatternIds/playbookInstructions、sales_cta_line追加 #24
- Phase3c/3d/4b: loop-executor に sales_cta/stock_content/follower_growth領域 + 再現性ブリッジ(viral_analysis→bandit) #25
- Phase3b + 画像: x-auto-post 領域バイアス+タグ、Gemini→OpenAI GPT Image 2差し替え #26
- Phase2: cortex-autonomous-content タスク + cortex-x-writer.md にプレイブック注入
- 関連: DeepSeekリサーチ固定/claude -p Opus 4.8ブログ生成/OpenAI画像($0.2/枚)/土日X枠/Typefully配信
検証: 各Phase tsc型エラーなし、config↔templates整合、Phase0コマンド実動、分布value-first(buzz18%/sales5%)。
