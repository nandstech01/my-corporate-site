# nands-bot: Slack AI Employee System

## What Is This?

Slack DM 経由で操作する AI デジタル従業員。スマホからの X 投稿管理・リサーチ・分析を自律的に行う。
指示待ちではなく、自分から提案・学習・報告するタイプ。

LangGraph ReAct エージェント + GPT-4o + 8 ツールで構成。

---

## Architecture

```
Slack DM
  │
  ├─ POST /api/slack/events ─── メッセージ受信 (3秒ack + waitUntil)
  │     │
  │     └─ LangGraph ReAct Agent (agent-graph.ts)
  │           │
  │           ├─ loadMemory ─── 会話履歴 + 学習メモリ読み込み
  │           ├─ agent ──────── GPT-4o がツール選択・実行を自律判断
  │           ├─ tools ──────── 8ツール実行
  │           └─ shouldContinue ── ツール呼び出しがあればループ、なければEND
  │
  ├─ POST /api/slack/interactions ── 承認ボタン処理 (HITL)
  │     │
  │     ├─ approve_post → postTweet() → X投稿実行
  │     ├─ reject_post  → キャンセル
  │     ├─ approve_blog → GitHub Actions workflow_dispatch
  │     └─ edit_action  → スレッドで修正指示を促す
  │
  └─ GitHub Actions Cron
        ├─ 毎朝 JST 9:00  → daily-suggestion (投稿ネタ提案)
        ├─ 月曜 JST 10:00 → weekly-report (週次レポート)
        └─ 毎晩 JST 0:00  → engagement-learner (エンゲージメント学習)
```

---

## File Map

```
lib/slack-bot/
├── OVERVIEW.md              ← このファイル
├── agent-graph.ts           ← LangGraph ReAct Agent 本体
├── tools.ts                 ← 8ツール定義 (LangChain tool())
├── memory.ts                ← Supabase CRUD (会話/メモリ/分析/承認)
├── slack-client.ts          ← Slack WebAPI ラッパー + Block Kit
├── system-prompt.ts         ← エージェントの人格・応答スタイル
├── types.ts                 ← 全型定義
└── proactive/
    ├── daily-suggestion.ts  ← 毎朝の投稿ネタ提案
    ├── weekly-report.ts     ← 週次パフォーマンスレポート
    └── engagement-learner.ts ← エンゲージメント学習

app/api/slack/
├── events/route.ts          ← Slack Events API (メッセージ受信)
└── interactions/route.ts    ← Slack Interactions (承認ボタン)

scripts/
└── slack-bot-cron.ts        ← GitHub Actions 用 cron エントリーポイント

.github/workflows/
└── slack-bot-cron.yml       ← 3つのcronスケジュール定義

supabase/migrations/
└── 20260211000000_create_slack_bot_tables.sql ← 4テーブル作成
```

---

## Core: agent-graph.ts

LangGraph の `StateGraph` で ReAct パターンを実装。

**State:**
| フィールド | 型 | 説明 |
|---|---|---|
| messages | BaseMessage[] | messagesStateReducer で自動管理 |
| slackChannelId | string | Slack チャンネルID |
| slackUserId | string | Slack ユーザーID |
| slackThreadTs | string \| null | スレッドタイムスタンプ |
| memoryContext | string | loadMemory で設定される学習メモリ文字列 |

**Graph Flow:**
```
START → loadMemory → agent → shouldContinue
                                ├─ tool_calls あり → tools → agent (ループ)
                                └─ tool_calls なし → END
```

**Model:** `ChatOpenAI` (GPT-4o, temperature 0.7)

**Public API:**
```typescript
runAgent({
  message: string,
  slackChannelId: string,
  slackUserId: string,
  slackThreadTs: string | null,
}): Promise<string>
```

会話はSupabase `slack_conversations` に自動保存 (user/assistant 両方)。

---

## 8 Tools (tools.ts)

`createTools(ctx: AgentContext)` でクロージャ生成。ctx にはSlackチャンネル/ユーザー/スレッド情報が入る。

| # | Tool | 入力 | HITL | 既存モジュール再利用 |
|---|---|---|---|---|
| 1 | `generate_x_post` | topic?, slug?, mode | No | `generateXPost()` from post-graph.ts |
| 2 | `post_to_x` | text, longForm? | **Yes** | `postTweet()` from x-api/client.ts |
| 3 | `search_articles` | query | No | Supabase posts/chatgpt_posts テーブル直接検索 |
| 4 | `research_topic` | topic, url? | No | `researchTopic()` from data-fetchers.ts |
| 5 | `trigger_blog_gen` | title, outline | **Yes** | GitHub Actions workflow_dispatch |
| 6 | `recall_memory` | query | No | `recallMemories()` from memory.ts |
| 7 | `save_memory` | content, type, importance | No | `saveMemory()` from memory.ts |
| 8 | `fetch_x_analytics` | days? | No | `getPostAnalytics()` from memory.ts |

**HITL (Human-in-the-Loop):**
post_to_x と trigger_blog_gen は直接実行せず、`slack_pending_actions` テーブルに保存し、
Slack に承認ボタン付きメッセージ (Block Kit) を送信。ユーザーが Approve を押すと
`/api/slack/interactions` 経由で実際の投稿/ブログ生成が実行される。

**既知の制約:**
- LangChain `tool()` + Zod で TS2589 (deep type instantiation) が発生。全8ツールに `@ts-expect-error` 付き。
- agent-graph.ts で `tools as any` キャストあり（同じ理由）。

---

## Memory Layer (memory.ts)

Supabase `service_role` キーで全テーブルにアクセス。

**会話履歴 (`slack_conversations`):**
- `saveConversationMessage()` — user/assistant メッセージ保存
- `getConversationHistory()` — チャンネル+スレッド単位で取得 (limit付き)

**HITL承認 (`slack_pending_actions`):**
- `createPendingAction()` — pending状態で作成
- `resolvePendingAction()` — approved/rejected に更新
- `getPendingAction()` — ID指定で取得

**学習メモリ (`slack_bot_memory`):**
- `saveMemory()` — preference/feedback/fact/style/timing の5種類
- `recallMemories()` — importance降順で取得、last_accessed_at 自動更新

**X投稿分析 (`x_post_analytics`):**
- `savePostAnalytics()` — 投稿時に記録
- `getPostAnalytics()` — 期間指定で取得
- `updatePostEngagement()` — likes/RT/replies/impressions 更新
- `getRecentTweetIds()` — 直近N時間のtweet_id一覧

---

## Slack Client (slack-client.ts)

`@slack/web-api` の `WebClient` をシングルトンで管理。

**API:**
- `sendMessage()` — メッセージ送信 (Block Kit対応, スレッド対応)
- `updateMessage()` — メッセージ更新
- `buildApprovalBlocks()` — Approve/Edit/Reject 3ボタン付きBlock Kit
- `buildAnalyticsBlocks()` — レポート用ヘッダー+セクション
- `buildSuggestionBlocks()` — 投稿提案カード (各候補にCreateボタン + Skipボタン)

---

## System Prompt (system-prompt.ts)

エージェントの人格定義。`buildSystemPrompt(memoryContext)` で生成。

**応答スタイル:**
- タメ口・カジュアル・Discordノリ
- 敬語禁止 (「です・ます」不可、「〜だよ」「〜するね」「〜じゃん」)
- 1メッセージ 2-4行
- 段落改行
- 絵文字自然使用 (:mag: :pencil: :fire: :eyes:)

memoryContext が存在する場合、末尾に「過去の学習・記憶」セクションが付加される。

---

## API Routes

### /api/slack/events (events/route.ts)

Slack Events API ハンドラー。

**処理フロー:**
1. `url_verification` → challenge 返却 (初回設定)
2. `x-slack-retry-num` ヘッダーあり → 即200返却 (リトライ防止)
3. HMAC SHA256 署名検証 (5分以内 + timingSafeEqual)
4. `event_callback` + message タイプのみ処理
5. bot_id ありは無視 (ループ防止)
6. `SLACK_ALLOWED_USER_IDS` による許可リスト検証
7. `waitUntil()` でバックグラウンド処理 → 即200返却

**Vercel/ローカル互換:**
```typescript
const waitUntilFn = await import('@vercel/functions')
  .then((m) => m.waitUntil)
  .catch(() => null)

if (waitUntilFn) {
  waitUntilFn(processSlackMessage(event))  // Vercel
} else {
  processSlackMessage(event).catch(() => {})  // ローカル
}
```

### /api/slack/interactions (interactions/route.ts)

Slack Block Actions ハンドラー。`application/x-www-form-urlencoded` で受信。

**対応アクション:**
| action_id | 処理 |
|---|---|
| approve_post | `postTweet()` 実行 → analytics保存 → URL返却 |
| reject_post | pending_action を rejected に更新 |
| approve_blog | GitHub Actions `workflow_dispatch` 呼び出し |
| reject_blog | reject_post と同じ処理 |
| edit_action | 「修正指示をスレッドに書いて」と案内 |

---

## Proactive Features (Cron)

GitHub Actions cron で定時実行。`scripts/slack-bot-cron.ts` がエントリーポイント。
`CRON_JOB` 環境変数 or UTC時刻で自動判定。

### daily-suggestion.ts (毎朝 JST 9:00)

1. Brave Search で3カテゴリのトレンド収集
   - 「AI 最新ニュース 今日」
   - 「LLM エージェント 新機能」
   - 「テック スタートアップ 注目」
2. 過去30日の投稿パフォーマンスからベストパターン分析
3. 学習メモリからユーザーの好み参照
4. Block Kit でSuggestionカード送信 (各候補にCreateボタン)

### weekly-report.ts (毎週月曜 JST 10:00)

1. 直近7日間の `x_post_analytics` 集計
2. ベスト/ワースト投稿特定
3. JST時間帯別エンゲージメント分析
4. 学習内容を `slack_bot_memory` に自動保存 (importance: 0.7)
5. Block Kit でレポート送信

### engagement-learner.ts (毎晩 JST 0:00)

1. 直近48時間の投稿tweet_idを取得
2. X API v2 (`singleTweet`) で最新メトリクス取得
3. `x_post_analytics` 更新
4. 平均の1.5倍以上のエンゲージメントを「高パフォーマー」として特定
5. 特徴を `slack_bot_memory` に保存 (importance: 0.8)

---

## Supabase Tables

4テーブル。全て RLS 有効 + `service_all` ポリシー (service_role でフルアクセス)。

### slack_conversations
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| slack_channel_id | TEXT | |
| slack_user_id | TEXT | |
| slack_thread_ts | TEXT | nullable |
| role | TEXT | user/assistant/system/tool |
| content | TEXT | |
| tool_calls | JSONB | nullable |
| metadata | JSONB | nullable |
| created_at | TIMESTAMPTZ | |

Index: `(slack_channel_id, created_at DESC)`, `(slack_thread_ts, created_at)`

### slack_pending_actions
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| slack_channel_id | TEXT | |
| slack_user_id | TEXT | |
| slack_thread_ts | TEXT | nullable |
| action_type | TEXT | post_x/post_x_long/trigger_blog |
| payload | JSONB | |
| preview_text | TEXT | nullable |
| status | TEXT | pending/approved/rejected/expired |
| created_at | TIMESTAMPTZ | |
| resolved_at | TIMESTAMPTZ | nullable |

### slack_bot_memory
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| slack_user_id | TEXT | |
| memory_type | TEXT | preference/feedback/fact/style/timing |
| content | TEXT | |
| context | JSONB | nullable |
| importance | FLOAT | 0-1, default 0.5 |
| access_count | INT | default 0 |
| last_accessed_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |

Index: `(slack_user_id, importance DESC)`

### x_post_analytics
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| tweet_id | TEXT | UNIQUE |
| tweet_url | TEXT | nullable |
| post_text | TEXT | |
| post_mode | TEXT | article/research/pattern, nullable |
| pattern_used | TEXT | nullable |
| posted_at | TIMESTAMPTZ | |
| likes/retweets/replies/impressions | INT | default 0 |
| engagement_rate | FLOAT | default 0 |
| fetched_at | TIMESTAMPTZ | |
| tags | TEXT[] | nullable |

Index: `(posted_at DESC)`

---

## Type Definitions (types.ts)

全プロパティ `readonly`。

- **Supabase型:** SlackConversation, SlackPendingAction, SlackBotMemory, XPostAnalytics
- **Slack型:** SlackEvent, SlackEventPayload, SlackInteractionPayload
- **Agent型:** AgentContext
- **Tool Input型:** GenerateXPostInput, PostToXInput, SearchArticlesInput, ResearchTopicInput, TriggerBlogGenInput, RecallMemoryInput, SaveMemoryInput, FetchXAnalyticsInput

---

## Existing Modules Reused (変更なし)

| Module | Path | Used By |
|---|---|---|
| `generateXPost()` | lib/x-post-generation/post-graph.ts | tools.ts (generate_x_post) |
| `postTweet()` | lib/x-api/client.ts | tools.ts (post_to_x), interactions/route.ts |
| `getTwitterClient()` | lib/x-api/client.ts | engagement-learner.ts |
| `fetchArticle()` | lib/x-post-generation/data-fetchers.ts | tools.ts (generate_x_post) |
| `researchTopic()` | lib/x-post-generation/data-fetchers.ts | tools.ts (research_topic) |
| `searchBrave()` | lib/x-post-generation/data-fetchers.ts | daily-suggestion.ts |

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `SLACK_BOT_TOKEN` | Bot User OAuth Token (xoxb-...) |
| `SLACK_SIGNING_SECRET` | HMAC SHA256 署名検証用 |
| `SLACK_ALLOWED_USER_IDS` | 許可ユーザーID (カンマ区切り) |
| `SLACK_DEFAULT_CHANNEL` | proactive通知先チャンネルID |
| `OPENAI_API_KEY` | GPT-4o (エージェントLLM) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role |
| `BRAVE_API_KEY` | Brave Search (リサーチ/提案) |
| `TWITTER_API_KEY/SECRET` | X API v1.1 (投稿用) |
| `TWITTER_ACCESS_TOKEN/SECRET` | X API ユーザートークン |

---

## Security

- **署名検証:** 全リクエストで HMAC SHA256 + timingSafeEqual + 5分タイムスタンプ検証
- **許可リスト:** `SLACK_ALLOWED_USER_IDS` 以外のユーザーは無視
- **HITL:** X投稿とブログ生成は必ず承認ボタン経由 (勝手に実行しない)
- **RLS:** 全テーブル RLS 有効、service_role のみアクセス
- **リトライ防止:** `x-slack-retry-num` ヘッダーで重複処理を防止
- **ループ防止:** bot_id 付きメッセージは無視

---

## npm Dependencies (追加分)

```
@slack/web-api    — Slack WebClient
@slack/types      — Block Kit 型定義
@vercel/functions — waitUntil (Vercel環境のみ)
```

---

## Development

```bash
# ローカル起動
npm run dev

# ngrok トンネル (Slack Webhook用)
ngrok http 3000

# Slack App設定で以下のURLを設定:
# Event Subscriptions:  https://<ngrok>.ngrok-free.dev/api/slack/events
# Interactivity:        https://<ngrok>.ngrok-free.dev/api/slack/interactions

# cron ジョブ手動実行
CRON_JOB=daily-suggestion npx tsx scripts/slack-bot-cron.ts
CRON_JOB=weekly-report npx tsx scripts/slack-bot-cron.ts
CRON_JOB=engagement-learner npx tsx scripts/slack-bot-cron.ts
```

---

## Conversation Example

```
User: 最近のAI関連ニュースでX投稿作って

Bot: おっけー！ちょっと調べてくるね :mag:
     [research_topic → generate_x_post を自動実行]

Bot: できたよ〜確認してみて :eyes:
     ───────────────────────
     Claude 4.5のコーディング性能が話題に。
     特にエージェント型開発での活用が注目される...
     #AI #Claude #開発効率化
     ───────────────────────
     [Approve] [Edit] [Reject]

User: [Approve をクリック]

Bot: :white_check_mark: Posted to X!
     https://x.com/nands_tech/status/123456789
```
