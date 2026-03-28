# CORTEX Implementation Plan

## Executive Summary

CORTEXは「使うほど賢くなるSNS運用エンジン」。
既存の30+ CronジョブML学習パイプラインの上に、
**Discord (Claude Code) をナレッジエンジン**として接続し、
LINE Harnessを操作UIとして統合する。

**核心の問い**: Discord/Claude Codeが「答え」を持つとはどういうことか？

**答え**: 以下5層のデータに基づく判断ができること。
1. **内部実績データ** (既存: pattern_performance, x_post_analytics, engagement学習)
2. **プラットフォームアルゴリズム知識** (NEW: 各SNSの公式ガイドライン+アルゴリズム特性DB)
3. **競合・インフルエンサー構造分析** (NEW: バズった投稿の"なぜ"を構造的に記録)
4. **時系列パターンマイニング** (ENHANCE: 既存timing dataの深層分析)
5. **トレンド鮮度スコアリング** (ENHANCE: buzz_posts + trending_collectorの統合)

---

## Safety Principles (絶対遵守)

1. **既存テーブルのALTER禁止** — 新テーブルのCREATEのみ
2. **既存CronジョブのロジックALTER禁止** — 新モジュール追加のみ
3. **既存APIエンドポイント変更禁止** — 新エンドポイント追加のみ
4. **既存のimportパス変更禁止** — 新ファイルからの既存モジュール参照は可
5. **RLSポリシー: service_role only** — 新テーブルは全てservice_role限定
6. **全マイグレーションはIF NOT EXISTS** — 冪等性保証

---

## Phase 0: ナレッジ基盤 (Knowledge Foundation)
**目的**: Claude Codeが「答え」を持つためのデータ基盤を作る

### 0-1. Platform Algorithm Knowledge Base (新テーブル)
**根拠**: 現状、各プラットフォームのアルゴリズム知識はLLMの学習データに依存。
しかしX/LinkedIn/Threadsのアルゴリズムは頻繁に変わる。
構造化されたナレッジDBがあれば、Claude Codeは「最新の根拠」で回答できる。

```sql
-- supabase/migrations/YYYYMMDD_create_cortex_knowledge_base.sql

CREATE TABLE IF NOT EXISTS cortex_platform_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('x', 'linkedin', 'threads', 'instagram', 'youtube', 'zenn', 'qiita')),
  rule_category TEXT NOT NULL CHECK (rule_category IN (
    'algorithm',       -- アルゴリズムの仕組み（エンゲージメント速度、リプライ比率等）
    'content_policy',  -- コンテンツポリシー（禁止事項、制限）
    'best_practice',   -- 公式推奨プラクティス
    'rate_limit',      -- API/投稿レート制限
    'format',          -- 文字数、メディア仕様
    'monetization'     -- 収益化条件
  )),
  rule_title TEXT NOT NULL,
  rule_description TEXT NOT NULL,
  source_url TEXT,          -- 公式ドキュメントURL
  source_type TEXT CHECK (source_type IN ('official_doc', 'official_blog', 'api_changelog', 'verified_experiment', 'community_consensus')),
  confidence FLOAT DEFAULT 0.8 CHECK (confidence >= 0 AND confidence <= 1),
  effective_from DATE,      -- いつから有効か
  deprecated_at DATE,       -- 廃止日（NULLなら現行）
  verified_by_data BOOLEAN DEFAULT false, -- 自社データで検証済みか
  verification_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cortex_platform_rules_platform ON cortex_platform_rules(platform, rule_category);
CREATE INDEX IF NOT EXISTS idx_cortex_platform_rules_active ON cortex_platform_rules(platform) WHERE deprecated_at IS NULL;
```

**初期データ**: Claude Codeがディープリサーチで各プラットフォームの公式ドキュメント・ブログ・APIドキュメントを読み込み、構造化して格納。

### 0-2. Viral Structure Analysis (新テーブル)
**根拠**: 現状のbuzz_posts はメトリクス（likes, retweets等）のみ保存。
「なぜバズったか」の構造分析が欠落。
pattern-extractor.ts は hook_type, structure_type, closing_type を検出するが、DBに保存していない。

```sql
CREATE TABLE IF NOT EXISTS cortex_viral_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buzz_post_id UUID,  -- buzz_postsへの参照（外部キーは設定しない＝既存影響ゼロ）
  platform TEXT NOT NULL,
  original_text TEXT NOT NULL,
  author_handle TEXT,

  -- 構造分析（pattern-extractor.tsの出力を永続化）
  hook_type TEXT,          -- question, statistic, bold_claim, story
  structure_type TEXT,     -- listicle, thread, narrative, comparison
  closing_type TEXT,       -- question, cta, statement
  emoji_count INT DEFAULT 0,
  hashtag_count INT DEFAULT 0,
  char_length INT,

  -- 深層分析（LLM解析結果）
  emotional_trigger TEXT,    -- 感情トリガー（驚き、怒り、共感、恐怖、希望）
  information_density FLOAT, -- 情報密度スコア（0-1）
  novelty_score FLOAT,      -- 新規性スコア（0-1）
  authority_signal TEXT,     -- 権威性のシグナル（数字、実績、肩書き等）
  controversy_level FLOAT,  -- 議論性レベル（0-1）
  actionability FLOAT,      -- 実行可能性（0-1、読者がすぐ試せるか）

  -- メトリクス（buzz_postsから転写、分析時点のスナップショット）
  likes INT DEFAULT 0,
  reposts INT DEFAULT 0,
  replies INT DEFAULT 0,
  impressions INT DEFAULT 0,
  engagement_rate FLOAT DEFAULT 0,

  -- バズ要因の結論
  primary_buzz_factor TEXT,   -- 主要バズ要因（1文）
  secondary_factors TEXT[],   -- 副次要因
  anti_patterns TEXT[],       -- この投稿のアンチパターン（真似すべきでない点）
  replicability_score FLOAT,  -- 再現可能性スコア（0-1）

  analyzed_at TIMESTAMPTZ DEFAULT now(),
  analyzed_by TEXT DEFAULT 'claude-code'  -- 分析者
);
CREATE INDEX IF NOT EXISTS idx_cortex_viral_analysis_platform ON cortex_viral_analysis(platform, analyzed_at DESC);
CREATE INDEX IF NOT EXISTS idx_cortex_viral_analysis_factor ON cortex_viral_analysis(primary_buzz_factor);
```

### 0-3. Temporal Pattern Intelligence (新テーブル)
**根拠**: 既存のx_post_analytics にposted_atはあるが、
「何曜日の何時に何のトピックで投稿したら何のエンゲージメントが得られたか」の
クロス分析テーブルがない。

```sql
CREATE TABLE IF NOT EXISTS cortex_temporal_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=日曜
  hour_jst INT NOT NULL CHECK (hour_jst >= 0 AND hour_jst <= 23),
  topic_category TEXT,        -- AI, LLM, Claude Code, ビジネス, etc.
  content_type TEXT,          -- original, quote, thread, reply, article

  -- 集計メトリクス
  sample_count INT DEFAULT 0,
  avg_engagement_rate FLOAT DEFAULT 0,
  avg_likes FLOAT DEFAULT 0,
  avg_impressions FLOAT DEFAULT 0,
  max_engagement_rate FLOAT DEFAULT 0,

  -- 統計的信頼性
  std_dev FLOAT DEFAULT 0,
  confidence_interval_lower FLOAT DEFAULT 0,
  confidence_interval_upper FLOAT DEFAULT 0,

  -- 推奨度
  recommendation_score FLOAT DEFAULT 0, -- 0-1, サンプル数×平均ERの正規化

  period_start DATE NOT NULL,  -- 集計期間開始
  period_end DATE NOT NULL,    -- 集計期間終了
  calculated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cortex_temporal_platform ON cortex_temporal_patterns(platform, day_of_week, hour_jst);
```

### 0-4. Cortex Conversation Log (新テーブル)
**根拠**: Discord/LINEからの会話で得た改善指示・フィードバックを
構造化して保存し、将来のコンテンツ生成に反映する。

```sql
CREATE TABLE IF NOT EXISTS cortex_conversation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel TEXT NOT NULL CHECK (channel IN ('discord', 'line', 'slack')),
  conversation_type TEXT NOT NULL CHECK (conversation_type IN (
    'content_review',      -- コンテンツレビュー・改善
    'timing_discussion',   -- 配信タイミング相談
    'trend_analysis',      -- トレンド分析
    'strategy_update',     -- 戦略変更
    'learning_report',     -- 学習レポート
    'guideline_update',    -- ガイドライン更新
    'performance_review'   -- パフォーマンスレビュー
  )),
  summary TEXT NOT NULL,
  key_decisions TEXT[],       -- この会話で決まったこと
  action_items JSONB,         -- 実行すべきアクション
  affected_files TEXT[],      -- 変更が必要なファイルパス
  affected_platforms TEXT[],  -- 影響するプラットフォーム
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_cortex_conversation_status ON cortex_conversation_log(status, priority);
```

---

## Phase 1: ナレッジ収集エンジン (Knowledge Collector)
**目的**: Phase 0のテーブルにデータを自動投入するCronジョブ群

### 1-1. Platform Rule Collector (新ファイル)
**場所**: `lib/cortex/knowledge/platform-rule-collector.ts`

**ロジック**:
1. Brave Searchで各プラットフォームの公式ブログ・ヘルプセンターを検索
2. Claude Sonnetで構造化データに変換
3. 既存ルールとの差分検出（title + platform でUPSERT）
4. 変更があればSlack通知 + cortex_conversation_logに記録

**Cronスケジュール**: 週1回（日曜 UTC 18:00 = JST 03:00）
**既存影響**: なし（新ファイル、新テーブルのみ）

### 1-2. Viral Structure Analyzer (新ファイル)
**場所**: `lib/cortex/knowledge/viral-structure-analyzer.ts`

**ロジック**:
1. buzz_postsから過去7日の高スコア投稿を取得（既存テーブルのSELECTのみ）
2. pattern-extractor.tsの既存関数を呼び出し（import、変更なし）
3. Claude Sonnetで深層分析（感情トリガー、情報密度、新規性等）
4. cortex_viral_analysisにINSERT
5. 分析結果のサマリーをslack_bot_memoryにも保存（既存テーブルのINSERT）

**Cronスケジュール**: 毎日 UTC 16:00 = JST 01:00（engagement-learner直後）
**既存影響**: なし（既存テーブルはSELECT/INSERTのみ）

### 1-3. Temporal Pattern Miner (新ファイル)
**場所**: `lib/cortex/knowledge/temporal-pattern-miner.ts`

**ロジック**:
1. x_post_analytics, linkedin_post_analytics, threads_post_analyticsから
   過去90日のデータをSELECT
2. 曜日×時間帯×トピック×コンテンツタイプのクロス集計
3. statistics.tsの既存関数で信頼区間計算（importのみ）
4. cortex_temporal_patternsにUPSERT
5. 推奨時間帯をslack_bot_memoryに保存

**Cronスケジュール**: 週1回（月曜 UTC 17:00 = JST 02:00）
**既存影響**: なし（既存テーブルはSELECTのみ）

### 1-4. Deep Trend Researcher (新ファイル)
**場所**: `lib/cortex/knowledge/deep-trend-researcher.ts`

**根拠**: 既存のtrending-collector.tsはHN + Dev.toのタイトル取得のみ。
「なぜこのトピックが今ホットなのか」「どの角度が未開拓か」の深層分析が不足。

**ロジック**:
1. buzz_posts + trending_clientの結果を統合（既存関数のimportのみ）
2. Brave Searchで各トピックの関連記事を5-10件取得
3. Claude Sonnetで分析:
   - トピックの成熟度（黎明期/成長期/飽和期）
   - 未開拓角度（みんなが言っていること vs 誰も言っていないこと）
   - 日本市場での独自角度
   - 48時間以内の鮮度スコア
4. cortex_viral_analysisの trend_research カテゴリとして保存
5. 最も有望なトピックをslack_bot_memoryに保存

**Cronスケジュール**: 毎日3回 UTC 3:00, 9:00, 15:00（buzz-collector直後）
**既存影響**: なし

---

## Phase 2: Discord Intelligence Layer
**目的**: Claude Code (Discord) が全ナレッジにアクセスし、
「根拠のある回答」ができるようにする

### 2-1. Cortex Context Builder (新ファイル)
**場所**: `lib/cortex/discord/context-builder.ts`

**ロジック**: Discord会話時にClaude Codeが参照するコンテキストを構築

```typescript
export async function buildCortexContext(query: string): Promise<CortexContext> {
  // 1. プラットフォームルール（最新・有効なもの）
  const rules = await supabase
    .from('cortex_platform_rules')
    .select('*')
    .is('deprecated_at', null)
    .order('updated_at', { ascending: false });

  // 2. バイラル分析（過去30日の高スコア）
  const viralInsights = await supabase
    .from('cortex_viral_analysis')
    .select('*')
    .gte('analyzed_at', thirtyDaysAgo)
    .order('replicability_score', { ascending: false })
    .limit(20);

  // 3. 時間帯パターン（最新計算）
  const temporalPatterns = await supabase
    .from('cortex_temporal_patterns')
    .select('*')
    .order('recommendation_score', { ascending: false });

  // 4. パターン性能（既存テーブルのSELECT）
  const patternPerf = await supabase
    .from('pattern_performance')
    .select('*')
    .order('avg_engagement', { ascending: false });

  // 5. 最近のトレンド（既存 slack_bot_memory のSELECT）
  const trends = await supabase
    .from('slack_bot_memory')
    .select('*')
    .eq('context->>source', 'trending_topics')
    .order('created_at', { ascending: false })
    .limit(5);

  // 6. 直近の投稿実績（既存テーブルのSELECT）
  const recentPosts = await supabase
    .from('x_post_analytics')
    .select('*')
    .order('posted_at', { ascending: false })
    .limit(20);

  return { rules, viralInsights, temporalPatterns, patternPerf, trends, recentPosts };
}
```

### 2-2. Discord Command Handler (新ファイル)
**場所**: `lib/cortex/discord/command-handler.ts`

**Discord会話パターン（Claude Codeが処理）**:

#### A. コンテンツレビュー
```
User (Discord): 「この投稿をレビューして: [投稿テキスト]」

Claude Code Response:
1. cortex_platform_rulesから該当プラットフォームのルール取得
2. cortex_viral_analysisから類似の高パフォーマンス投稿を検索
3. cortex_temporal_patternsから最適投稿時間を提案
4. pattern_performanceから使用パターンの成功率を提示
5. 具体的改善案を根拠付きで提示:
   - 「X のアルゴリズムはリプライ率を重視（source: cortex_platform_rules #ID）」
   - 「同じhook_type=questionの投稿は平均ER 3.2%（source: cortex_viral_analysis 30日集計）」
   - 「火曜18時のoriginal投稿は平均impressions 5,200（source: cortex_temporal_patterns）」
```

#### B. トレンド分析
```
User (Discord): 「今日のバズネタは？」

Claude Code Response:
1. buzz_postsから過去24時間のトップ投稿取得
2. cortex_viral_analysisから構造分析結果を付与
3. deep-trend-researcherの結果から未開拓角度を提示
4. 「このネタで投稿するなら」の具体案を3パターン生成:
   - Quote RT案（source_urlつき）
   - Original投稿案（hook_templateつき）
   - Thread案（3ツイート構成）
```

#### C. パフォーマンスレビュー
```
User (Discord): 「今週の振り返り」

Claude Code Response:
1. x_post_analytics, linkedin_post_analytics等から7日分取得
2. pattern_performanceからパターン別成功率の変化を表示
3. cortex_temporal_patternsから時間帯別成績を表示
4. model_drift_logからMLモデルの健康状態を表示
5. 改善提案:
   - 「quote投稿の成功率が15%低下 → hook_type=questionへの切替を推奨」
   - 「木曜12時台のER高騰 → 週3回→4回に増やす価値あり」
```

#### D. ガイドライン確認
```
User (Discord): 「Xのアルゴリズム変更あった？」

Claude Code Response:
1. cortex_platform_rulesから最新updated_atのルールを取得
2. 変更があればdiffを表示
3. 自社データでの検証結果を付与（verified_by_data）
4. 影響範囲の評価と対応案
```

### 2-3. Auto-Improvement Engine (新ファイル)
**場所**: `lib/cortex/discord/auto-improver.ts`

**根拠**: Claude Codeがコード自体を改善する仕組み。
ただし安全性のため、PRベースで人間承認を必須とする。

**自動改善対象**（影響範囲が小さいもののみ）:
1. `lib/viral-hooks/hook-templates.ts` — 新パターン追加
2. `lib/slack-bot/proactive/*` のスコアリング閾値調整
3. `cortex_platform_rules` へのルール追加

**プロセス**:
1. 週次でcortex_viral_analysis + pattern_performanceを分析
2. 新しいバイラルパターンを検出 → hook-templates.tsに追加提案
3. スコアリング閾値の偏りを検出 → 調整提案
4. GitHub PRとして提出（`cortex/auto-improvement-YYYYMMDD` ブランチ）
5. Slack通知で人間承認を要求
6. 承認後マージ

**Cronスケジュール**: 週1回（水曜 UTC 19:00 = JST 04:00）
**既存影響**: 既存ファイルの変更はPR経由のみ（直接変更なし）

---

## Phase 3: LINE Harness統合
**目的**: LINEからSNS全操作を可能にする

### 3-1. LINE Webhook Receiver (新ファイル)
**場所**: `lib/cortex/line/webhook-handler.ts`

**ロジック**:
1. LINE Messaging API Webhookを受信
2. メッセージタイプに応じてルーティング:
   - テキスト → コマンドパーサー
   - Postback → アクション実行
   - Follow → 友だち追加処理（タグ付け）

### 3-2. LINE Command Router (新ファイル)
**場所**: `lib/cortex/line/command-router.ts`

**コマンド体系**:
```
「バズ」→ 今日のバズネタ一覧 + ワンタップ投稿ボタン
「投稿して」→ AIが投稿案生成 → Flex Messageで確認 → 承認で即投稿
「今週の成績」→ パフォーマンスサマリーカード
「トレンド」→ Deep Trend Research結果
「ルール確認」→ 最新プラットフォームガイドライン
「分析して [URL]」→ 競合投稿の構造分析
```

### 3-3. LINE → Discord Bridge (新ファイル)
**場所**: `lib/cortex/line/discord-bridge.ts`

**ロジック**:
1. LINEでの会話内容をcortex_conversation_logに保存
2. 複雑な分析リクエストはDiscord (Claude Code) に転送
3. Claude Codeの回答をLINE Flex Messageに変換して返送
4. 改善指示がある場合、affected_filesを特定してPR作成

### 3-4. SNS Funnel → LINE CRM (新ファイル)
**場所**: `lib/cortex/line/funnel-tracker.ts`

**ロジック**:
1. SNS投稿にLINE友だち追加URL埋め込み（utm_source付き）
2. 友だち追加時のWebhookでutm_sourceを取得
3. 流入元SNS + 興味トピックでタグ付け
4. タグベースのステップ配信開始（Flex Messageテンプレート）

---

## Phase 4: 学習ループ統合
**目的**: LINE/Discord/SNSの全データを閉ループで学習

### 4-1. Unified Learning Orchestrator (新ファイル)
**場所**: `lib/cortex/learning/unified-orchestrator.ts`

**ロジック**:
1. 各プラットフォームのengagement-learnerの結果を統合
2. cortex_viral_analysisの分析結果と突合
3. cortex_temporal_patternsを更新
4. パターン間の相関分析（Xで効いたhookがLinkedInでも効くか）
5. cortex_conversation_logの改善指示を反映度チェック

### 4-2. Cross-Channel Intelligence (新ファイル)
**場所**: `lib/cortex/learning/cross-channel-intelligence.ts`

**ロジック**:
1. LINE会話ログからのフィードバック抽出
2. Discord会話ログからの戦略変更抽出
3. Slack承認/却下パターンの分析
4. 全チャネルの知見をcortex_platform_rulesに反映

---

## Cronジョブ追加一覧

| ジョブ名 | スケジュール (UTC) | Phase | 既存影響 |
|---------|-------------------|-------|---------|
| cortex-platform-rule-collector | 日曜 18:00 | 1 | なし |
| cortex-viral-structure-analyzer | 毎日 16:00 | 1 | なし（SELECTのみ） |
| cortex-temporal-pattern-miner | 月曜 17:00 | 1 | なし（SELECTのみ） |
| cortex-deep-trend-researcher | 毎日 3:00,9:00,15:00 | 1 | なし |
| cortex-auto-improver | 水曜 19:00 | 2 | PRベースのみ |
| cortex-unified-learner | 毎日 17:00 | 4 | なし（SELECTのみ） |

---

## 新規ファイル一覧

```
lib/cortex/
├── knowledge/
│   ├── platform-rule-collector.ts    # Phase 1-1
│   ├── viral-structure-analyzer.ts   # Phase 1-2
│   ├── temporal-pattern-miner.ts     # Phase 1-3
│   └── deep-trend-researcher.ts      # Phase 1-4
├── discord/
│   ├── context-builder.ts            # Phase 2-1
│   ├── command-handler.ts            # Phase 2-2
│   └── auto-improver.ts              # Phase 2-3
├── line/
│   ├── webhook-handler.ts            # Phase 3-1
│   ├── command-router.ts             # Phase 3-2
│   ├── discord-bridge.ts             # Phase 3-3
│   └── funnel-tracker.ts             # Phase 3-4
├── learning/
│   ├── unified-orchestrator.ts       # Phase 4-1
│   └── cross-channel-intelligence.ts # Phase 4-2
└── types.ts                          # 共通型定義

supabase/migrations/
├── YYYYMMDD_create_cortex_knowledge_base.sql     # Phase 0-1
├── YYYYMMDD_create_cortex_viral_analysis.sql     # Phase 0-2
├── YYYYMMDD_create_cortex_temporal_patterns.sql  # Phase 0-3
└── YYYYMMDD_create_cortex_conversation_log.sql   # Phase 0-4

app/api/
├── cortex/
│   ├── line-webhook/route.ts         # Phase 3-1
│   └── discord-command/route.ts      # Phase 2-2
```

---

## 新規DBテーブル一覧（既存テーブル変更なし）

| テーブル名 | 行数見込み | 用途 |
|-----------|-----------|------|
| cortex_platform_rules | ~200 | プラットフォームルール |
| cortex_viral_analysis | ~50/日 | バイラル構造分析 |
| cortex_temporal_patterns | ~1000 | 時間帯パターン |
| cortex_conversation_log | ~10/日 | 会話ログ |

---

## 実装順序（Ralph Loop用）

### Step 1: DBマイグレーション作成 ✅ DONE
- [x] cortex_platform_rules テーブル作成
- [x] cortex_viral_analysis テーブル作成
- [x] cortex_temporal_patterns テーブル作成
- [x] cortex_conversation_log テーブル作成
- [x] RLSポリシー設定（service_role only）

### Step 2: 共通型定義 ✅ DONE
- [x] lib/cortex/types.ts 作成

### Step 3: ナレッジ収集エンジン（Phase 1） ✅ DONE
- [x] platform-rule-collector.ts 実装
- [x] viral-structure-analyzer.ts 実装
- [x] temporal-pattern-miner.ts 実装
- [x] deep-trend-researcher.ts 実装

### Step 4: Discord Intelligence Layer（Phase 2） ✅ DONE
- [x] context-builder.ts 実装 (getSupabase/getSupabaseAdmin exported)
- [x] command-handler.ts 実装 (4 handlers: contentReview, trendQuery, performanceReview, guidelineCheck)
- [x] auto-improver.ts 実装 (pattern analysis, threshold analysis, schedule gaps, proposals)

### Step 5: LINE統合（Phase 3） ✅ DONE
- [x] webhook-handler.ts 実装 (signature verification, reply/push, event routing)
- [x] command-router.ts 実装 (6 commands: バズ,投稿,成績,トレンド,ルール,分析 + Flex Messages)
- [x] discord-bridge.ts 実装 (conversation logging, Discord webhook forwarding)
- [x] funnel-tracker.ts 実装 (follow handling, UTM tracking, CTA embedding)
- [x] app/api/cortex/line-webhook/route.ts 実装

### Step 6: 学習ループ（Phase 4） ✅ DONE
- [x] unified-orchestrator.ts 実装 (cross-platform correlation, temporal analysis, trajectory)
- [x] cross-channel-intelligence.ts 実装 (decision outcome tracking, channel effectiveness)

### Step 7: Cronジョブ統合 ✅ DONE
- [x] cortex-cron.yml 作成（既存slack-bot-cron.ymlは変更なし）
- [x] cron-runner.ts 作成（7ジョブのディスパッチャー）
- [x] 各ジョブのGitHub Actions設定

### Step 8: TypeScript検証 ✅ DONE
- [x] 全CORTEXファイルのtsc --noEmit通過（エラー0）
- [x] MapIteratorエラー修正（Array.from()ラッピング）
- [ ] ユニットテスト（Phase 2で実施）
- [ ] E2E統合テスト（Phase 2で実施）

---

## 「バズらないただの技術屋」にならないための設計原則

### 1. 全ての提案に根拠URLを付ける
```
❌「この投稿は改善の余地があります」
✅「hook_type=questionの投稿は御社の過去30日でER 3.2%（平均1.8%の1.8倍）。
   source: cortex_viral_analysis, sample_count: 47」
```

### 2. バイラル分析は「なぜ」に集中する
```
❌ likes: 500, retweets: 200
✅ primary_buzz_factor: 「具体的な数字（3日で10万PV）+ 実体験の権威性」
   emotional_trigger: 「驚き + 希望（自分にもできるかも）」
   replicability_score: 0.72（パターンは再現可能、数字の代替が必要）
```

### 3. プラットフォーム知識は公式ソース優先
```
❌ 「Xでは短い投稿がバズります」（根拠なし）
✅ 「X公式ブログ(2025-12-15): "Longer posts with threads see 2.4x more engagement"
    自社検証: thread投稿のER平均 2.8% vs original 1.4%（verified_by_data: true）」
```

### 4. 時間帯提案は統計的有意性を保証
```
❌ 「朝がいいと思います」
✅ 「火曜18時JST: avg_ER=3.1%, n=23, 95%CI=[2.4%, 3.8%]
    vs 全時間帯平均: avg_ER=1.8%, n=412
    推奨度: 0.87（cortex_temporal_patterns）」
```

### 5. 競合分析は構造レベル
```
❌ 「このインフルエンサーの投稿を参考に」
✅ 「@karpathy の直近30投稿分析:
    hook_type分布: bold_claim 45%, question 30%, statistic 25%
    avg_char_length: 180 (X短文最適解)
    closing_type: question 60% → リプライ率3.2倍
    再現可能要素: 「意外な結論を先に出す」パターン（replicability: 0.85）」
```
