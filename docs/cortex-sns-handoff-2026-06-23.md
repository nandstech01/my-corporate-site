# CORTEX SNS自動運用 — セッション引き継ぎ書（2026-06-23）

このドキュメントは、CORTEX（@NANDS_AI のX自律運用システム）を「停止状態」から「フルファネル自律運用＋学習」まで構築した作業の詳細な引き継ぎ。次セッションはまずこれと `~/.claude/projects/-Users/memory/cortex-sns-architecture.md` を読むこと。

リポジトリ: `/Users/nands/my-corporate-site`（mainブランチ）

---

## 0. 背景・ゴール
- 目的: 「自動でバズる」＝高品質なSNS（特にX）コンテンツを自律配信し、フォロワーを伸ばす。
- 開始時の問題: CORTEXが約2.5ヶ月停止（X投稿停止／AI-to-AIループ sleeping／impressions≒0）。
- 方針: 既存エンジン（生成パイプライン・パターンバンディット・学習・配信）を壊さず、上に戦略層を載せる「置き換えず追加」。
- 制約(ユーザー規約): SNS関連ファイルのみ変更。既存パターン削除禁止。ライブのbio/ブログは自動公開しない。秘密鍵をチャット/Discordに出さない。

---

## 1. アーキテクチャ全体像（現状）

```
[自律ドライバー]                    [生成]                         [配信]
GH Actions cron (always-on) ──┐
  cortex-autonomous-x.yml      ├─→ プレイブック領域選定 ──→ Brave自前リサーチ ─┐
  (JST 8:00/20:00)             │     (lib/cortex/playbook)                      │
ローカル scheduled task ───────┤                                                ├→ generateXPost
  cortex-autonomous-content    │   (lib/x-post-generation/post-graph)           │   (許可パターン+意図注入)
  (JST 7:30/19:30 ※アプリ起動時)│                                                │      │
cortex-blog-seo (火金 ※下書き) ─┘                                               │      ▼
                                                                      品質ゲート(critique/ai-judge)
                                                                                       │
                                                                                       ▼
                                                                          Typefully API v2
                                                                          (next-free-slot枠で自動配信)
                                                                                       │
                                                                                       ▼
                                                                                  X(@NANDS_AI)
[学習ループ]
 投稿時 x_post_analytics に tweet_id='pending:<draftId>'+pattern_used で仮記録
   → 次回実行で Typefully の x_published_url から実tweet_idへ更新(reconcile)
   → engagement-learner(既存cron)が tweet_id でエンゲージ計測 → recordPatternOutcome
   → パターンバンディット(Thompson) + 再現性ブリッジ(cortex_viral_analysis→bandit) が「伸びる型」を強化
```

### LLM/生成のキモ（重要）
- 生成は `claude -p`（無料サブスク）優先。**ただしGitHub Actions runnerでは keychain認証が無く `claude -p` が動かない**（OAuthトークンを入れても exited 1）。
- そのため `lib/llm/claude-cli.ts` に**フォールバック**を実装: claude -p 失敗時 → **OpenAI**（課金済・gpt-5-mini/gpt-4o-mini）→ Anthropic API（保険・現在残高ゼロ）。
- 結果: ローカル対話セッション=無料claude -p / runner=OpenAI（短文で安価）。
- `mapToOpenAiModel`: opus→gpt-5-mini, sonnet→gpt-5-mini, haiku→gpt-4o-mini（`CORTEX_OPENAI_STRONG=true`でopus→gpt-5.2に引上げ可）。

---

## 2. 配信: Typefully（X APIキー不要）
- 投稿は自前のX APIを使わず **Typefully API v2** 経由。Typefullyが連携済Xアカウントへ公開。
- クライアント: `lib/typefully/client.ts`（`createTypefullyDraft` / `uploadTypefullyMedia` / `resolveSocialSetId`）。
- 認証: `Authorization: Bearer <TYPEFULLY_API_KEY>`。social set id = `315461`（@NANDS_AI）。
- `postTweet`(lib/x-api/client.ts) は `TYPEFULLY_ENABLED=true` の時 Typefully経路を最優先（失敗時は既存Playwright/XAPIへフォールスルー）。
- 投稿スケジュール枠(Typefully Calendar): **平日 08:00/12:00/14:00/17:00/20:00、土日 12:00/14:00/20:00（JST）**、Natural Posting Times(±4分)ON。
- v1は廃止済（v1呼ぶと403）。`x_published_url` 等のフィールドで公開後のtweet_idが取れる。

## 3. 画像: OpenAI GPT Image 2（Gemini廃止）
- `lib/ai-image/openai-image.ts` `generateNeonThumbnail()`：ネオン・インフォグラフィック、high 1536×1024、毎回バリエーション。料金≈$0.17–0.21/枚。
- Gemini画像は無料枠limit:0で廃止。`cross-post/thumbnail-generator` `daily-buzz/runner` `tweet-reactor` もOpenAIへ差し替え済。
- 方針: 1投稿=高品質1枚に集中（4-5枚作らない）。X投稿への添付は `uploadTypefullyMedia`→`mediaIds`。

## 4. リサーチ: DeepSeek（ディープリサーチ）/ Brave（自前リサーチ）
- ディープリサーチ(blog)は `deepseek-chat`（`app/api/deep-research`、DEEPSEEK_API_KEY設定済、激安）。
- 自前リサーチ(X) は `lib/web-search/brave.ts` `braveWebSearch`（BRAVE_API_KEY）。

## 5. ブログ: 自社サイト(nands.tech) 自動生成
- `app/api/generate-hybrid-blog`：スクレイピング+ディープリサーチ(DeepSeek)+RAG+生成。**生成は claude -p(Opus 4.8)に切替**（OpenAI/DeepSeek障害回避、ローカル無料）。タイムアウト600s、フォールバックsonnet。
- 注意: claude -p はローカル/対話のみ。本番Vercelでは動かない（claude無し）。`cortex-blog-seo`タスクはローカル生成方式。
- H2図解(Gemini)は無料枠で出ない場合あり（OpenAI課金で改善余地）。記事は**下書き(draft)で生成→人間が確認して公開**（自動公開しない）。

## 6. 頭脳: 運用プレイブック（フルファネル）
- `lib/cortex/playbook/config.ts` が単一の真実。10領域: research / ideation / buzz / sales / monetization / stock / planning / buzz_analysis / engagement / follower_growth。
- 各領域→{eligiblePatternIds(既存27パターンの部分集合) / mode / intentInstruction(JP) / cadenceWeight / tag}。
- `selectPlaybookArea()`(value-first重み: buzz0.18/research0.15…sales0.05/monetization0.05/follower0.05)、`formatPlaybookForPrompt()`、`applyPlaybookBias()`、`hookTypeToPatternId()`(再現性ブリッジ)。
- 生成への注入(後方互換): `post-graph.ts` の `PostGraphInput.allowedPatternIds` / `playbookInstructions`。`x-auto-post` は `playbookMode` で配信重みをnudge＋`playbook:<area>`タグ。
- ループにも領域追加: `loop-executor.ts` TOPIC_ROTATIONに sales_cta/stock_content/follower_growth、`pattern_optimize`に再現性ブリッジ。follower_growthは**提案のみ**(bio自動編集しない)。

## 7. 文章テンプレ/ボイス（品質）
- `lib/x-post-generation/pattern-templates.ts`：バズ型10種(保存版〇選/速報/今日のまとめ/数字ショック/待って。型 等)＋高品質3版(`save_manual`/`result_first_bullets`/`curation_take`)＋`sales_cta_line`。計27。
- **「同じ経験した人いる？」等の安易な疑問形締めは禁止**(avoid_expressions登録、good_expressionsから削除)。@masahirochaen/@ClaudeCode_UT のニュアンス参考(丸ごと模倣しない)。結果ファースト→箇条書き→出典/示唆/軽いCTAで締める。
- `lib/prompts/voice-profile.ts`：few-shotを断定締め/保存版型に更新、X整合に「安易な疑問形で締めるな」ガードレール。
- `lib/content-critique/platform-constitutions.ts`：バズ構造(【保存版】等/絵文字構造マーカー)を品質ゲートが弾かないようハイブリッド化。

## 8. 投稿量
- 「無駄撃ち廃止」で大幅削減: anthropic-reactor 15分毎→1日1回、x-auto-post 3→2、daily-buzz 3→1、viral系削減、proactive 6→2、daily-limit 3→5。
- Xは実質2-5本/日に収束。`scripts/slack-bot-cron.ts` の SCHEDULE_TO_JOB と `.github/workflows/{slack-bot-cron,high-freq-cron}.yml` のcronを同期済。

---

## 9. スケジュール/cron 一覧
| 種別 | 名前 | 時刻 | 役割 | 駆動 |
|---|---|---|---|---|
| GH Actions | `cortex-autonomous-x.yml` | JST 8:00/20:00 | 自己完結X投稿+学習reconcile | 常時(runner) |
| GH Actions | `slack-bot-cron.yml` | 多数 | 既存ジョブ群(x-auto-post等) | 常時(runner) |
| GH Actions | `high-freq-cron.yml` | reactor等 | 反応系(削減済) | 常時(runner) |
| ローカルtask | `cortex-autonomous-content` | JST 7:30/19:30 | プレイブックX投稿 | **アプリ起動時のみ** |
| ローカルtask | `cortex-blog-seo` | 火金 9:00 | ブログ下書き生成 | アプリ起動時のみ |

- **注意**: ローカルtaskはClaudeアプリ起動時のみ。常時稼働は `cortex-autonomous-x.yml`(runner)が担う。

## 10. GitHub Secrets（設定済）
`TYPEFULLY_ENABLED`(true) / `TYPEFULLY_API_KEY` / `TYPEFULLY_SOCIAL_SET_ID`(315461) / `CLAUDE_CODE_OAUTH_TOKEN`(※runnerでclaude -p動かず実質未使用) / `BRAVE_API_KEY` / `OPENAI_API_KEY`(課金済) / `ANTHROPIC_API_KEY`(残高ゼロ) / `DEEPSEEK_API_KEY` ほか既存。
- `.env.local` にも TYPEFULLY_* / OPENAI / DEEPSEEK 等あり（ローカル実行用）。

## 11. コスト
- ローカル生成: claude -p で無料。
- runner生成: OpenAIフォールバック（gpt-5-mini/gpt-4o-mini）。**月$3〜8見込み**。画像を出すと上振れ。
- **要ユーザー作業: OpenAIダッシュボードで月額上限$10を設定**（platform.openai.com → Settings → Limits → Monthly budget）。

## 12. 既知の課題・未完
- **X Premium**: ユーザー加入済(プロプラン)。長文/返信ブースト/分析が使える前提。プロフに「verified」反映は要確認。
- **エンゲージ計測**: engagement-learnerはPlaywright(`scrapeTweetMetrics`)依存。runnerでのX session(`X_PLAYWRIGHT_SESSION`)維持が前提。impressionsはX API無料枠では取れない（Premium分析/Playwright頼み）。
- **リーチ小**: 160フォロワー・実績ほぼ0。学習は数日〜数週でデータが溜まってから効く。
- **AI-to-AIループ**: `cortex_loop_state` sleeping。Discord(nands-workspace #一般)で「再開」送信＋AI-Aボット稼働が必要(コード側では起こせない)。今はプレイブック自律タスクが実質代替。
- **旧コレクター**: buzz/trending/linkedin_sources 収集が空(直近7日buzz=0)。x-auto-post(旧経路)はネタ切れだが、新 `cortex-autonomous-x` は自前リサーチで非依存。
- **ブログ画像**: GeminiからOpenAIへ未切替の箇所あり(h2-diagram-auto-generator)。`generate-hybrid-blog`のH2図解は要改善。
- **OAuthトークン**: チャットに一度貼られたためローテーション推奨(`claude setup-token`→Secret更新)。

## 13. 主要ファイル早見表
- プレイブック: `lib/cortex/playbook/config.ts`
- 生成: `lib/x-post-generation/post-graph.ts`, `pattern-templates.ts`, `lib/prompts/voice-profile.ts`
- 配信: `lib/typefully/client.ts`, `lib/x-api/client.ts`
- 画像: `lib/ai-image/openai-image.ts`
- LLM/フォールバック: `lib/llm/claude-cli.ts`
- 自律スクリプト: `scripts/cortex-autonomous-x.ts`（+ `.github/workflows/cortex-autonomous-x.yml`）
- 学習: `lib/learning/pattern-bandit.ts`, `lib/slack-bot/proactive/engagement-learner.ts`, `lib/cortex/autonomous/loop-executor.ts`
- ブログ: `app/api/generate-hybrid-blog/route.ts`, `app/api/deep-research/route.ts`

## 14. このセッションのPR（main反映済）
#15 Typefullyシーム+バズテンプレ+投稿量削減 / #16 品質ゲートのバズ許可+claude -p fallback-model / #17 Typefully v2移行 / #18 cron env配線 / #19 画像添付(v2 media) / #20 ブログ生成claude -p Opus4.8 / #21 ブログ生成timeout/fallback / #22 OpenAI GPT Image2生成器 / #23 プレイブックconfig / #24 生成シーム+sales_cta_line / #25 ループ領域+再現性ブリッジ / #26 x-auto-postバイアス+画像OpenAI差替 / #27 エージェント注入 / #28 ボイス品質(疑問形締め廃止+3版) / #29 自己完結X cron+trend-watcher修正 / #30 runner claude認証+APIフォールバック / #31 OpenAIフォールバック優先 / #32 学習ループ閉鎖+コスト最適化

## 15. 検証済みの事実
- Typefully経由でX実投稿成功（複数、@NANDS_AIにライブ）。
- `cortex-autonomous-x.yml` をrunnerで実行→OpenAIフォールバックで生成→Typefully投入成功(completed/success)。
- 学習reconcile: `pending:9613184`→実tweet_id `2069222790964949163` へ更新を実地確認。
- 各変更 tsc 型エラーなし。プレイブック分布 value-first。

## 16. 次にやると良いこと（優先順）
1. OpenAI $10上限の設定（ユーザー作業）。
2. 数日運用 → エンゲージ実績を見てプレイブック cadence/意図/テンプレを `config.ts` で微調整。
3. ブログH2図解をOpenAIに統一 / generate-hybrid-blog の図解安定化。
4. engagement計測の堅牢化（PlaywrightのX session維持、またはTypefully/別経路）。
5. （任意）AI-to-AIループ再開 or 廃止判断（自律タスクで代替済）。
6. （任意）OAuthトークンのローテーション。
