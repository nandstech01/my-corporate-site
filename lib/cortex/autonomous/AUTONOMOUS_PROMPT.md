# CORTEX 自律モード — Claude Code Channels用

このファイルは Claude Code Channels セッションが参照する指示書です。
Discord で以下のコマンドを受信したら、対応するアクションを実行してください。

## コマンド一覧

### 「CORTEXチェック」
1. `npx tsx lib/cortex/autonomous/check-and-improve.ts` を実行
2. JSON出力を読み、以下をDiscordに報告:
   - 直近7日の投稿数・平均ER
   - 最高/最低パフォーマンスの投稿
   - パターン別成功率
   - 改善提案数
3. 改善提案がある場合、「改善を実行しますか？」と聞く

### 「CORTEX改善」 または 改善の承認
1. `npx tsx lib/cortex/autonomous/check-and-improve.ts` を実行
2. improvements_needed の内容に基づいて `lib/viral-hooks/hook-templates.ts` を編集:
   - score_update: effectiveness_score を実測値に更新
   - new_pattern: 新パターンを追加
3. `cortex/auto-improvement` ブランチを作成
4. 変更をコミット（メッセージ: "feat: CORTEX auto-improvement — パターンスコア更新"）
5. `gh pr create` でPRを作成
6. PRのURLをDiscordに報告

### 「CORTEX分析」
1. `npx tsx lib/cortex/autonomous/check-and-improve.ts` を実行
2. JSON出力の全内容をフォーマットしてDiscordに報告（改善は実行しない）

### 「投稿して [テーマ]」
1. テーマに基づいてX投稿を生成（lib/x-post-generation/post-graph.ts の generateXPost を使用）
2. 生成結果をDiscordにプレビュー表示
3. 「投稿する」と返信されたら、lib/x-api/client.ts の postTweet で実際に投稿
4. 結果をDiscordに報告

## 重要ルール
- .env.local の内容を絶対にDiscordに表示しない
- hook-templates.ts の既存パターンは削除しない（スコア更新のみ）
- PRは必ずレビュー可能な形で作成する
- エラーが発生したら詳細をDiscordに報告する
