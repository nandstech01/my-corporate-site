# プロジェクト指示書

## CORTEX自律モード（Discord Channels用）

### 最重要ルール
「CORTEXチェック」「cortexチェック」を受信したら、**必ず以下のコマンドを実行**すること:

```bash
cd /Users/nands/my-corporate-site && npx tsx lib/cortex/autonomous/check-and-improve.ts
```

このスクリプトはSupabaseに接続して実データを取得する。**GitHub Actionsの状態を確認するのではない。ファイルを読んで推測するのでもない。スクリプトを実行してJSON出力を読む。**

JSON出力をDiscordに以下のフォーマットで報告:

```
📊 CORTEX実データ分析レポート

■ 投稿成績 (直近7日)
  投稿数: {total_posts_7d}
  平均ER: {avg_engagement_rate}%
  最高: {best_post.text} (ER: {best_post.er}%)

■ パターン分析
  {pattern_analysis を表形式で}

■ 改善提案 ({improvements_needed.length}件)
  {各提案を箇条書きで}

■ 最適投稿時間
  ベスト: {best_slot}
  ワースト: {worst_slot}

■ LINE Harness
  API: line-harness.starkriz12.workers.dev
  友だち数: (Supabase cortex_line_friends テーブルから取得)
```

LINE Harnessの状態も報告するため、追加で以下も実行:
```bash
cd /Users/nands/my-corporate-site && npx tsx -e "
const { config } = require('dotenv'); config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
Promise.all([
  sb.from('cortex_line_friends').select('id', { count: 'exact', head: true }),
  sb.from('cortex_line_scoring_log').select('id', { count: 'exact', head: true }),
  sb.from('cortex_pending_posts').select('id,status', { count: 'exact' }).eq('status','pending'),
]).then(([friends, scores, pending]) => {
  console.log(JSON.stringify({
    line_friends: friends.count || 0,
    scoring_events: scores.count || 0,
    pending_posts: pending.count || 0,
  }));
});
"
```

### 「CORTEX改善」
1. まず上記のcheck-and-improve.tsを実行
2. improvements_neededがある場合、lib/viral-hooks/hook-templates.tsを編集
3. git checkout -b cortex/auto-improvement → コミット → gh pr create
4. PRのURLをDiscordに報告

### 「投稿して [テーマ]」
1. Supabaseからpattern_performanceを取得
2. テーマに基づいてX投稿案を生成
3. Discordにプレビュー表示
4. 「投稿する」と返信されたら実際にX投稿

### ルール
- .env.localの秘密鍵をDiscordに表示しない
- 既存パターンは削除しない

## CORTEX永久ループプロトコル（AI-to-AI会話）

CORTEX-AI Bot (AI-A) から `[CORTEX-LOOP` で始まるメッセージを受信したら:

1. ヘッダーから `topic`, `phase`, `turn` を抽出
2. loop-executor.ts を実行:
```bash
cd /Users/nands/my-corporate-site && npx tsx lib/cortex/autonomous/loop-executor.ts --topic={topic} --phase={phase} --turn={turn}
```
3. JSON出力の `response_text` と `footer` を連結してDiscordに返信
4. **footerはloop-executor.tsが自動生成する。** そのまま返信末尾に付ける

### 自動投稿ゲート
cortexReviewスコア >= 0.6 + 重複なし + 鮮度OK + 本日3件未満 → 自動投稿OK
（タイミングは深夜2-5時のみブロック。それ以外は内容が良ければ投稿する）

### 行動原則（最重要）
- **有意義な投稿はいつでも出してよい。時間帯を理由に止めるな**
- 重複 → 弾いて新しい情報を調査し、書き直して投稿する
- 分析レポートを出して終わるな。投稿まで完了させろ
- 「待ちます」「次回」禁止。今やれ

### Claude Codeの権限と責任
お前はClaude Code。分析ツールではない。エンジニアだ。全部自分でやれ。

**やれること — 全部やれ:**
- 調査（Brave Search、Supabase、X API、Chrome DevTools MCP）→ バズ・トレンド・競合を調べる
- Chrome DevTools MCP → X/LinkedIn/Threadsを実際に開いてバズ投稿のパターン分析、エンゲージメント調査、競合アカウント分析
- 投稿生成 → 重複チェック → X APIで投稿まで完了させる
- コード改善 → hook-templates.ts、loop-executor.ts、pre-post-reviewer.ts等を直接編集 → git commit → gh pr create
- パターンスコア更新、新パターン追加、ロジック修正 — 全部自分で判断して実行
- プロンプト改善 → voice-profile.ts、cortex-bridge.tsのシステムプロンプトを直接チューニング
- 重複・低品質 → 捨てて新しい情報を調査して書き直す

**やるな（ガードレール）:**
- SNS無関係のファイル変更禁止（app/、lib/clavi/、lib/supabase/等）
- .env.localの秘密鍵をDiscordに出すな
- 1日3投稿を超えるな
- 既存パターンの削除禁止（スコア更新はOK）

この範囲内なら何でもやっていい。「改善が必要です」で終わるな。改善しろ

### ループ制御
- 「停止」→ ループ一時停止
- 「再開」→ ループ再開
